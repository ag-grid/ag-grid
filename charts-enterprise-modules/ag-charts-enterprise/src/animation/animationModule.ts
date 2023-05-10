import { _ModuleSupport } from 'ag-charts-community';
import { Animation } from './animation';

export const AnimationModule: _ModuleSupport.Module = {
    type: 'root',
    optionsKey: 'animation',
    packageType: 'enterprise',
    chartTypes: ['cartesian'],
    instanceConstructor: Animation,
};

export interface AgAnimationOptions {
    /** Set to true to enable the animation module. */
    enabled?: boolean;
}
