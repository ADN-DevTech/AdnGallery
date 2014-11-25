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
'use strict';

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
angular.module('AdnGallery.showcase', ['ngRoute', 'textAngular'])

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/showcase', {
            templateUrl: 'views/showcase/showcase.html',
            controller: 'ShowcaseController'
        });
    }])

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    .controller('ShowcaseController', function($scope, $http) {

        $scope.showcaseActive = false;

        $scope.showcaseData = null;

        $scope.userArray = [];

        $scope.users = {};

        $scope.socket = io.connect(location.hostname + ':5001');

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        $scope.showCloseDocMenu = function() {

            return $scope.showcaseActive &&
                   $scope.currentUser.hasControl &&
                   $scope.showcaseData !== null &&
                   $scope.showcaseData.urn !== '';
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function initializeUser() {

            if(typeof $scope.currentUser === 'undefined')

                $scope.currentUser = {
                    name:'',
                    socketId: '',
                    hasControl: false
                };

            $scope.currentUser.name = '';
            $scope.currentUser.hasControl = false;
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function updateUserArray() {

            $scope.userArray = [];

            for (var key in $scope.users) {

                $scope.userArray.push($scope.users[key]);
            }
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function joinShowcase() {

            var name = $('#showcaseUsernameId').val();

            if(name.length > 0) {

                initializeUser();

                $scope.currentUser.name = name;

                $scope.socket.emit('addUser', $scope.currentUser);

                $scope.socket.emit('requestData');
            }
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function quitShowcase() {

            $('#showcaseUsernameId').val('');

            $scope.showcaseActive = false;

            $scope.socket.emit('removeUser', $scope.currentUser);

            $scope.adnViewerMng.closeDocument();
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function sendMessage(message) {

            var msg = {
                user: $scope.currentUser,
                text: message
            };

            $scope.socket.emit('sendMessage', msg);
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function requestControl(control) {

            // clone user
            var user = JSON.parse(JSON.stringify($scope.currentUser));

            user.hasControl = control;

            $scope.socket.emit('requestControl', user);
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
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

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function setupViewerEvents() {

            var viewer = $scope.adnViewerMng.getViewer();

            if($scope.currentUser.hasControl) {

                viewer.addEventListener(
                    Autodesk.Viewing.CAMERA_CHANGE_EVENT,
                    onCameraChanged);

                viewer.addEventListener(
                    Autodesk.Viewing.ISOLATE_EVENT,
                    onIsolate);

                viewer.addEventListener(
                    Autodesk.Viewing.EXPLODE_CHANGE_EVENT,
                    onExplode);

                // enable mouse on viewer div
                $('#' + viewer.clientContainer.id).css(
                    'pointer-events', 'auto');
            }
            else {

                viewer.removeEventListener(
                    Autodesk.Viewing.CAMERA_CHANGE_EVENT,
                    onCameraChanged);

                viewer.removeEventListener(
                    Autodesk.Viewing.EXPLODE_CHANGE_EVENT,
                    onExplode);

                viewer.removeEventListener(
                    Autodesk.Viewing.ISOLATE_EVENT,
                    onIsolate);

                // disable mouse on viewer div
                $('#' + viewer.clientContainer.id).css(
                    'pointer-events', 'none');
            }
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function closeDocument() {

            $scope.socket.emit('closeDocument', $scope.currentUser);
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function initializeViewer() {

            $scope.adnViewerMng =
                new Autodesk.ADN.Toolkit.Viewer.AdnViewerManager(
                    'http://' + window.location.host + '/node/gallery/api/token',
                    document.getElementById('ViewerDiv'));

            $scope.setViewerManager($scope.adnViewerMng);
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function loadFromUrn(urn) {

            if (urn !== '') {

                $scope.showcaseData.urn = urn;

                $scope.adnViewerMng.loadDocument(
                    urn,
                    function (viewer) {

                        $scope.viewer = viewer;

                        var lightPreset = 8;

                        if($scope.mobile.isAny()) {

                            lightPreset = 0;
                            viewer.setQualityLevel(false, false);
                        }

                        viewer.impl.setLightPreset(lightPreset);

                        viewer.loadExtension('Autodesk.ADN.Viewing.Extension.API');

                        if($scope.currentUser.hasControl) {

                            $scope.socket.emit('loadDocument', urn);
                        }

                        setupViewerEvents();

                        var data = $scope.showcaseData;

                        if(data) {

                            if(data.view)
                                viewer.setView(data.view);
                        }

                        viewer.addEventListener(
                            Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
                            function (event) {

                                // fusion files need setting preset again
                                viewer.impl.setLightPreset(lightPreset);

                                if(data) {

                                    if(data.isolateIds)
                                        viewer.isolateById(data.isolateIds);
                                }
                            });
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
                '/node/gallery/api/models?field=urn&value=' + urn;

            $scope.setCurrentDbModel(null);

            $http.get(url).success(function(response){

                if(response.models.length > 0) {

                    $scope.setCurrentDbModel(
                        response.models[0]);
                }
            });
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function onCameraChanged(event) {

            var data = {
                view: $scope.viewer.getCurrentView('current')
            };

            $scope.socket.emit('cameraChanged', data);
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

            $scope.socket.emit('isolate', data);
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function onExplode() {

            var viewer = $scope.adnViewerMng.getViewer();

            var data = {
                explodeScale: viewer.getExplodeScale()
            };

            $scope.socket.emit('explode', data);
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        $scope.socket.on('showcaseData', function (data) {

            $scope.showcaseActive = true;

            $scope.currentUser.socketId = data.socketId;

            $scope.showcaseData = data.showcaseData;

            for(var i = 0; i < data.users.length; ++i)
                $scope.users[data.users[i].socketId] = data.users[i];

            updateUserArray();

            loadFromUrn($scope.showcaseData.urn);
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        $scope.socket.on('cameraChanged', function (data) {

            var viewer = $scope.adnViewerMng.getViewer();

            if(viewer) {

                viewer.setView(data.view);
            }
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        $scope.socket.on('isolate', function (data) {

            var viewer = $scope.adnViewerMng.getViewer();

            if(viewer) {
                viewer.isolateById(data.isolateIds)
            }
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        $scope.socket.on('explode', function (data) {

            var viewer = $scope.adnViewerMng.getViewer();

            if(viewer) {
                viewer.explode(data.explodeScale)
            }
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        $scope.socket.on('controlEvent', function (user) {

            setControl(user);
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        $scope.socket.on('chatMessage', function (msg) {

            $scope.htmlcontent += msg.text;

            // scroll to bottom
            var ed = $('#chatHistoryId');
            ed.scrollTop(ed.prop('scrollHeight'));
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        $scope.socket.on('addUser', function (user) {

            $scope.users[user.socketId] = user;

            updateUserArray();
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        $scope.socket.on('removeUser', function (user) {

            delete $scope.users[user.socketId];

            updateUserArray();
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        $scope.socket.on('loadDocument', function (urn) {

            $scope.showcaseData.urn = urn;

            if($scope.showcaseActive)
                loadFromUrn(urn);
        });

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        $scope.socket.on('closeDocument', function () {

            $scope.showcaseData.urn = '';

            $scope.adnViewerMng.closeDocument();
        });

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function initializeMenu() {

            $('#navBarId').removeClass("navbar-fixed-top");

            $('#menuExtensionsId').css({"visibility": "collapse"});
            $('#menuSearchId').css({"visibility": "collapse"});
            $('#menuViewId').css({"visibility": "collapse"});
            $('#menuDocId').css({"visibility": "visible"});
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
                    if($scope.adnViewerMng.getViewer())
                        $scope.viewer.resize();
                },

                west__onresize: function () {
                    if($scope.adnViewerMng.getViewer())
                        $scope.viewer.resize();
                }
            });

            var westLayout = $('#westLayoutId').layout({

                applyDefaultStyles: false,

                south__size: 300,

                south__onresize: function () {

                    var h = $('#southLayoutId').height();

                    $('#chatHistoryId').height(h * 0.8);
                    $('#chatMessageId').height(h * 0.2);
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

            $scope.disabled = true;

            $scope.htmlcontent = '';
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function initializeEvents() {

            $scope.$on('$viewContentLoaded', function () {


            });

            $scope.$on('broadcast-modelSelected', function(event, data) {

                if($scope.currentUser.hasControl ) {

                    loadFromUrn(data.urn);
                }
            });

            $scope.$on('$destroy', function () {

                if($scope.showcaseActive)

                    $scope.socket.emit('removeUser', $scope.currentUser);
            })
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