/**
 * Interface that defines how import statements should be generated.
 */
export declare abstract class ImportGenerator {
    static parseAssetUrl(url: string): AssetUrl;
    abstract getImportPath(moduleUrlStr: string, importedUrlStr: string): string;
}
export declare class AssetUrl {
    packageName: string;
    firstLevelDir: string;
    modulePath: string;
    static parse(url: string, allowNonMatching?: boolean): AssetUrl;
    constructor(packageName: string, firstLevelDir: string, modulePath: string);
}
