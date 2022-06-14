import { ColumnGroup } from '../entities/columnGroup';
import { Column } from '../entities/column';
import { AbstractColDef, ColDef, ColGroupDef, IAggFunc, HeaderValueGetterParams } from '../entities/colDef';
import { IHeaderColumn } from '../entities/iHeaderColumn';
import { ExpressionService } from '../valueService/expressionService';
import { ColumnFactory } from './columnFactory';
import { DisplayedGroupCreator } from './displayedGroupCreator';
import { AutoWidthCalculator } from '../rendering/autoWidthCalculator';
import { IProvidedColumn } from '../entities/iProvidedColumn';
import { ColumnUtils } from './columnUtils';
import { Logger, LoggerFactory } from '../logger';
import {
    ColumnEvent,
    ColumnEventType,
    ColumnEverythingChangedEvent,
    ColumnGroupOpenedEvent,
    ColumnMovedEvent,
    ColumnPinnedEvent,
    ColumnPivotModeChangedEvent,
    ColumnResizedEvent,
    ColumnRowGroupChangedEvent,
    ColumnValueChangedEvent,
    ColumnVisibleEvent,
    DisplayedColumnsChangedEvent,
    DisplayedColumnsWidthChangedEvent,
    Events,
    GridColumnsChangedEvent,
    NewColumnsLoadedEvent,
    VirtualColumnsChangedEvent
} from '../events';
import { BeanStub } from "../context/beanStub";
import { ProvidedColumnGroup } from '../entities/providedColumnGroup';
import { GroupInstanceIdCreator } from './groupInstanceIdCreator';
import { Autowired, Bean, Optional, PostConstruct, Qualifier } from '../context/context';
import { IAggFuncService } from '../interfaces/iAggFuncService';
import { ColumnAnimationService } from '../rendering/columnAnimationService';
import { AutoGroupColService } from './autoGroupColService';
import { RowNode } from '../entities/rowNode';
import { ValueCache } from '../valueService/valueCache';
import { GridApi } from '../gridApi';
import { ColumnApi } from './columnApi';
import { Constants } from '../constants/constants';
import { areEqual, last, removeFromArray, moveInArray, includes, insertIntoArray, removeAllFromArray } from '../utils/array';
import { AnimationFrameService } from "../misc/animationFrameService";
import { SortController } from "../sortController";
import { missingOrEmpty, exists, missing, attrToBoolean, attrToNumber } from '../utils/generic';
import { camelCaseToHumanText } from '../utils/string';
import { ColumnDefFactory } from "./columnDefFactory";
import { IRowModel } from "../interfaces/iRowModel";
import { IClientSideRowModel } from "../interfaces/iClientSideRowModel";
import { convertToMap } from '../utils/map';
import { doOnce } from '../utils/function';
import { CtrlsService } from '../ctrlsService';
import { HeaderGroupCellCtrl } from '../headerRendering/cells/columnGroup/headerGroupCellCtrl';

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
    pinned?: boolean | string | 'left' | 'right' | null;
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

@Bean('columnModel')
export class ColumnModel extends BeanStub {

    @Autowired('expressionService') private expressionService: ExpressionService;
    @Autowired('columnFactory') private columnFactory: ColumnFactory;
    @Autowired('displayedGroupCreator') private displayedGroupCreator: DisplayedGroupCreator;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;
    @Autowired('autoWidthCalculator') private autoWidthCalculator: AutoWidthCalculator;
    @Autowired('columnUtils') private columnUtils: ColumnUtils;
    @Autowired('columnAnimationService') private columnAnimationService: ColumnAnimationService;
    @Autowired('autoGroupColService') private autoGroupColService: AutoGroupColService;
    @Optional('aggFuncService') private aggFuncService: IAggFuncService;
    @Optional('valueCache') private valueCache: ValueCache;
    @Optional('animationFrameService') private animationFrameService: AnimationFrameService;

    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('columnDefFactory') private columnDefFactory: ColumnDefFactory;

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

    // if pivoting, these are the generated columns as a result of the pivot
    private secondaryBalancedTree: IProvidedColumn[] | null;
    private secondaryColumns: Column[] | null;
    private secondaryColumnsMap: { [id: string]: Column };
    private secondaryHeaderRowCount = 0;
    // Saved when pivot is disabled, available to re-use when pivot is restored
    private previousSecondaryColumns: IProvidedColumn[] | null;

    // the columns the quick filter should use. this will be all primary columns
    // plus the autoGroupColumns if any exist
    private columnsForQuickFilter: Column[];

    // these are all columns that are available to the grid for rendering after pivot
    private gridBalancedTree: IProvidedColumn[];
    private gridColumns: Column[];
    private gridColumnsMap: { [id: string]: Column };

    // header row count, either above, or based on pivoting if we are pivoting
    private gridHeaderRowCount = 0;

    private lastPrimaryOrder: Column[];
    private lastSecondaryOrder: Column[];
    private gridColsArePrimary: boolean;

    // primary columns -> what the user provides
    // secondary columns -> columns generated as a result of a pivot
    // displayed columns -> columns that are 1) visible and 2) parent groups are opened. thus can be rendered
    // viewport columns -> centre columns only, what columns are to be rendered due to column virtualisation

    // tree of columns to be displayed for each section
    private displayedTreeLeft: IHeaderColumn[];
    private displayedTreeRight: IHeaderColumn[];
    private displayedTreeCentre: IHeaderColumn[];

    // leave level columns of the displayed trees
    private displayedColumnsLeft: Column[] = [];
    private displayedColumnsRight: Column[] = [];
    private displayedColumnsCenter: Column[] = [];
    // all three lists above combined
    private displayedColumns: Column[] = [];

    // for fast lookup, to see if a column or group is still displayed
    private displayedColumnsAndGroupsMap: { [id: string]: IHeaderColumn } = {};

    // all columns to be rendered
    private viewportColumns: Column[] = [];
    // all columns to be rendered in the centre
    private viewportColumnsCenter: Column[] = [];

    // all columns & groups to be rendered, index by row. used by header rows to get all items
    // to render for that row.
    private viewportRowLeft: { [row: number]: IHeaderColumn[]; };
    private viewportRowRight: { [row: number]: IHeaderColumn[]; };
    private viewportRowCenter: { [row: number]: IHeaderColumn[]; };

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
    private logger: Logger;

    private autoGroupsNeedBuilding = false;
    private forceRecreateAutoGroups = false;

    private pivotMode = false;
    private usingTreeData: boolean;

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

    private columnDefs: (ColDef | ColGroupDef)[];

    private colDefVersion = 0;

    private flexColsCalculatedAtLestOnce = false;

    @PostConstruct
    public init(): void {
        this.suppressColumnVirtualisation = this.gridOptionsWrapper.isSuppressColumnVirtualisation();

        const pivotMode = this.gridOptionsWrapper.isPivotMode();

        if (this.isPivotSettingAllowed(pivotMode)) {
            this.pivotMode = pivotMode;
        }

        this.usingTreeData = this.gridOptionsWrapper.isTreeData();

        this.addManagedListener(this.gridOptionsWrapper, 'autoGroupColumnDef', () => this.onAutoGroupColumnDefChanged());
        this.addManagedListener(this.gridOptionsWrapper, 'defaultColDef', () => this.onDefaultColDefChanged());
    }

    public onAutoGroupColumnDefChanged() {
        this.autoGroupsNeedBuilding = true;
        this.forceRecreateAutoGroups = true;
        this.updateGridColumns();
        this.updateDisplayedColumns('gridOptionsChanged');
    }

    public onDefaultColDefChanged(): void {
        // col def's should get revisited, even if specific column hasn't changed,
        // as the defaultColDef impacts all columns, so each column should assume it's Col Def has changed.
        this.colDefVersion++;
        // likewise for autoGroupCol, the default col def impacts this
        this.forceRecreateAutoGroups = true;
        this.createColumnsFromColumnDefs(true);
    }

    public getColDefVersion(): number {
        return this.colDefVersion;
    }

    public setColumnDefs(columnDefs: (ColDef | ColGroupDef)[], source: ColumnEventType = 'api') {
        const colsPreviouslyExisted = !!this.columnDefs;
        this.colDefVersion++;
        this.columnDefs = columnDefs;
        this.createColumnsFromColumnDefs(colsPreviouslyExisted, source);
    }

    private createColumnsFromColumnDefs(colsPreviouslyExisted: boolean, source: ColumnEventType = 'api'): void {

        // only need to raise before/after events if updating columns, never if setting columns for first time
        const raiseEventsFunc = colsPreviouslyExisted ? this.compareColumnStatesAndRaiseEvents(source) : undefined;

        // always invalidate cache on changing columns, as the column id's for the new columns
        // could overlap with the old id's, so the cache would return old values for new columns.
        this.valueCache.expire();

        // NOTE ==================
        // we should be destroying the existing columns and groups if they exist, for example, the original column
        // group adds a listener to the columns, it should be also removing the listeners
        this.autoGroupsNeedBuilding = true;

        const oldPrimaryColumns = this.primaryColumns;
        const oldPrimaryTree = this.primaryColumnTree;
        const balancedTreeResult = this.columnFactory.createColumnTree(this.columnDefs, true, oldPrimaryTree);

        this.primaryColumnTree = balancedTreeResult.columnTree;
        this.primaryHeaderRowCount = balancedTreeResult.treeDept + 1;

        this.primaryColumns = this.getColumnsFromTree(this.primaryColumnTree);
        this.primaryColumnsMap = {};
        this.primaryColumns.forEach(col => this.primaryColumnsMap[col.getId()] = col);

        this.extractRowGroupColumns(source, oldPrimaryColumns);
        this.extractPivotColumns(source, oldPrimaryColumns);
        this.extractValueColumns(source, oldPrimaryColumns);

        this.ready = true;

        // if we are showing secondary columns, then no need to update grid columns
        // at this point, as it's the pivot service responsibility to change these
        // if we are no longer pivoting (ie and need to revert back to primary, otherwise
        // we shouldn't be touching the primary).
        const gridColsNotProcessed = this.gridColsArePrimary === undefined;
        const processGridCols = this.gridColsArePrimary || gridColsNotProcessed;

        if (processGridCols) {
            this.updateGridColumns();
            if (colsPreviouslyExisted && !this.gridOptionsWrapper.isMaintainColumnOrder()) {
                this.orderGridColumnsLikePrimary();
            }
            this.updateDisplayedColumns(source);
            this.checkViewportColumns();
        }

        // this event is not used by AG Grid, but left here for backwards compatibility,
        // in case applications use it
        this.dispatchEverythingChanged(source);

        if (raiseEventsFunc) {
            raiseEventsFunc();
        }

        this.dispatchNewColumnsLoaded();
    }

    private dispatchNewColumnsLoaded(): void {
        const newColumnsLoadedEvent: NewColumnsLoadedEvent = {
            type: Events.EVENT_NEW_COLUMNS_LOADED,
            api: this.gridApi,
            columnApi: this.columnApi
        };

        this.eventService.dispatchEvent(newColumnsLoadedEvent);
    }

    // this event is legacy, no grid code listens to it. instead the grid listens to New Columns Loaded
    private dispatchEverythingChanged(source: ColumnEventType = 'api'): void {
        const eventEverythingChanged: ColumnEverythingChangedEvent = {
            type: Events.EVENT_COLUMN_EVERYTHING_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi,
            source
        };
        this.eventService.dispatchEvent(eventEverythingChanged);
    }

    private orderGridColumnsLikePrimary(): void {
        const primaryColumns = this.primaryColumns;

        if (!primaryColumns) { return; }

        this.gridColumns.sort((colA: Column, colB: Column) => {
            const primaryIndexA = primaryColumns.indexOf(colA);
            const primaryIndexB = primaryColumns.indexOf(colB);
            // if both cols are present in primary, then we just return the position,
            // so position is maintained.
            const indexAPresent = primaryIndexA >= 0;
            const indexBPresent = primaryIndexB >= 0;

            if (indexAPresent && indexBPresent) {
                return primaryIndexA - primaryIndexB;
            }

            if (indexAPresent) {
                // B is auto group column, so put B first
                return 1;
            }

            if (indexBPresent) {
                // A is auto group column, so put A first
                return -1;
            }

            // otherwise both A and B are auto-group columns. so we just keep the order
            // as they were already in.
            const gridIndexA = this.gridColumns.indexOf(colA);
            const gridIndexB = this.gridColumns.indexOf(colB);
            return gridIndexA - gridIndexB;
        });
    }

    public getAllDisplayedAutoHeightCols(): Column[] {
        return this.displayedAutoHeightCols;
    }

    private setViewport(): void {
        if (this.gridOptionsWrapper.isEnableRtl()) {
            this.viewportLeft = this.bodyWidth - this.scrollPosition - this.scrollWidth;
            this.viewportRight = this.bodyWidth - this.scrollPosition;
        } else {
            this.viewportLeft = this.scrollPosition;
            this.viewportRight = this.scrollWidth + this.scrollPosition;
        }
    }

    // used by clipboard service, to know what columns to paste into
    public getDisplayedColumnsStartingAt(column: Column): Column[] {
        let currentColumn: Column | null = column;
        const columns: Column[] = [];

        while (currentColumn != null) {
            columns.push(currentColumn);
            currentColumn = this.getDisplayedColAfter(currentColumn);
        }

        return columns;
    }

    // checks what columns are currently displayed due to column virtualisation. fires an event
    // if the list of columns has changed.
    // + setColumnWidth(), setViewportPosition(), setColumnDefs(), sizeColumnsToFit()
    private checkViewportColumns(): void {
        // check displayCenterColumnTree exists first, as it won't exist when grid is initialising
        if (this.displayedColumnsCenter == null) { return; }

        const hashBefore = this.viewportColumns.map(column => column.getId()).join('#');

        this.extractViewport();

        const hashAfter = this.viewportColumns.map(column => column.getId()).join('#');

        if (hashBefore !== hashAfter) {
            const event: VirtualColumnsChangedEvent = {
                type: Events.EVENT_VIRTUAL_COLUMNS_CHANGED,
                api: this.gridApi,
                columnApi: this.columnApi
            };

            this.eventService.dispatchEvent(event);
        }
    }

    public setViewportPosition(scrollWidth: number, scrollPosition: number): void {
        if (scrollWidth !== this.scrollWidth || scrollPosition !== this.scrollPosition || this.bodyWidthDirty) {
            this.scrollWidth = scrollWidth;
            this.scrollPosition = scrollPosition;
            // we need to call setVirtualViewportLeftAndRight() at least once after the body width changes,
            // as the viewport can stay the same, but in RTL, if body width changes, we need to work out the
            // virtual columns again
            this.bodyWidthDirty = true;
            this.setViewport();

            if (this.ready) {
                this.checkViewportColumns();
            }
        }
    }

