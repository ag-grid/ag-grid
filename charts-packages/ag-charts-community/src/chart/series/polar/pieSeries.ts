import { Group } from '../../../scene/group';
import { Line } from '../../../scene/shape/line';
import { Text } from '../../../scene/shape/text';
import { Circle } from '../../marker/circle';
import { Selection } from '../../../scene/selection';
import { DropShadow } from '../../../scene/dropShadow';
import { LinearScale } from '../../../scale/linearScale';
import { clamper } from '../../../scale/continuousScale';
import { Sector } from '../../../scene/shape/sector';
import { BBox } from '../../../scene/bbox';
import { PolarTooltipRendererParams, SeriesNodeDatum, HighlightStyle, SeriesTooltip } from './../series';
import { Label } from '../../label';
import { PointerEvents } from '../../../scene/node';
import { normalizeAngle180, toRadians } from '../../../util/angle';
import { doOnce } from '../../../util/function';
import { toFixed, mod } from '../../../util/number';
import { LegendDatum } from '../../legend';
import { Caption } from '../../../caption';
import { Observable, TypedEvent } from '../../../util/observable';
import { PolarSeries } from './polarSeries';
import { ChartAxisDirection } from '../../chartAxis';
import { TooltipRendererResult, toTooltipHtml } from '../../chart';
import {
    BOOLEAN,
    NUMBER,
    OPT_FUNCTION,
    OPT_LINE_DASH,
    OPT_NUMBER,
    OPT_STRING,
    STRING,
    COLOR_STRING_ARRAY,
    Validate,
    COLOR_STRING,
} from '../../../util/validation';

export interface PieSeriesNodeClickEvent extends TypedEvent {
    readonly type: 'nodeClick';
    readonly event: MouseEvent;
    readonly series: PieSeries;
    readonly datum: any;
    readonly angleKey: string;
    readonly labelKey?: string;
    readonly sectorLabelKey?: string;
    readonly radiusKey?: string;
}

interface PieNodeDatum extends SeriesNodeDatum {
    readonly index: number;
    readonly radius: number; // in the [0, 1] range
    readonly startAngle: number;
    readonly endAngle: number;
    readonly midAngle: number;
    readonly midCos: number;
    readonly midSin: number;

    readonly label?: {
        readonly text: string;
        readonly textAlign: CanvasTextAlign;
        readonly textBaseline: CanvasTextBaseline;
    };

    readonly sectorLabel?: {
        readonly text: string;
    };
}

export interface PieTooltipRendererParams extends PolarTooltipRendererParams {
    readonly labelKey?: string;
    readonly labelName?: string;
    readonly sectorLabelKey?: string;
    readonly sectorLabelName?: string;
}

class PieHighlightStyle extends HighlightStyle {
    @Validate(OPT_NUMBER(0))
    centerOffset?: number;
}

enum PieNodeTag {
    Sector,
    Callout,
    Label,
}

export interface PieSeriesFormatterParams {
    readonly datum: any;
    readonly fill?: string;
    readonly stroke?: string;
    readonly strokeWidth: number;
    readonly highlighted: boolean;
    readonly angleKey: string;
    readonly radiusKey?: string;
}

export interface PieSeriesFormat {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}

interface PieSeriesLabelFormatterParams {
    readonly datum: any;
    readonly labelKey?: string;
    readonly labelValue?: string;
    readonly labelName?: string;
    readonly sectorLabelKey?: string;
    readonly sectorLabelValue?: string;
    readonly sectorLabelName?: string;
    readonly angleKey: string;
    readonly angleValue?: any;
    readonly angleName?: string;
    readonly radiusKey?: string;
    readonly radiusValue?: any;
    readonly radiusName?: string;
    readonly value?: any;
}

class PieSeriesLabel extends Label {
    @Validate(NUMBER(0))
    offset = 3; // from the callout line

    @Validate(NUMBER(0))
    minAngle = 20; // in degrees

    @Validate(OPT_FUNCTION)
    formatter?: (params: PieSeriesLabelFormatterParams) => string = undefined;
}

class PieSeriesSectorLabel extends Label {
    @Validate(NUMBER())
    positionOffset = 0;

    @Validate(NUMBER(0, 1))
    positionRatio = 0.5;

    @Validate(OPT_FUNCTION)
    formatter?: (params: PieSeriesLabelFormatterParams) => string = undefined;
}

