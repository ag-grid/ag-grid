import { placeLockedColumns } from '../columnMove/columnMoveUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColDef, ColGroupDef } from '../entities/colDef';
import type { GridOptions } from '../entities/gridOptions';
import type { ColumnEventType } from '../events';
import type { PropertyChangedEvent, PropertyValueChangedEvent } from '../gridOptionsService';
import { _shouldMaintainColumnOrder } from '../gridOptionsUtils';
import type { Column } from '../interfaces/iColumn';
import type { IColumnCollectionService } from '../interfaces/iColumnCollectionService';
import type { IPivotResultColsService } from '../interfaces/iPivotResultColsService';
import { _areEqual, _forAll } from '../utils/array';
import { _createColumnTree } from './columnFactoryUtils';
import { _applyColumnState, _compareColumnStatesAndDispatchEvents } from './columnStateUtils';
import type { ColumnState } from './columnStateUtils';
import {
    _columnsMatch,
    _convertColumnEventSourceType,
    _destroyColumnTree,
    _getColumnsFromTree,
    isColumnGroupAutoCol,
} from './columnUtils';

export type ColKey<TData = any, TValue = any> = string | ColDef<TData, TValue> | Column<TValue>;
export type Maybe<T> = T | null | undefined;

export interface ColumnCollections {
    // columns in a tree, leaf levels are columns, everything above is group column
    tree: (AgColumn | AgProvidedColumnGroup)[];
    treeDepth: number; // depth of the tree above
    // leaf level cols of the tree
    list: AgColumn[];
    // cols by id, for quick lookup
    map: { [id: string]: AgColumn };
}

export class ColumnModel extends BeanStub implements NamedBean {
    beanName = 'colModel' as const;

    // as provided by gridProp columnsDefs
    private colDefs?: (ColDef | ColGroupDef)[];

    // columns generated from columnDefs
    // this doesn't change (including order) unless columnDefs prop changses.
    public colDefCols?: ColumnCollections;

    // [providedCols OR pivotResultCols] PLUS autoGroupCols PLUS selectionCols
    // this cols.list maintains column order.
    public cols?: ColumnCollections;

    // if pivotMode is on, however pivot results are NOT shown if no pivot columns are set
    private pivotMode = false;

    // true when pivotResultCols are in cols
    private showingPivotResult: boolean;

    private lastOrder: AgColumn[] | null;
    private lastPivotOrder: AgColumn[] | null;

    // true if we are doing column spanning
    public colSpanActive: boolean;

    public ready = false;
    public changeEventsDispatching = false;

    public postConstruct(): void {
        this.pivotMode = this.gos.get('pivotMode');

        this.addManagedPropertyListeners(
            ['groupDisplayType', 'treeData', 'treeDataDisplayType', 'groupHideOpenParents'],
            (event) => this.refreshAll(_convertColumnEventSourceType(event.source))
        );
        this.addManagedPropertyListeners(
            ['defaultColDef', 'defaultColGroupDef', 'columnTypes', 'suppressFieldDotNotation'],
            this.recreateColumnDefs.bind(this)
        );
        this.addManagedPropertyListener('pivotMode', (event) =>
            this.setPivotMode(this.gos.get('pivotMode'), _convertColumnEventSourceType(event.source))
        );
    }

