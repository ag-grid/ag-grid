import { RowNode } from "./entities/rowNode";
import { Bean } from "./context/context";
import { Qualifier } from "./context/context";
import { Logger } from "./logger";
import { LoggerFactory } from "./logger";
import { EventService } from "./eventService";
import { Events, SelectionChangedEvent } from "./events";
import { Autowired } from "./context/context";
import { IRowModel } from "./interfaces/iRowModel";
import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { PostConstruct } from "./context/context";
import { Constants } from "./constants";
import { ClientSideRowModel } from "./rowModels/clientSide/clientSideRowModel";
import { ColumnApi } from "./columnController/columnApi";
import { GridApi } from "./gridApi";
import { _ } from './utils';
import { ChangedPath } from "./rowModels/clientSide/changedPath";

@Bean('selectionController')
export class SelectionController {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    private selectedNodes: { [key: string]: RowNode | undefined };
    private logger: Logger;

    // used for shift selection, so we know where to start the range selection from
    private lastSelectedNode: RowNode | null;

    private groupSelectsChildren: boolean;

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('SelectionController');
        this.reset();

        if (this.gridOptionsWrapper.isRowModelDefault()) {
            this.eventService.addEventListener(Events.EVENT_ROW_DATA_CHANGED, this.reset.bind(this));
        } else {
            this.logger.log('dont know what to do here');
        }
    }

    @PostConstruct
    public init(): void {
        this.groupSelectsChildren = this.gridOptionsWrapper.isGroupSelectsChildren();
        this.eventService.addEventListener(Events.EVENT_ROW_SELECTED, this.onRowSelected.bind(this));
    }

    public setLastSelectedNode(rowNode: RowNode): void {
        this.lastSelectedNode = rowNode;
    }

    public getLastSelectedNode(): RowNode | null {
        return this.lastSelectedNode;
    }

    public getSelectedNodes() {
        const selectedNodes: RowNode[] = [];
        _.iterateObject(this.selectedNodes, (key: string, rowNode: RowNode) => {
            if (rowNode) {
                selectedNodes.push(rowNode);
            }
        });
        return selectedNodes;
    }

    public getSelectedRows() {
        const selectedRows: any[] = [];
        _.iterateObject(this.selectedNodes, (key: string, rowNode: RowNode) => {
            if (rowNode && rowNode.data) {
                selectedRows.push(rowNode.data);
            }
        });
        return selectedRows;
    }

    public removeGroupsFromSelection(): void {
        _.iterateObject(this.selectedNodes, (key: string, rowNode: RowNode) => {
            if (rowNode && rowNode.group) {
                this.selectedNodes[rowNode.id] = undefined;
            }
        });
    }

    // should only be called if groupSelectsChildren=true
    public updateGroupsFromChildrenSelections(changedPath?: ChangedPath): void {
        // we only do this when group selection state depends on selected children
        if (!this.gridOptionsWrapper.isGroupSelectsChildren()) {
            return;
        }
        // also only do it if CSRM (code should never allow this anyway)
        if (this.rowModel.getType() !== Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            return;
        }

        const clientSideRowModel = this.rowModel as ClientSideRowModel;
        const rootNode = clientSideRowModel.getRootNode();

        if (!changedPath) {
            changedPath = new ChangedPath(true, rootNode);
            changedPath.setInactive();
        }

        changedPath.forEachChangedNodeDepthFirst(rowNode => {
            if (rowNode !== rootNode) {
                rowNode.calculateSelectedFromChildren();
            }
        });

        // clientSideRowModel.getTopLevelNodes()!.forEach((rowNode: RowNode) => {
        //     rowNode.depthFirstSearch((node) => {
        //         if (node.group) {
        //         }
        //     });
        // });

    }

    public getNodeForIdIfSelected(id: number): RowNode | undefined {
        return this.selectedNodes[id];
    }

    public clearOtherNodes(rowNodeToKeepSelected: RowNode): number {
        const groupsToRefresh: any = {};
        let updatedCount = 0;
        _.iterateObject(this.selectedNodes, (key: string, otherRowNode: RowNode) => {
            if (otherRowNode && otherRowNode.id !== rowNodeToKeepSelected.id) {
                const rowNode = this.selectedNodes[otherRowNode.id];
                updatedCount += rowNode!.setSelectedParams({
                    newValue: false,
                    clearSelection: false,
                    suppressFinishActions: true
                });
                if (this.groupSelectsChildren && otherRowNode.parent) {
                    groupsToRefresh[otherRowNode.parent.id] = otherRowNode.parent;
                }
            }
        });
        _.iterateObject(groupsToRefresh, (key: string, group: RowNode) => {
            group.calculateSelectedFromChildren();
        });
        return updatedCount;
    }

    private onRowSelected(event: any): void {
        const rowNode = event.node;

        // we do not store the group rows when the groups select children
        if (this.groupSelectsChildren && rowNode.group) {
            return;
        }

        if (rowNode.isSelected()) {
            this.selectedNodes[rowNode.id] = rowNode;
        } else {
            this.selectedNodes[rowNode.id] = undefined;
        }
    }

    public syncInRowNode(rowNode: RowNode, oldNode: RowNode): void {
        this.syncInOldRowNode(rowNode, oldNode);
        this.syncInNewRowNode(rowNode);
    }

    // if the id has changed for the node, then this means the rowNode
    // is getting used for a different data item, which breaks
    // our selectedNodes, as the node now is mapped by the old id
    // which is inconsistent. so to keep the old node as selected,
    // we swap in the clone (with the old id and old data). this means
    // the oldNode is effectively a daemon we keep a reference to,
    // so if client calls api.getSelectedNodes(), it gets the daemon
    // in the result. when the client un-selects, the reference to the
    // daemon is removed. the daemon, because it's an oldNode, is not
    // used by the grid for rendering, it's a copy of what the node used
    // to be like before the id was changed.
    private syncInOldRowNode(rowNode: RowNode, oldNode: RowNode): void {
        const oldNodeHasDifferentId = _.exists(oldNode) && (rowNode.id !== oldNode.id);
        if (oldNodeHasDifferentId) {
            const oldNodeSelected = _.exists(this.selectedNodes[oldNode.id]);
            if (oldNodeSelected) {
                this.selectedNodes[oldNode.id] = oldNode;
            }
        }
    }

    private syncInNewRowNode(rowNode: RowNode): void {
        if (_.exists(this.selectedNodes[rowNode.id])) {
            rowNode.setSelectedInitialValue(true);
            this.selectedNodes[rowNode.id] = rowNode;
        } else {
            rowNode.setSelectedInitialValue(false);
        }
    }

    public reset(): void {
        this.logger.log('reset');
        this.selectedNodes = {};
        this.lastSelectedNode = null;
    }

    // returns a list of all nodes at 'best cost' - a feature to be used
    // with groups / trees. if a group has all it's children selected,
    // then the group appears in the result, but not the children.
    // Designed for use with 'children' as the group selection type,
    // where groups don't actually appear in the selection normally.
    public getBestCostNodeSelection() {

        if (this.rowModel.getType() !== Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            console.warn('getBestCostNodeSelection is only available when using normal row model');
        }

        const clientSideRowModel = this.rowModel as ClientSideRowModel;

        const topLevelNodes = clientSideRowModel.getTopLevelNodes();

        if (topLevelNodes === null) {
            console.warn('selectAll not available doing rowModel=virtual');
            return;
        }

        const result: any = [];

        // recursive function, to find the selected nodes
        function traverse(nodes: any) {
            for (let i = 0, l = nodes.length; i < l; i++) {
                const node = nodes[i];
                if (node.isSelected()) {
                    result.push(node);
                } else {
                    // if not selected, then if it's a group, and the group
                    // has children, continue to search for selections
                    if (node.group && node.children) {
                        traverse(node.children);
                    }
                }
            }
        }

        traverse(topLevelNodes);

        return result;
    }

    public setRowModel(rowModel: any) {
        this.rowModel = rowModel;
    }

    public isEmpty(): boolean {
        let count = 0;
        _.iterateObject(this.selectedNodes, (nodeId: string, rowNode: RowNode) => {
            if (rowNode) {
                count++;
            }
        });
        return count === 0;
    }

    public deselectAllRowNodes(justFiltered = false) {

        const callback = (rowNode: RowNode) => rowNode.selectThisNode(false);
        const rowModelClientSide = this.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE;

        if (justFiltered) {
            if (!rowModelClientSide) {
                console.error('ag-Grid: selecting just filtered only works with In Memory Row Model');
                return;
            }
            const clientSideRowModel = this.rowModel as ClientSideRowModel;
            clientSideRowModel.forEachNodeAfterFilter(callback);
        } else {
            _.iterateObject(this.selectedNodes, (id: string, rowNode: RowNode) => {
                // remember the reference can be to null, as we never 'delete' from the map
                if (rowNode) {
                    callback(rowNode);
                }
            });
            // this clears down the map (whereas above only sets the items in map to 'undefined')
            this.reset();
        }

        // the above does not clean up the parent rows if they are selected
        if (rowModelClientSide && this.groupSelectsChildren) {
            this.updateGroupsFromChildrenSelections();
        }

        const event: SelectionChangedEvent = {
            type: Events.EVENT_SELECTION_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };

        this.eventService.dispatchEvent(event);
    }

    public selectAllRowNodes(justFiltered = false) {
        if (this.rowModel.getType() !== Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            throw new Error(`selectAll only available with normal row model, ie not ${this.rowModel.getType()}`);
        }

        const clientSideRowModel = this.rowModel as ClientSideRowModel;
        const callback = (rowNode: RowNode) => rowNode.selectThisNode(true);

        if (justFiltered) {
            clientSideRowModel.forEachNodeAfterFilter(callback);
        } else {
            clientSideRowModel.forEachNode(callback);
        }

        // the above does not clean up the parent rows if they are selected
        if (this.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE && this.groupSelectsChildren) {
            this.updateGroupsFromChildrenSelections();
        }

        const event: SelectionChangedEvent = {
            type: Events.EVENT_SELECTION_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    }

    /**
     * @method
     * @deprecated
     */
    public selectNode(rowNode: RowNode | null, tryMulti: boolean) {
        if (rowNode) {
            rowNode.setSelectedParams({newValue: true, clearSelection: !tryMulti});
        }
    }

    /**
     * @method
     * @deprecated
     */
    public deselectIndex(rowIndex: number) {
        const node = this.rowModel.getRow(rowIndex);
        this.deselectNode(node);
    }

    /**
     * @method
     * @deprecated
     */
    public deselectNode(rowNode: RowNode | null) {
        if (rowNode) {
            rowNode.setSelectedParams({newValue: false, clearSelection: false});
        }
    }

    /**
     * @method
     * @deprecated
     */
    public selectIndex(index: any, tryMulti: boolean) {
        const node = this.rowModel.getRow(index);
        this.selectNode(node, tryMulti);
    }

}