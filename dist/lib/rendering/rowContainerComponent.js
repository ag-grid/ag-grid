/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
/**
 * There are many instances of this component covering each of the areas a row can be entered
 * eg body, pinned left, fullWidth. The component differs from others in that it's given the
 * elements, there is no template. All of the elements are part of the GridPanel.
 */
var RowContainerComponent = (function () {
    function RowContainerComponent(params) {
        this.childCount = 0;
        this.eContainer = params.eContainer;
        this.eViewport = params.eViewport;
        if (params.useDocumentFragment) {
            this.setupDocumentFragment();
        }
        this.hideWhenNoChildren = params.hideWhenNoChildren;
        this.checkVisibility();
    }
    RowContainerComponent.prototype.setupDocumentFragment = function () {
        var browserSupportsDocumentFragment = !!document.createDocumentFragment;
        if (browserSupportsDocumentFragment) {
            this.eDocumentFragment = document.createDocumentFragment();
        }
    };
    RowContainerComponent.prototype.setHeight = function (height) {
        this.eContainer.style.height = height + "px";
    };
    RowContainerComponent.prototype.appendRowElement = function (eRow) {
        var eTarget = this.eDocumentFragment ? this.eDocumentFragment : this.eContainer;
        eTarget.appendChild(eRow);
        this.childCount++;
        this.checkVisibility();
    };
    RowContainerComponent.prototype.removeRowElement = function (eRow) {
        this.eContainer.removeChild(eRow);
        this.childCount--;
        this.checkVisibility();
    };
    RowContainerComponent.prototype.flushDocumentFragment = function () {
        if (utils_1.Utils.exists(this.eDocumentFragment)) {
            // we prepend rather than append so that new rows appear under current rows. this way the new
            // rows are not over the current rows which will get animation as they slid to new position
            utils_1.Utils.prependDC(this.eContainer, this.eDocumentFragment);
        }
    };
    RowContainerComponent.prototype.checkVisibility = function () {
        if (!this.hideWhenNoChildren) {
            return;
        }
        var eGui = this.eViewport ? this.eViewport : this.eContainer;
        var visible = this.childCount > 0;
        if (this.visible !== visible) {
            this.visible = visible;
            utils_1.Utils.setVisible(eGui, visible);
        }
    };
    return RowContainerComponent;
}());
exports.RowContainerComponent = RowContainerComponent;
