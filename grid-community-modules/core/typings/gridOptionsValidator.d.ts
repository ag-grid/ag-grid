import { RowGroupingDisplayType, TreeDataDisplayType } from './entities/gridOptions';
export declare function logDeprecation<T extends {}>(version: string, oldProp: keyof T, newProp?: keyof T, message?: string): void;
export declare class GridOptionsValidator {
    private readonly gridOptions;
    private readonly gridOptionsService;
    private pickOneWarning;
    init(): void;
    private checkColumnDefProperties;
    private checkColumnDefViolations;
    private checkGridOptionsProperties;
    private checkProperties;
    private deprecatedProperties;
    private checkForDeprecated;
    private checkForViolations;
    private treeDataViolations;
}
export declare function matchesGroupDisplayType(toMatch: RowGroupingDisplayType, supplied?: string): boolean;
export declare function matchesTreeDataDisplayType(toMatch: TreeDataDisplayType, supplied?: string): boolean;
