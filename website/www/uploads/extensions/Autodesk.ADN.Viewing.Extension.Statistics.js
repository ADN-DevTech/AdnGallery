///////////////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.Statistics
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Statistics = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    _self = this;

    _viewer = viewer;

    _self._pie = null;

    _self.load = function () {

        console.log('Autodesk.ADN.Viewing.Extension.Statistics loaded');

        $('#mainLayoutId').layout().show('east');

        //$('body').append('<div id="eastLayoutId"></div>');

        $('#eastLayoutId').
            append('<div id="pieDivId" style="background-color: #ffffff"></div>');

        _self.loadPieData();

        return true;
    };

    _self.unload = function () {

        console.log('Autodesk.ADN.Viewing.Extension.Statistics unloaded');

        $('#mainLayoutId').layout().hide('east');

        return true;
    };

    _self.loadPieData = function() {

        var pieOpts = _self.setupPieDefaults();

        pieOpts.data = _self.getModelData();

        console.log(pieOpts.data);

        _self._pie = new d3pie("pieDivId", pieOpts);
    }

    _self.setupPieDefaults = function() {
        var pieDefaults = {
            "header": {
                "title": {
                    "text": "Object Type",
                    "fontSize": 24,
                    "font": "open sans"
                },
                "subtitle": {
                    "text": "Quantities of items in the model.",
                    "color": "#999999",
                    "fontSize": 12,
                    "font": "open sans"
                },
                "titleSubtitlePadding": 9
            },
            "data": {
             // nothing initially
            },
            "footer": {
                "color": "#999999",
                "fontSize": 10,
                "font": "open sans",
                "location": "bottom-left"
            },
            "size": {
                "canvasWidth": 590,
                "pieInnerRadius": "49%",
                "pieOuterRadius": "81%"
            },
            "labels": {
                "outer": {
                    "pieDistance": 32
                },
                "inner": {
                    //"hideWhenLessThanPercentage": 3,
                    "format": "value"
                },
                "mainLabel": {
                    "fontSize": 11
                },
                "percentage": {
                    "color": "#ffffff",
                    "decimalPlaces": 0
                },
                "value": {
                    "color": "#adadad",
                    "fontSize": 11
                },
                "lines": {
                    "enabled": true
                }
            },
            "effects": {
                "pullOutSegmentOnClick": {
                    "effect": "linear",
                    "speed": 400,
                    "size": 8
                }
            },
            "misc": {
                "gradient": {
                    "enabled": true,
                    "percentage": 100
                }
            },
            "callbacks": {
                onClickSegment: _self.clickPieWedge
            }
        };
        return pieDefaults;
    }

    _self.getModelData = function() {

        var pieData = {
            "sortOrder": "value-desc",
            "content": [
                {
                    label: 'item 1',
                    value: 10
                },
                {
                    label: 'item 2',
                    value: 20
                },
                {
                    label: 'item 3',
                    value: 30
                }]
        };

        // recursively add all the nodes in the Model Structure of LMV to the jsTree
        /*function recursiveCountLeafNodes(treeNode, myObj) {
            if (!treeNode.children) {
                myObj.value++;
                myObj.lmvIds.push(treeNode.dbId);
                return;
            }
            else {
                $.each(treeNode.children, function(num, treeNode2) {
                    recursiveCountLeafNodes(treeNode2, myObj);
                });
            }
        }

        _viewer.getObjectTree(function(objTree) {

            $.each(objTree.children, function(num, treeNode) {
                // create a new object to attach to the tree node
                var myObj = {};
                myObj.label = treeNode.name;
                myObj.value = 10; // count of how many there are
                myObj.lmvIds = []; // empty array of Ids that match this type
                recursiveCountLeafNodes(treeNode, myObj);
                pieData.content.push(myObj);
            });
        });*/

        return pieData;
    }

    _self.clickPieWedge = function(evt) {
        _viewer.isolateById(evt.data.lmvIds);
    }
};

Autodesk.ADN.Viewing.Extension.Statistics.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Statistics.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Statistics;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.Statistics',
    Autodesk.ADN.Viewing.Extension.Statistics);