class PieSeriesCallout extends Observable {
    @Validate(COLOR_STRING_ARRAY)
    colors: string[] = ['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'];

    @Validate(NUMBER(0))
    length: number = 10;

    @Validate(NUMBER(0))
    strokeWidth: number = 1;
}

export class PieSeriesTooltip extends SeriesTooltip {
    @Validate(OPT_FUNCTION)
    renderer?: (params: PieTooltipRendererParams) => string | TooltipRendererResult = undefined;
}

export class PieTitle extends Caption {
    @Validate(BOOLEAN)
    showInLegend = false;
}

export class DoughnutInnerLabel extends Label {
    @Validate(STRING)
    text = '';
    @Validate(NUMBER())
    margin = 2;
}

export class DoughnutInnerCircle {
    @Validate(COLOR_STRING)
    fill = 'transparent';
    @Validate(OPT_NUMBER(0, 1))
    fillOpacity? = 1;
}

interface SectorBoundaries {
    startAngle: number;
    endAngle: number;
    innerRadius: number;
    outerRadius: number;
}

function isPointInArc(x: number, y: number, sector: SectorBoundaries) {
    const radius = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    const { innerRadius, outerRadius } = sector;
    if (radius < Math.min(innerRadius, outerRadius) || radius > Math.max(innerRadius, outerRadius)) {
        return false;
    }
    // Start and End angles are expected to be [-90, 270]
    // while Math.atan2 returns [-180, 180]
    let angle = Math.atan2(y, x);
    if (angle < -Math.PI / 2) {
        angle += 2 * Math.PI;
    }
    // Start is actually bigger than End clock-wise
    const { startAngle, endAngle } = sector;
    if (endAngle === -Math.PI / 2) {
        return angle < startAngle;
    }
    if (startAngle === (3 * Math.PI) / 2) {
        return angle > endAngle;
    }
    return angle >= endAngle && angle <= startAngle;
}

export class PieSeries extends PolarSeries<PieNodeDatum> {
    static className = 'PieSeries';
    static type = 'pie' as const;

    private radiusScale: LinearScale = new LinearScale();
    private groupSelection: Selection<Group, Group, PieNodeDatum, any> = Selection.select(
        this.pickGroup
    ).selectAll<Group>();
    private highlightSelection: Selection<Group, Group, PieNodeDatum, any> = Selection.select(
        this.highlightGroup
    ).selectAll<Group>();
    private labelSelection: Selection<Group, Group, PieNodeDatum, any>;
    private sectorLabelSelection: Selection<Text, Group, PieNodeDatum, any>;
    private innerLabelsSelection: Selection<Text, Group, DoughnutInnerLabel, any>;

    /**
     * The processed data that gets visualized.
     */
    private groupSelectionData: PieNodeDatum[] = [];

    private angleScale: LinearScale = (() => {
        const scale = new LinearScale();
        // Each sector is a ratio of the whole, where all ratios add up to 1.
        scale.domain = [0, 1];
        // Add 90 deg to start the first pie at 12 o'clock.
        scale.range = [-Math.PI, Math.PI].map((angle) => angle + Math.PI / 2);
        return scale;
    })();

    // When a user toggles a series item (e.g. from the legend), its boolean state is recorded here.
    public seriesItemEnabled: boolean[] = [];

    private _title?: PieTitle;
    set title(value: PieTitle | undefined) {
        const oldTitle = this._title;

        if (oldTitle !== value) {
            if (oldTitle) {
                this.labelGroup?.removeChild(oldTitle.node);
            }

            if (value) {
                value.node.textBaseline = 'bottom';
                this.labelGroup?.appendChild(value.node);
            }

            this._title = value;
        }
    }
    get title(): PieTitle | undefined {
        return this._title;
    }

    readonly label = new PieSeriesLabel();
    readonly sectorLabel = new PieSeriesSectorLabel();
    readonly callout = new PieSeriesCallout();

    tooltip: PieSeriesTooltip = new PieSeriesTooltip();

    set data(input: any[] | undefined) {
        this._data = input;
        this.processSeriesItemEnabled();
    }
    get data() {
        return this._data;
    }

    /**
     * The key of the numeric field to use to determine the angle (for example,
     * a pie sector angle).
     */
    @Validate(STRING)
    angleKey = '';

    @Validate(STRING)
    angleName = '';

