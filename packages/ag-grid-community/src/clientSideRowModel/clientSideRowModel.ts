import { _debounce } from '../agStack/utils/function';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { GridOptions } from '../entities/gridOptions';
import { ROW_ID_PREFIX_ROW_GROUP, RowNode } from '../entities/rowNode';
import type { FilterChangedEvent, StylesChangedEvent } from '../events';
import { _getGroupSelectsDescendants, _getRowHeightForNode, _isAnimateRows, _isDomLayout } from '../gridOptionsUtils';
import type {
    ClientSideRowModelStage,
    IClientSideRowModel,
    RefreshModelParams,
} from '../interfaces/iClientSideRowModel';
import type { ForEachNodeCallback, RowBounds, RowModelType } from '../interfaces/iRowModel';
import type { IRowNodeStage } from '../interfaces/iRowNodeStage';
import type { RowDataTransaction } from '../interfaces/rowDataTransaction';
import type { RowNodeTransaction } from '../interfaces/rowNodeTransaction';
import { ChangedPath } from '../utils/changedPath';
import { _warn } from '../validation/logging';
import { ChangedRowNodes } from './changedRowNodes';
import { ClientSideNodeManager } from './clientSideNodeManager';
import { updateRowNodeAfterFilter } from './filterStage';
import { updateRowNodeAfterSort } from './sortStage';

interface BatchTransactionItem<TData = any> {
    rowDataTransaction: RowDataTransaction<TData>;
    callback: ((res: RowNodeTransaction<TData>) => void) | undefined;
}

export class ClientSideRowModel extends BeanStub implements IClientSideRowModel, NamedBean {
    beanName = 'rowModel' as const;

    // top most node of the tree. the children are the user provided data.
    public rootNode: RowNode | null = null;
    public rowCountReady: boolean = false;

    private nodeManager: ClientSideNodeManager<any> | undefined = undefined;
    private rowsToDisplay: RowNode[] = []; // the rows mapped to rows to display
    private formulaRows: RowNode[] = [];

    /** Keep track if row data was updated. Important with suppressModelUpdateAfterUpdateTransaction and refreshModel api is called  */
    private rowDataUpdatedPending: boolean = false;

    private asyncTransactions: BatchTransactionItem[] | null = null;
    private asyncTransactionsTimer: number = 0;

    /** Has the start method been called */
    private started: boolean = false;
    /**
     * This is to prevent refresh model being called when it's already being called.
     * E.g. the group stage can trigger initial state filter model to be applied. This fires onFilterChanged,
     * which then triggers the listener here that calls refresh model again but at the filter stage
     * (which is about to be run by the original call).
     */
    private refreshingModel: boolean = false;
    private rowNodesCountReady: boolean = false;

    /** The stages that process row nodes, in order of execution */
    private stages: IRowNodeStage[] = [];

    /** Maps a property name to the index in this.stages array */
    private readonly stagesRefreshProps = new Map<keyof GridOptions, number>();

    public postConstruct(): void {
        const beans = this.beans;
        const rootNode = new RowNode(beans);
        this.rootNode = rootNode;
        this.nodeManager = this.createBean(new ClientSideNodeManager(rootNode));

        const refreshEverythingFunc = this.refreshModel.bind(this, { step: 'group' });
        const refreshEverythingAfterColsChangedFunc = this.refreshModel.bind(this, {
            step: 'group', // after cols change, row grouping (the first stage) could of changed
            afterColumnsChanged: true,
            keepRenderedRows: true,
            // we want animations cos sorting or filtering could be applied
            animate: !this.gos.get('suppressAnimationFrame'),
        });

        this.addManagedEventListeners({
            newColumnsLoaded: refreshEverythingAfterColsChangedFunc,
            columnRowGroupChanged: refreshEverythingFunc,
            columnValueChanged: this.onValueChanged.bind(this),
            columnPivotChanged: this.refreshModel.bind(this, { step: 'pivot' }),
            filterChanged: this.onFilterChanged.bind(this),
            sortChanged: this.onSortChanged.bind(this),
            columnPivotModeChanged: refreshEverythingFunc,
            stylesChanged: this.onGridStylesChanges.bind(this),
            gridReady: this.onGridReady.bind(this),
            rowExpansionStateChanged: this.onRowGroupOpened.bind(this),
        });

        this.addPropertyListeners(); // Property listeners which call `refreshModel` at different stages
    }

