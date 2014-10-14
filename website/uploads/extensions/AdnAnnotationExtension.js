///////////////////////////////////////////////////////////////////////////////
// 2D Annotation viewer Extension
// Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN");

Autodesk.ADN.AnnotationExtension = function (viewer, options) {

    // base constructor
    Autodesk.Viewing.Extension.call(this, viewer, options);

    ///////////////////////////////////////////////////////////////////////////
    // Private members
    //
    ///////////////////////////////////////////////////////////////////////////
    _selectedFragment = null;

    _annotationDivId = 'adn-annotation-divId';

    _selectedId = null;

    _viewer = null;

    _self = this;

    ///////////////////////////////////////////////////////////////////////////
    // load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {

        console.log("Autodesk.ADN.AnnotationExtension loaded");

        $("<div></div>").attr('id', _annotationDivId).appendTo('body');

        $('#' + _annotationDivId).css({

            'position':'absolute',
            'width':'200px',
            'height':'50px',
            'font-family':'arial',
            'color':'white',
            'font-size':'20px',
            'visibility':'hidden',
            'z-index':'100'
        });

        _viewer = _self.viewer;

        _viewer.addEventListener(
            Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            _self.onItemSelected);

        _viewer.addEventListener(
            Autodesk.Viewing.CAMERA_CHANGE_EVENT,
            _self.onCameraChanged);

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // unload callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.unload = function () {

        console.log("Autodesk.ADN.AnnotationExtension unloaded");

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // item selected callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onItemSelected = function (event) {

        _selectedId = event.dbIdArray[0];

        _selectedFragment = event.fragIdsArray[0];

        console.log('Selected id: ' + _selectedId);
        console.log('Selected fragment: ' + _selectedFragment);

        if(typeof _selectedFragment !== 'undefined') {

            if(Array.isArray(_selectedFragment))
                _selectedFragment = _selectedFragment[0];

            _self.trackFragment(_selectedId, _selectedFragment);
        }
        else {
            $('#adnAnnotationDivId').css({'visibility':'hidden'});
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // world -> screen coords conversion
    //
    ///////////////////////////////////////////////////////////////////////////
    //Code modified from http://zachberry.com/blog/tracking-3d-objects-in-2d-with-three-js/
    _self.worldToScreen = function(mesh, camera) {

        var v, percX, percY, left, top;

        // this will give us position relative to the world
        var pos = new THREE.Vector3();

        pos.setFromMatrixPosition(mesh.matrixWorld);

        // projectVector will translate position to 2d
        var projector = new THREE.Projector();

        v = projector.projectVector(pos, camera);

        // translate our vector so that percX=0 represents
        // the left edge, percX=1 is the right edge,
        // percY=0 is the top edge, and percY=1 is the bottom edge.
        percX = (v.x + 1) / 2;
        percY = (-v.y + 1) / 2;

        // scale these values to our viewport size
        left = percX * 1200;

        if (left > 1200) left = 1200;
        top = percY * 400;

        if (top > 400) top = 400;
        return new THREE.Vector2(left, top);
    };

    //better way to do ...
    /*function worldToClient(point, camera) {

     var p = new THREE.Vector4();

     p.x = point.x;
     p.y = point.y;
     p.z = point.z;
     p.w = 1;

     p.applyMatrix4(camera.matrixWorldInverse);
     p.applyMatrix4(camera.projectionMatrix);

     // don't want to mirror values with negative z (behind camera)
     // if camera is inside the bounding box, better to throw markers to the screen sides.
     if (p.w > 0)
     {
     p.x /= p.w;
     p.y /= p.w;
     p.z /= p.w;
     }

     //This one is multiplying by width/2 and –height/2, and offsetting by canvas location
     point = this.viewer.impl.viewportToClient(p.x, p.y);

     // snap to the center of the pixel
     point.x = Math.floor(point.x) + 0.5;
     point.y = Math.floor(point.y) + 0.5;

     //Canvas is the HTML Canvas of the viewer instance
     var clientRect = canvas.getBoundingClientRect();

     //Not sure you need this – depends on what you need the pixel coordinates relative to
     point.x -= clientRect.left;
     point.y -= clientRect.top;

     return point;
     }*/

    ///////////////////////////////////////////////////////////////////////////
    // Get Property Value
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.getPropertyValue = function (dbId, displayName, callback) {

            function _cb(result) {

                if (result.properties) {

                    for (var i = 0; i < result.properties.length; i++) {

                        var prop = result.properties[i];

                        if (prop.displayName === displayName) {

                            callback(prop.displayValue);
                            return;
                        }
                    }

                    callback('undefined');
                }
            }

            _viewer.getProperties(dbId, _cb);
    };

    ///////////////////////////////////////////////////////////////////////////
    // track fragment
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.trackFragment = function(id, fragment) {

        _self.getPropertyValue(id, 'label',

            function(value){

                $('#' + _annotationDivId).text(value);

                $('#' + _annotationDivId).css(
                    {'visibility':'visible'}
                );

                _self.onCameraChanged();
            });
    };

    ///////////////////////////////////////////////////////////////////////////
    // camera changed callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onCameraChanged = function(event) {

        if(typeof _selectedFragment === 'undefined') {

            $('#' + _annotationDivId).css({
                'visibility':'hidden'
            });

            return;
        }

        var mesh = _viewer.impl.getRenderProxy(
            _viewer,
            _selectedFragment);

        if (mesh) {

            var screenCoords = _self.worldToScreen(
                mesh,
                _viewer.getCamera());

            $('#' + _annotationDivId).css({
                'left': screenCoords.x.toString() + "px",
                'top': screenCoords.y.toString() + "px"
            });
        }
        else {
            $('#' + _annotationDivId).css({
                'visibility':'hidden'
            });
        }
    };
};

Autodesk.ADN.AnnotationExtension.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.AnnotationExtension.prototype.constructor =
    Autodesk.ADN.AnnotationExtension;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'AnnotationExtension',
    Autodesk.ADN.AnnotationExtension);

