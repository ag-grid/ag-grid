import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, Optional, PostConstruct, PreDestroy } from '../context/context';
import { AbstractColDef, ColDef, ColGroupDef, HeaderLocation, HeaderValueGetterParams, IAggFunc } from '../entities/colDef';
import { Column, ColumnInstanceId, ColumnPinnedType } from '../entities/column';
import { ColumnGroup } from '../entities/columnGroup';
import { ProvidedColumnGroup } from '../entities/providedColumnGroup';
import { RowNode } from '../entities/rowNode';
import {
    ColumnContainerWidthChanged,
    ColumnEvent,
    ColumnEventType,
    ColumnEverythingChangedEvent,
    ColumnValueChangedEvent,
    ColumnVisibleEvent,
    DisplayedColumnsChangedEvent,
    DisplayedColumnsWidthChangedEvent,
    Events,
    GridColumnsChangedEvent,
    NewColumnsLoadedEvent,
    VirtualColumnsChangedEvent
} from '../events';
import { PropertyChangedSource } from '../gridOptionsService';
import { IAggFuncService } from '../interfaces/iAggFuncService';
import { WithoutGridCommon } from '../interfaces/iCommon';
import { HeaderColumnId, IHeaderColumn } from '../interfaces/iHeaderColumn';
import { IProvidedColumn } from '../interfaces/iProvidedColumn';
import { AnimationFrameService } from "../misc/animationFrameService";
import { areEqual, includes, insertIntoArray, last, moveInArray, removeAllFromUnorderedArray, removeFromArray } from '../utils/array';
import { exists, missing, missingOrEmpty } from '../utils/generic';
import { convertToMap } from '../utils/map';
import { camelCaseToHumanText } from '../utils/string';
import { ColumnFactory, depthFirstOriginalTreeSearch } from './columnFactory';

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

type ColKey<TData = any, TValue = any> = string | ColDef<TData, TValue> | Column<TValue>;
export type Maybe<T> = T | null | undefined;

@Bean('columnModel')
export class ColumnModel extends BeanStub {

    @Autowired('columnFactory') private columnFactory: ColumnFactory;
    @Autowired('animationFrameService') private animationFrameService: AnimationFrameService;

    @Optional('aggFuncService') private aggFuncService?: IAggFuncService;

    // these are the columns provided by the client. this doesn't change, even if the
    // order or state of the columns and groups change. it will only change if the client
    // provides a new set of column definitions. otherwise this tree is used to build up
    // the groups for displaying.
    private primaryColumnTree: IProvidedColumn[];
    // header row count, based on user provided columns
    private primaryHeaderRowCount = 0;
    // all columns provided by the user. basically it's the leaf level nodes of the
    // tree above (originalBalancedTree)
    private primaryColumns: Column[] | undefined; // every column available
    private primaryColumnsMap: { [id: string]: Column };

    // these are all columns that are available to the grid for rendering after pivot
    private gridBalancedTree: IProvidedColumn[];
    private gridColumns: Column[];
    private gridColumnsMap: { [id: string]: Column };

    private groupAutoColsBalancedTree: IProvidedColumn[] | null;

    // header row count, either above, or based on pivoting if we are pivoting
    private gridHeaderRowCount = 0;

    private lastPrimaryOrder: Column[];
    private gridColsArePrimary: boolean;

    // primary columns -> what the user provides
    // secondary columns -> columns generated as a result of a pivot
    // displayed columns -> columns that are 1) visible and 2) parent groups are opened. thus can be rendered
    // viewport columns -> centre columns only, what columns are to be rendered due to column virtualisation

    // tree of columns to be displayed for each section
    private displayedTreeCentre: IHeaderColumn[];

    // leave level columns of the displayed trees
    private displayedColumnsCenter: Column[] = [];
    // all three lists above combined
    private displayedColumns: Column[] = [];

    // list of all columns (displayed and hidden) in visible order including pinned
    private ariaOrderColumns: Column[];

    // for fast lookup, to see if a column or group is still displayed
    private displayedColumnsAndGroupsMap: { [id: HeaderColumnId]: IHeaderColumn } = {};

    // all columns to be rendered
    private viewportColumns: Column[] = [];

    // A hash key to keep track of changes in viewport columns
    private viewportColumnsHash: string = '';

    // same as viewportColumns, except we always include columns with headerAutoHeight
    private headerViewportColumns: Column[] = [];

    // all columns to be rendered in the centre
    private viewportColumnsCenter: Column[] = [];
    // same as viewportColumnsCenter, except we always include columns with headerAutoHeight
    private headerViewportColumnsCenter: Column[] = [];

    // all columns & groups to be rendered, index by row. used by header rows to get all items
    // to render for that row.
    private viewportRowLeft: { [row: number]: IHeaderColumn[]; } = {};
    private viewportRowRight: { [row: number]: IHeaderColumn[]; } = {};
    private viewportRowCenter: { [row: number]: IHeaderColumn[]; } = {};

    // true if we are doing column spanning
    private colSpanActive: boolean;

    // grid columns that have colDef.autoHeight set
    private displayedAutoHeightCols: Column[];
    private autoHeightActive: boolean;
    private autoHeightActiveAtLeastOnce = false;

    private suppressColumnVirtualisation: boolean;

    private rowGroupColumns: Column[] = [];
    private valueColumns: Column[] = [];
    private pivotColumns: Column[] = [];

    private groupAutoColumns: Column[] | null;

    private groupDisplayColumns: Column[];
    private groupDisplayColumnsMap: { [originalColumnId: string]: Column };

    private ready = false;
    private changeEventsDispatching = false;

    private autoGroupsNeedBuilding = false;

    private pivotMode = false;

    // for horizontal visualisation of columns
    private scrollWidth: number;
    private scrollPosition: number;

    private bodyWidth = 0;
    private leftWidth = 0;
    private rightWidth = 0;

    private bodyWidthDirty = true;

    private viewportLeft: number;
    private viewportRight: number;
    private flexViewportWidth: number;

    // when we're waiting for cell data types to be inferred, we need to defer column resizing
    private shouldQueueResizeOperations: boolean = false;
    private resizeOperationQueue: (() => void)[] = [];

    private columnDefs: (ColDef | ColGroupDef)[];

    @PostConstruct
    public init(): void {
        this.suppressColumnVirtualisation = this.gos.get('suppressColumnVirtualisation');

        this.addManagedPropertyListeners(['defaultColDef', 'columnTypes', 'suppressFieldDotNotation'], event => this.onSharedColDefChanged(convertSourceType(event.source)));
        this.addManagedListener(this.eventService, Events.EVENT_FIRST_DATA_RENDERED, () => this.onFirstDataRendered());
    }


    private onSharedColDefChanged(source: ColumnEventType): void {
        if (!this.gridColumns) { return; }

        this.createColumnsFromColumnDefs(true, source);
    }

    public setColumnDefs(columnDefs: (ColDef | ColGroupDef)[], source: ColumnEventType) {
        const colsPreviouslyExisted = !!this.columnDefs;
        this.columnDefs = columnDefs;
        this.createColumnsFromColumnDefs(colsPreviouslyExisted, source);
    }

    public recreateColumnDefs(source: ColumnEventType): void {
        this.onSharedColDefChanged(source);
    }

    private destroyOldColumns(oldTree: IProvidedColumn[] | null, newTree?: IProvidedColumn[] | null): void {
        const oldObjectsById: {[id: ColumnInstanceId]: IProvidedColumn | null} = {};

        if (!oldTree) { return; }

        // add in all old columns to be destroyed
        depthFirstOriginalTreeSearch(null, oldTree, child => {
            oldObjectsById[child.getInstanceId()] = child;
        });

        // however we don't destroy anything in the new tree. if destroying the grid, there is no new tree
        if (newTree) {
            depthFirstOriginalTreeSearch(null, newTree, child => {
                oldObjectsById[child.getInstanceId()] = null;
            });
        }

        // what's left can be destroyed
        const colsToDestroy = Object.values(oldObjectsById).filter(item => item != null);
        this.destroyBeans(colsToDestroy);
    }

