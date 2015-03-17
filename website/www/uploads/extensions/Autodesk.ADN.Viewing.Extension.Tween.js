///////////////////////////////////////////////////////////////////////////////
// Tween viewer extension
// by Philippe Leefsma, March 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Tween = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _self = this;

    var _bbData = [];

    var _viewer = viewer;

    _self.load = function () {

        $('<div/>').
            attr('id', 'tweenDivId').
            append('<button id="gridTransformBtn" ' +
                'type="button">Grid</button>').
            appendTo('#' + _viewer.container.id);

        $('#tweenDivId').css({
            'top': '5%',
            'right': '5%',
            'z-index':'100',
            'position':'absolute',
            'visibility':'visible'
        });

        $('#gridTransformBtn').click(function(){

            doGridTransform();
        })

        _viewer.addEventListener(
            Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            _self.onItemSelected);

        _viewer.getAllLeafComponents(function(nodes) {

            nodes.forEach(function(node) {

                var bb =  _self.getBoundingBox(node);

                drawBox(bb.min, bb.max);

                _bbData.push({

                    box: bb,
                    node: node,
                    sizeX: bb.max.x - bb.min.x,
                    sizeY: bb.max.y - bb.min.y,
                    sizeZ: bb.max.z - bb.min.z
                });
            });

            _bbData.sort(function(a, b) {

                return a.sizeX - b.sizeX
            });
        });

        console.log('Autodesk.ADN.Viewing.Extension.Tween loaded');
        return true;
    };

    _self.unload = function () {

        console.log('Autodesk.ADN.Viewing.Extension.Tween unloaded');
        return true;
    };

    _self.onItemSelected = function (event) {

        console.log(event);
    }

    _self.getBoundingBox = function (node) {

        var fragIds = (Array.isArray(node.fragIds) ?
            node.fragIds :
            [node.fragIds]);

        var minPt = {
            x: Number.MAX_VALUE,
            y: Number.MAX_VALUE,
            z: Number.MAX_VALUE
        };

        var maxPt = {
            x: Number.MIN_VALUE,
            y: Number.MIN_VALUE,
            z: Number.MIN_VALUE
        };

        fragIds.forEach(function(fragId) {

            var mesh = _viewer.impl.getRenderProxy(
                _viewer,
                fragId);

            var bb = mesh.geometry.boundingBox;

            var fragMinPt = new THREE.Vector3(
                bb.min.x,
                bb.min.y,
                bb.min.z);

            var fragMaxPt = new THREE.Vector3(
                bb.max.x,
                bb.max.y,
                bb.max.z);

            fragMinPt.applyMatrix4(mesh.matrixWorld);
            fragMaxPt.applyMatrix4(mesh.matrixWorld);

            maxPt = max(maxPt, fragMaxPt);
            maxPt = max(maxPt, fragMinPt);

            minPt = min(minPt, fragMaxPt);
            minPt = min(minPt, fragMinPt);
        });

        return { min: minPt, max: maxPt };
    }

    _self.ComputeGridTransform = function (bbData) {

        var transformMap = {};

        var xOffset = 0.0;

        bbData.forEach(function(data) {

            var center = {

                x: (data.box.max.x - data.box.min.x) * 0.5,
                y: (data.box.max.y - data.box.min.y) * 0.5,
                z: (data.box.max.z - data.box.min.z) * 0.5
            };

            transformMap[data.node] = {

                x: xOffset - center.x,
                y: - center.y,
                z: - center.z
            }

            xOffset += data.box.sizeX;
        });

        return transformMap;
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

    _self.translateNode = function(node, translation) {

        var fragIds = (Array.isArray(node.fragIds) ?
            node.fragIds :
            [node.fragIds]);

        console.log(node);

        fragIds.forEach(function(fragId) {

            var mesh = _viewer.impl.getRenderProxy(
                _viewer,
                fragId);

            var pos = _self.getMeshPosition(mesh);

            pos = {
                x: pos.x + translation.x,
                y: pos.y + translation.y,
                z: pos.z + translation.z
            };

            mesh.matrixWorld.setPosition(pos);
        });
    }

    function max(v1, v2) {

        return {

            x: Math.max(v1.x, v2.x),
            y: Math.max(v1.y, v2.y),
            z: Math.max(v1.z, v2.z)
        };
    }

    function min(v1, v2) {

        return {

            x: Math.min(v1.x, v2.x),
            y: Math.min(v1.y, v2.y),
            z: Math.min(v1.z, v2.z)
        };
    }

    function doGridTransform() {

        var transformMap = _self.ComputeGridTransform(_bbData);

        //console.log(transformMap);

        for(var node in transformMap) {

            _self.translateNode(
                node,
                transformMap[node]);
        }

        _viewer.impl.invalidate(true);
    }

    function drawLines(coordsArray, material) {

        for (var i = 0; i < coordsArray.length; i+=2) {

            var start = coordsArray[i];
            var end = coordsArray[i+1];

            var geometry = new THREE.Geometry();

            geometry.vertices.push(new THREE.Vector3(
                start.x, start.y, start.z));

            geometry.vertices.push(new THREE.Vector3(
                end.x, end.y, end.z));

            geometry.computeLineDistances();

            var line = new THREE.Line(geometry, material);

            _viewer.impl.scene.add(line);
        }
    }

    function drawBox(min, max) {

        var material = new THREE.LineBasicMaterial({
            color: 0xffff00,
            linewidth: 5
        });

        _viewer.impl.matman().addMaterial(
            'ADN-Material-Line',
            material,
            true);

        drawLines([

            {x: min.x, y: min.y, z: min.z},
            {x: max.x, y: min.y, z: min.z},

            {x: max.x, y: min.y, z: min.z},
            {x: max.x, y: min.y, z: max.z},

            {x: max.x, y: min.y, z: max.z},
            {x: min.x, y: min.y, z: max.z},

            {x: min.x, y: min.y, z: max.z},
            {x: min.x, y: min.y, z: min.z},

            {x: min.x, y: max.y, z: max.z},
            {x: max.x, y: max.y, z: max.z},

            {x: max.x, y: max.y, z: max.z},
            {x: max.x, y: max.y, z: min.z},

            {x: max.x, y: max.y, z: min.z},
            {x: min.x, y: max.y, z: min.z},

            {x: min.x, y: max.y, z: min.z},
            {x: min.x, y: max.y, z: max.z},

            {x: min.x, y: min.y, z: min.z},
            {x: min.x, y: max.y, z: min.z},

            {x: max.x, y: min.y, z: min.z},
            {x: max.x, y: max.y, z: min.z},

            {x: max.x, y: min.y, z: max.z},
            {x: max.x, y: max.y, z: max.z},

            {x: min.x, y: min.y, z: max.z},
            {x: min.x, y: max.y, z: max.z}],

            material);

        _viewer.impl.invalidate(true);
    }
};

Autodesk.ADN.Viewing.Extension.Tween.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Tween.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Tween;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.Tween',
    Autodesk.ADN.Viewing.Extension.Tween);