import type {
    AgProvidedColumnGroup,
    ColDef,
    HierarchyTreeMerge,
    IGroupHierarchyColService,
    NamedBean,
} from 'ag-grid-community';
import {
    AgColumn,
    BeanStub,
    GROUP_HIERARCHY_COLUMN_ID_PREFIX,
    _addColumnDefaultAndTypes,
    _removeAllFromArray,
} from 'ag-grid-community';

import {
    _getGroupHierarchy,
    getDatePartValueGetter,
    getHeaderValueGetter,
    numericalMonthToNamedMonth,
} from './groupHierarchyUtils';

/** Planning pass entry: cheap projection of one expected hierarchy col. ColDef construction is
 *  deferred until the planning pass detects a mismatch with `this.columns`. */
interface HierarchyPlanEntry {
    sourceCol: AgColumn;
    part: string | ColDef;
    colId: string;
}

export class GroupHierarchyColService extends BeanStub implements NamedBean, IGroupHierarchyColService {
    beanName = 'groupHierarchyColSvc' as const;

    /** Generated hierarchy cols (year, quarter, month, etc.). ColumnModel splices these into the
     *  colDef tree and owns the balanced-tree wrappers (via `colGroupSvc.wrapAutoColInBalancedTree`). */
    public columns: AgColumn[] = [];

    /** Source col → its generated virtuals. */
    private readonly sourceColumnMap = new Map<AgColumn, AgColumn[]>();
    /** Virtual col → its source col. */
    private readonly inverseColumnMap = new Map<AgColumn, AgColumn>();

    /** Wrapper cache keyed by hierarchy leaf col. Survives across `applyToColDefTree` calls so
     *  `_destroyColumnTree` preserves wrappers when `(col, depth)` is unchanged. */
    private readonly wrapperCache = new Map<AgColumn, { wrapper: AgColumn | AgProvidedColumnGroup; depth: number }>();

    /** Two-phase to skip bean churn on no-op refreshes: plan colIds, compare to `this.columns`,
     *  rebuild only on mismatch. Returns input refs when no hierarchy cols are active. */
    public applyToColDefTree(
        colDefList: AgColumn[],
        colDefTree: (AgColumn | AgProvidedColumnGroup)[],
        treeDepth: number
    ): HierarchyTreeMerge {
        const plan = this.planHierarchy(colDefList);

        if (plan.length === 0) {
            if (this.columns.length > 0) {
                this.columns = [];
                this.sourceColumnMap.clear();
                this.inverseColumnMap.clear();
                this.wrapperCache.clear();
            }
            return { list: colDefList, tree: colDefTree };
        }

        if (!planMatches(plan, this.columns)) {
            this.rebuildColumns(plan);
        }
        return this.composeMerged(colDefTree, colDefList, treeDepth);
    }

    /** Allocates new hierarchy AgColumns from a plan whose colIds differ from current. */
    private rebuildColumns(plan: HierarchyPlanEntry[]): void {
        const sourceMap = this.sourceColumnMap;
        const inverseMap = this.inverseColumnMap;
        sourceMap.clear();
        inverseMap.clear();

        const planLen = plan.length;
        const newCols: AgColumn[] = new Array(planLen);
        const beans = this.beans;
        const gos = this.gos;
        for (let i = 0; i < planLen; ++i) {
            const entry = plan[i];
            const sourceCol = entry.sourceCol;
            const colDef = this.buildColDefFromPart(entry.part, sourceCol);
            const colId = colDef.colId!;
            gos.validateColDef(colDef, colId, true);
            const newCol = new AgColumn(colDef, null, colId, true);
            beans.context.createBean(newCol);
            newCols[i] = newCol;
            let bucket = sourceMap.get(sourceCol);
            if (bucket === undefined) {
                bucket = [];
                sourceMap.set(sourceCol, bucket);
            }
            bucket.push(newCol);
            inverseMap.set(newCol, sourceCol);
        }

        this.columns = newCols;
        // Drop wrapper-cache entries for cols that no longer exist (count may be unchanged).
        const wrapperCache = this.wrapperCache;
        const live = new Set<AgColumn>(newCols);
        for (const col of wrapperCache.keys()) {
            if (!live.has(col)) {
                wrapperCache.delete(col);
            }
        }
    }