    @PreDestroy
    private destroyColumns(): void {
        this.destroyOldColumns(this.primaryColumnTree);
        this.destroyOldColumns(this.groupAutoColsBalancedTree);
    }


    private createColumnsFromColumnDefs(colsPreviouslyExisted: boolean, source: ColumnEventType): void {
        // only need to dispatch before/after events if updating columns, never if setting columns for first time
        const dispatchEventsFunc = undefined;

        // always invalidate cache on changing columns, as the column id's for the new columns
        // could overlap with the old id's, so the cache would return old values for new columns.

        // NOTE ==================
        // we should be destroying the existing columns and groups if they exist, for example, the original column
        // group adds a listener to the columns, it should be also removing the listeners
        this.autoGroupsNeedBuilding = true;

        const oldPrimaryTree = this.primaryColumnTree;
        const balancedTreeResult = this.columnFactory.createColumnTree(this.columnDefs, true, oldPrimaryTree, source);

        this.destroyOldColumns(this.primaryColumnTree, balancedTreeResult.columnTree);
        this.primaryColumnTree = balancedTreeResult.columnTree;
        this.primaryHeaderRowCount = balancedTreeResult.treeDept + 1;

        this.primaryColumns = this.getColumnsFromTree(this.primaryColumnTree);
        this.primaryColumnsMap = {};
        this.primaryColumns.forEach(col => this.primaryColumnsMap[col.getId()] = col);

        this.ready = true;

        // if we are showing secondary columns, then no need to update grid columns
        // unless the auto column needs rebuilt, as it's the pivot service responsibility to change these
        // if we are no longer pivoting (ie and need to revert back to primary, otherwise
        // we shouldn't be touching the primary).
        const gridColsNotProcessed = this.gridColsArePrimary === undefined;
        const processGridCols = this.gridColsArePrimary || gridColsNotProcessed || this.autoGroupsNeedBuilding;

        if (processGridCols) {
            this.updateGridColumns();
            if (colsPreviouslyExisted && this.gridColsArePrimary && !this.gos.get('maintainColumnOrder')) {
                this.orderGridColumnsLikePrimary();
            }
            this.updateDisplayedColumns(source);
            this.checkViewportColumns();
        }

        // this event is not used by AG Grid, but left here for backwards compatibility,
        // in case applications use it
        this.dispatchEverythingChanged(source);

        // Row Models react to all of these events as well as new columns loaded,
        // this flag instructs row model to ignore these events to reduce refreshes.
        this.changeEventsDispatching = true;
        if (dispatchEventsFunc) {
        }
        this.changeEventsDispatching = false;

        this.dispatchNewColumnsLoaded(source);
    }

    public shouldRowModelIgnoreRefresh(): boolean {
        return this.changeEventsDispatching;
    }

    private dispatchNewColumnsLoaded(source: ColumnEventType): void {
        const newColumnsLoadedEvent: WithoutGridCommon<NewColumnsLoadedEvent> = {
            type: Events.EVENT_NEW_COLUMNS_LOADED,
            source
        };

        this.eventService.dispatchEvent(newColumnsLoadedEvent);
        if (source === 'gridInitializing') {
        }
    }

    private dispatchEverythingChanged(source: ColumnEventType): void {
        const eventEverythingChanged: WithoutGridCommon<ColumnEverythingChangedEvent> = {
            type: Events.EVENT_COLUMN_EVERYTHING_CHANGED,
            source
        };
        this.eventService.dispatchEvent(eventEverythingChanged);
    }

    private orderGridColumnsLikePrimary(): void {
        const primaryColumns = this.primaryColumns;

        if (!primaryColumns) { return; }

        const primaryColsOrdered = primaryColumns.filter(col => this.gridColumns.indexOf(col) >= 0);
        const otherCols = this.gridColumns.filter(col => primaryColsOrdered.indexOf(col) < 0);

        this.gridColumns = [...otherCols, ...primaryColsOrdered];
    }

    public getAllDisplayedAutoHeightCols(): Column[] {
        return this.displayedAutoHeightCols;
    }

    private setViewport(): void {
        if (this.gos.get('enableRtl')) {
            this.viewportLeft = this.bodyWidth - this.scrollPosition - this.scrollWidth;
            this.viewportRight = this.bodyWidth - this.scrollPosition;
        } else {
            this.viewportLeft = this.scrollPosition;
            this.viewportRight = this.scrollWidth + this.scrollPosition;
        }
    }

    // checks what columns are currently displayed due to column virtualisation. dispatches an event
    // if the list of columns has changed.
    // + setColumnWidth(), setViewportPosition(), setColumnDefs(), sizeColumnsToFit()
    private checkViewportColumns(afterScroll: boolean = false): void {
        // check displayCenterColumnTree exists first, as it won't exist when grid is initialising
        if (this.displayedColumnsCenter == null) { return; }

        const viewportColumnsChanged = this.extractViewport();

        if (!viewportColumnsChanged) { return; }

        const event: WithoutGridCommon<VirtualColumnsChangedEvent> = {
            type: Events.EVENT_VIRTUAL_COLUMNS_CHANGED,
            afterScroll,
        };

        this.eventService.dispatchEvent(event);
    }

    public setViewportPosition(scrollWidth: number, scrollPosition: number, afterScroll: boolean = false): void {
        if (scrollWidth !== this.scrollWidth || scrollPosition !== this.scrollPosition || this.bodyWidthDirty) {
            this.scrollWidth = scrollWidth;
            this.scrollPosition = scrollPosition;
            // we need to call setVirtualViewportLeftAndRight() at least once after the body width changes,
            // as the viewport can stay the same, but in RTL, if body width changes, we need to work out the
            // virtual columns again
            this.bodyWidthDirty = true;
            this.setViewport();

            if (this.ready) {
                this.checkViewportColumns(afterScroll);
            }
        }
    }

    public isPivotMode(): boolean {
        return this.pivotMode;
    }


    private dispatchColumnChangedEvent(type: string, columns: Column[], source: ColumnEventType): void {
        const event: WithoutGridCommon<ColumnValueChangedEvent> = {
            type: type,
            columns: columns,
            column: (columns && columns.length == 1) ? columns[0] : null,
            source: source
        };
        this.eventService.dispatchEvent(event);
    }

    private dispatchColumnVisibleEvent(changedColumns: Column[], source: ColumnEventType) {
        if (!changedColumns.length) { return; }

        // if just one column, we use this, otherwise we don't include the col
        const column: Column | null = changedColumns.length === 1 ? changedColumns[0] : null;

        // only include visible if it's common in all columns
        const visible = this.getCommonValue(changedColumns, col => col.isVisible());

        const event: WithoutGridCommon<ColumnVisibleEvent> = {
            type: Events.EVENT_COLUMN_VISIBLE,
            visible,
            columns: changedColumns,
            column,
            source: source
        };

        this.eventService.dispatchEvent(event);
    }

    // Possible candidate for reuse (alot of recursive traversal duplication)
    private getColumnsFromTree(rootColumns: IProvidedColumn[]): Column[] {
        const result: Column[] = [];

        const recursiveFindColumns = (childColumns: IProvidedColumn[]): void => {
            for (let i = 0; i < childColumns.length; i++) {
                const child = childColumns[i];
                if (child instanceof Column) {
                    result.push(child);
                } else if (child instanceof ProvidedColumnGroup) {
                    recursiveFindColumns(child.getChildren());
                }
            }
        };

        recursiveFindColumns(rootColumns);

        return result;
    }

