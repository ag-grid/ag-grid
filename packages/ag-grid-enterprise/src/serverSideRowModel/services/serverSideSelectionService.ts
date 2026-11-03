import type {
    AgColumn,
    ISelectionService,
    IServerSideGroupSelectionState,
    IServerSideSelectionState,
    ISetNodesSelectedParams,
    LogService,
    NamedBean,
    RowNode,
    RowSelectionMode,
    SelectAllMode,
    SelectionEventSourceType,
    ServerSideRowGroupSelectionState,
    ServerSideRowSelectionState,
} from 'ag-grid-community';
import {
    BaseSelectionService,
    _getGroupSelectsDescendants,
    _getRowSelectionMode,
    _isMultiRowSelection,
    _isRowSelection,
    _isUsingNewRowSelectionAPI,
} from 'ag-grid-community';

import { DefaultStrategy } from './selection/strategies/defaultStrategy';
import { GroupSelectsChildrenStrategy } from './selection/strategies/groupSelectsChildrenStrategy';
import type { ISelectionStrategy } from './selection/strategies/iSelectionStrategy';

export class ServerSideSelectionService extends BaseSelectionService implements NamedBean, ISelectionService {
    beanName = 'selectionSvc' as const;

    private selectionStrategy: ISelectionStrategy;
    private selectionMode?: RowSelectionMode;
    /** Rows `isRowSelectable` rejected in this selection batch, their own selection removed together by `deselectRejectedRows`. */
    private rejectedRows: RowNode[] = [];
    private pendingSelectionSource: SelectionEventSourceType | null = null;

    public override postConstruct(): void {
        super.postConstruct();
        this.selectionMode = _getRowSelectionMode(this.gos);
        const groupSelectsChildren = _getGroupSelectsDescendants(this.gos);
        const Strategy = !groupSelectsChildren ? DefaultStrategy : GroupSelectsChildrenStrategy;
        this.selectionStrategy = this.createManagedBean(new Strategy(this.selectionCtx));
    }

    /** Runs before the rows are asked again, so a selection the new options discard is gone before they are. */
    protected override refreshSelectionOptions(): boolean {
        const gos = this.gos;
        // Only switch strategies when value of groupSelectsChildren actually changes, not just any part of selection options
        const groupSelectsChildren = _getGroupSelectsDescendants(gos);
        if (groupSelectsChildren !== this.selectionStrategy instanceof GroupSelectsChildrenStrategy) {
            this.destroyBean(this.selectionStrategy);
            const Strategy = groupSelectsChildren ? GroupSelectsChildrenStrategy : DefaultStrategy;
            this.selectionStrategy = this.createManagedBean(new Strategy(this.selectionCtx));

            this.shotgunResetNodeSelectionState();
            this.dispatchSelectionChanged('api');
        }

        // Only reset selection when selection mode changes, not just any part of selection options
        const rowSelection = _getRowSelectionMode(gos);
        if (rowSelection !== this.selectionMode) {
            this.selectionMode = rowSelection;
            this.deselectAllRowNodes({ source: 'api' });
        }
        return false;
    }

    public handleSelectionEvent(
        event: MouseEvent | KeyboardEvent,
        rowNode: RowNode<any>,
        source: SelectionEventSourceType,
        column?: AgColumn
    ): number {
        if (this.isRowSelectionBlocked(rowNode)) {
            return 0;
        }

        const selection = this.inferNodeSelections(
            rowNode,
            event.shiftKey,
            event.metaKey || event.ctrlKey,
            source,
            column
        );

        if (selection == null) {
            return 0;
        }

        this.selectionCtx.selectAll = false;

        let updatedRows: number;
        if ('select' in selection) {
            if (selection.reset) {
                this.selectionStrategy.deselectAllRowNodes({ source: 'api' });
            } else {
                this.selectionStrategy.setNodesSelected({ nodes: selection.deselect, newValue: false, source });
            }
            updatedRows = this.selectionStrategy.setNodesSelected({ nodes: selection.select, newValue: true, source });
        } else {
            updatedRows = this.selectionStrategy.setNodesSelected({
                nodes: [selection.node],
                newValue: selection.newValue,
                clearSelection: selection.clearSelection,
                event,
                source,
            });
        }

        this.shotgunResetNodeSelectionState(source, event);
        this.dispatchSelectionChanged(source);

        return updatedRows;
    }

