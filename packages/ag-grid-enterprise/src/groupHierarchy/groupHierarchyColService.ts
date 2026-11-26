import { _pushToMapArray } from 'ag-stack';
import type { LocaleTextFunc } from 'ag-stack';

import type {
    ColDef,
    ColumnIdAllocator,
    ColumnTreeBuild,
    GroupHierarchyConfig,
    IGroupHierarchyColService,
    KeptHierarchyLevel,
    KeptHierarchyLevels,
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

export class GroupHierarchyColService extends BeanStub implements NamedBean, IGroupHierarchyColService {
    beanName = 'groupHierarchyColSvc' as const;

    /** Generated hierarchy cols (year, quarter, month, …). `contributeTo` prepends these into the builder's
     *  tree; the builder owns their padding wrappers via ColumnModel's wrapper cache. */
    public columns: AgColumn[] = [];

    /** Source col → its generated virtuals. */
    private readonly sourceColumnMap = new Map<AgColumn, AgColumn[]>();
    /** The `groupHierarchyConfig` the cols' defs were built from: a part's getters are reused unless it had one. */
    private builtConfig: GroupHierarchyConfig | undefined;

    /** A level keeps the current col its source kept for it, its def refreshed; the rest are created. */
    public contributeTo(
        build: ColumnTreeBuild,
        ids: ColumnIdAllocator,
        keptBySource: KeptHierarchyLevels | null
    ): void {
        const { beans, gos, sourceColumnMap } = this;
        const config = gos.get('groupHierarchyConfig');
        const builtConfig = this.builtConfig;
        this.builtConfig = config;
        const colDefList = build.columns;
        const current = this.columns;
        const cols: AgColumn[] = [];
        // each level keeps the current col at its index: the list and the source map stay as they are
        let matches = true;
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
                let col = keptLevels?.kept[j];
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
                    if (colId !== partId && (typeof part !== 'string' || config?.[part]?.colId)) {
                        beans.log.warn(273, { providedId: partId, usedId: colId });
                    }
                    gos.validateColDef(colDef, colId, true);
                    col = new AgColumn(colDef, null, colId, true, 'hierarchy');
                    col.derivedFromCol = sourceCol;
                    col.createdBuildToken = build.buildToken;
                    beans.context.createBean(col);
                }
                matches &&= current[cols.length] === col;
                cols.push(col);
            }
        }
        const len = cols.length;
        if (len === 0) {
            if (current.length > 0) {
                this.clearColumns();
            }
            return;
        }
        if (!matches || len !== current.length) {
            this.columns = cols;
            sourceColumnMap.clear();
            for (let i = 0; i < len; ++i) {
                const col = cols[i];
                _pushToMapArray(sourceColumnMap, col.derivedFromCol!, col); // a hierarchy col has its source
            }
        }
        prependWrappedColumnsToTree(build, this.columns);
    }

    public reserveKeptLevels(
        leafDefs: readonly (ColDef | null)[],
        leafClaims: readonly (AgColumn | undefined)[],
        ids: ColumnIdAllocator
    ): KeptHierarchyLevels {
        const { beans, sourceColumnMap } = this;
        const config = this.gos.get('groupHierarchyConfig');
        const bySource = new Map<AgColumn, KeptHierarchyLevel>();
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
            const parts = hierarchyPartsForCol(merged);
            if (parts == null) {
                bySource.set(sourceCol, { mergedDef: merged, partIds: [], kept: [] }); // its column takes the merge
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
                    ids.held.set(level.colId, null);
                }
                kept[j] = level;
            }
            bySource.set(sourceCol, { mergedDef: merged, partIds, kept });
        }
        return bySource;
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

    /** Build the ColDef for one part. Inline parts merge directly; configured parts overlay the config; a
     *  canonical date part takes its header/value getters from {@link DATE_PART_SPECS}. `reuse` (a same-col
     *  refresh) supplies the prior getters, so they aren't re-minted as fresh closures every refresh. */
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
            return _addColumnDefaultAndTypes(beans, colDef, colId, true);
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
        if (ids.isHeld(colId) || ids.declared.has(colId)) {
            continue;
        }
        if (colId === partId) {
            return col;
        }
        if (suffixed === undefined && isSuffixedId(colId, partId) && !partIds.includes(colId)) {
            suffixed = col;
        }
    }
    return suffixed;
};

/** Whether `id` is `base` with a `_1`, `_2`… suffix, as {@link ColumnIdAllocator.allocate} gives a taken `base`. */
const isSuffixedId = (id: string, base: string): boolean => {
    const start = base.length + 1;
    const len = id.length;
    if (len <= start || id.charCodeAt(start - 1) !== 95 || id.charCodeAt(start) === 48 || !id.startsWith(base)) {
        return false; // 95: '_'; 48: '0', which no suffix starts with
    }
    for (let i = start; i < len; ++i) {
        const c = id.charCodeAt(i);
        if (c < 48 || c > 57) {
            return false;
        }
    }
    return true;
};

/** The part's own colId (inline, or its config entry's), else a generated one; null for an invalid part to skip:
 *  an unrecognised string part, or an inline ColDef without colId. */
const makeHierarchyColId = (
    sourceColId: string,
    part: string | ColDef,
    config: GroupHierarchyConfig | undefined
): string | null => {
    if (typeof part !== 'string') {
        return part.colId || null;
    }
    const configured = config?.[part];
    if (configured === undefined && !(part in DATE_PART_SPECS)) {
        return null;
    }
    return configured?.colId || `${GROUP_HIERARCHY_COLUMN_ID_PREFIX}-${sourceColId}-${part}`;
};

/** The hierarchy parts iff the col is eligible for hierarchy generation, else null. */
const hierarchyPartsForCol = (def: ColDef): NonNullable<ColDef['groupHierarchy']> | null => {
    const parts = def.groupHierarchy;
    // unset on nearly every column, so read first; then they count only for a col taking part in row-group / pivot
    if (
        parts == null ||
        (!def.rowGroup &&
            !def.enableRowGroup &&
            def.rowGroupIndex == null &&
            !def.initialRowGroup &&
            def.initialRowGroupIndex == null &&
            !def.pivot &&
            !def.enablePivot &&
            def.pivotIndex == null &&
            !def.initialPivot &&
            def.initialPivotIndex == null)
    ) {
        return null;
    }

    return parts;
};
