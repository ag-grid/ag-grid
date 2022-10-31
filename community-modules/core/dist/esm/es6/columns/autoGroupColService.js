/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AutoGroupColService_1;
import { Autowired, Bean } from "../context/context";
import { Column } from "../entities/column";
import { Constants } from "../constants/constants";
import { BeanStub } from "../context/beanStub";
import { mergeDeep } from "../utils/object";
import { missing } from "../utils/generic";
let AutoGroupColService = AutoGroupColService_1 = class AutoGroupColService extends BeanStub {
    createAutoGroupColumns(existingCols, rowGroupColumns) {
        const groupAutoColumns = [];
        const doingTreeData = this.gridOptionsWrapper.isTreeData();
        let doingMultiAutoColumn = this.gridOptionsWrapper.isGroupMultiAutoColumn();
        if (doingTreeData && doingMultiAutoColumn) {
            console.warn('AG Grid: you cannot mix groupMultiAutoColumn with treeData, only one column can be used to display groups when doing tree data');
            doingMultiAutoColumn = false;
        }
        // if doing groupMultiAutoColumn, then we call the method multiple times, once
        // for each column we are grouping by
        if (doingMultiAutoColumn) {
            rowGroupColumns.forEach((rowGroupCol, index) => {
                groupAutoColumns.push(this.createOneAutoGroupColumn(existingCols, rowGroupCol, index));
            });
        }
        else {
            groupAutoColumns.push(this.createOneAutoGroupColumn(existingCols));
        }
        return groupAutoColumns;
    }
    // rowGroupCol and index are missing if groupMultiAutoColumn=false
    createOneAutoGroupColumn(existingCols, rowGroupCol, index) {
        // if one provided by user, use it, otherwise create one
        let defaultAutoColDef = this.generateDefaultColDef(rowGroupCol);
        // if doing multi, set the field
        let colId;
        if (rowGroupCol) {
            colId = `${Constants.GROUP_AUTO_COLUMN_ID}-${rowGroupCol.getId()}`;
        }
        else {
            colId = AutoGroupColService_1.GROUP_AUTO_COLUMN_BUNDLE_ID;
        }
        const userAutoColDef = this.gridOptionsWrapper.getAutoGroupColumnDef();
        mergeDeep(defaultAutoColDef, userAutoColDef);
        defaultAutoColDef = this.columnFactory.mergeColDefs(defaultAutoColDef);
        defaultAutoColDef.colId = colId;
        // For tree data the filter is always allowed
        if (!this.gridOptionsWrapper.isTreeData()) {
            // we would only allow filter if the user has provided field or value getter. otherwise the filter
            // would not be able to work.
            const noFieldOrValueGetter = missing(defaultAutoColDef.field) && missing(defaultAutoColDef.valueGetter) && missing(defaultAutoColDef.filterValueGetter);
            if (noFieldOrValueGetter) {
                defaultAutoColDef.filter = false;
            }
        }
        // if showing many cols, we don't want to show more than one with a checkbox for selection
        if (index && index > 0) {
            defaultAutoColDef.headerCheckboxSelection = false;
        }
        const existingCol = existingCols.find(col => col.getId() == colId);
        if (existingCol) {
            existingCol.setColDef(defaultAutoColDef, null);
            this.columnFactory.applyColumnState(existingCol, defaultAutoColDef);
            return existingCol;
        }
        const newCol = new Column(defaultAutoColDef, null, colId, true);
        this.context.createBean(newCol);
        return newCol;
    }
    generateDefaultColDef(rowGroupCol) {
        const userDef = this.gridOptionsWrapper.getAutoGroupColumnDef();
        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        const res = {
            headerName: localeTextFunc('group', 'Group')
        };
        const userHasProvidedGroupCellRenderer = userDef &&
            (userDef.cellRenderer || userDef.cellRendererFramework || userDef.cellRendererSelector);
        // only add the default group cell renderer if user hasn't provided one
        if (!userHasProvidedGroupCellRenderer) {
            res.cellRenderer = 'agGroupCellRenderer';
        }
        // we never allow moving the group column
        // defaultAutoColDef.suppressMovable = true;
        if (rowGroupCol) {
            const colDef = rowGroupCol.getColDef();
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
    }
};
AutoGroupColService.GROUP_AUTO_COLUMN_BUNDLE_ID = Constants.GROUP_AUTO_COLUMN_ID;
__decorate([
    Autowired('columnModel')
], AutoGroupColService.prototype, "columnModel", void 0);
__decorate([
    Autowired('columnFactory')
], AutoGroupColService.prototype, "columnFactory", void 0);
AutoGroupColService = AutoGroupColService_1 = __decorate([
    Bean('autoGroupColService')
], AutoGroupColService);
export { AutoGroupColService };