    public getSelectionState(): string[] | ServerSideRowSelectionState | ServerSideRowGroupSelectionState | null {
        return this.selectionStrategy.getSelectedState();
    }

    public setSelectionState(
        state: string[] | ServerSideRowSelectionState | ServerSideRowGroupSelectionState | undefined,
        source: SelectionEventSourceType
    ): void {
        if (!_isRowSelection(this.gos)) {
            if (state) {
                this.warn(132);
            }
            return;
        }
        if (Array.isArray(state)) {
            return;
        }
        if (state) {
            ++this.selectionBatchDepth;
            try {
                this.selectionStrategy.setSelectedState(state);
                // a loaded row isRowSelectable rejects does not keep the selection the state gives it
                const rowModel = this.beans.rowModel;
                rowModel.forEachNode((node) => this.queueIfRejected(node));
                const rootNode = rowModel.rootNode;
                if (rootNode) {
                    this.queueIfRejected(rootNode); // `forEachNode` skips the root
                }
                this.deselectRejectedRows();
                this.shotgunResetNodeSelectionState();
                this.dispatchSelectionChanged(source);
            } finally {
                this.endSelectionBatch();
            }
        } else {
            this.deselectAllRowNodes({ source });
        }
    }

    public setNodesSelected(params: ISetNodesSelectedParams): number {
        if (!_isRowSelection(this.gos) && params.newValue) {
            this.warn(132);
            return 0;
        }

        const { nodes, ...otherParams } = params;

        if (nodes.length > 1 && this.selectionMode !== 'multiRow') {
            this.warn(130);
            return 0;
        }

        const adjustedParams = {
            // a row isRowSelectable rejects is neither selected nor deselected, but for a group or root selecting its rows
            nodes: nodes.filter(
                (node) => node.selectable || (!params.newValue && this.selectsItsRows(node.primaryRow))
            ),
            ...otherParams,
        };

        // if no nodes to act on, then return 0
        if (!adjustedParams.nodes.length) {
            return 0;
        }

        const changedNodes = this.selectionStrategy.setNodesSelected(adjustedParams);
        this.shotgunResetNodeSelectionState(adjustedParams.source, adjustedParams.event);
        this.dispatchSelectionChanged(adjustedParams.source);
        return changedNodes;
    }

    /**
     * Deletes the selection state for a set of nodes, for use after deleting nodes via
     * transaction. As this is designed for transactions, all nodes should belong to the same group.
     */
    public deleteSelectionStateFromParent(storeRoute: string[], removedNodeIds: string[]) {
        const stateChanged = this.selectionStrategy.deleteSelectionStateFromParent(storeRoute, removedNodeIds);
        if (!stateChanged) {
            return;
        }

        this.shotgunResetNodeSelectionState();
        this.dispatchSelectionChanged('api');
    }

    private shotgunResetNodeSelectionState(source?: SelectionEventSourceType, event?: Event) {
        this.beans.rowModel.forEachNode((node) => {
            if (node.stub) {
                return;
            }

            const isNodeSelected = this.selectionStrategy.isNodeSelected(node);
            if (isNodeSelected !== node.isSelected()) {
                this.selectRowNode(node, isNodeSelected, event, source);
            }
        });

        this.syncRootNode(source, event);
    }

    /** The selection a row shows: the state's, unless the row may not show selected. */
    private isShownSelected(rowNode: RowNode): boolean | undefined {
        const selected = this.selectionStrategy.isNodeSelected(rowNode);
        return selected && !this.canShowSelected(rowNode) ? false : selected;
    }

    /** A group selecting its rows shows theirs whatever its own answer; the root shows through its grand total row. */
    protected override canShowSelected(rowNode: RowNode): boolean {
        return rowNode.selectable || (rowNode.level !== -1 && this.selectsItsRows(rowNode));
    }

