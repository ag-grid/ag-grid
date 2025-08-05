import type {
    ColDef,
    ColKey,
    GridOptions,
    HeaderValueGetterParams,
    IGroupHierarchyColService,
    IRowNode,
    NamedBean,
    PropertyChangedEvent,
    PropertyValueChangedEvent,
    ValueGetterParams,
    _ColumnCollections,
} from 'ag-grid-community';
import {
    AgColumn,
    BeanStub,
    GROUP_HIERARCHY_COLUMN_ID_PREFIX,
    _addColumnDefaultAndTypes,
    _areColIdsEqual,
    _columnsMatch,
    _destroyColumnTree,
    _getDateParts,
    _parseDateTimeFromString,
    _updateColsMap,
} from 'ag-grid-community';

export class GroupHierarchyColService extends BeanStub implements NamedBean, IGroupHierarchyColService {
    beanName = 'groupHierarchyColSvc' as const;

    public columns: _ColumnCollections | null = null;
    private readonly sourceColumnMap = new WeakMap<AgColumn, AgColumn[]>();

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
            .concat(cols.tree);

        _updateColsMap(cols);
    }

    public createColumns(cols: _ColumnCollections): void {
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

    public updateColumns(_event: PropertyChangedEvent | PropertyValueChangedEvent<keyof GridOptions>): void {
        // No-op
    }

    public getColumn(key: ColKey): AgColumn | null {
        return this.columns?.list.find((col) => _columnsMatch(col, key)) ?? null;
    }

    public getColumns(): AgColumn[] | null {
        return this.columns?.list ?? null;
    }

    public getVirtualColumnsForColumn(col: AgColumn): AgColumn[] {
        if (this.isDateHierarchyColsEnabledForCol(col)) {
            return this.sourceColumnMap.get(col) ?? [];
        }
        return [];
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
                const colId = colDef.colId!;
                this.gos.validateColDef(colDef, colId, true);
                const newCol = new AgColumn(colDef, null, colId, true);
                this.createBean(newCol);
                newCols.push(newCol);
                updateMap(this.sourceColumnMap, col, newCol);
            });
        }

        return newCols;
    }

    private createColDefForPart(part: string, sourceCol: AgColumn, sourceColDef: ColDef): ColDef | null {
        const { valueSvc, colNames, gos } = this.beans;

        const groupHierarchyConfig = gos.get('groupHierarchyConfig') ?? {};
        if (part in groupHierarchyConfig) {
            const providedDef = groupHierarchyConfig[part];
            if (!providedDef.colId) {
                return null;
            }
            return _addColumnDefaultAndTypes(this.beans, providedDef, providedDef.colId, true);
        }

        const base: ColDef = _addColumnDefaultAndTypes(
            this.beans,
            {
                enableRowGroup: true,
                rowGroup: sourceColDef.rowGroup,
                enablePivot: sourceColDef.enablePivot,
                hide: true,
                editable: false,
            },
            'dummy',
            true
        );

        const getDate = (node: IRowNode | null): Date | null => {
            const innerValue = valueSvc.getValue(sourceCol, node);
            let date: Date | null = null;
            if (innerValue instanceof Date) {
                date = innerValue;
            } else if (typeof innerValue === 'string') {
                date = _parseDateTimeFromString(innerValue);
            }

            return date;
        };

        const getDatePartValueGetter =
            (index: number, map?: (part: string) => string) => (params: ValueGetterParams) => {
                const date = getDate(params.node);
                const parts = _getDateParts(date);
                if (!parts) {
                    return null;
                }
                return map?.(parts[index]) ?? parts[index];
            };

        const getHeaderValueGetter = (part: string) => (params: HeaderValueGetterParams) => {
            const sourceName = colNames.getDisplayNameForColumn(sourceCol, params.location);
            if (sourceName) {
                return `${sourceName} (${part})`;
            }
            return '';
        };

        const getColId = (part: string) => `${GROUP_HIERARCHY_COLUMN_ID_PREFIX}-${sourceCol.getColId()}-${part}`;

        switch (part) {
            case 'year':
                return {
                    ...base,
                    colId: getColId(part),
                    headerValueGetter: getHeaderValueGetter('Year'),
                    valueGetter: getDatePartValueGetter(0),
                };

            case 'quarter':
                return {
                    ...base,
                    colId: getColId(part),
                    headerValueGetter: getHeaderValueGetter('Quarter'),
                    valueGetter: getDatePartValueGetter(1, (month) => (Math.floor(Number(month) / 4) + 1).toString()),
                };

            case 'month':
                return {
                    ...base,
                    colId: getColId(part),
                    headerValueGetter: getHeaderValueGetter('Month'),
                    valueGetter: getDatePartValueGetter(1),
                };

            case 'day':
                return {
                    ...base,
                    colId: getColId(part),
                    headerValueGetter: getHeaderValueGetter('Day'),
                    valueGetter: getDatePartValueGetter(2),
                };

            case 'hour':
                return {
                    ...base,
                    colId: getColId(part),
                    headerValueGetter: getHeaderValueGetter('Hour'),
                    valueGetter: getDatePartValueGetter(3),
                };

            case 'minute':
                return {
                    ...base,
                    colId: getColId(part),
                    headerValueGetter: getHeaderValueGetter('Minute'),
                    valueGetter: getDatePartValueGetter(4),
                };

            case 'second':
                return {
                    ...base,
                    colId: getColId(part),
                    headerValueGetter: getHeaderValueGetter('Second'),
                    valueGetter: getDatePartValueGetter(5),
                };

            default:
                return null;
        }
    }
}

function updateMap<T extends object>(wm: WeakMap<T, T[]>, key: T, value: T): void {
    const existing = wm.get(key);
    wm.set(key, (existing ?? []).concat(value));
}
