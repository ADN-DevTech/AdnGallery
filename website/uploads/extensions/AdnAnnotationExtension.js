

AutodeskNamespace("Autodesk.ADN");

Autodesk.ADN.AnnotationExtension = function (viewer, options) {
    Autodesk.Viewing.Extension.call(this, viewer, options);
};

Autodesk.ADN.AnnotationExtension.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.AnnotationExtension.prototype.constructor =
    Autodesk.ADN.AnnotationExtension;

Autodesk.ADN.AnnotationExtension.prototype.load = function () {

    console.log("Autodesk.ADN.AnnotationExtension loaded");
    return true;
};

Autodesk.ADN.AnnotationExtension.prototype.unload = function () {
    
    console.log("Autodesk.ADN.AnnotationExtension unloaded");

    var viewer = this.viewer;

    viewer.addEventListener(
        Autodesk.Viewing.SELECTION_CHANGED_EVENT,
        Autodesk.ADN.AnnotationExtension.onItemSelected);

    viewer.addEventListener(
        Autodesk.Viewing.CAMERA_CHANGE_EVENT,
        Autodesk.ADN.AnnotationExtension.onCameraChanged);

    return true;
};

Autodesk.ADN.AnnotationExtension.onItemSelected = function (event) {

    var id = event.dbIdArray[0];

    console.log("onItemSelected: " + id);
}

Autodesk.Viewing.theExtensionManager.registerExtension(
    'AnnotationExtension',
    Autodesk.ADN.AnnotationExtension);
