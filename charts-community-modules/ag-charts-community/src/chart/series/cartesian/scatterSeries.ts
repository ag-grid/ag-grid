import { Selection } from '../../../scene/selection';
import { SeriesTooltip, SeriesNodeDataContext, SeriesNodePickMode } from '../series';
import { LegendDatum } from '../../legendDatum';
import { LinearScale } from '../../../scale/linearScale';
import {
    CartesianSeries,
    CartesianSeriesMarker,
    CartesianSeriesNodeBaseClickEvent,
    CartesianSeriesNodeDatum,
} from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { getMarker } from '../../marker/util';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { ContinuousScale } from '../../../scale/continuousScale';
import { sanitizeHtml } from '../../../util/sanitize';
import { Label } from '../../label';
import { Text } from '../../../scene/shape/text';
import { HdpiCanvas } from '../../../canvas/hdpiCanvas';
import { Marker } from '../../marker/marker';
import { MeasuredLabel, PointLabelDatum } from '../../../util/labelPlacement';
import { checkDatum } from '../../../util/value';
import { OPT_FUNCTION, OPT_STRING, STRING, Validate } from '../../../util/validation';
import {
    AgScatterSeriesTooltipRendererParams,
    AgTooltipRendererResult,
    AgCartesianSeriesMarkerFormat,
} from '../../agChartOptions';
import { DataModel, DatumPropertyDefinition, ProcessedData } from '../../data/dataModel';

interface ScatterNodeDatum extends Required<CartesianSeriesNodeDatum> {
    readonly label: MeasuredLabel;
}

class ScatterSeriesNodeBaseClickEvent extends CartesianSeriesNodeBaseClickEvent<any> {
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

export class ScatterSeriesNodeClickEvent extends ScatterSeriesNodeBaseClickEvent {
    readonly type = 'nodeClick';
}

export class ScatterSeriesNodeDoubleClickEvent extends ScatterSeriesNodeBaseClickEvent {
    readonly type = 'nodeDoubleClick';
}

class ScatterSeriesTooltip extends SeriesTooltip {
    @Validate(OPT_FUNCTION)
    renderer?: (params: AgScatterSeriesTooltipRendererParams) => string | AgTooltipRendererResult = undefined;
}

export class ScatterSeries extends CartesianSeries<SeriesNodeDataContext<ScatterNodeDatum>> {
    static className = 'ScatterSeries';
    static type = 'scatter' as const;

    private processedData?: ProcessedData<any>;
    private sizeScale = new LinearScale();

    readonly marker = new CartesianSeriesMarker();

    readonly label = new Label();

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
        this.processedData = undefined;
    }
    get xKey(): string {
        return this._xKey;
    }

    @Validate(STRING)
    protected _yKey: string = '';
    set yKey(value: string) {
        this._yKey = value;
        this.processedData = undefined;
    }
    get yKey(): string {
        return this._yKey;
    }

