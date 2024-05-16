import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, PostConstruct, PreDestroy } from '../context/context';
import { CtrlsService } from '../ctrlsService';
import { ColDef, ColGroupDef, IAggFunc } from '../entities/colDef';
import { Column, ColumnPinnedType } from '../entities/column';
import { ProvidedColumnGroup } from '../entities/providedColumnGroup';
import {
    ColumnEventType, Events
} from '../events';
import { QuickFilterService } from '../filter/quickFilterService';
import { PropertyChangedSource } from '../gridOptionsService';
import { IProvidedColumn } from '../interfaces/iProvidedColumn';
import { ColumnAnimationService } from '../rendering/columnAnimationService';
import { areEqual, includes, insertIntoArray, moveInArray } from '../utils/array';
import { warnOnce } from '../utils/function';
import { exists, missingOrEmpty } from '../utils/generic';
import { convertToMap } from '../utils/map';
import { ValueCache } from '../valueService/valueCache';
import { AutoColService, GROUP_AUTO_COLUMN_ID } from './autoColService';
import { ColumnApplyStateService, ColumnState } from './columnApplyStateService';
import { ColumnAutosizeService } from './columnAutosizeService';
import { ColumnDefFactory } from "./columnDefFactory";
import { ColumnEventDispatcher } from './columnEventDispatcher';
import { ColumnFactory, depthFirstOriginalTreeSearch } from './columnFactory';
import { ColumnGroupStateService } from './columnGroupStateService';
import { ColumnMoveService } from './columnMoveService';
import { ColumnSizeService } from './columnSizeService';
import { destroyColumnTree, getColumnsFromTree, isColumnGroupAutoCol } from './columnUtils';
import { ColumnViewportService } from './columnViewportService';
import { FuncColsService } from './funcColsService';
import { PivotResultColsService } from './pivotResultColsService';
import { VisibleColsService } from './visibleColsService';

export type ColKey<TData = any, TValue = any> = string | ColDef<TData, TValue> | Column<TValue>;
export type Maybe<T> = T | null | undefined;

export interface ColumnCollections {
    // columns in a tree, leaf levels are columns, everything above is group column
    tree: IProvidedColumn[];
    treeDepth: number; // depth of the tree above
    // leaf level cols of the tree
    list: Column[];
    // cols by id, for quick lookup
    map: { [id: string]: Column };
}

@Bean('columnModel')
export class ColumnModel extends BeanStub {

    @Autowired('columnFactory') private columnFactory: ColumnFactory;
    @Autowired('columnSizeService') private columnSizeService: ColumnSizeService;
    @Autowired('visibleColsService') private visibleColsService: VisibleColsService;
    @Autowired('columnViewportService') private columnViewportService: ColumnViewportService;
    @Autowired('pivotResultColsService') private pivotResultColsService: PivotResultColsService;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;
    @Autowired('columnAnimationService') private columnAnimationService: ColumnAnimationService;
    @Autowired('autoColService') private autoColService: AutoColService;
    @Autowired('valueCache') private valueCache: ValueCache;
    @Autowired('columnDefFactory') private columnDefFactory: ColumnDefFactory;
    @Autowired('columnApplyStateService') private columnApplyStateService: ColumnApplyStateService;
    @Autowired('columnGroupStateService') private columnGroupStateService: ColumnGroupStateService;
    @Autowired('columnEventDispatcher') private eventDispatcher: ColumnEventDispatcher;
    @Autowired('columnMoveService') private columnMoveService: ColumnMoveService;
    @Autowired('columnAutosizeService') private columnAutosizeService: ColumnAutosizeService;
    @Autowired('funcColsService') private funcColsService: FuncColsService;
    @Autowired('quickFilterService') private quickFilterService: QuickFilterService;

    // as provided by gridProp columnsDefs
    private columnDefs: (ColDef | ColGroupDef)[];

    // columns generated from columnDefs
    // this doesn't change (including order) unless columnDefs prop changses.
    private providedCols: ColumnCollections;

    // group auto columns
    private autoCols: ColumnCollections | null;

