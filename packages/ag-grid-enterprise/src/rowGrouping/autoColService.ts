import type {
    BeanCollection,
    ColDef,
    ColumnEventType,
    ColumnFactory,
    ColumnModel,
    ColumnNameService,
    IAutoColService,
    NamedBean,
} from 'ag-grid-community';
import {
    AgColumn,
    BeanStub,
    GROUP_AUTO_COLUMN_ID,
    _isColumnsSortingCoupledToGroup,
    _isGroupMultiAutoColumn,
    _mergeDeep,
    _missing,
    _warn,
} from 'ag-grid-community';

export class AutoColService extends BeanStub implements NamedBean, IAutoColService {
    beanName = 'autoColService' as const;

    private columnModel: ColumnModel;
    private columnNameService: ColumnNameService;
    private columnFactory: ColumnFactory;

    public wireBeans(beans: BeanCollection): void {
        this.columnModel = beans.columnModel;
        this.columnNameService = beans.columnNameService;
        this.columnFactory = beans.columnFactory;
    }

    public createAutoCols(rowGroupCols: AgColumn[]): AgColumn[] {
        const autoCols: AgColumn[] = [];

        const doingTreeData = this.gos.get('treeData');
        let doingMultiAutoColumn = _isGroupMultiAutoColumn(this.gos);

        if (doingTreeData && doingMultiAutoColumn) {
            _warn(182);
            doingMultiAutoColumn = false;
        }

        // if doing groupDisplayType = "multipleColumns", then we call the method multiple times, once
        // for each column we are grouping by
        if (doingMultiAutoColumn) {
            rowGroupCols.forEach((rowGroupCol, index) => {
                autoCols.push(this.createOneAutoCol(rowGroupCol, index));
            });
        } else {
            autoCols.push(this.createOneAutoCol());
        }

        return autoCols;
    }

    public updateAutoCols(autoGroupCols: AgColumn[], source: ColumnEventType) {
        autoGroupCols.forEach((col, index) => this.updateOneAutoCol(col, index, source));
    }

    // rowGroupCol and index are missing if groupDisplayType != "multipleColumns"
    private createOneAutoCol(rowGroupCol?: AgColumn, index?: number): AgColumn {
        // if doing multi, set the field
        let colId: string;
        if (rowGroupCol) {
            colId = `${GROUP_AUTO_COLUMN_ID}-${rowGroupCol.getId()}`;
        } else {
            colId = GROUP_AUTO_COLUMN_ID;
        }

        const colDef = this.createAutoColDef(colId, rowGroupCol, index);
        colDef.colId = colId;

        const newCol = new AgColumn(colDef, null, colId, true);
        this.createBean(newCol);
        return newCol;
    }

    /**
     * Refreshes an auto group col to load changes from defaultColDef or autoGroupColDef
     */
    private updateOneAutoCol(colToUpdate: AgColumn, index: number, source: ColumnEventType) {
        const oldColDef = colToUpdate.getColDef();
        const underlyingColId = typeof oldColDef.showRowGroup == 'string' ? oldColDef.showRowGroup : undefined;
        const underlyingColumn = underlyingColId != null ? this.columnModel.getColDefCol(underlyingColId) : undefined;
        const colDef = this.createAutoColDef(colToUpdate.getId(), underlyingColumn ?? undefined, index);

        colToUpdate.setColDef(colDef, null, source);
        this.columnFactory.applyColumnState(colToUpdate, colDef, source);
    }

    private createAutoColDef(colId: string, underlyingColumn?: AgColumn, index?: number): ColDef {
        // if one provided by user, use it, otherwise create one
        let res: ColDef = this.createBaseColDef(underlyingColumn);

        const autoGroupColumnDef = this.gos.get('autoGroupColumnDef');
        _mergeDeep(res, autoGroupColumnDef);

        res = this.columnFactory.addColumnDefaultAndTypes(res, colId);

        // For tree data the filter is always allowed
        if (!this.gos.get('treeData')) {
            // we would only allow filter if the user has provided field or value getter. otherwise the filter
            // would not be able to work.
            const noFieldOrValueGetter =
                _missing(res.field) &&
                _missing(res.valueGetter) &&
                _missing(res.filterValueGetter) &&
                res.filter !== 'agGroupColumnFilter';
            if (noFieldOrValueGetter) {
                res.filter = false;
            }
        }

        // if showing many cols, we don't want to show more than one with a checkbox for selection
        if (index && index > 0) {
            res.headerCheckboxSelection = false;
        }

        const isSortingCoupled = _isColumnsSortingCoupledToGroup(this.gos);
        const hasOwnData = res.valueGetter || res.field != null;
        if (isSortingCoupled && !hasOwnData) {
            // if col is coupled sorting, and has sort attribute, we want to ignore this
            // because we only accept the sort on creation of the col
            res.sortIndex = undefined;
            res.initialSort = undefined;
        }

        return res;
    }

    private createBaseColDef(rowGroupCol?: AgColumn): ColDef {
        const userDef = this.gos.get('autoGroupColumnDef');
        const localeTextFunc = this.localeService.getLocaleTextFunc();

        const res: ColDef = {
            headerName: localeTextFunc('group', 'Group'),
        };

        const userHasProvidedGroupCellRenderer = userDef && (userDef.cellRenderer || userDef.cellRendererSelector);

        // only add the default group cell renderer if user hasn't provided one
        if (!userHasProvidedGroupCellRenderer) {
            res.cellRenderer = 'agGroupCellRenderer';
        }

        if (rowGroupCol) {
            const colDef = rowGroupCol.getColDef();
            Object.assign(res, {
                headerName: this.columnNameService.getDisplayNameForColumn(rowGroupCol, 'header'),
                headerValueGetter: colDef.headerValueGetter,
            });

            if (colDef.cellRenderer) {
                Object.assign(res, {
                    cellRendererParams: {
                        innerRenderer: colDef.cellRenderer,
                        innerRendererParams: colDef.cellRendererParams,
                    },
                });
            }
            res.showRowGroup = rowGroupCol.getColId();
        } else {
            res.showRowGroup = true;
        }

        return res;
    }
}
