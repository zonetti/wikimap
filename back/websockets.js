var querystring = require('querystring');
var socketio = require('socket.io');
var logger = require('winston');

var Wikimap = require('./wikimap');

module.exports = function(server) {

  var io = socketio.listen(server);

  io.set('log level', 0);

  io.sockets.on('connection', function(socket) {

    var wikimap = new Wikimap(socket);

    socket.on('new search', function(query) {
      var term;

      if (query.match('&')) {
        var options = querystring.parse(query);
        wikimap.setOptions(options);
        term = options.term;
      } else {
        wikimap.setTerm(query);
        term = query;
      }

      logger.profile('Searching: ' + term);

      wikimap.search(function() {
        logger.profile('Searching: ' + term);
      });
    });

  });

  return io;

};