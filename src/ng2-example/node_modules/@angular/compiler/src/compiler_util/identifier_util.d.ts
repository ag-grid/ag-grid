/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CompileTokenMetadata } from '../compile_metadata';
import { IdentifierSpec } from '../identifiers';
import * as o from '../output/output_ast';
export declare function createDiTokenExpression(token: CompileTokenMetadata): o.Expression;
export declare function createInlineArray(values: o.Expression[]): o.Expression;
export declare function createPureProxy(fn: o.Expression, argCount: number, pureProxyProp: o.ReadPropExpr, builder: {
    fields: o.ClassField[];
    ctorStmts: {
        push: (stmt: o.Statement) => void;
    };
}): void;
export declare function createEnumExpression(enumType: IdentifierSpec, enumValue: any): o.Expression;
