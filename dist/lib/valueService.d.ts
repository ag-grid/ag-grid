// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import GridOptionsWrapper from "./gridOptionsWrapper";
import ExpressionService from "./expressionService";
import { ColumnController } from "./columnController/columnController";
import { ColDef } from "./entities/colDef";
export default class ValueService {
    private gridOptionsWrapper;
    private expressionService;
    private columnController;
    init(gridOptionsWrapper: GridOptionsWrapper, expressionService: ExpressionService, columnController: ColumnController): void;
    getValue(colDef: ColDef, data: any, node: any): any;
    private getValueUsingField(data, field);
    setValueUsingField(data: any, field: string, newValue: any): void;
    private executeValueGetter(valueGetter, data, colDef, node);
    private getValueCallback(data, node, field);
}
