import type { ColumnModel } from '../../columns/columnModel';
import type { ColumnViewportService } from '../../columns/columnViewportService';
import type { VisibleColsService } from '../../columns/visibleColsService';
import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { RowNode } from '../../entities/rowNode';
import { _getRowHeightForNode } from '../../gridOptionsUtils';
import type { IClientSideRowModel } from '../../interfaces/iClientSideRowModel';
import type { IRowModel } from '../../interfaces/iRowModel';
import type { IServerSideRowModel } from '../../interfaces/iServerSideRowModel';

export class RowAutoHeightService extends BeanStub implements NamedBean {
    beanName = 'rowAutoHeightService' as const;

    private visibleColsService: VisibleColsService;
    private columnViewportService: ColumnViewportService;
    private rowModel: IRowModel;
    private columnModel: ColumnModel;

    public wireBeans(beans: BeanCollection): void {
        this.visibleColsService = beans.visibleColsService;
        this.columnViewportService = beans.columnViewportService;
        this.rowModel = beans.rowModel;
        this.columnModel = beans.columnModel;
    }

    public checkAutoHeights(rowNode: RowNode, autoHeights?: { [id: string]: number | undefined }): void {
        if (autoHeights == null) {
            return;
        }

        let notAllPresent = false;
        let nonePresent = true;
        let newRowHeight = 0;

        const displayedAutoHeightCols = this.visibleColsService.autoHeightCols;
        displayedAutoHeightCols.forEach((col) => {
            let cellHeight = autoHeights[col.getId()];

            if (cellHeight == null) {
                // If column spanning is active a column may not provide auto height for a row if that
                // cell is not present for the given row due to a previous cell spanning over the auto height column.
                if (this.columnModel.colSpanActive) {
                    let activeColsForRow: AgColumn[] = [];
                    switch (col.getPinned()) {
                        case 'left':
                            activeColsForRow = this.visibleColsService.getLeftColsForRow(rowNode);
                            break;
                        case 'right':
                            activeColsForRow = this.visibleColsService.getRightColsForRow(rowNode);
                            break;
                        case null:
                            activeColsForRow = this.columnViewportService.getColsWithinViewport(rowNode);
                            break;
                    }
                    if (activeColsForRow.includes(col)) {
                        // Column is present in the row, i.e not spanned over, but no auto height was provided so we cannot calculate the row height
                        notAllPresent = true;
                        return;
                    }
                    // Ignore this column as it is spanned over and not present in the row
                    cellHeight = -1;
                } else {
                    notAllPresent = true;
                    return;
                }
            } else {
                // At least one auto height is present
                nonePresent = false;
            }

            if (cellHeight > newRowHeight) {
                newRowHeight = cellHeight;
            }
        });

        if (notAllPresent) {
            return;
        }

        // we take min of 10, so we don't adjust for empty rows. if <10, we put to default.
        // this prevents the row starting very small when waiting for async components,
        // which would then mean the grid squashes in far to many rows (as small heights
        // means more rows fit in) which looks crap. so best ignore small values and assume
        // we are still waiting for values to render.
        if (nonePresent || newRowHeight < 10) {
            newRowHeight = _getRowHeightForNode(this.gos, rowNode).height;
        }

        if (newRowHeight == rowNode.rowHeight) {
            return;
        }

        rowNode.setRowHeight(newRowHeight);

        const rowModel = this.rowModel as IClientSideRowModel | IServerSideRowModel;
        rowModel.onRowHeightChangedDebounced?.();
    }
}
