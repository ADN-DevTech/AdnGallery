///////////////////////////////////////////////////////////////////////////////
// 2D Annotation viewer Extension
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN");

Autodesk.ADN.MaterialExtension = function (viewer, options) {

    // base constructor
    Autodesk.Viewing.Extension.call(this, viewer, options);

    ///////////////////////////////////////////////////////////////////////////
    // Private members
    //
    ///////////////////////////////////////////////////////////////////////////
    var _selectedFragment = null;

    var _selectedId = null;

    var _materialMap = {};

    var _material = null;

    var _viewer = viewer;

    var _self = this;

    ///////////////////////////////////////////////////////////////////////////
    // load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {

        console.log("Autodesk.ADN.MaterialExtension loaded");

        _viewer = _self.viewer;

        _self.setMaterial(0xf571d6);

        _viewer.addEventListener(
            Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            _self.onItemSelected);

        $(document).keyup(function (e) {
            // esc
            if (e.keyCode == 27) {
                _self.restoreMaterials();
            }
        });

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

                _self.setMaterial(value);
            }
        });

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // unload callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.unload = function () {

        console.log("Autodesk.ADN.MaterialExtension unloaded");

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

        _selectedId = event.dbIdArray[0];

        _selectedFragment = event.fragIdsArray[0];

        if(typeof _selectedFragment !== 'undefined') {

            if(Array.isArray(_selectedFragment))
                _selectedFragment = _selectedFragment[0];

            var mesh = _viewer.impl.getRenderProxy(
                _viewer,
                _selectedFragment);

            if (mesh) {

                if(!_materialMap[_selectedFragment]) {

                    _materialMap[_selectedFragment] = {

                        material: mesh.material
                    };
                }

                mesh.material = _material;

                _viewer.impl.invalidate(true)
            }
        }
        else {

        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // set current material
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.setMaterial = function (color) {

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

            _viewer.impl.invalidate(true);
        };

        _materialMap = {};
    }
};

Autodesk.ADN.MaterialExtension.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.MaterialExtension.prototype.constructor =
    Autodesk.ADN.MaterialExtension;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Material',
    Autodesk.ADN.MaterialExtension);

