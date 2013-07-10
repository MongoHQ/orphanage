var
  child_process = require('child_process')

var
  child = child_process.fork('./sleeper')

console.log(child)
process.exit()