import { Group } from "../../../scene/group";
import { Selection } from "../../../scene/selection";
import { DropShadow } from "../../../scene/dropShadow";
import {
    SeriesNodeDatum,
    CartesianTooltipRendererParams as AreaTooltipRendererParams,
    SeriesTooltip
} from "../series";
import { PointerEvents } from "../../../scene/node";
import { LegendDatum } from "../../legend";
import { Path } from "../../../scene/shape/path";
import { Marker } from "../../marker/marker";
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesMarkerFormat } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { getMarker } from "../../marker/util";
import { TooltipRendererResult, toTooltipHtml } from "../../chart";
import { findMinMax } from "../../../util/array";
import { equal } from "../../../util/equal";
import { reactive, TypedEvent } from "../../../util/observable";
import { interpolate } from "../../../util/string";
import { Text } from "../../../scene/shape/text";
import { Label } from "../../label";
import { sanitizeHtml } from "../../../util/sanitize";
import { FontStyle, FontWeight } from "../../../scene/shape/text";
import { isNumber } from "../../../util/value";
import { clamper, ContinuousScale } from "../../../scale/continuousScale";

interface AreaSelectionDatum {
    readonly itemId: string;
    readonly points: { x: number, y: number }[];
}

export interface AreaSeriesNodeClickEvent extends TypedEvent {
    readonly type: 'nodeClick';
    readonly event: MouseEvent;
    readonly series: AreaSeries;
    readonly datum: any;
    readonly xKey: string;
    readonly yKey: string;
}

interface MarkerSelectionDatum extends SeriesNodeDatum {
    readonly index: number;
    readonly point: {
        readonly x: number;
        readonly y: number;
    };
    readonly fill?: string;
    readonly stroke?: string;
    readonly yKey: string;
    readonly yValue: number;
}

interface LabelSelectionDatum {
    readonly index: number;
    readonly itemId: any;
    readonly point: {
        readonly x: number;
        readonly y: number;
    }
    readonly label?: {
        readonly text: string;
        readonly fontStyle?: FontStyle;
        readonly fontWeight?: FontWeight;
        readonly fontSize: number;
        readonly fontFamily: string;
        readonly textAlign: CanvasTextAlign;
        readonly textBaseline: CanvasTextBaseline;
        readonly fill: string;
    };
}

export { AreaTooltipRendererParams };

class AreaSeriesLabel extends Label {
    @reactive('change') formatter?: (params: { value: any }) => string;
}

export class AreaSeriesTooltip extends SeriesTooltip {
    @reactive('change') renderer?: (params: AreaTooltipRendererParams) => string | TooltipRendererResult;
    @reactive('change') format?: string;
}

export class AreaSeries extends CartesianSeries {

    static className = 'AreaSeries';
    static type = 'area' as const;

    tooltip: AreaSeriesTooltip = new AreaSeriesTooltip();

    private areaGroup = this.group.insertBefore(new Group, this.pickGroup);
    private strokeGroup = this.group.insertBefore(new Group, this.pickGroup);
    private markerGroup = this.pickGroup.appendChild(new Group);
    private labelGroup = this.group.appendChild(new Group);

    private fillSelection: Selection<Path, Group, AreaSelectionDatum, any> = Selection.select(this.areaGroup).selectAll<Path>();
    private strokeSelection: Selection<Path, Group, AreaSelectionDatum, any> = Selection.select(this.strokeGroup).selectAll<Path>();
    private markerSelection: Selection<Marker, Group, MarkerSelectionDatum, any> = Selection.select(this.markerGroup).selectAll<Marker>();
    private labelSelection: Selection<Text, Group, LabelSelectionDatum, any> = Selection.select(this.labelGroup).selectAll<Text>();

    /**
     * The assumption is that the values will be reset (to `true`)
     * in the {@link yKeys} setter.
     */
    private readonly seriesItemEnabled = new Map<string, boolean>();

