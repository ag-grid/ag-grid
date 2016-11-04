/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as cdAst from '../expression_parser/ast';
import { ClassBuilder } from '../output/class_builder';
import * as o from '../output/output_ast';
export interface NameResolver {
    callPipe(name: string, input: o.Expression, args: o.Expression[]): o.Expression;
    getLocal(name: string): o.Expression;
}
export declare class EventHandlerVars {
    static event: o.ReadVarExpr;
}
export declare class ConvertPropertyBindingResult {
    stmts: o.Statement[];
    currValExpr: o.Expression;
    forceUpdate: o.Expression;
    constructor(stmts: o.Statement[], currValExpr: o.Expression, forceUpdate: o.Expression);
}
/**
 * Converts the given expression AST into an executable output AST, assuming the expression is
 * used in a property binding.
 */
export declare function convertPropertyBinding(builder: ClassBuilder, nameResolver: NameResolver, implicitReceiver: o.Expression, expression: cdAst.AST, bindingId: string): ConvertPropertyBindingResult;
export declare class ConvertActionBindingResult {
    stmts: o.Statement[];
    preventDefault: o.Expression;
    constructor(stmts: o.Statement[], preventDefault: o.Expression);
}
/**
 * Converts the given expression AST into an executable output AST, assuming the expression is
 * used in an action binding (e.g. an event handler).
 */
export declare function convertActionBinding(builder: ClassBuilder, nameResolver: NameResolver, implicitReceiver: o.Expression, action: cdAst.AST, bindingId: string): ConvertActionBindingResult;
/**
 * Creates variables that are shared by multiple calls to `convertActionBinding` /
 * `convertPropertyBinding`
 */
export declare function createSharedBindingVariablesIfNeeded(stmts: o.Statement[]): o.Statement[];
export declare function temporaryDeclaration(bindingId: string, temporaryNumber: number): o.Statement;
