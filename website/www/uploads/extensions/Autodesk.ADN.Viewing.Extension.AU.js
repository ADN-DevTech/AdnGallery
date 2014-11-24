///////////////////////////////////////////////////////////////////////////////
// Basic viewer extension
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.AU = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _self = this;

    _self.load = function () {

        alert('Welcome to AU 2014!');

        return true;
    };

    _self.unload = function () {

        alert('See you next year!');

        return true;
    };
};

Autodesk.ADN.Viewing.Extension.AU.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.AU.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.AU;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.AutodeskUniversity',
    Autodesk.ADN.Viewing.Extension.AU);

