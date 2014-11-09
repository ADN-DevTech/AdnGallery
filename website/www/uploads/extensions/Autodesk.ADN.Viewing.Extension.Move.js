///////////////////////////////////////////////////////////////////////////////
// 2D Annotation viewer Extension
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Move = function (viewer, options) {

    // base constructor
    Autodesk.Viewing.Extension.call(this, viewer, options);

    ///////////////////////////////////////////////////////////////////////////
    // Private members
    //
    ///////////////////////////////////////////////////////////////////////////
    var _selectedMeshMap = {};

    var _initialMeshMap = {};

    var _currentDbId = 0;

    var _viewer = viewer;

    var _self = this;

    ///////////////////////////////////////////////////////////////////////////
    // load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {

        console.log("Autodesk.ADN.Viewing.Extension.Move loaded");

        _viewer = _self.viewer;

        _viewer.addEventListener(
            Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            _self.onItemSelected);

        $("#" + _viewer.clientContainer.id).bind(
            "mousedown", _self.onMouseDown);

        $(document).mousedown(
            _self.onMouseDown);

        $(document).bind(
            'keyup', _self.onKeyup);

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // unload callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.unload = function () {

        console.log("Autodesk.ADN.Viewing.Extension.Move unloaded");

        _viewer.removeEventListener(
            Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            _self.onItemSelected);

        $(document).unbind(
            'keyup', _self.onKeyup);

        $("#" + _viewer.clientContainer.id).
            unbind("click", _self.onMouseClick);

        $("#" + _viewer.clientContainer.id).
            unbind("click", _self.onMouseMouse);

        _self.restorePositions( _initialMeshMap);

        return true;
    };

    _self.onMouseDown = function(e) {

        console.log('down');
    }

    ///////////////////////////////////////////////////////////////////////////
    // keyup callback callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onKeyup = function(event){

        if (event.keyCode == 27) {

            _self.restorePositions(_selectedMeshMap);
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // restore mesh position according to map
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.restorePositions = function(meshMap) {

        for(var fragId in meshMap) {

            var mesh = _viewer.impl.getRenderProxy(
                _viewer,
                fragId);

            mesh.matrixWorld.setPosition(
                meshMap[fragId]);
        }

        _viewer.impl.invalidate(true);
    }

    ///////////////////////////////////////////////////////////////////////////
    // item selected callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onItemSelected = function (event) {

        var dbId = event.dbIdArray[0];

        if(_currentDbId === dbId){

            return;
        }

        _selectedMeshMap = {};

        var fragId = event.fragIdsArray[0];

        if(typeof fragId !== 'undefined') {

            _self.previousPos = null;

            $("#" + _viewer.clientContainer.id).
                unbind("click", _self.onMouseClick);

            $("#" + _viewer.clientContainer.id).
                bind("mousemove", _self.onMouseMove);

            if(Array.isArray(fragId)) {

                fragId.forEach(function(subFragId){

                    var mesh = _viewer.impl.getRenderProxy(
                        _viewer,
                        subFragId);

                    if (mesh) {
                        _selectedMeshMap[subFragId] =
                            _self.getMeshPosition(mesh);

                        if(!_initialMeshMap[subFragId]) {
                            _initialMeshMap[subFragId] =
                                _self.getMeshPosition(mesh);
                        }
                    }
                });
            }
            else {

                var mesh = _viewer.impl.getRenderProxy(
                    _viewer,
                    fragId);

                if (mesh) {

                    _selectedMeshMap[fragId] =
                        _self.getMeshPosition(mesh);

                    if(!_initialMeshMap[fragId]) {
                        _initialMeshMap[fragId] =
                            _self.getMeshPosition(mesh);
                    }
                }
            }
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // return mesh position
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.getMeshPosition = function (mesh) {

        var pos = new THREE.Vector3();

        pos.setFromMatrixPosition(mesh.matrixWorld);

        return pos;
    }

    ///////////////////////////////////////////////////////////////////////////
    // translate mesh
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.translateMesh = function (mesh, translation) {

        var pos = new THREE.Vector3();

        pos.setFromMatrixPosition(mesh.matrixWorld);

        pos.x += translation.x;
        pos.y += translation.y;
        pos.z += translation.z;

        mesh.matrixWorld.setPosition(pos);
    }

    ///////////////////////////////////////////////////////////////////////////
    // mouse click callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onMouseClick = function(e) {

        _self.previousPos = _self.screenToWorld(e);

        if(Object.keys(_selectedMeshMap).length > 0) {

            $("#" + _viewer.clientContainer.id).
                unbind("mousemove", _self.onMouseMove);
        }

        $("#" + _viewer.clientContainer.id).
            unbind("click", _self.onMouseClick);
    }

    ///////////////////////////////////////////////////////////////////////////
    // mouse move callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onMouseMove = function(e) {

        var pos = _self.screenToWorld(e);

        if(!_self.previousPos) {

            _self.previousPos = pos;

            $("#" + _viewer.clientContainer.id).bind(
                "click", _self.onMouseClick);
        }

        var translation = {
            x: pos.x - _self.previousPos.x,
            y: pos.y - _self.previousPos.y,
            z: pos.z - _self.previousPos.z
        };

        _self.previousPos = pos;

        for(var fragId in _selectedMeshMap) {

            var mesh = _viewer.impl.getRenderProxy(
                _viewer,
                fragId);

            _self.translateMesh(mesh, translation);

            //mesh.matrixWorld.setPosition(pos);
        }

        _viewer.impl.invalidate(true);
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
};

Autodesk.ADN.Viewing.Extension.Move.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Move.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Move;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.Move',
    Autodesk.ADN.Viewing.Extension.Move);

