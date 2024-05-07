import { ColumnGroup } from '../entities/columnGroup';
import { Column, ColumnInstanceId, ColumnPinnedType } from '../entities/column';
import { AbstractColDef, ColDef, ColGroupDef, IAggFunc, HeaderValueGetterParams, HeaderLocation } from '../entities/colDef';
import { HeaderColumnId, IHeaderColumn } from '../interfaces/iHeaderColumn';
import { ExpressionService } from '../valueService/expressionService';
import { ColumnFactory, depthFirstOriginalTreeSearch } from './columnFactory';
import { DisplayedColumnsService } from './displayedColumnsService';
import { IProvidedColumn } from '../interfaces/iProvidedColumn';
import {
    ColumnEvent,
    ColumnEventType,
    ColumnPinnedEvent,
    DisplayedColumnsWidthChangedEvent,
    Events,
    ColumnContainerWidthChanged
} from '../events';
import { BeanStub } from "../context/beanStub";
import { ProvidedColumnGroup } from '../entities/providedColumnGroup';
import { GroupInstanceIdCreator } from './groupInstanceIdCreator';
import { Autowired, Bean, Optional, PostConstruct, PreDestroy, Qualifier } from '../context/context';
import { IAggFuncService } from '../interfaces/iAggFuncService';
import { ColumnAnimationService } from '../rendering/columnAnimationService';
import { AutoGroupColService, GROUP_AUTO_COLUMN_ID } from './autoGroupColService';
import { RowNode } from '../entities/rowNode';
import { ValueCache } from '../valueService/valueCache';
import { areEqual, last, removeFromArray, moveInArray, includes, insertIntoArray, removeAllFromUnorderedArray, removeFromUnorderedArray } from '../utils/array';
import { missingOrEmpty, exists, missing, attrToBoolean, attrToNumber } from '../utils/generic';
import { camelCaseToHumanText } from '../utils/string';
import { ColumnDefFactory } from "./columnDefFactory";
import { convertToMap } from '../utils/map';
import { warnOnce } from '../utils/function';
import { CtrlsService } from '../ctrlsService';
import { WithoutGridCommon } from '../interfaces/iCommon';
import { PropertyChangedSource } from '../gridOptionsService';
import { ColumnApplyStateService, ModifyColumnsNoEventsCallbacks } from './columnApplyStateService';
import { ColumnEventDispatcher } from './columnEventDispatcher';
import { ColumnMoveService } from './columnMoveService';
import { ColumnAutosizeService } from './columnAutosizeService';
import { ColumnUtilsFeature } from './columnUtilsFeature';
import { ColumnGroupStateService } from './columnGroupStateService';
import { ColumnSizeService } from './columnSizeService';
import { FunctionColumnsService } from './functionColumnsService';
import { ColumnViewportService } from './columnViewportService';
import { ColumnPivotService } from './columnPivotService';

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

export type ColKey<TData = any, TValue = any> = string | ColDef<TData, TValue> | Column<TValue>;
export type Maybe<T> = T | null | undefined;

@Bean('columnModel')
export class ColumnModel extends BeanStub {

    @Autowired('columnFactory') private columnFactory: ColumnFactory;
    @Autowired('columnSizeService') private columnSizeService: ColumnSizeService;
    @Autowired('displayedColumnsService') private displayedColumnsService: DisplayedColumnsService;
    @Autowired('columnViewportService') private columnViewportService: ColumnViewportService;
    @Autowired('columnPivotService') private columnPivotService: ColumnPivotService;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;
    @Autowired('columnAnimationService') private columnAnimationService: ColumnAnimationService;
    @Autowired('autoGroupColService') private autoGroupColService: AutoGroupColService;
    @Autowired('valueCache') private valueCache: ValueCache;
    @Autowired('columnDefFactory') private columnDefFactory: ColumnDefFactory;
    @Autowired('columnApplyStateService') private columnApplyStateService: ColumnApplyStateService;
    @Autowired('columnGroupStateService') private columnGroupStateService: ColumnGroupStateService;
    @Autowired('columnEventDispatcher') private eventDispatcher: ColumnEventDispatcher;
    @Autowired('columnMoveService') private columnMoveService: ColumnMoveService;
    @Autowired('columnAutosizeService') private columnAutosizeService: ColumnAutosizeService;
    @Autowired('functionColumnsService') private functionColumnsService: FunctionColumnsService;

    private columnUtilsFeature: ColumnUtilsFeature;

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

