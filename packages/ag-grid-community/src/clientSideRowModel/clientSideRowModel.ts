import { _debounce } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { GridOptions } from '../entities/gridOptions';
import { RowNode } from '../entities/rowNode';
import type { FilterChangedEvent, StylesChangedEvent } from '../events';
import { _getGroupSelectsDescendants, _getRowHeightForNode, _isAnimateRows, _isDomLayout } from '../gridOptionsUtils';
import type {
    ClientSideRowModelStage,
    IClientSideRowModel,
    RefreshModelParams,
} from '../interfaces/iClientSideRowModel';
import type { ForEachNodeCallback, RowBounds, RowModelType } from '../interfaces/iRowModel';
import {
    DETAIL_ROW_ID_PREFIX,
    GRAND_TOTAL_ROW_ID,
    GROUP_TOTAL_ROW_ID_PREFIX,
    ROOT_NODE_ID,
} from '../interfaces/iRowNode';
import type { IRowNodeStage } from '../interfaces/iRowNodeStage';
import type { RowDataTransaction } from '../interfaces/rowDataTransaction';
import type { RowNodeTransaction } from '../interfaces/rowNodeTransaction';
import type { OverlayType } from '../rendering/overlays/overlayComponent';
import type { ChangedPath } from '../utils/changedPath';
import { ChangedRowNodes } from './changedRowNodes';
import { ClientSideNodeManager } from './clientSideNodeManager';

interface BatchTransactionItem<TData = any> {
    rowDataTransaction: RowDataTransaction<TData>;
    callback: ((res: RowNodeTransaction<TData>) => void) | undefined;
}

export class ClientSideRowModel extends BeanStub implements IClientSideRowModel, NamedBean {
    beanName = 'rowModel' as const;

    // top most node of the tree. the children are the user provided data.
    public rootNode: RowNode | null = null;

    /** Public-readonly flag indicating row count is ready for external consumers. */
    public rowCountReady: boolean = false;

    /** True when grouping or tree data is active. Updated after grouping stage runs. */
    public hierarchical: boolean = false;

    /** Manages the row nodes, including creation, update, and removal. */
    private nodeManager: ClientSideNodeManager<any> | undefined = undefined;

    /** The rows mapped to rows to display, during the 'map' stage. */
    private rowsToDisplay: RowNode[] = [];

    /** Row nodes used for formula calculations when formula feature is active. */
    private formulaRows: RowNode[] = [];

    /** The ordered list of row processing stages: group → filter → pivot → aggregate → filterAggregates → sort → flatten. */
    private stages: IRowNodeStage[] | null = null;

    /** Queued async transactions waiting to be processed. */
    private asyncTransactions: BatchTransactionItem[] | null = null;

    /** Timer handle for batching async transactions. */
    private asyncTransactionsTimer: ReturnType<typeof setTimeout> | undefined;

    /** Has the start() method been called. */
    private started: boolean = false;

    /** Set to true when row data is being updated. Reset when model is fully refreshed. */
    public refreshingData: boolean = false;

    /** Keep track if row data was updated. Important with suppressModelUpdateAfterUpdateTransaction and refreshModel api is called. */
    private rowDataUpdatedPending: boolean = false;

    /**
     * This is to prevent refresh model being called when it's already being called.
     * E.g. the group stage can trigger initial state filter model to be applied. This fires onFilterChanged,
     * which then triggers the listener here that calls refresh model again but at the filter stage
     * (which is about to be run by the original call).
     */
    private refreshingModel: boolean = false;

    /** Set by nested refresh calls to force newData=true in the final modelUpdated event. */
    private pendingNewData: boolean = false;

    /** Set by nested reMapRows() or refreshModel() calls to force keepRenderedRows=false in the final modelUpdated event. */
    private noKeepRenderedRows: boolean = false;

    /** Set by nested reMapRows() or refreshModel() calls to force keepUndoRedoStack=false in the final modelUpdated event. */
    private noKeepUndoRedoStack: boolean = false;

    /** Set by nested refresh calls to prevent animate=true in the final modelUpdated event when any call didn't allow animation. */
    private noAnimate: boolean = false;

    /** True after the first time row nodes have been created or data has been set. Used to determine when to fire rowCountReady. */
    private rowNodesCountReady: boolean = false;

    /** Maps a property name to the index in this.stages array */
    private readonly stagesRefreshProps = new Map<keyof GridOptions, number>();