    private addPropertyListeners() {
        // Omitted Properties
        //
        // We do not act reactively on all functional properties, as it's possible the application is React and
        // has not memoised the property and it's getting set every render.
        //
        // ** LIST OF NON REACTIVE, NO ARGUMENT
        //
        // getDataPath, getRowId -- these are called once for each Node when the Node is created.
        //                       -- these are immutable Node properties (ie a Node ID cannot be changed)
        //
        // isRowMaster           -- called when masterDetail is true and the Node is created or the property was changed
        //
        // getRowHeight - this is called once when Node is created, if a new getRowHeight function is provided,
        //              - we do not revisit the heights of each node.
        //
        // pivotDefaultExpanded - relevant for initial pivot column creation, no impact on existing pivot columns.
        //
        // deltaSort - this changes the type of algorithm used only, it doesn't change the sort order. so no point
        //           - in doing the sort again as the same result will be got. the new Prop will be used next time we sort.
        //
        // ** LIST OF NON REACTIVE, SOME ARGUMENT
        // ** For these, they could be reactive, but not convinced the business argument is strong enough,
        // ** so leaving as non-reactive for now, and see if anyone complains.
        //
        // processPivotResultColDef, processPivotResultColGroupDef
        //                       - there is an argument for having these reactive, that if the application changes
        //                       - these props, we should re-create the Pivot Columns, however it's highly unlikely
        //                       - the application would change these functions, far more likely the functions were
        //                       - non memoised correctly.

        const { beans, stagesRefreshProps } = this;
        const orderedStages = [
            beans.groupStage,
            beans.filterStage,
            beans.pivotStage,
            beans.aggStage,
            beans.sortStage,
            beans.filterAggStage,
            beans.flattenStage,
        ].filter((stage): stage is IRowNodeStage => !!stage);
        this.stages = orderedStages;
        for (let i = orderedStages.length - 1; i >= 0; --i) {
            for (const prop of orderedStages[i].refreshProps) {
                stagesRefreshProps.set(prop, i);
            }
        }
        this.addManagedPropertyListeners([...stagesRefreshProps.keys()], (params) => {
            const properties = params.changeSet?.properties;
            if (properties) {
                this.onPropChange(properties);
            }
        });

        // TODO: HACK: rowData should be in the list of allProps instead of being registered separately.
        // but due to AG-13498, the columnModel will execute AFTER the previous listeners if properties
        // the column model listen to together with the previous listener are changed together.
        // So this is a temporary solution to make sure rowData is processed after the columnModel is ready.
        // Unfortunately this can result in double refresh when multiple properties are changed together, as it was before version 33.
        this.addManagedPropertyListener('rowData', () => this.onPropChange(['rowData']));

        this.addManagedPropertyListener('rowHeight', () => this.resetRowHeights());
    }

    public start(): void {
        this.started = true;
        if (this.rowNodesCountReady) {
            this.refreshModel({ step: 'group', rowDataUpdated: true, newData: true });
        } else {
            this.setInitialData();
        }
    }

    private setInitialData(): void {
        const rowData = this.gos.get('rowData');
        if (rowData) {
            this.onPropChange(['rowData']);
        }
    }

    public ensureRowHeightsValid(
        startPixel: number,
        endPixel: number,
        startLimitIndex: number,
        endLimitIndex: number
    ): boolean {
        let atLeastOneChange: boolean;
        let res = false;

        // we do this multiple times as changing the row heights can also change the first and last rows,
        // so the first pass can make lots of rows smaller, which means the second pass we end up changing
        // more rows.
        do {
            atLeastOneChange = false;

            const rowAtStartPixel = this.getRowIndexAtPixel(startPixel);
            const rowAtEndPixel = this.getRowIndexAtPixel(endPixel);

            // keep check to current page if doing pagination
            const firstRow = Math.max(rowAtStartPixel, startLimitIndex);
            const lastRow = Math.min(rowAtEndPixel, endLimitIndex);

            for (let rowIndex = firstRow; rowIndex <= lastRow; rowIndex++) {
                const rowNode = this.getRow(rowIndex);
                if (rowNode.rowHeightEstimated) {
                    const rowHeight = _getRowHeightForNode(this.beans, rowNode);
                    rowNode.setRowHeight(rowHeight.height);
                    atLeastOneChange = true;
                    res = true;
                }
            }

            if (atLeastOneChange) {
                this.setRowTopAndRowIndex();
            }
        } while (atLeastOneChange);

        return res;
    }

    private onPropChange(properties: (keyof GridOptions)[]): void {
        const { nodeManager, gos, beans } = this;
        const groupStage = beans.groupStage;
        if (!nodeManager) {
            return; // Destroyed
        }
        const changedProps = new Set(properties);
        const extractData = groupStage?.onPropChange(changedProps);

        let newRowData: any[] | null | undefined;
        if (changedProps.has('rowData')) {
            newRowData = gos.get('rowData'); // new rowData to load or update
        } else if (extractData) {
            newRowData = groupStage?.extractData(); // extract rowData from nodes, to include changes
        }
        if (newRowData && !Array.isArray(newRowData)) {
            newRowData = null;
            _warn(1); // `rowData` must be an array
        }

        const params: RefreshModelParams = { step: 'nothing', changedProps };
        if (newRowData) {
            const immutable =
                !extractData &&
                !this.isEmpty() &&
                newRowData.length > 0 &&
                gos.exists('getRowId') &&
                // backward compatibility - for who want old behaviour of Row IDs but NOT Immutable Data.
                !gos.get('resetRowDataOnUpdate');
            if (immutable) {
                params.keepRenderedRows = true;
                params.animate = !gos.get('suppressAnimationFrame');
                params.changedRowNodes = new ChangedRowNodes();
                nodeManager.setImmutableRowData(params, newRowData);
            } else {
                params.rowDataUpdated = true;
                params.newData = true;
                nodeManager.setNewRowData(newRowData);
                this.rowNodesCountReady = true;
            }
        }

        const step = params.rowDataUpdated ? 'group' : this.getRefreshedStage(properties);
        if (step) {
            params.step = step;
            this.refreshModel(params);
        }
    }

