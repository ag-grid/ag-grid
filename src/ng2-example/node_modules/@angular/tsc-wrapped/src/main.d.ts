import * as ts from 'typescript';
import NgOptions from './options';
import { CliOptions } from './cli_options';
export declare type CodegenExtension = (ngOptions: NgOptions, cliOptions: CliOptions, program: ts.Program, host: ts.CompilerHost) => Promise<void>;
export declare function main(project: string, cliOptions: CliOptions, codegen?: CodegenExtension): Promise<any>;
