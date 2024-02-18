import type { Scale } from '../../scale/scale';
import type { Group } from '../../scene/group';
import type { Padding } from '../../util/padding';
import type { Caption } from '../caption';
/** Interface to abstract from the actual chart implementation. */
export interface ChartLike {
    axes: Array<AxisLike>;
    series: Array<SeriesLike>;
    seriesArea: {
        clip?: boolean;
    };
    seriesRoot: Group;
    padding: Padding;
    title?: Caption;
    subtitle?: Caption;
    footnote?: Caption;
}
export interface AxisLike {
    id: string;
    type: string;
    scale: Scale<any, any>;
}
export interface SeriesLike {
    data?: any[];
    visible: boolean;
}
export interface UpdateProcessor {
    destroy(): void;
}
