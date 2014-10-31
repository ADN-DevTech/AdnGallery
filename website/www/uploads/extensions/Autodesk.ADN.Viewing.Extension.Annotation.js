///////////////////////////////////////////////////////////////////////////////
// 2D Annotation viewer Extension
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Annotation = function (viewer, options) {

    // base constructor
    Autodesk.Viewing.Extension.call(this, viewer, options);

    ///////////////////////////////////////////////////////////////////////////
    // Private members
    //
    ///////////////////////////////////////////////////////////////////////////
    var _annotationDivId = 'adn-annotation-divId';

    var _worldPoint = null;

    var _viewer = viewer;

    var _self = this;

    ///////////////////////////////////////////////////////////////////////////
    // load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {

        console.log("Autodesk.ADN.Viewing.Extension.Annotation loaded");

        $("<div></div>").attr('id', _annotationDivId).appendTo('body');

        $('#' + _annotationDivId).css({

            'position':'absolute',
            'font-family':'arial',
            'color':'#ED1111',
            'font-size':'20px',
            'visibility':'hidden',
            'z-index':'100'
        });

        _viewer = _self.viewer;

        $("#" + _viewer.clientContainer.id).
            bind("click", _self.onMouseClick);

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

        console.log("Autodesk.ADN.Viewing.Extension.Annotation unloaded");

        $("#" + _viewer.clientContainer.id).
            unbind("click", _self.onMouseClick);

        _viewer.removeEventListener(
            Autodesk.Viewing.CAMERA_CHANGE_EVENT,
            _self.onCameraChanged);

        $('#' + _annotationDivId).remove();

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // mouse click callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onMouseClick = function(event) {

        var screenPoint = getMousePosition(event);

        var hit = _viewer.impl.hitTest(
            screenPoint.x,
            screenPoint.y);

        if(hit.node) {

            _worldPoint = hit.intersectPoint;

            _self.getPropertyValue(hit.node, 'label',

                function(value){

                    $('#' + _annotationDivId).text(value);

                    $('#' + _annotationDivId).css(
                        {'visibility':'visible'}
                    );

                    _self.onCameraChanged();
                });
        }
        else {

            _worldPoint = null;

            $('#adnAnnotationDivId').css({'visibility':'hidden'});
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // world -> screen coords conversion
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.worldToScreen = function(worldPoint, camera) {

         var p = new THREE.Vector4();

         p.x = worldPoint.x;
         p.y = worldPoint.y;
         p.z = worldPoint.z;
         p.w = 1;

         p.applyMatrix4(camera.matrixWorldInverse);
         p.applyMatrix4(camera.projectionMatrix);

         // Don't want to mirror values with negative z (behind camera)
         // if camera is inside the bounding box,
         // better to throw markers to the screen sides.
         if (p.w > 0)
         {
             p.x /= p.w;
             p.y /= p.w;
             p.z /= p.w;
         }

         // This one is multiplying by width/2 and –height/2,
         // and offsetting by canvas location
         point = _viewer.impl.viewportToClient(p.x, p.y);

         // snap to the center of the pixel
         point.x = Math.floor(point.x) + 0.5;
         point.y = Math.floor(point.y) + 0.5;

         return point;
     }

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
    // camera changed callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onCameraChanged = function(event) {

        if (_worldPoint) {

            var screenPoint = _self.worldToScreen(
                _worldPoint,
                _viewer.getCamera());

            $('#' + _annotationDivId).css({
                'left': screenPoint.x.toString() + "px",
                'top': screenPoint.y.toString() + "px"
            });
        }
        else {
            $('#' + _annotationDivId).css({
                'visibility':'hidden'
            });
        }
    };

    ///////////////////////////////////////////////////////////////////////////
    // return mouse position
    //
    ///////////////////////////////////////////////////////////////////////////
    function getMousePosition(event) {

        var element = event.currentTarget;

        var x = 0;
        var y = 0;

        while (element) {

            x += element.offsetLeft -
                element.scrollLeft +
                element.clientLeft;

            y += element.offsetTop -
                element.scrollTop +
                element.clientTop;

            element = element.offsetParent;
        }

        x = event.clientX - x;
        y = event.clientY - y;

        return { x: x, y: y };
    }
};

Autodesk.ADN.Viewing.Extension.Annotation.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Annotation.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Annotation;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.2dAnnotation',
    Autodesk.ADN.Viewing.Extension.Annotation);

