///////////////////////////////////////////////////////////////////////////////
// GithubDemo viewer Extension
// by Philippe Leefsma, March 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.GithubDemo = function (viewer, options) {

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

    var _selectedMarkUpId = null;

    var _currentMarkUp = null;

    var _viewer = viewer;

    var _markUps = {};

    var _self = this;

    ///////////////////////////////////////////////////////////////////////////
    // load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {

        require([

            'https://rawgit.com/DmitryBaranovskiy/raphael/master/raphael-min.js',
            'https://rawgit.com/CreateJS/TweenJS/master/lib/tweenjs-0.6.0.combined.js'

        ], function() {

            var rotate = false;
            var explode = false;
            var annotate = false;


            $('<div/>').
                attr('id', 'buttonsDivId').
                append('<button style="width:50px" id="rotateBtn" type="button">Rotate</button>').
                append('<br>').
                append('<button style="width:50px" id="explodeBtn" type="button">Explode</button>').
                append('<br>').
                append('<button style="width:50px" id="annotateBtn" type="button">Annotate</button>').
                appendTo('#' + _viewer.container.id);

            $('#buttonsDivId').css({
                'top': '25%',
                'left': '1.5%',
                'z-index':'100',
                'position':'absolute'
            });

            $('#rotateBtn').click(function(){

                rotate = !rotate;

                if(rotate) {
                    viewer.startRotateMotion(
                        0.3, viewer.navigation.getWorldUpVector());

                    $('#rotateBtn').css({
                        'background-color': '#1CF055',
                        'border-radius': '5px'
                    });
                }
                else {
                    viewer.stopRotateMotion();

                    $('#rotateBtn').css({
                        'background-color': '#FFFFFF',
                        'border-radius': '5px'
                    });
                }
            });

            $('#explodeBtn').click(function(){

                explode = !explode;

                if(explode) {
                    viewer.startExplodeMotion(
                        0.2, 0.1, 1.5);

                    $('#explodeBtn').css({
                        'background-color': '#1CF055',
                        'border-radius': '5px'
                    });
                }
                else {
                    viewer.stopExplodeMotion();

                    $('#explodeBtn').css({
                        'background-color': '#FFFFFF',
                        'border-radius': '5px'
                    });
                }


            });

            $('#annotateBtn').click(function(){

                annotate = !annotate;

                if(annotate) {

                    activateAnnotate();
                }
                else {

                    deActivateAnnotate();
                }
            });


            function activateAnnotate() {

                $('#annotateBtn').css({
                    'background-color': '#1CF055',
                    'border-radius': '5px'
                });

                $("#" + _viewer.container.id).
                    bind("click", _self.onMouseClick);

                _viewer.addEventListener(
                    Autodesk.Viewing.SELECTION_CHANGED_EVENT,
                    _self.onItemSelected);

                _viewer.setPropertyPanel(null);
            }

            function deActivateAnnotate() {

                $('#annotateBtn').css({
                    'background-color': '#FFFFFF',
                    'border-radius': '5px'
                });

                var panel = new Autodesk.Viewing.Extensions.ViewerPropertyPanel(
                    _viewer);

                _viewer.setPropertyPanel(panel);

                $("#" + _viewer.container.id).
                    unbind("click", _self.onMouseClick);

                _viewer.removeEventListener(
                    Autodesk.Viewing.SELECTION_CHANGED_EVENT,
                    _self.onItemSelected);
            }

            // context menu stuff

            Autodesk.ADN.Viewing.Extension.MarkUpContextMenu = function (viewer) {

                Autodesk.Viewing.Extensions.ViewerObjectContextMenu.call(
                    this, viewer);
            };

            Autodesk.ADN.Viewing.Extension.MarkUpContextMenu.prototype =
                Object.create(Autodesk.Viewing.Extensions.ViewerObjectContextMenu.prototype);

            Autodesk.ADN.Viewing.Extension.MarkUpContextMenu.prototype.constructor =
                Autodesk.ADN.Viewing.Extension.MarkUpContextMenu;

            Autodesk.ADN.Viewing.Extension.MarkUpContextMenu.prototype.buildMenu =

                function (event, status) {

                    if(typeof event.markUp !== 'undefined') {

                        var menu = [{

                            title: "Delete annotation",
                            target: function () {
                                deleteMarkUp(event.markUp);
                            }
                        }];

                        return menu;
                    }
                    else {

                        var menu =  Autodesk.Viewing.Extensions.ViewerObjectContextMenu.
                            prototype.buildMenu.call(
                            this, event, status);

                        return menu;
                    }
                };

            _self.viewer.setContextMenu(
                new Autodesk.ADN.Viewing.Extension.MarkUpContextMenu(
                    _self.viewer));

            _viewer.addEventListener(
                Autodesk.Viewing.EXPLODE_CHANGE_EVENT,
                _self.onExplode);

            _self.createOverlay(function(overlay) {
                _self.overlay = overlay;
            });

            console.log("Autodesk.ADN.Viewing.Extension.GithubDemo loaded");

            return true;
        });
    };

    ///////////////////////////////////////////////////////////////////////////
    // unload callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.unload = function () {

        _viewer.setContextMenu(null);

        console.log("Autodesk.ADN.Viewing.Extension.GithubDemo unloaded");

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // creates new markup
    //
    ///////////////////////////////////////////////////////////////////////////
    function newMarkUp(dbId, fragId) {

        var divId = newGuid();

        $("<div></div>").attr('id', divId).appendTo(
            "#ViewerDiv");

        $('#' + divId).css({

            'position':'absolute',
            'font-family':'arial',
            'color':'#ED1111',
            'font-size':'20px',
            'visibility':'hidden',
            'z-index':'999',
            'pointer-events':'none'
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
            fragId: fragId,
            line: path,
            divId: divId,
            textPos: null,
            connector: connector,
            attachmentPoint: null,
            position: _self.getMeshPosition(fragId)
        };

        $('#' + divId).hover(function(){

                _selectedMarkUpId  = this.id;
            },
            function(){

                _selectedMarkUpId = null;
            });

        $('#' + divId).on('contextmenu',
            function (e) {

                e.preventDefault();

                e.markUp = _markUps[_selectedMarkUpId];

                if(e.markUp.screenPoint.y - e.markUp.textPos.y < 0){

                    e.clientX = $('#' + divId).offset().left;
                    e.clientY = $('#' + divId).offset().top + 25;
                }
                else {

                    e.clientX = $('#' + divId).offset().left;
                    e.clientY = $('#' + divId).offset().top - 25;
                }

                _viewer.contextMenu.show(e);
            });

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

        delete _markUps[markUp.divId];
    }

    ///////////////////////////////////////////////////////////////////////////
    // item selected callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onItemSelected = function (event) {

        _viewer.select([]);

        var dbId = event.dbIdArray[0];

        var fragId = event.fragIdsArray[0];

        if (typeof dbId !== 'undefined') {

            switch (_mode) {

                case ModeEnum.kModeIddle:

                    _mode = ModeEnum.kModeInitDrag;

                    if (Array.isArray(fragId))
                        fragId = fragId[0];

                    _currentMarkUp =
                        newMarkUp(dbId, fragId);

                    _markUps[_currentMarkUp.divId] =
                        _currentMarkUp;

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

                    var markUp = _currentMarkUp;

                    markUp.attachmentPoint = hitPoint;

                    markUp.textPos = screenPoint;

                    _self.updateMarkUp(markUp);

                    $("#" + _viewer.container.id).
                        bind("mousemove", _self.onMouseMove);

                    _viewer.addEventListener(
                        Autodesk.Viewing.CAMERA_CHANGE_EVENT,
                        _self.onCameraChanged);

                    _mode = ModeEnum.kModeDrag;

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

                $("#" + _viewer.container.id).
                    unbind("mousemove", _self.onMouseMove);

                var markUp = _currentMarkUp;

                $('#' + markUp.divId).css({

                    'pointer-events':'auto'
                });

                _mode = ModeEnum.kModeIddle;

                _currentMarkUp = null;

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

        var markUp = _currentMarkUp;

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

        // This one is multiplying by width/2 and â€“height/2,
        // and offsetting by canvas location
        var point = _viewer.impl.viewportToClient(p.x, p.y);

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

        _self.updateMarkUps();
    };

    ///////////////////////////////////////////////////////////////////////////
    // explode changed callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onExplode = function(event) {

        _self.updateMarkUps();
    };

    ///////////////////////////////////////////////////////////////////////////
    // update markUp graphics
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.updateMarkUp = function(markUp) {

        var pos = _self.getMeshPosition(
            markUp.fragId);

        var translation = {

            x: pos.x - markUp.position.x,
            y: pos.y - markUp.position.y,
            z: pos.z - markUp.position.z
        }

        var attachmentPoint = {

            x: markUp.attachmentPoint.x + translation.x,
            y: markUp.attachmentPoint.y + translation.y,
            z: markUp.attachmentPoint.z + translation.z
        }

        var screenPoint = _self.worldToScreen(
            attachmentPoint,
            _viewer.getCamera());

        var offset = getClientOffset(
            document.getElementById('ViewerDiv'));

        markUp.screenPoint = screenPoint;

        markUp.connector.attr({
            cx: screenPoint.x,
            cy: screenPoint.y
        });

        markUp.line.attr({
            path:
            "M" + (screenPoint.x) +
            "," + (screenPoint.y) +
            "L" + (markUp.textPos.x - offset.x) +
            "," + (markUp.textPos.y - offset.y)
        });

        var divYOffset = 30;

        if(screenPoint.y - markUp.textPos.y < 0)
            divYOffset = 0;

        var w = $('#' + markUp.divId).width();

        $('#' + markUp.divId).css({
            'left': (markUp.textPos.x - offset.x - w * 0.25).toString() + "px",
            'top':(markUp.textPos.y - divYOffset - offset.y).toString() + "px"
        });
    };

    _self.updateMarkUps = function() {

        for(var key in _markUps){

            _self.updateMarkUp(_markUps[key]);
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // create overlay 2d canvas
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.createOverlay = function (callback) {

        if (typeof Raphael === 'undefined') {
            callback(null);
        }

        var overlayDiv = document.createElement("div");

        overlayDiv.id = 'overlayDivId';

        _viewer.container.appendChild(
            overlayDiv);

        overlayDiv.style.top = "0";
        overlayDiv.style.left = "0";
        overlayDiv.style.right = "0";
        overlayDiv.style.bottom = "0";
        overlayDiv.style.zIndex = "999";
        overlayDiv.style.position = "absolute";
        overlayDiv.style.pointerEvents = "none";

        var overlay = new Raphael(
            overlayDiv,
            overlayDiv.clientWidth,
            overlayDiv.clientHeight);

        callback(overlay);
    }

    ///////////////////////////////////////////////////////////////////////////
    // get mesh postion
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.getMeshPosition = function(fragId) {

        var mesh = _viewer.impl.getRenderProxy(
            _viewer,
            fragId);

        var pos = new THREE.Vector3();

        pos.setFromMatrixPosition(mesh.matrixWorld);

        return pos;
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

Autodesk.ADN.Viewing.Extension.GithubDemo.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.GithubDemo.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.GithubDemo;

Autodesk.Viewing.theExtensionManager.registerExtension(
    '_Autodesk.ADN.Viewing.Extension.GithubDemo',
    Autodesk.ADN.Viewing.Extension.GithubDemo);