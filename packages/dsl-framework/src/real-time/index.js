const ADD = 'registerRealTimeCall'
const ADD_ALIAS = 'registerRealTimeCallAdd'
const REPLACE = 'registerRealTimeCallReplace'
const FOR_ALL = 'registerRealTimeCallForAll'
const FOR_ALL_ALIAS = 'registerRealTimeCallForAllAdd'
const FOR_ALL_REPLACE = 'registerRealTimeCallForAllReplace'

const SPEC_KEYS = ['parameters', 'resolve', 'run']
const ASPECT_KEYS = ['name', 'wrap']

const isFunction = value => typeof value === 'function'

const validateCommandName = name => {
  if (typeof name !== 'string' || !name.length) {
    throw new Error('a real-time call needs a non-empty command name')
  }
}

const validateParameters = parameters => {
  if (parameters === undefined) {
    return
  }
  const valid = Array.isArray(parameters) &&
    parameters.every(parameter => typeof parameter === 'string' && parameter.length)
  if (!valid) {
    throw new Error('real-time call parameters must be an array of non-empty strings')
  }
}

const assertOnlyKeys = (spec, allowedKeys, what) => {
  Object.keys(spec).forEach(key => {
    if (allowedKeys.indexOf(key) === -1) {
      throw new Error(`${what} has an unknown key: ${key}`)
    }
  })
}

const validateSpec = spec => {
  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) {
    throw new Error('a real-time call needs a spec object')
  }
  assertOnlyKeys(spec, SPEC_KEYS, 'a real-time call')
  validateParameters(spec.parameters)
  if (spec.resolve !== undefined && !isFunction(spec.resolve)) {
    throw new Error('a real-time call resolve must be a function')
  }
  if (spec.run !== undefined && !isFunction(spec.run)) {
    throw new Error('a real-time call run must be a function')
  }
}

const validateAspect = spec => {
  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) {
    throw new Error('a for-all real-time call needs a spec object')
  }
  assertOnlyKeys(spec, ASPECT_KEYS, 'a for-all real-time call')
  if (!isFunction(spec.wrap)) {
    throw new Error('a for-all real-time call needs a wrap function')
  }
}

const toRegistry = program => {
  const registry = {}
  let aspects = []
  const sequence = [...program.commandSequence()]
  sequence.forEach(step => {
    const args = step.arguments
    switch (step.command) {
      case ADD:
      case ADD_ALIAS: {
        validateCommandName(args[0])
        validateSpec(args[1])
        const entries = registry[args[0]] || []
        registry[args[0]] = entries.concat([args[1]])
        break
      }
      case REPLACE: {
        validateCommandName(args[0])
        validateSpec(args[1])
        registry[args[0]] = [args[1]]
        break
      }
      case FOR_ALL:
      case FOR_ALL_ALIAS: {
        validateAspect(args[0])
        aspects = aspects.concat([args[0]])
        break
      }
      case FOR_ALL_REPLACE: {
        validateAspect(args[0])
        aspects = [args[0]]
        break
      }
      default:
        break
    }
  })
  return { registry, aspects }
}

const resolveArguments = (name, entry, args, program) => {
  if (!entry.resolve) {
    return args
  }
  const resolved = entry.resolve({ name, arguments: args, program })
  if (!Array.isArray(resolved)) {
    throw new Error(`the real-time call resolve for "${name}" must return the argument array`)
  }
  return resolved
}

const fold = (program, registry, aspects = []) => {
  const steps = []
  const effects = []
  const sequence = [...program.commandSequence()]
  sequence.forEach(step => {
    const entries = registry[step.command] || []
    const payload = { name: step.command, arguments: step.arguments, program }
    const specific = () => {
      let args = step.arguments
      const collected = []
      entries.forEach(entry => {
        args = resolveArguments(step.command, entry, args, program)
        if (entry.run) {
          collected.push(entry.run({ name: step.command, arguments: args, program }))
        }
      })
      return { arguments: args, effects: collected }
    }
    const invoke = aspects.reduceRight((next, aspect) => () => aspect.wrap(payload, next), specific)
    const outcome = invoke()
    steps.push({
      command: step.command,
      arguments: outcome ? outcome.arguments : step.arguments
    })
    if (outcome) {
      effects.push(...outcome.effects)
    }
  })
  return { steps, effects }
}

const makePlugin = (registry, aspects) => callback => (error, program) => {
  const { steps, effects } = fold(program, registry, aspects)
  program.steps = steps
  program.effects = effects
  return callback(error, program)
}

module.exports = exports = {
  toRegistry,
  resolveArguments,
  fold,
  makePlugin
}
