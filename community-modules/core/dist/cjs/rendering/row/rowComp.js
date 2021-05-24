/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
var string_1 = require("../../utils/string");
var rowController_1 = require("./rowController");
var cellComp_1 = require("../cellComp");
var object_1 = require("../../utils/object");
var constants_1 = require("../../constants/constants");
var moduleRegistry_1 = require("../../modules/moduleRegistry");
var moduleNames_1 = require("../../modules/moduleNames");
var RowComp = /** @class */ (function (_super) {
    __extends(RowComp, _super);
    function RowComp(controller, container, beans, pinned) {
        var _this = _super.call(this) || this;
        _this.cellComps = {};
        _this.container = container;
        _this.beans = beans;
        _this.rowNode = controller.getRowNode();
        _this.pinned = pinned;
        _this.controller = controller;
        var template = _this.createTemplate();
        _this.setTemplate(template);
        _this.afterRowAttached();
        switch (pinned) {
            case constants_1.Constants.PINNED_LEFT:
                controller.setLeftRowComp(_this);
                break;
            case constants_1.Constants.PINNED_RIGHT:
                controller.setRightRowComp(_this);
                break;
            default:
                if (controller.isFullWidth() && !beans.gridOptionsWrapper.isEmbedFullWidthRows()) {
                    controller.setFullWidthRowComp(_this);
                }
                else {
                    controller.setCenterRowComp(_this);
                }
                break;
        }
        if (controller.isFullWidth()) {
            _this.createFullWidthRowCell();
        }
        else {
            _this.onColumnChanged();
            _this.controller.refreshAriaLabel(_this.getGui(), !!_this.rowNode.isSelected());
        }
        return _this;
    }
    RowComp.prototype.createFullWidthRowCell = function () {
        var _this = this;
        var params = this.controller.createFullWidthParams(this.getGui(), this.pinned);
        var callback = function (cellRenderer) {
            if (_this.isAlive()) {
                var eGui = cellRenderer.getGui();
                _this.getGui().appendChild(eGui);
                if (_this.controller.getRowType() === rowController_1.RowType.FullWidthDetail) {
                    _this.controller.setupDetailRowAutoHeight(eGui);
                }
                _this.setFullWidthRowComp(cellRenderer);
            }
            else {
                _this.beans.context.destroyBean(cellRenderer);
            }
        };
        // if doing master detail, it's possible we have a cached row comp from last time detail was displayed
        var cachedDetailComp = this.beans.detailRowCompCache.get(this.rowNode, this.pinned);
        if (cachedDetailComp) {
            callback(cachedDetailComp);
        }
        else {
            var cellRendererType = rowController_1.FullWidthKeys.get(this.controller.getRowType());
            var cellRendererName = rowController_1.FullWidthRenderers.get(this.controller.getRowType());
            var res = this.beans.userComponentFactory.newFullWidthCellRenderer(params, cellRendererType, cellRendererName);
            if (res) {
                res.then(callback);
            }
            else {
                var masterDetailModuleLoaded = moduleRegistry_1.ModuleRegistry.isRegistered(moduleNames_1.ModuleNames.MasterDetailModule);
                if (cellRendererName === 'agDetailCellRenderer' && !masterDetailModuleLoaded) {
                    console.warn("AG Grid: cell renderer agDetailCellRenderer (for master detail) not found. Did you forget to include the master detail module?");
                }
                else {
                    console.error("AG Grid: fullWidthCellRenderer " + cellRendererName + " not found");
                }
            }
        }
        // fixme - what to do here?
        // this.angular1Compile(eRow);
    };
    RowComp.prototype.onColumnChanged = function () {
        var _this = this;
        var cols = this.controller.getColsForRowComp(this.pinned);
        var cellsToRemove = object_1.assign({}, this.cellComps);
        cols.forEach(function (col) {
            var colId = col.getId();
            var existingCellComp = _this.cellComps[colId];
            // it's possible there is a Cell Comp with correct Id, but it's referring to
            // a different column instance. Happens a lot with pivot, as pivot col id's are
            // reused eg  pivot_0, pivot_1 etc
            if (existingCellComp && existingCellComp.getColumn() !== col) {
                _this.destroyCells([existingCellComp]);
                existingCellComp = null;
            }
            if (existingCellComp == null) {
                _this.newCellComp(col);
            }
            else {
                cellsToRemove[colId] = null;
            }
        });
        var cellCompsToRemove = object_1.getAllValuesInObject(cellsToRemove)
            .filter(function (cellComp) { return cellComp ? _this.isCellEligibleToBeRemoved(cellComp) : false; });
        this.destroyCells(cellCompsToRemove);
        this.ensureDomOrder(cols);
    };
    RowComp.prototype.ensureDomOrder = function (cols) {
        var _this = this;
        if (!this.beans.gridOptionsWrapper.isEnsureDomOrder()) {
            return;
        }
        var elementsInOrder = [];
        cols.forEach(function (col) {
            var cellComp = _this.cellComps[col.getColId()];
            if (cellComp) {
                elementsInOrder.push(cellComp.getGui());
            }
        });
        dom_1.setDomChildOrder(this.getGui(), elementsInOrder);
    };
    RowComp.prototype.isCellEligibleToBeRemoved = function (cellComp) {
        var REMOVE_CELL = true;
        var KEEP_CELL = false;
        // always remove the cell if it's not rendered or if it's in the wrong pinned location
        var column = cellComp.getColumn();
        if (column.getPinned() != this.pinned) {
            return REMOVE_CELL;
        }
        // we want to try and keep editing and focused cells
        var editing = cellComp.isEditing();
        var focused = this.beans.focusController.isCellFocused(cellComp.getCellPosition());
        var mightWantToKeepCell = editing || focused;
        if (mightWantToKeepCell) {
            var column_1 = cellComp.getColumn();
            var displayedColumns = this.beans.columnController.getAllDisplayedColumns();
            var cellStillDisplayed = displayedColumns.indexOf(column_1) >= 0;
            return cellStillDisplayed ? KEEP_CELL : REMOVE_CELL;
        }
        return REMOVE_CELL;
    };
    RowComp.prototype.newCellComp = function (col) {
        var cellComp = new cellComp_1.CellComp(this.controller.getScope(), this.beans, col, this.rowNode, this.controller, false, this.controller.isPrintLayout(), this.getGui(), this.controller.isEditing());
        this.cellComps[col.getId()] = cellComp;
        this.getGui().appendChild(cellComp.getGui());
    };
    RowComp.prototype.getCellComp = function (id) {
        return this.cellComps[id];
    };
    RowComp.prototype.getCellCompSpanned = function (column) {
        var _this = this;
        var spanList = Object.keys(this.cellComps)
            .map(function (name) { return _this.cellComps[name]; })
            .filter(function (cmp) { return cmp && cmp.getColSpanningList().indexOf(column) !== -1; });
        return spanList.length ? spanList[0] : null;
    };
    RowComp.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.destroyAllCells();
    };
    RowComp.prototype.destroyAllCells = function () {
        var cellsToDestroy = object_1.getAllValuesInObject(this.cellComps).filter(function (cp) { return cp != null; });
        this.destroyCells(cellsToDestroy);
    };
    RowComp.prototype.getContainer = function () {
        return this.container;
    };
    RowComp.prototype.setFullWidthRowComp = function (fullWidthRowComponent) {
        var _this = this;
        if (this.fullWidthRowComponent) {
            console.error('AG Grid - should not be setting fullWidthRowComponent twice');
        }
        this.fullWidthRowComponent = fullWidthRowComponent;
        this.addDestroyFunc(function () {
            _this.beans.detailRowCompCache.addOrDestroy(_this.rowNode, _this.pinned, fullWidthRowComponent);
            _this.fullWidthRowComponent = null;
        });
    };
    RowComp.prototype.getFullWidthRowComp = function () {
        return this.fullWidthRowComponent;
    };
    RowComp.prototype.createTemplate = function () {
        var con = this.controller;
        var templateParts = [];
        var rowHeight = this.rowNode.rowHeight;
        var rowClasses = con.getInitialRowClasses(this.pinned).join(' ');
        var rowIdSanitised = string_1.escapeString(this.rowNode.id);
        var userRowStyles = con.preProcessStylesFromGridOptions();
        var businessKey = con.getRowBusinessKey();
        var businessKeySanitised = string_1.escapeString(businessKey);
        var rowTopStyle = con.getInitialRowTopStyle();
        var rowIdx = this.rowNode.getRowIndexString();
        var headerRowCount = this.beans.headerNavigationService.getHeaderRowCount();
        templateParts.push("<div");
        templateParts.push(" role=\"row\"");
        templateParts.push(" row-index=\"" + rowIdx + "\" aria-rowindex=\"" + (headerRowCount + this.rowNode.rowIndex + 1) + "\"");
        templateParts.push(rowIdSanitised ? " row-id=\"" + rowIdSanitised + "\"" : "");
        templateParts.push(businessKey ? " row-business-key=\"" + businessKeySanitised + "\"" : "");
        templateParts.push(" comp-id=\"" + this.getCompId() + "\"");
        templateParts.push(" class=\"" + rowClasses + "\"");
        if (con.isFullWidth()) {
            templateParts.push(" tabindex=\"-1\"");
        }
        if (this.beans.gridOptionsWrapper.isRowSelection()) {
            templateParts.push(" aria-selected=\"" + (this.rowNode.isSelected() ? 'true' : 'false') + "\"");
        }
        if (this.rowNode.group) {
            templateParts.push(" aria-expanded=" + (this.rowNode.expanded ? 'true' : 'false'));
        }
        templateParts.push(" style=\"height: " + rowHeight + "px; " + rowTopStyle + " " + userRowStyles + "\">");
        // add in the template for the cells
        templateParts.push("</div>");
        return templateParts.join('');
    };
    RowComp.prototype.afterRowAttached = function () {
        this.addDomData();
        var eRow = this.getGui();
        // adding hover functionality adds listener to this row, so we
        // do it lazily in an animation frame
        if (this.controller.isUseAnimationFrameForCreate()) {
            this.beans.taskQueue.createTask(this.controller.addHoverFunctionality.bind(this.controller, eRow), this.rowNode.rowIndex, 'createTasksP2');
        }
        else {
            this.controller.addHoverFunctionality(eRow);
        }
        this.controller.executeProcessRowPostCreateFunc();
    };
    RowComp.prototype.addDomData = function () {
        var _this = this;
        var gow = this.beans.gridOptionsWrapper;
        gow.setDomData(this.getGui(), rowController_1.RowController.DOM_DATA_KEY_RENDERED_ROW, this.controller);
        this.addDestroyFunc(function () { return gow.setDomData(_this.getGui(), rowController_1.RowController.DOM_DATA_KEY_RENDERED_ROW, null); });
    };
    RowComp.prototype.destroyCells = function (cellComps) {
        var _this = this;
        cellComps.forEach(function (cellComp) {
            // could be old reference, ie removed cell
            if (!cellComp) {
                return;
            }
            // check cellComp belongs in this container
            var id = cellComp.getColumn().getId();
            if (_this.cellComps[id] !== cellComp) {
                return;
            }
            cellComp.detach();
            cellComp.destroy();
            _this.cellComps[id] = null;
        });
    };
    RowComp.prototype.forEachCellComp = function (callback) {
        object_1.iterateObject(this.cellComps, function (key, cellComp) {
            if (!cellComp) {
                return;
            }
            callback(cellComp);
        });
    };
    return RowComp;
}(component_1.Component));
exports.RowComp = RowComp;

//# sourceMappingURL=rowComp.js.map
