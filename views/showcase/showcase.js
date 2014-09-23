'use strict';

///////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////
angular.module('AdnGallery.showcase', ['ngRoute'])

    ///////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/showcase', {
            templateUrl: 'views/showcase/showcase.html',
            controller: 'ShowcaseController'
        });
    }])

    ///////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////
    .controller('ShowcaseController', function($scope, $http) {

        $scope.showcaseActive = false;

        $scope.userArray = [];

        $scope.users = {};

        $scope.currentUser = {
            name:'',
            socketId: '',
            hasControl: false,
            urn: ''
        };

        var socket = io.connect(location.hostname);

        socket.on('connected', function (data) {

            console.log('Socket connected: ' + data.socketId);

            $scope.currentUser.socketId = data.socketId;

            $scope.currentUser.urn = data.currentShowcase.urn;

            for(var i = 0; i < data.users.length; ++i)
                $scope.users[data.users[i].socketId] = data.users[i];

            updateUserArray();
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function updateUserArray() {

            $scope.userArray = [];

            for (var key in $scope.users) {

                $scope.userArray.push($scope.users[key]);
            }
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function joinShowcase() {

            var name = $('#showcaseUsernameId').val();

            if(name.length > 0) {

                $scope.showcaseActive = true;

                $scope.currentUser = {
                    name: name,
                    hasControl: false,
                    urn: $scope.currentUser.urn,
                    socketId: $scope.currentUser.socketId
                };

                socket.emit('addUser', $scope.currentUser);

                if($scope.currentUser.urn !== '')
                    loadFromUrn($scope.currentUser.urn);
            }
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function quitShowcase() {

            $('#showcaseUsernameId').val('');

            $scope.showcaseActive = false;

            socket.emit('removeUser', $scope.currentUser);

            $scope.adnViewerMng.closeDocument();
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function sendMessage(message) {

            var msg = {
                user: $scope.currentUser,
                text: message
            };

            socket.emit('sendMessage', msg);
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function requestControl() {

            socket.emit('requestControl', $scope.currentUser);
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function setControl(user) {

            $scope.userArray = [];

            for (var key in $scope.users) {

                $scope.users[key].hasControl = (key === user.socketId);

                $scope.userArray.push($scope.users[key]);
            }

            $scope.currentUser = $scope.users[$scope.currentUser.socketId];

            if($scope.adnViewerMng.getViewer()) {

                setupEvents();
            }
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function setupEvents() {

            if($scope.currentUser.hasControl) {

                $scope.adnViewerMng.getViewer().addEventListener(
                    Autodesk.Viewing.CAMERA_CHANGE_EVENT,
                    onCameraChanged);

                // enable mouse on viewer div
                $('#' + $scope.adnViewerMng.getViewerDivId()).css(
                    'pointer-events', 'auto');
            }
            else {

                $scope.adnViewerMng.getViewer().removeEventListener(
                    Autodesk.Viewing.CAMERA_CHANGE_EVENT,
                    onCameraChanged);

                // disable mouse on viewer div
                $('#' + $scope.adnViewerMng.getViewerDivId()).css(
                    'pointer-events', 'none');
            }
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function initializeViewer() {

            $scope.adnViewerMng =
                new Autodesk.ADN.Toolkit.Viewer.AdnViewerManager(
                    $scope.viewDataClient.getToken,
                    document.getElementById('ViewerDiv'));

            $scope.setViewerManager($scope.adnViewerMng);

            $scope.adnViewerMng.registerForGeometryLoaded(

                function (viewer) {

                    setupEvents();
                });

            var urn = decodeURIComponent(
                Autodesk.Viewing.Private.getParameterByName("urn"));

            loadFromUrn(urn);
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function loadFromUrn(urn) {

            if (urn !== '') {

                $scope.adnViewerMng.loadDocument(
                    urn,
                    function (viewer) {

                        $scope.viewer = viewer;

                        viewer.impl.setLightPreset(8);

                        if($scope.currentUser.hasControl) {
                            socket.emit('loadDocument', urn);
                        }
                    },
                    function(error) {
                        console.log("Error loading document: " + error);
                    });

                getModelByUrn(urn);
            };
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function getModelByUrn(urn) {

            var url =  "http://" +
                window.location.host +
                '/api/search/models?field=urn&value=' + urn;

            $scope.setCurrentDbModel(null);

            $http.get(url).success(function(models){

                if(models.length > 0) {

                    $scope.setCurrentDbModel(models[0]);
                }
            });
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function onCameraChanged(event) {

            //console.log('onCameraChanged emit: ' + event);

            var data = {
                view: $scope.adnViewerMng.getCurrentView('current')
            };

            socket.emit('cameraChanged', data);
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        socket.on('cameraChanged', function (data) {

            //console.log('onCameraChanged received: ' + data.view);

            $scope.adnViewerMng.setView(data.view);
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        socket.on('controlGranted', function (user) {

            setControl(user);
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        socket.on('chatMessage', function (msg) {

            /*var history = $('#chatHistoryId');

            history.val(history.val() + msg.text);

            // scroll to bottom
            $('#chatHistoryId').scrollTop(
                $('#chatHistoryId')[0].scrollHeight);*/

            var history = $scope.chatHistory.getValue();

            $scope.chatHistory.setValue(history + msg.text, true);
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        socket.on('addUser', function (user) {

            $scope.users[user.socketId] = user;

            updateUserArray();
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        socket.on('removeUser', function (user) {

            delete $scope.users[user.socketId];

            updateUserArray();
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        socket.on('loadDocument', function (urn) {

            $scope.currentUser.urn = urn;

            if($scope.showcaseActive)
                loadFromUrn(urn);
        });

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function initializeMenu() {

            $('#navBarId').removeClass("navbar-fixed-top");

            $('#menuSearchId').css({"visibility": "collapse"});
            $('#menuViewId').css({"visibility": "collapse"});
            $('#menuUiId').css({"visibility": "collapse"});

            $('#btnJoinShowcaseId').unbind().click(
                function() {
                    joinShowcase();
                }
            );

            $('#btnRequestControlId').unbind().click(
                function() {
                    requestControl();
                }
            );

            $('#btnQuitShowcaseId').unbind().click(
                function() {
                    quitShowcase();
                }
            );

            $('#chatMessageId').on('keydown', function (e) {

                    var code = (e.keyCode ? e.keyCode : e.which);

                    // Enter key
                    if(code == 13) {

                        var message = $('#chatMessageId').val();

                        var breaks = (message.match(/\n/g)||[]).length;

                        if(breaks !== message.length) {

                            if (message.length > 0) {

                                sendMessage(message);
                            }
                        }

                        $('#chatMessageId').val('');
                        $('#chatMessageId').scrollTop(0);
                    }
                }
            );

            $('#chatMessageId').on('keyup', function (e) {

                var code = (e.keyCode ? e.keyCode : e.which);

                // Enter key
                if(code == 13) {

                    $('#chatMessageId').val('');
                    $('#chatMessageId').scrollTop(0);
                }
            });

            $('#btnLoadUrnOkId').unbind().click(
                function() {

                    if($scope.currentUser.hasControl ) {
                        var urn = $('#urn').val();
                        loadFromUrn(urn);
                    }
                }
            );
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function initializeLayout() {

            window.onresize = fitLayoutToWindow;

            fitLayoutToWindow();

            var mainLayout = $('#mainLayoutId').layout({

                applyDefaultStyles: false,

                west__size: 300,

                center__onresize: function () {
                    $scope.viewer.resize();
                },

                west__onresize: function () {
                    $scope.viewer.resize();
                }
            });

            var westLayout = $('#layoutWestId').layout({

                applyDefaultStyles: false,

                south__size: 300,

                south__onresize: function () {
                    $scope.propertyGrid.resizeCanvas();
                }
            });
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function fitLayoutToWindow() {

            var size = $scope.getClientSize();

            $('#mainLayoutId').css(
                'height',
                size.y.toString() - 2 -
                $('#navBarId').height());
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function initializeChatWindow() {

            $scope.chatHistory = new wysihtml5.Editor(
                "chatHistoryId", {
                    parserRules:  wysihtml5ParserRules
                });

            function onLoad() {

                this.composer.element.setAttribute(
                    'contenteditable',
                    false);
            }

            $scope.chatHistory.on('load', onLoad);
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////

        initializeChatWindow();

        initializeLayout();

        initializeViewer();

        initializeMenu();
    });