    /** Build / reuse wrappers and compose `[...wrappers, ...primary]` list + tree. When `colGroupSvc`
     *  is absent the grid has no wrappers — return input refs unchanged. */
    private composeMerged(
        primaryTree: (AgColumn | AgProvidedColumnGroup)[],
        primaryList: AgColumn[],
        treeDepth: number
    ): HierarchyTreeMerge {
        const colGroupSvc = this.beans.colGroupSvc;
        if (!colGroupSvc) {
            return { list: primaryList, tree: primaryTree };
        }
        const cols = this.columns;
        const colsLen = cols.length;
        const wrapperCache = this.wrapperCache;
        const primaryTreeLen = primaryTree.length;
        const newTree = new Array<AgColumn | AgProvidedColumnGroup>(colsLen + primaryTreeLen);
        for (let i = 0; i < colsLen; ++i) {
            const col = cols[i];
            const cached = wrapperCache.get(col);
            let wrapper: AgColumn | AgProvidedColumnGroup;
            if (cached?.depth === treeDepth) {
                wrapper = cached.wrapper;
            } else {
                wrapper = colGroupSvc.wrapAutoColInBalancedTree(col, treeDepth);
                wrapperCache.set(col, { wrapper, depth: treeDepth });
            }
            newTree[i] = wrapper;
        }
        for (let i = 0; i < primaryTreeLen; ++i) {
            newTree[colsLen + i] = primaryTree[i];
        }

        const primaryListLen = primaryList.length;
        const newList = new Array<AgColumn>(colsLen + primaryListLen);
        for (let i = 0; i < colsLen; ++i) {
            newList[i] = cols[i];
        }
        for (let i = 0; i < primaryListLen; ++i) {
            newList[colsLen + i] = primaryList[i];
        }
        return { list: newList, tree: newTree };
    }

    /** Cheap pre-pass: walks `colDefList` gathering expected entries without building any ColDef
     *  objects. Filters out unrecognised string parts and inline ColDefs missing `colId` so
     *  `buildColDefFromPart` doesn't have to handle invalid inputs. */
    private planHierarchy(colDefList: AgColumn[]): HierarchyPlanEntry[] {
        const plan: HierarchyPlanEntry[] = [];
        const groupHierarchyConfig = this.gos.get('groupHierarchyConfig');
        for (let i = 0, len = colDefList.length; i < len; ++i) {
            const sourceCol = colDefList[i];
            const parts = hierarchyPartsForCol(sourceCol);
            if (parts === null) {
                continue;
            }
            const sourceColId = sourceCol.colId;
            for (let j = 0, m = parts.length; j < m; ++j) {
                const part = parts[j];
                if (typeof part === 'string') {
                    // Valid only when user-configured (via `groupHierarchyConfig`) or a canonical date part.
                    if (groupHierarchyConfig?.[part] === undefined && !CANONICAL_HIERARCHY_PARTS.has(part)) {
                        continue;
                    }
                    plan.push({ sourceCol, part, colId: `${GROUP_HIERARCHY_COLUMN_ID_PREFIX}-${sourceColId}-${part}` });
                } else if (part.colId) {
                    // User-supplied inline ColDef requires an explicit colId.
                    plan.push({ sourceCol, part, colId: part.colId });
                }
            }
        }
        return plan;
    }

    public override destroy(): void {
        // Hierarchy cols + wrappers live in ColumnModel.colDefTree (destroyed by `_destroyColumnTree`);
        // just clear local refs here.
        this.columns = [];
        this.sourceColumnMap.clear();
        this.inverseColumnMap.clear();
        this.wrapperCache.clear();
        super.destroy();
    }

    /** Append `[...virtuals, col]` to `target`, deduped against `targetSet`. Caller owns `targetSet`
     *  so successive calls share O(1) dedup state. */
    public expandColumnInto(target: AgColumn[], targetSet: Set<AgColumn>, col: AgColumn): void {
        const virtualCols = this.sourceColumnMap.get(col);
        if (virtualCols !== undefined) {
            for (let i = 0, len = virtualCols.length; i < len; ++i) {
                const vc = virtualCols[i];
                if (!targetSet.has(vc)) {
                    targetSet.add(vc);
                    target.push(vc);
                }
            }
        }
        if (!targetSet.has(col)) {
            targetSet.add(col);
            target.push(col);
        }
    }

