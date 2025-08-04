import type {
    ColDef,
    ColKey,
    GridOptions,
    HeaderValueGetterParams,
    IDateHierarchyColService,
    NamedBean,
    PropertyChangedEvent,
    PropertyValueChangedEvent,
    ValueGetterParams,
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

export class DateHierarchyColService extends BeanStub implements NamedBean, IDateHierarchyColService {
    beanName = 'dateHierarchyColSvc' as const;

    public columns: _ColumnCollections | null = null;

    public postConstruct(): void {}

    public addColumns(cols: _ColumnCollections): void {
        const dateHierarchyCols = this.columns;
        if (dateHierarchyCols == null) {
            return;
        }

        cols.list = dateHierarchyCols.list
            .filter((col) => !cols.list.some((c) => c.getColId() === col.getColId()))
            .concat(cols.list);

        cols.tree = dateHierarchyCols.tree
            .filter((col) => !cols.tree.some((c) => c.getId() === col.getId()))
            .concat(cols.list);

        _updateColsMap(cols);
    }

    public createColumns(
        cols: _ColumnCollections,
        updateOrders: (callback: (cols: AgColumn[] | null) => AgColumn[] | null) => void
    ): void {
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

    public isDateHierarchyColsEnabled(cols: _ColumnCollections): boolean {
        return cols.list.some((col) => this.isDateHierarchyColsEnabledForCol(col));
    }

    public isDateHierarchyColsEnabledForCol(col: AgColumn): boolean {
        const { dataTypeSvc } = this.beans;
        const def = col.getColDef();
        const isDateCol = dataTypeSvc?.getBaseDataType(col)?.includes('date');
        return !!(def.rowGroupingHierarchy && (def.rowGroup || def.enableRowGroup) && isDateCol);
    }

    private createDateHierarchyColDefs(sourceCol: AgColumn): ColDef[] {
        const colDefs: ColDef[] = [];
        const sourceColDef = sourceCol.getColDef();

        if (!sourceColDef.rowGroupingHierarchy) {
            return colDefs;
        }

        if (this.isDateHierarchyColsEnabledForCol(sourceCol)) {
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

    private createColDefForPart(part: string, sourceCol: AgColumn, sourceColDef: ColDef): ColDef | null {
        const { valueSvc, colNames } = this.beans;

        const base: ColDef = {
            enableRowGroup: true,
            rowGroup: sourceColDef.rowGroup,
            hide: true,
            keyCreator: (params) => params.value,
        };

        const getDatePartValueGetter =
            (index: number, map?: (part: string) => string) => (params: ValueGetterParams) => {
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
                    return map ? map(parts[index]) : parts[index];
                }

                return innerValue;
            };

        const getHeaderValueGetter = (part: string) => (params: HeaderValueGetterParams) => {
            const sourceName = colNames.getDisplayNameForColumn(sourceCol, params.location);
            if (sourceName) {
                return `${sourceName} (${part})`;
            }
            return '';
        };

        switch (part) {
            case 'year':
                return {
                    ...base,
                    colId: `${sourceColDef.colId ?? sourceColDef.field}-year`,
                    headerValueGetter: getHeaderValueGetter('Year'),
                    valueGetter: getDatePartValueGetter(0),
                };

            case 'quarter':
                return {
                    ...base,
                    colId: `${sourceColDef.colId ?? sourceColDef.field}-quarter`,
                    headerValueGetter: getHeaderValueGetter('Quarter'),
                    valueGetter: getDatePartValueGetter(1, (month) => (Math.floor(Number(month) / 4) + 1).toString()),
                };

            case 'month':
                return {
                    ...base,
                    colId: `${sourceColDef.colId ?? sourceColDef.field}-month`,
                    headerValueGetter: getHeaderValueGetter('Month'),
                    valueGetter: getDatePartValueGetter(1),
                };

            case 'day':
                return {
                    ...base,
                    colId: `${sourceColDef.colId ?? sourceColDef.field}-day`,
                    headerValueGetter: getHeaderValueGetter('Day'),
                    valueGetter: getDatePartValueGetter(2),
                };

            case 'hour':
                return {
                    ...base,
                    colId: `${sourceColDef.colId ?? sourceColDef.field}-hour`,
                    headerValueGetter: getHeaderValueGetter('Hour'),
                    valueGetter: getDatePartValueGetter(3),
                };

            case 'minute':
                return {
                    ...base,
                    colId: `${sourceColDef.colId ?? sourceColDef.field}-minute`,
                    headerValueGetter: getHeaderValueGetter('Minute'),
                    valueGetter: getDatePartValueGetter(3),
                };

            case 'second':
                return {
                    ...base,
                    colId: `${sourceColDef.colId ?? sourceColDef.field}-second`,
                    headerValueGetter: getHeaderValueGetter('Second'),
                    valueGetter: getDatePartValueGetter(3),
                };

            default:
                return null;
        }
    }
}
