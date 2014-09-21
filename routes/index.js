var express = require('express');
var path = require('path');

var router = express.Router();

router.get('/', function(req, res) {
    //res.render('index', { title: 'Express' });

    res.sendFile('./views/index.html');
});

router.get('/adngallery', function(req, res) {

    res.redirect('/');
});

module.exports = router;
