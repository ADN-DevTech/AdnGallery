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
    .config(['$routeProvider', function($routeProvider) {
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
                    'http://' + window.location.host + '/api/token',
                    document.getElementById('ViewerDiv'));

            $scope.setViewerManager($scope.adnViewerMng);

            $scope.adnViewerMng.registerForGeometryLoaded(

                function (viewer) {

                    $scope.viewer = viewer;

                    initializeTree(viewer);

                    viewer.addEventListener(
                        Autodesk.Viewing.SELECTION_CHANGED_EVENT,
                        onItemSelected);

                    $scope.adnViewerMng.startAnnotate();
                });

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

                },
                function(error) {
                    console.log("Error loading document: " + error);
                });

            getModelByUrn(urn);
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function loadFromId(id) {

            var url =  "http://" +
                window.location.host +
                '/api/model/' + id;

            $http.get(url).success(function(model){

                loadFromUrn(model.urn);
            });
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function getModelByUrn(urn) {

            var url =  "http://" +
                window.location.host +
                '/api/search/models?field=urn&value=' + urn;

            $scope.setCurrentDbModel(null);

            $http.get(url).success(function(models){

                if(models.length > 0) {

                    $scope.setCurrentDbModel(models[0]);

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
                $scope.adnViewerMng.getViewerDivId());

            parent.appendChild(div);

            div.style.top = "100%";
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
                        "src='http://" + window.location.host + "/embed/" + model._id + "'> \n" +
                        "</iframe>");

                    $('#embedDlg').modal('show');
                });

            toolbar.addToSubToolbar("sub1", bEmbed);
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function onItemSelected(event) {

            var dbIdArray = event.dbIdArray;

            for (var i = 0; i < dbIdArray.length; i++) {

                var dbId = dbIdArray[i];

                console.log("Selected Item Id: " + dbId);

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

            // Properties table hook

            $scope.adnViewerMng.onDisplayPropertiesTable(

                function(table) {

                    var properties = [{
                        index: 0,   //optional index position in the table
                        displayName: 'Developer',
                        displayValue: 'Philippe Leefsma'
                    }, {
                        displayName: 'Company',
                        displayValue: 'ADN'
                    }];

                    //$scope.adnViewerMng.insertProperties(properties, table);
                });
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function initializeMenu() {

            $('#navBarId').removeClass("navbar-fixed-top");

            $('#menuSearchId').css({"visibility": "visible"});
            $('#menuViewId').css({"visibility": "visible"});
            $('#menuDocId').css({"visibility": "visible"});
            $('#menuUiId').css({"visibility": "visible"});

            $('#btnExplodeMotionId').unbind().click(
                function() {
                    $scope.adnViewerMng.startExplodeMotion(
                        0.2, 0.1, 1.5);
                }
            );

            $('#btnRotateMotionId').unbind().click(
                function() {
                    $scope.adnViewerMng.startRotateMotion(
                        0.3, {x:0, y:1, z:0});
                }
            );

            $('#btnStopMotionId').unbind().click(
                function() {
                    $scope.adnViewerMng.stopExplodeMotion();
                    $scope.adnViewerMng.stopRotateMotion();
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

                center__onresize: function () {
                    $scope.viewer.resize();
                },

                west__onresize: function () {
                    $scope.viewer.resize();
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
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////

        initializeEvents();

        initializeLayout();

        initializeViewer();

        initializeGrid();

        initializeMenu();
    });