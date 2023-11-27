"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoGroupColService = exports.GROUP_AUTO_COLUMN_ID = void 0;
var context_1 = require("../context/context");
var column_1 = require("../entities/column");
var beanStub_1 = require("../context/beanStub");
var object_1 = require("../utils/object");
var generic_1 = require("../utils/generic");
exports.GROUP_AUTO_COLUMN_ID = 'ag-Grid-AutoColumn';
var AutoGroupColService = /** @class */ (function (_super) {
    __extends(AutoGroupColService, _super);
    function AutoGroupColService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AutoGroupColService.prototype.createAutoGroupColumns = function (rowGroupColumns) {
        var _this = this;
        var groupAutoColumns = [];
        var doingTreeData = this.gridOptionsService.get('treeData');
        var doingMultiAutoColumn = this.gridOptionsService.isGroupMultiAutoColumn();
        if (doingTreeData && doingMultiAutoColumn) {
            console.warn('AG Grid: you cannot mix groupDisplayType = "multipleColumns" with treeData, only one column can be used to display groups when doing tree data');
            doingMultiAutoColumn = false;
        }
        // if doing groupDisplayType = "multipleColumns", then we call the method multiple times, once
        // for each column we are grouping by
        if (doingMultiAutoColumn) {
            rowGroupColumns.forEach(function (rowGroupCol, index) {
                groupAutoColumns.push(_this.createOneAutoGroupColumn(rowGroupCol, index));
            });
        }
        else {
            groupAutoColumns.push(this.createOneAutoGroupColumn());
        }
        return groupAutoColumns;
    };
    AutoGroupColService.prototype.updateAutoGroupColumns = function (autoGroupColumns) {
        var _this = this;
        autoGroupColumns.forEach(function (column, index) { return _this.updateOneAutoGroupColumn(column, index); });
    };
    // rowGroupCol and index are missing if groupDisplayType != "multipleColumns"
    AutoGroupColService.prototype.createOneAutoGroupColumn = function (rowGroupCol, index) {
        // if doing multi, set the field
        var colId;
        if (rowGroupCol) {
            colId = "".concat(exports.GROUP_AUTO_COLUMN_ID, "-").concat(rowGroupCol.getId());
        }
        else {
            colId = exports.GROUP_AUTO_COLUMN_ID;
        }
        var colDef = this.createAutoGroupColDef(colId, rowGroupCol, index);
        colDef.colId = colId;
        var newCol = new column_1.Column(colDef, null, colId, true);
        this.context.createBean(newCol);
        return newCol;
    };
    /**
     * Refreshes an auto group col to load changes from defaultColDef or autoGroupColDef
     */
    AutoGroupColService.prototype.updateOneAutoGroupColumn = function (colToUpdate, index) {
        var oldColDef = colToUpdate.getColDef();
        var underlyingColId = typeof oldColDef.showRowGroup == 'string' ? oldColDef.showRowGroup : undefined;
        var underlyingColumn = underlyingColId != null ? this.columnModel.getPrimaryColumn(underlyingColId) : undefined;
        var colDef = this.createAutoGroupColDef(colToUpdate.getId(), underlyingColumn !== null && underlyingColumn !== void 0 ? underlyingColumn : undefined, index);
        colToUpdate.setColDef(colDef, null);
        this.columnFactory.applyColumnState(colToUpdate, colDef);
    };
    AutoGroupColService.prototype.createAutoGroupColDef = function (colId, underlyingColumn, index) {
        // if one provided by user, use it, otherwise create one
        var res = this.createBaseColDef(underlyingColumn);
        var autoGroupColumnDef = this.gridOptionsService.get('autoGroupColumnDef');
        (0, object_1.mergeDeep)(res, autoGroupColumnDef);
        res = this.columnFactory.addColumnDefaultAndTypes(res, colId);
        // For tree data the filter is always allowed
        if (!this.gridOptionsService.get('treeData')) {
            // we would only allow filter if the user has provided field or value getter. otherwise the filter
            // would not be able to work.
            var noFieldOrValueGetter = (0, generic_1.missing)(res.field) &&
                (0, generic_1.missing)(res.valueGetter) &&
                (0, generic_1.missing)(res.filterValueGetter) &&
                res.filter !== 'agGroupColumnFilter';
            if (noFieldOrValueGetter) {
                res.filter = false;
            }
        }
        // if showing many cols, we don't want to show more than one with a checkbox for selection
        if (index && index > 0) {
            res.headerCheckboxSelection = false;
        }
        var isSortingCoupled = this.gridOptionsService.isColumnsSortingCoupledToGroup();
        var hasOwnData = res.valueGetter || res.field != null;
        if (isSortingCoupled && !hasOwnData) {
            // if col is coupled sorting, and has sort attribute, we want to ignore this
            // because we only accept the sort on creation of the col
            res.sortIndex = undefined;
            res.initialSort = undefined;
        }
        return res;
    };
    AutoGroupColService.prototype.createBaseColDef = function (rowGroupCol) {
        var userDef = this.gridOptionsService.get('autoGroupColumnDef');
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        var res = {
            headerName: localeTextFunc('group', 'Group')
        };
        var userHasProvidedGroupCellRenderer = userDef &&
            (userDef.cellRenderer || userDef.cellRendererSelector);
        // only add the default group cell renderer if user hasn't provided one
        if (!userHasProvidedGroupCellRenderer) {
            res.cellRenderer = 'agGroupCellRenderer';
        }
        // we never allow moving the group column
        // defaultAutoColDef.suppressMovable = true;
        if (rowGroupCol) {
            var colDef = rowGroupCol.getColDef();
            Object.assign(res, {
                // cellRendererParams.groupKey: colDefToCopy.field;
                headerName: this.columnModel.getDisplayNameForColumn(rowGroupCol, 'header'),
                headerValueGetter: colDef.headerValueGetter
            });
            if (colDef.cellRenderer) {
                Object.assign(res, {
                    cellRendererParams: {
                        innerRenderer: colDef.cellRenderer,
                        innerRendererParams: colDef.cellRendererParams
                    }
                });
            }
            res.showRowGroup = rowGroupCol.getColId();
        }
        else {
            res.showRowGroup = true;
        }
        return res;
    };
    __decorate([
        (0, context_1.Autowired)('columnModel')
    ], AutoGroupColService.prototype, "columnModel", void 0);
    __decorate([
        (0, context_1.Autowired)('columnFactory')
    ], AutoGroupColService.prototype, "columnFactory", void 0);
    AutoGroupColService = __decorate([
        (0, context_1.Bean)('autoGroupColService')
    ], AutoGroupColService);
    return AutoGroupColService;
}(beanStub_1.BeanStub));
exports.AutoGroupColService = AutoGroupColService;
