/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CompileQueryMetadata } from '../compile_metadata';
import * as o from '../output/output_ast';
import { CompileMethod } from './compile_method';
import { CompileView } from './compile_view';
export declare class CompileQuery {
    meta: CompileQueryMetadata;
    queryList: o.Expression;
    ownerDirectiveExpression: o.Expression;
    view: CompileView;
    private _values;
    constructor(meta: CompileQueryMetadata, queryList: o.Expression, ownerDirectiveExpression: o.Expression, view: CompileView);
    addValue(value: o.Expression, view: CompileView): void;
    private _isStatic();
    afterChildren(targetStaticMethod: CompileMethod, targetDynamicMethod: CompileMethod): void;
}
export declare function createQueryList(query: CompileQueryMetadata, directiveInstance: o.Expression, propertyName: string, compileView: CompileView): o.Expression;
export declare function addQueryToTokenMap(map: Map<any, CompileQuery[]>, query: CompileQuery): void;
