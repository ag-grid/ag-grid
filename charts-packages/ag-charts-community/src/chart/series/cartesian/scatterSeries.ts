import { Selection } from '../../../scene/selection';
import { Group } from '../../../scene/group';
import { SeriesNodeDatum, CartesianTooltipRendererParams, SeriesTooltip, SeriesNodeDataContext } from '../series';
import { extent } from '../../../util/array';
import { LegendDatum } from '../../legend';
import { LinearScale } from '../../../scale/linearScale';
import { TypedEvent } from '../../../util/observable';
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesMarkerFormat } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxis';
import { getMarker } from '../../marker/util';
import { TooltipRendererResult, toTooltipHtml } from '../../chart';
import { ContinuousScale } from '../../../scale/continuousScale';
import { sanitizeHtml } from '../../../util/sanitize';
import { Label } from '../../label';
import { Text } from '../../../scene/shape/text';
import { HdpiCanvas } from '../../../canvas/hdpiCanvas';
import { Marker } from '../../marker/marker';
import { MeasuredLabel } from '../../../util/labelPlacement';
import { isContinuous } from '../../../util/value';

interface ScatterNodeDatum extends SeriesNodeDatum {
    readonly point: {
        readonly x: number;
        readonly y: number;
    };
    readonly size: number;
    readonly label: MeasuredLabel;
}

export interface ScatterSeriesNodeClickEvent extends TypedEvent {
    readonly type: 'nodeClick';
    readonly event: MouseEvent;
    readonly series: ScatterSeries;
    readonly datum: any;
    readonly xKey: string;
    readonly yKey: string;
    readonly sizeKey?: string;
}

export interface ScatterTooltipRendererParams extends CartesianTooltipRendererParams {
    readonly sizeKey?: string;
    readonly sizeName?: string;

    readonly labelKey?: string;
    readonly labelName?: string;
}

export class ScatterSeriesTooltip extends SeriesTooltip {
    renderer?: (params: ScatterTooltipRendererParams) => string | TooltipRendererResult = undefined;
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
    fill: string | undefined = '#c16068';

    /**
     * @deprecated Use {@link marker.stroke} instead.
     */
    stroke: string | undefined = '#874349';

    /**
     * @deprecated Use {@link marker.strokeWidth} instead.
     */
    strokeWidth: number = 2;
    /**
     * @deprecated Use {@link marker.fillOpacity} instead.
     */
    fillOpacity: number = 1;

    /**
     * @deprecated Use {@link marker.strokeOpacity} instead.
     */
    strokeOpacity: number = 1;

    title?: string = undefined;
    labelKey?: string = undefined;

    xName: string = '';
    yName: string = '';
    sizeName?: string = 'Size';
    labelName?: string = 'Label';

    protected _xKey: string = '';
    set xKey(value: string) {
        this._xKey = value;
        this.xData = [];
    }
    get xKey(): string {
        return this._xKey;
    }

    protected _yKey: string = '';
    set yKey(value: string) {
        this._yKey = value;
        this.yData = [];
    }
    get yKey(): string {
        return this._yKey;
    }

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
        super({ pickGroupIncludes: ['datumNodes'], pathsPerSeries: 0 });

        const { label } = this;

