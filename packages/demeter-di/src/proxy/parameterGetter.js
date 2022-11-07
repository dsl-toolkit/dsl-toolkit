module.exports = exports = (parameters) =>{
  const arguments = parameters.arguments('define', 'allEntries', [])
  return arguments.map(e =>e[0])
}