    private xData: string[] = [];
    private yData: number[][] = [];
    private areaSelectionData: AreaSelectionDatum[] = [];
    private markerSelectionData: MarkerSelectionDatum[] = [];
    private labelSelectionData: LabelSelectionDatum[] = [];
    private yDomain: any[] = [];

    directionKeys = {
        x: ['xKey'],
        y: ['yKeys']
    };

    readonly marker = new CartesianSeriesMarker();

    readonly label = new AreaSeriesLabel();

    @reactive('dataChange') fills: string[] = [
        '#c16068',
        '#a2bf8a',
        '#ebcc87',
        '#80a0c3',
        '#b58dae',
        '#85c0d1'
    ];

    @reactive('dataChange') strokes: string[] = [
        '#874349',
        '#718661',
        '#a48f5f',
        '#5a7088',
        '#7f637a',
        '#5d8692'
    ];

    @reactive('update') fillOpacity = 1;
    @reactive('update') strokeOpacity = 1;

    @reactive('update') lineDash?: number[] = [0];
    @reactive('update') lineDashOffset: number = 0;

    constructor() {
        super();

        this.addEventListener('update', this.scheduleUpdate);

        const { marker, label } = this;

        marker.enabled = false;
        marker.addPropertyListener('shape', this.onMarkerShapeChange, this);
        marker.addEventListener('change', this.scheduleUpdate, this);

        label.enabled = false;
        label.addEventListener('change', this.scheduleUpdate, this);
    }

    onMarkerShapeChange() {
        this.markerSelection = this.markerSelection.setData([]);
        this.markerSelection.exit.remove();

        this.fireEvent({ type: 'legendChange' });
    }

    protected _xKey: string = '';
    set xKey(value: string) {
        if (this._xKey !== value) {
            this._xKey = value;
            this.xData = [];
            this.scheduleData();
        }
    }

    get xKey(): string {
        return this._xKey;
    }

    @reactive('update') xName: string = '';

    protected _yKeys: string[] = [];
    set yKeys(values: string[]) {
        if (!equal(this._yKeys, values)) {
            this._yKeys = values;
            this.yData = [];

            const { seriesItemEnabled } = this;
            seriesItemEnabled.clear();
            values.forEach(key => seriesItemEnabled.set(key, true));

            this.scheduleData();
        }
    }

    get yKeys(): string[] {
        return this._yKeys;
    }

    setColors(fills: string[], strokes: string[]) {
        this.fills = fills;
        this.strokes = strokes;
    }

    @reactive('update') yNames: string[] = [];

    private _normalizedTo?: number;
    set normalizedTo(value: number | undefined) {
        const absValue = value ? Math.abs(value) : undefined;

        if (this._normalizedTo !== absValue) {
            this._normalizedTo = absValue;
            this.scheduleData();
        }
    }

    get normalizedTo(): number | undefined {
        return this._normalizedTo;
    }

    @reactive('update') strokeWidth = 2;
    @reactive('update') shadow?: DropShadow;

    protected highlightedDatum?: MarkerSelectionDatum;

