module.exports = (parameters) => {
  const maxLineWidth = parameters.arguments('maxLineWidth', 'lastArgument', 120)
  const tag = parameters.arguments('tag', 'lastArgument')
  const info = parameters.command.has('info') || parameters.command.has('vertical')
  const log = parameters.arguments('log', 'lastArgument', 'horizontal')

  const tagCommon = tag ? `// [require-a-lot] ${tag}` : ''
  const begin = `${tagCommon} begin`
  const end = `${tagCommon} end`
  const logType = info || tag ? 'vertical' : log
  const listDelimiter = ((type) => type === 'vertical' ? '\n' : ' ')(logType)
  const lastLineDelimiter = ((type) => type === 'vertical' ? '' : '/n')(logType)

  return {
    tag, info, log, maxLineWidth,
    tagCommon,
    end,
    begin,
    tagOpen: tag ? `${begin}\n` : '',
    tagEnd: tag ? `\n${end}` : '',
    tagEqual: tag ? '\n=' : '',
    noTagEqual: tag ? '' : '=',
    logType,
    listDelimiter,
    lastLineDelimiter
  }
}
