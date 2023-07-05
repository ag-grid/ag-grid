import type { _Scale, FontStyle, FontWeight } from 'ag-charts-community';
import { _ModuleSupport, _Scene, _Util } from 'ag-charts-community';

const {
    ChartAxisDirection,
    Layers,
    NUMBER,
    OPTIONAL,
    OPT_ARRAY,
    OPT_BOOLEAN,
    OPT_COLOR_STRING,
    OPT_FONT_STYLE,
    OPT_FONT_WEIGHT,
    OPT_NUMBER,
    OPT_LINE_DASH,
    OPT_STRING,
    predicateWithMessage,
    STRING,
    Validate,
} = _ModuleSupport;

const { Group } = _Scene;

const { createId } = _Util;

const CROSSLINE_LABEL_POSITIONS = [
    'top',
    'left',
    'right',
    'bottom',
    'topLeft',
    'topRight',
    'bottomLeft',
    'bottomRight',
    'inside',
    'insideLeft',
    'insideRight',
    'insideTop',
    'insideBottom',
    'insideTopLeft',
    'insideBottomLeft',
    'insideTopRight',
    'insideBottomRight',
];

const OPT_CROSSLINE_LABEL_POSITION = predicateWithMessage(
    (v: any, ctx) => OPTIONAL(v, ctx, (v: any) => CROSSLINE_LABEL_POSITIONS.includes(v)),
    `expecting an optional crossLine label position keyword such as 'topLeft', 'topRight' or 'inside'`
);

const OPT_CROSSLINE_TYPE = predicateWithMessage(
    (v: any, ctx) => OPTIONAL(v, ctx, (v: any) => v === 'range' || v === 'line'),
    `expecting a crossLine type keyword such as 'range' or 'line'`
);

class PolarCrossLineLabel implements _ModuleSupport.CrossLineLabel {
    @Validate(OPT_BOOLEAN)
    enabled?: boolean = undefined;

    @Validate(OPT_STRING)
    text?: string = undefined;

    @Validate(OPT_FONT_STYLE)
    fontStyle?: FontStyle = undefined;

    @Validate(OPT_FONT_WEIGHT)
    fontWeight?: FontWeight = undefined;

    @Validate(NUMBER(0))
    fontSize: number = 14;

    @Validate(STRING)
    fontFamily: string = 'Verdana, sans-serif';

    /**
     * The padding between the label and the line.
     */
    @Validate(NUMBER(0))
    padding: number = 5;

    /**
     * The color of the labels.
     */
    @Validate(OPT_COLOR_STRING)
    color?: string = 'rgba(87, 87, 87, 1)';

    @Validate(OPT_CROSSLINE_LABEL_POSITION)
    position?: _ModuleSupport.CrossLineLabel['position'] = undefined;

    @Validate(OPT_NUMBER(-360, 360))
    rotation?: number = undefined;

    @Validate(OPT_BOOLEAN)
    parallel?: boolean = undefined;
}

export abstract class PolarCrossLine implements _ModuleSupport.CrossLine {
    protected static readonly LINE_LAYER_ZINDEX = Layers.SERIES_CROSSLINE_LINE_ZINDEX;
    protected static readonly RANGE_LAYER_ZINDEX = Layers.SERIES_CROSSLINE_RANGE_ZINDEX;
    readonly id = createId(this);

    @Validate(OPT_BOOLEAN)
    enabled?: boolean = undefined;

    @Validate(OPT_CROSSLINE_TYPE)
    type?: _ModuleSupport.CrossLineType = undefined;

    @Validate(OPT_ARRAY(2))
    range?: [any, any] = undefined;
    value?: any = undefined;

    @Validate(OPT_COLOR_STRING)
    fill?: string = undefined;

    @Validate(OPT_NUMBER(0, 1))
    fillOpacity?: number = undefined;

    @Validate(OPT_COLOR_STRING)
    stroke?: string = undefined;

    @Validate(OPT_NUMBER())
    strokeWidth?: number = undefined;

    @Validate(OPT_NUMBER(0, 1))
    strokeOpacity?: number = undefined;

    @Validate(OPT_LINE_DASH)
    lineDash?: [] = undefined;

    shape: 'polygon' | 'circle' = 'polygon';

    label = new PolarCrossLineLabel();

    scale?: _Scale.Scale<any, number> = undefined;
    clippedRange: [number, number] = [-Infinity, Infinity];
    gridLength: number = 0;
    sideFlag: 1 | -1 = -1;
    parallelFlipRotation: number = 0;
    regularFlipRotation: number = 0;
    direction: _ModuleSupport.ChartAxisDirection = ChartAxisDirection.X;

    readonly group = new Group({ name: `${this.id}`, layer: true, zIndex: PolarCrossLine.LINE_LAYER_ZINDEX });

    abstract update(visible: boolean): void;

    calculatePadding() {}
}