    public compareVirtualColumns(colA: AgColumn, colB: AgColumn): number | null {
        const inverseMap = this.inverseColumnMap;
        const sourceA = inverseMap.get(colA);
        const sourceB = inverseMap.get(colB);
        // Sibling virtuals from the same source: rank by insertion order in the source's bucket.
        if (sourceA !== undefined && sourceA === sourceB) {
            const siblings = this.sourceColumnMap.get(sourceA)!;
            let idxA = -1;
            let idxB = -1;
            for (let i = 0, len = siblings.length; i < len; ++i) {
                const c = siblings[i];
                if (c === colA) {
                    idxA = i;
                } else if (c === colB) {
                    idxB = i;
                }
                if (idxA >= 0 && idxB >= 0) {
                    break;
                }
            }
            return idxA - idxB;
        }
        // Virtuals sort BEFORE their source col.
        if (sourceB === colA) {
            return 1;
        }
        if (sourceA === colB) {
            return -1;
        }
        return null;
    }

    public insertVirtualColumnsForCol(columns: AgColumn[], col: AgColumn): AgColumn[] | null {
        const hierarchyCols = this.sourceColumnMap.get(col);
        if (hierarchyCols === undefined || hierarchyCols.length === 0) {
            return null;
        }

        // Remove any existing virtuals from `columns` first, then splice them in adjacent to `col`.
        let idxCol = columns.indexOf(col);
        if (idxCol < 0) {
            idxCol = columns.length - 1;
        }
        _removeAllFromArray(columns, hierarchyCols);
        columns.splice(idxCol, 0, ...hierarchyCols);

        return hierarchyCols;
    }

    private createColDefForPart(part: string, sourceCol: AgColumn, sourceColDef: ColDef): ColDef | null {
        const { beans, gos } = this;

        const colId = `${GROUP_HIERARCHY_COLUMN_ID_PREFIX}-${sourceCol.colId}-${part}`;
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

        const translate = this.getLocaleTextFunc();
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

    /** Build the real ColDef. Plan pass guarantees string parts are recognised (else filtered out),
     *  so `createColDefForPart`'s null branch is dead in practice — non-null assertion is safe. */
    private buildColDefFromPart(part: string | ColDef, sourceCol: AgColumn): ColDef {
        if (typeof part !== 'string') {
            return _addColumnDefaultAndTypes(this.beans, part, part.colId!, true);
        }
        return this.createColDefForPart(part, sourceCol, sourceCol.colDef)!;
    }
}

/** Date-part names recognised by `createColDefForPart`'s switch. Used by the plan pass to
 *  filter out unrecognised strings before they reach the build pass. */
const CANONICAL_HIERARCHY_PARTS = new Set<string>([
    'year',
    'quarter',
    'month',
    'formattedMonth',
    'day',
    'hour',
    'minute',
    'second',
]);

/** Element-for-element colId match between an entry plan and a flat col list. */
function planMatches(plan: readonly HierarchyPlanEntry[], current: readonly AgColumn[]): boolean {
    const len = plan.length;
    if (len !== current.length) {
        return false;
    }
    for (let i = 0; i < len; ++i) {
        if (plan[i].colId !== current[i].colId) {
            return false;
        }
    }
    return true;
}

/** Returns the hierarchy parts iff the col is eligible for hierarchy generation, else null. */
function hierarchyPartsForCol(col: AgColumn): NonNullable<ColDef['groupHierarchy']> | null {
    const def = col.colDef;
    // Cheap eligibility gate first — only call `_getGroupHierarchy` when the col actually
    // participates in row-group / pivot.
    if (
        !def.rowGroup &&
        !def.enableRowGroup &&
        def.rowGroupIndex == null &&
        !def.pivot &&
        !def.enablePivot &&
        def.pivotIndex == null
    ) {
        return null;
    }
    return _getGroupHierarchy(def) ?? null;
}
