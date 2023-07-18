import type { AxisConstructor } from '../../util/module';
import type { ModuleContext } from '../../util/moduleContext';
export declare function registerAxis(axisType: string, ctor: AxisConstructor): void;
export declare function getAxis(axisType: string, moduleCtx: ModuleContext): import("../chartAxis").ChartAxis;
export declare const AXIS_TYPES: {
    has(axisType: string): boolean;
    readonly axesTypes: string[];
};
export declare function registerAxisThemeTemplate(axisType: string, theme: {}): void;
export declare function getAxisThemeTemplate(axisType: string): {};
//# sourceMappingURL=axisTypes.d.ts.map