    private getRefreshedStage(properties: (keyof GridOptions)[]): ClientSideRowModelStage | null {
        const { stages, stagesRefreshProps } = this;
        const stagesLen = stages.length;
        let minIndex = stagesLen;
        for (let i = 0, len = properties.length; i < len && minIndex; ++i) {
            minIndex = Math.min(minIndex, stagesRefreshProps.get(properties[i]) ?? minIndex);
        }
        return minIndex < stagesLen ? stages[minIndex].step : null;
    }

    private setRowTopAndRowIndex(outputDisplayedRowsMapped?: Set<string>): void {
        const { beans, rowsToDisplay } = this;
        const defaultRowHeight = beans.environment.getDefaultRowHeight();
        let nextRowTop = 0;

        // we don't estimate if doing fullHeight or autoHeight, as all rows get rendered all the time
        // with these two layouts.
        const allowEstimate = _isDomLayout(this.gos, 'normal');

        for (let i = 0, len = rowsToDisplay.length; i < len; ++i) {
            const rowNode = rowsToDisplay[i];

            const id = rowNode.id;
            if (id != null) {
                outputDisplayedRowsMapped?.add(id);
            }

            if (rowNode.rowHeight == null) {
                const rowHeight = _getRowHeightForNode(beans, rowNode, allowEstimate, defaultRowHeight);
                rowNode.setRowHeight(rowHeight.height, rowHeight.estimated);
            }

            rowNode.setRowTop(nextRowTop);
            rowNode.setRowIndex(i);
            nextRowTop += rowNode.rowHeight!;
        }

        if (this.gos.get('enableFormulas')) {
            const formulaRows = this.formulaRows;
            for (let i = 0, len = formulaRows.length; i < len; ++i) {
                const rowNode = formulaRows[i];
                rowNode.formulaRowIndex = i;
            }
        }
    }

    private clearRowTopAndRowIndex(changedPath: ChangedPath, displayedRowsMapped: Set<string>): void {
        const changedPathActive = changedPath.active;

        const clearIfNotDisplayed = (rowNode?: RowNode) => {
            if (rowNode?.id != null && !displayedRowsMapped.has(rowNode.id)) {
                rowNode.clearRowTopAndRowIndex();
            }
        };

        const recurse = (rowNode: RowNode) => {
            clearIfNotDisplayed(rowNode);
            clearIfNotDisplayed(rowNode.detailNode);
            clearIfNotDisplayed(rowNode.sibling);

            const childrenAfterGroup = rowNode.childrenAfterGroup;
            if (!rowNode.hasChildren() || !childrenAfterGroup) {
                return;
            }

            // if a changedPath is active, it means we are here because of a transaction update or
            // a change detection. neither of these impacts the open/closed state of groups. so if
            // a group is not open this time, it was not open last time. so we know all closed groups
            // already have their top positions cleared. so there is no need to traverse all the way
            // when changedPath is active and the rowNode is not expanded.
            const isRootNode = rowNode.level == -1; // we need to give special consideration for root node,
            // as expanded=undefined for root node
            const skipChildren = changedPathActive && !isRootNode && !rowNode.expanded;
            if (skipChildren) {
                return;
            }
            for (let i = 0, len = childrenAfterGroup.length; i < len; ++i) {
                recurse(childrenAfterGroup[i]);
            }
        };

        const rootNode = this.rootNode;
        if (rootNode) {
            recurse(rootNode);
        }
    }

    public isLastRowIndexKnown(): boolean {
        return true;
    }

    public getRowCount(): number {
        return this.rowsToDisplay.length;
    }

    /**
     * Returns the number of rows with level === 1
     */
    public getTopLevelRowCount(): number {
        const { rootNode, rowsToDisplay } = this;
        if (!rootNode || !rowsToDisplay.length) {
            return 0;
        }

        // exception to func comment, if showing root node, then we return that
        const showingRootNode = rowsToDisplay[0] === rootNode;
        if (showingRootNode) {
            return 1;
        }

        const totalFooterInc = rootNode.sibling?.displayed ? 1 : 0;
        // we use the childrenAfterSort as postSortRows is occasionally used to reduce row count.
        return (rootNode.childrenAfterSort?.length ?? 0) + totalFooterInc;
    }

