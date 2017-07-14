/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v12.0.0
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
var rowComp_1 = require("./rowComp");
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
    RowContainerComponent.prototype.appendRowElement_old = function (eRow, eRowBefore) {
        this.eContainer.appendChild(eRow);
        this.childCount++;
        this.checkVisibility();
    };
    RowContainerComponent.prototype.appendRowElement = function (eRow, eRowBefore) {
        if (eRowBefore) {
            if (eRowBefore.nextSibling) {
                // insert between the eRowBefore and the row after it
                this.eContainer.insertBefore(eRow, eRowBefore.nextSibling);
            }
            else {
                // if nextSibling is missing, means other row is at end, so just append new row at the end
                this.eContainer.appendChild(eRow);
            }
        }
        else {
            if (this.eContainer.firstChild) {
                // insert it at the first location
                this.eContainer.insertBefore(eRow, this.eContainer.firstChild);
            }
            else {
                // otherwise eContainer is empty, so just append it
                this.eContainer.appendChild(eRow);
            }
        }
        this.childCount++;
        this.checkVisibility();
    };
    RowContainerComponent.prototype.ensureDomOrder_old = function (eRow, eRowBefore) {
    };
    RowContainerComponent.prototype.ensureDomOrder = function (eRow, eRowBefore) {
        // if already in right order, do nothing
        if (eRowBefore && eRowBefore.nextSibling === eRow) {
            return;
        }
        if (eRowBefore) {
            if (eRowBefore.nextSibling) {
                // insert between the eRowBefore and the row after it
                this.eContainer.insertBefore(eRow, eRowBefore.nextSibling);
            }
            else {
                // if nextSibling is missing, means other row is at end, so just append new row at the end
                this.eContainer.appendChild(eRow);
            }
        }
        else {
            // otherwise put at start
            if (this.eContainer.firstChild) {
                // insert it at the first location
                this.eContainer.insertBefore(eRow, this.eContainer.firstChild);
            }
        }
    };
    RowContainerComponent.prototype.removeRowElement = function (eRow) {
        this.eContainer.removeChild(eRow);
        this.childCount--;
        this.checkVisibility();
    };
    // WARNING - this method is very hard on the DOM, the shuffles the DOM rows even if they don't need
    // shuffling, hence a huge performance hit. really the order should be worked out as the rows are getting
    // inserted (which is not possible when using the Document Fragment) - so we should do this right (insert
    // at correct index) and not use Document Fragment when this is the case).
    RowContainerComponent.prototype.sortDomByRowNodeIndex = function () {
        var _this = this;
        // if a cell is focused, it will loose focus after this rearrange
        var originalFocusedElement = document.activeElement;
        var eChildren = [];
        for (var i = 0; i < this.eContainer.children.length; i++) {
            var eChild = this.eContainer.children[i];
            // we only include elements that have attached rowComps - when the grid removes rows
            // from the grid, the rowComp gets detached form the element
            var rowComp = this.gridOptionsWrapper.getDomData(eChild, rowComp_1.RowComp.DOM_DATA_KEY_RENDERED_ROW);
            if (rowComp) {
                eChildren.push(eChild);
            }
        }
        eChildren.sort(function (a, b) {
            var rowCompA = _this.gridOptionsWrapper.getDomData(a, rowComp_1.RowComp.DOM_DATA_KEY_RENDERED_ROW);
            var rowCompB = _this.gridOptionsWrapper.getDomData(b, rowComp_1.RowComp.DOM_DATA_KEY_RENDERED_ROW);
            return rowCompA.getRowNode().rowIndex - rowCompB.getRowNode().rowIndex;
        });
        // we assume the last one is in place, then go through each element
        // and place it before the one after
        for (var i = eChildren.length - 2; i >= 0; i--) {
            var eCurrent = eChildren[i];
            var eNext = eChildren[i + 1];
            this.eContainer.insertBefore(eCurrent, eNext);
        }
        // if focus was lost, reset it. if the focus was not a cell,
        // then the focus would not of gotten impacted.
        if (originalFocusedElement !== document.activeElement) {
            originalFocusedElement.focus();
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
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], RowContainerComponent.prototype, "gridOptionsWrapper", void 0);
    return RowContainerComponent;
}());
exports.RowContainerComponent = RowContainerComponent;