    /** With `groupSelects: 'descendants'`, a group's or the root's own selection selects its rows. */
    private selectsItsRows(rowNode: RowNode): boolean {
        return (
            this.selectionStrategy instanceof GroupSelectsChildrenStrategy &&
            (rowNode.level === -1 || rowNode.hasChildren())
        );
    }

    /** Queues a rejected selected row, whose own selection is removed by `deselectRejectedRows`. */
    private queueIfRejected(rowNode: RowNode): void {
        if (rowNode.selectable || !this.selectionStrategy.isNodeSelected(rowNode)) {
            return;
        }
        this.rejectedRows.push(rowNode);
    }

    /** Deselects the queued rows still rejected and selected, in one strategy call, as a GroupSelectsChildren call walks the whole state. */
    private deselectRejectedRows(): number {
        const queued = this.rejectedRows;
        if (!queued.length) {
            return 0;
        }
        this.rejectedRows = [];
        // a group's or the root's own selection selects its rows, which keep it
        const rows = queued.filter(
            (row) => !row.selectable && !this.selectsItsRows(row) && this.selectionStrategy.isNodeSelected(row)
        );
        // single-row selection takes one row, and deselecting any one clears the whole selection
        const nodes = _isMultiRowSelection(this.gos) ? rows : rows.slice(0, 1);
        return this.selectionStrategy.setNodesSelected({ nodes, newValue: false, source: 'selectableChanged' });
    }

    protected override setRowSelectable(rowNode: RowNode, newVal: boolean, suppressSelectionUpdate?: boolean): void {
        if (rowNode.selectable === newVal) {
            return;
        }
        super.setRowSelectable(rowNode, newVal, true);
        if (!suppressSelectionUpdate) {
            this.showRowSelection(rowNode);
        }
    }

    /** Asks the row again and shows its selection even when its answer stays, as its group info or grand total row changed. */
    public refreshRowSelection(rowNode: RowNode): void {
        this.updateRowSelectable(rowNode, true);
        this.showRowSelection(rowNode);
    }

    /** Queues the row if rejected and shows its selection, in one selection batch. */
    private showRowSelection(rowNode: RowNode): void {
        ++this.selectionBatchDepth;
        try {
            this.queueIfRejected(rowNode);
            if (this.selectRowNode(rowNode, this.isShownSelected(rowNode), undefined, 'selectableChanged')) {
                this.dispatchSelectionChanged('selectableChanged');
            }
        } finally {
            this.endSelectionBatch();
        }
    }

    /** Closes the batch, in a `finally`; the outermost close deselects the rejected rows, then emits one `selectionChanged`. */
    public endSelectionBatch(): void {
        if (--this.selectionBatchDepth > 0) {
            return;
        }
        let source = this.pendingSelectionSource;
        this.pendingSelectionSource = null;
        try {
            if (!this.deselectRejectedRows()) {
                return;
            }
            source ??= 'selectableChanged';
            this.shotgunResetNodeSelectionState('selectableChanged');
        } finally {
            if (source) {
                this.dispatchSelectionChanged(source);
            }
        }
    }

    /** `forEachNode` skips the root, whose selection the grand total row reports as its own. */
    private syncRootNode(source?: SelectionEventSourceType, event?: Event): void {
        const rootNode = this.beans.rowModel.rootNode;
        if (!rootNode) {
            return;
        }

        const isRootSelected = this.selectionStrategy.isNodeSelected(rootNode);
        if (isRootSelected !== rootNode.isSelected()) {
            this.selectRowNode(rootNode, isRootSelected, event, source);
        }
    }

    public getSelectedNodes(): RowNode<any>[] {
        return this.selectionStrategy.getSelectedNodes() ?? [];
    }

    public getSelectedRows(): any[] {
        return this.selectionStrategy.getSelectedRows();
    }

    public getSelectionCount(): number {
        return this.selectionStrategy.getSelectionCount();
    }

    protected isSoleSelection(node: RowNode): boolean {
        return this.selectionStrategy.isSoleSelection(node);
    }

