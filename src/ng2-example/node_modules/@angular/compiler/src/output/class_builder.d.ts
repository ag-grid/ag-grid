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
export declare function createClassStmt(config: {
    name: string;
    parent?: o.Expression;
    parentArgs?: o.Expression[];
    ctorParams?: o.FnParam[];
    builders: ClassBuilderPart | ClassBuilderPart[];
    modifiers?: o.StmtModifier[];
}): o.ClassStmt;
/**
 * Collects data for a generated class.
 */
export interface ClassBuilderPart {
    fields?: o.ClassField[];
    methods?: o.ClassMethod[];
    getters?: o.ClassGetter[];
    ctorStmts?: o.Statement[];
}
/**
 * Collects data for a generated class.
 */
export interface ClassBuilder {
    fields: o.ClassField[];
    methods: o.ClassMethod[];
    getters: o.ClassGetter[];
    ctorStmts: o.Statement[];
}
