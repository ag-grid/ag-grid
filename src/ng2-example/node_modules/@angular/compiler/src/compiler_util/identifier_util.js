/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isPresent } from '../facade/lang';
import { Identifiers, resolveEnumIdentifier, resolveIdentifier } from '../identifiers';
import * as o from '../output/output_ast';
export function createDiTokenExpression(token) {
    if (isPresent(token.value)) {
        return o.literal(token.value);
    }
    else if (token.identifierIsInstance) {
        return o.importExpr(token.identifier)
            .instantiate([], o.importType(token.identifier, [], [o.TypeModifier.Const]));
    }
    else {
        return o.importExpr(token.identifier);
    }
}
export function createInlineArray(values) {
    if (values.length === 0) {
        return o.importExpr(resolveIdentifier(Identifiers.EMPTY_INLINE_ARRAY));
    }
    var log2 = Math.log(values.length) / Math.log(2);
    var index = Math.ceil(log2);
    var identifierSpec = index < Identifiers.inlineArrays.length ? Identifiers.inlineArrays[index] :
        Identifiers.InlineArrayDynamic;
    var identifier = resolveIdentifier(identifierSpec);
    return o.importExpr(identifier).instantiate([
        o.literal(values.length)
    ].concat(values));
}
export function createPureProxy(fn, argCount, pureProxyProp, builder) {
    builder.fields.push(new o.ClassField(pureProxyProp.name, null));
    var pureProxyId = argCount < Identifiers.pureProxies.length ? Identifiers.pureProxies[argCount] : null;
    if (!pureProxyId) {
        throw new Error("Unsupported number of argument for pure functions: " + argCount);
    }
    builder.ctorStmts.push(o.THIS_EXPR.prop(pureProxyProp.name)
        .set(o.importExpr(resolveIdentifier(pureProxyId)).callFn([fn]))
        .toStmt());
}
export function createEnumExpression(enumType, enumValue) {
    var enumName = Object.keys(enumType.runtime).find(function (propName) { return enumType.runtime[propName] === enumValue; });
    if (!enumName) {
        throw new Error("Unknown enum value " + enumValue + " in " + enumType.name);
    }
    return o.importExpr(resolveEnumIdentifier(resolveIdentifier(enumType), enumName));
}
//# sourceMappingURL=identifier_util.js.map