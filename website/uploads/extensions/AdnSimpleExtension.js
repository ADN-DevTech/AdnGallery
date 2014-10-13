

//var Autodesk = Autodesk || {};
//Autodesk.ADN = Autodesk.ADN || {};

AutodeskNamespace("Autodesk.ADN");

Autodesk.ADN.SimpleExtension = function (viewer, options) {
    Autodesk.Viewing.Extension.call(this, viewer, options);
};

Autodesk.ADN.SimpleExtension.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.SimpleExtension.prototype.constructor =
    Autodesk.ADN.SimpleExtension;

Autodesk.ADN.SimpleExtension.prototype.load = function () {

    console.log("Autodesk.ADN.SimpleExtension loaded");
    return true;
};

Autodesk.ADN.SimpleExtension.prototype.unload = function () {
    
    console.log("Autodesk.ADN.SimpleExtension unloaded");
    return true;
};

Autodesk.Viewing.theExtensionManager.registerExtension(
    'AdnSimpleExtension',
    Autodesk.ADN.SimpleExtension);
