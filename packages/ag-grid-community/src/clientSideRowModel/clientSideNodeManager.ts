import { BeanStub } from '../context/beanStub';
import type { GetRowIdFunc, GridOptions } from '../entities/gridOptions';
import { RowNode } from '../entities/rowNode';
import { _getRowIdCallback } from '../gridOptionsUtils';
import type { RefreshModelParams } from '../interfaces/iClientSideRowModel';
import type { RowDataTransaction } from '../interfaces/rowDataTransaction';
import type { RowNodeTransaction } from '../interfaces/rowNodeTransaction';
import { _fieldGetter } from '../utils/fieldGetter';
import { _error, _warn } from '../validation/logging';
import type { ChangedRowNodes } from './changedRowNodes';
import { filterRootLeafs, initRootSibling, lookupNodeByData, setAllLeafs, updateRootLeafs } from './clientSideRowNode';

export interface ClientSideNodeManagerUpdateRowDataResult<TData = any> {
    changedRowNodes: ChangedRowNodes<TData>;

    /** The RowNodeTransaction containing all the removals, updates and additions */
    rowNodeTransaction: RowNodeTransaction<TData>;

    /** True if at least one row was inserted (and not just appended) */
    rowsInserted: boolean;
}

type NestedDataGetter<TData> = (data: TData | null | undefined) => TData[] | null | undefined;

export class ClientSideNodeManager<TData = any> extends BeanStub {
    private nextId = 0;
    private allNodesMap: { [id: string]: RowNode<TData> } = {};
    private oldNested = false;
    private nestedDataGetter: NestedDataGetter<TData> | null | undefined = undefined;

    public constructor(public readonly rootNode: RowNode<TData>) {
        super();
    }

    public onPropChange(changedProps: ReadonlySet<keyof GridOptions>): boolean {
        const fieldChanged = changedProps.has('treeDataChildrenField');
        if (fieldChanged) {
            this.nestedDataGetter = undefined;
            if (this.gos.get('treeData')) {
                return true;
            }
        }

        if (fieldChanged || changedProps.has('treeData')) {
            const nested = !!this.getNestedDataGetter();
            if (this.oldNested !== nested) {
                return true;
            }
            // if ((this.oldNested || this.nestedDataGetter) && this.gos.get('treeData')) {
            //     return true;
            // }
        }
        if (fieldChanged && this.oldNested) {
            return true;
        }
        // if (this.oldNested && changedProps.has('treeData')) {
        //     return true;
        // }
        return false;
    }

    private getNestedDataGetter(): NestedDataGetter<TData> | null {
        let getter = this.nestedDataGetter;
        const gos = this.gos;
        if (getter === undefined) {
            const field = gos.isModuleRegistered('TreeData') && gos.get('treeDataChildrenField');
            this.nestedDataGetter = getter = field ? _fieldGetter(field) : null;
        }
        return gos.get('treeData') ? getter : null;
    }

    public getRowNode(id: string): RowNode | undefined {
        return this.allNodesMap[id];
    }

    public extractRowData(): TData[] | null | undefined {
        const rootNode = this.rootNode;
        const nodes = this.oldNested ? rootNode.childrenAfterGroup : rootNode.allLeafChildren;
        if (!nodes) {
            return null;
        }
        const len = nodes.length;
        const result = new Array<TData>(len);
        let writeIdx = 0;
        for (let i = 0; i < len; ++i) {
            const data = nodes[i].data;
            if (data != null) {
                result[writeIdx++] = data;
            }
        }
        result.length = writeIdx;
        return result;
    }

