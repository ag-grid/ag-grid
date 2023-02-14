import { Group } from '../../../scene/group';
import { Selection } from '../../../scene/selection';
import { DropShadow } from '../../../scene/dropShadow';
import { SeriesNodeDatum, SeriesTooltip, SeriesNodeDataContext } from '../series';
import { PointerEvents } from '../../../scene/node';
import { LegendDatum } from '../../legendDatum';
import { Path } from '../../../scene/shape/path';
import { Marker } from '../../marker/marker';
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesNodeClickEvent } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { getMarker } from '../../marker/util';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { extent } from '../../../util/array';
import { areArrayItemsStrictlyEqual } from '../../../util/equal';
import { interpolate } from '../../../util/string';
import { Text } from '../../../scene/shape/text';
import { Label } from '../../label';
import { sanitizeHtml } from '../../../util/sanitize';
import { checkDatum, isContinuous, isNumber } from '../../../util/value';
import { ContinuousScale } from '../../../scale/continuousScale';
import { doOnce } from '../../../util/function';
import { Point, SizedPoint } from '../../../scene/point';
import {
    BOOLEAN_ARRAY,
    NUMBER,
    OPT_FUNCTION,
    OPT_LINE_DASH,
    OPT_STRING,
    STRING,
    STRING_ARRAY,
    COLOR_STRING_ARRAY,
    Validate,
    OPT_NUMBER,
} from '../../../util/validation';
import {
    AgCartesianSeriesTooltipRendererParams,
    AgCartesianSeriesLabelFormatterParams,
    FontStyle,
    FontWeight,
    AgTooltipRendererResult,
    AgCartesianSeriesMarkerFormat,
} from '../../agChartOptions';
import { LogAxis } from '../../axis/logAxis';

interface FillSelectionDatum {
    readonly itemId: string;
    readonly points: { x: number; y: number }[];
}

interface StrokeSelectionDatum extends FillSelectionDatum {
    readonly yValues: (number | undefined)[];
}

interface MarkerSelectionDatum extends Required<SeriesNodeDatum> {
    readonly index: number;
    readonly fill?: string;
    readonly stroke?: string;
    readonly yKey: string;
    readonly yValue: number;
}

interface LabelSelectionDatum {
    readonly index: number;
    readonly itemId: any;
    readonly point: Readonly<Point>;
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

type CumulativeValue = { left: number; right: number };
type ProcessedXDatum = {
    xDatum: any;
    seriesDatum: any;
};

class AreaSeriesLabel extends Label {
    @Validate(OPT_FUNCTION)
    formatter?: (params: AgCartesianSeriesLabelFormatterParams) => string = undefined;
}

class AreaSeriesTooltip extends SeriesTooltip {
    @Validate(OPT_FUNCTION)
    renderer?: (params: AgCartesianSeriesTooltipRendererParams) => string | AgTooltipRendererResult = undefined;

    @Validate(OPT_STRING)
    format?: string = undefined;
}

enum AreaSeriesTag {
    Fill,
    Stroke,
    Marker,
    Label,
}

type AreaSeriesNodeDataContext = SeriesNodeDataContext<MarkerSelectionDatum, LabelSelectionDatum> & {
    fillSelectionData: FillSelectionDatum;
    strokeSelectionData: StrokeSelectionDatum;
};

export class AreaSeries extends CartesianSeries<AreaSeriesNodeDataContext> {
    static className = 'AreaSeries';
    static type = 'area' as const;

    tooltip: AreaSeriesTooltip = new AreaSeriesTooltip();

    private xData: ProcessedXDatum[] = [];
    private yData: number[][] = [];
    private yDomain: any[] = [];
    private xDomain: any[] = [];

    directionKeys = {
        x: ['xKey'],
        y: ['yKeys'],
    };

    readonly marker = new CartesianSeriesMarker();

    readonly label = new AreaSeriesLabel();

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

    constructor() {
        super({
            pathsPerSeries: 2,
            pathsZIndexSubOrderOffset: [0, 1000],
            hasMarkers: true,
            renderLayerPerSubSeries: false,
        });

        const { marker, label } = this;

        marker.enabled = false;

        label.enabled = false;
    }

