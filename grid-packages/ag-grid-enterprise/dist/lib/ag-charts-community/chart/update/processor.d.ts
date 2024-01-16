import type { Group } from '../../scene/group';
import type { Padding } from '../../util/padding';
import type { Caption } from '../caption';
/** Interface to abstract from the actual chart implementation. */
export interface ChartLike {
    seriesArea: {
        clip?: boolean;
    };
    seriesRoot: Group;
    padding: Padding;
    title?: Caption;
    subtitle?: Caption;
    footnote?: Caption;
}
export interface UpdateProcessor {
    destroy(): void;
}
