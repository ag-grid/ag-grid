import {ColDef} from "../entities/colDef";
import {Autowired, Bean} from "../context/context";
import {ExpressionService} from "../expressionService";

@Bean('stylingService')
export class StylingService {
    @Autowired('expressionService') private expressionService: ExpressionService;

    processCellClassRules(colDef:ColDef, params:any, onApplicableClass:(className:string)=>void, onNotApplicableClass?:(className:string)=>void) {
        var classRules = colDef.cellClassRules;
        if (typeof classRules === 'object' && classRules !== null) {
            var classNames = Object.keys(classRules);
            for (var i = 0; i < classNames.length; i++) {
                var className = classNames[i];
                var rule = classRules[className];
                var resultOfRule: any;
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

}