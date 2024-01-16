import type { AxisConstructor } from '../../module/coreModules';
import type { ModuleContext } from '../../module/moduleContext';
export declare function registerAxis(axisType: string, ctor: AxisConstructor): void;
export declare function getAxis(axisType: string, moduleCtx: ModuleContext): import("../chartAxis").ChartAxis;
export declare const AXIS_TYPES: {
    has(axisType: string): boolean;
    readonly axesTypes: string[];
};
export declare function registerAxisThemeTemplate(axisType: string, theme: {}): void;
export declare function getAxisThemeTemplate(axisType: string): {};
