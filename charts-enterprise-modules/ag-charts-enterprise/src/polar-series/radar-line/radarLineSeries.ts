import {
    _ModuleSupport,
    _Scale,
    _Scene,
    _Util,
    AgPieSeriesFormatterParams,
    AgPieSeriesTooltipRendererParams,
    AgPieSeriesFormat,
    AgTooltipRendererResult,
} from 'ag-charts-community';

import {
    AgRadarLineSeriesLabelFormatterParams,
    AgRadarLineSeriesMarkerFormat,
    AgRadarLineSeriesMarkerFormatterParams,
} from './typings';

const {
    ChartAxisDirection,
    HighlightStyle,
    NUMBER,
    OPT_COLOR_STRING,
    OPT_FUNCTION,
    OPT_LINE_DASH,
    OPT_STRING,
    STRING,
    SeriesNodePickMode,
    StateMachine,
    Validate,
    valueProperty,
} = _ModuleSupport;

const { BBox, Group, Path, PointerEvents, Selection, Text, getMarker, toTooltipHtml } = _Scene;
const { extent, interpolateString, isNumberEqual, sanitizeHtml, toFixed } = _Util;

class RadarLineSeriesNodeBaseClickEvent extends _ModuleSupport.SeriesNodeBaseClickEvent<any> {
    readonly angleKey: string;
    readonly radiusKey: string;

    constructor(
        angleKey: string,
        radiusKey: string,
        nativeEvent: MouseEvent,
        datum: RadarLineNodeDatum,
        series: RadarLineSeries
    ) {
        super(nativeEvent, datum, series);
        this.angleKey = angleKey;
        this.radiusKey = radiusKey;
    }
}

class RadarLineSeriesNodeClickEvent extends RadarLineSeriesNodeBaseClickEvent {
    readonly type = 'nodeClick';
}

class RadarLineSeriesNodeDoubleClickEvent extends RadarLineSeriesNodeBaseClickEvent {
    readonly type = 'nodeDoubleClick';
}

interface RadarLineNodeDatum extends _ModuleSupport.SeriesNodeDatum {
    readonly label?: {
        text: string;
        x: number;
        y: number;
        textAlign: CanvasTextAlign;
        textBaseline: CanvasTextBaseline;
    };
    readonly angleValue: any;
    readonly radiusValue: any;
}

class RadarLineSeriesLabel extends _Scene.Label {
    @Validate(OPT_FUNCTION)
    formatter?: (params: AgRadarLineSeriesLabelFormatterParams) => string = undefined;
}

class RadarLineSeriesTooltip extends _ModuleSupport.SeriesTooltip {
    @Validate(OPT_FUNCTION)
    renderer?: (params: AgPieSeriesTooltipRendererParams) => string | AgTooltipRendererResult = undefined;
    @Validate(OPT_STRING)
    format?: string = undefined;
}

interface RadarLineAnimationData {
    markerSelection: _Scene.Selection<_Scene.Marker, RadarLineNodeDatum>;
    labelSelection: _Scene.Selection<_Scene.Text, RadarLineNodeDatum>;
    nodeData: RadarLineNodeDatum[];
    lineNode: _Scene.Path;
}

export class RadarLineSeriesMarker extends _ModuleSupport.SeriesMarker {
    @Validate(OPT_FUNCTION)
    @_Scene.SceneChangeDetection({ redraw: _Scene.RedrawType.MAJOR })
    formatter?: (params: AgRadarLineSeriesMarkerFormatterParams<any>) => AgRadarLineSeriesMarkerFormat = undefined;
}

type RadarLineAnimationState = 'empty' | 'ready';
type RadarLineAnimationEvent = 'update' | 'resize';
class RadarLineStateMachine extends StateMachine<RadarLineAnimationState, RadarLineAnimationEvent> {}

export class RadarLineSeries extends _ModuleSupport.PolarSeries<RadarLineNodeDatum> {
    static className = 'RadarLineSeries';
    static type = 'radar-line' as const;

    readonly marker = new RadarLineSeriesMarker();

    readonly label = new RadarLineSeriesLabel();

    private pathSelection: _Scene.Selection<_Scene.Path, boolean>;
    private markerSelection: _Scene.Selection<_Scene.Marker, RadarLineNodeDatum>;
    private labelSelection: _Scene.Selection<_Scene.Text, RadarLineNodeDatum>;
    private highlightSelection: _Scene.Selection<_Scene.Marker, RadarLineNodeDatum>;

