/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AngularCompilerOptions, MetadataCollector, ModuleMetadata } from '@angular/tsc-wrapped';
import * as ts from 'typescript';
import { ImportGenerator } from './private_import_compiler';
import { StaticReflectorHost, StaticSymbol } from './static_reflector';
export interface ReflectorHostContext {
    fileExists(fileName: string): boolean;
    directoryExists(directoryName: string): boolean;
    readFile(fileName: string): string;
    assumeFileExists(fileName: string): void;
}
export declare class ReflectorHost implements StaticReflectorHost, ImportGenerator {
    protected program: ts.Program;
    protected compilerHost: ts.CompilerHost;
    protected options: AngularCompilerOptions;
    protected metadataCollector: MetadataCollector;
    protected context: ReflectorHostContext;
    private isGenDirChildOfRootDir;
    protected basePath: string;
    private genDir;
    constructor(program: ts.Program, compilerHost: ts.CompilerHost, options: AngularCompilerOptions, context?: ReflectorHostContext);
    angularImportLocations(): {
        coreDecorators: string;
        diDecorators: string;
        diMetadata: string;
        diOpaqueToken: string;
        animationMetadata: string;
        provider: string;
    };
    getCanonicalFileName(fileName: string): string;
    protected resolve(m: string, containingFile: string): string;
    protected normalizeAssetUrl(url: string): string;
    protected resolveAssetUrl(url: string, containingFile: string): string;
    /**
     * We want a moduleId that will appear in import statements in the generated code.
     * These need to be in a form that system.js can load, so absolute file paths don't work.
     *
     * The `containingFile` is always in the `genDir`, where as the `importedFile` can be in
     * `genDir`, `node_module` or `basePath`.  The `importedFile` is either a generated file or
     * existing file.
     *
     *               | genDir   | node_module |  rootDir
     * --------------+----------+-------------+----------
     * generated     | relative |   relative  |   n/a
     * existing file |   n/a    |   absolute  |  relative(*)
     *
     * NOTE: (*) the relative path is computed depending on `isGenDirChildOfRootDir`.
     */
    getImportPath(containingFile: string, importedFile: string): string;
    private dotRelative(from, to);
    /**
     * Moves the path into `genDir` folder while preserving the `node_modules` directory.
     */
    private rewriteGenDirPath(filepath);
    findDeclaration(module: string, symbolName: string, containingFile: string, containingModule?: string): StaticSymbol;
    private typeCache;
    private resolverCache;
    /**
     * getStaticSymbol produces a Type whose metadata is known but whose implementation is not loaded.
     * All types passed to the StaticResolver should be pseudo-types returned by this method.
     *
     * @param declarationFile the absolute path of the file where the symbol is declared
     * @param name the name of the type.
     */
    getStaticSymbol(declarationFile: string, name: string, members?: string[]): StaticSymbol;
    getMetadataFor(filePath: string): ModuleMetadata;
    readMetadata(filePath: string): any;
    private getResolverMetadata(filePath);
    protected resolveExportedSymbol(filePath: string, symbolName: string): StaticSymbol;
}
export declare class NodeReflectorHostContext implements ReflectorHostContext {
    private host;
    constructor(host: ts.CompilerHost);
    private assumedExists;
    fileExists(fileName: string): boolean;
    directoryExists(directoryName: string): boolean;
    readFile(fileName: string): string;
    assumeFileExists(fileName: string): void;
}
