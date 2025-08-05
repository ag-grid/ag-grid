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
    toggledNodes: Set<string>;
    /** RowNode IDs of those nodes that have been interacted with by the user */
    interactedWith: Set<string>;
}

export class ServerSideExpansionService extends BaseExpansionService implements NamedBean, IExpansionService {
    beanName = 'expansionSvc' as const;
    private expandedState = new Proxy(
        {
            expandAll: false,
            interactedWithAll: false,
            toggledNodes: new Proxy(new Set<string>(), {
                get: (target, prop) => {
                    if (prop === 'add' || prop === 'delete') {
                        return (value: string) => {
                            this.expandedState.interactedWith.add(value);
                            return target[prop](value);
                        };
                    }
                    return target[prop as keyof typeof target];
                },
            }),
            interactedWith: new Set<string>(),
        } as ExpansionState,
        {
            set(target, prop, value) {
                if (prop === 'expandAll') {
                    target.toggledNodes.clear();
                    target.expandAll = value;
                    target.interactedWith.clear();
                    target.interactedWithAll = true;
                    return true;
                }
                return false;
            },
        }
    );
    private serverSideRowModel: ServerSideRowModel;

    public wireBeans(beans: BeanCollection) {
        this.serverSideRowModel = beans.rowModel as ServerSideRowModel;
    }

    public postConstruct(): void {
        this.addManagedEventListeners({
            columnRowGroupChanged: () => {
                this.expandedState.toggledNodes.clear();
            },
        });
    }

    public checkOpenByDefault(rowNode: RowNode): boolean {
        if (!rowNode.isExpandable()) {
            return false;
        }

        if (this.expandedState.interactedWith.has(rowNode.id!)) {
            return this.expandedState.expandAll !== this.expandedState.toggledNodes.has(rowNode.id!);
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
        const processNodes = (rowIds: string[], expanded: boolean) => {
            for (const rowId of rowIds) {
                const rowNode = this.serverSideRowModel.getRowNode(rowId);
                this.setExpanded(rowNode, expanded, undefined, true, rowId);
            }
        };
        processNodes(rowIdsToExpand, true);
        if (!rowIdsToCollapse) {
            return;
        }
        processNodes(rowIdsToCollapse, false);
    }

    public override setExpanded(
        rowNode: RowNode | undefined,
        expanded: boolean,
        e?: MouseEvent | KeyboardEvent,
        _?: boolean,
        rowId?: string
    ): void {
        const rowIdC = rowId || rowNode?.id;
        const toggleAction =
            this.expandedState.expandAll !== expanded || (rowNode ? this.checkOpenByDefault(rowNode) : false)
                ? 'add'
                : 'delete';
        this.expandedState.toggledNodes[toggleAction](rowIdC!);
        if (rowNode) {
            super.setExpanded(rowNode, expanded, e);
        }
    }

    public expandAll(expanded: boolean): void {
        this.expandedState.expandAll = expanded;
        this.serverSideRowModel.expandAllTransactional((node) => node.setExpanded(expanded));
        this.beans.eventSvc.dispatchEvent({
            type: 'expandOrCollapseAll',
            source: expanded ? 'expandAll' : 'collapseAll',
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
