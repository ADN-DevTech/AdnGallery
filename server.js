
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var express = require('express');
var logger = require('morgan');
var path = require('path');

var showcase = require('./routes/showcase');
var routes = require('./routes/index');
var embed = require('./routes/embed');
var api = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

app.use(favicon(__dirname + '/public/images/adsk.64x64.png'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(logger('dev'));

app.use('/', routes);
app.use('/api', api);
app.use('/embed', embed);
app.use('/showcase', showcase);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

//run with: leefsmp$ node server.js

app.set('port', process.env.PORT || 3000);

var serverApp = app.listen(
    app.get('port'),
    function() {
        console.log('Express server listening on port ' + serverApp.address().port);
    });

showcase.initializeSocket(serverApp);

