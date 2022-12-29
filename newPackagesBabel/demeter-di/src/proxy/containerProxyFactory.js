module.exports = (results, factories, services, parameters, composedStore, logger) =>
  new Proxy(results, {
    get: (obj, prop) => {
      if(prop instanceof Promise){
        
      }
      if (Object.keys(obj).includes(prop)) {
        const thisIsAFactory = factories.includes(prop)
        const thisIsAService = services.includes(prop)
        if (parameters?.includes(prop)) {
          logger(`getting parameter ${prop}`);
          return obj[prop]}

        if (thisIsAService){
          logger(`getting service ${prop}`);
          const includesProperty = Object.keys(composedStore).includes(prop)
          if (includesProperty) return composedStore[prop]
          if (!includesProperty) return composedStore[prop] = obj[prop]()}

        if (thisIsAFactory){
          logger(`getting factory ${prop}`);
          return obj[prop]()
        }
        // if (!thisIsAFactory || !thisIsAService) return obj[prop]
      }},

    set: (obj, prop, value) => {
      return false}})
