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

var CONSUMER_KEY = 'tAp1fqjjtcgqS4CKpCYDjAyNbKW4IVCC';
var CONSUMER_SECRET = 'q2LwUFg3MrYngc8l';
var BASE_URL = 'https://developer.api.autodesk.com';
var ADMIN_PASSWORD = 'kow@bung@'

//var CONSUMER_KEY = "****** place holder - replace with your creds ******";
//var CONSUMER_SECRET = "****** place holder - replace with your creds ******";
//var BASE_URL = "https://developer.api.autodesk.com";

var transport = require('nodemailer-direct-transport');
var nodemailer = require('nodemailer');
var express = require('express');
var request = require('request');
var mongo = require('mongodb');
var formidable = require('formidable');
var path = require('path');
var fs = require('fs');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server(
    'localhost',
    27017,
    { auto_reconnect: true });

db = new Db('NodeViewDb', server);

var router = express.Router();

module.exports = router;

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
db.open(function (err, db) {

    if (!err) {

        console.log("Connected to 'NodeViewDb' database");

        db.collection(
            'models',
            { strict: true },
            function (err, collection) {
                if (err) {
                    console.log("Models DB is empty ...");
                }
            });
    }
});

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
router.get('/models', function (req, res) {

    console.log('Retrieving all models');

    db.collection('models', function (err, collection) {
        collection.find().toArray(

            function (err, items) {

                var response = {
                    models: items
                };

                res.send(response);
            });
    });
});

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
router.get('/token', function (req, res) {

    var params = {
        client_id: CONSUMER_KEY,
        client_secret: CONSUMER_SECRET,
        grant_type: 'client_credentials'
    }

    request.post(BASE_URL + '/authentication/v1/authenticate',
        { form: params },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {

                var authResponse = JSON.parse(body);

                res.send(authResponse.access_token);
            }
        });
});

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
router.get('/model/:id', function (req, res) {

    var id = req.params.id;

    if (id.length !== 24) {
        res.status(404);
        res.send(null);
        return;
    }

    console.log('Retrieving item: ' + id);

    db.collection('models', function (err, collection) {

        collection.findOne(

            { '_id': new BSON.ObjectID(id) },

            function (err, item) {

                if(typeof item === 'undefined')
                    res.status(404);

                res.send(item);
            });
    });
});

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
router.get('/search/models', function (req, res) {

    var field = req.query.field;

    var value = req.query.value;

    if (typeof field === 'undefined' ||
        typeof value === 'undefined') {

        console.log('findByField invalid query ');
        res.send([]);
        return;
    }

    var query = new Object();

    //case insensitive search
    query[field] = new RegExp(["^", value, "$"].join(""), "i");

    console.log('Retrieving items: ' + field + '=' + value);

    db.collection('models',
        function (err, collection) {
            collection.find(query).toArray(
                function (err, items) {
                    res.send(items);
                });
        });
});

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
router.post('/model', function (req, res) {

    var host = req.query.host;

    var item = req.body;

    console.log('host: ' + host);

    console.log('Adding model: ' + JSON.stringify(item));

    var email = item.author.email;

    item.author = {
        name: item.author.name
    }

    db.collection('models', function (err, collection) {

        collection.insert(
            item,
            { safe: true },

            function (err, result) {

                if (err) {
                    res.send({ 'error': 'An error has occurred' });

                } else {

                    console.log('Success: ' + JSON.stringify(result[0]));

                    var modelInfo = result[0];

                    var url = 'http://' + host + '/#/viewer?id=' + modelInfo._id;

                    sendMail(url, email,modelInfo );

                    var response = {
                        model: result[0]
                    };

                    res.send(response);
                }
            });
    });
});

