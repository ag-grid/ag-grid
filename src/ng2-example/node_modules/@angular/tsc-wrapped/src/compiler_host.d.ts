import * as ts from 'typescript';
import NgOptions from './options';
/**
 * Implementation of CompilerHost that forwards all methods to another instance.
 * Useful for partial implementations to override only methods they care about.
 */
export declare abstract class DelegatingHost implements ts.CompilerHost {
    protected delegate: ts.CompilerHost;
    constructor(delegate: ts.CompilerHost);
    getSourceFile: (fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) => ts.SourceFile;
    getCancellationToken: () => ts.CancellationToken;
    getDefaultLibFileName: (options: ts.CompilerOptions) => string;
    getDefaultLibLocation: () => string;
    writeFile: ts.WriteFileCallback;
    getCurrentDirectory: () => string;
    getDirectories: (path: string) => string[];
    getCanonicalFileName: (fileName: string) => string;
    useCaseSensitiveFileNames: () => boolean;
    getNewLine: () => string;
    fileExists: (fileName: string) => boolean;
    readFile: (fileName: string) => string;
    trace: (s: string) => void;
    directoryExists: (directoryName: string) => boolean;
}
export declare class TsickleHost extends DelegatingHost {
    private program;
    diagnostics: ts.Diagnostic[];
    private TSICKLE_SUPPORT;
    constructor(delegate: ts.CompilerHost, program: ts.Program);
    getSourceFile: (fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) => ts.SourceFile;
}
export declare class MetadataWriterHost extends DelegatingHost {
    private program;
    private ngOptions;
    private metadataCollector;
    constructor(delegate: ts.CompilerHost, program: ts.Program, ngOptions: NgOptions);
    private writeMetadata(emitFilePath, sourceFile);
    writeFile: ts.WriteFileCallback;
}
