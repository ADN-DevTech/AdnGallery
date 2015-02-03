///////////////////////////////////////////////////////////////////////////////
// Basic viewer extension
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Layers = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _self = this;

    var _viewer = viewer;

    _self.load = function () {

        var root = _viewer.model.getLayersRoot();

        if(root == null) {

            console.log("No layer information...");
            return;
        }

        console.log(root);

        for (var i = 0; i < root.childCount; i++) {

            var group = root.children[i];

            console.log(group);

            for (var j = 0; j < group.childCount; j++) {

                var layer = group.children[j];

                if (layer.name === "ORN-A-B-01-BDYGRD-XX-XXXX-MAS|A-Cols") {

                    _viewer.setLayerVisible([layer], true, true);
                }
            }
        }

        console.log('Autodesk.ADN.Viewing.Extension.Layers loaded');
        return true;
    };

    _self.unload = function () {

        console.log('Autodesk.ADN.Viewing.Extension.Layers unloaded');
        return true;
    };
};

Autodesk.ADN.Viewing.Extension.Layers.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Layers.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Layers;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.Layers',
    Autodesk.ADN.Viewing.Extension.Layers);

