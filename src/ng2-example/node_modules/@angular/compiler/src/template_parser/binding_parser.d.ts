/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { SecurityContext } from '@angular/core';
import { CompileDirectiveMetadata, CompilePipeMetadata } from '../compile_metadata';
import { ASTWithSource, BindingPipe, RecursiveAstVisitor } from '../expression_parser/ast';
import { Parser } from '../expression_parser/parser';
import { InterpolationConfig } from '../ml_parser/interpolation_config';
import { ParseError, ParseSourceSpan } from '../parse_util';
import { ElementSchemaRegistry } from '../schema/element_schema_registry';
import { BoundElementPropertyAst, BoundEventAst, VariableAst } from './template_ast';
export declare enum BoundPropertyType {
    DEFAULT = 0,
    LITERAL_ATTR = 1,
    ANIMATION = 2,
}
/**
 * Represents a parsed property.
 */
export declare class BoundProperty {
    name: string;
    expression: ASTWithSource;
    type: BoundPropertyType;
    sourceSpan: ParseSourceSpan;
    constructor(name: string, expression: ASTWithSource, type: BoundPropertyType, sourceSpan: ParseSourceSpan);
    isLiteral: boolean;
    isAnimation: boolean;
}
/**
 * Parses bindings in templates and in the directive host area.
 */
export declare class BindingParser {
    private _exprParser;
    private _interpolationConfig;
    private _schemaRegistry;
    private _targetErrors;
    pipesByName: Map<string, CompilePipeMetadata>;
    constructor(_exprParser: Parser, _interpolationConfig: InterpolationConfig, _schemaRegistry: ElementSchemaRegistry, pipes: CompilePipeMetadata[], _targetErrors: ParseError[]);
    createDirectiveHostPropertyAsts(dirMeta: CompileDirectiveMetadata, sourceSpan: ParseSourceSpan): BoundElementPropertyAst[];
    createDirectiveHostEventAsts(dirMeta: CompileDirectiveMetadata, sourceSpan: ParseSourceSpan): BoundEventAst[];
    parseInterpolation(value: string, sourceSpan: ParseSourceSpan): ASTWithSource;
    parseInlineTemplateBinding(name: string, value: string, sourceSpan: ParseSourceSpan, targetMatchableAttrs: string[][], targetProps: BoundProperty[], targetVars: VariableAst[]): void;
    private _parseTemplateBindings(value, sourceSpan);
    parseLiteralAttr(name: string, value: string, sourceSpan: ParseSourceSpan, targetMatchableAttrs: string[][], targetProps: BoundProperty[]): void;
    parsePropertyBinding(name: string, expression: string, isHost: boolean, sourceSpan: ParseSourceSpan, targetMatchableAttrs: string[][], targetProps: BoundProperty[]): void;
    parsePropertyInterpolation(name: string, value: string, sourceSpan: ParseSourceSpan, targetMatchableAttrs: string[][], targetProps: BoundProperty[]): boolean;
    private _parsePropertyAst(name, ast, sourceSpan, targetMatchableAttrs, targetProps);
    private _parseAnimation(name, expression, sourceSpan, targetMatchableAttrs, targetProps);
    private _parseBinding(value, isHostBinding, sourceSpan);
    createElementPropertyAst(elementSelector: string, boundProp: BoundProperty): BoundElementPropertyAst;
    parseEvent(name: string, expression: string, sourceSpan: ParseSourceSpan, targetMatchableAttrs: string[][], targetEvents: BoundEventAst[]): void;
    private _parseAnimationEvent(name, expression, sourceSpan, targetEvents);
    private _parseEvent(name, expression, sourceSpan, targetMatchableAttrs, targetEvents);
    private _parseAction(value, sourceSpan);
    private _reportError(message, sourceSpan, level?);
    private _reportExpressionParserErrors(errors, sourceSpan);
    private _checkPipes(ast, sourceSpan);
    /**
     * @param propName the name of the property / attribute
     * @param sourceSpan
     * @param isAttr true when binding to an attribute
     * @private
     */
    private _validatePropertyOrAttributeName(propName, sourceSpan, isAttr);
}
export declare class PipeCollector extends RecursiveAstVisitor {
    pipes: Set<string>;
    visitPipe(ast: BindingPipe, context: any): any;
}
export declare function calcPossibleSecurityContexts(registry: ElementSchemaRegistry, selector: string, propName: string, isAttribute: boolean): SecurityContext[];
