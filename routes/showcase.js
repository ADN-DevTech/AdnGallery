var socketio = require('socket.io');
var express = require('express');
var request = require('request');
var path = require('path');

var router = express.Router();

///////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////
router.get('/', function(req, res) {

    var rootPath = path.join(
        __dirname,
        '../views/showcase');

    res.sendFile('showcase.html', { root: rootPath });
});

///////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////
router.initializeSocket = function(serverApp) {

    var io = socketio.listen(serverApp, { log: false });;

    var tracker = {};

    var showcaseData = {
        controller: null,
        urn: ''
    };

    io.sockets.on('connection', function (socket) {

        tracker[socket.id] = {
            socket: socket,
            user: null
        };

        //init data

        var users = [];

        for (var key in tracker) {

            if(tracker[key].user)
                users.push(tracker[key].user);
        }

        var initData = {
            users: users,
            socketId: socket.id,
            currentShowcase: showcaseData
        };

        socket.emit('connected', initData);

        console.log('Incoming socket connection: ' + socket.id);

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        socket.on('requestControl', function (user) {

            // grants control with no further check
            user.hasControl = true;

            emitAll('controlGranted', user);

            var msg = {
                text: '> ' + '<b>' + user.name + '</b>' +
                    ' has taken control' + '<br><br>'
            };

            emitAll('chatMessage', msg);
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        socket.on('cameraChanged', function (data) {

            emitExclude('cameraChanged', data);
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        socket.on('sendMessage', function (msg) {

            msg.text = '> ' + '<b>' + msg.user.name + '</b>' + ' says:<br>' +
                msg.text + '<br><br>';

            emitAll('chatMessage', msg);
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        socket.on('addUser', function (user) {

            tracker[socket.id].user = user;

            emitAll('addUser', user);

            var msg = {
                user: user,
                text: '> ' + '<b>' + user.name + '</b>' +
                    ' joined the showcase<br><br>'
            }

            emitAll('chatMessage', msg);
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        socket.on('removeUser', function (user) {

            removeUser(user);
        });

        socket.on('disconnect', function () {

            console.log('Socket disconnection: ' + socket.id);

            if(tracker[socket.id].user) {
                removeUser(tracker[socket.id].user);
            }
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        socket.on('loadDocument', function (urn) {

            showcaseData.urn = urn;

            emitExclude('loadDocument', urn);

            var msg = {
                text: '> Loading document...<br><br>'
            }

            emitAll('chatMessage', msg);
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function removeUser(user) {

            emitAll('removeUser', user);

            var msg = {
                user: user,
                text: '> ' + '<b>' + user.name + '</b>' + ' left the showcase<br><br>'
            }

            emitAll('chatMessage', msg);

            tracker[socket.id].user = null;
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function emitAll(id, data) {

            for (var key in tracker) {
                tracker[key].socket.emit(id, data);
            }
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function emitExclude(id, data) {

            for (var key in tracker) {

                if(key !== socket.id) {

                    tracker[key].socket.emit(id, data);
                }
            }
        }
    });
}

module.exports = router;