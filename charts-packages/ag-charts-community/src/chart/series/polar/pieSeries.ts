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
import { SeriesNodeDatum, HighlightStyle, SeriesTooltip, SeriesNodeClickEvent } from './../series';
import { Label } from '../../label';
import { PointerEvents } from '../../../scene/node';
import { normalizeAngle180, toRadians } from '../../../util/angle';
import { doOnce } from '../../../util/function';
import { toFixed, mod } from '../../../util/number';
import { Layers } from '../../layers';
import { LegendDatum } from '../../legend';
import { Caption } from '../../../caption';
import { PolarSeries } from './polarSeries';
import { ChartAxisDirection } from '../../chartAxis';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { DeprecatedAndRenamedTo } from '../../../util/deprecation';
import {
    BOOLEAN,
    NUMBER,
    OPT_FUNCTION,
    OPT_LINE_DASH,
    OPT_NUMBER,
    OPT_STRING,
    STRING,
    COLOR_STRING_ARRAY,
    OPT_COLOR_STRING_ARRAY,
    Validate,
    COLOR_STRING,
} from '../../../util/validation';
import {
    AgPieSeriesLabelFormatterParams,
    AgPieSeriesTooltipRendererParams,
    AgTooltipRendererResult,
    AgPieSeriesFormat,
    AgPieSeriesFormatterParams,
} from '../../agChartOptions';

class PieSeriesNodeClickEvent extends SeriesNodeClickEvent<any> {
    readonly angleKey: string;
    @DeprecatedAndRenamedTo('calloutLabelKey')
    readonly labelKey?: string;
    readonly calloutLabelKey?: string;
    readonly sectorLabelKey?: string;
    readonly radiusKey?: string;

    constructor(
        angleKey: string,
        calloutLabelKey: string | undefined,
        sectorLabelKey: string | undefined,
        radiusKey: string | undefined,
        nativeEvent: MouseEvent,
        datum: PieNodeDatum,
        series: PieSeries
    ) {
        super(nativeEvent, datum, series);
        this.angleKey = angleKey;
        this.calloutLabelKey = calloutLabelKey;
        this.sectorLabelKey = sectorLabelKey;
        this.radiusKey = radiusKey;
    }
}

interface PieNodeDatum extends SeriesNodeDatum {
    readonly index: number;
    readonly radius: number; // in the [0, 1] range
    readonly startAngle: number;
    readonly endAngle: number;
    readonly midAngle: number;
    readonly midCos: number;
    readonly midSin: number;

    readonly calloutLabel?: {
        readonly text: string;
        readonly textAlign: CanvasTextAlign;
        readonly textBaseline: CanvasTextBaseline;
    };

    readonly sectorLabel?: {
        readonly text: string;
    };

    readonly sectorFormat: AgPieSeriesFormat;
}

enum PieNodeTag {
    Sector,
    Callout,
    Label,
}

class PieSeriesCalloutLabel extends Label {
    @Validate(NUMBER(0))
    offset = 3; // from the callout line

    @Validate(NUMBER(0))
    minAngle = 20; // in degrees

    @Validate(OPT_FUNCTION)
    formatter?: (params: AgPieSeriesLabelFormatterParams<any>) => string = undefined;
}

class PieSeriesSectorLabel extends Label {
    @Validate(NUMBER())
    positionOffset = 0;

    @Validate(NUMBER(0, 1))
    positionRatio = 0.5;

    @Validate(OPT_FUNCTION)
    formatter?: (params: AgPieSeriesLabelFormatterParams<any>) => string = undefined;
}

class PieSeriesCalloutLine {
    @Validate(OPT_COLOR_STRING_ARRAY)
    colors: string[] | undefined = undefined;

    @Validate(NUMBER(0))
    length: number = 10;

    @Validate(NUMBER(0))
    strokeWidth: number = 1;
}