    // the columns the quick filter should use. this will be all primary columns
    // plus the autoGroupColumns if any exist
    private columnsForQuickFilter: Column[];

    // these are all columns that are available to the grid for rendering after pivot
    private gridBalancedTree: IProvidedColumn[];
    private gridColumns: Column[];
    private gridColumnsMap: { [id: string]: Column };

    private groupAutoColsBalancedTree: IProvidedColumn[] | null;

    // header row count, either above, or based on pivoting if we are pivoting
    private gridHeaderRowCount = 0;

    private lastPrimaryOrder: Column[];
    private lastSecondaryOrder: Column[];
    private gridColsArePrimary: boolean;

    // primary columns -> what the user provides
    // secondary columns -> columns generated as a result of a pivot
    // displayed columns -> columns that are 1) visible and 2) parent groups are opened. thus can be rendered
    // viewport columns -> centre columns only, what columns are to be rendered due to column virtualisation

    // true if we are doing column spanning
    private colSpanActive: boolean;

    // grid columns that have colDef.autoHeight set
    private autoHeightActive: boolean;
    private autoHeightActiveAtLeastOnce = false;

    private groupAutoColumns: Column[] | null;

    private ready = false;
    private changeEventsDispatching = false;

    public autoGroupsNeedBuilding = false;
    private forceRecreateAutoGroups = false;

    private pivotMode = false;

    private groupDisplayColumns: Column[];
    private groupDisplayColumnsMap: { [originalColumnId: string]: Column };

    // when we're waiting for cell data types to be inferred, we need to defer column resizing
    private shouldQueueResizeOperations: boolean = false;
    private resizeOperationQueue: (() => void)[] = [];

    private columnDefs: (ColDef | ColGroupDef)[];

    @PostConstruct
    public init(): void {
        this.columnUtilsFeature = this.createManagedBean(new ColumnUtilsFeature());

        const pivotMode = this.gos.get('pivotMode');

        if (this.isPivotSettingAllowed(pivotMode)) {
            this.pivotMode = pivotMode;
        }

        this.addManagedPropertyListeners(['groupDisplayType', 'treeData', 'treeDataDisplayType', 'groupHideOpenParents'], (event) => this.buildAutoGroupColumns(convertSourceType(event.source)));
        this.addManagedPropertyListener('autoGroupColumnDef', (event) => this.onAutoGroupColumnDefChanged(convertSourceType(event.source)));
        this.addManagedPropertyListeners(['defaultColDef', 'columnTypes', 'suppressFieldDotNotation'], event => this.recreateColumnDefs(convertSourceType(event.source)));
        this.addManagedPropertyListener('pivotMode', event => this.setPivotMode(this.gos.get('pivotMode'), convertSourceType(event.source)));
        this.addManagedListener(this.eventService, Events.EVENT_FIRST_DATA_RENDERED, () => this.onFirstDataRendered());
    }

    public pushResizeOperation(func: ()=> void): void {
        this.resizeOperationQueue.push(func);
    }

    private buildAutoGroupColumns(source: ColumnEventType) {
        // Possible for update to be called before columns are present in which case there is nothing to do here.
        if (!this.columnDefs) { return; }

        this.autoGroupsNeedBuilding = true;
        this.forceRecreateAutoGroups = true;
        this.updateGridColumns();
        this.updateDisplayedColumns(source);
    }

    private onAutoGroupColumnDefChanged(source: ColumnEventType) {
        if (this.groupAutoColumns) {
            this.autoGroupColService.updateAutoGroupColumns(this.groupAutoColumns, source);
        }
    }

    // called when dataTypes change
    public recreateColumnDefs(source: ColumnEventType): void {
        if (!this.gridColumns) { return; }

        // if we aren't going to force, update the auto cols in place
        if (this.groupAutoColumns) {
            this.autoGroupColService.updateAutoGroupColumns(this.groupAutoColumns, source);
        }
        this.createColumnsFromColumnDefs(true, source);
    }

    public setColumnDefs(columnDefs: (ColDef | ColGroupDef)[], source: ColumnEventType) {
        const colsPreviouslyExisted = !!this.columnDefs;
        this.columnDefs = columnDefs;
        this.createColumnsFromColumnDefs(colsPreviouslyExisted, source);
    }

    @PreDestroy
    private destroyColumns(): void {
        this.columnUtilsFeature.destroyOldColumns(this.primaryColumnTree);
        this.columnUtilsFeature.destroyOldColumns(this.groupAutoColsBalancedTree);
    }

