///////////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2014 - ADN/Developer Technical Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
///////////////////////////////////////////////////////////////////////////////
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var express = require('express');
var logger = require('morgan');
var path = require('path');

var showcase = require('./routes/showcase');
var embed = require('./routes/embed');
var api = require('./routes/api');

var app = express();

//CORS middleware
var cors = function (req, res, next) {

    res.header('Access-Control-Allow-Origin', '*');

    res.header('Access-Control-Allow-Methods',
        'GET,PUT,POST,DELETE');

    res.header('Access-Control-Allow-Headers',
        'Content-Type, Authorization, ' +
        'Content-Length, X-Requested-With');

    next();
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

app.use(favicon(__dirname + '/www/public/images/Adsk.ico'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/node/gallery', express.static(__dirname + '/www'));
app.use(cookieParser());
app.use(logger('dev'));

//app.use(cors);

app.use('/node/gallery/api', api);
app.use('/node/gallery/embed', embed);
app.use('/node/gallery/showcase', showcase);

app.get('/node/gallery', function (req, res) {

    var file = path.join(__dirname, 'index.html')
    res.sendFile(file);
});

/*
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
});*/


app.set('port', process.env.PORT || 3000);

var serverApp = app.listen(

    app.get('port'),

    function() {
        console.log('Express server listening on port ' +
            serverApp.address().port);
    });

showcase.initializeSocket(serverApp);

module.exports = app;