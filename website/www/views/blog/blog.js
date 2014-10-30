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

angular.module('AdnGallery.blog', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/blog', {
            templateUrl: 'views/blog/blog.html',
            controller: 'BlogController'
        });
    }])

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    .controller('BlogController', function($scope, $http, $location) {

        $scope.title = ' Most recent blog posts from the ADN team ...';

        $scope.displayedPosts = [];

        $scope.bloggers = {};

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function getRecentPosts() {

            // blogId of our Cloud & Mobile blog
            var blogId = "6a0167607c2431970b0168ebc3adf1970c";

            // REST request that grabs the 50 latest posts
            var url =
                "http://api.typepad.com/blogs/" + blogId +
                "/post-assets/@published/@recent.js";

            var author =
                Autodesk.Viewing.Private.getParameterByName("author");

            $http.get(url).success(function(response){

                var len = response.length;

                var json = response.substring(9, len-9);

                var data = JSON.parse(json);

                var entries = data["entries"];

                for(var i=0; i<entries.length; ++i) {

                    var entry = entries[i];

                    entry.title = $("<div/>").html(entry.title).text();

                    $scope.displayedPosts.push(entry);

                    if($scope.bloggers[entry.author.displayName] == null) {

                        $scope.bloggers[entry.author.displayName] = {

                            author: entry.author,
                            posts: []
                        };
                    }

                    $scope.bloggers[entry.author.displayName].posts.push(entry);
                }
            });
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function initializeMenu() {

            $('#navBarId').addClass("navbar-fixed-top");

            $('#menuExtensionsId').css({"visibility": "collapse"});
            $('#menuSearchId').css({"visibility": "collapse"});
            $('#menuViewId').css({"visibility": "collapse"});
            $('#menuDocId').css({"visibility": "visible"});
            $('#menuUiId').css({"visibility": "collapse"});
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
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

        initializeMenu();

        getRecentPosts();
    });