    @Validate(STRING)
    protected _xKey: string = '';
    set xKey(value: string) {
        this._xKey = value;
        this.xData = [];
    }

    get xKey(): string {
        return this._xKey;
    }

    @Validate(STRING)
    xName: string = '';

    @Validate(STRING_ARRAY)
    protected _yKeys: string[] = [];
    set yKeys(values: string[]) {
        if (!areArrayItemsStrictlyEqual(this._yKeys, values)) {
            this._yKeys = values;
            this.yData = [];

            this.processSeriesItemEnabled();
        }
    }

    get yKeys(): string[] {
        return this._yKeys;
    }

    @Validate(BOOLEAN_ARRAY)
    protected _visibles: boolean[] = [];
    set visibles(visibles: boolean[]) {
        this._visibles = visibles;
        this.processSeriesItemEnabled();
    }
    get visibles() {
        return this._visibles;
    }

    private processSeriesItemEnabled() {
        const { seriesItemEnabled, _visibles: visibles = [] } = this;
        seriesItemEnabled.clear();
        this._yKeys.forEach((key, idx) => seriesItemEnabled.set(key, visibles[idx] ?? true));
    }

    @Validate(STRING_ARRAY)
    yNames: string[] = [];

    @Validate(OPT_NUMBER())
    private _normalizedTo?: number;
    set normalizedTo(value: number | undefined) {
        const absValue = value ? Math.abs(value) : undefined;

        if (this._normalizedTo !== absValue) {
            this._normalizedTo = absValue;
        }
    }

    get normalizedTo(): number | undefined {
        return this._normalizedTo;
    }

    @Validate(NUMBER(0))
    strokeWidth = 2;

    shadow?: DropShadow = undefined;

    protected highlightedDatum?: MarkerSelectionDatum;