    public setNewRowData(rowData: TData[]): void {
        this.dispatchRowDataUpdateStartedEvent(rowData);

        const rootNode = this.rootNode;
        rootNode.childrenAfterFilter = null;
        rootNode.childrenAfterGroup = null;
        rootNode.childrenAfterAggFilter = null;
        rootNode.childrenAfterSort = null;
        rootNode.childrenMapped = null;
        rootNode.updateHasChildren();
        initRootSibling(rootNode);

        // Clear internal maps
        this.allNodesMap = {};
        this.nextId = 0;

        const allLeafs = new Array<RowNode<TData>>(rowData.length);
        setAllLeafs(rootNode, allLeafs);

        const nestedDataGetter = this.getNestedDataGetter();
        this.oldNested = !!nestedDataGetter;
        let writeIdx = 0;
        const processChildren = (parent: RowNode, childrenData: TData[]) => {
            for (let i = 0, len = childrenData.length; i < len; ++i) {
                const data = childrenData[i];
                const node = this.createRowNode(data);
                node.sourceRowIndex = writeIdx;
                allLeafs[writeIdx++] = node;
                if (nestedDataGetter) {
                    node.treeParent = parent;
                    const children = nestedDataGetter(data);
                    if (children) {
                        processChildren(node, children);
                    }
                }
            }
        };

        processChildren(this.rootNode, rowData);
        allLeafs.length = writeIdx;
    }

    public setImmutableRowData(params: RefreshModelParams<TData>, rowData: TData[]): void {
        this.dispatchRowDataUpdateStartedEvent(rowData);
        const getRowIdFunc = _getRowIdCallback(this.gos)!;
        const reorder = !this.gos.get('suppressMaintainUnsortedOrder');
        const changedRowNodes = params.changedRowNodes!;
        const { adds, updates } = changedRowNodes;
        const processedNodes = new Set<RowNode<TData>>();
        const nodesToUnselect: RowNode<TData>[] = [];
        const nestedDataGetter = this.getNestedDataGetter();
        this.oldNested = !!nestedDataGetter;

        let added = false;
        let updated = false;
        let reordered = false;
        let prevIndex = -1;

        const processChildren = (parent: RowNode<TData>, childrenData: TData[], level: number): void => {
            for (let i = 0, len = childrenData.length; i < len; ++i) {
                const data = childrenData[i];
                let node = this.getRowNode(getRowIdFunc({ data, level }));
                if (node) {
                    if (!reordered && reorder) {
                        const oldIndex = node.sourceRowIndex;
                        reordered =
                            added || // There was an update after an insertion, so order changed
                            oldIndex <= prevIndex; // A node was moved up, so order changed
                        prevIndex = oldIndex;
                    }
                    if (node.data !== data) {
                        updated = true;
                        node.updateData(data);
                        if (!adds.has(node)) {
                            updates.add(node);
                        }
                        if (!node.selectable && node.isSelected()) {
                            nodesToUnselect.push(node);
                        }
                    }
                    updated ||= !!nestedDataGetter && node.treeParent !== parent;
                } else {
                    added = true;
                    node = this.createRowNode(data);
                    adds.add(node);
                }
                processedNodes.add(node);

                if (nestedDataGetter) {
                    node.treeParent = parent;
                    const children = nestedDataGetter(data);
                    if (children) {
                        processChildren(node, children, level + 1);
                    }
                }
            }
        };

        const rootNode = this.rootNode;
        processChildren(rootNode, rowData, 0);

        const changed = this.deleteUnusedNodes(processedNodes, nodesToUnselect, changedRowNodes) || added || reordered;

        if (changed && updateRootLeafs(rootNode, processedNodes, reorder, changedRowNodes)) {
            params.rowNodesOrderChanged = true;
        }

        if (changed || updated) {
            params.rowDataUpdated = true;
            this.deselect(nodesToUnselect);
        }
    }

    private deleteUnusedNodes(
        processedNodes: Set<RowNode<TData>>,
        nodesToUnselect: RowNode<TData>[],
        changedRowNodes: ChangedRowNodes<TData>
    ): boolean {
        let nodesRemoved = false;
        const allLeafs = this.rootNode.allLeafChildren!;
        for (let i = 0, len = allLeafs.length; i < len; i++) {
            const node = allLeafs[i];
            if (processedNodes.has(node)) {
                continue;
            }
            nodesRemoved = true;
            this.deleteNode(node);
            changedRowNodes.remove(node);
            if (node.isSelected()) {
                nodesToUnselect.push(node);
            }
        }
        return nodesRemoved;
    }

