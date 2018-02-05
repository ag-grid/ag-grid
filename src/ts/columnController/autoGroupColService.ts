import {Autowired, Bean, Context} from "../context/context";
import {Column} from "../entities/column";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {_} from "../utils";
import {ColDef} from "../entities/colDef";
import {ColumnController} from "./columnController";

@Bean('autoGroupColService')
export class AutoGroupColService {

    public static GROUP_AUTO_COLUMN_ID = 'ag-Grid-AutoColumn';
    public static GROUP_AUTO_COLUMN_BUNDLE_ID = AutoGroupColService.GROUP_AUTO_COLUMN_ID;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('context') private context: Context;
    @Autowired('columnController') private columnController: ColumnController;

    public createAutoGroupColumns(rowGroupColumns: Column[]): Column[] {
        let groupAutoColumns: Column[] = [];

        let doingTreeData = this.gridOptionsWrapper.isTreeData();
        let doingMultiAutoColumn = this.gridOptionsWrapper.isGroupMultiAutoColumn();

        if (doingTreeData && doingMultiAutoColumn) {
            console.log('ag-Grid: you cannot mix groupMultiAutoColumn with treeData, only one column can be used to display groups when doing tree data');
            doingMultiAutoColumn = false;
        }

        // if doing groupMultiAutoColumn, then we call the method multiple times, once
        // for each column we are grouping by
        if (doingMultiAutoColumn) {
            rowGroupColumns.forEach((rowGroupCol: Column, index: number) => {
                groupAutoColumns.push(this.createOneAutoGroupColumn(rowGroupCol, index));
            });
        } else {
            groupAutoColumns.push(this.createOneAutoGroupColumn(null));
        }

        return groupAutoColumns;
    }

    // rowGroupCol and index are missing if groupMultiAutoColumn=false
    private createOneAutoGroupColumn(rowGroupCol?: Column, index?: number): Column {
        // if one provided by user, use it, otherwise create one
        let defaultAutoColDef: ColDef = this.generateDefaultColDef(rowGroupCol, index);
        let userAutoColDef: ColDef = this.gridOptionsWrapper.getAutoGroupColumnDef();
        // if doing multi, set the field
        let colId: string;

        if (rowGroupCol) {
            colId = `${AutoGroupColService.GROUP_AUTO_COLUMN_ID}-${rowGroupCol.getId()}`;
        } else {
            colId = AutoGroupColService.GROUP_AUTO_COLUMN_BUNDLE_ID;
        }

        _.mergeDeep(defaultAutoColDef, userAutoColDef);
        defaultAutoColDef.colId = colId;

        let noUserFilterPreferences = userAutoColDef == null || userAutoColDef.suppressFilter == null;
        if (noUserFilterPreferences && !this.gridOptionsWrapper.isTreeData()) {
            let produceLeafNodeValues = defaultAutoColDef.field != null || defaultAutoColDef.valueGetter != null;
            defaultAutoColDef.suppressFilter = !produceLeafNodeValues;
        }

        // if showing many cols, we don't want to show more than one with a checkbox for selection
        if (index > 0) {
            defaultAutoColDef.headerCheckboxSelection = false;
        }


        let newCol = new Column(defaultAutoColDef, colId, true);
        this.context.wireBean(newCol);

        return newCol;
    }

    private generateDefaultColDef(rowGroupCol?: Column, index?: number): ColDef {
        let localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        let defaultAutoColDef: ColDef = {
            headerName: localeTextFunc('group', 'Group'),
            cellRenderer: 'agGroupCellRenderer'
        };

        // we never allow moving the group column
        // defaultAutoColDef.suppressMovable = true;

        if (rowGroupCol) {
            let rowGroupColDef = rowGroupCol.getColDef();
            _.assign(defaultAutoColDef, {
                // cellRendererParams.groupKey: colDefToCopy.field;
                headerName: this.columnController.getDisplayNameForColumn(rowGroupCol, 'header'),
                headerValueGetter: rowGroupColDef.headerValueGetter
            });

            if (rowGroupColDef.cellRenderer){
                _.assign(defaultAutoColDef, {
                    cellRendererParams:{
                        innerRenderer: rowGroupColDef.cellRenderer,
                        innerRendererParams: rowGroupColDef.cellRendererParams
                    }
                })
            }

            defaultAutoColDef.showRowGroup = rowGroupCol.getColId();
        } else {
            defaultAutoColDef.showRowGroup = true;
        }

        return defaultAutoColDef;
    }

}