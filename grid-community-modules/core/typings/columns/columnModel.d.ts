import { ColumnGroup } from '../entities/columnGroup';
import { Column, ColumnPinnedType } from '../entities/column';
import { ColDef, ColGroupDef, IAggFunc, HeaderLocation } from '../entities/colDef';
import { IHeaderColumn } from '../interfaces/iHeaderColumn';
import { IProvidedColumn } from '../interfaces/iProvidedColumn';
import { ColumnEventType } from '../events';
import { BeanStub } from "../context/beanStub";
import { ProvidedColumnGroup } from '../entities/providedColumnGroup';
import { RowNode } from '../entities/rowNode';
import { PropertyValueChangedEvent } from '../gridOptionsService';
export interface ColumnResizeSet {
    columns: Column[];
    ratios: number[];
    width: number;
}
export interface ColumnStateParams {
    /** True if the column is hidden */
    hide?: boolean | null;
    /** Width of the column in pixels */
    width?: number;
    /** Column's flex if flex is set */
    flex?: number | null;
    /** Sort applied to the column */
    sort?: 'asc' | 'desc' | null;
    /** The order of the sort, if sorting by many columns */
    sortIndex?: number | null;
    /** The aggregation function applied */
    aggFunc?: string | IAggFunc | null;
    /** True if pivot active */
    pivot?: boolean | null;
    /** The order of the pivot, if pivoting by many columns */
    pivotIndex?: number | null;
    /** Set if column is pinned */
    pinned?: ColumnPinnedType;
    /** True if row group active */
    rowGroup?: boolean | null;
    /** The order of the row group, if grouping by many columns */
    rowGroupIndex?: number | null;
}
export interface ColumnState extends ColumnStateParams {
    /** ID of the column */
    colId: string;
}
export interface ApplyColumnStateParams {
    /** The state from `getColumnState` */
    state?: ColumnState[];
    /** Whether column order should be applied */
    applyOrder?: boolean;
    /** State to apply to columns where state is missing for those columns */
    defaultState?: ColumnStateParams;
}
export interface ISizeColumnsToFitParams {
    /** Defines a default minimum width for every column (does not override the column minimum width) */
    defaultMinWidth?: number;
    /** Defines a default maximum width for every column (does not override the column maximum width) */
    defaultMaxWidth?: number;
    /** Provides a minimum and/or maximum width to specific columns */
    columnLimits?: IColumnLimit[];
}
export interface IColumnLimit {
    /** Selector for the column to which these dimension limits will apply */
    key: Column | string;
    /** Defines a minimum width for this column (does not override the column minimum width) */
    minWidth?: number;
    /** Defines a maximum width for this column (does not override the column maximum width) */
    maxWidth?: number;
}
export interface ColDefPropertyChangedEvent extends PropertyValueChangedEvent<any> {
    source?: ColumnEventType;
}
export declare type ColKey<TData = any, TValue = any> = string | ColDef<TData, TValue> | Column<TValue>;
export declare class ColumnModel extends BeanStub {
    private expressionService;
    private columnFactory;
    private displayedGroupCreator;
    private ctrlsService;
    private autoWidthCalculator;
    private columnUtils;
    private columnAnimationService;
    private autoGroupColService;
    private aggFuncService;
    private valueCache;
    private animationFrameService;
    private sortController;
    private columnDefFactory;
    private primaryColumnTree;
    private primaryHeaderRowCount;
    private primaryColumns;
    private primaryColumnsMap;
    private secondaryBalancedTree;
    private secondaryColumns;
    private secondaryColumnsMap;
    private secondaryHeaderRowCount;
    private previousSecondaryColumns;
    private columnsForQuickFilter;
    private gridBalancedTree;
    private gridColumns;
    private gridColumnsMap;
    private groupAutoColsBalancedTree;
    private gridHeaderRowCount;
    private lastPrimaryOrder;
    private lastSecondaryOrder;
    private gridColsArePrimary;
    private displayedTreeLeft;
    private displayedTreeRight;
    private displayedTreeCentre;
    private displayedColumnsLeft;
    private displayedColumnsRight;
    private displayedColumnsCenter;
    private displayedColumns;
    private ariaOrderColumns;
    private displayedColumnsAndGroupsMap;
    private viewportColumns;
    private viewportColumnsHash;
    private headerViewportColumns;
    private viewportColumnsCenter;
    private headerViewportColumnsCenter;
    private viewportRowLeft;
    private viewportRowRight;
    private viewportRowCenter;
    private colSpanActive;
    private displayedAutoHeightCols;
    private autoHeightActive;
    private autoHeightActiveAtLeastOnce;
    private suppressColumnVirtualisation;
    private rowGroupColumns;
    private valueColumns;
    private pivotColumns;
    private groupAutoColumns;
    private groupDisplayColumns;
    private groupDisplayColumnsMap;
    private ready;
    private logger;
    private autoGroupsNeedBuilding;
    private forceRecreateAutoGroups;
    private pivotMode;
    private scrollWidth;
    private scrollPosition;
    private bodyWidth;
    private leftWidth;
    private rightWidth;
    private bodyWidthDirty;
    private viewportLeft;
    private viewportRight;
    private flexViewportWidth;
    private shouldQueueResizeOperations;
    private resizeOperationQueue;
    private columnDefs;
    init(): void;
    private buildAutoGroupColumns;
    private onAutoGroupColumnDefChanged;
    private onSharedColDefChanged;
    setColumnDefs(columnDefs: (ColDef | ColGroupDef)[], source?: ColumnEventType): void;
    recreateColumnDefs(source?: ColumnEventType): void;
    private destroyOldColumns;
    private destroyColumns;
    private createColumnsFromColumnDefs;
    private dispatchNewColumnsLoaded;
    private dispatchEverythingChanged;
    private orderGridColumnsLikePrimary;
    getAllDisplayedAutoHeightCols(): Column[];
    private setViewport;
    getDisplayedColumnsStartingAt(column: Column): Column[];
    private checkViewportColumns;
    setViewportPosition(scrollWidth: number, scrollPosition: number, afterScroll?: boolean): void;
    isPivotMode(): boolean;
    private isPivotSettingAllowed;
    private setPivotMode;
    getSecondaryPivotColumn(pivotKeys: string[], valueColKey: ColKey): Column | null;
    private setBeans;
    private setFirstRightAndLastLeftPinned;
    autoSizeColumns(params: {
        columns: ColKey[];
        skipHeader?: boolean;
        skipHeaderGroups?: boolean;
        stopAtGroup?: ColumnGroup;
        source?: ColumnEventType;
    }): void;
    private dispatchColumnResizedEvent;
    private dispatchColumnChangedEvent;
    private dispatchColumnMovedEvent;
    private dispatchColumnPinnedEvent;
    private dispatchColumnVisibleEvent;
    autoSizeColumn(key: ColKey | null, skipHeader?: boolean, source?: ColumnEventType): void;
    private autoSizeColumnGroupsByColumns;
    autoSizeAllColumns(skipHeader?: boolean, source?: ColumnEventType): void;
    private getColumnsFromTree;
    getAllDisplayedTrees(): IHeaderColumn[] | null;
    getPrimaryColumnTree(): IProvidedColumn[];
    getHeaderRowCount(): number;
    getDisplayedTreeLeft(): IHeaderColumn[];
    getDisplayedTreeRight(): IHeaderColumn[];
    getDisplayedTreeCentre(): IHeaderColumn[];
    isColumnDisplayed(column: Column): boolean;
    getAllDisplayedColumns(): Column[];
    getViewportColumns(): Column[];
    getDisplayedLeftColumnsForRow(rowNode: RowNode): Column[];
    getDisplayedRightColumnsForRow(rowNode: RowNode): Column[];
    isColSpanActive(): boolean;
    private getDisplayedColumnsForRow;
    getViewportCenterColumnsForRow(rowNode: RowNode): Column[];
    isColumnAtEdge(col: Column | ColumnGroup, edge: 'first' | 'last'): boolean;
    getAriaColumnIndex(col: Column | ColumnGroup): number;
    private isColumnInHeaderViewport;
    private isColumnInRowViewport;
    getDisplayedColumnsLeftWidth(): number;
    getDisplayedColumnsRightWidth(): number;
    private updatePrimaryColumnList;
    setRowGroupColumns(colKeys: ColKey[], source?: ColumnEventType): void;
    private setRowGroupActive;
    addRowGroupColumn(key: ColKey | null, source?: ColumnEventType): void;
    addRowGroupColumns(keys: ColKey[], source?: ColumnEventType): void;
    removeRowGroupColumns(keys: ColKey[] | null, source?: ColumnEventType): void;
    removeRowGroupColumn(key: ColKey | null, source?: ColumnEventType): void;
    addPivotColumns(keys: ColKey[], source?: ColumnEventType): void;
    setPivotColumns(colKeys: ColKey[], source?: ColumnEventType): void;
    addPivotColumn(key: ColKey, source?: ColumnEventType): void;
    removePivotColumns(keys: ColKey[], source?: ColumnEventType): void;
    removePivotColumn(key: ColKey, source?: ColumnEventType): void;
    private setPrimaryColumnList;
    setValueColumns(colKeys: ColKey[], source?: ColumnEventType): void;
    private setValueActive;
    addValueColumns(keys: ColKey[], source?: ColumnEventType): void;
    addValueColumn(colKey: ColKey | null | undefined, source?: ColumnEventType): void;
    removeValueColumn(colKey: ColKey, source?: ColumnEventType): void;
    removeValueColumns(keys: ColKey[], source?: ColumnEventType): void;
    private normaliseColumnWidth;
    private getPrimaryOrGridColumn;
    setColumnWidths(columnWidths: {
        key: ColKey;
        newWidth: number;
    }[], shiftKey: boolean, // @takeFromAdjacent - if user has 'shift' pressed, then pixels are taken from adjacent column
    finished: boolean, // @finished - ends up in the event, tells the user if more events are to come
    source?: ColumnEventType): void;
    private checkMinAndMaxWidthsForSet;
    resizeColumnSets(params: {
        resizeSets: ColumnResizeSet[];
        finished: boolean;
        source: ColumnEventType;
    }): void;
    setColumnAggFunc(key: ColKey | null | undefined, aggFunc: string | IAggFunc | null | undefined, source?: ColumnEventType): void;
    moveRowGroupColumn(fromIndex: number, toIndex: number, source?: ColumnEventType): void;
    moveColumns(columnsToMoveKeys: ColKey[], toIndex: number, source?: ColumnEventType, finished?: boolean): void;
    doesMovePassRules(columnsToMove: Column[], toIndex: number): boolean;
    doesOrderPassRules(gridOrder: Column[]): boolean;
    getProposedColumnOrder(columnsToMove: Column[], toIndex: number): Column[];
    sortColumnsLikeGridColumns(cols: Column[]): void;
    doesMovePassLockedPositions(proposedColumnOrder: Column[]): boolean;
    doesMovePassMarryChildren(allColumnsCopy: Column[]): boolean;
    moveColumn(key: ColKey, toIndex: number, source?: ColumnEventType): void;
    moveColumnByIndex(fromIndex: number, toIndex: number, source?: ColumnEventType): void;
    getColumnDefs(): (ColDef | ColGroupDef)[] | undefined;
    getBodyContainerWidth(): number;
    getContainerWidth(pinned: ColumnPinnedType): number;
    private updateBodyWidths;
    getValueColumns(): Column[];
    getPivotColumns(): Column[];
    isPivotActive(): boolean;
    getRowGroupColumns(): Column[];
    getDisplayedCenterColumns(): Column[];
    getDisplayedLeftColumns(): Column[];
    getDisplayedRightColumns(): Column[];
    getDisplayedColumns(type: ColumnPinnedType): Column[];
    getAllPrimaryColumns(): Column[] | null;
    getSecondaryColumns(): Column[] | null;
    getAllColumnsForQuickFilter(): Column[];
    getAllGridColumns(): Column[];
    isEmpty(): boolean;
    isRowGroupEmpty(): boolean;
    setColumnVisible(key: string | Column, visible: boolean, source?: ColumnEventType): void;
    setColumnsVisible(keys: (string | Column)[], visible?: boolean, source?: ColumnEventType): void;
    setColumnPinned(key: ColKey | null, pinned: ColumnPinnedType, source?: ColumnEventType): void;
    setColumnsPinned(keys: ColKey[], pinned: ColumnPinnedType, source?: ColumnEventType): void;
    private actionOnGridColumns;
    getDisplayedColBefore(col: Column): Column | null;
    getDisplayedColAfter(col: Column): Column | null;
    getDisplayedGroupAfter(columnGroup: ColumnGroup): ColumnGroup | null;
    getDisplayedGroupBefore(columnGroup: ColumnGroup): ColumnGroup | null;
    getDisplayedGroupAtDirection(columnGroup: ColumnGroup, direction: 'After' | 'Before'): ColumnGroup | null;
    getColumnGroupAtLevel(column: Column, level: number): ColumnGroup | null;
    isPinningLeft(): boolean;
    isPinningRight(): boolean;
    getPrimaryAndSecondaryAndAutoColumns(): Column[];
    private createStateItemFromColumn;
    getColumnState(): ColumnState[];
    private orderColumnStateList;
    resetColumnState(source?: ColumnEventType): void;
    getColumnStateFromColDef(column: Column): ColumnState;
    applyColumnState(params: ApplyColumnStateParams, source: ColumnEventType): boolean;
    private applyOrderAfterApplyState;
    private compareColumnStatesAndDispatchEvents;
    private getCommonValue;
    private normaliseColumnMovedEventForColumnState;
    private syncColumnWithStateItem;
    getGridColumns(keys: ColKey[]): Column[];
    private getColumns;
    getColumnWithValidation(key: ColKey | undefined): Column | null;
    getPrimaryColumn(key: ColKey): Column | null;
    getGridColumn(key: ColKey): Column | null;
    lookupGridColumn(key: string): Column<any>;
    getSecondaryColumn(key: ColKey): Column | null;
    private getColumn;
    getSourceColumnsForGroupColumn(groupCol: Column): Column[] | null;
    private getAutoColumn;
    private columnsMatch;
    getDisplayNameForColumn(column: Column | null, location: HeaderLocation, includeAggFunc?: boolean): string | null;
    getDisplayNameForProvidedColumnGroup(columnGroup: ColumnGroup | null, providedColumnGroup: ProvidedColumnGroup | null, location: HeaderLocation): string | null;
    getDisplayNameForColumnGroup(columnGroup: ColumnGroup, location: HeaderLocation): string | null;
    private getHeaderName;
    private wrapHeaderNameWithAggFunc;
    getColumnGroup(colId: string | ColumnGroup, partId?: number): ColumnGroup | null;
    isReady(): boolean;
    private extractValueColumns;
    private extractRowGroupColumns;
    private extractColumns;
    private extractPivotColumns;
    resetColumnGroupState(source?: ColumnEventType): void;
    getColumnGroupState(): {
        groupId: string;
        open: boolean;
    }[];
    setColumnGroupState(stateItems: {
        groupId: string;
        open: boolean | undefined;
    }[], source?: ColumnEventType): void;
    setColumnGroupOpened(key: ProvidedColumnGroup | string | null, newValue: boolean, source?: ColumnEventType): void;
    getProvidedColumnGroup(key: string): ProvidedColumnGroup | null;
    private calculateColumnsForDisplay;
    private checkColSpanActiveInCols;
    private calculateColumnsForGroupDisplay;
    getGroupDisplayColumns(): Column[];
    getGroupDisplayColumnForGroup(rowGroupColumnId: string): Column | undefined;
    private updateDisplayedColumns;
    isSecondaryColumnsPresent(): boolean;
    setSecondaryColumns(colDefs: (ColDef | ColGroupDef)[] | null, source?: ColumnEventType): void;
    private processSecondaryColumnDefinitions;
    private updateGridColumns;
    private setAutoHeightActive;
    private orderGridColsLike;
    isPrimaryColumnGroupsPresent(): boolean;
    refreshQuickFilterColumns(): void;
    private placeLockedColumns;
    private addAutoGroupToGridColumns;
    private clearDisplayedAndViewportColumns;
    private updateGroupsAndDisplayedColumns;
    private deriveDisplayedColumns;
    isAutoRowHeightActive(): boolean;
    wasAutoRowHeightEverActive(): boolean;
    private joinColumnsAriaOrder;
    private joinDisplayedColumns;
    private setLeftValues;
    private setLeftValuesOfColumns;
    private setLeftValuesOfGroups;
    private derivedDisplayedColumnsFromDisplayedTree;
    private extractViewportColumns;
    getVirtualHeaderGroupRow(type: ColumnPinnedType, dept: number): IHeaderColumn[];
    private calculateHeaderRows;
    private extractViewport;
    refreshFlexedColumns(params?: {
        resizingCols?: Column[];
        skipSetLeft?: boolean;
        viewportWidth?: number;
        source?: ColumnEventType;
        fireResizedEvent?: boolean;
        updateBodyWidths?: boolean;
    }): Column[];
    sizeColumnsToFit(gridWidth: any, source?: ColumnEventType, silent?: boolean, params?: ISizeColumnsToFitParams): void;
    private buildDisplayedTrees;
    private updateDisplayedMap;
    isDisplayed(item: IHeaderColumn): boolean;
    private updateOpenClosedVisibilityInColumnGroups;
    getGroupAutoColumns(): Column[] | null;
    /**
     * Creates new auto group columns if required
     * @returns whether auto cols have changed
     */
    private createGroupAutoColumnsIfNeeded;
    isGroupSuppressAutoColumn(): boolean;
    private autoColsEqual;
    private getWidthOfColsInList;
    getFirstDisplayedColumn(): Column | null;
    setColumnHeaderHeight(col: Column, height: number): void;
    getColumnGroupHeaderRowHeight(): number;
    getColumnHeaderRowHeight(): number;
    getHeaderHeight(): number;
    getFloatingFiltersHeight(): number;
    getGroupHeaderHeight(): number;
    private getPivotHeaderHeight;
    getPivotGroupHeaderHeight(): number;
    queueResizeOperations(): void;
    processResizeOperations(): void;
    resetColumnDefIntoColumn(column: Column, source: ColumnEventType): boolean;
    isColumnGroupingLocked(column: Column): boolean;
    generateColumnStateForRowGroupAndPivotIndexes(updatedRowGroupColumnState: {
        [colId: string]: ColumnState;
    }, updatedPivotColumnState: {
        [colId: string]: ColumnState;
    }): ColumnState[];
    private onColumnsReady;
    private onFirstDataRendered;
}
