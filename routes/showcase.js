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

    var io = socketio.listen(serverApp, { log: false });

    var tracker = {};

    var showcaseData = {
        controllingUser: null,
        urn: '',
        view: null,
        isolateIds: null
    };

    io.sockets.on('connection', function (socket) {

        //console.log('Incoming socket connection: ' + socket.id);

        tracker[socket.id] = {
            socket: socket,
            user: null
        };

        socket.emit('connected', buildInitData());

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function buildInitData() {

            var users = [];

            for (var key in tracker) {

                if(tracker[key].user)
                    users.push(tracker[key].user);
            }

            var initData = {
                users: users,
                socketId: socket.id,
                showcaseData: showcaseData
            };

            return initData;
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        socket.on('requestControl', function (user) {

            // grants control with no further check

            if(user.hasControl) {

                if(showcaseData.controllingUser) {

                    //current controlling user looses control
                    showcaseData.controllingUser.hasControl = false;

                    emitAll('controlEvent', showcaseData.controllingUser);
                }

                showcaseData.controllingUser = user;

                var msg = {
                    text: '> ' + '<b>' + user.name + '</b>' +
                        ' has taken control' + '<br><br>'
                };

                emitAll('chatMessage', msg);
            }
            else {
                if(showcaseData.controllingUser) {
                    if(showcaseData.controllingUser.socketId === user.socketId) {
                        showcaseData.controllingUser = null;
                    }
                }
            }

            tracker[user.socketId].user = user;

            emitAll('controlEvent', user);
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        socket.on('cameraChanged', function (data) {

            showcaseData.view = data.view;

            emitExclude('cameraChanged', data);
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        socket.on('isolate', function (data) {

            showcaseData.isolateIds = data.isolateIds;

            emitExclude('isolate', data);
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
        socket.on('closeDocument', function () {

            emitAll('closeDocument');
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function removeUser(user) {

            emitAll('removeUser', user);

            var msg = {
                user: user,
                text: '> ' + '<b>' + user.name + '</b>' +
                    ' left the showcase<br><br>'
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