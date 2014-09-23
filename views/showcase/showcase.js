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

        var socket = io.connect(location.hostname);

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        $scope.showCloseDocMenu = function() {

            return $scope.showcaseActive &&
                   $scope.currentUser.hasControl &&
                   $scope.currentUser.showcaseData.urn !== '';
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        socket.on('connected', function (data) {

            //console.log('Socket connected: ' + data.socketId);

            initializeUser();

            $scope.currentUser.socketId = data.socketId;

            $scope.currentUser.showcaseData = data.showcaseData;

            for(var i = 0; i < data.users.length; ++i)
                $scope.users[data.users[i].socketId] = data.users[i];

            updateUserArray();
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function initializeUser() {

            if(typeof $scope.currentUser === 'undefined')

                $scope.currentUser = {
                    name:'',
                    socketId: '',
                    hasControl: false,
                    showcaseData: null
                };
        }

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

                initializeUser();

                $scope.showcaseActive = true;

                $scope.currentUser.name = name;

                socket.emit('addUser', $scope.currentUser);

                if($scope.currentUser.showcaseData)
                    loadFromUrn($scope.currentUser.showcaseData.urn);
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
        function requestControl(control) {

            // clone user
            var user = JSON.parse(JSON.stringify($scope.currentUser));

            user.hasControl = control;

            socket.emit('requestControl', user);
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function setControl(user) {

            $scope.users[user.socketId].hasControl = user.hasControl;

            var user = $scope.users[$scope.currentUser.socketId];

            if(typeof user !== 'undefined')
                $scope.currentUser = user;

            if($scope.adnViewerMng.getViewer()) {

                setupViewerEvents();
            }

            updateUserArray();
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function setupViewerEvents() {

            var viewer = $scope.adnViewerMng.getViewer();

            if($scope.currentUser.hasControl) {

                viewer.addEventListener(
                    Autodesk.Viewing.CAMERA_CHANGE_EVENT,
                    onCameraChanged);

                viewer.addEventListener(
                    Autodesk.Viewing.ISOLATE_EVENT,
                    onIsolate);

                // enable mouse on viewer div
                $('#' + $scope.adnViewerMng.getViewerDivId()).css(
                    'pointer-events', 'auto');
            }
            else {

                viewer.removeEventListener(
                    Autodesk.Viewing.CAMERA_CHANGE_EVENT,
                    onCameraChanged);

                viewer.removeEventListener(
                    Autodesk.Viewing.ISOLATE_EVENT,
                    onIsolate);

                // disable mouse on viewer div
                $('#' + $scope.adnViewerMng.getViewerDivId()).css(
                    'pointer-events', 'none');
            }
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function closeDocument() {

            socket.emit('closeDocument', $scope.currentUser);
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

                    var data = $scope.currentUser.showcaseData;

                    if(data) {

                        if(data.isolateIds)
                            viewer.isolateById(data.isolateIds);
                    }
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

                $scope.currentUser.showcaseData.urn = urn;

                $scope.adnViewerMng.loadDocument(
                    urn,
                    function (viewer) {

                        $scope.viewer = viewer;

                        viewer.impl.setLightPreset(8);

                        if($scope.currentUser.hasControl) {
                            socket.emit('loadDocument', urn);
                        }

                        setupViewerEvents();

                        var data = $scope.currentUser.showcaseData;

                        if(data) {

                            if(data.view)
                                $scope.adnViewerMng.setView(data.view);
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

            var data = {
                view: $scope.adnViewerMng.getCurrentView('current')
            };

            socket.emit('cameraChanged', data);
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function onIsolate(event) {

            var ids = [];

            for(var i=0; i<event.nodeIdArray.length; ++i) {

                ids.push(event.nodeIdArray[i].dbId);
            }

            var data = {
                isolateIds: ids
            };

            socket.emit('isolate', data);
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        socket.on('cameraChanged', function (data) {

            var viewer = $scope.adnViewerMng.getViewer();

            if(viewer) {

                $scope.adnViewerMng.setView(data.view);
            }
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        socket.on('isolate', function (data) {

            var viewer = $scope.adnViewerMng.getViewer();

            if(viewer) {
                console.log(data);
                viewer.isolateById(data.isolateIds)
            }
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        socket.on('controlEvent', function (user) {

            setControl(user);
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        socket.on('chatMessage', function (msg) {

            var history = $scope.chatHistory.getValue();

            $scope.chatHistory.setValue(history + msg.text, true);

            //console.log('height: ' + $scope.chatHistory.composer.element.scrollHeight);
            //console.log('top: ' + $scope.chatHistory.composer.element.scrollTop);

            $scope.chatHistory.composer.element.scrollTop =
                $scope.chatHistory.composer.element.scrollHeight;

            // scroll to bottom
            $('#chatHistoryId').scrollTop($scope.chatHistory.composer.element.scrollHeight);
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

            $scope.currentUser.showcaseData.urn = urn;

            if($scope.showcaseActive)
                loadFromUrn(urn);
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        socket.on('closeDocument', function () {

            $scope.currentUser.showcaseData.urn = '';

            $scope.adnViewerMng.closeDocument();
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
                    requestControl(true);
                }
            );

            $('#btnDropControlId').unbind().click(
                function() {
                    requestControl(false);
                }
            );

            $('#btnCloseShowcaseDocId').unbind().click(
                function() {
                    closeDocument();
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

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function initializeEvents() {

            $scope.$on('broadcast-modelSelected', function(event, urn) {

                if($scope.currentUser.hasControl ) {

                    loadFromUrn(urn);
                }
            });
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////

        initializeChatWindow();

        initializeEvents();

        initializeLayout();

        initializeViewer();

        initializeMenu();

        initializeUser();
    });