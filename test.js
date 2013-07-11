var 
  orphanage = require('./index'),
  path = require('path')

orphanage.open(path.resolve('./run'), function(err, orphans) {
  console.log(arguments)
  orphans.on('error', function(err) {
    console.error('error', err)
  })
  orphans.spawn('ls', ['-lh', '/usr'], {respond: '1234'})
  console.log('exit')
  orphans.on('stderr', function() {
    console.log('stderr', arguments)
  })
  orphans.on('complete', function() {
    console.log('complete', arguments)
  })
  orphans.on('stdout', function() {
    console.log('stdout', arguments)
  })
})