    /**
     * Get the row display index by the top level index
     * top level index is the index of rows with level === 1
     */
    public getTopLevelRowDisplayedIndex(topLevelIndex: number): number {
        const { beans, rootNode, rowsToDisplay } = this;
        const showingRootNode = !rootNode || !rowsToDisplay.length || rowsToDisplay[0] === rootNode;

        // exception to function comment, if showing footer node (level === -1) return 0.
        if (showingRootNode) {
            return topLevelIndex;
        }

        const childrenAfterSort = rootNode.childrenAfterSort;

        const getDefaultIndex = (adjustedIndex: number) => {
            let rowNode = childrenAfterSort![adjustedIndex];

            if (this.gos.get('groupHideOpenParents')) {
                // if hideOpenParents, then get lowest displayed descendent
                while (rowNode.expanded && rowNode.childrenAfterSort && rowNode.childrenAfterSort.length > 0) {
                    rowNode = rowNode.childrenAfterSort[0];
                }
            }

            return rowNode.rowIndex!;
        };

        const footerSvc = beans.footerSvc;
        if (footerSvc) {
            return footerSvc?.getTopDisplayIndex(rowsToDisplay, topLevelIndex, childrenAfterSort!, getDefaultIndex);
        }
        return getDefaultIndex(topLevelIndex);
    }

    /**
     * The opposite of `getTopLevelRowDisplayedIndex`
     */
    public getTopLevelIndexFromDisplayedIndex(displayedIndex: number): number {
        const { rootNode, rowsToDisplay } = this;
        const showingRootNode = !rootNode || !rowsToDisplay.length || rowsToDisplay[0] === rootNode;

        if (showingRootNode) {
            return displayedIndex;
        }

        let node = this.getRow(displayedIndex);

        if (node.footer) {
            node = node.sibling;
        }

        // find the top level node
        let parent = node.parent;
        while (parent && parent !== rootNode) {
            node = parent;
            parent = node.parent;
        }

        const topLevelIndex = rootNode.childrenAfterSort?.indexOf(node) ?? -1;
        return topLevelIndex >= 0 ? topLevelIndex : displayedIndex;
    }

    public getRowBounds(index: number): RowBounds | null {
        const rowNode = this.rowsToDisplay[index];
        return rowNode ? { rowTop: rowNode.rowTop!, rowHeight: rowNode.rowHeight! } : null;
    }

    private onRowGroupOpened(): void {
        this.refreshModel({ step: 'map', keepRenderedRows: true, animate: _isAnimateRows(this.gos) });
    }

    private onFilterChanged({ afterDataChange, columns }: FilterChangedEvent): void {
        if (!afterDataChange) {
            const primaryOrQuickFilterChanged = columns.length === 0 || columns.some((col) => col.isPrimary());
            const step: ClientSideRowModelStage = primaryOrQuickFilterChanged ? 'filter' : 'filter_aggregates';
            this.refreshModel({ step: step, keepRenderedRows: true, animate: _isAnimateRows(this.gos) });
        }
    }

    private onSortChanged(): void {
        this.refreshModel({
            step: 'sort',
            keepRenderedRows: true,
            animate: _isAnimateRows(this.gos),
        });
    }

    public getType(): RowModelType {
        return 'clientSide';
    }

    private onValueChanged(): void {
        this.refreshModel({ step: this.beans.colModel.isPivotActive() ? 'pivot' : 'aggregate' });
    }

    private createChangePath(enabled: boolean): ChangedPath {
        // for updates, if the row is updated at all, then we re-calc all the values
        // in that row. we could compare each value to each old value, however if we
        // did this, we would be calling the valueSvc twice, once on the old value
        // and once on the new value. so it's less valueGetter calls if we just assume
        // each column is different. that way the changedPath is used so that only
        // the impacted parent rows are recalculated, parents who's children have
        // not changed are not impacted.
        const changedPath = new ChangedPath(false, this.rootNode!);
        changedPath.active = enabled;
        return changedPath;
    }

    private isSuppressModelUpdateAfterUpdateTransaction(params: RefreshModelParams): boolean {
        if (!this.gos.get('suppressModelUpdateAfterUpdateTransaction')) {
            return false; // Not suppressed
        }

        const { changedRowNodes, newData, rowDataUpdated } = params;

        if (!changedRowNodes || newData || !rowDataUpdated) {
            return false; // Not a transaction update
        }

        if (changedRowNodes.removals.size || changedRowNodes.adds.size) {
            return false; // There are added rows or removed rows, not just updates
        }

        return true; // Nothing changed, or only updates with no new rows and no removals
    }

