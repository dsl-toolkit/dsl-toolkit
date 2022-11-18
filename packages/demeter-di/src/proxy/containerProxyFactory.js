module.exports = (results, factories, services, parameters, composedStore) =>
  new Proxy(results, {
    get: (obj, prop) => {
      if(prop instanceof Promise){
        
      }
      if (Object.keys(obj).includes(prop)) {
        const thisIsAFactory = factories.includes(prop)
        const thisIsAService = services.includes(prop)
        if (parameters?.includes(prop)) {
          return obj[prop]}

        if (thisIsAService){
          const includesProperty = Object.keys(composedStore).includes(prop)
          if (includesProperty) return composedStore[prop]
          if (!includesProperty) return composedStore[prop] = obj[prop]()}

        if (thisIsAFactory) return obj[prop]()
        if (!thisIsAFactory || !thisIsAService) return obj[prop]
      }},

    set: (obj, prop, value) => {
      return false}})
