import { Autowired, BeanStub, IRowModel, IRowNode, IServerSideGroupSelectionState, RowNode, SelectionEventSourceType, ISetNodeSelectedParams, ColumnModel, FilterManager, PostConstruct, Events, IServerSideStore, ISelectionService } from "@ag-grid-community/core";
import { ServerSideRowModel } from "../../../serverSideRowModel";
import { ISelectionStrategy } from "./iSelectionStrategy";

interface SelectionState {
    selectAllChildren: boolean;
    toggledNodes: Map<string, SelectionState>;
}

export class GroupSelectsChildrenStrategy extends BeanStub implements ISelectionStrategy {
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('rowModel') private serverSideRowModel: ServerSideRowModel;
    @Autowired('selectionService') private selectionService: ISelectionService;

    private selectedState: SelectionState = { selectAllChildren: false, toggledNodes: new Map() };
    private lastSelected: RowNode | null = null;

    @PostConstruct
    private init(): void {
        // if model has updated, a store may now be fully loaded to clean up indeterminate states
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, () => this.removeRedundantState());

        // when the grouping changes, the state no longer makes sense, so reset the state.
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.selectionService.reset());
    }

    public getSelectedState() {
        const recursivelySerializeState = (state: SelectionState, level: number, nodeId?: string) => {
            const normalisedState: IServerSideGroupSelectionState = {
                nodeId,
            };
    
            if (level <= this.columnModel.getRowGroupColumns().length) {
                normalisedState.selectAllChildren = state.selectAllChildren;
            }
    
            // omit toggledNodes if empty
            if (state.toggledNodes.size) {
                const toggledNodes: IServerSideGroupSelectionState[] = [];
                state.toggledNodes.forEach((value, key) => {
                    const newState = recursivelySerializeState(value, level + 1, key);
                    toggledNodes.push(newState);
                });
                normalisedState.toggledNodes = toggledNodes;
            }
    
            return normalisedState;
        }
        return recursivelySerializeState(this.selectedState, 0);
    }

    public setSelectedState(state: IServerSideGroupSelectionState) {
        const recursivelyDeserializeState = (normalisedState: IServerSideGroupSelectionState, parentSelected: boolean): SelectionState => {
            if (typeof normalisedState !== 'object') {
                throw new Error('AG Grid: Each provided state object must be an object.')
            }
            if ('selectAllChildren' in normalisedState && typeof normalisedState.selectAllChildren !== 'boolean') {
                throw new Error('AG Grid: `selectAllChildren` must be a boolean value or undefined.');
            }
            if ('toggledNodes' in normalisedState) {
                if (!Array.isArray(normalisedState.toggledNodes)) {
                    throw new Error('AG Grid: `toggledNodes` must be an array.');
                }
                const allHaveIds = normalisedState.toggledNodes.every(innerState => (
                    typeof innerState === 'object' && 'nodeId' in innerState && typeof innerState.nodeId === 'string'
                ));
                if (!allHaveIds) {
                    throw new Error('AG Grid: Every `toggledNode` requires an associated string id.')
                }
            }
            const isThisNodeSelected = normalisedState.selectAllChildren ?? !parentSelected;
            const convertedChildren = normalisedState.toggledNodes?.map<[string, SelectionState]>(innerState => (
                [innerState.nodeId!, recursivelyDeserializeState(innerState, isThisNodeSelected)]
            ));
            const doesRedundantStateExist = convertedChildren?.some(([_, innerState]) => isThisNodeSelected === innerState.selectAllChildren && innerState.toggledNodes.size === 0);
            if (doesRedundantStateExist) {
                throw new Error('AG Grid: State could not be parsed due to nonsensical data. Ensure all child state has toggledNodes or does not conform with the parent rule.')
            }
            return {
                selectAllChildren: isThisNodeSelected,
                toggledNodes: new Map(convertedChildren),
            };
        };

        try {
            this.selectedState = recursivelyDeserializeState(state, !!state.selectAllChildren);
        } catch (e) {
            console.error(e.message);
        }
    }

    public deleteSelectionStateFromParent(parentRoute: string[], removedNodeIds: string[]): boolean {
        let parentState: SelectionState | undefined = this.selectedState;
        const remainingRoute = [...parentRoute];
        while (parentState && remainingRoute.length) {
            parentState = parentState.toggledNodes.get(remainingRoute.pop()!);
        }

        // parent has no explicit state, nothing to remove
        if (!parentState) {
            return false;
        }

        let anyStateChanged = false;
        removedNodeIds.forEach(id => {
            if(parentState?.toggledNodes.delete(id)) {
                anyStateChanged = true;
            }
        });

        if (anyStateChanged) {
            this.removeRedundantState();
        }
        return anyStateChanged;
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

            this.removeRedundantState();
            this.lastSelected = params.node;
            return 1;
        }

        const idPathToNode = this.getRouteToNode(params.node);
        this.recursivelySelectNode(idPathToNode, this.selectedState, params);
        this.removeRedundantState();
        this.lastSelected = params.node;
        return 1;
    }

    public isNodeSelected(node: RowNode): boolean | undefined {
        const path = this.getRouteToNode(node);
        return this.isNodePathSelected(path, this.selectedState);
    }

    private isNodePathSelected([nextNode, ...nodes]: RowNode[], state: SelectionState): boolean | undefined {
        if (nodes.length === 0) {
            const isToggled = state.toggledNodes.has(nextNode.id!);
            if (nextNode.hasChildren()) {
                const groupState = state.toggledNodes.get(nextNode.id!);
                if (groupState && groupState.toggledNodes.size) {
                    return undefined;
                }
            }
            return state.selectAllChildren ? !isToggled : isToggled;
        }

        // if there's a deeper level, check recursively
        if (state.toggledNodes.has(nextNode.id!)) {
            const nextState = state.toggledNodes.get(nextNode.id!);
            if (nextState) {
                return this.isNodePathSelected(nodes, nextState);
            }
        }
 
        // no deeper custom state, respect the closest default
        return !!state.selectAllChildren;
    }

    private getRouteToNode(node: RowNode) {
        const pathToNode = [];
        let tempNode = node;
        while (tempNode.parent) {
            pathToNode.push(tempNode);
            tempNode = tempNode.parent;
        }
        return pathToNode.reverse();
    }

    private removeRedundantState() {
        if (this.filterManager.isAnyFilterPresent()) {
            return;
        }
        
        const recursivelyRemoveState = (
            selectedState: SelectionState = this.selectedState,
            store: IServerSideStore | undefined = this.serverSideRowModel.getRootStore(),
            node?: RowNode | null,
        ) => {
            let noIndeterminateChildren = true;
            selectedState.toggledNodes.forEach((state, id) => {
                const parentNode = this.rowModel.getRowNode(id);
                const nextStore = parentNode?.childStore;
                if (!nextStore) {
                    if (state.toggledNodes.size > 0) {
                        noIndeterminateChildren = false;
                    }
                    return;
                }

                // if child was cleared, check if this state is still relevant
                if(recursivelyRemoveState(state, nextStore, parentNode)) {
                    // cleans out groups which have no toggled nodes and an equivalent default to its parent
                    if (selectedState.selectAllChildren === state.selectAllChildren) {
                        selectedState.toggledNodes.delete(id);
                    }
                }

                if (state.toggledNodes.size > 0) {
                    noIndeterminateChildren = false;
                }
            });

            if (store && store.isLastRowIndexKnown() && store.getRowCount() < selectedState.toggledNodes.size) {
                console.warn(`
                    AG Grid: The number of toggled nodes in this store exceeds the total number of rows.
                    Ensure your selection state is valid and up to date with your server.`
                );
            }

            if (!store || !store.isLastRowIndexKnown() || store.getRowCount() !== selectedState.toggledNodes.size) {
                // if row count unknown, or doesn't match the size of toggledNodes, ignore.
                return false;
            }

            if (noIndeterminateChildren) {
                selectedState.toggledNodes.clear();
                selectedState.selectAllChildren = !selectedState.selectAllChildren;

                // if node was indeterminate, it's not any more.
                if (node && node?.isSelected() !== selectedState.selectAllChildren) {
                    node.selectThisNode(selectedState.selectAllChildren, undefined, 'api');
                } 
                return true;
            }
            return false;
        }

        recursivelyRemoveState();
    }

    private recursivelySelectNode([nextNode, ...nodes]: IRowNode[], selectedState: SelectionState, params: { newValue: boolean, source: SelectionEventSourceType, event?: Event, node: RowNode }) {
        if (!nextNode) {
            return;
        }

        // if this is the last node, hard add/remove based on its selectAllChildren state
        const isLastNode = !nodes.length;
        if (isLastNode) {
            const needsDeleted = selectedState.selectAllChildren === params.newValue;
            if (needsDeleted) {
                selectedState.toggledNodes.delete(nextNode.id!);
                return;
            }
            const newState: SelectionState = {
                selectAllChildren: params.newValue,
                toggledNodes: new Map(),
            };
            selectedState.toggledNodes.set(nextNode.id!, newState);
            return;
        }

        const doesStateAlreadyExist = selectedState.toggledNodes.has(nextNode.id!);
        const childState: SelectionState = doesStateAlreadyExist ? (
            selectedState.toggledNodes.get(nextNode.id!)!
        ) : {
            selectAllChildren: selectedState.selectAllChildren,
            toggledNodes: new Map(),
        };

        if (!doesStateAlreadyExist) {
            selectedState.toggledNodes.set(nextNode.id!, childState);
        }

        this.recursivelySelectNode(nodes, childState, params);

        // cleans out groups which have no toggled nodes and an equivalent default to its parent
        if (selectedState.selectAllChildren === childState.selectAllChildren && childState.toggledNodes.size === 0) {
            selectedState.toggledNodes.delete(nextNode.id!);
        }
    }

    public getSelectedNodes(): RowNode<any>[] {
        console.warn(
            `AG Grid: \`getSelectedNodes\` and \`getSelectedRows\` functions cannot be used with \`groupSelectsChildren\` and the server-side row model.
            Use \`api.getServerSideSelectionState()\` instead.`
        );

        const selectedNodes: RowNode[] = [];
        this.rowModel.forEachNode(node => {
            if (node.isSelected()) {
                selectedNodes.push(node);
            }
        });
        return selectedNodes;
    }

    public processNewRow(node: RowNode<any>): void {
        // This is used for updating outdated node refs, as this model entirely uses ids it's irrelevant
    }

    public getSelectedRows(): any[] {
        return this.getSelectedNodes().map(node => node.data);
    }

    public getSelectionCount(): number {
        return -1;
    }

    public isEmpty(): boolean {
        return !this.selectedState.selectAllChildren && !this.selectedState.toggledNodes?.size;
    }

    public selectAllRowNodes(params: { source: SelectionEventSourceType; justFiltered?: boolean | undefined; justCurrentPage?: boolean | undefined; }): void {
        this.selectedState = { selectAllChildren: true, toggledNodes: new Map() };
    }

    public deselectAllRowNodes(params: { source: SelectionEventSourceType; justFiltered?: boolean | undefined; justCurrentPage?: boolean | undefined; }): void {
        this.selectedState = { selectAllChildren: false, toggledNodes: new Map() };
    }

    public getSelectAllState(justFiltered?: boolean, justCurrentPage?: boolean): boolean | null {
        if (this.selectedState.selectAllChildren) {
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