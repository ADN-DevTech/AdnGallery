var socketio = require('socket.io');
var express = require('express');
var request = require('request');
var path = require('path');

var router = express.Router();

router.get('/', function(req, res) {

    var rootPath = path.join(
        __dirname,
        '../views/showcase');

    res.sendFile('showcase.html', { root: rootPath });
});

var io = null;

var tracker = {};

router.initializeSocket = function(serverApp) {

    io = socketio.listen(serverApp, { log: false });

    tracker = {};

    io.sockets.on('connection', function (socket) {

        tracker[socket.id] = {

            socket: socket,
            user: ''
        };

        console.log('Incoming socket connection: ' + socket.id);

        socket.emit('connected', socket.id);

        socket.on('requestControl', function () {

            console.log('Control request from: ' + socket.id);

            for (var key in tracker) {

                tracker[key].socket.emit(
                    'controlGranted',
                    socket.id);
            }
        });

        socket.on('cameraChanged', function (data) {

            console.log('cameraChanged (' + socket.id + '): ' + data.camera);

            for (var key in tracker) {

                if(key !== socket.id) {

                    tracker[key].socket.emit(
                        'cameraChanged',
                        data);
                }
            }
        });

        socket.on('sendMessage', function (data) {

            for (var key in tracker) {

                tracker[key].socket.emit(
                    'chatMessage',
                    data);
            }
        });

        socket.on('disconnect', function () {
            console.log('Socket disconnection: ' + socket.id);
            delete tracker[socket.id];
        });
    });
}

module.exports = router;