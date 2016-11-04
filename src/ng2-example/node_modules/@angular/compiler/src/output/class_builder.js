/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from './output_ast';
/**
 * Create a new class stmts based on the given data.
 */
export function createClassStmt(config) {
    var parentArgs = config.parentArgs || [];
    var superCtorStmts = config.parent ? [o.SUPER_EXPR.callFn(parentArgs).toStmt()] : [];
    var builder = concatClassBuilderParts(Array.isArray(config.builders) ? config.builders : [config.builders]);
    var ctor = new o.ClassMethod(null, config.ctorParams || [], superCtorStmts.concat(builder.ctorStmts));
    return new o.ClassStmt(config.name, config.parent, builder.fields, builder.getters, ctor, builder.methods, config.modifiers || []);
}
function concatClassBuilderParts(builders) {
    return {
        fields: (_a = []).concat.apply(_a, builders.map(function (builder) { return builder.fields || []; })),
        methods: (_b = []).concat.apply(_b, builders.map(function (builder) { return builder.methods || []; })),
        getters: (_c = []).concat.apply(_c, builders.map(function (builder) { return builder.getters || []; })),
        ctorStmts: (_d = []).concat.apply(_d, builders.map(function (builder) { return builder.ctorStmts || []; })),
    };
    var _a, _b, _c, _d;
}
//# sourceMappingURL=class_builder.js.map