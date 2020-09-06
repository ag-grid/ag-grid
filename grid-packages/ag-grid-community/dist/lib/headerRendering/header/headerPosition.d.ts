import { Column } from "../../entities/column";
import { ColumnGroup } from "../../entities/columnGroup";
import { BeanStub } from "../../context/beanStub";
export interface HeaderPosition {
    headerRowIndex: number;
    column: Column | ColumnGroup;
}
export declare class HeaderPositionUtils extends BeanStub {
    private columnController;
    private headerNavigationService;
    findHeader(focusedHeader: HeaderPosition, direction: 'Before' | 'After'): HeaderPosition;
    findColAtEdgeForHeaderRow(level: number, position: 'start' | 'end'): HeaderPosition;
}
