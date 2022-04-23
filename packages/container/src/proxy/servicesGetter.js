module.exports =
(parameters) => {
  console.log(parameters.arguments)
  // console.log(Object.keys(parameters))

  console.log(
    // {parameters},
    // parameters.arguments('compose', 'allEntries', [])
  )

  return parameters.arguments('compose', 'allEntries', []).map(e => e[0])
}
