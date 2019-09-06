/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
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
var columnController_1 = require("./columnController");
var columnFactory_1 = require("./columnFactory");
var constants_1 = require("../constants");
var utils_1 = require("../utils");
var AutoGroupColService = /** @class */ (function () {
    function AutoGroupColService() {
    }
    AutoGroupColService_1 = AutoGroupColService;
    AutoGroupColService.prototype.createAutoGroupColumns = function (rowGroupColumns) {
        var _this = this;
        var groupAutoColumns = [];
        var doingTreeData = this.gridOptionsWrapper.isTreeData();
        var doingMultiAutoColumn = this.gridOptionsWrapper.isGroupMultiAutoColumn();
        if (doingTreeData && doingMultiAutoColumn) {
            console.warn('ag-Grid: you cannot mix groupMultiAutoColumn with treeData, only one column can be used to display groups when doing tree data');
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
            groupAutoColumns.push(this.createOneAutoGroupColumn());
        }
        return groupAutoColumns;
    };
    // rowGroupCol and index are missing if groupMultiAutoColumn=false
    AutoGroupColService.prototype.createOneAutoGroupColumn = function (rowGroupCol, index) {
        // if one provided by user, use it, otherwise create one
        var defaultAutoColDef = this.generateDefaultColDef(rowGroupCol);
        // if doing multi, set the field
        var colId;
        if (rowGroupCol) {
            colId = constants_1.Constants.GROUP_AUTO_COLUMN_ID + "-" + rowGroupCol.getId();
        }
        else {
            colId = AutoGroupColService_1.GROUP_AUTO_COLUMN_BUNDLE_ID;
        }
        var userAutoColDef = this.gridOptionsWrapper.getAutoGroupColumnDef();
        utils_1._.mergeDeep(defaultAutoColDef, userAutoColDef);
        defaultAutoColDef = this.columnFactory.mergeColDefs(defaultAutoColDef);
        defaultAutoColDef.colId = colId;
        // For tree data the filter is always allowed
        if (!this.gridOptionsWrapper.isTreeData()) {
            // we would only allow filter if the user has provided field or value getter. otherwise the filter
            // would not be able to work.
            var noFieldOrValueGetter = utils_1._.missing(defaultAutoColDef.field) && utils_1._.missing(defaultAutoColDef.valueGetter) && utils_1._.missing(defaultAutoColDef.filterValueGetter);
            if (noFieldOrValueGetter) {
                defaultAutoColDef.filter = false;
            }
        }
        // if showing many cols, we don't want to show more than one with a checkbox for selection
        if (index && index > 0) {
            defaultAutoColDef.headerCheckboxSelection = false;
        }
        var newCol = new column_1.Column(defaultAutoColDef, null, colId, true);
        this.context.wireBean(newCol);
        return newCol;
    };
    AutoGroupColService.prototype.generateDefaultColDef = function (rowGroupCol) {
        var userAutoColDef = this.gridOptionsWrapper.getAutoGroupColumnDef();
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var defaultAutoColDef = {
            headerName: localeTextFunc('group', 'Group')
        };
        var userHasProvidedGroupCellRenderer = userAutoColDef && (userAutoColDef.cellRenderer || userAutoColDef.cellRendererFramework);
        // only add the default group cell renderer if user hasn't provided one
        if (!userHasProvidedGroupCellRenderer) {
            defaultAutoColDef.cellRenderer = 'agGroupCellRenderer';
        }
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
    var AutoGroupColService_1;
    AutoGroupColService.GROUP_AUTO_COLUMN_BUNDLE_ID = constants_1.Constants.GROUP_AUTO_COLUMN_ID;
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
    __decorate([
        context_1.Autowired('columnFactory'),
        __metadata("design:type", columnFactory_1.ColumnFactory)
    ], AutoGroupColService.prototype, "columnFactory", void 0);
    AutoGroupColService = AutoGroupColService_1 = __decorate([
        context_1.Bean('autoGroupColService')
    ], AutoGroupColService);
    return AutoGroupColService;
}());
exports.AutoGroupColService = AutoGroupColService;
