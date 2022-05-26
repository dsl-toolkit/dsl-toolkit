#!/usr/bin/env node
const {join} = require('path')
// const fs = require('fs')

const getFiles = require('./lib/get-files');
(async ()=>{
  const files = await getFiles(join(__dirname, '..'))
  console.log({files});
  const packageJsons = files.filter(filename=>!filename.includes('node_modules') || !filename.includes('.git'))
  .filter(filename=>filename.endsWith('package.json')).sort()
  const objects = packageJsons.map(e=>require('fs').readFileSync(e)).map(e=>JSON.parse(e))
  const versions = objects.map(e=>e.version).filter(e=>e)
  console.log(versions)
  const majorVersions = versions.map(e=>{
    const versionArray = e.split('.')

    return [versionArray[0], versionArray[1]]
  })
  console.log(majorVersions,'f');
  const hashCleanObjects = objects.map(e=>delete e.version && e.scripts && e.repository)
//  console.log(objects,hashCleanObjects);
//  console.log({packageJson});
//  const result = packageJsons.map(file=>fs.readFileSync(file).toString()).join('\n\n  --- \n\n')
//  console.log(result);
})();
