import type { ModuleContext } from '../../module/moduleContext';
import type { ChartAxis } from '../chartAxis';
export declare function registerAxis(axisType: string, ctor: new (moduleContext: ModuleContext) => ChartAxis): void;
export declare function getAxis(axisType: string, moduleCtx: ModuleContext): ChartAxis;
export declare const AXIS_TYPES: {
    has(axisType: string): boolean;
    readonly axesTypes: string[];
};
export declare function registerAxisThemeTemplate(axisType: string, theme: {}): void;
export declare function getAxisThemeTemplate(axisType: string): {};
