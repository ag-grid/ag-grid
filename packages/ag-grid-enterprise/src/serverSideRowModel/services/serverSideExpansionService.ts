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
    /** RowNode IDs of those nodes whose expansion state differs from the base state */
    toggledNodes: Set<string>;
}

export class ServerSideExpansionService extends BaseExpansionService implements NamedBean, IExpansionService {
    beanName = 'expansionSvc' as const;

    private expandedState: ExpansionState = { expandAll: false, toggledNodes: new Set() };
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

    public checkOpenByDefault(rowNode: RowNode): void {
        if (!rowNode.isExpandable()) {
            return;
        }

        const shouldExpand = this.expandedState.expandAll !== this.expandedState.toggledNodes.has(rowNode.id!);
        if (shouldExpand) {
            rowNode.setExpanded(true);
            return;
        }

        const userFunc = this.gos.getCallback('isServerSideGroupOpenByDefault');
        if (!userFunc) {
            return;
        }

        const params: WithoutGridCommon<IsServerSideGroupOpenByDefaultParams> = {
            data: rowNode.data,
            rowNode,
        };

        const userFuncRes = userFunc(params);

        if (userFuncRes) {
            rowNode.setExpanded(true);
        }
    }

    public expandRows(rowIdsToExpand: string[], rowIdsToCollapse?: string[]): void {
        const processNodes = (rowIds: string[], expanded: boolean) => {
            for (const rowId of rowIds) {
                const rowNode = this.serverSideRowModel.getRowNode(rowId);
                if (rowNode) {
                    rowNode.setExpanded(expanded);
                } else {
                    this.expandedState.toggledNodes[expanded !== this.expandedState.expandAll ? 'add' : 'delete'](
                        rowId
                    );
                }
            }
        };
        processNodes(rowIdsToExpand, true);
        if (!rowIdsToCollapse) {
            return;
        }
        processNodes(rowIdsToCollapse, false);
    }

    public expandAll(value: boolean): void {
        this.expandedState.expandAll = value;
        this.expandedState.toggledNodes.clear();
        this.serverSideRowModel.expandAllTransactional((node) => {
            if (node.stub) {
                this.expandedState.toggledNodes.add(node.id!);
            } else {
                if (node.hasChildren()) {
                    node.setExpanded(value);
                }
            }
        });
        this.beans.eventSvc.dispatchEvent({
            type: 'expandOrCollapseAll',
            source: value ? 'expandAll' : 'collapseAll',
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
