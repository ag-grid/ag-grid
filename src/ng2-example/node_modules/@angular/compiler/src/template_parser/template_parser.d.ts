/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { OpaqueToken, SchemaMetadata } from '@angular/core';
import { CompileDirectiveMetadata, CompilePipeMetadata } from '../compile_metadata';
import { Parser } from '../expression_parser/parser';
import { I18NHtmlParser } from '../i18n/i18n_html_parser';
import { ParseTreeResult } from '../ml_parser/html_parser';
import { InterpolationConfig } from '../ml_parser/interpolation_config';
import { ParseError, ParseErrorLevel, ParseSourceSpan } from '../parse_util';
import { Console } from '../private_import_core';
import { ElementSchemaRegistry } from '../schema/element_schema_registry';
import { TemplateAst, TemplateAstVisitor } from './template_ast';
/**
 * Provides an array of {@link TemplateAstVisitor}s which will be used to transform
 * parsed templates before compilation is invoked, allowing custom expression syntax
 * and other advanced transformations.
 *
 * This is currently an internal-only feature and not meant for general use.
 */
export declare const TEMPLATE_TRANSFORMS: OpaqueToken;
export declare class TemplateParseError extends ParseError {
    constructor(message: string, span: ParseSourceSpan, level: ParseErrorLevel);
}
export declare class TemplateParseResult {
    templateAst: TemplateAst[];
    errors: ParseError[];
    constructor(templateAst?: TemplateAst[], errors?: ParseError[]);
}
export declare class TemplateParser {
    private _exprParser;
    private _schemaRegistry;
    private _htmlParser;
    private _console;
    transforms: TemplateAstVisitor[];
    constructor(_exprParser: Parser, _schemaRegistry: ElementSchemaRegistry, _htmlParser: I18NHtmlParser, _console: Console, transforms: TemplateAstVisitor[]);
    parse(component: CompileDirectiveMetadata, template: string, directives: CompileDirectiveMetadata[], pipes: CompilePipeMetadata[], schemas: SchemaMetadata[], templateUrl: string): TemplateAst[];
    tryParse(component: CompileDirectiveMetadata, template: string, directives: CompileDirectiveMetadata[], pipes: CompilePipeMetadata[], schemas: SchemaMetadata[], templateUrl: string): TemplateParseResult;
    tryParseHtml(htmlAstWithErrors: ParseTreeResult, component: CompileDirectiveMetadata, template: string, directives: CompileDirectiveMetadata[], pipes: CompilePipeMetadata[], schemas: SchemaMetadata[], templateUrl: string): TemplateParseResult;
    expandHtml(htmlAstWithErrors: ParseTreeResult, forced?: boolean): ParseTreeResult;
    getInterpolationConfig(component: CompileDirectiveMetadata): InterpolationConfig;
}
export declare function splitClasses(classAttrValue: string): string[];
