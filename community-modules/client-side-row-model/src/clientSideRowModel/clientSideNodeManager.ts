import {
    Beans, ColumnModel, Events,
    EventService,
    RowDataTransaction,
    RowNode,
    RowNodeTransaction,
    SelectionChangedEvent,
    _,
    WithoutGridCommon,
    GridOptionsService,
    SelectionEventSourceType,
    ISelectionService,
    RowDataUpdateStartedEvent
} from "@ag-grid-community/core";

export class ClientSideNodeManager {

    private static TOP_LEVEL = 0;

    private readonly rootNode: RowNode;

    private gos: GridOptionsService;
    private eventService: EventService;
    private columnModel: ColumnModel;
    private selectionService: ISelectionService;
    private beans: Beans;

    private nextId = 0;

    private static ROOT_NODE_ID = 'ROOT_NODE_ID';

    // has row data actually been set
    private rowCountReady = false;

    // when user is provide the id's, we also keep a map of ids to row nodes for convenience
    private allNodesMap: { [id: string]: RowNode } = {};

    constructor(rootNode: RowNode, gos: GridOptionsService, eventService: EventService,
        columnModel: ColumnModel, selectionService: ISelectionService, beans: Beans) {
        this.rootNode = rootNode;
        this.gos = gos;
        this.eventService = eventService;
        this.columnModel = columnModel;
        this.beans = beans;
        this.selectionService = selectionService;

        this.rootNode.group = true;
        this.rootNode.level = -1;
        this.rootNode.id = ClientSideNodeManager.ROOT_NODE_ID;
        this.rootNode.allLeafChildren = [];
        this.rootNode.childrenAfterGroup = [];
        this.rootNode.childrenAfterSort = [];
        this.rootNode.childrenAfterAggFilter = [];
        this.rootNode.childrenAfterFilter = [];
    }

    public getCopyOfNodesMap(): { [id: string]: RowNode } {
        return _.cloneObject(this.allNodesMap);
    }

    public getRowNode(id: string): RowNode | undefined {
        return this.allNodesMap[id];
    }

    public setRowData(rowData: any[]): RowNode[] | undefined {
        if (typeof rowData === 'string') {
            console.warn('AG Grid: rowData must be an array.');
            return;
        }
        this.rowCountReady = true;

        this.dispatchRowDataUpdateStartedEvent(rowData);

        const rootNode = this.rootNode;
        const sibling = this.rootNode.sibling;

        rootNode.childrenAfterFilter = null;
        rootNode.childrenAfterGroup = null;
        rootNode.childrenAfterAggFilter = null;
        rootNode.childrenAfterSort = null;
        rootNode.childrenMapped = null;
        rootNode.updateHasChildren();

        this.nextId = 0;
        this.allNodesMap = {};

        if (rowData) {
            // we use rootNode as the parent, however if using ag-grid-enterprise, the grouping stage
            // sets the parent node on each row (even if we are not grouping). so setting parent node
            // here is for benefit of ag-grid-community users
            rootNode.allLeafChildren = rowData.map(dataItem => this.createNode(dataItem, this.rootNode, ClientSideNodeManager.TOP_LEVEL));
        } else {
            rootNode.allLeafChildren = [];
            rootNode.childrenAfterGroup = [];
        }

        if (sibling) {
            sibling.childrenAfterFilter = rootNode.childrenAfterFilter;
            sibling.childrenAfterGroup = rootNode.childrenAfterGroup;
            sibling.childrenAfterAggFilter = rootNode.childrenAfterAggFilter;
            sibling.childrenAfterSort = rootNode.childrenAfterSort;
            sibling.childrenMapped = rootNode.childrenMapped;
            sibling.allLeafChildren = rootNode.allLeafChildren;
        }
    }

    public updateRowData(rowDataTran: RowDataTransaction, rowNodeOrder: { [id: string]: number } | null | undefined): RowNodeTransaction {
        this.rowCountReady = true;
        this.dispatchRowDataUpdateStartedEvent(rowDataTran.add);

        const rowNodeTransaction: RowNodeTransaction = {
            remove: [],
            update: [],
            add: []
        };

        const nodesToUnselect: RowNode[] = [];

        this.executeRemove(rowDataTran, rowNodeTransaction, nodesToUnselect);
        this.executeUpdate(rowDataTran, rowNodeTransaction, nodesToUnselect);
        this.executeAdd(rowDataTran, rowNodeTransaction);

        this.updateSelection(nodesToUnselect, 'rowDataChanged');

        if (rowNodeOrder) {
            _.sortRowNodesByOrder(this.rootNode.allLeafChildren, rowNodeOrder);
        }

        return rowNodeTransaction;
    }

