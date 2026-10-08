import type { AgEvent, IAgEventEmitter } from 'ag-stack';
import { LocalEventService, _escapeString } from 'ag-stack';

import { _addColumnDefaultAndTypes } from '../columns/colDefUtils';
import { updateSomeColumnState } from '../columns/columnStateUtils';
import type { ColumnState } from '../columns/columnStateUtils';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { ColumnEvent, ColumnEventType, ColumnStateUpdatedEvent } from '../events';
import type { GridOptionsService } from '../gridOptionsService';
import { _addGridCommonParams } from '../gridOptionsUtils';
import type {
    Column,
    ColumnEventName,
    ColumnGroup,
    ColumnGroupShowType,
    ColumnInstanceId,
    ColumnPinnedType,
    HeaderColumnId,
    ProvidedColumnGroup,
} from '../interfaces/iColumn';
import { ColumnHighlightPosition } from '../interfaces/iColumn';
import type { IFrameworkEventListenerService } from '../interfaces/iFrameworkEventListenerService';
import type { IRowNode } from '../interfaces/iRowNode';
import type { SortDef, SortDirection, SortType } from '../interfaces/iSort';
import { _mergedEqual } from '../utils/mergeDeep';
import { _clamp } from '../utils/number';
import type { AgColumnGroup } from './agColumnGroup';
import type { AgProvidedColumnGroup } from './agProvidedColumnGroup';
import type {
    AbstractColDef,
    ColAggFunc,
    ColDef,
    ColDefField,
    ColSpanFunc,
    ColSpanParams,
    ColumnFunctionCallbackParams,
    HeaderLocation,
    RefData,
    RowSpanFunc,
    RowSpanParams,
    ValueFormatterFunc,
    ValueGetterFunc,
} from './colDef';
import type {
    AgShowValuesAsResolved,
    ShowValuesAsDefResolved,
    ShowValuesAsResolved,
    ShowValuesAsResult,
} from './colDef-showValuesAs';

let instanceIdSequence = 0;
export function getNextColInstanceId(): ColumnInstanceId {
    return instanceIdSequence++ as ColumnInstanceId;
}

export const isColumn = (col: Column | ColumnGroup | ProvidedColumnGroup): col is AgColumn => col instanceof AgColumn;

/**
 * Redirects a pivot result column to its underlying value column for non-group, non-pinned (leaf) rows,
 * so value get/set reads the real source value. Pinned rows are excluded — their data is keyed by pivot
 * column ID. Only the deliberate consumers (pivot edit, API reads, pivot aggregation) need this; the hot
 * read path (`getValueFromData`) does not.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const _resolvePivotColumnForRow = (column: AgColumn, rowNode: IRowNode): AgColumn => {
    if (!rowNode.group && !rowNode.rowPinned) {
        const pivotValueColumn = column.pivotValueColumn;
        if (pivotValueColumn) {
            return pivotValueColumn;
        }
    }
    return column;
};

const DEFAULT_SORTING_ORDER: SortDirection[] = ['asc', 'desc', null];
const DEFAULT_ABSOLUTE_SORTING_ORDER: (SortDef | SortDirection)[] = [
    { type: 'absolute', direction: 'asc' },
    { type: 'absolute', direction: 'desc' },
    null,
];

/** Origin of an `AgColumn`. `user` = application-supplied ColDef; others = grid-generated.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type ColKind = 'user' | 'auto-group' | 'selection' | 'row-number' | 'hierarchy';

/** A column's pinned section: `0` left, `1` centre, `2` right. Indexes the lane containers and sorts
 *  the header, so renumbering reorders rendered DOM. Also carried by `AgColumnGroup`. */
export type ColumnLane = 0 | 1 | 2;

// `AgColumn.colFlags` bits: boolean and tiny-enum state never read per value or per row, packed to cut the field count;
// state read there keeps a plain field, a load with no mask. Bits stay below 0x40000000 so the field stays a V8 Smi (an
// int32 in JavaScriptCore). Outside this file they are read and written only through the column's methods.
/** The last column of the left-pinned lane, set by the visible columns. */
const COL_FLAG_LAST_LEFT_PINNED = 0x00000001;
/** The first column of the right-pinned lane, set by the visible columns. */
const COL_FLAG_FIRST_RIGHT_PINNED = 0x00000002;
/** {@link COL_FLAG_LAST_LEFT_PINNED} as its last `lastLeftPinnedChanged` reported it. */
const COL_FLAG_REPORTED_LAST_LEFT_PINNED = 0x00000004;
/** {@link COL_FLAG_FIRST_RIGHT_PINNED} as its last `firstRightPinnedChanged` reported it. */
const COL_FLAG_REPORTED_FIRST_RIGHT_PINNED = 0x00000008;
/** Width set by a deliberate user resize, so continuous auto-sizing must not change it. */
const COL_FLAG_USER_SIZED = 0x00000010;
/** Its filter is active; `filterActiveChanged` follows a change. */
const COL_FLAG_FILTER_ACTIVE = 0x00000020;
/** `colDef` configures a cell tooltip, resolved on a colDef change. */
const COL_FLAG_TOOLTIP_ENABLED = 0x00000040;
/** `colDef.tooltipField` is a dotted path, read as one unless dot notation is suppressed. */
const COL_FLAG_TOOLTIP_FIELD_CONTAINS_DOTS = 0x00000080;
/** Being dragged in the header; `movingChanged` follows a change. */
const COL_FLAG_MOVING = 0x00000100;
/** Being resized by a header drag. */
const COL_FLAG_RESIZING = 0x00000200;
/** Its column menu is open; `menuVisibleChanged` follows a change. */
const COL_FLAG_MENU_VISIBLE = 0x00000400;
/** {@link COL_FLAG_SORT_DEFAULT} and {@link COL_FLAG_SORT_ABSOLUTE} are cached; cleared on a colDef change. */
const COL_FLAG_SORT_TYPES_CACHED = 0x00000800;
/** The column offers the default sort. */
const COL_FLAG_SORT_DEFAULT = 0x00001000;
/** The column offers the absolute sort. */
const COL_FLAG_SORT_ABSOLUTE = 0x00002000;
/** A dragged column would drop before it; its header shows the drop line. */
const COL_FLAG_HIGHLIGHT_BEFORE = 0x00004000;
/** A dragged column would drop after it; its header shows the drop line. */
const COL_FLAG_HIGHLIGHT_AFTER = 0x00008000;
/** Its width was set since the last layout report, changed or not: the `width` state update follows, as for every other key. */
const COL_FLAG_WIDTH_SET = 0x00010000;

