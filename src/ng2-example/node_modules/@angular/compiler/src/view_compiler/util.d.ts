/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CompileDirectiveMetadata, CompileTokenMetadata } from '../compile_metadata';
import * as o from '../output/output_ast';
import { CompileView } from './compile_view';
export declare function getPropertyInView(property: o.Expression, callingView: CompileView, definedView: CompileView): o.Expression;
export declare function injectFromViewParentInjector(token: CompileTokenMetadata, optional: boolean): o.Expression;
export declare function getViewFactoryName(component: CompileDirectiveMetadata, embeddedTemplateIndex: number): string;
export declare function createFlatArray(expressions: o.Expression[]): o.Expression;