    public isPivotMode(): boolean {
        return this.pivotMode;
    }

    private isPivotSettingAllowed(pivot: boolean): boolean {
        if (pivot && this.gridOptionsWrapper.isTreeData()) {
            console.warn("AG Grid: Pivot mode not available in conjunction Tree Data i.e. 'gridOptions.treeData: true'");
            return false;
        }

        return true;
    }

    public setPivotMode(pivotMode: boolean, source: ColumnEventType = 'api'): void {
        if (pivotMode === this.pivotMode || !this.isPivotSettingAllowed(this.pivotMode)) { return; }

        this.pivotMode = pivotMode;

        // we need to update grid columns to cover the scenario where user has groupSuppressAutoColumn=true, as
        // this means we don't use auto group column UNLESS we are in pivot mode (it's mandatory in pivot mode),
        // so need to updateGridColumn() to check it autoGroupCol needs to be added / removed
        this.autoGroupsNeedBuilding = true;
        this.updateGridColumns();
        this.updateDisplayedColumns(source);

        const event: ColumnPivotModeChangedEvent = {
            type: Events.EVENT_COLUMN_PIVOT_MODE_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };

        this.eventService.dispatchEvent(event);
    }

    public getSecondaryPivotColumn(pivotKeys: string[], valueColKey: Column | string): Column | null {
        if (missing(this.secondaryColumns)) { return null; }

        const valueColumnToFind = this.getPrimaryColumn(valueColKey);

        let foundColumn: Column | null = null;

        this.secondaryColumns.forEach(column => {
            const thisPivotKeys = column.getColDef().pivotKeys;
            const pivotValueColumn = column.getColDef().pivotValueColumn;

            const pivotKeyMatches = areEqual(thisPivotKeys, pivotKeys);
            const pivotValueMatches = pivotValueColumn === valueColumnToFind;

            if (pivotKeyMatches && pivotValueMatches) {
                foundColumn = column;
            }
        });

        return foundColumn;
    }

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('columnModel');
    }

    private setFirstRightAndLastLeftPinned(source: ColumnEventType): void {
        let lastLeft: Column | null;
        let firstRight: Column | null;

        if (this.gridOptionsWrapper.isEnableRtl()) {
            lastLeft = this.displayedColumnsLeft ? this.displayedColumnsLeft[0] : null;
            firstRight = this.displayedColumnsRight ? last(this.displayedColumnsRight) : null;
        } else {
            lastLeft = this.displayedColumnsLeft ? last(this.displayedColumnsLeft) : null;
            firstRight = this.displayedColumnsRight ? this.displayedColumnsRight[0] : null;
        }

        this.gridColumns.forEach((column: Column) => {
            column.setLastLeftPinned(column === lastLeft, source);
            column.setFirstRightPinned(column === firstRight, source);
        });
    }

    public autoSizeColumns(params: {
        columns: (string | Column)[];
        skipHeader?: boolean;
        skipHeaderGroups?: boolean;
        stopAtGroup?: ColumnGroup;
        source?: ColumnEventType;
    }): void {
        const { columns, skipHeader, skipHeaderGroups, stopAtGroup, source = 'api' } = params;
        // because of column virtualisation, we can only do this function on columns that are
        // actually rendered, as non-rendered columns (outside the viewport and not rendered
        // due to column virtualisation) are not present. this can result in all rendered columns
        // getting narrowed, which in turn introduces more rendered columns on the RHS which
        // did not get autosized in the original run, leaving the visible grid with columns on
        // the LHS sized, but RHS no. so we keep looping through the visible columns until
        // no more cols are available (rendered) to be resized

        // we autosize after animation frames finish in case any cell renderers need to complete first. this can
        // happen eg if client code is calling api.autoSizeAllColumns() straight after grid is initialised, but grid
        // hasn't fully drawn out all the cells yet (due to cell renderers in animation frames).
        this.animationFrameService.flushAllFrames();

        // keep track of which cols we have resized in here
        const columnsAutosized: Column[] = [];
        // initialise with anything except 0 so that while loop executes at least once
        let changesThisTimeAround = -1;

        const shouldSkipHeader = skipHeader != null ? skipHeader : this.gridOptionsWrapper.isSkipHeaderOnAutoSize();
        const shouldSkipHeaderGroups = skipHeaderGroups != null ? skipHeaderGroups : shouldSkipHeader;

        while (changesThisTimeAround !== 0) {
            changesThisTimeAround = 0;
            this.actionOnGridColumns(columns, (column: Column): boolean => {
                // if already autosized, skip it
                if (columnsAutosized.indexOf(column) >= 0) {
                    return false;
                }
                // get how wide this col should be
                const preferredWidth = this.autoWidthCalculator.getPreferredWidthForColumn(column, shouldSkipHeader);
                // preferredWidth = -1 if this col is not on the screen
                if (preferredWidth > 0) {
                    const newWidth = this.normaliseColumnWidth(column, preferredWidth);
                    column.setActualWidth(newWidth, source);
                    columnsAutosized.push(column);
                    changesThisTimeAround++;
                }
                return true;
            }, source);
        }

        if (!shouldSkipHeaderGroups) {
            this.autoSizeColumnGroupsByColumns(columns, stopAtGroup);
        }

        this.fireColumnResizedEvent(columnsAutosized, true, 'autosizeColumns');
    }

    public fireColumnResizedEvent(columns: Column[] | null, finished: boolean, source: ColumnEventType, flexColumns: Column[] | null = null): void {
        if (columns && columns.length) {
            const event: ColumnResizedEvent = {
                type: Events.EVENT_COLUMN_RESIZED,
                columns: columns,
                column: columns.length === 1 ? columns[0] : null,
                flexColumns: flexColumns,
                finished: finished,
                api: this.gridApi,
                columnApi: this.columnApi,
                source: source
            };
            this.eventService.dispatchEvent(event);
        }
    }

    public autoSizeColumn(key: string | Column | null, skipHeader?: boolean, source: ColumnEventType = "api"): void {
        if (key) {
            this.autoSizeColumns({ columns: [key], skipHeader, skipHeaderGroups: true, source });
        }
    }

    private autoSizeColumnGroupsByColumns(keys: (string | Column)[], stopAtGroup?: ColumnGroup): Column[] {
        const columnGroups: Set<ColumnGroup> = new Set();
        const columns = this.getGridColumns(keys);

        columns.forEach(col => {
            let parent: ColumnGroup = col.getParent();
            while (parent && parent != stopAtGroup) {
                if (!parent.isPadding()) {
                    columnGroups.add(parent);
                }
                parent = parent.getParent();
            }
        });

        let headerGroupCtrl: HeaderGroupCellCtrl | undefined;

        const resizedColumns: Column[] = [];

        for (const columnGroup of columnGroups) {
            for (const headerContainerCtrl of this.ctrlsService.getHeaderRowContainerCtrls()) {
                headerGroupCtrl = headerContainerCtrl.getHeaderCtrlForColumn(columnGroup);
                if (headerGroupCtrl) { break; }
            }
            if (headerGroupCtrl) {
                headerGroupCtrl.resizeLeafColumnsToFit();
            }
        }

        return resizedColumns;
    }

    public autoSizeAllColumns(skipHeader?: boolean, source: ColumnEventType = "api"): void {
        const allDisplayedColumns = this.getAllDisplayedColumns();
        this.autoSizeColumns({ columns: allDisplayedColumns, skipHeader, source });
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
        if (this.displayedTreeLeft && this.displayedTreeRight && this.displayedTreeCentre) {
            return this.displayedTreeLeft
                .concat(this.displayedTreeCentre)
                .concat(this.displayedTreeRight);
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
    public getDisplayedTreeLeft(): IHeaderColumn[] {
        return this.displayedTreeLeft;
    }

    // + headerRenderer -> setting pinned body width
    public getDisplayedTreeRight(): IHeaderColumn[] {
        return this.displayedTreeRight;
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

    public getDisplayedLeftColumnsForRow(rowNode: RowNode): Column[] {
        if (!this.colSpanActive) {
            return this.displayedColumnsLeft;
        }

        return this.getDisplayedColumnsForRow(rowNode, this.displayedColumnsLeft);
    }

    public getDisplayedRightColumnsForRow(rowNode: RowNode): Column[] {
        if (!this.colSpanActive) {
            return this.displayedColumnsRight;
        }

        return this.getDisplayedColumnsForRow(rowNode, this.displayedColumnsRight);
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
        const filterCallback = this.suppressColumnVirtualisation ? null : this.isColumnInViewport.bind(this);

        return this.getDisplayedColumnsForRow(
            rowNode,
            this.displayedColumnsCenter,
            filterCallback,
            emptySpaceBeforeColumn
        );
    }

    public getAriaColumnIndex(col: Column): number {
        return this.getAllGridColumns().indexOf(col) + 1;
    }

    private isColumnInViewport(col: Column): boolean {
        // we never filter out autoHeight columns, as we need them in the DOM for calculating Auto Height
        if (col.isAutoHeight()) { return true; }
        // likewise we never filter out autoHeaderHeight columns
        if (col.isAutoHeaderHeight()) { return true; }

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

    // used by:
    // + angularGrid -> setting pinned body width
    // note: this should be cached
    public getDisplayedColumnsLeftWidth() {
        return this.getWidthOfColsInList(this.displayedColumnsLeft);
    }

    // note: this should be cached
    public getDisplayedColumnsRightWidth() {
        return this.getWidthOfColsInList(this.displayedColumnsRight);
    }

    public updatePrimaryColumnList(
        keys: (string | Column)[] | null,
        masterList: Column[],
        actionIsAdd: boolean,
        columnCallback: (column: Column) => void,
        eventType: string,
        source: ColumnEventType = "api"
    ) {

        if (!keys || missingOrEmpty(keys)) { return; }

        let atLeastOne = false;

        keys.forEach(key => {
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

        const event: ColumnEvent = {
            type: eventType,
            columns: masterList,
            column: masterList.length === 1 ? masterList[0] : null,
            api: this.gridApi,
            columnApi: this.columnApi,
            source: source
        };

        this.eventService.dispatchEvent(event);
    }

    public setRowGroupColumns(colKeys: (string | Column)[], source: ColumnEventType = "api"): void {
        this.autoGroupsNeedBuilding = true;
        this.setPrimaryColumnList(colKeys, this.rowGroupColumns,
            Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
            this.setRowGroupActive.bind(this),
            source);
    }

    private setRowGroupActive(active: boolean, column: Column, source: ColumnEventType): void {
        if (active === column.isRowGroupActive()) { return; }

        column.setRowGroupActive(active, source);

        if (!active && !this.gridOptionsWrapper.isSuppressMakeColumnVisibleAfterUnGroup()) {
            this.setColumnVisible(column, true, source);
        }
    }

    public addRowGroupColumn(key: string | Column | null, source: ColumnEventType = "api"): void {
        if (key) { this.addRowGroupColumns([key], source); }
    }

    public addRowGroupColumns(keys: (string | Column)[], source: ColumnEventType = "api"): void {
        this.autoGroupsNeedBuilding = true;
        this.updatePrimaryColumnList(keys, this.rowGroupColumns, true,
            this.setRowGroupActive.bind(this, true),
            Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
            source
        );
    }

    public removeRowGroupColumns(keys: (string | Column)[] | null, source: ColumnEventType = "api"): void {
        this.autoGroupsNeedBuilding = true;
        this.updatePrimaryColumnList(keys, this.rowGroupColumns, false,
            this.setRowGroupActive.bind(this, false),
            Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
            source);
    }

    public removeRowGroupColumn(key: string | Column | null, source: ColumnEventType = "api"): void {
        if (key) { this.removeRowGroupColumns([key], source); }
    }

    public addPivotColumns(keys: (string | Column)[], source: ColumnEventType = "api"): void {
        this.updatePrimaryColumnList(keys, this.pivotColumns, true,
            column => column.setPivotActive(true, source),
            Events.EVENT_COLUMN_PIVOT_CHANGED, source);
    }

    public setPivotColumns(colKeys: (string | Column)[], source: ColumnEventType = "api"): void {
        this.setPrimaryColumnList(colKeys, this.pivotColumns, Events.EVENT_COLUMN_PIVOT_CHANGED,
            (added: boolean, column: Column) => {
                column.setPivotActive(added, source);
            }, source
        );
    }

    public addPivotColumn(key: string | Column, source: ColumnEventType = "api"): void {
        this.addPivotColumns([key], source);
    }

    public removePivotColumns(keys: (string | Column)[], source: ColumnEventType = "api"): void {
        this.updatePrimaryColumnList(
            keys,
            this.pivotColumns,
            false,
            column => column.setPivotActive(false, source),
            Events.EVENT_COLUMN_PIVOT_CHANGED,
            source
        );
    }

    public removePivotColumn(key: string | Column, source: ColumnEventType = "api"): void {
        this.removePivotColumns([key], source);
    }

    private setPrimaryColumnList(
        colKeys: (string | Column)[],
        masterList: Column[],
        eventName: string,
        columnCallback: (added: boolean, column: Column) => void,
        source: ColumnEventType
    ): void {

        masterList.length = 0;

        if (exists(colKeys)) {
            colKeys.forEach(key => {
                const column = this.getPrimaryColumn(key);
                if (column) {
                    masterList.push(column);
                }
            });
        }

        (this.primaryColumns || []).forEach(column => {
            const added = masterList.indexOf(column) >= 0;
            columnCallback(added, column);
        });

        if (this.autoGroupsNeedBuilding) {
            this.updateGridColumns();
        }

        this.updateDisplayedColumns(source);

        this.fireColumnEvent(eventName, masterList, source);
    }

    public setValueColumns(colKeys: (string | Column)[], source: ColumnEventType = "api"): void {
        this.setPrimaryColumnList(colKeys, this.valueColumns,
            Events.EVENT_COLUMN_VALUE_CHANGED,
            this.setValueActive.bind(this),
            source
        );
    }

    private setValueActive(active: boolean, column: Column, source: ColumnEventType): void {
        if (active === column.isValueActive()) { return; }

        column.setValueActive(active, source);

        if (active && !column.getAggFunc()) {
            const initialAggFunc = this.aggFuncService.getDefaultAggFunc(column);
            column.setAggFunc(initialAggFunc);
        }
    }

    public addValueColumns(keys: (string | Column)[], source: ColumnEventType = "api"): void {
        this.updatePrimaryColumnList(keys, this.valueColumns, true,
            this.setValueActive.bind(this, true),
            Events.EVENT_COLUMN_VALUE_CHANGED,
            source
        );
    }

    public addValueColumn(colKey: (string | Column) | null | undefined, source: ColumnEventType = "api"): void {
        if (colKey) { this.addValueColumns([colKey], source); }
    }

    public removeValueColumn(colKey: (string | Column), source: ColumnEventType = "api"): void {
        this.removeValueColumns([colKey], source);
    }

    public removeValueColumns(keys: (string | Column)[], source: ColumnEventType = "api"): void {
        this.updatePrimaryColumnList(keys, this.valueColumns, false,
            this.setValueActive.bind(this, false),
            Events.EVENT_COLUMN_VALUE_CHANGED,
            source
        );
    }

    // returns the width we can set to this col, taking into consideration min and max widths
    private normaliseColumnWidth(column: Column, newWidth: number): number {
        const minWidth = column.getMinWidth();

        if (exists(minWidth) && newWidth < minWidth) {
            newWidth = minWidth;
        }

        const maxWidth = column.getMaxWidth();
        if (exists(maxWidth) && column.isGreaterThanMax(newWidth)) {
            newWidth = maxWidth;
        }

        return newWidth;
    }

    private getPrimaryOrGridColumn(key: string | Column): Column | null {
        const column = this.getPrimaryColumn(key);

        return column || this.getGridColumn(key);
    }

    public setColumnWidths(
        columnWidths: {
            key: string | Column, // @key - the column who's size we want to change
            newWidth: number; // @newWidth - width in pixels
        }[],
        shiftKey: boolean, // @takeFromAdjacent - if user has 'shift' pressed, then pixels are taken from adjacent column
        finished: boolean, // @finished - ends up in the event, tells the user if more events are to come
        source: ColumnEventType = "api"
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
            const defaultIsShift = this.gridOptionsWrapper.getColResizeDefault() === 'shift';

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

        this.resizeColumnSets({
            resizeSets: sets,
            finished,
            source
        });

    }

    private checkMinAndMaxWidthsForSet(columnResizeSet: ColumnResizeSet): boolean {
        const { columns, width } = columnResizeSet;

        // every col has a min width, so sum them all up and see if we have enough room
        // for all the min widths
        let minWidthAccumulated = 0;
        let maxWidthAccumulated = 0;
        let maxWidthActive = true;

        columns.forEach(col => {
            const minWidth = col.getMinWidth();
            minWidthAccumulated += minWidth || 0;

            const maxWidth = col.getMaxWidth();
            if (exists(maxWidth) && maxWidth > 0) {
                maxWidthAccumulated += maxWidth;
            } else {
                // if at least one columns has no max width, it means the group of columns
                // then has no max width, as at least one column can take as much width as possible
                maxWidthActive = false;
            }
        });

        const minWidthPasses = width >= minWidthAccumulated;
        const maxWidthPasses = !maxWidthActive || (width <= maxWidthAccumulated);

        return minWidthPasses && maxWidthPasses;
    }

    // method takes sets of columns and resizes them. either all sets will be resized, or nothing
    // be resized. this is used for example when user tries to resize a group and holds shift key,
    // then both the current group (grows), and the adjacent group (shrinks), will get resized,
    // so that's two sets for this method.
    public resizeColumnSets(params: {
        resizeSets: ColumnResizeSet[],
        finished: boolean,
        source: ColumnEventType
    }): void {
        const { resizeSets, finished, source } = params;
        const passMinMaxCheck = !resizeSets || resizeSets.every(columnResizeSet => this.checkMinAndMaxWidthsForSet(columnResizeSet));

        if (!passMinMaxCheck) {
            // even though we are not going to resize beyond min/max size, we still need to raise event when finished
            if (finished) {
                const columns = resizeSets && resizeSets.length > 0 ? resizeSets[0].columns : null;
                this.fireColumnResizedEvent(columns, finished, source);
            }

            return; // don't resize!
        }

        const changedCols: Column[] = [];
        const allResizedCols: Column[] = [];

        resizeSets.forEach(set => {
            const { width, columns, ratios } = set;

            // keep track of pixels used, and last column gets the remaining,
            // to cater for rounding errors, and min width adjustments
            const newWidths: { [colId: string]: number; } = {};
            const finishedCols: { [colId: string]: boolean; } = {};

            columns.forEach(col => allResizedCols.push(col));

            // the loop below goes through each col. if a col exceeds it's min/max width,
            // it then gets set to its min/max width and the column is removed marked as 'finished'
            // and the calculation is done again leaving this column out. take for example columns
            // {A, width: 50, maxWidth: 100}
            // {B, width: 50}
            // {C, width: 50}
            // and then the set is set to width 600 - on the first pass the grid tries to set each column
            // to 200. it checks A and sees 200 > 100 and so sets the width to 100. col A is then marked
            // as 'finished' and the calculation is done again with the remaining cols B and C, which end up
            // splitting the remaining 500 pixels.
            let finishedColsGrew = true;
            let loopCount = 0;

            while (finishedColsGrew) {
                loopCount++;
                if (loopCount > 1000) {
                    // this should never happen, but in the future, someone might introduce a bug here,
                    // so we stop the browser from hanging and report bug properly
                    console.error('AG Grid: infinite loop in resizeColumnSets');
                    break;
                }

                finishedColsGrew = false;

                const subsetCols: Column[] = [];
                let subsetRatioTotal = 0;
                let pixelsToDistribute = width;

                columns.forEach((col: Column, index: number) => {
                    const thisColFinished = finishedCols[col.getId()];
                    if (thisColFinished) {
                        pixelsToDistribute -= newWidths[col.getId()];
                    } else {
                        subsetCols.push(col);
                        const ratioThisCol = ratios[index];
                        subsetRatioTotal += ratioThisCol;
                    }
                });

                // because we are not using all of the ratios (cols can be missing),
                // we scale the ratio. if all columns are included, then subsetRatioTotal=1,
                // and so the ratioScale will be 1.
                const ratioScale = 1 / subsetRatioTotal;

                subsetCols.forEach((col: Column, index: number) => {
                    const lastCol = index === (subsetCols.length - 1);
                    let colNewWidth: number;

                    if (lastCol) {
                        colNewWidth = pixelsToDistribute;
                    } else {
                        colNewWidth = Math.round(ratios[index] * width * ratioScale);
                        pixelsToDistribute -= colNewWidth;
                    }

                    const minWidth = col.getMinWidth();
                    const maxWidth = col.getMaxWidth();

                    if (exists(minWidth) && colNewWidth < minWidth) {
                        colNewWidth = minWidth;
                        finishedCols[col.getId()] = true;
                        finishedColsGrew = true;
                    } else if (exists(maxWidth) && maxWidth > 0 && colNewWidth > maxWidth) {
                        colNewWidth = maxWidth;
                        finishedCols[col.getId()] = true;
                        finishedColsGrew = true;
                    }

                    newWidths[col.getId()] = colNewWidth;
                });
            }

            columns.forEach(col => {
                const newWidth = newWidths[col.getId()];
                const actualWidth = col.getActualWidth();

                if (actualWidth !== newWidth) {
                    col.setActualWidth(newWidth, source);
                    changedCols.push(col);
                }
            });
        });

        // if no cols changed, then no need to update more or send event.
        const atLeastOneColChanged = changedCols.length > 0;

        let flexedCols: Column[] = [];

        if (atLeastOneColChanged) {
            flexedCols = this.refreshFlexedColumns({ resizingCols: allResizedCols, skipSetLeft: true });
            this.setLeftValues(source);
            this.updateBodyWidths();
            this.checkViewportColumns();
        }

        // check for change first, to avoid unnecessary firing of events
        // however we always fire 'finished' events. this is important
        // when groups are resized, as if the group is changing slowly,
        // eg 1 pixel at a time, then each change will fire change events
        // in all the columns in the group, but only one with get the pixel.
        const colsForEvent = allResizedCols.concat(flexedCols);

        if (atLeastOneColChanged || finished) {
            this.fireColumnResizedEvent(colsForEvent, finished, source, flexedCols);
        }
    }

    public setColumnAggFunc(key: string | Column | null | undefined, aggFunc: string, source: ColumnEventType = "api"): void {
        if (!key) { return; }

        const column = this.getPrimaryColumn(key);
        if (!column) { return; }

        column.setAggFunc(aggFunc);

        this.fireColumnEvent(Events.EVENT_COLUMN_VALUE_CHANGED, [column], source);
    }

    private fireColumnEvent(type: string, columns: Column[], source: ColumnEventType): void {
        const event: ColumnValueChangedEvent = {
            type: type,
            columns: columns,
            column: (columns && columns.length == 1) ? columns[0] : null,
            api: this.gridApi,
            columnApi: this.columnApi,
            source: source
        };
        this.eventService.dispatchEvent(event);
    }

    public moveRowGroupColumn(fromIndex: number, toIndex: number, source: ColumnEventType = "api"): void {
        const column = this.rowGroupColumns[fromIndex];

        this.rowGroupColumns.splice(fromIndex, 1);
        this.rowGroupColumns.splice(toIndex, 0, column);

        const event: ColumnRowGroupChangedEvent = {
            type: Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
            columns: this.rowGroupColumns,
            column: this.rowGroupColumns.length === 1 ? this.rowGroupColumns[0] : null,
            api: this.gridApi,
            columnApi: this.columnApi,
            source: source
        };

        this.eventService.dispatchEvent(event);
    }

    public moveColumns(columnsToMoveKeys: (string | Column)[], toIndex: number, source: ColumnEventType = "api"): void {
        this.columnAnimationService.start();

        if (toIndex > this.gridColumns.length - columnsToMoveKeys.length) {
            console.warn('AG Grid: tried to insert columns in invalid location, toIndex = ' + toIndex);
            console.warn('AG Grid: remember that you should not count the moving columns when calculating the new index');
            return;
        }

        // we want to pull all the columns out first and put them into an ordered list
        const columnsToMove = this.getGridColumns(columnsToMoveKeys);
        const failedRules = !this.doesMovePassRules(columnsToMove, toIndex);

        if (failedRules) { return; }

        moveInArray(this.gridColumns, columnsToMove, toIndex);
        this.updateDisplayedColumns(source);

        const event: ColumnMovedEvent = {
            type: Events.EVENT_COLUMN_MOVED,
            columns: columnsToMove,
            column: columnsToMove.length === 1 ? columnsToMove[0] : null,
            toIndex: toIndex,
            api: this.gridApi,
            columnApi: this.columnApi,
            source: source
        };

        this.eventService.dispatchEvent(event);
        this.columnAnimationService.finish();
    }

    public doesMovePassRules(columnsToMove: Column[], toIndex: number): boolean {
        // make a copy of what the grid columns would look like after the move
        const proposedColumnOrder = this.getProposedColumnOrder(columnsToMove, toIndex);
        return this.doesOrderPassRules(proposedColumnOrder);
    }

    public doesOrderPassRules(gridOrder: Column[]) {
        if (!this.doesMovePassMarryChildren(gridOrder)) {
            return false;
        }
        if (!this.doesMovePassLockedPositions(gridOrder)) {
            return false;
        }
        return true;
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

    public doesMovePassLockedPositions(proposedColumnOrder: Column[]): boolean {
         // Placement is a number indicating 'left' 'center' or 'right' as 0 1 2
        let lastPlacement = 0;
        let rulePassed = true;
        const lockPositionToPlacement = (position: ColDef['lockPosition']) => {
            if (!position) { // false or undefined
                return 1;
            }
            if (position === true) {
                return 0;
            }
            return position === 'left' ? 0 : 2; // Otherwise 'right'
        };

        proposedColumnOrder.forEach(col => {
            const placement = lockPositionToPlacement(col.getColDef().lockPosition);
            if (placement < lastPlacement) { // If placement goes down, we're not in the correct order
                rulePassed = false;
            }
            lastPlacement = placement;
        });

        return rulePassed;
    }

    public doesMovePassMarryChildren(allColumnsCopy: Column[]): boolean {
        let rulePassed = true;

        this.columnUtils.depthFirstOriginalTreeSearch(null, this.gridBalancedTree, child => {
            if (!(child instanceof ProvidedColumnGroup)) { return; }

            const columnGroup = child;
            const colGroupDef = columnGroup.getColGroupDef();
            const marryChildren = colGroupDef && colGroupDef.marryChildren;

            if (!marryChildren) { return; }

            const newIndexes: number[] = [];
            columnGroup.getLeafColumns().forEach(col => {
                const newColIndex = allColumnsCopy.indexOf(col);
                newIndexes.push(newColIndex);
            });

            const maxIndex = Math.max.apply(Math, newIndexes);
            const minIndex = Math.min.apply(Math, newIndexes);

            // spread is how far the first column in this group is away from the last column
            const spread = maxIndex - minIndex;
            const maxSpread = columnGroup.getLeafColumns().length - 1;

            // if the columns
            if (spread > maxSpread) {
                rulePassed = false;
            }

            // console.log(`maxIndex = ${maxIndex}, minIndex = ${minIndex}, spread = ${spread}, maxSpread = ${maxSpread}, fail = ${spread > (count-1)}`)
            // console.log(allColumnsCopy.map( col => col.getColDef().field).join(','));
        });

        return rulePassed;
    }

    public moveColumn(key: string | Column, toIndex: number, source: ColumnEventType = "api") {
        this.moveColumns([key], toIndex, source);
    }

    public moveColumnByIndex(fromIndex: number, toIndex: number, source: ColumnEventType = "api"): void {
        const column = this.gridColumns[fromIndex];
        this.moveColumn(column, toIndex, source);
    }

    public getColumnDefs(): (ColDef | ColGroupDef)[] | undefined {
        if (!this.primaryColumns) { return; }

        const cols = this.primaryColumns.slice();

        if (this.gridColsArePrimary) {
            cols.sort((a: Column, b: Column) => this.gridColumns.indexOf(a) - this.gridColumns.indexOf(b));
        } else if (this.lastPrimaryOrder) {
            cols.sort((a: Column, b: Column) => this.lastPrimaryOrder.indexOf(a) - this.lastPrimaryOrder.indexOf(b));
        }

        return this.columnDefFactory.buildColumnDefs(cols, this.rowGroupColumns, this.pivotColumns);
    }

    // used by:
    // + angularGrid -> for setting body width
    // + rowController -> setting main row widths (when inserting and resizing)
    // need to cache this
    public getBodyContainerWidth(): number {
        return this.bodyWidth;
    }

    public getContainerWidth(pinned: string | null): number {
        switch (pinned) {
            case Constants.PINNED_LEFT:
                return this.leftWidth;
            case Constants.PINNED_RIGHT:
                return this.rightWidth;
            default:
                return this.bodyWidth;
        }
    }

    // after setColumnWidth or updateGroupsAndDisplayedColumns
    private updateBodyWidths(): void {
        const newBodyWidth = this.getWidthOfColsInList(this.displayedColumnsCenter);
        const newLeftWidth = this.getWidthOfColsInList(this.displayedColumnsLeft);
        const newRightWidth = this.getWidthOfColsInList(this.displayedColumnsRight);

        // this is used by virtual col calculation, for RTL only, as a change to body width can impact displayed
        // columns, due to RTL inverting the y coordinates
        this.bodyWidthDirty = this.bodyWidth !== newBodyWidth;

        const atLeastOneChanged = this.bodyWidth !== newBodyWidth || this.leftWidth !== newLeftWidth || this.rightWidth !== newRightWidth;

        if (atLeastOneChanged) {
            this.bodyWidth = newBodyWidth;
            this.leftWidth = newLeftWidth;
            this.rightWidth = newRightWidth;
            // when this fires, it is picked up by the gridPanel, which ends up in
            // gridPanel calling setWidthAndScrollPosition(), which in turn calls setViewportPosition()
            const event: DisplayedColumnsWidthChangedEvent = {
                type: Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED,
                api: this.gridApi,
                columnApi: this.columnApi
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

    // + rowController -> while inserting rows
    public getDisplayedLeftColumns(): Column[] {
        return this.displayedColumnsLeft;
    }

    public getDisplayedRightColumns(): Column[] {
        return this.displayedColumnsRight;
    }

    public getDisplayedColumns(type: string | null): Column[] {
        switch (type) {
            case Constants.PINNED_LEFT:
                return this.getDisplayedLeftColumns();
            case Constants.PINNED_RIGHT:
                return this.getDisplayedRightColumns();
            default:
                return this.getDisplayedCenterColumns();
        }
    }

    // used by:
    // + clientSideRowController -> sorting, building quick filter text
    // + headerRenderer -> sorting (clearing icon)
    public getAllPrimaryColumns(): Column[] | null {
        return this.primaryColumns ? this.primaryColumns.slice() : null;
    }

    public getSecondaryColumns(): Column[] | null {
        return this.secondaryColumns ? this.secondaryColumns.slice() : null;
    }

    public getAllColumnsForQuickFilter(): Column[] {
        return this.columnsForQuickFilter;
    }

    // + moveColumnController
    public getAllGridColumns(): Column[] {
        return this.gridColumns;
    }

    public isEmpty(): boolean {
        return missingOrEmpty(this.gridColumns);
    }

    public isRowGroupEmpty(): boolean {
        return missingOrEmpty(this.rowGroupColumns);
    }

    public setColumnVisible(key: string | Column, visible: boolean, source: ColumnEventType = "api"): void {
        this.setColumnsVisible([key], visible, source);
    }

    public setColumnsVisible(keys: (string | Column)[], visible = false, source: ColumnEventType = "api"): void {
        this.columnAnimationService.start();

        this.actionOnGridColumns(keys, (column: Column): boolean => {
            if (column.isVisible() !== visible) {
                column.setVisible(visible, source);
                return true;
            }
            return false;
        }, source, () => {
            const event: ColumnVisibleEvent = {
                type: Events.EVENT_COLUMN_VISIBLE,
                visible: visible,
                column: null,
                columns: null,
                api: this.gridApi,
                columnApi: this.columnApi,
                source: source
            };
            return event;
        });
        this.columnAnimationService.finish();
    }

    public setColumnPinned(key: string | Column | null, pinned: string | boolean | null, source: ColumnEventType = "api"): void {
        if (key) {
            this.setColumnsPinned([key], pinned, source);
        }
    }

    public setColumnsPinned(keys: (string | Column)[], pinned: string | boolean | null, source: ColumnEventType = "api"): void {
        if (this.gridOptionsWrapper.getDomLayout() === 'print') {
            console.warn(`Changing the column pinning status is not allowed with domLayout='print'`);
            return;
        }
        this.columnAnimationService.start();

        let actualPinned: string | null;
        if (pinned === true || pinned === Constants.PINNED_LEFT) {
            actualPinned = Constants.PINNED_LEFT;
        } else if (pinned === Constants.PINNED_RIGHT) {
            actualPinned = Constants.PINNED_RIGHT;
        } else {
            actualPinned = null;
        }

        this.actionOnGridColumns(keys, (col: Column): boolean => {
            if (col.getPinned() !== actualPinned) {
                col.setPinned(actualPinned);
                return true;
            }
            return false;
        }, source, () => {
            const event: ColumnPinnedEvent = {
                type: Events.EVENT_COLUMN_PINNED,
                pinned: actualPinned,
                column: null,
                columns: null,
                api: this.gridApi,
                columnApi: this.columnApi,
                source: source
            };
            return event;
        });

        this.columnAnimationService.finish();
    }

    // does an action on a set of columns. provides common functionality for looking up the
    // columns based on key, getting a list of effected columns, and then updated the event
    // with either one column (if it was just one col) or a list of columns
    // used by: autoResize, setVisible, setPinned
    private actionOnGridColumns(// the column keys this action will be on
        keys: (string | Column)[],
        // the action to do - if this returns false, the column was skipped
        // and won't be included in the event
        action: (column: Column) => boolean,
        // should return back a column event of the right type
        source: ColumnEventType,
        createEvent?: () => ColumnEvent): void {

        if (missingOrEmpty(keys)) { return; }

        const updatedColumns: Column[] = [];

        keys.forEach((key: string | Column) => {
            const column = this.getGridColumn(key);
            if (!column) { return; }

            // need to check for false with type (ie !== instead of !=)
            // as not returning anything (undefined) would also be false
            const resultOfAction = action(column);
            if (resultOfAction !== false) {
                updatedColumns.push(column);
            }
        });

        if (!updatedColumns.length) { return; }

        this.updateDisplayedColumns(source);

        if (exists(createEvent) && createEvent) {
            const event = createEvent();

            event.columns = updatedColumns;
            event.column = updatedColumns.length === 1 ? updatedColumns[0] : null;

            this.eventService.dispatchEvent(event);
        }
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

    public getDisplayedGroupAfter(columnGroup: ColumnGroup): ColumnGroup | null {
        return this.getDisplayedGroupAtDirection(columnGroup, 'After');
    }

    public getDisplayedGroupBefore(columnGroup: ColumnGroup): ColumnGroup | null {
        return this.getDisplayedGroupAtDirection(columnGroup, 'Before');
    }

    public getDisplayedGroupAtDirection(columnGroup: ColumnGroup, direction: 'After' | 'Before'): ColumnGroup | null {
        // pick the last displayed column in this group
        const requiredLevel = columnGroup.getProvidedColumnGroup().getLevel() + columnGroup.getPaddingLevel();
        const colGroupLeafColumns = columnGroup.getDisplayedLeafColumns();
        const col: Column | null = direction === 'After' ? last(colGroupLeafColumns) : colGroupLeafColumns[0];
        const getDisplayColMethod: 'getDisplayedColAfter' | 'getDisplayedColBefore' = `getDisplayedCol${direction}` as any;

        while (true) {
            // keep moving to the next col, until we get to another group
            const column = this[getDisplayColMethod](col);

            if (!column) { return null; }

            const groupPointer = this.getColumnGroupAtLevel(column, requiredLevel);

            if (groupPointer !== columnGroup) {
                return groupPointer;
            }
        }
    }

    public getColumnGroupAtLevel(column: Column, level: number): ColumnGroup | null {
        // get group at same level as the one we are looking for
        let groupPointer: ColumnGroup = column.getParent();
        let originalGroupLevel: number;
        let groupPointerLevel: number;

        while (true) {
            const groupPointerProvidedColumnGroup = groupPointer.getProvidedColumnGroup();
            originalGroupLevel = groupPointerProvidedColumnGroup.getLevel();
            groupPointerLevel = groupPointer.getPaddingLevel();

            if (originalGroupLevel + groupPointerLevel <= level) { break; }
            groupPointer = groupPointer.getParent();
        }

        return groupPointer;
    }

    public isPinningLeft(): boolean {
        return this.displayedColumnsLeft.length > 0;
    }

    public isPinningRight(): boolean {
        return this.displayedColumnsRight.length > 0;
    }

    public getPrimaryAndSecondaryAndAutoColumns(): Column[] {
        return ([] as Column[]).concat(...[
            this.primaryColumns || [],
            this.groupAutoColumns || [],
            this.secondaryColumns || [],
        ]);
    }

    private getPrimaryAndAutoGroupCols(): Column[] {
        return ([] as Column[]).concat(...[
            this.primaryColumns || [],
            this.groupAutoColumns || [],
        ]);
    }

    private getPrimaryAndSecondaryColumns(): Column[] {
        return ([] as Column[]).concat(...[
            this.primaryColumns || [],
            this.secondaryColumns || [],
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

    public resetColumnState(source: ColumnEventType = "api"): void {
        // NOTE = there is one bug here that no customer has noticed - if a column has colDef.lockPosition,
        // this is ignored  below when ordering the cols. to work, we should always put lockPosition cols first.
        // As a work around, developers should just put lockPosition columns first in their colDef list.

        // we can't use 'allColumns' as the order might of messed up, so get the primary ordered list
        const primaryColumns = this.getColumnsFromTree(this.primaryColumnTree);
        const columnStates: ColumnState[] = [];

        // we start at 1000, so if user has mix of rowGroup and group specified, it will work with both.
        // eg IF user has ColA.rowGroupIndex=0, ColB.rowGroupIndex=1, ColC.rowGroup=true,
        // THEN result will be ColA.rowGroupIndex=0, ColB.rowGroupIndex=1, ColC.rowGroup=1000
        let letRowGroupIndex = 1000;
        let letPivotIndex = 1000;

        let colsToProcess: Column[] = [];
        if (this.groupAutoColumns) {
            colsToProcess = colsToProcess.concat(this.groupAutoColumns);
        }

        if (primaryColumns) {
            colsToProcess = colsToProcess.concat(primaryColumns);
        }

        colsToProcess.forEach(column => {

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

            const stateItem = {
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

            if (missing(rowGroupIndex) && rowGroup) {
                stateItem.rowGroupIndex = letRowGroupIndex++;
            }

            if (missing(pivotIndex) && pivot) {
                stateItem.pivotIndex = letPivotIndex++;
            }

            columnStates.push(stateItem);
        });

        this.applyColumnState({ state: columnStates, applyOrder: true }, source);
    }

    public applyColumnState(params: ApplyColumnStateParams, source: ColumnEventType = "api"): boolean {
        if (missingOrEmpty(this.primaryColumns)) { return false; }

        if (params && params.state && !params.state.forEach) {
            console.warn('AG Grid: applyColumnState() - the state attribute should be an array, however an array was not found. Please provide an array of items (one for each col you want to change) for state.');
            return false;
        }

        const applyStates = (states: ColumnState[], existingColumns: Column[], getById: (id: string) => Column | null) => {
            const raiseEventsFunc = this.compareColumnStatesAndRaiseEvents(source);
            this.autoGroupsNeedBuilding = true;

            // at the end below, this list will have all columns we got no state for
            const columnsWithNoState = existingColumns.slice();

            const rowGroupIndexes: { [key: string]: number; } = {};
            const pivotIndexes: { [key: string]: number; } = {};
            const autoGroupColumnStates: ColumnState[] = [];
            // If pivoting is modified, these are the states we try to reapply after
            // the secondary columns are re-generated
            const unmatchedAndAutoStates: ColumnState[] = [];
            let unmatchedCount = 0;

            const previousRowGroupCols = this.rowGroupColumns.slice();
            const previousPivotCols = this.pivotColumns.slice();

            states.forEach((state: ColumnState) => {
                const colId = state.colId || '';

                // auto group columns are re-created so deferring syncing with ColumnState
                const isAutoGroupColumn = colId.startsWith(Constants.GROUP_AUTO_COLUMN_ID);
                if (isAutoGroupColumn) {
                    autoGroupColumnStates.push(state);
                    unmatchedAndAutoStates.push(state);
                    return;
                }

                const column = getById(colId);

                if (!column) {
                    unmatchedAndAutoStates.push(state);
                    unmatchedCount += 1;
                } else {
                    this.syncColumnWithStateItem(column, state, params.defaultState, rowGroupIndexes,
                        pivotIndexes, false, source);
                    removeFromArray(columnsWithNoState, column);
                }
            });

            // anything left over, we got no data for, so add in the column as non-value, non-rowGroup and hidden
            const applyDefaultsFunc = (col: Column) =>
                this.syncColumnWithStateItem(col, null, params.defaultState, rowGroupIndexes,
                    pivotIndexes, false, source);

            columnsWithNoState.forEach(applyDefaultsFunc);

            // sort the lists according to the indexes that were provided
            const comparator = (indexes: { [key: string]: number; }, oldList: Column[], colA: Column, colB: Column) => {

                const indexA = indexes[colA.getId()];
                const indexB = indexes[colB.getId()];

                const aHasIndex = indexA != null;
                const bHasIndex = indexB != null;

                if (aHasIndex && bHasIndex) {
                    // both a and b are new cols with index, so sort on index
                    return indexA - indexB;
                }

                if (aHasIndex) {
                    // a has an index, so it should be before a
                    return -1;
                }

                if (bHasIndex) {
                    // b has an index, so it should be before a
                    return 1;
                }

                const oldIndexA = oldList.indexOf(colA);
                const oldIndexB = oldList.indexOf(colB);

                const aHasOldIndex = oldIndexA >= 0;
                const bHasOldIndex = oldIndexB >= 0;

                if (aHasOldIndex && bHasOldIndex) {
                    // both a and b are old cols, so sort based on last order
                    return oldIndexA - oldIndexB;
                }

                if (aHasOldIndex) {
                    // a is old, b is new, so b is first
                    return -1;
                }

                // this bit does matter, means both are new cols
                // but without index or that b is old and a is new
                return 1;
            };

            this.rowGroupColumns.sort(comparator.bind(this, rowGroupIndexes, previousRowGroupCols));
            this.pivotColumns.sort(comparator.bind(this, pivotIndexes, previousPivotCols));

            this.updateGridColumns();

            // sync newly created auto group columns with ColumnState
            const autoGroupColsCopy = this.groupAutoColumns ? this.groupAutoColumns.slice() : [];
            autoGroupColumnStates.forEach(stateItem => {
                const autoCol = this.getAutoColumn(stateItem.colId!);
                removeFromArray(autoGroupColsCopy, autoCol);
                this.syncColumnWithStateItem(autoCol, stateItem, params.defaultState, null, null, true, source);
            });
            // autogroup cols with nothing else, apply the default
            autoGroupColsCopy.forEach(applyDefaultsFunc);

            this.applyOrderAfterApplyState(params);
            this.updateDisplayedColumns(source);
            this.dispatchEverythingChanged(source);

            raiseEventsFunc(); // Will trigger secondary column changes if pivoting modified
            return { unmatchedAndAutoStates, unmatchedCount };
        };

        this.columnAnimationService.start();

        let {
            unmatchedAndAutoStates,
            unmatchedCount,
        } = applyStates(params.state || [], this.primaryColumns || [], (id) => this.getPrimaryColumn(id));

        // If there are still states left over, see if we can apply them to newly generated
        // secondary or auto columns. Also if defaults exist, ensure they are applied to secondary cols
        if (unmatchedAndAutoStates.length > 0 || exists(params.defaultState)) {
            unmatchedCount = applyStates(
                unmatchedAndAutoStates,
                this.secondaryColumns || [],
                (id) => this.getSecondaryColumn(id)
            ).unmatchedCount;
        }
        this.columnAnimationService.finish();

        return unmatchedCount === 0; // Successful if no states unaccounted for
    }

    private applyOrderAfterApplyState(params: ApplyColumnStateParams): void {
        if (!params.applyOrder || !params.state) { return; }

        let newOrder: Column[] = [];
        const processedColIds: { [id: string]: boolean } = {};

        params.state.forEach(item => {
            if (!item.colId || processedColIds[item.colId]) { return; }
            const col = this.gridColumnsMap[item.colId];
            if (col) {
                newOrder.push(col);
                processedColIds[item.colId] = true;
            }
        });

        // add in all other columns
        let autoGroupInsertIndex = 0;
        this.gridColumns.forEach(col => {
            const colId = col.getColId();
            const alreadyProcessed = processedColIds[colId] != null;
            if (alreadyProcessed) { return; }

            const isAutoGroupCol = colId.startsWith(Constants.GROUP_AUTO_COLUMN_ID);
            if (isAutoGroupCol) {
                // auto group columns, if missing from state list, are added to the start.
                // it's common to have autoGroup missing, as grouping could be on by default
                // on a column, but the user could of since removed the grouping via the UI.
                // if we don't inc the insert index, autoGroups will be inserted in reverse order
                insertIntoArray(newOrder, col, autoGroupInsertIndex++);
            } else {
                // normal columns, if missing from state list, are added at the end
                newOrder.push(col);
            }
        });

        // this is already done in updateGridColumns, however we changed the order above (to match the order of the state
        // columns) so we need to do it again. we could of put logic into the order above to take into account fixed
        // columns, however if we did then we would have logic for updating fixed columns twice. reusing the logic here
        // is less sexy for the code here, but it keeps consistency.
        newOrder = this.placeLockedColumns(newOrder);

        if (!this.doesMovePassMarryChildren(newOrder)) {
            console.warn('AG Grid: Applying column order broke a group where columns should be married together. Applying new order has been discarded.');
            return;
        }

        this.gridColumns = newOrder;
    }

    private compareColumnStatesAndRaiseEvents(source: ColumnEventType): () => void {

        const startState = {
            rowGroupColumns: this.rowGroupColumns.slice(),
            pivotColumns: this.pivotColumns.slice(),
            valueColumns: this.valueColumns.slice()
        };

        const columnStateBefore = this.getColumnState();
        const columnStateBeforeMap: { [colId: string]: ColumnState; } = {};

        columnStateBefore.forEach(col => {
            columnStateBeforeMap[col.colId!] = col;
        });

        return () => {
            if (this.gridOptionsWrapper.isSuppressColumnStateEvents()) { return; }

            const colsForState = this.getPrimaryAndSecondaryAndAutoColumns();

            // raises generic ColumnEvents where all columns are returned rather than what has changed
            const raiseWhenListsDifferent = (eventType: string, colsBefore: Column[], colsAfter: Column[], idMapper: (column: Column) => string) => {
                const beforeList = colsBefore.map(idMapper);
                const afterList = colsAfter.map(idMapper);
                const unchanged = areEqual(beforeList, afterList);

                if (unchanged) { return; }

                // returning all columns rather than what has changed!
                const event: ColumnEvent = {
                    type: eventType,
                    columns: colsAfter,
                    column: colsAfter.length === 1 ? colsAfter[0] : null,
                    api: this.gridApi,
                    columnApi: this.columnApi,
                    source: source
                };

                this.eventService.dispatchEvent(event);
            };

            // determines which columns have changed according to supplied predicate
            const getChangedColumns = (changedPredicate: (cs: ColumnState, c: Column) => boolean): Column[] => {
                const changedColumns: Column[] = [];

                colsForState.forEach(column => {
                    const colStateBefore = columnStateBeforeMap[column.getColId()];
                    if (colStateBefore && changedPredicate(colStateBefore, column)) {
                        changedColumns.push(column);
                    }
                });

                return changedColumns;
            };

            const columnIdMapper = (c: Column) => c.getColId();

            raiseWhenListsDifferent(Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
                startState.rowGroupColumns,
                this.rowGroupColumns,
                columnIdMapper
            );

            raiseWhenListsDifferent(Events.EVENT_COLUMN_PIVOT_CHANGED,
                startState.pivotColumns,
                this.pivotColumns,
                columnIdMapper
            );

            const valueChangePredicate = (cs: ColumnState, c: Column) => {
                const oldActive = cs.aggFunc != null;

                const activeChanged = oldActive != c.isValueActive();
                // we only check aggFunc if the agg is active
                const aggFuncChanged = oldActive && cs.aggFunc != c.getAggFunc();

                return activeChanged || aggFuncChanged;
            };
            const changedValues = getChangedColumns(valueChangePredicate);
            if (changedValues.length > 0) {
                // we pass all value columns, now the ones that changed. this is the same
                // as pivot and rowGroup cols, but different to all other properties below.
                // this is more for backwards compatibility, as it's always been this way.
                // really it should be the other way, as the order of the cols makes no difference
                // for valueColumns (apart from displaying them in the tool panel).
                this.fireColumnEvent(Events.EVENT_COLUMN_VALUE_CHANGED, this.valueColumns, source);
            }

            const resizeChangePredicate = (cs: ColumnState, c: Column) => cs.width != c.getActualWidth();
            this.fireColumnResizedEvent(getChangedColumns(resizeChangePredicate), true, source);

            const pinnedChangePredicate = (cs: ColumnState, c: Column) => cs.pinned != c.getPinned();
            this.raiseColumnPinnedEvent(getChangedColumns(pinnedChangePredicate), source);

            const visibilityChangePredicate = (cs: ColumnState, c: Column) => cs.hide == c.isVisible();
            this.raiseColumnVisibleEvent(getChangedColumns(visibilityChangePredicate), source);

            const sortChangePredicate = (cs: ColumnState, c: Column) => cs.sort != c.getSort() || cs.sortIndex != c.getSortIndex();
            if (getChangedColumns(sortChangePredicate).length > 0) {
                this.sortController.dispatchSortChangedEvents(source);
            }

            // special handling for moved column events
            this.raiseColumnMovedEvent(columnStateBefore, source);
        };
    }

    private raiseColumnPinnedEvent(changedColumns: Column[], source: ColumnEventType) {
        if (!changedColumns.length) { return; }

        // if just one column, we use this, otherwise we don't include the col
        const column: Column | null = changedColumns.length === 1 ? changedColumns[0] : null;

        // only include visible if it's common in all columns
        const pinned = this.getCommonValue(changedColumns, col => col.getPinned());

        const event: ColumnPinnedEvent = {
            type: Events.EVENT_COLUMN_PINNED,
            // mistake in typing, 'undefined' should be allowed, as 'null' means 'not pinned'
            pinned: pinned != null ? pinned : null,
            columns: changedColumns,
            column,
            api: this.gridApi,
            columnApi: this.columnApi,
            source: source
        };

        this.eventService.dispatchEvent(event);
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

    private raiseColumnVisibleEvent(changedColumns: Column[], source: ColumnEventType) {
        if (!changedColumns.length) { return; }

        // if just one column, we use this, otherwise we don't include the col
        const column: Column | null = changedColumns.length === 1 ? changedColumns[0] : null;

        // only include visible if it's common in all columns
        const visible = this.getCommonValue(changedColumns, col => col.isVisible());

        const event: ColumnVisibleEvent = {
            type: Events.EVENT_COLUMN_VISIBLE,
            visible,
            columns: changedColumns,
            column,
            api: this.gridApi,
            columnApi: this.columnApi,
            source: source
        };

        this.eventService.dispatchEvent(event);
    }

    private raiseColumnMovedEvent(colStateBefore: ColumnState[], source: ColumnEventType) {

        // we are only interested in columns that were both present and visible before and after

        const colStateAfter = this.getColumnState();

        const colStateAfterMapped: { [id: string]: ColumnState; } = {};
        colStateAfter.forEach(s => colStateAfterMapped[s.colId!] = s);

        // get id's of cols in both before and after lists
        const colsIntersectIds: { [id: string]: boolean; } = {};
        colStateBefore.forEach(s => {
            if (colStateAfterMapped[s.colId!]) {
                colsIntersectIds[s.colId!] = true;
            }
        });

        // filter state lists, so we only have cols that were present before and after
        const beforeFiltered = colStateBefore.filter(c => colsIntersectIds[c.colId!]);
        const afterFiltered = colStateAfter.filter(c => colsIntersectIds[c.colId!]);

        // see if any cols are in a different location
        const movedColumns: Column[] = [];

        afterFiltered!.forEach((csAfter: ColumnState, index: number) => {
            const csBefore = beforeFiltered && beforeFiltered[index];
            if (csBefore && csBefore.colId !== csAfter.colId) {
                const gridCol = this.getGridColumn(csBefore.colId!);
                if (gridCol) {
                    movedColumns.push(gridCol);
                }
            }
        });

        if (!movedColumns.length) { return; }

        const event: ColumnMovedEvent = {
            type: Events.EVENT_COLUMN_MOVED,
            columns: movedColumns,
            column: null,
            api: this.gridApi,
            columnApi: this.columnApi,
            source: source
        };

        this.eventService.dispatchEvent(event);
    }

    private syncColumnWithStateItem(
        column: Column | null,
        stateItem: ColumnState | null,
        defaultState: ColumnStateParams | undefined,
        rowGroupIndexes: { [key: string]: number; } | null,
        pivotIndexes: { [key: string]: number; } | null,
        autoCol: boolean,
        source: ColumnEventType
    ): void {

        if (!column) { return; }

        const getValue = <U extends keyof ColumnStateParams, S extends keyof ColumnStateParams>(key1: U, key2?: S): { value1: ColumnStateParams[U] | undefined, value2: ColumnStateParams[S] | undefined; } => {
            const obj: { value1: ColumnStateParams[U] | undefined, value2: ColumnStateParams[S] | undefined; } = { value1: undefined, value2: undefined };
            let calculated: boolean = false;

            if (stateItem) {
                if (stateItem[key1] !== undefined) {
                    obj.value1 = stateItem[key1];
                    calculated = true;
                }
                if (exists(key2) && stateItem[key2] !== undefined) {
                    obj.value2 = stateItem[key2];
                    calculated = true;
                }
            }

            if (!calculated && defaultState) {
                if (defaultState[key1] !== undefined) {
                    obj.value1 = defaultState[key1];
                }
                if (exists(key2) && defaultState[key2] !== undefined) {
                    obj.value2 = defaultState[key2];
                }
            }

            return obj;
        };

        // following ensures we are left with boolean true or false, eg converts (null, undefined, 0) all to true
        const hide = getValue('hide').value1;
        if (hide !== undefined) {
            column.setVisible(!hide, source);
        }

        // sets pinned to 'left' or 'right'
        const pinned = getValue('pinned').value1;
        if (pinned !== undefined) {
            column.setPinned(pinned);
        }

        // if width provided and valid, use it, otherwise stick with the old width
        const minColWidth = this.columnUtils.calculateColMinWidth(column.getColDef());

        // flex
        const flex = getValue('flex').value1;
        if (flex !== undefined) {
            column.setFlex(flex);
        }

        // width - we only set width if column is not flexing
        const noFlexThisCol = column.getFlex() <= 0;
        if (noFlexThisCol) {
            // both null and undefined means we skip, as it's not possible to 'clear' width (a column must have a width)
            const width = getValue('width').value1;
            if (width != null) {
                if (minColWidth != null && width >= minColWidth) {
                    column.setActualWidth(width, source);
                }
            }
        }

        const sort = getValue('sort').value1;
        if (sort !== undefined) {
            if (sort === Constants.SORT_DESC || sort === Constants.SORT_ASC) {
                column.setSort(sort, source);
            } else {
                column.setSort(undefined, source);
            }
        }

        const sortIndex = getValue('sortIndex').value1;
        if (sortIndex !== undefined) {
            column.setSortIndex(sortIndex);
        }

        // we do not do aggFunc, rowGroup or pivot for auto cols or secondary cols
        if (autoCol || !column.isPrimary()) {
            return;
        }

        const aggFunc = getValue('aggFunc').value1;
        if (aggFunc !== undefined) {
            if (typeof aggFunc === 'string') {
                column.setAggFunc(aggFunc);
                if (!column.isValueActive()) {
                    column.setValueActive(true, source);
                    this.valueColumns.push(column);
                }
            } else {
                if (exists(aggFunc)) {
                    console.warn('AG Grid: stateItem.aggFunc must be a string. if using your own aggregation ' +
                        'functions, register the functions first before using them in get/set state. This is because it is ' +
                        'intended for the column state to be stored and retrieved as simple JSON.');
                }
                // Note: we do not call column.setAggFunc(null), so that next time we aggregate
                // by this column (eg drag the column to the agg section int he toolpanel) it will
                // default to the last aggregation function.

                if (column.isValueActive()) {
                    column.setValueActive(false, source);
                    removeFromArray(this.valueColumns, column);
                }
            }
        }

        const { value1: rowGroup, value2: rowGroupIndex } = getValue('rowGroup', 'rowGroupIndex');
        if (rowGroup !== undefined || rowGroupIndex !== undefined) {
            if (typeof rowGroupIndex === 'number' || rowGroup) {
                if (!column.isRowGroupActive()) {
                    column.setRowGroupActive(true, source);
                    this.rowGroupColumns.push(column);
                }
                if (rowGroupIndexes && typeof rowGroupIndex === 'number') {
                    rowGroupIndexes[column.getId()] = rowGroupIndex;
                }
            } else {
                if (column.isRowGroupActive()) {
                    column.setRowGroupActive(false, source);
                    removeFromArray(this.rowGroupColumns, column);
                }
            }
        }

        const { value1: pivot, value2: pivotIndex } = getValue('pivot', 'pivotIndex');
        if (pivot !== undefined || pivotIndex !== undefined) {
            if (typeof pivotIndex === 'number' || pivot) {
                if (!column.isPivotActive()) {
                    column.setPivotActive(true, source);
                    this.pivotColumns.push(column);
                }
                if (pivotIndexes && typeof pivotIndex === 'number') {
                    pivotIndexes[column.getId()] = pivotIndex;
                }
            } else {
                if (column.isPivotActive()) {
                    column.setPivotActive(false, source);
                    removeFromArray(this.pivotColumns, column);
                }
            }
        }
    }

    public getGridColumns(keys: (string | Column)[]): Column[] {
        return this.getColumns(keys, this.getGridColumn.bind(this));
    }

    private getColumns(keys: (string | Column)[], columnLookupCallback: (key: string | Column) => Column): Column[] {
        const foundColumns: Column[] = [];

        if (keys) {
            keys.forEach((key: (string | Column)) => {
                const column = columnLookupCallback(key);
                if (column) {
                    foundColumns.push(column);
                }
            });
        }

        return foundColumns;
    }

    // used by growGroupPanel
    public getColumnWithValidation(key: string | Column | undefined): Column | null {
        if (key == null) { return null; }

        const column = this.getGridColumn(key);

        if (!column) {
            console.warn('AG Grid: could not find column ' + key);
        }

        return column;
    }

    public getPrimaryColumn(key: string | Column): Column | null {
        if (!this.primaryColumns) { return null; }

        return this.getColumn(key, this.primaryColumns, this.primaryColumnsMap);
    }

    public getGridColumn(key: string | Column): Column | null {
        return this.getColumn(key, this.gridColumns, this.gridColumnsMap);
    }

    private getSecondaryColumn(key: string | Column): Column | null {
        if (!this.secondaryColumns) { return null; }
        return this.getColumn(key, this.secondaryColumns, this.secondaryColumnsMap);
    }

    private getColumn(key: string | Column, columnList: Column[], columnMap: { [id: string]: Column }): Column | null {
        if (!key) { return null; }

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

    private getAutoColumn(key: string | Column): Column | null {
        if (
            !this.groupAutoColumns ||
            !exists(this.groupAutoColumns) ||
            missing(this.groupAutoColumns)
        ) { return null; }

        return this.groupAutoColumns.find(groupCol => this.columnsMatch(groupCol, key)) || null;
    }

    private columnsMatch(column: Column, key: string | Column): boolean {
        const columnMatches = column === key;
        const colDefMatches = column.getColDef() === key;
        const idMatches = column.getColId() == key;

        return columnMatches || colDefMatches || idMatches;
    }

    public getDisplayNameForColumn(column: Column | null, location: string | null, includeAggFunc = false): string | null {
        if (!column) { return null; }

        const headerName: string | null = this.getHeaderName(column.getColDef(), column, null, null, location);

        if (includeAggFunc) {
            return this.wrapHeaderNameWithAggFunc(column, headerName);
        }

        return headerName;
    }

    public getDisplayNameForProvidedColumnGroup(
        columnGroup: ColumnGroup | null,
        providedColumnGroup: ProvidedColumnGroup | null,
        location: string
    ): string | null {
        const colGroupDef = providedColumnGroup ? providedColumnGroup.getColGroupDef() : null;

        if (colGroupDef) {
            return this.getHeaderName(colGroupDef, null, columnGroup, providedColumnGroup, location);
        }

        return null;
    }

    public getDisplayNameForColumnGroup(columnGroup: ColumnGroup, location: string): string | null {
        return this.getDisplayNameForProvidedColumnGroup(columnGroup, columnGroup.getProvidedColumnGroup(), location);
    }

    // location is where the column is going to appear, ie who is calling us
    private getHeaderName(
        colDef: AbstractColDef,
        column: Column | null,
        columnGroup: ColumnGroup | null,
        providedColumnGroup: ProvidedColumnGroup | null,
        location: string | null
    ): string | null {
        const headerValueGetter = colDef.headerValueGetter;

        if (headerValueGetter) {
            const params: HeaderValueGetterParams = {
                colDef: colDef,
                column: column,
                columnGroup: columnGroup,
                providedColumnGroup: providedColumnGroup,
                location: location,
                api: this.gridOptionsWrapper.getApi()!,
                columnApi: this.gridOptionsWrapper.getColumnApi()!,
                context: this.gridOptionsWrapper.getContext()
            };

            if (typeof headerValueGetter === 'function') {
                // valueGetter is a function, so just call it
                return headerValueGetter(params);
            } else if (typeof headerValueGetter === 'string') {
                // valueGetter is an expression, so execute the expression
                return this.expressionService.evaluate(headerValueGetter, params);
            }
            console.warn('ag-grid: headerValueGetter must be a function or a string');
            return '';
        } else if (colDef.headerName != null) {
            return colDef.headerName;
        } else if ((colDef as ColDef).field) {
            return camelCaseToHumanText((colDef as ColDef).field);
        }

        return '';
    }

    private wrapHeaderNameWithAggFunc(column: Column, headerName: string | null): string | null {
        if (this.gridOptionsWrapper.isSuppressAggFuncInHeader()) { return headerName; }

        // only columns with aggregation active can have aggregations
        const pivotValueColumn = column.getColDef().pivotValueColumn;
        const pivotActiveOnThisColumn = exists(pivotValueColumn);
        let aggFunc: string | IAggFunc | null | undefined = null;
        let aggFuncFound: boolean;

        // otherwise we have a measure that is active, and we are doing aggregation on it
        if (pivotActiveOnThisColumn) {
            const isCollapsedHeaderEnabled = this.gridOptionsWrapper.isRemovePivotHeaderRowWhenSingleValueColumn() && this.valueColumns.length === 1;
            const isTotalColumn = column.getColDef().pivotTotalColumnIds !== undefined;
            if (isCollapsedHeaderEnabled && !isTotalColumn) {
                return headerName; // Skip decorating the header - in this case the label is the pivot key, not the value col
            }
            aggFunc = pivotValueColumn ? pivotValueColumn.getAggFunc() : null;
            aggFuncFound = true;
        } else {
            const measureActive = column.isValueActive();
            const aggregationPresent = this.pivotMode || !this.isRowGroupEmpty();

            if (measureActive && aggregationPresent) {
                aggFunc = column.getAggFunc();
                aggFuncFound = true;
            } else {
                aggFuncFound = false;
            }
        }

        if (aggFuncFound) {
            const aggFuncString = (typeof aggFunc === 'string') ? aggFunc : 'func';
            const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            const aggFuncStringTranslated = localeTextFunc(aggFuncString, aggFuncString);
            return `${aggFuncStringTranslated}(${headerName})`;
        }

        return headerName;
    }

    // returns the group with matching colId and instanceId. If instanceId is missing,
    // matches only on the colId.
    public getColumnGroup(colId: string | ColumnGroup, instanceId?: number): ColumnGroup | null {
        if (!colId) { return null; }
        if (colId instanceof ColumnGroup) { return colId; }

        const allColumnGroups = this.getAllDisplayedTrees();
        const checkInstanceId = typeof instanceId === 'number';
        let result: ColumnGroup | null = null;

        this.columnUtils.depthFirstAllColumnTreeSearch(allColumnGroups, (child: IHeaderColumn) => {
            if (child instanceof ColumnGroup) {
                const columnGroup = child;
                let matched: boolean;

                if (checkInstanceId) {
                    matched = colId === columnGroup.getGroupId() && instanceId === columnGroup.getInstanceId();
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

    private extractValueColumns(source: ColumnEventType, oldPrimaryColumns: Column[] | undefined): void {
        this.valueColumns = this.extractColumns(
            oldPrimaryColumns,
            this.valueColumns,
            (col: Column, flag: boolean) => col.setValueActive(flag, source),
            // aggFunc doesn't have index variant, cos order of value cols doesn't matter, so always return null
            () => undefined,
            () => undefined,
            // aggFunc is a string, so return it's existence
            (colDef: ColDef) => {
                const aggFunc = colDef.aggFunc;
                // null or empty string means clear
                if (aggFunc === null || aggFunc === '') {
                    return null;
                }
                if (aggFunc === undefined) {
                    return;
                }

                return !!aggFunc;
            },
            (colDef: ColDef) => {
                // return false if any of the following: null, undefined, empty string
                return colDef.initialAggFunc != null && colDef.initialAggFunc != '';
            }
        );

        // all new columns added will have aggFunc missing, so set it to what is in the colDef
        this.valueColumns.forEach(col => {
            const colDef = col.getColDef();
            // if aggFunc provided, we always override, as reactive property
            if (colDef.aggFunc != null && colDef.aggFunc != '') {
                col.setAggFunc(colDef.aggFunc);
            } else {
                // otherwise we use initialAggFunc only if no agg func set - which happens when new column only
                if (!col.getAggFunc()) {
                    col.setAggFunc(colDef.initialAggFunc);
                }
            }
        });
    }

    private extractRowGroupColumns(source: ColumnEventType, oldPrimaryColumns: Column[] | undefined): void {
        this.rowGroupColumns = this.extractColumns(oldPrimaryColumns, this.rowGroupColumns,
            (col: Column, flag: boolean) => col.setRowGroupActive(flag, source),
            (colDef: ColDef) => colDef.rowGroupIndex,
            (colDef: ColDef) => colDef.initialRowGroupIndex,
            (colDef: ColDef) => colDef.rowGroup,
            (colDef: ColDef) => colDef.initialRowGroup,
        );
    }

    private extractColumns(
        oldPrimaryColumns: Column[] = [],
        previousCols: Column[] = [],
        setFlagFunc: (col: Column, flag: boolean) => void,
        getIndexFunc: (colDef: ColDef) => number | null | undefined,
        getInitialIndexFunc: (colDef: ColDef) => number | null | undefined,
        getValueFunc: (colDef: ColDef) => boolean | null | undefined,
        getInitialValueFunc: (colDef: ColDef) => boolean | undefined
    ): Column[] {

        const colsWithIndex: Column[] = [];
        const colsWithValue: Column[] = [];

        // go though all cols.
        // if value, change
        // if default only, change only if new
        (this.primaryColumns || []).forEach(col => {
            const colIsNew = oldPrimaryColumns.indexOf(col) < 0;
            const colDef = col.getColDef();

            const value = attrToBoolean(getValueFunc(colDef));
            const initialValue = attrToBoolean(getInitialValueFunc(colDef));
            const index = attrToNumber(getIndexFunc(colDef));
            const initialIndex = attrToNumber(getInitialIndexFunc(colDef));

            let include: boolean;

            const valuePresent = value !== undefined;
            const indexPresent = index !== undefined;
            const initialValuePresent = initialValue !== undefined;
            const initialIndexPresent = initialIndex !== undefined;

            if (valuePresent) {
                include = value!; // boolean value is guaranteed as attrToBoolean() is used above
            } else if (indexPresent) {
                if (index === null) {
                    // if col is new we don't want to use the default / initial if index is set to null. Similarly,
                    // we don't want to include the property for existing columns, i.e. we want to 'clear' it.
                    include = false;
                } else {
                    // note that 'null >= 0' evaluates to true which means 'rowGroupIndex = null' would enable row
                    // grouping if the null check didn't exist above.
                    include = index! >= 0;
                }
            } else {
                if (colIsNew) {
                    // as no value or index is 'present' we use the default / initial when col is new
                    if (initialValuePresent) {
                        include = initialValue!;
                    } else if (initialIndexPresent) {
                        include = initialIndex != null && initialIndex >= 0;
                    } else {
                        include = false;
                    }
                } else {
                    // otherwise include it if included last time, e.g. if we are extracting row group cols and this col
                    // is an existing row group col (i.e. it exists in 'previousCols') then we should include it.
                    include = previousCols.indexOf(col) >= 0;
                }
            }

            if (include) {
                const useIndex = colIsNew ? (index != null || initialIndex != null) : index != null;
                useIndex ? colsWithIndex.push(col) : colsWithValue.push(col);
            }
        });

        const getIndexForCol = (col: Column): number => {
            const index = getIndexFunc(col.getColDef());
            const defaultIndex = getInitialIndexFunc(col.getColDef());

            return index != null ? index : defaultIndex!;
        };

        // sort cols with index, and add these first
        colsWithIndex.sort((colA, colB) => {
            const indexA = getIndexForCol(colA);
            const indexB = getIndexForCol(colB);

            if (indexA === indexB) { return 0; }
            if (indexA < indexB) { return -1; }

            return 1;
        });

        const res: Column[] = ([] as Column[]).concat(colsWithIndex);

        // second add columns that were there before and in the same order as they were before,
        // so we are preserving order of current grouping of columns that simply have rowGroup=true
        previousCols.forEach(col => {
            if (colsWithValue.indexOf(col) >= 0) {
                res.push(col);
            }
        });

        // lastly put in all remaining cols
        colsWithValue.forEach(col => {
            if (res.indexOf(col) < 0) {
                res.push(col);
            }
        });

        // set flag=false for removed cols
        previousCols.forEach(col => {
            if (res.indexOf(col) < 0) {
                setFlagFunc(col, false);
            }
        });
        // set flag=true for newly added cols
        res.forEach(col => {
            if (previousCols.indexOf(col) < 0) {
                setFlagFunc(col, true);
            }
        });

        return res;
    }

    private extractPivotColumns(source: ColumnEventType, oldPrimaryColumns: Column[] | undefined): void {
        this.pivotColumns = this.extractColumns(
            oldPrimaryColumns,
            this.pivotColumns,
            (col: Column, flag: boolean) => col.setPivotActive(flag, source),
            (colDef: ColDef) => colDef.pivotIndex,
            (colDef: ColDef) => colDef.initialPivotIndex,
            (colDef: ColDef) => colDef.pivot,
            (colDef: ColDef) => colDef.initialPivot,
        );
    }

    public resetColumnGroupState(source: ColumnEventType = "api"): void {
        const stateItems: { groupId: string, open: boolean | undefined; }[] = [];

        this.columnUtils.depthFirstOriginalTreeSearch(null, this.primaryColumnTree, child => {
            if (child instanceof ProvidedColumnGroup) {
                const colGroupDef = child.getColGroupDef();
                const groupState = {
                    groupId: child.getGroupId(),
                    open: !colGroupDef ? undefined : colGroupDef.openByDefault
                };
                stateItems.push(groupState);
            }
        });

        this.setColumnGroupState(stateItems, source);
    }

    public getColumnGroupState(): { groupId: string, open: boolean; }[] {
        const columnGroupState: { groupId: string, open: boolean; }[] = [];

        this.columnUtils.depthFirstOriginalTreeSearch(null, this.gridBalancedTree, node => {
            if (node instanceof ProvidedColumnGroup) {
                columnGroupState.push({
                    groupId: node.getGroupId(),
                    open: node.isExpanded()
                });
            }
        });

        return columnGroupState;
    }

    public setColumnGroupState(stateItems: { groupId: string, open: boolean | undefined; }[], source: ColumnEventType = "api"): void {
        this.columnAnimationService.start();

        const impactedGroups: ProvidedColumnGroup[] = [];

        stateItems.forEach(stateItem => {
            const groupKey = stateItem.groupId;
            const newValue = stateItem.open;
            const providedColumnGroup: ProvidedColumnGroup | null = this.getProvidedColumnGroup(groupKey);

            if (!providedColumnGroup) { return; }
            if (providedColumnGroup.isExpanded() === newValue) { return; }

            this.logger.log('columnGroupOpened(' + providedColumnGroup.getGroupId() + ',' + newValue + ')');
            providedColumnGroup.setExpanded(newValue);
            impactedGroups.push(providedColumnGroup);
        });

        this.updateGroupsAndDisplayedColumns(source);
        this.setFirstRightAndLastLeftPinned(source);

        impactedGroups.forEach(providedColumnGroup => {
            const event: ColumnGroupOpenedEvent = {
                type: Events.EVENT_COLUMN_GROUP_OPENED,
                columnGroup: providedColumnGroup,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event);
        });

        this.columnAnimationService.finish();
    }

    // called by headerRenderer - when a header is opened or closed
    public setColumnGroupOpened(key: ProvidedColumnGroup | string | null, newValue: boolean, source: ColumnEventType = "api"): void {
        let keyAsString: string;

        if (key instanceof ProvidedColumnGroup) {
            keyAsString = key.getId();
        } else {
            keyAsString = key || '';
        }
        this.setColumnGroupState([{ groupId: keyAsString, open: newValue }], source);
    }

    public getProvidedColumnGroup(key: string): ProvidedColumnGroup | null {
        // if (key instanceof ProvidedColumnGroup) { return key; }

        if (typeof key !== 'string') {
            console.error('AG Grid: group key must be a string');
        }

        // otherwise, search for the column group by id
        let res: ProvidedColumnGroup | null = null;

        this.columnUtils.depthFirstOriginalTreeSearch(null, this.gridBalancedTree, node => {
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

        if (this.pivotMode && missing(this.secondaryColumns)) {
            // pivot mode is on, but we are not pivoting, so we only
            // show columns we are aggregating on
            columnsForDisplay = this.gridColumns.filter(column => {
                const isAutoGroupCol = this.groupAutoColumns && includes(this.groupAutoColumns, column);
                const isValueCol = this.valueColumns && includes(this.valueColumns, column);
                return isAutoGroupCol || isValueCol;
            });

        } else {
            // otherwise continue as normal. this can be working on the primary
            // or secondary columns, whatever the gridColumns are set to
            columnsForDisplay = this.gridColumns.filter(column => {
                // keep col if a) it's auto-group or b) it's visible
                const isAutoGroupCol = this.groupAutoColumns && includes(this.groupAutoColumns, column);
                return isAutoGroupCol || column.isVisible();
            });
        }

        return columnsForDisplay;
    }

    private checkColSpanActiveInCols(columns: Column[]): boolean {
        let result = false;

        columns.forEach(col => {
            if (exists(col.getColDef().colSpan)) {
                result = true;
            }
        });

        return result;
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

        if (this.groupAutoColumns) {
            this.groupAutoColumns.forEach(checkFunc);
        }
    }

    public getGroupDisplayColumns(): Column[] {
        return this.groupDisplayColumns;
    }

    public getGroupDisplayColumnForGroup(rowGroupColumnId: string): Column {
        return this.groupDisplayColumnsMap[rowGroupColumnId];
    }

    private updateDisplayedColumns(source: ColumnEventType): void {
        const columnsForDisplay = this.calculateColumnsForDisplay();

        this.buildDisplayedTrees(columnsForDisplay);
        this.calculateColumnsForGroupDisplay();

        // also called when group opened/closed
        this.updateGroupsAndDisplayedColumns(source);

        // also called when group opened/closed
        this.setFirstRightAndLastLeftPinned(source);
    }

    public isSecondaryColumnsPresent(): boolean {
        return exists(this.secondaryColumns);
    }

    public setSecondaryColumns(colDefs: (ColDef | ColGroupDef)[] | null, source: ColumnEventType = "api"): void {
        const newColsPresent = colDefs && colDefs.length > 0;

        // if not cols passed, and we had no cols anyway, then do nothing
        if (!newColsPresent && missing(this.secondaryColumns)) { return; }

        if (newColsPresent) {
            this.processSecondaryColumnDefinitions(colDefs);
            const balancedTreeResult = this.columnFactory.createColumnTree(
                colDefs,
                false,
                this.secondaryBalancedTree || this.previousSecondaryColumns || undefined,
            );
            this.secondaryBalancedTree = balancedTreeResult.columnTree;
            this.secondaryHeaderRowCount = balancedTreeResult.treeDept + 1;
            this.secondaryColumns = this.getColumnsFromTree(this.secondaryBalancedTree);

            this.secondaryColumnsMap = {};
            this.secondaryColumns.forEach(col => this.secondaryColumnsMap[col.getId()] = col);
            this.previousSecondaryColumns = null;
        } else {
            this.previousSecondaryColumns = this.secondaryBalancedTree;
            this.secondaryBalancedTree = null;
            this.secondaryHeaderRowCount = -1;
            this.secondaryColumns = null;
            this.secondaryColumnsMap = {};
        }

        this.updateGridColumns();
        this.updateDisplayedColumns(source);
    }

    private processSecondaryColumnDefinitions(colDefs: (ColDef | ColGroupDef)[] | null): (ColDef | ColGroupDef)[] | undefined {

        const columnCallback = this.gridOptionsWrapper.getProcessPivotResultColDefFunc();
        const groupCallback = this.gridOptionsWrapper.getProcessPivotResultColGroupDefFunc();

        if (!columnCallback && !groupCallback) { return undefined; }

        const searchForColDefs = (colDefs2: (ColDef | ColGroupDef)[]): void => {
            colDefs2.forEach((abstractColDef: AbstractColDef) => {
                const isGroup = exists((abstractColDef as any).children);
                if (isGroup) {
                    const colGroupDef = abstractColDef as ColGroupDef;
                    if (groupCallback) {
                        groupCallback(colGroupDef);
                    }
                    searchForColDefs(colGroupDef.children);
                } else {
                    const colDef = abstractColDef as ColDef;
                    if (columnCallback) {
                        columnCallback(colDef);
                    }
                }
            });
        };

        if (colDefs) {
            searchForColDefs(colDefs);
        }
    }

    // called from: setColumnState, setColumnDefs, setSecondaryColumns
    private updateGridColumns(): void {
        if (this.gridColsArePrimary) {
            this.lastPrimaryOrder = this.gridColumns;
        } else {
            this.lastSecondaryOrder = this.gridColumns;
        }

        if (this.secondaryColumns && this.secondaryBalancedTree) {
            const hasSameColumns = this.secondaryColumns.every((col) => {
                return this.gridColumnsMap[col.getColId()] !== undefined;
            });
            this.gridBalancedTree = this.secondaryBalancedTree.slice();
            this.gridHeaderRowCount = this.secondaryHeaderRowCount;
            this.gridColumns = this.secondaryColumns.slice();
            this.gridColsArePrimary = false;
            // If the current columns are the same or a subset of the previous
            // we keep the previous order, otherwise we go back to the order the pivot
            // cols are generated in
            if (hasSameColumns) {
                this.orderGridColsLike(this.lastSecondaryOrder);
            }
        } else if (this.primaryColumns) {
            this.gridBalancedTree = this.primaryColumnTree.slice();
            this.gridHeaderRowCount = this.primaryHeaderRowCount;
            this.gridColumns = this.primaryColumns.slice();
            this.gridColsArePrimary = true;

            // updateGridColumns gets called after user adds a row group. we want to maintain the order of the columns
            // when this happens (eg if user moved a column) rather than revert back to the original column order.
            // likewise if changing in/out of pivot mode, we want to maintain the order of the cols
            this.orderGridColsLike(this.lastPrimaryOrder);
        }

        this.addAutoGroupToGridColumns();

        this.gridColumns = this.placeLockedColumns(this.gridColumns);
        this.setupQuickFilterColumns();
        this.clearDisplayedAndViewportColumns();

        this.colSpanActive = this.checkColSpanActiveInCols(this.gridColumns);

        this.gridColumnsMap = {};
        this.gridColumns.forEach(col => this.gridColumnsMap[col.getId()] = col);

        this.setAutoHeightActive();

        const event: GridColumnsChangedEvent = {
            type: Events.EVENT_GRID_COLUMNS_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };

        this.eventService.dispatchEvent(event);
    }

    private setAutoHeightActive(): void {
        this.autoHeightActive = this.gridColumns.filter(col => col.isAutoHeight()).length > 0;

        if (this.autoHeightActive) {
            this.autoHeightActiveAtLeastOnce = true;

            const rowModelType = this.rowModel.getType();
            const supportedRowModel = rowModelType === Constants.ROW_MODEL_TYPE_CLIENT_SIDE || rowModelType === Constants.ROW_MODEL_TYPE_SERVER_SIDE;
            if (!supportedRowModel) {
                const message = 'AG Grid - autoHeight columns only work with Client Side Row Model and Server Side Row Model.';
                doOnce(() => console.warn(message), 'autoHeightActive.wrongRowModel');
            }
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

    // if we are using autoGroupCols, then they should be included for quick filter. this covers the
    // following scenarios:
    // a) user provides 'field' into autoGroupCol of normal grid, so now because a valid col to filter leafs on
    // b) using tree data and user depends on autoGroupCol for first col, and we also want to filter on this
    //    (tree data is a bit different, as parent rows can be filtered on, unlike row grouping)
    private setupQuickFilterColumns(): void {
        if (this.groupAutoColumns) {
            this.columnsForQuickFilter = (this.primaryColumns || []).concat(this.groupAutoColumns);
        } else if (this.primaryColumns) {
            this.columnsForQuickFilter = this.primaryColumns;
        }
    }

    private placeLockedColumns(cols: Column[]): Column[] {
        const left: Column[] = [];
        const normal: Column[] = [];
        const right: Column[] = [];
        cols.forEach((col) => {
            const position = col.getColDef().lockPosition;
            if (position === 'right') {
                right.push(col);
            } else if (position === 'left' || position === true) {
                left.push(col);
            } else {
                normal.push(col);
            }
        });
        return [...left, ...normal, ...right];
    }

    private addAutoGroupToGridColumns(): void {
        // add in auto-group here
        this.createGroupAutoColumnsIfNeeded();

        if (missing(this.groupAutoColumns)) { return; }

        this.gridColumns = this.groupAutoColumns ? this.groupAutoColumns.concat(this.gridColumns) : this.gridColumns;

        const autoColBalancedTree = this.columnFactory.createForAutoGroups(this.groupAutoColumns, this.gridBalancedTree);

        this.gridBalancedTree = autoColBalancedTree.concat(this.gridBalancedTree);
    }

    // gets called after we copy down grid columns, to make sure any part of the gui
    // that tries to draw, eg the header, it will get empty lists of columns rather
    // than stale columns. for example, the header will received gridColumnsChanged
    // event, so will try and draw, but it will draw successfully when it acts on the
    // virtualColumnsChanged event
    private clearDisplayedAndViewportColumns(): void {
        this.displayedTreeLeft = [];
        this.displayedTreeRight = [];
        this.displayedTreeCentre = [];

        this.viewportRowLeft = {};
        this.viewportRowRight = {};
        this.viewportRowCenter = {};

        this.displayedColumnsLeft = [];
        this.displayedColumnsRight = [];
        this.displayedColumnsCenter = [];
        this.displayedColumns = [];
        this.viewportColumns = [];
    }

    private updateGroupsAndDisplayedColumns(source: ColumnEventType) {

        this.updateOpenClosedVisibilityInColumnGroups();
        this.deriveDisplayedColumns(source);
        this.refreshFlexedColumns();
        this.extractViewport();
        this.updateBodyWidths();
        // this event is picked up by the gui, headerRenderer and rowRenderer, to recalculate what columns to display

        const event: DisplayedColumnsChangedEvent = {
            type: Events.EVENT_DISPLAYED_COLUMNS_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    }

    private deriveDisplayedColumns(source: ColumnEventType): void {
        this.derivedDisplayedColumnsFromDisplayedTree(this.displayedTreeLeft, this.displayedColumnsLeft);
        this.derivedDisplayedColumnsFromDisplayedTree(this.displayedTreeCentre, this.displayedColumnsCenter);
        this.derivedDisplayedColumnsFromDisplayedTree(this.displayedTreeRight, this.displayedColumnsRight);
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

    private joinDisplayedColumns(): void {
        if (this.gridOptionsWrapper.isEnableRtl()) {
            this.displayedColumns = this.displayedColumnsRight
                .concat(this.displayedColumnsCenter)
                .concat(this.displayedColumnsLeft);
        } else {
            this.displayedColumns = this.displayedColumnsLeft
                .concat(this.displayedColumnsCenter)
                .concat(this.displayedColumnsRight);
        }
    }

    // sets the left pixel position of each column
    private setLeftValues(source: ColumnEventType): void {
        this.setLeftValuesOfColumns(source);
        this.setLeftValuesOfGroups();
    }

    private setLeftValuesOfColumns(source: ColumnEventType): void {
        if (!this.primaryColumns) { return; }

        // go through each list of displayed columns
        const allColumns = this.primaryColumns.slice(0);

        // let totalColumnWidth = this.getWidthOfColsInList()
        const doingRtl = this.gridOptionsWrapper.isEnableRtl();

        [
            this.displayedColumnsLeft,
            this.displayedColumnsRight,
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
            removeAllFromArray(allColumns, columns);
        });

        // items left in allColumns are columns not displayed, so remove the left position. this is
        // important for the rows, as if a col is made visible, then taken out, then made visible again,
        // we don't want the animation of the cell floating in from the old position, whatever that was.
        allColumns.forEach((column: Column) => {
            column.setLeft(null, source);
        });
    }

    private setLeftValuesOfGroups(): void {
        // a groups left value is the lest left value of it's children
        [
            this.displayedTreeLeft,
            this.displayedTreeRight,
            this.displayedTreeCentre
        ].forEach(columns => {
            columns.forEach(column => {
                if (column instanceof ColumnGroup) {
                    const columnGroup = column;
                    columnGroup.checkLeft();
                }
            });
        });
    }

    private derivedDisplayedColumnsFromDisplayedTree(tree: IHeaderColumn[], columns: Column[]): void {
        columns.length = 0;
        this.columnUtils.depthFirstDisplayedColumnTreeSearch(tree, (child: IHeaderColumn) => {
            if (child instanceof Column) {
                columns.push(child);
            }
        });
    }

    private extractViewportColumns(): void {
        if (this.suppressColumnVirtualisation) {
            // no virtualisation, so don't filter
            this.viewportColumnsCenter = this.displayedColumnsCenter;
        } else {
            // filter out what should be visible
            this.viewportColumnsCenter = this.filterOutColumnsWithinViewport();
        }

        this.viewportColumns = this.viewportColumnsCenter
            .concat(this.displayedColumnsLeft)
            .concat(this.displayedColumnsRight);
    }

    public getVirtualHeaderGroupRow(type: string | null, dept: number): IHeaderColumn[] {
        let result: IHeaderColumn[];

        switch (type) {
            case Constants.PINNED_LEFT:
                result = this.viewportRowLeft[dept];
                break;
            case Constants.PINNED_RIGHT:
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

    private extractViewportRows(): void {

        // go through each group, see if any of it's cols are displayed, and if yes,
        // then this group is included
        this.viewportRowLeft = {};
        this.viewportRowRight = {};
        this.viewportRowCenter = {};

        // for easy lookup when building the groups.
        const virtualColIds: { [key: string]: boolean; } = {};
        this.viewportColumns.forEach(col => virtualColIds[col.getId()] = true);

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

        testGroup(this.displayedTreeLeft, this.viewportRowLeft, 0);
        testGroup(this.displayedTreeRight, this.viewportRowRight, 0);
        testGroup(this.displayedTreeCentre, this.viewportRowCenter, 0);
    }

    private extractViewport(): void {
        this.extractViewportColumns();
        this.extractViewportRows();
    }

    private filterOutColumnsWithinViewport(): Column[] {
        return this.displayedColumnsCenter.filter(this.isColumnInViewport.bind(this));
    }

    public refreshFlexedColumns(params: { resizingCols?: Column[], skipSetLeft?: boolean, viewportWidth?: number, source?: ColumnEventType, fireResizedEvent?: boolean, updateBodyWidths?: boolean; } = {}): Column[] {
        const source = params.source ? params.source : 'flex';

        if (params.viewportWidth != null) {
            this.flexViewportWidth = params.viewportWidth;
        }

        if (!this.flexViewportWidth) { return []; }

        // If the grid has left-over space, divide it between flexing columns in proportion to their flex value.
        // A "flexing column" is one that has a 'flex' value set and is not currently being constrained by its
        // minWidth or maxWidth rules.

        let flexAfterDisplayIndex = -1;
        if (params.resizingCols) {
            params.resizingCols.forEach(col => {
                const indexOfCol = this.displayedColumnsCenter.indexOf(col);
                if (flexAfterDisplayIndex < indexOfCol) {
                    flexAfterDisplayIndex = indexOfCol;
                }
            });
        }

        const isColFlex = (col: Column) => {
            const afterResizingCols = this.displayedColumnsCenter.indexOf(col) > flexAfterDisplayIndex;
            return col.getFlex() && afterResizingCols;
        };
        const knownWidthColumns = this.displayedColumnsCenter.filter(col => !isColFlex(col));
        const flexingColumns = this.displayedColumnsCenter.filter(col => isColFlex(col));
        const changedColumns: Column[] = [];

        if (!flexingColumns.length) {
            return [];
        }

        const flexingColumnSizes: number[] = [];
        let spaceForFlexingColumns: number;

        outer: while (true) {
            const totalFlex = flexingColumns.reduce((count, col) => count + col.getFlex(), 0);
            spaceForFlexingColumns = this.flexViewportWidth - this.getWidthOfColsInList(knownWidthColumns);
            for (let i = 0; i < flexingColumns.length; i++) {
                const col = flexingColumns[i];
                const widthByFlexRule = spaceForFlexingColumns * col.getFlex() / totalFlex;
                let constrainedWidth = 0;

                const minWidth = col.getMinWidth();
                const maxWidth = col.getMaxWidth();

                if (exists(minWidth) && widthByFlexRule < minWidth) {
                    constrainedWidth = minWidth;
                } else if (exists(maxWidth) && widthByFlexRule > maxWidth) {
                    constrainedWidth = maxWidth;
                }

                if (constrainedWidth) {
                    // This column is not in fact flexing as it is being constrained to a specific size
                    // so remove it from the list of flexing columns and start again
                    col.setActualWidth(constrainedWidth, source);
                    removeFromArray(flexingColumns, col);
                    changedColumns.push(col);
                    knownWidthColumns.push(col);
                    continue outer;
                }

                flexingColumnSizes[i] = Math.round(widthByFlexRule);
            }
            break;
        }

        let remainingSpace = spaceForFlexingColumns;
        flexingColumns.forEach((col, i) => {
            col.setActualWidth(Math.min(flexingColumnSizes[i], remainingSpace), source);
            changedColumns.push(col);
            remainingSpace -= flexingColumnSizes[i];
        });

        if (!params.skipSetLeft) {
            this.setLeftValues(source);
        }

        if (params.updateBodyWidths) {
            this.updateBodyWidths();
        }

        if (params.fireResizedEvent) {
            this.fireColumnResizedEvent(changedColumns, true, source, flexingColumns);
        }

        // if the user sets rowData directly into GridOptions, then the row data is set before
        // grid is attached to the DOM. this means the columns are not flexed, and then the rows
        // have the wrong height (as they depend on column widths). so once the columns have
        // been flexed for the first time (only happens once grid is attached to DOM, as dependency
        // on getting the grid width, which only happens after attached after ResizeObserver fires)
        // we get get rows to re-calc their heights.
        if (!this.flexColsCalculatedAtLestOnce) {
            if (this.gridOptionsWrapper.isRowModelDefault()) {
                (this.rowModel as IClientSideRowModel).resetRowHeights();
            }
            this.flexColsCalculatedAtLestOnce = true;
        }

        return flexingColumns;
    }

    // called from api
    public sizeColumnsToFit(gridWidth: any, source: ColumnEventType = "sizeColumnsToFit", silent?: boolean): void {
        // avoid divide by zero
        const allDisplayedColumns = this.getAllDisplayedColumns();

        const doColumnsAlreadyFit = gridWidth === this.getWidthOfColsInList(allDisplayedColumns);
        if (gridWidth <= 0 || !allDisplayedColumns.length || doColumnsAlreadyFit) { return; }

        const colsToSpread: Column[] = [];
        const colsToNotSpread: Column[] = [];

        allDisplayedColumns.forEach(column => {
            if (column.getColDef().suppressSizeToFit === true) {
                colsToNotSpread.push(column);
            } else {
                colsToSpread.push(column);
            }
        });

        // make a copy of the cols that are going to be resized
        const colsToFireEventFor = colsToSpread.slice(0);
        let finishedResizing = false;

        const moveToNotSpread = (column: Column) => {
            removeFromArray(colsToSpread, column);
            colsToNotSpread.push(column);
        };

        // resetting cols to their original width makes the sizeColumnsToFit more deterministic,
        // rather than depending on the current size of the columns. most users call sizeColumnsToFit
        // immediately after grid is created, so will make no difference. however if application is calling
        // sizeColumnsToFit repeatedly (eg after column group is opened / closed repeatedly) we don't want
        // the columns to start shrinking / growing over time.
        //
        // NOTE: the process below will assign values to `this.actualWidth` of each column without firing events
        // for this reason we need to manually fire resize events after the resize has been done for each column.
        colsToSpread.forEach(column => column.resetActualWidth(source));

        while (!finishedResizing) {
            finishedResizing = true;
            const availablePixels = gridWidth - this.getWidthOfColsInList(colsToNotSpread);
            if (availablePixels <= 0) {
                // no width, set everything to minimum
                colsToSpread.forEach((column: Column) => {
                    column.setMinimum(source);
                });
            } else {
                const scale = availablePixels / this.getWidthOfColsInList(colsToSpread);
                // we set the pixels for the last col based on what's left, as otherwise
                // we could be a pixel or two short or extra because of rounding errors.
                let pixelsForLastCol = availablePixels;
                // backwards through loop, as we are removing items as we go
                for (let i = colsToSpread.length - 1; i >= 0; i--) {
                    const column = colsToSpread[i];
                    const minWidth = column.getMinWidth();
                    const maxWidth = column.getMaxWidth();
                    let newWidth = Math.round(column.getActualWidth() * scale);

                    if (exists(minWidth) && newWidth < minWidth) {
                        newWidth = minWidth;
                        moveToNotSpread(column);
                        finishedResizing = false;
                    } else if (exists(maxWidth) && column.isGreaterThanMax(newWidth)) {
                        newWidth = maxWidth;
                        moveToNotSpread(column);
                        finishedResizing = false;
                    } else if (i === 0) { // if this is the last column
                        newWidth = pixelsForLastCol;
                    }

                    column.setActualWidth(newWidth, source, true);
                    pixelsForLastCol -= newWidth;
                }
            }
        }

        // see notes above
        colsToFireEventFor.forEach(col => {
            col.fireColumnWidthChangedEvent(source);
        });

        this.setLeftValues(source);
        this.updateBodyWidths();

        if (silent) { return; }

        this.fireColumnResizedEvent(colsToFireEventFor, true, source);
    }

    private buildDisplayedTrees(visibleColumns: Column[]) {
        const leftVisibleColumns: Column[] = [];
        const rightVisibleColumns: Column[] = [];
        const centerVisibleColumns: Column[] = [];

        visibleColumns.forEach(column => {
            switch (column.getPinned()) {
                case "left":
                    leftVisibleColumns.push(column);
                    break;
                case "right":
                    rightVisibleColumns.push(column);
                    break;
                default:
                    centerVisibleColumns.push(column);
                    break;
            }
        });

        const groupInstanceIdCreator = new GroupInstanceIdCreator();

        this.displayedTreeLeft = this.displayedGroupCreator.createDisplayedGroups(
            leftVisibleColumns, this.gridBalancedTree, groupInstanceIdCreator, Constants.PINNED_LEFT, this.displayedTreeLeft);
        this.displayedTreeRight = this.displayedGroupCreator.createDisplayedGroups(
            rightVisibleColumns, this.gridBalancedTree, groupInstanceIdCreator, Constants.PINNED_RIGHT, this.displayedTreeRight);
        this.displayedTreeCentre = this.displayedGroupCreator.createDisplayedGroups(
            centerVisibleColumns, this.gridBalancedTree, groupInstanceIdCreator, null, this.displayedTreeCentre);

        this.updateDisplayedMap();
    }

    private updateDisplayedMap(): void {
        this.displayedColumnsAndGroupsMap = {};

        const func = (child: IHeaderColumn) => {
            this.displayedColumnsAndGroupsMap[child.getUniqueId()] = child;
        };

        this.columnUtils.depthFirstAllColumnTreeSearch(this.displayedTreeCentre, func);
        this.columnUtils.depthFirstAllColumnTreeSearch(this.displayedTreeLeft, func);
        this.columnUtils.depthFirstAllColumnTreeSearch(this.displayedTreeRight, func);
    }

    public isDisplayed(item: IHeaderColumn): boolean {
        const fromMap = this.displayedColumnsAndGroupsMap[item.getUniqueId()];
        // check for reference, in case new column / group with same id is now present
        return fromMap === item;
    }

    private updateOpenClosedVisibilityInColumnGroups(): void {
        const allColumnGroups = this.getAllDisplayedTrees();

        this.columnUtils.depthFirstAllColumnTreeSearch(allColumnGroups, child => {
            if (child instanceof ColumnGroup) {
                const columnGroup = child;
                columnGroup.calculateDisplayedColumns();
            }
        });
    }

    public getGroupAutoColumns(): Column[] | null {
        return this.groupAutoColumns;
    }

    private createGroupAutoColumnsIfNeeded(): void {
        if (!this.autoGroupsNeedBuilding) { return; }

        this.autoGroupsNeedBuilding = false;

        const groupFullWidthRow = this.gridOptionsWrapper.isGroupUseEntireRow(this.pivotMode);
        // we need to allow suppressing auto-column separately for group and pivot as the normal situation
        // is CSRM and user provides group column themselves for normal view, but when they go into pivot the
        // columns are generated by the grid so no opportunity for user to provide group column. so need a way
        // to suppress auto-col for grouping only, and not pivot.
        // however if using Viewport RM or SSRM and user is providing the columns, the user may wish full control
        // of the group column in this instance.
        const suppressAutoColumn = this.pivotMode ?
            this.gridOptionsWrapper.isPivotSuppressAutoColumn() : this.gridOptionsWrapper.isGroupSuppressAutoColumn();

        const groupingActive = this.rowGroupColumns.length > 0 || this.usingTreeData;
        const needAutoColumns = groupingActive && !suppressAutoColumn && !groupFullWidthRow;

        if (needAutoColumns) {
            const existingCols = this.groupAutoColumns || [];
            const newAutoGroupCols = this.autoGroupColService.createAutoGroupColumns(existingCols, this.rowGroupColumns);
            const autoColsDifferent = !this.autoColsEqual(newAutoGroupCols, this.groupAutoColumns);
            // we force recreate when suppressColumnStateEvents changes, so new group cols pick up the new
            // definitions. otherwise we could ignore the new cols because they appear to be the same.
            if (autoColsDifferent || this.forceRecreateAutoGroups) {
                this.groupAutoColumns = newAutoGroupCols;
            }
        } else {
            this.groupAutoColumns = null;
        }
    }

    private autoColsEqual(colsA: Column[] | null, colsB: Column[] | null): boolean {
        return areEqual(colsA, colsB, (a, b) => a.getColId() === b.getColId());
    }

    private getWidthOfColsInList(columnList: Column[]) {
        return columnList.reduce((width, col) => width + col.getActualWidth(), 0);
    }

    public getGridBalancedTree(): IProvidedColumn[] {
        return this.gridBalancedTree;
    }

    public hasFloatingFilters(): boolean {
        if (!this.gridColumns) { return false; }
        const res = this.gridColumns.some(col => col.getColDef().floatingFilter);
        return res;
    }

    public getFirstDisplayedColumn(): Column | null {
        const isRtl = this.gridOptionsWrapper.isEnableRtl();
        const queryOrder: ('getDisplayedLeftColumns' | 'getDisplayedCenterColumns' | 'getDisplayedRightColumns')[] = [
            'getDisplayedLeftColumns',
            'getDisplayedCenterColumns',
            'getDisplayedRightColumns'
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
            const event: ColumnEvent = {
                type: Events.EVENT_COLUMN_HEADER_HEIGHT_CHANGED,
                column: col,
                columns: [col],
                api: this.gridApi,
                columnApi: this.columnApi,
                source: 'autosizeColumnHeaderHeight',
            };
            this.eventService.dispatchEvent(event);
        }
    }

    public getColumnGroupHeaderRowHeight(): number {
        if (this.isPivotMode()) {
            return this.gridOptionsWrapper.getPivotGroupHeaderHeight() as number;
        } else {
            return this.gridOptionsWrapper.getGroupHeaderHeight() as number;
        }
    }

    public getColumnHeaderRowHeight(): number {
        const defaultHeight: number = (this.isPivotMode() ?
            this.gridOptionsWrapper.getPivotHeaderHeight() :
            this.gridOptionsWrapper.getHeaderHeight()) as number;

        const displayedHeights = this.getAllDisplayedColumns()
            .filter((col) => col.isAutoHeaderHeight())
            .map((col) => col.getAutoHeaderHeight() || 0);

        return Math.max(defaultHeight, ...displayedHeights);
    }
}
