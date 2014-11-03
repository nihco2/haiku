var express = require('express');
var app = express();

app.configure(function () {
  app.use(express.static(__dirname + '/')); // set the static files location
  app.use(express.logger('dev')); // log every request to the console
  app.use(express.bodyParser()); // pull information from html in POST
  app.use(express.methodOverride()); // simulate DELETE and PUT
});


app.get('/', function (req, res) {
  res.render('index.html');
});
app.listen(3001);
