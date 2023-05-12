// Type definitions for @ag-grid-community/core v29.3.5
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "../entities/rowNode";
import { BeanStub } from "../context/beanStub";
export declare class SelectableService extends BeanStub {
    private groupSelectsChildren;
    private isRowSelectableFunc?;
    init(): void;
    updateSelectableAfterGrouping(rowNode: RowNode): void;
    private recurseDown;
}
