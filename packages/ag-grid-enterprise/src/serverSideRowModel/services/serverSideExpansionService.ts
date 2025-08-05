import type {
    BeanCollection,
    IExpansionService,
    IsServerSideGroupOpenByDefaultParams,
    NamedBean,
    RowGroupOpenedEvent,
    RowNode,
    WithoutGridCommon,
} from 'ag-grid-community';

import { BaseExpansionService } from '../../rowHierarchy/baseExpansionService';
import type { ServerSideRowModel } from '../serverSideRowModel';

interface ExpansionState {
    /** Base expansion state for all nodes, whether they have been loaded or not */
    expandAll: boolean;
    /** Whether the user has interacted with all nodes */
    interactedWithAll: boolean;
    /** RowNode IDs of those nodes whose expansion state differs from the base state */
    toggledNodes: Record<string, boolean | undefined>; // in reality this is true | undefined
    /** RowNode IDs of those nodes that have been interacted with by the user */
    interactedWith: Record<string, true | undefined>;
    /**
     * Returns whether the row with the given ID is expanded.
     * If `expandAll` is true, it returns true if the node has not been toggled.
     * If `expandAll` is false, it returns true if the node has been toggled.
     */
    isExpanded(rowId: string): boolean;
}

/**
 * Using a proxy here allows us to automagically update the `interactedWith` state,
 * which is used to determine the default expansion state of the nodes. And be memory conscious as well.
 */
const getDefaultExpansionState = (defaultOverrides: Partial<ExpansionState> = {}) => {
    const self = {
        expandAll: false,
        interactedWithAll: false,
        isExpanded: (rowId: string) => self.expandAll !== !!self.toggledNodes[rowId],
        toggledNodes: new Proxy({} as ExpansionState['toggledNodes'], {
            set(target, p, newValue) {
                const rowIdC = p as keyof typeof target;
                self.interactedWith[rowIdC] = true;
                return self.expandAll === newValue ? delete target[rowIdC] : (target[rowIdC] = true);
            },
        }),
        interactedWith: new Proxy({} as ExpansionState['interactedWith'], {
            get: (target, p) => {
                const rowIdC = p as keyof typeof target;
                return self.interactedWithAll ? delete target[rowIdC] || true : target[rowIdC];
            },
            set: (target, p, value: true) => {
                const rowIdC = p as keyof typeof target;
                return self.interactedWithAll ? delete target[rowIdC] : (target[rowIdC] = value);
            },
        }),
        ...defaultOverrides,
    } as ExpansionState;
    return self;
};

export class ServerSideExpansionService extends BaseExpansionService implements NamedBean, IExpansionService {
    beanName = 'expansionSvc' as const;

    private expandedState = getDefaultExpansionState();
    private serverSideRowModel: ServerSideRowModel;

    public wireBeans(beans: BeanCollection) {
        this.serverSideRowModel = beans.rowModel as ServerSideRowModel;
    }

    public postConstruct(): void {
        this.addManagedEventListeners({
            columnRowGroupChanged: () => {
                this.expandedState = getDefaultExpansionState();
            },
        });
    }

    public checkOpenByDefault(rowNode: RowNode): boolean {
        if (!rowNode.isExpandable()) {
            return false;
        }

        if (this.expandedState.interactedWith[rowNode.id!]) {
            return this.expandedState.isExpanded(rowNode.id!);
        }

        const userFunc = this.gos.getCallback('isServerSideGroupOpenByDefault');
        if (!userFunc) {
            return false;
        }

        const params: WithoutGridCommon<IsServerSideGroupOpenByDefaultParams> = {
            data: rowNode.data,
            rowNode,
        };

        return userFunc(params);
    }

    public expandRows(rowIdsToExpand: string[], rowIdsToCollapse?: string[]): void {
        const rowIdsToExpandSet = new Set(rowIdsToExpand);
        const rowIdsToCollapseSet = new Set(rowIdsToCollapse || []);
        this.serverSideRowModel.forEachNodeTransactional((node) => {
            if (rowIdsToExpandSet.has(node.id!)) {
                return this.setExpanded(node, true);
            }
            if (rowIdsToCollapseSet.has(node.id!)) {
                return this.setExpanded(node, false);
            }
        });
    }

    public override setExpanded(
        rowNode: RowNode | undefined,
        expanded: boolean,
        e?: MouseEvent | KeyboardEvent,
        _?: boolean,
        rowId?: string
    ): void {
        const rowIdC = rowId || rowNode!.id!;
        this.expandedState.toggledNodes[rowIdC] = expanded;
        if (rowNode) {
            super.setExpanded(rowNode, expanded, e);
        }
    }

    public expandAll(expanded: boolean): void {
        this.expandedState = getDefaultExpansionState({ expandAll: expanded, interactedWithAll: true });
        this.serverSideRowModel.forEachNodeTransactional((node) => node.setExpanded(expanded));
        this.beans.eventSvc.dispatchEvent({
            type: 'expandOrCollapseAll',
            source: expanded ? 'expandAll' : ' collapseAll',
        });
    }

    public onGroupExpandedOrCollapsed(): void {
        // do nothing
    }

    protected override dispatchExpandedEvent(event: RowGroupOpenedEvent): void {
        this.eventSvc.dispatchEvent(event);

        // when using footers we need to refresh the group row, as the aggregation
        // values jump between group and footer, because the footer can be callback
        // we refresh regardless as the output of the callback could be a moving target
        this.beans.rowRenderer.refreshCells({ rowNodes: [event.node] });
    }
}
