///////////////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.Statistics
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Statistics = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _self = this;

    var _viewer = viewer;

    var _componentMap = {};

    _self.load = function () {

        console.log('Autodesk.ADN.Viewing.Extension.Statistics loaded');

        $(document).bind(
            'keyup', _self.onKeyup);

        _viewer.getAllLeafComponents(function(components){

            components.forEach(function(component){

                var name = component.name.split(':')[0];

                if(!_componentMap[name]) {

                    _componentMap[name] = [];
                }

                _componentMap[name].push(component.dbId);
            });

            _self.loadPie(_componentMap);
        });

        return true;
    };

    _self.unload = function () {

        console.log('Autodesk.ADN.Viewing.Extension.Statistics unloaded');

        $('#mainLayoutId').layout().hide('east');

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // keyup callback callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onKeyup = function(event){

        if (event.keyCode == 27) {

            _viewer.isolateById([]);
            _viewer.fitToView([]);
        }
    }

    _self.loadPie = function(map) {

        function getNameFromLabel(label) {

            var idx = label.lastIndexOf('-') + 2;

            return label.substring(idx);
        }

        var raphael = _self.createOverlay();

        var names = [];

        var data = [];

        var legend = [];

        var colors = [];

        for(var key in map){

            //console.log(key + ': ' + map[key].length)

            names.push(key);

            data.push(map[key].length);

            legend.push("%% - " + key);

            colors.push('#' + Math.floor(Math.random()*16777215).toString(16));
        }

        var pie = raphael.piechart(
            120, 140, 100,
            data,
            {
                legend: legend,
                legendpos: "east",
                //href: ["http://raphaeljs.com", "http://g.raphaeljs.com"]
                colors: colors
            });

        pie.each(function() {

            this.cover.click(function () {

                var name = getNameFromLabel(
                    this.label[1].attrs.text);

                if(map[name]) {
                    _viewer.fitToView(map[name]);
                }

                console.log(name);
            });
        });

         pie.hover(function () {

            this.sector.stop();

            this.sector.scale(1.1, 1.1, this.cx, this.cy);

            if (this.label) {
                this.label[0].stop();
                this.label[0].attr({ r: 7.5 });
                this.label[1].attr({ "font-weight": 800 });

                var name = getNameFromLabel(
                    this.label[1].attrs.text);

                if(map[name]) {
                    _viewer.isolateById(map[name]);
                }
            }
        }, function () {

            this.sector.animate({
                transform: 's1 1 ' + this.cx + ' ' + this.cy
            }, 500, "bounce");

            if (this.label) {
                this.label[0].animate({ r: 5 }, 500, "bounce");
                this.label[1].attr({ "font-weight": 400 });
            }
        });

        raphael.text(120, 20, "Components Chart").attr({ font: "20px sans-serif" });
    }

    _self.createOverlay = function () {

        if (typeof Raphael === 'undefined') {
            return null;
        }

        var overlayDiv = document.createElement("div");

        overlayDiv.id = 'overlayPieDivId';

        _viewer.clientContainer.appendChild(
            overlayDiv);

        overlayDiv.style.top = "0";
        overlayDiv.style.left = "0";
        overlayDiv.style.width = "auto";
        overlayDiv.style.height = "90%";
        overlayDiv.style.zIndex = "999";
        overlayDiv.style.position = "absolute";
        overlayDiv.style.overflow = "scroll";

        var overlay = new Raphael(
            overlayDiv,
            overlayDiv.clientWidth,
            overlayDiv.clientHeight);

        return overlay;
    }
};

Autodesk.ADN.Viewing.Extension.Statistics.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Statistics.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Statistics;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.Statistics',
    Autodesk.ADN.Viewing.Extension.Statistics);

