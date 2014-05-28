var scrap = require('scrap');
var async = require('async');

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

    if (arguments.length == 2) {
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
      var count = 0;
      var newNode = $('#firstHeading span').text()

      if (depth > options.depth) {
        return done();
      }

      emitter.emit('new node', newNode);

      if (newEdge) {
        emitter.emit('new edge', {
          id: newNode + '-' + parentNode,
          from: parentNode,
          to: newNode,
          style: 'arrow'
        });
      }

      var related = [];

      $('#mw-content-text p a').each(function(i, link) {
        if (options.relation == count) return false;
        if ($(link).text().charAt(0) != '[') {
          count++
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