    readonly innerLabels: DoughnutInnerLabel[] = [];

    private _innerCircleConfig?: DoughnutInnerCircle;
    private _innerCircleNode?: Circle;
    get innerCircle(): DoughnutInnerCircle | undefined {
        return this._innerCircleConfig;
    }
    set innerCircle(value: DoughnutInnerCircle | undefined) {
        const oldCircleCfg = this._innerCircleConfig;

        if (oldCircleCfg !== value) {
            const oldNode = this._innerCircleNode;
            let circle: Circle | undefined;
            if (oldNode) {
                this.backgroundGroup.removeChild(oldNode);
            }

            if (value) {
                circle = new Circle();
                circle.fill = value.fill;
                circle.fillOpacity = value.fillOpacity ?? 1;
                this.backgroundGroup.appendChild(circle);
            }

            this._innerCircleConfig = value;
            this._innerCircleNode = circle;
        }
    }

    /**
     * The key of the numeric field to use to determine the radii of pie sectors.
     * The largest value will correspond to the full radius and smaller values to
     * proportionally smaller radii.
     */
    @Validate(OPT_STRING)
    radiusKey?: string = undefined;

    @Validate(OPT_STRING)
    radiusName?: string = undefined;

    @Validate(OPT_NUMBER(0))
    radiusMin?: number = undefined;

    @Validate(OPT_NUMBER(0))
    radiusMax?: number = undefined;

    @Validate(OPT_STRING)
    labelKey?: string = undefined;

    @Validate(OPT_STRING)
    labelName?: string = undefined;

    @Validate(OPT_STRING)
    sectorLabelKey?: string = undefined;

    @Validate(OPT_STRING)
    sectorLabelName?: string = undefined;

    @Validate(COLOR_STRING_ARRAY)
    fills: string[] = ['#c16068', '#a2bf8a', '#ebcc87', '#80a0c3', '#b58dae', '#85c0d1'];

    @Validate(COLOR_STRING_ARRAY)
    strokes: string[] = ['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'];

    @Validate(NUMBER(0, 1))
    fillOpacity = 1;

    @Validate(NUMBER(0, 1))
    strokeOpacity = 1;

    @Validate(OPT_LINE_DASH)
    lineDash?: number[] = [0];

    @Validate(NUMBER(0))
    lineDashOffset: number = 0;

    @Validate(OPT_FUNCTION)
    formatter?: (params: PieSeriesFormatterParams) => PieSeriesFormat = undefined;

    /**
     * The series rotation in degrees.
     */
    @Validate(NUMBER(-360, 360))
    rotation = 0;

    @Validate(NUMBER())
    outerRadiusOffset = 0;

    @Validate(NUMBER(0))
    outerRadiusRatio = 1;

    @Validate(NUMBER())
    innerRadiusOffset = 0;

    @Validate(NUMBER(0))
    innerRadiusRatio = 1;

    @Validate(NUMBER(0))
    strokeWidth = 1;

    shadow?: DropShadow = undefined;

    readonly highlightStyle = new PieHighlightStyle();

    constructor() {
        super({ useLabelLayer: true });

        const pieLabels = new Group();
        const pieSectorLabels = new Group();
        const innerLabels = new Group();
        this.labelGroup!.append(pieLabels);
        this.labelGroup!.append(pieSectorLabels);
        this.labelGroup!.append(innerLabels);
        this.labelSelection = Selection.select(pieLabels).selectAll<Group>();
        this.sectorLabelSelection = Selection.select(pieSectorLabels).selectAll<Text>();
        this.innerLabelsSelection = Selection.select(innerLabels).selectAll<Text>();
    }

    visibleChanged() {
        this.processSeriesItemEnabled();
    }

    private processSeriesItemEnabled() {
        const { data, visible } = this;
        this.seriesItemEnabled = data?.map(() => visible) || [];
    }

    setColors(fills: string[], strokes: string[]) {
        this.fills = fills;
        this.strokes = strokes;
        this.callout.colors = strokes;
    }

    getDomain(direction: ChartAxisDirection): any[] {
        if (direction === ChartAxisDirection.X) {
            return this.angleScale.domain;
        } else {
            return this.radiusScale.domain;
        }
    }

