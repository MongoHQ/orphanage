'use strict'

var child_process = require('child_process')
  , log4js = require('log4js')
  , util = require('util')
  , _ = require('underscore')

var child = null
  , orphan_args = null
  , logger = log4js.getLogger('orphan')

try {
  orphan_args = JSON.parse(process.argv[2])
} catch (err) {}

logger.debug('orphan args', orphan_args)

switch (orphan_args.method) {
  case 'exec':
    child_process.exec(orphan_args.args[0], orphan_args.args[1], function(err, stdout, stderr) {
      logger.debug('exec', arguments)
    })
    break
  case 'spawn':
    child = child_process.spawn(orphan_args.args[0], orphan_args.args[1], orphan_args.args[2])
    child.stdout.on('data', function(data) {
      logger.debug('stdout', data.toString())
    })
    child.stderr.on('data', function(data) {
      logger.debug('stderr', data.toString())
    })
    child.on('close', function(code) {
      logger.debug('exit', code)
    })
    break
}

