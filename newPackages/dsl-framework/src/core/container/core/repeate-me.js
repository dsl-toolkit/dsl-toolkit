/* eslint-disable block-spacing */
/* eslint-disable brace-style */
/* eslint-disable indent */
import core from '../../../../index.js'
export default function (dslFrameworkInstance) {
  const { returnArrayChunks } = this.parent
  return core()((e, d) => {
    returnArrayChunks.forEach(commandAndArguments => {
      const command = commandAndArguments[0]
      const arg = commandAndArguments.slice(1, commandAndArguments.length)
      dslFrameworkInstance(command, ...arg)})
    return dslFrameworkInstance})()}
