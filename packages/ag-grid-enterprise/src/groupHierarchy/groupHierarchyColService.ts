import type {
    ColDef,
    ColKey,
    GridOptions,
    IGroupHierarchyColService,
    NamedBean,
    PropertyChangedEvent,
    PropertyValueChangedEvent,
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
    _removeAllFromArray,
    _updateColsMap,
} from 'ag-grid-community';

import {
    _getGroupHierarchy,
    getDatePartValueGetter,
    getHeaderValueGetter,
    numericalMonthToNamedMonth,
} from './groupHierarchyUtils';

export class GroupHierarchyColService extends BeanStub implements NamedBean, IGroupHierarchyColService {
    beanName = 'groupHierarchyColSvc' as const;

    public columns: _ColumnCollections | null = null;
    /** Map from primary column to virtual (i.e. generated) columns */
    private sourceColumnMap = new WeakMap<AgColumn, AgColumn[]>();
    /** Map from virtual column to associated primary column. Inverse of `sourceColumnMap` */
    private inverseColumnMap = new WeakMap<AgColumn, AgColumn>();

    public addColumns(cols: _ColumnCollections): void {
        const groupHierarchyCols = this.columns;
        if (groupHierarchyCols == null) {
            return;
        }

        cols.list = groupHierarchyCols.list
            .filter((col) => !cols.list.some((c) => c.getColId() === col.getColId()))
            .concat(cols.list);

        cols.tree = groupHierarchyCols.tree
            .filter((col) => !cols.tree.some((c) => c.getId() === col.getId()))
            .concat(cols.tree);

        _updateColsMap(cols);
    }

