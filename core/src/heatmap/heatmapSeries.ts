import { _ModuleSupport, _Scale, _Scene, _Util } from 'ag-charts-community';

type AgHeatmapSeriesTooltipRendererParams = any;
type AgTooltipRendererResult = any;
type AgHeatmapSeriesFormatterParams<_T> = any;
type AgHeatmapSeriesFormat = any;

const {
    Validate,
    ActionOnSet,
    DataModel,
    SeriesNodePickMode,
    valueProperty,
    ChartAxisDirection,
    STRING,
    COLOR_STRING_ARRAY,
    OPT_NUMBER,
    OPT_STRING,
    OPT_FUNCTION,
    OPT_NUMBER_ARRAY,
    OPT_COLOR_STRING,
} = _ModuleSupport;
const { Rect, Label, toTooltipHtml } = _Scene;
const { ContinuousScale, ColorScale } = _Scale;
const { sanitizeHtml } = _Util;

interface HeatmapNodeDatum extends Required<_ModuleSupport.CartesianSeriesNodeDatum> {
    readonly label: _Util.MeasuredLabel;
    readonly width: number;
    readonly height: number;
    readonly fill: string;
}

class HeatmapSeriesNodeBaseClickEvent extends _ModuleSupport.CartesianSeriesNodeBaseClickEvent<any> {
    readonly labelKey?: string;

    constructor(
        labelKey: string | undefined,
        xKey: string,
        yKey: string,
        nativeEvent: MouseEvent,
        datum: HeatmapNodeDatum,
        series: HeatmapSeries
    ) {
        super(xKey, yKey, nativeEvent, datum, series);
        this.labelKey = labelKey;
    }
}

export class HeatmapSeriesNodeClickEvent extends HeatmapSeriesNodeBaseClickEvent {
    readonly type = 'nodeClick';
}

export class HeatmapSeriesNodeDoubleClickEvent extends HeatmapSeriesNodeBaseClickEvent {
    readonly type = 'nodeDoubleClick';
}

class HeatmapSeriesTooltip extends _ModuleSupport.SeriesTooltip {
    @Validate(OPT_FUNCTION)
    renderer?: (params: AgHeatmapSeriesTooltipRendererParams) => string | AgTooltipRendererResult = undefined;
}

export class HeatmapSeries extends _ModuleSupport.CartesianSeries<
    _ModuleSupport.SeriesNodeDataContext<any>,
    _Scene.Rect