    public refreshModel(params: RefreshModelParams): void {
        const { nodeManager, beans, eventSvc, started, refreshingModel } = this;
        if (!nodeManager) {
            return; // destroyed
        }

        const rowDataUpdated = !!params.rowDataUpdated;
        const changedPath = (params.changedPath ??= this.createChangePath(!params.newData && rowDataUpdated));

        if (started && rowDataUpdated) {
            eventSvc.dispatchEvent({ type: 'rowDataUpdated' });
        }

        if (
            !started ||
            refreshingModel ||
            beans.colModel.changeEventsDispatching ||
            this.isSuppressModelUpdateAfterUpdateTransaction(params)
        ) {
            this.rowDataUpdatedPending ||= rowDataUpdated;
            return;
        }

        if (this.rowDataUpdatedPending) {
            this.rowDataUpdatedPending = false;
            params.step = 'group'; // Ensure grouping runs
        }

        this.refreshingModel = true;

        beans.masterDetailSvc?.refreshModel(params);
        if (rowDataUpdated && params.step !== 'group') {
            beans.colFilter?.refreshModel();
        }

        // this goes through the pipeline of stages. what's in my head is similar to the diagram on this page:
        // http://commons.apache.org/sandbox/commons-pipeline/pipeline_basics.html
        // however we want to keep the results of each stage, hence we manually call each step
        // rather than have them chain each other.
        // fallthrough in below switch is on purpose, eg if STEP_FILTER, then all steps after runs too
        /* eslint-disable no-fallthrough */
        switch (params.step) {
            case 'group':
                this.doGrouping(params);
            case 'filter':
                this.doFilter(changedPath);
            case 'pivot':
                this.doPivot(changedPath);
            case 'aggregate': // depends on agg fields
                this.doAggregate(changedPath);
            case 'filter_aggregates':
                this.doFilterAggregates(changedPath);
            case 'sort':
                this.doSort(params.changedRowNodes, changedPath);
            case 'map':
                this.doRowsToDisplay();
        }
        /* eslint-enable no-fallthrough */

        // set all row tops to null, then set row tops on all visible rows. if we don't do this,
        // then the algorithm below only sets row tops, old row tops from old rows will still lie around
        const displayedNodesMapped = new Set<string>();
        this.setRowTopAndRowIndex(displayedNodesMapped);
        this.clearRowTopAndRowIndex(changedPath, displayedNodesMapped);

        this.refreshingModel = false;

        eventSvc.dispatchEvent({
            type: 'modelUpdated',
            animate: params.animate,
            keepRenderedRows: params.keepRenderedRows,
            newData: params.newData,
            newPage: false,
            keepUndoRedoStack: params.keepUndoRedoStack,
        });
    }

    public isEmpty(): boolean {
        return !this.rootNode?._leafs?.length || !this.beans.colModel?.ready;
    }

    public isRowsToRender(): boolean {
        return this.rowsToDisplay.length > 0;
    }

    public getNodesInRangeForSelection(firstInRange: RowNode, lastInRange: RowNode): RowNode[] {
        let started = false;
        let finished = false;

        const result: RowNode[] = [];

        const groupsSelectChildren = _getGroupSelectsDescendants(this.gos);

        this.forEachNodeAfterFilterAndSort((rowNode) => {
            // range has been closed, skip till end
            if (finished) {
                return;
            }

            if (started) {
                if (rowNode === lastInRange || rowNode === firstInRange) {
                    // check if this is the last node we're going to be adding
                    finished = true;

                    // if the final node was a group node, and we're doing groupSelectsChildren
                    // make the exception to select all of it's descendants too
                    if (groupsSelectChildren && rowNode.group) {
                        addAllLeafs(result, rowNode);
                        return;
                    }
                }
            }

            if (!started) {
                if (rowNode !== lastInRange && rowNode !== firstInRange) {
                    // still haven't hit a boundary node, keep searching
                    return;
                }
                started = true;

                // When the first and last node are the same we're already finished
                if (lastInRange === firstInRange) {
                    finished = true;
                }
            }

            // only select leaf nodes if groupsSelectChildren
            const includeThisNode = !rowNode.group || !groupsSelectChildren;
            if (includeThisNode) {
                result.push(rowNode);
            }
        });

        return result;
    }

    public getTopLevelNodes(): RowNode[] | null {
        return this.rootNode?.childrenAfterGroup ?? null;
    }

    public getRow(index: number): RowNode {
        return this.rowsToDisplay[index];
    }

    public getFormulaRow(index: number): RowNode {
        return this.formulaRows[index];
    }

    public isRowPresent(rowNode: RowNode): boolean {
        return this.rowsToDisplay.indexOf(rowNode) >= 0;
    }

    public getRowIndexAtPixel(pixelToMatch: number): number {
        const rowsToDisplay = this.rowsToDisplay;
        const rowsToDisplayLen = rowsToDisplay.length;
        if (this.isEmpty() || rowsToDisplayLen === 0) {
            return -1;
        }

        // do binary search of tree
        // http://oli.me.uk/2013/06/08/searching-javascript-arrays-with-a-binary-search/
        let bottomPointer = 0;
        let topPointer = rowsToDisplayLen - 1;

        // quick check, if the pixel is out of bounds, then return last row
        if (pixelToMatch <= 0) {
            // if pixel is less than or equal zero, it's always the first row
            return 0;
        }
        const lastNode = rowsToDisplay[topPointer];
        if (lastNode.rowTop! <= pixelToMatch) {
            return topPointer;
        }

        let oldBottomPointer = -1;
        let oldTopPointer = -1;

        while (true) {
            const midPointer = Math.floor((bottomPointer + topPointer) / 2);
            const currentRowNode = rowsToDisplay[midPointer];

            if (this.isRowInPixel(currentRowNode, pixelToMatch)) {
                return midPointer;
            }

            if (currentRowNode.rowTop! < pixelToMatch) {
                bottomPointer = midPointer + 1;
            } else if (currentRowNode.rowTop! > pixelToMatch) {
                topPointer = midPointer - 1;
            }

            // infinite loops happen when there is space between rows. this can happen
            // when Auto Height is active, cos we re-calculate row tops asynchronously
            // when row heights change, which can temporarily result in gaps between rows.
            const caughtInInfiniteLoop = oldBottomPointer === bottomPointer && oldTopPointer === topPointer;
            if (caughtInInfiniteLoop) {
                return midPointer;
            }

            oldBottomPointer = bottomPointer;
            oldTopPointer = topPointer;
        }
    }

