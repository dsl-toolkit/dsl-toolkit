/* eslint-disable no-trailing-spaces */
/* eslint-disable block-spacing */
/* eslint-disable brace-style */
/* eslint-disable indent */

const RETURN_FROM_CALLBACK = 0
// const safetyExecutor = require('./detached-executor.js')
const container = require('./container/core/index.js')
// const f = function
const coreFactory = () => {
  const core = function me (callback, state = false) {
    let { coreData } = core
    state = state || (function () {
      // if(coreData.command.has('factory')){
      //
      // }
      return container()
    }())
    coreData = coreData || container().getFrom(0)
    const callerRaw = function (...args) {
      // parameters
      if (!callerRaw.called) {
        callerRaw.called = true
        return caller}
      const callerArguments = Array.from(args)
      if (callerArguments.length) {
        state.setCommandArguments(callerArguments)}
      const data = callerRaw.data = state.getFrom(0)
      // if (!coreData.command.has('noPromoises')) {
      //   callerRaw.p = require('./caller-promise-factory-factory.js')(state, callback)
      // }
      // l(coreData, coreData.command)()
      // const noTriggerEndOfExecution = coreData.command.has('noTriggerEndOfExecution')
      /* istanbul ignore else */
      if (!args.length && callback && typeof callback === 'function') {
        // if (!noTriggerEndOfExecution) {
        //   clearTimeout(state.timeoutSate)
        // }
        state.resetMe = true
        state.start()
        return callback(RETURN_FROM_CALLBACK, data)}
      /* istanbul ignore else */
      if (!args.length && !callback) {
        state.start()
        return data}
      /* istanbul ignore else */
      // if (args.length && !noTriggerEndOfExecution) {
      //   /* istanbul ignore else */
      //   if (state.timeoutSate) {
      //     clearTimeout(state.timeoutSate)
      //   }
      //   state.timeoutSate = safetyExecutor(data, callback)
      // }
      state.level++
      return caller}

    const caller = new Proxy(callerRaw,
      {
        get (obj, prop) {
          if (prop === 'p' || prop === 'data' || prop === 'apply'|| prop === 'then') {
            return obj[prop]}
          state.setCommandName(prop)
          return caller},
        apply (target, thisArg, argumentsList) {
          return target(...argumentsList)}
        })
    return caller()}

  core.setCoreData = function (data) {
    this.coreData = data}
  return core}

module.exports = coreFactory()
