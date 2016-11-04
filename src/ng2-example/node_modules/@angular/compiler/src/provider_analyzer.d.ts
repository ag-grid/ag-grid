/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CompileDirectiveMetadata, CompileNgModuleMetadata, CompileProviderMetadata } from './compile_metadata';
import { ParseError, ParseSourceSpan } from './parse_util';
import { AttrAst, DirectiveAst, ProviderAst, ReferenceAst } from './template_parser/template_ast';
export declare class ProviderError extends ParseError {
    constructor(message: string, span: ParseSourceSpan);
}
export declare class ProviderViewContext {
    component: CompileDirectiveMetadata;
    sourceSpan: ParseSourceSpan;
    errors: ProviderError[];
    constructor(component: CompileDirectiveMetadata, sourceSpan: ParseSourceSpan);
}
export declare class ProviderElementContext {
    viewContext: ProviderViewContext;
    private _parent;
    private _isViewRoot;
    private _directiveAsts;
    private _sourceSpan;
    private _contentQueries;
    private _transformedProviders;
    private _seenProviders;
    private _allProviders;
    private _attrs;
    private _hasViewContainer;
    constructor(viewContext: ProviderViewContext, _parent: ProviderElementContext, _isViewRoot: boolean, _directiveAsts: DirectiveAst[], attrs: AttrAst[], refs: ReferenceAst[], _sourceSpan: ParseSourceSpan);
    afterElement(): void;
    transformProviders: ProviderAst[];
    transformedDirectiveAsts: DirectiveAst[];
    transformedHasViewContainer: boolean;
    private _addQueryReadsTo(token, queryReadTokens);
    private _getQueriesFor(token);
    private _getOrCreateLocalProvider(requestingProviderType, token, eager);
    private _getLocalDependency(requestingProviderType, dep, eager?);
    private _getDependency(requestingProviderType, dep, eager?);
}
export declare class NgModuleProviderAnalyzer {
    private _transformedProviders;
    private _seenProviders;
    private _allProviders;
    private _errors;
    constructor(ngModule: CompileNgModuleMetadata, extraProviders: CompileProviderMetadata[], sourceSpan: ParseSourceSpan);
    parse(): ProviderAst[];
    private _getOrCreateLocalProvider(token, eager);
    private _getDependency(dep, eager, requestorSourceSpan);
}