// Runtime wrapper around a (logic-free) column definition, holding all runtime state plus logic.
// Child of either the original or the displayed tree; each group class implements only its own tree's interface.
//
// INTERNAL CALLERS: on hot paths read public fields directly (column.colDef, …) rather than the
// getters — the getters exist only for the public Column interface, direct reads avoid call indirection.
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class AgColumn<TValue = any>
    extends BeanStub<ColumnEventName>
    implements Column, IAgEventEmitter<ColumnEventName>
{
    public readonly isColumn = true as const;

    // framework (React) render key; also identifies old-vs-new cols when destroying unused ones
    public readonly instanceId: ColumnInstanceId = getNextColInstanceId();

    /** Sanitised version of the column id */
    public readonly colIdSanitised: string;

    // ── Per-cell hot path ── read by getValue / formatValue / cellCtrl for every cell; clustered first and
    // contiguous for cache locality. The colDef mirrors are (re)set on colDef change ({@link initColDefHotFields}
    // / {@link initDotNotation}); internal code reads these fields DIRECTLY (never the getters / colDef) to avoid
    // a megamorphic load on the user-supplied colDef. The getters exist only for the public interface.
    public aggFunc: ColAggFunc = undefined;
    public isCalculatedCol = false;
    public field: ColDefField<any, TValue> | undefined = undefined;
    /** Cached split of a dotted `field` (`field.split('.')`); `null` when not dotted / dot-notation suppressed.
     *  Non-null doubles as the "field contains dots" indicator. Read per cell via `_getValueUsingDotPath`. */
    public fieldPath: string[] | null = null;
    public valueGetter: string | ValueGetterFunc<any, TValue> | undefined = undefined;
    public allowFormula: boolean = false;
    public showRowGroup: string | boolean | undefined = undefined;
    public pivotValueColumn: AgColumn | null | undefined = undefined;
    public valueFormatter: string | ValueFormatterFunc<any, TValue> | undefined = undefined;
    public refData: RefData | undefined = undefined;
    public enableCellChangeFlash: boolean | undefined = undefined;
    /** Read per cell when the colSpan/rowSpan feature is used (`getColSpan`/`getRowSpan`). */
    public colSpan: ColSpanFunc<any, TValue> | undefined = undefined;
    public rowSpan: RowSpanFunc<any, TValue> | undefined = undefined;
    /** Read per cell on calculated columns (`formulaService.ensureCellFormula`/`fetchRawValue`). */
    public calculatedExpression: string | undefined = undefined;

    // ── Layout / display ── read during rendering and header layout (per column, per refresh).
    /** Current rendered width in px. Writes must go through `setActualWidth` for min/max clamping and flex ownership. */
    public actualWidth: number = 0;
    /** The `actualWidth` its last `widthChanged` reported. */
    private reportedWidth: number = 0;
    public minWidth: number = 0;
    private maxWidth: number = 0;
    public flex: number | null = null;
    public pinned: ColumnPinnedType = null;
    /** `pinned` resolved to a lane; written wherever `pinned` is. */
    public pinnedLane: ColumnLane = 1;
    public left: number | null = null;
    /** The `left` its last `leftChanged` reported. */
    public reportedLeft: number | null = null;
    /** Where the column was before the latest layout moved it; a header drawn by a column move starts here. */
    public oldLeft: number | null = null;
    /** User intent: should this column be shown if display rules allow it. */
    public visible: boolean = false;
    /** Whether this column is in the displayed (rendered) columns — kept in lockstep with `allColsIndex >= 0` */
    public displayed: boolean = false;
    public sortDef: SortDef = getSortDefFromInput();
    public sortIndex: number | null | undefined = undefined;
    /** Sort direction applied to this column's pivot result columns. Isolated from {@link sortDef}.
     *  `undefined` means unset and resolves to ascending; `null` means an explicit "no sort" (natural order). */
    public pivotSort: SortDirection | undefined = undefined;
    // measured header height when autoHeaderHeight is enabled
    public autoHeaderHeight: number | null = null;

    // ── Cold ── structure, transient interaction state, indices, events.
    /** Position in the resolved `sortingOrder` of the last header-click sort. Internal, not saved. */
    public sortCycleIndex: number | undefined = undefined;
    private frameworkEventListenerService: IFrameworkEventListenerService<any, any> | undefined = undefined;
    // Lazy — most columns never get a listener; allocated on first __addEventListener/addEventListener.
    private colEventSvc: LocalEventService<ColumnEventName> | null = null;
    /** The `ColumnModel.colEventsEpoch` of the queue `lastQueuedEventAt` indexes. */
    public queuedEventsEpoch: number = 0;
    public lastQueuedEventAt: number = -1;

    /** Most recent build token that claimed this col — used to detect "already used in this refresh". */
    public buildToken: number = 0;
    /** 0-based index in `VisibleColsService.allCols` (displayed, visual order — RTL reversed), stamped each refresh. `-1` = not displayed. */
    public allColsIndex: number = -1;
    /** Slot in a row's colSpans cache, stamped with `allColsIndex`; `-1` without `colDef.colSpan` or not displayed. */
    public colSpanIndex: number = -1;
    /** `true` while in `ColumnModel.colsList` (live cols, hidden included); `false` when only in
     *  `colsById` — a pivot **primary** parked while a pivot result shows. Set by `refreshCols`. */
    public inColsList: boolean = false;
    /** 1-based `aria-colindex`: position in `colsList` reordered `[left, center, right]` (hidden included). `0` = not in `colsList`. */
    public ariaColIndex: number = 0;
    /** 0-based index in `ColumnModel.colsList` (stamped lazily by `ensureColsListIndex` for O(1) ordered reads);
     *  `-1` until first stamped / when not in colsList. In pivot, parked primaries keep their pre-pivot index. */
    public colsListIndex: number = -1;

    public formulaRef: string | null = null;

    /** The column's "Show Values As" config resolved once on colDef change (built-in modes merged with user config).
     *  Tri-state: the config object when configured, `null` when explicitly disabled (`colDef.showValuesAsDef: null`),
     *  `undefined` when unconfigured. The active mode is a lookup into it. */
    public showValuesAsDef: ShowValuesAsDefResolved | null | undefined = undefined;
    /** Resolved active "Show Values As" mode for this column (precomputed by the enterprise service), or `null`
     *  when none. `showValuesAs.type` is the active mode; the active mode is owned by column state. */
    public showValuesAs: AgShowValuesAsResolved | null = null;

    /** colId this column sits immediately after in display order. Order restoration seats new cols after
     *  this anchor — handles anchors absent from the tree (e.g. auto-group col) and stacks same-anchor adds
     *  newest-first. `undefined` = not anchored. Column-kind agnostic (currently set by the calc-column contributor). */
    public anchoredToColId: string | undefined = undefined;

    /** `COL_FLAG_*` bits; outside this file, read and written through the methods naming them. */
    public colFlags: number = 0;

    public rowGroupActive = false;
    /** Position in `rowGroupColsSvc.columns` when {@link rowGroupActive}; else stale — always pair the read with a `rowGroupActive` check. */
    public rowGroupActiveIndex = -1;
    public pivotActive = false;
    /** Position in `pivotColsSvc.columns` when {@link pivotActive}; else stale — always pair the read with a `pivotActive` check. */
    public pivotActiveIndex = -1;
    public aggregationActive = false;
    /** Position in `valueColsSvc.columns` when {@link aggregationActive}; else stale — always pair the read with an `aggregationActive` check. */
    public aggregationActiveIndex = -1;
    /** The display group col that shows this (source) column; set by `showRowGroupCols` on refresh */
    public showRowGroupCol: AgColumn | null = null;

    public parent: AgColumnGroup | null = null;
    public originalParent: AgProvidedColumnGroup | null = null;

    /** User-edited header name that takes precedence over `colDef.headerName`. Persisted in column state. */
    public headerNameOverride: string | null = null;

    constructor(
        public colDef: ColDef<any, TValue>,
        // kept only for object-identity checks in ColumnFactory (matching an updated col list to an
        // existing column); this.colDef can't serve as it is the merge result
        public userProvidedColDef: ColDef<any, TValue> | null,
        public readonly colId: string,
        public readonly primary: boolean,
        public readonly colKind: ColKind
    ) {
        super();
        this.colIdSanitised = _escapeString(colId)!;
    }

    public override destroy() {
        super.destroy();
        this.allColsIndex = -1;
        this.colSpanIndex = -1;
        this.displayed = false;
        this.colsListIndex = -1;
        this.inColsList = false;
        this.colFlags &= ~(COL_FLAG_LAST_LEFT_PINNED | COL_FLAG_FIRST_RIGHT_PINNED);
        this.beans.rowSpanSvc?.deregister(this);
        // listeners stay until destroy, so a walk its own listener interrupted tells it nothing more
        this.colEventSvc = null;
    }

    public getInstanceId(): ColumnInstanceId {
        return this.instanceId;
    }

    private initState(): void {
        const { beans, colDef } = this;
        const { sortSvc, pinnedCols, colFlex } = beans;

        sortSvc?.initCol(this);

        const hide = colDef.hide;
        this.visible = hide !== undefined ? !hide : !colDef.initialHide;

        this.pivotSort = _resolvePivotSortFromColDef(colDef);

        pinnedCols?.initCol(this);

        colFlex?.initCol(this);
    }

    /** Called when user provides an alternative colDef. Returns whether the merged colDef differed (false = nothing changed). */
    public setColDef(
        colDef: ColDef<any, TValue>,
        userProvidedColDef: ColDef<any, TValue> | null,
        source: ColumnEventType
    ): boolean {
        const oldColDef = this.colDef;
        this.userProvidedColDef = userProvidedColDef;
        this.colDef = colDef;
        if (_mergedEqual(colDef, oldColDef)) {
            this.initCalculatedColumnState(colDef);
            return false;
        }
        ++this.beans.colModel.colDefsVersion; // a real colDef change invalidates anything derived from them
        this.colFlags &= ~COL_FLAG_SORT_TYPES_CACHED; // sort/initialSort/sortingOrder may have changed
        this.sortCycleIndex = undefined;
        this.initColDefHotFields();
        this.beans.showValuesAsSvc?.resolveColumn(this, false); // colDef change — `initialShowValuesAs` is create-only
        this.initMinAndMaxWidths();
        this.initDotNotation();
        this.initTooltip();
        if (colDef.spanRows !== oldColDef.spanRows) {
            this.beans.rowSpanSvc?.columnRowSpanChanged(this);
        }
        this.dispatchColEvent('colDefChanged', source);
        this.beans.pivotResultCols?.recreateColDefsForSource(this, source);
        return true;
    }

    /** Re-apply `def` to a reused column. Stateful attrs are only (re)applied when the user authored the
     *  definitions (`newColDefs`); an internal rebuild (e.g. calc-col add) must leave live state intact. */
    public reapplyColDef(def: ColDef, source: ColumnEventType, newColDefs: boolean): void {
        const merged = _addColumnDefaultAndTypes(this.beans, def, this.colId);
        this.setColDef(merged, def, source);
        if (newColDefs) {
            updateSomeColumnState(
                this.beans,
                this,
                merged.hide,
                merged.sort,
                merged.sortIndex,
                merged.pinned,
                merged.flex,
                source
            );
            // `initialPivotSort` is create-only, so an update honours an explicit `pivotSort` only.
            const pivotSort = merged.pivotSort;
            if (pivotSort !== undefined) {
                this.pivotSort = normalizeSortDirection(pivotSort);
            }
            // Read `flex` after the state update so a flex→fixed switch applies before width.
            const colFlex = this.flex;
            if (colFlex == null || colFlex <= 0) {
                this.setActualWidth(merged.width ?? this.actualWidth, source);
            }
        }
    }

    public getUserProvidedColDef(): ColDef<any, TValue> | null {
        return this.userProvidedColDef;
    }

    public getParent(): AgColumnGroup | null {
        return this.parent;
    }

    public getOriginalParent(): AgProvidedColumnGroup | null {
        return this.originalParent;
    }

    // this is done after constructor as it uses gridOptionsService
    public postConstruct(): void {
        this.initColDefHotFields();
        this.beans.showValuesAsSvc?.resolveColumn(this, true); // column creation — apply `initialShowValuesAs`
        this.initState();
        this.initMinAndMaxWidths();
        this.resetActualWidth('gridInitializing');
        // a column is created at its width, so nothing is told of it
        this.reportedWidth = this.actualWidth;
        this.colFlags &= ~COL_FLAG_WIDTH_SET;
        this.initDotNotation();
        this.initTooltip();
    }

    private initDotNotation(): void {
        const { field, tooltipField } = this.colDef;
        this.field = field;
        const suppress = this.gos.get('suppressFieldDotNotation');
        this.colFlags &= ~COL_FLAG_TOOLTIP_FIELD_CONTAINS_DOTS;
        if (suppress) {
            this.fieldPath = null;
        } else {
            this.fieldPath = typeof field === 'string' && field.includes('.') ? field.split('.') : null;
            if (typeof tooltipField === 'string' && tooltipField.includes('.')) {
                this.colFlags |= COL_FLAG_TOOLTIP_FIELD_CONTAINS_DOTS;
            }
        }
    }

    private initMinAndMaxWidths(): void {
        const colDef = this.colDef;
        this.minWidth = colDef.minWidth ?? this.beans.environment.getDefaultColumnMinWidth();
        this.maxWidth = colDef.maxWidth ?? Number.MAX_SAFE_INTEGER;
    }

    private initTooltip(): void {
        this.beans.tooltipSvc?.initCol(this);
    }

    /** Kept apart from `resetActualWidth`, which `sizeColumnsToFit` also uses and must not change ownership. */
    public resetWidthOwnership(): void {
        this.colFlags &= ~COL_FLAG_USER_SIZED;
    }

    public resetActualWidth(source: ColumnEventType): void {
        const initialWidth = this.calculateColInitialWidth(this.colDef);
        this.setActualWidth(initialWidth, source);
    }

    private calculateColInitialWidth(colDef: ColDef): number {
        const width = colDef.width ?? colDef.initialWidth ?? 200;
        return _clamp(width, this.minWidth, this.maxWidth);
    }

    public isEmptyGroup(): false {
        return false;
    }

    public isRowGroupDisplayed(colId: string): boolean {
        return this.beans.showRowGroupCols?.isRowGroupDisplayed(this, colId) ?? false;
    }

    public isPrimary(): boolean {
        return this.primary;
    }

    public isFilterAllowed(): boolean {
        // filter defined (string, class or true) is allowed; false/null/undefined is not.
        return !!this.colDef.filter;
    }

    public isFieldContainsDots(): boolean {
        return this.fieldPath !== null;
    }

    public isTooltipEnabled(): boolean {
        return (this.colFlags & COL_FLAG_TOOLTIP_ENABLED) !== 0;
    }

    public setTooltipEnabled(enabled: boolean): void {
        this.colFlags = enabled ? this.colFlags | COL_FLAG_TOOLTIP_ENABLED : this.colFlags & ~COL_FLAG_TOOLTIP_ENABLED;
    }

    public isTooltipFieldContainsDots(): boolean {
        return (this.colFlags & COL_FLAG_TOOLTIP_FIELD_CONTAINS_DOTS) !== 0;
    }

    public getHighlighted(): ColumnHighlightPosition | null {
        const flags = this.colFlags;
        if ((flags & COL_FLAG_HIGHLIGHT_BEFORE) !== 0) {
            return ColumnHighlightPosition.Before;
        }
        return (flags & COL_FLAG_HIGHLIGHT_AFTER) !== 0 ? ColumnHighlightPosition.After : null;
    }

    public setHighlighted(highlighted: ColumnHighlightPosition | null): void {
        let flags = this.colFlags & ~(COL_FLAG_HIGHLIGHT_BEFORE | COL_FLAG_HIGHLIGHT_AFTER);
        if (highlighted === ColumnHighlightPosition.Before) {
            flags |= COL_FLAG_HIGHLIGHT_BEFORE;
        } else if (highlighted === ColumnHighlightPosition.After) {
            flags |= COL_FLAG_HIGHLIGHT_AFTER;
        }
        this.colFlags = flags;
    }

    private getColEventSvc(): LocalEventService<ColumnEventName> {
        let svc = this.colEventSvc;
        if (!svc) {
            svc = new LocalEventService();
            this.colEventSvc = svc;
        }
        return svc;
    }

    public __addEventListener<T extends ColumnEventName>(
        eventType: T,
        listener: (params: ColumnEvent<T>) => void
    ): void {
        this.getColEventSvc().addEventListener(eventType, listener);
    }
    public __removeEventListener<T extends ColumnEventName>(
        eventType: T,
        listener: (params: ColumnEvent<T>) => void
    ): void {
        this.colEventSvc?.removeEventListener(eventType, listener);
    }

    /**
     * PUBLIC USE ONLY: for internal use within AG Grid use the `__addEventListener` and `__removeEventListener` methods.
     */
    public override addEventListener<T extends ColumnEventName>(
        eventType: T,
        userListener: (params: ColumnEvent<T>) => void
    ): void {
        const colEventSvc = this.getColEventSvc();
        this.frameworkEventListenerService = this.beans.frameworkOverrides.createLocalEventListenerWrapper?.(
            this.frameworkEventListenerService,
            colEventSvc
        );
        const listener = this.frameworkEventListenerService?.wrap(eventType, userListener) ?? userListener;

        colEventSvc.addEventListener(eventType, listener);
    }

    /**
     * PUBLIC USE ONLY: for internal use within AG Grid use the `__addEventListener` and `__removeEventListener` methods.
     */
    public override removeEventListener<T extends ColumnEventName>(
        eventType: T,
        userListener: (params: ColumnEvent<T>) => void
    ): void {
        const listener = this.frameworkEventListenerService?.unwrap(eventType, userListener) ?? userListener;
        this.colEventSvc?.removeEventListener(eventType, listener);
    }

    public createColumnFunctionCallbackParams(rowNode: IRowNode): ColumnFunctionCallbackParams {
        return _addGridCommonParams(this.gos, { node: rowNode, data: rowNode.data, column: this, colDef: this.colDef });
    }

    public isSuppressNavigable(rowNode: IRowNode): boolean {
        return this.beans.cellNavigation?.isSuppressNavigable(this, rowNode) ?? false;
    }

    public isCellEditable(rowNode: IRowNode): boolean {
        return this.beans.editSvc?.isCellEditable({ rowNode, column: this }) ?? false;
    }

    public isSuppressFillHandle(): boolean {
        return !!this.colDef.suppressFillHandle;
    }

    public isAutoHeight(): boolean {
        return !!this.colDef.autoHeight;
    }

    public isAutoHeaderHeight(): boolean {
        return !!this.colDef.autoHeaderHeight;
    }

    public isRowDrag(rowNode: IRowNode): boolean {
        return this.isColumnFunc(rowNode, this.colDef.rowDrag);
    }

    public isDndSource(rowNode: IRowNode): boolean {
        return this.isColumnFunc(rowNode, this.colDef.dndSource);
    }

    public isCellCheckboxSelection(rowNode: IRowNode): boolean {
        return this.beans.selectionSvc?.isCellCheckboxSelection(this, rowNode) ?? false;
    }

    public isSuppressPaste(rowNode: IRowNode): boolean {
        return this.isCalculatedCol || this.isColumnFunc(rowNode, this.colDef.suppressPaste ?? null);
    }

    /** Mirror the hot-path colDef fields onto the column so per-cell reads avoid a megamorphic colDef load.
     *  `field`/`fieldPath` are set by {@link initDotNotation} (they depend on `suppressFieldDotNotation`). */
    private initColDefHotFields(): void {
        const colDef = this.colDef;
        this.valueGetter = colDef.valueGetter;
        this.allowFormula = colDef.allowFormula === true;
        this.showRowGroup = colDef.showRowGroup;
        this.pivotValueColumn = colDef.pivotValueColumn as AgColumn | null | undefined;
        this.valueFormatter = colDef.valueFormatter;
        this.refData = colDef.refData;
        this.enableCellChangeFlash = colDef.enableCellChangeFlash;
        this.colSpan = colDef.colSpan;
        this.rowSpan = colDef.rowSpan;
        this.initCalculatedColumnState(colDef);
    }

    private initCalculatedColumnState(colDef: ColDef<any, TValue>): void {
        this.calculatedExpression = colDef.calculatedExpression;
        this.isCalculatedCol =
            this.calculatedExpression !== undefined && this.beans.calculatedColsSvc?.isEnabled() === true;
    }

    public isResizable(): boolean {
        return this.colDef.resizable ?? true;
    }

    public isColumnFunc(
        rowNode: IRowNode,
        value?: boolean | ((params: ColumnFunctionCallbackParams) => boolean) | null
    ): boolean {
        return typeof value === 'boolean'
            ? value
            : typeof value === 'function' && value(this.createColumnFunctionCallbackParams(rowNode));
    }

    public isMoving(): boolean {
        return (this.colFlags & COL_FLAG_MOVING) !== 0;
    }

    public setMoving(moving: boolean): void {
        this.colFlags = moving ? this.colFlags | COL_FLAG_MOVING : this.colFlags & ~COL_FLAG_MOVING;
    }

    public isResizing(): boolean {
        return (this.colFlags & COL_FLAG_RESIZING) !== 0;
    }

    public setResizing(resizing: boolean): void {
        this.colFlags = resizing ? this.colFlags | COL_FLAG_RESIZING : this.colFlags & ~COL_FLAG_RESIZING;
    }

    public getSort(): SortDirection {
        // soft-deprecated v35 - use getSortDef instead
        return this.sortDef.direction;
    }

    /** Returns null if no sort direction applied */
    public getSortDef(): SortDef | null {
        const sortDef = this.sortDef;
        return sortDef.direction ? sortDef : null;
    }

    public setSortDef(sortDef: SortDef): void {
        this.sortDef = sortDef;
    }

    public isSortable(): boolean {
        return this.colDef.sortable ?? true;
    }

    /** @deprecated v32 use col.getSort() === 'asc */
    public isSortAscending(): boolean {
        return this.getSort() === 'asc';
    }

    /** @deprecated v32 use col.getSort() === 'desc */
    public isSortDescending(): boolean {
        return this.getSort() === 'desc';
    }
    /** @deprecated v32 use col.getSort() === undefined */
    public isSortNone(): boolean {
        return !this.getSort();
    }

    /** @deprecated v32 use col.getSort() !== undefined */
    public isSorting(): boolean {
        return this.getSort() != null;
    }

    public getSortIndex(): number | null | undefined {
        return this.sortIndex;
    }

    public isMenuVisible(): boolean {
        return (this.colFlags & COL_FLAG_MENU_VISIBLE) !== 0;
    }

    public setMenuVisible(visible: boolean): void {
        this.colFlags = visible ? this.colFlags | COL_FLAG_MENU_VISIBLE : this.colFlags & ~COL_FLAG_MENU_VISIBLE;
    }

    public getAggFunc(): ColAggFunc {
        return this.aggFunc;
    }

    public getShowValuesAs<TOut extends ShowValuesAsResult = any>(): ShowValuesAsResolved<any, TValue, TOut> | null {
        return this.showValuesAs as ShowValuesAsResolved<any, TValue, TOut> | null;
    }

    public getShowValuesAsDef(): ShowValuesAsDefResolved<any, TValue> | null {
        return this.showValuesAsDef ?? null;
    }

    public getLeft(): number | null {
        return this.left;
    }

    public getRight(): number {
        // `left` is non-null on any displayed col, the only ones `getRight` makes sense for
        return this.left! + this.actualWidth;
    }

    public isFilterActive(): boolean {
        return (this.colFlags & COL_FLAG_FILTER_ACTIVE) !== 0;
    }

    public setFilterActive(active: boolean): void {
        this.colFlags = active ? this.colFlags | COL_FLAG_FILTER_ACTIVE : this.colFlags & ~COL_FLAG_FILTER_ACTIVE;
    }

    /** @deprecated v33 Use `api.isColumnHovered(column)` instead. */
    public isHovered(): boolean {
        this.warn(261);
        return !!this.beans.colHover?.isHovered(this);
    }

    public isFirstRightPinned(): boolean {
        return (this.colFlags & COL_FLAG_FIRST_RIGHT_PINNED) !== 0;
    }

    public isLastLeftPinned(): boolean {
        return (this.colFlags & COL_FLAG_LAST_LEFT_PINNED) !== 0;
    }

    // set by the visible columns; `lastLeftPinnedChanged` and `firstRightPinnedChanged` follow from `dispatchLayoutEvents`
    public setLastLeftPinned(on: boolean): void {
        this.colFlags = on ? this.colFlags | COL_FLAG_LAST_LEFT_PINNED : this.colFlags & ~COL_FLAG_LAST_LEFT_PINNED;
    }

    public setFirstRightPinned(on: boolean): void {
        this.colFlags = on ? this.colFlags | COL_FLAG_FIRST_RIGHT_PINNED : this.colFlags & ~COL_FLAG_FIRST_RIGHT_PINNED;
    }

    public isPinned(): boolean {
        return this.pinned === 'left' || this.pinned === 'right';
    }

    public isPinnedLeft(): boolean {
        return this.pinned === 'left';
    }

    public isPinnedRight(): boolean {
        return this.pinned === 'right';
    }

    public getPinned(): ColumnPinnedType {
        return this.pinned;
    }

    public setVisible(visible: boolean, source: ColumnEventType): void {
        const newValue = visible === true;
        if (this.visible !== newValue) {
            this.visible = newValue;
            let group = this.originalParent;
            while (group) {
                if (!group.setExpandable()) {
                    break;
                }
                group = group.originalParent;
            }
            this.dispatchColEvent('visibleChanged', source);
        }
        this.dispatchStateUpdatedEvent('hide', source);
    }

    public isVisible(): boolean {
        return this.visible;
    }

    public isSpanHeaderHeight(): boolean {
        return !this.colDef.suppressSpanHeaderHeight;
    }

    /** Returns the first parent that is not a padding group. */
    public getFirstRealParent(): AgProvidedColumnGroup | null {
        let parent = this.originalParent;
        while (parent?.padding) {
            parent = parent.originalParent;
        }
        return parent;
    }

    public getColumnGroupPaddingInfo(): { numberOfParents: number; isSpanningTotal: boolean } {
        let parent = this.parent;

        if (!parent?.providedColumnGroup.padding) {
            return { numberOfParents: 0, isSpanningTotal: false };
        }

        const numberOfParents = parent.getPaddingLevel() + 1;
        let isSpanningTotal = true;

        while (parent) {
            if (!parent.providedColumnGroup.padding) {
                isSpanningTotal = false;
                break;
            }
            parent = parent.parent;
        }

        return { numberOfParents, isSpanningTotal };
    }

    public getColDef(): ColDef<any, TValue> {
        return this.colDef;
    }
    public getDefinition(): AbstractColDef<any, TValue> {
        return this.colDef;
    }

    public getColumnGroupShow(): ColumnGroupShowType | undefined {
        return this.colDef.columnGroupShow;
    }

    public getColId(): string {
        return this.colId;
    }

    public getDisplayName(location: HeaderLocation = 'columnDrop'): string {
        return this.beans.colNames.getDisplayNameForColumn(this, location) || this.colDef.headerName || this.colId;
    }

    public getId(): string {
        return this.colId;
    }

    public getUniqueId(): HeaderColumnId {
        return this.colId as HeaderColumnId;
    }

    public getActualWidth(): number {
        return this.actualWidth;
    }

    public isUserSized(): boolean {
        return (this.colFlags & COL_FLAG_USER_SIZED) !== 0;
    }

    public setUserSized(userSized: boolean): void {
        this.colFlags = userSized ? this.colFlags | COL_FLAG_USER_SIZED : this.colFlags & ~COL_FLAG_USER_SIZED;
    }

    public getAutoHeaderHeight(): number | null {
        return this.autoHeaderHeight;
    }

    /** Returns true if the header height has changed */
    public setAutoHeaderHeight(height: number | null): boolean {
        if (this.autoHeaderHeight !== height) {
            this.autoHeaderHeight = height;
            return true;
        }
        return false;
    }

    public getColSpan(rowNode: IRowNode): number {
        const colSpanFn = this.colSpan;
        if (colSpanFn == null) {
            return 1;
        }
        const params: ColSpanParams = this.createColumnFunctionCallbackParams(rowNode);
        return toCellSpan(colSpanFn(params));
    }

    public getRowSpan(rowNode: IRowNode): number {
        const rowSpan = this.rowSpan;
        if (rowSpan == null) {
            return 1;
        }
        const params: RowSpanParams = this.createColumnFunctionCallbackParams(rowNode);
        return toCellSpan(rowSpan(params));
    }

    /** `widthChanged` and the `width` state update follow once the layout is final, from `dispatchLayoutEvents`. */
    public setActualWidth(actualWidth: number, source: ColumnEventType): void {
        actualWidth = Math.max(actualWidth, this.minWidth);
        actualWidth = Math.min(actualWidth, this.maxWidth);
        // every user-driven resize arrives with this source and takes ownership. Not widened to all
        // sources: flex, `sizeColumnsToFit` and the auto-size API must leave ownership alone.
        this.colFlags |= source === 'uiColumnResized' ? COL_FLAG_WIDTH_SET | COL_FLAG_USER_SIZED : COL_FLAG_WIDTH_SET;
        if (this.actualWidth !== actualWidth) {
            // disable flex for this column if it was manually resized.
            this.actualWidth = actualWidth;
            if (this.flex != null && source !== 'flex' && source !== 'gridInitializing') {
                this.flex = null;
            }
        }
    }

    /** Reports how its width, left and pinned edges changed since it last did, once the visible columns' layout is
     *  final. Each baseline is updated before its event, so a listener's own update reports only what is new. */
    public dispatchLayoutEvents(source: ColumnEventType): void {
        const actualWidth = this.actualWidth;
        const widthSet = (this.colFlags & COL_FLAG_WIDTH_SET) !== 0;
        if (widthSet) {
            this.colFlags &= ~COL_FLAG_WIDTH_SET;
        }
        if (actualWidth !== this.reportedWidth) {
            this.reportedWidth = actualWidth;
            // a column still flexed was sized by its flex pass, as any other resize ends its flex
            const widthSource = this.flex != null ? 'flex' : source;
            this.dispatchColEvent('widthChanged', widthSource);
            this.dispatchStateUpdatedEvent('width', widthSource);
        } else if (widthSet) {
            this.dispatchStateUpdatedEvent('width', this.flex != null ? 'flex' : source);
        }
        // read after `widthChanged`, whose listener's own update may have moved the column and reported it
        const left = this.left;
        if (left !== this.reportedLeft) {
            this.reportedLeft = left;
            this.dispatchColEvent('leftChanged', source);
        }
        let flags = this.colFlags;
        if (edgeChanged(flags, COL_FLAG_LAST_LEFT_PINNED, COL_FLAG_REPORTED_LAST_LEFT_PINNED)) {
            this.colFlags = flags ^ COL_FLAG_REPORTED_LAST_LEFT_PINNED;
            this.dispatchColEvent('lastLeftPinnedChanged', source);
            flags = this.colFlags;
        }
        if (edgeChanged(flags, COL_FLAG_FIRST_RIGHT_PINNED, COL_FLAG_REPORTED_FIRST_RIGHT_PINNED)) {
            this.colFlags = flags ^ COL_FLAG_REPORTED_FIRST_RIGHT_PINNED;
            this.dispatchColEvent('firstRightPinnedChanged', source);
        }
    }

    public isGreaterThanMax(width: number): boolean {
        return width > this.maxWidth;
    }

    public getMinWidth(): number {
        return this.minWidth;
    }

    public getMaxWidth(): number {
        return this.maxWidth;
    }

    public getFlex(): number | null {
        return this.flex;
    }

    public isRowGroupActive(): boolean {
        return this.rowGroupActive;
    }

    public isPivotActive(): boolean {
        return this.pivotActive;
    }

    public isAnyFunctionActive(): boolean {
        return this.pivotActive || this.rowGroupActive || this.aggregationActive;
    }

    public isAnyFunctionAllowed(): boolean {
        const colDef = this.colDef;
        return colDef.enablePivot === true || colDef.enableRowGroup === true || colDef.enableValue === true;
    }

    public isValueActive(): boolean {
        return this.aggregationActive;
    }

    public isAllowPivot(): boolean {
        return this.colDef.enablePivot === true;
    }

    public isAllowValue(): boolean {
        return this.colDef.enableValue === true;
    }

    public isAllowRowGroup(): boolean {
        return this.colDef.enableRowGroup === true;
    }

    public isAllowFormula(): boolean {
        return this.allowFormula;
    }

    /** Override the displayed header name. Pass `null` to revert to the `colDef` value. */
    public setHeaderNameOverride(headerName: string | null, source: ColumnEventType = 'api'): void {
        if (this.headerNameOverride === headerName) {
            return;
        }
        this.headerNameOverride = headerName;
        // Column-scoped event for the column's own header cell and tool panel entry, so they refresh
        // without filtering by colId; the grid-level event drives the state service.
        this.dispatchColEvent('headerNameChanged', source);
        this.beans.eventSvc.dispatchEvent({
            type: 'columnHeaderNameChanged',
            column: this,
            columns: null,
            columnGroup: null,
            source,
        });
    }

    public dispatchColEvent(type: ColumnEventName, source: ColumnEventType, additionalEventAttributes?: any): void {
        const colEventSvc = this.colEventSvc;
        if (colEventSvc?.hasListeners(type)) {
            this.raise(
                colEventSvc,
                _addGridCommonParams<ColumnEvent>(this.gos, {
                    type,
                    column: this,
                    columns: [this],
                    source,
                    ...additionalEventAttributes,
                })
            );
        }
    }

    /** `key` names the `ColumnState` property that changed. */
    public dispatchStateUpdatedEvent(key: keyof ColumnState, source: ColumnEventType): void {
        const colEventSvc = this.colEventSvc;
        if (colEventSvc?.hasListeners('columnStateUpdated')) {
            this.raise(
                colEventSvc,
                _addGridCommonParams<ColumnStateUpdatedEvent>(this.gos, {
                    type: 'columnStateUpdated',
                    column: this,
                    columns: [this],
                    source,
                    key,
                })
            );
        }
    }

    private raise(colEventSvc: LocalEventService<ColumnEventName>, event: AgEvent<ColumnEventName>): void {
        const colModel = this.beans.colModel;
        if (colModel.colEventsDepth > 0) {
            colModel.queueColEvent(this, event);
        } else {
            colEventSvc.dispatchEvent(event);
        }
    }

    /** A column destroyed since the event was queued has dropped its listeners. */
    public raiseQueuedEvent(event: AgEvent<ColumnEventName>): void {
        this.colEventSvc?.dispatchEvent(event);
    }
}

