import { Selection } from '../../../scene/selection';
import { Group } from '../../../scene/group';
import { SeriesNodeDatum, SeriesTooltip, SeriesNodeDataContext, SeriesNodePickMode } from '../series';
import { extent } from '../../../util/array';
import { LegendDatum } from '../../legend';
import { LinearScale } from '../../../scale/linearScale';
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesNodeClickEvent } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxis';
import { getMarker } from '../../marker/util';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { ContinuousScale } from '../../../scale/continuousScale';
import { sanitizeHtml } from '../../../util/sanitize';
import { Label } from '../../label';
import { Text } from '../../../scene/shape/text';
import { HdpiCanvas } from '../../../canvas/hdpiCanvas';
import { Marker } from '../../marker/marker';
import { MeasuredLabel, PointLabelDatum } from '../../../util/labelPlacement';
import { checkDatum, isContinuous } from '../../../util/value';
import { Deprecated } from '../../../util/deprecation';
import { OPT_FUNCTION, OPT_STRING, STRING, Validate } from '../../../util/validation';
import {
    AgScatterSeriesTooltipRendererParams,
    AgTooltipRendererResult,
    AgCartesianSeriesMarkerFormat,
} from '../../agChartOptions';

interface ScatterNodeDatum extends Required<SeriesNodeDatum> {
    readonly label: MeasuredLabel;
}

class ScatterSeriesNodeClickEvent extends CartesianSeriesNodeClickEvent<any> {
    readonly sizeKey?: string;

    constructor(
        sizeKey: string | undefined,
        xKey: string,
        yKey: string,
        nativeEvent: MouseEvent,
        datum: ScatterNodeDatum,
        series: ScatterSeries
    ) {
        super(xKey, yKey, nativeEvent, datum, series);
        this.sizeKey = sizeKey;
    }
}

class ScatterSeriesTooltip extends SeriesTooltip {
    @Validate(OPT_FUNCTION)
    renderer?: (params: AgScatterSeriesTooltipRendererParams) => string | AgTooltipRendererResult = undefined;
}

export class ScatterSeries extends CartesianSeries<SeriesNodeDataContext<ScatterNodeDatum>> {
    static className = 'ScatterSeries';
    static type = 'scatter' as const;

    private xDomain: number[] = [];
    private yDomain: number[] = [];
    private xData: any[] = [];
    private yData: any[] = [];
    private validData: any[] = [];
    private sizeData: number[] = [];
    private sizeScale = new LinearScale();

    readonly marker = new CartesianSeriesMarker();

    readonly label = new Label();

    /**
     * @deprecated Use {@link marker.fill} instead.
     */
    @Deprecated('Use marker.fill instead.', { default: '#c16068' })
    fill: string | undefined = '#c16068';

    /**
     * @deprecated Use {@link marker.stroke} instead.
     */
    @Deprecated('Use marker.stroke instead.', { default: '#874349' })
    stroke: string | undefined = '#874349';

    /**
     * @deprecated Use {@link marker.strokeWidth} instead.
     */
    @Deprecated('Use marker.strokeWidth instead.', { default: 2 })
    strokeWidth: number = 2;
    /**
     * @deprecated Use {@link marker.fillOpacity} instead.
     */
    @Deprecated('Use marker.fillOpacity instead.', { default: 1 })
    fillOpacity: number = 1;

    /**
     * @deprecated Use {@link marker.strokeOpacity} instead.
     */
    @Deprecated('Use marker.strokeOpacity instead.', { default: 1 })
    strokeOpacity: number = 1;

    @Validate(OPT_STRING)
    title?: string = undefined;

    @Validate(OPT_STRING)
    labelKey?: string = undefined;

    @Validate(STRING)
    xName: string = '';

    @Validate(STRING)
    yName: string = '';

    @Validate(OPT_STRING)
    sizeName?: string = 'Size';

    @Validate(OPT_STRING)
    labelName?: string = 'Label';

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
    protected _yKey: string = '';
    set yKey(value: string) {
        this._yKey = value;
        this.yData = [];
    }
    get yKey(): string {
        return this._yKey;
    }