    public isRowCountReady(): boolean {
        return this.rowCountReady;
    }

    private dispatchRowDataUpdateStartedEvent(rowData?: any[] | null): void {
        const event: WithoutGridCommon<RowDataUpdateStartedEvent> = {
            type: Events.EVENT_ROW_DATA_UPDATE_STARTED,
            firstRowData: rowData?.length ? rowData[0] : null
        };
        this.eventService.dispatchEvent(event);
    }

    private updateSelection(nodesToUnselect: RowNode[], source: SelectionEventSourceType): void {
        const selectionChanged = nodesToUnselect.length > 0;
        if (selectionChanged) {
            this.selectionService.setNodesSelected({
                newValue: false,
                nodes: nodesToUnselect,
                suppressFinishActions: true,
                source,
            });
        }

        // we do this regardless of nodes to unselect or not, as it's possible
        // a new node was inserted, so a parent that was previously selected (as all
        // children were selected) should not be tri-state (as new one unselected against
        // all other selected children).
        this.selectionService.updateGroupsFromChildrenSelections(source);

        if (selectionChanged) {
            const event: WithoutGridCommon<SelectionChangedEvent> = {
                type: Events.EVENT_SELECTION_CHANGED,
                source: source
            };
            this.eventService.dispatchEvent(event);
        }
    }

    private executeAdd(rowDataTran: RowDataTransaction, rowNodeTransaction: RowNodeTransaction): void {
        const { add, addIndex } = rowDataTran;
        if (_.missingOrEmpty(add)) { return; }

        // create new row nodes for each data item
        const newNodes: RowNode[] = add!.map(item => this.createNode(item, this.rootNode, ClientSideNodeManager.TOP_LEVEL));

        if (typeof addIndex === 'number' && addIndex >= 0) {
            // new rows are inserted in one go by concatenating them in between the existing rows at the desired index.
            // this is much faster than splicing them individually into 'allLeafChildren' when there are large inserts.
            const { allLeafChildren } = this.rootNode;
            const len = allLeafChildren.length;
            let normalisedAddIndex = addIndex;

            const isTreeData = this.gos.get('treeData');
            if (isTreeData && addIndex > 0 && len > 0) {
                for (let i = 0; i < len; i++) {
                    if (allLeafChildren[i]?.rowIndex == addIndex - 1) { normalisedAddIndex = i + 1; break; }
                }
            }

            const nodesBeforeIndex = allLeafChildren.slice(0, normalisedAddIndex);
            const nodesAfterIndex = allLeafChildren.slice(normalisedAddIndex, allLeafChildren.length);
            this.rootNode.allLeafChildren = [...nodesBeforeIndex, ...newNodes, ...nodesAfterIndex];
        } else {
            this.rootNode.allLeafChildren = [...this.rootNode.allLeafChildren, ...newNodes];
        }
        if (this.rootNode.sibling) {
            this.rootNode.sibling.allLeafChildren = this.rootNode.allLeafChildren;
        }
        // add new row nodes to the transaction add items
        rowNodeTransaction.add = newNodes;
    }

    private executeRemove(rowDataTran: RowDataTransaction, rowNodeTransaction: RowNodeTransaction, nodesToUnselect: RowNode[]): void {
        const { remove } = rowDataTran;

        if (_.missingOrEmpty(remove)) { return; }

        const rowIdsRemoved: { [key: string]: boolean } = {};

        remove!.forEach(item => {
            const rowNode = this.lookupRowNode(item);

            if (!rowNode) { return; }

            // do delete - setting 'suppressFinishActions = true' to ensure EVENT_SELECTION_CHANGED is not raised for
            // each row node updated, instead it is raised once by the calling code if any selected nodes exist.
            if (rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }

            // so row renderer knows to fade row out (and not reposition it)
            rowNode.clearRowTopAndRowIndex();

            // NOTE: were we could remove from allLeaveChildren, however _.removeFromArray() is expensive, especially
            // if called multiple times (eg deleting lots of rows) and if allLeafChildren is a large list
            rowIdsRemoved[rowNode.id!] = true;
            // _.removeFromArray(this.rootNode.allLeafChildren, rowNode);
            delete this.allNodesMap[rowNode.id!];

            rowNodeTransaction.remove.push(rowNode);
        });

        this.rootNode.allLeafChildren = this.rootNode.allLeafChildren.filter(rowNode => !rowIdsRemoved[rowNode.id!]);
        if (this.rootNode.sibling) {
            this.rootNode.sibling.allLeafChildren = this.rootNode.allLeafChildren;
        }
    }

