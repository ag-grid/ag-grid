import type { GridApi } from '../api/gridApi';
import type { ChangedRowNodes } from '../clientSideRowModel/changedRowNodes';
import type { AgColumn } from '../entities/agColumn';
import type { GridOptions, SelectAllMode } from '../entities/gridOptions';
import type { RowNode } from '../entities/rowNode';
import type { SelectionEventSourceType } from '../events';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import type { CheckboxSelectionComponent } from '../selection/checkboxSelectionComponent';
import type { SelectAllFeature } from '../selection/selectAllFeature';
import type { ChangedPath } from '../utils/changedPath';
import type { IRowNode } from './iRowNode';
import type { ServerSideRowGroupSelectionState, ServerSideRowSelectionState } from './selectionState';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ISelectionService {
    getSelectionState(): string[] | ServerSideRowSelectionState | ServerSideRowGroupSelectionState | null;
    setSelectionState(
        state: string[] | ServerSideRowSelectionState | ServerSideRowGroupSelectionState | undefined,
        source: SelectionEventSourceType,
        clearSelection?: boolean
    ): void;
    getSelectedNodes(): RowNode<any>[];
    getSelectedRows(): any[];
    getSelectionCount(): number;
    setNodesSelected(params: ISetNodesSelectedParams): number;
    /** Drops a node leaving the model from the selection. Event-free; the single `selectionChanged`
     *  (carrying `source`) is emitted by `updateSelectableAfterGrouping`. CSRM only. */
    removeFromSelection?(node: RowNode, source: SelectionEventSourceType): void;
    /** Dispatches the coalesced `selectionChanged` left pending by `removeFromSelection` when the refresh
     *  that would normally flush it is deferred. CSRM only. */
    flushPendingSelectionChanged?(): void;
    /** Should only be called if groupSelects = 'descendants' or 'filteredDescendants' in CSRM */
    updateGroupsFromChildrenSelections?(
        source: SelectionEventSourceType,
        changedPath?: ChangedPath,
        event?: Event
    ): boolean;
    syncInRowNode(rowNode: RowNode, oldNode?: RowNode): void;
    reset(source: SelectionEventSourceType): void;
    getBestCostNodeSelection(): RowNode[] | undefined;
    isEmpty(): boolean;
    /**
     * @param selectAll See `MultiRowSelectionOptions.selectAll`
     * @returns all nodes including unselectable nodes which are the target of this selection attempt
     */
    getSelectAllState(selectAll?: SelectAllMode): boolean | null;
    hasNodesToSelect(selectAll?: SelectAllMode): boolean;
    selectAllRowNodes(params: { source: SelectionEventSourceType; selectAll?: SelectAllMode }): void;
    deselectAllRowNodes(params: { source: SelectionEventSourceType; selectAll?: SelectAllMode }): void;
    createCheckboxSelectionComponent(): CheckboxSelectionComponent;
    createSelectAllFeature(column: AgColumn): SelectAllFeature | undefined;
    onRowCtrlSelected(rowCtrl: RowCtrl, hasFocusFunc: () => void): void;
    announceAriaRowSelection(rowNode: RowNode): void;
    /** Single post-refresh selectable pass (flat + hierarchical), invoked by the client-side row model. */
    updateSelectableAfterGrouping(changedPath: ChangedPath | undefined, changedRowNodes?: ChangedRowNodes): void;
    updateRowSelectable(rowNode: RowNode, suppressSelectionUpdate?: boolean): boolean;
    selectRowNode(rowNode: RowNode, newValue?: boolean, e?: Event, source?: SelectionEventSourceType): boolean;
    createDaemonNode?(rowNode: RowNode): RowNode | undefined;
    handleSelectionEvent(event: MouseEvent | KeyboardEvent, rowNode: RowNode, source: SelectionEventSourceType): number;
    isCellCheckboxSelection(column: AgColumn, rowNode: IRowNode): boolean;
    refreshMasterNodeState(node: RowNode, e?: Event): void;
    setDetailSelectionState(masterNode: RowNode, option: GridOptions, detailApi: GridApi): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ISetNodesSelectedParams {
    /** nodes to change selection of */
    nodes: readonly RowNode[];
    /** true or false, whatever you want to set selection to */
    newValue: boolean;
    /** whether to remove other selections after this selection is done */
    clearSelection?: boolean;
    /** true when action is NOT on this node, ie user clicked a group and this is the child of a group */
    suppressFinishActions?: boolean;
    /** event source, if from an event */
    source: SelectionEventSourceType;
    /** originating event */
    event?: Event;
}
