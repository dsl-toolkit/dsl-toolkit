#!/usr/bin/env node
const { linkerDir } = require('generic-text-linker')

const path = require('path')
const staticUpdate = function () {
  const projectRoot = path.join(__dirname, '../')

  const sfrom='<!--- source qa rewrite begin -->'
  const sto='<!--- source qa rewrite end -->'

  const dfrom='<!--- destination qa rewrite begin -->'
  const dto='<!--- destination qa rewrite end -->'

  const src = linkerDir(projectRoot, sfrom, sto)
  // console.log({src,
  //   to:linkerDir(projectRoot, dfrom, dto)})
  linkerDir(projectRoot, dfrom, dto, src)
}

staticUpdate()
