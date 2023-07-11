import type {
    AgCartesianSeriesLabelFormatterParams,
    AgCartesianSeriesTooltipRendererParams,
    AgTooltipRendererResult,
} from 'ag-charts-community';
import { _ModuleSupport, _Scale, _Scene, _Util } from 'ag-charts-community';
import type {
    AgWaterfallSeriesFormat,
    AgWaterfallSeriesLabelPlacement,
    AgWaterfallSeriesFormatterParams,
} from './typings';

const {
    Validate,
    SeriesNodePickMode,
    valueProperty,
    keyProperty,
    accumulativeValueProperty,
    trailingAccumulatedValueProperty,
    ChartAxisDirection,
    CartesianSeriesNodeClickEvent,
    CartesianSeriesNodeDoubleClickEvent,
    OPTIONAL,
    NUMBER,
    OPT_NUMBER,
    OPT_STRING,
    OPT_FUNCTION,
    OPT_COLOR_STRING,
    OPT_LINE_DASH,
    createLabelData,
    getRectConfig,
    updateRect,
    checkCrisp,
    updateLabel,
} = _ModuleSupport;
const { toTooltipHtml, ContinuousScale, Rect } = _Scene;
const { sanitizeHtml } = _Util;

const WATERFALL_LABEL_PLACEMENTS: AgWaterfallSeriesLabelPlacement[] = ['start', 'end', 'inside'];
const OPT_WATERFALL_LABEL_PLACEMENT: _ModuleSupport.ValidatePredicate = (v: any, ctx) =>
    OPTIONAL(v, ctx, (v: any) => WATERFALL_LABEL_PLACEMENTS.includes(v));

type WaterfallNodeLabelDatum = Readonly<_Scene.Point> & {
    readonly text: string;
    readonly textAlign: CanvasTextAlign;
    readonly textBaseline: CanvasTextBaseline;
};

type WaterfallNodePointDatum = _ModuleSupport.SeriesNodeDatum['point'] & {
    readonly x2: number;
    readonly y2: number;
    readonly skip: boolean;
};

interface WaterfallNodeDatum extends _ModuleSupport.CartesianSeriesNodeDatum, Readonly<_Scene.Point> {
    readonly index: number;
    readonly cumulativeValue: number;
    readonly width: number;
    readonly height: number;
    readonly label: WaterfallNodeLabelDatum;
    readonly fill: string;
    readonly stroke: string;
    readonly strokeWidth: number;
}

type WaterfallContext = _ModuleSupport.SeriesNodeDataContext<WaterfallNodeDatum> & {
    pointData?: WaterfallNodePointDatum[];
};

class WaterfallSeriesNodeBaseClickEvent extends _ModuleSupport.CartesianSeriesNodeBaseClickEvent<any> {
    readonly labelKey?: string;

    constructor(
        labelKey: string | undefined,
        xKey: string,
        yKey: string,
        nativeEvent: MouseEvent,
        datum: WaterfallNodeDatum,
        series: WaterfallBarSeries | WaterfallColumnSeries
    ) {
        super(xKey, yKey, nativeEvent, datum, series);
        this.labelKey = labelKey;
    }
}

export class WaterfallSeriesNodeClickEvent extends WaterfallSeriesNodeBaseClickEvent {
    readonly type = 'nodeClick';
}

export class WaterfallSeriesNodeDoubleClickEvent extends WaterfallSeriesNodeBaseClickEvent {
    readonly type = 'nodeDoubleClick';
}

class WaterfallSeriesTooltip extends _ModuleSupport.SeriesTooltip {
    @Validate(OPT_FUNCTION)
    renderer?: (params: AgCartesianSeriesTooltipRendererParams) => string | AgTooltipRendererResult = undefined;
}

class WaterfallSeriesLabel extends _Scene.Label {
    @Validate(OPT_FUNCTION)
    formatter?: (params: AgCartesianSeriesLabelFormatterParams) => string = undefined;

    @Validate(OPT_WATERFALL_LABEL_PLACEMENT)
    placement: AgWaterfallSeriesLabelPlacement = 'end';

    @Validate(OPT_NUMBER(0))
    padding: number = 6;
}

class WaterfallSeriesItem {
    @Validate(OPT_STRING)
    name?: string = undefined;

    @Validate(OPT_COLOR_STRING)
    fill: string = '#c16068';

    @Validate(OPT_COLOR_STRING)
    stroke: string = '#c16068';

