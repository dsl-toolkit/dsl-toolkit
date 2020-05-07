const sourceLinker = require('../../linker')
const { linkerDir } = require('generic-text-linker')
const { tokenize } = require('esprima')
const fs = require('fs')
const linkFile = require('./linkFile')
const arrayDsl = require('array-dsl')

module.exports = (ralContainer) => {
  const {parameters, messagePieces, results} = ralContainer
  const {begin, end} = messagePieces
  const text = require('../message-creator/textGenerator')(ralContainer)()
  sourceLinker.tags.forEach(extraTag=>{
    const linkDirectory = parameters.arguments('linkDirectory', 'lastArgument')
    const removeUnused = parameters.command.has('removeUnused')
    const originalContent = linkerDir(linkDirectory, begin, end)
    const emptySpaces = originalContent ? (() => {
      const originalFirstLine = originalContent.split('\n')[0]
      const trimmedOne = originalFirstLine.trim()
      return new Array(originalFirstLine.length - trimmedOne.length + 1).join(' ')
    })() : ''
    const linkerResults = sourceLinker(ralContainer)(linkDirectory, text, emptySpaces, extraTag)
    const linkerResultsKeys = linkerResults ? Object.keys(linkerResults) : []

    if (removeUnused) {
      const rottenFiles = []
      const perFileVariableAllUses = linkerResultsKeys.map(fileName => {
        let modifiedContent, tokenizedDepedencies
        try {
          modifiedContent = tokenize(fs.readFileSync(fileName).toString())
          tokenizedDepedencies = tokenize(text)
        }
        catch (e) {
          rottenFiles.push(fileName);
        }
        if(!!tokenizedDepedencies) {
          const relevantDependencies = tokenizedDepedencies.filter(entry => {
            if (entry.type === 'Identifier') {
              return entry
            }
          }).map(entry => entry.value)
          .map(declaredVariables => modifiedContent.filter(entry => declaredVariables === entry.value))

          return relevantDependencies
        }
      })

      const perFileVariables = linkerResultsKeys.map((file, fileIndex) => {
        let variables
        if (!rottenFiles.includes(file)){
          const fileResults = perFileVariableAllUses[fileIndex]
          variables = fileResults.map(fileResult => {
            const name = fileResult[0].value
            const used = fileResult.length - 1
            return {name, used}
          }).filter(entity => !entity.used).map(entity => entity.name)

        }

        return variables
      })

      linkerResultsKeys.map((file, fileIndex) => {
        if(!rottenFiles.includes(file)) {
          const unusedVariables = perFileVariables[fileIndex]
          let msgArray = text.split('\n')
          const keys = []
          unusedVariables.forEach(variableName => {
            msgArray = msgArray.filter(line => !line.trim().startsWith(variableName))
          })
          // l(msgArray,arrayDsl(unusedVariables).xor(results)()).die()
          linkFile(ralContainer)(file, arrayDsl(unusedVariables).xor(results)(), emptySpaces, extraTag)
        }
        else {
          l()
        }
      })
    }
  })
}
