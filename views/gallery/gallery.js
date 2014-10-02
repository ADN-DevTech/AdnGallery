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

///////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////
angular.module('AdnGallery.gallery', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/gallery', {
        templateUrl: 'views/gallery/gallery.html',
        controller: 'GalleryController'
      });
    }]).

    ///////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////
    controller('GalleryController', function($scope, $http, $location) {

        $scope.models = [];

        var filterFunc = null;

        $scope.galleryFilterValue = null;

        $scope.searchFilter = function (model) {

            var re = new RegExp($scope.galleryFilterValue, 'i');

            return !filterFunc ||
                !$scope.galleryFilterValue ||
                re.test(filterFunc(model));
        };

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function loadModels() {

            var url =  "http://" + window.location.host + '/api/models';

            $http.get(url).success(function(models){

                $scope.models = models;

                for(var i=0; i<models.length; ++i){

                    getModelInfo(models[i]);
                }
            });
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function getModelInfo(model) {

            // Thumbnail
            var fileId = $scope.viewDataClient.fromBase64(model.urn);

            // role
            $scope.viewDataClient.getSubItemsWithProperties(
                fileId,
                { type: 'geometry'},
                function (items){
                    if(items.length > 0) {
                        model.type = items[0].role;
                    }
                });

            $scope.viewDataClient.getThumbnailAsync(
                fileId,
                function (data) {
                    model.src = "data:image/png;base64," + data;
                },
                function(error) {
                    model.src = "public/images/adsk.64x64.png"
                });

            $scope.viewDataClient.getViewableAsync(
                fileId,
                function (viewable) {

                    model.progress = viewable.progress;
                },
                function (error) {

                }, 'status');
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function initializeFilter() {

            function setFilterName(name) {
                $('#btnFilterId').html(name +
                    '&nbsp; <span class="caret"></span>');
            }

            $('#filterAuthorId').unbind().click(
                function() {
                    setFilterName('By author');
                    filterFunc = function(model){
                        if(typeof model.author !== 'undefined'){
                            return model.author.name;
                        }
                        else return '';
                    }
                }
            );

            $('#filterEmailId').unbind().click(
                function() {
                    setFilterName('By email');
                    filterFunc = function(model){
                        if(typeof model.author !== 'undefined'){
                            return model.author.email;
                        }
                        else return '';
                    }
                }
            );

            $('#filterModelId').unbind().click(
                function() {
                    setFilterName('By model name');
                    filterFunc = function(model){
                        return model.name;
                    }
                }
            );

            $('#filterUrnId').unbind().click(
                function() {
                    setFilterName('By model urn');
                    filterFunc = function(model){
                        return model.urn;
                    }
                }
            );

            $('#filterDisableId').unbind().click(
                function() {
                    setFilterName('Filter by');
                    filterFunc = null;
                }
            );
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function initializeMenu() {

            $('#menuSearchId').css({"visibility": "collapse"});
            $('#menuViewId').css({"visibility": "collapse"});
            $('#menuUiId').css({"visibility": "collapse"});
            $('#navBarId').addClass("navbar-fixed-top");

            $('#btnLoadUrnOkId').unbind().click(
                function() {
                    var urn = $('#urn').val();
                    $location.path('/viewer').search({urn: urn});
                }
            );
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function initializeEvents() {

            $scope.$on('broadcast-modelSelected', function(event, data) {

                $location.path('/viewer').search({id: data.id});
            });
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        initializeEvents();

        initializeFilter();

        initializeMenu();

        loadModels();
    });