    processData(): boolean {
        const { xKey, yKeys, seriesItemEnabled } = this;
        const data = xKey && yKeys.length && this.data ? this.data : [];

        // If the data is an array of rows like so:
        //
        // [{
        //   xKy: 'Jan',
        //   yKey1: 5,
        //   yKey2: 7,
        //   yKey3: -9,
        // }, {
        //   xKey: 'Feb',
        //   yKey1: 10,
        //   yKey2: -15,
        //   yKey3: 20
        // }]
        //

        let keysFound = true; // only warn once
        this.xData = data.map(datum => {
            if (keysFound && !(xKey in datum)) {
                keysFound = false;
                console.warn(`The key '${xKey}' was not found in the data: `, datum);
            }
            return datum[xKey];
        });

        this.yData = data.map(datum => yKeys.map(yKey => {
            if (keysFound && !(yKey in datum)) {
                keysFound = false;
                console.warn(`The key '${yKey}' was not found in the data: `, datum);
            }
            const value = datum[yKey];

            return isFinite(value) && seriesItemEnabled.get(yKey) ? value : 0;
        }));

        // xData: ['Jan', 'Feb']
        //
        // yData: [
        //   [5, 7, -9],
        //   [10, -15, 20]
        // ]

        const { yData, normalizedTo } = this;

        const yMinMax = yData.map(values => findMinMax(values)); // used for normalization
        const yLargestMinMax = this.findLargestMinMax(yMinMax);

        // Calculate the sum of the absolute values of all items in each stack. Used for normalization of stacked areas.
        const yAbsTotal = this.yData.map(values => values.reduce((acc, stack) => {
            acc += Math.abs(stack);
            return acc;
        }, 0));

        let yMin: number;
        let yMax: number;

        if (normalizedTo && isFinite(normalizedTo)) {
            yMin = yLargestMinMax.min < 0 ? -normalizedTo : 0;
            yMax = yLargestMinMax.max > 0 ? normalizedTo : 0;
            yData.forEach((stack, i) => stack.forEach((y, j) => stack[j] = y / yAbsTotal[i] * normalizedTo));
        } else {
            yMin = yLargestMinMax.min;
            yMax = yLargestMinMax.max;
        }

        if (yMin === 0 && yMax === 0) {
            yMax = 1;
        }

        this.yDomain = this.fixNumericExtent([yMin, yMax], 'y');

        this.fireEvent({ type: 'dataProcessed' });

        return true;
    }

    findLargestMinMax(totals: { min: number, max: number }[]): { min: number, max: number } {
        let min = 0;
        let max = 0;

        for (const total of totals) {
            if (total.min < min) {
                min = total.min;
            }
            if (total.max > max) {
                max = total.max;
            }
        }

        return { min, max };
    }

    getDomain(direction: ChartAxisDirection): any[] {
        if (direction === ChartAxisDirection.X) {
            return this.xData;
        } else {
            return this.yDomain;
        }
    }

    update(): void {
        this.updatePending = false;

        this.updateSelections();
        this.updateNodes();
    }

    updateSelections() {
        if (!this.nodeDataPending) {
            return;
        }
        this.nodeDataPending = false;

        this.createSelectionData();

        this.updateFillSelection();
        this.updateStrokeSelection();
        this.updateMarkerSelection();
        this.updateLabelSelection();
    }

    updateNodes() {
        this.group.visible = this.visible && this.xData.length > 0 && this.yData.length > 0;
        this.updateFillNodes();
        this.updateStrokeNodes();
        this.updateMarkerNodes();
        this.updateLabelNodes();
    }

