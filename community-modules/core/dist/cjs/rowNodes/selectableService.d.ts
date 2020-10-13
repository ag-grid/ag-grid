// Type definitions for @ag-grid-community/core v24.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "../entities/rowNode";
import { BeanStub } from "../context/beanStub";
export declare class SelectableService extends BeanStub {
    private gridOptionsWrapper;
    private groupSelectsChildren;
    private isRowSelectableFunc?;
    init(): void;
    updateSelectableAfterGrouping(rowNode: RowNode): void;
    updateSelectableAfterFiltering(rowNode: RowNode): void;
    private recurseDown;
}
