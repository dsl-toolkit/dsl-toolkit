#!/usr/bin/env node
console.log("AAA");
const { log } = require('console')
const { linkerDir } = require('generic-text-linker')

const path = require('path')
const staticUpdate = function () {
  const projectRoot = path.join(__dirname, '../')

  const src = linkerDir(projectRoot, '<!--- source qa rewrite begin -->', '<!--- source qa rewrite end -->')
  console.log(src);
  linkerDir(projectRoot,
    '<!--- destination qa rewrite begin -->', '<!--- destination qa rewrite end -->',
    src)
}

staticUpdate()