    // called from SyncService, when grid has finished initialising
    private createColsFromColDefs(source: ColumnEventType): void {
        const { beans } = this;
        const {
            valueCache,
            colAutosize,
            rowGroupColsSvc,
            pivotColsSvc,
            valueColsSvc,
            visibleCols,
            colViewport,
            eventSvc,
        } = beans;
        // only need to dispatch before/after events if updating columns, never if setting columns for first time
        const dispatchEventsFunc = this.colDefs ? _compareColumnStatesAndDispatchEvents(beans, source) : undefined;

        // always invalidate cache on changing columns, as the column id's for the new columns
        // could overlap with the old id's, so the cache would return old values for new columns.
        valueCache?.expire();

        const oldCols = this.colDefCols?.list;
        const oldTree = this.colDefCols?.tree;
        const newTree = _createColumnTree(beans, this.colDefs, true, oldTree, source);

        _destroyColumnTree(beans, this.colDefCols?.tree, newTree.columnTree);

        const tree = newTree.columnTree;
        const treeDepth = newTree.treeDepth;
        const list = _getColumnsFromTree(tree);
        const map: { [id: string]: AgColumn } = {};

        list.forEach((col) => (map[col.getId()] = col));

        this.colDefCols = { tree, treeDepth, list, map };

        rowGroupColsSvc?.extractCols(source, oldCols);
        pivotColsSvc?.extractCols(source, oldCols);
        valueColsSvc?.extractCols(source, oldCols);

        this.ready = true;

        this.refreshCols(true);

        visibleCols.refresh(source);
        colViewport.checkViewportColumns();

        // this event is not used by AG Grid, but left here for backwards compatibility,
        // in case applications use it
        eventSvc.dispatchEvent({
            type: 'columnEverythingChanged',
            source,
        });

        // Row Models react to all of these events as well as new columns loaded,
        // this flag instructs row model to ignore these events to reduce refreshes.
        if (dispatchEventsFunc) {
            this.changeEventsDispatching = true;
            dispatchEventsFunc();
            this.changeEventsDispatching = false;
        }

        eventSvc.dispatchEvent({
            type: 'newColumnsLoaded',
            source,
        });

        if (source === 'gridInitializing') {
            colAutosize?.applyAutosizeStrategy();
        }
    }

    // called from: buildAutoGroupColumns (events 'groupDisplayType', 'treeData', 'treeDataDisplayType', 'groupHideOpenParents')
    // createColsFromColDefs (recreateColumnDefs, setColumnsDefs),
    // setPivotMode, applyColumnState,
    // functionColsService.setPrimaryColList, functionColsService.updatePrimaryColList,
    // pivotResultCols.setPivotResultCols
    public refreshCols(newColDefs: boolean): void {
        if (!this.colDefCols) {
            return;
        }

        const prevColTree = this.cols?.tree;

        this.saveColOrder();

        const {
            autoColSvc,
            selectionColSvc,
            rowNumbersSvc,
            quickFilter,
            pivotResultCols,
            showRowGroupCols,
            rowAutoHeight,
            visibleCols,
            colViewport,
            eventSvc,
        } = this.beans;

        const cols = this.selectCols(pivotResultCols, this.colDefCols);

        this.createColumnsForService([autoColSvc, selectionColSvc, rowNumbersSvc], cols);

        const shouldSortNewColDefs = _shouldMaintainColumnOrder(this.gos, this.showingPivotResult);
        if (!newColDefs || shouldSortNewColDefs) {
            this.restoreColOrder(cols);
        }

        this.positionLockedCols(cols);
        showRowGroupCols?.refresh();
        quickFilter?.refreshCols();

        this.setColSpanActive();
        rowAutoHeight?.setAutoHeightActive(cols);

        // make sure any part of the gui that tries to draw, eg the header,
        // will get empty lists of columns rather than stale columns.
        // for example, the header will received gridColumnsChanged event, so will try and draw,
        // but it will draw successfully when it acts on the virtualColumnsChanged event
        visibleCols.clear();
        colViewport.clear();

        const dispatchChangedEvent = !_areEqual(prevColTree, this.cols!.tree);
        if (dispatchChangedEvent) {
            eventSvc.dispatchEvent({
                type: 'gridColumnsChanged',
            });
        }
    }

    private createColumnsForService(services: (IColumnCollectionService | undefined)[], cols: ColumnCollections): void {
        for (const service of services) {
            if (!service) {
                continue;
            }

            service.createColumns(cols, (updateOrder) => {
                this.lastOrder = updateOrder(this.lastOrder);
                this.lastPivotOrder = updateOrder(this.lastPivotOrder);
            });
            service.addColumns(cols);
        }
    }

    private selectCols(
        pivotResultColsSvc: IPivotResultColsService | undefined,
        colDefCols: ColumnCollections
    ): ColumnCollections {
        const pivotResultCols = pivotResultColsSvc?.getPivotResultCols() ?? null;
        this.showingPivotResult = pivotResultCols != null;

        const { map, list, tree, treeDepth } = pivotResultCols ?? colDefCols;
        this.cols = {
            list: list.slice(),
            map: { ...map },
            tree: tree.slice(),
            treeDepth,
        };

        if (pivotResultCols) {
            // If the current columns are the same or a subset of the previous
            // we keep the previous order, otherwise we go back to the order the pivot
            // cols are generated in
            const hasSameColumns = pivotResultCols.list.some((col) => this.cols?.map[col.getColId()] !== undefined);
            if (!hasSameColumns) {
                this.lastPivotOrder = null;
            }
        }
        return this.cols;
    }

