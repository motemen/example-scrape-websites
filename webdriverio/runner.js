var selenium = require('selenium-standalone');
var spawn    = require('child_process').spawn;

var server = selenium({ stdio: 'inherit' }, []);

setTimeout(function () {
  var command = spawn('node', process.argv.slice(2), { stdio: 'inherit' });
  command.on('close', function () {
    server.kill();
  });
}, 1000);