    public getAllDisplayedTrees(): IHeaderColumn[] | null {
        if (this.displayedTreeCentre) {
            return this.displayedTreeCentre
        }

        return null;
    }

    // + columnSelectPanel
    public getPrimaryColumnTree(): IProvidedColumn[] {
        return this.primaryColumnTree;
    }

    // + gridPanel -> for resizing the body and setting top margin
    public getHeaderRowCount(): number {
        return this.gridHeaderRowCount;
    }

    // + headerRenderer -> setting pinned body width
    public getDisplayedTreeCentre(): IHeaderColumn[] {
        return this.displayedTreeCentre;
    }

    // gridPanel -> ensureColumnVisible
    public isColumnDisplayed(column: Column): boolean {
        return this.getAllDisplayedColumns().indexOf(column) >= 0;
    }

    // + csvCreator
    public getAllDisplayedColumns(): Column[] {
        return this.displayedColumns;
    }

    public getViewportColumns(): Column[] {
        return this.viewportColumns;
    }

    public isColSpanActive(): boolean {
        return this.colSpanActive;
    }

    private getDisplayedColumnsForRow(
        rowNode: RowNode, displayedColumns: Column[],
        filterCallback?: (column: Column) => boolean,
        emptySpaceBeforeColumn?: (column: Column) => boolean
    ): Column[] {
        const result: Column[] = [];
        let lastConsideredCol: Column | null = null;

        for (let i = 0; i < displayedColumns.length; i++) {
            const col = displayedColumns[i];
            const maxAllowedColSpan = displayedColumns.length - i;
            const colSpan = Math.min(col.getColSpan(rowNode), maxAllowedColSpan);
            const columnsToCheckFilter: Column[] = [col];

            if (colSpan > 1) {
                const colsToRemove = colSpan - 1;

                for (let j = 1; j <= colsToRemove; j++) {
                    columnsToCheckFilter.push(displayedColumns[i + j]);
                }

                i += colsToRemove;
            }

            // see which cols we should take out for column virtualisation
            let filterPasses: boolean;

            if (filterCallback) {
                // if user provided a callback, means some columns may not be in the viewport.
                // the user will NOT provide a callback if we are talking about pinned areas,
                // as pinned areas have no horizontal scroll and do not virtualise the columns.
                // if lots of columns, that means column spanning, and we set filterPasses = true
                // if one or more of the columns spanned pass the filter.
                filterPasses = false;
                columnsToCheckFilter.forEach(colForFilter => {
                    if (filterCallback(colForFilter)) { filterPasses = true; }
                });
            } else {
                filterPasses = true;
            }

            if (filterPasses) {
                if (result.length === 0 && lastConsideredCol) {
                    const gapBeforeColumn = emptySpaceBeforeColumn ? emptySpaceBeforeColumn(col) : false;
                    if (gapBeforeColumn) {
                        result.push(lastConsideredCol);
                    }
                }
                result.push(col);
            }

            lastConsideredCol = col;
        }

        return result;
    }

    // + rowRenderer
    // if we are not column spanning, this just returns back the virtual centre columns,
    // however if we are column spanning, then different rows can have different virtual
    // columns, so we have to work out the list for each individual row.
    public getViewportCenterColumnsForRow(rowNode: RowNode): Column[] {
        if (!this.colSpanActive) {
            return this.viewportColumnsCenter;
        }

        const emptySpaceBeforeColumn = (col: Column) => {
            const left = col.getLeft();

            return exists(left) && left > this.viewportLeft;
        };

        // if doing column virtualisation, then we filter based on the viewport.
        const filterCallback = this.isColumnVirtualisationSuppressed() ? null : this.isColumnInRowViewport.bind(this);

        return this.getDisplayedColumnsForRow(
            rowNode,
            this.displayedColumnsCenter,
            filterCallback,
            emptySpaceBeforeColumn
        );
    }

    public isColumnAtEdge(col: Column | ColumnGroup, edge: 'first' | 'last'): boolean {
        const allColumns = this.getAllDisplayedColumns();
        if (!allColumns.length) { return false; }

        const isFirst = edge === 'first';

        let columnToCompare: Column;
        if (col instanceof ColumnGroup) {
            const leafColumns = col.getDisplayedLeafColumns();
            if (!leafColumns.length) { return false; }

            columnToCompare = isFirst ? leafColumns[0] : last(leafColumns);
        } else {
            columnToCompare = col;
        }

        return (isFirst ? allColumns[0] : last(allColumns)) === columnToCompare;
    }

    public getAriaColumnIndex(col: Column | ColumnGroup): number {
        let targetColumn: Column;

        if (col instanceof ColumnGroup) {
            targetColumn = col.getLeafColumns()[0];
        } else {
            targetColumn = col;
        }

        return this.ariaOrderColumns.indexOf(targetColumn) + 1;
    }

    private isColumnInHeaderViewport(col: Column): boolean {
        // for headers, we never filter out autoHeaderHeight columns, if calculating
        if (col.isAutoHeaderHeight()) { return true; }

        return this.isColumnInRowViewport(col);
    }

    private isColumnInRowViewport(col: Column): boolean {
        // we never filter out autoHeight columns, as we need them in the DOM for calculating Auto Height
        if (col.isAutoHeight()) { return true; }

        const columnLeft = col.getLeft() || 0;
        const columnRight = columnLeft + col.getActualWidth();

        // adding 200 for buffer size, so some cols off viewport are rendered.
        // this helps horizontal scrolling so user rarely sees white space (unless
        // they scroll horizontally fast). however we are conservative, as the more
        // buffer the slower the vertical redraw speed
        const leftBounds = this.viewportLeft - 200;
        const rightBounds = this.viewportRight + 200;

        const columnToMuchLeft = columnLeft < leftBounds && columnRight < leftBounds;
        const columnToMuchRight = columnLeft > rightBounds && columnRight > rightBounds;

        return !columnToMuchLeft && !columnToMuchRight;
    }

    private updatePrimaryColumnList(
        keys: Maybe<ColKey>[] | null,
        masterList: Column[],
        actionIsAdd: boolean,
        columnCallback: (column: Column) => void,
        eventType: string,
        source: ColumnEventType
    ) {

        if (!keys || missingOrEmpty(keys)) { return; }

        let atLeastOne = false;

        keys.forEach(key => {
            if (!key) { return; }
            const columnToAdd = this.getPrimaryColumn(key);
            if (!columnToAdd) { return; }

            if (actionIsAdd) {
                if (masterList.indexOf(columnToAdd) >= 0) { return; }
                masterList.push(columnToAdd);
            } else {
                if (masterList.indexOf(columnToAdd) < 0) { return; }
                removeFromArray(masterList, columnToAdd);
            }

            columnCallback(columnToAdd);
            atLeastOne = true;
        });

        if (!atLeastOne) { return; }

        if (this.autoGroupsNeedBuilding) {
            this.updateGridColumns();
        }

        this.updateDisplayedColumns(source);

        const event: WithoutGridCommon<ColumnEvent> = {
            type: eventType,
            columns: masterList,
            column: masterList.length === 1 ? masterList[0] : null,
            source: source
        };

        this.eventService.dispatchEvent(event);
    }


