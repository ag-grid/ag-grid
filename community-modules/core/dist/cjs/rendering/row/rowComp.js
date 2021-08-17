/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v26.0.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("../../widgets/component");
var dom_1 = require("../../utils/dom");
var rowCtrl_1 = require("./rowCtrl");
var cellComp_1 = require("../cell/cellComp");
var object_1 = require("../../utils/object");
var aria_1 = require("../../utils/aria");
var RowComp = /** @class */ (function (_super) {
    __extends(RowComp, _super);
    function RowComp(ctrl, beans, pinned) {
        var _this = _super.call(this) || this;
        _this.cellComps = {};
        _this.beans = beans;
        _this.rowCtrl = ctrl;
        _this.setTemplate(/* html */ "<div comp-id=\"" + _this.getCompId() + "\" style=\"" + _this.getInitialStyle() + "\"/>");
        var eGui = _this.getGui();
        var style = eGui.style;
        var compProxy = {
            setDisplay: function (value) { return style.display = value == null ? null : 'none'; },
            setDomOrder: function (domOrder) { return _this.domOrder = domOrder; },
            setCellCtrls: function (cellCtrls) { return _this.setCellCtrls(cellCtrls); },
            showFullWidth: function (compDetails) { return _this.showFullWidth(compDetails); },
            getFullWidthCellRenderer: function () { return _this.getFullWidthCellRenderer(); },
            addOrRemoveCssClass: function (name, on) { return _this.addOrRemoveCssClass(name, on); },
            setAriaExpanded: function (on) { return aria_1.setAriaExpanded(eGui, on); },
            setUserStyles: function (styles) { return dom_1.addStylesToElement(eGui, styles); },
            setAriaSelected: function (value) { return aria_1.setAriaSelected(eGui, value); },
            setAriaLabel: function (value) {
                if (value == null) {
                    eGui.removeAttribute('aria-label');
                }
                else {
                    eGui.setAttribute('aria-label', value);
                }
            },
            setHeight: function (height) { return style.height = height; },
            setTop: function (top) { return style.top = top; },
            setTransform: function (transform) { return style.transform = transform; },
            setRowIndex: function (rowIndex) { return eGui.setAttribute('row-index', rowIndex); },
            setRole: function (role) { return eGui.setAttribute('role', role); },
            setAriaRowIndex: function (rowIndex) { return aria_1.setAriaRowIndex(_this.getGui(), rowIndex); },
            setRowId: function (rowId) { return eGui.setAttribute('row-id', rowId); },
            setRowBusinessKey: function (businessKey) { return eGui.setAttribute('row-business-key', businessKey); },
            setTabIndex: function (tabIndex) { return eGui.setAttribute('tabindex', tabIndex.toString()); }
        };
        ctrl.setComp(compProxy, _this.getGui(), pinned);
        return _this;
    }
    RowComp.prototype.getInitialStyle = function () {
        var transform = this.rowCtrl.getInitialTransform();
        var top = this.rowCtrl.getInitialRowTop();
        return transform ? "transform: " + transform : "top: " + top;
    };
    RowComp.prototype.showFullWidth = function (compDetails) {
        var _this = this;
        var callback = function (cellRenderer) {
            if (_this.isAlive()) {
                var eGui = cellRenderer.getGui();
                _this.getGui().appendChild(eGui);
                if (_this.rowCtrl.getRowType() === rowCtrl_1.RowType.FullWidthDetail) {
                    _this.rowCtrl.setupDetailRowAutoHeight(eGui);
                }
                _this.setFullWidthRowComp(cellRenderer);
            }
            else {
                _this.beans.context.destroyBean(cellRenderer);
            }
        };
        // if not in cache, create new one
        var res = this.beans.userComponentFactory.createFullWidthCellRenderer(compDetails, this.rowCtrl.getFullWidthCellRendererType());
        if (!res) {
            return;
        }
        res.then(callback);
    };
    RowComp.prototype.setCellCtrls = function (cellCtrls) {
        var _this = this;
        var cellsToRemove = object_1.assign({}, this.cellComps);
        cellCtrls.forEach(function (cellCtrl) {
            var key = cellCtrl.getInstanceId();
            var existingCellComp = _this.cellComps[key];
            if (existingCellComp == null) {
                _this.newCellComp(cellCtrl);
            }
            else {
                cellsToRemove[key] = null;
            }
        });
        var cellCompsToRemove = object_1.getAllValuesInObject(cellsToRemove)
            .filter(function (cellComp) { return cellComp != null; });
        this.destroyCells(cellCompsToRemove);
        this.ensureDomOrder(cellCtrls);
    };
    RowComp.prototype.ensureDomOrder = function (cellCtrls) {
        var _this = this;
        if (!this.domOrder) {
            return;
        }
        var elementsInOrder = [];
        cellCtrls.forEach(function (cellCtrl) {
            var cellComp = _this.cellComps[cellCtrl.getInstanceId()];
            if (cellComp) {
                elementsInOrder.push(cellComp.getGui());
            }
        });
        dom_1.setDomChildOrder(this.getGui(), elementsInOrder);
    };
    RowComp.prototype.newCellComp = function (cellCtrl) {
        var cellComp = new cellComp_1.CellComp(this.rowCtrl.getScope(), this.beans, cellCtrl, false, this.rowCtrl.isPrintLayout(), this.getGui(), this.rowCtrl.isEditing());
        this.cellComps[cellCtrl.getInstanceId()] = cellComp;
        this.getGui().appendChild(cellComp.getGui());
    };
    RowComp.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.destroyAllCells();
    };
    RowComp.prototype.destroyAllCells = function () {
        var cellsToDestroy = object_1.getAllValuesInObject(this.cellComps).filter(function (cp) { return cp != null; });
        this.destroyCells(cellsToDestroy);
    };
    RowComp.prototype.setFullWidthRowComp = function (fullWidthRowComponent) {
        var _this = this;
        if (this.fullWidthCellRenderer) {
            console.error('AG Grid - should not be setting fullWidthRowComponent twice');
        }
        this.fullWidthCellRenderer = fullWidthRowComponent;
        this.addDestroyFunc(function () {
            _this.fullWidthCellRenderer = _this.beans.context.destroyBean(_this.fullWidthCellRenderer);
        });
    };
    RowComp.prototype.getFullWidthCellRenderer = function () {
        return this.fullWidthCellRenderer;
    };
    RowComp.prototype.destroyCells = function (cellComps) {
        var _this = this;
        cellComps.forEach(function (cellComp) {
            // could be old reference, ie removed cell
            if (!cellComp) {
                return;
            }
            // check cellComp belongs in this container
            var instanceId = cellComp.getCtrl().getInstanceId();
            if (_this.cellComps[instanceId] !== cellComp) {
                return;
            }
            cellComp.detach();
            cellComp.destroy();
            _this.cellComps[instanceId] = null;
        });
    };
    return RowComp;
}(component_1.Component));
exports.RowComp = RowComp;

//# sourceMappingURL=rowComp.js.map