    public getColsToShow(): AgColumn[] {
        if (!this.cols) {
            return [];
        }
        // pivot mode is on, but we are not pivoting, so we only
        // show columns we are aggregating on

        const showAutoGroupAndValuesOnly = this.isPivotMode() && !this.showingPivotResult;
        const valueColumns = this.beans.valueColsSvc?.columns;

        const res = this.cols.list.filter((col) => {
            const isAutoGroupCol = isColumnGroupAutoCol(col);
            if (showAutoGroupAndValuesOnly) {
                const isValueCol = valueColumns?.includes(col);
                return isAutoGroupCol || isValueCol;
            } else {
                // keep col if a) it's auto-group or b) it's visible
                return isAutoGroupCol || col.isVisible();
            }
        });

        return res;
    }

    // on events 'groupDisplayType', 'treeData', 'treeDataDisplayType', 'groupHideOpenParents'
    public refreshAll(source: ColumnEventType) {
        if (!this.ready) {
            return;
        }
        this.refreshCols(false);
        this.beans.visibleCols.refresh(source);
    }

    public setColsVisible(keys: (string | AgColumn)[], visible = false, source: ColumnEventType): void {
        _applyColumnState(
            this.beans,
            {
                state: keys.map<ColumnState>((key) => ({
                    colId: typeof key === 'string' ? key : key.getColId(),
                    hide: !visible,
                })),
            },
            source
        );
    }

