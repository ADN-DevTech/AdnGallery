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
angular.module('AdnGallery.extensions',[])

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    .controller('extensionController', function($scope, $http, $element) {

        $scope.SelectedFiles = [];

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function initializeDropzone() {

            //Dropzone
            $('#dropZoneExtId').on('dragenter',
                function () {
                    $('#dropZoneExtId').addClass(
                        'hovered');
                });

            $('#dropZoneExtId').on('dragleave',
                function () {
                    $('#dropZoneExtId').removeClass(
                        'hovered');
                });

            $('#dropZoneExtId').on('dragover',
                function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                });

            $('#dropZoneExtId').on('drop',
                function (event) {

                    event.stopPropagation();
                    event.preventDefault();

                    $('#dropZoneExtId').removeClass(
                        'hovered');

                    var files = event.originalEvent.dataTransfer.files;

                    for (var i = 0; i < files.length; ++i) {

                        addUploadFile(files[i]);
                    };
                });

            $("#fileInputExtId").css('opacity', '0');

            $("#fileInputExtId").on('change',

                function (event) {

                    event.preventDefault();

                    var files = event.target.files;

                    for (var i = 0; i < files.length; i++) {

                        addUploadFile(files[i]);
                    }
                });

            $("#dropZoneExtId").click(function () {
                $("#fileInputExtId").trigger('click');
            });
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function addUploadFile(file) {

            var ext = getFileExt(file);

            if( ext === 'js' ||
                ext === 'css') {

                $scope.SelectedFiles.push(file);
            }
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function addExtension(extension) {

            var item = document.createElement('a');

            var id = 'viewElement' +  $scope.newGUID();

            item.id = id;
            item.extension = extension;
            item.onclick = onItemSelected;
            item.className = 'list-group-item';

            var parent = document.getElementById(
                'manageExtDlgBodyContent');

            parent.appendChild(item);

            if (item.extension.enabled) {
                $scope.setHoverStyle(item.id,
                    'rgba(19, 176, 59, 0.5)',
                    'rgba(19, 176, 59, 0.8)');

                item.innerHTML = extension.name + '  [Enabled]';
            }
            else {
                $scope.setHoverStyle(item.id,
                    'rgba(136, 180, 221, 0.5)',
                    'rgba(136, 180, 221, 1.0)');

                item.innerHTML = extension.name;
            }
        }

        function onItemSelected() {

            this.extension.enabled = !this.extension.enabled;

            if (this.extension.enabled) {
                $scope.setHoverStyle(this.id,
                    'rgba(19, 176, 59, 0.5)',
                    'rgba(19, 176, 59, 0.8)');

                this.innerHTML = this.extension.name + '  [Enabled]';
            }
            else {
                $scope.setHoverStyle(this.id,
                    'rgba(136, 180, 221, 0.5)',
                    'rgba(136, 180, 221, 1.0)');

                this.innerHTML = this.extension.name;
            }
        }

        function onManageExtensions() {

            $scope.clearContent('manageExtDlgBody');

            $scope.Extensions = [];

            var url =  "http://" +
                window.location.host +
                '/node/gallery/api/extensions';

            $http.get(url).success(function(response){

                $scope.Extensions = response.extensions;

                $scope.Extensions.forEach(function(extension) {

                    extension.enabled = isExtensionEnabled(extension);

                    $scope.Extensions.push(extension);

                    addExtension(extension);
                });

                $('#manageExtDlg').modal('show');
            });
        }

        function isExtensionEnabled(extension) {

            var storageObj = JSON.parse(localStorage['extensions']);

            return storageObj[extension._id];
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function onSaveExtensions() {

            var storageObj = JSON.parse(localStorage['extensions']);

            $scope.Extensions.forEach(function(extension){

                if(storageObj[extension._id] !== extension.enabled) {

                    $scope.$emit('emit-extension-status-modified', extension);
                }

                storageObj[extension._id] = extension.enabled;
            });

            localStorage['extensions'] = JSON.stringify(storageObj);
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function doUpload() {

            $('#loadExtFormId').submit();
        }

        ///////////////////////////////////////////////////////////////////////
        // Utilities
        //
        ///////////////////////////////////////////////////////////////////////

        function getFileExt(file) {

            var res = file.name.split('.');

            return res[res.length - 1];
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        initializeDropzone();

        $('#btnLoadExtId').unbind().click(
            function() {
                $scope.SelectedFiles = [];
                $('#loadExtDlg').modal('show');
            }
        );

        $('#btnManageExtId').unbind().click(
            function() {
                onManageExtensions();
            }
        );

        $('#btnManageExtOkId').unbind().click(
            function() {
                onSaveExtensions();
            }
        );

        $('#btnLoadExtOkId').unbind().click(
            function() {
                doUpload();
            }
        );
    });
