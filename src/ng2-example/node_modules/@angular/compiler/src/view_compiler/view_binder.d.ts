/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementSchemaRegistry } from '../schema/element_schema_registry';
import { TemplateAst } from '../template_parser/template_ast';
import { CompileView } from './compile_view';
export declare function bindView(view: CompileView, parsedTemplate: TemplateAst[], schemaRegistry: ElementSchemaRegistry): void;