    private createSelectionData() {
        const {
            data, xAxis, yAxis, xData, yData,
            areaSelectionData, markerSelectionData, labelSelectionData
        } = this;

        if (!data || !xAxis || !yAxis || !xData.length || !yData.length) {
            return;
        }

        const { yKeys, marker, label, fills, strokes } = this;
        const { scale: xScale } = xAxis;
        const { scale: yScale } = yAxis;

        const xOffset = (xScale.bandwidth || 0) / 2;
        const yOffset = (yScale.bandwidth || 0) / 2;
        const last = xData.length * 2 - 1;

        areaSelectionData.length = 0;
        markerSelectionData.length = 0;
        labelSelectionData.length = 0;

        xData.forEach((xDatum, i) => {
            const yDatum = yData[i];
            const seriesDatum = data[i];
            const x = xScale.convert(xDatum) + xOffset;

            let prevMin = 0;
            let prevMax = 0;

            yDatum.forEach((curr, j) => {
                const prev = curr < 0 ? prevMin : prevMax;

                const continuousY = yScale instanceof ContinuousScale;
                const y = yScale.convert(prev + curr, continuousY ? clamper : undefined);

                const yKey = yKeys[j];
                const yValue: number = seriesDatum[yKey];

                if (marker) {
                    markerSelectionData.push({
                        index: i,
                        series: this,
                        itemId: yKey,
                        datum: seriesDatum,
                        yValue,
                        yKey,
                        point: { x, y },
                        fill: fills[j % fills.length],
                        stroke: strokes[j % strokes.length]
                    });
                }

                let labelText: string;

                if (label.formatter) {
                    labelText = label.formatter({ value: yValue });
                } else {
                    labelText = isNumber(yValue) ? yValue.toFixed(2) : String(yValue);
                }

                if (label) {
                    labelSelectionData.push({
                        index: i,
                        itemId: yKey,
                        point: { x, y },
                        label: labelText ? {
                            text: labelText,
                            fontStyle: label.fontStyle,
                            fontWeight: label.fontWeight,
                            fontSize: label.fontSize,
                            fontFamily: label.fontFamily,
                            textAlign: 'center',
                            textBaseline: 'bottom',
                            fill: label.color
                        } : undefined
                    });
                }

                const areaDatum = areaSelectionData[j] || (areaSelectionData[j] = { itemId: yKey, points: [] });
                const areaPoints = areaDatum.points;

                areaPoints[i] = { x, y };
                areaPoints[last - i] = { x, y: yScale.convert(prev) + yOffset }; // bottom y

                if (curr < 0) {
                    prevMin += curr;
                } else {
                    prevMax += curr;
                }
            });
        });
    }

    private updateFillSelection(): void {
        const updateFills = this.fillSelection.setData(this.areaSelectionData);

        updateFills.exit.remove();

        const enterFills = updateFills.enter.append(Path)
            .each(path => {
                path.lineJoin = 'round';
                path.stroke = undefined;
                path.pointerEvents = PointerEvents.None;
            });

        this.fillSelection = updateFills.merge(enterFills);
    }

    private updateFillNodes() {
        const { fills, fillOpacity, strokes, strokeOpacity, strokeWidth, shadow, seriesItemEnabled } = this;

        this.fillSelection.each((shape, datum, index) => {
            const path = shape.path;

            shape.fill = fills[index % fills.length];
            shape.fillOpacity = fillOpacity;
            shape.stroke = strokes[index % strokes.length];
            shape.strokeOpacity = strokeOpacity;
            shape.strokeWidth = strokeWidth;
            shape.lineDash = this.lineDash;
            shape.lineDashOffset = this.lineDashOffset;
            shape.fillShadow = shadow;
            shape.visible = !!seriesItemEnabled.get(datum.itemId);
            shape.opacity = this.getOpacity(datum);

            path.clear();

            const { points } = datum;

            points.forEach(({ x, y }, i) => {
                if (i > 0) {
                    path.lineTo(x, y);
                } else {
                    path.moveTo(x, y);
                }
            });

            path.closePath();
        });
    }

    private updateStrokeSelection(): void {
        const updateStrokes = this.strokeSelection.setData(this.areaSelectionData);

        updateStrokes.exit.remove();

        const enterStrokes = updateStrokes.enter.append(Path)
            .each(path => {
                path.fill = undefined;
                path.lineJoin = path.lineCap = 'round';
                path.pointerEvents = PointerEvents.None;
            });

        this.strokeSelection = updateStrokes.merge(enterStrokes);
    }