    private setPrimaryColumnList(
        colKeys: ColKey[],
        masterList: Column[],
        eventName: string,
        detectOrderChange: boolean,
        columnCallback: (added: boolean, column: Column) => void,
        source: ColumnEventType,
    ): void {
        if (!this.gridColumns) { return; }

        const changes: Map<Column, number> = new Map();
        // store all original cols and their index.
        masterList.forEach((col, idx) => changes.set(col, idx));

        masterList.length = 0;

        if (exists(colKeys)) {
            colKeys.forEach(key => {
                const column = this.getPrimaryColumn(key);
                if (column) {
                    masterList.push(column);
                }
            });
        }

        masterList.forEach((col, idx) => {
            const oldIndex = changes.get(col);
            // if the column was not in the list, we add it as it's a change
            // idx is irrelevant now.
            if (oldIndex === undefined) {
                changes.set(col, 0);
                return;
            }

            if (detectOrderChange && oldIndex !== idx) {
                // if we're detecting order changes, and the indexes differ, we retain this as it's changed
                return;
            }
            
            // otherwise remove this col, as it's unchanged.
            changes.delete(col);
        });

        (this.primaryColumns || []).forEach(column => {
            const added = masterList.indexOf(column) >= 0;
            columnCallback(added, column);
        });

        if (this.autoGroupsNeedBuilding) {
            this.updateGridColumns();
        }

        this.updateDisplayedColumns(source);

        this.dispatchColumnChangedEvent(eventName, [...changes.keys()], source);
    }

    public setValueColumns(colKeys: ColKey[], source: ColumnEventType): void {
        this.setPrimaryColumnList(colKeys, this.valueColumns,
            Events.EVENT_COLUMN_VALUE_CHANGED,
            false,
            this.setValueActive.bind(this),
            source
        );
    }

    private setValueActive(active: boolean, column: Column, source: ColumnEventType): void {
        if (active === column.isValueActive()) { return; }

        column.setValueActive(active, source);

        if (active && !column.getAggFunc() && this.aggFuncService) {
            const initialAggFunc = this.aggFuncService.getDefaultAggFunc(column);
            column.setAggFunc(initialAggFunc);
        }
    }

    private getPrimaryOrGridColumn(key: ColKey): Column | null {
        const column = this.getPrimaryColumn(key);

        return column || this.getGridColumn(key);
    }

    public setColumnWidths(
        columnWidths: {
            key: ColKey, // @key - the column who's size we want to change
            newWidth: number; // @newWidth - width in pixels
        }[],
        shiftKey: boolean, // @takeFromAdjacent - if user has 'shift' pressed, then pixels are taken from adjacent column
        finished: boolean, // @finished - ends up in the event, tells the user if more events are to come
        source: ColumnEventType
    ): void {
        const sets: ColumnResizeSet[] = [];

        columnWidths.forEach(columnWidth => {
            const col = this.getPrimaryOrGridColumn(columnWidth.key);

            if (!col) { return; }

            sets.push({
                width: columnWidth.newWidth,
                ratios: [1],
                columns: [col]
            });

            // if user wants to do shift resize by default, then we invert the shift operation
            const defaultIsShift = this.gos.get('colResizeDefault') === 'shift';

            if (defaultIsShift) {
                shiftKey = !shiftKey;
            }

            if (shiftKey) {
                const otherCol = this.getDisplayedColAfter(col);
                if (!otherCol) { return; }

                const widthDiff = col.getActualWidth() - columnWidth.newWidth;
                const otherColWidth = otherCol.getActualWidth() + widthDiff;

                sets.push({
                    width: otherColWidth,
                    ratios: [1],
                    columns: [otherCol]
                });
            }
        });

        if (sets.length === 0) { return; }


    }
    public getProposedColumnOrder(columnsToMove: Column[], toIndex: number): Column[] {
        const proposedColumnOrder = this.gridColumns.slice();
        moveInArray(proposedColumnOrder, columnsToMove, toIndex);
        return proposedColumnOrder;
    }

    // returns the provided cols sorted in same order as they appear in grid columns. eg if grid columns
    // contains [a,b,c,d,e] and col passed is [e,a] then the passed cols are sorted into [a,e]
    public sortColumnsLikeGridColumns(cols: Column[]): void {
        if (!cols || cols.length <= 1) { return; }

        const notAllColsInGridColumns = cols.filter(c => this.gridColumns.indexOf(c) < 0).length > 0;
        if (notAllColsInGridColumns) { return; }

        cols.sort((a: Column, b: Column) => {
            const indexA = this.gridColumns.indexOf(a);
            const indexB = this.gridColumns.indexOf(b);
            return indexA - indexB;
        });
    }


    // used by:
    // + angularGrid -> for setting body width
    // + rowController -> setting main row widths (when inserting and resizing)
    // need to cache this
    public getBodyContainerWidth(): number {
        return this.bodyWidth;
    }

    public getContainerWidth(pinned: ColumnPinnedType): number {
        
                return this.bodyWidth;
    }

    // after setColumnWidth or updateGroupsAndDisplayedColumns
    private updateBodyWidths(): void {
        const newBodyWidth = this.getWidthOfColsInList(this.displayedColumnsCenter);
        const newLeftWidth = 0;
        const newRightWidth = 0;

        // this is used by virtual col calculation, for RTL only, as a change to body width can impact displayed
        // columns, due to RTL inverting the y coordinates
        this.bodyWidthDirty = this.bodyWidth !== newBodyWidth;

        const atLeastOneChanged = this.bodyWidth !== newBodyWidth || this.leftWidth !== newLeftWidth || this.rightWidth !== newRightWidth;

        if (atLeastOneChanged) {
            this.bodyWidth = newBodyWidth;
            this.leftWidth = newLeftWidth;
            this.rightWidth = newRightWidth;

            // this event is fired to allow the grid viewport to resize before the
            // scrollbar tries to update its visibility.
            const evt: WithoutGridCommon<ColumnContainerWidthChanged> = {
                type: Events.EVENT_COLUMN_CONTAINER_WIDTH_CHANGED,
            };
            this.eventService.dispatchEvent(evt);

            // when this fires, it is picked up by the gridPanel, which ends up in
            // gridPanel calling setWidthAndScrollPosition(), which in turn calls setViewportPosition()
            const event: WithoutGridCommon<DisplayedColumnsWidthChangedEvent> = {
                type: Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED,
            };
            this.eventService.dispatchEvent(event);
        }
    }

    // + rowController
    public getValueColumns(): Column[] {
        return this.valueColumns ? this.valueColumns : [];
    }

    // + rowController
    public getPivotColumns(): Column[] {
        return this.pivotColumns ? this.pivotColumns : [];
    }

    // + clientSideRowModel
    public isPivotActive(): boolean {
        return this.pivotColumns && this.pivotColumns.length > 0 && this.pivotMode;
    }

    // + toolPanel
    public getRowGroupColumns(): Column[] {
        return this.rowGroupColumns ? this.rowGroupColumns : [];
    }

    // + rowController -> while inserting rows
    public getDisplayedCenterColumns(): Column[] {
        return this.displayedColumnsCenter;
    }

    // used by:
    // + clientSideRowController -> sorting, building quick filter text
    // + headerRenderer -> sorting (clearing icon)
    public getAllPrimaryColumns(): Column[] | null {
        return this.primaryColumns ? this.primaryColumns : null;
    }

    public getSecondaryColumns(): Column[] | null {
        return null;
    }

    // + moveColumnController
    public getAllGridColumns(): Column[] {
        return this.gridColumns ?? [];
    }

    public isRowGroupEmpty(): boolean {
        return missingOrEmpty(this.rowGroupColumns);
    }


    public getDisplayedColBefore(col: Column): Column | null {
        const allDisplayedColumns = this.getAllDisplayedColumns();
        const oldIndex = allDisplayedColumns.indexOf(col);

        if (oldIndex > 0) {
            return allDisplayedColumns[oldIndex - 1];
        }

        return null;
    }

    // used by:
    // + rowRenderer -> for navigation
    public getDisplayedColAfter(col: Column): Column | null {
        const allDisplayedColumns = this.getAllDisplayedColumns();
        const oldIndex = allDisplayedColumns.indexOf(col);

        if (oldIndex < (allDisplayedColumns.length - 1)) {
            return allDisplayedColumns[oldIndex + 1];
        }

        return null;
    }

