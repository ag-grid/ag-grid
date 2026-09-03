import type {
    IServerSideGroupSelectionState,
    IServerSideSelectionState,
    ISetNodesSelectedParams,
    RowNode,
    RowRangeSelectionContext,
} from 'ag-grid-community';
import { BeanStub, ROOT_NODE_ID, _isMultiRowSelection, _isUsingNewRowSelectionAPI } from 'ag-grid-community';

import type { ISelectionStrategy } from './iSelectionStrategy';

interface SelectedState {
    /** Base selection state for all nodes, whether they have been loaded or not */
    selectAll: boolean;
    /** RowNode IDs of those nodes whose selection state differs from the base state */
    toggledNodes: Set<string>;
}

export class DefaultStrategy extends BeanStub implements ISelectionStrategy {
    private selectedState: SelectedState = { selectAll: false, toggledNodes: new Set() };

    /**
     * Whether select-all functionality has ever been used. Used only to print warnings in `getSelectedNodes` for users.
     * We print a warning even if not currently selecting all because we want users to be aware of the potential
     * for unexpected behaviour when these two features are used together.
     */
    private selectAllUsed = false;
    /** This is to prevent regressions, default selectionSvc retains reference of selected nodes. */
    private selectedNodes: { [key: string]: RowNode } = {};
    /**
     * The root has no id of its own, so its selection is held apart from the keyed row state and its node is
     * read off the model, rather than both sharing a slot with a data row carrying `ROOT_NODE_ID`.
     */
    private rootSelected = false;

    constructor(private readonly selectionCtx: RowRangeSelectionContext) {
        super();
    }

    public getSelectedState(): IServerSideSelectionState {
        const { selectAll, toggledNodes } = this.selectedState;
        const ids = [...toggledNodes];
        // every reader rebuilds this as a set, so a data row already holding the reserved id must not double it
        if (this.rootSelected && !toggledNodes.has(ROOT_NODE_ID)) {
            ids.push(ROOT_NODE_ID);
        }
        return { selectAll, toggledNodes: ids };
    }

    public setSelectedState(state: IServerSideSelectionState | IServerSideGroupSelectionState): void {
        if (typeof state !== 'object') {
            // The provided selection state should be an object
            this.error(116);
            return;
        }

        if (!('selectAll' in state)) {
            //'Invalid selection state. The state must conform to `IServerSideSelectionState`.'
            this.error(116);
            return;
        }

        if (typeof state.selectAll !== 'boolean') {
            //selectAll must be of boolean type.
            this.error(117);
            return;
        }

        if (!('toggledNodes' in state) || !Array.isArray(state.toggledNodes)) {
            return this.warn(197);
        }

        const newState: SelectedState = {
            selectAll: state.selectAll,
            toggledNodes: new Set(),
        };

        let rootSelected = false;
        state.toggledNodes.forEach((key: any) => {
            if (typeof key !== 'string') {
                this.warn(196, { key });
            } else if (key === ROOT_NODE_ID) {
                rootSelected = true;
            } else {
                newState.toggledNodes.add(key);
            }
        });

        const isSelectingMultipleRows = newState.selectAll || newState.toggledNodes.size + (rootSelected ? 1 : 0) > 1;
        if (_isUsingNewRowSelectionAPI(this.gos) && !_isMultiRowSelection(this.gos) && isSelectingMultipleRows) {
            this.warn(130);
            return;
        }

        this.selectedState = newState;
        this.rootSelected = rootSelected;
    }

    public deleteSelectionStateFromParent(parentPath: string[], removedNodeIds: string[]): boolean {
        if (this.selectedState.toggledNodes.size === 0) {
            return false;
        }

        let anyNodesToggled = false;

        for (const id of removedNodeIds) {
            if (this.selectedState.toggledNodes.delete(id)) {
                anyNodesToggled = true;
            }
        }

        return anyNodesToggled;
    }