    private updateStrokeNodes() {
        if (!this.data) {
            return;
        }

        const { data, strokes, strokeOpacity, seriesItemEnabled } = this;

        this.strokeSelection.each((shape, datum, index) => {
            const path = shape.path;

            shape.visible = !!seriesItemEnabled.get(datum.itemId);
            shape.opacity = this.getOpacity(datum);
            shape.stroke = strokes[index % strokes.length];
            shape.strokeWidth = this.getStrokeWidth(this.strokeWidth, datum);
            shape.strokeOpacity = strokeOpacity;
            shape.lineDash = this.lineDash;
            shape.lineDashOffset = this.lineDashOffset;

            path.clear();

            const { points } = datum;

            // The stroke doesn't go all the way around the fill, only on top,
            // that's why we iterate until `data.length` (rather than `points.length`) and stop.
            for (let i = 0; i < data.length; i++) {
                const { x, y } = points[i];

                if (i > 0) {
                    path.lineTo(x, y);
                } else {
                    path.moveTo(x, y);
                }
            }
        });
    }

    private updateMarkerSelection(): void {
        const MarkerShape = getMarker(this.marker.shape);
        const data = MarkerShape ? this.markerSelectionData : [];
        const updateMarkers = this.markerSelection.setData(data);
        updateMarkers.exit.remove();
        const enterMarkers = updateMarkers.enter.append(MarkerShape);
        this.markerSelection = updateMarkers.merge(enterMarkers);
    }

    private updateMarkerNodes(): void {
        if (!this.chart) {
            return;
        }

        const {
            xKey, marker, seriesItemEnabled,
            yKeys,
            fills,
            strokes,
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
            }
        } = this;

        const { size, formatter } = marker;
        const markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : this.strokeWidth;

