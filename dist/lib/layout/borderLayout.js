/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v16.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
// This should be a component
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
        if (params.dontFill) {
            template = BorderLayout.TEMPLATE_DONT_FILL;
            this.horizontalLayoutActive = false;
            this.verticalLayoutActive = false;
        }
        else if (params.fillHorizontalOnly) {
            template = BorderLayout.TEMPLATE_DONT_FILL;
            this.horizontalLayoutActive = true;
            this.verticalLayoutActive = false;
        }
        else {
            if (this.fullHeight) {
                template = BorderLayout.TEMPLATE_FULL_HEIGHT;
            }
            else {
                template = BorderLayout.TEMPLATE_NORMAL;
            }
            this.horizontalLayoutActive = true;
            this.verticalLayoutActive = true;
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
        if (params.componentRecipes) {
            this.overlayWrapper = params.componentRecipes.newOverlayWrapperComponent();
        }
    }
    BorderLayout.prototype.addSizeChangeListener = function (listener) {
        this.sizeChangeListeners.push(listener);
    };
    BorderLayout.prototype.fireSizeChanged = function () {
        this.sizeChangeListeners.forEach(function (listener) {
            listener();
        });
    };
    // this logic is also in Component.ts - the plan is sometime in the future,
    // this layout panel may (or may not) extend the Component class, and somehow
    // act as a component.
    BorderLayout.prototype.getRefElement = function (refName) {
        return this.eGui.querySelector('[ref="' + refName + '"]');
    };
    BorderLayout.prototype.setupPanels = function (params) {
        this.eNorthWrapper = this.getRefElement('north');
        this.eSouthWrapper = this.getRefElement('south');
        this.eEastWrapper = this.getRefElement('east');
        this.eWestWrapper = this.getRefElement('west');
        this.eCenterWrapper = this.getRefElement('center');
        this.eOverlayWrapper = this.getRefElement('overlay');
        this.eCenterRow = this.getRefElement('centerRow');
        // initially hide the overlay. this is needed for IE10, if we don't hide the overlay,
        // then it grabs mouse events, and it blocks clicking on the grid (as the overlay consumes
        // the mouse events).
        this.eOverlayWrapper.style.display = 'none';
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
        if (this.horizontalLayoutActive) {
            var ourWidthChanged = this.layoutWidth();
            if (ourWidthChanged) {
                atLeastOneChanged = true;
            }
        }
        if (this.verticalLayoutActive) {
            var ourHeightChanged = this.layoutHeight();
            if (ourHeightChanged) {
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
    BorderLayout.prototype.showLoadingOverlay = function () {
        this.overlayWrapper.showLoadingOverlay(this.eOverlayWrapper);
    };
    BorderLayout.prototype.showNoRowsOverlay = function () {
        this.overlayWrapper.showNoRowsOverlay(this.eOverlayWrapper);
    };
    BorderLayout.prototype.hideOverlay = function () {
        this.overlayWrapper.hideOverlay(this.eOverlayWrapper);
    };
    // this is used if there user has not specified any north or south parts
    BorderLayout.TEMPLATE_FULL_HEIGHT = '<div class="ag-bl ag-bl-full-height">' +
        '  <div class="ag-bl-west ag-bl-full-height-west" ref="west"></div>' +
        '  <div class="ag-bl-east ag-bl-full-height-east" ref="east"></div>' +
        '  <div class="ag-bl-center ag-bl-full-height-center" ref="center"></div>' +
        '  <div class="ag-bl-overlay" ref="overlay"></div>' +
        '</div>';
    BorderLayout.TEMPLATE_NORMAL = '<div class="ag-bl ag-bl-normal">' +
        '  <div ref="north"></div>' +
        '  <div class="ag-bl-center-row ag-bl-normal-center-row" ref="centerRow">' +
        '    <div class="ag-bl-west ag-bl-normal-west" ref="west"></div>' +
        '    <div class="ag-bl-east ag-bl-normal-east" ref="east"></div>' +
        '    <div class="ag-bl-center ag-bl-normal-center" ref="center"></div>' +
        '  </div>' +
        '  <div ref="south"></div>' +
        '  <div class="ag-bl-overlay" ref="overlay"></div>' +
        '</div>';
    BorderLayout.TEMPLATE_DONT_FILL = '<div class="ag-bl ag-bl-dont-fill">' +
        '  <div ref="north"></div>' +
        '  <div ref="centerRow" class="ag-bl-center-row ag-bl-dont-fill-center-row">' +
        '    <div ref="west" class="ag-bl-west ag-bl-dont-fill-west"></div>' +
        '    <div ref="east" class="ag-bl-east ag-bl-dont-fill-east"></div>' +
        '    <div ref="center" class="ag-bl-center ag-bl-dont-fill-center"></div>' +
        '  </div>' +
        '  <div ref="south"></div>' +
        '  <div class="ag-bl-overlay" ref="overlay"></div>' +
        '</div>';
    return BorderLayout;
}());
exports.BorderLayout = BorderLayout;