class PieSeriesTooltip extends SeriesTooltip {
    @Validate(OPT_FUNCTION)
    renderer?: (params: AgPieSeriesTooltipRendererParams) => string | AgTooltipRendererResult = undefined;
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
        this.contentGroup
    ).selectAll<Group>();
    private highlightSelection: Selection<Group, Group, PieNodeDatum, any> = Selection.select(
        this.highlightGroup
    ).selectAll<Group>();
    private calloutLabelSelection: Selection<Group, Group, PieNodeDatum, any>;
    private sectorLabelSelection: Selection<Text, Group, PieNodeDatum, any>;
    private innerLabelsSelection: Selection<Text, Group, DoughnutInnerLabel, any>;

    // The group node that contains the background graphics.
    readonly backgroundGroup: Group;

    /**
     * The processed data that gets visualized.
     */
    private groupSelectionData: PieNodeDatum[] = [];
    private sectorFormatData: AgPieSeriesFormat[] = [];

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

    calloutLabel = new PieSeriesCalloutLabel();

    @DeprecatedAndRenamedTo('calloutLabel')
    label = this.calloutLabel;

    readonly sectorLabel = new PieSeriesSectorLabel();

    calloutLine = new PieSeriesCalloutLine();

    @DeprecatedAndRenamedTo('calloutLine')
    callout = this.calloutLine;

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
    calloutLabelKey?: string = undefined;

    @Validate(OPT_STRING)
    calloutLabelName?: string = undefined;

    @DeprecatedAndRenamedTo('calloutLabelKey')
    labelKey?: string = undefined;

    @DeprecatedAndRenamedTo('calloutLabelName')
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
    formatter?: (params: AgPieSeriesFormatterParams<any>) => AgPieSeriesFormat = undefined;

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

    readonly highlightStyle = new HighlightStyle();

    constructor() {
        super({ useLabelLayer: true });

        this.backgroundGroup = this.rootGroup.appendChild(
            new Group({
                name: `${this.id}-background`,
                layer: true,
                zIndex: Layers.SERIES_BACKGROUND_ZINDEX,
            })
        );

        const pieCalloutLabels = new Group({ name: 'pieCalloutLabels' });
        const pieSectorLabels = new Group({ name: 'pieSectorLabels' });
        const innerLabels = new Group({ name: 'innerLabels' });
        this.labelGroup!.append(pieCalloutLabels);
        this.labelGroup!.append(pieSectorLabels);
        this.labelGroup!.append(innerLabels);
        this.calloutLabelSelection = Selection.select(pieCalloutLabels).selectAll<Group>();
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

    getDomain(direction: ChartAxisDirection): any[] {
        if (direction === ChartAxisDirection.X) {
            return this.angleScale.domain;
        } else {
            return this.radiusScale.domain;
        }
    }

    async processData() {
        const {
            angleKey,
            radiusKey,
            seriesItemEnabled,
            angleScale,
            groupSelectionData,
            sectorFormatData,
            calloutLabel,
            sectorLabel,
            id: seriesId,
        } = this;
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

        const labelFormatter = calloutLabel.formatter;
        const labelKey = calloutLabel.enabled ? this.calloutLabelKey : undefined;
        const sectorLabelKey = sectorLabel.enabled ? this.sectorLabelKey : undefined;
        let labelData: string[] = [];
        let sectorLabelData: string[] = [];
        let radiusData: number[] = [];

        const getLabelFormatterParams = (datum: any): AgPieSeriesLabelFormatterParams<any> => {
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
                labelName: this.calloutLabelName,
                calloutLabelKey: labelKey,
                calloutLabelValue: labelKey ? datum[labelKey] : undefined,
                calloutLabelName: this.calloutLabelName,
                sectorLabelKey,
                sectorLabelValue: sectorLabelKey ? datum[sectorLabelKey] : undefined,
                sectorLabelName: this.sectorLabelName,
                seriesId,
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
                    const formatterParams: AgPieSeriesLabelFormatterParams<any> = {
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
        sectorFormatData.length = 0;
        sectorFormatData.push(...data.map((datum, datumIdx) => this.getSectorFormat(datum, datumIdx, datumIdx, false)));

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

            const labelMinAngle = toRadians(calloutLabel.minAngle);
            const labelVisible = labelKey && span > labelMinAngle;
            const midAngle180 = normalizeAngle180(midAngle);

            // Split the circle into quadrants like so: ⊗
            const quadrantStart = (-3 * Math.PI) / 4; // same as `normalizeAngle180(toRadians(-135))`
            const quadrantOffset = midAngle180 - quadrantStart;
            const quadrant = Math.floor(quadrantOffset / halfPi);
            const quadrantIndex = mod(quadrant, quadrantTextOpts.length);

            const { textAlign, textBaseline } = quadrantTextOpts[quadrantIndex];
            const datum = data[datumIndex];
            const itemId = datumIndex;

            groupSelectionData.push({
                series: this,
                datum,
                itemId,
                index: datumIndex,
                radius,
                startAngle,
                endAngle,
                midAngle,
                midCos,
                midSin,
                calloutLabel: labelVisible
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
                sectorFormat: sectorFormatData[datumIndex],
            });

            datumIndex++;
            end = start; // Update for next iteration.
        });
    }

    private getSectorFormat(datum: any, itemId: any, index: number, highlight: any): AgPieSeriesFormat {
        const { angleKey, radiusKey, fills, strokes, fillOpacity: seriesFillOpacity, formatter, id: seriesId } = this;

        const highlightedDatum = this.chart!.highlightedDatum;
        const isDatumHighlighted = highlight && highlightedDatum?.series === this && itemId === highlightedDatum.itemId;
        const highlightedStyle = isDatumHighlighted ? this.highlightStyle.item : null;

        const fill = highlightedStyle?.fill || fills[index % fills.length];
        const fillOpacity = highlightedStyle?.fillOpacity ?? seriesFillOpacity;
        const stroke = highlightedStyle?.stroke || strokes[index % strokes.length];
        const strokeWidth = highlightedStyle?.strokeWidth ?? this.getStrokeWidth(this.strokeWidth);

        let format: AgPieSeriesFormat | undefined;
        if (formatter) {
            format = formatter({
                datum,
                angleKey,
                radiusKey,
                fill,
                stroke,
                strokeWidth,
                highlighted: isDatumHighlighted,
                seriesId,
            });
        }

        return {
            fill: format?.fill || fill,
            fillOpacity: format?.fillOpacity ?? fillOpacity,
            stroke: format?.stroke || stroke,
            strokeWidth: format?.strokeWidth ?? strokeWidth,
        };
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

    updateRadiusScale() {
        const innerRadius = this.getInnerRadius();
        const outerRadius = this.getOuterRadius();
        this.radiusScale.range = [innerRadius, outerRadius];
    }

    async update() {
        const { title } = this;
        this.updateRadiusScale();

        this.rootGroup.translationX = this.centerX;
        this.rootGroup.translationY = this.centerY;

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
        const {
            groupSelection,
            highlightSelection,
            calloutLabelSelection,
            sectorLabelSelection,
            innerLabelsSelection,
        } = this;

        const update = (selection: typeof groupSelection) => {
            const updateGroups = selection.setData(this.groupSelectionData);
            updateGroups.exit.remove();

            const enterGroups = updateGroups.enter.append(Group);
            enterGroups.append(Sector).each((node) => (node.tag = PieNodeTag.Sector));

            return updateGroups.merge(enterGroups);
        };

        this.groupSelection = update(groupSelection);
        this.highlightSelection = update(highlightSelection);

        const updateCalloutLabels = calloutLabelSelection.setData(this.groupSelectionData);
        updateCalloutLabels.exit.remove();

        const enterCalloutLabels = updateCalloutLabels.enter.append(Group);
        enterCalloutLabels.append(Line).each((node) => {
            node.tag = PieNodeTag.Callout;
            node.pointerEvents = PointerEvents.None;
        });
        enterCalloutLabels.append(Text).each((node) => {
            node.tag = PieNodeTag.Label;
            node.pointerEvents = PointerEvents.None;
        });
        this.calloutLabelSelection = updateCalloutLabels.merge(enterCalloutLabels);

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
        this.rootGroup.visible = isVisible;
        this.backgroundGroup.visible = isVisible;
        this.contentGroup.visible = isVisible;
        this.highlightGroup.visible = isVisible && this.chart?.highlightedDatum?.series === this;
        this.labelGroup!.visible = isVisible;

        this.contentGroup.opacity = this.getOpacity();

        this.updateInnerCircle();

        const {
            radiusScale,
            chart: { highlightedDatum },
        } = this;

        const innerRadius = radiusScale.convert(0);

        const updateSectorFn = (sector: Sector, datum: PieNodeDatum, index: number, isDatumHighlighted: boolean) => {
            const radius = radiusScale.convert(datum.radius, clamper);
            // Bring highlighted sector's parent group to front.
            const sectorParent = sector.parent;
            const sectorGrandParent = sectorParent?.parent;
            if (isDatumHighlighted && sectorParent && sectorGrandParent) {
                sectorGrandParent.removeChild(sectorParent);
                sectorGrandParent.appendChild(sectorParent);
            }

            sector.innerRadius = Math.max(0, innerRadius);
            sector.outerRadius = Math.max(0, radius);

            sector.startAngle = datum.startAngle;
            sector.endAngle = datum.endAngle;

            const format = this.getSectorFormat(datum.datum, datum.itemId, index, isDatumHighlighted);

            sector.fill = format.fill;
            sector.stroke = format.stroke;
            sector.strokeWidth = format.strokeWidth!;
            sector.fillOpacity = format.fillOpacity!;
            sector.strokeOpacity = this.strokeOpacity;
            sector.lineDash = this.lineDash;
            sector.lineDashOffset = this.lineDashOffset;
            sector.fillShadow = this.shadow;
            sector.lineJoin = 'round';

            this.datumSectorRefs.set(datum, sector);
        };

        this.groupSelection
            .selectByTag<Sector>(PieNodeTag.Sector)
            .each((node, datum, index) => updateSectorFn(node, datum, index, false));
        this.highlightSelection.selectByTag<Sector>(PieNodeTag.Sector).each((node, datum, index) => {
            const isDatumHighlighted = highlightedDatum?.series === this && datum.itemId === highlightedDatum.itemId;

            node.visible = isDatumHighlighted;
            if (node.visible) {
                updateSectorFn(node, datum, index, isDatumHighlighted);
            }
        });

        this.updateCalloutLineNodes();
        this.updateCalloutLabelNodes();
        this.updateSectorLabelNodes();
        this.updateInnerLabelNodes();
    }

    updateCalloutLineNodes() {
        const { radiusScale, calloutLine } = this;
        const calloutLength = calloutLine.length;
        const calloutStrokeWidth = calloutLine.strokeWidth;
        const calloutColors = calloutLine.colors || this.strokes;
        this.calloutLabelSelection.selectByTag<Line>(PieNodeTag.Callout).each((line, datum, index) => {
            const radius = radiusScale.convert(datum.radius, clamper);
            const outerRadius = Math.max(0, radius);

            if (datum.calloutLabel && outerRadius !== 0) {
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
    }

    updateCalloutLabelNodes() {
        const { radiusScale, calloutLabel, calloutLine } = this;
        const calloutLength = calloutLine.length;
        const { offset, fontStyle, fontWeight, fontSize, fontFamily, color } = calloutLabel;
        const seriesBox = this.chart!.getSeriesRect()!;
        const seriesLeft = seriesBox.x - this.centerX;
        const seriesRight = seriesBox.x + seriesBox.width - this.centerX;

        this.calloutLabelSelection.selectByTag<Text>(PieNodeTag.Label).each((text, datum) => {
            const label = datum.calloutLabel;
            const radius = radiusScale.convert(datum.radius, clamper);
            const outerRadius = Math.max(0, radius);

            if (label && outerRadius !== 0) {
                const labelRadius = outerRadius + calloutLength + offset;

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

                // Clip text if there is overflow
                const box = text.computeBBox();
                const errPx = 1; // Prevents errors related to floating point calculations
                let t = 1;
                if (box.x + errPx < seriesLeft) {
                    t = (box.x + box.width - seriesLeft) / box.width;
                } else if (box.x + box.width - errPx > seriesRight) {
                    t = (seriesRight - box.x) / box.width;
                }
                if (t < 1) {
                    const length = Math.floor(label.text.length * t) - 1;
                    text.text = label.text.substring(0, length) + '…';
                }
                text.visible = true;
            } else {
                text.visible = false;
            }
        });
    }

    computeLabelsBBox(): BBox | null {
        const { radiusScale, calloutLabel, calloutLine } = this;
        const calloutLength = calloutLine.length;
        const { offset, fontStyle, fontWeight, fontSize, fontFamily } = calloutLabel;
        this.updateRadiusScale();

        const text = new Text();
        const textBoxes = this.groupSelectionData
            .map((datum) => {
                const label = datum.calloutLabel;
                const radius = radiusScale.convert(datum.radius, clamper);
                const outerRadius = Math.max(0, radius);
                if (!label || outerRadius === 0) {
                    return null;
                }
                const labelRadius = outerRadius + calloutLength + offset;
                text.fontStyle = fontStyle;
                text.fontWeight = fontWeight;
                text.fontSize = fontSize;
                text.fontFamily = fontFamily;
                text.text = label.text;
                text.x = datum.midCos * labelRadius;
                text.y = datum.midSin * labelRadius;
                text.textAlign = label.textAlign;
                text.textBaseline = label.textBaseline;
                return text.computeBBox();
            })
            .filter((box) => box != null) as BBox[];
        if (textBoxes.length === 0) {
            return null;
        }
        return BBox.merge(textBoxes);
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

    protected getNodeClickEvent(event: MouseEvent, datum: PieNodeDatum): PieSeriesNodeClickEvent {
        return new PieSeriesNodeClickEvent(
            this.angleKey,
            this.calloutLabelKey,
            this.sectorLabelKey,
            this.radiusKey,
            event,
            datum,
            this
        );
    }

    getTooltipHtml(nodeDatum: PieNodeDatum): string {
        const { angleKey } = this;

        if (!angleKey) {
            return '';
        }

        const {
            tooltip,
            angleName,
            radiusKey,
            radiusName,
            calloutLabelKey,
            sectorLabelKey,
            calloutLabelName,
            sectorLabelName,
            id: seriesId,
        } = this;

        const { renderer: tooltipRenderer } = tooltip;
        const color = nodeDatum.sectorFormat.fill;
        const datum = nodeDatum.datum;
        const label = calloutLabelKey ? `${datum[calloutLabelKey]}: ` : '';
        const angleValue = datum[angleKey];
        const formattedAngleValue = typeof angleValue === 'number' ? toFixed(angleValue) : angleValue.toString();
        const title = this.title ? this.title.text : undefined;
        const content = label + formattedAngleValue;
        const defaults: AgTooltipRendererResult = {
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
                    labelKey: calloutLabelKey,
                    labelName: calloutLabelName,
                    calloutLabelKey,
                    calloutLabelName,
                    sectorLabelKey,
                    sectorLabelName,
                    title,
                    color,
                    seriesId,
                }),
                defaults
            );
        }

        return toTooltipHtml(defaults);
    }

    getLegendData(): LegendDatum[] {
        const { calloutLabelKey, data, sectorFormatData } = this;

        if (data && data.length && calloutLabelKey) {
            const { id } = this;

            const legendData: LegendDatum[] = [];

            const titleText = this.title && this.title.showInLegend && this.title.text;
            data.forEach((datum, index) => {
                let labelParts = [];
                titleText && labelParts.push(titleText);
                labelParts.push(String(datum[calloutLabelKey]));

                legendData.push({
                    id,
                    itemId: index,
                    seriesId: id,
                    enabled: this.seriesItemEnabled[index],
                    label: {
                        text: labelParts.join(' - '),
                    },
                    marker: {
                        fill: sectorFormatData[index].fill!,
                        stroke: sectorFormatData[index].stroke!,
                        fillOpacity: this.fillOpacity,
                        strokeOpacity: this.strokeOpacity,
                    },
                });
            });

            return legendData;
        }

        return [];
    }

    toggleSeriesItem(itemId: number, enabled: boolean): void {
        this.seriesItemEnabled[itemId] = enabled;
        this.nodeDataRefresh = true;
    }
}
