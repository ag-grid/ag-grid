import type { AgEvent, IAgEventEmitter } from 'ag-stack';
import { LocalEventService, _escapeString } from 'ag-stack';

import { _addColumnDefaultAndTypes } from '../columns/colDefUtils';
import { updateSomeColumnState } from '../columns/columnStateUtils';
import type { ColumnState } from '../columns/columnStateUtils';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { ColumnEvent, ColumnEventType } from '../events';
import type { GridOptionsService } from '../gridOptionsService';
import { _addGridCommonParams } from '../gridOptionsUtils';
import type {
    Column,
    ColumnEventName,
    ColumnGroup,
    ColumnGroupShowType,
    ColumnHighlightPosition,
    ColumnInstanceId,
    ColumnPinnedType,
    HeaderColumnId,
    ProvidedColumnGroup,
} from '../interfaces/iColumn';
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
    /** Current rendered width in px. Writes must go through `setActualWidth` for min/max clamping and the `widthChanged` event. */
    public actualWidth: number = 0;
    public minWidth: number = 0;
    private maxWidth: number = 0;
    public flex: number | null = null;
    public pinned: ColumnPinnedType = null;
    public left: number | null = null;
    public oldLeft: number | null = null;
    /** User intent: should this column be shown if display rules allow it. */
    public visible: boolean = false;
    /** Whether this column is in the displayed (rendered) columns — kept in lockstep with `allColsIndex >= 0` */
    public displayed: boolean = false;
    public filterActive = false;
    public sortDef: SortDef = getSortDefFromInput();
    public sortIndex: number | null | undefined = undefined;
    /** Sort direction applied to this column's pivot result columns. Isolated from {@link sortDef}.
     *  `undefined` means unset and resolves to ascending; `null` means an explicit "no sort" (natural order). */
    public pivotSort: SortDirection | undefined = undefined;
    // measured header height when autoHeaderHeight is enabled
    public autoHeaderHeight: number | null = null;
    public tooltipEnabled = false;
    public tooltipFieldContainsDots: boolean = false;

    // ── Cold ── structure, transient interaction state, indices, events.
    private frameworkEventListenerService: IFrameworkEventListenerService<any, any> | undefined = undefined;
    // Lazy — most columns never get a listener; allocated on first __addEventListener/addEventListener.
    private colEventSvc: LocalEventService<ColumnEventName> | null = null;

    /** Most recent build token that claimed this col — used to detect "already used in this refresh". */
    public buildToken: number = 0;
    /** 0-based index in `VisibleColsService.allCols` (displayed, visual order — RTL reversed), stamped each refresh. `-1` = not displayed. */
    public allColsIndex: number = -1;
    /** `true` while in `ColumnModel.colsList` (live cols, hidden included); `false` when only in
     *  `colsById` — a pivot **primary** parked while a pivot result shows. Set by `refreshCols`. */
    public inColsList: boolean = false;
    /** 1-based `aria-colindex`: position in `colsList` reordered `[left, center, right]` (hidden included). `0` = not in `colsList`. */
    public ariaColIndex: number = 0;
    /** 0-based index in `ColumnModel.colsList` (stamped lazily by `ensureColsListIndex` for O(1) ordered reads);
     *  `-1` until first stamped / when not in colsList. In pivot, parked primaries keep their pre-pivot index. */
    public colsListIndex: number = -1;

    public moving = false;
    public resizing = false;
    public menuVisible = false;
    public highlighted: ColumnHighlightPosition | null = null;
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

    private lastLeftPinned: boolean = false;
    private firstRightPinned: boolean = false;

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

    /** Public so the free `getAvailableSortTypes` sort helper can cache on the column; nulled in {@link setColDef}. */
    public cachedSortTypes: Set<SortType> | null = null;

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
        this.displayed = false;
        this.colsListIndex = -1;
        this.inColsList = false;
        this.lastLeftPinned = false;
        this.firstRightPinned = false;
        this.beans.rowSpanSvc?.deregister(this);
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
        this.cachedSortTypes = null; // sort/initialSort/sortingOrder may have changed
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
        this.initDotNotation();
        this.initTooltip();
    }

    private initDotNotation(): void {
        const { field, tooltipField } = this.colDef;
        this.field = field;
        const suppress = this.gos.get('suppressFieldDotNotation');
        if (suppress) {
            this.fieldPath = null;
            this.tooltipFieldContainsDots = false;
        } else {
            this.fieldPath = typeof field === 'string' && field.includes('.') ? field.split('.') : null;
            this.tooltipFieldContainsDots = typeof tooltipField === 'string' && tooltipField.includes('.');
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

    public resetActualWidth(source: ColumnEventType): void {
        const initialWidth = this.calculateColInitialWidth(this.colDef);
        this.setActualWidth(initialWidth, source, true);
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
        return this.tooltipEnabled;
    }

    public isTooltipFieldContainsDots(): boolean {
        return this.tooltipFieldContainsDots;
    }

    public getHighlighted(): ColumnHighlightPosition | null {
        return this.highlighted;
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
        return this.moving;
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
        return this.menuVisible;
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

    public getOldLeft(): number | null {
        return this.oldLeft;
    }

    public getRight(): number {
        // `left` is non-null on any displayed col, the only ones `getRight` makes sense for
        return this.left! + this.actualWidth;
    }

    public setLeft(left: number | null, source: ColumnEventType) {
        const oldLeft = this.left;
        this.oldLeft = oldLeft;
        if (oldLeft !== left) {
            this.left = left;
            this.dispatchColEvent('leftChanged', source);
        }
    }

    public isFilterActive(): boolean {
        return this.filterActive;
    }

    /** @deprecated v33 Use `api.isColumnHovered(column)` instead. */
    public isHovered(): boolean {
        this.warn(261);
        return !!this.beans.colHover?.isHovered(this);
    }

    public setFirstRightPinned(firstRightPinned: boolean, source: ColumnEventType): void {
        if (this.firstRightPinned !== firstRightPinned) {
            this.firstRightPinned = firstRightPinned;
            this.dispatchColEvent('firstRightPinnedChanged', source);
        }
    }

    public setLastLeftPinned(lastLeftPinned: boolean, source: ColumnEventType): void {
        if (this.lastLeftPinned !== lastLeftPinned) {
            this.lastLeftPinned = lastLeftPinned;
            this.dispatchColEvent('lastLeftPinnedChanged', source);
        }
    }

    public isFirstRightPinned(): boolean {
        return this.firstRightPinned;
    }

    public isLastLeftPinned(): boolean {
        return this.lastLeftPinned;
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
        this.dispatchStateUpdatedEvent('hide');
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
        const colSpan = colSpanFn(params);
        return colSpan < 1 ? 1 : colSpan; // colSpan must be number equal to or greater than 1
    }

    public getRowSpan(rowNode: IRowNode): number {
        const rowSpan = this.rowSpan;
        if (rowSpan == null) {
            return 1;
        }
        const params: RowSpanParams = this.createColumnFunctionCallbackParams(rowNode);
        const rowSpanValue = rowSpan(params);
        return rowSpanValue < 1 ? 1 : rowSpanValue; // rowSpan must be number equal to or greater than 1
    }

    public setActualWidth(actualWidth: number, source: ColumnEventType, silent: boolean = false): void {
        actualWidth = Math.max(actualWidth, this.minWidth);
        actualWidth = Math.min(actualWidth, this.maxWidth);
        if (this.actualWidth !== actualWidth) {
            // disable flex for this column if it was manually resized.
            this.actualWidth = actualWidth;
            if (this.flex != null && source !== 'flex' && source !== 'gridInitializing') {
                this.flex = null;
            }

            if (!silent) {
                this.fireColumnWidthChangedEvent(source);
            }
        }
        this.dispatchStateUpdatedEvent('width');
    }

    public fireColumnWidthChangedEvent(source: ColumnEventType): void {
        this.dispatchColEvent('widthChanged', source);
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

    public dispatchColEvent(type: ColumnEventName, source: ColumnEventType, additionalEventAttributes?: any): void {
        this.colEventSvc?.dispatchEvent(
            _addGridCommonParams<ColumnEvent>(this.gos, {
                type,
                column: this,
                columns: [this],
                source,
                ...additionalEventAttributes,
            })
        );
    }

    public dispatchStateUpdatedEvent(key: keyof ColumnState): void {
        this.colEventSvc?.dispatchEvent({ type: 'columnStateUpdated', key } as AgEvent<'columnStateUpdated'>);
    }
}

/** Convert input into a SortDef: a valid SortDef passes through, otherwise direction and type are normalised. */
export const getSortDefFromInput = (input?: unknown): SortDef => {
    if (_isSortDefValid(input)) {
        return { direction: input.direction, type: input.type };
    }
    return { direction: normalizeSortDirection(input), type: _normalizeSortType(input) };
};

// Free functions (not class methods) so they tree-shake out of the core bundle when the sort module is unused.

/** Sort types from `colDef.sort`/`colDef.initialSort`; `null` contributes nothing, bare directions normalise to 'default'. */
const getColDefAllowedSortTypes = (column: AgColumn): SortType[] => {
    const res: SortType[] = [];
    const { sort, initialSort } = column.colDef;
    if (sort !== null) {
        res.push(_normalizeSortType((sort as SortDef)?.type));
    }
    if (initialSort !== null) {
        res.push(_normalizeSortType((initialSort as SortDef)?.type));
    }
    return res;
};

const getSortingOrderInputs = (
    gos: GridOptionsService,
    column: AgColumn,
    colDefAllowedSortTypes: SortType[]
): (SortDirection | SortDef)[] =>
    column.colDef.sortingOrder ??
    gos.get('sortingOrder') ??
    (colDefAllowedSortTypes.includes('absolute') ? DEFAULT_ABSOLUTE_SORTING_ORDER : DEFAULT_SORTING_ORDER);

export const getSortingOrder = (gos: GridOptionsService, column: AgColumn): SortDef[] => {
    const inputs = getSortingOrderInputs(gos, column, getColDefAllowedSortTypes(column));
    const res = new Array<SortDef>(inputs.length);
    for (let i = 0, len = inputs.length; i < len; ++i) {
        res[i] = getSortDefFromInput(inputs[i]);
    }
    return res;
};

const getAvailableSortTypes = (gos: GridOptionsService, column: AgColumn): Set<SortType> => {
    const cacheable = gos.get('sortingOrder') == null; // deprecated `sortingOrder` disables the cache
    const cached = column.cachedSortTypes;
    if (cacheable && cached) {
        return cached;
    }
    const colDefAllowedSortTypes = getColDefAllowedSortTypes(column);
    const types = new Set<SortType>(colDefAllowedSortTypes);
    // add each directional order entry's type — mirrors `getSortDefFromInput` without allocating a SortDef per entry
    const order = getSortingOrderInputs(gos, column, colDefAllowedSortTypes);
    for (let i = 0, len = order.length; i < len; ++i) {
        const input = order[i];
        if (!_isSortDefValid(input)) {
            if (normalizeSortDirection(input)) {
                types.add(_normalizeSortType(input));
            }
            continue;
        }
        if (input.direction) {
            types.add(input.type);
        }
    }
    if (cacheable) {
        column.cachedSortTypes = types;
    }
    return types;
};

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
    const allowedSortTypes = getAvailableSortTypes(beans.gos, column);
    return {
        isDefaultSortAllowed: allowedSortTypes.has('default'),
        isAbsoluteSortAllowed: allowedSortTypes.has('absolute'),
        isAbsoluteSort: type === 'absolute',
        isDefaultSort: type === 'default',
        isAscending: direction === 'asc',
        isDescending: direction === 'desc',
        direction,
    };
};
