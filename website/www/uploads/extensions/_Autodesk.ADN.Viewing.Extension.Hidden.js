///////////////////////////////////////////////////////////////////////////////
// Hidden viewer extension
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Hidden = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _self = this;

    _self.load = function () {

        alert('Autodesk.ADN.Viewing.Extension.Hidden loaded');
        return true;
    };

    _self.unload = function () {

        console.log('Autodesk.ADN.Viewing.Extension.Hidden unloaded');
        return true;
    };
};

Autodesk.ADN.Viewing.Extension.Hidden.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Hidden.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Hidden;

Autodesk.Viewing.theExtensionManager.registerExtension(
    '_Autodesk.ADN.Viewing.Extension.Hidden',
    Autodesk.ADN.Viewing.Extension.Hidden);

