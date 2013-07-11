'use strict'

var child_process = require('child_process')
  , fs = require('fs')
  , path = require('path')
  , util = require('util')

var child = null
  , orphan_args = null
  , result = {code: 0, stdout: "", stderr: ""}

function filename(type, ext, include_ts) {
  var name = orphan_args.id
  if (include_ts) {
    name = name + '_' + Date.now().valueOf()
  }
  name = name + '.' + type + '.' + ext
  return path.resolve(orphan_args.path, name)
}

try {
  orphan_args = JSON.parse(process.argv[2])
} catch (err) {}

var result_file = filename('result', 'json', false)

switch (orphan_args.method) {
  case 'exec':
    child_process.exec(orphan_args.args[0], orphan_args.args[1], function(err, stdout, stderr) {
      if (err && err.code) {
        result.code = err.code
      }
      result.stdout = stdout
      result.stderr = stderr
      fs.writeFileSync(result_file, JSON.stringify(result), {encoding: 'utf8'})
      process.exit()
    })
    break
  case 'spawn':
    child = child_process.spawn(orphan_args.args[0], orphan_args.args[1], orphan_args.args[2])
    result = {code: 0, stdout: "", stderr: ""}
    child.stdout.on('data', function(data) {
      data = data.toString()
      fs.writeFileSync(filename('stdout', 'txt', true), data, {encoding: 'utf8'})
      result.stdout = result.stdout + data
    })
    child.stderr.on('data', function(data) {
      data = data.toString()
      fs.writeFileSync(filename('stderr', 'txt', true), data, {encoding: 'utf8'})
      result.stderr = result.stderr + data
    })
    child.on('close', function(code) {
      result.code = code
      fs.writeFileSync(result_file, JSON.stringify(result), {encoding: 'utf8'})
      process.exit()
    })
    break
}
