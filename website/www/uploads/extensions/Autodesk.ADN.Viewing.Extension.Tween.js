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
            append('<button style="width:50px" id="explodeBtn" ' + 'type="button">Explode</button><br>').
            append('<button style="width:50px" id="gridTransformBtn" ' + 'type="button">Grid</button>').
            appendTo('#' + _viewer.container.id);

        $('#tweenDivId').css({
            'top': '5%',
            'right': '15%',
            'z-index':'100',
            'position':'absolute',
            'visibility':'visible'
        });

        $('#explodeBtn').click(function(){
            doTweenExplode();
        })

        $('#gridTransformBtn').click(function(){
            doGridTransform();
        })

        _viewer.addEventListener(
            Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            _self.onItemSelected);

        _viewer.getAllLeafComponents(function(nodes) {

            nodes.forEach(function(node) {

                var bb =  _self.getBoundingBox(node);

                _bbData.push({

                    box: bb,
                    node: node
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

        var center = {

            x: (maxPt.x + minPt.x) * 0.5,
            y: (maxPt.y + minPt.y) * 0.5,
            z: (maxPt.z + minPt.z) * 0.5
        };

        return {

            min: minPt,
            max: maxPt,

            center: center,

            sizeX: maxPt.x - minPt.x,
            sizeY: maxPt.y - minPt.y,
            sizeZ: maxPt.z - minPt.z
        };
    }

    _self.ComputeGridTransform = function (bbData) {

        var transformMap = {};

        var xOffset = 0.0;
        var yOffset = 0.0;
        var nextyOffset = 0.0;

        var size = Math.ceil(Math.sqrt(bbData.length));

        for(var row=0; row < size; ++row) {

            yOffset += nextyOffset;

            nextyOffset = 0.0;

            xOffset = 0.0;

            for(var col=0; col < size; ++col) {

                var idx = size * row + col;

                if(idx === bbData.length-1) {

                    return transformMap;
                }

                var data = bbData[idx];

                var center = {

                    x: (data.box.max.x + data.box.min.x) * 0.5,
                    y: (data.box.max.y + data.box.min.y) * 0.5,
                    z: (data.box.max.z + data.box.min.z) * 0.5
                };

                transformMap[data.node.dbId] = {

                    translation: {

                        x: xOffset - center.x,
                        y: yOffset - center.y,
                        z: - center.z
                    },

                    box: data.box,

                    node: data.node
                }

                xOffset += data.box.sizeX;

                nextyOffset = Math.max(nextyOffset, data.box.sizeY);
            }
        }
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

        fragIds.forEach(function(fragId) {

            var mesh = _viewer.impl.getRenderProxy(
                _viewer,
                fragId);

            //var pos = _self.getMeshPosition(mesh);

            var pos = {

                x: translation.x,
                y: translation.y,
                z: translation.z
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

    function doTweenExplode() {

        var exploder = { explode: 0.0 };

        createjs.Tween.get(
            exploder, { override:true })
            .to({ explode: 1.0}, 5000)
            .addEventListener("change",  function(event) {

                if(event) {
                    _viewer.explode(event.target.target.explode);
                }

            }).call(function() {
                //done
            });
    }

    function doGridTransform() {

        var transformMap = _self.ComputeGridTransform(_bbData);

        for(var dbId in transformMap) {

            var center = transformMap[dbId].box.center;

            var target = {

                x: center.x,
                y: center.y,
                z: center.z,

                dbId: dbId
            }

            var final = transformMap[dbId].translation;

            //_self.translateNode(transformMap[dbId].node, final);

            createjs.Tween.get(
                target, { override:true })
                .to({ x: final.x, y: final.y, z: final.z }, 10000)
                .addEventListener("change",  function(event) {

                    if(event) {

                        var id = event.target.target.dbId;

                        var entry = transformMap[id];

                        _self.translateNode(
                            entry.node,
                            event.target.target);

                        _viewer.impl.invalidate(true);
                    }

                }).call(function() {

                });
        }
    }
};

Autodesk.ADN.Viewing.Extension.Tween.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Tween.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Tween;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.Tween',
    Autodesk.ADN.Viewing.Extension.Tween);