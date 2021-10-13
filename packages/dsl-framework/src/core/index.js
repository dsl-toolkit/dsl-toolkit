const RETURN_FROM_CALLBACK = 0
const safetyExecutor = require('./detached-executor')
const container = require('./container/core')
// const f = function
const coreFactory = () => {
  const core = function me(callback, state = false) {
    let { coreData } = core
    state = state || (function () {
      // if(coreData.command.has('factory')){
      //
      // }
      return container()
    }())
    coreData = coreData || container().getFrom(0)
    const callerRaw = function () {
      // parameters
      const callerArguments = Array.from(arguments)
      setCommandArguments(callerArguments, state)
      const data = callerRaw.data = state.getFrom(0)
      setPromise(coreData, callerRaw, state, callback)
      // l(coreData, coreData.command)()
      const noTriggerEndOfExecution = coreData.command.has('noTriggerEndOfExecution')
      if (arguments.length && !noTriggerEndOfExecution) {
        /* istanbul ignore else */
        promiseHandler(state, data, callback)
      }
      state.level++
      if (!callerRaw.called) {
        callerRaw.called = true
        return caller
      }
      /* istanbul ignore else */
      if (!arguments.length && callback && typeof callback === 'function') {
        return makeCallback(noTriggerEndOfExecution, state, callback, data)
      }
      /* istanbul ignore else */
      if (!arguments.length && !callback) {
        state.start()
        return data
      }
      /* istanbul ignore else */

      return caller
    }

    const caller = new Proxy(callerRaw,
      {
        get(obj, prop) {
          if (getTabooMembers(prop)) {
            return obj[prop]
          }
          state.setCommandName(prop)
          return caller
        },
        apply(target, thisArg, argumentsList) {
          return target(...argumentsList)
        },
        set(obj, prop, value) {
          return Reflect.set(...arguments)
        }
      })
    return caller()
  }

  return giveMyself(core)
}

module.exports = coreFactory()

function setPromise(coreData, callerRaw, state, callback) {
  if (!coreData.command.has('noPromoises')) {
    callerRaw.p = require('./caller-promise-factory-factory')(state, callback)
  }
}

function setCommandArguments(callerArguments, state) {
  if (callerArguments.length) {
    state.setCommandArguments(callerArguments)
  }
}

function giveMyself(core) {
  core.setCoreData = function (data) {
    this.coreData = data
  }

  return core
}

function getTabooMembers(prop) {
  return prop === 'p' || prop === 'data' || prop === 'apply'
}

function promiseHandler(state, data, callback) {
  if (state.timeoutSate) {
    clearTimeout(state.timeoutSate)
  }
  state.timeoutSate = safetyExecutor(data, callback)
}

function makeCallback(noTriggerEndOfExecution, state, callback, data) {
  if (!noTriggerEndOfExecution) {
    clearTimeout(state.timeoutSate)
  }
  state.resetMe = true
  state.start()
  return callback(RETURN_FROM_CALLBACK, data)
}