        label.enabled = false;
    }

    setColors(fills: string[], strokes: string[]) {
        this.fill = fills[0];
        this.stroke = strokes[0];
        this.marker.fill = fills[0];
        this.marker.stroke = strokes[0];
    }

    processData(): boolean {
        const { xKey, yKey, sizeKey, xAxis, yAxis, marker } = this;

        if (!xAxis || !yAxis) {
            return false;
        }

        const data = xKey && yKey && this.data ? this.data : [];
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const isContinuousX = xScale instanceof ContinuousScale;
        const isContinuousY = yScale instanceof ContinuousScale;

        this.validData = data.filter(
            (d) =>
                this.checkDatum(d[xKey], isContinuousX) !== undefined &&
                this.checkDatum(d[yKey], isContinuousY) !== undefined
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

        return true;
    }

    getDomain(direction: ChartAxisDirection): any[] {
        if (direction === ChartAxisDirection.X) {
            return this.xDomain;
        } else {
            return this.yDomain;
        }
    }

    fireNodeClickEvent(event: MouseEvent, datum: ScatterNodeDatum): void {
        this.fireEvent<ScatterSeriesNodeClickEvent>({
            type: 'nodeClick',
            event,
            series: this,
            datum: datum.datum,
            xKey: this.xKey,
            yKey: this.yKey,
            sizeKey: this.sizeKey,
        });
    }

    createNodeData() {
        const { chart, data, visible, xAxis, yAxis, label, labelKey } = this;

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

            nodeData[actualLength++] = {
                series: this,
                datum: validData[i],
                point: { x, y },
                size: sizeData.length ? sizeScale.convert(sizeData[i]) : marker.size,
                label: {
                    text,
                    ...size,
                },
            };
        }

        nodeData.length = actualLength;

        return [{ itemId: this.yKey, nodeData, labelData: nodeData }];
    }

    protected updateDatumSelection(opts: {
        nodeData: ScatterNodeDatum[];
        datumSelection: Selection<Marker, Group, ScatterNodeDatum, any>;
    }): Selection<Marker, Group, ScatterNodeDatum, any> {
        const { nodeData, datumSelection } = opts;
        const {
            marker: { enabled, shape },
        } = this;
        const MarkerShape = getMarker(shape);

        const data = enabled ? nodeData : [];
        const updateDatums = datumSelection.setData(data);
        updateDatums.exit.remove();
        const enterDatums = updateDatums.enter.append(MarkerShape);
        return updateDatums.merge(enterDatums);
    }

    protected updateDatumNodes(opts: {
        datumSelection: Selection<Marker, Group, ScatterNodeDatum, any>;
        isHighlight: boolean;
    }): void {
        const { datumSelection, isHighlight: isDatumHighlighted } = opts;
        const {
            marker,
            xKey,
            yKey,
            strokeWidth,
            fillOpacity,
            strokeOpacity,
            fill: seriesFill,
            stroke: seriesStroke,
            sizeScale,
            sizeData,
            highlightStyle: {
                fill: deprecatedFill,
                stroke: deprecatedStroke,
                strokeWidth: deprecatedStrokeWidth,
                item: {
                    fill: highlightedFill = deprecatedFill,
                    stroke: highlightedStroke = deprecatedStroke,
                    strokeWidth: highlightedDatumStrokeWidth = deprecatedStrokeWidth,
                },
            },
        } = this;
        const markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : strokeWidth;
        const { formatter } = marker;

        sizeScale.range = [marker.size, marker.maxSize];

        datumSelection.each((node, datum) => {
            const fill =
                isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill || seriesFill;
            const stroke =
                isDatumHighlighted && highlightedStroke !== undefined
                    ? highlightedStroke
                    : marker.stroke || seriesStroke;
            const strokeWidth =
                isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                    ? highlightedDatumStrokeWidth
                    : markerStrokeWidth;
            const size = datum.size;

            let format: CartesianSeriesMarkerFormat | undefined = undefined;
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
                });
            }

            node.fill = (format && format.fill) || fill;
            node.stroke = (format && format.stroke) || stroke;
            node.strokeWidth = format && format.strokeWidth !== undefined ? format.strokeWidth : strokeWidth;
            node.size = format && format.size !== undefined ? format.size : size;
            node.fillOpacity = marker.fillOpacity !== undefined ? marker.fillOpacity : fillOpacity;
            node.strokeOpacity = marker.strokeOpacity !== undefined ? marker.strokeOpacity : strokeOpacity;
            node.translationX = datum.point.x;
            node.translationY = datum.point.y;
            node.visible = node.size > 0;
        });
    }

    protected updateLabelSelection(opts: {
        labelData: ScatterNodeDatum[];
        labelSelection: Selection<Text, Group, ScatterNodeDatum, any>;
    }): Selection<Text, Group, ScatterNodeDatum, any> {
        const { labelSelection, labelData } = opts;

        const placedLabels = this.chart?.placeLabels().get(this) ?? [];

        const placedNodeDatum = placedLabels.map((v) => ({
            ...(v.datum as ScatterNodeDatum),
            point: {
                x: v.x,
                y: v.y,
            },
        }));
        const updateLabels = labelSelection.setData(placedNodeDatum);
        updateLabels.exit.remove();
        const enterLabels = updateLabels.enter.append(Text);
        return updateLabels.merge(enterLabels);
    }

    protected updateLabelNodes(opts: { labelSelection: Selection<Text, Group, ScatterNodeDatum, any> }): void {
        const { labelSelection } = opts;
        const { label } = this;

        labelSelection.each((text, datum) => {
            text.text = datum.label.text;
            text.fill = label.color;
            text.x = datum.point.x;
            text.y = datum.point.y;
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
        } = this;

        const fill = marker.fill ?? seriesFill;
        const stroke = marker.stroke ?? seriesStroke;
        const strokeWidth = this.getStrokeWidth(marker.strokeWidth || this.strokeWidth);

        const { formatter } = this.marker;
        let format: CartesianSeriesMarkerFormat | undefined = undefined;

        if (formatter) {
            format = formatter({
                datum: nodeDatum,
                xKey,
                yKey,
                fill,
                stroke,
                strokeWidth,
                size: nodeDatum.size,
                highlighted: false,
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

        const defaults: TooltipRendererResult = {
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
                }),
                defaults
            );
        }

        return toTooltipHtml(defaults);
    }

    listSeriesItems(legendData: LegendDatum[]): void {
        const { id, data, xKey, yKey, yName, title, visible, marker, fill, stroke, fillOpacity, strokeOpacity } = this;

        if (data && data.length && xKey && yKey) {
            legendData.push({
                id,
                itemId: undefined,
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
            });
        }
    }
}
