///////////////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.Basic
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.DockingPanel = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    _self = this;

    _panel = null;

    _viewer = viewer;

    _self.load = function () {

        Autodesk.ADN.AdnPanel = function(
            parentContainer,
            id,
            title,
            content,
            x, y)
        {
            this.content = content;

            Autodesk.Viewing.UI.DockingPanel.call(
                this,
                parentContainer,
                id, '',
                {shadow:true});

            // Auto-fit to the content and don't allow resize.
            // Position at the given coordinates

            this.container.style.top = y + "px";
            this.container.style.left = x + "px";

            this.container.style.width = "auto";
            this.container.style.height = "auto";
            this.container.style.resize = "none";
        };

        Autodesk.ADN.AdnPanel.prototype = Object.create(
            Autodesk.Viewing.UI.DockingPanel.prototype);

        Autodesk.ADN.AdnPanel.prototype.constructor =
            Autodesk.ADN.AdnPanel;

        Autodesk.ADN.AdnPanel.prototype.initialize = function()
        {
            // Override DockingPanel initialize() to:
            // - create a standard title bar
            // - click anywhere on the panel to move
            // - create a close element at the bottom right
            //
            this.title = this.createTitleBar(
                this.titleLabel ||
                this.container.id);

            this.container.appendChild(this.title);
            this.container.appendChild(this.content);

            this.initializeMoveHandlers(this.container);

            //this.closer = document.createElement("div");

            //this.closer.className = "AdnPanelClose";
            //this.closer.textContent = "Close";

            //this.initializeCloseHandler(this.closer);

            //this.container.appendChild(this.closer);
        };

        var content = document.createElement('div');

        content.id = 'adnPanelId';

        _panel = new Autodesk.ADN.AdnPanel(
            _viewer.clientContainer,
            'adn-panel',
            'ADN Demo Panel',
            content,
            0, 0);

        $('#adnPanelId').text('Docking Panel Content');

        _panel.setVisible(true);

        console.log('Autodesk.ADN.Viewing.Extension.DockingPanel loaded');

        return true;
    };

    _self.unload = function () {

        _panel.setVisible(false);

        _panel.uninitialize();

        console.log('Autodesk.ADN.Viewing.Extension.DockingPanel unloaded');

        return true;
    };
};

Autodesk.ADN.Viewing.Extension.DockingPanel.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.DockingPanel.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.DockingPanel;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.DockingPanel',
    Autodesk.ADN.Viewing.Extension.DockingPanel);