    @Validate(NUMBER(0, 1))
    fillOpacity = 1;

    @Validate(NUMBER(0, 1))
    strokeOpacity = 1;

    @Validate(OPT_LINE_DASH)
    lineDash?: number[] = [0];

    @Validate(NUMBER(0))
    lineDashOffset: number = 0;

    @Validate(NUMBER(0))
    strokeWidth: number = 1;
}

class WaterfallSeriesConnectorLine {
    @Validate(OPT_COLOR_STRING)
    stroke: string = 'black';

    @Validate(NUMBER(0, 1))
    strokeOpacity = 1;

    @Validate(OPT_LINE_DASH)
    lineDash?: number[] = [0];

    @Validate(NUMBER(0))
    lineDashOffset: number = 0;

    @Validate(NUMBER(0))
    strokeWidth: number = 2;
}

type SeriesItemType = 'positive' | 'negative' | 'total' | 'subtotal';

export class WaterfallBarSeries extends _ModuleSupport.CartesianSeries<
    _ModuleSupport.SeriesNodeDataContext<any>,
    _Scene.Rect
> {
    static className = 'WaterfallBarSeries';
    static type: 'waterfall-bar' | 'waterfall-column' = 'waterfall-bar' as const;

    readonly label = new WaterfallSeriesLabel();
    readonly positiveItem = new WaterfallSeriesItem();
    readonly negativeItem = new WaterfallSeriesItem();
    readonly totalItem = new WaterfallSeriesItem();
    readonly subtotalItem = new WaterfallSeriesItem();

    readonly line = new WaterfallSeriesConnectorLine();

    tooltip: WaterfallSeriesTooltip = new WaterfallSeriesTooltip();

    set data(input: any[] | undefined) {
        this._data = input;
        this.setSeriesItemEnabled();
    }
    get data() {
        return this._data;
    }

    @Validate(OPT_FUNCTION)
    formatter?: (params: AgWaterfallSeriesFormatterParams<any>) => AgWaterfallSeriesFormat = undefined;

    constructor(moduleCtx: _ModuleSupport.ModuleContext) {
        super({
            moduleCtx,
            pickModes: [SeriesNodePickMode.EXACT_SHAPE_MATCH],
            pathsPerSeries: 1,
        });

        this.label.enabled = false;
    }

    protected resolveKeyDirection(direction: _ModuleSupport.ChartAxisDirection) {
        if (this.getBarDirection() === ChartAxisDirection.X) {
            if (direction === ChartAxisDirection.X) {
                return ChartAxisDirection.Y;
            }
            return ChartAxisDirection.X;
        }
        return direction;
    }

    @Validate(OPT_STRING)
    xKey?: string = undefined;

    @Validate(OPT_STRING)
    xName?: string = undefined;

    @Validate(OPT_STRING)
    yKey?: string = undefined;

    @Validate(OPT_STRING)
    yName?: string = undefined;

    @Validate(OPT_STRING)
    typeKey?: string = undefined;

    shadow?: _Scene.DropShadow = undefined;

    private seriesItemTypes: Set<SeriesItemType> = new Set(['positive', 'negative', 'total', 'subtotal']);

    protected readonly seriesItemEnabled = new Map<SeriesItemType, boolean>();
    private setSeriesItemEnabled() {
        const { visible, seriesItemEnabled, seriesItemTypes } = this;
        seriesItemEnabled.clear();
        seriesItemTypes.forEach((item) => seriesItemEnabled.set(item, visible));
        this.nodeDataRefresh = true;
    }

    visibleChanged() {
        this.setSeriesItemEnabled();
    }

    addChartEventListeners(): void {
        this.ctx.chartEventManager?.addListener('legend-item-click', (event) => this.onLegendItemClick(event));
        this.ctx.chartEventManager?.addListener('legend-item-double-click', (event) =>
            this.onLegendItemDoubleClick(event)
        );
    }

    async processData(dataController: _ModuleSupport.DataController) {
        const { xKey, yKey, data = [], typeKey = '' } = this;

        if (!yKey) return;

        const isContinuousX = this.getCategoryAxis()?.scale instanceof ContinuousScale;

        const positiveNumber = (v: any) => {
            return _Util.isContinuous(v) && v >= 0;
        };

        const negativeNumber = (v: any) => {
            return _Util.isContinuous(v) && v < 0;
        };

        const { dataModel, processedData } = await dataController.request<any, any, true>(this.id, data, {
            props: [
                keyProperty(this, xKey, isContinuousX, { id: `xKey` }),
                accumulativeValueProperty(this, yKey, true, {
                    id: `yCurrent`,
                    missingValue: 0,
                    invalidValue: undefined,
                }),
                accumulativeValueProperty(this, yKey, true, {
                    id: `yCurrentPositive`,
                    validation: positiveNumber,
                    missingValue: 0,
                    invalidValue: undefined,
                }),
                accumulativeValueProperty(this, yKey, true, {
                    id: `yCurrentNegative`,
                    validation: negativeNumber,
                    missingValue: 0,
                    invalidValue: undefined,
                }),
                trailingAccumulatedValueProperty(this, yKey, true, {
                    id: `yPrevious`,
                    missingValue: 0,
                    invalidValue: undefined,
                }),
                trailingAccumulatedValueProperty(this, yKey, true, {
                    id: `yPreviousPositive`,
                    validation: positiveNumber,
                    missingValue: 0,
                    invalidValue: undefined,
                }),
                trailingAccumulatedValueProperty(this, yKey, true, {
                    id: `yPreviousNegative`,
                    validation: negativeNumber,
                    missingValue: 0,
                    invalidValue: undefined,
                }),
                valueProperty(this, yKey, true, { id: `yRaw` }), // Raw value pass-through.
                ...(typeKey ? [valueProperty(this, typeKey, false, { id: `typeValue`, missingValue: undefined })] : []),
            ],
            dataVisible: this.visible,
        });
        this.dataModel = dataModel;
        this.processedData = processedData;

        this.updateSeriesItemTypes();
    }

    getDomain(direction: _ModuleSupport.ChartAxisDirection): any[] {
        const { processedData } = this;
        if (!processedData) return [];

        const {
            domain: {
                keys: [keys],
                values,
            },
        } = processedData;

        if (direction === this.getCategoryDirection()) {
            return keys;
        } else {
            const { yCurrIndex = 0 } = this.getYIndices() ?? {};
            const yExtent = values[yCurrIndex];
            const fixedYExtent = [yExtent[0] > 0 ? 0 : yExtent[0], yExtent[1] < 0 ? 0 : yExtent[1]];
            return this.fixNumericExtent(fixedYExtent as any);
        }
    }

    private getYIndices(): { yCurrIndex: number; yPrevIndex: number } | undefined {
        const { seriesItemEnabled, dataModel } = this;

        if (!dataModel) {
            return;
        }

        const positivesActive = !!seriesItemEnabled.get('positive');
        const negativesActive = !!seriesItemEnabled.get('negative');

        let yCurrSearchId;
        let yPrevSearchId;
        if (positivesActive && negativesActive) {
            yCurrSearchId = 'yCurrent';
            yPrevSearchId = 'yPrevious';
        } else if (positivesActive) {
            yCurrSearchId = 'yCurrentPositive';
            yPrevSearchId = 'yPreviousPositive';
        } else if (negativesActive) {
            yCurrSearchId = 'yCurrentNegative';
            yPrevSearchId = 'yPreviousNegative';
        }
        if (!(yCurrSearchId && yPrevSearchId)) {
            return;
        }

        const yCurrIndex = dataModel.resolveProcessedDataIndexById(this, yCurrSearchId).index;
        const yPrevIndex = dataModel.resolveProcessedDataIndexById(this, yPrevSearchId).index;

        return { yCurrIndex, yPrevIndex };
    }

    protected getNodeClickEvent(
        event: MouseEvent,
        datum: WaterfallNodeDatum
    ): _ModuleSupport.CartesianSeriesNodeClickEvent<any> {
        return new CartesianSeriesNodeClickEvent(this.xKey ?? '', datum.yKey, event, datum, this);
    }

    protected getNodeDoubleClickEvent(
        event: MouseEvent,
        datum: WaterfallNodeDatum
    ): _ModuleSupport.CartesianSeriesNodeDoubleClickEvent<any> {
        return new CartesianSeriesNodeDoubleClickEvent(this.xKey ?? '', datum.yKey, event, datum, this);
    }

    private getCategoryAxis(): _ModuleSupport.ChartAxis | undefined {
        return this.axes[this.getCategoryDirection()];
    }

    private getValueAxis(): _ModuleSupport.ChartAxis | undefined {
        return this.axes[this.getBarDirection()];
    }

    async createNodeData() {
        const { data, dataModel, visible, ctx, line, seriesItemEnabled } = this;
        const xAxis = this.getCategoryAxis();
        const yAxis = this.getValueAxis();

        if (!(data && visible && xAxis && yAxis && dataModel)) {
            return [];
        }

        const xScale = xAxis.scale;
        const yScale = yAxis.scale;

        const barAlongX = this.getBarDirection() === ChartAxisDirection.X;

        const barWidth = xScale.bandwidth || 10;
        const halfLineWidth = line.strokeWidth / 2;
        const offsetDirection = barAlongX ? -1 : 1;
        const offset = offsetDirection * halfLineWidth;

        const { yKey = '', xKey = '', processedData } = this;
        if (processedData?.type !== 'ungrouped') return [];

        const contexts: WaterfallContext[] = [];

        const yRawIndex = dataModel.resolveProcessedDataIndexById(this, `yRaw`).index;
        const xIndex = dataModel.resolveProcessedDataIndexById(this, `xKey`).index;
        const typeKeyIndex = this.typeKey ? dataModel.resolveProcessedDataIndexById(this, `typeValue`).index : -1;
        const contextIndexMap = new Map<SeriesItemType, number>();

        const pointData: WaterfallNodePointDatum[] = [];

        const { yCurrIndex, yPrevIndex } = this.getYIndices() ?? {};

        const totalActive = !!seriesItemEnabled.get('total');
        const subtotalActive = !!seriesItemEnabled.get('subtotal');

        function getValues(
            isTotal: boolean,
            isSubtotal: boolean,
            values: any[]
        ): { cumulativeValue: number | undefined; trailingValue: number | undefined } {
            if (!isTotal && !isSubtotal && yCurrIndex !== undefined && yPrevIndex !== undefined) {
                return {
                    cumulativeValue: values[yCurrIndex],
                    trailingValue: values[yPrevIndex],
                };
            }

            if ((isTotal && totalActive) || (isSubtotal && subtotalActive)) {
                if (yCurrIndex !== undefined) {
                    return {
                        cumulativeValue: values[yCurrIndex],
                        trailingValue: 0,
                    };
                }
                return {
                    cumulativeValue: values[0],
                    trailingValue: 0,
                };
            }

            return {
                cumulativeValue: undefined,
                trailingValue: undefined,
            };
        }

        processedData?.data.forEach(({ keys, datum, values }, dataIndex) => {
            const datumType = values[typeKeyIndex];

            const isSubtotal = this.isSubtotal(datumType);
            const isTotal = this.isTotal(datumType);
            const isTotalOrSubtotal = isTotal || isSubtotal;

            const xDatum = keys[xIndex];
            const x = xScale.convert(xDatum);

            const rawValue = values[yRawIndex];

            const { cumulativeValue, trailingValue } = getValues(isTotal, isSubtotal, values);

            const currY = yScale.convert(cumulativeValue, { strict: false });
            const trailY = yScale.convert(trailingValue, { strict: false });

            const isPositive = (isTotalOrSubtotal ? cumulativeValue : rawValue) >= 0;

            const seriesItemType = this.getSeriesItemType(isPositive, datumType);
            const { fill, stroke, strokeWidth } = this.getItemConfig(seriesItemType);

            const y = (isPositive ? currY : trailY) - offset;
            const bottomY = (isPositive ? trailY : currY) + offset;
            const barHeight = Math.max(strokeWidth, Math.abs(bottomY - y));

            const itemId = seriesItemType;
            let contextIndex = contextIndexMap.get(itemId);
            if (contextIndex === undefined) {
                contextIndex = contexts.length;
                contextIndexMap.set(itemId, contextIndex);
            }
            contexts[contextIndex] ??= {
                itemId,
                nodeData: [],
                labelData: [],
                pointData: [],
            };

            const rect = {
                x: barAlongX ? bottomY : x,
                y: barAlongX ? x : y,
                width: barAlongX ? barHeight : barWidth,
                height: barAlongX ? barWidth : barHeight,
            };

            const nodeMidPoint = {
                x: rect.x + rect.width / 2,
                y: rect.y + rect.height / 2,
            };

            const skipTotal = (isTotal && !totalActive) || (isSubtotal && !subtotalActive);
            const skip = isTotalOrSubtotal && skipTotal;
            const pointY = isTotalOrSubtotal ? currY : trailY;

            const pathPoint = {
                // lineTo
                x: Math.round(barAlongX ? pointY : rect.x),
                y: Math.round(barAlongX ? rect.y : pointY),
                // moveTo
                x2: Math.round(barAlongX ? currY : rect.x + rect.width),
                y2: Math.round(barAlongX ? rect.y + rect.height : currY),
                size: 0,
                skip,
            };

            pointData.push(pathPoint);

            const { formatter, placement, padding } = this.label;

            const nodeDatum: WaterfallNodeDatum = {
                index: dataIndex,
                series: this,
                itemId,
                datum,
                cumulativeValue: cumulativeValue ?? 0,
                xValue: xDatum,
                yValue: rawValue,
                yKey,
                xKey,
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                nodeMidPoint,
                fill: fill,
                stroke: stroke,
                strokeWidth,
                label: createLabelData({
                    value: isTotalOrSubtotal ? cumulativeValue : rawValue,
                    rect,
                    placement,
                    seriesId: this.id,
                    padding,
                    formatter,
                    barAlongX,
                    ctx,
                }),
            };

            contexts[contextIndex].nodeData.push(nodeDatum);
            contexts[contextIndex].labelData.push(nodeDatum);
        });

        if (contexts.length > 0) {
            contexts[0].pointData = pointData;
        }

        return contexts;
    }

    private updateSeriesItemTypes() {
        const { dataModel, seriesItemTypes, processedData } = this;

        if (!dataModel || !processedData) {
            return;
        }

        seriesItemTypes.clear();

        const yPositiveIndex = dataModel.resolveProcessedDataIndexById(this, 'yCurrentPositive').index;
        const yNegativeIndex = dataModel.resolveProcessedDataIndexById(this, 'yCurrentNegative').index;
        const typeKeyIndex = this.typeKey ? dataModel.resolveProcessedDataIndexById(this, `typeValue`).index : -1;

        const positiveDomain = processedData.domain.values[yPositiveIndex] ?? [];
        const negativeDomain = processedData.domain.values[yNegativeIndex] ?? [];

        if (positiveDomain.length > 0) {
            seriesItemTypes.add('positive');
        }

        if (negativeDomain.length > 0) {
            seriesItemTypes.add('negative');
        }

        const itemTypes = processedData?.domain.values[typeKeyIndex];
        if (!itemTypes) {
            return;
        }

        itemTypes.forEach((type) => {
            if (type === undefined) {
                return;
            }
            seriesItemTypes.add(type);
        });
    }

    private isSubtotal(datumType?: 'total' | 'subtotal') {
        return datumType === 'subtotal';
    }

    private isTotal(datumType?: 'total' | 'subtotal') {
        return datumType === 'total';
    }

    protected nodeFactory() {
        return new Rect();
    }

    private getSeriesItemType(isPositive: boolean, datumType?: SeriesItemType): SeriesItemType {
        return datumType ?? (isPositive ? 'positive' : 'negative');
    }

    private getItemConfig(seriesItemType: SeriesItemType): WaterfallSeriesItem {
        switch (seriesItemType) {
            case 'positive': {
                return this.positiveItem;
            }
            case 'negative': {
                return this.negativeItem;
            }
            case 'subtotal': {
                return this.subtotalItem;
            }
            case 'total': {
                return this.totalItem;
            }
        }
    }

    protected async updateDatumSelection(opts: {
        nodeData: WaterfallNodeDatum[];
        datumSelection: _Scene.Selection<_Scene.Rect, WaterfallNodeDatum>;
    }) {
        const { nodeData, datumSelection } = opts;
        const data = nodeData ?? [];
        return datumSelection.update(data);
    }

    protected async updateDatumNodes(opts: {
        datumSelection: _Scene.Selection<_Scene.Rect, WaterfallNodeDatum>;
        isHighlight: boolean;
    }) {
        const { datumSelection, isHighlight } = opts;
        const {
            shadow,
            formatter,
            highlightStyle: { item: itemHighlightStyle },
            id: seriesId,
            ctx,
        } = this;

        const xAxis = this.axes[ChartAxisDirection.X];
        const crisp = checkCrisp(xAxis?.visibleRange);

        const categoryAlongX = this.getCategoryDirection() === ChartAxisDirection.X;

        datumSelection.each((rect, datum) => {
            const seriesItemType = datum.itemId;
            const { fillOpacity, strokeOpacity, strokeWidth, lineDash, lineDashOffset } =
                this.getItemConfig(seriesItemType);
            const style: _ModuleSupport.RectConfig = {
                fill: datum.fill,
                stroke: datum.stroke,
                fillOpacity,
                strokeOpacity,
                lineDash,
                lineDashOffset,
                fillShadow: shadow,
                strokeWidth: this.getStrokeWidth(strokeWidth, datum),
            };
            const visible = categoryAlongX ? datum.width > 0 : datum.height > 0;

            const config = getRectConfig({
                datum,
                isHighlighted: isHighlight,
                style,
                highlightStyle: itemHighlightStyle,
                formatter,
                seriesId,
                itemId: datum.itemId,
                ctx,
            });
            config.crisp = crisp;
            config.visible = visible;
            updateRect({ rect, config });
        });
    }

    protected async updateLabelSelection(opts: {
        labelData: WaterfallNodeDatum[];
        labelSelection: _Scene.Selection<_Scene.Text, WaterfallNodeDatum>;
    }) {
        const { labelData, labelSelection } = opts;
        const { enabled } = this.label;
        const data = enabled ? labelData : [];

        return labelSelection.update(data);
    }

    protected async updateLabelNodes(opts: { labelSelection: _Scene.Selection<_Scene.Text, any> }) {
        const { labelSelection } = opts;
        labelSelection.each((text, datum) => {
            const labelDatum = datum.label;
            updateLabel({ labelNode: text, labelDatum, config: this.label, visible: true });
        });
    }

    getTooltipHtml(nodeDatum: WaterfallNodeDatum): string {
        const {
            xKey,
            yKey,
            axes,
            ctx: { callbackCache },
        } = this;

        const xAxis = axes[ChartAxisDirection.X];
        const yAxis = axes[ChartAxisDirection.Y];

        if (!xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }

        const { formatter, tooltip, xName, yName, id: seriesId } = this;
        const { datum, itemId, xValue, cumulativeValue } = nodeDatum;

        const isTotalOrSubtotal = this.isTotal(itemId) || this.isSubtotal(itemId);
        const yValue = isTotalOrSubtotal ? cumulativeValue : nodeDatum.yValue;

        let format: any | undefined = undefined;

        const { fill, strokeWidth, name } = this.getItemConfig(itemId);

        const color = format?.fill ?? fill ?? 'gray';

        if (formatter) {
            format = callbackCache.call(formatter, {
                datum,
                xKey,
                yKey,
                fill,
                strokeWidth,
                highlighted: false,
                seriesId,
                itemId: nodeDatum.itemId,
            });
        }

        const xString = sanitizeHtml(xAxis.formatDatum(xValue));
        const yString = sanitizeHtml(yAxis.formatDatum(yValue));

        const title = sanitizeHtml(yName);
        const content =
            `<b>${sanitizeHtml(xName ?? xKey)}</b>: ${xString}<br>` +
            `<b>${sanitizeHtml(name ?? yName ?? yKey)}</b>: ${yString}`;

        const defaults: AgTooltipRendererResult = {
            title,
            content,
            backgroundColor: color,
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
                    color,
                    seriesId,
                }),
                defaults
            );
        }

        return toTooltipHtml(defaults);
    }

    getLegendData(): _ModuleSupport.CategoryLegendDatum[] {
        const { id, seriesItemTypes, seriesItemEnabled, yKey, yName } = this;

        const legendData: _ModuleSupport.CategoryLegendDatum[] = [];

        function getLegendItemText(item: SeriesItemType, name?: string): string | undefined {
            if (name !== undefined) {
                return name;
            }
            if (item === 'subtotal') {
                return 'Subtotal';
            }
            if (item === 'total') {
                return 'Total';
            }
            return yName ?? yKey;
        }

        seriesItemTypes.forEach((item) => {
            const { fill, stroke, fillOpacity, strokeOpacity, name } = this.getItemConfig(item);
            const legendItemText = getLegendItemText(item, name);
            legendData.push({
                legendType: 'category',
                id,
                itemId: item,
                seriesId: id,
                enabled: !!seriesItemEnabled.get(item),
                label: {
                    text: `${legendItemText}`,
                },
                marker: {
                    fill,
                    stroke,
                    fillOpacity: fillOpacity,
                    strokeOpacity: strokeOpacity,
                },
            });
        });

        return legendData;
    }

    onLegendItemClick(event: _ModuleSupport.LegendItemClickChartEvent) {
        const { enabled, itemId, series } = event;

        if (series.id !== this.id) {
            return;
        }
        this.toggleSeriesItem(itemId, enabled);
    }

    onLegendItemDoubleClick(event: _ModuleSupport.LegendItemDoubleClickChartEvent) {
        const { enabled, itemId, series: maybeSeries } = event;

        if (maybeSeries.type !== this.type) return;

        if (this.isTotal(itemId) || this.isSubtotal(itemId)) {
            return;
        }

        const { seriesItemEnabled } = this;

        let totalVisibleItems = 0;
        for (const [_, enabled] of seriesItemEnabled.entries()) {
            if (!enabled) {
                continue;
            }
            totalVisibleItems++;
        }

        const singleEnabled = totalVisibleItems === 1 && enabled;
        if (singleEnabled) {
            this.setSeriesItemEnabled();
            return;
        }

        this.seriesItemEnabled.clear();
        this.toggleSeriesItem(itemId, true);
    }

    protected toggleSeriesItem(itemId: SeriesItemType, enabled: boolean): void {
        this.seriesItemEnabled.set(itemId, enabled);
        this.nodeDataRefresh = true;
    }

    animateEmptyUpdateReady({
        datumSelections,
        labelSelections,
        contextData,
        paths,
        seriesRect,
    }: {
        datumSelections: Array<_Scene.Selection<_Scene.Rect, WaterfallNodeDatum>>;
        labelSelections: Array<_Scene.Selection<_Scene.Text, WaterfallNodeDatum>>;
        contextData: Array<WaterfallContext>;
        paths: Array<Array<_Scene.Path>>;
        seriesRect?: _Scene.BBox;
    }) {
        const duration = this.ctx.animationManager?.defaultOptions.duration ?? 1000;

        contextData.forEach(({ pointData }, contextDataIndex) => {
            this.animateRects(datumSelections[contextDataIndex], duration);
            this.animateLabels(labelSelections[contextDataIndex], duration);

            if (contextDataIndex !== 0 || !pointData) {
                return;
            }

            const [lineNode] = paths[contextDataIndex];
            this.animateConnectorLines(lineNode, pointData, duration, seriesRect);
        });
    }

    protected animateRects(datumSelection: _Scene.Selection<_Scene.Rect, WaterfallNodeDatum>, duration: number) {
        datumSelection.each((rect, datum, index) => {
            this.ctx.animationManager?.animateMany(
                `${this.id}_empty-update-ready_${rect.id}`,
                [
                    { from: datum.itemId === 'positive' ? datum.x : datum.x + datum.width, to: datum.x },
                    { from: 0, to: datum.width },
                ],
                {
                    disableInteractions: true,
                    duration,
                    delay: 200 * index,
                    onUpdate([x, width]) {
                        rect.x = x;
                        rect.width = width;

                        rect.y = datum.y;
                        rect.height = datum.height;
                    },
                }
            );
        });
    }

    protected animateLabels(labelSelection: _Scene.Selection<_Scene.Text, WaterfallNodeDatum>, duration: number) {
        labelSelection.each((label, _, index) => {
            this.ctx.animationManager?.animate(`${this.id}_empty-update-ready_${label.id}`, {
                from: 0,
                to: 1,
                delay: duration - duration / 10 + 200 * index,
                duration: duration / 10,
                onUpdate: (opacity) => {
                    label.opacity = opacity;
                },
            });
        });
    }

    protected animateConnectorLines(
        lineNode: _Scene.Path,
        pointData: WaterfallNodePointDatum[],
        duration: number,
        seriesRect?: _Scene.BBox
    ) {
        const { path: linePath } = lineNode;

        const { stroke, strokeWidth, strokeOpacity, lineDash, lineDashOffset } = this.line;

        lineNode.stroke = stroke;
        lineNode.strokeWidth = this.getStrokeWidth(strokeWidth);
        lineNode.strokeOpacity = strokeOpacity;
        lineNode.lineDash = lineDash;
        lineNode.lineDashOffset = lineDashOffset;

        lineNode.fill = undefined;
        lineNode.lineJoin = 'round';
        lineNode.pointerEvents = _Scene.PointerEvents.None;

        const connectorLineAnimationOptions = {
            from: 0,
            to: seriesRect?.width ?? 0,
            disableInteractions: true,
        };

        this.ctx.animationManager?.animate<number>(`${this.id}_empty-update-ready_connector-line`, {
            ...connectorLineAnimationOptions,
            duration,
            onUpdate() {
                linePath.clear({ trackChanges: true });

                pointData.forEach((point, index) => {
                    if (point.skip) {
                        return;
                    }
                    if (index !== 0) {
                        linePath.lineTo(point.x, point.y);
                    }
                    linePath.moveTo(point.x2, point.y2);
                });

                lineNode.checkPathDirty();
            },
        });
    }

    animateReadyUpdate({
        datumSelections,
        contextData,
        paths,
    }: {
        datumSelections: Array<_Scene.Selection<_Scene.Rect, WaterfallNodeDatum>>;
        contextData: Array<WaterfallContext>;
        paths: Array<Array<_Scene.Path>>;
    }) {
        this.resetConnectorLinesPath({ contextData, paths });
        datumSelections.forEach((datumSelection) => {
            this.resetSelectionRects(datumSelection);
        });
    }

    animateReadyHighlight(highlightSelection: _Scene.Selection<_Scene.Rect, WaterfallNodeDatum>) {
        this.resetSelectionRects(highlightSelection);
    }

    animateReadyResize({
        datumSelections,
        contextData,
        paths,
    }: {
        datumSelections: Array<_Scene.Selection<_Scene.Rect, WaterfallNodeDatum>>;
        contextData: Array<WaterfallContext>;
        paths: Array<Array<_Scene.Path>>;
    }) {
        this.ctx.animationManager?.stop();
        this.resetConnectorLinesPath({ contextData, paths });
        datumSelections.forEach((datumSelection) => {
            this.resetSelectionRects(datumSelection);
        });
    }

    resetSelectionRects(selection: _Scene.Selection<_Scene.Rect, WaterfallNodeDatum>) {
        selection.each((rect, datum) => {
            rect.x = datum.x;
            rect.y = datum.y;
            rect.width = datum.width;
            rect.height = datum.height;
        });
    }

    resetConnectorLinesPath({
        contextData,
        paths,
    }: {
        contextData: Array<WaterfallContext>;
        paths: Array<Array<_Scene.Path>>;
    }) {
        if (paths.length === 0) {
            return;
        }

        const [lineNode] = paths[0];

        const { stroke, strokeWidth, strokeOpacity, lineDash, lineDashOffset } = this.line;

        lineNode.stroke = stroke;
        lineNode.strokeWidth = this.getStrokeWidth(strokeWidth);
        lineNode.strokeOpacity = strokeOpacity;
        lineNode.lineDash = lineDash;
        lineNode.lineDashOffset = lineDashOffset;

        lineNode.fill = undefined;
        lineNode.lineJoin = 'round';
        lineNode.pointerEvents = _Scene.PointerEvents.None;

        const { path: linePath } = lineNode;
        linePath.clear({ trackChanges: true });

        const { pointData } = contextData[0];
        if (!pointData) {
            return;
        }
        pointData.forEach((point, index) => {
            if (point.skip) {
                return;
            }
            if (index !== 0) {
                linePath.lineTo(point.x, point.y);
            }
            linePath.moveTo(point.x2, point.y2);
        });

        lineNode.checkPathDirty();
    }

    protected isLabelEnabled() {
        return this.label.enabled;
    }

    protected getBarDirection() {
        return ChartAxisDirection.X;
    }

    protected getCategoryDirection() {
        return ChartAxisDirection.Y;
    }

    getBandScalePadding() {
        return { inner: 0.2, outer: 0.3 };
    }
}

export class WaterfallColumnSeries extends WaterfallBarSeries {
    static className = 'WaterfallColumnSeries';
    static type = 'waterfall-column' as const;

    protected getBarDirection() {
        return ChartAxisDirection.Y;
    }

    protected getCategoryDirection() {
        return ChartAxisDirection.X;
    }

    protected animateRects(datumSelection: _Scene.Selection<_Scene.Rect, WaterfallNodeDatum>, duration: number) {
        datumSelection.each((rect, datum, index) => {
            this.ctx.animationManager?.animateMany(
                `${this.id}_empty-update-ready_${rect.id}`,
                [
                    { from: datum.itemId === 'positive' ? datum.y + datum.height : datum.y, to: datum.y },
                    { from: 0, to: datum.height },
                ],
                {
                    disableInteractions: true,
                    duration,
                    delay: 200 * index,
                    onUpdate([y, height]) {
                        rect.y = y;
                        rect.height = height;

                        rect.x = datum.x;
                        rect.width = datum.width;
                    },
                }
            );
        });
    }
}
