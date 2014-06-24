var scrap = require('scrap');
var async = require('async');
var logger = require('winston');

var WikiMap = module.exports = function(emitter) {

  var options = {
    term: '',
    language: 'en',
    relation: 2,
    depth: 2
  };

  var iterator = function(term, href, depth, done) {
    var url;
    var parentNode;
    var newEdge = false;

    if (arguments.length === 2) {
      depth = 0;
      done = href;
      url = 'http://LANG.wikipedia.org/w/index.php?search=TERM'
        .replace('LANG', options.language)
        .replace('TERM', encodeURIComponent(term));
    } else {
      newEdge = true;
      parentNode = term;
      url = 'http://LANG.wikipedia.orgHREF'
        .replace('LANG', options.language)
        .replace('HREF', href);
    }

    scrap(url, function(err, $) {
      if (err) {
        logger.error('Error on requesting', {internal: err});
        return done();
      }

      var count = 0;
      var newNode;

      try {
        newNode = $('#firstHeading span').text();
      } catch(err) {
        logger.error('Error on scrapping', {internal: err});
        return done();
      }

      if (depth > options.depth) {
        return done();
      }

      emitter.emit('new node', newNode);

      if (newEdge) {
        emitter.emit('new edge', {
          from: parentNode,
          to: newNode
        });
      }

      var related = [];

      $('#mw-content-text p a').each(function(i, link) {
        if (parseInt(options.relation, 10) === count) return false;
        if ($(link).text().charAt(0) !== '[') {
          count++;
          related.push($(link).attr('href'));
        }
      });

      async.each(
        related,
        function(relatedNodeHref, callback) {
          iterator(newNode, relatedNodeHref, depth + 1, callback);
        },
        done
      );
    });
  };

  return {

    setOptions: function(newOptions) {
      options = newOptions;
    },

    setTerm: function(term) {
      options.term = term;
    },

    search: function(done) {
      iterator(options.term, done);
    }

  };

};