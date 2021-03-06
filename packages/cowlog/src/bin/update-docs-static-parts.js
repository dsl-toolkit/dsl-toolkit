#!/usr/bin/env node
const { linkerDir } = require('generic-text-linker')

const path = require('path')

const staticUpdate = function () {
  const projectRoot = path.join(__dirname, '../../../../')

  const src = linkerDir(projectRoot, '<!--- source qa rewrite begin -->', '<!--- source qa rewrite end -->')
  linkerDir(projectRoot,
    '<!--- destination qa rewrite begin -->', '<!--- destination qa rewrite end -->',
    src)
}

staticUpdate()