    // [providedCols OR pivotResultCols] PLUS autoGroupCols.
    // this cols.list maintains column order.
    private cols: ColumnCollections;

    // if pivotMode is on, however pivot results are NOT shown if no pivot columns are set
    private pivotMode = false;

    // true when pivotResultCols are in cols
    private showingPivotResult: boolean;
    
    private lastOrder: Column[] | null;
    private lastPivotOrder: Column[] | null;

    // true if we are doing column spanning
    private colSpanActive: boolean;

    // grid columns that have colDef.autoHeight set
    private autoHeightActive: boolean;
    private autoHeightActiveAtLeastOnce = false;

    private ready = false;
    private changeEventsDispatching = false;

    private groupDisplayColumns: Column[];
    private groupDisplayColumnsMap: { [originalColumnId: string]: Column };

    // when we're waiting for cell data types to be inferred, we need to defer column resizing
    private shouldQueueResizeOperations: boolean = false;
    private resizeOperationQueue: (() => void)[] = [];

    @PostConstruct
    public init(): void {
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

    // called from SyncService, when grid has finished initialising
    private createProvidedCols(colsPreviouslyExisted: boolean, source: ColumnEventType): void {
        // only need to dispatch before/after events if updating columns, never if setting columns for first time
        const dispatchEventsFunc = colsPreviouslyExisted ? this.columnApplyStateService.compareColumnStatesAndDispatchEvents(source) : undefined;

        // always invalidate cache on changing columns, as the column id's for the new columns
        // could overlap with the old id's, so the cache would return old values for new columns.
        this.valueCache.expire();

        const oldProvidedCols = this.providedCols && this.providedCols.list;
        const oldProvidedTree = this.providedCols && this.providedCols.tree;
        const newTreeResult = this.columnFactory.createColumnTree(this.columnDefs, true, oldProvidedTree, source);

        destroyColumnTree(this.getContext(), this.providedCols?.tree, newTreeResult.columnTree);

        const tree = newTreeResult.columnTree;
        const treeDepth = newTreeResult.treeDept;
        const list = getColumnsFromTree(tree);
        const map: { [id: string]: Column } = {};

        list.forEach(col => map[col.getId()] = col);

        this.providedCols = { tree, treeDepth, list, map };

        this.funcColsService.extractCols(source, oldProvidedCols);

        this.ready = true;

        this.updateCols();

        const maintainColOrder = colsPreviouslyExisted && !this.showingPivotResult && !this.gos.get('maintainColumnOrder');
        if (maintainColOrder) {
            this.orderColsLikeProvided();
        }

        this.visibleColsService.refresh(source);
        this.columnViewportService.checkViewportColumns();

        // this event is not used by AG Grid, but left here for backwards compatibility,
        // in case applications use it
        this.eventDispatcher.everythingChanged(source);

        // Row Models react to all of these events as well as new columns loaded,
        // this flag instructs row model to ignore these events to reduce refreshes.
        if (dispatchEventsFunc) {
            this.changeEventsDispatching = true;
            dispatchEventsFunc();
            this.changeEventsDispatching = false;    
        }

        this.eventDispatcher.newColumnsLoaded(source);
        if (source === 'gridInitializing') {
            this.applyAutosizeStrategy();
        }
    }

    // called from: buildAutoGroupColumns (events 'groupDisplayType', 'treeData', 'treeDataDisplayType', 'groupHideOpenParents')
    // createProvidedCols (recreateColumnDefs, setColumnsDefs), 
    // setPivotMode, applyColumnState, 
    // functionColsService.setPrimaryColList, functionColsService.updatePrimaryColList, 
    // pivotResultColsService.setPivotResultCols
    public updateCols(): void {
        if (!this.providedCols) { return; }

        const prevColTree = this.cols?.tree;

        this.saveColOrder();

        this.selectCols();

        this.createAutoCols();
        this.addAutoCols();

        this.restoreColOrder();

        this.placeLockedCols();
        this.calculateColsForGroupDisplay();
        this.quickFilterService.refreshQuickFilterCols();

        this.setColSpanActive();
        this.setAutoHeightActive();

        // make sure any part of the gui that tries to draw, eg the header,
        // will get empty lists of columns rather than stale columns.
        // for example, the header will received gridColumnsChanged event, so will try and draw,
        // but it will draw successfully when it acts on the virtualColumnsChanged event
        this.visibleColsService.clear();
        this.columnViewportService.clear();

        const dispatchChangedEvent = !areEqual(prevColTree, this.cols.tree);
        if (dispatchChangedEvent) {
            this.eventDispatcher.gridColumns();
        }
    }

    private selectCols(): void {
        const pivotResultCols = this.pivotResultColsService.getPivotResultCols();
        this.showingPivotResult = pivotResultCols!=null;

        if (pivotResultCols) {
            const {map, list, tree, treeDepth} = pivotResultCols;
            this.cols = {
                list: list.slice(),
                map: {...map},
                tree: tree.slice(),
                treeDepth: treeDepth
            };

            // If the current columns are the same or a subset of the previous
            // we keep the previous order, otherwise we go back to the order the pivot
            // cols are generated in
            const hasSameColumns = pivotResultCols.list.some( col => 
                this.cols?.map[col.getColId()] !== undefined
            );
            if (!hasSameColumns) {
                this.lastPivotOrder = null;
            }

        } else {
            const {map, list, tree, treeDepth} = this.providedCols;
            this.cols = {
                list: list.slice(),
                map: {...map},
                tree: tree.slice(),
                treeDepth: treeDepth
            };
        }
    }

    public getColsToShow(): Column[] {

        // pivot mode is on, but we are not pivoting, so we only
        // show columns we are aggregating on

        const showAutoGroupAndValuesOnly = this.isPivotMode() && !this.isShowingPivotResult();
        const valueColumns = this.funcColsService.getValueColumns();

        const res = this.cols.list.filter( col => {
            const isAutoGroupCol = isColumnGroupAutoCol(col);
            if (showAutoGroupAndValuesOnly) {
                const isValueCol = valueColumns && includes(valueColumns, col);
                return isAutoGroupCol || isValueCol;
            } else {
                // keep col if a) it's auto-group or b) it's visible
                return isAutoGroupCol || col.isVisible();
            }
        });

        return res;
    }

    public isShowingPivotResult(): boolean {
        return this.showingPivotResult;
    }

    public pushResizeOperation(func: ()=> void): void {
        this.resizeOperationQueue.push(func);
    }

    // on events 'groupDisplayType', 'treeData', 'treeDataDisplayType', 'groupHideOpenParents'
    private buildAutoGroupColumns(source: ColumnEventType) {
        // Possible for update to be called before columns are present in which case there is nothing to do here.
        if (!this.columnDefs) { return; }

        this.updateCols();
        this.visibleColsService.refresh(source);
    }

    private onAutoGroupColumnDefChanged(source: ColumnEventType) {
        if (this.autoCols) {
            this.autoColService.updateAutoCols(this.autoCols.list, source);
        }
    }

    // called when dataTypes change
    public recreateColumnDefs(source: ColumnEventType): void {
        if (!this.cols) { return; }

        // if we aren't going to force, update the auto cols in place
        if (this.autoCols) {
            this.autoColService.updateAutoCols(this.autoCols.list, source);
        }
        this.createProvidedCols(true, source);
    }

    public setColumnDefs(columnDefs: (ColDef | ColGroupDef)[], source: ColumnEventType) {
        const colsPreviouslyExisted = !!this.columnDefs;
        this.columnDefs = columnDefs;
        this.createProvidedCols(colsPreviouslyExisted, source);
    }

    @PreDestroy
    private destroyColumns(): void {
        destroyColumnTree(this.getContext(), this.providedCols?.tree);
        destroyColumnTree(this.getContext(), this.autoCols?.tree);
    }

    // called by clientSideRowModel.refreshModel
    public isChangeEventsDispatching(): boolean {
        return this.changeEventsDispatching;
    }

    private orderColsLikeProvided(): void {
        if (!this.providedCols || !this.cols) { return; }

        const colsOrdered = this.providedCols.list.filter(col => this.cols.list.indexOf(col) >= 0);
        const otherCols = this.cols.list.filter(col => colsOrdered.indexOf(col) < 0);

        this.cols.list = [...otherCols, ...colsOrdered];
        this.cols.list = this.columnMoveService.placeLockedColumns(this.cols.list);
    }

    public orderColsLike(colIds: string[]): void {
        if (this.cols==null) { return; }

        let newOrder: Column[] = [];
        const processedColIds: { [id: string]: boolean } = {};

        colIds.forEach(colId => {
            if (processedColIds[colId]) { return; }
            const col = this.cols.map[colId];
            if (col) {
                newOrder.push(col);
                processedColIds[colId] = true;
            }
        });

        // add in all other columns
        let autoGroupInsertIndex = 0;
        this.cols.list.forEach(col => {
            const colId = col.getColId();
            const alreadyProcessed = processedColIds[colId] != null;
            if (alreadyProcessed) { return; }

            const isAutoGroupCol = colId.startsWith(GROUP_AUTO_COLUMN_ID);
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

        // this is already done in updateCols, however we changed the order above (to match the order of the state
        // columns) so we need to do it again. we could of put logic into the order above to take into account fixed
        // columns, however if we did then we would have logic for updating fixed columns twice. reusing the logic here
        // is less sexy for the code here, but it keeps consistency.
        newOrder = this.columnMoveService.placeLockedColumns(newOrder);

        if (!this.columnMoveService.doesMovePassMarryChildren(newOrder)) {
            console.warn('AG Grid: Applying column order broke a group where columns should be married together. Applying new order has been discarded.');
            return;
        }

        this.cols.list = newOrder;
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

        if (!this.cols) { return; }

        // we need to update grid columns to cover the scenario where user has groupDisplayType = 'custom', as
        // this means we don't use auto group column UNLESS we are in pivot mode (it's mandatory in pivot mode),
        // so need to updateCols() to check it autoGroupCol needs to be added / removed
        this.updateCols();
        this.visibleColsService.refresh(source);

        this.eventDispatcher.pivotModeChanged();
    }

    public getColTree(): IProvidedColumn[] {
        return this.cols.tree;
    }

    // + columnSelectPanel
    public getProvidedColTree(): IProvidedColumn[] {
        return this.providedCols.tree;
    }

    // + gridPanel -> for resizing the body and setting top margin
    public getHeaderRowCount(): number {
        return this.cols ? (this.cols.treeDepth + 1) : -1;
    }

    public isColSpanActive(): boolean {
        return this.colSpanActive;
    }
    
    public getColOrColFromDef(key: ColKey): Column | null {
        const res = this.getProvidedColumn(key) || this.getCol(key);
        return res;
    }

    public setColumnAggFunc(key: Maybe<ColKey>, aggFunc: string | IAggFunc | null | undefined, source: ColumnEventType): void {
        if (!key) { return; }

        const column = this.getProvidedColumn(key);
        if (!column) { return; }

        column.setAggFunc(aggFunc);

        this.eventDispatcher.columnChanged(Events.EVENT_COLUMN_VALUE_CHANGED, [column], source);
    }

    // returns the provided cols sorted in same order as they appear in this.cols. eg if this.cols
    // contains [a,b,c,d,e] and col passed is [e,a] then the passed cols are sorted into [a,e]
    public sortColsLikeCols(cols: Column[]): void {
        if (!cols || cols.length <= 1) { return; }

        const notAllColsPresent = cols.filter(c => this.cols.list.indexOf(c) < 0).length > 0;
        if (notAllColsPresent) { return; }

        cols.sort((a: Column, b: Column) => {
            const indexA = this.cols.list.indexOf(a);
            const indexB = this.cols.list.indexOf(b);
            return indexA - indexB;
        });
    }

    public getColumnDefs(): (ColDef | ColGroupDef)[] | undefined {
        if (!this.providedCols) { return; }

        const cols = this.providedCols.list.slice();

        if (this.showingPivotResult) {
            cols.sort((a: Column, b: Column) => this.lastOrder!.indexOf(a) - this.lastOrder!.indexOf(b));
        } else if (this.lastOrder) {
            cols.sort((a: Column, b: Column) => this.cols.list.indexOf(a) - this.cols.list.indexOf(b));
        }

        const rowGroupColumns = this.funcColsService.getRowGroupColumns();
        const pivotColumns = this.funcColsService.getPivotColumns();

        return this.columnDefFactory.buildColumnDefs(cols, rowGroupColumns, pivotColumns);
    }

    // + clientSideRowModel
    public isPivotActive(): boolean {
        const pivotColumns = this.funcColsService.getPivotColumns();
        return this.pivotMode && !missingOrEmpty(pivotColumns);
    }

    // used by:
    // + clientSideRowController -> sorting, building quick filter text
    // + headerRenderer -> sorting (clearing icon)
    public getAllProvidedCols(): Column[] | null {
        return this.providedCols?.list ? this.providedCols.list : null;
    }

    // + moveColumnController
    public getCols(): Column[] {
        return this.cols?.list ?? [];
    }

    public setColumnsVisible(keys: (string | Column)[], visible = false, source: ColumnEventType): void {
        this.columnApplyStateService.applyColumnState({
            state: keys.map<ColumnState>(
                key => ({
                    colId: typeof key === 'string' ? key : key.getColId(),
                    hide: !visible,
                })
            ),
        }, source);
    }

    public setColumnsPinned(keys: Maybe<ColKey>[], pinned: ColumnPinnedType, source: ColumnEventType): void {
        if (!this.cols) { return; }
        if (missingOrEmpty(keys)) { return; }

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

        const updatedCols: Column[] = [];

        keys.forEach(key => {
            if (!key) { return; }
            const column = this.getCol(key);
            if (!column) { return; }

            if (column.getPinned() !== actualPinned) {
                column.setPinned(actualPinned);
                updatedCols.push(column);
            }
        });

        if (updatedCols.length) {
            this.visibleColsService.refresh(source);
            this.eventDispatcher.columnPinned(updatedCols, source);
        }

        this.columnAnimationService.finish();
    }

    public getProvidedAndPivotResultAndAutoColumns(): Column[] {
        const pivotResultCols = this.pivotResultColsService.getPivotResultCols();
        const pivotResultColsList = pivotResultCols?.list;
        return ([] as Column[]).concat(...[
            this.providedCols?.list || [],
            this.autoCols?.list || [],
            pivotResultColsList || [],
        ]);
    }

    public getColsForKeys(keys: ColKey[]): Column[] {
        if (!keys) { return []; }
        const res = keys.map( key => this.getCol(key) ).filter( col => col != null);
        return res as Column[];
    }

    // used by growGroupPanel
    public getColumnWithValidation(key: Maybe<ColKey>): Column | null {
        if (key == null) { return null; }

        const column = this.getCol(key);

        if (!column) {
            console.warn('AG Grid: could not find column ' + key);
        }

        return column;
    }

    public getProvidedColumn(key: ColKey): Column | null {
        if (!this.providedCols?.list) { return null; }

        return this.getColFromCollection(key, this.providedCols);
    }

    public getCol(key: ColKey): Column | null {
        return this.getColFromCollection(key, this.cols);
    }

    public lookupCol(key: string) {
        return this.cols?.map[key];
    }

    public getColFromCollection(key: ColKey, cols: ColumnCollections): Column | null {
        if (cols==null) { return null; }

        const {map, list} = cols;

        // most of the time this method gets called the key is a string, so we put this shortcut in
        // for performance reasons, to see if we can match for ID (it doesn't do auto columns, that's done below)
        if (typeof key == 'string' && map[key]) {
            return map[key];
        }

        for (let i = 0; i < list.length; i++) {
            if (columnsMatch(list[i], key)) {
                return list[i];
            }
        }

        return this.getAutoColumn(key);
    }

    public getAutoColumn(key: ColKey): Column | null {
        if (this.autoCols==null) return null;
        return this.autoCols.list.find(groupCol => columnsMatch(groupCol, key)) || null;
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

        depthFirstOriginalTreeSearch(null, this.cols?.tree, node => {
            if (node instanceof ProvidedColumnGroup) {
                if (node.getId() === key) {
                    res = node;
                }
            }
        });

        return res;
    }

    private setColSpanActive(): void {
        this.colSpanActive = this.cols.list.some(
            col => col.getColDef().colSpan!=null
        );
    }

    public moveInCols(movedColumns: Column[], toIndex: number, source: ColumnEventType): void {
        moveInArray(this.cols?.list, movedColumns, toIndex);
        this.visibleColsService.refresh(source);
    }

    private placeLockedCols(): void {
        this.cols.list = this.columnMoveService.placeLockedColumns(this.cols.list);        
    }

    private saveColOrder(): void {
        if (this.showingPivotResult) {
            this.lastPivotOrder = this.cols?.list;
        } else {
            this.lastOrder = this.cols?.list;
        }
    }

    private calculateColsForGroupDisplay(): void {
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
                    const rowGroupCols = this.funcColsService.getRowGroupColumns();
                    rowGroupCols.forEach(rowGroupCol => {
                        this.groupDisplayColumnsMap[rowGroupCol.getId()] = col;
                    });
                }
            }
        };

        this.cols?.list.forEach(checkFunc);
    }

