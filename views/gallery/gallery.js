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
    controller('GalleryController', function($scope, $http) {

        $scope.models = [];

        var filterFunc = null;

        $scope.galleryFilterValue = null;

        $scope.gallerySearchFilter = function (model) {

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
        // performs view initializations
        //
        ///////////////////////////////////////////////////////////////////////

        $('#menuSearchId').css({"visibility": "collapse"});
        $('#menuViewId').css({"visibility": "collapse"});
        $('#menuUiId').css({"visibility": "collapse"});
        $('#navBarId').addClass("navbar-fixed-top");

        initializeFilter();

        loadModels();
    });