import { Group } from "../../../scene/group";
import { Line } from "../../../scene/shape/line";
import { Text } from "../../../scene/shape/text";
import { Selection } from "../../../scene/selection";
import { DropShadow } from "../../../scene/dropShadow";
import { LinearScale } from "../../../scale/linearScale";
import { Sector } from "../../../scene/shape/sector";
import { PolarTooltipRendererParams, SeriesNodeDatum, HighlightStyle, SeriesTooltip } from "./../series";
import { Label } from "../../label";
import { PointerEvents } from "../../../scene/node";
import { normalizeAngle180, toRadians } from "../../../util/angle";
import { toFixed, mod } from "../../../util/number";
import { LegendDatum } from "../../legend";
import { Caption } from "../../../caption";
import { Observable, TypedEvent } from "../../../util/observable";
import { PolarSeries } from "./polarSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { TooltipRendererResult, toTooltipHtml } from "../../chart";

export interface PieSeriesNodeClickEvent extends TypedEvent {
    readonly type: 'nodeClick';
    readonly event: MouseEvent;
    readonly series: PieSeries;
    readonly datum: any;
    readonly angleKey: string;
    readonly labelKey?: string;
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
}

export interface PieTooltipRendererParams extends PolarTooltipRendererParams {
    readonly labelKey?: string;
    readonly labelName?: string;
}

class PieHighlightStyle extends HighlightStyle {
    centerOffset?: number;
}

enum PieNodeTag {
    Sector,
    Callout,
    Label
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

class PieSeriesLabel extends Label {
    offset = 3; // from the callout line
    minAngle = 20; // in degrees
    formatter?: (params: { value: any }) => string = undefined;
}

class PieSeriesCallout extends Observable {
    colors: string[] = [
        '#874349',
        '#718661',
        '#a48f5f',
        '#5a7088',
        '#7f637a',
        '#5d8692'
    ];
    length: number = 10;
    strokeWidth: number = 1;
}

export class PieSeriesTooltip extends SeriesTooltip {
    renderer?: (params: PieTooltipRendererParams) => string | TooltipRendererResult = undefined;
}

export class PieTitle extends Caption {
    showInLegend = false;
}

export class PieSeries extends PolarSeries<PieNodeDatum> {

    static className = 'PieSeries';
    static type = 'pie' as const;

    private radiusScale: LinearScale = new LinearScale();
    private groupSelection: Selection<Group, Group, PieNodeDatum, any> = Selection.select(this.pickGroup).selectAll<Group>();
    private highlightSelection: Selection<Group, Group, PieNodeDatum, any> = Selection.select(this.highlightGroup).selectAll<Group>();

    /**
     * The processed data that gets visualized.
     */
    private groupSelectionData: PieNodeDatum[] = [];

    private angleScale: LinearScale = (() => {
        const scale = new LinearScale();
        // Each slice is a ratio of the whole, where all ratios add up to 1.
        scale.domain = [0, 1];
        // Add 90 deg to start the first pie at 12 o'clock.
        scale.range = [-Math.PI, Math.PI].map(angle => angle + Math.PI / 2);
        return scale;
    })();

    // When a user toggles a series item (e.g. from the legend), its boolean state is recorded here.
    public seriesItemEnabled: boolean[] = [];

    private _title?: PieTitle;
    set title(value: PieTitle | undefined) {
        const oldTitle = this._title;

        if (oldTitle !== value) {
            if (oldTitle) {
                this.seriesGroup.removeChild(oldTitle.node);
            }

            if (value) {
                value.node.textBaseline = 'bottom';
                this.seriesGroup.appendChild(value.node);
            }

            this._title = value;
        }
    }
    get title(): PieTitle | undefined {
        return this._title;
    }

    readonly label = new PieSeriesLabel();
    readonly callout = new PieSeriesCallout();

    tooltip: PieSeriesTooltip = new PieSeriesTooltip();

    set data(input: any[] | undefined) {
        this._data = input;
        this.seriesItemEnabled = input?.map(() => true) || [];
    }
    get data() {
        return this._data;
    }

    /**
     * The key of the numeric field to use to determine the angle (for example,
     * a pie slice angle).
     */
    angleKey = '';
    angleName = '';

    /**
     * The key of the numeric field to use to determine the radii of pie slices.
     * The largest value will correspond to the full radius and smaller values to
     * proportionally smaller radii.
     */
    radiusKey?: string = undefined;
    radiusName?: string = undefined;
    radiusMin?: number = undefined;
    radiusMax?: number = undefined;

    labelKey?: string = undefined;
    labelName?: string = undefined;

    fills: string[] = [
        '#c16068',
        '#a2bf8a',
        '#ebcc87',
        '#80a0c3',
        '#b58dae',
        '#85c0d1'
    ];

