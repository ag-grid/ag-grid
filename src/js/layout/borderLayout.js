var utils = require('../utils');

function BorderLayout(params) {

    var template =
        '<div style="height: 100%;">' +
        '<div id="north"></div>' +
        '<div id="centerRow" style="height: 100%; overflow: auto;">' +
          '<div id="west" style="height: 100%; float: left;"></div>' +
          '<div id="east" style="height: 100%; float: right;"></div>' +
          '<div id="center" style="height: 100%;"></div>' +
        '</div>' +
        '<div id="south"></div>' +
        '</div>';

    var templateOld =
        '<div style="height: 100%;">' +
        '<div id="north"></div>' +
        '<div id="centerRow" style="height: 100%;">' +
        '<div id="west" style="height: 100%; display: inline-block;"></div>' +
        '<div id="center" style="height: 100%; display: inline-block;"></div>' +
        '<div id="east" style="height: 100%; display: inline-block;"></div>' +
        '</div>' +
        '<div id="south"></div>' +
        '</div>';

    this.eGui = document.createElement('div');
    this.eGui.innerHTML = template;
    this.eNorthWrapper = this.eGui.querySelector('#north');
    if (params && params.north) {
        this.eNorthWrapper.appendChild(params.north);
    }
    this.eSouthWrapper = this.eGui.querySelector('#south');
    if (params && params.south) {
        this.eSouthWrapper.appendChild(params.north);
    }
    this.eEastWrapper = this.eGui.querySelector('#east');
    if (params && params.east) {
        this.eEastWrapper.appendChild(params.east);
    }
    this.eWestWrapper = this.eGui.querySelector('#west');
    if (params && params.west) {
        this.eWestWrapper.appendChild(params.west);
    }
    this.eCenterWrapper = this.eGui.querySelector('#center');
    if (params && params.center) {
        this.eCenterWrapper.appendChild(params.center);
        params.center.style.height = '100%';
    }

    this.eCenterRow = this.eGui.querySelector('#centerRow');

    var that = this;
    setInterval(function() {
        that.doLayout();
    }, 200);
    console.warn('ag-grid: need to shut down the border layout');
}

BorderLayout.prototype.getGui = function() {
    return this.eGui;
};

BorderLayout.prototype.doLayout = function() {
    this.layoutHeight();
    this.layoutWidth();
};

BorderLayout.prototype.layoutHeight = function() {
    var totalHeight = utils.offsetHeight(this.eGui);
    var northHeight = utils.offsetHeight(this.eNorthWrapper);
    var southHeight = utils.offsetHeight(this.eSouthWrapper);

    var centerHeight = totalHeight - northHeight - southHeight;
    if (centerHeight < 0) {
        centerHeight = 0;
    }

    if (centerHeight !== this.centerHeightLastTime && this.eCenterWrapper) {
        this.eCenterRow.style.height = centerHeight;
    }

    this.centerHeightLastTime = centerHeight;
};

BorderLayout.prototype.layoutWidth = function() {
    var totalWidth = utils.offsetWidth(this.eGui);
    var eastWidth = utils.offsetWidth(this.eEastWrapper);
    var westWidth = utils.offsetWidth(this.eWestWrapper);

    var centerWidth = totalWidth - eastWidth - westWidth;
    if (centerWidth < 0) {
        centerWidth = 0;
    }

    if (centerWidth !== this.centerWidthLastTime && this.eCenterWrapper) {
        this.eCenterWrapper.style.width = centerWidth;
    }

    this.centerWidthLastTime = centerWidth;
};

BorderLayout.prototype.setEastVisible = function(visible) {
    this.eEastWrapper.style.display = visible ? '' : 'none';
    this.doLayout();
};

module.exports = BorderLayout;