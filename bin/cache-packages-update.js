#!/usr/bin/env node
const execa = require('execa')
const {join} = require('path')
const {linkerFile} = require('generic-text-linker')

const {stdout} = execa.sync('npx', ['lerna', 'list', '--json'])

linkerFile(join(__dirname, '..', '.circleci', 'config.yml'),
                ' #beginning package template', "#end package template",
                require('./lib/get-packages')
                .map(e=>`${e}/node_modules`)
                .concat(['node_modules'])
                .map(e=>`            - ${e}`)
                .join('\n'))