    private executeUpdate(rowDataTran: RowDataTransaction, rowNodeTransaction: RowNodeTransaction, nodesToUnselect: RowNode[]): void {
        const { update } = rowDataTran;
        if (_.missingOrEmpty(update)) { return; }

        update!.forEach(item => {
            const rowNode = this.lookupRowNode(item);

            if (!rowNode) { return; }

            rowNode.updateData(item);
            if (!rowNode.selectable && rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }

            this.setMasterForRow(rowNode, item, ClientSideNodeManager.TOP_LEVEL, false);

            rowNodeTransaction.update.push(rowNode);
        });
    }

    private lookupRowNode(data: any): RowNode | null {
        const getRowIdFunc = this.gos.getCallback('getRowId');

        let rowNode: RowNode | undefined;
        if (getRowIdFunc) {
            // find rowNode using id
            const id: string = getRowIdFunc({ data, level: 0 });
            rowNode = this.allNodesMap[id];
            if (!rowNode) {
                console.error(`AG Grid: could not find row id=${id}, data item was not found for this id`);
                return null;
            }
        } else {
            // find rowNode using object references
            rowNode = this.rootNode.allLeafChildren.find(node => node.data === data);
            if (!rowNode) {
                console.error(`AG Grid: could not find data item as object was not found`, data);
                console.error(`Consider using getRowId to help the Grid find matching row data`);
                return null;
            }
        }

        return rowNode || null;
    }

    private createNode(dataItem: any, parent: RowNode, level: number): RowNode {
        const node = new RowNode(this.beans);

        node.group = false;
        this.setMasterForRow(node, dataItem, level, true);

        const suppressParentsInRowNodes = this.gos.get('suppressParentsInRowNodes');
        if (parent && !suppressParentsInRowNodes) {
            node.parent = parent;
        }
        node.level = level;
        node.setDataAndId(dataItem, this.nextId.toString());

        if (this.allNodesMap[node.id!]) {
            console.warn(`AG Grid: duplicate node id '${node.id}' detected from getRowId callback, this could cause issues in your grid.`);
        }
        this.allNodesMap[node.id!] = node;

        this.nextId++;

        return node;
    }

    private setMasterForRow(rowNode: RowNode, data: any, level: number, setExpanded: boolean): void {
        const isTreeData = this.gos.get('treeData');
        if (isTreeData) {
            rowNode.setMaster(false);
            if (setExpanded) {
                rowNode.expanded = false;
            }
        } else {
            const masterDetail = this.gos.get('masterDetail');
            // this is the default, for when doing grid data
            if (masterDetail) {
                // if we are doing master detail, then the
                // default is that everything can be a Master Row.
                const isRowMasterFunc = this.gos.get('isRowMaster');
                if (isRowMasterFunc) {
                    rowNode.setMaster(isRowMasterFunc(data));
                } else {
                    rowNode.setMaster(true);
                }
            } else {
                rowNode.setMaster(false);
            }

            if (setExpanded) {
                const rowGroupColumns = this.columnModel.getRowGroupColumns();
                const numRowGroupColumns = rowGroupColumns ? rowGroupColumns.length : 0;

                // need to take row group into account when determining level
                const masterRowLevel = level + numRowGroupColumns;

                rowNode.expanded = rowNode.master ? this.isExpanded(masterRowLevel) : false;
            }
        }
    }

    private isExpanded(level: any) {
        const expandByDefault = this.gos.get('groupDefaultExpanded');
        if (expandByDefault === -1) {
            return true;
        }
        return level < expandByDefault;
    }
}
