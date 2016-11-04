/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Identifiers, resolveIdentifier } from '../identifiers';
import * as o from '../output/output_ast';
export var CheckBindingField = (function () {
    function CheckBindingField(expression, bindingId) {
        this.expression = expression;
        this.bindingId = bindingId;
    }
    return CheckBindingField;
}());
export function createCheckBindingField(builder) {
    var bindingId = "" + builder.fields.length;
    var fieldExpr = createBindFieldExpr(bindingId);
    // private is fine here as no child view will reference the cached value...
    builder.fields.push(new o.ClassField(fieldExpr.name, null, [o.StmtModifier.Private]));
    builder.ctorStmts.push(o.THIS_EXPR.prop(fieldExpr.name)
        .set(o.importExpr(resolveIdentifier(Identifiers.UNINITIALIZED)))
        .toStmt());
    return new CheckBindingField(fieldExpr, bindingId);
}
export function createCheckBindingStmt(evalResult, fieldExpr, throwOnChangeVar, actions) {
    var condition = o.importExpr(resolveIdentifier(Identifiers.checkBinding)).callFn([
        throwOnChangeVar, fieldExpr, evalResult.currValExpr
    ]);
    if (evalResult.forceUpdate) {
        condition = evalResult.forceUpdate.or(condition);
    }
    return evalResult.stmts.concat([
        new o.IfStmt(condition, actions.concat([
            o.THIS_EXPR.prop(fieldExpr.name).set(evalResult.currValExpr).toStmt()
        ]))
    ]);
}
function createBindFieldExpr(bindingId) {
    return o.THIS_EXPR.prop("_expr_" + bindingId);
}
//# sourceMappingURL=binding_util.js.map