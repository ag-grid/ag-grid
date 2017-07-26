/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v12.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var context_1 = require("../context/context");
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
        this.hideWhenNoChildren = params.hideWhenNoChildren;
        this.checkVisibility();
    }
    RowContainerComponent.prototype.setHeight = function (height) {
        this.eContainer.style.height = height + "px";
    };
    RowContainerComponent.prototype.appendRowElement = function (eRow, eRowBefore, ensureDomOrder) {
        if (ensureDomOrder) {
            utils_1.Utils.insertWithDomOrder(this.eContainer, eRow, eRowBefore);
        }
        else {
            this.eContainer.appendChild(eRow);
        }
        // it is important we put items in in order, so that when we open a row group,
        // the new rows are inserted after the opened group, but before the rows below.
        // that way, the rows below are over the new rows (as dom renders last in dom over
        // items previous in dom), otherwise the child rows would cover the row below and
        // that meant the user doesn't see the rows below slide away.
        this.childCount++;
        this.checkVisibility();
    };
    RowContainerComponent.prototype.ensureDomOrder = function (eRow, eRowBefore) {
        utils_1.Utils.ensureDomOrder(this.eContainer, eRow, eRowBefore);
    };
    RowContainerComponent.prototype.removeRowElement = function (eRow) {
        this.eContainer.removeChild(eRow);
        this.childCount--;
        this.checkVisibility();
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
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], RowContainerComponent.prototype, "gridOptionsWrapper", void 0);
    return RowContainerComponent;
}());
exports.RowContainerComponent = RowContainerComponent;