    private animationState: RadarLineStateMachine;

    private nodeData: RadarLineNodeDatum[] = [];

    tooltip: RadarLineSeriesTooltip = new RadarLineSeriesTooltip();

    /**
     * The key of the numeric field to use to determine the angle (for example,
     * a pie sector angle).
     */
    @Validate(STRING)
    angleKey = '';

    @Validate(OPT_STRING)
    angleName?: string = undefined;

    /**
     * The key of the numeric field to use to determine the radii of pie sectors.
     * The largest value will correspond to the full radius and smaller values to
     * proportionally smaller radii.
     */
    @Validate(STRING)
    radiusKey: string = '';

    @Validate(OPT_STRING)
    radiusName?: string = undefined;

    @Validate(OPT_COLOR_STRING)
    stroke?: string = 'black';

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

    @Validate(NUMBER(0))
    strokeWidth = 1;

    readonly highlightStyle = new HighlightStyle();

    constructor(moduleCtx: _ModuleSupport.ModuleContext) {
        super({
            moduleCtx,
            useLabelLayer: true,
            pickModes: [SeriesNodePickMode.NEAREST_NODE, SeriesNodePickMode.EXACT_SHAPE_MATCH],
        });

        const pathGroup = new Group();
        this.contentGroup.append(pathGroup);
        this.pathSelection = Selection.select(pathGroup, Path);

        const markerFactory = () => {
            const { shape } = this.marker;
            const MarkerShape = getMarker(shape);
            return new MarkerShape();
        };
        const markerGroup = new Group();
        this.contentGroup.append(markerGroup);
        this.markerSelection = Selection.select(markerGroup, markerFactory);

        this.labelSelection = Selection.select(this.labelGroup!, Text);

        this.highlightSelection = Selection.select(this.highlightGroup, markerFactory);

        this.animationState = new RadarLineStateMachine('empty', {
            empty: {
                on: {
                    update: {
                        target: 'ready',
                        action: (data) => this.animateEmptyUpdateReady(data),
                    },
                },
            },
            ready: {
                on: {
                    update: {
                        target: 'ready',
                        action: (data) => this.animateReadyUpdate(data),
                    },
                    resize: {
                        target: 'ready',
                        action: (data) => this.animateReadyResize(data),
                    },
                },
            },
        });
    }

    addChartEventListeners(): void {
        this.chartEventManager?.addListener('legend-item-click', (event) => this.onLegendItemClick(event));
        this.chartEventManager?.addListener('legend-item-double-click', (event) => this.onLegendItemDoubleClick(event));
    }

    getDomain(direction: _ModuleSupport.ChartAxisDirection): any[] {
        const { dataModel, processedData } = this;
        if (!processedData || !dataModel) return [];

        if (direction === ChartAxisDirection.X) {
            return dataModel.getDomain(this, `angleValue`, 'value', processedData);
        } else {
            const domain = dataModel.getDomain(this, `radiusValue`, 'value', processedData);
            return this.fixNumericExtent(extent([0].concat(domain)));
        }
    }

    async processData(dataController: _ModuleSupport.DataController) {
        const { data = [] } = this;
        const { angleKey, radiusKey } = this;

        if (!angleKey || !radiusKey) return;

        const { dataModel, processedData } = await dataController.request<any, any, true>(this.id, data, {
            props: [
                valueProperty(this, angleKey, false, { id: 'angleValue' }),
                valueProperty(this, radiusKey, false, { id: 'radiusValue', invalidValue: undefined }),
            ],
        });
        this.dataModel = dataModel;
        this.processedData = processedData;
    }

    private circleCache = { r: 0, cx: 0, cy: 0 };

    private didCircleChange() {
        const r = this.radius;
        const cx = this.centerX;
        const cy = this.centerY;
        const cache = this.circleCache;
        if (!(r === cache.r && cx === cache.cx && cy === cache.cy)) {
            this.circleCache = { r, cx, cy };
            return true;
        }
        return false;
    }

    maybeRefreshNodeData() {
        if (!this.nodeDataRefresh && !this.didCircleChange()) return;
        const [{ nodeData = [] } = {}] = this._createNodeData();
        this.nodeData = nodeData;
        this.nodeDataRefresh = false;
    }

