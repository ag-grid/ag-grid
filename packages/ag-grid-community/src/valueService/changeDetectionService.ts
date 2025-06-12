import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import type { CellEditValuesChangedEvent, CellValueChangedEvent } from '../events';
import { _isClientSideRowModel } from '../gridOptionsUtils';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import type { Column } from '../interfaces/iColumn';
import type { IRowNode } from '../interfaces/iRowNode';
import { ChangedPath } from '../utils/changedPath';

// Matches value in clipboard module
const SOURCE_PASTE = 'paste';
export class ChangeDetectionService extends BeanStub implements NamedBean {
    beanName = 'changeDetectionSvc' as const;

    private clientSideRowModel: IClientSideRowModel | null = null;

    public postConstruct(): void {
        const { gos, rowModel } = this.beans;
        if (_isClientSideRowModel(gos, rowModel)) {
            this.clientSideRowModel = rowModel;
        }

        this.addManagedEventListeners({
            cellEditValuesChanged: this.onCellEditValuesChanged.bind(this),
            cellValueChanged: this.onCellValueChanged.bind(this),
        });
    }

    private onCellEditValuesChanged(event: CellEditValuesChangedEvent): void {
        const suppressFlash = event.newValue === event.oldValue;

        const nodesToRefresh = this.refreshCells(event, { suppressFlash, includePinnedRows: true });

        this.beans.rowRenderer.refreshRows({ rowNodes: nodesToRefresh, suppressFlash });
    }

    private onCellValueChanged(event: CellValueChangedEvent | CellEditValuesChangedEvent): RowNode[] | undefined {
        // Clipboard service manages its own change detection, so no need to do it here.
        // The clipboard manages its own as otherwise this would happen once for every cell
        // that got updated as part of a paste operation, so e.g. if 100 cells in a paste operation,
        // this doChangeDetection would get called 100 times (once for each cell), instead clipboard
        // service executes the logic we have here once (in essence batching up all cell changes
        // into one change detection).
        if (event.source === SOURCE_PASTE || this.gos.get('suppressChangeDetection')) {
            return;
        }

        this.refreshCells(event);
    }

    private refreshCells(
        { node, column }: { node: IRowNode; column: Column },
        params?: { suppressFlash?: boolean; includeLinkedRows?: boolean; includePinnedRows?: boolean } | null
    ): RowNode[] {
        const { gos, rowRenderer } = this.beans;

        const rowNode = node as RowNode;
        const nodesToRefresh: RowNode[] = [rowNode];

        const clientSideRowModel = this.clientSideRowModel;
        const rootNode = clientSideRowModel?.rootNode;

        if (!rootNode) {
            return nodesToRefresh;
        }

        // step 1 of change detection is to update the aggregated values
        const onlyChangedColumns = gos.get('aggregateOnlyChangedColumns');
        const changedPath = new ChangedPath(onlyChangedColumns, rootNode);
        changedPath.addParentNode(rowNode.parent, [column as AgColumn]);
        clientSideRowModel.doAggregate(changedPath);

        // add all nodes impacted by aggregation, as they need refreshed also.
        changedPath.forEachChangedNodeDepthFirst((rowNode) => {
            nodesToRefresh.push(rowNode);
            if (rowNode.sibling) {
                nodesToRefresh.push(rowNode.sibling);
            }
            if (rowNode.pinnedSibling) {
                nodesToRefresh.push(rowNode.pinnedSibling);
            }
        });

        if (rowNode.pinnedSibling) {
            // if the row is pinned, we also need to refresh the pinned sibling
            nodesToRefresh.push(rowNode.pinnedSibling);
        }

        // step 2 of change detection is to refresh the cells
        rowRenderer.refreshCells({ rowNodes: nodesToRefresh, suppressFlash: params?.suppressFlash });

        // return affected nodes for further processing, if needed
        return nodesToRefresh;
    }
}