    @Validate(OPT_STRING)
    protected _sizeKey?: string = undefined;
    set sizeKey(value: string | undefined) {
        this._sizeKey = value;
        this.sizeData = [];
    }
    get sizeKey(): string | undefined {
        return this._sizeKey;
    }

    readonly tooltip: ScatterSeriesTooltip = new ScatterSeriesTooltip();

    constructor() {
        super({
            pickModes: [
                SeriesNodePickMode.NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST,
                SeriesNodePickMode.NEAREST_NODE,
                SeriesNodePickMode.EXACT_SHAPE_MATCH,
            ],
            pathsPerSeries: 0,
            hasMarkers: true,
        });

        const { label } = this;

        label.enabled = false;
    }

    setColors(fills: string[], strokes: string[]) {
        this.marker.fill = fills[0];
        this.marker.stroke = strokes[0];
    }

    async processData() {
        const { xKey, yKey, sizeKey, xAxis, yAxis, marker } = this;

        if (!xAxis || !yAxis) {
            return;
        }

        const data = xKey && yKey && this.data ? this.data : [];
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const isContinuousX = xScale instanceof ContinuousScale;
        const isContinuousY = yScale instanceof ContinuousScale;

        this.validData = data.filter(
            (d) => checkDatum(d[xKey], isContinuousX) !== undefined && checkDatum(d[yKey], isContinuousY) !== undefined
        );
        this.xData = this.validData.map((d) => d[xKey]);
        this.yData = this.validData.map((d) => d[yKey]);

        this.sizeData = sizeKey ? this.validData.map((d) => d[sizeKey]) : [];

        this.sizeScale.domain = marker.domain ? marker.domain : extent(this.sizeData, isContinuous) || [1, 1];
        if (xAxis.scale instanceof ContinuousScale) {
            this.xDomain = this.fixNumericExtent(extent(this.xData, isContinuous), xAxis);
        } else {
            this.xDomain = this.xData;
        }
        if (yAxis.scale instanceof ContinuousScale) {
            this.yDomain = this.fixNumericExtent(extent(this.yData, isContinuous), yAxis);
        } else {
            this.yDomain = this.yData;
        }
    }

    getDomain(direction: ChartAxisDirection): any[] {
        if (direction === ChartAxisDirection.X) {
            return this.xDomain;
        } else {
            return this.yDomain;
        }
    }

    protected getNodeClickEvent(event: MouseEvent, datum: ScatterNodeDatum): CartesianSeriesNodeClickEvent<any> {
        return new ScatterSeriesNodeClickEvent(this.sizeKey, this.xKey, this.yKey, event, datum, this);
    }

    async createNodeData() {
        const { chart, data, visible, xAxis, yAxis, yKey, label, labelKey } = this;

        if (!(chart && data && visible && xAxis && yAxis)) {
            return [];
        }

        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const isContinuousX = xScale instanceof ContinuousScale;
        const isContinuousY = yScale instanceof ContinuousScale;
        const xOffset = (xScale.bandwidth || 0) / 2;
        const yOffset = (yScale.bandwidth || 0) / 2;
        const { xData, yData, validData, sizeData, sizeScale, marker } = this;
        const nodeData: ScatterNodeDatum[] = new Array(xData.length);

        sizeScale.range = [marker.size, marker.maxSize];

        const font = label.getFont();
        let actualLength = 0;
        for (let i = 0; i < xData.length; i++) {
            const xy = this.checkDomainXY(xData[i], yData[i], isContinuousX, isContinuousY);

            if (!xy) {
                continue;
            }

            const x = xScale.convert(xy[0]) + xOffset;
            const y = yScale.convert(xy[1]) + yOffset;

            if (!this.checkRangeXY(x, y, xAxis, yAxis)) {
                continue;
            }

            const text = labelKey ? String(validData[i][labelKey]) : '';
            const size = HdpiCanvas.getTextSize(text, font);
            const markerSize = sizeData.length ? sizeScale.convert(sizeData[i]) : marker.size;

            nodeData[actualLength++] = {
                series: this,
                itemId: yKey,
                datum: validData[i],
                point: { x, y, size: markerSize },
                label: {
                    text,
                    ...size,
                },
            };
        }

        nodeData.length = actualLength;

        return [{ itemId: this.yKey, nodeData, labelData: nodeData }];
    }

