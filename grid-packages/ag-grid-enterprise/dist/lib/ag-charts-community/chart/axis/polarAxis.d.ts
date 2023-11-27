import type { Scale } from '../../scale/scale';
import type { BBox } from '../../scene/bbox';
import { Axis } from './axis';
export declare abstract class PolarAxis<S extends Scale<any, any, any> = Scale<any, any, any>> extends Axis<S> {
    gridAngles: number[] | undefined;
    gridRange: number[] | undefined;
    shape: 'polygon' | 'circle';
    innerRadiusRatio: number;
    protected defaultTickMinSpacing: number;
    computeLabelsBBox(_options: {
        hideWhenNecessary: boolean;
    }, _seriesRect: BBox): BBox | null;
    computeRange?: () => void;
}
