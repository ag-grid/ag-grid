import {Utils as _} from './utils';
import {RowNode} from "./entities/rowNode";
import {Bean} from "./context/context";
import {Qualifier} from "./context/context";
import {Logger} from "./logger";
import {LoggerFactory} from "./logger";
import {EventService} from "./eventService";
import {Events} from "./events";
import {Autowired} from "./context/context";
import {IRowModel} from "./interfaces/iRowModel";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {PostConstruct} from "./context/context";
import {Constants} from "./constants";
import {IInMemoryRowModel} from "./interfaces/iInMemoryRowModel";
import {InMemoryRowModel} from "./rowModels/inMemory/inMemoryRowModel";

@Bean('selectionController')
export class SelectionController {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private selectedNodes: {[key: string]: RowNode};
    private logger: Logger;

    // used for shift selection, so we know where to start the range selection from
    private lastSelectedNode: RowNode;

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

    public getLastSelectedNode(): RowNode {
        return this.lastSelectedNode;
    }

    public getSelectedNodes() {
        var selectedNodes: RowNode[] = [];
        _.iterateObject(this.selectedNodes, (key: string, rowNode: RowNode) => {
            if (rowNode) {
                selectedNodes.push(rowNode);
            }
        });
        return selectedNodes;
    }

    public getSelectedRows() {
        var selectedRows: any[] = [];
        _.iterateObject(this.selectedNodes, (key: string, rowNode: RowNode) => {
            if (rowNode) {
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
    public updateGroupsFromChildrenSelections(): void {
        if (this.rowModel.getType()!==Constants.ROW_MODEL_TYPE_NORMAL) {
            console.warn('updateGroupsFromChildrenSelections not available when rowModel is not normal');
        }
        var inMemoryRowModel = <IInMemoryRowModel> this.rowModel;
        inMemoryRowModel.getTopLevelNodes().forEach( (rowNode: RowNode) => {
            rowNode.depthFirstSearch( (rowNode)=> {
                if (rowNode.group) {
                    rowNode.calculateSelectedFromChildren();
                }
            });
        });
    }

    public getNodeForIdIfSelected(id: number): RowNode {
        return this.selectedNodes[id];
    }

    public clearOtherNodes(rowNodeToKeepSelected: RowNode): number {
        var groupsToRefresh: any = {};
        let updatedCount = 0;
        _.iterateObject(this.selectedNodes, (key: string, otherRowNode: RowNode)=> {
            if (otherRowNode && otherRowNode.id !== rowNodeToKeepSelected.id) {
                let rowNode = this.selectedNodes[otherRowNode.id];
                updatedCount += rowNode.setSelectedParams({newValue: false, clearSelection: false, tailingNodeInSequence: true});
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
        var rowNode = event.node;

        // we do not store the group rows when the groups select children
        if (this.groupSelectsChildren && rowNode.group) { return; }

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
        let oldNodeHasDifferentId = _.exists(oldNode) && (rowNode.id !== oldNode.id);
        if (oldNodeHasDifferentId) {
            let oldNodeSelected = _.exists(this.selectedNodes[oldNode.id]);
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

        if (this.rowModel.getType()!==Constants.ROW_MODEL_TYPE_NORMAL) {
            console.warn('getBestCostNodeSelection is only avilable when using normal row model');
        }

        var inMemoryRowModel = <IInMemoryRowModel> this.rowModel;

        var topLevelNodes = inMemoryRowModel.getTopLevelNodes();

        if (topLevelNodes===null) {
            console.warn('selectAll not available doing rowModel=virtual');
            return;
        }

        var result: any = [];

        // recursive function, to find the selected nodes
        function traverse(nodes: any) {
            for (var i = 0, l = nodes.length; i < l; i++) {
                var node = nodes[i];
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
        var count = 0;
        _.iterateObject(this.selectedNodes, (nodeId: string, rowNode: RowNode) => {
            if (rowNode) {
                count++;
            }
        });
        return count === 0;
    }

    public deselectAllRowNodes(justFiltered = false) {

        let inMemoryRowModel = <InMemoryRowModel> this.rowModel;
        let callback = (rowNode: RowNode) => rowNode.selectThisNode(false);

        // execute on all nodes in the model. if we are doing pagination, only
        // the current page is used, thus if we 'deselect all' while on page 2,
        // any selections on page 1 are left as is.
        if (justFiltered) {
            inMemoryRowModel.forEachNodeAfterFilter(callback);
        } else {
            inMemoryRowModel.forEachNode(callback);
        }

        // the above does not clean up the parent rows if they are selected
        if (this.rowModel.getType()===Constants.ROW_MODEL_TYPE_NORMAL && this.groupSelectsChildren) {
            this.updateGroupsFromChildrenSelections();
        }

        this.eventService.dispatchEvent(Events.EVENT_SELECTION_CHANGED);
    }

    public selectAllRowNodes(justFiltered = false) {
        if (this.rowModel.getType()!==Constants.ROW_MODEL_TYPE_NORMAL) {
            throw `selectAll only available with normal row model, ie not ${this.rowModel.getType()}`;
        }

        let inMemoryRowModel = <InMemoryRowModel> this.rowModel;
        let callback = (rowNode: RowNode) => rowNode.selectThisNode(true);

        if (justFiltered) {
            inMemoryRowModel.forEachNodeAfterFilter(callback);
        } else {
            inMemoryRowModel.forEachNode(callback);
        }

        // the above does not clean up the parent rows if they are selected
        if (this.rowModel.getType()===Constants.ROW_MODEL_TYPE_NORMAL && this.groupSelectsChildren) {
            this.updateGroupsFromChildrenSelections();
        }

        this.eventService.dispatchEvent(Events.EVENT_SELECTION_CHANGED);
    }

    // Deprecated method
    public selectNode(rowNode: RowNode, tryMulti: boolean) {
        rowNode.setSelectedParams({newValue: true, clearSelection: !tryMulti});
    }

    // Deprecated method
    public deselectIndex(rowIndex: number) {
        var node = this.rowModel.getRow(rowIndex);
        this.deselectNode(node);
    }

    // Deprecated method
    public deselectNode(rowNode: RowNode) {
        rowNode.setSelectedParams({newValue: false, clearSelection: false});
    }

    // Deprecated method
    public selectIndex(index: any, tryMulti: boolean) {
        var node = this.rowModel.getRow(index);
        this.selectNode(node, tryMulti);
    }

}