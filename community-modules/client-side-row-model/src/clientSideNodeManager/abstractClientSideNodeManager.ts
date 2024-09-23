import type {
    BeanCollection,
    ClientSideNodeManagerUpdateRowDataResult,
    IClientSideNodeManager,
    RowDataTransaction,
    RowNode,
    SelectionEventSourceType,
} from '@ag-grid-community/core';
import { BeanStub } from '@ag-grid-community/core';

const ROOT_NODE_ID = 'ROOT_NODE_ID';

/**
 * This is the type of any row in allLeafChildren and childrenAfterGroup of the ClientSideNodeManager rootNode.
 * ClientSideNodeManager is allowed to update the sourceRowIndex property of the nodes.
 */
export interface ClientSideNodeManagerRowNode<TData> extends RowNode<TData> {
    sourceRowIndex: number;
}

/**
 * This is the type of the root RowNode of the ClientSideNodeManager
 * ClientSideNodeManager is allowed to update the allLeafChildren and childrenAfterGroup properties of the root node.
 */
export interface ClientSideNodeManagerRootNode<TData> extends RowNode<TData> {
    allLeafChildren: ClientSideNodeManagerRowNode<TData>[] | null;
    childrenAfterGroup: ClientSideNodeManagerRowNode<TData>[] | null;
}

export abstract class AbstractClientSideNodeManager<TData = any>
    extends BeanStub
    implements IClientSideNodeManager<TData>
{
    public rootNode: ClientSideNodeManagerRootNode<TData>;

    protected beans: BeanCollection;

    public wireBeans(beans: BeanCollection): void {
        this.beans = beans;
    }

    public abstract getRowNode(id: string): RowNode | undefined;

    public abstract setRowData(rowData: TData[]): void;

    public abstract setImmutableRowData(rowData: TData[]): ClientSideNodeManagerUpdateRowDataResult<TData> | null;

    public abstract updateRowData(
        rowDataTran: RowDataTransaction<TData>
    ): ClientSideNodeManagerUpdateRowDataResult<TData>;

    public clearRootNode(): void {
        if (this.rootNode) {
            this.setRowData([]);
            this.rootNode = null!;
        }
    }

    public initRootNode(rootRowNode: RowNode<TData>): void {
        const rootNode = rootRowNode as ClientSideNodeManagerRootNode<TData>;

        this.rootNode = rootNode;

        if (rootNode) {
            rootNode.group = true;
            rootNode.level = -1;
            rootNode.id = ROOT_NODE_ID;
            rootNode.allLeafChildren = [];
            rootNode.childrenAfterGroup = [];
            rootNode.childrenAfterSort = [];
            rootNode.childrenAfterAggFilter = [];
            rootNode.childrenAfterFilter = [];
        }
    }

    protected dispatchRowDataUpdateStartedEvent(rowData?: TData[] | null): void {
        this.eventService.dispatchEvent({
            type: 'rowDataUpdateStarted',
            firstRowData: rowData?.length ? rowData[0] : null,
        });
    }

    protected updateSelection(nodesToUnselect: RowNode<TData>[], source: SelectionEventSourceType): void {
        const selectionService = this.beans.selectionService;
        const selectionChanged = nodesToUnselect.length > 0;
        if (selectionChanged) {
            selectionService.setNodesSelected({
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
        selectionService.updateGroupsFromChildrenSelections(source);

        if (selectionChanged) {
            this.eventService.dispatchEvent({
                type: 'selectionChanged',
                source: source,
            });
        }
    }

    protected setMasterForRow(rowNode: RowNode<TData>, data: TData, level: number, setExpanded: boolean): void {
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
                const rowGroupColumns = this.beans.funcColsService.getRowGroupColumns();
                const numRowGroupColumns = rowGroupColumns ? rowGroupColumns.length : 0;

                // need to take row group into account when determining level
                const masterRowLevel = level + numRowGroupColumns;

                rowNode.expanded = rowNode.master ? this.isExpanded(masterRowLevel) : false;
            }
        }
    }

    protected isExpanded(level: number): boolean {
        const expandByDefault = this.gos.get('groupDefaultExpanded');
        if (expandByDefault === -1) {
            return true;
        }
        return level < expandByDefault;
    }
}
