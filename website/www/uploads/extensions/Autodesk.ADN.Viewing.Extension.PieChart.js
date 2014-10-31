///////////////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.Basic
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.PieChart = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    _self = this;

    _self.load = function () {

        console.log('Autodesk.ADN.Viewing.Extension.PieChart loaded');

        $('#mainLayoutId').layout().show('east');

        $('#eastLayoutId').
            append('<input type="file" name="file" id="meshFileInputId">');

        return true;
    };

    _self.unload = function () {

        console.log('Autodesk.ADN.Viewing.Extension.PieChart unloaded');

        $('#mainLayoutId').layout().hide('east');

        return true;
    };
};

Autodesk.ADN.Viewing.Extension.PieChart.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.PieChart.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.PieChart;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.PieChart',
    Autodesk.ADN.Viewing.Extension.PieChart);

