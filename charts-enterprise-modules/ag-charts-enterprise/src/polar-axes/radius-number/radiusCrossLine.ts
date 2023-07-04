import {
    _ModuleSupport,
    _Scale,
    _Scene,
    _Util,
    AgCrossLineLabelPosition,
    FontStyle,
    FontWeight,
} from 'ag-charts-community';

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
    position?: AgCrossLineLabelPosition = undefined;

    @Validate(OPT_NUMBER(-360, 360))
    rotation?: number = undefined;

    @Validate(OPT_BOOLEAN)
    parallel?: boolean = undefined;
}

type CrossLineType = 'line' | 'range';

export class RadiusCrossLine implements _ModuleSupport.CrossLine {
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

    gridAngles?: number[];

    label: any = new CrossLineLabel();

    scale?: _Scale.Scale<any, number> = undefined;
    clippedRange: [number, number] = [-Infinity, Infinity];
    gridLength: number = 0;
    sideFlag: 1 | -1 = -1;
    parallelFlipRotation: number = 0;
    regularFlipRotation: number = 0;
    direction: _ModuleSupport.ChartAxisDirection = ChartAxisDirection.Y;

    readonly group = new Group({ name: `${this.id}`, layer: true, zIndex: RadiusCrossLine.LINE_LAYER_ZINDEX });

    private polygonNode = new Path();
    private sectorNode = new Sector();

    constructor() {
        this.group.append(this.polygonNode);
        this.group.append(this.sectorNode);
    }

    update(visible: boolean) {
        this.updatePolygonNode(visible);
        this.updateSectorNode(visible);
        this.group.translationY = this.getRadius();
        this.group.zIndex =
            this.type === 'line' ? RadiusCrossLine.LINE_LAYER_ZINDEX : RadiusCrossLine.RANGE_LAYER_ZINDEX;
    }

    private colorizeNode(node: _Scene.Path) {
        if (this.type === 'range') {
            node.fill = this.fill;
            node.fillOpacity = this.fillOpacity ?? 1;
        } else {
            node.fill = undefined;
        }
        node.stroke = this.stroke;
        node.strokeOpacity = this.strokeOpacity ?? 1;
        node.strokeWidth = this.strokeWidth ?? 1;
    }

    private getRadius() {
        return this.scale?.range[0] ?? 0;
    }

    private getRadii() {
        const { range, scale, type } = this;
        const radius = this.getRadius();
        const outerRadius = radius - scale!.convert(type === 'line' ? this.value : Math.max(...range!));
        const innerRadius = radius - (type === 'line' ? 0 : scale!.convert(Math.min(...range!)));
        return { innerRadius, outerRadius };
    }

    private drawPolygon(radius: number, angles: number[], polygon: _Scene.Path) {
        angles.forEach((angle, index) => {
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            if (index === 0) {
                polygon.path.moveTo(x, y);
            } else {
                polygon.path.lineTo(x, y);
            }
        });
        polygon.path.closePath();
    }

    private updatePolygonNode(visible: boolean) {
        const { gridAngles, polygonNode: polygon, range, scale, shape, type } = this;
        if (!visible || shape !== 'polygon' || !scale || !gridAngles || (type === 'range' && !range)) {
            polygon.visible = false;
            return;
        }

        const { innerRadius, outerRadius } = this.getRadii();

        polygon.visible = true;

        polygon.path.clear({ trackChanges: true });
        this.drawPolygon(outerRadius, gridAngles, polygon);

        if (type === 'range') {
            const reversedAngles = gridAngles.slice().reverse();
            this.drawPolygon(innerRadius!, reversedAngles, polygon);
        }

        this.colorizeNode(polygon);
    }

    private updateSectorNode(visible: boolean) {
        const { gridAngles, range, scale, sectorNode: sector, shape, type } = this;
        if (!visible || shape !== 'circle' || !scale || !gridAngles || (type === 'range' && !range)) {
            sector.visible = false;
            return;
        }

        const { innerRadius, outerRadius } = this.getRadii();

        sector.visible = true;

        sector.startAngle = 0;
        sector.endAngle = 2 * Math.PI;

        sector.innerRadius = innerRadius;
        sector.outerRadius = outerRadius;

        this.colorizeNode(sector);
    }

    calculatePadding() {}
}