    public getGroupDisplayColumns(): Column[] {
        return this.groupDisplayColumns;
    }

    public getGroupDisplayColumnForGroup(rowGroupColumnId: string): Column | undefined {
        return this.groupDisplayColumnsMap[rowGroupColumnId];
    }

    private setAutoHeightActive(): void {
        this.autoHeightActive = this.cols.list.some(col => col.isAutoHeight());

        if (this.autoHeightActive) {
            this.autoHeightActiveAtLeastOnce = true;

            const supportedRowModel = this.gos.isRowModelType('clientSide') || this.gos.isRowModelType('serverSide');
            if (!supportedRowModel) {
                warnOnce('autoHeight columns only work with Client Side Row Model and Server Side Row Model.');
            }
        }
    }

    private restoreColOrder(): void {
        const colsOrder = this.showingPivotResult ? this.lastPivotOrder : this.lastOrder;
        if (!colsOrder) { return; }

        const lastOrderMapped = convertToMap<Column, number>(colsOrder.map((col, index) => [col, index]));

        // only do the sort if at least one column is accounted for. columns will be not accounted for
        // if changing from pivot result cols to provided columns
        let noColsFound = true;
        this.cols.list.forEach(col => {
            if (lastOrderMapped.has(col)) {
                noColsFound = false;
            }
        });

        if (noColsFound) { return; }

        // order cols in the same order as before. we need to make sure that all
        // cols still exists, so filter out any that no longer exist.
        const colsMap = convertToMap<Column, boolean>(this.cols.list.map(col => [col, true]));
        const oldColsOrdered = colsOrder.filter(col => colsMap.has(col));
        const oldColsMap = convertToMap<Column, boolean>(oldColsOrdered.map(col => [col, true]));
        const newColsOrdered = this.cols.list.filter(col => !oldColsMap.has(col));

        // add in the new columns, at the end (if no group), or at the end of the group (if a group)
        const newCols = oldColsOrdered.slice();

        newColsOrdered.forEach(newCol => {
            let parent = newCol.getOriginalParent();

            // if no parent, means we are not grouping, so just add the column to the end
            if (!parent) {
                newCols.push(newCol);
                return;
            }

            // find the group the column belongs to. if no siblings at the current level (eg col in group on it's
            // own) then go up one level and look for siblings there.
            const siblings: Column[] = [];
            while (!siblings.length && parent) {
                const leafCols = parent.getLeafColumns();
                leafCols.forEach(leafCol => {
                    const presentInNewCols = newCols.indexOf(leafCol) >= 0;
                    const notYetInSiblings = siblings.indexOf(leafCol) < 0;
                    if (presentInNewCols && notYetInSiblings) {
                        siblings.push(leafCol);
                    }
                });
                parent = parent.getOriginalParent();
            }

            // if no siblings exist at any level, this means the col is in a group (or parent groups) on it's own
            if (!siblings.length) {
                newCols.push(newCol);
                return;
            }

            // find index of last column in the group
            const indexes = siblings.map(col => newCols.indexOf(col));
            const lastIndex = Math.max(...indexes);

            insertIntoArray(newCols, newCol, lastIndex + 1);
        });

        this.cols.list = newCols;
    }

