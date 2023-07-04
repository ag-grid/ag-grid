import { _ModuleSupport, _Scale, _Scene, _Util, FontStyle, FontWeight } from 'ag-charts-community';

const {
    predicateWithMessage,
    Validate,
    NUMBER,
    OPT_BOOLEAN,
    OPT_STRING,
    OPT_FONT_STYLE,
    OPT_FONT_WEIGHT,
    OPTIONAL,
    STRING,
    OPT_COLOR_STRING,
    Layers,
    OPT_ARRAY,
    OPT_NUMBER,
    OPT_LINE_DASH,
    ChartAxisDirection,
} = _ModuleSupport;

const { Group, Path, Sector } = _Scene;

const { createId } = _Util;

type CrossLineLabelPosition = string;

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

class CrossLineLabel {
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
    position?: CrossLineLabelPosition = undefined;

    @Validate(OPT_NUMBER(-360, 360))
    rotation?: number = undefined;

    @Validate(OPT_BOOLEAN)
    parallel?: boolean = undefined;
}

type CrossLineType = 'line' | 'range';

export class AngleCrossLine implements _ModuleSupport.CrossLine {
    protected static readonly LINE_LAYER_ZINDEX = Layers.SERIES_CROSSLINE_LINE_ZINDEX;
    protected static readonly RANGE_LAYER_ZINDEX = Layers.SERIES_CROSSLINE_RANGE_ZINDEX;

    static className = 'AngleCrossLine';
    readonly id = createId(this);

    @Validate(OPT_BOOLEAN)
    enabled?: boolean = undefined;

    @Validate(OPT_CROSSLINE_TYPE)
    type?: CrossLineType = undefined;

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

    label: any = new CrossLineLabel();

    scale?: _Scale.Scale<any, number> = undefined;
    clippedRange: [number, number] = [-Infinity, Infinity];
    gridLength: number = 0;
    sideFlag: 1 | -1 = -1;
    parallelFlipRotation: number = 0;
    regularFlipRotation: number = 0;
    direction: _ModuleSupport.ChartAxisDirection = ChartAxisDirection.X;

    readonly group = new Group({ name: `${this.id}`, layer: true, zIndex: AngleCrossLine.LINE_LAYER_ZINDEX });

    private polygonNode = new Path();
    private sectorNode = new Sector();
    private lineNode = new Path();

    constructor() {
        this.group.append(this.polygonNode);
        this.group.append(this.sectorNode);
        this.group.append(this.lineNode);
    }

    update(visible: boolean) {
        this.updateLineNode(visible);
        this.updatePolygonNode(visible);
        this.updateSectorNode(visible);
    }

    private updateLineNode(visible: boolean) {
        const { scale, shape, type, value, lineNode: line } = this;
        let angle: number;
        if (!visible || type !== 'line' || shape !== 'polygon' || !scale || isNaN((angle = scale.convert(value)))) {
            line.visible = false;
            return;
        }

        const radius = this.gridLength;

        line.visible = true;
        line.stroke = this.stroke;
        line.strokeOpacity = this.strokeOpacity ?? 1;
        line.strokeWidth = this.strokeWidth ?? 1;
        line.fill = undefined;
        line.lineDash = this.lineDash;

        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        line.path.clear({ trackChanges: true });
        line.path.moveTo(0, 0);
        line.path.lineTo(x, y);

        this.group.zIndex = AngleCrossLine.LINE_LAYER_ZINDEX;
    }

    private updateFill(area: _Scene.Path | _Scene.Sector) {
        area.fill = this.fill;
        area.fillOpacity = this.fillOpacity ?? 1;
        area.stroke = this.stroke;
        area.strokeOpacity = this.strokeOpacity ?? 1;
        area.strokeWidth = this.strokeWidth ?? 1;
    }

    private updatePolygonNode(visible: boolean) {
        const { polygonNode: polygon, range, scale, shape, type } = this;
        let ticks: any[] | undefined;
        if (!visible || type !== 'range' || shape !== 'polygon' || !scale || !range || !(ticks = scale.ticks?.())) {
            polygon.visible = false;
            return;
        }

        const radius = this.gridLength;
        const startIndex = ticks.indexOf(range[0]);
        const endIndex = ticks.indexOf(range[1]);
        const stops =
            startIndex <= endIndex
                ? ticks.slice(startIndex, endIndex + 1)
                : ticks.slice(startIndex).concat(ticks.slice(0, endIndex + 1));
        const angles = stops.map((value) => scale.convert(value));

        polygon.visible = true;
        this.updateFill(polygon);

        polygon.path.clear({ trackChanges: true });
        polygon.path.moveTo(0, 0);
        angles.forEach((angle) => {
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            polygon.path.lineTo(x, y);
        });
        polygon.path.closePath();

        this.group.zIndex = AngleCrossLine.RANGE_LAYER_ZINDEX;
    }

    private updateSectorNode(visible: boolean) {
        const { sectorNode: sector, range, scale, shape, type } = this;
        if (!visible || type !== 'range' || shape !== 'circle' || !scale || !range) {
            sector.visible = false;
            return;
        }

        const radius = this.gridLength;
        const angles = range.map((value) => scale.convert(value));

        sector.visible = true;
        this.updateFill(sector);

        sector.centerX = 0;
        sector.centerY = 0;
        sector.innerRadius = 0;
        sector.outerRadius = radius;
        sector.startAngle = angles[0];
        sector.endAngle = angles[1];

        this.group.zIndex = AngleCrossLine.RANGE_LAYER_ZINDEX;
    }

    calculatePadding() {}
}