    private isRowInPixel(rowNode: RowNode, pixelToMatch: number): boolean {
        const topPixel = rowNode.rowTop!;
        const bottomPixel = topPixel + rowNode.rowHeight!;
        return topPixel <= pixelToMatch && bottomPixel > pixelToMatch;
    }

    public forEachLeafNode(callback: ForEachNodeCallback): void {
        const allLeafs = this.rootNode?._leafs;
        if (allLeafs) {
            for (let i = 0, len = allLeafs.length; i < len; ++i) {
                callback(allLeafs[i], i);
            }
        }
    }

    public forEachNode(callback: ForEachNodeCallback, includeFooterNodes: boolean = false): void {
        this.depthFirstSearchRowNodes(callback, includeFooterNodes);
    }

    public forEachDisplayedNode(callback: ForEachNodeCallback): void {
        const rowsToDisplay = this.rowsToDisplay;
        for (let i = 0, len = rowsToDisplay.length; i < len; ++i) {
            callback(rowsToDisplay[i], i);
        }
    }

    public forEachNodeAfterFilter(callback: ForEachNodeCallback, includeFooterNodes: boolean = false): void {
        this.depthFirstSearchRowNodes(callback, includeFooterNodes, (node) => node.childrenAfterAggFilter);
    }

    public forEachNodeAfterFilterAndSort(callback: ForEachNodeCallback, includeFooterNodes: boolean = false): void {
        this.depthFirstSearchRowNodes(callback, includeFooterNodes, (node) => node.childrenAfterSort);
    }

    public forEachPivotNode(callback: ForEachNodeCallback, includeFooterNodes?: boolean, afterSort?: boolean): void {
        const { colModel, rowGroupColsSvc } = this.beans;
        if (!colModel.isPivotMode()) {
            return;
        }

        // if no row grouping, then only row is root node
        if (!rowGroupColsSvc?.columns.length) {
            callback(this.rootNode!, 0);
            return;
        }

        const childrenField = afterSort ? 'childrenAfterSort' : 'childrenAfterGroup';
        // for pivot, we don't go below leafGroup levels
        this.depthFirstSearchRowNodes(callback, includeFooterNodes, (node) =>
            !node.leafGroup ? node[childrenField] : null
        );
    }

    /**
     * Iterate through each node and all of its children
     * @param callback the function to execute for each node
     * @param includeFooterNodes whether to also iterate over footer nodes
     * @param nodes the nodes to start iterating over
     * @param getChildren a function to determine the recursion strategy
     * @param startIndex the index to start from
     * @returns the index ended at
     */
    private depthFirstSearchRowNodes(
        callback: ForEachNodeCallback,
        includeFooterNodes: boolean = false,
        getChildren: (node: RowNode) => RowNode[] | null = (node) => node.childrenAfterGroup,
        node: RowNode | null = this.rootNode,
        startIndex: number = 0
    ): number {
        let index = startIndex;
        if (!node) {
            return index;
        }

        const isRootNode = node === this.rootNode;
        if (!isRootNode) {
            callback(node, index++);
        }

        if (node.hasChildren() && !node.footer) {
            const children = getChildren(node);
            if (children) {
                const footerSvc = this.beans.footerSvc;
                index = footerSvc?.addTotalRows(index, node, callback, includeFooterNodes, isRootNode, 'top') ?? index;
                for (const node of children) {
                    index = this.depthFirstSearchRowNodes(callback, includeFooterNodes, getChildren, node, index);
                }
                return (
                    footerSvc?.addTotalRows(index, node, callback, includeFooterNodes, isRootNode, 'bottom') ?? index
                );
            }
        }
        return index;
    }

    // it's possible to recompute the aggregate without doing the other parts + api.refreshClientSideRowModel('aggregate')
    public doAggregate(changedPath?: ChangedPath): void {
        const rootNode = this.rootNode;
        if (rootNode) {
            this.beans.aggStage?.execute({ rowNode: rootNode, changedPath });
        }
    }

    private doFilterAggregates(changedPath: ChangedPath): void {
        const rootNode = this.rootNode!;
        const filterAggStage = this.beans.filterAggStage;
        if (filterAggStage) {
            filterAggStage.execute({ rowNode: rootNode, changedPath });
            return;
        }
        // If filterAggStage is undefined, then so is the grouping stage, so all children should be on the rootNode.
        rootNode.childrenAfterAggFilter = rootNode.childrenAfterFilter;
    }

