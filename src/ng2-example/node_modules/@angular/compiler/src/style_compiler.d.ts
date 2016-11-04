import { CompileDirectiveMetadata, CompileIdentifierMetadata, CompileStylesheetMetadata } from './compile_metadata';
import * as o from './output/output_ast';
import { UrlResolver } from './url_resolver';
export declare class StylesCompileDependency {
    moduleUrl: string;
    isShimmed: boolean;
    valuePlaceholder: CompileIdentifierMetadata;
    constructor(moduleUrl: string, isShimmed: boolean, valuePlaceholder: CompileIdentifierMetadata);
}
export declare class StylesCompileResult {
    componentStylesheet: CompiledStylesheet;
    externalStylesheets: CompiledStylesheet[];
    constructor(componentStylesheet: CompiledStylesheet, externalStylesheets: CompiledStylesheet[]);
}
export declare class CompiledStylesheet {
    statements: o.Statement[];
    stylesVar: string;
    dependencies: StylesCompileDependency[];
    isShimmed: boolean;
    meta: CompileStylesheetMetadata;
    constructor(statements: o.Statement[], stylesVar: string, dependencies: StylesCompileDependency[], isShimmed: boolean, meta: CompileStylesheetMetadata);
}
export declare class StyleCompiler {
    private _urlResolver;
    private _shadowCss;
    constructor(_urlResolver: UrlResolver);
    compileComponent(comp: CompileDirectiveMetadata): StylesCompileResult;
    private _compileStyles(comp, stylesheet, isComponentStylesheet);
    private _shimIfNeeded(style, shim);
}
