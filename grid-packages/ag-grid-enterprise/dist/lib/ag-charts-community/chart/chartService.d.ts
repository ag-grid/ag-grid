import type { Caption } from './caption';
import type { ChartMode } from './chartMode';
import type { ISeries } from './series/seriesTypes';
export interface ChartService {
    readonly mode: ChartMode;
    readonly title?: Caption;
    readonly series: ISeries<any>[];
}