    public getPrimaryAndSecondaryAndAutoColumns(): Column[] {
        return ([] as Column[]).concat(...[
            this.primaryColumns || [],
            this.groupAutoColumns || [],
            [],
        ]);
    }

    private createStateItemFromColumn(column: Column): ColumnState {
        const rowGroupIndex = column.isRowGroupActive() ? this.rowGroupColumns.indexOf(column) : null;
        const pivotIndex = column.isPivotActive() ? this.pivotColumns.indexOf(column) : null;
        const aggFunc = column.isValueActive() ? column.getAggFunc() : null;
        const sort = column.getSort() != null ? column.getSort() : null;
        const sortIndex = column.getSortIndex() != null ? column.getSortIndex() : null;
        const flex = column.getFlex() != null && column.getFlex() > 0 ? column.getFlex() : null;

        const res: ColumnState = {
            colId: column.getColId(),
            width: column.getActualWidth(),
            hide: !column.isVisible(),
            pinned: column.getPinned(),
            sort,
            sortIndex,
            aggFunc,
            rowGroup: column.isRowGroupActive(),
            rowGroupIndex,
            pivot: column.isPivotActive(),
            pivotIndex: pivotIndex,
            flex
        };

        return res;
    }

    public getColumnState(): ColumnState[] {
        if (missing(this.primaryColumns) || !this.isAlive()) { return []; }

        const colsForState = this.getPrimaryAndSecondaryAndAutoColumns();
        const res: ColumnState[] = colsForState.map(this.createStateItemFromColumn.bind(this));

        this.orderColumnStateList(res);

        return res;
    }

    private orderColumnStateList(columnStateList: any[]): void {
        // for fast looking, store the index of each column
        const colIdToGridIndexMap = convertToMap<string, number>(this.gridColumns.map((col, index) => [col.getColId(), index]));

        columnStateList.sort((itemA: any, itemB: any) => {
            const posA = colIdToGridIndexMap.has(itemA.colId) ? colIdToGridIndexMap.get(itemA.colId) : -1;
            const posB = colIdToGridIndexMap.has(itemB.colId) ? colIdToGridIndexMap.get(itemB.colId) : -1;
            return posA! - posB!;
        });
    }


    public getColumnStateFromColDef(column: Column): ColumnState {
        const getValueOrNull = (a: any, b: any) => a != null ? a : b != null ? b : null;

        const colDef = column.getColDef();
        const sort = getValueOrNull(colDef.sort, colDef.initialSort);
        const sortIndex = getValueOrNull(colDef.sortIndex, colDef.initialSortIndex);
        const hide = getValueOrNull(colDef.hide, colDef.initialHide);
        const pinned = getValueOrNull(colDef.pinned, colDef.initialPinned);

        const width = getValueOrNull(colDef.width, colDef.initialWidth);
        const flex = getValueOrNull(colDef.flex, colDef.initialFlex);

        let rowGroupIndex: number | null | undefined = getValueOrNull(colDef.rowGroupIndex, colDef.initialRowGroupIndex);
        let rowGroup: boolean | null | undefined = getValueOrNull(colDef.rowGroup, colDef.initialRowGroup);

        if (rowGroupIndex == null && (rowGroup == null || rowGroup == false)) {
            rowGroupIndex = null;
            rowGroup = null;
        }

        let pivotIndex: number | null | undefined = getValueOrNull(colDef.pivotIndex, colDef.initialPivotIndex);
        let pivot: boolean | null | undefined = getValueOrNull(colDef.pivot, colDef.initialPivot);

        if (pivotIndex == null && (pivot == null || pivot == false)) {
            pivotIndex = null;
            pivot = null;
        }

        const aggFunc = getValueOrNull(colDef.aggFunc, colDef.initialAggFunc);

       return {
            colId: column.getColId(),
            sort,
            sortIndex,
            hide,
            pinned,
            width,
            flex,
            rowGroup,
            rowGroupIndex,
            pivot,
            pivotIndex,
            aggFunc,
        };
    }


    private getCommonValue<T>(cols: Column[], valueGetter: ((col: Column) => T)): T | undefined {
        if (!cols || cols.length == 0) { return undefined; }

        // compare each value to the first value. if nothing differs, then value is common so return it.
        const firstValue = valueGetter(cols[0]);
        for (let i = 1; i < cols.length; i++) {
            if (firstValue !== valueGetter(cols[i])) {
                // values differ, no common value
                return undefined;
            }
        }

        return firstValue;
    }

    public getGridColumns(keys: ColKey[]): Column[] {
        return this.getColumns(keys, this.getGridColumn.bind(this));
    }

    private getColumns(keys: ColKey[], columnLookupCallback: (key: ColKey) => Column): Column[] {
        const foundColumns: Column[] = [];

        if (keys) {
            keys.forEach((key: ColKey) => {
                const column = columnLookupCallback(key);
                if (column) {
                    foundColumns.push(column);
                }
            });
        }

        return foundColumns;
    }

    // used by growGroupPanel
    public getColumnWithValidation(key: Maybe<ColKey>): Column | null {
        if (key == null) { return null; }

        const column = this.getGridColumn(key);

        if (!column) {
            console.warn('AG Grid: could not find column ' + key);
        }

        return column;
    }

    public getPrimaryColumn(key: ColKey): Column | null {
        if (!this.primaryColumns) { return null; }

        return this.getColumn(key, this.primaryColumns, this.primaryColumnsMap);
    }

    public getGridColumn(key: ColKey): Column | null {
        return this.getColumn(key, this.gridColumns, this.gridColumnsMap);
    }

    public lookupGridColumn(key: string) {
        return this.gridColumnsMap[key];
    }

    public getSecondaryColumn(key: ColKey): Column | null {
        return null; 
    }

    private getColumn(key: ColKey, columnList: Column[], columnMap: { [id: string]: Column }): Column | null {
        if (!key || !columnMap) { return null; }

        // most of the time this method gets called the key is a string, so we put this shortcut in
        // for performance reasons, to see if we can match for ID (it doesn't do auto columns, that's done below)
        if (typeof key == 'string' && columnMap[key]) {
            return columnMap[key];
        }

        for (let i = 0; i < columnList.length; i++) {
            if (this.columnsMatch(columnList[i], key)) {
                return columnList[i];
            }
        }

        return this.getAutoColumn(key);
    }

    public getSourceColumnsForGroupColumn(groupCol: Column): Column[] | null {
        const sourceColumnId = groupCol.getColDef().showRowGroup;
        if (!sourceColumnId) {
            return null;
        }

        if (sourceColumnId === true) {
            return this.rowGroupColumns.slice(0);
        }

        const column = this.getPrimaryColumn(sourceColumnId);
        return column ? [column] : null;
    }

    private getAutoColumn(key: ColKey): Column | null {
        if (
            !this.groupAutoColumns ||
            !exists(this.groupAutoColumns) ||
            missing(this.groupAutoColumns)
        ) { return null; }

        return this.groupAutoColumns.find(groupCol => this.columnsMatch(groupCol, key)) || null;
    }

    private columnsMatch(column: Column, key: ColKey): boolean {
        const columnMatches = column === key;
        const colDefMatches = column.getColDef() === key;
        const idMatches = column.getColId() == key;

        return columnMatches || colDefMatches || idMatches;
    }

    public getDisplayNameForColumn(column: Column | null, location: HeaderLocation, includeAggFunc = false): string | null {
        if (!column) { return null; }

        const headerName: string | null = this.getHeaderName(column.getColDef(), column, null, null, location);

        return headerName;
    }

