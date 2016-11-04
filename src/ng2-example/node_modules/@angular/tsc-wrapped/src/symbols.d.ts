import * as ts from 'typescript';
import { MetadataValue } from './schema';
export declare class Symbols {
    private sourceFile;
    private _symbols;
    constructor(sourceFile: ts.SourceFile);
    resolve(name: string): MetadataValue | undefined;
    define(name: string, value: MetadataValue): void;
    has(name: string): boolean;
    private readonly symbols;
    private buildImports();
}
