var utils = require('../utils');

function BorderLayout(params) {

    this.isLayoutPanel = true;

    this.fullHeight = !params.north && !params.south;

    var template;
    if (!params.dontFill) {
        if (this.fullHeight) {
            template =
                '<div style="height: 100%; overflow: auto; position: relative;">' +
                '<div id="west" style="height: 100%; float: left;"></div>' +
                '<div id="east" style="height: 100%; float: right;"></div>' +
                '<div id="center" style="height: 100%;"></div>' +
                '<div id="overlay" style="position: absolute; height: 100%; width: 100%; top: 0px; left: 0px;"></div>' +
                '</div>';
        } else {
            template =
                '<div style="height: 100%; position: relative;">' +
                '<div id="north"></div>' +
                '<div id="centerRow" style="height: 100%; overflow: hidden;">' +
                '<div id="west" style="height: 100%; float: left;"></div>' +
                '<div id="east" style="height: 100%; float: right;"></div>' +
                '<div id="center" style="height: 100%;"></div>' +
                '</div>' +
                '<div id="south"></div>' +
                '<div id="overlay" style="position: absolute; height: 100%; width: 100%; top: 0px; left: 0px;"></div>' +
                '</div>';
        }
        this.layoutActive = true;
    } else {
        template =
            '<div style="position: relative;">' +
                '<div id="north"></div>' +
                '<div id="centerRow">' +
                    '<div id="west"></div>' +
                    '<div id="east"></div>' +
                    '<div id="center"></div>' +
                '</div>' +
                '<div id="south"></div>' +
                '<div id="overlay" style="position: absolute; height: 100%; width: 100%; top: 0px; left: 0px;"></div>' +
            '</div>';
        this.layoutActive = false;
    }

    this.eGui = utils.loadTemplate(template);

    this.id = 'borderLayout';
    if (params.name) {
        this.id += '_' + params.name;
    }
    this.eGui.setAttribute('id', this.id);
    this.childPanels = [];

    if (params) {
        this.setupPanels(params);
    }

    this.setOverlayVisible(false);
}

BorderLayout.prototype.setupPanels = function(params) {
    this.eNorthWrapper = this.eGui.querySelector('#north');
    this.eSouthWrapper = this.eGui.querySelector('#south');
    this.eEastWrapper = this.eGui.querySelector('#east');
    this.eWestWrapper = this.eGui.querySelector('#west');
    this.eCenterWrapper = this.eGui.querySelector('#center');
    this.eOverlayWrapper = this.eGui.querySelector('#overlay');
    this.eCenterRow = this.eGui.querySelector('#centerRow');

    this.eNorthChildLayout = this.setupPanel(params.north, this.eNorthWrapper);
    this.eSouthChildLayout = this.setupPanel(params.south, this.eSouthWrapper);
    this.eEastChildLayout = this.setupPanel(params.east, this.eEastWrapper);
    this.eWestChildLayout = this.setupPanel(params.west, this.eWestWrapper);
    this.eCenterChildLayout = this.setupPanel(params.center, this.eCenterWrapper);

    this.setupPanel(params.overlay, this.eOverlayWrapper);
};

BorderLayout.prototype.setupPanel = function(content, ePanel) {
    if (!ePanel) {
        return;
    }
    if (content) {
        if (content.isLayoutPanel) {
            this.childPanels.push(content);
            ePanel.appendChild(content.getGui());
            return content;
        } else {
            ePanel.appendChild(content);
            return null;
        }
    } else {
        ePanel.parentNode.removeChild(ePanel);
        return null;
    }
};

BorderLayout.prototype.getGui = function() {
    return this.eGui;
};

BorderLayout.prototype.doLayout = function() {

    this.layoutChild(this.eNorthChildLayout);
    this.layoutChild(this.eSouthChildLayout);
    this.layoutChild(this.eEastChildLayout);
    this.layoutChild(this.eWestChildLayout);

    if (this.layoutActive) {
        this.layoutHeight();
        this.layoutWidth();
    }

    this.layoutChild(this.eCenterChildLayout);
};

BorderLayout.prototype.layoutChild = function(childPanel) {
    if (childPanel) {
        childPanel.doLayout();
    }
};

BorderLayout.prototype.layoutHeight = function() {
    if (this.fullHeight) {
        return;
    }

    var totalHeight = utils.offsetHeight(this.eGui);
    var northHeight = utils.offsetHeight(this.eNorthWrapper);
    var southHeight = utils.offsetHeight(this.eSouthWrapper);

    var centerHeight = totalHeight - northHeight - southHeight;
    if (centerHeight < 0) {
        centerHeight = 0;
    }

    this.eCenterRow.style.height = centerHeight + 'px';
};

BorderLayout.prototype.layoutWidth = function() {
    var totalWidth = utils.offsetWidth(this.eGui);
    var eastWidth = utils.offsetWidth(this.eEastWrapper);
    var westWidth = utils.offsetWidth(this.eWestWrapper);

    var centerWidth = totalWidth - eastWidth - westWidth;
    if (centerWidth < 0) {
        centerWidth = 0;
    }

    this.eCenterWrapper.style.width = centerWidth + 'px';
};

BorderLayout.prototype.setEastVisible = function(visible) {
    if (this.eEastWrapper) {
        this.eEastWrapper.style.display = visible ? '' : 'none';
    }
    this.doLayout();
};

BorderLayout.prototype.setOverlayVisible = function(visible) {
    if (this.eOverlayWrapper) {
        this.eOverlayWrapper.style.display = visible ? '' : 'none';
    }
    this.doLayout();
};

BorderLayout.prototype.setSouthVisible = function(visible) {
    if (this.eSouthWrapper) {
        this.eSouthWrapper.style.display = visible ? '' : 'none';
    }
    this.doLayout();
};

module.exports = BorderLayout;