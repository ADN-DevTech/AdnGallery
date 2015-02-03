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

var AdnViewDataClient = require(
    './Autodesk.ADN.Toolkit.ViewDataClient.js');
var transport = require(
    'nodemailer-direct-transport');
var formidable = require('formidable');
var nodemailer = require('nodemailer');
var express = require('express');
var mongo = require('mongodb');
var path = require('path');
var sync = require('sync');
var fs = require('fs');

var CONSUMER_KEY = 'tAp1fqjjtcgqS4CKpCYDjAyNbKW4IVCC';
var CONSUMER_SECRET = 'q2LwUFg3MrYngc8l';
var BASE_URL = 'https://developer.api.autodesk.com';

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server(
    'localhost',
    27017,
    { auto_reconnect: true });

var db = new Db('NodeViewDb', server);

var router = express.Router();

var viewDataClient =
    new AdnViewDataClient(
        BASE_URL,
        CONSUMER_KEY,
        CONSUMER_SECRET);

module.exports = router;

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
db.open(function (err, db) {

    if (!err) {

        console.log("Connected to 'NodeViewDb' database");
    }
});

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
router.get('/token', function (req, res) {

    var response = viewDataClient.getTokenResponse();

    res.status((response ? 200 : 404));
    res.send(response);
});

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
router.get('/models', function (req, res) {

    console.log('Retrieving models');

    var pageQuery = {};

    var fieldQuery = {};

    if (typeof req.query.skip !== 'undefined')
        pageQuery.skip = req.query.skip;

    if (typeof req.query.limit !== 'undefined')
        pageQuery.limit = req.query.limit;

    if (typeof req.query.field !== 'undefined' &&
        typeof req.query.value !== 'undefined') {

        var field = req.query.field;

        var value = req.query.value;

        //case insensitive search
        var exp = ["^", value, "$"].join("");

        fieldQuery[field] = new RegExp(exp, "i");
    }

    db.collection('models', function (err, collection) {
        collection.find(fieldQuery, pageQuery)
            .sort({ name: 1 }).toArray(

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

                var response = {
                    model: item
                };

                res.status((item ? 200 : 404));
                res.send(response);
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

                    res.status(404);
                    res.send({ 'error': 'An error has occurred' });

                } else {

                    console.log('Success: ' +
                        JSON.stringify(result[0]));

                    var modelInfo = result[0];

                    var response = {
                        model: modelInfo
                    };

                    res.send(response);

                    var url = 'http://' + host +
                        '/#/viewer?id=' + modelInfo._id;

                    var emailInfo = {
                        url: url,
                        email: email
                    }

                    checkTranslationStatus(
                        viewDataClient,
                        modelInfo.fileId,
                        1000 * 60 * 60 * 24 * 2, //2 days timeout :),
                        function (viewable) {

                            sendMail(emailInfo.url, emailInfo.email, modelInfo);

                            getThumbnail(modelInfo);

                            console.log("Translation successful: " +
                                modelInfo.name + " - FileId: " +
                                modelInfo.fileId);
                        },
                        function(error) {

                        });
                }
            });
    });
});

function getThumbnail(modelInfo) {

    viewDataClient.getThumbnailAsync(
        modelInfo.fileId,
        function (data) {

            var thumbnail = {
                modelId: modelInfo._id,
                data: data
            }

            addThumbnail(thumbnail);
        },
        function (error) {

            console.log('getThumbnail error:' + error)
        });
}

///////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////
function checkTranslationStatus(
    viewDataClient,
    fileId,
    timeout,
    onSuccess,
    onError) {

    var startTime = new Date().getTime();

    var timer = setInterval(function () {

        var dt = (new Date().getTime() - startTime) / timeout;

        if (dt >= 1.0) {

            clearInterval(timer);
        }
        else {

            viewDataClient.getViewableAsync(
                fileId,
                function (response) {

                    console.log(
                        'Progress ' +
                        fileId + ': ' +
                        response.progress);

                    if (response.progress === 'complete') {
                        clearInterval(timer);
                        onSuccess(response);
                    }
                },
                function (error) {
                    onError(error);
                });
        }
    }, 10000);
};

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
function sendMail(url, email, modelInfo) {

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

    getExtensionsAsync(function(arg, items) {

        var response = {
            extensions: items
        };

        res.send(response);
    });
});

