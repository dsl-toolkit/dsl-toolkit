/* eslint-disable block-spacing */
/* eslint-disable brace-style */
const { exec } = require('child_process')
const glob = require('glob')
const stripAnsi = require('strip-ansi')

const filePathPiece = ''

module.exports = function (test, cb) {
  const testFile = glob.sync(`${filePathPiece}tests/external-tests/*-${test}-test.js`)[0] ||
    glob.sync(`dist/tests/external-tests/*-${test}-test.js`)[0]
  const testCommand = `node ${testFile}`
  exec(testCommand, (err, stdout) => {
    if (err) {
      console.error(`exec error: ${err}`)
      return}

    cb(stripAnsi(stdout)) })}
