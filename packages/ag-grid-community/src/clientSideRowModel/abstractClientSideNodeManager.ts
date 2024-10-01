import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import { RowNode } from '../entities/rowNode';
import type { SelectionEventSourceType } from '../events';
import type {
    ClientSideNodeManagerUpdateRowDataResult,
    IClientSideNodeManager,
} from '../interfaces/iClientSideNodeManager';
import type { RowDataTransaction } from '../interfaces/rowDataTransaction';
import { _logError, _logWarn } from '../validation/logging';

const ROOT_NODE_ID = 'ROOT_NODE_ID';

/**
 * This is the type of any row in allLeafChildren and childrenAfterGroup of the ClientSideNodeManager rootNode.
 * ClientSideNodeManager is allowed to update the sourceRowIndex property of the nodes.
 */
interface ClientSideNodeManagerRowNode<TData> extends RowNode<TData> {
    sourceRowIndex: number;
}

/**
 * This is the type of the root RowNode of the ClientSideNodeManager
 * ClientSideNodeManager is allowed to update the allLeafChildren and childrenAfterGroup properties of the root node.
 */
interface ClientSideNodeManagerRootNode<TData> extends RowNode<TData> {
    sibling: ClientSideNodeManagerRootNode<TData>;
    allLeafChildren: ClientSideNodeManagerRowNode<TData>[] | null;
    childrenAfterGroup: ClientSideNodeManagerRowNode<TData>[] | null;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AbstractClientSideNodeManager {
    export type RowNode<TData> = ClientSideNodeManagerRowNode<TData>;
    export type RootNode<TData> = ClientSideNodeManagerRootNode<TData>;
}

export abstract class AbstractClientSideNodeManager<TData = any>
    extends BeanStub
    implements IClientSideNodeManager<TData>
{
    private nextId = 0;
    protected allNodesMap: { [id: string]: RowNode } = {};

    public rootNode: AbstractClientSideNodeManager.RootNode<TData>;

    protected beans: BeanCollection;

    public wireBeans(beans: BeanCollection): void {
        this.beans = beans;
    }

    public getRowNode(id: string): RowNode | undefined {
        return this.allNodesMap[id];
    }

    public abstract setNewRowData(rowData: TData[]): void;

    public abstract setImmutableRowData(rowData: TData[]): ClientSideNodeManagerUpdateRowDataResult<TData> | null;

    public abstract updateRowData(
        rowDataTran: RowDataTransaction<TData>
    ): ClientSideNodeManagerUpdateRowDataResult<TData>;

    public clearRootNode(): void {
        if (this.rootNode) {
            this.setNewRowData([]);
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
            selectionService?.setNodesSelected({
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
        selectionService?.updateGroupsFromChildrenSelections?.(source);

        if (selectionChanged) {
            this.eventService.dispatchEvent({
                type: 'selectionChanged',
                source: source,
            });
        }
    }

    protected isExpanded(level: number): boolean {
        const expandByDefault = this.gos.get('groupDefaultExpanded');
        if (expandByDefault === -1) {
            return true;
        }
        return level < expandByDefault;
    }

    protected sanitizeAddIndex(addIndex: number): number {
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

    protected clearAllNodesMap(): void {
        this.allNodesMap = {};
        this.nextId = 0;
    }

    protected createNode(dataItem: TData, sourceRowIndex: number): RowNode<TData> {
        const node: ClientSideNodeManagerRowNode<TData> = new RowNode<TData>(this.beans);
        node.parent = this.rootNode;
        node.level = 0;
        node.group = false;
        node.master = false;
        node.expanded = false;
        node.sourceRowIndex = sourceRowIndex;

        node.setDataAndId(dataItem, String(this.nextId));

        if (this.allNodesMap[node.id!]) {
            _logWarn(2, { nodeId: node.id });
        }
        this.allNodesMap[node.id!] = node;

        this.nextId++;

        return node;
    }

    protected lookupRowNode(getRowIdFunc: ((data: any) => string) | undefined, data: TData): RowNode | null {
        let rowNode: RowNode | undefined;
        if (getRowIdFunc) {
            // find rowNode using id
            const id = getRowIdFunc({ data, level: 0 });
            rowNode = this.allNodesMap[id];
            if (!rowNode) {
                _logError(4, { id });
                return null;
            }
        } else {
            // find rowNode using object references
            rowNode = this.rootNode.allLeafChildren?.find((node) => node.data === data);
            if (!rowNode) {
                _logError(5, { data });
                return null;
            }
        }

        return rowNode || null;
    }
}
