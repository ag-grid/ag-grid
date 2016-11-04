/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AnimationEntryCompileResult } from '../animation/animation_compiler';
import { CompileDirectiveMetadata, CompilePipeMetadata } from '../compile_metadata';
import { NameResolver } from '../compiler_util/expression_converter';
import { CompilerConfig } from '../config';
import * as o from '../output/output_ast';
import { ViewType } from '../private_import_core';
import { CompileElement, CompileNode } from './compile_element';
import { CompileMethod } from './compile_method';
import { CompilePipe } from './compile_pipe';
import { CompileQuery } from './compile_query';
export declare class CompileView implements NameResolver {
    component: CompileDirectiveMetadata;
    genConfig: CompilerConfig;
    pipeMetas: CompilePipeMetadata[];
    styles: o.Expression;
    animations: AnimationEntryCompileResult[];
    viewIndex: number;
    declarationElement: CompileElement;
    templateVariableBindings: string[][];
    viewType: ViewType;
    viewQueries: Map<any, CompileQuery[]>;
    nodes: CompileNode[];
    rootNodesOrAppElements: o.Expression[];
    createMethod: CompileMethod;
    animationBindingsMethod: CompileMethod;
    injectorGetMethod: CompileMethod;
    updateContentQueriesMethod: CompileMethod;
    dirtyParentQueriesMethod: CompileMethod;
    updateViewQueriesMethod: CompileMethod;
    detectChangesInInputsMethod: CompileMethod;
    detectChangesRenderPropertiesMethod: CompileMethod;
    afterContentLifecycleCallbacksMethod: CompileMethod;
    afterViewLifecycleCallbacksMethod: CompileMethod;
    destroyMethod: CompileMethod;
    detachMethod: CompileMethod;
    methods: o.ClassMethod[];
    ctorStmts: o.Statement[];
    fields: o.ClassField[];
    getters: o.ClassGetter[];
    disposables: o.Expression[];
    subscriptions: o.Expression[];
    componentView: CompileView;
    purePipes: Map<string, CompilePipe>;
    pipes: CompilePipe[];
    locals: Map<string, o.Expression>;
    className: string;
    classType: o.Type;
    viewFactory: o.ReadVarExpr;
    literalArrayCount: number;
    literalMapCount: number;
    pipeCount: number;
    componentContext: o.Expression;
    constructor(component: CompileDirectiveMetadata, genConfig: CompilerConfig, pipeMetas: CompilePipeMetadata[], styles: o.Expression, animations: AnimationEntryCompileResult[], viewIndex: number, declarationElement: CompileElement, templateVariableBindings: string[][]);
    callPipe(name: string, input: o.Expression, args: o.Expression[]): o.Expression;
    getLocal(name: string): o.Expression;
    afterNodes(): void;
}
