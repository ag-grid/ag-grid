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

        const currentRowType = this.getHeaderRowType(headerRowIndex);

        if (currentRowType === HeaderRowType.COLUMN_GROUP) {
            const columnGroup = nextColumn as ColumnGroup;
            if (columnGroup.isPadding() && this.isAnyChildSpanningHeaderHeight(columnGroup)) {
                const { nextFocusColumn, nextRow } = this.getColumnVisibleChild(columnGroup, headerRowIndex, direction);

                if (nextFocusColumn) {
                    nextColumn = nextFocusColumn;
                    headerRowIndex = nextRow;
                }
            }
        }

        return {
            column: nextColumn,
            headerRowIndex
        };
    }

    private isAnyChildSpanningHeaderHeight(columnGroup: ColumnGroup): boolean {
        if (!columnGroup) { return false; }
        return columnGroup.getLeafColumns().some(col => col.isSpanHeaderHeight());
    }

    public getColumnVisibleParent(currentColumn: Column | ColumnGroup, currentIndex: number): { nextFocusColumn: Column | ColumnGroup | null; nextRow: number } {
        const currentRowType = this.getHeaderRowType(currentIndex);
        const isFloatingFilter = currentRowType === HeaderRowType.FLOATING_FILTER;
        const isColumn = currentRowType === HeaderRowType.COLUMN;

        let nextFocusColumn: Column | ColumnGroup = isFloatingFilter ? currentColumn : currentColumn.getParent();
        let nextRow = currentIndex - 1;

        if (isColumn && this.isAnyChildSpanningHeaderHeight((currentColumn as Column).getParent())) {
            while (nextFocusColumn && (nextFocusColumn as ColumnGroup).isPadding()) {
                nextFocusColumn = nextFocusColumn.getParent();
                nextRow--;
            }

            if (nextRow < 0) {
                nextFocusColumn = currentColumn;
                nextRow = currentIndex;
            }
        }

        return { nextFocusColumn: nextFocusColumn, nextRow };
    }

    public getColumnVisibleChild(column: Column | ColumnGroup, currentIndex: number, direction: 'Before' | 'After' = 'After'): { nextFocusColumn: Column | ColumnGroup | null; nextRow: number } {
        const currentRowType = this.getHeaderRowType(currentIndex);
        let nextFocusColumn: Column | ColumnGroup | null = column;
        let nextRow = currentIndex + 1;

        if (currentRowType === HeaderRowType.COLUMN_GROUP) {
            const leafColumns = (column as ColumnGroup).getLeafColumns();
            const leafChild = direction === 'After' ? leafColumns[0] : last(leafColumns);

            if (this.isAnyChildSpanningHeaderHeight(leafChild.getParent())) {
                nextFocusColumn = leafChild;

                let currentColumn = leafChild.getParent();

                while (currentColumn && currentColumn !== column) {
                    currentColumn = currentColumn.getParent();
                    nextRow++;
                }
            } else {
                nextFocusColumn =  (column as ColumnGroup).getDisplayedChildren()![0] as ColumnGroup;
            }
        }

        return { nextFocusColumn, nextRow };
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