        this.markerSelection.each((node, datum) => {
            const yKeyIndex = yKeys.indexOf(datum.yKey);
            const isDatumHighlighted = datum === highlightedDatum;
            const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill || fills[yKeyIndex % fills.length];
            const stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : marker.stroke || strokes[yKeyIndex % fills.length];
            const strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                ? highlightedDatumStrokeWidth
                : markerStrokeWidth;

            let format: CartesianSeriesMarkerFormat | undefined = undefined;
            if (formatter) {
                format = formatter({
                    datum: datum.datum,
                    xKey,
                    yKey: datum.yKey,
                    fill,
                    stroke,
                    strokeWidth,
                    size,
                    highlighted: isDatumHighlighted
                });
            }

            node.fill = format && format.fill || fill;
            node.stroke = format && format.stroke || stroke;
            node.strokeWidth = format && format.strokeWidth !== undefined
                ? format.strokeWidth
                : strokeWidth;
            node.size = format && format.size !== undefined
                ? format.size
                : size;

            node.translationX = datum.point.x;
            node.translationY = datum.point.y;
            node.visible = marker.enabled && node.size > 0 && !!seriesItemEnabled.get(datum.yKey) && !isNaN(datum.point.x);
            node.opacity = this.getOpacity(datum);
        });
    }

    private updateLabelSelection(): void {
        const updateLabels = this.labelSelection.setData(this.labelSelectionData);
        updateLabels.exit.remove();
        const enterLabels = updateLabels.enter.append(Text);
        this.labelSelection = updateLabels.merge(enterLabels);
    }

    private updateLabelNodes(): void {
        if (!this.chart) {
            return;
        }

        const { enabled: labelEnabled, fontStyle, fontWeight, fontSize, fontFamily, color } = this.label;
        this.labelSelection.each((text, datum) => {
            const { point, label } = datum;

            if (label && labelEnabled) {
                text.fontStyle = fontStyle;
                text.fontWeight = fontWeight;
                text.fontSize = fontSize;
                text.fontFamily = fontFamily;
                text.textAlign = label.textAlign;
                text.textBaseline = label.textBaseline;
                text.text = label.text;
                text.x = point.x;
                text.y = point.y - 10;
                text.fill = color;
                text.visible = true;
                text.opacity = this.getOpacity(datum);
            } else {
                text.visible = false;
            }
        });
    }

    getNodeData(): readonly MarkerSelectionDatum[] {
        return this.markerSelectionData;
    }

    fireNodeClickEvent(event: MouseEvent, datum: MarkerSelectionDatum): void {
        this.fireEvent<AreaSeriesNodeClickEvent>({
            type: 'nodeClick',
            event,
            series: this,
            datum: datum.datum,
            xKey: this.xKey,
            yKey: datum.yKey
        });
    }

    getTooltipHtml(nodeDatum: MarkerSelectionDatum): string {
        const { xKey } = this;
        const { yKey } = nodeDatum;

        if (!(xKey && yKey)) {
            return '';
        }

        const datum = nodeDatum.datum;
        const xValue = datum[xKey];
        const yValue = datum[yKey];
        const { xAxis, yAxis } = this;

        if (!(xAxis && yAxis && isNumber(yValue))) {
            return '';
        }

        const x = xAxis.scale.convert(xValue);
        const y = yAxis.scale.convert(yValue);

        // Don't show the tooltip for the off-screen markers.
        // Node: some markers might still go off-screen despite virtual rendering
        //       (to connect the dots and render the area properly).
        if (!(xAxis.inRange(x) && yAxis.inRange(y))) {
            return '';
        }

        const { xName, yKeys, yNames, yData, fills, strokes, tooltip, marker } = this;

        const { size, formatter: markerFormatter, strokeWidth: markerStrokeWidth, fill: markerFill, stroke: markerStroke } = marker;

        const xString = xAxis.formatDatum(xValue);
        const yString = yAxis.formatDatum(yValue);
        const yKeyIndex = yKeys.indexOf(yKey);
        const yGroup = yData[nodeDatum.index];
        const processedYValue = yGroup[yKeyIndex];
        const yName = yNames[yKeyIndex];
        const title = sanitizeHtml(yName);
        const content = sanitizeHtml(xString + ': ' + yString);

        const strokeWidth = markerStrokeWidth !== undefined ? markerStrokeWidth : this.strokeWidth;
        const fill = markerFill || fills[yKeyIndex % fills.length];
        const stroke = markerStroke || strokes[yKeyIndex % fills.length];

        let format: CartesianSeriesMarkerFormat | undefined = undefined;

        if (markerFormatter) {
            format = markerFormatter({
                datum,
                xKey,
                yKey,
                fill,
                stroke,
                strokeWidth,
                size,
                highlighted: false
            });
        }

        const color = format && format.fill || markerFill;

        const defaults: TooltipRendererResult = {
            title,
            backgroundColor: color,
            content
        };
        const {
            renderer: tooltipRenderer,
            format: tooltipFormat
        } = tooltip;

        if (tooltipFormat || tooltipRenderer) {
            const params = {
                datum,
                xKey,
                xName,
                xValue,
                yKey,
                yValue,
                processedYValue,
                yName,
                color
            };
            if (tooltipFormat) {
                return toTooltipHtml({
                    content: interpolate(tooltipFormat, params)
                }, defaults);
            }
            if (tooltipRenderer) {
                return toTooltipHtml(tooltipRenderer(params), defaults);
            }
        }

        return toTooltipHtml(defaults);
    }

    listSeriesItems(legendData: LegendDatum[]): void {
        const {
            data, id, xKey, yKeys, yNames, seriesItemEnabled,
            marker, fills, strokes, fillOpacity, strokeOpacity
        } = this;

        if (data && data.length && xKey && yKeys.length) {
            yKeys.forEach((yKey, index) => {
                legendData.push({
                    id,
                    itemId: yKey,
                    enabled: seriesItemEnabled.get(yKey) || false,
                    label: {
                        text: yNames[index] || yKeys[index]
                    },
                    marker: {
                        shape: marker.shape,
                        fill: marker.fill || fills[index % fills.length],
                        stroke: marker.stroke || strokes[index % strokes.length],
                        fillOpacity,
                        strokeOpacity
                    }
                });
            });
        }
    }

    toggleSeriesItem(itemId: string, enabled: boolean): void {
        this.seriesItemEnabled.set(itemId, enabled);
        this.scheduleData();
    }
}
