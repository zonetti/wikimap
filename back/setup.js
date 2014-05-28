var http = require('http');
var logger = require('winston');

var app = require('./webserver');
var server = http.createServer(app);

require('./websockets')(server);

var port = process.env.PORT || 1337;

server.listen(port, function() {
  logger.info('wikimap listening on port ' + port);
});