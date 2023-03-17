/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
    AutoGroupColService.prototype.createAutoGroupColumns = function (existingCols, rowGroupColumns) {
        var _this = this;
        var groupAutoColumns = [];
        var doingTreeData = this.gridOptionsService.isTreeData();
        var doingMultiAutoColumn = this.gridOptionsService.isGroupMultiAutoColumn();
        if (doingTreeData && doingMultiAutoColumn) {
            console.warn('AG Grid: you cannot mix groupDisplayType = "multipleColumns" with treeData, only one column can be used to display groups when doing tree data');
            doingMultiAutoColumn = false;
        }
        // if doing groupDisplayType = "multipleColumns", then we call the method multiple times, once
        // for each column we are grouping by
        if (doingMultiAutoColumn) {
            rowGroupColumns.forEach(function (rowGroupCol, index) {
                groupAutoColumns.push(_this.createOneAutoGroupColumn(existingCols, rowGroupCol, index));
            });
        }
        else {
            groupAutoColumns.push(this.createOneAutoGroupColumn(existingCols));
        }
        return groupAutoColumns;
    };
    // rowGroupCol and index are missing if groupDisplayType != "multipleColumns"
    AutoGroupColService.prototype.createOneAutoGroupColumn = function (existingCols, rowGroupCol, index) {
        // if one provided by user, use it, otherwise create one
        var defaultAutoColDef = this.generateDefaultColDef(rowGroupCol);
        // if doing multi, set the field
        var colId;
        if (rowGroupCol) {
            colId = exports.GROUP_AUTO_COLUMN_ID + "-" + rowGroupCol.getId();
        }
        else {
            colId = exports.GROUP_AUTO_COLUMN_ID;
        }
        var userAutoColDef = this.gridOptionsService.get('autoGroupColumnDef');
        object_1.mergeDeep(defaultAutoColDef, userAutoColDef);
        defaultAutoColDef = this.columnFactory.mergeColDefs(defaultAutoColDef);
        defaultAutoColDef.colId = colId;
        // For tree data the filter is always allowed
        if (!this.gridOptionsService.isTreeData()) {
            // we would only allow filter if the user has provided field or value getter. otherwise the filter
            // would not be able to work.
            var noFieldOrValueGetter = generic_1.missing(defaultAutoColDef.field) &&
                generic_1.missing(defaultAutoColDef.valueGetter) &&
                generic_1.missing(defaultAutoColDef.filterValueGetter) &&
                defaultAutoColDef.filter !== 'agGroupColumnFilter';
            if (noFieldOrValueGetter) {
                defaultAutoColDef.filter = false;
            }
        }
        // if showing many cols, we don't want to show more than one with a checkbox for selection
        if (index && index > 0) {
            defaultAutoColDef.headerCheckboxSelection = false;
        }
        var existingCol = existingCols.find(function (col) { return col.getId() == colId; });
        if (existingCol) {
            existingCol.setColDef(defaultAutoColDef, null);
            this.columnFactory.applyColumnState(existingCol, defaultAutoColDef);
            return existingCol;
        }
        var isSortingCoupled = this.gridOptionsService.isColumnsSortingCoupledToGroup();
        if (isSortingCoupled && (defaultAutoColDef.sort || defaultAutoColDef.initialSort) && !defaultAutoColDef.field) {
            // if no field, then this column cannot hold its own sort state
            object_1.mergeDeep(defaultAutoColDef, { sort: null, initialSort: null }, true, true);
        }
        var newCol = new column_1.Column(defaultAutoColDef, null, colId, true);
        this.context.createBean(newCol);
        return newCol;
    };
    AutoGroupColService.prototype.generateDefaultColDef = function (rowGroupCol) {
        var userDef = this.gridOptionsService.get('autoGroupColumnDef');
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        var res = {
            headerName: localeTextFunc('group', 'Group')
        };
        var userHasProvidedGroupCellRenderer = userDef &&
            (userDef.cellRenderer || userDef.cellRendererFramework || userDef.cellRendererSelector);
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
            if (colDef.cellRenderer || colDef.cellRendererFramework) {
                Object.assign(res, {
                    cellRendererParams: {
                        innerRenderer: colDef.cellRenderer,
                        innerRendererFramework: colDef.cellRendererFramework,
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
        context_1.Autowired('columnModel')
    ], AutoGroupColService.prototype, "columnModel", void 0);
    __decorate([
        context_1.Autowired('columnFactory')
    ], AutoGroupColService.prototype, "columnFactory", void 0);
    AutoGroupColService = __decorate([
        context_1.Bean('autoGroupColService')
    ], AutoGroupColService);
    return AutoGroupColService;
}(beanStub_1.BeanStub));
exports.AutoGroupColService = AutoGroupColService;
