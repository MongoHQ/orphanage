'use strict'

var child_process = require('child_process')
  , events = require('events')
  , mkdirp = require('mkdirp')
  , path = require('path')
  , util = require('util')
  , uuid = require('node-uuid')

var orphan_path = path.resolve(__dirname, './orphan')
  , orphan_options = {silent: false}

function Orphans(dir) {
  this.dir = dir
  this.running = true
  this.poll()
}
util.inherits(Orphans, events.EventEmitter)

Orphans.prototype.abandon = function() {
  this.running = false
  this.emit('error', new Error('method not implemented'))
}

Orphans.prototype.exec = function(command, inheritance, options) {
  var orphan_args = {
    method: 'exec',
    args: [command, options],
    dir: this.path,
    id: uuid.v1()
  }
  child_process.fork(orphan_path, [JSON.stringify(orphan_args), JSON.stringify(inheritance)], orphan_options)
}

Orphans.prototype.spawn = function(command, args, inheritance, options) {
  var orphan_args = {
    method: 'spawn',
    args: [command, args, options],
    dir: this.dir,
    id: uuid.v1()
  }
  child_process.fork(orphan_path, [JSON.stringify(orphan_args), JSON.stringify(inheritance)], orphan_options)
}

Orphans.prototype.poll = function() {
  if (!this.running) {
    return
  }
  var self = this
  fs.readDir(this.dir, function(err, files) {
    if (err) {
      return self.emit('error', err)
    }
    
  })
}

exports.open = function(dir, cb) {
  mkdirp(dir, function(err) {
    if (err) {
      return cb(err)
    }
    return cb(null, new Orphans(dir))
  })
}