const edgeChanged = (flags: number, edge: number, reported: number): boolean =>
    ((flags & edge) === 0) !== ((flags & reported) === 0);

/** Whole cells, at least one; NaN counts as one. */
const toCellSpan = (span: number): number => (span >= 2 ? Math.floor(span) : 1);

/** Convert input into a SortDef: a valid SortDef passes through, otherwise direction and type are normalised. */
export const getSortDefFromInput = (input?: unknown): SortDef => {
    if (_isSortDefValid(input)) {
        return { direction: input.direction, type: input.type };
    }
    return { direction: normalizeSortDirection(input), type: _normalizeSortType(input) };
};

// Free functions (not class methods) so they tree-shake out of the core bundle when the sort module is unused.

const sortTypeFlag = (type: SortType): number => (type === 'absolute' ? COL_FLAG_SORT_ABSOLUTE : COL_FLAG_SORT_DEFAULT);

/** `COL_FLAG_SORT_*` of `colDef.sort`/`colDef.initialSort`; `null` contributes nothing, bare directions normalise to 'default'. */
const getColDefSortTypes = (column: AgColumn): number => {
    const { sort, initialSort } = column.colDef;
    let res = 0;
    if (sort !== null) {
        res |= sortTypeFlag(_normalizeSortType((sort as SortDef)?.type));
    }
    if (initialSort !== null) {
        res |= sortTypeFlag(_normalizeSortType((initialSort as SortDef)?.type));
    }
    return res;
};

