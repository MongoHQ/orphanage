'use strict'

var
  child_process = require('child_process'),
  events = require('events'),
  log4js = require('log4js'),
  path = require('path'),
  util = require('util'),
  uuid = require('node-uuid')

var logger = log4js.getLogger('orphanage')
  , orphan_path = path.resolve(__dirname, './orphan')
  , orphan_options = {silent: true}

function Orphans(path) {
  this.path = path
}
util.inherits(Orphans, events.EventEmitter)

Orphans.prototype.abandon = function() {
  this.emit('error', new Error('method not implemented'))
}

Orphans.prototype.exec = function(command, options) {
  var orphan_args = {
    method: 'exec',
    args: [command, options],
    path: this.path
  }
  child_process.fork(orphan_path, [JSON.stringify(orphan_args)], orphan_options)
}

Orphans.prototype.spawn = function(command, args, options) {
  var orphan_args = {
    method: 'spawn',
    args: [command, args, options],
    path: this.path,
    id: uuid.v1()
  }
  child_process.fork(orphan_path, [JSON.stringify(orphan_args)], orphan_options)
}

exports.open = function(path, cb) {
  logger.debug('opening orphanage on path: ' + path)
  return cb(null, new Orphans(path))
}