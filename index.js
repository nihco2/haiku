var express = require('express');
var app = express();
var compressor = require('node-minify');
var fs = require('fs');

app.configure(function () {
  app.use(express.static(__dirname + '/dist')); // set the static files location
  app.use(express.logger('dev')); // log every request to the console
  app.use(express.bodyParser()); // pull information from html in POST
  app.use(express.methodOverride()); // simulate DELETE and PUT
});

new compressor.minify({
  type: 'uglifyjs',
  fileIn: 'dist/js/haiku.js',
  fileOut: 'dist/js/haiku.min.js',
  callback: function (err, min) {
    console.log(err);
    //        console.log(min); 
  }
});

new compressor.minify({
  type: 'uglifyjs',
  fileIn: 'dist_eng/js/haiku.js',
  fileOut: 'dist_eng/js/haiku.min.js',
  callback: function (err, min) {
    console.log(err);
    //        console.log(min); 
  }
});

new compressor.minify({
  type: 'uglifyjs',
  fileIn: 'dist_ger/js/haiku.js',
  fileOut: 'dist_ger/js/haiku.min.js',
  callback: function (err, min) {
    console.log(err);
    //        console.log(min); 
  }
});


app.get('/', function (req, res) {
  res.render('index.html');
});
app.listen(3001);
