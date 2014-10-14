AutodeskNamespace("Autodesk.ADN");

Autodesk.ADN.SimpleExtension = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    _self = this;

    _self.load = function () {

        console.log("Autodesk.ADN.SimpleExtension loaded");
        return true;
    };

    _self.unload = function () {

        console.log("Autodesk.ADN.SimpleExtension unloaded");
        return true;
    };
};

Autodesk.ADN.SimpleExtension.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.SimpleExtension.prototype.constructor =
    Autodesk.ADN.SimpleExtension;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'AdnSimpleExtension',
    Autodesk.ADN.SimpleExtension);
