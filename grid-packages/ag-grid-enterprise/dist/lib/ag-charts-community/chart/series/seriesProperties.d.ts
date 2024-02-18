import type { InteractionRange } from '../../options/chart/types';
import { BaseProperties } from '../../util/properties';
import type { SeriesTooltip } from './seriesTooltip';
export declare class SeriesItemHighlightStyle extends BaseProperties {
    fill?: string;
    fillOpacity?: number;
    stroke?: string;
    strokeWidth?: number;
    strokeOpacity?: number;
    lineDash?: number[];
    lineDashOffset?: number;
}
declare class SeriesHighlightStyle extends BaseProperties {
    strokeWidth?: number;
    dimOpacity?: number;
    enabled?: boolean;
}
declare class TextHighlightStyle extends BaseProperties {
    color?: string;
}
export declare class HighlightStyle extends BaseProperties {
    readonly item: SeriesItemHighlightStyle;
    readonly series: SeriesHighlightStyle;
    readonly text: TextHighlightStyle;
}
export declare abstract class SeriesProperties<T extends object> extends BaseProperties<T> {
    id?: string;
    visible: boolean;
    showInLegend: boolean;
    cursor: string;
    nodeClickRange: InteractionRange;
    readonly highlightStyle: HighlightStyle;
    abstract tooltip: SeriesTooltip<any>;
}
export {};
