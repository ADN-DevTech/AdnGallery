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

var nodemailer = require('nodemailer');
var express = require('express');
var request = require('request');
var mongo = require('mongodb');

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

    console.log('Retrieving all items');

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

    var item = req.body;

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
                    sendMail(email, result[0]);

                    var response = {
                        model: result[0]
                    };

                    res.send(response);
                }
            });
    });
});

function sendMail(email, modelInfo) {

    var transporter = nodemailer.createTransport("SMTP", {
        service: 'gmail',
        auth: {
            user: 'adn.autodesk@gmail.com',
            pass: 'autodesk913'
        }
    });

    var text = "You have successfully uploaded a new model:" +
        "\n\nAuthor:\n" + modelInfo.author.name +
        "\n\nModel name:\n" + modelInfo.name +
        "\n\nFile Id:\n" + modelInfo.fileId +
        "\n\nModel urn:\n" + modelInfo.urn;

    transporter.sendMail({
        from: "adn.autodesk@gmail.com",
        to: email,
        subject: "Model upload notification",
        text: text
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