    async processData() {
        const { xKey, yKeys, seriesItemEnabled, xAxis, yAxis, normalizedTo } = this;
        const data = xKey && yKeys.length && this.data ? this.data : [];

        if (!xAxis || !yAxis) {
            return;
        }

        // If the data is an array of rows like so:
        //
        // [{
        //   xKey: 'Jan',
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

        const isContinuousX = xAxis.scale instanceof ContinuousScale;
        const isContinuousY = yAxis.scale instanceof ContinuousScale;
        const normalized = normalizedTo && isFinite(normalizedTo);

        const yData: number[][] = [];
        const xData = [];
        const xValues = [];
        const missingYKeys = new Set(yKeys);

        for (const datum of data) {
            // X datum
            if (!(xKey in datum)) {
                doOnce(
                    () => console.warn(`AG Charts - The key '${xKey}' was not found in the data: `, datum),
                    `${xKey} not found in data`
                );
                continue;
            }

            const xDatum = checkDatum(datum[xKey], isContinuousX);
            if (isContinuousX && xDatum === undefined) {
                continue;
            } else {
                xValues.push(xDatum);
                xData.push({ xDatum, seriesDatum: datum });
            }

            // Y datum
            yKeys.forEach((yKey, i) => {
                const seriesYs = yData[i] || (yData[i] = []);

                if (!(yKey in datum)) {
                    seriesYs.push(NaN);
                    return;
                }
                missingYKeys.delete(yKey);
                const value = datum[yKey];

                if (!seriesItemEnabled.get(yKey)) {
                    seriesYs.push(NaN);
                } else {
                    const yDatum = checkDatum(value, isContinuousY);
                    seriesYs.push(yDatum);
                }
            });
        }

        if (missingYKeys.size > 0) {
            const missingYKeysString = JSON.stringify([...missingYKeys]);
            doOnce(
                () => console.log(`AG Charts - yKeys ${missingYKeysString} were not found in the data.`),
                `${missingYKeysString} not found in data.`
            );
        }

        const xyValid = this.validateXYData(
            this.xKey,
            this.yKeys.join(', '),
            data,
            xAxis,
            yAxis,
            xData.map((x) => x.xDatum),
            yData,
            2
        );
        if (!xyValid) {
            this.xData = [];
            this.yData = [];
            this.yDomain = [];
            return;
        }

        this.yData = yData;
        this.xData = xData;

        this.xDomain = isContinuousX ? this.fixNumericExtent(extent(xValues), xAxis) : xValues;

        // xData: ['Jan', 'Feb', undefined]
        //
        // yData: [
        //   [5, 10], <- series 1 (yKey1)
        //   [7, -15], <- series 2 (yKey2)
        //   [-9, 20] <- series 3 (yKey3)
        // ]

        let yMin: number | undefined = undefined;
        let yMax: number | undefined = undefined;

        for (let i = 0; i < xData.length; i++) {
            const total = { sum: 0, absSum: 0 };
            for (const seriesYs of yData) {
                if (seriesYs[i] === undefined || isNaN(seriesYs[i])) {
                    continue;
                }

                const y = +seriesYs[i]; // convert to number as the value could be a Date object

                total.absSum += Math.abs(y);
                total.sum += y;

                if (total.sum >= (yMax ?? 0)) {
                    yMax = total.sum;
                } else if (total.sum <= (yMin ?? 0)) {
                    yMin = total.sum;
                }
            }

            if (!(normalized && normalizedTo)) {
                continue;
            }

            let normalizedTotal = undefined;
            // normalize y values using the absolute sum of y values in the stack
            for (const seriesYs of yData) {
                const normalizedY = (+seriesYs[i] / total.absSum) * normalizedTo;
                seriesYs[i] = normalizedY;

                if (!isNaN(normalizedY)) {
                    // sum normalized values to get updated yMin and yMax of normalized area
                    normalizedTotal = (normalizedTotal ?? 0) + normalizedY;
                } else {
                    continue;
                }

                if (normalizedTotal >= (yMax ?? 0)) {
                    yMax = normalizedTotal;
                } else if (normalizedTotal <= (yMin ?? 0)) {
                    yMin = normalizedTotal;
                }
            }
        }

        if (normalized && normalizedTo) {
            // multiplier to control the unused whitespace in the y domain, value selected by subjective visual 'niceness'.
            const domainWhitespaceAdjustment = 0.5;

            // set the yMin and yMax based on cumulative sum of normalized values
            yMin = (yMin ?? 0) < -normalizedTo * domainWhitespaceAdjustment ? -normalizedTo : yMin;
            yMax = (yMax ?? 0) > normalizedTo * domainWhitespaceAdjustment ? normalizedTo : yMax;
        }

        const isLogAxis = yAxis instanceof LogAxis;
        if (yMin === undefined && isLogAxis) {
            yMin = extent(yData[0])?.[0];
        }

        this.yDomain = this.fixNumericExtent(
            yMin === undefined && yMax === undefined ? undefined : [yMin ?? 0, yMax ?? 0],
            yAxis
        );
    }

    getDomain(direction: ChartAxisDirection): any[] {
        if (direction === ChartAxisDirection.X) {
            return this.xDomain;
        } else {
            return this.yDomain;
        }
    }

