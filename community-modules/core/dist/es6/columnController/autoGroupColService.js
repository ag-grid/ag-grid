/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean } from "../context/context";
import { Column } from "../entities/column";
import { Constants } from "../constants";
import { _ } from "../utils";
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
            colId = Constants.GROUP_AUTO_COLUMN_ID + "-" + rowGroupCol.getId();
        }
        else {
            colId = AutoGroupColService_1.GROUP_AUTO_COLUMN_BUNDLE_ID;
        }
        var userAutoColDef = this.gridOptionsWrapper.getAutoGroupColumnDef();
        _.mergeDeep(defaultAutoColDef, userAutoColDef);
        defaultAutoColDef = this.columnFactory.mergeColDefs(defaultAutoColDef);
        defaultAutoColDef.colId = colId;
        // For tree data the filter is always allowed
        if (!this.gridOptionsWrapper.isTreeData()) {
            // we would only allow filter if the user has provided field or value getter. otherwise the filter
            // would not be able to work.
            var noFieldOrValueGetter = _.missing(defaultAutoColDef.field) && _.missing(defaultAutoColDef.valueGetter) && _.missing(defaultAutoColDef.filterValueGetter);
            if (noFieldOrValueGetter) {
                defaultAutoColDef.filter = false;
            }
        }
        // if showing many cols, we don't want to show more than one with a checkbox for selection
        if (index && index > 0) {
            defaultAutoColDef.headerCheckboxSelection = false;
        }
        var newCol = new Column(defaultAutoColDef, null, colId, true);
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
            _.assign(defaultAutoColDef, {
                // cellRendererParams.groupKey: colDefToCopy.field;
                headerName: this.columnController.getDisplayNameForColumn(rowGroupCol, 'header'),
                headerValueGetter: rowGroupColDef.headerValueGetter
            });
            if (rowGroupColDef.cellRenderer) {
                _.assign(defaultAutoColDef, {
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
    AutoGroupColService.GROUP_AUTO_COLUMN_BUNDLE_ID = Constants.GROUP_AUTO_COLUMN_ID;
    __decorate([
        Autowired('gridOptionsWrapper')
    ], AutoGroupColService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('context')
    ], AutoGroupColService.prototype, "context", void 0);
    __decorate([
        Autowired('columnController')
    ], AutoGroupColService.prototype, "columnController", void 0);
    __decorate([
        Autowired('columnFactory')
    ], AutoGroupColService.prototype, "columnFactory", void 0);
    AutoGroupColService = AutoGroupColService_1 = __decorate([
        Bean('autoGroupColService')
    ], AutoGroupColService);
    return AutoGroupColService;
}());
export { AutoGroupColService };