    async processData() {
        const { angleKey, radiusKey, seriesItemEnabled, angleScale, groupSelectionData, label, sectorLabel } = this;
        const data = angleKey && this.data ? this.data : [];

        const angleData: number[] = data.map(
            (datum, index) => (seriesItemEnabled[index] && Math.abs(+datum[angleKey])) || 0
        );
        const angleDataTotal = angleData.reduce((a, b) => a + b, 0);

        // The ratios (in [0, 1] interval) used to calculate the end angle value for every pie sector.
        // Each sector starts where the previous one ends, so we only keep the ratios for end angles.
        const angleDataRatios = (() => {
            let sum = 0;
            return angleData.map((datum) => (sum += datum / angleDataTotal));
        })();

        const labelFormatter = label.formatter;
        const labelKey = label.enabled ? this.labelKey : undefined;
        const sectorLabelKey = sectorLabel.enabled ? this.sectorLabelKey : undefined;
        let labelData: string[] = [];
        let sectorLabelData: string[] = [];
        let radiusData: number[] = [];

        const getLabelFormatterParams = <T extends { [prop: string]: any }>(
            datum: T
        ): PieSeriesLabelFormatterParams => {
            return {
                datum,
                angleKey,
                angleValue: datum[angleKey],
                angleName: this.angleName,
                radiusKey,
                radiusValue: radiusKey ? datum[radiusKey] : undefined,
                radiusName: this.radiusName,
                labelKey,
                labelValue: labelKey ? datum[labelKey] : undefined,
                labelName: this.labelName,
                sectorLabelKey,
                sectorLabelValue: sectorLabelKey ? datum[sectorLabelKey] : undefined,
            };
        };

        if (labelKey) {
            if (labelFormatter) {
                const showValueDeprecationWarning = () =>
                    doOnce(
                        () =>
                            console.warn(
                                'AG Charts - the use of { value } in the pie chart label formatter function is deprecated. Please use { datum, labelKey, ... } instead.'
                            ),
                        'deprecated use of "value" property in pie chart label formatter'
                    );
                labelData = data.map((datum) => {
                    let deprecatedValue = datum[labelKey];
                    const formatterParams: PieSeriesLabelFormatterParams = {
                        ...getLabelFormatterParams(datum),
                        get value() {
                            showValueDeprecationWarning();
                            return deprecatedValue;
                        },
                        set value(v) {
                            showValueDeprecationWarning();
                            deprecatedValue = v;
                        },
                    };
                    return labelFormatter(formatterParams);
                });
            } else {
                labelData = data.map((datum) => String(datum[labelKey]));
            }
        }

        const sectorLabelFormatter = sectorLabel.formatter;

        if (sectorLabelKey) {
            if (sectorLabelFormatter) {
                sectorLabelData = data.map((datum) => {
                    const formatterParams = getLabelFormatterParams(datum);
                    return sectorLabelFormatter(formatterParams);
                });
            } else {
                sectorLabelData = data.map((datum) => String(datum[sectorLabelKey]));
            }
        }

        if (radiusKey) {
            const { radiusMin, radiusMax } = this;
            const radii = data.map((datum) => Math.abs(datum[radiusKey]));
            const min = radiusMin ?? 0;
            const max = radiusMax ? radiusMax : Math.max(...radii);
            const delta = max - min;

            radiusData = radii.map((value) => (delta ? (value - min) / delta : 1));
        }

        groupSelectionData.length = 0;

        const rotation = toRadians(this.rotation);
        const halfPi = Math.PI / 2;

        let datumIndex = 0;

        const quadrantTextOpts: { textAlign: CanvasTextAlign; textBaseline: CanvasTextBaseline }[] = [
            { textAlign: 'center', textBaseline: 'bottom' },
            { textAlign: 'left', textBaseline: 'middle' },
            { textAlign: 'center', textBaseline: 'hanging' },
            { textAlign: 'right', textBaseline: 'middle' },
        ];

        // Process sectors.
        let end = 0;
        angleDataRatios.forEach((start) => {
            if (isNaN(start)) {
                return;
            } // No sectors displayed - nothing to do.

            const radius = radiusKey ? radiusData[datumIndex] : 1;
            const startAngle = angleScale.convert(start) + rotation;
            const endAngle = angleScale.convert(end) + rotation;

            const midAngle = (startAngle + endAngle) / 2;
            const span = Math.abs(endAngle - startAngle);
            const midCos = Math.cos(midAngle);
            const midSin = Math.sin(midAngle);

            const labelMinAngle = toRadians(label.minAngle);
            const labelVisible = labelKey && span > labelMinAngle;
            const midAngle180 = normalizeAngle180(midAngle);

            // Split the circle into quadrants like so: ⊗
            const quadrantStart = (-3 * Math.PI) / 4; // same as `normalizeAngle180(toRadians(-135))`
            const quadrantOffset = midAngle180 - quadrantStart;
            const quadrant = Math.floor(quadrantOffset / halfPi);
            const quadrantIndex = mod(quadrant, quadrantTextOpts.length);

            const { textAlign, textBaseline } = quadrantTextOpts[quadrantIndex];

            groupSelectionData.push({
                series: this,
                datum: data[datumIndex],
                itemId: datumIndex,
                index: datumIndex,
                radius,
                startAngle,
                endAngle,
                midAngle,
                midCos,
                midSin,
                label: labelVisible
                    ? {
                          text: labelData[datumIndex],
                          textAlign,
                          textBaseline,
                      }
                    : undefined,
                sectorLabel: sectorLabelKey
                    ? {
                          text: sectorLabelData[datumIndex],
                      }
                    : undefined,
            });

            datumIndex++;
            end = start; // Update for next iteration.
        });
    }