    async createNodeData() {
        const { data, xAxis, yAxis, xData, yData } = this;

        if (!data || !xAxis || !yAxis || !xData.length || !yData.length) {
            return [];
        }

        const contexts: AreaSeriesNodeDataContext[] = [];
        const { yKeys, marker, label, fills, strokes, id: seriesId } = this;
        const { scale: xScale } = xAxis;
        const { scale: yScale } = yAxis;

        const continuousY = yScale instanceof ContinuousScale;

        const xOffset = (xScale.bandwidth || 0) / 2;

        const cumulativePathValues: CumulativeValue[] = new Array(xData.length)
            .fill(null)
            .map(() => ({ left: 0, right: 0 }));
        const cumulativeMarkerValues: number[] = new Array(xData.length).fill(0);

        const createPathCoordinates = (
            xDatum: any,
            yDatum: number,
            idx: number,
            side: keyof CumulativeValue
        ): [SizedPoint, SizedPoint] => {
            const x = xScale.convert(xDatum) + xOffset;

            const prevY = cumulativePathValues[idx][side];
            const currY = cumulativePathValues[idx][side] + yDatum;

            const prevYCoordinate = yScale.convert(prevY, { strict: false });
            const currYCoordinate = yScale.convert(currY, { strict: false });

            cumulativePathValues[idx][side] = currY;

            return [
                { x, y: currYCoordinate, size: marker.size },
                { x, y: prevYCoordinate, size: marker.size },
            ];
        };

        const createMarkerCoordinate = (xDatum: any, yDatum: number, idx: number, rawYDatum: any): SizedPoint => {
            let currY;

            // if not normalized, the invalid data points will be processed as `undefined` in processData()
            // if normalized, the invalid data points will be processed as 0 rather than `undefined`
            // check if unprocessed datum is valid as we only want to show markers for valid points
            const normalized = this.normalizedTo && isFinite(this.normalizedTo);
            const normalizedAndValid = normalized && continuousY && isContinuous(rawYDatum);

            const valid = (!normalized && !isNaN(rawYDatum)) || normalizedAndValid;

            if (valid) {
                currY = cumulativeMarkerValues[idx] += yDatum;
            }

            const x = xScale.convert(xDatum) + xOffset;
            const y = yScale.convert(currY, { strict: false });

            return { x, y, size: marker.size };
        };

        yData.forEach((seriesYs, seriesIdx) => {
            const yKey = yKeys[seriesIdx];

            const labelSelectionData: LabelSelectionDatum[] = [];
            const markerSelectionData: MarkerSelectionDatum[] = [];
            const strokeSelectionData: StrokeSelectionDatum = { itemId: yKey, points: [], yValues: [] };
            const fillSelectionData: FillSelectionDatum = { itemId: yKey, points: [] };
            contexts[seriesIdx] = {
                itemId: yKey,
                fillSelectionData,
                labelData: labelSelectionData,
                nodeData: markerSelectionData,
                strokeSelectionData,
            };

            if (!this.seriesItemEnabled.get(yKey)) {
                return;
            }

            const fillPoints = fillSelectionData.points;
            const fillPhantomPoints: SizedPoint[] = [];

            const strokePoints = strokeSelectionData.points;
            const yValues = strokeSelectionData.yValues;

            seriesYs.forEach((rawYDatum, datumIdx) => {
                const yDatum = isNaN(rawYDatum) ? undefined : rawYDatum;

                const { xDatum, seriesDatum } = xData[datumIdx];
                const nextXDatum = xData[datumIdx + 1]?.xDatum;
                const rawNextYDatum = seriesYs[datumIdx + 1];
                const nextYDatum = isNaN(rawNextYDatum) ? undefined : rawNextYDatum;

                // marker data
                const point = createMarkerCoordinate(xDatum, +yDatum!, datumIdx, seriesDatum[yKey]);

                if (marker) {
                    markerSelectionData.push({
                        index: datumIdx,
                        series: this,
                        itemId: yKey,
                        datum: seriesDatum,
                        yValue: yDatum!,
                        yKey,
                        point,
                        fill: fills[seriesIdx % fills.length],
                        stroke: strokes[seriesIdx % strokes.length],
                    });
                }

                // label data
                let labelText: string;

                if (label.formatter) {
                    labelText = label.formatter({ value: yDatum!, seriesId });
                } else {
                    labelText = isNumber(yDatum) ? Number(yDatum).toFixed(2) : String(yDatum);
                }

                if (label) {
                    labelSelectionData.push({
                        index: datumIdx,
                        itemId: yKey,
                        point,
                        label:
                            this.seriesItemEnabled.get(yKey) && labelText
                                ? {
                                      text: labelText,
                                      fontStyle: label.fontStyle,
                                      fontWeight: label.fontWeight,
                                      fontSize: label.fontSize,
                                      fontFamily: label.fontFamily,
                                      textAlign: 'center',
                                      textBaseline: 'bottom',
                                      fill: label.color,
                                  }
                                : undefined,
                    });
                }

                // fill data
                // Handle data in pairs of current and next x and y values
                const windowX = [xDatum, nextXDatum];
                const windowY = [yDatum, nextYDatum];

                if (windowX.some((v) => v == undefined)) {
                    return;
                }
                if (windowY.some((v) => v == undefined)) {
                    windowY[0] = 0;
                    windowY[1] = 0;
                }

                const currCoordinates = createPathCoordinates(windowX[0], +windowY[0]!, datumIdx, 'right');
                fillPoints.push(currCoordinates[0]);
                fillPhantomPoints.push(currCoordinates[1]);

                const nextCoordinates = createPathCoordinates(windowX[1], +windowY[1]!, datumIdx, 'left');
                fillPoints.push(nextCoordinates[0]);
                fillPhantomPoints.push(nextCoordinates[1]);

                // stroke data
                strokePoints.push({ x: NaN, y: NaN }); // moveTo
                yValues.push(undefined);

                strokePoints.push(currCoordinates[0]);
                yValues.push(yDatum);

                if (nextYDatum !== undefined) {
                    strokePoints.push(nextCoordinates[0]);
                    yValues.push(yDatum);
                }
            });

            for (let i = fillPhantomPoints.length - 1; i >= 0; i--) {
                fillPoints.push(fillPhantomPoints[i]);
            }
        });

        return contexts;
    }

