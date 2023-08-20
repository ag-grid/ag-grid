import { Axis } from '../../axis';
import type { BBox } from '../../scene/bbox';
export declare abstract class PolarAxis extends Axis {
    gridAngles: number[] | undefined;
    shape: 'polygon' | 'circle';
    computeLabelsBBox(_options: {
        hideWhenNecessary: boolean;
    }, _seriesRect: BBox): BBox | null;
}
//# sourceMappingURL=polarAxis.d.ts.map