import type { LegendConstructor } from '../../module/coreModules';
import type { ModuleContext } from '../../module/moduleContext';
import type { ChartLegend, ChartLegendType } from '../legendDatum';
export declare function registerLegend(type: ChartLegendType, key: string, ctr: LegendConstructor, theme: {} | undefined): void;
export declare function getLegend(type: ChartLegendType, ctx: ModuleContext): ChartLegend;
export declare function getLegendThemeTemplates(): Record<string, {} | undefined>;
export declare function getLegendKeys(): Partial<Record<ChartLegendType, string>>;