    protected isPathOrSelectionDirty(): boolean {
        return this.marker.isDirty();
    }

    protected async updatePaths(opts: {
        seriesHighlighted?: boolean;
        contextData: AreaSeriesNodeDataContext;
        paths: Path[];
    }) {
        const {
            contextData: { fillSelectionData, strokeSelectionData },
            paths: [fill, stroke],
        } = opts;

        fill.datum = fillSelectionData;
        fill.tag = AreaSeriesTag.Fill;
        fill.lineJoin = 'round';
        fill.stroke = undefined;
        fill.pointerEvents = PointerEvents.None;

        stroke.datum = strokeSelectionData;
        stroke.tag = AreaSeriesTag.Stroke;
        stroke.fill = undefined;
        stroke.lineJoin = stroke.lineCap = 'round';
        stroke.pointerEvents = PointerEvents.None;
    }

    protected async updatePathNodes(opts: {
        seriesHighlighted?: boolean;
        itemId?: string;
        paths: Path[];
        seriesIdx: number;
    }) {
        const {
            paths: [fill, stroke],
            seriesIdx,
            itemId,
        } = opts;
        const { strokes, fills, fillOpacity, strokeOpacity, strokeWidth, shadow } = this;

        {
            const {
                datum: { points },
            } = fill;
            fill.fill = fills[seriesIdx % fills.length];
            fill.fillOpacity = fillOpacity;
            fill.strokeOpacity = strokeOpacity;
            fill.strokeWidth = strokeWidth;
            fill.lineDash = this.lineDash;
            fill.lineDashOffset = this.lineDashOffset;
            fill.fillShadow = shadow;

            const path = fill.path;
            path.clear({ trackChanges: true });

            let i = 0;
            for (const p of points) {
                if (i++ > 0) {
                    path.lineTo(p.x, p.y);
                } else {
                    path.moveTo(p.x, p.y);
                }
            }

            path.closePath();
            fill.checkPathDirty();
        }

        {
            const {
                datum: { points, yValues },
            } = stroke;
            let moveTo = true;

            stroke.stroke = strokes[seriesIdx % strokes.length];
            stroke.strokeWidth = this.getStrokeWidth(this.strokeWidth, { itemId });
            stroke.strokeOpacity = strokeOpacity;
            stroke.lineDash = this.lineDash;
            stroke.lineDashOffset = this.lineDashOffset;

            const path = stroke.path;
            path.clear({ trackChanges: true });

            let i = 0;
            for (const p of points) {
                if (yValues[i++] === undefined) {
                    moveTo = true;
                } else if (moveTo) {
                    path.moveTo(p.x, p.y);
                    moveTo = false;
                } else {
                    path.lineTo(p.x, p.y);
                }
            }
            stroke.checkPathDirty();
        }
    }

