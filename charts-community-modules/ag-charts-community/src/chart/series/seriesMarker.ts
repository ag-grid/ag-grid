import { Marker } from '../marker/marker';
import { Circle } from '../marker/circle';
import { ChangeDetectable, RedrawType } from '../../scene/changeDetectable';
import {
    BOOLEAN,
    NUMBER,
    OPT_COLOR_STRING,
    OPT_NUMBER,
    OPT_NUMBER_ARRAY,
    predicateWithMessage,
    ValidateAndChangeDetection,
} from '../../util/validation';

const MARKER_SHAPES = ['circle', 'cross', 'diamond', 'heart', 'plus', 'square', 'triangle'];
const MARKER_SHAPE = predicateWithMessage(
    (v: any) => MARKER_SHAPES.includes(v) || Object.getPrototypeOf(v) === Marker,
    `expecting a marker shape keyword such as 'circle', 'diamond' or 'square' or an object extending the Marker class`
);

export class SeriesMarker extends ChangeDetectable {
    @ValidateAndChangeDetection({
        validatePredicate: BOOLEAN,
        sceneChangeDetectionOpts: { redraw: RedrawType.MAJOR },
    })
    enabled = true;

    /**
     * One of the predefined marker names, or a marker constructor function (for user-defined markers).
     * A series will create one marker instance per data point.
     */
    @ValidateAndChangeDetection({
        validatePredicate: MARKER_SHAPE,
        sceneChangeDetectionOpts: { redraw: RedrawType.MAJOR },
    })
    shape: string | (new () => Marker) = Circle;

    @ValidateAndChangeDetection({
        validatePredicate: NUMBER(0),
        sceneChangeDetectionOpts: { redraw: RedrawType.MAJOR },
    })
    size = 6;

    /**
     * In case a series has the `sizeKey` set, the `sizeKey` values along with the `size` and `maxSize` configs
     * will be used to determine the size of the marker. All values will be mapped to a marker size
     * within the `[size, maxSize]` range, where the largest values will correspond to the `maxSize`
     * and the lowest to the `size`.
     */
    @ValidateAndChangeDetection({
        validatePredicate: NUMBER(0),
        sceneChangeDetectionOpts: { redraw: RedrawType.MAJOR },
    })
    maxSize = 30;

    @ValidateAndChangeDetection({
        validatePredicate: OPT_NUMBER_ARRAY,
        sceneChangeDetectionOpts: { redraw: RedrawType.MAJOR },
    })
    domain?: [number, number] = undefined;

    @ValidateAndChangeDetection({
        validatePredicate: OPT_COLOR_STRING,
        sceneChangeDetectionOpts: { redraw: RedrawType.MAJOR },
    })
    fill?: string = undefined;

    @ValidateAndChangeDetection({
        validatePredicate: OPT_COLOR_STRING,
        sceneChangeDetectionOpts: { redraw: RedrawType.MAJOR },
    })
    stroke?: string = undefined;

    @ValidateAndChangeDetection({
        validatePredicate: OPT_NUMBER(0),
        sceneChangeDetectionOpts: { redraw: RedrawType.MAJOR },
    })
    strokeWidth?: number = 1;

    @ValidateAndChangeDetection({
        validatePredicate: OPT_NUMBER(0, 1),
        sceneChangeDetectionOpts: { redraw: RedrawType.MAJOR },
    })
    fillOpacity?: number = undefined;

    @ValidateAndChangeDetection({
        validatePredicate: OPT_NUMBER(0, 1),
        sceneChangeDetectionOpts: { redraw: RedrawType.MAJOR },
    })
    strokeOpacity?: number = undefined;
}
