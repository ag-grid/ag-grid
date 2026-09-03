import type {
    IServerSideGroupSelectionState,
    IServerSideSelectionState,
    ISetNodesSelectedParams,
    RowNode,
    RowRangeSelectionContext,
} from 'ag-grid-community';
import { BeanStub, ROOT_NODE_ID, _isMultiRowSelection, _isUsingNewRowSelectionAPI } from 'ag-grid-community';

import type { ISelectionStrategy } from './iSelectionStrategy';

/**
 * The server-side root carries no id of its own, so the grand total row - which resolves to it - is keyed
 * under the well-known id the client-side root uses. Returns `undefined` for a row that cannot be keyed.
 */
const selectionKey = (node: RowNode): string | undefined => node.id ?? (node.level === -1 ? ROOT_NODE_ID : undefined);

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

    constructor(private readonly selectionCtx: RowRangeSelectionContext) {
        super();
    }

    public getSelectedState(): IServerSideSelectionState {
        return {
            selectAll: this.selectedState.selectAll,
            toggledNodes: [...this.selectedState.toggledNodes],
        };
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

        state.toggledNodes.forEach((key: any) => {
            if (typeof key === 'string') {
                newState.toggledNodes.add(key);
            } else {
                this.warn(196, { key });
            }
        });

        const isSelectingMultipleRows = newState.selectAll || newState.toggledNodes.size > 1;
        if (_isUsingNewRowSelectionAPI(this.gos) && !_isMultiRowSelection(this.gos) && isSelectingMultipleRows) {
            this.warn(130);
            return;
        }

        this.selectedState = newState;
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
            const key = selectionKey(node);
            if (key === undefined) {
                return 0;
            }
            if (newValue && node.selectable) {
                this.selectedNodes = { [key]: node };
                this.selectedState = {
                    selectAll: false,
                    toggledNodes: new Set([key]),
                };
            } else {
                this.selectedNodes = {};
                this.selectedState = {
                    selectAll: false,
                    toggledNodes: new Set(),
                };
            }
            return 1;
        }

        const updateNodeState = (node: RowNode, key: string, value = newValue) => {
            if (value && node.selectable) {
                this.selectedNodes[key] = node;
            } else {
                delete this.selectedNodes[key];
            }

            const doesNodeConform = value === this.selectedState.selectAll;
            if (doesNodeConform || !node.selectable) {
                this.selectedState.toggledNodes.delete(key);
            } else {
                this.selectedState.toggledNodes.add(key);
            }
        };

        let updatedCount = 0;
        for (const rowNode of nodes) {
            const node = rowNode.primaryRow;
            const key = selectionKey(node);
            if (key !== undefined) {
                updateNodeState(node, key);
                updatedCount++;
            }
        }
        if (updatedCount === 0) {
            return 0;
        }

        if (nodes.length === 1 && source === 'api') {
            this.selectionCtx.setRoot(nodes[0].primaryRow);
        }
        return updatedCount;
    }

    public processNewRow(node: RowNode<any>): void {
        if (this.selectedNodes[node.id!]) {
            this.selectedNodes[node.id!] = node;
        }
    }

    public isNodeSelected(node: RowNode): boolean | undefined {
        const isToggled = this.selectedState.toggledNodes.has(selectionKey(node)!);
        // the root is not a row, so select-all does not reach it; only an explicit selection marks it
        return this.selectedState.selectAll && node.level !== -1 ? !isToggled : isToggled;
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

        return nullWhenSelectAll && selectAll ? null : Object.values(selectedNodes);
    }

    public getSelectedRows(): any[] {
        const nodes = this.getSelectedNodes() ?? [];
        const selectedRows: any[] = [];
        for (let i = 0, len = nodes.length; i < len; ++i) {
            const data = nodes[i].data;
            if (data != null) {
                selectedRows.push(data);
            }
        }
        return selectedRows;
    }

    public getSelectionCount(): number {
        if (this.selectedState.selectAll) {
            return -1;
        }
        return this.selectedState.toggledNodes.size;
    }

    public isEmpty(): boolean {
        return !this.selectedState.selectAll && !this.selectedState.toggledNodes?.size;
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
        // If we have ever used select-all, we keep this flag true.
        this.selectAllUsed ||= selectAll;
    }

    public getSelectAllState(): boolean | null {
        if (this.selectedState.selectAll) {
            if (this.selectedState.toggledNodes.size > 0) {
                return null;
            }
            return true;
        }

        if (this.selectedState.toggledNodes.size > 0) {
            return null;
        }
        return false;
    }
}
