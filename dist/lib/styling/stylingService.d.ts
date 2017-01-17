// Type definitions for ag-grid v7.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { ColDef } from "../entities/colDef";
export declare class StylingService {
    private expressionService;
    processCellClassRules(colDef: ColDef, params: any, onApplicableClass: (className: string) => void, onNotApplicableClass?: (className: string) => void): void;
}
