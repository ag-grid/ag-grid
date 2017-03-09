import {Bean, Autowired, Context} from "../context/context";
import {Column} from "../entities/column";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {_} from "../utils";
import {defaultGroupComparator} from "../functions";

@Bean('autoGroupColService')
export class AutoGroupColService {

    public static GROUP_AUTO_COLUMN_ID = 'ag-Grid-AutoColumn';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('context') private context: Context;

    public createAutoGroupColumns(rowGroupColumns: Column[]): Column[] {
        let groupAutoColumns: Column[] = [];

        if (this.gridOptionsWrapper.isGroupMultiAutoColumn()) {
            rowGroupColumns.forEach( (rowGroupCol: Column, index: number) => {
                groupAutoColumns.push(this.createOneAutoGroupColumn(rowGroupCol, index));
            });
        } else {
            groupAutoColumns.push(this.createOneAutoGroupColumn());
        }

        return groupAutoColumns;
    }

    private createOneAutoGroupColumn(rowGroupCol?: Column, index?: number): Column {
        // if one provided by user, use it, otherwise create one
        let autoColDef = this.gridOptionsWrapper.getGroupColumnDef();
        if (!autoColDef) {
            let localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            autoColDef = {
                headerName: localeTextFunc('group', 'Group'),
                comparator: defaultGroupComparator,
                valueGetter: (params: any) => {
                    if (params.node.group) {
                        return params.node.key;
                    } else if (params.data && params.colDef.field) {
                        return params.data[params.colDef.field];
                    } else {
                        return null;
                    }
                },
                cellRenderer: 'group'
            };
        }
        // we never allow moving the group column
        autoColDef.suppressMovable = true;

        // if doing multi, set the field
        let colId: string;

        if (rowGroupCol) {

            // because we are going to be making changes, we need to make a copy,
            // otherwise we are overwriting the same colDef for each column.
            autoColDef = _.cloneObject(autoColDef);

            let rowGroupColDef = rowGroupCol.getColDef();
            _.assign(autoColDef, {
                // cellRendererParams.groupKey: colDefToCopy.field;
                headerName: rowGroupColDef.headerName,
                headerValueGetter: rowGroupColDef.headerValueGetter,
                field: rowGroupColDef.field
            });

            if (_.missing(autoColDef.cellRendererParams)) {
                autoColDef.cellRendererParams = {};
            } else {
                autoColDef.cellRendererParams = _.cloneObject(autoColDef.cellRendererParams);
            }
            autoColDef.cellRendererParams.restrictToOneGroup = true;

            // if showing many cols, we don't want to show more than one with a checkbox for selection
            if (index>0) {
                autoColDef.headerCheckboxSelection = false;
                autoColDef.cellRendererParams.checkbox = false;
            }

            colId = `${AutoGroupColService.GROUP_AUTO_COLUMN_ID}-${Math.random()}-${rowGroupCol.getId()}`;
        } else {
            colId = `${AutoGroupColService.GROUP_AUTO_COLUMN_ID}-${Math.random()}`;
        }

        let newCol = new Column(autoColDef, colId, true);
        this.context.wireBean(newCol);

        return newCol;
    }

}