    public setNodesSelected(params: ISetNodesSelectedParams): number {
        const { nodes, clearSelection, newValue, source } = params;
        if (nodes.length === 0) {
            return 0;
        }

        const onlyThisNode = clearSelection && newValue;
        if (!_isMultiRowSelection(this.gos) || onlyThisNode) {
            if (nodes.length > 1) {
                this.error(130);
                return 0;
            }
            const node = nodes[0].primaryRow;
            const isRoot = node.level === -1;
            // the resolved row is what selection acts on, so a request it cannot take is dropped, not cleared
            if ((!isRoot && node.id === undefined) || (newValue && !node.selectable)) {
                return 0;
            }
            const selectRow = newValue && !isRoot;
            this.selectedNodes = selectRow ? { [node.id!]: node } : {};
            this.selectedState = { selectAll: false, toggledNodes: new Set(selectRow ? [node.id!] : []) };
            this.rootSelected = newValue && isRoot;
            return 1;
        }

        const updateNodeState = (node: RowNode, key: string) => {
            if (newValue && node.selectable) {
                this.selectedNodes[key] = node;
            } else {
                delete this.selectedNodes[key];
            }

            const doesNodeConform = newValue === this.selectedState.selectAll;
            if (doesNodeConform || !node.selectable) {
                this.selectedState.toggledNodes.delete(key);
            } else {
                this.selectedState.toggledNodes.add(key);
            }
        };

        let updatedCount = 0;
        for (const rowNode of nodes) {
            const node = rowNode.primaryRow;
            if (node.level === -1) {
                const select = newValue && node.selectable;
                if (select !== this.rootSelected) {
                    updatedCount++;
                }
                this.rootSelected = select;
            } else {
                const key = node.id;
                if (key === undefined) {
                    continue;
                }
                const wasSelected = this.isNodeSelected(node);
                updateNodeState(node, key);
                if (this.isNodeSelected(node) !== wasSelected) {
                    updatedCount++;
                }
            }
        }

        // the anchor is stored by row id, and the root has none
        const anchor = nodes.length === 1 && source === 'api' ? nodes[0].primaryRow : undefined;
        if (anchor?.id !== undefined) {
            this.selectionCtx.setRoot(anchor);
        }
        return updatedCount;
    }

    public processNewRow(node: RowNode<any>): void {
        if (this.selectedNodes[node.id!]) {
            this.selectedNodes[node.id!] = node;
        }
    }

    public isNodeSelected(node: RowNode): boolean | undefined {
        if (node.level === -1) {
            return this.rootSelected;
        }
        const { selectAll, toggledNodes } = this.selectedState;
        const isToggled = toggledNodes.has(node.id!);
        return selectAll ? !isToggled : isToggled;
    }

    public getSelectedNodes(nullWhenSelectAll = false, warnWhenSelectAll = true): RowNode<any>[] | null {
        const {
            selectedState: { selectAll },
            selectedNodes,
            selectAllUsed,
        } = this;

        // We warn when select all has ever been used, even if not currently active, to help users avoid this codepath
        // early in their devloop.
        if (warnWhenSelectAll && selectAllUsed) {
            this.warn(199);
        }

        if (nullWhenSelectAll && selectAll) {
            return null;
        }

        const nodes = Object.values(selectedNodes);
        // the root's node is read off the model, so it can neither go stale nor be evicted by a row's key
        const rootNode = this.rootSelected ? this.beans.rowModel.rootNode : null;
        if (rootNode) {
            nodes.push(rootNode);
        }
        return nodes;
    }

    public getSelectedRows(): any[] {
        const selectedNodes = this.getSelectedNodes() ?? [];
        return selectedNodes.map((node) => node.data).filter((data) => data != null);
    }

    public getSelectionCount(): number {
        if (this.selectedState.selectAll) {
            return -1;
        }
        return this.selectedState.toggledNodes.size + (this.rootSelected ? 1 : 0);
    }

    public isEmpty(): boolean {
        return !this.selectedState.selectAll && !this.selectedState.toggledNodes?.size && !this.rootSelected;
    }

    public selectAllRowNodes(): void {
        this.reset(true);
    }

    public deselectAllRowNodes(): void {
        this.reset(false);
    }

    private reset(selectAll: boolean): void {
        this.selectedState = { selectAll, toggledNodes: new Set() };
        this.selectedNodes = {};
        this.rootSelected = false;
        // If we have ever used select-all, we keep this flag true.
        this.selectAllUsed ||= selectAll;
    }

    public getSelectAllState(): boolean | null {
        const { selectAll, toggledNodes } = this.selectedState;
        if (toggledNodes.size > 0) {
            return null;
        }
        return selectAll;
    }
}
