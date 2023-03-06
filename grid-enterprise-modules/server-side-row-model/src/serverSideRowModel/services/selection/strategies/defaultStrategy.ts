import { Autowired, BeanStub, Events, IRowModel, PostConstruct, RowNode, SelectionChangedEvent, SelectionEventSourceType, WithoutGridCommon, ISetNodeSelectedParams, IServerSideSelectionState } from "@ag-grid-community/core";
import { ISelectionStrategy } from "./iSelectionStrategy";

interface SelectedState {
    selectAll: boolean;
    toggledNodes: Set<string>;
}

export class DefaultStrategy extends BeanStub implements ISelectionStrategy {
    @Autowired('rowModel') private rowModel: IRowModel;

    private selectedState: SelectedState = { selectAll: false, toggledNodes: new Set() };
    private lastSelected: string | null = null;

    private selectAllUsed: boolean = false;
    // this is to prevent regressions, default selectionService retains reference of clicked nodes.
    private selectedNodes: { [key: string]: RowNode } = {};

    private rowSelection?: 'single' | 'multiple';

    @PostConstruct
    private init(): void {
        this.rowSelection = this.gridOptionsService.get('rowSelection');
        this.addManagedPropertyListener('rowSelection', (propChange) => {
            this.rowSelection = propChange.currentValue;
        });

    }

    public getSelectedState(): IServerSideSelectionState {
        return {
            selectAll: this.selectedState.selectAll,
            toggledNodes: [...this.selectedState.toggledNodes],
        };
    }

    public setSelectedState(state: any) {
        // fire selection changed event
        const newState: SelectedState = {
            selectAll: false,
            toggledNodes: new Set(),
        };

        if (typeof state !== 'object') {
            console.error('AG Grid: The provided selection state should be an object.');
            return;
        }

        if ('selectAll' in state && typeof state.selectAll === 'boolean') {
            newState.selectAll = state.selectAll;
        }  else {
            console.error('AG Grid: Select all status should be of boolean type.');
            return;
        }

        if ('toggledNodes' in state && Array.isArray(state.toggledNodes)) {
            state.toggledNodes.forEach((key: any) => {
                if (typeof key === 'string') {
                    newState.toggledNodes.add(key);
                } else {
                    console.warn(`AG Grid: Provided ids must be of string type. Invalid id provided: ${key}`);
                }
            });
        } else {
            console.error('AG Grid: `toggledNodes` must be an array of string ids.');
            return;
        }

        this.selectedState = newState;
    }

    public setNodeSelected(params: ISetNodeSelectedParams): number {
        const onlyThisNode = params.clearSelection && params.newValue && !params.rangeSelect;
        if (this.rowSelection !== 'multiple' || onlyThisNode) {
            if (params.newValue) {
                this.selectedNodes = { [params.node.id!]: params.node };
                this.selectedState = {
                    selectAll: false,
                    toggledNodes: new Set([params.node.id!]),
                };
            } else {
                this.selectedNodes = {};
                this.selectedState = {
                    selectAll: false,
                    toggledNodes: new Set(),
                }
            }
            this.lastSelected = params.node.id!;
            return 1;
        }

        const updateNodeState = (node: RowNode) => {
            if (params.newValue) {
                this.selectedNodes[node.id!] = node;
            } else {
                delete this.selectedNodes[node.id!];
            }

            const doesNodeConform = params.newValue === this.selectedState.selectAll;
            if (doesNodeConform) {
                this.selectedState.toggledNodes.delete(node.id!);
                return;
            }
            this.selectedState.toggledNodes.add(node.id!);
        }

        if (params.rangeSelect && this.lastSelected) {
            const lastSelectedNode = this.rowModel.getRowNode(this.lastSelected);
            this.rowModel.getNodesInRangeForSelection(params.node, lastSelectedNode ?? null).forEach(updateNodeState);
            this.lastSelected = params.node.id!;
            return 1;
        }

        updateNodeState(params.node);
        this.lastSelected = params.node.id!;
        return 1;
    }

    public processNewRow(node: RowNode<any>): void {
        if (this.selectedNodes[node.id!]) {
            this.selectedNodes[node.id!] = node;
        }
    }

    public isNodeSelected(node: RowNode): boolean | undefined {
        const isToggled = this.selectedState.toggledNodes.has(node.id!);
        return this.selectedState.selectAll ? !isToggled : isToggled;
    }

    public getSelectedNodes(): RowNode<any>[] {
        if (this.selectAllUsed) {
            console.warn(
                `AG Grid: getSelectedNodes and getSelectedRows functions are not advise while using select all functionality.
                Use \`api.getServerSideSelectionState()\` instead.`
            );
        }
        return Object.values(this.selectedNodes);
    }

    public getSelectedRows(): any[] {
        return this.getSelectedNodes().map(node => node.data);
    }

    public getSelectionCount(): number {
        if (this.selectedState.selectAll) {
            return -1;
        }
        return this.selectedState.toggledNodes.size;
    }

    public clearOtherNodes(rowNodeToKeepSelected: RowNode<any>, source: SelectionEventSourceType): number {
        const clearedRows = this.selectedState.selectAll ? 1 : this.selectedState.toggledNodes.size - 1;
        this.selectedState = {
            selectAll: false,
            toggledNodes: new Set([rowNodeToKeepSelected.id!]),
        }

        this.rowModel.forEachNode(node => {
            if (node !== rowNodeToKeepSelected) {
                node.selectThisNode(false, undefined, source);
            }
        });

        const event: WithoutGridCommon<SelectionChangedEvent> = {
            type: Events.EVENT_SELECTION_CHANGED,
            source,
        };
        this.eventService.dispatchEvent(event);

        return clearedRows;
    }

    public isEmpty(): boolean {
        return !this.selectedState.selectAll && !this.selectedState.toggledNodes?.size;
    }
    
    public selectAllRowNodes(params: { source: SelectionEventSourceType; justFiltered?: boolean | undefined; justCurrentPage?: boolean | undefined; }): void {
        this.selectedState = { selectAll: true, toggledNodes: new Set() };
        this.selectedNodes = {};
        this.selectAllUsed = true;
    }

    public deselectAllRowNodes(params: { source: SelectionEventSourceType; justFiltered?: boolean | undefined; justCurrentPage?: boolean | undefined; }): void {
        this.selectedState = { selectAll: false, toggledNodes: new Set() };
        this.selectedNodes = {};
    }

    public getSelectAllState(justFiltered?: boolean, justCurrentPage?: boolean): boolean | null {
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