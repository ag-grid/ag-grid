import { Autowired, Bean, BeanStub, ChangedPath, Events, IRowModel, ISelectionService, PostConstruct, RowNode, SelectionChangedEvent, SelectionEventSourceType, WithoutGridCommon, ISetNodeSelectedParams } from "@ag-grid-community/core";
import { DefaultStrategy } from "./selection/strategies/defaultStrategy";
import { GroupSelectsChildrenStrategy } from "./selection/strategies/groupSelectsChildrenStrategy";
import { ISelectionStrategy } from "./selection/strategies/iSelectionStrategy";

@Bean('selectionService')
export class ServerSideSelectionService extends BeanStub implements ISelectionService {
    @Autowired('rowModel') private rowModel: IRowModel;
    selectionStrategy: ISelectionStrategy;

    @PostConstruct
    private init(): void {
        const groupSelectsChildren = this.gridOptionsService.is('groupSelectsChildren');

        const StrategyClazz = !groupSelectsChildren ? DefaultStrategy : GroupSelectsChildrenStrategy;
        this.selectionStrategy = this.createManagedBean(new StrategyClazz());
    }

    public getSelectedState() {
        return this.selectionStrategy.getSelectedState();
    }
    
    public setNodeSelected(params: ISetNodeSelectedParams): number {
        const changedNodes = this.selectionStrategy.setNodeSelected(params);
        this.shotgunResetNodeSelectionState(params.source);

        const event: WithoutGridCommon<SelectionChangedEvent> = {
            type: Events.EVENT_SELECTION_CHANGED,
            source: params.source,
        };
        this.eventService.dispatchEvent(event);
        return changedNodes;
    }

    private shotgunResetNodeSelectionState(source?: SelectionEventSourceType) {
        this.rowModel.forEachNode(node => {
            const isNodeSelected = this.selectionStrategy.isNodeSelected(node);
            if (isNodeSelected !== node.isSelected()) {
                node.selectThisNode(isNodeSelected, undefined, source);
            }
        });
    }

    public getSelectedNodes(): RowNode<any>[] {
        return this.selectionStrategy.getSelectedNodes();
    }

    public getSelectedRows(): any[] {
        return this.selectionStrategy.getSelectedRows();
    }

    public syncInRowNode(rowNode: RowNode<any>, oldNode: RowNode<any> | null): void {
        const isNodeSelected = this.selectionStrategy.isNodeSelected(rowNode);
        rowNode.setSelectedInitialValue(isNodeSelected);
    }

    public reset(): void {
        this.selectionStrategy.deselectAllRowNodes({ source: 'api' });
    }

    public isEmpty(): boolean {
        return this.selectionStrategy.isEmpty();
    }

    public selectAllRowNodes(params: { source: SelectionEventSourceType; justFiltered?: boolean | undefined; justCurrentPage?: boolean | undefined; }): void {
        this.selectionStrategy.selectAllRowNodes(params);

        this.rowModel.forEachNode(node => {
            node.selectThisNode(true, undefined, params.source);
        });

        const event: WithoutGridCommon<SelectionChangedEvent> = {
            type: Events.EVENT_SELECTION_CHANGED,
            source: params.source,
        };
        this.eventService.dispatchEvent(event);
    }
    
    public deselectAllRowNodes(params: { source: SelectionEventSourceType; justFiltered?: boolean | undefined; justCurrentPage?: boolean | undefined; }): void {
        this.selectionStrategy.deselectAllRowNodes(params);

        this.rowModel.forEachNode(node => {
            node.selectThisNode(false, undefined, params.source);
        });

        const event: WithoutGridCommon<SelectionChangedEvent> = {
            type: Events.EVENT_SELECTION_CHANGED,
            source: params.source,
        };
        this.eventService.dispatchEvent(event);
    }

    public getSelectAllState(justFiltered?: boolean, justCurrentPage?: boolean): boolean | null {
        return this.selectionStrategy.getSelectAllState(justFiltered, justCurrentPage);
    }

    public updateGroupsFromChildrenSelections(source: SelectionEventSourceType, changedPath?: ChangedPath | undefined): boolean {
        throw new Error("Method not implemented.");
    }

    public getBestCostNodeSelection(): RowNode<any>[] | undefined {
        throw new Error("Method not implemented.");
    }

    public filterFromSelection(): void {
        throw new Error("Method not implemented.");
    }
}