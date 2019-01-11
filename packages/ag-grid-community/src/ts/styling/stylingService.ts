import { CellClassParams, ColDef } from "../entities/colDef";
import { Autowired, Bean } from "../context/context";
import { ExpressionService } from "../valueService/expressionService";

@Bean('stylingService')
export class StylingService {
    @Autowired('expressionService') private expressionService: ExpressionService;

    public processAllCellClasses(colDef: ColDef, params: any, onApplicableClass: (className: string) => void, onNotApplicableClass?: (className: string) => void) {
        this.processClassRules(colDef.cellClassRules, params, onApplicableClass, onNotApplicableClass);
        this.processStaticCellClasses(colDef, params, onApplicableClass);
    }

    public processClassRules(classRules: { [cssClassName: string]: (Function | string) } | undefined, params: CellClassParams, onApplicableClass: (className: string) => void, onNotApplicableClass?: (className: string) => void) {
        if (typeof classRules === 'object' && classRules !== null) {
            const classNames = Object.keys(classRules);
            for (let i = 0; i < classNames.length; i++) {
                const className = classNames[i];
                const rule = classRules[className];
                let resultOfRule: any;
                if (typeof rule === 'string') {
                    resultOfRule = this.expressionService.evaluate(rule, params);
                } else if (typeof rule === 'function') {
                    resultOfRule = rule(params);
                }
                if (resultOfRule) {
                    onApplicableClass(className);
                } else if (onNotApplicableClass) {
                    onNotApplicableClass(className);
                }
            }
        }
    }

    public processStaticCellClasses(colDef: ColDef, params: CellClassParams, onApplicableClass: (className: string) => void) {
        const cellClass = colDef.cellClass;
        if (cellClass) {
            let classOrClasses: any;

            if (typeof colDef.cellClass === 'function') {
                const cellClassFunc = colDef.cellClass as (cellClassParams: any) => string | string[];
                classOrClasses = cellClassFunc(params);
            } else {
                classOrClasses = colDef.cellClass;
            }

            if (typeof classOrClasses === 'string') {
                onApplicableClass(classOrClasses);
            } else if (Array.isArray(classOrClasses)) {
                classOrClasses.forEach((cssClassItem: string) => {
                    onApplicableClass(cssClassItem);
                });
            }
        }
    }

}