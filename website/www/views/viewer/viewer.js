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
angular.module('AdnGallery.viewer',
    [
     'ngRoute',
     'AdnGallery.views'
    ])

    ///////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////
    .config(['$routeProvider', '$locationProvider',

        function($routeProvider, $locationProvider) {

            $routeProvider.when('/viewer', {
                templateUrl: 'views/viewer/viewer.html',
                controller: 'ViewerController'
          });
    }])

    .controller('ViewerController', function($scope, $http, $location) {

        $scope.propertyGrid = null;

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function initializeViewer() {

            $scope.adnViewerMng =
                new Autodesk.ADN.Toolkit.Viewer.AdnViewerManager(
                    'http://' + window.location.host + '/node/gallery/api/token',
                    document.getElementById('ViewerDiv'));

            $scope.setViewerManager($scope.adnViewerMng);

            var id =
                Autodesk.Viewing.Private.getParameterByName("id");

            var urn = decodeURIComponent(
                Autodesk.Viewing.Private.getParameterByName("urn"));

            if(id !== '') {
                loadFromId(id);
            }

            else if (urn !== '') {
                loadFromUrn(urn);
            }
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function loadFromUrn(urn) {

            $scope.adnViewerMng.loadDocument(
                urn,
                function (viewer) {

                    getModelByUrn(urn);

                    $scope.viewer = viewer;

                    $scope.viewer.onResize = null;

                    viewer.loadExtension('Autodesk.ADN.Viewing.Extension.API');

                    var lightPreset = 8;

                    if($scope.mobile.isAny()) {

                        lightPreset = 0;
                        viewer.setQualityLevel(false, false);
                    }

                    viewer.impl.setLightPreset(lightPreset);

                    viewer.addEventListener(

                        Autodesk.Viewing.GEOMETRY_LOADED_EVENT,

                        function (event) {

                            // fusion files need setting preset again
                            viewer.impl.setLightPreset(lightPreset);

                            initializeTree(viewer);

                            viewer.addEventListener(
                                Autodesk.Viewing.SELECTION_CHANGED_EVENT,
                                onItemSelected);

                            loadUserExtensions();
                        });
                },
                function(error) {

                    console.log("Error loading document: " + error);
                });
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
        function getModelByUrn(urn) {

            var url =  "http://" +
                window.location.host +
                '/node/gallery/api/models?field=urn&value=' + urn;

            $scope.setCurrentDbModel(null);

            $http.get(url).success(function(response){

                if(response.models.length > 0) {

                    $scope.setCurrentDbModel(
                        response.models[0]);

                    addToolbar();
                }
            });
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function addToolbar() {

            var model = $scope.getCurrentDbModel();

            var div = document.createElement("div");

            var parent = document.getElementById(
                $scope.viewer.clientContainer.id);

            parent.appendChild(div);

            div.style.bottom = "0%";
            div.style.right = "20%";
            div.style.zIndex = "2";
            div.style.position = "absolute";

            var toolbar = new Autodesk.Viewing.UI.ToolBar(div);

            var subToolbar = toolbar.addSubToolbar('sub1', false);

            var bEmbed = Autodesk.Viewing.UI.ToolBar.createMenuButton(
                "bEmbed",
                "Get embed code",
                function (e) {

                    $('#embedCode').text("<iframe \n" +
                        "width='800' height='480' frameborder='0' \n" +
                        "allowFullScreen webkitallowfullscreen mozallowfullscreen \n" +
                        "src='http://" + window.location.host + "/node/gallery/embed/" + model._id + "'> \n" +
                        "</iframe>");

                    $('#embedDlg').modal('show');
                });

            toolbar.addToSubToolbar("sub1", bEmbed);

            subToolbar.setToolImage(
                bEmbed.id,
                'public/images/embed.png');
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function onItemSelected(event) {

            var dbIdArray = event.dbIdArray;

            for (var i = 0; i < dbIdArray.length; i++) {

                var dbId = dbIdArray[i];

                $scope.viewer.getProperties(
                    dbId,
                    function (result) {

                        if (result.properties) {

                            var properties = result.properties;

                            //$.merge(properties, customProperties);

                            $scope.propertyGrid.setData(properties);
                            $scope.propertyGrid.render();
                        }
                    });
            }
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function initializeMenu() {

            $('#navBarId').removeClass("navbar-fixed-top");

            $('#menuExtensionsId').css({"visibility": "visible"});
            $('#menuSearchId').css({"visibility": "visible"});
            $('#menuViewId').css({"visibility": "visible"});
            $('#menuDocId').css({"visibility": "visible"});
            $('#menuUiId').css({"visibility": "visible"});

            $('#btnExplodeMotionId').unbind().click(
                function() {
                    if($scope.viewer)
                        $scope.viewer.startExplodeMotion(
                            0.2, 0.1, 1.5);
                }
            );

            $('#btnRotateMotionId').unbind().click(
                function() {
                    if($scope.viewer)
                        $scope.viewer.startRotateMotion(
                            0.3, {x:0, y:1, z:0});
                }
            );

            $('#btnStopMotionId').unbind().click(
                function() {
                    if($scope.viewer) {
                        $scope.viewer.stopExplodeMotion();
                        $scope.viewer.stopRotateMotion();
                    }
                }
            );

            $('#btnLoadUrnOkId').unbind().click(
                function() {
                    var urn = $('#urn').val();
                    $location.path('/viewer').search({urn: urn});
                }
            );

            $('#btnSearchId').unbind().click(
                function() {

                    var value = $('#searchInput').val();

                    if($scope.viewer && value !== '') {

                        $scope.viewer.search(value, function(ids){

                            $scope.viewer.isolateById(ids);
                        });
                    }
                }
            );
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function initializeLayout() {

            window.onresize = fitLayoutToWindow;

            fitLayoutToWindow();

            var mainLayout = $('#mainLayoutId').layout({

                applyDefaultStyles: false,

                west__initHidden:
                    !$('#cbBrowser').prop('checked'),

                west__size: 300,

                east__initHidden:
                    true,

                center__onresize: function () {
                    onResize();
                },

                west__onresize: function () {
                    onResize();
                },

                east__onresize: function () {
                    onResize();
                }
            });

            var westLayout = $('#westLayoutId').layout({

                applyDefaultStyles: false,

                south__size: 300,

                south__initHidden:
                    !$('#cbProperties').prop('checked'),

                south__onresize: function () {
                    $scope.propertyGrid.resizeCanvas();
                }
            });

            $('#cbProperties').change(
                function () {
                    if ($('#cbProperties').prop('checked')) {

                        westLayout.show('south');

                    }
                    else {
                        westLayout.hide('south');
                    }
                });

            $('#cbBrowser').change(
                function () {
                    if ($('#cbBrowser').prop('checked')) {

                        mainLayout.show('west');
                    }
                    else {
                        mainLayout.hide('west');
                    }
                });
        }

        function onResize(){

            if($scope.viewer) {
                $scope.viewer.resize();

                if($scope.viewer.onResize){
                    $scope.viewer.onResize();
                }
            }
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function initializeGrid() {

            var columns = [
                {
                    id: "propertyId",
                    name: "Property",
                    field: "displayName"
                },
                {
                    id: "valueId",
                    name: "Value",
                    field: "displayValue"
                }
            ];

            var options = {
                enableCellNavigation: true,
                enableColumnReorder: false,
                forceFitColumns: true
            };

            var data = [];

            $scope.propertyGrid = new Slick.Grid(
                "#GridDiv",
                data,
                columns,
                options);
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function initializeTree(viewer) {

            $('#jstree').jstree({

                'core': {
                    check_callback: true
                }
            });

            $('#jstree').on("ready.jstree",
                function (e, data) {

                    var treeRef = $('#jstree').jstree(true);

                    viewer.getObjectTree(function (rootComponent) {

                        var rootNode = createNode(
                            treeRef,
                            '#',
                            rootComponent);

                        buildTreeRec(treeRef, rootNode, rootComponent);

                        $('#jstree').jstree("open_node", rootNode);
                    });
                });

            $("#jstree").on('before.jstree',
                function (e, data) {
                    //console.log('b4');
                });

            $("#jstree").on('changed.jstree',
                function (e, data) {
                    //data.selected.length
                    //console.log(data.instance.get_node(data.selected[0]).text);
                });

            $("#jstree").on("select_node.jstree",
                function (event, data) {

                    var node = data.node;

                    console.log(node);

                    viewer.getProperties(
                        parseInt(node.id),
                        function(result) {

                            if (result.properties) {

                                $scope.propertyGrid.setData(result.properties);
                                $scope.propertyGrid.render();
                            }
                        });
                });

            $("#jstree").on("dblclick.jstree",
                function (event) {

                    var ids = $('#jstree').jstree('get_selected');

                    var selectedId = parseInt(ids[0]);

                    viewer.isolateById(selectedId);

                    viewer.fitToView(selectedId);
                });

            function createNode(tree, parentNode, component) {

                var icon = (component.children ?
                    'components/jsTree/images/parent.png' :
                    'components/jsTree/images/child.png');

                var nodeData = {
                    'text': component.name,
                    'id': component.dbId,
                    'icon': icon
                };

                var node = tree.create_node(
                    parentNode,
                    nodeData,
                    'last',
                    false,
                    false);

                return node;
            }

            function buildTreeRec(tree, parentNode, component) {

                if (component.children) {

                    var children = component.children;

                    for (var i = 0; i < children.length; i++) {

                        var childComponent = children[i];

                        var childNode = createNode(
                            tree,
                            parentNode,
                            childComponent);

                        if (childComponent.children) {

                            buildTreeRec(tree, childNode, childComponent);
                        }
                    }
                }
            }
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function fitLayoutToWindow() {

            var size = $scope.getClientSize();

            $('#mainLayoutId').css(
                'height',
                size.y.toString() - 2 -
                $('#navBarId').height());
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function initializeEvents() {

            $scope.$on('broadcast-modelSelected', function(event, data) {

                $location.path('/viewer').search({id: data.id});
            });

            $scope.$on('broadcast-extension-status-modified',
                function(event, extension) {

                    if(extension.enabled) {

                        jQuery.getScript('/node/gallery/uploads/extensions/' + extension.file)
                            .done(function () {

                                if ($scope.viewer) {

                                    $scope.viewer.loadExtension(
                                        extension.id);
                                }
                            })
                            .fail(function () {
                                console.log("Load failed: " + extension.file);
                            });
                    }
                    else {

                        if ($scope.viewer) {

                            $scope.viewer.unloadExtension(
                                extension.id);
                        }
                    }
            });
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function loadUserExtensions() {

            var url =  "http://" +
                window.location.host +
                '/node/gallery/api/extensions';

            $http.get(url).success(function(response){

                updateStorage(response.extensions);

                async.each(response.extensions,

                    function (extension, callback) {

                        if (isExtensionEnabled(extension)) {

                            jQuery.getScript('/node/gallery/uploads/extensions/' + extension.file)
                                .done(function () {

                                    $scope.viewer.loadExtension(
                                        extension.id);
                                })
                                .fail(function(jqxhr, settings, exception) {
                                    console.log("Load failed: " + extension.file);
                                });
                        }
                        else callback();
                    },
                    function (err) {

                        //All extensions loaded ...
                    });
            });
        }

        function updateStorage(extensions) {

            //window.localStorage.clear();

            if(!localStorage['extensions']) {

                localStorage['extensions'] = JSON.stringify({});
            }

            var storageObj = JSON.parse(localStorage['extensions']);

            extensions.forEach(function(extension) {

                if(!storageObj[extension._id]) {

                    storageObj[extension._id] = false;
                }
            });

            localStorage['extensions'] = JSON.stringify(storageObj);
        }

        function isExtensionEnabled(extension) {

            var storageObj = JSON.parse(localStorage['extensions']);

            return storageObj[extension._id];
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////

        initializeEvents();

        initializeLayout();

        initializeViewer();

        initializeMenu();

        initializeGrid();
    });