    async createNodeData() {
        return [];
    }

    private getInnerRadius() {
        const { radius, innerRadiusRatio, innerRadiusOffset } = this;
        const innerRadius = radius * (innerRadiusRatio ?? 1) + (innerRadiusOffset ? innerRadiusOffset : 0);
        if (innerRadius === radius || innerRadius < 0) {
            return 0;
        }
        return innerRadius;
    }

    private getOuterRadius() {
        const { radius, outerRadiusRatio, outerRadiusOffset } = this;
        const outerRadius = radius * (outerRadiusRatio ?? 1) + (outerRadiusOffset ? outerRadiusOffset : 0);
        if (outerRadius < 0) {
            return 0;
        }
        return outerRadius;
    }

    async update() {
        const { title } = this;
        const innerRadius = this.getInnerRadius();
        const outerRadius = this.getOuterRadius();

        this.radiusScale.range = [innerRadius, outerRadius];

        this.group.translationX = this.centerX;
        this.group.translationY = this.centerY;

        if (title) {
            const outerRadius = Math.max(0, this.radiusScale.range[1]);

            if (outerRadius === 0) {
                title.node.visible = false;
            } else {
                const titleOffset = 2;
                title.node.translationY = -outerRadius - titleOffset;
                title.node.visible = title.enabled;
            }
        }

        await this.updateSelections();
        await this.updateNodes();
    }

    private async updateSelections() {
        await this.updateGroupSelection();
    }

    private async updateGroupSelection() {
        const { groupSelection, highlightSelection, labelSelection, sectorLabelSelection, innerLabelsSelection } = this;

        const update = (selection: typeof groupSelection) => {
            const updateGroups = selection.setData(this.groupSelectionData);
            updateGroups.exit.remove();

            const enterGroups = updateGroups.enter.append(Group);
            enterGroups.append(Sector).each((node) => (node.tag = PieNodeTag.Sector));

            return updateGroups.merge(enterGroups);
        };

        this.groupSelection = update(groupSelection);
        this.highlightSelection = update(highlightSelection);

        const updateLabels = labelSelection.setData(this.groupSelectionData);
        updateLabels.exit.remove();

        const enterLabels = updateLabels.enter.append(Group);
        enterLabels.append(Line).each((node) => {
            node.tag = PieNodeTag.Callout;
            node.pointerEvents = PointerEvents.None;
        });
        enterLabels.append(Text).each((node) => {
            node.tag = PieNodeTag.Label;
            node.pointerEvents = PointerEvents.None;
        });
        this.labelSelection = updateLabels.merge(enterLabels);

        const updateSectorLabels = sectorLabelSelection.setData(this.groupSelectionData);
        updateSectorLabels.exit.remove();
        const enterSectorLabels = updateSectorLabels.enter.append(Text);
        enterSectorLabels.each((node) => {
            node.pointerEvents = PointerEvents.None;
        });
        this.sectorLabelSelection = updateSectorLabels.merge(enterSectorLabels);

        const updateInnerLabels = innerLabelsSelection.setData(this.innerLabels);
        updateInnerLabels.exit.remove();
        const enterInnerLabels = updateInnerLabels.enter.append(Text);
        enterInnerLabels.each((node) => {
            node.pointerEvents = PointerEvents.None;
        });
        this.innerLabelsSelection = updateInnerLabels.merge(enterInnerLabels);
    }

