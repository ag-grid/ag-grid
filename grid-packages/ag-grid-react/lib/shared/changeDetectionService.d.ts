// ag-grid-react v27.1.0
export declare enum ChangeDetectionStrategyType {
    IdentityCheck = "IdentityCheck",
    DeepValueCheck = "DeepValueCheck",
    NoCheck = "NoCheck"
}
export interface ChangeDetectionStrategy {
    areEqual(a: any, b: any): boolean;
}
export declare class ChangeDetectionService {
    private strategyMap;
    getStrategy(changeDetectionStrategy: ChangeDetectionStrategyType): ChangeDetectionStrategy;
}
