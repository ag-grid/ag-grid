import { BeanStub } from "../../context/beanStub";
import { Column } from "../../entities/column";
import { ColumnGroup } from "../../entities/columnGroup";
export interface HeaderPosition {
    /** A number from 0 to n, where n is the last header row the grid is rendering */
    headerRowIndex: number;
    /** The grid column or column group */
    column: Column | ColumnGroup;
}
export declare class HeaderPositionUtils extends BeanStub {
    private columnModel;
    private ctrlsService;
    findHeader(focusedHeader: HeaderPosition, direction: 'Before' | 'After'): HeaderPosition | undefined;
    findColAtEdgeForHeaderRow(level: number, position: 'start' | 'end'): HeaderPosition | undefined;
}