    public getDisplayNameForProvidedColumnGroup(
        columnGroup: ColumnGroup | null,
        providedColumnGroup: ProvidedColumnGroup | null,
        location: HeaderLocation
    ): string | null {
        const colGroupDef = providedColumnGroup ? providedColumnGroup.getColGroupDef() : null;

        if (colGroupDef) {
            return this.getHeaderName(colGroupDef, null, columnGroup, providedColumnGroup, location);
        }

        return null;
    }

    public getDisplayNameForColumnGroup(columnGroup: ColumnGroup, location: HeaderLocation): string | null {
        return this.getDisplayNameForProvidedColumnGroup(columnGroup, columnGroup.getProvidedColumnGroup(), location);
    }

    // location is where the column is going to appear, ie who is calling us
    private getHeaderName(
        colDef: AbstractColDef,
        column: Column | null,
        columnGroup: ColumnGroup | null,
        providedColumnGroup: ProvidedColumnGroup | null,
        location: HeaderLocation
    ): string | null {
        const headerValueGetter = colDef.headerValueGetter;

        if (headerValueGetter) {
            const params: HeaderValueGetterParams = this.gos.addGridCommonParams({
                colDef: colDef,
                column: column,
                columnGroup: columnGroup,
                providedColumnGroup: providedColumnGroup,
                location: location
            });

            if (typeof headerValueGetter === 'function') {
                // valueGetter is a function, so just call it
                return headerValueGetter(params);
            }
            console.warn('AG Grid: headerValueGetter must be a function or a string');
            return '';
        } else if (colDef.headerName != null) {
            return colDef.headerName;
        } else if ((colDef as ColDef).field) {
            return camelCaseToHumanText((colDef as ColDef).field);
        }

        return '';
    }

    // returns the group with matching colId and instanceId. If instanceId is missing,
    // matches only on the colId.
    public getColumnGroup(colId: string | ColumnGroup, partId?: number): ColumnGroup | null {
        if (!colId) { return null; }
        if (colId instanceof ColumnGroup) { return colId; }

        const allColumnGroups = this.getAllDisplayedTrees();
        const checkPartId = typeof partId === 'number';
        let result: ColumnGroup | null = null;

        depthFirstAllColumnTreeSearch(allColumnGroups, false, (child: IHeaderColumn) => {
            if (child instanceof ColumnGroup) {
                const columnGroup = child;
                let matched: boolean;

                if (checkPartId) {
                    matched = colId === columnGroup.getGroupId() && partId === columnGroup.getPartId();
                } else {
                    matched = colId === columnGroup.getGroupId();
                }

                if (matched) {
                    result = columnGroup;
                }
            }
        });

        return result;
    }

    public isReady(): boolean {
        return this.ready;
    }


    public getColumnGroupState(): { groupId: string, open: boolean; }[] {
        const columnGroupState: { groupId: string, open: boolean; }[] = [];

        depthFirstOriginalTreeSearch(null, this.gridBalancedTree, node => {
            if (node instanceof ProvidedColumnGroup) {
                columnGroupState.push({
                    groupId: node.getGroupId(),
                    open: node.isExpanded()
                });
            }
        });

        return columnGroupState;
    }

    public getProvidedColumnGroup(key: string): ProvidedColumnGroup | null {
        // if (key instanceof ProvidedColumnGroup) { return key; }

        if (typeof key !== 'string') {
            console.error('AG Grid: group key must be a string');
        }

        // otherwise, search for the column group by id
        let res: ProvidedColumnGroup | null = null;

        depthFirstOriginalTreeSearch(null, this.gridBalancedTree, node => {
            if (node instanceof ProvidedColumnGroup) {
                if (node.getId() === key) {
                    res = node;
                }
            }
        });

        return res;
    }

    private calculateColumnsForDisplay(): Column[] {
        let columnsForDisplay: Column[];


            // otherwise continue as normal. this can be working on the primary
            // or secondary columns, whatever the gridColumns are set to
            columnsForDisplay = this.gridColumns.filter(column => {
                // keep col if a) it's auto-group or b) it's visible
                const isAutoGroupCol = this.groupAutoColumns && includes(this.groupAutoColumns, column);
                return isAutoGroupCol || column.isVisible();
            });

        return columnsForDisplay;
    }

    private calculateColumnsForGroupDisplay(): void {
        this.groupDisplayColumns = [];
        this.groupDisplayColumnsMap = {};

        const checkFunc = (col: Column) => {
            const colDef = col.getColDef();
            const underlyingColumn = colDef.showRowGroup;
            if (colDef && exists(underlyingColumn)) {
                this.groupDisplayColumns.push(col);

                if (typeof underlyingColumn === 'string') {
                    this.groupDisplayColumnsMap[underlyingColumn] = col;
                } else if (underlyingColumn === true) {
                    this.getRowGroupColumns().forEach(rowGroupCol => {
                        this.groupDisplayColumnsMap[rowGroupCol.getId()] = col;
                    });
                }
            }
        };

        this.gridColumns.forEach(checkFunc);
    }

    public getGroupDisplayColumns(): Column[] {
        return this.groupDisplayColumns;
    }

    public getGroupDisplayColumnForGroup(rowGroupColumnId: string): Column | undefined {
        return this.groupDisplayColumnsMap[rowGroupColumnId];
    }

    private updateDisplayedColumns(source: ColumnEventType): void {
        const columnsForDisplay = this.calculateColumnsForDisplay();

        this.buildDisplayedTrees(columnsForDisplay);

        // also called when group opened/closed
        this.updateGroupsAndDisplayedColumns(source);

    }

    public isSecondaryColumnsPresent(): boolean {
        return false;
    }

    // called from: applyColumnState, setColumnDefs, setSecondaryColumns
    private updateGridColumns(): void {
        const prevGridCols = this.gridBalancedTree;
        if (this.gridColsArePrimary) {
            this.lastPrimaryOrder = this.gridColumns;
        } else {
        }
        let sortOrderToRecover: Column[] | undefined;

       if (this.primaryColumns) {
            this.gridBalancedTree = this.primaryColumnTree.slice();
            this.gridHeaderRowCount = this.primaryHeaderRowCount;
            this.gridColumns = this.primaryColumns.slice();
            this.gridColsArePrimary = true;

            // updateGridColumns gets called after user adds a row group. we want to maintain the order of the columns
            // when this happens (eg if user moved a column) rather than revert back to the original column order.
            // likewise if changing in/out of pivot mode, we want to maintain the order of the cols
            sortOrderToRecover = this.lastPrimaryOrder;
        }

        this.orderGridColsLike(sortOrderToRecover);

        this.calculateColumnsForGroupDisplay();
        this.clearDisplayedAndViewportColumns();

        this.gridColumnsMap = {};
        this.gridColumns.forEach(col => this.gridColumnsMap[col.getId()] = col);

        if (!areEqual(prevGridCols, this.gridBalancedTree)) {
            const event: WithoutGridCommon<GridColumnsChangedEvent> = {
                type: Events.EVENT_GRID_COLUMNS_CHANGED
            };
            this.eventService.dispatchEvent(event);
        }
    }

