const getArrayData = require('../lib/get-array-data');

module.exports = (baseObject) => {
  return (kind) => function () {
    const commands = getArrayData(arguments);
    return commands.map(command => baseObject[kind](command));
  };
}
