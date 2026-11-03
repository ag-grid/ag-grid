import type { LocaleTextFunc } from 'ag-stack';

import type {
    ColDef,
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

export class GroupHierarchyColService extends BeanStub implements NamedBean, IGroupHierarchyColService {
    beanName = 'groupHierarchyColSvc' as const;

    /** Generated hierarchy cols (year, quarter, month, …). `contributeTo` prepends these into the builder's
     *  tree; the builder owns their padding wrappers via ColumnModel's wrapper cache. */
    public columns: AgColumn[] = [];

    /** Source col → its generated virtuals. */
    private readonly sourceColumnMap = new Map<AgColumn, AgColumn[]>();
    /** The `groupHierarchyConfig` the cols' defs were built from: their getters are reused only while it is. */
    private builtConfig: GroupHierarchyConfig | undefined;

    /** A planned col keeps the current col with its colId and source col, its def refreshed in place (the live
     *  getters keep an unchanged part a `setColDef` no-op); every other planned col is created. */
    public contributeTo(build: ColumnTreeBuild): void {
        const config = this.gos.get('groupHierarchyConfig');
        const { plan, matches } = this.planHierarchy(build.columns, config);
        const sameConfig = config === this.builtConfig;
        this.builtConfig = config;
        const len = plan.length;
        if (len === 0) {
            if (this.columns.length > 0) {
                this.clearColumns();
            }
            return;
        }
        const { beans, gos, sourceColumnMap } = this;
        const current = this.columns;
        // Not in plan order: the current cols by colId, the first of a repeated colId kept, each taken once.
        let reusable: Map<string, AgColumn> | null = null;
        if (!matches) {
            reusable = new Map();
            for (let i = current.length - 1; i >= 0; --i) {
                reusable.set(current[i].colId, current[i]);
            }
        }
        const cols: AgColumn[] = reusable ? new Array(len) : current;
        for (let i = 0; i < len; ++i) {
            const { sourceCol, part, colId } = plan[i];
            let col: AgColumn | undefined = current[i];
            if (reusable) {
                col = reusable.get(colId);
                if (col?.derivedFromCol === sourceCol) {
                    reusable.delete(colId);
                } else {
                    col = undefined;
                }
            }
            if (col) {
                const colDef = this.createColDefForPart(part, sourceCol, colId, sameConfig ? col.colDef : undefined);
                if (col.setColDef(colDef, null, build.source)) {
                    gos.validateColDef(colDef, colId, true);
                }
                cols[i] = col;
                continue;
            }
            const colDef = this.createColDefForPart(part, sourceCol, colId);
            gos.validateColDef(colDef, colId, true);
            col = new AgColumn(colDef, null, colId, true, 'hierarchy');
            col.derivedFromCol = sourceCol;
            beans.context.createBean(col);
            cols[i] = col;
        }
        if (reusable) {
            this.columns = cols;
            sourceColumnMap.clear();
            for (let i = 0; i < len; ++i) {
                const sourceCol = plan[i].sourceCol;
                const bucket = sourceColumnMap.get(sourceCol);
                if (bucket) {
                    bucket.push(cols[i]);
                } else {
                    sourceColumnMap.set(sourceCol, [cols[i]]);
                }
            }
        }
        prependWrappedColumnsToTree(build, cols);
    }

    /** Project the hierarchy cols expected for `colDefList`; `matches` is true when their colIds and source cols
     *  equal the current `columns`' (same count, same order), so each col is kept in its slot. */
    private planHierarchy(
        colDefList: AgColumn[],
        config: GroupHierarchyConfig | undefined
    ): { plan: HierarchyPlanEntry[]; matches: boolean } {
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
                if (
                    matches &&
                    (k >= current.length || current[k].colId !== colId || current[k].derivedFromCol !== sourceCol)
                ) {
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
    }

    public compareVirtualColumns(colA: AgColumn, colB: AgColumn): number | null {
        const sourceA = colA.colKind === 'hierarchy' ? colA.derivedFromCol : null;
        const sourceB = colB.colKind === 'hierarchy' ? colB.derivedFromCol : null;
        // Both virtuals: same source ⇒ rank by their order in its bucket; otherwise defer to caller (null).
        if (sourceA && sourceB) {
            const bucket = sourceA === sourceB ? this.sourceColumnMap.get(sourceA) : undefined;
            return bucket ? bucket.indexOf(colA) - bucket.indexOf(colB) : null;
        }
        // A virtual sorts BEFORE its own source col.
        if (sourceB === colA) {
            return 1;
        }
        if (sourceA === colB) {
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