> {
    static className = 'HeatmapSeries';
    static type = 'heatmap' as const;

    readonly label = new Label();

    @Validate(OPT_STRING)
    title?: string = undefined;

    @Validate(OPT_STRING)
    labelKey?: string = undefined;

    @Validate(STRING)
    @ActionOnSet<HeatmapSeries>({
        newValue(_xKey: string) {
            this.processedData = undefined;
        },
    })
    xKey: string = '';

    @Validate(STRING)
    xName: string = '';

    @Validate(STRING)
    @ActionOnSet<HeatmapSeries>({
        newValue(_yKey: string) {
            this.processedData = undefined;
        },
    })
    yKey: string = '';

    @Validate(STRING)
    yName: string = '';

    @Validate(OPT_STRING)
    labelName?: string = 'Label';

    @Validate(OPT_STRING)
    @ActionOnSet<HeatmapSeries>({
        newValue(_colorKey: string) {
            this.processedData = undefined;
        },
    })
    colorKey?: string = 'color';

    @Validate(OPT_STRING)
    colorName?: string = 'color';

    @Validate(OPT_NUMBER_ARRAY)
    colorDomain: number[] | undefined = undefined;

    @Validate(COLOR_STRING_ARRAY)
    colorRange: string[] = ['#cb4b3f', '#6acb64'];

    colorScale: _Scale.ColorScale;

    @Validate(OPT_COLOR_STRING)
    stroke: string = 'black';

    @Validate(OPT_NUMBER(0))
    strokeWidth: number = 0;

    @Validate(OPT_FUNCTION)
    formatter?: (params: AgHeatmapSeriesFormatterParams<any>) => AgHeatmapSeriesFormat = undefined;

    readonly tooltip: HeatmapSeriesTooltip = new HeatmapSeriesTooltip();

    constructor() {
        super({
            pickModes: [
                SeriesNodePickMode.NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST,
                SeriesNodePickMode.NEAREST_NODE,
                SeriesNodePickMode.EXACT_SHAPE_MATCH,
            ],
            pathsPerSeries: 0,
            hasMarkers: false,
        });

        this.label.enabled = false;

        this.colorScale = new ColorScale();
    }

    async processData() {
        const { xKey, yKey, xAxis, yAxis } = this;

        if (!xAxis || !yAxis) {
            return;
        }

        const data = xKey && yKey && this.data ? this.data : [];
        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const isContinuousX = xScale instanceof ContinuousScale;
        const isContinuousY = yScale instanceof ContinuousScale;

        const { colorScale, colorDomain, colorRange, colorKey } = this;

        this.dataModel = new DataModel<any>({
            props: [
                valueProperty(xKey, isContinuousX),
                valueProperty(yKey, isContinuousY),
                ...(colorKey ? [valueProperty(colorKey, true)] : []),
            ],
        });
        this.processedData = this.dataModel.processData(data ?? []);

        if (colorKey) {
            const colorKeyIdx = this.dataModel.resolveProcessedDataIndex(colorKey)?.index ?? -1;
            colorScale.domain = colorDomain ?? this.processedData.domain.values[colorKeyIdx];
            colorScale.range = colorRange;
        }
    }

    getDomain(direction: _ModuleSupport.ChartAxisDirection): any[] {
        const xDataIdx = this.dataModel?.resolveProcessedDataIndex(this.xKey);
        const yDataIdx = this.dataModel?.resolveProcessedDataIndex(this.yKey);

        if (!xDataIdx || !yDataIdx) {
            return [];
        }

        if (direction === ChartAxisDirection.X) {
            return this.processedData?.domain.values[0] ?? [];
        } else {
            return this.processedData?.domain.values[1] ?? [];
        }
    }

    protected getNodeClickEvent(event: MouseEvent, datum: HeatmapNodeDatum): HeatmapSeriesNodeClickEvent {
        return new HeatmapSeriesNodeClickEvent(this.labelKey, this.xKey, this.yKey, event, datum, this);
    }

    protected getNodeDoubleClickEvent(event: MouseEvent, datum: HeatmapNodeDatum): HeatmapSeriesNodeDoubleClickEvent {
        return new HeatmapSeriesNodeDoubleClickEvent(this.labelKey, this.xKey, this.yKey, event, datum, this);
    }

    async createNodeData() {
        const { data, visible, xAxis, yAxis } = this;

        if (!(data && visible && xAxis && yAxis)) {
            return [];
        }

        const xScale = xAxis.scale;
        const yScale = yAxis.scale;
        const xOffset = (xScale.bandwidth || 0) / 2;
        const yOffset = (yScale.bandwidth || 0) / 2;
        const { colorScale, label, labelKey, xKey, yKey } = this;
        const nodeData: HeatmapNodeDatum[] = new Array(this.processedData?.data.length ?? 0);

        const width = xScale.bandwidth || 10;
        const height = yScale.bandwidth || 10;

        const font = label.getFont();
        let actualLength = 0;
        for (const { values, datum } of this.processedData?.data ?? []) {
            const x = xScale.convert(values[0]) + xOffset;
            const y = yScale.convert(values[1]) + yOffset;

            if (!this.checkRangeXY(x, y, xAxis, yAxis)) {
                continue;
            }

            const text = labelKey ? String(datum[labelKey]) : '';
            const size = _Scene.HdpiCanvas.getTextSize(text, font);

            const colorValue = values.length > 2 ? values[2] : 0;
            const fill = colorScale.convert(colorValue);

            nodeData[actualLength++] = {
                series: this,
                itemId: yKey,
                yKey,
                xKey,
                datum,
                point: { x, y, size: 0 },
                width,
                height,
                fill,
                label: {
                    text,
                    ...size,
                },
                nodeMidPoint: { x, y },
            };
        }

        nodeData.length = actualLength;

        return [{ itemId: this.yKey, nodeData, labelData: nodeData }];
    }

    getLabelData(): _Util.PointLabelDatum[] {
        return this.contextNodeData?.reduce((r, n) => r.concat(n.labelData), [] as _Util.PointLabelDatum[]);
    }

    protected nodeFactory() {
        return new Rect();
    }

    protected async updateDatumSelection(opts: {
        nodeData: HeatmapNodeDatum[];
        datumSelection: _Scene.Selection<_Scene.Rect, HeatmapNodeDatum>;
    }) {
        const { nodeData, datumSelection } = opts;
        const data = nodeData || [];
        return datumSelection.update(data);
    }

    protected async updateDatumNodes(opts: {
        datumSelection: _Scene.Selection<_Scene.Rect, HeatmapNodeDatum>;
        isHighlight: boolean;
    }) {
        const { datumSelection, isHighlight: isDatumHighlighted } = opts;

        const {
            xKey,
            yKey,
            labelKey,
            colorKey,
            formatter,
            highlightStyle: {
                item: { fill: highlightedFill, stroke: highlightedStroke, strokeWidth: highlightedDatumStrokeWidth },
            },
            id: seriesId,
        } = this;

        const [visibleMin, visibleMax] = this.xAxis?.visibleRange ?? [];
        const isZoomed = visibleMin !== 0 || visibleMax !== 1;
        const crisp = !isZoomed;
        datumSelection.each((rect, datum) => {
            const { point, width, height } = datum;

            const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : datum.fill;
            const stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : this.stroke;
            const strokeWidth =
                isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                    ? highlightedDatumStrokeWidth
                    : this.strokeWidth;

            let format: AgHeatmapSeriesFormat | undefined = undefined;
            if (formatter) {
                format = formatter({
                    datum: datum.datum,
                    fill,
                    stroke,
                    strokeWidth,
                    highlighted: isDatumHighlighted,
                    xKey,
                    yKey,
                    colorKey,
                    labelKey,
                    seriesId,
                });
            }

            rect.crisp = crisp;
            rect.x = point.x - width / 2;
            rect.y = point.y - height / 2;
            rect.width = width;
            rect.height = height;
            rect.fill = format?.fill || fill;
            rect.stroke = format?.stroke || stroke;
            rect.strokeWidth = format?.strokeWidth ?? strokeWidth;
        });
    }

    protected async updateLabelSelection(opts: {
        labelData: HeatmapNodeDatum[];
        labelSelection: _Scene.Selection<_Scene.Text, HeatmapNodeDatum>;
    }) {
        const { labelSelection } = opts;
        const {
            label: { enabled },
        } = this;

        const placedLabels = enabled ? this.chart?.placeLabels().get(this) ?? [] : [];

        const placedNodeDatum = placedLabels.map(
            (v): HeatmapNodeDatum => ({
                ...(v.datum as HeatmapNodeDatum),
                point: {
                    x: v.x,
                    y: v.y,
                    size: v.datum.point.size,
                },
            })
        );
        return labelSelection.update(placedNodeDatum);
    }

    protected async updateLabelNodes(opts: { labelSelection: _Scene.Selection<_Scene.Text, HeatmapNodeDatum> }) {
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

    getTooltipHtml(nodeDatum: HeatmapNodeDatum): string {
        const { xKey, yKey, xAxis, yAxis } = this;

        if (!xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }

        const {
            formatter,
            tooltip,
            xName,
            yName,
            labelKey,
            labelName,
            id: seriesId,
            stroke,
            strokeWidth,
            colorKey,
            colorName,
            colorScale,
        } = this;

        const colorValue = colorKey ? nodeDatum.datum[colorKey] ?? 0 : 0;
        const fill = colorScale.convert(colorValue);

        let format: AgHeatmapSeriesFormat | undefined = undefined;

        if (formatter) {
            format = formatter({
                datum: nodeDatum,
                xKey,
                yKey,
                colorKey,
                labelKey,
                fill,
                stroke,
                strokeWidth,
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

        if (colorKey) {
            content = `<b>${sanitizeHtml(colorName || colorKey)}</b>: ${sanitizeHtml(colorValue)}<br>` + content;
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

    getLegendData(): any[] {
        // Hide the current legend implementation
        return [];
    }

    protected isLabelEnabled() {
        return this.label.enabled;
    }

    getBandScalePadding() {
        return { inner: 0, outer: 0 };
    }
}