const getSortingOrderInputs = (
    gos: GridOptionsService,
    column: AgColumn,
    colDefSortTypes: number
): (SortDirection | SortDef)[] =>
    column.colDef.sortingOrder ??
    gos.get('sortingOrder') ??
    ((colDefSortTypes & COL_FLAG_SORT_ABSOLUTE) !== 0 ? DEFAULT_ABSOLUTE_SORTING_ORDER : DEFAULT_SORTING_ORDER);

export const getSortingOrder = (gos: GridOptionsService, column: AgColumn): SortDef[] => {
    const inputs = getSortingOrderInputs(gos, column, getColDefSortTypes(column));
    const res = new Array<SortDef>(inputs.length);
    for (let i = 0, len = inputs.length; i < len; ++i) {
        res[i] = getSortDefFromInput(inputs[i]);
    }
    return res;
};

/** The `COL_FLAG_SORT_DEFAULT` and `COL_FLAG_SORT_ABSOLUTE` bits of the sort types the column offers. */
const getAvailableSortTypes = (gos: GridOptionsService, column: AgColumn): number => {
    const cacheable = gos.get('sortingOrder') == null; // deprecated `sortingOrder` disables the cache
    const flags = column.colFlags;
    if (cacheable && (flags & COL_FLAG_SORT_TYPES_CACHED) !== 0) {
        return flags & (COL_FLAG_SORT_DEFAULT | COL_FLAG_SORT_ABSOLUTE);
    }
    let types = getColDefSortTypes(column);
    // add each directional order entry's type — mirrors `getSortDefFromInput` without allocating a SortDef per entry
    const order = getSortingOrderInputs(gos, column, types);
    for (let i = 0, len = order.length; i < len; ++i) {
        const input = order[i];
        if (!_isSortDefValid(input)) {
            if (normalizeSortDirection(input)) {
                types |= sortTypeFlag(_normalizeSortType(input));
            }
            continue;
        }
        if (input.direction) {
            types |= sortTypeFlag(input.type);
        }
    }
    if (cacheable) {
        column.colFlags =
            (flags & ~(COL_FLAG_SORT_DEFAULT | COL_FLAG_SORT_ABSOLUTE)) | types | COL_FLAG_SORT_TYPES_CACHED;
    }
    return types;
};

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const _isSortTypeAvailable = (gos: GridOptionsService, column: AgColumn, type: SortType): boolean =>
    (getAvailableSortTypes(gos, column) & sortTypeFlag(type)) !== 0;

