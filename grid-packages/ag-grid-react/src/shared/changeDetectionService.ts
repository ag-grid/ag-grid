import { _ } from "ag-grid-community";

export enum ChangeDetectionStrategyType {
    IdentityCheck = 'IdentityCheck',
/** @deprecated IdentityCheck will be used instead */
    DeepValueCheck = 'DeepValueCheck',
    NoCheck = 'NoCheck'
}

export interface ChangeDetectionStrategy {
    areEqual(a: any, b: any): boolean;
}

class SimpleFunctionalStrategy implements ChangeDetectionStrategy {
    private strategy: (a: any, b: any) => boolean;

    constructor(strategy: (a: any, b: any) => boolean) {
        this.strategy = strategy;
    }

    areEqual(a: any, b: any): boolean {
        return this.strategy(a, b);
    }
}

export class ChangeDetectionService {
    private strategyMap: { [key in ChangeDetectionStrategyType]: ChangeDetectionStrategy } = {
        [ChangeDetectionStrategyType.DeepValueCheck]: new SimpleFunctionalStrategy((a, b) => a === b),
        [ChangeDetectionStrategyType.IdentityCheck]: new SimpleFunctionalStrategy((a, b) => a === b),
        [ChangeDetectionStrategyType.NoCheck]: new SimpleFunctionalStrategy((a, b) => false)
    };

    public getStrategy(changeDetectionStrategy: ChangeDetectionStrategyType): ChangeDetectionStrategy {
        if (changeDetectionStrategy === ChangeDetectionStrategyType.DeepValueCheck) {
            _.doOnce(() => console.warn('AG Grid: Since v29 ChangeDetectionStrategyType.DeepValueCheck has been deprecated. IdentityCheck will be used instead. See https://ag-grid.com/react-data-grid/react-hooks/'), 'DeepValueCheck_Deprecation')
        }
        return this.strategyMap[changeDetectionStrategy];
    }
}