/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AngularCompilerOptions, ModuleMetadata } from '@angular/tsc-wrapped';
import * as ts from 'typescript';
import { ReflectorHost, ReflectorHostContext } from './reflector_host';
/**
 * This version of the reflector host expects that the program will be compiled
 * and executed with a "path mapped" directory structure, where generated files
 * are in a parallel tree with the sources, and imported using a `./` relative
 * import. This requires using TS `rootDirs` option and also teaching the module
 * loader what to do.
 */
export declare class PathMappedReflectorHost extends ReflectorHost {
    constructor(program: ts.Program, compilerHost: ts.CompilerHost, options: AngularCompilerOptions, context?: ReflectorHostContext);
    getCanonicalFileName(fileName: string): string;
    protected resolve(m: string, containingFile: string): string;
    /**
     * We want a moduleId that will appear in import statements in the generated code.
     * These need to be in a form that system.js can load, so absolute file paths don't work.
     * Relativize the paths by checking candidate prefixes of the absolute path, to see if
     * they are resolvable by the moduleResolution strategy from the CompilerHost.
     */
    getImportPath(containingFile: string, importedFile: string): string;
    getMetadataFor(filePath: string): ModuleMetadata;
}
