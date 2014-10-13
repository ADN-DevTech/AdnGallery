

//var Autodesk = Autodesk || {};
//Autodesk.ADN = Autodesk.ADN || {};

AutodeskNamespace("Autodesk.ADN");

Autodesk.ADN.SimpleExtension2 = function (viewer, options) {
    Autodesk.Viewing.Extension.call(this, viewer, options);
};

Autodesk.ADN.SimpleExtension2.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.SimpleExtension2.prototype.constructor =
    Autodesk.ADN.SimpleExtension2;

Autodesk.ADN.SimpleExtension2.prototype.load = function () {

    console.log("Autodesk.ADN.SimpleExtension2 loaded");
    return true;
};

Autodesk.ADN.SimpleExtension2.prototype.unload = function () {
    
    console.log("Autodesk.ADN.SimpleExtension2 unloaded");
    return true;
};

Autodesk.Viewing.theExtensionManager.registerExtension(
    'AdnSimpleExtension2',
    Autodesk.ADN.SimpleExtension2);