    public createColumns(cols: _ColumnCollections): void {
        const newSourceColumnMap = new WeakMap();
        const newInverseColumnMap = new WeakMap();

        const list = this.createGroupHierarchyColumns(cols, newSourceColumnMap, newInverseColumnMap);
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
        this.sourceColumnMap = newSourceColumnMap;
        this.inverseColumnMap = newInverseColumnMap;
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

    public expandColumnInto(target: AgColumn[], col: AgColumn): void {
        const expanded = this.getVirtualColumnsForColumn(col).concat(col);
        for (const expandedCol of expanded) {
            if (!target.some((_c) => _columnsMatch(_c, expandedCol) || _c.getColId() === expandedCol.getColId())) {
                target.push(expandedCol);
            }
        }
    }

    public compareVirtualColumns(colA: AgColumn, colB: AgColumn): number | null {
        const sourceA = this.inverseColumnMap.get(colA);
        const sourceB = this.inverseColumnMap.get(colB);
        if (sourceA && sourceA === sourceB) {
            const hierarchyCols = this.sourceColumnMap.get(sourceA) ?? [];
            return hierarchyCols?.indexOf(colA) - hierarchyCols?.indexOf(colB);
        }

        if (this.sourceColumnMap.get(colA)?.includes(colB)) {
            return 1;
        }

        if (this.sourceColumnMap.get(colB)?.includes(colA)) {
            return -1;
        }

        return null;
    }

    public insertVirtualColumnsForCol(columns: AgColumn<any>[], col: AgColumn<any>): AgColumn[] {
        const hierarchyCols = this.getVirtualColumnsForColumn(col);
        if (!hierarchyCols) {
            return [];
        }

        // Index at which to insert the virtual columns
        let idxCol = columns.indexOf(col);
        if (idxCol < 0) {
            idxCol = columns.length - 1;
        }

        // For simplicity, reset the `columns` array by removing all associated
        // virtual columns first
        _removeAllFromArray(columns, hierarchyCols);

        // Insert the virtual columns in the given order
        columns.splice(idxCol, 0, ...hierarchyCols);

        return hierarchyCols;
    }

    private getVirtualColumnsForColumn(col: AgColumn): AgColumn[] {
        if (this.isGroupHierarchyColsEnabledForCol(col)) {
            return this.sourceColumnMap.get(col) ?? [];
        }
        return [];
    }

    private isGroupHierarchyColsEnabled(cols: _ColumnCollections): boolean {
        return cols.list.some((col) => this.isGroupHierarchyColsEnabledForCol(col));
    }

    private isGroupHierarchyColsEnabledForCol(col: AgColumn): boolean {
        const def = col.getColDef();
        const groupHierarchy = _getGroupHierarchy(def);
        return !!(
            groupHierarchy &&
            (def.rowGroup ||
                def.enableRowGroup ||
                def.rowGroupIndex != null ||
                def.pivot ||
                def.enablePivot ||
                def.pivotIndex != null)
        );
    }

    private createGroupHierarchyColDefs(sourceCol: AgColumn): ColDef[] {
        const colDefs: ColDef[] = [];
        const sourceColDef = sourceCol.getColDef();
        const groupHierarchy = _getGroupHierarchy(sourceColDef);

        if (!groupHierarchy) {
            return colDefs;
        }

        if (!this.isGroupHierarchyColsEnabledForCol(sourceCol)) {
            return colDefs;
        }

        for (const part of groupHierarchy) {
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

        return colDefs;
    }

    private createGroupHierarchyColumns(
        cols: _ColumnCollections,
        sourceColMap: WeakMap<AgColumn, AgColumn[]>,
        inverseColMap: WeakMap<AgColumn, AgColumn>
    ): AgColumn[] {
        if (!this.isGroupHierarchyColsEnabled(cols)) {
            return [];
        }

        const newCols: AgColumn[] = [];

        for (const col of cols.list) {
            for (const colDef of this.createGroupHierarchyColDefs(col)) {
                const colId = colDef.colId!;
                this.gos.validateColDef(colDef, colId, true);
                const newCol = new AgColumn(colDef, null, colId, true);
                this.createBean(newCol);
                newCols.push(newCol);
                updateMap(sourceColMap, col, newCol);
                inverseColMap.set(newCol, col);
            }
        }

        return newCols;
    }

    private createColDefForPart(part: string, sourceCol: AgColumn, sourceColDef: ColDef): ColDef | null {
        const { beans, gos } = this;

        const colId = `${GROUP_HIERARCHY_COLUMN_ID_PREFIX}-${sourceCol.getColId()}-${part}`;
        const defaults: Partial<ColDef> = {
            enableRowGroup: sourceColDef.enableRowGroup,
            rowGroup: sourceColDef.rowGroup,
            enablePivot: sourceColDef.enablePivot,
            hide: true,
            editable: false,
        };

        const groupHierarchyConfig = gos.get('groupHierarchyConfig') ?? {};
        if (part in groupHierarchyConfig) {
            const colDef = { ...defaults, ...groupHierarchyConfig[part] };
            colDef.colId ??= colId;
            return _addColumnDefaultAndTypes(beans, colDef, colDef.colId, true);
        }

        const base: ColDef = _addColumnDefaultAndTypes(beans, { colId, ...defaults }, colId, true);

        const translate = beans.localeSvc?.getLocaleTextFunc();
        const translatePart = (part: string, fallback: string) => translate?.(part, fallback) ?? fallback;

        switch (part) {
            case 'year':
                return {
                    ...base,
                    headerValueGetter: getHeaderValueGetter(beans, sourceCol, translatePart(part, 'Year')),
                    valueGetter: getDatePartValueGetter(beans, sourceCol, 0),
                };

            case 'quarter':
                return {
                    ...base,
                    headerValueGetter: getHeaderValueGetter(beans, sourceCol, translatePart(part, 'Quarter')),
                    valueGetter: getDatePartValueGetter(beans, sourceCol, 1, (month) =>
                        (Math.floor(Number(month) / 4) + 1).toString()
                    ),
                };

            case 'month':
                return {
                    ...base,
                    headerValueGetter: getHeaderValueGetter(beans, sourceCol, translatePart(part, 'Month')),
                    valueGetter: getDatePartValueGetter(beans, sourceCol, 1),
                };

            case 'formattedMonth':
                return {
                    ...base,
                    headerValueGetter: getHeaderValueGetter(beans, sourceCol, translatePart('month', 'Month')),
                    valueGetter: getDatePartValueGetter(beans, sourceCol, 1, (month) => {
                        const nm = numericalMonthToNamedMonth(month);
                        return translatePart(nm.localeKey, nm.month);
                    }),
                };

            case 'day':
                return {
                    ...base,
                    headerValueGetter: getHeaderValueGetter(beans, sourceCol, translatePart(part, 'Day')),
                    valueGetter: getDatePartValueGetter(beans, sourceCol, 2),
                };

            case 'hour':
                return {
                    ...base,
                    headerValueGetter: getHeaderValueGetter(beans, sourceCol, translatePart(part, 'Hour')),
                    valueGetter: getDatePartValueGetter(beans, sourceCol, 3),
                };

            case 'minute':
                return {
                    ...base,
                    headerValueGetter: getHeaderValueGetter(beans, sourceCol, translatePart(part, 'Minute')),
                    valueGetter: getDatePartValueGetter(beans, sourceCol, 4),
                };

            case 'second':
                return {
                    ...base,
                    headerValueGetter: getHeaderValueGetter(beans, sourceCol, translatePart(part, 'Second')),
                    valueGetter: getDatePartValueGetter(beans, sourceCol, 5),
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
