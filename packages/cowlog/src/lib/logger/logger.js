'use strict'
const fs = require('fs')
const _ = require('lodash')
const functionRegister = {}
const unlimitedCurry = require('unlimited-curry')

module.createLogEntry = function (bodyFactory, argumentsFrom, stackTraceString, stack, origArguments) {
  return {
    stackTraceFile: module.logFileCreator(stackTraceString, 'stack-trace.log'),
    sessionLog: module.runtimeVariables.sessionLogFile,
    calledFrom: stack[0],
    stack: stack,
    logBody: bodyFactory(true, argumentsFrom, origArguments, module.calculatedParameters, module.loggerPrintHelpers),
    dateTime: new Date().toISOString()
  }
}

const underscoreFunctions = ['throttle', 'debounce', 'once']
const afterPrintCommandOrder = ['mute','delay','lasts', 'last', 'return', 'die']
module.hasCommand = (command, commands) => commands.data.returnArrayChunks.some(argumentArray => argumentArray[0] === command)
module.getCommand = (command, commands) => commands.data.returnArrayChunks.filter(argumentArray => {return argumentArray[0] === command})
module.getCommandArguments = (command, commands) => module.getCommand(command, commands)[0].slice(1)

const printToConsole = result => console.log(result.toString())
module.createCachedFunctionIndex = (command, stack, codeLocation) => `${codeLocation}_${command}_${stack[0]['hash']}`

module.registerUnderscoreFunction = (command, commands, stack, fn, codeLocation, ...rest) => {
  const functionIndex = module.createCachedFunctionIndex(command, stack, codeLocation)
  if(module.hasCommand(command, commands)){
    let wrapped = functionRegister[functionIndex]
    if(!wrapped){
      wrapped = _[command](
        data=>fn(data)
        , module.getCommandArguments(command, commands))
      wrapped.wrapped = true
      functionRegister[functionIndex] = wrapped
    }
    return wrapped
  }
  return fn
}
module.cancelUnderscore = (functionRegister) => {
  Object.keys(functionRegister).forEach(key=>{
    let cancel = functionRegister[key].cancel
    if(cancel) cancel()
  })
}

module.exports = exports = function (container) {
  let messageCreator = container['message-creator']
  module.logFileCreator = container['log-file-creator']
  module.runtimeVariables = container['runtime-variables']
  module.loggerPrintHelpers = container['logger-print-helpers']
  module.calculatedParameters = container['calculated-parameters']
  const createBody = container['logger-body-factory']
  const dictionary = module.dictionary = container.dictionary
  const loggerStackTraceFactory = container['logger-stack-trace-factory']

  const callback = function (argumentsFrom) {
    return function(){
      let retv = null
      let printed = false
      let returnFuction = unlimitedCurry((e,data)=>{
        const commands = data.getFrom(1, data.data)
        const stackTrace = loggerStackTraceFactory()
        const stack = stackTrace.stack
        const origArguments = data.data.returnArrayChunks[0]
        const logEntry = module.createLogEntry(createBody, argumentsFrom, stackTrace.stackTraceString, stack, origArguments)
        logEntry.hashes = logEntry.hashes || []
        let result = messageCreator(module.calculatedParameters, logEntry, true, true);

        let printer = printToConsole
        let lodashPrinters = []

        underscoreFunctions.forEach(command=>{
          const printerDelta = module.registerUnderscoreFunction(command, commands, stack, printer, 'print')
          if(printerDelta.toString() !== printer.toString()){
            lodashPrinters.push(printerDelta)
          }
        })

        let lastsed = false
        let muted = false
        let dead = false

        afterPrintCommandOrder.forEach(command=>{

          if(command === 'last' && module.hasCommand(command, commands)){
            module.runtimeVariables.lastLogs =  []
            module.runtimeVariables.lastLogs.push(logEntry)
          }

          if(command === 'mute' && module.hasCommand(command, commands)){
            console.log("FFFFFffFffFF",muted)
            muted = true
            console.log("FFFFFffFffFF",muted)
          }

          // if(command === 'delay' && module.hasCommand(command, commands)){
          //   muted = true
          // }

          if(command === 'lasts' && module.hasCommand('lasts', commands)){
            if(!lastsed){
              module.runtimeVariables.lastLogs = module.runtimeVariables.lastLogs || []
              module.runtimeVariables.lastLogs.push(logEntry)
              lastsed = true
            }
          }

          if(command === 'return' && module.hasCommand(command, commands)){
            retv = data.data.returnArrayChunks[0][data.data.returnArrayChunks[0].length-1]
          }

          if(command === 'die' && module.hasCommand(command, commands)){
            dead = true
          }

        })

        if(!muted){
          if(!printed){
            printed = true
            if(lodashPrinters.length){
              lodashPrinters.forEach(printer=>printer(result))
            }else{
              printer(result)
            }
          }

          logEntry.logBody = createBody(false, argumentsFrom, origArguments, module.calculatedParameters, module.loggerPrintHelpers)
          let consoleMessage = '\n' + messageCreator(module.calculatedParameters, logEntry, false, false) +
            dictionary.delimiterInFiles

          fs.appendFileSync(module.runtimeVariables.sessionLogFile, consoleMessage)
          module.runtimeVariables.collectedLogs.push(messageCreator(module.calculatedParameters, logEntry, false, false))

        }

        if(dead){
          module.cancelUnderscore(functionRegister)
          process.exit(0)
        }

        if(retv != null){
          return retv
        }
      })

      return returnFuction
    }()
  }
  return callback
}