    private createColumnsFromColumnDefs(colsPreviouslyExisted: boolean, source: ColumnEventType): void {
        // only need to dispatch before/after events if updating columns, never if setting columns for first time
        const dispatchEventsFunc = colsPreviouslyExisted ? this.columnApplyStateService.compareColumnStatesAndDispatchEvents(source) : undefined;

        // always invalidate cache on changing columns, as the column id's for the new columns
        // could overlap with the old id's, so the cache would return old values for new columns.
        this.valueCache.expire();

        // NOTE ==================
        // we should be destroying the existing columns and groups if they exist, for example, the original column
        // group adds a listener to the columns, it should be also removing the listeners
        this.autoGroupsNeedBuilding = true;

        const oldPrimaryColumns = this.primaryColumns;
        const oldPrimaryTree = this.primaryColumnTree;
        const balancedTreeResult = this.columnFactory.createColumnTree(this.columnDefs, true, oldPrimaryTree, source);

        this.columnUtilsFeature.destroyOldColumns(this.primaryColumnTree, balancedTreeResult.columnTree);
        this.primaryColumnTree = balancedTreeResult.columnTree;
        this.primaryHeaderRowCount = balancedTreeResult.treeDept + 1;

        this.primaryColumns = this.columnUtilsFeature.getColumnsFromTree(this.primaryColumnTree);
        this.primaryColumnsMap = {};
        this.primaryColumns.forEach(col => this.primaryColumnsMap[col.getId()] = col);

        this.functionColumnsService.extractColumns(source, oldPrimaryColumns);

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
            this.columnViewportService.checkViewportColumns();
        }

        // this event is not used by AG Grid, but left here for backwards compatibility,
        // in case applications use it
        this.eventDispatcher.everythingChanged(source);

        // Row Models react to all of these events as well as new columns loaded,
        // this flag instructs row model to ignore these events to reduce refreshes.
        this.changeEventsDispatching = true;
        if (dispatchEventsFunc) {
            dispatchEventsFunc();
        }
        this.changeEventsDispatching = false;

