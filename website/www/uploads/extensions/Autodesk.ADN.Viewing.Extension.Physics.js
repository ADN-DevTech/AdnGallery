///////////////////////////////////////////////////////////////////////////////
// Ammo.js Physics viewer extension
// by Philippe Leefsma, December 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Physics = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _self = this;

    var _world = null;

    var _meshMap = {};

    var _viewer = viewer;

    var _running = false;

    var _animationId = null;

    ///////////////////////////////////////////////////////////////////////////
    // A stopwatch!
    //
    ///////////////////////////////////////////////////////////////////////////
    var Stopwatch = function() {

        var _startTime = new Date().getTime();

        this.start = function (){

            _startTime = new Date().getTime();
        };

        this.getElapsedMs = function(){

            var elapsedMs = new Date().getTime() - _startTime;

            _startTime = new Date().getTime();

            return elapsedMs;
        }
    }

    var _stopWatch = new Stopwatch();

    ///////////////////////////////////////////////////////////////////////////
    // Extension load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {

        jQuery.getScript('https://rawgit.com/kripken/ammo.js/master/builds/ammo.js')
            .done(function () {

                _self.initialize(function() {

                    $('<div/>').
                        attr('id', 'physicsDivId').
                        append('<button id="startBtnId" type="button">Start</button>').
                        append('<button id="resetBtnId" type="button">Reset</button>').
                        appendTo('#' + _viewer.clientContainer.id);

                    $('#startBtnId').click(function () {

                        if (_animationId) {

                            $("#startBtnId").text('Start');

                           _self.stop();
                        }
                        else {

                            $("#startBtnId").text('Stop');

                            _self.start();
                        }
                    })

                    $('#resetBtnId').click(function () {

                        if(_running) {

                            $("#startBtnId").text('Start');

                            _self.stop();
                        }

                        _self.restoreTransforms(_meshMap);
                    })

                    $('#physicsDivId').css({

                        'right': '15%',
                        'top': '5%',
                        'position': 'absolute',
                        'visibility': 'visible',
                        'z-index': '100'
                    });

                    console.log('Autodesk.ADN.Viewing.Extension.Physics loaded');
                });
            })
            .fail(function(jqxhr, settings, exception) {
                console.log("Couldn't load remote script: " + exception);
                callback(null);
            });

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // Extension unload callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.unload = function () {

        $('#physicsDivId').remove();

        cancelAnimationFrame(_animationId);

        console.log('Autodesk.ADN.Viewing.Extension.Physics unloaded');

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // Initializes meshes and grab initial properties
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.initialize = function(callback) {

        _viewer.getObjectTree(function (rootComponent) {

            rootComponent.children.forEach(function(component) {

                var fragIdsArray = (Array.isArray(component.fragIds) ?
                    component.fragIds :
                    [component.fragIds]);

                fragIdsArray.forEach(function(subFragId) {

                    var mesh = _viewer.impl.getRenderProxy(
                        _viewer,
                        subFragId);

                    _viewer.getPropertyValue(component.dbId, "Mass", function(mass) {

                        mass = (mass !== 'undefined' ? mass : 1.0);

                        _viewer.getPropertyValue(
                            component.dbId,
                            "vInit",
                            function (vInit) {

                                vInit = (vInit !== 'undefined' ? vInit : "0;0;0");

                                _meshMap[subFragId] = {

                                    vInit: parseArray(vInit, ';'),
                                    mass: mass,
                                    transform: mesh.matrixWorld.clone(),
                                    dbId: component.dbId,
                                    mesh: mesh,
                                    body: null
                                }
                            });
                    });
                });
            });

            //done
            callback();
        });
    }

    ///////////////////////////////////////////////////////////////////////////
    // Creates physics world
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.createWorld = function() {

        var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration;

        var world = new Ammo.btDiscreteDynamicsWorld(
            new Ammo.btCollisionDispatcher(collisionConfiguration),
            new Ammo.btDbvtBroadphase,
            new Ammo.btSequentialImpulseConstraintSolver,
            collisionConfiguration);

        world.setGravity(new Ammo.btVector3(0, 0, -9.8));

        return world;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Starts simulation
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.start = function() {

        _world = _self.createWorld();

        for(var key in _meshMap){

            var entry = _meshMap[key];

            var body = createRigidBody(entry);

            _world.addRigidBody(body);

            entry.body = body;
        }

        _running = true;

        _stopWatch.getElapsedMs();

        _self.update();
    }

    ///////////////////////////////////////////////////////////////////////////
    // Stops simulation
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.stop = function() {

        _running = false;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Update loop
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.update = function() {

        if(!_running) {

            cancelAnimationFrame(_animationId);

            _animationId = null;

            return;
        }

        _animationId = requestAnimationFrame(
            _self.update);

        _world.stepSimulation(
            _stopWatch.getElapsedMs() * 0.002,
            10);

        for(var key in _meshMap) {

            updateMeshTransform(_meshMap[key].body);
        }

        _viewer.impl.invalidate(true);
    }

    ///////////////////////////////////////////////////////////////////////////
    // Restores mesh transforms according to map
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.restoreTransforms = function(meshMap) {

        for(var key in meshMap) {

            var mesh = _viewer.impl.getRenderProxy(
                _viewer,
                key);

            mesh.matrixWorld = meshMap[key].transform.clone();
        }

        _viewer.impl.invalidate(true);
    }

    ///////////////////////////////////////////////////////////////////////////
    // Parses string to array: a1;a2;a3 -> [a1, a2, a3]
    //
    ///////////////////////////////////////////////////////////////////////////
    function parseArray(str, separator) {

        var array = str.split(separator);

        var result = [];

        array.forEach(function(element){

            result.push(parseFloat(element));
        });

        return result;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Updates mesh transform according to physic body
    //
    ///////////////////////////////////////////////////////////////////////////
    function updateMeshTransform(body) {

        var mesh = body.mesh;

        var transform = body.getCenterOfMassTransform();

        var origin = transform.getOrigin();

        var q = transform.getRotation();

        mesh.matrixWorld.makeRotationFromQuaternion({
            x: q.x(),
            y:q.y(),
            z:q.z(),
            w:q.w()
        });

        mesh.matrixWorld.setPosition(
            new THREE.Vector3(
                origin.x(),
                origin.y(),
                origin.z()));
    }

    ///////////////////////////////////////////////////////////////////////////
    // Returns mesh position
    //
    ///////////////////////////////////////////////////////////////////////////
    function getMeshPosition(mesh) {

        var pos = new THREE.Vector3();

        pos.setFromMatrixPosition(mesh.matrixWorld);

        return pos;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Creates collision shape based on mesh vertices
    //
    ///////////////////////////////////////////////////////////////////////////
    function createCollisionShape(mesh) {

        var geometry = mesh.geometry;

        var hull = new Ammo.btConvexHullShape();

        var vertexBuffer = geometry.vb;

        for(var i=0; i < vertexBuffer.length; i += geometry.vbstride) {

            hull.addPoint(new Ammo.btVector3(
                vertexBuffer[i],
                vertexBuffer[i+1],
                vertexBuffer[i+2]));
        }

        return hull;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Creates physic rigid body from mesh
    //
    ///////////////////////////////////////////////////////////////////////////
    function createRigidBody(entry) {

        var localInertia = new Ammo.btVector3(0, 0, 0);

        var shape = createCollisionShape(entry.mesh);

        shape.calculateLocalInertia(entry.mass, localInertia);

        var transform = new Ammo.btTransform;

        transform.setIdentity();

        var position = getMeshPosition(entry.mesh);

        transform.setOrigin(new Ammo.btVector3(
            position.x,
            position.y,
            position.z));

        var q = new THREE.Quaternion();

        q.setFromRotationMatrix(entry.mesh.matrixWorld);

        transform.setRotation(new Ammo.btQuaternion(
            q.x, q.y, q.z, q.w
        ));

        var motionState = new Ammo.btDefaultMotionState(transform);

        var rbInfo = new Ammo.btRigidBodyConstructionInfo(
            entry.mass,
            motionState,
            shape,
            localInertia);

        var body = new Ammo.btRigidBody(rbInfo);

        body.setLinearVelocity(
            new Ammo.btVector3(
                entry.vInit[0],
                entry.vInit[1],
                entry.vInit[2]));

        body.mesh = entry.mesh;

        return body;
    }
};

Autodesk.ADN.Viewing.Extension.Physics.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Physics.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Physics;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.Physics',
    Autodesk.ADN.Viewing.Extension.Physics);

