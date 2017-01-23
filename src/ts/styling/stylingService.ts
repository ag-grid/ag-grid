import {ColDef} from "../entities/colDef";
import {Autowired, Bean} from "../context/context";
import {ExpressionService} from "../expressionService";

@Bean('stylingService')
export class StylingService {
    @Autowired('expressionService') private expressionService: ExpressionService;

    public processAllCellClasses(colDef:ColDef, params:any, onApplicableClass:(className:string)=>void, onNotApplicableClass?:(className:string)=>void) {
        this.processCellClassRules(colDef, params, onApplicableClass, onNotApplicableClass);
        this.processStaticCellClasses(colDef, params, onApplicableClass)
    }

    public processCellClassRules(colDef:ColDef, params:any, onApplicableClass:(className:string)=>void, onNotApplicableClass?:(className:string)=>void) {
        let classRules = colDef.cellClassRules;
        if (typeof classRules === 'object' && classRules !== null) {
            let classNames = Object.keys(classRules);
            for (let i = 0; i < classNames.length; i++) {
                let className = classNames[i];
                let rule = classRules[className];
                let resultOfRule: any;
                if (typeof rule === 'string') {
                    resultOfRule = this.expressionService.evaluate(rule, params);
                } else if (typeof rule === 'function') {
                    resultOfRule = rule(params);
                }
                if (resultOfRule) {
                    onApplicableClass(className);
                } else if (onNotApplicableClass){
                    onNotApplicableClass(className);
                }
            }
        }
    }

    public processStaticCellClasses (colDef:ColDef, params:any, onApplicableClass:(className:string)=>void){
        let cellClass = colDef.cellClass;
        if (cellClass) {
            var classOrClasses: any;

            if (typeof colDef.cellClass === 'function') {
                var cellClassFunc = <(cellClassParams: any) => string|string[]> colDef.cellClass;
                classOrClasses = cellClassFunc(params);
            } else {
                classOrClasses = colDef.cellClass;
            }

            if (typeof classOrClasses === 'string') {
                onApplicableClass(classOrClasses);
            } else if (Array.isArray(classOrClasses)) {
                classOrClasses.forEach( (cssClassItem: string)=> {
                    onApplicableClass(cssClassItem);
                });
            }
        }
    }

}