    private datumSectorRefs = new WeakMap<PieNodeDatum, Sector>();

    private async updateNodes() {
        if (!this.chart) {
            return;
        }

        const isVisible = this.seriesItemEnabled.indexOf(true) >= 0;
        this.group.visible = isVisible;
        this.backgroundGroup.visible = isVisible;
        this.seriesGroup.visible = isVisible;
        this.highlightGroup.visible = isVisible && this.chart?.highlightedDatum?.series === this;
        this.labelGroup!.visible = isVisible;

        this.seriesGroup.opacity = this.getOpacity();

        this.updateInnerCircle();

        const {
            fills,
            strokes,
            fillOpacity: seriesFillOpacity,
            strokeOpacity,
            radiusScale,
            callout,
            shadow,
            chart: { highlightedDatum },
            highlightStyle: {
                fill: deprecatedFill,
                stroke: deprecatedStroke,
                strokeWidth: deprecatedStrokeWidth,
                item: {
                    fill: highlightedFill = deprecatedFill,
                    fillOpacity: highlightFillOpacity = seriesFillOpacity,
                    stroke: highlightedStroke = deprecatedStroke,
                    strokeWidth: highlightedDatumStrokeWidth = deprecatedStrokeWidth,
                },
            },
            angleKey,
            radiusKey,
            formatter,
        } = this;

        const centerOffsets: number[] = [];
        const innerRadius = radiusScale.convert(0);

        const updateSectorFn = (sector: Sector, datum: PieNodeDatum, index: number, isDatumHighlighted: boolean) => {
            const radius = radiusScale.convert(datum.radius, clamper);
            const fill =
                isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : fills[index % fills.length];
            const fillOpacity = isDatumHighlighted ? highlightFillOpacity : seriesFillOpacity;
            const stroke =
                isDatumHighlighted && highlightedStroke !== undefined
                    ? highlightedStroke
                    : strokes[index % strokes.length];
            const strokeWidth =
                isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                    ? highlightedDatumStrokeWidth
                    : this.getStrokeWidth(this.strokeWidth);

            let format: PieSeriesFormat | undefined = undefined;
            if (formatter) {
                format = formatter({
                    datum: datum.datum,
                    angleKey,
                    radiusKey,
                    fill,
                    stroke,
                    strokeWidth,
                    highlighted: isDatumHighlighted,
                });
            }

            // Bring highlighted sector's parent group to front.
            const parent = sector.parent && sector.parent.parent;
            if (isDatumHighlighted && parent) {
                parent.removeChild(sector.parent!);
                parent.appendChild(sector.parent!);
            }

            sector.innerRadius = Math.max(0, innerRadius);
            sector.outerRadius = Math.max(0, radius);

            sector.startAngle = datum.startAngle;
            sector.endAngle = datum.endAngle;

            sector.fill = (format && format.fill) || fill;
            sector.stroke = (format && format.stroke) || stroke;
            sector.strokeWidth = format && format.strokeWidth !== undefined ? format.strokeWidth : strokeWidth;
            sector.fillOpacity = fillOpacity;
            sector.strokeOpacity = strokeOpacity;
            sector.lineDash = this.lineDash;
            sector.lineDashOffset = this.lineDashOffset;
            sector.fillShadow = shadow;
            sector.lineJoin = 'round';

            centerOffsets.push(sector.centerOffset);

            this.datumSectorRefs.set(datum, sector);
        };

        this.groupSelection
            .selectByTag<Sector>(PieNodeTag.Sector)
            .each((node, datum, index) => updateSectorFn(node, datum, index, false));
        this.highlightSelection.selectByTag<Sector>(PieNodeTag.Sector).each((node, datum, index) => {
            const isDatumHighlighted =
                !!highlightedDatum && highlightedDatum.series === this && datum.itemId === highlightedDatum.itemId;

            node.visible = isDatumHighlighted;
            if (node.visible) {
                updateSectorFn(node, datum, index, isDatumHighlighted);
            }
        });

        const { colors: calloutColors, length: calloutLength, strokeWidth: calloutStrokeWidth } = callout;

        this.labelSelection.selectByTag<Line>(PieNodeTag.Callout).each((line, datum, index) => {
            const radius = radiusScale.convert(datum.radius, clamper);
            const outerRadius = Math.max(0, radius);

            if (datum.label && outerRadius !== 0) {
                line.strokeWidth = calloutStrokeWidth;
                line.stroke = calloutColors[index % calloutColors.length];
                line.x1 = datum.midCos * outerRadius;
                line.y1 = datum.midSin * outerRadius;
                line.x2 = datum.midCos * (outerRadius + calloutLength);
                line.y2 = datum.midSin * (outerRadius + calloutLength);
            } else {
                line.stroke = undefined;
            }
        });

        {
            const { offset, fontStyle, fontWeight, fontSize, fontFamily, color } = this.label;

            this.labelSelection.selectByTag<Text>(PieNodeTag.Label).each((text, datum, index) => {
                const label = datum.label;
                const radius = radiusScale.convert(datum.radius, clamper);
                const outerRadius = Math.max(0, radius);

                if (label && outerRadius !== 0) {
                    const labelRadius = centerOffsets[index] + outerRadius + calloutLength + offset;

                    text.fontStyle = fontStyle;
                    text.fontWeight = fontWeight;
                    text.fontSize = fontSize;
                    text.fontFamily = fontFamily;
                    text.text = label.text;
                    text.x = datum.midCos * labelRadius;
                    text.y = datum.midSin * labelRadius;
                    text.fill = color;
                    text.textAlign = label.textAlign;
                    text.textBaseline = label.textBaseline;
                } else {
                    text.fill = undefined;
                }
            });
        }

        this.updateSectorLabelNodes();
        this.updateInnerLabelNodes();
    }

