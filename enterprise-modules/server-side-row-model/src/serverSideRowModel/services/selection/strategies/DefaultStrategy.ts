import { Autowired, BeanStub, Events, IRowModel, PostConstruct, RowNode, SelectionChangedEvent, SelectionEventSourceType, WithoutGridCommon, ISetNodeSelectedParams } from "@ag-grid-community/core";
import { ISelectionStrategy } from "./iSelectionStrategy";

interface SelectedState {
    defaultSelected: boolean;
    toggledNodes: Set<string>;
}

export class DefaultStrategy extends BeanStub implements ISelectionStrategy {
    @Autowired('rowModel') private rowModel: IRowModel

    selectedState: SelectedState = { defaultSelected: false, toggledNodes: new Set() };
    lastSelected: RowNode | null = null;

    private rowSelection?: 'single' | 'multiple';

    @PostConstruct
    private init(): void {
        this.rowSelection = this.gridOptionsService.get('rowSelection');
    }

    public getSelectedState() {
        return this.selectedState;
    }

    public setNodeSelected(params: ISetNodeSelectedParams): number {
        if (this.rowSelection !== 'multiple') {
            this.selectedState = {
                defaultSelected: false,
                toggledNodes: new Set([params.node.id!]),
            };
            return 1;
        }

        const updateNodeState = (node: RowNode) => {
            const doesNodeConform = params.newValue === this.selectedState.defaultSelected;
            if (doesNodeConform) {
                this.selectedState.toggledNodes.delete(node.id!);
                return;
            }
            this.selectedState.toggledNodes.add(node.id!);
        }

        if (params.rangeSelect) {
            this.rowModel.getNodesInRangeForSelection(params.node, this.lastSelected).forEach(updateNodeState);
            this.lastSelected = params.node;
            return 1;
        }

        updateNodeState(params.node);
        this.lastSelected = params.node;
        return 1;
    }

    public isNodeSelected(node: RowNode): boolean | undefined {
        const isToggled = this.selectedState.toggledNodes.has(node.id!);
        return this.selectedState.defaultSelected ? !isToggled : isToggled;
    }

    getSelectedNodes(): RowNode<any>[] {
        const toggledNodes: RowNode[] = [];
        this.rowModel.forEachNode(node => {
            if (node.isSelected()) {
                toggledNodes.push(node);
            }
        });
        return toggledNodes;
    }
    getSelectedRows(): any[] {
        return this.getSelectedNodes().map(node => node.data);
    }
    removeGroupsFromSelection(): void {
        // used in groupStage for CSRM
        throw new Error("Method not implemented.");
    }
    clearOtherNodes(rowNodeToKeepSelected: RowNode<any>, source: SelectionEventSourceType): number {
        const clearedRows = this.selectedState.defaultSelected ? 1 : this.selectedState.toggledNodes.size - 1;
        this.selectedState = {
            defaultSelected: false,
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
    getBestCostNodeSelection(): RowNode<any>[] | undefined {
        throw new Error("Method not implemented.");
    }
    isEmpty(): boolean {
        return !this.selectedState.defaultSelected && !this.selectedState.toggledNodes?.size;
    }
    selectAllRowNodes(params: { source: SelectionEventSourceType; justFiltered?: boolean | undefined; justCurrentPage?: boolean | undefined; }): void {
        this.selectedState = { defaultSelected: true, toggledNodes: new Set() };
    }
    deselectAllRowNodes(params: { source: SelectionEventSourceType; justFiltered?: boolean | undefined; justCurrentPage?: boolean | undefined; }): void {
        this.selectedState = { defaultSelected: false, toggledNodes: new Set() };
    }
    getSelectAllState(justFiltered?: boolean, justCurrentPage?: boolean): boolean | null {
        if (this.selectedState.defaultSelected) {
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

    public filterFromSelection(): void {
        throw new Error("Method not implemented.");
    }
}