    private doSort(changedRowNodes: ChangedRowNodes | undefined, changedPath: ChangedPath) {
        const sortStage = this.beans.sortStage;
        if (sortStage) {
            sortStage.execute({
                rowNode: this.rootNode!,
                changedRowNodes,
                changedPath,
            });
            return;
        }
        changedPath.forEachChangedNodeDepthFirst((rowNode) => {
            rowNode.childrenAfterSort = rowNode.childrenAfterAggFilter!.slice(0);
            updateRowNodeAfterSort(rowNode);
        });
    }

    private doGrouping(params: RefreshModelParams): void {
        const rootNode = this.rootNode!;
        const groupStage = this.beans.groupStage;
        const groupingChanged = groupStage?.execute({
            rowNode: rootNode,
            changedRowNodes: params.changedRowNodes,
            changedPath: params.changedPath,
            afterColumnsChanged: !!params.afterColumnsChanged,
        });
        if (groupingChanged === undefined) {
            const allLeafs = rootNode._leafs!;
            rootNode.childrenAfterGroup = allLeafs;
            rootNode.updateHasChildren();
            const sibling = rootNode.sibling;
            if (sibling) {
                sibling.childrenAfterGroup = allLeafs;
            }
        }
        if (groupingChanged || params.rowDataUpdated) {
            this.beans.colFilter?.refreshModel();
        }
        if (!this.rowCountReady && this.rowNodesCountReady) {
            this.rowCountReady = true; // only if row data has been set
            this.eventSvc.dispatchEventOnce({ type: 'rowCountReady' });
        }
    }

    private doFilter(changedPath: ChangedPath) {
        const filterStage = this.beans.filterStage;
        if (filterStage) {
            filterStage.execute({ rowNode: this.rootNode!, changedPath: changedPath });
            return;
        }
        changedPath.forEachChangedNodeDepthFirst((rowNode) => {
            rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
            updateRowNodeAfterFilter(rowNode);
        }, true);
    }

    private doPivot(changedPath: ChangedPath) {
        this.beans.pivotStage?.execute({ rowNode: this.rootNode!, changedPath: changedPath });
    }

    public getRowNode(id: string): RowNode | undefined {
        const found = this.nodeManager?.getRowNode(id);
        if (typeof found === 'object') {
            return found; // we check for typeof object to avoid returning things from Object.prototype
        }
        // although id is typed a string, this could be called by the user, and they could have passed a number
        const idIsGroup = typeof id == 'string' && id.indexOf(ROW_ID_PREFIX_ROW_GROUP) === 0;
        return idIsGroup ? this.beans.groupStage?.getNode(id) : undefined;
    }

    public batchUpdateRowData(
        rowDataTransaction: RowDataTransaction,
        callback?: (res: RowNodeTransaction) => void
    ): void {
        if (!this.asyncTransactionsTimer) {
            this.asyncTransactions = [];
            const waitMilliseconds = this.gos.get('asyncTransactionWaitMillis');
            this.asyncTransactionsTimer = setTimeout(() => this.executeBatchUpdateRowData(), waitMilliseconds);
        }
        this.asyncTransactions!.push({ rowDataTransaction: rowDataTransaction, callback });
    }

    public flushAsyncTransactions(): void {
        const asyncTransactionsTimer = this.asyncTransactionsTimer;
        if (asyncTransactionsTimer) {
            clearTimeout(asyncTransactionsTimer);
            this.executeBatchUpdateRowData();
        }
    }

    private executeBatchUpdateRowData(): void {
        const { nodeManager, beans, eventSvc, asyncTransactions } = this;
        if (!nodeManager) {
            return; // destroyed
        }
        beans.valueCache?.onDataChanged();

        const rowNodeTrans: RowNodeTransaction[] = [];
        const callbackFuncsBound: ((...args: any[]) => any)[] = [];
        const changedRowNodes = new ChangedRowNodes();
        for (const { rowDataTransaction, callback } of asyncTransactions ?? []) {
            this.rowNodesCountReady = true;
            const rowNodeTransaction = nodeManager.updateRowData(rowDataTransaction, changedRowNodes);
            rowNodeTrans.push(rowNodeTransaction);
            if (callback) {
                callbackFuncsBound.push(callback.bind(null, rowNodeTransaction));
            }
        }
        this.commitTransactions(changedRowNodes);

        // do callbacks in next VM turn so it's async
        if (callbackFuncsBound.length > 0) {
            setTimeout(() => {
                for (let i = 0, len = callbackFuncsBound.length; i < len; i++) {
                    callbackFuncsBound[i]();
                }
            }, 0);
        }

        if (rowNodeTrans.length > 0) {
            eventSvc.dispatchEvent({ type: 'asyncTransactionsFlushed', results: rowNodeTrans });
        }
        this.asyncTransactionsTimer = 0;
        this.asyncTransactions = null;
    }

