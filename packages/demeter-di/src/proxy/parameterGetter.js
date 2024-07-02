module.exports = exports = (parameters) =>{
  const args = parameters.arguments('define', 'allEntries', [])
  return args.map(e =>e[0])
}