    private orderGridColsLike(colsOrder: Column[] | undefined): void {
        if (missing(colsOrder)) { return; }

        const lastOrderMapped = convertToMap<Column, number>(colsOrder.map((col, index) => [col, index]));

        // only do the sort if at least one column is accounted for. columns will be not accounted for
        // if changing from secondary to primary columns
        let noColsFound = true;
        this.gridColumns.forEach(col => {
            if (lastOrderMapped.has(col)) {
                noColsFound = false;
            }
        });

        if (noColsFound) { return; }

        // order cols in the same order as before. we need to make sure that all
        // cols still exists, so filter out any that no longer exist.
        const gridColsMap = convertToMap<Column, boolean>(this.gridColumns.map(col => [col, true]));
        const oldColsOrdered = colsOrder.filter(col => gridColsMap.has(col));
        const oldColsMap = convertToMap<Column, boolean>(oldColsOrdered.map(col => [col, true]));
        const newColsOrdered = this.gridColumns.filter(col => !oldColsMap.has(col));

        // add in the new columns, at the end (if no group), or at the end of the group (if a group)
        const newGridColumns = oldColsOrdered.slice();

        newColsOrdered.forEach(newCol => {
            let parent = newCol.getOriginalParent();

            // if no parent, means we are not grouping, so just add the column to the end
            if (!parent) {
                newGridColumns.push(newCol);
                return;
            }

            // find the group the column belongs to. if no siblings at the current level (eg col in group on it's
            // own) then go up one level and look for siblings there.
            const siblings: Column[] = [];
            while (!siblings.length && parent) {
                const leafCols = parent.getLeafColumns();
                leafCols.forEach(leafCol => {
                    const presentInNewGriColumns = newGridColumns.indexOf(leafCol) >= 0;
                    const noYetInSiblings = siblings.indexOf(leafCol) < 0;
                    if (presentInNewGriColumns && noYetInSiblings) {
                        siblings.push(leafCol);
                    }
                });
                parent = parent.getOriginalParent();
            }

            // if no siblings exist at any level, this means the col is in a group (or parent groups) on it's own
            if (!siblings.length) {
                newGridColumns.push(newCol);
                return;
            }

            // find index of last column in the group
            const indexes = siblings.map(col => newGridColumns.indexOf(col));
            const lastIndex = Math.max(...indexes);

            insertIntoArray(newGridColumns, newCol, lastIndex + 1);
        });

        this.gridColumns = newGridColumns;
    }

    public isPrimaryColumnGroupsPresent(): boolean {
        return this.primaryHeaderRowCount > 1;
    }

    // gets called after we copy down grid columns, to make sure any part of the gui
    // that tries to draw, eg the header, it will get empty lists of columns rather
    // than stale columns. for example, the header will received gridColumnsChanged
    // event, so will try and draw, but it will draw successfully when it acts on the
    // virtualColumnsChanged event
    private clearDisplayedAndViewportColumns(): void {
        this.viewportRowLeft = {};
        this.viewportRowRight = {};
        this.viewportRowCenter = {};

        this.displayedColumnsCenter = [];
        this.displayedColumns = [];
        this.ariaOrderColumns = [];
        this.viewportColumns = [];
        this.headerViewportColumns = [];
        this.viewportColumnsHash = '';
    }

    private updateGroupsAndDisplayedColumns(source: ColumnEventType) {

        this.updateOpenClosedVisibilityInColumnGroups();
        this.deriveDisplayedColumns(source);
        this.extractViewport();
        this.updateBodyWidths();
        // this event is picked up by the gui, headerRenderer and rowRenderer, to recalculate what columns to display

        const event: WithoutGridCommon<DisplayedColumnsChangedEvent> = {
            type: Events.EVENT_DISPLAYED_COLUMNS_CHANGED
        };
        this.eventService.dispatchEvent(event);
    }

    private deriveDisplayedColumns(source: ColumnEventType): void {
        this.derivedDisplayedColumnsFromDisplayedTree(this.displayedTreeCentre, this.displayedColumnsCenter);
        this.joinColumnsAriaOrder();
        this.joinDisplayedColumns();
        this.setLeftValues(source);
        this.displayedAutoHeightCols = this.displayedColumns.filter(col => col.isAutoHeight());
    }

    public isAutoRowHeightActive(): boolean {
        return this.autoHeightActive;
    }

    public wasAutoRowHeightEverActive(): boolean {
        return this.autoHeightActiveAtLeastOnce;
    }

    private joinColumnsAriaOrder(): void {
        const allColumns = this.getAllGridColumns();
        const pinnedLeft: Column[] = [];
        const center: Column[] = [];
        const pinnedRight: Column[] = [];

        for (const col of allColumns) {
            const pinned = col.getPinned();
            if (!pinned) {
                center.push(col);
            } else if (pinned === true || pinned === 'left') {
                pinnedLeft.push(col);
            } else {
                pinnedRight.push(col);
            }
        }

        this.ariaOrderColumns = pinnedLeft.concat(center).concat(pinnedRight);
    }

    private joinDisplayedColumns(): void {
        this.displayedColumns = this.displayedColumnsCenter;
       
    }

    // sets the left pixel position of each column
    private setLeftValues(source: ColumnEventType): void {
        this.setLeftValuesOfColumns(source);
    }

    private setLeftValuesOfColumns(source: ColumnEventType): void {
        if (!this.primaryColumns) { return; }

        // go through each list of displayed columns
        const allColumns = this.getPrimaryAndSecondaryAndAutoColumns().slice(0);

        // let totalColumnWidth = this.getWidthOfColsInList()
        const doingRtl = this.gos.get('enableRtl');

        [
            this.displayedColumnsCenter
        ].forEach(columns => {
            if (doingRtl) {
                // when doing RTL, we start at the top most pixel (ie RHS) and work backwards
                let left = this.getWidthOfColsInList(columns);
                columns.forEach(column => {
                    left -= column.getActualWidth();
                    column.setLeft(left, source);
                });
            } else {
                // otherwise normal LTR, we start at zero
                let left = 0;
                columns.forEach(column => {
                    column.setLeft(left, source);
                    left += column.getActualWidth();
                });
            }
            removeAllFromUnorderedArray(allColumns, columns);
        });

        // items left in allColumns are columns not displayed, so remove the left position. this is
        // important for the rows, as if a col is made visible, then taken out, then made visible again,
        // we don't want the animation of the cell floating in from the old position, whatever that was.
        allColumns.forEach((column: Column) => {
            column.setLeft(null, source);
        });
    }

    private derivedDisplayedColumnsFromDisplayedTree(tree: IHeaderColumn[], columns: Column[]): void {
        columns.length = 0;
        depthFirstAllColumnTreeSearch(tree, true, (child: IHeaderColumn) => {
            if (child instanceof Column) {
                columns.push(child);
            }
        });
    }

    private isColumnVirtualisationSuppressed(){
        // When running within jsdom the viewportRight is always 0, so we need to return true to allow
        // tests to validate all the columns.
        return this.suppressColumnVirtualisation || this.viewportRight === 0;
    }

    private extractViewportColumns(): void {
        if (this.isColumnVirtualisationSuppressed()) {
            // no virtualisation, so don't filter
            this.viewportColumnsCenter = this.displayedColumnsCenter;
            this.headerViewportColumnsCenter = this.displayedColumnsCenter;
        } else {
            // filter out what should be visible
            this.viewportColumnsCenter = this.displayedColumnsCenter.filter(this.isColumnInRowViewport.bind(this));
            this.headerViewportColumnsCenter = this.displayedColumnsCenter.filter(this.isColumnInHeaderViewport.bind(this));
        }

        this.viewportColumns = this.viewportColumnsCenter;

        this.headerViewportColumns = this.headerViewportColumnsCenter;
    }

    public getVirtualHeaderGroupRow(type: ColumnPinnedType, dept: number): IHeaderColumn[] {
        let result: IHeaderColumn[];

        switch (type) {
            case 'left':
                result = this.viewportRowLeft[dept];
                break;
            case 'right':
                result = this.viewportRowRight[dept];
                break;
            default:
                result = this.viewportRowCenter[dept];
                break;
        }

        if (missing(result)) {
            result = [];
        }

        return result;
    }

