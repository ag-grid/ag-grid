import { Autowired, Bean, Context } from "../context/context";
import { Column } from "../entities/column";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { ColDef } from "../entities/colDef";
import { ColumnController } from "./columnController";
import { ColumnFactory } from "./columnFactory";
import { Constants } from "../constants";
import { _ } from "../utils";

@Bean('autoGroupColService')
export class AutoGroupColService {

    public static GROUP_AUTO_COLUMN_BUNDLE_ID = Constants.GROUP_AUTO_COLUMN_ID;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('context') private context: Context;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('columnFactory') private columnFactory: ColumnFactory;

    public createAutoGroupColumns(rowGroupColumns: Column[]): Column[] {
        const groupAutoColumns: Column[] = [];

        const doingTreeData = this.gridOptionsWrapper.isTreeData();
        let doingMultiAutoColumn = this.gridOptionsWrapper.isGroupMultiAutoColumn();

        if (doingTreeData && doingMultiAutoColumn) {
            console.warn('ag-Grid: you cannot mix groupMultiAutoColumn with treeData, only one column can be used to display groups when doing tree data');
            doingMultiAutoColumn = false;
        }

        // if doing groupMultiAutoColumn, then we call the method multiple times, once
        // for each column we are grouping by
        if (doingMultiAutoColumn) {
            rowGroupColumns.forEach((rowGroupCol: Column, index: number) => {
                groupAutoColumns.push(this.createOneAutoGroupColumn(rowGroupCol, index));
            });
        } else {
            groupAutoColumns.push(this.createOneAutoGroupColumn());
        }

        return groupAutoColumns;
    }

    // rowGroupCol and index are missing if groupMultiAutoColumn=false
    private createOneAutoGroupColumn(rowGroupCol?: Column, index?: number): Column {
        // if one provided by user, use it, otherwise create one
        let defaultAutoColDef: ColDef = this.generateDefaultColDef(rowGroupCol);
        // if doing multi, set the field
        let colId: string;
        if (rowGroupCol) {
            colId = `${Constants.GROUP_AUTO_COLUMN_ID}-${rowGroupCol.getId()}`;
        } else {
            colId = AutoGroupColService.GROUP_AUTO_COLUMN_BUNDLE_ID;
        }

        const userAutoColDef: ColDef = this.gridOptionsWrapper.getAutoGroupColumnDef();
        _.mergeDeep(defaultAutoColDef, userAutoColDef);

        defaultAutoColDef = this.columnFactory.mergeColDefs(defaultAutoColDef);

        defaultAutoColDef.colId = colId;

        // For tree data the filter is always allowed
        if (!this.gridOptionsWrapper.isTreeData()) {
            // we would only allow filter if the user has provided field or value getter. otherwise the filter
            // would not be able to work.
            const noFieldOrValueGetter = _.missing(defaultAutoColDef.field) && _.missing(defaultAutoColDef.valueGetter) && _.missing(defaultAutoColDef.filterValueGetter);
            if (noFieldOrValueGetter) {
                defaultAutoColDef.filter = false;
            }
        }

        // if showing many cols, we don't want to show more than one with a checkbox for selection
        if (index && index > 0) {
            defaultAutoColDef.headerCheckboxSelection = false;
        }

        const newCol = new Column(defaultAutoColDef, null, colId, true);
        this.context.wireBean(newCol);

        return newCol;
    }

    private generateDefaultColDef(rowGroupCol?: Column): ColDef {
        const userAutoColDef: ColDef = this.gridOptionsWrapper.getAutoGroupColumnDef();
        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();

        const defaultAutoColDef: ColDef = {
            headerName: localeTextFunc('group', 'Group')
        };

        const userHasProvidedGroupCellRenderer =
            userAutoColDef && (userAutoColDef.cellRenderer || userAutoColDef.cellRendererFramework);

        // only add the default group cell renderer if user hasn't provided one
        if (!userHasProvidedGroupCellRenderer) {
            defaultAutoColDef.cellRenderer = 'agGroupCellRenderer';
        }

        // we never allow moving the group column
        // defaultAutoColDef.suppressMovable = true;

        if (rowGroupCol) {
            const rowGroupColDef = rowGroupCol.getColDef();
            _.assign(defaultAutoColDef, {
                // cellRendererParams.groupKey: colDefToCopy.field;
                headerName: this.columnController.getDisplayNameForColumn(rowGroupCol, 'header'),
                headerValueGetter: rowGroupColDef.headerValueGetter
            });

            if (rowGroupColDef.cellRenderer) {
                _.assign(defaultAutoColDef, {
                    cellRendererParams:{
                        innerRenderer: rowGroupColDef.cellRenderer,
                        innerRendererParams: rowGroupColDef.cellRendererParams
                    }
                });
            }

            defaultAutoColDef.showRowGroup = rowGroupCol.getColId();
        } else {
            defaultAutoColDef.showRowGroup = true;
        }

        return defaultAutoColDef;
    }

}