    strokes: string[] = [
        '#874349',
        '#718661',
        '#a48f5f',
        '#5a7088',
        '#7f637a',
        '#5d8692'
    ];

    fillOpacity = 1;
    strokeOpacity = 1;

    lineDash?: number[] = [0];
    lineDashOffset: number = 0;

    formatter?: (params: PieSeriesFormatterParams) => PieSeriesFormat = undefined;

    /**
     * The series rotation in degrees.
     */
    rotation = 0;

    outerRadiusOffset = 0;

    innerRadiusOffset = 0;

    strokeWidth = 1;

    shadow?: DropShadow = undefined;

    readonly highlightStyle = new PieHighlightStyle();

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

    processData(): boolean {
        const { angleKey, radiusKey, seriesItemEnabled, angleScale, groupSelectionData, label } = this;
        const data = angleKey && this.data ? this.data : [];

        const angleData: number[] = data.map((datum, index) => seriesItemEnabled[index] && Math.abs(+datum[angleKey]) || 0);
        const angleDataTotal = angleData.reduce((a, b) => a + b, 0);

        // The ratios (in [0, 1] interval) used to calculate the end angle value for every pie slice.
        // Each slice starts where the previous one ends, so we only keep the ratios for end angles.
        const angleDataRatios = (() => {
            let sum = 0;
            return angleData.map(datum => sum += datum / angleDataTotal);
        })();

        const labelFormatter = label.formatter;
        const labelKey = label.enabled && this.labelKey;
        let labelData: string[] = [];
        let radiusData: number[] = [];

        if (labelKey) {
            if (labelFormatter) {
                labelData = data.map(datum => labelFormatter({ value: datum[labelKey] }));
            } else {
                labelData = data.map(datum => String(datum[labelKey]));
            }
        }

        if (radiusKey) {
            const { radiusMin, radiusMax } = this;
            const radii = data.map(datum => Math.abs(datum[radiusKey]));
            const min = radiusMin !== undefined ? radiusMin : Math.min(...radii);
            const max = radiusMax !== undefined ? radiusMax : Math.max(...radii);
            const delta = max - min;

            radiusData = radii.map(value => delta ? (value - min) / delta : 1);
        }

        groupSelectionData.length = 0;

        const rotation = toRadians(this.rotation);
        const halfPi = Math.PI / 2;

        let datumIndex = 0;

        const quadrantTextOpts: {textAlign: CanvasTextAlign, textBaseline: CanvasTextBaseline}[] = [
            { textAlign: 'center', textBaseline: 'bottom' },
            { textAlign: 'left', textBaseline: 'middle' },
            { textAlign: 'center', textBaseline: 'hanging' },
            { textAlign: 'right', textBaseline: 'middle' },
        ];

        // Process segments.
        let end = 0;
        angleDataRatios.forEach((start) => {
            if (isNaN(start)) { return; } // No segments displayed - nothing to do.

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
            const quadrantStart = -3 * Math.PI / 4; // same as `normalizeAngle180(toRadians(-135))`
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
                label: labelVisible ? {
                    text: labelData[datumIndex],
                    textAlign,
                    textBaseline
                } : undefined
            });

            datumIndex++;
            end = start; // Update for next iteration.
        });

