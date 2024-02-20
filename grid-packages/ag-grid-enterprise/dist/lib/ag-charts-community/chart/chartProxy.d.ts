import type { AgChartInstance } from '../options/chart/chartBuilderOptions';
import type { Chart } from './chart';
export interface AgChartProxy extends AgChartInstance {
    chart: AgChartInstance;
}
/**
 * Proxy class, to allow library users to keep a stable reference to their chart, even if we need
 * to switch concrete class (e.g. when switching between CartesianChart vs. PolarChart).
 */
export declare class AgChartInstanceProxy implements AgChartProxy {
    static chartInstances: WeakMap<Chart, AgChartInstanceProxy>;
    static isInstance(x: any): x is AgChartInstanceProxy;
    private static validateImplementation;
    chart: Chart;
    constructor(chart: Chart);
    getOptions(): import("../options/chart/chartBuilderOptions").AgChartOptions;
    resetAnimations(): void;
    skipAnimations(): void;
    destroy(): void;
}