    /**
     * Restores provided columns order to the previous order in this.lastPivotOrder / this.lastOrder
     * If columns are not in the last order:
     *  - Check column groups, and apply column after the last column in the lowest shared group
     *  - If no sibling is found, apply the column at the end of the cols
     */
    private restoreColOrder(cols: ColumnCollections): void {
        const lastOrder = this.showingPivotResult ? this.lastPivotOrder : this.lastOrder;
        if (!lastOrder) {
            return;
        }

        // get the cols present in both new list and last order, according to the last order
        const preservedOrder = lastOrder.filter((col) => cols.map[col.getId()] != null);

        // if no cols in last order are in the new, then order is already correct
        if (preservedOrder.length === 0) {
            return;
        }

        // if after removing all the cols that are not in the new set, we have no cols left,
        // then we don't need to do anything further, as the new order is correct.
        if (preservedOrder.length === cols.list.length) {
            cols.list = preservedOrder;
            return;
        }

        const hasSiblings = (col: AgColumn | AgProvidedColumnGroup): boolean => {
            const ancestor = col.getOriginalParent();
            if (!ancestor) {
                return false;
            }
            const children = ancestor.getChildren();
            if (children.length > 1) {
                return true;
            }
            return hasSiblings(ancestor);
        };

        // if none of the preserved cols have siblings; shortcut, as all new cols can be added to the end
        // this is a common scenario due to generated cols.
        if (!preservedOrder.some((col) => hasSiblings(col))) {
            const preservedOrderSet = new Set(preservedOrder);
            for (const col of cols.list) {
                if (!preservedOrderSet.has(col)) {
                    preservedOrder.push(col);
                }
            }
            cols.list = preservedOrder;
            return;
        }

        // create map of known col positions and their indices
        const colPositionMap = new Map<AgColumn, number>();
        for (let i = 0; i < preservedOrder.length; i++) {
            const col = preservedOrder[i];
            colPositionMap.set(col, i);
        }

        // find any cols that have been introduced that are not in the last order
        const additionalCols = cols.list.filter((col) => !colPositionMap.has(col));

        // no additional cols to be inserted, probably means cols were removed, but preserved order is correct.
        if (additionalCols.length === 0) {
            cols.list = preservedOrder;
            return;
        }

        // Function finds the sibling with the lowest shared parent and highest index in last order
        const getPreviousSibling = (col: AgColumn, group: AgProvidedColumnGroup | null): AgColumn | null => {
            const parent = group ? group.getOriginalParent() : col.getOriginalParent();
            if (!parent) {
                return null;
            }

            let highestIdx: number | null = null;
            let highestSibling: AgColumn | null = null;
            for (const child of parent.getChildren()) {
                // shortcut - skip the group that has already been processed
                if (child === group || child === col) {
                    continue;
                }

                if (child instanceof AgColumn) {
                    const colIdx = colPositionMap.get(child);
                    // if col does not exist in last order, skip
                    if (colIdx == null) {
                        continue;
                    }

                    if (highestIdx == null || highestIdx < colIdx) {
                        highestIdx = colIdx;
                        highestSibling = child;
                    }
                    continue;
                }

                child.forEachLeafColumn((leafCol) => {
                    const colIdx = colPositionMap.get(leafCol);
                    // if col does not exist in last order, skip
                    if (colIdx == null) {
                        return;
                    }

                    if (highestIdx == null || highestIdx < colIdx) {
                        highestIdx = colIdx;
                        highestSibling = leafCol;
                    }
                });
            }

            if (highestSibling == null) {
                return getPreviousSibling(col, parent);
            }
            return highestSibling;
        };

        // array of cols that have no siblings in the last order, to be added at the tail of the results
        const noSiblingsAvailable: AgColumn[] = [];

        // map is keyed by cols in last order, and values are the cols that should be added after them
        // in results array
        const previousSiblingPosMap: Map<AgColumn, AgColumn | AgColumn[]> = new Map();

        // for each new col, find the col it needs inserted after and store for when array is constructed
        for (const col of additionalCols) {
            const prevSiblingIdx = getPreviousSibling(col, null);
            if (prevSiblingIdx == null) {
                noSiblingsAvailable.push(col);
                continue;
            }

            const prev = previousSiblingPosMap.get(prevSiblingIdx);
            if (prev === undefined) {
                previousSiblingPosMap.set(prevSiblingIdx, col);
            } else if (Array.isArray(prev)) {
                prev.push(col);
            } else {
                // if we have a single col, then we need to add the new col to the array
                previousSiblingPosMap.set(prevSiblingIdx, [prev, col]);
            }
        }

        // the following code starts at the tail of the array and works backwards.
        // first it applies all of the cols with no siblings (so no location in last order)
        // then it works backwards through the preserved order - when a col has siblings, it adds
        // them to the array and then adds the col itself.

        const result = new Array(cols.list.length);
        let resultPointer = result.length - 1;
        // work backwards, first adding no siblings to end
        for (let i = noSiblingsAvailable.length - 1; i >= 0; i--) {
            result[resultPointer--] = noSiblingsAvailable[i];
        }

        for (let i = preservedOrder.length - 1; i >= 0; i--) {
            const nextCol = preservedOrder[i];
            const extraCols = previousSiblingPosMap.get(nextCol);
            if (extraCols) {
                if (Array.isArray(extraCols)) {
                    // add the extra cols backwards.
                    for (let x = extraCols.length - 1; x >= 0; x--) {
                        const col = extraCols[x];
                        result[resultPointer--] = col;
                    }
                } else {
                    result[resultPointer--] = extraCols;
                }
            }
            result[resultPointer--] = nextCol;
        }
        cols.list = result;
    }

    private positionLockedCols(cols: ColumnCollections): void {
        cols.list = placeLockedColumns(cols.list, this.gos);
    }

    private saveColOrder(): void {
        if (this.showingPivotResult) {
            this.lastPivotOrder = this.cols?.list ?? null;
        } else {
            this.lastOrder = this.cols?.list ?? null;
        }
    }

    public getColumnDefs(): (ColDef | ColGroupDef)[] | undefined {
        return this.colDefCols
            ? this.beans.colDefFactory?.getColumnDefs(
                  this.colDefCols.list,
                  this.showingPivotResult,
                  this.lastOrder,
                  this.cols?.list ?? []
              )
            : undefined;
    }

    private setColSpanActive(): void {
        this.colSpanActive = !!this.cols?.list.some((col) => col.getColDef().colSpan != null);
    }

    public isPivotMode(): boolean {
        return this.pivotMode;
    }

