/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CompilePipeMetadata } from '../compile_metadata';
import * as o from '../output/output_ast';
import { CompileView } from './compile_view';
export declare class CompilePipe {
    view: CompileView;
    meta: CompilePipeMetadata;
    static call(view: CompileView, name: string, args: o.Expression[]): o.Expression;
    instance: o.ReadPropExpr;
    private _purePipeProxyCount;
    constructor(view: CompileView, meta: CompilePipeMetadata);
    pure: boolean;
    private _call(callingView, args);
}
