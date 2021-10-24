const linker = require('../../linker')
module.exports = (ralContainer) => (file, msg, emptySpaces, extraTag) => {
    let data;
    if(Array.isArray(msg)){
        data = require('../message-creator/textGenerator')(ralContainer)(msg)
    } else {
        data = msg
    }
    linker(ralContainer)(file, require('../prepare-before-placement')(data), emptySpaces, extraTag)
}
