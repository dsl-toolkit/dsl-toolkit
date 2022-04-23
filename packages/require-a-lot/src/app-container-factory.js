module.exports = () => require('dsl-framework')()((e, parameters) => {
  return require(
    '../../container'
    // '../src/container'
    )(parameters)
})
