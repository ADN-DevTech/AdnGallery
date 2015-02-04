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

angular.module('AdnGallery.dynamic', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/dynamic', {
            templateUrl: 'views/dynamic/dynamic.html',
            controller: 'DynamicController'
        });
    }])

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    .controller('DynamicController', function($scope, $http, $location) {

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function fitLayoutToWindow() {

            var size = getClientSize();

            $('#layout-container').css(
                'height',
                size.y.toString() - 2 -
                $('#navBarId').height());
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function initializeViewer() {

            $scope.extensions = [];

            $scope.adnViewerMng =
                new Autodesk.ADN.Toolkit.Viewer.AdnViewerManager(
                    'http://' + window.location.host + '/node/gallery/api/token',
                    document.getElementById('viewer-dynamic'));

            $scope.setViewerManager($scope.adnViewerMng);

            var id =
                Autodesk.Viewing.Private.getParameterByName("id");


            if(id !== '') {
                loadFromId(id);
            }
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function loadFromId(id) {

            var url =  "http://" +
                window.location.host +
                '/node/gallery/api/model/' + id;

            $http.get(url).success(function(response){

                loadFromUrn(response.model.urn);
            });
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

                        var lightPreset = 8;

                        if($scope.mobile.isAny()) {

                            lightPreset = 0;
                            viewer.setQualityLevel(false, false);
                        }

                        viewer.impl.setLightPreset(lightPreset);

                        viewer.loadExtension('Autodesk.ADN.Viewing.Extension.API');

                        viewer.addEventListener(
                            Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
                            function (event) {

                                // fusion files need setting preset again
                                viewer.impl.setLightPreset(lightPreset);

                            });
                    },
                    function(error) {
                        console.log("Error loading document: " + error);
                    });
            };
        }

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
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function initializeEvents() {

            $scope.$on('broadcast-modelSelected', function(event, data) {

                loadFromUrn(data.urn);
            });

            window.onresize = fitLayoutToWindow;
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function getClientSize() {

            var w = window,
                d = document,
                e = d.documentElement,
                g = d.getElementsByTagName('body')[0],
                sx = w.innerWidth || e.clientWidth || g.clientWidth,
                sy = w.innerHeight || e.clientHeight || g.clientHeight;

            return {x: sx, y: sy};
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function initializeEditor() {

            $scope.editor = ace.edit("editor");
            $scope.editor.setTheme("ace/theme/chrome");
            $scope.editor.getSession().setMode("ace/mode/javascript");

            onResetEditor();
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function onResetEditor () {

            var defaultCode =

            '///////////////////////////////////////////////////////////////////////\n' +
            '// Basic viewer extension\n' +
            '//\n' +
            '///////////////////////////////////////////////////////////////////////\n' +
            'AutodeskNamespace("Autodesk.ADN.Viewing.Extension");\n' +
            '\n' +
            '\n' +
            'Autodesk.ADN.Viewing.Extension.Basic = function (viewer, options) {\n' +
            '\n' +
            '   Autodesk.Viewing.Extension.call(this, viewer, options);\n' +
            '\n' +
            '   var _self = this;\n' +
            '\n' +
            '   _self.load = function () {\n' +
            '\n' +
            '       alert("Autodesk.ADN.Viewing.Extension.Basic loaded");\n' +
            '       return true;\n' +
            '   };\n' +
            '\n' +
            '   _self.unload = function () {\n' +
            '\n' +
            '       console.log("Autodesk.ADN.Viewing.Extension.Basic unloaded");\n' +
            '\n' +
            '       Autodesk.Viewing.theExtensionManager.unregisterExtension(\n' +
            '           "Autodesk.ADN.Viewing.Extension.Basic");\n' +
            '\n' +
            '       return true;\n' +
            '   };\n' +
            '};\n' +
            '\n' +
            'Autodesk.ADN.Viewing.Extension.Basic.prototype =\n' +
            '   Object.create(Autodesk.Viewing.Extension.prototype);\n' +
            '\n' +
            'Autodesk.ADN.Viewing.Extension.Basic.prototype.constructor =\n' +
            '   Autodesk.ADN.Viewing.Extension.Basic;\n' +
            '\n' +
            'Autodesk.Viewing.theExtensionManager.registerExtension(\n' +
            '   "Autodesk.ADN.Viewing.Extension.Basic",\n' +
            '   Autodesk.ADN.Viewing.Extension.Basic);';


            $scope.editor.setValue(defaultCode, 1);
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
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

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function loadExtensions(extIds) {

            if($scope.viewer) {

                extIds.forEach(function(extId) {

                    $scope.viewer.loadExtension(extId);

                    $scope.extensions.push(extId);
                });

            }
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function unloadExtensions() {

            $scope.extensions.forEach(function(extId) {
                $scope.viewer.unloadExtension(extId);
            });
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function initializeLayout () {

            var pstyle = 'border: 1px solid #dfdfdf;';

            var layout = $scope.newGUID();

            $('#layout-container').w2layout({
                name: layout,
                padding: 4,
                panels: [
                    {type: 'main', content: $('#viewer-dynamic')},
                    //{ type: 'top', size: 30, resizable: false, style: pstyle, content: '' },
                    {type: 'bottom', size: 30, resizable: false, style: pstyle, content: ''},
                    {
                        type: 'right', size: '45%', resizable: true, style: pstyle, content: $('#editor'),

                        toolbar: {
                            items: [
                                {
                                    type: 'button',
                                    id: 'bLoad',
                                    caption: 'Load',
                                    icon: 'w2ui-icon-plus',
                                    hint: 'Load'
                                },
                                {type: 'break', id: 'break0'},
                                {
                                    type: 'button',
                                    id: 'bUnload',
                                    caption: 'Unload',
                                    icon: 'w2ui-icon-cross',
                                    hint: 'Unload'
                                },
                                {type: 'break', id: 'break1'},
                                {
                                    type: 'button',
                                    id: 'bReset',
                                    caption: 'Reset',
                                    icon: 'w2ui-icon-reload',
                                    hint: 'Reset'
                                }
                            ],
                            onClick: function (event) {

                                switch (event.target) {

                                    case 'bLoad':

                                        var code = $scope.editor.getValue();

                                        var extensions = findExtensions(code);

                                        var res = eval(code);

                                        console.log(res);

                                        loadExtensions(extensions);

                                        break;

                                    case 'bUnload':

                                        unloadExtensions();
                                        break;

                                    case 'bReset':
                                        onResetEditor();
                                        break;
                                }
                            }
                        }
                    }
                ]
            });

            w2ui[layout].on('resize', function (event) {

                event.onComplete = function () {

                    if ($scope.viewer)
                        $scope.viewer.resize();
                }
            });
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        fitLayoutToWindow();
        initializeLayout();
        initializeViewer();
        initializeEvents();
        initializeEditor();
        initializeMenu();
    });