    private calculateHeaderRows(): void {

        // go through each group, see if any of it's cols are displayed, and if yes,
        // then this group is included
        this.viewportRowLeft = {};
        this.viewportRowRight = {};
        this.viewportRowCenter = {};

        // for easy lookup when building the groups.
        const virtualColIds: { [key: string]: boolean; } = {};
        this.headerViewportColumns.forEach(col => virtualColIds[col.getId()] = true);

        const testGroup = (
            children: IHeaderColumn[],
            result: { [row: number]: IHeaderColumn[]; },
            dept: number): boolean => {

            let returnValue = false;

            for (let i = 0; i < children.length; i++) {
                // see if this item is within viewport
                const child = children[i];
                let addThisItem = false;

                if (child instanceof Column) {
                    // for column, test if column is included
                    addThisItem = virtualColIds[child.getId()] === true;
                } else {
                    // if group, base decision on children
                    const columnGroup = child as ColumnGroup;
                    const displayedChildren = columnGroup.getDisplayedChildren();

                    if (displayedChildren) {
                        addThisItem = testGroup(displayedChildren, result, dept + 1);
                    }
                }

                if (addThisItem) {
                    returnValue = true;
                    if (!result[dept]) {
                        result[dept] = [];
                    }
                    result[dept].push(child);
                }
            }
            return returnValue;
        };

        testGroup(this.displayedTreeCentre, this.viewportRowCenter, 0);
    }

    private extractViewport(): boolean {
        const hashColumn = (c: Column) => `${c.getId()}-${c.getPinned() || 'normal'}`;

        this.extractViewportColumns();
        const newHash = this.viewportColumns.map(hashColumn).join('#');
        const changed = this.viewportColumnsHash !== newHash;

        if (changed) {
            this.viewportColumnsHash = newHash;
            this.calculateHeaderRows();
        }

        return changed;
    }

    private buildDisplayedTrees(visibleColumns: Column[]) {

        this.displayedTreeCentre = visibleColumns;

        this.updateDisplayedMap();
    }

    private updateDisplayedMap(): void {
        this.displayedColumnsAndGroupsMap = {};

        const func = (child: IHeaderColumn) => {
            this.displayedColumnsAndGroupsMap[child.getUniqueId()] = child;
        };

        depthFirstAllColumnTreeSearch(this.displayedTreeCentre, false, func);
    }

    public isDisplayed(item: IHeaderColumn): boolean {
        const fromMap = this.displayedColumnsAndGroupsMap[item.getUniqueId()];
        // check for reference, in case new column / group with same id is now present
        return fromMap === item;
    }

    private updateOpenClosedVisibilityInColumnGroups(): void {
        const allColumnGroups = this.getAllDisplayedTrees();

        depthFirstAllColumnTreeSearch(allColumnGroups, false, child => {
            if (child instanceof ColumnGroup) {
                child.calculateDisplayedColumns();
            }
        });
    }

    public getGroupAutoColumns(): Column[] | null {
        return this.groupAutoColumns;
    }



    public isGroupSuppressAutoColumn() {
        const groupDisplayType = this.gos.get('groupDisplayType');
        const isCustomRowGroups = groupDisplayType === 'custom';
        if (isCustomRowGroups) { return true; }
    
        const treeDataDisplayType = this.gos.get('treeDataDisplayType');
        return treeDataDisplayType === 'custom';
    }

    private getWidthOfColsInList(columnList: Column[]) {
        return columnList.reduce((width, col) => width + col.getActualWidth(), 0);
    }

    public getFirstDisplayedColumn(): Column | null {
        const isRtl = this.gos.get('enableRtl');
        const queryOrder: ( 'getDisplayedCenterColumns')[] = [
            'getDisplayedCenterColumns',
        ];

        if (isRtl) {
            queryOrder.reverse();
        }

        for (let i = 0; i < queryOrder.length; i++) {
            const container = this[queryOrder[i]]();
            if (container.length) {
                return isRtl ? last(container) : container[0];
            }
        }

        return null;
    }

    public setColumnHeaderHeight(col: Column, height: number): void {
        const changed = col.setAutoHeaderHeight(height);

        if (changed) {
            const event: WithoutGridCommon<ColumnEvent> = {
                type: Events.EVENT_COLUMN_HEADER_HEIGHT_CHANGED,
                column: col,
                columns: [col],
                source: 'autosizeColumnHeaderHeight',
            };
            this.eventService.dispatchEvent(event);
        }
    }

    public getColumnGroupHeaderRowHeight(): number {
        if (this.isPivotMode()) {
            return this.getPivotGroupHeaderHeight() as number;
        }
        return this.getGroupHeaderHeight() as number;
    }

    public getColumnHeaderRowHeight(): number {
        const defaultHeight: number = (this.isPivotMode() ?
            this.getPivotHeaderHeight() :
            this.getHeaderHeight()) as number;

        const displayedHeights = this.getAllDisplayedColumns()
            .filter((col) => col.isAutoHeaderHeight())
            .map((col) => col.getAutoHeaderHeight() || 0);

        return Math.max(defaultHeight, ...displayedHeights);
    }

    public getHeaderHeight(): number {
        return this.gos.get('headerHeight') ?? this.environment.getFromTheme(25, 'headerHeight');
    }
    public getFloatingFiltersHeight(): number {
        return this.gos.get('floatingFiltersHeight') ?? this.getHeaderHeight();
    }
    public getGroupHeaderHeight(): number {
        return this.gos.get('groupHeaderHeight') ?? this.getHeaderHeight();
    }
    private getPivotHeaderHeight(): number {
        return this.gos.get('pivotHeaderHeight') ?? this.getHeaderHeight();
    }
    public getPivotGroupHeaderHeight(): number {
        return this.gos.get('pivotGroupHeaderHeight') ?? this.getGroupHeaderHeight();
    }

    public queueResizeOperations(): void {
        this.shouldQueueResizeOperations = true;
    }

    public processResizeOperations(): void {
        this.shouldQueueResizeOperations = false;
        this.resizeOperationQueue.forEach(resizeOperation => resizeOperation());
        this.resizeOperationQueue = [];
    }

    public resetColumnDefIntoColumn(column: Column, source: ColumnEventType): boolean {
        const userColDef = column.getUserProvidedColDef();
        if (!userColDef) { return false; }
        const newColDef = this.columnFactory.addColumnDefaultAndTypes(userColDef, column.getColId());
        column.setColDef(newColDef, userColDef, source);
        return true;
    }

    public isColumnGroupingLocked(column: Column): boolean {
        const groupLockGroupColumns = this.gos.get('groupLockGroupColumns');
        if (!column.isRowGroupActive() || groupLockGroupColumns === 0) {
            return false;
        }

        if (groupLockGroupColumns === -1) {
            return true;
        }

        const colIndex = this.rowGroupColumns.findIndex(groupCol => groupCol.getColId() === column.getColId());
        return groupLockGroupColumns > colIndex;
    }

    private onFirstDataRendered(): void {
        const autoSizeStrategy = this.gos.get('autoSizeStrategy');
        if (autoSizeStrategy?.type !== 'fitCellContents') { return; }

       
    }
}

export function convertSourceType(source: PropertyChangedSource): ColumnEventType {
    // unfortunately they do not match so need to perform conversion
    return source === 'gridOptionsUpdated' ? 'gridOptionsChanged' : source;
}

function depthFirstAllColumnTreeSearch(
    tree: IHeaderColumn[] | null,
    useDisplayedChildren: boolean,
    callback: (treeNode: IHeaderColumn) => void
): void {
    if (!tree) {
        return;
    }

    for (let i = 0; i < tree.length; i++) {
        const child = tree[i];
        if (child instanceof ColumnGroup) {
            const childTree = useDisplayedChildren ? child.getDisplayedChildren() : child.getChildren();
            depthFirstAllColumnTreeSearch(childTree, useDisplayedChildren, callback);
        }
        callback(child);
    }
}