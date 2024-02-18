import { BeanStub } from "../../context/beanStub";
import { Column } from "../../entities/column";
import { ColumnGroup } from "../../entities/columnGroup";
export interface HeaderPosition {
    /** A number from 0 to n, where n is the last header row the grid is rendering */
    headerRowIndex: number;
    /** The grid column or column group */
    column: Column | ColumnGroup;
}
export interface HeaderFuturePosition extends HeaderPosition {
    headerRowIndexWithoutSpan?: number;
}
export declare class HeaderPositionUtils extends BeanStub {
    private columnModel;
    private ctrlsService;
    findHeader(focusedHeader: HeaderPosition, direction: 'Before' | 'After'): HeaderPosition | undefined;
    getHeaderIndexToFocus(column: Column | ColumnGroup, currentIndex: number): HeaderPosition;
    private isAnyChildSpanningHeaderHeight;
    getColumnVisibleParent(currentColumn: Column | ColumnGroup, currentIndex: number): HeaderFuturePosition;
    getColumnVisibleChild(column: Column | ColumnGroup, currentIndex: number, direction?: 'Before' | 'After'): HeaderFuturePosition;
    private getHeaderRowType;
    findColAtEdgeForHeaderRow(level: number, position: 'start' | 'end'): HeaderPosition | undefined;
}
