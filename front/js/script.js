$(document).ready(function() {

  var socket = io.connect();

  var nodes = new vis.DataSet();
  var edges = new vis.DataSet();

  var graph = new vis.Graph(
    document.getElementById('visualization'),
    {nodes: nodes, edges: edges},
    {}
  );

  graph.on('doubleClick', function(e) {
    if (e.nodes.length === 0) return false;
    socket.emit('new search', e.nodes[0]);
  });

  $('#search').submit(function(e) {
    e.preventDefault();
    socket.emit('new search', $(this).serialize());
  });

  $('#reset').click(function() {
    nodes.clear();
    edges.clear();
  });

  socket.on('new node', function(node) {
    try {
      nodes.add({id: node, label: node});
    } catch(err) {
      console.log(err);
    }
  });

  socket.on('new edge', function(edge) {
    try {
      edges.add(edge);
    } catch(err) {
      console.log(err);
    }
  });

});