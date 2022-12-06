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
        return this.strategyMap[changeDetectionStrategy];
    }
}