'use strict';

///////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////
angular.module('AdnGallery.quickLoad',[]).

    ///////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////
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

            var url =  "http://" + window.location.host + '/api/models';

            $http.get(url).success(function(models){

                $scope.models = models;

                for(var i=0; i<models.length; ++i){

                    var model = models[i];

                    model.encodedUrn =
                        encodeURIComponent(model.urn);

                    getModelInfo(model);
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
        $scope.onModelSelected = function (urn) {

            $('#quickLoadDlg').modal('hide');

            $scope.urn = urn;
        }

        $('#quickLoadDlg').on('hidden.bs.modal', function () {

            if($scope.urn !== '') {
                $scope.$emit('emit-modelSelected', $scope.urn);
            }

            $scope.urn = '';

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