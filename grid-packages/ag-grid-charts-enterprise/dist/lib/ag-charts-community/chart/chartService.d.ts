import type { CaptionLike } from './captionLike';
import type { ChartMode } from './chartMode';
import type { ISeries } from './series/seriesTypes';
export interface ChartService {
    readonly mode: ChartMode;
    readonly title?: CaptionLike;
    readonly series: ISeries<any>[];
}
