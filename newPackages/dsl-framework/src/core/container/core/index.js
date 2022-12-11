/* eslint-disable brace-style */
/* eslint-disable block-spacing */
import flat from 'flat'
import repeateMe from './repeate-me.js'
import clone from './clone.js'
import reset from './reset.js'
// import commandParser from '../../command-parser.js'
// import argumentsParser from '../../arguments.js'
// import arguments from '../../arguments.js'
import commandSequence from '../../command-sequence.js'


const ia = Array.isArray
const getFrom = function (from, returnArrayChunks = []) {
  if (this.reset) {
    returnArrayChunks = this.returnArrayChunks
    if (this.commandName) {
      returnArrayChunks.push([this.commandName])}}
  const returnArray = () => {
    const result = []
    returnArrayChunks
      .forEach(chunkData => chunkData.forEach(pieceData => result.push(pieceData)))

    return result}
  const data = {
    returnArray,
    returnArrayChunks,
    getSubcommand: (keyword = 'a') => (ra = returnArrayChunks) => {
      const flatA = flat(returnArrayChunks)
      const aKeys = Object.keys(flatA)

      const aKeysIndexes = aKeys
        .map((ee, ii, aa) => {
          return flatA[aa[ii]] === keyword ? ii : false})
        .filter(e => e !== false)
        .filter((e) => aKeys[e].split('.')[1] === '0')

      const intervals = aKeysIndexes.map((e, i, a) => aKeys.slice(e, a[i + 1]))
        .filter(e => e !== false)
        .map(e => Array.from(e))

      return intervals.map((e, i) => {
        const t = {}
        const c = e.map(e => {
          const order = e.split('.')[0]
          return order})
        c.forEach(e => { t[e] = true })
        return Object.keys(t)})
        .map((e, i) => {
          return Array.from(e).map(e => ra[e])})
        .map((e) => getFrom(0, e))},

    repeate: {
      // todo: generalize it
      me: repeateMe
    }
  }

  data.repeate.parent = data

  const me = this
  const returnObject = { data, getFrom: me.getFrom }
  returnObject.command = commandSequence(returnObject)
  const arg = arguments(returnObject)
  returnObject.arguments = arg

  returnObject.arguments.object = (commands, getProcess, defaultValue = false) => {
    const returnObject = {}
    // isArray
    ia(commands) || (() => { commands = [commands] })()
    ia(getProcess) || (() => { getProcess = [getProcess] })()
    ia(defaultValue) || (() => { defaultValue = [defaultValue] })()

    commands.forEach((command, i) => {
      returnObject[command] = arg(command, getProcess[i], defaultValue[i])})
    return returnObject}
  returnObject.commandSequence = commandSequence(returnObject)

  return returnObject}

export default () => ({
  p: null,
  getFrom,
  level: 0,
  returnArray: [],
  returnArrayChunks: [],
  commandName: false,
  resetMe: false,
  reset: reset,
  clone: clone,
  start () {
    this.reset()
    this.level++},
  getData: function () {
    return this.getFrom(0)},
  setCommandArguments (commandArguments) {
    commandArguments = commandArguments || []
    let newChain = false
    if (this.commandName) {
      commandArguments = [this.commandName, ...commandArguments]
      newChain = true
      this.commandName = false}
    this.returnArrayChunks.push(commandArguments)

    return newChain},
  setCommandName (commandName) {
    let newChain = false
    if (this.commandName) {
      newChain = this.setCommandArguments()}
    this.commandName = commandName

    return newChain}
})
