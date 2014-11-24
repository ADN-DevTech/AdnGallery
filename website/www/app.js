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
angular.module('AdnGallery',
    [
      'ngRoute',
      'AdnDirectives',
      'AdnGallery.viewer',
      'AdnGallery.gallery',
      'AdnGallery.blog',
      'AdnGallery.version',
      'AdnGallery.upload',
      'AdnGallery.showcase',
      'AdnGallery.quickLoad',
      'AdnGallery.extensions'
    ]).

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    controller('appController', function($scope, $location) {

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function initializeMenu() {

            $('#btnAboutId').unbind().click(
                function() {
                    $('#aboutDlg').modal('show');
                }
            );

            $('#btnLoadUrnId').unbind().click(
                function() {
                    $('#loadUrnDlg').modal('show');
                }
            );

            $('#btnQuickLoadId').unbind().click(
                function() {
                    $('#quickLoadDlg').modal('show');
                }
            );
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function initializeDialogs() {

            //Bootstrap Dialogs

            var dlgClr = 'rgba(209, 211, 212, 0.5)';
            var dlgClrHover = 'rgba(209, 211, 212, 1.0)';

            $scope.setHoverStyle('quickLoadDlgFrame',
                dlgClr,
                dlgClrHover);

            $scope.setHoverStyle('itemSelectDlgFrame',
                dlgClr,
                dlgClrHover);

            $scope.setHoverStyle('uploadDlgFrame',
                dlgClr,
                dlgClrHover);

            $scope.setHoverStyle('aboutDlgFrame',
                dlgClrHover,
                dlgClrHover);

            $scope.setHoverStyle('saveViewDlgFrame',
                dlgClr,
                dlgClrHover);

            $scope.setHoverStyle('loadUrnDlgFrame',
                dlgClr,
                dlgClrHover);

            $scope.setHoverStyle('itemSuppressDlgFrame',
                dlgClr,
                dlgClrHover);

            $scope.setHoverStyle('pwdDlgFrame',
                dlgClrHover,
                dlgClrHover);

            $scope.setHoverStyle('embedDlgFrame',
                dlgClr,
                dlgClrHover);

            $scope.setHoverStyle('loadExtDlgFrame',
                dlgClr,
                dlgClrHover);

            $scope.setHoverStyle('manageExtDlgFrame',
                dlgClr,
                dlgClrHover);
        }

        ///////////////////////////////////////////////////////////////////////
        // Utilities
        //
        ///////////////////////////////////////////////////////////////////////

        $scope.setHoverStyle = function(id, rgba, rgbaHover) {

            $('#' + id).css(
                'background-color',
                rgba);

            $('#' + id).hover(
                function () {
                    $('#' + id).css(
                        'background-color',
                        rgbaHover);
                },
                function () {
                    $('#' + id).css(
                        'background-color',
                        rgba);
                });
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function showItemSelectDlg(title, showSearch) {

            $scope.clearContent('itemSelectDlgBody');

            var visibility = 'collapse';

            if (showSearch) {
                visibility = (showSearch ? 'visible' : 'collapse');
            }

            $('#itemSelectDlgBodySearch').css(
                'visibility', visibility);

            $('#itemSelectDlgTitle').text(title);

            $('#itemSelectDlg').modal('show');
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function showItemSuppressDlg(
            title,
            onOk) {

            $scope.clearContent('itemSuppressDlgBody');

            $('#itemSuppressDlgTitle').text(title);

            $('#itemSuppressDlg').modal('show');

            $('#itemSuppressOk').unbind().click(onOk);
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function onItemSuppressClicked() {

            if (!("suppressed" in this)) {
                this.suppressed = true;
            }
            else {
                this.suppressed = !this.suppressed;
            }

            if (this.suppressed) {
                $scope.setHoverStyle(this.id,
                    'rgba(240, 22, 47, 0.5)',
                    'rgba(240, 22, 47, 0.8)');
            }
            else {
                $scope.setHoverStyle(this.id,
                    'rgba(136, 180, 221, 0.5)',
                    'rgba(136, 180, 221, 1.0)');
            }
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        $scope.clearContent = function(containerId) {

            var id = containerId + 'Content';

            var content = document.getElementById(id);

            if (content) {
                content.parentNode.removeChild(content);
            }

            content = document.createElement("div");
            content.id = id;

            var parent = document.getElementById(containerId);

            parent.appendChild(content);
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        $scope.newGUID = function() {

            var d = new Date().getTime();

            var uuid = 'xxxx-xxxx-xxxx-xxxx-xxxx'.replace(
                /[xy]/g,
                function (c) {
                    var r = (d + Math.random() * 16) % 16 | 0;
                    d = Math.floor(d / 16);
                    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
                });

            return uuid;
        };

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function initializeEvents() {

            var onModelSelected = $scope.$on('emit-modelSelected',
                function(event, data) {
                    $scope.$broadcast(
                        'broadcast-modelSelected',
                        data);
                });

            var onExtensionModified = $scope.$on('emit-extension-status-modified',
                function(event, extension) {
                    $scope.$broadcast(
                        'broadcast-extension-status-modified',
                        extension);
                });

            $scope.$on('$destroy', function() {
                onModelSelected();
                onExtensionModified();
            });
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        initializeDialogs();

        initializeEvents();

        initializeMenu();
    }).

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    run(function($rootScope) {

        var url =  "http://" +
            window.location.host +
            '/node/gallery/api/token';

        $rootScope.viewDataClient =
            new Autodesk.ADN.Toolkit.ViewData.AdnViewDataClient(
                'https://developer.api.autodesk.com',
                url);

        $rootScope.currentDbModel = null;

        $rootScope.getCurrentDbModel = function() {
            return $rootScope.currentDbModel;
        }

        $rootScope.setCurrentDbModel = function(model) {
            $rootScope.currentDbModel = model;
        }

        $rootScope.adnViewerMng = null;

        $rootScope.getViewerManager = function() {
            return $rootScope.adnViewerMng;
        }

        $rootScope.setViewerManager = function(viewerMng) {
            $rootScope.adnViewerMng = viewerMng;
        }

        $rootScope.getClientSize = function() {

            var w = window,
                d = document,
                e = d.documentElement,
                g = d.getElementsByTagName('body')[0],
                sx = w.innerWidth || e.clientWidth || g.clientWidth,
                sy = w.innerHeight || e.clientHeight || g.clientHeight;

            return { x: sx, y: sy };
        }

        //@author SM@K<smali.kazmi@hotmail.com>
        //@description website: smak.pk
        var mobile = {

            getUserAgent: function() {
                return navigator.userAgent;
            },
            isAndroid: function() {
                return this.getUserAgent().match(/Android/i);
            },
            isBlackBerry: function() {
                return this.getUserAgent().match(/BlackBerry/i);
            },
            isIOS: function() {
                return this.getUserAgent().match(/iPhone|iPad|iPod/i);
            },
            isOpera: function() {
                return this.getUserAgent().match(/Opera Mini/i);
            },
            isWindows: function() {
                return this.isWindowsDesktop() || this.isWindowsMobile();
            },
            isWindowsMobile: function() {
                return this.getUserAgent().match(/IEMobile/i);
            },
            isWindowsDesktop: function() {
                return this.getUserAgent().match(/WPDesktop/i); ;
            },
            isAny: function() {

                var foundAny = false;

                var getAllMethods = Object.getOwnPropertyNames(mobile).filter(
                    function(property) {
                        return typeof mobile[property] == 'function';
                    });

                for (var index in getAllMethods) {

                    if (getAllMethods[index] === 'getUserAgent' ||
                        getAllMethods[index] === 'isAny' ||
                        getAllMethods[index] === 'isWindows') {
                        continue;
                    }
                    if (mobile[getAllMethods[index]]()) {
                        foundAny = true;
                        break;
                    }
                }

                return foundAny;
            }
        };

        $rootScope.mobile = mobile;

        $rootScope.collapsedMode = function () {

            var w = $(window).width();

            return (w < 480 ? true : false);
        }
    }).

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    config(['$routeProvider', '$locationProvider',

        function($routeProvider, $locationProvider) {

            $routeProvider.otherwise({redirectTo: '/gallery'});
    }]);