    public postConstruct(): void {
        const beans = this.beans;
        const rootNode = new RowNode(beans);
        this.rootNode = rootNode;
        this.nodeManager = this.createBean(new ClientSideNodeManager(rootNode));

        const onColumnsChanged = () => {
            this.beans.groupStage?.invalidateGroupCols(); // in case refresh is skipped
            this.refreshModel({
                step: 'group',
                afterColumnsChanged: true,
                keepRenderedRows: true,
                animate: !this.gos.get('suppressAnimationFrame'),
            });
        };

        this.addManagedEventListeners({
            newColumnsLoaded: onColumnsChanged,
            columnRowGroupChanged: onColumnsChanged,
            columnValueChanged: this.onValueChanged.bind(this),
            columnPivotChanged: this.onPivotChanged.bind(this),
            columnPivotModeChanged: () => this.refreshModel({ step: 'group' }),
            filterChanged: this.onFilterChanged.bind(this),
            sortChanged: this.onSortChanged.bind(this),
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
            beans.groupFilterStage,
            beans.pivotStage,
            beans.aggStage,
            beans.sortStage,
            beans.groupSortStage,
            beans.filterAggStage,
            beans.flattenStage,
        ].filter((stage) => !!stage) as IRowNodeStage[];
        this.stages = orderedStages;
        for (let i = orderedStages.length - 1; i >= 0; --i) {
            const props = orderedStages[i].refreshProps;
            if (props) {
                for (const prop of props) {
                    stagesRefreshProps.set(prop, i);
                }
            }
        }

        this.addManagedPropertyListeners([...stagesRefreshProps.keys(), 'rowData'], (params) => {
            const properties = params.changeSet?.properties;
            if (properties) {
                this.onPropChange(properties);
            }
        });

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
            this.warn(1); // `rowData` must be an array
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
            this.refreshingData = true; // indicate row data update in progress, this flag will be reset when refreshModel completes
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
        if (!stages) {
            return null;
        }
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

        if (this.beans.formula?.isEvaluationActive()) {
            const formulaRows = this.formulaRows;
            for (let i = 0, len = formulaRows.length; i < len; ++i) {
                const rowNode = formulaRows[i];
                rowNode.formulaRowIndex = i;
            }
        }
    }

    private clearRowTopAndRowIndex(changedPath: ChangedPath | undefined, displayedRowsMapped: Set<string>): void {
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

            // When changedPath is provided, we are here because of a transaction update or
            // a change detection. Neither of these impacts the open/closed state of groups. So if
            // a group is not open this time, it was not open last time. So we know all closed groups
            // already have their top positions cleared — no need to traverse further.
            if (changedPath && rowNode.level !== -1 && !rowNode.expanded) {
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

    private onPivotChanged(): void {
        // With a filter present, FilterManager's columnPivotChanged handler runs a comprehensive
        // filter refresh that already rebuilds the pivot stage, so this would be a redundant repeat.
        if (!this.beans.filterManager?.isAnyFilterPresent()) {
            this.refreshModel({ step: 'pivot' });
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

    private isSuppressModelUpdateAfterUpdateTransaction(params: RefreshModelParams): boolean {
        if (!this.gos.get('suppressModelUpdateAfterUpdateTransaction')) {
            return false; // Not suppressed
        }

        const { changedRowNodes, newData, rowDataUpdated } = params;

        if (!changedRowNodes || newData || !rowDataUpdated) {
            return false; // Not a transaction update
        }

        if (changedRowNodes.removals.length || changedRowNodes.adds.size) {
            return false; // There are added rows or removed rows, not just updates
        }

        return true; // Nothing changed, or only updates with no new rows and no removals
    }

    /**
     * Performs a map-only refresh. Safe to call during an active refresh.
     * If a refresh is in progress, flags are captured and applied to the outer refresh.
     * Flag accumulation is intentional - they persist until the next successful refreshModel().
     */
    public reMapRows(): void {
        if (this.refreshingModel || this.refreshingData) {
            // A refresh is in progress - capture flags so the final modelUpdated event uses the right values.
            // This is the intended behaviour when reMapRows is called during row destruction or user callbacks.
            this.noKeepRenderedRows = true;
            this.noKeepUndoRedoStack = true;
            this.noAnimate = true;
            return;
        }
        this.refreshModel({ step: 'map', keepRenderedRows: false, keepUndoRedoStack: false, animate: false });
    }

    public refreshModel(params: RefreshModelParams): void {
        const { nodeManager, eventSvc, started } = this;
        if (!nodeManager) {
            return; // destroyed
        }

        const rowDataUpdated = !!params.rowDataUpdated;

        if (started && rowDataUpdated) {
            eventSvc.dispatchEvent({ type: 'rowDataUpdated' });
        }

        const suppressUpdateTransaction = this.isSuppressModelUpdateAfterUpdateTransaction(params);
        if (this.deferRefresh(suppressUpdateTransaction)) {
            // Refresh is deferred. Capture flags to apply when refresh eventually occurs.
            // Flag accumulation is intentional - they persist until the next successful refreshModel().
            this.setPendingRefreshFlags(params);
            this.rowDataUpdatedPending ||= rowDataUpdated;
            const selectionSvc = this.beans.selectionSvc;
            if (rowDataUpdated && started && !this.refreshingModel && selectionSvc) {
                if (suppressUpdateTransaction) {
                    // Model rebuild is suppressed indefinitely, so reapply isRowSelectable to the updated rows now.
                    selectionSvc.updateSelectableAfterGrouping(undefined, params.changedRowNodes);
                } else {
                    // Flush a removal recorded this turn so an unrelated later change can't emit it with a stale source.
                    selectionSvc.flushPendingSelectionChanged?.();
                }
            }
            return;
        }

        if (this.rowDataUpdatedPending) {
            this.rowDataUpdatedPending = false;
            params.step = 'group'; // Ensure grouping runs
        }

        // Apply forced flags from any previous skipped refresh calls
        this.updateRefreshParams(params);

        let succeeded = false;
        this.refreshingModel = true; // Prevent nested refreshModel calls
        try {
            this.executeRefresh(params, rowDataUpdated);
            succeeded = true;
        } finally {
            // Reset lock flags even on failure to prevent the grid from being stuck
            this.refreshingData = false;
            this.refreshingModel = false;

            if (!succeeded) {
                // Capture flags so on error they are not lost.
                this.setPendingRefreshFlags(params);
            }
        }

        // Clear accumulated state flags only on successful completion
        this.clearPendingRefreshFlags();

        this.beans.formula?.onRowsChanged(params.changedRowNodes, params.newData);

        // finally dispatch the final model updated event with the correct values
        eventSvc.dispatchEvent({
            type: 'modelUpdated',
            animate: params.animate,
            keepRenderedRows: params.keepRenderedRows,
            newData: params.newData,
            newPage: false,
            keepUndoRedoStack: params.keepUndoRedoStack,
        });
    }

    /** Executes the refresh pipeline stages and updates row positions. */
    private executeRefresh(params: RefreshModelParams, rowDataUpdated: boolean): void {
        const { beans, rootNode } = this;

        beans.masterDetailSvc?.refreshModel(params);
        if (rowDataUpdated && params.step !== 'group') {
            beans.colFilter?.refreshModel();
        }

        // For externally-provided changedPath, add rootNode before the pipeline.
        let changedPath = params.changedPath;

        // Ensure the root node is always visited by pipeline stages even for empty transactions.
        changedPath?.addRow(rootNode);

        // Run grouping first if needed — sets this.hierarchical and may create changedPath.
        if (params.step === 'group') {
            this.doGrouping(rootNode!, params);
            changedPath ??= params.changedPath;
            // nodes are fully formed after grouping — apply isRowSelectable to the changed set
            beans.selectionSvc?.updateSelectableAfterGrouping(changedPath, params.changedRowNodes);
        }

        // Flat grids (hierarchical=false) never use changedPath — all pipeline stages have O(n) flat
        // fast paths that process root's children directly. ChangedPath only matters for hierarchical
        // grids where incremental traversal of the group tree avoids visiting unchanged subtrees.
        changedPath ??= beans.changedPathFactory?.ensureRowsPath(params, rootNode);

        // Pipeline of stages — fallthrough is on purpose, e.g. if 'filter', then all steps after run too.
        /* eslint-disable no-fallthrough */
        switch (params.step) {
            case 'group':
            case 'filter':
                this.doFilter(changedPath);
            case 'pivot':
                // Pivot may signal that columns changed, requiring full traversal for subsequent stages.
                if (this.doPivot(changedPath, params.changedProps)) {
                    changedPath = undefined;
                    params.changedPath = undefined;
                }
            case 'aggregate': // depends on agg fields
                this.doAggregate(changedPath);
            case 'filter_aggregates':
                this.doFilterAggregates(changedPath);
            case 'sort':
                this.doSort(changedPath, params.changedRowNodes);
            case 'map':
                this.doRowsToDisplay();
        }
        /* eslint-enable no-fallthrough */

        // set all row tops to null, then set row tops on all visible rows. if we don't do this,
        // then the algorithm below only sets row tops, old row tops from old rows will still lie around
        const displayedNodesMapped = new Set<string>();
        this.setRowTopAndRowIndex(displayedNodesMapped);
        this.clearRowTopAndRowIndex(changedPath, displayedNodesMapped);

        this.updateRefreshParams(params); // Apply forced flags from any nested refresh calls
    }

    /** Checks if the refresh should be deferred. Caller must call setPendingRefreshFlags when this returns true. */
    private deferRefresh(suppressUpdateTransaction: boolean): boolean {
        if (this.refreshingModel) {
            return true; // Nested refresh
        }

        if (this.beans.colModel.changeEventsDispatching) {
            // Columns being set up - refresh will follow via newColumnsLoaded event
            return true;
        }

        if (suppressUpdateTransaction) {
            // Suppressed update-only transaction - clear refreshingData when started
            if (this.started) {
                this.refreshingData = false;
            }
            return true;
        }

        if (!this.started) {
            // Not started yet - start() will trigger the initial refresh
            return true;
        }

        return false;
    }

    /** Captures flags from deferred refresh calls to apply to the eventual modelUpdated event. */
    private setPendingRefreshFlags(params: RefreshModelParams): void {
        this.pendingNewData ||= !!params.newData;
        this.noKeepRenderedRows ||= !params.keepRenderedRows;
        this.noKeepUndoRedoStack ||= !params.keepUndoRedoStack;
        this.noAnimate ||= !params.animate;
    }

    /** Clears pending refresh flags. Called at the end of a successful refreshModel. */
    private clearPendingRefreshFlags(): void {
        this.pendingNewData = false;
        this.noKeepRenderedRows = false;
        this.noKeepUndoRedoStack = false;
        this.noAnimate = false;
    }

    /** Updates the params to reflect any forced flags from nested refresh calls. */
    private updateRefreshParams(params: RefreshModelParams): void {
        params.newData = this.pendingNewData || !!params.newData;
        params.keepRenderedRows = !this.noKeepRenderedRows && !!params.keepRenderedRows;
        params.keepUndoRedoStack = !this.noKeepUndoRedoStack && !!params.keepUndoRedoStack;
        params.animate = !this.noAnimate && !!params.animate;
    }

    public isEmpty(): boolean {
        return !this.rootNode?._leafs?.length || !this.beans.colModel?.ready;
    }

    public isRowsToRender(): boolean {
        return this.rowsToDisplay.length > 0;
    }

    public getOverlayType(): OverlayType | null {
        const { beans, gos } = this;

        if (this.rootNode?._leafs?.length) {
            if (beans.filterManager?.isAnyFilterPresent() && this.getRowCount() === 0) {
                return 'noMatchingRows';
            }
        } else if (this.rowCountReady || (gos.get('rowData')?.length ?? 0) == 0) {
            // If ready then show the no rows
            // If not ready only show the noRows overlay during init if rowData is empty
            return 'noRows';
        }

        return null;
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
        if (!colModel.pivotMode) {
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
            const children = isRootNode || this.hierarchical ? getChildren(node) : null;
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
    public doAggregate(changedPath: ChangedPath | undefined): void {
        const rootNode = this.rootNode;
        if (rootNode) {
            this.beans.aggStage?.execute(changedPath);
        }
    }

    private doFilterAggregates(changedPath: ChangedPath | undefined): void {
        if (this.hierarchical) {
            const filterAggStage = this.beans.filterAggStage;
            if (filterAggStage) {
                filterAggStage.execute(changedPath);
                return;
            }
        }
        // Flat mode or no filterAggStage: no group nodes with aggregated values to filter.
        const rootNode = this.rootNode!;
        rootNode.childrenAfterAggFilter = rootNode.childrenAfterFilter;
        const sibling = rootNode.sibling;
        if (sibling) {
            sibling.childrenAfterAggFilter = rootNode.childrenAfterFilter;
        }
    }

    private doSort(changedPath: ChangedPath | undefined, changedRowNodes: ChangedRowNodes | undefined): void {
        const beans = this.beans;
        const stage = (this.hierarchical && beans.groupSortStage) || beans.sortStage!;
        stage.execute(changedPath, changedRowNodes);
    }

    private doGrouping(rootNode: RowNode, params: RefreshModelParams): void {
        const groupStage = this.beans.groupStage;
        const groupingChanged = groupStage?.execute(params);
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

    private doFilter(changedPath: ChangedPath | undefined): void {
        const beans = this.beans;
        ((this.hierarchical && beans.groupFilterStage) || beans.filterStage!).execute(changedPath);
        const rootNode = this.rootNode!;
        const sibling = rootNode.sibling;
        if (sibling) {
            sibling.childrenAfterFilter = rootNode.childrenAfterFilter;
        }
    }

    /** Returns `true` if pivot columns changed and changedPath should be deactivated. */
    private doPivot(changedPath: ChangedPath | undefined, changedProps: Set<keyof GridOptions> | undefined): boolean {
        return this.beans.pivotStage?.execute(changedPath, changedProps) ?? false;
    }

    public getRowNode(id: string): RowNode | undefined {
        if (typeof id !== 'string') {
            id = String(id);
        }
        const found = this.nodeManager?.getRowNode(id);
        if (typeof found === 'object') {
            return found; // we check for typeof object to avoid returning things from Object.prototype
        }
        const nonLeaf = this.beans.groupStage?.getNonLeaf(id);
        if (nonLeaf) {
            return nonLeaf;
        }
        return this.getSpecialRowNode(id);
    }

    private getSpecialRowNode(id: string): RowNode | undefined {
        if (id === ROOT_NODE_ID) {
            return this.rootNode ?? undefined;
        }
        if (id === GRAND_TOTAL_ROW_ID) {
            const sibling = this.rootNode?.sibling;
            return sibling?.footer ? sibling : undefined;
        }
        if (id.startsWith(GROUP_TOTAL_ROW_ID_PREFIX)) {
            const groupId = id.slice(GROUP_TOTAL_ROW_ID_PREFIX.length);
            const groupNode = this.getRowNode(groupId);
            return groupNode?.sibling?.footer ? groupNode.sibling : undefined;
        }
        if (id.startsWith(DETAIL_ROW_ID_PREFIX)) {
            const masterId = id.slice(DETAIL_ROW_ID_PREFIX.length);
            const masterNode = this.nodeManager?.getRowNode(masterId);
            if (typeof masterNode === 'object' && masterNode.detailNode?.id === id) {
                return masterNode.detailNode;
            }
        }
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
        const animate = !this.gos.get('suppressAnimationFrame');
        for (const { rowDataTransaction, callback } of asyncTransactions ?? []) {
            this.rowNodesCountReady = true;
            this.refreshingData = true; // indicate row data update in progress, this flag will be reset when refreshModel completes
            const rowNodeTransaction = nodeManager.updateRowData(rowDataTransaction, changedRowNodes, animate);
            rowNodeTrans.push(rowNodeTransaction);
            if (callback) {
                callbackFuncsBound.push(callback.bind(null, rowNodeTransaction));
            }
        }
        this.commitTransactions(changedRowNodes, animate);

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
        this.asyncTransactionsTimer = undefined;
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
        const animate = !this.gos.get('suppressAnimationFrame');
        this.refreshingData = true; // indicate row data update in progress, this flag will be reset when refreshModel completes
        const rowNodeTransaction = nodeManager.updateRowData(rowDataTran, changedRowNodes, animate);
        this.commitTransactions(changedRowNodes, animate);
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
    private commitTransactions(changedRowNodes: ChangedRowNodes, animate: boolean): void {
        this.refreshModel({
            step: 'group',
            rowDataUpdated: true,
            keepRenderedRows: true,
            animate,
            changedRowNodes,
        });
    }

    /** 'map' stage */
    private doRowsToDisplay(): void {
        const { rootNode, beans } = this;
        const { formula, flattenStage } = beans;

        if (formula?.active) {
            const unfilteredRows = rootNode?.childrenAfterSort ?? [];
            this.formulaRows = unfilteredRows;
            this.rowsToDisplay = unfilteredRows.filter((row) => !row.softFiltered);

            for (const row of this.rowsToDisplay) {
                row.setUiLevel(0);
            }
            return;
        }

        if (flattenStage) {
            this.rowsToDisplay = flattenStage.execute();
        } else {
            const rowsToDisplay = this.rootNode!.childrenAfterSort ?? [];
            for (const row of rowsToDisplay) {
                row.setUiLevel(0);
            }
            this.rowsToDisplay = rowsToDisplay;
        }

        this.formulaRows = formula?.isEvaluationActive() ? this.rowsToDisplay : [];
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
        this.stages = null;
        this.stagesRefreshProps.clear();
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
