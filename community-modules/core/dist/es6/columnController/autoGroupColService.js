/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean } from "../context/context";
import { Column } from "../entities/column";
import { Constants } from "../constants/constants";
import { BeanStub } from "../context/beanStub";
import { mergeDeep, assign } from "../utils/object";
import { missing } from "../utils/generic";
var AutoGroupColService = /** @class */ (function (_super) {
    __extends(AutoGroupColService, _super);
    function AutoGroupColService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AutoGroupColService_1 = AutoGroupColService;
    AutoGroupColService.prototype.createAutoGroupColumns = function (rowGroupColumns) {
        var _this = this;
        var groupAutoColumns = [];
        var doingTreeData = this.gridOptionsWrapper.isTreeData();
        var doingMultiAutoColumn = this.gridOptionsWrapper.isGroupMultiAutoColumn();
        if (doingTreeData && doingMultiAutoColumn) {
            console.warn('AG Grid: you cannot mix groupMultiAutoColumn with treeData, only one column can be used to display groups when doing tree data');
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
        mergeDeep(defaultAutoColDef, userAutoColDef);
        defaultAutoColDef = this.columnFactory.mergeColDefs(defaultAutoColDef);
        defaultAutoColDef.colId = colId;
        // For tree data the filter is always allowed
        if (!this.gridOptionsWrapper.isTreeData()) {
            // we would only allow filter if the user has provided field or value getter. otherwise the filter
            // would not be able to work.
            var noFieldOrValueGetter = missing(defaultAutoColDef.field) && missing(defaultAutoColDef.valueGetter) && missing(defaultAutoColDef.filterValueGetter);
            if (noFieldOrValueGetter) {
                defaultAutoColDef.filter = false;
            }
        }
        // if showing many cols, we don't want to show more than one with a checkbox for selection
        if (index && index > 0) {
            defaultAutoColDef.headerCheckboxSelection = false;
        }
        var newCol = new Column(defaultAutoColDef, null, colId, true);
        this.context.createBean(newCol);
        return newCol;
    };
    AutoGroupColService.prototype.generateDefaultColDef = function (rowGroupCol) {
        var userDef = this.gridOptionsWrapper.getAutoGroupColumnDef();
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
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
            assign(res, {
                // cellRendererParams.groupKey: colDefToCopy.field;
                headerName: this.columnController.getDisplayNameForColumn(rowGroupCol, 'header'),
                headerValueGetter: colDef.headerValueGetter
            });
            if (colDef.cellRenderer) {
                assign(res, {
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
    var AutoGroupColService_1;
    AutoGroupColService.GROUP_AUTO_COLUMN_BUNDLE_ID = Constants.GROUP_AUTO_COLUMN_ID;
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
}(BeanStub));
export { AutoGroupColService };