    async createNodeData() {
        return this._createNodeData();
    }

    private _createNodeData() {
        const { processedData, dataModel, angleKey, radiusKey } = this;

        if (!processedData || !dataModel || !angleKey || !radiusKey) {
            return [];
        }

        const angleScale = this.axes[ChartAxisDirection.X]?.scale;
        const radiusScale = this.axes[ChartAxisDirection.Y]?.scale;

        if (!angleScale || !radiusScale) {
            return [];
        }

        const angleIdx = dataModel.resolveProcessedDataIndexById(this, `angleValue`, 'value').index;
        const radiusIdx = dataModel.resolveProcessedDataIndexById(this, `radiusValue`, 'value').index;

        const { label, marker, id: seriesId } = this;
        const { size: markerSize } = this.marker;

        const nodeData = processedData.data.map((group): RadarLineNodeDatum => {
            const { datum, values } = group;

            const angleDatum = values[angleIdx];
            const radiusDatum = values[radiusIdx];

            const angle = angleScale.convert(angleDatum);
            const radius = this.radius - radiusScale.convert(radiusDatum);

            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            const x = cos * radius;
            const y = sin * radius;

            let labelNodeDatum: RadarLineNodeDatum['label'];
            if (label.enabled) {
                let labelText = '';
                if (label.formatter) {
                    labelText = label.formatter({ value: radiusDatum, seriesId });
                } else if (typeof radiusDatum === 'number' && isFinite(radiusDatum)) {
                    labelText = radiusDatum.toFixed(2);
                } else if (radiusDatum) {
                    labelText = String(radiusDatum);
                }
                if (labelText) {
                    const labelX = x + cos * marker.size;
                    const labelY = y + sin * marker.size;
                    labelNodeDatum = {
                        text: labelText,
                        x: labelX,
                        y: labelY,
                        textAlign: isNumberEqual(cos, 0) ? 'center' : cos > 0 ? 'left' : 'right',
                        textBaseline: isNumberEqual(sin, 0) ? 'middle' : sin > 0 ? 'top' : 'bottom',
                    };
                }
            }

            return {
                series: this,
                datum,
                point: { x, y, size: markerSize },
                nodeMidPoint: { x, y },
                label: labelNodeDatum,
                angleValue: angleDatum,
                radiusValue: radiusDatum,
            };
        });

        return [{ itemId: radiusKey, nodeData, labelData: nodeData }];
    }

    async update() {
        this.maybeRefreshNodeData();

        this.rootGroup.translationX = this.centerX;
        this.rootGroup.translationY = this.centerY;

        this.updatePathSelection();
        this.updateMarkers(this.markerSelection, false);
        this.updateMarkers(this.highlightSelection, true);
        this.updateLabels();

        const animationData: RadarLineAnimationData = {
            markerSelection: this.markerSelection,
            labelSelection: this.labelSelection,
            nodeData: this.nodeData,
            lineNode: this.pathSelection.nodes()[0],
        };
        this.animationState.transition('update', animationData);
    }

    private updatePathSelection() {
        this.pathSelection.update(this.visible ? [true] : []);
    }

    private updateMarkers(selection: _Scene.Selection<_Scene.Marker, RadarLineNodeDatum>, highlight: boolean) {
        const { marker, visible, ctx, angleKey, radiusKey, id: seriesId } = this;
        const { shape, enabled, formatter, size } = marker;
        const { callbackCache } = ctx;
        let selectionData: RadarLineNodeDatum[] = [];
        if (visible && shape && enabled) {
            if (highlight) {
                const highlighted = this.highlightManager?.getActiveHighlight();
                if (highlighted?.datum) {
                    selectionData = [highlighted as RadarLineNodeDatum];
                }
            } else {
                selectionData = this.nodeData;
            }
        }
        const highlightedStyle = highlight ? this.highlightStyle.item : undefined;
        selection.update(selectionData).each((node, datum) => {
            const fill = highlightedStyle?.fill ?? marker.fill;
            const stroke = highlightedStyle?.stroke ?? marker.stroke;
            const strokeWidth = highlightedStyle?.strokeWidth ?? marker.strokeWidth ?? this.strokeWidth ?? 1;
            const format = formatter
                ? callbackCache.call(formatter, {
                      datum: datum.datum,
                      angleKey,
                      radiusKey,
                      fill,
                      stroke,
                      strokeWidth,
                      size,
                      highlighted: highlight,
                      seriesId,
                  })
                : undefined;
            node.fill = format?.fill ?? fill;
            node.stroke = format?.stroke ?? stroke;
            node.strokeWidth = format?.strokeWidth ?? strokeWidth;
            node.fillOpacity = highlightedStyle?.fillOpacity ?? marker.fillOpacity ?? 1;
            node.strokeOpacity = marker.strokeOpacity ?? this.strokeOpacity ?? 1;
            node.size = format?.size ?? marker.size;

            const { x, y } = datum.point!;
            node.translationX = x;
            node.translationY = y;
            node.visible = node.size > 0 && !isNaN(x) && !isNaN(y);
        });
    }

