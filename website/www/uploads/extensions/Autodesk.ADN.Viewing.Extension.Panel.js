///////////////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.Basic
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Panel = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    _self = this;

    _panel = null;

    _viewer = viewer;

    _self.load = function () {

        AdnPanel = function(parentContainer, id, title, content, x, y)
        {
            this.content = content;

            Autodesk.Viewing.UI.DockingPanel.call(
                this, parentContainer,
                id, '',
                {shadow:true});

            // Auto-fit to the content and don't allow resize.
            // Position at the given coordinates
            this.container.style.height = "auto";
            this.container.style.width = "auto";
            this.container.style.resize = "none";
            this.container.style.left = x + "px";
            this.container.style.top = y + "px";
        };

        AdnPanel.prototype = Object.create(
            Autodesk.Viewing.UI.DockingPanel.prototype);

        AdnPanel.prototype.constructor = AdnPanel;

        AdnPanel.prototype.initialize = function()
        {
            // Override DockingPanel initialize() to:
            // - create a standard title bar
            // - click anywhere on the panel to move
            // - create a close element at the bottom right
            //
            this.title = this.createTitleBar(
                this.titleLabel || this.container.id);

            this.container.appendChild(this.title);
            this.container.appendChild(this.content);

            this.initializeMoveHandlers(this.container);

            this.closer = document.createElement("div");

            this.closer.className = "simplePanelClose";
            this.closer.textContent = "Close";

            this.initializeCloseHandler(this.closer);

            this.container.appendChild(this.closer);
        };

        _panel = AdnPanel(_viewer.clientContainer,
            'adn-panel', 'ADN Demo Panel',
            null, 100, 100);

        console.log('Autodesk.ADN.Viewing.Extension.Panel loaded');
        return true;
    };

    _self.unload = function () {

        _panel.setVisible(false);

        _panel.uninitialize();

        console.log('Autodesk.ADN.Viewing.Extension.Panel unloaded');
        return true;
    };
};

Autodesk.ADN.Viewing.Extension.Panel.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Panel.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Panel;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.Panel',
    Autodesk.ADN.Viewing.Extension.Panel);

