import { Autowired, BeanStub, IRowModel, IRowNode, PostConstruct, RowNode, SelectionEventSourceType, ISetNodeSelectedParams } from "@ag-grid-community/core";
import { ISelectionStrategy } from "./iSelectionStrategy";


// if groupSelectsChildren is false, toggledNodes value should always be null.
interface SelectionState {
    defaultSelected: boolean;
    toggledNodes: Map<string, SelectionState | null>;
}

export class GroupSelectsChildrenStrategy extends BeanStub implements ISelectionStrategy {
    @Autowired('rowModel') private rowModel: IRowModel;

    selectedState: SelectionState = { defaultSelected: false, toggledNodes: new Map() };
    lastSelected: RowNode | null = null;
    groupSelectsChildren: boolean = false;

    @PostConstruct
    private init(): void {
        this.groupSelectsChildren = this.gridOptionsService.is('groupSelectsChildren');
    }

    public getSelectedState() {
        return this.selectedState;
    }

    public setNodeSelected(params: ISetNodeSelectedParams): number {
        if (params.rangeSelect) {
            const nodes = this.rowModel.getNodesInRangeForSelection(params.node, this.lastSelected);
            // sort the routes by route length, high to low, this means we can do the lowest level children first
            const routes = nodes.map(this.getRouteToNode).sort((a, b) => b.length - a.length);

            // skip routes if we've already done a descendent
            const completedRoutes: Set<IRowNode> = new Set();
            routes.forEach(route => {
                // skip routes if we've already selected a descendent
                if (completedRoutes.has(route[route.length - 1])) {
                    return;
                }

                route.forEach(part => completedRoutes.add(part));
                this.recursivelySelectNode(route, this.selectedState, params);
            });

            this.lastSelected = params.node;
            return 1;
        }

        const idPathToNode = this.getRouteToNode(params.node);
        this.recursivelySelectNode(idPathToNode, this.selectedState, params);
        this.lastSelected = params.node;
        return 1;
    }

    public isNodeSelected(node: RowNode): boolean | undefined {
        const path = this.getRouteToNode(node);
        return this.isNodePathSelected(path, this.selectedState);
    }

    private isNodePathSelected([nextNode, ...nodes]: IRowNode[], state: SelectionState): boolean | undefined {
        if (nodes.length === 0) {
            const isToggled = state.toggledNodes.has(nextNode.id!);
            if (nextNode.group) {
                const groupState = state.toggledNodes.get(nextNode.id!);
                if (groupState && groupState.toggledNodes.size) {
                    // if indeterminate, what if all rows are loaded + selected?
                    return undefined;
                }
            }
            return state.defaultSelected ? !isToggled : isToggled;
        }

        // if there's a deeper level, check recursively
        if (state.toggledNodes.has(nextNode.id!)) {
            const nextState = state.toggledNodes.get(nextNode.id!);
            if (nextState) {
                return this.isNodePathSelected(nodes, nextState);
            }
        }
 
        // no deeper custom state, respect the closest default
        return !!state.defaultSelected;
    }

    private getRouteToNode(node: IRowNode) {
        const pathToNode = [];
        let tempNode = node;
        while (tempNode.parent) {
            pathToNode.push(tempNode);
            tempNode = tempNode.parent;
        }
        return pathToNode.reverse();
    }

    private recursivelySelectNode([nextNode, ...nodes]: IRowNode[], selectedState: SelectionState, params: { newValue: boolean, source: SelectionEventSourceType, event?: Event, node: RowNode }) {
        if (!nextNode) {
            return;
        }

        // if this is the last node, hard add/remove based on its selected state
        const isLastNode = !nodes.length;
        if (isLastNode) {
            const needsDeleted = selectedState.defaultSelected === params.newValue;
            if (needsDeleted) {
                selectedState.toggledNodes.delete(nextNode.id!);
                return;
            }
            const newState: SelectionState = {
                defaultSelected: params.newValue,
                toggledNodes: new Map(),
            };
            selectedState.toggledNodes.set(nextNode.id!, newState);

            // if all of the rows have been selected, we clear the list & flip the default
            // this makes hierarchical selection easier, but may cause issues for new transaction nodes
            const parent = nextNode.parent as RowNode;
            if (parent.childStore?.isLastRowIndexKnown() && parent.childStore.getRowCount() === selectedState.toggledNodes.size) {
                selectedState.toggledNodes.clear();
                selectedState.defaultSelected = !selectedState.defaultSelected;
            }
            return;
        }

        // cleans out groups which have no toggled nodes and an equivalent default to its parent
        const cleanRedundantState = (childState: SelectionState) => {
            if (childState.defaultSelected === selectedState.defaultSelected && childState.toggledNodes.size === 0) {
                selectedState.toggledNodes.delete(nextNode.id!);
            }
        }

        if (selectedState.toggledNodes.has(nextNode.id!)) {
            const nextState = selectedState.toggledNodes.get(nextNode.id!)!;
            this.recursivelySelectNode(nodes, nextState, params);
            cleanRedundantState(nextState);
            return;
        }

        const newState: SelectionState = {
            defaultSelected: selectedState.defaultSelected,
            toggledNodes: new Map(),
        };
        selectedState.toggledNodes.set(nextNode.id!, newState);
        this.recursivelySelectNode(nodes, newState, params);
        cleanRedundantState(newState);
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
    isEmpty(): boolean {
        return !this.selectedState.defaultSelected && !this.selectedState.toggledNodes?.size;
    }
    selectAllRowNodes(params: { source: SelectionEventSourceType; justFiltered?: boolean | undefined; justCurrentPage?: boolean | undefined; }): void {
        this.selectedState = { defaultSelected: true, toggledNodes: new Map() };
    }
    deselectAllRowNodes(params: { source: SelectionEventSourceType; justFiltered?: boolean | undefined; justCurrentPage?: boolean | undefined; }): void {
        this.selectedState = { defaultSelected: false, toggledNodes: new Map() };
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

    public removeGroupsFromSelection(): void {
        // used in groupStage for CSRM
        throw new Error("Method not implemented.");
    }

    public filterFromSelection(): void {
        throw new Error("Method not implemented.");
    }

    public getBestCostNodeSelection(): RowNode<any>[] | undefined {
        throw new Error("Method not implemented.");
    }
}