const substringToLineMapper = require('./substing-to-line-mapper')
const clone = require('clone')
const objectPath = require('object-path')

module.exports = exports = function (inputString, beginningTag, closingTag, newValue = null) {
  const templateBeginningArray = substringToLineMapper(inputString, beginningTag).reverse()
  const templateEndArray = substringToLineMapper(inputString, closingTag).reverse()

  objectPath.set(module, 'meta.changed', {
    all: false,
    withoutWhiteSpaces: false,
    status: 'read'
  })
  /* istanbul ignore else */
  if (templateBeginningArray.length !== templateEndArray.length) {
    throw new Error(
      `The number linker closing tags and starting tags are not matching
where the opening tag should be "${beginningTag}"
and the closing tag should be "${closingTag}"`
    )
  }
  let returnData = clone(inputString.split('\n'))
  /* istanbul ignore else */
  if (newValue) {
    templateBeginningArray.forEach(function (templateBeginning, index) {
      const templateEnd = templateEndArray[index]
      /* istanbul ignore else */
      if (templateBeginning >= 0 && templateEnd && templateBeginning < templateEnd) {
        /* istanbul ignore else */
        if (newValue) {
          returnData = returnData.slice(0, templateBeginning + 1)
            .concat(newValue.split('\n')
              .concat(returnData.slice(templateEnd, returnData.length)))
          module.meta.changed.all = true
          module.meta.changed.status = 'write'
        }
      }
    })

    /* istanbul ignore else */
    if (module.clearWhitespace(returnData.join('\n')) !==
      module.clearWhitespace(inputString)) {
      module.meta.changed.withoutWhiteSpaces = true
    }

    return module.makeReturnObject(returnData)
  }

  /* istanbul ignore else */
  if (!newValue) {
    let resultAltered = false
    templateBeginningArray.forEach(function (templateBeginning, index) {
      const templateEnd = templateEndArray[index]
      /* istanbul ignore else */
      if (!resultAltered) {
        returnData = returnData.slice(templateBeginning + 1, templateEnd)
        resultAltered = true
      }
    })

    // return returnData.join('\n')
    /* istanbul ignore else */
    if (resultAltered) {
      return module.makeReturnObject(returnData)
    }

    /* istanbul ignore else */
    if (!resultAltered) {
      return module.makeReturnObject([''])
    }
  }

  return module.makeReturnObject([''])
}

module.backToSting = function (array) {
  return array.join('\n')
}

module.makeReturnObject = function (returnData) {
  returnData = returnData.join('\n')
  const meta = module.buildMeta()

  return { returnData, meta }
}

module.buildMeta = function () {
  const meta = module.meta
  delete module.meta

  return meta
}

module.clearWhitespace = require('./clear-whitespace')
