import type {
    ColDef,
    ColKey,
    GridOptions,
    IColumnCollectionService,
    NamedBean,
    PropertyChangedEvent,
    PropertyValueChangedEvent,
    _ColumnCollections,
} from 'ag-grid-community';
import {
    AgColumn,
    BeanStub,
    _areColIdsEqual,
    _columnsMatch,
    _convertColumnEventSourceType,
    _destroyColumnTree,
    _getDateParts,
    _parseDateTimeFromString,
    _updateColsMap,
} from 'ag-grid-community';

export class DateHierarchyColService extends BeanStub implements NamedBean, IColumnCollectionService {
    beanName = 'dateHierarchyColSvc' as const;

    public columns: _ColumnCollections | null = null;

    public postConstruct(): void {}

    public addColumns(cols: _ColumnCollections): void {
        const dateHierarchyCols = this.columns;
        if (dateHierarchyCols == null) {
            return;
        }
        cols.list = dateHierarchyCols.list.concat(cols.list);
        cols.tree = dateHierarchyCols.tree.concat(cols.tree);
        _updateColsMap(cols);
    }

    public createColumns(
        cols: _ColumnCollections,
        updateOrders: (callback: (cols: AgColumn[] | null) => AgColumn[] | null) => void
    ): void {
        if (!this.isDateHierarchyColsEnabled(cols)) {
            return;
        }

        const list = this.createDateHierarchyColumns(cols);
        const areSame = _areColIdsEqual(list, this.columns?.list ?? []);

        if (areSame) {
            return;
        }

        _destroyColumnTree(this.beans, this.columns?.tree);
        this.columns = null;
        const { colGroupSvc } = this.beans;
        const treeDepth = colGroupSvc?.findDepth(cols.tree) ?? 0;
        const tree = colGroupSvc?.balanceTreeForAutoCols(list, treeDepth) ?? [];
        this.columns = {
            list,
            tree,
            treeDepth,
            map: {},
        };
    }

    public updateColumns(event: PropertyChangedEvent | PropertyValueChangedEvent<keyof GridOptions>): void {
        const source = _convertColumnEventSourceType(event.source);
    }

    public getColumn(key: ColKey): AgColumn | null {
        return this.columns?.list.find((col) => _columnsMatch(col, key)) ?? null;
    }

    public getColumns(): AgColumn[] | null {
        return this.columns?.list ?? null;
    }

    private isDateHierarchyColsEnabled(cols: _ColumnCollections): boolean {
        return cols.list.some((col) => {
            const def = col.getColDef();
            return def.rowGroupingHierarchy != undefined && (def.rowGroup || def.enableRowGroup);
        });
    }

    private createDateHierarchyColDefs(sourceCol: AgColumn): ColDef[] {
        const colDefs: ColDef[] = [];
        const sourceColDef = sourceCol.getColDef();

        if (!sourceColDef.rowGroupingHierarchy) {
            return colDefs;
        }

        const { dataTypeSvc } = this.beans;
        const isDateCol = dataTypeSvc?.getBaseDataType(sourceCol)?.includes('date');
        if (isDateCol) {
            for (const part of sourceColDef.rowGroupingHierarchy) {
                let colDef: ColDef | null = null;
                if (typeof part === 'string') {
                    colDef = this.createColDefForPart(part, sourceCol, sourceColDef);
                } else {
                    colDef = part;
                }
                if (colDef) {
                    colDefs.push(colDef);
                }
            }
        }

        return colDefs;
    }

    private createColDefForPart(part: string, sourceCol: AgColumn, sourceColDef: ColDef): ColDef | null {
        const { valueSvc } = this.beans;
        switch (part) {
            case 'year':
                return {
                    colId: `${sourceColDef.colId ?? sourceColDef.field}-year`,
                    headerName: `${sourceColDef.headerName ?? sourceColDef.field} (Year)`,
                    valueGetter: (params) => {
                        const innerValue = valueSvc.getValue(sourceCol, params.node);
                        let date: Date | null = null;
                        if (innerValue instanceof Date) {
                            date = innerValue;
                        } else if (typeof innerValue === 'string') {
                            date = _parseDateTimeFromString(innerValue);
                        } else {
                            return innerValue;
                        }
                        const parts = _getDateParts(date);
                        if (parts) {
                            return parts[0]; // year
                        }

                        return innerValue;
                    },
                    keyCreator: (params) => {
                        return params.value;
                    },
                    enableRowGroup: true,
                    rowGroup: sourceColDef.rowGroup,
                    hide: true,
                };

            default:
                return null;
        }
    }

    private createDateHierarchyColumns(cols: _ColumnCollections): AgColumn[] {
        if (!this.isDateHierarchyColsEnabled(cols)) {
            return [];
        }

        const newCols: AgColumn[] = [];

        for (const col of cols.list) {
            this.createDateHierarchyColDefs(col).forEach((colDef) => {
                this.gos.validateColDef(colDef, colDef.colId!, true);
                const newCol = new AgColumn(colDef, null, colDef.colId!, true);
                this.createBean(newCol);
                newCols.push(newCol);
            });
        }

        return newCols;
    }
}
