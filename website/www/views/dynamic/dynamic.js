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

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function initializeMenu() {

            $('#navBarId').removeClass("navbar-fixed-top");

        }

        function getClientSize() {

            var w = window,
                d = document,
                e = d.documentElement,
                g = d.getElementsByTagName('body')[0],
                sx = w.innerWidth || e.clientWidth || g.clientWidth,
                sy = w.innerHeight || e.clientHeight || g.clientHeight;

            return {x: sx, y: sy};
        }

        function fitLayoutToWindow() {

            var size = getClientSize();

            $('#layout-container').css(
                'height',
                size.y.toString() - 2 -
                $('#navBarId').height());
        }

        function initEditor(){

            var editor = ace.edit("editor");
            editor.setTheme("ace/theme/chrome");
            editor.getSession().setMode("ace/mode/javascript");

        }

        fitLayoutToWindow();

        var pstyle = 'border: 1px solid #dfdfdf;';

        $('#layout-container').w2layout({
            name: 'layout',
            padding: 4,
            panels: [
                { type: 'main', content: '<div id="viewerDiv"></div>'},
                //{ type: 'top', size: 30, resizable: false, style: pstyle, content: '' },
                { type: 'bottom', size: 30, resizable: false, style: pstyle, content: '' },
                { type: 'right', size: '45%', resizable: true, style: pstyle, content: $('#editor'),

                    toolbar: {
                        items: [
                            {
                                type: 'button',
                                id: 'bLoad',
                                caption: 'Load',
                                icon: 'w2ui-icon-check',
                                hint: 'Load'
                            },
                            {type: 'break', id: 'break0'},
                            {
                                type: 'button',
                                id: 'bUnload',
                                caption: 'Unload',
                                icon: 'w2ui-icon-check',
                                hint: 'Unload'
                            },
                            {type: 'break', id: 'break1'},
                            {
                                type: 'button',
                                id: 'bReset',
                                caption: 'Reset',
                                icon: 'w2ui-icon-check',
                                hint: 'Reset'
                            }

                        ],
                        onClick: function (event) {
                            //this.owner.content('main', event);
                        }
                    }
                }
            ]
        });

        $('#editor').html($('#default').html());

        var urn = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YWRuLTE3LjA3LjIwMTQtMTAuNTYuMTYvRW5naW5lLmR3Zg==';

        var adnViewerMng = new Autodesk.ADN.Toolkit.Viewer.AdnViewerManager(
            'http://' + window.location.host + '/node/gallery/api/token',
            document.getElementById('viewerDiv'));

        var paramUrn = Autodesk.Viewing.Private.getParameterByName('urn');

        urn = (paramUrn !== '' ? paramUrn : urn);

        adnViewerMng.loadDocument(urn,

            function(viewer){

                w2ui.layout.on('resize', function(event) {

                    event.onComplete = function () {

                        viewer.resize();
                    }

                });

            });

        window.onresize = fitLayoutToWindow;


        initializeMenu();
        initEditor();

    });
