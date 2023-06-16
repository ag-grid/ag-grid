import { Scale } from '../scale/scale';
import { Axis, TickInterval } from '../axis';
import { ChartAxisDirection } from './chartAxisDirection';
import { AgCartesianAxisPosition, AgCartesianAxisType } from './agChartOptions';
import { AxisLayout } from './layout/layoutService';
import { AxisModule, ModuleContext, ModuleInstance } from '../util/module';
interface BoundSeries {
    type: string;
    getDomain(direction: ChartAxisDirection): any[];
    isEnabled(): boolean;
    getKeys(direction: ChartAxisDirection): string[];
    getNames(direction: ChartAxisDirection): (string | undefined)[];
    visible: boolean;
    getBandScalePadding?(): {
        inner: number;
        outer: number;
    };
}
export declare class ChartAxis<S extends Scale<D, number, TickInterval<S>> = Scale<any, number, any>, D = any> extends Axis<S, D> {
    keys: string[];
    boundSeries: BoundSeries[];
    linkedTo?: ChartAxis;
    includeInvisibleDomains: boolean;
    protected readonly modules: Record<string, {
        instance: ModuleInstance;
    }>;
    get type(): AgCartesianAxisType;
    get direction(): ChartAxisDirection;
    protected useCalculatedTickCount(): boolean;
    protected constructor(moduleCtx: ModuleContext, scale: S);
    position: AgCartesianAxisPosition;
    update(primaryTickCount?: number): number | undefined;
    protected updateDirection(): void;
    protected calculateDomain(): void;
    normaliseDataDomain(d: D[]): D[];
    isAnySeriesActive(): boolean;
    getLayoutState(): AxisLayout;
    private axisContext?;
    addModule(module: AxisModule): void;
    removeModule(module: AxisModule): void;
    isModuleEnabled(module: AxisModule): boolean;
    destroy(): void;
    protected getTitleFormatterParams(): {
        direction: ChartAxisDirection;
        boundSeries: import("./agChartOptions").AgAxisBoundSeries[];
        defaultValue: string | undefined;
    };
}
export {};
//# sourceMappingURL=chartAxis.d.ts.map