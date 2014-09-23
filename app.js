'use strict';

///////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////
angular.module('AdnGallery',
    [
      'ngRoute',
      'AdnDirectives',
      'AdnGallery.viewer',
      'AdnGallery.gallery',
      'AdnGallery.blog',
      'AdnGallery.version',
      'AdnGallery.upload',
      'AdnGallery.showcase'
    ]).

    ///////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////
    controller('appController', function($scope, $location) {

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function initializeDialogs() {

            //Bootstrap Dialogs

            var dlgClr = 'rgba(209, 211, 212, 0.5)';
            var dlgClrHover = 'rgba(209, 211, 212, 1.0)';

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

            // menu buttons

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
        }

        ///////////////////////////////////////////////////////////////////////////
        // Utilities
        //
        ///////////////////////////////////////////////////////////////////////////

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

        function showItemSuppressDlg(
            title,
            onOk) {

            $scope.clearContent('itemSuppressDlgBody');

            $('#itemSuppressDlgTitle').text(title);

            $('#itemSuppressDlg').modal('show');

            $('#itemSuppressOk').unbind().click(onOk);
        }

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

        $scope.clearContent = function(containerId) {

            var content = document.getElementById(
                    containerId + 'Content');

            if (content) {
                content.parentNode.removeChild(content);
            }

            content = document.createElement("div");
            content.id = containerId + 'Content';

            var parent = document.getElementById(containerId);

            parent.appendChild(content);
        }

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

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        initializeDialogs();
    }).

    ///////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////
    run(function($rootScope) {

        $rootScope.viewDataClient =
            new Autodesk.ADN.Toolkit.ViewData.AdnViewDataClient(
                'https://developer.api.autodesk.com',
                'http://' + window.location.host + '/api/token');

        $rootScope.viewDataClient.getToken();

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
    }).

    ///////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////
    config(['$routeProvider', function($routeProvider) {

      $routeProvider.otherwise({redirectTo: '/gallery'});

    }]);


