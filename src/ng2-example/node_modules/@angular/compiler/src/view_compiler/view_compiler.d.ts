import { AnimationEntryCompileResult } from '../animation/animation_compiler';
import { CompileDirectiveMetadata, CompilePipeMetadata } from '../compile_metadata';
import { CompilerConfig } from '../config';
import * as o from '../output/output_ast';
import { ElementSchemaRegistry } from '../schema/element_schema_registry';
import { TemplateAst } from '../template_parser/template_ast';
import { ComponentFactoryDependency, DirectiveWrapperDependency, ViewFactoryDependency } from './deps';
export { ComponentFactoryDependency, DirectiveWrapperDependency, ViewFactoryDependency } from './deps';
export declare class ViewCompileResult {
    statements: o.Statement[];
    viewFactoryVar: string;
    dependencies: Array<ViewFactoryDependency | ComponentFactoryDependency | DirectiveWrapperDependency>;
    constructor(statements: o.Statement[], viewFactoryVar: string, dependencies: Array<ViewFactoryDependency | ComponentFactoryDependency | DirectiveWrapperDependency>);
}
export declare class ViewCompiler {
    private _genConfig;
    private _schemaRegistry;
    constructor(_genConfig: CompilerConfig, _schemaRegistry: ElementSchemaRegistry);
    compileComponent(component: CompileDirectiveMetadata, template: TemplateAst[], styles: o.Expression, pipes: CompilePipeMetadata[], compiledAnimations: AnimationEntryCompileResult[]): ViewCompileResult;
}
