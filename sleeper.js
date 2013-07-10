process.title = 'orphan'
console.log('sleeper')
setInterval(function() {
  console.log('zzzz')
}, 1000)
setTimeout(function() {
  console.log('i slept')
  process.exit()
}, 10000)