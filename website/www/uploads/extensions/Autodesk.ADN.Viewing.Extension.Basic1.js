///////////////////////////////////////////////////////////////////////////////
// Basic viewer extension
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Basic = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _self = this;

    _self.load = function () {

        alert('Autodesk.ADN.Viewing.Extension.Basic1 loaded');
        return true;
    };

    _self.unload = function () {

        console.log('Autodesk.ADN.Viewing.Extension.Basic1 unloaded');

        Autodesk.Viewing.theExtensionManager.unregisterExtension(
            'Autodesk.ADN.Viewing.Extension.Basic');

        return true;
    };
};

Autodesk.ADN.Viewing.Extension.Basic.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Basic.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Basic;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.Basic',
    Autodesk.ADN.Viewing.Extension.Basic);

