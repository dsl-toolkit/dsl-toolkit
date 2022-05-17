const composedStore = {}

module.exports = (results, factories, services, parameters) => {
  return new Proxy(results,
    {
      get: (obj, prop) => {
        if (Object.keys(obj).includes(prop)) {
          const createHasKey = factories.includes(prop)
          const composeHasKey = services.includes(prop)
          if (parameters && parameters.includes && parameters.includes(prop)) {
            return obj[prop]}
          if (composeHasKey) {
            const storedObject = Object.keys(composedStore)
            if (storedObject && storedObject.includes && storedObject.includes(prop)) {
              return composedStore[prop]}
            else {
              composedStore.prop = obj[prop]()
              return composedStore.prop}}
          if (createHasKey) {
            return obj[prop]()}
          if (!createHasKey || !composeHasKey) {
            return obj[prop]}}},
      set: (obj, prop, value) => {
        return false}})}