    @Validate(OPT_STRING)
    protected _sizeKey?: string = undefined;
    set sizeKey(value: string | undefined) {
        this._sizeKey = value;
        this.processedData = undefined;
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

    async processData() {
        const { xKey, yKey, sizeKey, xAxis, yAxis, marker } = this;

        if (!xAxis || !yAxis || !xKey || !yKey) {
            return;
        }

        const data = xKey && yKey && this.data ? this.data : [];
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const isContinuousX = xScale instanceof ContinuousScale;
        const isContinuousY = yScale instanceof ContinuousScale;

        const sizeKeyProp: DatumPropertyDefinition<any>[] = sizeKey
            ? [{ property: yKey, type: 'value', valueType: 'range', validation: (v) => checkDatum(v, true) }]
            : [];
        const dataModel = new DataModel<any>({
            props: [
                {
                    property: xKey,
                    type: 'value',
                    valueType: isContinuousX ? 'range' : 'category',
                    validation: (v) => checkDatum(v, isContinuousX),
                },
                {
                    property: yKey,
                    type: 'value',
                    valueType: isContinuousY ? 'range' : 'category',
                    validation: (v) => checkDatum(v, isContinuousY),
                },
                ...sizeKeyProp,
            ],
        });
        this.processedData = dataModel.processData(data);

        this.sizeScale.domain = marker.domain ? marker.domain : this.processedData.dataDomain.values[2];
    }

    getDomain(direction: ChartAxisDirection): any[] {
        if (direction === ChartAxisDirection.X) {
            return this.processedData?.dataDomain.values[0] ?? [];
        } else {
            return this.processedData?.dataDomain.values[1] ?? [];
        }
    }

    protected getNodeClickEvent(event: MouseEvent, datum: ScatterNodeDatum): ScatterSeriesNodeClickEvent {
        return new ScatterSeriesNodeClickEvent(this.sizeKey, this.xKey, this.yKey, event, datum, this);
    }

    protected getNodeDoubleClickEvent(event: MouseEvent, datum: ScatterNodeDatum): ScatterSeriesNodeDoubleClickEvent {
        return new ScatterSeriesNodeDoubleClickEvent(this.sizeKey, this.xKey, this.yKey, event, datum, this);
    }

    async createNodeData() {
        const { data, visible, xAxis, yAxis, yKey, xKey, label, labelKey } = this;

        if (!(data && visible && xAxis && yAxis)) {
            return [];
        }

        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const xOffset = (xScale.bandwidth || 0) / 2;
        const yOffset = (yScale.bandwidth || 0) / 2;
        const { sizeScale, marker } = this;
        const nodeData: ScatterNodeDatum[] = new Array(this.processedData?.data.length ?? 0);

        sizeScale.range = [marker.size, marker.maxSize];

        const font = label.getFont();
        let actualLength = 0;
        for (const { values, datum } of this.processedData?.data ?? []) {
            const x = xScale.convert(values[0]) + xOffset;
            const y = yScale.convert(values[1]) + yOffset;

            if (!this.checkRangeXY(x, y, xAxis, yAxis)) {
                continue;
            }

            const text = labelKey ? String(datum[labelKey]) : '';
            const size = HdpiCanvas.getTextSize(text, font);
            const markerSize = values.length > 2 ? sizeScale.convert(values[2]) : marker.size;

            nodeData[actualLength++] = {
                series: this,
                itemId: yKey,
                yKey,
                xKey,
                datum,
                point: { x, y, size: markerSize },
                nodeMidPoint: { x, y },
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

    protected markerFactory() {
        const { shape } = this.marker;
        const MarkerShape = getMarker(shape);
        return new MarkerShape();
    }

    protected async updateMarkerSelection(opts: {
        nodeData: ScatterNodeDatum[];
        markerSelection: Selection<Marker, ScatterNodeDatum>;
    }) {
        const { nodeData, markerSelection } = opts;
        const {
            marker: { enabled },
        } = this;

        if (this.marker.isDirty()) {
            markerSelection.clear();
        }

        const data = enabled ? nodeData : [];
        return markerSelection.update(data);
    }

    protected async updateMarkerNodes(opts: {
        markerSelection: Selection<Marker, ScatterNodeDatum>;
        isHighlight: boolean;
    }) {
        const { markerSelection, isHighlight: isDatumHighlighted } = opts;
        const {
            marker,
            xKey,
            yKey,
            sizeScale,
            marker: {
                fillOpacity: markerFillOpacity,
                strokeOpacity: markerStrokeOpacity,
                strokeWidth: markerStrokeWidth,
            },
            highlightStyle: {
                item: {
                    fill: highlightedFill,
                    fillOpacity: highlightFillOpacity = markerFillOpacity,
                    stroke: highlightedStroke,
                    strokeWidth: highlightedDatumStrokeWidth,
                },
            },
            id: seriesId,
        } = this;
        const { formatter } = marker;

        sizeScale.range = [marker.size, marker.maxSize];

        const customMarker = typeof marker.shape === 'function';

        markerSelection.each((node, datum) => {
            const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill;
            const fillOpacity = isDatumHighlighted ? highlightFillOpacity : markerFillOpacity;
            const stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : marker.stroke;
            const strokeOpacity = markerStrokeOpacity;
            const strokeWidth =
                isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                    ? highlightedDatumStrokeWidth
                    : markerStrokeWidth ?? 1;
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
            node.strokeWidth = format?.strokeWidth ?? strokeWidth;
            node.size = format && format.size !== undefined ? format.size : size;
            node.fillOpacity = fillOpacity ?? 1;
            node.strokeOpacity = strokeOpacity ?? 1;
            node.translationX = datum.point?.x ?? 0;
            node.translationY = datum.point?.y ?? 0;
            node.visible = node.size > 0;

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
        labelData: ScatterNodeDatum[];
        labelSelection: Selection<Text, ScatterNodeDatum>;
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
        return labelSelection.update(placedNodeDatum);
    }

    protected async updateLabelNodes(opts: { labelSelection: Selection<Text, ScatterNodeDatum> }) {
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

        const { marker, tooltip, xName, yName, sizeKey, sizeName, labelKey, labelName, id: seriesId } = this;

        const { fill, stroke } = marker;
        const strokeWidth = this.getStrokeWidth(marker.strokeWidth ?? 1);

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
        const { id, data, xKey, yKey, yName, title, visible, marker } = this;
        const { fill, stroke, fillOpacity, strokeOpacity } = marker;

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
                    fillOpacity: fillOpacity ?? 1,
                    strokeOpacity: strokeOpacity ?? 1,
                },
            },
        ];
    }

    protected isLabelEnabled() {
        return this.label.enabled;
    }
}