export const isSortDirectionValid = (maybeSortDir: unknown): maybeSortDir is SortDirection =>
    maybeSortDir === 'asc' || maybeSortDir === 'desc' || maybeSortDir === null;

export const isSortTypeValid = (maybeSortType: unknown): maybeSortType is SortType =>
    maybeSortType === 'default' || maybeSortType === 'absolute';

export const _isSortDefValid = (maybeSortDef: unknown): maybeSortDef is SortDef => {
    if (!maybeSortDef || typeof maybeSortDef !== 'object') {
        return false;
    }
    const maybeSortDefT = maybeSortDef as { type?: unknown; direction?: unknown };
    return isSortTypeValid(maybeSortDefT.type) && isSortDirectionValid(maybeSortDefT.direction);
};

/** Resolves a colDef's pivot sort. Unset (`undefined`) is left as-is so it resolves to ascending;
 *  an explicit `null` ("no sort") is preserved. */
export const _resolvePivotSortFromColDef = (colDef: ColDef): SortDirection | undefined => {
    const pivotSortLike = colDef.pivotSort !== undefined ? colDef.pivotSort : colDef.initialPivotSort;
    return pivotSortLike === undefined ? undefined : normalizeSortDirection(pivotSortLike);
};

/** Direction an unset (`undefined`) `pivotSort` resolves to. The grid's own pivot columns are generated
 *  ascending, so ascending is what the chip and the ordering must report. Application-supplied pivot result
 *  columns instead arrive in an order the application chose, which the grid must leave alone until the user
 *  sorts - so there the default is "no sort".
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const _defaultPivotSort = (beans: BeanCollection): SortDirection =>
    beans.pivotResultCols?.suppliedColDefs != null ? null : 'asc';

/** A column's pivot sort with the unset default resolved via {@link _defaultPivotSort}.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const _resolvePivotSort = (beans: BeanCollection, pivotSort: SortDirection | undefined): SortDirection =>
    pivotSort === undefined ? _defaultPivotSort(beans) : pivotSort;

export const normalizeSortDirection = (sortDirectionLike?: unknown): SortDirection =>
    isSortDirectionValid(sortDirectionLike) ? sortDirectionLike : null;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const _normalizeSortType = (sortTypeLike?: unknown): SortType =>
    isSortTypeValid(sortTypeLike) ? sortTypeLike : 'default';

type SortDefOverride = () => SortDef | null | undefined;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const _getDisplaySortForColumn = (column: AgColumn, beans: BeanCollection, override?: SortDefOverride) => {
    const overrideSortDef = override?.();
    // An override returning `null` means "no sort, show nothing"; only an absent override (`undefined`)
    // falls back to the column's own sort.
    const sortDef = overrideSortDef !== undefined ? overrideSortDef : beans.sortSvc?.getDisplaySort(column);
    const type = _normalizeSortType(sortDef?.type);
    const direction = normalizeSortDirection(sortDef?.direction);
    return {
        isAbsoluteSort: type === 'absolute',
        isDefaultSort: type === 'default',
        isAscending: direction === 'asc',
        isDescending: direction === 'desc',
        direction,
    };
};

/** The one derivation of a lane from a pinned value. Called only where `pinned` is written. */
export const _laneOfPinned = (pinned: ColumnPinnedType): ColumnLane => {
    if (pinned === 'right') {
        return 2;
    }
    return pinned === 'left' || pinned === true ? 0 : 1;
};