function getExtensionsAsync(callback) {

    db.collection('extensions', function (err, collection) {

        collection.find().sort({ name: 1 }).toArray(

            function (err, items) {

                callback(null, items);
            });
    });
}

router.get('/extension/:extId', function (req, res) {

    var extId = req.params.extId;

    var query = new Object();

    query['id'] = extId;

    db.collection('extensions',
        function (err, collection) {
            collection.find(query).toArray(
                function (err, items) {

                    var response = {
                        extensions: items
                    };

                    res.status((items ? 200 : 404));
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
                '../www/uploads/extensions/', file.name);

            fs.readFile(filePath, function (err, data) {

                var extensions = findExtensions(data.toString('utf8'));

                if(extensions.length > 0) {

                    extensions.forEach(function(id) {

                        var idComponents = id.split('.');

                        var nameComponents =
                            idComponents[idComponents.length - 1].
                                match(/[A-Z][a-z]+/g);

                        var name = '';

                        nameComponents.forEach(function(nameComp){
                            name += nameComp + ' ';
                        });

                        var extension = {
                            id: id,
                            name: name,
                            file: file.name
                        };

                        // Start fiber
                        sync(function(){

                            var res = getExtensionsByIdAsync.sync(null, id);

                            if(res.length === 0) {

                                addExtension(extension);
                            }
                         })
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

function getExtensionsByIdAsync(id, callback) {

    var query = new Object();

    query['id'] = id;

    db.collection('extensions',
        function (err, collection) {
            collection.find(query).toArray(
                function (err, items) {
                    callback(null, items);
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

    String.prototype.trim = function () {
        return this.replace(/^\s+/, '').replace(/\s+$/, '');
    };

    var extensions = [];

    var start = 0;

    while(true) {

        start = str.indexOf(
            'theExtensionManager.registerExtension',
            start);

        if(start < 0) {

            return extensions;
        }

        var end = str.indexOf(',', start);

        var substr = str.substring(start, end);

        var ext = substr.replaceAll('theExtensionManager.registerExtension', '').
            replaceAll('\n', '').
            replaceAll('(', '').
            replaceAll('\'', '').
            replaceAll('"', '');

        extensions.push(ext.trim());

        start = end;
    }
}

///////////////////////////////////////////////////////////////////////////////
// add new thumbnail
//
// thumbnail:
// {
//      _id: id
//      modelId: modelId
//      data: thumbnail_base64
// }
//
///////////////////////////////////////////////////////////////////////////////
function addThumbnail(thumbnail) {

    db.collection('thumbnails', function (err, collection) {

        collection.insert(
            thumbnail,
            { safe: true },

            function (err, result) {

            });
    });
};

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
router.get('/thumbnail/:modelId', function (req, res) {

    var modelId = req.params.modelId;

    db.collection('thumbnails',
        function (err, collection) {

            collection.findOne(

                { 'modelId': new BSON.ObjectID(modelId) },

                function (err, item) {

                    var response = {
                        thumbnail: item
                    };

                    res.status((item ? 200 : 404));
                    res.send(response);
                });
        });
});

router.post('/thumbnail', function (req, res) {

    var item = req.body;

    db.collection('thumbnails', function (err, collection) {
        collection.insert(
            item,
            { safe: true },

            function (err, result) {

            });
    });
});


router.get('/reload', function (req, res) {

    var pageQuery = {};

    var fieldQuery = {};

    db.collection('models', function (err, collection) {
        collection.find(fieldQuery, pageQuery)
            .sort({ name: 1 }).toArray(

            function (err, items) {

                var response = {
                    models: items
                };

                items.forEach(function(item) {
                    getThumbnail({
                        fileId: item.fileId,
                        _id: item._id
                    });
                });

                res.send(response);
            });
    });
});











