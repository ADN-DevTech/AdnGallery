///////////////////////////////////////////////////////////////////////////////
// 2D Annotation viewer Extension
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.MarkUpContextMenu = function (viewer) {
    Autodesk.Viewing.Extensions.ViewerObjectContextMenu.call(this, viewer);
};

Autodesk.ADN.Viewing.Extension.MarkUpContextMenu.prototype =
    Object.create(Autodesk.Viewing.Extensions.ViewerObjectContextMenu.prototype);

Autodesk.ADN.Viewing.Extension.MarkUpContextMenu.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.MarkUpContextMenu;

Autodesk.ADN.Viewing.Extension.MarkUpContextMenu.prototype.buildMenu =

    function (event, status) {

        var menu =  Autodesk.Viewing.Extensions.ViewerObjectContextMenu.prototype.buildMenu.call(
            this, event, status);

        menu.push({
            title: "MarkUpContextMenu",
            target: function () {
                console.log("MarkUpContextMenu");
            }
        });

        return menu;
    };


Autodesk.ADN.Viewing.Extension.Annotation = function (viewer, options) {

    // base constructor
    Autodesk.Viewing.Extension.call(this, viewer, options);

    ///////////////////////////////////////////////////////////////////////////
    // Private members
    //
    ///////////////////////////////////////////////////////////////////////////
    var ModeEnum = {

        kModeIddle: 0,
        kModeInitDrag: 1,
        kModeDrag: 2
    };

    var _mode = ModeEnum.kModeIddle;

    var _viewer = viewer;

    var _markUps =  [];

    var _self = this;

    ///////////////////////////////////////////////////////////////////////////
    // load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {

        _self.viewer.setContextMenu(
            new Autodesk.ADN.Viewing.Extension.MarkUpContextMenu(_self.viewer));

        $("#" + _viewer.clientContainer.id).
            bind("click", _self.onMouseClick);

        window.onresize = function(event) {

            _markUps.forEach(function(markUp){

                _self.updateMarkUp(markUp);
            })
        };

        _viewer.addEventListener(
            Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            _self.onItemSelected);

        _self.overlay = _self.createOverlay();

        console.log("Autodesk.ADN.Viewing.Extension.Annotation loaded");

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // unload callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.unload = function () {

        _self.viewer.setContextMenu(null);

        $("#" + _viewer.clientContainer.id).
            unbind("click", _self.onMouseClick);

        _viewer.removeEventListener(
            Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            _self.onItemSelected);

        _viewer.removeEventListener(
            Autodesk.Viewing.CAMERA_CHANGE_EVENT,
            _self.onCameraChanged);

        _markUps.forEach(function(markUp){

            deleteMarkUp(markUp);
        })

        console.log("Autodesk.ADN.Viewing.Extension.Annotation unloaded");

        return true;
    };


    ///////////////////////////////////////////////////////////////////////////
    // creates new markup
    //
    ///////////////////////////////////////////////////////////////////////////
    function newMarkUp(dbId) {

        var divId = newGuid();

        $("<div></div>").attr('id', divId).appendTo('body');

        $('#' + divId).css({

            'position':'absolute',
            'font-family':'arial',
            'color':'#ED1111',
            'font-size':'20px',
            'visibility':'hidden',
            'z-index':'100',
            'pointer-events':'none'
        });

        $('#' + divId).hover(function(){
                console.log('Hover on: ' + divId);
            },
            function(){
                console.log('Hover off: ' + divId);
            });

        $('#' + divId).on('contextmenu',
            function (e) {

                e.preventDefault();

                $("#" + _viewer.clientContainer.id).
                    trigger('contextmenu');
            });

        var path = _self.overlay.path(
            "M 0,0 L 0,0");

        path.attr({
            'stroke-width': '2',
            'opacity': '1'
        });

        var connector = _self.overlay.circle(
            0, 0, 5.0);

        connector.attr("fill", "red");

        var markUp = {

            dbId: dbId,
            line: path,
            divId: divId,
            textPos: null,
            connector: connector,
            attachmentPoint: null
        };

        return markUp;
    }

    ///////////////////////////////////////////////////////////////////////////
    // delete a markUp
    //
    ///////////////////////////////////////////////////////////////////////////
    function deleteMarkUp(markUp) {

        $('#' + markUp.divId).remove();

        markUp.connector.remove();

        markUp.line.remove();
    }

    ///////////////////////////////////////////////////////////////////////////
    // item selected callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onItemSelected = function (event) {

        var dbId = event.dbIdArray[0];

        if (typeof dbId !== 'undefined') {

            switch (_mode) {

                case ModeEnum.kModeIddle:

                    _mode = ModeEnum.kModeInitDrag;

                    var markUp = newMarkUp(dbId);

                    _markUps.push(markUp);

                default:
                    break;
            }
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // mouse click callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onMouseClick = function(event) {

        var screenPoint = {
            x: event.clientX,
            y: event.clientY
        };


        switch (_mode) {

            case ModeEnum.kModeInitDrag:

                var n = _self.normalizeCoords(screenPoint);

                var hitPoint = _viewer.utilities.getHitPoint(
                    n.x,
                    n.y);

                if (hitPoint) {

                    var markUp = _markUps[_markUps.length -1];

                    markUp.attachmentPoint = hitPoint;

                    markUp.textPos = screenPoint;

                    _self.updateMarkUp(markUp);

                    $("#" + _viewer.clientContainer.id).
                        bind("mousemove", _self.onMouseMove);

                    _viewer.addEventListener(
                        Autodesk.Viewing.CAMERA_CHANGE_EVENT,
                        _self.onCameraChanged);

                    _mode = ModeEnum.kModeDrag;

                    _markUps.push(markUp);

                    _self.getPropertyValue(markUp.dbId, 'label',

                        function (value) {

                            $('#' + markUp.divId).text(value);

                            $('#' + markUp.divId).css(
                                {'visibility': 'visible'}
                            );
                        });
                }

                break;

            case ModeEnum.kModeDrag:

                $("#" + _viewer.clientContainer.id).
                    unbind("mousemove", _self.onMouseMove);

                var markUp = _markUps[_markUps.length -1];

                $('#' + markUp.divId).css({

                    'pointer-events':'auto'
                });

                _mode = ModeEnum.kModeIddle;

            default: break;
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // normalize screen coordinates
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.normalizeCoords = function(screenPoint) {

        var viewport =
            _viewer.navigation.getScreenViewport();

        var n = {
            x: (screenPoint.x - viewport.left) / viewport.width,
            y: (screenPoint.y - viewport.top) / viewport.height
        };

        return n;
    }

    ///////////////////////////////////////////////////////////////////////////
    // mouse move callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onMouseMove = function(event) {

        var screenPoint = {
            x: event.clientX,
            y: event.clientY
        };

        var markUp = _markUps[_markUps.length-1];

        markUp.textPos = screenPoint;

        _self.updateMarkUp(markUp);
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
    // screen to world coordinates conversion
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.screenToWorld = function(event) {

        var screenPoint = {
            x: event.clientX,
            y: event.clientY
        };

        var viewport =
            _viewer.navigation.getScreenViewport();

        var n = {
            x: (screenPoint.x - viewport.left) / viewport.width,
            y: (screenPoint.y - viewport.top) / viewport.height
        };

        return _viewer.navigation.getWorldPoint(n.x, n.y);
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

        _markUps.forEach(function(markUp){

            _self.updateMarkUp(markUp);
        })
    };

    ///////////////////////////////////////////////////////////////////////////
    // update markUp graphics
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.updateMarkUp = function(markUp) {

        var screenPoint = _self.worldToScreen(
            markUp.attachmentPoint,
            _viewer.getCamera());

        var offset = getClientOffset(
            _viewer.clientContainer);

        markUp.connector.attr({
            cx: screenPoint.x - offset.x,
            cy: screenPoint.y - offset.y
        });

        markUp.line.attr({
            path:
                "M" + (screenPoint.x - offset.x) +
                "," + (screenPoint.y - offset.y) +
                "L" + (markUp.textPos.x - offset.x) +
                "," + (markUp.textPos.y - offset.y)
        });

        var divYOffset = 30;

        if(screenPoint.y - markUp.textPos.y < 0)
            divYOffset = 0;

        var w = $('#' + markUp.divId).width();

        $('#' + markUp.divId).css({
            'left': (markUp.textPos.x - w * 0.5).toString() + "px",
            'top':(markUp.textPos.y - divYOffset).toString() + "px"
        });
    };

    ///////////////////////////////////////////////////////////////////////////
    // create overlay 2d canvas
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.createOverlay = function () {

        if (typeof Raphael === 'undefined') {
            return null;
        }

        var overlayDiv = document.createElement("div");

        overlayDiv.id = 'overlayDivId';

        _viewer.clientContainer.appendChild(
            overlayDiv);

        overlayDiv.style.top = "0";
        overlayDiv.style.left = "0";
        overlayDiv.style.right = "0";
        overlayDiv.style.bottom = "0";
        overlayDiv.style.zIndex = "1";
        overlayDiv.style.position = "absolute";
        overlayDiv.style.pointerEvents = "none";

        var overlay = new Raphael(
            overlayDiv,
            overlayDiv.clientWidth,
            overlayDiv.clientHeight);

        return overlay;
    }

    ///////////////////////////////////////////////////////////////////////////
    // return mouse position
    //
    ///////////////////////////////////////////////////////////////////////////
    function getClientOffset(element) {

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

        return { x: x, y: y };
    }

    ///////////////////////////////////////////////////////////////////////////
    // Generate GUID
    //
    ///////////////////////////////////////////////////////////////////////////
    function newGuid() {

        var d = new Date().getTime();

        var guid = 'xxxx-xxxx-xxxx-xxxx-xxxx'.replace(
            /[xy]/g,
            function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
            });

        return guid;
    };
};

Autodesk.ADN.Viewing.Extension.Annotation.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Annotation.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Annotation;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.2dAnnotation',
    Autodesk.ADN.Viewing.Extension.Annotation);

