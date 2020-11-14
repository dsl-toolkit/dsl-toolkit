#!/usr/bin/env node
'use strict';

const {linkerDir, linkerFile} = require('generic-text-linker');
const {join} = require('path')
const tags =  ['<!--- destination qa rewrite begin -->', '<!--- destination qa rewrite end -->']

const staticUpdate = function staticUpdate() {
  const projectRoot = join(__dirname, '../');
  const src = linkerFile(join(projectRoot, 'README.md'), ...tags);
  const results = linkerDir(join(projectRoot, 'packages'), ...tags, src);
  console.log(src, results)
};

staticUpdate();
