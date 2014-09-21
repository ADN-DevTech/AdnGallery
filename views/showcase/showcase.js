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

    .controller('ShowcaseController', function($scope, $http) {

        var socket = io.connect(location.hostname);

        socket.on('connected', function (id) {

            console.log('Socket connected: ' + id);

            $scope.socketId = id;
        });

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function initializeViewer() {

            $scope.adnViewerMng =
                new Autodesk.ADN.Toolkit.Viewer.AdnViewerManager(
                    $scope.viewDataClient.getToken,
                    document.getElementById('ViewerDiv'));

            $scope.setViewerManager($scope.adnViewerMng);

            $scope.adnViewerMng.registerForGeometryLoaded(

                function (viewer) {

                });

            var urn = decodeURIComponent(
                Autodesk.Viewing.Private.getParameterByName("urn"));

            if (urn !== '') {

                $scope.adnViewerMng.loadDocument(
                    urn,
                    function (viewer) {
                        viewer.impl.setLightPreset(8);
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
        function onCameraChanged(event) {

            //console.log('onCameraChanged emit: ' + event);

            var data = {
                view: $scope.adnViewerMng.getCurrentView('current')
            };

            socket.emit('cameraChanged', data);
        }

        socket.on('cameraChanged', function (data) {

            //console.log('onCameraChanged received: ' + data.view);

            $scope.adnViewerMng.setView(data.view);
        });

        socket.on('controlGranted', function (id) {

            console.log('Control granted: ' + id);

            if(id === $scope.socketId) {

                $scope.adnViewerMng.getViewer().addEventListener(
                    Autodesk.Viewing.CAMERA_CHANGE_EVENT,
                    onCameraChanged);
            }
            else {

                $scope.adnViewerMng.getViewer().removeEventListener(
                    Autodesk.Viewing.CAMERA_CHANGE_EVENT,
                    onCameraChanged);
            }
        });

        socket.on('chatMessage', function (data) {

            var history = $('#chatHistoryId');

            var text = '\n> from ' + $scope.socketId + ':\n' + data.message;

            history.val(history.val() + text);
        });

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
        function initializeMenu() {

            $('#menuSearchId').css({"visibility": "collapse"});
            $('#menuViewId').css({"visibility": "collapse"});
            $('#menuUiId').css({"visibility": "collapse"});

            $('#btnControlId').unbind().click(
                function() {

                    socket.emit('requestControl', null);
                }
            );

            $('#btnSendMessageId').unbind().click(
                function() {

                    var message = $('#chatMessageId').val();

                    if (message.length === 0) {
                        return;
                    }

                    var data = {
                        message: message
                    };

                    socket.emit('sendMessage', data);

                    $('#chatMessageId').val('');
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

        $('#navBarId').removeClass("navbar-fixed-top");

        initializeLayout();

        initializeViewer();

        initializeMenu();
    });