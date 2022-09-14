import { Marker } from '../marker/marker';
import { Circle } from '../marker/circle';
import { ChangeDetectable, SceneChangeDetection, RedrawType } from '../../scene/changeDetectable';
import {
    BOOLEAN,
    NUMBER,
    OPT_NUMBER,
    OPT_NUMBER_ARRAY,
    OPT_STRING,
    ValidateAndChangeDetection,
} from '../../util/validation';

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
    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
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
        validatePredicate: OPT_STRING,
        sceneChangeDetectionOpts: { redraw: RedrawType.MAJOR },
    })
    fill?: string = undefined;

    @ValidateAndChangeDetection({
        validatePredicate: OPT_STRING,
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

export interface SeriesMarkerFormatterParams {
    datum: any;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    size: number;
    highlighted: boolean;
}
