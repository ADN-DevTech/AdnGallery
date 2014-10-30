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
angular.module('AdnGallery.quickLoad',[]).

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    controller('quickLoadController', function($scope, $http) {

        var filterFunc = null;

        $scope.filterValue = null;

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        $scope.searchFilter = function (model) {

            var re = new RegExp($scope.filterValue, 'i');

            return !filterFunc ||
                !$scope.filterValue ||
                re.test(filterFunc(model));
        };

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function loadModels() {

            var url =  "http://" +
                window.location.host +
                '/node/gallery/api/models';

            $http.get(url).success(function(response){

                $scope.models = response.models;

                for(var i=0; i<$scope.models.length; ++i){

                    getModelInfo($scope.models[i]);
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
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function initializeFilter() {

            function setFilterName(name) {
                $('#quickLoad-btnFilterId').html(name +
                    '&nbsp; <span class="caret"></span>');
            }

            $('#quickLoad-filterAuthorId').unbind().click(
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

            $('#quickLoad-filterEmailId').unbind().click(
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

            $('#quickLoad-filterModelId').unbind().click(
                function() {
                    setFilterName('By model name');
                    filterFunc = function(model){
                        return model.name;
                    }
                }
            );

            $('#quickLoad-filterUrnId').unbind().click(
                function() {
                    setFilterName('By model urn');
                    filterFunc = function(model){
                        return model.urn;
                    }
                }
            );

            $('#quickLoad-filterDisableId').unbind().click(
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
        $scope.onModelSelected = function (id, urn) {

            $('#quickLoadDlg').modal('hide');

            $scope.data = {
                id: id,
                urn: urn
            };
        }

        $('#quickLoadDlg').on('hidden.bs.modal', function () {

            if($scope.data) {
                $scope.$emit('emit-modelSelected', $scope.data);
            }

            $scope.data = null;

            $scope.models = [];
        })

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        $('#quickLoadDlg').on('shown.bs.modal', function () {

            loadModels();
        })

        initializeFilter();
    });