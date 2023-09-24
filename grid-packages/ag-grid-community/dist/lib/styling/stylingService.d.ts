import { CellClassParams, ColDef } from "../entities/colDef";
import { BeanStub } from "../context/beanStub";
import { RowClassParams } from "../entities/gridOptions";
export declare class StylingService extends BeanStub {
    private expressionService;
    processAllCellClasses(colDef: ColDef, params: CellClassParams, onApplicableClass: (className: string) => void, onNotApplicableClass?: (className: string) => void): void;
    processClassRules(classRules: {
        [cssClassName: string]: (Function | string);
    } | undefined, params: RowClassParams | CellClassParams, onApplicableClass: (className: string) => void, onNotApplicableClass?: (className: string) => void): void;
    getStaticCellClasses(colDef: ColDef, params: CellClassParams): string[];
    private processStaticCellClasses;
}
