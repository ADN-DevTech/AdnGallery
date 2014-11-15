///////////////////////////////////////////////////////////////////////////////
// 2D Annotation viewer Extension
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Material = function (viewer, options) {

    // base constructor
    Autodesk.Viewing.Extension.call(this, viewer, options);

    ///////////////////////////////////////////////////////////////////////////
    // Private members
    //
    ///////////////////////////////////////////////////////////////////////////
    var _materialMap = {};

    var _material = null;

    var _viewer = viewer;

    var _self = this;

    ///////////////////////////////////////////////////////////////////////////
    // load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {

        console.log("Autodesk.ADN.Viewing.Extension.Material loaded");

        _viewer = _self.viewer;

        _self.addMaterial(0xf571d6);

        _viewer.addEventListener(
            Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            _self.onItemSelected);

        $('<div/>').
            attr('id', 'colorPickerDivId').
            append('<input type="text" class="spectrum"/>').
            appendTo('#' + _viewer.clientContainer.id);

        $('#colorPickerDivId').css({

            'right': '20%',
            'top': '5%',
            'position':'absolute',
            'visibility':'visible',
            'z-index':'100'
        });

        $(".spectrum").spectrum({
            color: "#f571d6",
            change: function(color) {

                var colorHexStr = color.toHexString().
                    replace('#', '0x');

                var value = parseInt(colorHexStr, 16);

                _self.addMaterial(value);
            }
        });

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // unload callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.unload = function () {

        console.log("Autodesk.ADN.Viewing.Extension.Material unloaded");

        _viewer.removeEventListener(
            Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            _self.onItemSelected);

        _self.restoreMaterials();

        $('#colorPickerDivId').remove();

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // item selected callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onItemSelected = function (event) {

        _viewer.select([]);

        var dbId = event.dbIdArray[0];

        var fragId = event.fragIdsArray[0];

        if(typeof fragId !== 'undefined') {

            if(Array.isArray(fragId)) {

                fragId.forEach(function(subFragId){

                    var mesh = _viewer.impl.getRenderProxy(
                        _viewer,
                        subFragId);

                    if (mesh) {
                        _self.setMaterial(subFragId, mesh, _material);
                    }
                });
            }
            else {

                var mesh = _viewer.impl.getRenderProxy(
                    _viewer,
                    fragId);

                if (mesh) {
                    _self.setMaterial(fragId, mesh, _material);
                }
            }
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // set material
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.setMaterial = function (fragId, mesh, material) {

        if(!_materialMap[fragId]) {

            _materialMap[fragId] = {

                material: mesh.material
            };
        }

        mesh.material = material;

        _viewer.impl.invalidate(true);
    }

    ///////////////////////////////////////////////////////////////////////////
    // add new material
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.addMaterial = function (color) {

        function newGuid () {

            var d = new Date().getTime();

            var guid = 'xxxx-xxxx-xxxx-xxxx'.replace(
                /[xy]/g,
                function (c) {
                    var r = (d + Math.random() * 16) % 16 | 0;
                    d = Math.floor(d / 16);
                    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
                });

            return guid;
        };

        _material = new THREE.MeshPhongMaterial({color: color});

        _viewer.impl.matman().addMaterial(
            'ADN-Material-' + newGuid(),
            _material,
            true);
    }

    ///////////////////////////////////////////////////////////////////////////
    // restore initial materials
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.restoreMaterials = function () {

        for (var fragId in _materialMap) {

            var mesh = _viewer.impl.getRenderProxy(
                _viewer,
                fragId);

            mesh.material = _materialMap[fragId].material;
        };

        _materialMap = {};

        _viewer.impl.invalidate(true);
    }
};

Autodesk.ADN.Viewing.Extension.Material.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Material.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Material;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.Material',
    Autodesk.ADN.Viewing.Extension.Material);

