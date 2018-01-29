/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v16.0.1
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
var context_1 = require("../context/context");
var column_1 = require("../entities/column");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var utils_1 = require("../utils");
var columnController_1 = require("./columnController");
var AutoGroupColService = (function () {
    function AutoGroupColService() {
    }
    AutoGroupColService_1 = AutoGroupColService;
    AutoGroupColService.prototype.createAutoGroupColumns = function (rowGroupColumns) {
        var _this = this;
        var groupAutoColumns = [];
        var doingTreeData = this.gridOptionsWrapper.isTreeData();
        var doingMultiAutoColumn = this.gridOptionsWrapper.isGroupMultiAutoColumn();
        if (doingTreeData && doingMultiAutoColumn) {
            console.log('ag-Grid: you cannot mix groupMultiAutoColumn with treeData, only one column can be used to display groups when doing tree data');
            doingMultiAutoColumn = false;
        }
        // if doing groupMultiAutoColumn, then we call the method multiple times, once
        // for each column we are grouping by
        if (doingMultiAutoColumn) {
            rowGroupColumns.forEach(function (rowGroupCol, index) {
                groupAutoColumns.push(_this.createOneAutoGroupColumn(rowGroupCol, index));
            });
        }
        else {
            groupAutoColumns.push(this.createOneAutoGroupColumn(null));
        }
        return groupAutoColumns;
    };
    // rowGroupCol and index are missing if groupMultiAutoColumn=false
    AutoGroupColService.prototype.createOneAutoGroupColumn = function (rowGroupCol, index) {
        // if one provided by user, use it, otherwise create one
        var defaultAutoColDef = this.generateDefaultColDef(rowGroupCol, index);
        var userAutoColDef = this.gridOptionsWrapper.getAutoGroupColumnDef();
        // if doing multi, set the field
        var colId;
        if (rowGroupCol) {
            colId = AutoGroupColService_1.GROUP_AUTO_COLUMN_ID + "-" + rowGroupCol.getId();
        }
        else {
            colId = AutoGroupColService_1.GROUP_AUTO_COLUMN_BUNDLE_ID;
        }
        utils_1._.mergeDeep(defaultAutoColDef, userAutoColDef);
        defaultAutoColDef.colId = colId;
        var noUserFilterPreferences = userAutoColDef == null || userAutoColDef.suppressFilter == null;
        if (noUserFilterPreferences && !this.gridOptionsWrapper.isTreeData()) {
            var produceLeafNodeValues = defaultAutoColDef.field != null || defaultAutoColDef.valueGetter != null;
            defaultAutoColDef.suppressFilter = !produceLeafNodeValues;
        }
        // if showing many cols, we don't want to show more than one with a checkbox for selection
        if (index > 0) {
            defaultAutoColDef.headerCheckboxSelection = false;
        }
        var newCol = new column_1.Column(defaultAutoColDef, colId, true);
        this.context.wireBean(newCol);
        return newCol;
    };
    AutoGroupColService.prototype.generateDefaultColDef = function (rowGroupCol, index) {
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var defaultAutoColDef = {
            headerName: localeTextFunc('group', 'Group'),
            cellRenderer: 'agGroupCellRenderer'
        };
        // we never allow moving the group column
        // defaultAutoColDef.suppressMovable = true;
        if (rowGroupCol) {
            var rowGroupColDef = rowGroupCol.getColDef();
            utils_1._.assign(defaultAutoColDef, {
                // cellRendererParams.groupKey: colDefToCopy.field;
                headerName: this.columnController.getDisplayNameForColumn(rowGroupCol, 'header'),
                headerValueGetter: rowGroupColDef.headerValueGetter
            });
            if (rowGroupColDef.cellRenderer) {
                utils_1._.assign(defaultAutoColDef, {
                    cellRendererParams: {
                        innerRenderer: rowGroupColDef.cellRenderer,
                        innerRendererParams: rowGroupColDef.cellRendererParams
                    }
                });
            }
            defaultAutoColDef.showRowGroup = rowGroupCol.getColId();
        }
        else {
            defaultAutoColDef.showRowGroup = true;
        }
        return defaultAutoColDef;
    };
    AutoGroupColService.GROUP_AUTO_COLUMN_ID = 'ag-Grid-AutoColumn';
    AutoGroupColService.GROUP_AUTO_COLUMN_BUNDLE_ID = AutoGroupColService_1.GROUP_AUTO_COLUMN_ID;
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], AutoGroupColService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], AutoGroupColService.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], AutoGroupColService.prototype, "columnController", void 0);
    AutoGroupColService = AutoGroupColService_1 = __decorate([
        context_1.Bean('autoGroupColService')
    ], AutoGroupColService);
    return AutoGroupColService;
    var AutoGroupColService_1;
}());
exports.AutoGroupColService = AutoGroupColService;
