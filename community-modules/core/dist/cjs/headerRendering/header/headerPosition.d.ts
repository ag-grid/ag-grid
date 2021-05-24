// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
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
    findHeader(focusedHeader: HeaderPosition, direction: 'Before' | 'After'): HeaderPosition | undefined;
    findColAtEdgeForHeaderRow(level: number, position: 'start' | 'end'): HeaderPosition | undefined;
}
