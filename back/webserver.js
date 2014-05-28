var express = require('express');
var ejs = require('ejs');

var app = module.exports = express();

var FRONT_PATH = __dirname + '/../front';

app.engine('html', ejs.renderFile);
app.set('views', FRONT_PATH);
app.use(express.static(FRONT_PATH));

app.get('*', function(req, res) {
  res.render('index.html');
});