    /** Called when a node needs to be deleted */
    private deleteNode(node: RowNode<TData>): void {
        node.clearRowTopAndRowIndex(); // so row renderer knows to fade row out (and not reposition it)
        const id = node.id!;
        const allNodesMap = this.allNodesMap;
        if (allNodesMap[id] === node) {
            delete allNodesMap[id];
        }
        const pinnedSibling = node.pinnedSibling;
        if (pinnedSibling) {
            this.beans.pinnedRowModel?.pinRow(pinnedSibling, null);
        }
    }

    public updateRowData(
        rowDataTran: RowDataTransaction<TData>,
        changedRowNodes: ChangedRowNodes<TData>
    ): ClientSideNodeManagerUpdateRowDataResult<TData> {
        this.dispatchRowDataUpdateStartedEvent(rowDataTran.add);

        const updateRowDataResult: ClientSideNodeManagerUpdateRowDataResult<TData> = {
            changedRowNodes,
            rowNodeTransaction: { remove: [], update: [], add: [] },
            rowsInserted: false,
        };

        if (this.getNestedDataGetter()) {
            _warn(268); // transactions not supported with treeDataChildrenField
            return updateRowDataResult;
        }

        const nodesToUnselect: RowNode[] = [];

        const getRowIdFunc = _getRowIdCallback(this.gos);
        this.executeRemove(getRowIdFunc, rowDataTran, updateRowDataResult, nodesToUnselect);
        this.executeUpdate(getRowIdFunc, rowDataTran, updateRowDataResult, nodesToUnselect);
        this.executeAdd(rowDataTran, updateRowDataResult);

        this.deselect(nodesToUnselect);

        return updateRowDataResult;
    }

    private executeAdd(rowDataTran: RowDataTransaction, result: ClientSideNodeManagerUpdateRowDataResult<TData>): void {
        const add = rowDataTran.add;
        if (!add?.length) {
            return;
        }

        const allLeafs = this.rootNode.allLeafChildren!;
        const allLeafsLen = allLeafs.length;

        let addIndex = allLeafsLen;
        if (typeof rowDataTran.addIndex === 'number') {
            addIndex = this.sanitizeAddIndex(rowDataTran.addIndex);
            const gos = this.gos;
            if (addIndex > 0 && gos.get('treeData') && gos.get('getDataPath')) {
                addIndex = adjustAddIndexForDataPath(allLeafs, addIndex);
            }
        }

        const addLength = add.length;
        const newAllLeafs = new Array<RowNode<TData>>(allLeafsLen + addLength); // Preallocate new array

        let writeIdx: number;
        for (writeIdx = 0; writeIdx < addIndex; writeIdx++) {
            newAllLeafs[writeIdx] = allLeafs[writeIdx]; // Copy nodes before addIndex
        }

        const adds = result.changedRowNodes.adds;
        for (let i = 0; i < addLength; i++) {
            const node = this.createRowNode(add[i]);
            adds.add(node);
            node.sourceRowIndex = writeIdx;
            newAllLeafs[writeIdx++] = node; // Insert new nodes
        }

        for (let i = addIndex; i < allLeafsLen; i++) {
            const node = allLeafs[i];
            node.sourceRowIndex = writeIdx;
            newAllLeafs[writeIdx++] = node; // Copy nodes after addIndex
        }

        setAllLeafs(this.rootNode, newAllLeafs);

        if (addIndex < allLeafsLen) {
            result.rowsInserted = true; // If not appending, mark as inserted
        }

        // add new row nodes to the transaction add items
        result.rowNodeTransaction.add = newAllLeafs.slice(addIndex, addIndex + addLength);
    }

    private executeRemove(
        getRowIdFunc: GetRowIdFunc<TData> | undefined,
        rowDataTran: RowDataTransaction,
        { changedRowNodes, rowNodeTransaction }: ClientSideNodeManagerUpdateRowDataResult<TData>,
        nodesToUnselect: RowNode<TData>[]
    ): void {
        const { remove } = rowDataTran;
        if (!remove?.length) {
            return;
        }
        const removedSet = new Set<RowNode<TData>>();
        const removedResult = rowNodeTransaction.remove;
        for (let i = 0, len = remove.length; i < len; i++) {
            const rowNode = this.lookupNode(getRowIdFunc, remove[i]);
            if (!rowNode) {
                continue;
            }
            if (rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }
            this.deleteNode(rowNode);
            changedRowNodes.remove(rowNode);
            removedResult.push(rowNode);
            removedSet.add(rowNode);
        }
        filterRootLeafs(this.rootNode, removedSet);
    }

