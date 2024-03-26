import { Autowired, Bean } from "../context/context";
import { Column } from "../entities/column";
import { ColDef } from "../entities/colDef";
import { ColumnModel } from "./columnModel";
import { ColumnFactory } from "./columnFactory";
import { BeanStub } from "../context/beanStub";
import { mergeDeep } from "../utils/object";
import { missing } from "../utils/generic";
import { ColumnEventType } from "../events";

export const GROUP_AUTO_COLUMN_ID: 'ag-Grid-AutoColumn' = 'ag-Grid-AutoColumn';
@Bean('autoGroupColService')
export class AutoGroupColService extends BeanStub {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('columnFactory') private columnFactory: ColumnFactory;

    public createAutoGroupColumns(rowGroupColumns: Column[]): Column[] {
        const groupAutoColumns: Column[] = [];

        const doingTreeData = this.gos.get('treeData');
        let doingMultiAutoColumn = this.gos.isGroupMultiAutoColumn();

        if (doingTreeData && doingMultiAutoColumn) {
            console.warn('AG Grid: you cannot mix groupDisplayType = "multipleColumns" with treeData, only one column can be used to display groups when doing tree data');
            doingMultiAutoColumn = false;
        }

        // if doing groupDisplayType = "multipleColumns", then we call the method multiple times, once
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

    public updateAutoGroupColumns(autoGroupColumns: Column[], source: ColumnEventType) {
        autoGroupColumns.forEach((column: Column, index: number) => this.updateOneAutoGroupColumn(column, index, source));
    }

    // rowGroupCol and index are missing if groupDisplayType != "multipleColumns"
    private createOneAutoGroupColumn(rowGroupCol?: Column, index?: number): Column {
        // if doing multi, set the field
        let colId: string;
        if (rowGroupCol) {
            colId = `${GROUP_AUTO_COLUMN_ID}-${rowGroupCol.getId()}`;
        } else {
            colId = GROUP_AUTO_COLUMN_ID;
        }

        const colDef = this.createAutoGroupColDef(colId, rowGroupCol, index);
        colDef.colId = colId;

        const newCol = new Column(colDef, null, colId, true);
        this.context.createBean(newCol);
        return newCol;
    }

    /**
     * Refreshes an auto group col to load changes from defaultColDef or autoGroupColDef
     */
    private updateOneAutoGroupColumn(colToUpdate: Column, index: number, source: ColumnEventType) {
        const oldColDef = colToUpdate.getColDef();
        const underlyingColId = typeof oldColDef.showRowGroup == 'string' ? oldColDef.showRowGroup : undefined;
        const underlyingColumn = underlyingColId!=null ? this.columnModel.getPrimaryColumn(underlyingColId) : undefined;
        const colDef = this.createAutoGroupColDef(colToUpdate.getId(), underlyingColumn??undefined, index);

        colToUpdate.setColDef(colDef, null, source);
        this.columnFactory.applyColumnState(colToUpdate, colDef, source);
    }

    private createAutoGroupColDef(colId: string, underlyingColumn?: Column, index?: number): ColDef {
        // if one provided by user, use it, otherwise create one
        let res: ColDef = this.createBaseColDef(underlyingColumn);

        const autoGroupColumnDef = this.gos.get('autoGroupColumnDef');
        mergeDeep(res, autoGroupColumnDef);

        res = this.columnFactory.addColumnDefaultAndTypes(res, colId);

        // For tree data the filter is always allowed
        if (!this.gos.get('treeData')) {
            // we would only allow filter if the user has provided field or value getter. otherwise the filter
            // would not be able to work.
            const noFieldOrValueGetter =
                missing(res.field) &&
                missing(res.valueGetter) &&
                missing(res.filterValueGetter) &&
                res.filter !== 'agGroupColumnFilter';
            if (noFieldOrValueGetter) {
                res.filter = false;
            }
        }

        // if showing many cols, we don't want to show more than one with a checkbox for selection
        if (index && index > 0) {
            res.headerCheckboxSelection = false;
        }

        const isSortingCoupled = this.gos.isColumnsSortingCoupledToGroup();
        const hasOwnData = res.valueGetter || res.field != null;
        if (isSortingCoupled && !hasOwnData) {
            // if col is coupled sorting, and has sort attribute, we want to ignore this
            // because we only accept the sort on creation of the col
            res.sortIndex = undefined;
            res.initialSort = undefined;
        }

        return res;
    }

    private createBaseColDef(rowGroupCol?: Column): ColDef {
        const userDef = this.gos.get('autoGroupColumnDef');
        const localeTextFunc = this.localeService.getLocaleTextFunc();

        const res: ColDef = {
            headerName: localeTextFunc('group', 'Group')
        };

        const userHasProvidedGroupCellRenderer = userDef &&
            (userDef.cellRenderer || userDef.cellRendererSelector);

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

            if (colDef.cellRenderer) {
                Object.assign(res, {
                    cellRendererParams: {
                        innerRenderer: colDef.cellRenderer,
                        innerRendererParams: colDef.cellRendererParams
                    }
                });
            }
            res.showRowGroup = rowGroupCol.getColId();
        } else {
            res.showRowGroup = true;
        }

        return res;
    }
}