        this.eventDispatcher.newColumnsLoaded(source);
        if (source === 'gridInitializing') {
            this.applyAutosizeStrategy();
        }
    }

    public shouldRowModelIgnoreRefresh(): boolean {
        return this.changeEventsDispatching;
    }

    private orderGridColumnsLikePrimary(): void {
        const primaryColumns = this.primaryColumns;

        if (!primaryColumns) { return; }

        const primaryColsOrdered = primaryColumns.filter(col => this.gridColumns.indexOf(col) >= 0);
        const otherCols = this.gridColumns.filter(col => primaryColsOrdered.indexOf(col) < 0);

        this.gridColumns = [...otherCols, ...primaryColsOrdered];
        this.gridColumns = this.columnMoveService.placeLockedColumns(this.gridColumns);
    }

    public isPivotMode(): boolean {
        return this.pivotMode;
    }

    private isPivotSettingAllowed(pivot: boolean): boolean {
        if (pivot && this.gos.get('treeData')) {
            warnOnce("Pivot mode not available with treeData.");
            return false;
        }

        return true;
    }

    private setPivotMode(pivotMode: boolean, source: ColumnEventType): void {
        if (pivotMode === this.pivotMode || !this.isPivotSettingAllowed(this.pivotMode)) { return; }

        this.pivotMode = pivotMode;

        if (!this.gridColumns) { return; }

        // we need to update grid columns to cover the scenario where user has groupDisplayType = 'custom', as
        // this means we don't use auto group column UNLESS we are in pivot mode (it's mandatory in pivot mode),
        // so need to updateGridColumn() to check it autoGroupCol needs to be added / removed
        this.autoGroupsNeedBuilding = true;
        this.updateGridColumns();
        this.updateDisplayedColumns(source);

        this.eventDispatcher.pivotModeChanged();
    }

    public setFirstRightAndLastLeftPinned(source: ColumnEventType): void {
        const {lastLeft, firstRight} = this.displayedColumnsService.getFirstRightAndLastLeftPinned();

        this.gridColumns.forEach((column: Column) => {
            column.setLastLeftPinned(column === lastLeft, source);
            column.setFirstRightPinned(column === firstRight, source);
        });
    }

    public getGridBalancedTree(): IProvidedColumn[] {
        return this.gridBalancedTree;
    }

    // + columnSelectPanel
    public getPrimaryColumnTree(): IProvidedColumn[] {
        return this.primaryColumnTree;
    }

    // + gridPanel -> for resizing the body and setting top margin
    public getHeaderRowCount(): number {
        return this.gridHeaderRowCount;
    }

    public isColSpanActive(): boolean {
        return this.colSpanActive;
    }

    // niall note - temp method, should not be exposing this variable in final version
    public setAutoGroupsNeedBuilding(): void {
        this.autoGroupsNeedBuilding = true;
    }

    // niall note - temp method, should not be exposing this variable in final version
    public isAutoGroupsNeedBuilding(): boolean {
        return this.autoGroupsNeedBuilding;
    }
    
    public getPrimaryOrGridColumn(key: ColKey): Column | null {
        const column = this.getPrimaryColumn(key);

        return column || this.getGridColumn(key);
    }

    public setColumnAggFunc(key: Maybe<ColKey>, aggFunc: string | IAggFunc | null | undefined, source: ColumnEventType): void {
        if (!key) { return; }

        const column = this.getPrimaryColumn(key);
        if (!column) { return; }

        column.setAggFunc(aggFunc);

        this.eventDispatcher.columnChanged(Events.EVENT_COLUMN_VALUE_CHANGED, [column], source);
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

    public getColumnDefs(): (ColDef | ColGroupDef)[] | undefined {
        if (!this.primaryColumns) { return; }

        const cols = this.primaryColumns.slice();

        if (this.gridColsArePrimary) {
            cols.sort((a: Column, b: Column) => this.gridColumns.indexOf(a) - this.gridColumns.indexOf(b));
        } else if (this.lastPrimaryOrder) {
            cols.sort((a: Column, b: Column) => this.lastPrimaryOrder.indexOf(a) - this.lastPrimaryOrder.indexOf(b));
        }

        const rowGroupColumns = this.functionColumnsService.getRowGroupColumns();
        const pivotColumns = this.functionColumnsService.getPivotColumns();

        return this.columnDefFactory.buildColumnDefs(cols, rowGroupColumns, pivotColumns);
    }

    // + clientSideRowModel
    public isPivotActive(): boolean {
        const pivotColumns = this.functionColumnsService.getPivotColumns();
        return this.pivotMode && !missingOrEmpty(pivotColumns);
    }

    // used by:
    // + clientSideRowController -> sorting, building quick filter text
    // + headerRenderer -> sorting (clearing icon)
    public getAllPrimaryColumns(): Column[] | null {
        return this.primaryColumns ? this.primaryColumns : null;
    }

    public getAllColumnsForQuickFilter(): Column[] {
        return this.columnsForQuickFilter;
    }

    // + moveColumnController
    public getAllGridColumns(): Column[] {
        return this.gridColumns ?? [];
    }

    public setColumnsVisible(keys: (string | Column)[], visible = false, source: ColumnEventType): void {
        this.applyColumnState({
            state: keys.map<ColumnState>(
                key => ({
                    colId: typeof key === 'string' ? key : key.getColId(),
                    hide: !visible,
                })
            ),
        }, source);
    }

    public setColumnsPinned(keys: Maybe<ColKey>[], pinned: ColumnPinnedType, source: ColumnEventType): void {
        if (!this.gridColumns) { return; }

        if (this.gos.isDomLayout('print')) {
            console.warn(`AG Grid: Changing the column pinning status is not allowed with domLayout='print'`);
            return;
        }
        this.columnAnimationService.start();

        let actualPinned: ColumnPinnedType;
        if (pinned === true || pinned === 'left') {
            actualPinned = 'left';
        } else if (pinned === 'right') {
            actualPinned = 'right';
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
            const event: WithoutGridCommon<ColumnPinnedEvent> = {
                type: Events.EVENT_COLUMN_PINNED,
                pinned: actualPinned,
                column: null,
                columns: null,
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
    public actionOnGridColumns(// the column keys this action will be on
        keys: Maybe<ColKey>[],
        // the action to do - if this returns false, the column was skipped
        // and won't be included in the event
        action: (column: Column) => boolean,
        // should return back a column event of the right type
        source: ColumnEventType,
        createEvent?: () => WithoutGridCommon<ColumnEvent>): void {

        if (missingOrEmpty(keys)) { return; }

        const updatedColumns: Column[] = [];

        keys.forEach(key => {
            if (!key) { return; }
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

        if (createEvent==null) { return; }

        const event = createEvent();

        event.columns = updatedColumns;
        event.column = updatedColumns.length === 1 ? updatedColumns[0] : null;

        this.eventService.dispatchEvent(event);
    }

    public getPrimaryAndSecondaryAndAutoColumns(): Column[] {
        return ([] as Column[]).concat(...[
            this.primaryColumns || [],
            this.groupAutoColumns || [],
            this.columnPivotService.getSecondaryColumns() || [],
        ]);
    }

    // niall note - this method should be in columnApplyStateService,
    // but is uses so many methods and variables of ColumnModel, it's
    // difficult to extract out
    public applyColumnState(params: ApplyColumnStateParams, source: ColumnEventType): boolean {
        if (missingOrEmpty(this.primaryColumns)) { return false; }

        if (params && params.state && !params.state.forEach) {
            console.warn('AG Grid: applyColumnState() - the state attribute should be an array, however an array was not found. Please provide an array of items (one for each col you want to change) for state.');
            return false;
        }

        const callbacks = this.functionColumnsService.getModifyColumnsNoEventsCallbacks();

        const applyStates = (states: ColumnState[], existingColumns: Column[], getById: (id: string) => Column | null) => {
            const dispatchEventsFunc = this.columnApplyStateService.compareColumnStatesAndDispatchEvents(source);
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

            const previousRowGroupCols = this.functionColumnsService.getRowGroupColumns().slice();
            const previousPivotCols = this.functionColumnsService.getPivotColumns().slice();

            states.forEach((state: ColumnState) => {
                const colId = state.colId || '';

                // auto group columns are re-created so deferring syncing with ColumnState
                const isAutoGroupColumn = colId.startsWith(GROUP_AUTO_COLUMN_ID);
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
                    this.columnApplyStateService.syncColumnWithStateItem(column, state, params.defaultState, rowGroupIndexes,
                        pivotIndexes, false, source, callbacks);
                    removeFromArray(columnsWithNoState, column);
                }
            });

            // anything left over, we got no data for, so add in the column as non-value, non-rowGroup and hidden
            const applyDefaultsFunc = (col: Column) =>
                this.columnApplyStateService.syncColumnWithStateItem(col, null, params.defaultState, rowGroupIndexes,
                    pivotIndexes, false, source, callbacks);

            columnsWithNoState.forEach(applyDefaultsFunc);

            this.functionColumnsService.sortRowGroupColumns(comparatorByIndex.bind(this, rowGroupIndexes, previousRowGroupCols));
            this.functionColumnsService.sortPivotColumns(comparatorByIndex.bind(this, pivotIndexes, previousPivotCols));

            this.updateGridColumns();

            // sync newly created auto group columns with ColumnState
            const autoGroupColsCopy = this.groupAutoColumns ? this.groupAutoColumns.slice() : [];
            autoGroupColumnStates.forEach(stateItem => {
                const autoCol = this.getAutoColumn(stateItem.colId!);
                removeFromArray(autoGroupColsCopy, autoCol);
                this.columnApplyStateService.syncColumnWithStateItem(autoCol, stateItem, params.defaultState, null, null, true, source, callbacks);
            });
            // autogroup cols with nothing else, apply the default
            autoGroupColsCopy.forEach(applyDefaultsFunc);

            this.gridColumns = this.columnApplyStateService.applyOrderAfterApplyState(params, this.gridColumns, this.gridColumnsMap);
            this.updateDisplayedColumns(source);
            this.eventDispatcher.everythingChanged(source);

            dispatchEventsFunc(); // Will trigger secondary column changes if pivoting modified
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
                this.columnPivotService.getSecondaryColumns() || [],
                (id) => this.columnPivotService.getSecondaryColumn(id)
            ).unmatchedCount;
        }
        this.columnAnimationService.finish();

        return unmatchedCount === 0; // Successful if no states unaccounted for
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

    public getColumn(key: ColKey, columnList: Column[], columnMap: { [id: string]: Column }): Column | null {
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

    public isReady(): boolean {
        return this.ready;
    }

    // called by headerRenderer - when a header is opened or closed
    public setColumnGroupOpened(key: ProvidedColumnGroup | string | null, newValue: boolean, source: ColumnEventType): void {
        let keyAsString: string;

        if (key instanceof ProvidedColumnGroup) {
            keyAsString = key.getId();
        } else {
            keyAsString = key || '';
        }
        this.columnGroupStateService.setColumnGroupState([{ groupId: keyAsString, open: newValue }], source);
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

        const secondaryColumns = this.columnPivotService.getSecondaryColumns();
        if (this.pivotMode && missing(secondaryColumns)) {
            // pivot mode is on, but we are not pivoting, so we only
            // show columns we are aggregating on
            const valueColumns = this.functionColumnsService.getValueColumns();
            columnsForDisplay = this.gridColumns.filter(column => {
                const isAutoGroupCol = this.groupAutoColumns && includes(this.groupAutoColumns, column);
                const isValueCol = valueColumns && includes(valueColumns, column);
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

    public moveInGridColumns(movedColumns: Column[], toIndex: number, source: ColumnEventType): void {
        moveInArray(this.gridColumns, movedColumns, toIndex);
        this.updateDisplayedColumns(source);
    }

    public updateDisplayedColumns(source: ColumnEventType): void {
        const columnsForDisplay = this.calculateColumnsForDisplay();

        this.displayedColumnsService.buildDisplayedTrees(columnsForDisplay);

        // also called when group opened/closed
        this.updateGroupsAndDisplayedColumns(source);

        // also called when group opened/closed
        this.setFirstRightAndLastLeftPinned(source);
    }

    // niall note - this method should be deleted, it's patchwork for refactoring
    public isGridColsMising(): boolean {
        return (!this.gridColumns);
    }

    // called from: applyColumnState, setColumnDefs, setSecondaryColumns
    public updateGridColumns(): void {
        const prevGridCols = this.gridBalancedTree;
        if (this.gridColsArePrimary) {
            this.lastPrimaryOrder = this.gridColumns;
        } else {
            this.lastSecondaryOrder = this.gridColumns;
        }

        // create the new auto columns
        const areAutoColsChanged = this.createGroupAutoColumnsIfNeeded();
        // if auto group cols have changed, and we have a sort order, we need to move auto cols to the start
        if (areAutoColsChanged) {
            const groupAutoColsMap = convertToMap<Column, true>(this.groupAutoColumns!.map(col => [col, true]));

            // if group cols have changed, remove them from any previous orders and add them to the start.
            if (this.lastPrimaryOrder) {
                this.lastPrimaryOrder = this.lastPrimaryOrder.filter(col => !groupAutoColsMap.has(col));
                this.lastPrimaryOrder = [...this.groupAutoColumns!, ...this.lastPrimaryOrder];
            }

            if (this.lastSecondaryOrder) {
                this.lastSecondaryOrder = this.lastSecondaryOrder.filter(col => !groupAutoColsMap.has(col));
                this.lastSecondaryOrder = [...this.groupAutoColumns!, ...this.lastSecondaryOrder];
            }
        }

        let sortOrderToRecover: Column[] | undefined;

        const secondaryCols = this.columnPivotService.getSecondaryColumns();
        const secondaryTree = this.columnPivotService.getSecondaryBalancedTree();
        const secondaryHeaderRowCount = this.columnPivotService.getSecondaryHeaderRowCount();

        if (secondaryCols && secondaryTree) {
            const hasSameColumns = secondaryCols.some((col) => {
                return this.gridColumnsMap[col.getColId()] !== undefined;
            });
            this.gridBalancedTree = secondaryTree.slice();
            this.gridHeaderRowCount = secondaryHeaderRowCount;
            this.gridColumns = secondaryCols.slice();
            this.gridColsArePrimary = false;

            // If the current columns are the same or a subset of the previous
            // we keep the previous order, otherwise we go back to the order the pivot
            // cols are generated in
            if (hasSameColumns) {
                sortOrderToRecover = this.lastSecondaryOrder;
            }
        } else if (this.primaryColumns) {
            this.gridBalancedTree = this.primaryColumnTree.slice();
            this.gridHeaderRowCount = this.primaryHeaderRowCount;
            this.gridColumns = this.primaryColumns.slice();
            this.gridColsArePrimary = true;

            // updateGridColumns gets called after user adds a row group. we want to maintain the order of the columns
            // when this happens (eg if user moved a column) rather than revert back to the original column order.
            // likewise if changing in/out of pivot mode, we want to maintain the order of the cols
            sortOrderToRecover = this.lastPrimaryOrder;
        }

        this.addAutoGroupToGridColumns();
        this.orderGridColsLike(sortOrderToRecover);

        this.gridColumns = this.columnMoveService.placeLockedColumns(this.gridColumns);
        this.calculateColumnsForGroupDisplay();
        this.refreshQuickFilterColumns();

        // make sure any part of the gui that tries to draw, eg the header,
        // will get empty lists of columns rather than stale columns.
        // for example, the header will received gridColumnsChanged event, so will try and draw,
        // but it will draw successfully when it acts on the virtualColumnsChanged event
        this.displayedColumnsService.clear();
        this.columnViewportService.clear();

        this.colSpanActive = this.checkColSpanActiveInCols(this.gridColumns);

        this.gridColumnsMap = {};
        this.gridColumns.forEach(col => this.gridColumnsMap[col.getId()] = col);

        this.setAutoHeightActive();

        if (!areEqual(prevGridCols, this.gridBalancedTree)) {
            this.eventDispatcher.gridColumns();
        }
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
                    const rowGroupCols = this.functionColumnsService.getRowGroupColumns();
                    rowGroupCols.forEach(rowGroupCol => {
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

    private setAutoHeightActive(): void {
        this.autoHeightActive = this.gridColumns.filter(col => col.isAutoHeight()).length > 0;

        if (this.autoHeightActive) {
            this.autoHeightActiveAtLeastOnce = true;

            const supportedRowModel = this.gos.isRowModelType('clientSide') || this.gos.isRowModelType('serverSide');
            if (!supportedRowModel) {
                warnOnce('autoHeight columns only work with Client Side Row Model and Server Side Row Model.');
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
    public refreshQuickFilterColumns(): void {
        let columnsForQuickFilter = (
            this.isPivotMode() && !this.gos.get('applyQuickFilterBeforePivotOrAgg') ? this.columnPivotService.getSecondaryColumns() : this.primaryColumns
        ) ?? [];
        if (this.groupAutoColumns) {
            columnsForQuickFilter = columnsForQuickFilter.concat(this.groupAutoColumns);
        }
        this.columnsForQuickFilter = this.gos.get('includeHiddenColumnsInQuickFilter')
            ? columnsForQuickFilter
            : columnsForQuickFilter.filter(col => col.isVisible() || col.isRowGroupActive());
    }

    private addAutoGroupToGridColumns(): void {

        if (missing(this.groupAutoColumns)) {
            this.columnUtilsFeature.destroyOldColumns(this.groupAutoColsBalancedTree);
            this.groupAutoColsBalancedTree = null;
            return;
        }

        this.gridColumns = this.groupAutoColumns ? this.groupAutoColumns.concat(this.gridColumns) : this.gridColumns;

        const newAutoColsTree = this.columnFactory.createForAutoGroups(this.groupAutoColumns, this.gridBalancedTree);

        this.columnUtilsFeature.destroyOldColumns(this.groupAutoColsBalancedTree, newAutoColsTree);
        this.groupAutoColsBalancedTree = newAutoColsTree;

        this.gridBalancedTree = newAutoColsTree.concat(this.gridBalancedTree);
    }

    public updateGroupsAndDisplayedColumns(source: ColumnEventType) {

        this.displayedColumnsService.updateOpenClosedVisibilityInColumnGroups();
        this.displayedColumnsService.deriveDisplayedColumns(source);
        this.columnSizeService.refreshFlexedColumns();
        this.columnViewportService.extractViewport();
        this.displayedColumnsService.updateBodyWidths();
        // this event is picked up by the gui, headerRenderer and rowRenderer, to recalculate what columns to display

        this.eventDispatcher.displayedColumns();
    }

    public isAutoRowHeightActive(): boolean {
        return this.autoHeightActive;
    }

    public wasAutoRowHeightEverActive(): boolean {
        return this.autoHeightActiveAtLeastOnce;
    }

    public getGroupAutoColumns(): Column[] | null {
        return this.groupAutoColumns;
    }

    /**
     * Creates new auto group columns if required
     * @returns whether auto cols have changed
     */
    private createGroupAutoColumnsIfNeeded(): boolean {
        const forceRecreateAutoGroups = this.forceRecreateAutoGroups;
        this.forceRecreateAutoGroups = false;
        if (!this.autoGroupsNeedBuilding) { return false; }

        this.autoGroupsNeedBuilding = false;

        const groupFullWidthRow = this.gos.isGroupUseEntireRow(this.pivotMode);
        // we need to allow suppressing auto-column separately for group and pivot as the normal situation
        // is CSRM and user provides group column themselves for normal view, but when they go into pivot the
        // columns are generated by the grid so no opportunity for user to provide group column. so need a way
        // to suppress auto-col for grouping only, and not pivot.
        // however if using Viewport RM or SSRM and user is providing the columns, the user may wish full control
        // of the group column in this instance.
        const suppressAutoColumn = this.pivotMode ?
            this.gos.get('pivotSuppressAutoColumn') : this.isGroupSuppressAutoColumn();

        const rowGroupCols = this.functionColumnsService.getRowGroupColumns();

        const groupingActive = rowGroupCols.length > 0 || this.gos.get('treeData');
        const needAutoColumns = groupingActive && !suppressAutoColumn && !groupFullWidthRow;

        if (needAutoColumns) {
            const newAutoGroupCols = this.autoGroupColService.createAutoGroupColumns(rowGroupCols);
            const autoColsDifferent = !this.autoColsEqual(newAutoGroupCols, this.groupAutoColumns);
            // we force recreate so new group cols pick up the new
            // definitions. otherwise we could ignore the new cols because they appear to be the same.
            if (autoColsDifferent || forceRecreateAutoGroups) {
                this.groupAutoColumns = newAutoGroupCols;
                return true;
            }
        } else {
            this.groupAutoColumns = null;
        }
        return false;
    }

    public isGroupSuppressAutoColumn() {
        const groupDisplayType = this.gos.get('groupDisplayType');
        const isCustomRowGroups = groupDisplayType === 'custom';
        if (isCustomRowGroups) { return true; }
    
        const treeDataDisplayType = this.gos.get('treeDataDisplayType');
        return treeDataDisplayType === 'custom';
    }

    private autoColsEqual(colsA: Column[] | null, colsB: Column[] | null): boolean {
        return areEqual(colsA, colsB, (a, b) => a.getColId() === b.getColId());
    }

    public setColumnHeaderHeight(col: Column, height: number): void {
        const changed = col.setAutoHeaderHeight(height);

        if (changed) {
            this.eventDispatcher.headerHeight(col);
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

        const allDisplayedCols = this.displayedColumnsService.getAllDisplayedColumns();

        const displayedHeights = allDisplayedCols
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

    public isShouldQueueResizeOperations(): boolean {
        return this.shouldQueueResizeOperations;
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

        const rowGroupCols = this.functionColumnsService.getRowGroupColumns();
        const colIndex = rowGroupCols.findIndex(groupCol => groupCol.getColId() === column.getColId());
        return groupLockGroupColumns > colIndex;
    }


    private applyAutosizeStrategy(): void {
        const autoSizeStrategy = this.gos.get('autoSizeStrategy');
        if (!autoSizeStrategy) { return; }

        const { type } = autoSizeStrategy;
        // ensure things like aligned grids have linked first
        setTimeout(() => {
            if (type === 'fitGridWidth') {
                const { columnLimits: propColumnLimits, defaultMinWidth, defaultMaxWidth } = autoSizeStrategy;
                const columnLimits = propColumnLimits?.map(({ colId: key, minWidth, maxWidth }) => ({
                    key,
                    minWidth,
                    maxWidth
                }));
                this.ctrlsService.getGridBodyCtrl().sizeColumnsToFit({
                    defaultMinWidth,
                    defaultMaxWidth,
                    columnLimits
                });
            } else if (type === 'fitProvidedWidth') {
                this.columnSizeService.sizeColumnsToFit(autoSizeStrategy.width, 'sizeColumnsToFit');
            }
        });
    }

    private onFirstDataRendered(): void {
        const autoSizeStrategy = this.gos.get('autoSizeStrategy');
        if (autoSizeStrategy?.type !== 'fitCellContents') { return; }

        const { colIds: columns, skipHeader } = autoSizeStrategy;
        // ensure render has finished
        setTimeout(() => {
            if (columns) {
                this.columnAutosizeService.autoSizeColumns({
                    columns,
                    skipHeader,
                    source: 'autosizeColumns'
                });
            } else {
                this.columnAutosizeService.autoSizeAllColumns('autosizeColumns', skipHeader);
            }
        });
    }
}

export function convertSourceType(source: PropertyChangedSource): ColumnEventType {
    // unfortunately they do not match so need to perform conversion
    return source === 'gridOptionsUpdated' ? 'gridOptionsChanged' : source;
}

export function depthFirstAllColumnTreeSearch(
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


// sort the lists according to the indexes that were provided
const comparatorByIndex = (indexes: { [key: string]: number; }, oldList: Column[], colA: Column, colB: Column) => {

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