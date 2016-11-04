/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CompileDirectiveMetadata, CompilePipeMetadata } from '../compile_metadata';
import * as o from '../output/output_ast';
import { ProviderAst } from '../template_parser/template_ast';
import { CompileElement } from './compile_element';
import { CompileView } from './compile_view';
export declare function bindDirectiveAfterContentLifecycleCallbacks(directiveMeta: CompileDirectiveMetadata, directiveInstance: o.Expression, compileElement: CompileElement): void;
export declare function bindDirectiveAfterViewLifecycleCallbacks(directiveMeta: CompileDirectiveMetadata, directiveInstance: o.Expression, compileElement: CompileElement): void;
export declare function bindInjectableDestroyLifecycleCallbacks(provider: ProviderAst, providerInstance: o.Expression, compileElement: CompileElement): void;
export declare function bindPipeDestroyLifecycleCallbacks(pipeMeta: CompilePipeMetadata, pipeInstance: o.Expression, view: CompileView): void;
