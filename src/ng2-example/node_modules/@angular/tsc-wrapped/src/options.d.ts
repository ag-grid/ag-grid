import * as ts from 'typescript';
interface Options extends ts.CompilerOptions {
    genDir: string;
    basePath: string;
    skipMetadataEmit: boolean;
    strictMetadataEmit: boolean;
    skipTemplateCodegen: boolean;
    generateCodeForLibraries?: boolean;
    trace: boolean;
    debug?: boolean;
}
export default Options;
