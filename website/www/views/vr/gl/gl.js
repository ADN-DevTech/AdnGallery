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

angular.module('AdnGallery.glvr', ['ngRoute'])

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/vr/gl', {
            templateUrl: 'views/vr/gl/gl.html',
            controller: 'GlVrController'
        });
    }])

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    .controller('GlVrController', function($scope, $http) {

        $('#navBarId').removeClass("navbar-fixed-top");

        require([

        //loadScripts([
            "http://threejs.org/build/three.min.js",
            "http://learningthreejs.com/data/THREEx/THREEx.FullScreen.js",
            "https://rawgit.com/mrdoob/three.js/master/examples/js/controls/TrackballControls.js",
            "https://rawgit.com/mrdoob/three.js/master/examples/js/effects/OculusRiftEffect.js",
            "https://rawgit.com/mrdoob/three.js/master/examples/js/effects/StereoEffect.js",
            "https://hammerjs.github.io/dist/hammer.js",
            "https://rawgit.com/hammerjs/touchemulator/master/touch-emulator.js",
        ], function() {

            var Autodesk = {} || Autodesk;
            Autodesk.ADN = {} ||  Autodesk.ADN;

            /////////////////////////////////////////////////////////////////////////
            //
            //
            /////////////////////////////////////////////////////////////////////////
            Autodesk.ADN.EffectsDemo = function (canvasId) {

                var _self = this;

                var _canvasId = canvasId;

                var _camera, _scene, _controls, _mesh, _renderer, _glRenderer;

                /////////////////////////////////////////////////////////////////////
                //
                //
                /////////////////////////////////////////////////////////////////////
                _self.resizeCanvas = function () {

                    function getClientSize() {

                        var w = window,
                            d = document,
                            e = d.documentElement,
                            g = d.getElementsByTagName('body')[0],
                            sx = w.innerWidth || e.clientWidth || g.clientWidth,
                            sy = w.innerHeight || e.clientHeight || g.clientHeight;

                        return {x: sx, y: sy};
                    }

                    var size = getClientSize();

                    /*var size = {

                     x:$('#webGLDiv').width(),
                     y:$('#webGLDiv').height()
                     }*/

                    _camera.aspect = size.x / size.y;
                    _camera.updateProjectionMatrix();

                    _renderer.setSize(size.x, size.y);

                    var canvas = document.getElementById(_canvasId);

                    _controls = new THREE.TrackballControls(_camera, canvas);
                    _controls.rotateSpeed = 1.0;
                    _controls.minDistance = 200;
                    _controls.maxDistance = 6000;
                    _controls.addEventListener('change', render);
                }

                /////////////////////////////////////////////////////////////////////
                //
                //
                /////////////////////////////////////////////////////////////////////
                function initializeScene() {

                    var canvas = document.getElementById(
                        _canvasId);

                    _camera = new THREE.PerspectiveCamera(
                        70, 1, 1, 10000);

                    _camera.position.z = 400;

                    _scene = new THREE.Scene();

                    var geometry = new THREE.BoxGeometry(
                        150, 150, 150);

                    var texture = THREE.ImageUtils.loadTexture(
                        'public/images/adsk.1500x1500.jpg');

                    var material = new THREE.MeshPhongMaterial( {
                        ambient: 0x030303,
                        color: 0xdddddd,
                        specular: 0x009900,
                        shininess: 30,
                        shading: THREE.FlatShading,
                        map: texture
                    });

                    var l1 = new THREE.DirectionalLight(0xffffff);
                    var l2 = new THREE.DirectionalLight(0xffffff);
                    var l3 = new THREE.DirectionalLight(0xffffff);
                    var l4 = new THREE.DirectionalLight(0xffffff);

                    l1.position.set(5, 0, 0).normalize();
                    l2.position.set(-5, 0, 0).normalize();
                    l3.position.set(0, 10, 0).normalize();
                    l4.position.set(10, 0, 10).normalize();

                    _scene.add(l1);
                    _scene.add(l2);
                    _scene.add(l3);
                    _scene.add(l4);

                    _mesh = new THREE.Mesh(geometry, material);

                    _scene.add(_mesh);

                    _renderer = _glRenderer = new THREE.WebGLRenderer({
                        canvas: canvas
                    });

                    _renderer.setPixelRatio(window.devicePixelRatio);

                    _renderer.setClearColor(0x1771C0, 1);

                    _self.resizeCanvas();
                }

                /////////////////////////////////////////////////////////////////////
                //
                //
                /////////////////////////////////////////////////////////////////////
                function update() {

                    requestAnimationFrame(update);

                    _mesh.rotation.x += 0.01;
                    _mesh.rotation.y += 0.01;

                    _controls.update();

                    render();
                }

                /////////////////////////////////////////////////////////////////////
                //
                //
                /////////////////////////////////////////////////////////////////////
                function render() {

                    _renderer.render(_scene, _camera);
                }

                /////////////////////////////////////////////////////////////////////
                //
                //
                /////////////////////////////////////////////////////////////////////
                _self.setGlRenderer = function () {

                    initializeScene();

                    _self.resizeCanvas();
                }

                /////////////////////////////////////////////////////////////////////
                //
                //
                /////////////////////////////////////////////////////////////////////
                _self.setOcculusRenderer = function () {

                    _renderer = new THREE.OculusRiftEffect(
                        _glRenderer,
                        {worldScale: 100});

                    _self.resizeCanvas();
                }

                /////////////////////////////////////////////////////////////////////
                //
                //
                /////////////////////////////////////////////////////////////////////
                _self.setStereoRenderer = function () {

                    _renderer = new THREE.StereoEffect(_glRenderer);

                    //_renderer.eyeSeparation = 5;

                    _self.resizeCanvas();
                }

                /////////////////////////////////////////////////////////////////////
                //
                //
                /////////////////////////////////////////////////////////////////////

                initializeScene();
                update();
            }

            var demo = new Autodesk.ADN.EffectsDemo('renderer');

            window.addEventListener('resize', function() {

                if (!THREEx.FullScreen.activated()) {

                    $('#navBarId').css({'display': 'inherit'});

                }

                demo.resizeCanvas();

            } , false);

            function setGlMode() {

                THREEx.FullScreen.cancel();

                demo.setGlRenderer();
            }

            function setOcculusMode() {

                if (!THREEx.FullScreen.activated()) {

                    $('#navBarId').css({'display':'none'});
                    THREEx.FullScreen.request();
                }

                demo.setOcculusRenderer();
            }

            function setStereoMode() {

                if (!THREEx.FullScreen.activated()) {

                    $('#navBarId').css({'display':'none'});
                    THREEx.FullScreen.request();
                }

                demo.setStereoRenderer();
            }

            var modeIdx = 0;

            var modes = [setGlMode, setOcculusMode, setStereoMode];

            $(document).keypress(function (event) {

                switch (event.which) {

                    case 0: //ESC key

                        demo.setGlRenderer();
                        break;

                    case 102: //f key

                        if (THREEx.FullScreen.activated()) {

                            THREEx.FullScreen.cancel();
                            demo.setGlRenderer();

                        } else {

                            $('#navBarId').css({'display':'none'});
                            THREEx.FullScreen.request();
                        }

                        break;

                    case 110: //n key
                        setGlMode();
                        break;

                    case 114: //r key

                        setOcculusMode();
                        break;

                    case 115: //s key

                        setStereoMode();
                        break;
                }
            });

            var mc = new Hammer.Manager(document.getElementById("webGLDiv"));

            mc.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }));
            mc.add(new Hammer.Tap({ event: 'singletap' }));

            mc.get('doubletap').recognizeWith('singletap');
            mc.get('singletap').requireFailure('doubletap');

            mc.on("doubletap", function (ev) {

                modeIdx = (++modeIdx) % 3;

                modes[modeIdx]();
            });
        });
    });