    private updateSectorLabelNodes() {
        const { radiusScale } = this;
        const innerRadius = radiusScale.convert(0);
        const { fontSize, fontStyle, fontWeight, fontFamily, positionOffset, positionRatio, color } = this.sectorLabel;

        const isDoughnut = innerRadius > 0;
        const singleVisibleSector = this.seriesItemEnabled.filter(Boolean).length === 1;

        this.sectorLabelSelection.each((text, datum) => {
            const sectorLabel = datum.sectorLabel;
            const radius = radiusScale.convert(datum.radius, clamper);
            const outerRadius = Math.max(0, radius);

            let isTextVisible = false;
            if (sectorLabel && outerRadius !== 0) {
                const labelRadius = innerRadius * (1 - positionRatio) + radius * positionRatio + positionOffset;

                text.fill = color;
                text.fontStyle = fontStyle;
                text.fontWeight = fontWeight;
                text.fontSize = fontSize;
                text.fontFamily = fontFamily;
                text.text = sectorLabel.text;
                const shouldPutTextInCenter = !isDoughnut && singleVisibleSector;
                if (shouldPutTextInCenter) {
                    text.x = 0;
                    text.y = 0;
                } else {
                    text.x = datum.midCos * labelRadius;
                    text.y = datum.midSin * labelRadius;
                }
                text.textAlign = 'center';
                text.textBaseline = 'middle';

                const sector = this.datumSectorRefs.get(datum);
                if (sector) {
                    const bbox = text.computeBBox();
                    const corners = [
                        [bbox.x, bbox.y],
                        [bbox.x + bbox.width, bbox.y],
                        [bbox.x + bbox.width, bbox.y + bbox.height],
                        [bbox.x, bbox.y + bbox.height],
                    ];
                    const { startAngle, endAngle } = datum;
                    const sectorBounds = { startAngle, endAngle, innerRadius, outerRadius };
                    if (corners.every(([x, y]) => isPointInArc(x, y, sectorBounds))) {
                        isTextVisible = true;
                    }
                }
            }
            text.visible = isTextVisible;
        });
    }

    private updateInnerCircle() {
        const circle = this._innerCircleNode;
        if (!circle) {
            return;
        }
        const innerRadius = this.getInnerRadius();
        if (innerRadius === 0) {
            circle.size = 0;
        } else {
            const circleRadius = Math.min(innerRadius, this.getOuterRadius());
            const antiAliasingPadding = 1;
            circle.size = Math.ceil(circleRadius * 2 + antiAliasingPadding);
        }
    }