    /**
     * Used to apply transaction changes.
     * Called by gridApi & rowDragFeature
     */
    public updateRowData(rowDataTran: RowDataTransaction): RowNodeTransaction | null {
        const nodeManager = this.nodeManager;
        if (!nodeManager) {
            return null; // destroyed
        }
        this.beans.valueCache?.onDataChanged();

        this.rowNodesCountReady = true;
        const changedRowNodes = new ChangedRowNodes();
        const rowNodeTransaction = nodeManager.updateRowData(rowDataTran, changedRowNodes);
        this.commitTransactions(changedRowNodes);
        return rowNodeTransaction;
    }

    /**
     * Common to:
     * - executeBatchUpdateRowData (batch transactions)
     * - updateRowData (single transaction)
     * - setImmutableRowData (generated transaction)
     *
     * @param rowNodeTrans - the transactions to apply
     * @param orderChanged - whether the order of the rows has changed, either via generated transaction or user provided addIndex
     */
    private commitTransactions(changedRowNodes: ChangedRowNodes): void {
        this.refreshModel({
            step: 'group',
            rowDataUpdated: true,
            keepRenderedRows: true,
            animate: !this.gos.get('suppressAnimationFrame'),
            changedRowNodes,
            changedPath: this.createChangePath(true),
        });
    }

    private doRowsToDisplay() {
        const { rootNode, beans } = this;

        const usingFormulas = beans.gos.get('enableFormulas');
        if (usingFormulas) {
            const unfilteredRows = rootNode?.childrenAfterSort ?? [];
            this.formulaRows = unfilteredRows;
            this.rowsToDisplay = unfilteredRows.filter((row) => !row.softFiltered);

            for (const row of this.rowsToDisplay) {
                row.setUiLevel(0);
            }
            return;
        }

        const flattenStage = beans.flattenStage;
        if (flattenStage) {
            this.rowsToDisplay = flattenStage.execute({ rowNode: rootNode! });
            return;
        }
        const rowsToDisplay = this.rootNode!.childrenAfterSort ?? [];
        for (const row of rowsToDisplay) {
            row.setUiLevel(0);
        }
        this.rowsToDisplay = rowsToDisplay;
    }

    public onRowHeightChanged(): void {
        this.refreshModel({ step: 'map', keepRenderedRows: true, keepUndoRedoStack: true });
    }

    public resetRowHeights(): void {
        const rootNode = this.rootNode;
        if (!rootNode) {
            return; // destroyed
        }

        const atLeastOne = this.resetRowHeightsForAllRowNodes();

        rootNode.setRowHeight(rootNode.rowHeight, true);
        const sibling = rootNode.sibling;
        sibling?.setRowHeight(sibling.rowHeight, true);

        // when pivotMode but pivot not active, root node is displayed on its own
        // because it's only ever displayed alone, refreshing the model (onRowHeightChanged) is not required
        if (atLeastOne) {
            this.onRowHeightChanged();
        }
    }

    private resetRowHeightsForAllRowNodes(): boolean {
        let atLeastOne = false;
        this.forEachNode((rowNode) => {
            rowNode.setRowHeight(rowNode.rowHeight, true);
            // we keep the height each row is at, however we set estimated=true rather than clear the height.
            // this means the grid will not reset the row heights back to defaults, rather it will re-calc
            // the height for each row as the row is displayed. otherwise the scroll will jump when heights are reset.
            const detailNode = rowNode.detailNode;
            detailNode?.setRowHeight(detailNode.rowHeight, true);

            const sibling = rowNode.sibling;
            sibling?.setRowHeight(sibling.rowHeight, true);
            atLeastOne = true;
        });

        return atLeastOne;
    }

    private onGridStylesChanges(e: StylesChangedEvent) {
        if (e.rowHeightChanged && !this.beans.rowAutoHeight?.active) {
            this.resetRowHeights();
        }
    }

    private onGridReady(): void {
        if (!this.started) {
            this.setInitialData(); // App can start using API to add transactions, so need to add data into the node manager if not started
        }
    }

    public override destroy(): void {
        super.destroy();
        this.nodeManager = this.destroyBean(this.nodeManager);
        this.started = false;
        this.rootNode = null;
        this.rowsToDisplay = [];
        this.asyncTransactions = null;
        clearTimeout(this.asyncTransactionsTimer);
    }

    private readonly onRowHeightChanged_debounced = _debounce(this, this.onRowHeightChanged.bind(this), 100);
    /**
     * @deprecated v33.1
     */
    public onRowHeightChangedDebounced(): void {
        this.onRowHeightChanged_debounced();
    }
}

const addAllLeafs = (result: RowNode[], node: RowNode): void => {
    const childrenAfterGroup = node.childrenAfterGroup;
    if (childrenAfterGroup) {
        for (let i = 0, len = childrenAfterGroup.length; i < len; ++i) {
            const child = childrenAfterGroup[i];
            if (child.data) {
                result.push(child);
            }
            if (child.group) {
                addAllLeafs(result, child);
            }
        }
    }
};
