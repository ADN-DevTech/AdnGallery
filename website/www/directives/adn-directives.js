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

angular.module('AdnDirectives', []).

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    directive('adnSpinningImg', ['$interval', function($interval) {

        function link(scope, element, attrs) {

            var angle = 0.0;

            function update() {

                angle += parseFloat(attrs.step);

                angle = angle % 360;

                var value = "rotateY(" + angle + "deg)";

                jQuery(element).css({
                    "transform": value,
                    "-moz-transform": value,
                    "-webkit-transform": value,
                    "-ms-transform": value,
                    "-o-transform": value
                });
            }

            var timerId = $interval(function() {
                update();
            }, parseInt(attrs.period));
        }

        return {
            restrict: 'E',
            replace: true,
            template: '<img height={{height}} width={{width}} src={{src}} style={{style}}>',
            link: link
        }
    }]);

