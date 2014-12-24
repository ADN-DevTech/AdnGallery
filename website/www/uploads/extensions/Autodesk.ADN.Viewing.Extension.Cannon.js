///////////////////////////////////////////////////////////////////////////////
// Cannon Physics viewer extension
// by Philippe Leefsma, December 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Cannon");

Autodesk.ADN.Viewing.Extension.Cannon = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _self = this;

    var _world = null;

    var _meshMap = {};

    var _viewer = viewer;

    var _animationId = null;

    var lastCallTime = null;

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

    var stopwatch = new Stopwatch();

    _self.load = function () {

        console.log('Autodesk.ADN.Viewing.Extension.Cannon loaded');

        $('<div/>').
            attr('id', 'cannonDivId').
            append('<button id="startBtnId" type="button">Start</button>').
            appendTo('#' + _viewer.clientContainer.id);

        $('#startBtnId').click(function(){

            if(_animationId) {

                $("#startBtnId").text('Start');
                cancelAnimationFrame(_animationId);
                _animationId = null;
            }
            else {

                $("#startBtnId").text('Stop');
                lastCallTime = null;
                _self.update();
            }
        })

        $('#cannonDivId').css({

            'right': '15%',
            'top': '5%',
            'position':'absolute',
            'visibility':'visible',
            'z-index':'100'
        });

        _world = _self.createWorld();

        _viewer.getObjectTree(function (rootComponent) {

            rootComponent.children.forEach(function(component) {

                _viewer.getPropertyValue(component.dbId, "Mass", function(mass){

                    var mesh = _viewer.impl.getRenderProxy(
                        _viewer,
                        component.fragIds);

                    //console.log(component);

                    var body = createRigidBody(mesh, mass);

                    _world.add(body);

                    _meshMap[component.dbId] = {
                        mesh: mesh,
                        body: body
                    }

                    //console.log(component.name + ' Mass: ' + value);
                })
            })
        });

        /*var material = new THREE.MeshPhongMaterial({color: 0xf571d6});

        _viewer.impl.matman().addMaterial(
            'ADN-Material',
            material,
            true);

        var geometry = new THREE.BoxGeometry(10, 10, 10);

        _mesh = new THREE.Mesh(geometry, material);

        _mesh.position.y = 100;

        _viewer.impl.scene.add(_mesh);

        _body = createRigidBody(_mesh, 10);

        _world.add(_body);*/

        return true;
    };

    _self.unload = function () {

        console.log('Autodesk.ADN.Viewing.Extension.Cannon unloaded');
        return true;
    };

    _self.createWorld = function() {

        var world = new CANNON.World();

        world.solver.iterations = 5;
        world.gravity.set(0, 0, -5);
        world.broadphase = new CANNON.NaiveBroadphase();

        world.defaultContactMaterial.contactEquationStiffness = 5e6;
        world.defaultContactMaterial.contactEquationRegularizationTime = 3;

        return world;
    }

    _self.update = function() {

        _animationId = requestAnimationFrame(
            _self.update);

        var now = Date.now() / 1000;

        if(!lastCallTime){
            _world.step(1.0/60.0);
            lastCallTime = now;
            stopwatch.getElapsedMs();
            return;
        }

        _world.step(
            stopwatch.getElapsedMs() * 0.001,
            now - lastCallTime,
            10);

        lastCallTime = now;

        for(var key in _meshMap) {

            var body = _meshMap[key].body;
            var mesh = _meshMap[key].mesh;

            mesh.matrixWorld.setPosition(body.position);

            //mesh.position.copy(body.position);
            //mesh.quaternion.copy(body.quaternion);
        }

        _viewer.impl.invalidate(true);
    }

    ///////////////////////////////////////////////////////////////////////////
    // return mesh position
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.getMeshPosition = function (mesh) {

        var pos = new THREE.Vector3();

        pos.setFromMatrixPosition(mesh.matrixWorld);

        return pos;
    }

    function isEqual(v1, v2) {

        var d2 = (v1.x - v2.x) * (v1.x - v2.x) +
            (v1.y - v2.y) * (v1.y - v2.y) +
            (v1.z - v2.z) * (v1.z - v2.z);

        return d2 < 1e-12;
    }

    function crunchVertices(vertices) {

        var result = [];

        var excluded = [];

        for(var i=0; i<vertices.length-1; ++i){

            for(var j=i+1; j<vertices.length; ++j){

                if(excluded.indexOf(i) < 0 && excluded.indexOf(j)) {

                    if (isEqual(vertices[i], vertices[j])) {

                        excluded.push(j);

                        if(!vertices[i].hasOwnProperty("mapping"))
                            vertices[i].mapping = [];

                        vertices[i].mapping.push(i);
                        vertices[i].mapping.push(j);
                    }
                }
            }
        }

        for(var i=0; i<vertices.length; ++i){

            if(excluded.indexOf(i) < 0)
                result.push(vertices[i]);
        }

        return result;
    }

    function getFaceIndex(index, vertices) {

        for(var i=0; i<vertices.length; ++i) {

            if(vertices[i].mapping.indexOf(index) >= 0)
                return i;
        }
    }

    function createRigidBody(mesh, mass) {

        var body = new CANNON.Body({ mass: mass });

        var vertexBuffer = mesh.geometry.vb;

        var vertices = [];

        for(var i=0; i < vertexBuffer.length; i += mesh.geometry.vbstride) {

            var vertex = {
                x: vertexBuffer[i],
                y: vertexBuffer[i+1],
                z: vertexBuffer[i+2]
            }

            vertices.push(vertex);
        }

        vertices = crunchVertices(vertices);

        var faceBuffer = mesh.geometry.attributes.index.array;

        var faces = [];

        for(var i=0; i < faceBuffer.length; i+=3) {

            faces.push([
                getFaceIndex(faceBuffer[i], vertices),
                getFaceIndex(faceBuffer[i+1], vertices),
                getFaceIndex(faceBuffer[i+2], vertices)]);
        }

        console.log(vertices);
        console.log(faces);

        var offset = new CANNON.Vec3(0, 0, 0);

        var cannonVertices = [];

        for(var i=0; i < vertices.length; ++i) {

            var vertex = vertices[i];

            cannonVertices.push(
                new CANNON.Vec3(
                    vertex.x,
                    vertex.y,
                    vertex.z));
        }

        var shape = new CANNON.ConvexPolyhedron(
            cannonVertices,
            faces);

        body.addShape(shape, offset);

        var pos = _self.getMeshPosition(mesh);

        body.position.set(pos.x, pos.y, pos.z);

        //console.log(mesh);

        return body;
    }

    function copyMesh(mesh){

        var geometry = new THREE.Geometry();

        var vertexBuffer = mesh.geometry.vb;

        var vertices = [];

        for(var i=0; i < vertexBuffer.length; i += mesh.geometry.vbstride) {

            geometry.vertices.push(
                new THREE.Vector3(
                    vertexBuffer[i],
                    vertexBuffer[i+1],
                    vertexBuffer[i+2]));
        }

        var faceBuffer = mesh.geometry.attributes.index.array;

        var faces = [];

        for(var i=0; i < faceBuffer.length; i+=3) {

            var face = new THREE.Face3(
                faceBuffer[i],
                faceBuffer[i+1],
                faceBuffer[i+2]);

            geometry.faces.push(face);
        }

        var material = new THREE.MeshPhongMaterial({color: 0xf571d6});

        _viewer.impl.matman().addMaterial(
            'ADN-Material',
            material,
            true);

        var copyMesh = new THREE.Mesh(geometry, material);

        var pos = _self.getMeshPosition(mesh);

        copyMesh.position.set(pos.x, pos.y, pos.z);

        _viewer.impl.scene.add(copyMesh);

        _viewer.impl.invalidate(true);
    }


};

Autodesk.ADN.Viewing.Extension.Cannon.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Cannon.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Cannon;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.Cannon',
    Autodesk.ADN.Viewing.Extension.Cannon);

