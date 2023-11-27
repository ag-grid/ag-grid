// Type definitions for @ag-grid-community/core v31.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridOptions } from "../entities/gridOptions";
import { BeanStub } from "../context/beanStub";
import { ColDef, ColGroupDef } from "../entities/colDef";
export declare class ValidationService extends BeanStub {
    private readonly gridOptions;
    init(): void;
    processGridOptions(options: GridOptions): void;
    processColumnDefs(options: ColDef | ColGroupDef): void;
    private processOptions;
    private checkForWarning;
    private checkProperties;
}
