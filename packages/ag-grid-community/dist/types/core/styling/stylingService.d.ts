import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CellClassParams, ColDef } from '../entities/colDef';
import type { RowClassParams } from '../entities/gridOptions';
export declare class StylingService extends BeanStub implements NamedBean {
    beanName: "stylingService";
    private expressionService;
    wireBeans(beans: BeanCollection): void;
    processAllCellClasses(colDef: ColDef, params: CellClassParams, onApplicableClass: (className: string) => void, onNotApplicableClass?: (className: string) => void): void;
    processClassRules(previousClassRules: {
        [cssClassName: string]: ((...args: any[]) => any) | string;
    } | undefined, classRules: {
        [cssClassName: string]: ((...args: any[]) => any) | string;
    } | undefined, params: RowClassParams | CellClassParams, onApplicableClass: (className: string) => void, onNotApplicableClass?: (className: string) => void): void;
    getStaticCellClasses(colDef: ColDef, params: CellClassParams): string[];
    private processStaticCellClasses;
}
