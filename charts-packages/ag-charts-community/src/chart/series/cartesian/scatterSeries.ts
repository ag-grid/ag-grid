import { Selection } from '../../../scene/selection';
import { Group } from '../../../scene/group';
import {
    SeriesNodeDatum,
    CartesianTooltipRendererParams,
    SeriesTooltip,
    SeriesNodeDataContext,
    SeriesNodePickMode,
} from '../series';
import { extentReducer } from '../../../util/array';
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
import { MeasuredLabel, PointLabelDatum } from '../../../util/labelPlacement';
import { checkDatum, isContinuous } from '../../../util/value';
import { Deprecated, OPT_FUNCTION, OPT_STRING, STRING, Validate } from '../../../util/validation';
import { batchedMap, batchedReduce, BatchedChain } from '../../../util/scheduler';

interface ScatterNodeDatum extends Required<SeriesNodeDatum> {
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
    @Validate(OPT_FUNCTION)
    renderer?: (params: ScatterTooltipRendererParams) => string | TooltipRendererResult = undefined;
}

export class ScatterSeries extends CartesianSeries<SeriesNodeDataContext<ScatterNodeDatum>> {
    static className = 'ScatterSeries';
    static type = 'scatter' as const;

    private processedData: { datum: any; x: any; y: any; label?: string; size?: number }[];
    private xDomain: number[] = [];
    private yDomain: number[] = [];
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
        this.processedData = [];
    }
    get xKey(): string {
        return this._xKey;
    }

    @Validate(STRING)
    protected _yKey: string = '';
    set yKey(value: string) {
        this._yKey = value;
        this.processedData = [];
    }
    get yKey(): string {
        return this._yKey;
    }

    @Validate(OPT_STRING)
    protected _sizeKey?: string = undefined;
    set sizeKey(value: string | undefined) {
        this._sizeKey = value;
        this.processedData = [];
    }
    get sizeKey(): string | undefined {
        return this._sizeKey;
    }

    readonly tooltip: ScatterSeriesTooltip = new ScatterSeriesTooltip();

    constructor() {
        super({
            pickGroupIncludes: ['markers'],
            pickModes: [
                SeriesNodePickMode.NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST,
                SeriesNodePickMode.NEAREST_NODE,
                SeriesNodePickMode.EXACT_SHAPE_MATCH,
            ],
            pathsPerSeries: 0,
            features: ['markers'],
        });

        const { label } = this;

        label.enabled = false;
    }

    setColors(fills: string[], strokes: string[]) {
        this.marker.fill = fills[0];
        this.marker.stroke = strokes[0];
    }

    async processData() {
        const { xKey, yKey, sizeKey, xAxis, yAxis, marker, labelKey } = this;

        if (!xAxis || !yAxis) {
            return;
        }

        const data = xKey && yKey && this.data ? this.data : [];
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const isContinuousX = xScale instanceof ContinuousScale;
        const isContinuousY = yScale instanceof ContinuousScale;

        const processingChain = new BatchedChain<any>()
            .filter(
                (d) =>
                    checkDatum(d[xKey], isContinuousX) !== undefined && checkDatum(d[yKey], isContinuousY) !== undefined
            )
            .map((d) => ({
                datum: d,
                x: d[xKey],
                y: d[yKey],
                size: sizeKey ? d[sizeKey] : undefined,
                label: labelKey ? d[labelKey] : undefined,
            }));
        const processedData = await processingChain.execute(data);

        if (marker.domain) {
            this.sizeScale.domain = marker.domain;
        } else {
            this.sizeScale.domain = (await batchedReduce(
                processedData,
                extentReducer('size', isContinuous),
                undefined
            )) || [1, 1];
        }

        if (xAxis.scale instanceof ContinuousScale) {
            const xExtent = await batchedReduce(processedData, extentReducer('x', isContinuous), undefined);
            this.xDomain = this.fixNumericExtent(xExtent, xAxis);
        } else {
            this.xDomain = await batchedMap(processedData, (d) => d.x);
        }

        if (yAxis.scale instanceof ContinuousScale) {
            const yExtent = await batchedReduce(processedData, extentReducer('y', isContinuous), undefined);
            this.yDomain = this.fixNumericExtent(yExtent, yAxis);
        } else {
            this.yDomain = await batchedMap(processedData, (d) => d.y);
        }

        this.processedData = processedData;
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

    async createNodeData() {
        const { chart, data, visible, xAxis, yAxis, yKey, label, labelKey, sizeKey, processedData } = this;

        if (!(chart && data && visible && xAxis && yAxis)) {
            return [];
        }

        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const isContinuousX = xScale instanceof ContinuousScale;
        const isContinuousY = yScale instanceof ContinuousScale;
        const xOffset = (xScale.bandwidth || 0) / 2;
        const yOffset = (yScale.bandwidth || 0) / 2;
        const { sizeScale, marker } = this;

        sizeScale.range = [marker.size, marker.maxSize];

        const font = label.getFont();

        const processingChain = new BatchedChain<typeof processedData[number]>()
            .map((pd) => ({
                pd,
                xy: this.checkDomainXY(pd.x, pd.y, isContinuousX, isContinuousY),
            }))
            .filter(({ xy }) => xy != null)
            .map((d) => ({
                ...d,
                x: xScale.convert(d.xy![0]) + xOffset,
                y: yScale.convert(d.xy![1]) + yOffset,
            }))
            .filter(({ x, y }) => this.checkRangeXY(x, y, xAxis, yAxis))
            .map(({ pd, x, y }): ScatterNodeDatum => {
                const size = labelKey && pd.label ? HdpiCanvas.getTextSize(pd.label, font) : { width: 0, height: 0 };
                const markerSize = sizeKey ? sizeScale.convert(pd.size) : marker.size;
                return {
                    series: this,
                    itemId: yKey,
                    datum: pd.datum,
                    point: { x, y, size: markerSize },
                    label: {
                        text: pd.label || '',
                        ...size,
                    },
                };
            });
        const nodeData = await processingChain.execute(processedData);

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

        const placedLabels = this.chart?.placeLabels().get(this) ?? [];

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
                size: nodeDatum.point?.size ?? 0,
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
                itemId: yKey,
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
