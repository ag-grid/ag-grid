import { ClassBuilder } from '../output/class_builder';
import * as o from '../output/output_ast';
import { ConvertPropertyBindingResult } from './expression_converter';
export declare class CheckBindingField {
    expression: o.ReadPropExpr;
    bindingId: string;
    constructor(expression: o.ReadPropExpr, bindingId: string);
}
export declare function createCheckBindingField(builder: ClassBuilder): CheckBindingField;
export declare function createCheckBindingStmt(evalResult: ConvertPropertyBindingResult, fieldExpr: o.ReadPropExpr, throwOnChangeVar: o.Expression, actions: o.Statement[]): o.Statement[];
