import { Autowired, Bean } from "../../context/context";
import { BeanStub } from "../../context/beanStub";
import { ColumnModel } from "../../columns/columnModel";
import { Column } from "../../entities/column";
import { ColumnGroup } from "../../entities/columnGroup";
import { CtrlsService } from "../../ctrlsService";
import { HeaderRowType } from "../row/headerRowComp";
import { last } from "../../utils/array";

export interface HeaderPosition {
/** A number from 0 to n, where n is the last header row the grid is rendering */
    headerRowIndex: number;
/** The grid column or column group */
    column: Column | ColumnGroup;
}

export interface HeaderFuturePosition extends HeaderPosition {
    headerRowIndexWithoutSpan?: number;
}

@Bean('headerPositionUtils')
export class HeaderPositionUtils extends BeanStub {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;

    public findHeader(focusedHeader: HeaderPosition, direction: 'Before' | 'After'): HeaderPosition | undefined {
        let nextColumn: Column | ColumnGroup;
        let getGroupMethod: 'getDisplayedGroupBefore' | 'getDisplayedGroupAfter';
        let getColMethod: 'getDisplayedColBefore' | 'getDisplayedColAfter';

        if (focusedHeader.column instanceof ColumnGroup) {
            getGroupMethod = `getDisplayedGroup${direction}` as any;
            nextColumn = this.columnModel[getGroupMethod](focusedHeader.column)!;
        } else {
            getColMethod = `getDisplayedCol${direction}` as any;
            nextColumn = this.columnModel[getColMethod](focusedHeader.column)!;
        }

        if (!nextColumn) { return; }

        let { headerRowIndex } = focusedHeader;

        if (this.getHeaderRowType(headerRowIndex) !== HeaderRowType.FLOATING_FILTER) {
            const columnsInPath: (Column | ColumnGroup)[] = [nextColumn];

            while (nextColumn.getParent()) {
                nextColumn = nextColumn.getParent();
                columnsInPath.push(nextColumn);
            }
    
            nextColumn = columnsInPath[columnsInPath.length - 1 - headerRowIndex];
        }

        const { column, headerRowIndex: indexToFocus } = this.getHeaderIndexToFocus(nextColumn, headerRowIndex)

        return {
            column,
            headerRowIndex: indexToFocus
        };
    }

    public getHeaderIndexToFocus(column: Column | ColumnGroup, currentIndex: number,): HeaderPosition {
        let nextColumn: Column | undefined;

        if (column instanceof ColumnGroup && this.isAnyChildSpanningHeaderHeight(column) && column.isPadding()) {
            const targetColumn: ColumnGroup = column;
            nextColumn = targetColumn.getLeafColumns()[0];
            let col: Column | ColumnGroup = nextColumn;
            while (col !== targetColumn) {
                currentIndex++;
                col = col.getParent();
            }
        }

        return {
            column: nextColumn || column,
            headerRowIndex: currentIndex
        }
    }

    private isAnyChildSpanningHeaderHeight(columnGroup: ColumnGroup): boolean {
        if (!columnGroup) { return false; }
        return columnGroup.getLeafColumns().some(col => col.isSpanHeaderHeight());
    }

    public getColumnVisibleParent(currentColumn: Column | ColumnGroup, currentIndex: number): HeaderFuturePosition {
        const currentRowType = this.getHeaderRowType(currentIndex);
        const isFloatingFilter = currentRowType === HeaderRowType.FLOATING_FILTER;
        const isColumn = currentRowType === HeaderRowType.COLUMN;

        let nextFocusColumn: Column | ColumnGroup = isFloatingFilter ? currentColumn : currentColumn.getParent();
        let nextRow = currentIndex - 1;
        let headerRowIndexWithoutSpan: number | undefined = nextRow;

        if (isColumn && this.isAnyChildSpanningHeaderHeight((currentColumn as Column).getParent())) {
            while (nextFocusColumn && (nextFocusColumn as ColumnGroup).isPadding()) {
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

        return { column: nextFocusColumn, headerRowIndex: nextRow, headerRowIndexWithoutSpan };
    }

    public getColumnVisibleChild(column: Column | ColumnGroup, currentIndex: number, direction: 'Before' | 'After' = 'After'): HeaderFuturePosition {
        const currentRowType = this.getHeaderRowType(currentIndex);
        let nextFocusColumn: Column | ColumnGroup | null = column;
        let nextRow = currentIndex + 1;
        let headerRowIndexWithoutSpan = nextRow;

        if (currentRowType === HeaderRowType.COLUMN_GROUP) {
            const leafColumns = (column as ColumnGroup).getDisplayedLeafColumns();
            const leafColumn = direction === 'After' ? leafColumns[0] : last(leafColumns);
            const columnsInTheWay: ColumnGroup[] = [];

            let currentColumn: Column | ColumnGroup = leafColumn;
            while (currentColumn.getParent() !== column) {
                currentColumn = currentColumn.getParent();
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
                nextFocusColumn = last(columnsInTheWay);
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
        const displayedColumns = this.columnModel.getAllDisplayedColumns();
        const column = displayedColumns[position === 'start' ? 0 : displayedColumns.length - 1];

        if (!column) { return; }

        const childContainer = this.ctrlsService.getHeaderRowContainerCtrl(column.getPinned());
        const type = childContainer.getRowType(level);

        if (type == HeaderRowType.COLUMN_GROUP) {
            const columnGroup = this.columnModel.getColumnGroupAtLevel(column, level);
            return {
                headerRowIndex: level,
                column: columnGroup!
            };
        }

        return {
            // if type==null, means the header level didn't exist
            headerRowIndex: type == null ? -1 : level,
            column
        };
    }
}
