import type {
    BeanCollection,
    EventService,
    FuncColsService,
    GridOptionsService,
    ISelectionService,
    RowDataTransaction,
    RowNodeTransaction,
    SelectionEventSourceType,
    _ErrorType,
    _GridOptionOrDefault,
} from '@ag-grid-community/core';
import {
    RowNode,
    _cloneObject,
    _errorOnce1,
    _getRowIdCallback,
    _missingOrEmpty,
    _warnOnce1,
} from '@ag-grid-community/core';

const ROOT_NODE_ID = 'ROOT_NODE_ID';
const TOP_LEVEL = 0;

/**
 * This is the type of any row in allLeafChildren and childrenAfterGroup of the ClientSideNodeManager rootNode.
 * ClientSideNodeManager is allowed to update the sourceRowIndex property of the nodes.
 */
interface ClientSideNodeManagerRowNode extends RowNode {
    sourceRowIndex: number;
}

/**
 * This is the type of the root RowNode of the ClientSideNodeManager
 * ClientSideNodeManager is allowed to update the allLeafChildren and childrenAfterGroup properties of the root node.
 */
interface ClientSideNodeManagerRootNode extends RowNode {
    allLeafChildren: ClientSideNodeManagerRowNode[] | null;
    childrenAfterGroup: ClientSideNodeManagerRowNode[] | null;
}

/** Result of ClientSideNodeManager.updateRowData method */
export interface ClientSideNodeManagerUpdateRowDataResult {
    /** The RowNodeTransaction containing all the removals, updates and additions */
    rowNodeTransaction: RowNodeTransaction;

    /** True if at least one row was inserted (and not just appended) */
    rowsInserted: boolean;
}

interface GridOptionsConfig {
    treeData: _GridOptionOrDefault<'treeData'>;
    masterDetail: _GridOptionOrDefault<'masterDetail'>;
    isRowMaster: _GridOptionOrDefault<'isRowMaster'>;
    groupDefaultExpanded: _GridOptionOrDefault<'groupDefaultExpanded'>;
    getRowId: ReturnType<typeof _getRowIdCallback>;
}
function getMasterRowConfig(gos: GridOptionsService): GridOptionsConfig {
    return {
        treeData: gos.get('treeData'),
        masterDetail: gos.get('masterDetail'),
        isRowMaster: gos.get('isRowMaster'),
        groupDefaultExpanded: gos.get('groupDefaultExpanded'),
        getRowId: _getRowIdCallback(gos),
    };
}

export class ClientSideNodeManager {
    private readonly rootNode: ClientSideNodeManagerRootNode;

    private gos: GridOptionsService;
    private eventService: EventService;
    private funcColsService: FuncColsService;
    private selectionService: ISelectionService;
    private beans: BeanCollection;

    private nextId = 0;

    // has row data actually been set
    private rowCountReady = false;

    // when user is provide the id's, we also keep a map of ids to row nodes for convenience
    private allNodesMap: { [id: string]: RowNode } = {};

    constructor(
        rootNode: RowNode,
        gos: GridOptionsService,
        eventService: EventService,
        funcColsService: FuncColsService,
        selectionService: ISelectionService,
        beans: BeanCollection
    ) {
        this.rootNode = rootNode;
        this.gos = gos;
        this.eventService = eventService;
        this.funcColsService = funcColsService;
        this.beans = beans;
        this.selectionService = selectionService;

        this.rootNode.group = true;
        this.rootNode.level = -1;
        this.rootNode.id = ROOT_NODE_ID;
        this.rootNode.allLeafChildren = [];
        this.rootNode.childrenAfterGroup = [];
        this.rootNode.childrenAfterSort = [];
        this.rootNode.childrenAfterAggFilter = [];
        this.rootNode.childrenAfterFilter = [];
    }

    public getCopyOfNodesMap(): { [id: string]: RowNode } {
        return _cloneObject(this.allNodesMap);
    }

    public getRowNode(id: string): RowNode | undefined {
        return this.allNodesMap[id];
    }