    private updateLabels() {
        const { label, labelSelection } = this;
        labelSelection.update(this.nodeData).each((node, datum) => {
            if (label.enabled && datum.label) {
                node.x = datum.label.x;
                node.y = datum.label.y;

                node.fill = label.color;

                node.fontFamily = label.fontFamily;
                node.fontSize = label.fontSize;
                node.fontStyle = label.fontStyle;
                node.fontWeight = label.fontWeight;
                node.text = datum.label.text;
                node.textAlign = datum.label.textAlign;
                node.textBaseline = datum.label.textBaseline;

                node.visible = true;
            } else {
                node.visible = false;
            }
        });
    }

    protected getNodeClickEvent(event: MouseEvent, datum: RadarLineNodeDatum): RadarLineSeriesNodeClickEvent {
        return new RadarLineSeriesNodeClickEvent(this.angleKey, this.radiusKey, event, datum, this);
    }

    protected getNodeDoubleClickEvent(
        event: MouseEvent,
        datum: RadarLineNodeDatum
    ): RadarLineSeriesNodeDoubleClickEvent {
        return new RadarLineSeriesNodeDoubleClickEvent(this.angleKey, this.radiusKey, event, datum, this);
    }

    getTooltipHtml(nodeDatum: RadarLineNodeDatum): string {
        const { angleKey, radiusKey } = this;

        if (!angleKey || !radiusKey) {
            return '';
        }

        const { angleName, radiusName, tooltip, marker, id: seriesId } = this;
        const { renderer: tooltipRenderer, format: tooltipFormat } = tooltip;
        const { datum, angleValue, radiusValue } = nodeDatum;
        const formattedAngleValue = typeof angleValue === 'number' ? toFixed(angleValue) : String(angleValue);
        const formattedRadiusValue = typeof radiusValue === 'number' ? toFixed(radiusValue) : String(radiusValue);
        const title = sanitizeHtml(radiusName);
        const content = sanitizeHtml(`${formattedAngleValue}: ${formattedRadiusValue}`);

        const { formatter: markerFormatter, fill, stroke, strokeWidth: markerStrokeWidth, size } = marker;
        const strokeWidth = markerStrokeWidth ?? this.strokeWidth;

        let format: AgRadarLineSeriesMarkerFormat | undefined = undefined;
        if (markerFormatter) {
            format = markerFormatter({
                datum,
                angleKey,
                radiusKey,
                fill,
                stroke,
                strokeWidth,
                size,
                highlighted: false,
                seriesId,
            });
        }

        const color = format?.fill ?? fill;

        const defaults: AgTooltipRendererResult = {
            title,
            backgroundColor: color,
            content,
        };

        if (tooltipFormat || tooltipRenderer) {
            const params = {
                datum,
                angleKey,
                angleValue,
                angleName,
                radiusKey,
                radiusValue,
                radiusName,
                title,
                color,
                seriesId,
            };
            if (tooltipFormat) {
                return toTooltipHtml(
                    {
                        content: interpolateString(tooltipFormat, params),
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

    getLegendData(): _ModuleSupport.ChartLegendDatum[] {
        const { id, data, angleKey, radiusKey, radiusName, visible, marker, stroke, strokeOpacity } = this;

        if (!(data?.length && angleKey && radiusKey)) {
            return [];
        }

        const legendData: _ModuleSupport.CategoryLegendDatum[] = [
            {
                legendType: 'category',
                id: id,
                itemId: radiusKey,
                seriesId: id,
                enabled: visible,
                label: {
                    text: radiusName ?? radiusKey,
                },
                marker: {
                    shape: marker.shape,
                    fill: marker.fill ?? marker.stroke ?? stroke ?? 'rgba(0, 0, 0, 0)',
                    stroke: marker.stroke ?? stroke ?? 'rgba(0, 0, 0, 0)',
                    fillOpacity: marker.fillOpacity ?? 1,
                    strokeOpacity: marker.strokeOpacity ?? strokeOpacity ?? 1,
                },
            },
        ];
        return legendData;
    }

    onLegendItemClick(event: _ModuleSupport.LegendItemClickChartEvent) {
        const { enabled, itemId, series } = event;

        if (series.id === this.id) {
            this.toggleSeriesItem(itemId, enabled);
        }
    }

    onLegendItemDoubleClick(event: _ModuleSupport.LegendItemDoubleClickChartEvent) {
        const { enabled, itemId, series, numVisibleItems } = event;

        const totalVisibleItems = Object.values(numVisibleItems).reduce((p, v) => p + v, 0);

        const wasClicked = series.id === this.id;
        const newEnabled = wasClicked || (enabled && totalVisibleItems === 1);

        this.toggleSeriesItem(itemId, newEnabled);
    }

    protected pickNodeClosestDatum(point: _Scene.Point): _ModuleSupport.SeriesNodePickMatch | undefined {
        const { x, y } = point;
        const { rootGroup, nodeData, centerX: cx, centerY: cy, marker } = this;
        const hitPoint = rootGroup.transformPoint(x, y);
        const radius = this.radius;

        const distanceFromCenter = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (distanceFromCenter > radius + marker.size) {
            return;
        }

        let minDistance = Infinity;
        let closestDatum: RadarLineNodeDatum | undefined;

        for (const datum of nodeData) {
            const { point: { x: datumX = NaN, y: datumY = NaN } = {} } = datum;
            if (isNaN(datumX) || isNaN(datumY)) {
                continue;
            }

            const distance = Math.sqrt((hitPoint.x - datumX) ** 2 + (hitPoint.y - datumY) ** 2);
            if (distance < minDistance) {
                minDistance = distance;
                closestDatum = datum;
            }
        }

        if (closestDatum) {
            const distance = Math.max(minDistance - (closestDatum.point?.size ?? 0), 0);
            return { datum: closestDatum, distance };
        }
    }

    computeLabelsBBox() {
        const { label } = this;

        this.maybeRefreshNodeData();

        const textBoxes: _Scene.BBox[] = [];
        const tempText = new Text();
        this.nodeData.forEach((nodeDatum) => {
            if (!label.enabled || !nodeDatum.label) {
                return;
            }
            tempText.text = nodeDatum.label.text;
            tempText.x = nodeDatum.label.x;
            tempText.y = nodeDatum.label.y;
            tempText.setFont(label);
            tempText.setAlign(nodeDatum.label);
            const box = tempText.computeBBox();
            textBoxes.push(box);
        });
        if (textBoxes.length === 0) {
            return null;
        }
        return BBox.merge(textBoxes);
    }

    animateEmptyUpdateReady({ markerSelection, labelSelection, nodeData, lineNode }: RadarLineAnimationData) {
        if (!lineNode) {
            return;
        }
        const { path: linePath } = lineNode;

        const nodeLengths: Array<number> = [0];
        const points = nodeData.map((datum) => datum.point!);
        const first = points[0];
        points.push(first); // connect the last point with the first

        let lineLength = 0;
        points.forEach((point, index) => {
            if (index === 0) return;
            const prev = points[index - 1];
            const { x: prevX, y: prevY } = prev;
            const { x, y } = point;
            if (isNaN(x) || isNaN(y) || isNaN(prevX) || isNaN(prevY)) {
                nodeLengths.push(lineLength);
                return;
            }
            lineLength += Math.sqrt((x - prevX) ** 2 + (y - prevY) ** 2);
            nodeLengths.push(lineLength);
            return lineLength;
        }, 0);

        lineNode.fill = undefined;
        lineNode.lineJoin = 'round';
        lineNode.pointerEvents = PointerEvents.None;

        lineNode.stroke = this.stroke;
        lineNode.strokeWidth = this.getStrokeWidth(this.strokeWidth);
        lineNode.strokeOpacity = this.strokeOpacity;

        lineNode.lineDash = this.lineDash;
        lineNode.lineDashOffset = this.lineDashOffset;

        const duration = 1000;
        const markerDuration = 200;

        const animationOptions = {
            from: 0,
            to: lineLength,
        };

        this.animationManager?.animate<number>(`${this.id}_empty-update-ready`, {
            ...animationOptions,
            duration,
            onUpdate(length) {
                linePath.clear({ trackChanges: true });

                points.forEach((point, index) => {
                    if (nodeLengths[index] <= length) {
                        // Draw/move the full segment if past the end of this segment
                        const { x, y } = point;
                        if (index === 0) {
                            linePath.moveTo(x, y);
                        } else {
                            linePath.lineTo(x, y);
                        }
                    } else if (index > 0 && nodeLengths[index - 1] < length) {
                        // Draw/move partial line if in between the start and end of this segment
                        const start = points[index - 1];
                        const end = point;

                        const segmentLength = nodeLengths[index] - nodeLengths[index - 1];
                        const remainingLength = nodeLengths[index] - length;
                        const ratio = (segmentLength - remainingLength) / segmentLength;

                        const x = (1 - ratio) * start.x + ratio * end.x;
                        const y = (1 - ratio) * start.y + ratio * end.y;

                        if (index === 0) {
                            linePath.moveTo(x, y);
                        } else {
                            linePath.lineTo(x, y);
                        }
                    }
                });

                lineNode.checkPathDirty();
            },
        });

        markerSelection.each((marker, datum, index) => {
            const delay = lineLength > 0 ? (nodeLengths[index] / lineLength) * duration : 0;
            const format = this.animateFormatter(datum);
            const size = datum.point?.size ?? 0;

            this.animationManager?.animate<number>(`${this.id}_empty-update-ready_${marker.id}`, {
                ...animationOptions,
                to: format?.size ?? size,
                delay,
                duration: markerDuration,
                onUpdate(size) {
                    marker.size = size;
                },
            });
        });

        labelSelection.each((label, _, index) => {
            const delay = (nodeLengths[index] / lineLength) * duration;
            this.animationManager?.animate(`${this.id}_empty-update-ready_${label.id}`, {
                from: 0,
                to: 1,
                delay,
                duration: markerDuration,
                onUpdate: (opacity) => {
                    label.opacity = opacity;
                },
            });
        });
    }

    animateReadyUpdate(data: RadarLineAnimationData) {
        this.resetMarkersAndPaths(data);
    }

    animateReadyResize(data: RadarLineAnimationData) {
        this.animationManager?.stop();
        this.resetMarkersAndPaths(data);
    }

    private resetMarkersAndPaths({ markerSelection, nodeData, lineNode }: RadarLineAnimationData) {
        const { path: linePath } = lineNode;

        lineNode.stroke = this.stroke;
        lineNode.strokeWidth = this.getStrokeWidth(this.strokeWidth);
        lineNode.strokeOpacity = this.strokeOpacity;

        lineNode.lineDash = this.lineDash;
        lineNode.lineDashOffset = this.lineDashOffset;

        linePath.clear({ trackChanges: true });

        nodeData.forEach((datum, index) => {
            const { x, y } = datum.point!;
            if (index === 0) {
                linePath.moveTo(x, y);
            } else {
                linePath.lineTo(x, y);
            }
        });
        linePath.closePath();

        lineNode.checkPathDirty();

        markerSelection.each((marker, datum) => {
            const format = this.animateFormatter(datum);
            const size = datum.point?.size ?? 0;
            marker.size = format?.size ?? size;
        });
    }

    private animateFormatter(datum: RadarLineNodeDatum) {
        const {
            marker,
            angleKey = '',
            radiusKey = '',
            stroke: lineStroke,
            id: seriesId,
            ctx: { callbackCache },
        } = this;
        const { size, formatter } = marker;

        const fill = marker.fill;
        const stroke = marker.stroke ?? lineStroke;
        const strokeWidth = marker.strokeWidth ?? this.strokeWidth;

        let format: AgRadarLineSeriesMarkerFormat | undefined = undefined;
        if (formatter) {
            format = callbackCache.call(formatter, {
                datum: datum.datum,
                angleKey,
                radiusKey,
                fill,
                stroke,
                strokeWidth,
                size,
                highlighted: false,
                seriesId,
            });
        }

        return format;
    }
}
