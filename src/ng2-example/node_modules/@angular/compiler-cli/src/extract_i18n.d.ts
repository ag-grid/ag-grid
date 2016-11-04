import 'reflect-metadata';
import * as compiler from '@angular/compiler';
import * as ts from 'typescript';
import * as tsc from '@angular/tsc-wrapped';
import { CompileMetadataResolver, DirectiveNormalizer } from './private_import_compiler';
import { ReflectorHost, ReflectorHostContext } from './reflector_host';
import { StaticReflector } from './static_reflector';
export declare class Extractor {
    private program;
    host: ts.CompilerHost;
    private staticReflector;
    private messageBundle;
    private reflectorHost;
    private metadataResolver;
    private directiveNormalizer;
    private compiler;
    constructor(program: ts.Program, host: ts.CompilerHost, staticReflector: StaticReflector, messageBundle: compiler.MessageBundle, reflectorHost: ReflectorHost, metadataResolver: CompileMetadataResolver, directiveNormalizer: DirectiveNormalizer, compiler: compiler.OfflineCompiler);
    private readFileMetadata(absSourcePath);
    extract(): Promise<compiler.MessageBundle>;
    static create(options: tsc.AngularCompilerOptions, translationsFormat: string, program: ts.Program, compilerHost: ts.CompilerHost, htmlParser: compiler.I18NHtmlParser, reflectorHostContext?: ReflectorHostContext): Extractor;
}
