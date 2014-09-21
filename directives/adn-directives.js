'use strict';

angular.module('AdnDirectives', []).

    directive('adnSpinningImg', ['$interval', function($interval) {

        function link(scope, element, attrs) {

            var angle = 0.0;

            function update() {

                angle += parseFloat(attrs.step);

                angle = angle % 360;

                var value = "rotateY(" + angle + "deg)";

                jQuery(element).css({
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