function sendMail(url, email, modelInfo) {

    /*var transporter = nodemailer.createTransport("SMTP", {
        host: '127.0.0.1',
        port: 587,
        auth: {
            user: 'adngallery',
            pass: '@utod3sker113'
        }
    });*/

    /*var transporter = nodemailer.createTransport("SMTP", {
        service: 'gmail',
        auth: {
            user: 'adn.autodesk@gmail.com',
            pass: 'autodesk913'
        }
    });*/

    var transporter = nodemailer.createTransport(transport({
        name: 'smtp.orange.fr'
    }));

    var text = "You have successfully uploaded a new model:" +
        "\n\nAuthor:\n" + modelInfo.author.name +
        "\n\nModel name:\n" + modelInfo.name +
        "\n\nFile Id:\n" + modelInfo.fileId +
        "\n\nModel urn:\n" + modelInfo.urn;

    var html = "You have successfully uploaded a new model:" +
        "<br><br><b>Author:</b><br>" + modelInfo.author.name +
        "<br><br><b>Model name:</b><br>" + modelInfo.name +
        "<br><br><b>File Id:</b><br>" + modelInfo.fileId +
        "<br><br><b>Model urn:</b><br>" + modelInfo.urn +
        "<br><br>" + '<a href=' + url + '>View on the Gallery</a>';

    transporter.sendMail({
        from: 'View & Data API Gallery <no-reply@autodesk.com>',
        replyTo: 'no-reply@autodesk.com',
        to: email,
        subject: "Model upload notification",
        text: text,
        html: html
    });

    transporter.close();
}

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
router.put('/model/:id', function (req, res) {

    var id = req.params.id;

    var item = req.body;

    console.log('Updating model: ' + id);
    console.log(JSON.stringify(item));

    db.collection('models', function (err, collection) {
        collection.update(
            { '_id': new BSON.ObjectID(id) },
            item,
            { safe: true },
            function (err, result) {
                if (err) {
                    console.log('Error updating model: ' + err);
                    res.send({ 'error': 'An error has occurred' });
                } else {
                    console.log('' + result + ' document(s) updated');
                    res.send(item);
                }
            });
    });
});

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
router.get('/extensions', function (req, res) {

    console.log('Retrieving all extensions');

    db.collection('extensions', function (err, collection) {
        collection.find().toArray(

            function (err, items) {

                var response = {
                    extensions: items
                };

                res.send(response);
            });
    });
});

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
router.post('/extensions', function (req, res) {

    function getFileExt(file) {

        var res = file.name.split('.');

        return res[res.length - 1];
    }

    var error = null;

    var form = new formidable.IncomingForm();

    form.on('field', function(field, value) {

    })

    form.on('file', function(field, file) {

        var ext = getFileExt(file);

        if(ext === 'js' || ext === 'css') {

            var filePath = file.path;

            var uploadPath = path.join(
                __dirname,
                '../uploads/extensions/', file.name);

            fs.readFile(filePath, function (err, data) {

                var extensions = findExtensions(data.toString('utf8'));

                if(extensions.length > 0) {

                    extensions.forEach(function(name) {

                        var extension = {
                            name: name,
                            file: file.name
                        };

                        addExtension(extension);
                    });

                    fs.writeFile(uploadPath, data, function (err) {

                        fs.unlink(filePath, function (err) {

                            error = err;
                        });
                    });
                }
            });
        }
    });

    form.on('end', function() {

        if (error) {
            res.status(500);
            res.json({'success': false});

        } else {
            res.status(200);
            res.json({'success': true});
        }
    });

    form.parse(req);
});

function addExtension(extension) {

    db.collection('extensions', function (err, collection) {

        collection.insert(
            extension,
            { safe: true },

            function (err, result) {


            });
    });
}

function findExtensions(str) {

    String.prototype.replaceAll = function (find, replace) {
        var str = this;
        return str.replace(new RegExp(
                find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'),
            replace);
    };

    var extensions = [];

    var start = 0;

    while(true) {

        start = str.indexOf('registerExtension', start);

        if(start < 0) {

            return extensions;
        }

        var end = str.indexOf(',', start);

        var substr = str.substring(start, end);

        var ext = substr.replaceAll('registerExtension', '').
            replaceAll('\n', '').
            replaceAll(' ', '').
            replaceAll('(', '').
            replaceAll('\'', '').
            replaceAll('"', '');

        extensions.push(ext);

        start = end;
    }
}

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////

//disabled delete

/*router.delete('/model/:id', function (req, res) {

    var id = req.params.id;

    //Check password
    var pwd = req.query.pwd;

    if (pwd !== ADMIN_PASSWORD) {
        var error = 'Invalid admin password, cannot delete model: ' + id;
        console.log(error);
        res.send({ 'error': error });
        return;
    }

    console.log('Deleting model: ' + id);

    db.collection('models', function (err, collection) {
        collection.remove(
            { '_id': new BSON.ObjectID(id) },
            { safe: true },
            function (err, result) {
                if (err) {
                    res.send({ 'error': 'An error has occurred - ' + err });
                } else {
                    console.log('' + result + ' document(s) deleted');
                    res.send(req.body);
                }
            });
    });
});*/