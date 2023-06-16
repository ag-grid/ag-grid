import { Axis } from '../../axis';
import { BBox } from '../../scene/bbox';

export abstract class PolarAxis extends Axis {
    computeLabelsBBox(): BBox | null {
        return null;
    }
}
