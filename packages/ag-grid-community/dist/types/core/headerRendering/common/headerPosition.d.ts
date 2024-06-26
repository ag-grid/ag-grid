import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { AgColumnGroup } from '../../entities/agColumnGroup';
import type { Column, ColumnGroup } from '../../interfaces/iColumn';
export interface HeaderPosition {
    /** A number from 0 to n, where n is the last header row the grid is rendering */
    headerRowIndex: number;
    /** The grid column or column group */
    column: Column | ColumnGroup;
}
export interface HeaderFuturePosition extends HeaderPosition {
    headerRowIndexWithoutSpan?: number;
}
export declare class HeaderPositionUtils extends BeanStub implements NamedBean {
    beanName: "headerPositionUtils";
    private visibleColsService;
    private ctrlsService;
    wireBeans(beans: BeanCollection): void;
    findHeader(focusedHeader: HeaderPosition, direction: 'Before' | 'After'): HeaderPosition | undefined;
    getHeaderIndexToFocus(column: AgColumn | AgColumnGroup, currentIndex: number): HeaderPosition;
    private isAnyChildSpanningHeaderHeight;
    getColumnVisibleParent(currentColumn: AgColumn | AgColumnGroup, currentIndex: number): HeaderFuturePosition;
    getColumnVisibleChild(column: AgColumn | AgColumnGroup, currentIndex: number, direction?: 'Before' | 'After'): HeaderFuturePosition;
    private getHeaderRowType;
    findColAtEdgeForHeaderRow(level: number, position: 'start' | 'end'): HeaderPosition | undefined;
}