    protected isPathOrSelectionDirty(): boolean {
        return this.marker.isDirty();
    }

    getLabelData(): PointLabelDatum[] {
        return this.contextNodeData?.reduce((r, n) => r.concat(n.labelData), [] as PointLabelDatum[]);
    }

    protected async updateMarkerSelection(opts: {
        nodeData: ScatterNodeDatum[];
        markerSelection: Selection<Marker, Group, ScatterNodeDatum, any>;
    }) {
        let { nodeData, markerSelection } = opts;
        const {
            marker: { enabled, shape },
        } = this;
        const MarkerShape = getMarker(shape);

        if (this.marker.isDirty()) {
            markerSelection = markerSelection.setData([]);
            markerSelection.exit.remove();
        }

        const data = enabled ? nodeData : [];
        const updateMarkers = markerSelection.setData(data);
        updateMarkers.exit.remove();
        const enterMarkers = updateMarkers.enter.append(MarkerShape);
        return updateMarkers.merge(enterMarkers);
    }

    protected async updateMarkerNodes(opts: {
        markerSelection: Selection<Marker, Group, ScatterNodeDatum, any>;
        isHighlight: boolean;
    }) {
        const { markerSelection, isHighlight: isDatumHighlighted } = opts;
        const {
            marker,
            xKey,
            yKey,
            strokeWidth,
            fillOpacity: seriesFillOpacity,
            strokeOpacity: seriesStrokeOpacity,
            fill: seriesFill,
            stroke: seriesStroke,
            sizeScale,
            marker: {
                fillOpacity: markerFillOpacity = seriesFillOpacity,
                strokeOpacity: markerStrokeOpacity = seriesStrokeOpacity,
            },
            highlightStyle: {
                fill: deprecatedFill,
                stroke: deprecatedStroke,
                strokeWidth: deprecatedStrokeWidth,
                item: {
                    fill: highlightedFill = deprecatedFill,
                    fillOpacity: highlightFillOpacity = markerFillOpacity,
                    stroke: highlightedStroke = deprecatedStroke,
                    strokeWidth: highlightedDatumStrokeWidth = deprecatedStrokeWidth,
                },
            },
            id: seriesId,
        } = this;
        const markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : strokeWidth;
        const { formatter } = marker;

        sizeScale.range = [marker.size, marker.maxSize];

        markerSelection.each((node, datum) => {
            const fill =
                isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill || seriesFill;
            const fillOpacity = isDatumHighlighted ? highlightFillOpacity : markerFillOpacity;
            const stroke =
                isDatumHighlighted && highlightedStroke !== undefined
                    ? highlightedStroke
                    : marker.stroke || seriesStroke;
            const strokeOpacity = markerStrokeOpacity;
            const strokeWidth =
                isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                    ? highlightedDatumStrokeWidth
                    : markerStrokeWidth;
            const size = datum.point?.size ?? 0;

            let format: AgCartesianSeriesMarkerFormat | undefined = undefined;
            if (formatter) {
                format = formatter({
                    datum: datum.datum,
                    xKey,
                    yKey,
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
            node.size = format && format.size !== undefined ? format.size : size;
            node.fillOpacity = fillOpacity ?? 1;
            node.strokeOpacity = strokeOpacity ?? 1;
            node.translationX = datum.point?.x ?? 0;
            node.translationY = datum.point?.y ?? 0;
            node.visible = node.size > 0;
        });

        if (!isDatumHighlighted) {
            this.marker.markClean();
        }
    }

    protected async updateLabelSelection(opts: {
        labelData: ScatterNodeDatum[];
        labelSelection: Selection<Text, Group, ScatterNodeDatum, any>;
    }) {
        const { labelSelection } = opts;
        const {
            label: { enabled },
        } = this;

        const placedLabels = enabled ? this.chart?.placeLabels().get(this) ?? [] : [];

        const placedNodeDatum = placedLabels.map(
            (v): ScatterNodeDatum => ({
                ...(v.datum as ScatterNodeDatum),
                point: {
                    x: v.x,
                    y: v.y,
                    size: v.datum.point.size,
                },
            })
        );
        const updateLabels = labelSelection.setData(placedNodeDatum);
        updateLabels.exit.remove();
        const enterLabels = updateLabels.enter.append(Text);
        return updateLabels.merge(enterLabels);
    }

    protected async updateLabelNodes(opts: { labelSelection: Selection<Text, Group, ScatterNodeDatum, any> }) {
        const { labelSelection } = opts;
        const { label } = this;

        labelSelection.each((text, datum) => {
            text.text = datum.label.text;
            text.fill = label.color;
            text.x = datum.point?.x ?? 0;
            text.y = datum.point?.y ?? 0;
            text.fontStyle = label.fontStyle;
            text.fontWeight = label.fontWeight;
            text.fontSize = label.fontSize;
            text.fontFamily = label.fontFamily;
            text.textAlign = 'left';
            text.textBaseline = 'top';
        });
    }

    getTooltipHtml(nodeDatum: ScatterNodeDatum): string {
        const { xKey, yKey, xAxis, yAxis } = this;

        if (!xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }

        const {
            fill: seriesFill,
            stroke: seriesStroke,
            marker,
            tooltip,
            xName,
            yName,
            sizeKey,
            sizeName,
            labelKey,
            labelName,
            id: seriesId,
        } = this;

        const fill = marker.fill ?? seriesFill;
        const stroke = marker.stroke ?? seriesStroke;
        const strokeWidth = this.getStrokeWidth(marker.strokeWidth || this.strokeWidth);

        const { formatter } = this.marker;
        let format: AgCartesianSeriesMarkerFormat | undefined = undefined;

        if (formatter) {
            format = formatter({
                datum: nodeDatum,
                xKey,
                yKey,
                fill,
                stroke,
                strokeWidth,
                size: nodeDatum.point?.size ?? 0,
                highlighted: false,
                seriesId,
            });
        }

        const color = (format && format.fill) || fill || 'gray';
        const title = this.title || yName;
        const datum = nodeDatum.datum;
        const xValue = datum[xKey];
        const yValue = datum[yKey];
        const xString = sanitizeHtml(xAxis.formatDatum(xValue));
        const yString = sanitizeHtml(yAxis.formatDatum(yValue));

        let content =
            `<b>${sanitizeHtml(xName || xKey)}</b>: ${xString}<br>` +
            `<b>${sanitizeHtml(yName || yKey)}</b>: ${yString}`;

        if (sizeKey) {
            content += `<br><b>${sanitizeHtml(sizeName || sizeKey)}</b>: ${sanitizeHtml(datum[sizeKey])}`;
        }

        if (labelKey) {
            content = `<b>${sanitizeHtml(labelName || labelKey)}</b>: ${sanitizeHtml(datum[labelKey])}<br>` + content;
        }

        const defaults: AgTooltipRendererResult = {
            title,
            backgroundColor: color,
            content,
        };

        const { renderer: tooltipRenderer } = tooltip;

        if (tooltipRenderer) {
            return toTooltipHtml(
                tooltipRenderer({
                    datum,
                    xKey,
                    xValue,
                    xName,
                    yKey,
                    yValue,
                    yName,
                    sizeKey,
                    sizeName,
                    labelKey,
                    labelName,
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
        const { id, data, xKey, yKey, yName, title, visible, marker, fill, stroke, fillOpacity, strokeOpacity } = this;

        if (!(data && data.length && xKey && yKey)) {
            return [];
        }
        return [
            {
                id,
                itemId: yKey,
                seriesId: id,
                enabled: visible,
                label: {
                    text: title || yName || yKey,
                },
                marker: {
                    shape: marker.shape,
                    fill: marker.fill || fill || 'rgba(0, 0, 0, 0)',
                    stroke: marker.stroke || stroke || 'rgba(0, 0, 0, 0)',
                    fillOpacity: marker.fillOpacity !== undefined ? marker.fillOpacity : fillOpacity,
                    strokeOpacity: marker.strokeOpacity !== undefined ? marker.strokeOpacity : strokeOpacity,
                },
            },
        ];
    }

    protected isLabelEnabled() {
        return this.label.enabled;
    }
}
