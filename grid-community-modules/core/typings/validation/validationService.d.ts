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