    // used by Column Tool Panel
    public isProvidedColGroupsPresent(): boolean {
        return this.providedCols?.treeDepth > 0;
    }

    private addAutoCols(): void {
        if (this.autoCols==null) { return; }
        this.cols.list = this.autoCols.list.concat(this.cols.list);
        this.cols.tree = this.autoCols.tree.concat(this.cols.tree);
        updateColsMap(this.cols);
    }

    public isAutoRowHeightActive(): boolean {
        return this.autoHeightActive;
    }

    public wasAutoRowHeightEverActive(): boolean {
        return this.autoHeightActiveAtLeastOnce;
    }

    public getGroupAutoColumns(): Column[] | null {
        return this.autoCols?.list || null;
    }

    private createAutoCols(): void {
        const groupFullWidthRow = this.gos.isGroupUseEntireRow(this.pivotMode);
        // we need to allow suppressing auto-column separately for group and pivot as the normal situation
        // is CSRM and user provides group column themselves for normal view, but when they go into pivot the
        // columns are generated by the grid so no opportunity for user to provide group column. so need a way
        // to suppress auto-col for grouping only, and not pivot.
        // however if using Viewport RM or SSRM and user is providing the columns, the user may wish full control
        // of the group column in this instance.
        const suppressAutoColumn = this.pivotMode ?
            this.gos.get('pivotSuppressAutoColumn') : this.isGroupSuppressAutoColumn();

        const rowGroupCols = this.funcColsService.getRowGroupColumns();

        const groupingActive = rowGroupCols.length > 0 || this.gos.get('treeData');

        const noAutoCols = !groupingActive || suppressAutoColumn || groupFullWidthRow;

        const destroyPrevious = () => {
            if (this.autoCols) {
                destroyColumnTree(this.getContext(), this.autoCols.tree);
                this.autoCols = null;
            }
        };

        // function 
        if (noAutoCols) {
            destroyPrevious();
            return;
        }

        const list = this.autoColService.createAutoCols(rowGroupCols);
        const autoColsSame = this.autoColsEqual(list, this.autoCols?.list || null);

        // the new tree dept will equal the current tree dept of cols
        const newTreeDepth = this.cols.treeDepth;
        const oldTreeDepth = this.autoCols ? this.autoCols.treeDepth : -1;
        const treeDeptSame = oldTreeDepth == newTreeDepth;

        if (autoColsSame && treeDeptSame) { return; }

        destroyPrevious();
        const [tree, treeDepth] = this.columnFactory.createForAutoGroups(list, this.cols?.tree);
        this.autoCols = {
            list, tree, treeDepth,
            map: {}, 
        };

        const putAutocolsFirstInList = (cols: Column[] | null): (Column[] | null) => {
            if (!cols) { return null; }
            // we use colId, and not instance, to remove old autoGroupCols
            const colsFiltered = cols.filter(col => !isColumnGroupAutoCol(col));
            return [...list, ...colsFiltered];
        }

        this.lastOrder = putAutocolsFirstInList(this.lastOrder);
        this.lastPivotOrder = putAutocolsFirstInList(this.lastPivotOrder);
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

        const allDisplayedCols = this.visibleColsService.getAllCols();

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

        const rowGroupCols = this.funcColsService.getRowGroupColumns();
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
                this.columnAutosizeService.autoSizeCols({
                    colKeys: columns,
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

function updateColsMap(cols: ColumnCollections): void {
    cols.map = {};
    cols.list.forEach(col => cols.map[col.getId()] = col);
}

function columnsMatch(column: Column, key: ColKey): boolean {
    const columnMatches = column === key;
    const colDefMatches = column.getColDef() === key;
    const idMatches = column.getColId() == key;

    return columnMatches || colDefMatches || idMatches;
}
