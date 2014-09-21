var express = require('express');
var request = require('request');
var path = require('path');

var router = express.Router();

router.get('/', function(req, res) {

    var rootPath = path.join(
        __dirname,
        '../views/embed');

    res.sendFile('embed.html', { root: rootPath });
});

router.get('/:id', function(req, res) {

    var id = req.params.id;

    var url = 'http://' + req.headers.host + '/api/model/' + id;

    request(url, function (error, response, body) {

        if (!error && response.statusCode == 200) {

            var model = JSON.parse(body);

            var urn = encodeURIComponent(model.urn);

            res.redirect('/embed?urn=' + urn);
        }
    })
});

module.exports = router;