import { _pushToMapArray } from 'ag-stack';
import type { LocaleTextFunc } from 'ag-stack';

import type {
    ColDef,
    ColumnIdAllocator,
    ColumnTreeBuild,
    GroupHierarchyConfig,
    IGroupHierarchyColService,
    KeptHierarchyLevels,
    NamedBean,
} from 'ag-grid-community';
import {
    AgColumn,
    BeanStub,
    GROUP_HIERARCHY_COLUMN_ID_PREFIX,
    _addColumnDefaultAndTypes,
    _isSuffixedId,
} from 'ag-grid-community';

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
    /** The level's id before its suffix. */
    partId: string;
    /** The current col the level keeps, else `undefined`: a new one. */
    kept: AgColumn | undefined;
}

export class GroupHierarchyColService extends BeanStub implements NamedBean, IGroupHierarchyColService {
    beanName = 'groupHierarchyColSvc' as const;

    /** Generated hierarchy cols (year, quarter, month, …). `contributeTo` prepends these into the builder's
     *  tree; the builder owns their padding wrappers via ColumnModel's wrapper cache. */
    public columns: AgColumn[] = [];

    /** Source col → its generated virtuals. */
    private readonly sourceColumnMap = new Map<AgColumn, AgColumn[]>();
    /** The `groupHierarchyConfig` the cols' defs were built from: a part's getters are reused unless it had one. */
    private builtConfig: GroupHierarchyConfig | undefined;

    /** A planned col keeps the current col its plan entry names, its def refreshed; the rest are created. */
    public contributeTo(build: ColumnTreeBuild): void {
        const config = this.gos.get('groupHierarchyConfig');
        const { plan, matches } = this.planHierarchy(build, config);
        const builtConfig = this.builtConfig;
        this.builtConfig = config;
        const len = plan.length;
        if (len === 0) {
            if (this.columns.length > 0) {
                this.clearColumns();
            }
            return;
        }
        const { beans, gos, sourceColumnMap } = this;
        if (!matches) {
            sourceColumnMap.clear();
        }
        const cols: AgColumn[] = matches ? this.columns : new Array(len);
        const ids = build.ids!;
        for (let i = 0; i < len; ++i) {
            const { sourceCol, part, partId } = plan[i];
            let col = plan[i].kept;
            if (col) {
                const colId = col.colId;
                const colDef = this.createColDefForPart(
                    part,
                    sourceCol,
                    colId,
                    partId,
                    config,
                    typeof part === 'string' && builtConfig != null && part in builtConfig ? undefined : col.colDef
                );
                if (col.setColDef(colDef, null, build.source)) {
                    gos.validateColDef(colDef, colId, true);
                }
            } else {
                const colId = ids.allocate(partId, true);
                const colDef = this.createColDefForPart(part, sourceCol, colId, partId, config);
                if (typeof part !== 'string' && colId !== partId) {
                    beans.log.warn(273, { providedId: partId, usedId: colId });
                }
                gos.validateColDef(colDef, colId, true);
                col = new AgColumn(colDef, null, colId, true, 'hierarchy');
                col.derivedFromCol = sourceCol;
                col.createdBuildToken = build.buildToken;
                beans.context.createBean(col);
            }
            cols[i] = col;
            if (!matches) {
                _pushToMapArray(sourceColumnMap, sourceCol, col);
            }
        }
        this.columns = cols;
        prependWrappedColumnsToTree(build, cols);
    }

    /** The hierarchy cols the build's columns need; `matches`: each keeps the current col at its index, all kept. */
    private planHierarchy(
        build: ColumnTreeBuild,
        config: GroupHierarchyConfig | undefined
    ): { plan: HierarchyPlanEntry[]; matches: boolean } {
        const colDefList = build.columns;
        const current = this.columns;
        const plan: HierarchyPlanEntry[] = [];
        let matches = true;
        const keptBySource = build.keptHierarchyLevels?.bySource;
        for (let i = 0, len = colDefList.length; i < len; ++i) {
            const sourceCol = colDefList[i];
            const parts = hierarchyPartsForCol(sourceCol.colDef);
            if (parts == null) {
                continue;
            }
            const keptLevels = keptBySource?.get(sourceCol);
            for (let j = 0, m = parts.length; j < m; ++j) {
                const part = parts[j];
                const partId =
                    keptLevels === undefined
                        ? makeHierarchyColId(sourceCol.colId, part, config)
                        : keptLevels.partIds[j];
                if (partId === null) {
                    continue;
                }
                const kept = keptLevels?.kept[j];
                const k = plan.length;
                if (matches && (k >= current.length || current[k] !== kept)) {
                    matches = false;
                }
                plan.push({ sourceCol, part, partId, kept });
            }
        }
        // Trailing current cols with no expected counterpart also count as a mismatch.
        return { plan, matches: matches && plan.length === current.length };
    }

