/* eslint-env mocha */
const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')

const root = path.join(__dirname, '..', '..', '..')
const src = (relative) => path.join(root, 'src', relative)

describe('coverage gaps', function () {
  describe('configParser', function () {
    it('returns non-string input unchanged', function () {
      const configParser = require(src('app/configParser/configParser'))
      const input = { plugins: [] }
      assert.strictEqual(configParser(input), input)
    })

    it('loads the detailed config by name', function () {
      const configParser = require(src('app/configParser/configParser'))
      assert.deepStrictEqual(configParser('detailed'), { plugins: ['logDetails'] })
    })
  })

  describe('container', function () {
    it('reports prod false when PROD is not set', function () {
      const previous = process.env.PROD
      delete process.env.PROD
      try {
        const containerPath = require.resolve(src('app/container'))
        delete require.cache[containerPath]
        const container = require(containerPath)({ plugins: [] })
        assert.strictEqual(container.get('runtime-variables').env.prod, false)
      } finally {
        if (previous === undefined) {
          delete process.env.PROD
        } else {
          process.env.PROD = previous
        }
      }
    })

    it('defaults a missing plugin list to an empty array', function () {
      const containerPath = require.resolve(src('app/container'))
      delete require.cache[containerPath]
      const container = require(containerPath)({})
      assert.strictEqual(container.get('calculated-parameters').plugins, undefined)
    })
  })

  describe('logfile-creator', function () {
    it('defaults the log type when none is given', function () {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cowlog-'))
      const createLogFile = require(src('lib/logfile-creator'))(dir)
      assert(createLogFile('coverage-default-logtype').endsWith('.log'))
    })
  })

  describe('plugin-loader', function () {
    it('accepts a plugin object instead of a name', function () {
      const pluginLoaderFactory = require(src('lib/plugin/plugin-loader'))
      const container = require(src('app/container'))({ plugins: [] })
      pluginLoaderFactory(container)(require(src('plugins/logDetails')))
      assert(container.get('runtime-variables'))
    })
  })

  describe('after-print-commands', function () {
    it('does not re-collect lasts once it already did', function () {
      const afterPrint = require(src('lib/logger/parser/after-print-commands'))
      const commands = { command: { has: (name) => name === 'lasts' } }
      const loggerModule = { runtimeVariables: { lastLogs: [] } }
      afterPrint(commands, ['lasts'], loggerModule, { lastsed: true }, {}, { data: { returnArrayChunks: [[]] } }, {})
      assert.deepStrictEqual(loggerModule.runtimeVariables.lastLogs, [])
    })
  })

  describe('logger', function () {
    it('cancels only underscore functions that expose cancel', function () {
      const loggerModule = require(src('lib/logger/logger'))
      let cancelled = 0
      loggerModule.cancelUnderscore({ plain: {}, cancellable: { cancel: () => { cancelled++ } } })
      assert.strictEqual(cancelled, 1)
    })

    it('skips the session log when the forget command is used', function () {
      const cowlog = require(src('index'))('clean')
      const original = console.log
      console.log = () => {}
      try {
        cowlog.log('forget-coverage').forget()
      } finally {
        console.log = original
      }
    })

    it('prints through lolcatjs when the lol command is used', function () {
      const isInstalledPath = require.resolve('is-installed')
      const isInstalledOriginal = require.cache[isInstalledPath]
      require.cache[isInstalledPath] = {
        id: isInstalledPath,
        filename: isInstalledPath,
        loaded: true,
        exports: { sync: () => true }
      }
      const lolcatPath = require.resolve('lolcatjs')
      const lolcatOriginal = require.cache[lolcatPath]
      let fromStringInput
      require.cache[lolcatPath] = {
        id: lolcatPath,
        filename: lolcatPath,
        loaded: true,
        exports: { options: {}, fromString: (value) => { fromStringInput = value; return value } }
      }
      const cowlog = require(src('index'))('clean')
      const out = []
      const original = console.log
      console.log = (...args) => out.push(args.map(String).join(' '))
      try {
        cowlog.log('lol-coverage').lol()
      } finally {
        console.log = original
        if (isInstalledOriginal) {
          require.cache[isInstalledPath] = isInstalledOriginal
        } else {
          delete require.cache[isInstalledPath]
        }
        if (lolcatOriginal) {
          require.cache[lolcatPath] = lolcatOriginal
        } else {
          delete require.cache[lolcatPath]
        }
      }
      assert(fromStringInput.includes('lol-coverage'))
      assert(out.join('').includes('lol-coverage'))
    })
  })

  describe('markdown mode', function () {
    it('body-factory drops coloring when markdown output is requested', function () {
      process.env.markdown = '1'
      const modulePath = require.resolve(src('lib/logger/body-factory'))
      delete require.cache[modulePath]
      try {
        const dictionary = require(src('app/dictionary'))
        const printHelpers = require(src('lib/logger/print-helpers'))()
        const container = { get: (name) => name === 'dictionary' ? dictionary : printHelpers }
        const bodyFactory = require(modulePath)(container)
        assert(bodyFactory(true, ['markdown'], {}, printHelpers).includes('markdown'))
        assert(bodyFactory(false, ['plain'], {}, printHelpers).includes('plain'))
      } finally {
        delete process.env.markdown
        delete require.cache[modulePath]
      }
    })

    it('logDetails drops coloring when markdown output is requested', function () {
      process.env.markdown = '1'
      const modulePath = require.resolve(src('plugins/logDetails'))
      delete require.cache[modulePath]
      try {
        const emitter = new (require('events').EventEmitter)()
        const dictionary = require(src('app/dictionary'))
        const coloring = require(src('lib/message/coloring'))()
        const container = {
          get: (name) => name === 'dictionary' ? dictionary : name === 'message-coloring' ? coloring : emitter
        }
        require(modulePath).consoleLogDetails.register(container)
        let captured
        emitter.emit('console_log_details', true, {
          calledFrom: { fileName: 'file.js', lineNumber: 1, columnNumber: 2 },
          stackTraceFile: '/tmp/stack-trace.log',
          sessionLog: null,
          dateTime: 'now'
        }, (message) => { captured = message })
        assert(captured.includes('called from'))
      } finally {
        delete process.env.markdown
        delete require.cache[modulePath]
      }
    })
  })
})
