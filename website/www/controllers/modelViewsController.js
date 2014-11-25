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
angular.module('AdnGallery.views',[])

    ///////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////
    .controller('modelViewsController', function($scope) {

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function onSaveView() {

            var dbModel = $scope.getCurrentDbModel();

            if (dbModel) {

                var defaultName = new Date().toString('d/M/yyyy H:mm:ss');

                $('#viewName').val(defaultName);

                $('#saveViewDlg').modal('show');
            }
        }

        function saveView() {

            var name = $('#viewName').val();

            if (name !== '') {

                var dbModel = $scope.getCurrentDbModel();

                var view = $scope.getViewerManager().getViewer().getCurrentView(name);

                getModelById(dbModel._id,

                    function (response) {

                        response.model.views.push(view);

                        putModel(response.model);
                    });
            }
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function onLoadView() {

            var dbModel = $scope.getCurrentDbModel();

            getModelById(dbModel._id,

                function (response) {

                    showLoadViewDlg();

                    var content = document.getElementById(
                        'loadViewDlgBodyContent');

                    response.model.views.forEach(function (view) {
                        addViewItem(
                            view,
                            content,
                            function () {

                                $('#loadViewDlg').modal('hide');

                                $scope.getViewerManager().getViewer().setView(this.view);
                            });
                    });
                });
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function addViewItem(view, parent, onclick) {

            var item = document.createElement('a');

            var id = 'viewElement' +  $scope.newGUID();

            item.id = id;
            item.view = view;
            item.onclick = onclick;
            item.innerHTML = view.name;
            item.className = 'list-group-item';

            parent.appendChild(item);

            $scope.setHoverStyle(id,
                'rgba(136, 180, 221, 0.5)',
                'rgba(136, 180, 221, 1.0)');
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function getModelById(id, onSuccess) {

            var xhr = new XMLHttpRequest();

            xhr.open('GET',
                "http://" + window.location.host +
                '/node/gallery/api/model/' + id,
                true);

            xhr.setRequestHeader(
                'Content-Type',
                'application/json');

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 )
                    if(xhr.status === 200)
                        onSuccess(JSON.parse(xhr.responseText));
            }

            xhr.onerror = function (error) {
                console.log('getModel error:' + error);
            }

            xhr.send();
        }

        function putModel(model) {

            var xhr = new XMLHttpRequest();

            xhr.open('PUT',
                "http://" + window.location.host +
                '/node/gallery/api/model/' + model._id,
                true);

            xhr.setRequestHeader(
                'Content-Type',
                'application/json');

            var _model = {
                name: model.name,
                urn: model.urn,
                views: model.views
            };

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    console.log("Updating model in DB: " +
                        xhr.responseText);
                }
            }

            xhr.send(JSON.stringify(_model));
        }

        function showLoadViewDlg() {

            $scope.clearContent('loadViewDlgBody');

            var visibility = 'collapse';

            $('#loadViewDlgBodySearch').css(
                'visibility', visibility);

            $('#loadViewDlg').modal('show');
        }

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////
        function onSuppressView() {

            var dbModel = $scope.getCurrentDbModel();

            getModelById(dbModel._id,

                function (response) {

                    showItemSuppressDlg(
                        'Select views to suppress',
                        suppressView);

                    var content = document.getElementById(
                        'itemSuppressDlgBodyContent');

                    response.model.views.forEach(function (view) {
                        addViewItem(
                            view,
                            content,
                            onItemSuppressClicked);
                    });
                });
        }

        function suppressView() {

            console.log('doSuppressView');

            getModelById($scope.currentDbModel._id,

                function (response) {

                    var content = document.getElementById(
                        'itemSuppressDlgBodyContent');

                    for (var i = 0; i < content.children.length; ++i) {
                        if (content.children[i].suppressed) {

                            var view = content.children[i].view;

                            console.log('Suppressing view :' + view.name);

                            for (var j = 0; j < model.views.length; ++j) {

                                if (response.model.views[j].id === view.id) {
                                    response.model.views.splice(j, 1);
                                }
                            }
                        }
                    }

                    putModel(model);

                    $('#itemSuppressDlg').modal('hide');
                });
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

        ///////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////

        $('#btnSaveViewId').unbind().click(
            function() {
                onSaveView();
            }
        );

        $('#btnSaveViewOkId').unbind().click(
            function() {
                saveView();
            }
        );

        $('#btnLoadViewId').unbind().click(
            function() {
                onLoadView();
            }
        );

        $('#btnSuppressViewId').unbind().click(
            function() {
                onSuppressView();
            }
        );

        $('#btnSuppressViewOkId').unbind().click(
            function() {
                suppressView();
            }
        );
    });

