import type { LocaleTextFunc } from 'ag-stack';

import type {
    ColDef,
    ColumnEventType,
    ColumnTreeBuild,
    GroupHierarchyConfig,
    IGroupHierarchyColService,
    NamedBean,
} from 'ag-grid-community';
import { AgColumn, BeanStub, GROUP_HIERARCHY_COLUMN_ID_PREFIX, _addColumnDefaultAndTypes } from 'ag-grid-community';

import { prependWrappedColumnsToTree } from '../columns/columnTreeEdit';
import { getDatePartValueGetter, getHeaderValueGetter, numericalMonthToNamedMonth } from './groupHierarchyUtils';

/** A canonical date part: header label (+ optional distinct locale key), the date-part index its value
 *  getter reads, and an optional value mapper (quarter derives from month; formattedMonth localises it). */
interface DatePartSpec {
    label: string;
    localeKey?: string;
    index: number;
    map?: (value: string, translate: LocaleTextFunc) => string;
}

const DATE_PART_SPECS = {
    year: { label: 'Year', index: 0 },
    // `index: 1` is the 1-based month (1-12); quarter = ceil(month / 3): Q1=1-3, Q2=4-6, Q3=7-9, Q4=10-12.
    quarter: { label: 'Quarter', index: 1, map: (m) => Math.ceil(Number(m) / 3).toString() },
    month: { label: 'Month', index: 1 },
    formattedMonth: {
        label: 'Month',
        localeKey: 'month',
        index: 1,
        map: (m, translate) => {
            const named = numericalMonthToNamedMonth(m);
            return translate(named.localeKey, named.month);
        },
    },
    day: { label: 'Day', index: 2 },
    hour: { label: 'Hour', index: 3 },
    minute: { label: 'Minute', index: 4 },
    second: { label: 'Second', index: 5 },
} satisfies Record<string, DatePartSpec>;

type HierarchyDatePart = keyof typeof DATE_PART_SPECS;

/** Cheap projection of one expected hierarchy col; ColDef construction is deferred until needed. */
interface HierarchyPlanEntry {
    sourceCol: AgColumn;
    part: string | ColDef;
    colId: string;
}

/** Reverse-lookup for a virtual col: source col + position in that source's bucket. The stored index
 *  lets `compareVirtualColumns` rank siblings in O(1) without re-scanning the bucket. */
interface VirtualColInfo {
    source: AgColumn;
    index: number;
}

export class GroupHierarchyColService extends BeanStub implements NamedBean, IGroupHierarchyColService {
    beanName = 'groupHierarchyColSvc' as const;

    /** Generated hierarchy cols (year, quarter, month, …). `contributeTo` prepends these into the builder's
     *  tree; the builder owns their padding wrappers via ColumnModel's wrapper cache. */
    public columns: AgColumn[] = [];

    /** Source col → its generated virtuals. */
    private readonly sourceColumnMap = new Map<AgColumn, AgColumn[]>();
    /** Virtual col → `{ source, index }` — the inverse of `sourceColumnMap`. */
    private readonly virtualColInfo = new Map<AgColumn, VirtualColInfo>();

    /** Plan the expected colIds: rebuild the cols when they differ, else refresh their defs in place so a
     *  config / inline-part change is picked up without churning beans on a no-op refresh. */
    public contributeTo(build: ColumnTreeBuild): void {
        const { plan, matches } = this.planHierarchy(build.columns);
        if (plan.length === 0) {
            if (this.columns.length > 0) {
                this.clearColumns();
            }
            return;
        }
        if (matches) {
            this.reapplyDefs(plan, build.source);
        } else {
            this.rebuildColumns(plan);
        }
        prependWrappedColumnsToTree(build, this.columns);
    }

    /** Same colIds: refresh each def in place. Reusing the live getters keeps an unchanged part a `setColDef`
     *  no-op, so only a real change (config / inline part / `defaultColDef`) re-applies. */
    private reapplyDefs(plan: HierarchyPlanEntry[], source: ColumnEventType): void {
        const { columns, gos } = this;
        for (let i = 0, len = plan.length; i < len; ++i) {
            const { sourceCol, part, colId } = plan[i];
            const col = columns[i];
            const colDef = this.createColDefForPart(part, sourceCol, colId, col.colDef);
            if (col.setColDef(colDef, null, source)) {
                gos.validateColDef(colDef, colId, true);
            }
        }
    }

    /** Allocate fresh hierarchy AgColumns from a plan whose colIds differ from current. */
    private rebuildColumns(plan: HierarchyPlanEntry[]): void {
        const { sourceColumnMap, virtualColInfo, beans, gos } = this;
        sourceColumnMap.clear();
        virtualColInfo.clear();
        const cols: AgColumn[] = new Array(plan.length);
        for (let i = 0, len = plan.length; i < len; ++i) {
            const { sourceCol, part, colId } = plan[i];
            const colDef = this.createColDefForPart(part, sourceCol, colId);
            gos.validateColDef(colDef, colId, true);
            const col = new AgColumn(colDef, null, colId, true, 'hierarchy');
            beans.context.createBean(col);
            cols[i] = col;
            const bucket = sourceColumnMap.get(sourceCol);
            virtualColInfo.set(col, { source: sourceCol, index: bucket?.length ?? 0 });
            if (bucket) {
                bucket.push(col);
            } else {
                sourceColumnMap.set(sourceCol, [col]);
            }
        }
        this.columns = cols;
    }