    private setPivotMode(pivotMode: boolean, source: ColumnEventType): void {
        if (pivotMode === this.pivotMode) {
            return;
        }

        this.pivotMode = pivotMode;

        if (!this.ready) {
            return;
        }

        // we need to update grid columns to cover the scenario where user has groupDisplayType = 'custom', as
        // this means we don't use auto group column UNLESS we are in pivot mode (it's mandatory in pivot mode),
        // so need to updateCols() to check it autoGroupCol needs to be added / removed
        this.refreshCols(false);
        const { visibleCols, eventSvc } = this.beans;
        visibleCols.refresh(source);

        eventSvc.dispatchEvent({
            type: 'columnPivotModeChanged',
        });
    }

    // + clientSideRowModel
    public isPivotActive(): boolean {
        const pivotColumns = this.beans.pivotColsSvc?.columns;
        return this.pivotMode && !!pivotColumns?.length;
    }

    // called when dataTypes change
    public recreateColumnDefs(e: PropertyChangedEvent | PropertyValueChangedEvent<keyof GridOptions>): void {
        if (!this.cols) {
            return;
        }

        // if we aren't going to force, update the auto cols in place
        this.beans.autoColSvc?.updateColumns(e);
        const source = _convertColumnEventSourceType(e.source);
        this.createColsFromColDefs(source);
    }

    public setColumnDefs(columnDefs: (ColDef | ColGroupDef)[], source: ColumnEventType) {
        this.colDefs = columnDefs;
        this.createColsFromColDefs(source);
    }

    public override destroy(): void {
        _destroyColumnTree(this.beans, this.colDefCols?.tree);
        super.destroy();
    }

    public getColTree(): (AgColumn | AgProvidedColumnGroup)[] {
        return this.cols?.tree ?? [];
    }

    // + columnSelectPanel
    public getColDefColTree(): (AgColumn | AgProvidedColumnGroup)[] {
        return this.colDefCols?.tree ?? [];
    }

    // + clientSideRowController -> sorting, building quick filter text
    // + headerRenderer -> sorting (clearing icon)
    public getColDefCols(): AgColumn[] | null {
        return this.colDefCols?.list ?? null;
    }

    // + moveColumnController
    public getCols(): AgColumn[] {
        return this.cols?.list ?? [];
    }

    public forAllCols(callback: (column: AgColumn) => void): void {
        const { pivotResultCols, autoColSvc, selectionColSvc } = this.beans;
        _forAll(this.colDefCols?.list, callback);
        _forAll(autoColSvc?.columns?.list, callback);
        _forAll(selectionColSvc?.columns?.list, callback);
        _forAll(pivotResultCols?.getPivotResultCols()?.list, callback);
    }

    public getColsForKeys(keys: ColKey[]): AgColumn[] {
        if (!keys) {
            return [];
        }
        return keys.map((key) => this.getCol(key)).filter((col): col is AgColumn => col != null);
    }

    public getColDefCol(key: ColKey): AgColumn | null {
        if (!this.colDefCols?.list) {
            return null;
        }
        return this.getColFromCollection(key, this.colDefCols);
    }

    public getCol(key: Maybe<ColKey>): AgColumn | null {
        if (key == null) {
            return null;
        }
        return this.getColFromCollection(key, this.cols);
    }

    /**
     * Get column exclusively by ID.
     *
     * Note getCol/getColFromCollection have poor performance when col has been removed.
     */
    public getColById(key: string): AgColumn | null {
        return this.cols?.map[key] ?? null;
    }

    public getColFromCollection(key: ColKey, cols?: ColumnCollections): AgColumn | null {
        if (cols == null) {
            return null;
        }

        const { map, list } = cols;

        // most of the time this method gets called the key is a string, so we put this shortcut in
        // for performance reasons, to see if we can match for ID (it doesn't do auto columns, that's done below)
        if (typeof key == 'string' && map[key]) {
            return map[key];
        }

        for (let i = 0; i < list.length; i++) {
            if (_columnsMatch(list[i], key)) {
                return list[i];
            }
        }

        return this.beans.autoColSvc?.getColumn(key) ?? this.beans.selectionColSvc?.getColumn(key) ?? null;
    }
}