    public reserveKeptLevels(
        leafDefs: readonly (ColDef | null)[],
        leafClaims: readonly (AgColumn | undefined)[],
        ids: ColumnIdAllocator
    ): KeptHierarchyLevels {
        const { beans, sourceColumnMap } = this;
        const config = this.gos.get('groupHierarchyConfig');
        const mergedDefs = new Map<number, ColDef>();
        const bySource = new Map<AgColumn, { partIds: (string | null)[]; kept: (AgColumn | undefined)[] }>();
        for (let i = 0, leafCount = leafClaims.length; i < leafCount; ++i) {
            const sourceCol = leafClaims[i];
            if (sourceCol === undefined) {
                continue;
            }
            const levels = sourceColumnMap.get(sourceCol);
            if (levels === undefined) {
                continue;
            }
            const merged = _addColumnDefaultAndTypes(beans, leafDefs[i]!, sourceCol.colId); // a claim has its def
            mergedDefs.set(i, merged);
            const parts = hierarchyPartsForCol(merged);
            if (parts == null) {
                continue;
            }
            const len = parts.length;
            const partIds: (string | null)[] = new Array(len);
            for (let j = 0; j < len; ++j) {
                partIds[j] = makeHierarchyColId(sourceCol.colId, parts[j], config);
            }
            const kept: (AgColumn | undefined)[] = new Array(len);
            for (let j = 0; j < len; ++j) {
                const partId = partIds[j];
                const level = partId === null ? undefined : keptLevel(levels, partId, partIds, ids);
                if (level !== undefined) {
                    ids.reserve(level.colId, null);
                }
                kept[j] = level;
            }
            bySource.set(sourceCol, { partIds, kept });
        }
        return { mergedDefs, bySource };
    }

    public override destroy(): void {
        this.clearColumns();
        super.destroy();
    }

    private clearColumns(): void {
        this.columns = [];
        this.sourceColumnMap.clear();
    }

    /** This source col's generated virtuals, in order (seated immediately before it); undefined if none. */
    public getVirtualCols(sourceCol: AgColumn): AgColumn[] | undefined {
        return this.sourceColumnMap.get(sourceCol);
    }

    /** One part's ColDef, its `colId` the part's (never suffixed); `reuse` (same-col refresh) keeps prior getters. */
    private createColDefForPart(
        part: string | ColDef,
        sourceCol: AgColumn,
        colId: string,
        partId: string,
        config: GroupHierarchyConfig | undefined,
        reuse?: ColDef
    ): ColDef {
        const beans = this.beans;

        if (typeof part !== 'string') {
            return _addColumnDefaultAndTypes(beans, part, colId, true);
        }

        // hierarchy cols inherit the source col's row-group + pivot affordances so their chips stay draggable
        // in the row-group / pivot drop zones
        const { enableRowGroup, enablePivot } = sourceCol.colDef;
        const defaults: Partial<ColDef> = { enableRowGroup, enablePivot, hide: true, editable: false };

        if (config != null && part in config) {
            const colDef = { ...defaults, ...config[part] };
            colDef.colId ??= partId;
            return _addColumnDefaultAndTypes(beans, colDef, colDef.colId, true);
        }

        const base = _addColumnDefaultAndTypes(beans, { colId: partId, ...defaults }, colId, true);
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

/** The current col of `levels` a part keeps: the one at `partId`, else one at a suffix of it none of `partIds` is. */
const keptLevel = (
    levels: readonly AgColumn[],
    partId: string,
    partIds: readonly (string | null)[],
    ids: ColumnIdAllocator
): AgColumn | undefined => {
    let suffixed: AgColumn | undefined;
    for (let i = 0, len = levels.length; i < len; ++i) {
        const col = levels[i];
        const colId = col.colId;
        if (!ids.canKeep(colId)) {
            continue;
        }
        if (colId === partId) {
            return col;
        }
        if (suffixed === undefined && _isSuffixedId(colId, partId) && !partIds.includes(colId)) {
            suffixed = col;
        }
    }
    return suffixed;
};

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
const hierarchyPartsForCol = (def: ColDef): NonNullable<ColDef['groupHierarchy']> | null | undefined => {
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

    return def.groupHierarchy;
};
