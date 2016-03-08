/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('../utils');
var BorderLayout = (function () {
    function BorderLayout(params) {
        this.sizeChangeListeners = [];
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
                        '<div id="overlay" style="pointer-events: none; position: absolute; height: 100%; width: 100%; top: 0px; left: 0px;"></div>' +
                        '</div>';
            }
            else {
                template =
                    '<div style="height: 100%; position: relative;">' +
                        '<div id="north"></div>' +
                        '<div id="centerRow" style="height: 100%; overflow: hidden;">' +
                        '<div id="west" style="height: 100%; float: left;"></div>' +
                        '<div id="east" style="height: 100%; float: right;"></div>' +
                        '<div id="center" style="height: 100%;"></div>' +
                        '</div>' +
                        '<div id="south"></div>' +
                        '<div id="overlay" style="pointer-events: none; position: absolute; height: 100%; width: 100%; top: 0px; left: 0px;"></div>' +
                        '</div>';
            }
            this.layoutActive = true;
        }
        else {
            template =
                '<div style="position: relative;">' +
                    '<div id="north"></div>' +
                    '<div id="centerRow">' +
                    '<div id="west"></div>' +
                    '<div id="east"></div>' +
                    '<div id="center"></div>' +
                    '</div>' +
                    '<div id="south"></div>' +
                    '<div id="overlay" style="pointer-events: none; position: absolute; height: 100%; width: 100%; top: 0px; left: 0px;"></div>' +
                    '</div>';
            this.layoutActive = false;
        }
        this.eGui = utils_1.Utils.loadTemplate(template);
        this.id = 'borderLayout';
        if (params.name) {
            this.id += '_' + params.name;
        }
        this.eGui.setAttribute('id', this.id);
        this.childPanels = [];
        if (params) {
            this.setupPanels(params);
        }
        this.overlays = params.overlays;
        this.setupOverlays();
    }
    BorderLayout.prototype.addSizeChangeListener = function (listener) {
        this.sizeChangeListeners.push(listener);
    };
    BorderLayout.prototype.fireSizeChanged = function () {
        this.sizeChangeListeners.forEach(function (listener) {
            listener();
        });
    };
    BorderLayout.prototype.setupPanels = function (params) {
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
    };
    BorderLayout.prototype.setupPanel = function (content, ePanel) {
        if (!ePanel) {
            return;
        }
        if (content) {
            if (content.isLayoutPanel) {
                this.childPanels.push(content);
                ePanel.appendChild(content.getGui());
                return content;
            }
            else {
                ePanel.appendChild(content);
                return null;
            }
        }
        else {
            ePanel.parentNode.removeChild(ePanel);
            return null;
        }
    };
    BorderLayout.prototype.getGui = function () {
        return this.eGui;
    };
    // returns true if any item changed size, otherwise returns false
    BorderLayout.prototype.doLayout = function () {
        if (!utils_1.Utils.isVisible(this.eGui)) {
            return false;
        }
        var atLeastOneChanged = false;
        var childLayouts = [this.eNorthChildLayout, this.eSouthChildLayout, this.eEastChildLayout, this.eWestChildLayout];
        var that = this;
        utils_1.Utils.forEach(childLayouts, function (childLayout) {
            var childChangedSize = that.layoutChild(childLayout);
            if (childChangedSize) {
                atLeastOneChanged = true;
            }
        });
        if (this.layoutActive) {
            var ourHeightChanged = this.layoutHeight();
            var ourWidthChanged = this.layoutWidth();
            if (ourHeightChanged || ourWidthChanged) {
                atLeastOneChanged = true;
            }
        }
        var centerChanged = this.layoutChild(this.eCenterChildLayout);
        if (centerChanged) {
            atLeastOneChanged = true;
        }
        if (atLeastOneChanged) {
            this.fireSizeChanged();
        }
        return atLeastOneChanged;
    };
    BorderLayout.prototype.layoutChild = function (childPanel) {
        if (childPanel) {
            return childPanel.doLayout();
        }
        else {
            return false;
        }
    };
    BorderLayout.prototype.layoutHeight = function () {
        if (this.fullHeight) {
            return this.layoutHeightFullHeight();
        }
        else {
            return this.layoutHeightNormal();
        }
    };
    // full height never changes the height, because the center is always 100%,
    // however we do check for change, to inform the listeners
    BorderLayout.prototype.layoutHeightFullHeight = function () {
        var centerHeight = utils_1.Utils.offsetHeight(this.eGui);
        if (centerHeight < 0) {
            centerHeight = 0;
        }
        if (this.centerHeightLastTime !== centerHeight) {
            this.centerHeightLastTime = centerHeight;
            return true;
        }
        else {
            return false;
        }
    };
    BorderLayout.prototype.layoutHeightNormal = function () {
        var totalHeight = utils_1.Utils.offsetHeight(this.eGui);
        var northHeight = utils_1.Utils.offsetHeight(this.eNorthWrapper);
        var southHeight = utils_1.Utils.offsetHeight(this.eSouthWrapper);
        var centerHeight = totalHeight - northHeight - southHeight;
        if (centerHeight < 0) {
            centerHeight = 0;
        }
        if (this.centerHeightLastTime !== centerHeight) {
            this.eCenterRow.style.height = centerHeight + 'px';
            this.centerHeightLastTime = centerHeight;
            return true; // return true because there was a change
        }
        else {
            return false;
        }
    };
    BorderLayout.prototype.getCentreHeight = function () {
        return this.centerHeightLastTime;
    };
    BorderLayout.prototype.layoutWidth = function () {
        var totalWidth = utils_1.Utils.offsetWidth(this.eGui);
        var eastWidth = utils_1.Utils.offsetWidth(this.eEastWrapper);
        var westWidth = utils_1.Utils.offsetWidth(this.eWestWrapper);
        var centerWidth = totalWidth - eastWidth - westWidth;
        if (centerWidth < 0) {
            centerWidth = 0;
        }
        this.eCenterWrapper.style.width = centerWidth + 'px';
    };
    BorderLayout.prototype.setEastVisible = function (visible) {
        if (this.eEastWrapper) {
            this.eEastWrapper.style.display = visible ? '' : 'none';
        }
        this.doLayout();
    };
    BorderLayout.prototype.setNorthVisible = function (visible) {
        if (this.eNorthWrapper) {
            this.eNorthWrapper.style.display = visible ? '' : 'none';
        }
        this.doLayout();
    };
    BorderLayout.prototype.setupOverlays = function () {
        // if no overlays, just remove the panel
        if (!this.overlays) {
            this.eOverlayWrapper.parentNode.removeChild(this.eOverlayWrapper);
            return;
        }
        this.hideOverlay();
        //
        //this.setOverlayVisible(false);
    };
    BorderLayout.prototype.hideOverlay = function () {
        utils_1.Utils.removeAllChildren(this.eOverlayWrapper);
        this.eOverlayWrapper.style.display = 'none';
    };
    BorderLayout.prototype.showOverlay = function (key) {
        var overlay = this.overlays ? this.overlays[key] : null;
        if (overlay) {
            utils_1.Utils.removeAllChildren(this.eOverlayWrapper);
            this.eOverlayWrapper.style.display = '';
            this.eOverlayWrapper.appendChild(overlay);
        }
        else {
            console.log('ag-Grid: unknown overlay');
            this.hideOverlay();
        }
    };
    BorderLayout.prototype.setSouthVisible = function (visible) {
        if (this.eSouthWrapper) {
            this.eSouthWrapper.style.display = visible ? '' : 'none';
        }
        this.doLayout();
    };
    return BorderLayout;
})();
exports.BorderLayout = BorderLayout;
