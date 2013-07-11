var 
  orphanage = require('./index'),
  path = require('path')

orphanage.open(path.resolve('./run'), function(err, orphans) {
  console.log(arguments)
  orphans.on('error', function(err) {
    logger.error('error', err)
  })
  orphans.spawn('ls', ['-lh', '/usdfsr'], {})
  console.log('exit')
  process.exit()
})