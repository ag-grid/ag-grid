import type { VisibleColsService } from '../../columns/visibleColsService';
import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { CtrlsService } from '../../ctrlsService';
import type { AgColumn } from '../../entities/agColumn';
import { isColumnGroup } from '../../entities/agColumnGroup';
import type { AgColumnGroup } from '../../entities/agColumnGroup';
import type { Column, ColumnGroup } from '../../interfaces/iColumn';
import { _last } from '../../utils/array';
import { HeaderRowType } from '../row/headerRowComp';

export interface HeaderPosition {
    /** A number from 0 to n, where n is the last header row the grid is rendering */
    headerRowIndex: number;
    /** The grid column or column group */
    column: Column | ColumnGroup;
}

export interface HeaderFuturePosition extends HeaderPosition {
    headerRowIndexWithoutSpan?: number;
}

export class HeaderPositionUtils extends BeanStub implements NamedBean {
    beanName = 'headerPositionUtils' as const;

    private visibleColsService: VisibleColsService;
    private ctrlsService: CtrlsService;

    public wireBeans(beans: BeanCollection): void {
        this.visibleColsService = beans.visibleColsService;
        this.ctrlsService = beans.ctrlsService;
    }

    public findHeader(focusedHeader: HeaderPosition, direction: 'Before' | 'After'): HeaderPosition | undefined {
        let nextColumn: AgColumn | AgColumnGroup;
        let getColMethod: 'getColBefore' | 'getColAfter';

        if (isColumnGroup(focusedHeader.column)) {
            nextColumn = this.visibleColsService.getGroupAtDirection(focusedHeader.column, direction)!;
        } else {
            getColMethod = `getCol${direction}` as any;
            nextColumn = this.visibleColsService[getColMethod](focusedHeader.column as AgColumn)!;
        }

        if (!nextColumn) {
            return;
        }

        const { headerRowIndex } = focusedHeader;

        if (this.getHeaderRowType(headerRowIndex) !== HeaderRowType.FLOATING_FILTER) {
            const columnsInPath: (AgColumn | AgColumnGroup)[] = [nextColumn];

            while (nextColumn.getParent()) {
                nextColumn = nextColumn.getParent()!;
                columnsInPath.push(nextColumn);
            }

            nextColumn = columnsInPath[columnsInPath.length - 1 - headerRowIndex];
        }

        const { column, headerRowIndex: indexToFocus } = this.getHeaderIndexToFocus(nextColumn, headerRowIndex);

        return {
            column,
            headerRowIndex: indexToFocus,
        };
    }

    public getHeaderIndexToFocus(column: AgColumn | AgColumnGroup, currentIndex: number): HeaderPosition {
        let nextColumn: AgColumn | undefined;

        if (isColumnGroup(column) && this.isAnyChildSpanningHeaderHeight(column) && column.isPadding()) {
            const targetColumn: AgColumnGroup = column;
            nextColumn = targetColumn.getLeafColumns()[0];
            let col: AgColumn | AgColumnGroup = nextColumn;
            while (col !== targetColumn) {
                currentIndex++;
                col = col.getParent()!;
            }
        }

        return {
            column: nextColumn || column,
            headerRowIndex: currentIndex,
        };
    }

    private isAnyChildSpanningHeaderHeight(columnGroup: AgColumnGroup | null): boolean {
        if (!columnGroup) {
            return false;
        }
        return columnGroup.getLeafColumns().some((col) => col.isSpanHeaderHeight());
    }

    public getColumnVisibleParent(currentColumn: AgColumn | AgColumnGroup, currentIndex: number): HeaderFuturePosition {
        const currentRowType = this.getHeaderRowType(currentIndex);
        const isFloatingFilter = currentRowType === HeaderRowType.FLOATING_FILTER;
        const isColumn = currentRowType === HeaderRowType.COLUMN;

        let nextFocusColumn: AgColumn | AgColumnGroup | null = isFloatingFilter
            ? currentColumn
            : currentColumn.getParent();
        let nextRow = currentIndex - 1;
        let headerRowIndexWithoutSpan: number | undefined = nextRow;

        if (isColumn && this.isAnyChildSpanningHeaderHeight((currentColumn as AgColumn).getParent())) {
            while (nextFocusColumn && (nextFocusColumn as AgColumnGroup).isPadding()) {
                nextFocusColumn = nextFocusColumn.getParent();
                nextRow--;
            }

            headerRowIndexWithoutSpan = nextRow;
            if (nextRow < 0) {
                nextFocusColumn = currentColumn;
                nextRow = currentIndex;
                headerRowIndexWithoutSpan = undefined;
            }
        }

        return { column: nextFocusColumn!, headerRowIndex: nextRow, headerRowIndexWithoutSpan };
    }

    public getColumnVisibleChild(
        column: AgColumn | AgColumnGroup,
        currentIndex: number,
        direction: 'Before' | 'After' = 'After'
    ): HeaderFuturePosition {
        const currentRowType = this.getHeaderRowType(currentIndex);
        let nextFocusColumn: AgColumn | AgColumnGroup | null = column;
        let nextRow = currentIndex + 1;
        const headerRowIndexWithoutSpan = nextRow;

        if (currentRowType === HeaderRowType.COLUMN_GROUP) {
            const leafColumns = (column as AgColumnGroup).getDisplayedLeafColumns();
            const leafColumn = direction === 'After' ? leafColumns[0] : _last(leafColumns);
            const columnsInTheWay: AgColumnGroup[] = [];

            let currentColumn: AgColumn | AgColumnGroup = leafColumn;
            while (currentColumn.getParent() !== column) {
                currentColumn = currentColumn.getParent()!;
                columnsInTheWay.push(currentColumn);
            }

            nextFocusColumn = leafColumn;
            if (leafColumn.isSpanHeaderHeight()) {
                for (let i = columnsInTheWay.length - 1; i >= 0; i--) {
                    const colToFocus = columnsInTheWay[i];
                    if (!colToFocus.isPadding()) {
                        nextFocusColumn = colToFocus;
                        break;
                    }
                    nextRow++;
                }
            } else {
                nextFocusColumn = _last(columnsInTheWay);
                if (!nextFocusColumn) {
                    nextFocusColumn = leafColumn;
                }
            }
        }

        return { column: nextFocusColumn, headerRowIndex: nextRow, headerRowIndexWithoutSpan };
    }

    private getHeaderRowType(rowIndex: number): HeaderRowType | undefined {
        const centerHeaderContainer = this.ctrlsService.getHeaderRowContainerCtrl();
        if (centerHeaderContainer) {
            return centerHeaderContainer.getRowType(rowIndex);
        }
    }

    public findColAtEdgeForHeaderRow(level: number, position: 'start' | 'end'): HeaderPosition | undefined {
        const displayedColumns = this.visibleColsService.getAllCols();
        const column = displayedColumns[position === 'start' ? 0 : displayedColumns.length - 1];

        if (!column) {
            return;
        }

        const childContainer = this.ctrlsService.getHeaderRowContainerCtrl(column.getPinned());
        const type = childContainer.getRowType(level);

        if (type == HeaderRowType.COLUMN_GROUP) {
            const columnGroup = this.visibleColsService.getColGroupAtLevel(column, level);
            return {
                headerRowIndex: level,
                column: columnGroup!,
            };
        }

        return {
            // if type==null, means the header level didn't exist
            headerRowIndex: type == null ? -1 : level,
            column,
        };
    }
}
