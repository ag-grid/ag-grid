import { CompileNgModuleMetadata, StaticSymbol } from './compile_metadata';
import { DirectiveNormalizer } from './directive_normalizer';
import { DirectiveWrapperCompiler } from './directive_wrapper_compiler';
import { CompileMetadataResolver } from './metadata_resolver';
import { NgModuleCompiler } from './ng_module_compiler';
import { OutputEmitter } from './output/abstract_emitter';
import { StyleCompiler } from './style_compiler';
import { TemplateParser } from './template_parser/template_parser';
import { ViewCompiler } from './view_compiler/view_compiler';
export declare class SourceModule {
    fileUrl: string;
    moduleUrl: string;
    source: string;
    constructor(fileUrl: string, moduleUrl: string, source: string);
}
export declare function analyzeNgModules(programStaticSymbols: StaticSymbol[], options: {
    transitiveModules: boolean;
}, metadataResolver: CompileMetadataResolver): {
    ngModuleByPipeOrDirective: Map<StaticSymbol, CompileNgModuleMetadata>;
    files: Array<{
        srcUrl: string;
        directives: StaticSymbol[];
        ngModules: StaticSymbol[];
    }>;
};
export declare class OfflineCompiler {
    private _metadataResolver;
    private _directiveNormalizer;
    private _templateParser;
    private _styleCompiler;
    private _viewCompiler;
    private _dirWrapperCompiler;
    private _ngModuleCompiler;
    private _outputEmitter;
    private _localeId;
    private _translationFormat;
    private _animationParser;
    private _animationCompiler;
    constructor(_metadataResolver: CompileMetadataResolver, _directiveNormalizer: DirectiveNormalizer, _templateParser: TemplateParser, _styleCompiler: StyleCompiler, _viewCompiler: ViewCompiler, _dirWrapperCompiler: DirectiveWrapperCompiler, _ngModuleCompiler: NgModuleCompiler, _outputEmitter: OutputEmitter, _localeId: string, _translationFormat: string);
    clearCache(): void;
    compileModules(staticSymbols: StaticSymbol[], options: {
        transitiveModules: boolean;
    }): Promise<SourceModule[]>;
    private _compileSrcFile(srcFileUrl, ngModuleByPipeOrDirective, directives, ngModules);
    private _compileModule(ngModuleType, targetStatements);
    private _compileDirectiveWrapper(directiveType, targetStatements);
    private _compileComponentFactory(compMeta, fileSuffix, targetStatements);
    private _compileComponent(compMeta, directives, pipes, schemas, componentStyles, fileSuffix, targetStatements);
    private _codgenStyles(fileUrl, stylesCompileResult, fileSuffix);
    private _codegenSourceModule(fileUrl, moduleUrl, statements, exportedVars);
}
