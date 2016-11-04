import * as ts from 'typescript';
import { ModuleMetadata } from './schema';
/**
 * Collect decorator metadata from a TypeScript module.
 */
export declare class MetadataCollector {
    constructor();
    /**
     * Returns a JSON.stringify friendly form describing the decorators of the exported classes from
     * the source file that is expected to correspond to a module.
     */
    getMetadata(sourceFile: ts.SourceFile, strict?: boolean): ModuleMetadata;
}
