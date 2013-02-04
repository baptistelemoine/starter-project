
var express = require('express');
var path = require('path');
var app = module.exports = express();

app.configure(function () {
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/test', function (req, res) { res.send('hello') });
app.listen(3000);