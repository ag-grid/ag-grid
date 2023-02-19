import { Autowired, Bean, BeanStub, ChangedPath, Events, IRowModel, ISelectionService, PostConstruct, RowNode, RowSelectedEvent, SelectionChangedEvent, SelectionEventSourceType, WithoutGridCommon } from "@ag-grid-community/core";

type GroupSelectionState = AllSelectedState | DefaultSelectedState;

interface AllSelectedState {
    defaultSelected: true;
    deselectedNodes: Set<string>;
}

interface DefaultSelectedState {
    defaultSelected?: false;
    selectedNodes: Set<string>;
}

@Bean('selectionService')
export class ServerSideSelectionService extends BeanStub implements ISelectionService {
    @Autowired('rowModel') private rowModel: IRowModel;

    selectedState: GroupSelectionState = { selectedNodes: new Set() };
    lastSelected: RowNode | null = null;
    groupSelectsChildren: boolean = false;

    @PostConstruct
    private init(): void {
        this.groupSelectsChildren = this.gridOptionsService.is('groupSelectsChildren');
        this.addManagedListener(this.eventService, Events.EVENT_ROW_SELECTED, this.onRowSelected.bind(this));
    }

    private onRowSelected(event: RowSelectedEvent) {
        const rowNode = event.node;

        // we do not store the group rows when the groups select children
        // if (this.groupSelectsChildren && rowNode.group) {
        //     return;
        // }

        const isNodeSelected = rowNode.isSelected();
        console.log(event, isNodeSelected);
        if (this.selectedState.defaultSelected) {
            if (!isNodeSelected) {
                this.selectedState.deselectedNodes.add(rowNode.id!);
            } else {
                this.selectedState.deselectedNodes.delete(rowNode.id!);
            }
        } else {
            if (isNodeSelected) {
                this.selectedState.selectedNodes.add(rowNode.id!);
            } else {
                this.selectedState.selectedNodes.delete(rowNode.id!);
            }
        }
    }

    setLastSelectedNode(rowNode: RowNode<any>): void {
        this.lastSelected = rowNode;
    }
    getLastSelectedNode(): RowNode<any> | null {
        return this.lastSelected;
    }
    getSelectedNodes(): RowNode<any>[] {
        const selectedNodes: RowNode[] = [];
        this.rowModel.forEachNode(node => {
            if (node.isSelected()) {
                selectedNodes.push(node);
            }
        });
        return selectedNodes;
    }
    getSelectedRows(): any[] {
        return this.getSelectedNodes().map(node => node.data);
    }
    removeGroupsFromSelection(): void {
        // used in groupStage for CSRM
        throw new Error("Method not implemented.");
    }
    updateGroupsFromChildrenSelections(source: SelectionEventSourceType, changedPath?: ChangedPath | undefined): boolean {
        // used in csrm & clientSideNodeManager & rownode for groupSelectsChildren
        // throw new Error("Method not implemented.");
        return false;
    }
    clearOtherNodes(rowNodeToKeepSelected: RowNode<any>, source: SelectionEventSourceType): number {
        const clearedRows = this.selectedState.defaultSelected ? 1 : this.selectedState.selectedNodes.size - 1;
        this.selectedState = {
            defaultSelected: false,
            selectedNodes: new Set([rowNodeToKeepSelected.id!]),
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
    syncInRowNode(rowNode: RowNode<any>, oldNode: RowNode<any> | null): void {
        if (this.selectedState.defaultSelected) {
            const isSelected = !this.selectedState?.deselectedNodes?.has(rowNode.id!);
            rowNode.setSelectedInitialValue(isSelected);
        } else {
            const isSelected = !!this.selectedState?.selectedNodes?.has(rowNode.id!);
            rowNode.setSelectedInitialValue(isSelected);
        }
    }
    reset(): void {
        this.selectedState = { selectedNodes: new Set() };
    }
    getBestCostNodeSelection(): RowNode<any>[] | undefined {
        throw new Error("Method not implemented.");
    }
    isEmpty(): boolean {
        return !this.selectedState.defaultSelected && !this.selectedState.selectedNodes?.size;
    }
    selectAllRowNodes(params: { source: SelectionEventSourceType; justFiltered?: boolean | undefined; justCurrentPage?: boolean | undefined; }): void {
        this.selectedState = { defaultSelected: true, deselectedNodes: new Set() };

        this.rowModel.forEachNode(node => {
            node.selectThisNode(true, undefined, params.source);
        });

        const event: WithoutGridCommon<SelectionChangedEvent> = {
            type: Events.EVENT_SELECTION_CHANGED,
            source: params.source,
        };
        this.eventService.dispatchEvent(event);
    }
    deselectAllRowNodes(params: { source: SelectionEventSourceType; justFiltered?: boolean | undefined; justCurrentPage?: boolean | undefined; }): void {
        this.selectedState = { selectedNodes: new Set() };

        this.rowModel.forEachNode(node => {
            node.selectThisNode(false, undefined, params.source);
        });

        const event: WithoutGridCommon<SelectionChangedEvent> = {
            type: Events.EVENT_SELECTION_CHANGED,
            source: params.source,
        };
        this.eventService.dispatchEvent(event);
    }
    getSelectAllState(justFiltered?: boolean, justCurrentPage?: boolean): boolean | null {
        if (this.selectedState.defaultSelected) {
            if (this.selectedState.deselectedNodes.size > 0) {
                return null;
            }
            return true;
        }

        if (this.selectedState.selectedNodes.size > 0) {
            return null;
        }
        return false;
    }
}