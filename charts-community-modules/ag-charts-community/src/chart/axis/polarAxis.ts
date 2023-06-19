import { Axis } from '../../axis';
import { BBox } from '../../scene/bbox';

export abstract class PolarAxis extends Axis {
    computeLabelsBBox(_options: { hideWhenNecessary: boolean }, _seriesRect: BBox): BBox | null {
        return null;
    }
}