    protected async updateMarkerSelection(opts: {
        nodeData: MarkerSelectionDatum[];
        markerSelection: Selection<Marker, Group, MarkerSelectionDatum, any>;
    }) {
        let { nodeData, markerSelection } = opts;
        const {
            marker: { enabled, shape },
        } = this;
        const data = enabled && nodeData ? nodeData : [];

        const MarkerShape = getMarker(shape);

        if (this.marker.isDirty()) {
            markerSelection = markerSelection.setData([]);
            markerSelection.exit.remove();
        }

        const updateMarkerSelection = markerSelection.setData(data);
        updateMarkerSelection.exit.remove();
        const enterMarkers = updateMarkerSelection.enter.append(MarkerShape).each((marker) => {
            marker.tag = AreaSeriesTag.Marker;
        });
        return updateMarkerSelection.merge(enterMarkers);
    }

    protected async updateMarkerNodes(opts: {
        markerSelection: Selection<Marker, Group, MarkerSelectionDatum, any>;
        isHighlight: boolean;
    }) {
        const { markerSelection, isHighlight: isDatumHighlighted } = opts;
        const {
            id: seriesId,
            xKey,
            marker,
            seriesItemEnabled,
            yKeys,
            fills,
            strokes,
            fillOpacity: seriesFillOpacity,
            marker: { fillOpacity: markerFillOpacity = seriesFillOpacity },
            strokeOpacity,
            highlightStyle: {
                item: {
                    fill: highlightedFill,
                    fillOpacity: highlightFillOpacity = markerFillOpacity,
                    stroke: highlightedStroke,
                    strokeWidth: highlightedDatumStrokeWidth,
                },
            },
        } = this;

        const { size, formatter } = marker;
        const markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : this.strokeWidth;

        const customMarker = typeof marker.shape === 'function';

        markerSelection.each((node, datum) => {
            const yKeyIndex = yKeys.indexOf(datum.yKey);
            const fill =
                isDatumHighlighted && highlightedFill !== undefined
                    ? highlightedFill
                    : marker.fill || fills[yKeyIndex % fills.length];
            const fillOpacity = isDatumHighlighted ? highlightFillOpacity : markerFillOpacity;
            const stroke =
                isDatumHighlighted && highlightedStroke !== undefined
                    ? highlightedStroke
                    : marker.stroke || strokes[yKeyIndex % fills.length];
            const strokeWidth =
                isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                    ? highlightedDatumStrokeWidth
                    : markerStrokeWidth;

            let format: AgCartesianSeriesMarkerFormat | undefined = undefined;
            if (formatter) {
                format = formatter({
                    datum: datum.datum,
                    xKey,
                    yKey: datum.yKey,
                    fill,
                    stroke,
                    strokeWidth,
                    size,
                    highlighted: isDatumHighlighted,
                    seriesId,
                });
            }

            node.fill = (format && format.fill) || fill;
            node.stroke = (format && format.stroke) || stroke;
            node.strokeWidth = format && format.strokeWidth !== undefined ? format.strokeWidth : strokeWidth;
            node.fillOpacity = fillOpacity ?? 1;
            node.strokeOpacity = marker.strokeOpacity ?? strokeOpacity ?? 1;
            node.size = format && format.size !== undefined ? format.size : size;

            node.translationX = datum.point.x;
            node.translationY = datum.point.y;
            node.visible =
                node.size > 0 && !!seriesItemEnabled.get(datum.yKey) && !isNaN(datum.point.x) && !isNaN(datum.point.y);

            if (!customMarker || node.dirtyPath) {
                return;
            }

            // Only for cutom marker shapes
            node.path.clear({ trackChanges: true });
            node.updatePath();
            node.checkPathDirty();
        });

        if (!isDatumHighlighted) {
            this.marker.markClean();
        }
    }

    protected async updateLabelSelection(opts: {
        labelData: LabelSelectionDatum[];
        labelSelection: Selection<Text, Group, LabelSelectionDatum, any>;
    }) {
        const { labelData, labelSelection } = opts;

        const updateLabels = labelSelection.setData(labelData);
        updateLabels.exit.remove();
        const enterLabels = updateLabels.enter.append(Text).each((text) => {
            text.tag = AreaSeriesTag.Label;
        });
        return updateLabels.merge(enterLabels);
    }

