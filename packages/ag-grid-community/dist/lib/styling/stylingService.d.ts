import { CellClassParams, ColDef } from "../entities/colDef";
export declare class StylingService {
    private expressionService;
    processAllCellClasses(colDef: ColDef, params: CellClassParams, onApplicableClass: (className: string) => void, onNotApplicableClass?: (className: string) => void): void;
    processClassRules(classRules: {
        [cssClassName: string]: (Function | string);
    } | undefined, params: CellClassParams, onApplicableClass: (className: string) => void, onNotApplicableClass?: (className: string) => void): void;
    processStaticCellClasses(colDef: ColDef, params: CellClassParams, onApplicableClass: (className: string) => void): void;
}