    private updateInnerLabelNodes() {
        const textBBoxes: BBox[] = [];
        const margins: number[] = [];
        this.innerLabelsSelection.each((text, datum) => {
            const { fontStyle, fontWeight, fontSize, fontFamily, color } = datum;
            text.fontStyle = fontStyle;
            text.fontWeight = fontWeight;
            text.fontSize = fontSize;
            text.fontFamily = fontFamily;
            text.text = datum.text;
            text.x = 0;
            text.y = 0;
            text.fill = color;
            text.textAlign = 'center';
            text.textBaseline = 'alphabetic';
            textBBoxes.push(text.computeBBox());
            margins.push(datum.margin);
        });
        const getMarginTop = (index: number) => (index === 0 ? 0 : margins[index]);
        const getMarginBottom = (index: number) => (index === margins.length - 1 ? 0 : margins[index]);
        const totalHeight = textBBoxes.reduce((sum, bbox, i) => {
            return sum + bbox.height + getMarginTop(i) + getMarginBottom(i);
        }, 0);
        const totalWidth = Math.max(...textBBoxes.map((bbox) => bbox.width));
        const innerRadius = this.getInnerRadius();
        const labelRadius = Math.sqrt(Math.pow(totalWidth / 2, 2) + Math.pow(totalHeight / 2, 2));
        const labelsVisible = labelRadius <= (innerRadius > 0 ? innerRadius : this.getOuterRadius());

        const textBottoms: number[] = [];
        for (let i = 0, prev = -totalHeight / 2; i < textBBoxes.length; i++) {
            const bbox = textBBoxes[i];
            const bottom = bbox.height + prev + getMarginTop(i);
            textBottoms.push(bottom);
            prev = bottom + getMarginBottom(i);
        }
        this.innerLabelsSelection.each((text, _datum, index) => {
            text.y = textBottoms[index];
            text.visible = labelsVisible;
        });
    }

    fireNodeClickEvent(event: MouseEvent, datum: PieNodeDatum): void {
        this.fireEvent<PieSeriesNodeClickEvent>({
            type: 'nodeClick',
            event,
            series: this,
            datum: datum.datum,
            angleKey: this.angleKey,
            labelKey: this.labelKey,
            radiusKey: this.radiusKey,
        });
    }

    getTooltipHtml(nodeDatum: PieNodeDatum): string {
        const { angleKey } = this;

        if (!angleKey) {
            return '';
        }

        const { fills, tooltip, angleName, radiusKey, radiusName, labelKey, labelName } = this;

        const { renderer: tooltipRenderer } = tooltip;
        const color = fills[nodeDatum.index % fills.length];
        const datum = nodeDatum.datum;
        const label = labelKey ? `${datum[labelKey]}: ` : '';
        const angleValue = datum[angleKey];
        const formattedAngleValue = typeof angleValue === 'number' ? toFixed(angleValue) : angleValue.toString();
        const title = this.title ? this.title.text : undefined;
        const content = label + formattedAngleValue;
        const defaults: TooltipRendererResult = {
            title,
            backgroundColor: color,
            content,
        };

        if (tooltipRenderer) {
            return toTooltipHtml(
                tooltipRenderer({
                    datum,
                    angleKey,
                    angleValue,
                    angleName,
                    radiusKey,
                    radiusValue: radiusKey ? datum[radiusKey] : undefined,
                    radiusName,
                    labelKey,
                    labelName,
                    title,
                    color,
                }),
                defaults
            );
        }

        return toTooltipHtml(defaults);
    }

    listSeriesItems(legendData: LegendDatum[]): void {
        const { labelKey, data } = this;

        if (data && data.length && labelKey) {
            const { fills, strokes, id } = this;

            const titleText = this.title && this.title.showInLegend && this.title.text;
            data.forEach((datum, index) => {
                let labelParts = [];
                titleText && labelParts.push(titleText);
                labelParts.push(String(datum[labelKey]));

                legendData.push({
                    id,
                    itemId: index,
                    enabled: this.seriesItemEnabled[index],
                    label: {
                        text: labelParts.join(' - '),
                    },
                    marker: {
                        fill: fills[index % fills.length],
                        stroke: strokes[index % strokes.length],
                        fillOpacity: this.fillOpacity,
                        strokeOpacity: this.strokeOpacity,
                    },
                });
            });
        }
    }

    toggleSeriesItem(itemId: number, enabled: boolean): void {
        this.seriesItemEnabled[itemId] = enabled;
        this.nodeDataRefresh = true;
    }
}
