/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v6.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('../utils');
var BorderLayout = (function () {
    function BorderLayout(params) {
        this.centerHeightLastTime = -1;
        this.centerWidthLastTime = -1;
        this.centerLeftMarginLastTime = -1;
        this.visibleLastTime = false;
        this.sizeChangeListeners = [];
        this.isLayoutPanel = true;
        this.fullHeight = !params.north && !params.south;
        var template;
        if (!params.dontFill) {
            if (this.fullHeight) {
                template = BorderLayout.TEMPLATE_FULL_HEIGHT;
            }
            else {
                template = BorderLayout.TEMPLATE_NORMAL;
            }
            this.layoutActive = true;
        }
        else {
            template = BorderLayout.TEMPLATE_DONT_FILL;
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
        var _this = this;
        var isVisible = utils_1.Utils.isVisible(this.eGui);
        if (!isVisible) {
            this.visibleLastTime = false;
            return false;
        }
        var atLeastOneChanged = false;
        if (this.visibleLastTime !== isVisible) {
            atLeastOneChanged = true;
        }
        this.visibleLastTime = true;
        var childLayouts = [this.eNorthChildLayout, this.eSouthChildLayout, this.eEastChildLayout, this.eWestChildLayout];
        childLayouts.forEach(function (childLayout) {
            var childChangedSize = _this.layoutChild(childLayout);
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
        var atLeastOneChanged = false;
        if (this.centerLeftMarginLastTime !== westWidth) {
            this.centerLeftMarginLastTime = westWidth;
            this.eCenterWrapper.style.marginLeft = westWidth + 'px';
            atLeastOneChanged = true;
        }
        if (this.centerWidthLastTime !== centerWidth) {
            this.centerWidthLastTime = centerWidth;
            this.eCenterWrapper.style.width = centerWidth + 'px';
            atLeastOneChanged = true;
        }
        return atLeastOneChanged;
    };
    BorderLayout.prototype.setEastVisible = function (visible) {
        if (this.eEastWrapper) {
            this.eEastWrapper.style.display = visible ? '' : 'none';
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
    BorderLayout.TEMPLATE_FULL_HEIGHT = '<div class="ag-bl ag-bl-full-height">' +
        '  <div class="ag-bl-west ag-bl-full-height-west" id="west"></div>' +
        '  <div class="ag-bl-east ag-bl-full-height-east" id="east"></div>' +
        '  <div class="ag-bl-center ag-bl-full-height-center" id="center"></div>' +
        '  <div class="ag-bl-overlay" id="overlay"></div>' +
        '</div>';
    BorderLayout.TEMPLATE_NORMAL = '<div class="ag-bl ag-bl-normal">' +
        '  <div id="north"></div>' +
        '  <div class="ag-bl-center-row ag-bl-normal-center-row" id="centerRow">' +
        '    <div class="ag-bl-west ag-bl-normal-west" id="west"></div>' +
        '    <div class="ag-bl-east ag-bl-normal-east" id="east"></div>' +
        '    <div class="ag-bl-center ag-bl-normal-center" id="center"></div>' +
        '  </div>' +
        '  <div id="south"></div>' +
        '  <div class="ag-bl-overlay" id="overlay"></div>' +
        '</div>';
    BorderLayout.TEMPLATE_DONT_FILL = '<div class="ag-bl ag-bl-dont-fill">' +
        '  <div id="north"></div>' +
        '  <div id="centerRow">' +
        '    <div id="west"></div>' +
        '    <div id="east"></div>' +
        '    <div id="center"></div>' +
        '  </div>' +
        '  <div id="south"></div>' +
        '  <div class="ag-bl-overlay" id="overlay"></div>' +
        '</div>';
    return BorderLayout;
})();
exports.BorderLayout = BorderLayout;