    protected async updateLabelNodes(opts: { labelSelection: Selection<Text, Group, LabelSelectionDatum, any> }) {
        const { labelSelection } = opts;
        const { enabled: labelEnabled, fontStyle, fontWeight, fontSize, fontFamily, color } = this.label;
        labelSelection.each((text, datum) => {
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
            } else {
                text.visible = false;
            }
        });
    }

    protected getNodeClickEvent(event: MouseEvent, datum: MarkerSelectionDatum): CartesianSeriesNodeClickEvent<any> {
        return new CartesianSeriesNodeClickEvent(this.xKey, datum.yKey, event, datum, this);
    }

    getTooltipHtml(nodeDatum: MarkerSelectionDatum): string {
        const { xKey, id: seriesId } = this;
        const { yKey } = nodeDatum;

        if (!(xKey && yKey) || !this.seriesItemEnabled.get(yKey)) {
            return '';
        }

        const datum = nodeDatum.datum;
        const xValue = datum[xKey];
        const yValue = datum[yKey];
        const { xAxis, yAxis } = this;

        if (!(xAxis && yAxis && isNumber(yValue))) {
            return '';
        }

        const { xName, yKeys, yNames, yData, fills, strokes, tooltip, marker } = this;

        const {
            size,
            formatter: markerFormatter,
            strokeWidth: markerStrokeWidth,
            fill: markerFill,
            stroke: markerStroke,
        } = marker;

        const xString = xAxis.formatDatum(xValue);
        const yString = yAxis.formatDatum(yValue);
        const yKeyIndex = yKeys.indexOf(yKey);
        const seriesYs = yData[yKeyIndex];
        const processedYValue = seriesYs[nodeDatum.index];
        const yName = yNames[yKeyIndex];
        const title = sanitizeHtml(yName);
        const content = sanitizeHtml(xString + ': ' + yString);

        const strokeWidth = markerStrokeWidth !== undefined ? markerStrokeWidth : this.strokeWidth;
        const fill = markerFill || fills[yKeyIndex % fills.length];
        const stroke = markerStroke || strokes[yKeyIndex % fills.length];

        let format: AgCartesianSeriesMarkerFormat | undefined = undefined;

        if (markerFormatter) {
            format = markerFormatter({
                datum,
                xKey,
                yKey,
                fill,
                stroke,
                strokeWidth,
                size,
                highlighted: false,
                seriesId,
            });
        }

        const color = (format && format.fill) || fill;

        const defaults: AgTooltipRendererResult = {
            title,
            backgroundColor: color,
            content,
        };
        const { renderer: tooltipRenderer, format: tooltipFormat } = tooltip;

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
                color,
                title,
                seriesId,
            };
            if (tooltipFormat) {
                return toTooltipHtml(
                    {
                        content: interpolate(tooltipFormat, params),
                    },
                    defaults
                );
            }
            if (tooltipRenderer) {
                return toTooltipHtml(tooltipRenderer(params), defaults);
            }
        }

        return toTooltipHtml(defaults);
    }

    getLegendData(): LegendDatum[] {
        const { data, id, xKey, yKeys, yNames, seriesItemEnabled, marker, fills, strokes, fillOpacity, strokeOpacity } =
            this;

        if (!data || !data.length || !xKey || !yKeys.length) {
            return [];
        }

        const legendData: LegendDatum[] = [];

        // Area stacks should be listed in the legend in reverse order, for symmetry with the
        // vertical stack display order.
        for (let index = yKeys.length - 1; index >= 0; index--) {
            const yKey = yKeys[index];
            legendData.push({
                id,
                itemId: yKey,
                seriesId: id,
                enabled: seriesItemEnabled.get(yKey) || false,
                label: {
                    text: yNames[index] || yKeys[index],
                },
                marker: {
                    shape: marker.shape,
                    fill: marker.fill || fills[index % fills.length],
                    stroke: marker.stroke || strokes[index % strokes.length],
                    fillOpacity: marker.fillOpacity ?? fillOpacity,
                    strokeOpacity: marker.strokeOpacity ?? strokeOpacity,
                },
            });
        }

        return legendData;
    }

    protected isLabelEnabled() {
        return this.label.enabled;
    }
}
