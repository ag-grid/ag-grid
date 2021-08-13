// Type definitions for @ag-grid-community/core v26.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../../entities/column";
import { ColumnGroup } from "../../entities/columnGroup";
import { BeanStub } from "../../context/beanStub";
export interface HeaderPosition {
    /** A number from 0 to n, where n is the last header row the grid is rendering */
    headerRowIndex: number;
    /** The grid column or column group */
    column: Column | ColumnGroup;
}
export declare class HeaderPositionUtils extends BeanStub {
    private columnModel;
    private headerNavigationService;
    findHeader(focusedHeader: HeaderPosition, direction: 'Before' | 'After'): HeaderPosition | undefined;
    findColAtEdgeForHeaderRow(level: number, position: 'start' | 'end'): HeaderPosition | undefined;
}
