'use strict'

var child_process = require('child_process')
  , fs = require('fs')
  , path = require('path')

var child = null
  , orphan_args = null
  , inheritance = null
  , meta = null
  , result = {code: 0, stdout: "", stderr: ""}

function filename(type, ext, include_ts) {
  var name = orphan_args.id
  if (include_ts) {
    name = name + '_' + Date.now().valueOf()
  }
  name = name + '.' + type + '.' + ext
  return path.resolve(orphan_args.dir, name)
}

try {
  orphan_args = JSON.parse(process.argv[2])
} catch (err) {}
try {
  inheritance = JSON.parse(process.argv[3])
} catch (err) {}

var meta_file = filename('meta', 'json', false)
  , result_file = filename('result', 'json', false)

meta = {
  started: Date.now().valueOf(),
  orphan_args: orphan_args,
  inheritance: inheritance
}

fs.writeFileSync(meta_file, JSON.stringify(meta), {encoding: 'utf8'})

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
      fs.appendFileSync(filename('stdout', 'txt', true), data, {encoding: 'utf8'})
      result.stdout = result.stdout + data
    })
    child.stderr.on('data', function(data) {
      data = data.toString()
      fs.appendFileSync(filename('stderr', 'txt', true), data, {encoding: 'utf8'})
      result.stderr = result.stderr + data
    })
    child.on('close', function(code) {
      result.code = code
      fs.writeFileSync(result_file, JSON.stringify(result), {encoding: 'utf8'})
      process.exit()
    })
    break
  default:
    result.code = -9001
    result.error = 'unknown orphan method'
    fs.writeFileSync(result_file, JSON.stringify(result), {encoding: 'utf8'})
    process.exit()
}