    private executeUpdate(
        getRowIdFunc: GetRowIdFunc<TData> | undefined,
        rowDataTran: RowDataTransaction,
        { changedRowNodes: { adds, updates }, rowNodeTransaction }: ClientSideNodeManagerUpdateRowDataResult<TData>,
        nodesToUnselect: RowNode<TData>[]
    ): void {
        const { update } = rowDataTran;
        if (!update?.length) {
            return;
        }
        const updatedRowNodes = rowNodeTransaction.update;
        for (let i = 0, len = update.length; i < len; i++) {
            const item = update[i];
            const rowNode = this.lookupNode(getRowIdFunc, item);
            if (!rowNode) {
                continue;
            }
            rowNode.updateData(item);
            if (!rowNode.selectable && rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }
            updatedRowNodes.push(rowNode);
            if (!adds.has(rowNode)) {
                updates.add(rowNode);
            }
        }
    }

    private dispatchRowDataUpdateStartedEvent(rowData?: TData[] | null): void {
        this.eventSvc.dispatchEvent({
            type: 'rowDataUpdateStarted',
            firstRowData: rowData?.length ? rowData[0] : null,
        });
    }

    private deselect(nodesToUnselect: RowNode<TData>[]): void {
        const source = 'rowDataChanged';
        const selectionSvc = this.beans.selectionSvc;
        const selectionChanged = nodesToUnselect.length > 0;
        if (selectionChanged) {
            selectionSvc?.setNodesSelected({
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
        selectionSvc?.updateGroupsFromChildrenSelections?.(source);

        if (selectionChanged) {
            this.eventSvc.dispatchEvent({
                type: 'selectionChanged',
                source: source,
                selectedNodes: selectionSvc?.getSelectedNodes() ?? null,
                serverSideState: null,
            });
        }
    }

    private sanitizeAddIndex(addIndex: number): number {
        const allChildrenCount = this.rootNode.allLeafChildren?.length ?? 0;
        if (addIndex < 0 || addIndex >= allChildrenCount || Number.isNaN(addIndex)) {
            return allChildrenCount; // Append. Also for negative values, as it was historically the behavior.
        }

        // Ensure index is a whole number and not a floating point.
        // Use case: the user want to add a row in the middle, doing addIndex = array.length / 2.
        // If the array has an odd number of elements, the addIndex need to be rounded up.
        // Consider that array.slice does round up internally, but we are setting this value to node.sourceRowIndex.
        return Math.ceil(addIndex);
    }

    private createRowNode(data: TData): RowNode<TData> {
        const node: RowNode<TData> = new RowNode<TData>(this.beans);
        node.parent = this.rootNode;
        node.level = 0;
        node.group = false;
        node.expanded = false;

        node.setDataAndId(data, String(this.nextId));

        if (this.allNodesMap[node.id!]) {
            _warn(2, { nodeId: node.id });
        }
        this.allNodesMap[node.id!] = node;

        this.nextId++;

        return node;
    }

    private lookupNode(getRowIdFunc: ((data: any) => string) | undefined, data: TData): RowNode<TData> | null {
        if (!getRowIdFunc) {
            return lookupNodeByData(this.rootNode.allLeafChildren, data);
        }

        // find rowNode using id
        const id = getRowIdFunc({ data, level: 0 });
        const rowNode = this.allNodesMap[id];
        if (rowNode) {
            return rowNode;
        }
        _error(4, { id });
        return null;
    }
}

/**
 * Adjusts addIndex for treeData scenarios (AG-6231 workaround).
 * Returns the corrected addIndex value.
 */
const adjustAddIndexForDataPath = <TData>(allLeafs: RowNode<TData>[], addIndex: number): number => {
    for (let i = 0, len = allLeafs.length; i < len; i++) {
        const node = allLeafs[i];
        if (node?.rowIndex == addIndex - 1) {
            return i + 1;
        }
    }
    return addIndex;
};