    public setRowData(rowData: any[]): RowNode[] | undefined {
        if (typeof rowData === 'string') {
            _warnOnce1<_ErrorType.RowDataNotAString>(1);
            return;
        }
        this.rowCountReady = true;

        this.dispatchRowDataUpdateStartedEvent(rowData);

        const rootNode = this.rootNode;
        const sibling: ClientSideNodeManagerRootNode = this.rootNode.sibling;

        rootNode.childrenAfterFilter = null;
        rootNode.childrenAfterGroup = null;
        rootNode.childrenAfterAggFilter = null;
        rootNode.childrenAfterSort = null;
        rootNode.childrenMapped = null;
        rootNode.updateHasChildren();

        this.nextId = 0;
        this.allNodesMap = {};
        // Read config once to avoid multiple calls within loops
        const config = getMasterRowConfig(this.gos);

        if (rowData) {
            // we use rootNode as the parent, however if using ag-grid-enterprise, the grouping stage
            // sets the parent node on each row (even if we are not grouping). so setting parent node
            // here is for benefit of ag-grid-community users
            rootNode.allLeafChildren = rowData.map((dataItem, index) =>
                this.createNode(dataItem, this.rootNode, TOP_LEVEL, index, config)
            );
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

    public updateRowData(rowDataTran: RowDataTransaction): ClientSideNodeManagerUpdateRowDataResult {
        this.rowCountReady = true;
        this.dispatchRowDataUpdateStartedEvent(rowDataTran.add);

        const updateRowDataResult: ClientSideNodeManagerUpdateRowDataResult = {
            rowNodeTransaction: { remove: [], update: [], add: [] },
            rowsInserted: false,
        };

        const nodesToUnselect: RowNode[] = [];
        const config = getMasterRowConfig(this.gos);

        this.executeRemove(rowDataTran, updateRowDataResult, nodesToUnselect, config);
        this.executeUpdate(rowDataTran, updateRowDataResult, nodesToUnselect, config);
        this.executeAdd(rowDataTran, updateRowDataResult, config);

        this.updateSelection(nodesToUnselect, 'rowDataChanged');

        return updateRowDataResult;
    }

    /**
     * Used by the immutable service, after updateRowData, after updating with a generated transaction to
     * apply the order as specified by the the new data. We use sourceRowIndex to determine the order of the rows.
     * Time complexity is O(n) where n is the number of rows/rowData
     * @returns true if the order changed, otherwise false
     */
    public updateRowOrderFromRowData<TData>(rowData: TData[]): boolean {
        const rows = this.rootNode.allLeafChildren;
        const rowsLength = rows?.length ?? 0;
        const rowsOutOfOrder = new Map<TData, ClientSideNodeManagerRowNode>();
        let firstIndexOutOfOrder = -1;
        let lastIndexOutOfOrder = -1;

        // Step 1: Build the rowsOutOfOrder mapping data => row for the rows out of order, in O(n)
        for (let i = 0; i < rowsLength; ++i) {
            const row = rows![i];
            const data = row.data;
            if (data !== rowData[i]) {
                // The row is not in the correct position
                if (lastIndexOutOfOrder < 0) {
                    firstIndexOutOfOrder = i; // First row out of order was found
                }
                lastIndexOutOfOrder = i; // Last row out of order
                rowsOutOfOrder.set(data, row); // A new row out of order was found, add it to the map
            }
        }
        if (firstIndexOutOfOrder < 0) {
            return false; // No rows out of order
        }

        // Step 2: Overwrite the rows out of order we find in the map, in O(n)
        for (let i = firstIndexOutOfOrder; i <= lastIndexOutOfOrder; ++i) {
            const row = rowsOutOfOrder.get(rowData[i]);
            if (row !== undefined) {
                rows![i] = row; // Out of order row found, overwrite it
                row.sourceRowIndex = i; // Update its position
            }
        }
        return true; // The order changed
    }

    public isRowCountReady(): boolean {
        return this.rowCountReady;
    }

    private dispatchRowDataUpdateStartedEvent(rowData?: any[] | null): void {
        this.eventService.dispatchEvent({
            type: 'rowDataUpdateStarted',
            firstRowData: rowData?.length ? rowData[0] : null,
        });
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
            this.eventService.dispatchEvent({
                type: 'selectionChanged',
                source: source,
            });
        }
    }

    private executeAdd(
        rowDataTran: RowDataTransaction,
        result: ClientSideNodeManagerUpdateRowDataResult,
        config: GridOptionsConfig
    ): void {
        const add = rowDataTran.add;
        if (_missingOrEmpty(add)) {
            return;
        }

        const allLeafChildren = this.rootNode.allLeafChildren!;
        let addIndex = allLeafChildren.length;

        if (typeof rowDataTran.addIndex === 'number') {
            const allChildrenCount = this.rootNode.allLeafChildren?.length ?? 0;
            addIndex = sanitizeAddIndex(rowDataTran.addIndex, allChildrenCount);

            if (addIndex > 0) {
                // TODO: this code should not be here, see AG-12602
                // This was a fix for AG-6231, but is not the correct fix
                if (config.treeData) {
                    for (let i = 0; i < allLeafChildren.length; i++) {
                        const node = allLeafChildren[i];
                        if (node?.rowIndex == addIndex - 1) {
                            addIndex = i + 1;
                            break;
                        }
                    }
                }
            }
        }

        // create new row nodes for each data item
        const newNodes: RowNode[] = add!.map((item, index) =>
            this.createNode(item, this.rootNode, TOP_LEVEL, addIndex + index, config)
        );

        if (addIndex < allLeafChildren.length) {
            // Insert at the specified index

            const nodesBeforeIndex = allLeafChildren.slice(0, addIndex);
            const nodesAfterIndex = allLeafChildren.slice(addIndex, allLeafChildren.length);

            // update latter row indexes
            const nodesAfterIndexFirstIndex = nodesBeforeIndex.length + newNodes.length;
            for (let index = 0, length = nodesAfterIndex.length; index < length; ++index) {
                nodesAfterIndex[index].sourceRowIndex = nodesAfterIndexFirstIndex + index;
            }

            this.rootNode.allLeafChildren = [...nodesBeforeIndex, ...newNodes, ...nodesAfterIndex];

            // Mark the result as rows inserted
            result.rowsInserted = true;
        } else {
            // Just append at the end
            this.rootNode.allLeafChildren = allLeafChildren.concat(newNodes);
        }

        const sibling: ClientSideNodeManagerRootNode = this.rootNode.sibling;
        if (sibling) {
            sibling.allLeafChildren = allLeafChildren;
        }

        // add new row nodes to the transaction add items
        result.rowNodeTransaction.add = newNodes;
    }

    private executeRemove(
        rowDataTran: RowDataTransaction,
        { rowNodeTransaction }: ClientSideNodeManagerUpdateRowDataResult,
        nodesToUnselect: RowNode[],
        config: GridOptionsConfig
    ): void {
        const { remove } = rowDataTran;

        if (_missingOrEmpty(remove)) {
            return;
        }

        const rowIdsRemoved: { [key: string]: boolean } = {};

        remove!.forEach((item) => {
            const rowNode = this.lookupRowNode(item, config.getRowId);

            if (!rowNode) {
                return;
            }

            // do delete - setting 'suppressFinishActions = true' to ensure EVENT_SELECTION_CHANGED is not raised for
            // each row node updated, instead it is raised once by the calling code if any selected nodes exist.
            if (rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }

            // so row renderer knows to fade row out (and not reposition it)
            rowNode.clearRowTopAndRowIndex();

            // NOTE: were we could remove from allLeaveChildren, however removeFromArray() is expensive, especially
            // if called multiple times (eg deleting lots of rows) and if allLeafChildren is a large list
            rowIdsRemoved[rowNode.id!] = true;
            // removeFromArray(this.rootNode.allLeafChildren, rowNode);
            delete this.allNodesMap[rowNode.id!];

            rowNodeTransaction.remove.push(rowNode);
        });

        this.rootNode.allLeafChildren =
            this.rootNode.allLeafChildren?.filter((rowNode) => !rowIdsRemoved[rowNode.id!]) ?? null;

        // after rows have been removed, all following rows need the position index updated
        this.rootNode.allLeafChildren?.forEach((node, idx) => {
            node.sourceRowIndex = idx;
        });

        const sibling: ClientSideNodeManagerRootNode | null = this.rootNode.sibling;
        if (sibling) {
            sibling.allLeafChildren = this.rootNode.allLeafChildren;
        }
    }

    private executeUpdate(
        rowDataTran: RowDataTransaction,
        { rowNodeTransaction }: ClientSideNodeManagerUpdateRowDataResult,
        nodesToUnselect: RowNode[],
        config: GridOptionsConfig
    ): void {
        const { update } = rowDataTran;
        if (_missingOrEmpty(update)) {
            return;
        }

        update!.forEach((item) => {
            const rowNode = this.lookupRowNode(item, config.getRowId);

            if (!rowNode) {
                return;
            }

            rowNode.updateData(item);
            if (!rowNode.selectable && rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }

            setMasterForRow(rowNode, item, TOP_LEVEL, false, config, this.funcColsService);

            rowNodeTransaction.update.push(rowNode);
        });
    }

    private lookupRowNode(data: any, getRowId: GridOptionsConfig['getRowId']): RowNode | null {
        let rowNode: RowNode | undefined;
        if (getRowId) {
            // find rowNode using id
            const id = getRowId({ data, level: 0 });
            rowNode = this.allNodesMap[id];
            if (!rowNode) {
                _errorOnce1<_ErrorType.NotFoundRowId>(4, id);
                return null;
            }
        } else {
            // find rowNode using object references
            rowNode = this.rootNode.allLeafChildren?.find((node) => node.data === data);
            if (!rowNode) {
                _errorOnce1<_ErrorType.NotFoundDataItem>(5, data);
                return null;
            }
        }

        return rowNode || null;
    }

    private createNode(
        dataItem: any,
        parent: RowNode,
        level: number,
        sourceRowIndex: number,
        config: GridOptionsConfig
    ): RowNode {
        const node: ClientSideNodeManagerRowNode = new RowNode(this.beans);
        node.sourceRowIndex = sourceRowIndex;

        node.group = false;
        setMasterForRow(node, dataItem, level, true, config, this.funcColsService);

        if (parent) {
            node.parent = parent;
        }
        node.level = level;
        node.setDataAndId(dataItem, this.nextId.toString());

        if (this.allNodesMap[node.id!]) {
            _warnOnce1<_ErrorType.DuplicateRowNode>(2, node.id);
        }
        this.allNodesMap[node.id!] = node;

        this.nextId++;

        return node;
    }
}

function sanitizeAddIndex(addIndex: number, allChildrenCount: number): number {
    if (addIndex < 0 || addIndex >= allChildrenCount || Number.isNaN(addIndex)) {
        return allChildrenCount; // Append. Also for negative values, as it was historically the behavior.
    }

    // Ensure index is a whole number and not a floating point.
    // Use case: the user want to add a row in the middle, doing addIndex = array.length / 2.
    // If the array has an odd number of elements, the addIndex need to be rounded up.
    // Consider that array.slice does round up internally, but we are setting this value to node.sourceRowIndex.
    return Math.ceil(addIndex);
}

function setMasterForRow(
    rowNode: RowNode,
    data: any,
    level: number,
    setExpanded: boolean,
    { treeData, masterDetail, isRowMaster, groupDefaultExpanded }: GridOptionsConfig,
    funcColsService: FuncColsService
): void {
    if (treeData) {
        rowNode.setMaster(false);
        if (setExpanded) {
            rowNode.expanded = false;
        }
    } else {
        // this is the default, for when doing grid data
        let isMaster = false;
        if (masterDetail) {
            // if we are doing master detail, then the
            // default is that everything can be a Master Row unless a callback says otherwise
            isMaster = isRowMaster ? isRowMaster(data) : true;
        }
        rowNode.setMaster(isMaster);

        if (setExpanded) {
            const numRowGroupColumns = funcColsService.getRowGroupColumns()?.length ?? 0;
            // need to take row group into account when determining level
            const masterRowLevel = level + numRowGroupColumns;

            const isExpanded = rowNode.master && (groupDefaultExpanded === -1 || masterRowLevel < groupDefaultExpanded);
            rowNode.expanded = isExpanded;
        }
    }
}
