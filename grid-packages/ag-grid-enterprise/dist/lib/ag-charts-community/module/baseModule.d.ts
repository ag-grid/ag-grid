import type { JsonApplyParams } from '../util/json';
export interface ModuleInstance {
    destroy(): void;
}
export interface BaseModule {
    optionsKey: string;
    packageType: 'community' | 'enterprise';
    chartTypes: ('cartesian' | 'polar' | 'hierarchy')[];
    identifier?: string;
    optionConstructors?: JsonApplyParams['constructors'];
}