        return true;
    }

    createNodeData() {
        return [];
    }

    update(): void {
        const { radius, innerRadiusOffset, outerRadiusOffset, title } = this;

        this.radiusScale.range = [
            innerRadiusOffset ? radius + innerRadiusOffset : 0,
            radius + (outerRadiusOffset || 0)
        ];

        this.group.translationX = this.centerX;
        this.group.translationY = this.centerY;

        if (title) {
            const outerRadius = Math.max(0, this.radiusScale.range[1]);

            if (outerRadius === 0) {
                title.node.visible = false;
            } else {
                title.node.translationY = -radius - outerRadiusOffset - 2;
                title.node.visible = title.enabled;
            }
        }

        this.updateSelections();
        this.updateNodes();
    }

    private updateSelections() {
        this.updateGroupSelection();
    }

    private updateGroupSelection() {
        const { groupSelection, highlightSelection } = this;

        const update = (selection: typeof groupSelection, appendLabels: boolean) => {
            const updateGroups = selection.setData(this.groupSelectionData);
            updateGroups.exit.remove();

            const enterGroups = updateGroups.enter.append(Group);
            enterGroups.append(Sector).each(node => node.tag = PieNodeTag.Sector);
            if (appendLabels) {
                enterGroups.append(Line).each(node => {
                    node.tag = PieNodeTag.Callout;
                    node.pointerEvents = PointerEvents.None;
                });
                enterGroups.append(Text).each(node => {
                    node.tag = PieNodeTag.Label;
                    node.pointerEvents = PointerEvents.None;
                });
            }

            return updateGroups.merge(enterGroups);
        };

        this.groupSelection = update(groupSelection, true);
        this.highlightSelection = update(highlightSelection, false);
    }

    private updateNodes() {
        if (!this.chart) {
            return;
        }

        const isVisible = this.visible && this.seriesItemEnabled.indexOf(true) >= 0;
        this.group.visible = isVisible;
        this.seriesGroup.visible = isVisible;
        this.highlightGroup.visible = isVisible && this.chart?.highlightedDatum?.series === this;

        this.seriesGroup.opacity = this.getOpacity();

        const {
            fills, strokes, fillOpacity, strokeOpacity,
            radiusScale, callout, shadow,
            chart: { highlightedDatum },
            highlightStyle: {
                fill: deprecatedFill,
                stroke: deprecatedStroke,
                strokeWidth: deprecatedStrokeWidth,
                item: {
                    fill: highlightedFill = deprecatedFill,
                    stroke: highlightedStroke = deprecatedStroke,
                    strokeWidth: highlightedDatumStrokeWidth = deprecatedStrokeWidth,
                }
            },
            angleKey, radiusKey, formatter
        } = this;

        const centerOffsets: number[] = [];
        const innerRadius = radiusScale.convert(0);

        const updateSectorFn = (sector: Sector, datum: PieNodeDatum, index: number, isDatumHighlighted: boolean) => {
            const radius = radiusScale.convert(datum.radius);
            const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : fills[index % fills.length];
            const stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : strokes[index % strokes.length];
            const strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
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
                    highlighted: isDatumHighlighted
                });
            }

            // Bring highlighted slice's parent group to front.
            const parent = sector.parent && sector.parent.parent;
            if (isDatumHighlighted && parent) {
                parent.removeChild(sector.parent!);
                parent.appendChild(sector.parent!);
            }

            sector.innerRadius = Math.max(0, innerRadius);
            sector.outerRadius = Math.max(0, radius);

            sector.startAngle = datum.startAngle;
            sector.endAngle = datum.endAngle;

            sector.fill = format && format.fill || fill;
            sector.stroke = format && format.stroke || stroke;
            sector.strokeWidth = format && format.strokeWidth !== undefined ? format.strokeWidth : strokeWidth;
            sector.fillOpacity = fillOpacity;
            sector.strokeOpacity = strokeOpacity;
            sector.lineDash = this.lineDash;
            sector.lineDashOffset = this.lineDashOffset;
            sector.fillShadow = shadow;
            sector.lineJoin = 'round';

            centerOffsets.push(sector.centerOffset);
        };

        this.groupSelection.selectByTag<Sector>(PieNodeTag.Sector)
            .each((node, datum, index) => updateSectorFn(node, datum, index, false));
        this.highlightSelection.selectByTag<Sector>(PieNodeTag.Sector)
            .each((node, datum, index) => {
                const isDatumHighlighted = !!highlightedDatum && highlightedDatum.series === this && datum.itemId === highlightedDatum.itemId;

                node.visible = isDatumHighlighted;
                if (node.visible) {
                    updateSectorFn(node, datum, index, isDatumHighlighted);
                }
            });

        const { colors: calloutColors, length: calloutLength, strokeWidth: calloutStrokeWidth } = callout;

        this.groupSelection.selectByTag<Line>(PieNodeTag.Callout).each((line, datum, index) => {
            const radius = radiusScale.convert(datum.radius);
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

            this.groupSelection.selectByTag<Text>(PieNodeTag.Label).each((text, datum, index) => {
                const label = datum.label;
                const radius = radiusScale.convert(datum.radius);
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
    }

    fireNodeClickEvent(event: MouseEvent, datum: PieNodeDatum): void {
        this.fireEvent<PieSeriesNodeClickEvent>({
            type: 'nodeClick',
            event,
            series: this,
            datum: datum.datum,
            angleKey: this.angleKey,
            labelKey: this.labelKey,
            radiusKey: this.radiusKey
        });
    }

    getTooltipHtml(nodeDatum: PieNodeDatum): string {
        const { angleKey } = this;

        if (!angleKey) {
            return '';
        }

        const {
            fills,
            tooltip,
            angleName,
            radiusKey,
            radiusName,
            labelKey,
            labelName,
        } = this;

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
            content
        };

        if (tooltipRenderer) {
            return toTooltipHtml(tooltipRenderer({
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
            }), defaults);
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
                        text: labelParts.join(' - ')
                    },
                    marker: {
                        fill: fills[index % fills.length],
                        stroke: strokes[index % strokes.length],
                        fillOpacity: this.fillOpacity,
                        strokeOpacity: this.strokeOpacity
                    }
                });
            });
        }
    }

    toggleSeriesItem(itemId: number, enabled: boolean): void {
        this.seriesItemEnabled[itemId] = enabled;
    }
}
