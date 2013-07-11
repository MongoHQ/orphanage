'use strict'

var async = require('async')
  , child_process = require('child_process')
  , fs =require('fs')
  , events = require('events')
  , minimatch = require('minimatch')
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
    this.emit('close')
    this.removeAllListeners()
    return
  }

  var self = this
  async.auto({
    read_dir: function(cb) {
      fs.readdir(self.dir, function(err, files) {
        if (err) {
          return cb(err)
        }
        cb(null, files.sort())
      })
    },
    handle_stdout: ['read_dir', function(cb, results) {
      var files = results.read_dir.filter(function(file) {
        return minimatch(file, '*.stdout.txt')
      })
      self.handle_std_files('stdout', files, cb)
    }],
    handle_stderr: ['read_dir', function(cb, results) {
      var files = results.read_dir.filter(function(file) {
        return minimatch(file, '*.stderr.txt')
      })
      self.handle_std_files('stderr', files, cb)
    }],
    handle_results: ['handle_stdout', 'handle_stderr', function(cb, results) {
      var files = results.read_dir.filter(function(file) {
        return minimatch(file, '*.result.json')
      })
      self.handle_result_files(files, cb)
    }]
  }, function(err) {
    if (err) {
      return self.emit('error', err)
    }
    setTimeout(self.poll.bind(self), 1000)
  })
}

Orphans.prototype.handle_std_files = function(std_name, files, cb) {
  var self = this
  async.eachSeries(files, function(file, cb) {
    var id = path.basename(file, '.' + std_name + '.txt').split('_')[0]
    self.meta(id, function(err, meta) {
      if (err) {
        return cb(err)
      }
      fs.readFile(path.resolve(self.dir, file), {encoding: 'utf8'}, function(err, output) {
        if (err) {
          return cb(err)
        }
        self.emit(std_name, output, meta.inheritance)
        fs.unlink(path.resolve(self.dir, file), cb)
      })      
    })
  }, cb)  
}

// todo cache
Orphans.prototype.meta = function(id, cb) {
  fs.readFile(path.resolve(this.dir, id + '.meta.json'), {encoding: 'utf8'}, function(err, raw) {
    if (err) {
      return cb(err)
    }
    try {
      cb(null, JSON.parse(raw))
    } catch (err) {
      cb(err)
    }
  })
}

Orphans.prototype.handle_result_files = function(files, cb) {
  var self = this
  async.mapLimit(files, 10, function(file, cb) {
    var id = path.basename(file, '.result.json')
    self.meta(id, function(err, meta) {
      if (err) {
        return cb(err)
      }
      fs.readFile(path.resolve(self.dir, file), {encoding: 'utf8'}, function(err, raw) {
        if (err) {
          return cb(err)
        }
        try {
          var result = JSON.parse(raw)
          self.remove(id, function(err) {
            if (err) {
              return cb(err)
            }
            self.emit('complete', result, meta.inheritance)
            cb()
          })
        } catch (err) {
          cb(err)
        }
      })
    })
  }, cb)
}

// removes all files starting with id in my path
Orphans.prototype.remove = function(id, cb) {
  var self = this
  fs.readdir(this.dir, function(err, files) {
    if (err) {
      return cb(err)
    }
    files = files.filter(function(file) {
      return minimatch(file, id + '*')
    })
    async.eachLimit(files, 10, function(file, cb) {
      fs.unlink(path.resolve(self.dir, file), cb)
    }, cb)
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
