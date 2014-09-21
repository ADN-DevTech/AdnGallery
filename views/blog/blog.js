'use strict';

angular.module('AdnGallery.blog', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/blog', {
            templateUrl: 'views/blog/blog.html',
            controller: 'BlogController'
        });
    }])

    .controller('BlogController', function($scope, $http) {

        $scope.title = ' Most recent blog posts from the ADN team ...';

        $scope.recentPosts = [];

        function getRecentPosts() {

            // blogId of our Cloud & Mobile blog
            var blogId = "6a0167607c2431970b0168ebc3adf1970c";

            // REST request that grabs the 50 latest posts
            var url =
                "http://api.typepad.com/blogs/" + blogId +
                "/post-assets/@published/@recent.js";

            $http.get(url).success(function(response){

                var len = response.length;

                var json = response.substring(9, len-9);

                var data = JSON.parse(json);

                var entries = data["entries"];

                for(var i=0; i<entries.length; ++i) {

                    var entry = entries[i];

                    entry.title = $("<div/>").html(entry.title).text();

                    $scope.recentPosts.push(entry);
                }
            });
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        $('#navBarId').addClass("navbar-fixed-top");

        $('#menuViewId').css({"visibility": "collapse"});
        $('#menuUiId').css({"visibility": "collapse"});
        $('#menuSearchId').css({"visibility": "collapse"});

        getRecentPosts();
    });