    /** Syncs a row no one has seen selected yet, a new root or one just given its data; again once a loaded row is rejected. */
    public syncInRowNode(rowNode: RowNode<any>): void {
        // update any refs being held in the strategies
        this.selectionStrategy.processNewRow(rowNode);
        // written before the removal, so the removal's sync of every row raises no `rowSelected` for it
        rowNode.__selected = this.isShownSelected(rowNode);
        this.queueIfRejected(rowNode);
        if (this.selectionBatchDepth === 0) {
            ++this.selectionBatchDepth; // a sync outside any batch is a batch of its own
            this.endSelectionBatch();
        }
    }

    public reset(): void {
        this.selectionStrategy.deselectAllRowNodes({ source: 'api' });
        this.selectionCtx.reset();
    }

    public isEmpty(): boolean {
        return this.selectionStrategy.isEmpty();
    }

    public hasNodesToSelect() {
        return true;
    }

    public selectAllRowNodes(params: { source: SelectionEventSourceType; selectAll?: SelectAllMode }): void {
        if (!_isRowSelection(this.gos)) {
            this.warn(132);
            return;
        }

        validateSelectionParameters(this.beans.log, params);
        if (_isUsingNewRowSelectionAPI(this.gos) && !_isMultiRowSelection(this.gos)) {
            return this.warn(130);
        }

        this.selectionStrategy.selectAllRowNodes(params);
        this.selectionCtx.selectAll = true;

        this.beans.rowModel.forEachNode((node) => {
            if (node.stub) {
                return;
            }

            this.selectRowNode(node, true, undefined, params.source);
        });

        this.syncRootNode(params.source);
        this.dispatchSelectionChanged(params.source);
    }

    public deselectAllRowNodes(params: { source: SelectionEventSourceType; selectAll?: SelectAllMode }): void {
        validateSelectionParameters(this.beans.log, params);

        this.selectionStrategy.deselectAllRowNodes(params);
        this.selectionCtx.selectAll = false;

        this.beans.rowModel.forEachNode((node) => {
            if (node.stub) {
                return;
            }

            this.selectRowNode(node, false, undefined, params.source);
        });

        this.syncRootNode(params.source);
        this.dispatchSelectionChanged(params.source);
    }

    public getSelectAllState(selectAll?: SelectAllMode): boolean | null {
        return this.selectionStrategy.getSelectAllState(selectAll);
    }

    // used by CSRM
    public getBestCostNodeSelection(): RowNode<any>[] | undefined {
        return this.warn(194, { method: 'getBestCostNodeSelection' }) as undefined;
    }

    /** Re-asks every node and the root, in one selection batch. */
    protected override updateSelectable(): void {
        if (!_isRowSelection(this.gos)) {
            return;
        }

        const rowModel = this.beans.rowModel;
        ++this.selectionBatchDepth;
        try {
            rowModel.forEachNode((node) => this.updateRowSelectable(node));
            // `forEachNode` skips the root, which its grand total row selects
            const rootNode = rowModel.rootNode;
            if (rootNode) {
                this.updateRowSelectable(rootNode);
            }
        } finally {
            this.endSelectionBatch();
        }
    }

    private dispatchSelectionChanged(source: SelectionEventSourceType): void {
        if (this.selectionBatchDepth > 0) {
            this.pendingSelectionSource = source; // the latest: a transaction's removals follow its updates
            return;
        }
        this.eventSvc.dispatchEvent({
            type: 'selectionChanged',
            source,
            selectedNodes:
                this.selectionStrategy instanceof GroupSelectsChildrenStrategy
                    ? null
                    : this.selectionStrategy.getSelectedNodes(true, false),
            serverSideState: this.getSelectionState() as
                IServerSideSelectionState | IServerSideGroupSelectionState | null,
        });
    }

    public updateSelectableAfterGrouping(): void {
        return this.error(194, { method: 'updateSelectableAfterGrouping' }) as undefined;
    }

    public refreshMasterNodeState(): void {
        // Initially we don't support SSRM for master detail selection
    }

    public setDetailSelectionState(): void {
        // Initially we don't support SSRM for master detail selection
        return;
    }
}

function validateSelectionParameters(
    log: LogService,
    { selectAll }: { source: SelectionEventSourceType; selectAll?: SelectAllMode }
) {
    if (selectAll === 'filtered' || selectAll === 'currentPage') {
        log.warn(195, { justCurrentPage: selectAll === 'currentPage' });
    }
}