    /** Project the hierarchy cols expected for `colDefList`; `matches` is true when their colIds equal the
     *  current `columns` (same count, same order), so the cols can be reused rather than rebuilt. */
    private planHierarchy(colDefList: AgColumn[]): { plan: HierarchyPlanEntry[]; matches: boolean } {
        const config = this.gos.get('groupHierarchyConfig');
        const current = this.columns;
        const plan: HierarchyPlanEntry[] = [];
        let matches = true;
        for (let i = 0, len = colDefList.length; i < len; ++i) {
            const sourceCol = colDefList[i];
            const parts = hierarchyPartsForCol(sourceCol);
            if (parts == null) {
                continue;
            }
            for (let j = 0, m = parts.length; j < m; ++j) {
                const part = parts[j];
                const colId = makeHierarchyColId(sourceCol.colId, part, config);
                if (colId === null) {
                    continue;
                }
                const k = plan.length;
                if (matches && (k >= current.length || current[k].colId !== colId)) {
                    matches = false;
                }
                plan.push({ sourceCol, part, colId });
            }
        }
        // Trailing current cols with no expected counterpart also count as a mismatch.
        return { plan, matches: matches && plan.length === current.length };
    }

    public override destroy(): void {
        this.clearColumns();
        super.destroy();
    }

    private clearColumns(): void {
        this.columns = [];
        this.sourceColumnMap.clear();
        this.virtualColInfo.clear();
    }

    public compareVirtualColumns(colA: AgColumn, colB: AgColumn): number | null {
        const virtualInfo = this.virtualColInfo;
        const infoA = virtualInfo.get(colA);
        const infoB = virtualInfo.get(colB);
        // Both virtuals: same source ⇒ rank by stored bucket index; otherwise defer to caller (null).
        if (infoA !== undefined && infoB !== undefined) {
            return infoA.source === infoB.source ? infoA.index - infoB.index : null;
        }
        // A virtual sorts BEFORE its own source col.
        if (infoB?.source === colA) {
            return 1;
        }
        if (infoA?.source === colB) {
            return -1;
        }
        return null;
    }

    /** This source col's generated virtuals, in order (seated immediately before it); undefined if none. */
    public getVirtualCols(sourceCol: AgColumn): AgColumn[] | undefined {
        return this.sourceColumnMap.get(sourceCol);
    }

    /** Build the ColDef for one part. Inline parts merge directly; configured parts overlay the config; a
     *  canonical date part takes its header/value getters from {@link DATE_PART_SPECS}. `reuse` (a same-col
     *  refresh) supplies the prior getters, so they aren't re-minted as fresh closures every refresh. */
    private createColDefForPart(part: string | ColDef, sourceCol: AgColumn, colId: string, reuse?: ColDef): ColDef {
        const { beans, gos } = this;

        if (typeof part !== 'string') {
            return _addColumnDefaultAndTypes(beans, part, colId, true);
        }

        // hierarchy cols inherit the source col's row-group + pivot affordances so their chips stay draggable
        // in the row-group / pivot drop zones
        const { enableRowGroup, enablePivot } = sourceCol.colDef;
        const defaults: Partial<ColDef> = { enableRowGroup, enablePivot, hide: true, editable: false };

        const config = gos.get('groupHierarchyConfig') ?? {};
        if (part in config) {
            const colDef = { ...defaults, ...config[part] };
            colDef.colId ??= colId;
            return _addColumnDefaultAndTypes(beans, colDef, colDef.colId, true);
        }

        const base = _addColumnDefaultAndTypes(beans, { colId, ...defaults }, colId, true);
        if (reuse?.valueGetter) {
            return { ...base, headerValueGetter: reuse.headerValueGetter, valueGetter: reuse.valueGetter };
        }

        // `makeHierarchyColId` only admits configured (handled above) or canonical parts, so the spec exists.
        const spec: DatePartSpec = DATE_PART_SPECS[part as HierarchyDatePart];
        const translate = this.getLocaleTextFunc();
        const { map } = spec;
        return {
            ...base,
            headerValueGetter: getHeaderValueGetter(beans, sourceCol, translate(spec.localeKey ?? part, spec.label)),
            valueGetter: getDatePartValueGetter(beans, sourceCol, spec.index, map && ((v) => map(v, translate))),
        };
    }
}

/** colId for `(sourceColId, part)`, or null when the part is invalid and must be skipped — an unrecognised
 *  string part (not configured, not canonical), or an inline ColDef without colId. */
const makeHierarchyColId = (
    sourceColId: string,
    part: string | ColDef,
    config: GroupHierarchyConfig | undefined
): string | null => {
    if (typeof part !== 'string') {
        return part.colId || null;
    }
    if (config?.[part] === undefined && !(part in DATE_PART_SPECS)) {
        return null;
    }
    return `${GROUP_HIERARCHY_COLUMN_ID_PREFIX}-${sourceColId}-${part}`;
};

/** The hierarchy parts iff the col is eligible for hierarchy generation, else null. */
const hierarchyPartsForCol = (col: AgColumn): NonNullable<ColDef['groupHierarchy']> | null | undefined => {
    const def = col.colDef;
    // Cheap eligibility gate first — only read hierarchy parts when the col participates in row-group / pivot.
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

    return def.groupHierarchy ?? def.rowGroupingHierarchy;
};
