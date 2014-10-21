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
angular.module('AdnGallery.upload',[])

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    .controller('uploadController', function($scope) {

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function initializeDropzone() {

            //Dropzone
            $('#dropZoneId').on('dragenter',
                function () {
                    $('#dropZoneId').addClass(
                        'hovered');
                });

            $('#dropZoneId').on('dragleave',
                function () {
                    $('#dropZoneId').removeClass(
                        'hovered');
                });

            $('#dropZoneId').on('dragover',
                function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                });

            $('#dropZoneId').on('drop',
                function (event) {

                    event.stopPropagation();
                    event.preventDefault();

                    $('#dropZoneId').removeClass(
                        'hovered');

                    var files = event.originalEvent.dataTransfer.files;

                    for (var i = 0; i < files.length; ++i) {
                        $scope.addUploadItem(files[i]);
                    };
                });

            $("#fileInput").css('opacity', '0');

            $("#fileInput").on('change',
                function (event) {

                    var files = event.target.files;

                    for (var i = 0; i < files.length; i++) {
                        $scope.addUploadItem(files[i]);
                    }
                });

            $("#dropZoneId").click(function () {
                $("#fileInput").trigger('click');
            });
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        $scope.addUploadItem = function (file) {

            console.log("File: " + file.name + ' (' + file.type + ')');

            var item = document.createElement('a');

            var id = 'uploadElement' + $scope.newGUID();

            item.id = id;
            item.file = file;
            item.innerHTML = file.name;
            item.className = 'list-group-item';
            item.style.padding = " 10px";

            var parent = document.getElementById(
                'uploadDlgBodyContent');

            parent.appendChild(item);

            $scope.setHoverStyle(id,
                'rgba(136, 180, 221, 0.5)',
                'rgba(136, 180, 221, 1.0)');
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function doUpload() {

            var content = document.getElementById(
                'uploadDlgBodyContent');

            var author = {
                name: $('#user').val(),
                email: $('#email').val()
            };

            for (var i = 0; i < content.children.length; ++i) {

                var file = content.children[i].file;

                $scope.viewDataClient.uploadFileAsync(
                    file,
                    'adn-viewer-gallery',
                    $scope.newGUID() + '.' + getFileExt(file),

                    function (response) {

                        var fileId = response.objects[0].id;

                        console.log("Upload successful: " + response.file.name);

                        var registerResponse =
                            $scope.viewDataClient.register(fileId);

                        console.log("Registration result: " +
                            registerResponse.Result);

                        if (registerResponse.Result === "Success") {

                            var modelInfo = {
                                author: author,
                                name: getFileName(response.file),
                                fileId: fileId,
                                urn: $scope.viewDataClient.toBase64(fileId),
                                views: []
                            };

                            postModel(modelInfo, true);

                            checkTranslationStatus(
                                modelInfo.name,
                                fileId,
                                1000 * 60 * 60, //60 mins timeout
                                function (viewable) {

                                    console.log("Translation successful: " +
                                        response.file.name);
                                });
                        }
                    },
                    function(error){
                        console.log("Upload error: " + error);
                    });
            }
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function checkTranslationStatus(name, fileId, timeout, onSuccess) {

            var dialogId = fileId.split('/')[1].split('.')[0];

            showProgressDialog(name, dialogId);

            var startTime = new Date().getTime();

            var timer = setInterval(function () {

                var dt = (new Date().getTime() - startTime) / timeout;

                if (dt >= 1.0) {

                    clearInterval(timer);
                }
                else {

                    $scope.viewDataClient.getViewableAsync(
                        fileId,
                        function (response) {

                            $('#' + dialogId).html(
                                '<b>Model: </b>' + name +
                                '<br>' +
                                '<b>Status: </b>' + response.progress);

                            console.log(
                                'Progress ' +
                                fileId + ': ' +
                                response.progress);

                            if (response.progress === 'complete') {
                                clearInterval(timer);
                                onSuccess(response);
                            }
                        },
                        function (error) {

                        });
                }
            }, 5000);
        };

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function postModel(modelInfo, translate) {

            var xhr = new XMLHttpRequest();

            xhr.open('POST',
                'http://' + window.location.host +
                '/api/model?host=' + window.location.host +
                '&translate=' + translate,
                true);

            xhr.setRequestHeader(
                'Content-Type',
                'application/json');

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    console.log("Posting new model to DB: " +
                        xhr.responseText);
                }
            }

            xhr.send(JSON.stringify(modelInfo));
        }

        ///////////////////////////////////////////////////////////////////////
        // Utilities
        //
        ///////////////////////////////////////////////////////////////////////

        function getFileExt(file) {

            var res = file.name.split('.');

            return res[res.length - 1];
        }

        function getFileName(file) {

            var ext = getFileExt(file);

            var name = file.name.substring(0,
                    file.name.length - ext.length - 1);

            return name;
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        function showProgressDialog(name, dialogId) {

            $('<div/>').
                attr('id', dialogId).
                appendTo('#AppContainerId');

            $('#' + dialogId).html(
                '<b>Model: </b>' + name +
                '<br>'+
                '<b>Status:</b> Registration successful');

            var dlg = $('#' + dialogId).dialog({

                title: 'Translation Progress',
                //width: 'auto',
                //autoResize: true,
                modal: false,
                autoOpen: false,
                closeOnEscape: true,
                resizable: false,

                open: function() {

                },
                focus: function() {

                },
                close: function() {

                    $('#' + dialogId).remove();
                },
                buttons: {
                    Ok: function() {
                        $(this).dialog('close');
                    }
                }
            });

            dlg.parent().draggable({
                containment: '#AppContainerId'
            });

            $('#' + dialogId).dialog('open');
        }

        ///////////////////////////////////////////////////////////////////////
        //
        //
        ///////////////////////////////////////////////////////////////////////
        initializeDropzone();

        $('#btnUploadDocId').unbind().click(
            function() {
                $scope.clearContent('uploadDlgBody');
                $('#uploadDlg').modal('show');
            }
        );

        $('#btnUploadOkId').unbind().click(
            function() {
                doUpload();
            }
        );
    });
