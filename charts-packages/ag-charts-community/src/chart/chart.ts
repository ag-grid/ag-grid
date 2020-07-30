import { Scene } from "../scene/scene";
import { Group } from "../scene/group";
import { Series, SeriesNodeDatum } from "./series/series";
import { Padding } from "../util/padding";
import { Shape } from "../scene/shape/shape";
import { Node } from "../scene/node";
import { Rect } from "../scene/shape/rect";
import { Legend, LegendDatum } from "./legend";
import { BBox } from "../scene/bbox";
import { find } from "../util/array";
import { SizeMonitor } from "../util/sizeMonitor";
import { Caption } from "../caption";
import { Observable, reactive, PropertyChangeEvent, SourceEvent } from "../util/observable";
import { ChartAxis, ChartAxisDirection } from "./chartAxis";
import { CartesianSeries } from "./series/cartesian/cartesianSeries";
import { createId } from "../util/id";

const defaultTooltipCss = `
.ag-chart-tooltip {
    display: none;
    position: absolute;
    user-select: none;
    pointer-events: none;
    white-space: nowrap;
    z-index: 99999;
    font: 12px Verdana, sans-serif;
    color: black;
    background: rgb(244, 244, 244);
    border-radius: 5px;
    box-shadow: 0 0 1px rgba(3, 3, 3, 0.7), 0.5vh 0.5vh 1vh rgba(3, 3, 3, 0.25);
}

.ag-chart-tooltip-visible {
    display: table;
}

.ag-chart-tooltip-title {
    font-weight: bold;
    padding: 7px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    color: white;
    background-color: #888888;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
}

.ag-chart-tooltip-content {
    padding: 7px;
    line-height: 1.7em;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
}

.ag-chart-tooltip-arrow::before {
    content: "";

    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);

    border: 6px solid #989898;

    border-left-color: transparent;
    border-right-color: transparent;
    border-top-color: #989898;
    border-bottom-color: transparent;

    width: 0;
    height: 0;

    margin: 0 auto;
}

.ag-chart-tooltip-arrow::after {
    content: "";

    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);

    border: 5px solid black;

    border-left-color: transparent;
    border-right-color: transparent;
    border-top-color: rgb(244, 244, 244);
    border-bottom-color: transparent;

    width: 0;
    height: 0;

    margin: 0 auto;
}

.ag-chart-wrapper {
    box-sizing: border-box;
    overflow: hidden;
}
`;

export interface TooltipMeta {
    pageX: number;
    pageY: number;
}

export abstract class Chart extends Observable {
    readonly id = createId(this);

    readonly scene: Scene;
    readonly background: Rect = new Rect();
    readonly legend = new Legend();

    protected legendAutoPadding = new Padding();
    protected captionAutoPadding = 0; // top padding only

    private tooltipElement: HTMLDivElement;
    static readonly defaultTooltipClass = 'ag-chart-tooltip';

    private _container: HTMLElement | undefined = undefined;
    set container(value: HTMLElement | undefined) {
        if (this._container !== value) {
            const { parentNode } = this.element;

            if (parentNode != null) {
                parentNode.removeChild(this.element);
            }

            if (value) {
                value.appendChild(this.element);
            }

            this._container = value;
        }
    }
    get container(): HTMLElement | undefined {
        return this._container;
    }

    private _data: any[] = [];
    set data(data: any[]) {
        this._data = data;
        this.series.forEach(series => series.data = data);
    }
    get data(): any[] {
        return this._data;
    }

    set width(value: number) {
        this.autoSize = false;
        if (this.width !== value) {
            this.scene.resize(value, this.height);
            this.fireEvent({ type: 'layoutChange' });
        }
    }
    get width(): number {
        return this.scene.width;
    }

    set height(value: number) {
        this.autoSize = false;
        if (this.height !== value) {
            this.scene.resize(this.width, value);
            this.fireEvent({ type: 'layoutChange' });
        }
    }
    get height(): number {
        return this.scene.height;
    }

    protected _autoSize = false;
    set autoSize(value: boolean) {
        if (this._autoSize !== value) {
            this._autoSize = value;
            const { style } = this.element;
            if (value) {
                const chart = this; // capture `this` for IE11
                SizeMonitor.observe(this.element, size => {
                    if (size.width !== chart.width || size.height !== chart.height) {
                        chart.scene.resize(size.width, size.height);
                        chart.fireEvent({ type: 'layoutChange' });
                    }
                });
                style.display = 'block';
                style.width = '100%';
                style.height = '100%';
            } else {
                SizeMonitor.unobserve(this.element);
                style.display = 'inline-block';
                style.width = 'auto';
                style.height = 'auto';
            }
        }
    }
    get autoSize(): boolean {
        return this._autoSize;
    }

    download(fileName?: string) {
        this.scene.download(fileName);
    }

    @reactive('layoutChange') padding = new Padding(20);
    @reactive('layoutChange') title?: Caption;
    @reactive('layoutChange') subtitle?: Caption;

    private static tooltipDocuments: Document[] = [];

    protected constructor(document = window.document) {
        super();

        const root = new Group();
        const background = this.background;

        background.fill = 'white';
        root.appendChild(background);

        const element = this._element = document.createElement('div');
        element.setAttribute('class', 'ag-chart-wrapper');

        const scene = new Scene(document);
        this.scene = scene;
        scene.root = root;
        scene.container = element;
        this.autoSize = true;

        const { legend } = this;
        legend.addEventListener('layoutChange', this.onLayoutChange, this);
        legend.addPropertyListener('position', this.onLegendPositionChange, this);

        this.tooltipElement = document.createElement('div');
        this.tooltipClass = '';
        document.body.appendChild(this.tooltipElement);

        if (Chart.tooltipDocuments.indexOf(document) < 0) {
            const styleElement = document.createElement('style');
            styleElement.innerHTML = defaultTooltipCss;
            // Make sure the default tooltip style goes before other styles so it can be overridden.
            document.head.insertBefore(styleElement, document.head.querySelector('style'));
            Chart.tooltipDocuments.push(document);
        }

        this.setupDomListeners(scene.canvas.element);

        this.addPropertyListener('title', this.onCaptionChange);
        this.addPropertyListener('subtitle', this.onCaptionChange);
        this.addEventListener('layoutChange', () => this.layoutPending = true);
    }

    destroy() {
        const tooltipParent = this.tooltipElement.parentNode;
        if (tooltipParent) {
            tooltipParent.removeChild(this.tooltipElement);
        }
        SizeMonitor.unobserve(this.element);
        this.container = undefined;

        this.cleanupDomListeners(this.scene.canvas.element);
        this.scene.container = undefined;
    }

    private onLayoutChange() {
        this.layoutPending = true;
    }

    private onLegendPositionChange() {
        this.legendAutoPadding.clear();
        this.layoutPending = true;
    }

    private onCaptionChange(event: PropertyChangeEvent<this, Caption | undefined>) {
        const { value, oldValue } = event;

        if (oldValue) {
            oldValue.removeEventListener('change', this.onLayoutChange, this);
            this.scene.root!.removeChild(oldValue.node);
        }
        if (value) {
            value.addEventListener('change', this.onLayoutChange, this);
            this.scene.root!.appendChild(value.node);
        }
    }

    protected _element: HTMLElement;
    get element(): HTMLElement {
        return this._element;
    }

    abstract get seriesRoot(): Node;

    protected _axes: ChartAxis[] = [];
    set axes(values: ChartAxis[]) {
        this._axes.forEach(axis => this.detachAxis(axis));
        // make linked axes go after the regular ones (simulates stable sort by `linkedTo` property)
        this._axes = values.filter(a => !a.linkedTo).concat(values.filter(a => a.linkedTo));
        this._axes.forEach(axis => this.attachAxis(axis));
        this.axesChanged = true;
    }
    get axes(): ChartAxis[] {
        return this._axes;
    }

    protected attachAxis(axis: ChartAxis) {
        this.scene.root!.insertBefore(axis.group, this.seriesRoot);
    }

    protected detachAxis(axis: ChartAxis) {
        this.scene.root!.removeChild(axis.group);
    }

    protected _series: Series[] = [];
    set series(values: Series[]) {
        this.removeAllSeries();
        values.forEach(series => this.addSeries(series));
    }
    get series(): Series[] {
        return this._series;
    }

    private scheduleLayout() {
        this.layoutPending = true;
    }

    private scheduleData() {
        // To prevent the chart from thinking the cursor is over the same node
        // after a change to data (the nodes are reused on data changes).
        this.dehighlightDatum();
        this.dataPending = true;
    }

    addSeries(series: Series, before?: Series): boolean {
        const { series: allSeries, seriesRoot } = this;
        const canAdd = allSeries.indexOf(series) < 0;

        if (canAdd) {
            const beforeIndex = before ? allSeries.indexOf(before) : -1;

            if (beforeIndex >= 0) {
                allSeries.splice(beforeIndex, 0, series);
                seriesRoot.insertBefore(series.group, before!.group);
            } else {
                allSeries.push(series);
                seriesRoot.append(series.group);
            }
            this.initSeries(series);
            this.seriesChanged = true;
            this.axesChanged = true;

            return true;
        }

        return false;
    }

    protected initSeries(series: Series) {
        series.chart = this;
        if (!series.data) {
            series.data = this.data;
        }
        series.addEventListener('layoutChange', this.scheduleLayout, this);
        series.addEventListener('dataChange', this.scheduleData, this);
        series.addEventListener('legendChange', this.updateLegend, this);
        series.addEventListener('nodeClick', this.onSeriesNodeClick, this);
    }

    protected freeSeries(series: Series) {
        series.chart = undefined;
        series.removeEventListener('layoutChange', this.scheduleLayout, this);
        series.removeEventListener('dataChange', this.scheduleData, this);
        series.removeEventListener('legendChange', this.updateLegend, this);
        series.removeEventListener('nodeClick', this.onSeriesNodeClick, this);
    }

    addSeriesAfter(series: Series, after?: Series): boolean {
        const { series: allSeries, seriesRoot } = this;
        const canAdd = allSeries.indexOf(series) < 0;

        if (canAdd) {
            const afterIndex = after ? this.series.indexOf(after) : -1;

            if (afterIndex >= 0) {
                if (afterIndex + 1 < allSeries.length) {
                    seriesRoot.insertBefore(series.group, allSeries[afterIndex + 1].group);
                } else {
                    seriesRoot.append(series.group);
                }
                this.initSeries(series);

                allSeries.splice(afterIndex + 1, 0, series);
            } else {
                if (allSeries.length > 0) {
                    seriesRoot.insertBefore(series.group, allSeries[0].group);
                } else {
                    seriesRoot.append(series.group);
                }
                this.initSeries(series);

                allSeries.unshift(series);
            }

            this.seriesChanged = true;
            this.axesChanged = true;
        }

        return false;
    }

    removeSeries(series: Series): boolean {
        const index = this.series.indexOf(series);

        if (index >= 0) {
            this.series.splice(index, 1);
            this.freeSeries(series);
            this.seriesRoot.removeChild(series.group);
            this.seriesChanged = true;
            return true;
        }

        return false;
    }

    removeAllSeries(): void {
        this.series.forEach(series => {
            this.freeSeries(series);
            this.seriesRoot.removeChild(series.group);
        });
        this._series = []; // using `_series` instead of `series` to prevent infinite recursion
        this.seriesChanged = true;
    }

    protected assignSeriesToAxes() {
        this.axes.forEach(axis => {
            const axisName = axis.direction + 'Axis';
            const boundSeries: Series[] = [];

            this.series.forEach(series => {
                if ((series as any)[axisName] === axis) {
                    boundSeries.push(series);
                }
            });

            axis.boundSeries = boundSeries;
        });

        this.seriesChanged = false;
    }

    protected assignAxesToSeries(force: boolean = false) {
        // This method has to run before `assignSeriesToAxes`.
        const directionToAxesMap: { [key in ChartAxisDirection]?: ChartAxis[] } = {};

        this.axes.forEach(axis => {
            const direction = axis.direction;
            const directionAxes = directionToAxesMap[direction] || (directionToAxesMap[direction] = []);
            directionAxes.push(axis);
        });

        this.series.forEach(series => {
            series.directions.forEach(direction => {
                const axisName = direction + 'Axis';
                if (!(series as any)[axisName] || force) {
                    const directionAxes = directionToAxesMap[direction];
                    if (directionAxes) {
                        const axis = this.findMatchingAxis(directionAxes, series.getKeys(direction));
                        if (axis) {
                            (series as any)[axisName] = axis;
                        }
                    }
                }
            });

            if (series instanceof CartesianSeries) {
                if (!series.xAxis) {
                    console.warn(`Could not find a matching xAxis for the ${series.id} series.`);
                    return;
                }
                if (!series.yAxis) {
                    console.warn(`Could not find a matching yAxis for the ${series.id} series.`);
                    return;
                }
            }
        });

        this.axesChanged = false;
    }

    private findMatchingAxis(directionAxes: ChartAxis[], directionKeys?: string[]): ChartAxis | undefined {
        for (let i = 0; i < directionAxes.length; i++) {
            const axis = directionAxes[i];
            const axisKeys = axis.keys;

            if (!axisKeys.length) {
                return axis;
            } else if (directionKeys) {
                for (let j = 0; j < directionKeys.length; j++) {
                    if (axisKeys.indexOf(directionKeys[j]) >= 0 ) {
                        return axis;
                    }
                }
            }
        }
    }

    protected _axesChanged = false;
    protected set axesChanged(value: boolean) {
        this._axesChanged = value;
    }
    protected get axesChanged(): boolean {
        return this._axesChanged;
    }

    protected _seriesChanged = false;
    protected set seriesChanged(value: boolean) {
        this._seriesChanged = value;
        if (value) {
            this.dataPending = true;
        }
    }
    protected get seriesChanged(): boolean {
        return this._seriesChanged;
    }

    protected layoutCallbackId: number = 0;
    set layoutPending(value: boolean) {
        if (value) {
            if (!(this.layoutCallbackId || this.dataPending)) {
                this.layoutCallbackId = requestAnimationFrame(this._performLayout);
            }
        } else if (this.layoutCallbackId) {
            cancelAnimationFrame(this.layoutCallbackId);
            this.layoutCallbackId = 0;
        }
    }
    /**
     * Only `true` while we are waiting for the layout to start.
     * This will be `false` if the layout has already started and is ongoing.
     */
    get layoutPending(): boolean {
        return !!this.layoutCallbackId;
    }

    private readonly _performLayout = () => {
        this.layoutCallbackId = 0;

        this.background.width = this.width;
        this.background.height = this.height;

        this.performLayout();

        if (!this.layoutPending) {
            this.fireEvent({ type: 'layoutDone' });
        }
    }

    private dataCallbackId: number = 0;
    set dataPending(value: boolean) {
        if (this.dataCallbackId) {
            clearTimeout(this.dataCallbackId);
            this.dataCallbackId = 0;
        }
        if (value) {
            this.dataCallbackId = window.setTimeout(() => {
                this.dataPending = false;
                this.processData();
            }, 0);
        }
    }
    get dataPending(): boolean {
        return !!this.dataCallbackId;
    }

    processData(): void {
        this.layoutPending = false;

        if (this.axesChanged) {
            this.assignAxesToSeries(true);
            this.assignSeriesToAxes();
        }

        if (this.seriesChanged) {
            this.assignSeriesToAxes();
        }

        this.series.filter(s => s.visible).forEach(series => series.processData());
        this.updateLegend();

        this.layoutPending = true;
    }

    private updateLegend() {
        const legendData: LegendDatum[] = [];

        this.series.filter(s => s.showInLegend).forEach(series => series.listSeriesItems(legendData));

        this.legend.data = legendData;
    }

    abstract performLayout(): void;

    protected positionCaptions() {
        const { title, subtitle } = this;

        let titleVisible = false;
        let subtitleVisible = false;

        const spacing = 10;
        let paddingTop = spacing;

        if (title && title.enabled) {
            title.node.x = this.width / 2;
            title.node.y = paddingTop;
            titleVisible = true;
            const titleBBox = title.node.computeBBox(); // make sure to set node's x/y, then computeBBox
            if (titleBBox) {
                paddingTop = titleBBox.y + titleBBox.height;
            }

            if (subtitle && subtitle.enabled) {
                subtitle.node.x = this.width / 2;
                subtitle.node.y = paddingTop + spacing;
                subtitleVisible = true;
                const subtitleBBox = subtitle.node.computeBBox();
                if (subtitleBBox) {
                    paddingTop = subtitleBBox.y + subtitleBBox.height;
                }
            }
        }

        if (title) {
            title.node.visible = titleVisible;
        }
        if (subtitle) {
            subtitle.node.visible = subtitleVisible;
        }

        this.captionAutoPadding = Math.floor(paddingTop);
    }

    protected positionLegend() {
        if (!this.legend.enabled || !this.legend.data.length) {
            return;
        }

        const { legend, captionAutoPadding, legendAutoPadding } = this;
        const width = this.width;
        const height = this.height - captionAutoPadding;
        const legendGroup = legend.group;
        const legendSpacing = legend.spacing;

        let translationX = 0;
        let translationY = 0;

        let legendBBox: BBox;
        switch (legend.position) {
            case 'bottom':
                legend.performLayout(width - legendSpacing * 2, 0);
                legendBBox = legendGroup.computeBBox();

                translationX = (width - legendBBox.width) / 2 - legendBBox.x;
                translationY = captionAutoPadding + height - legendBBox.height - legendBBox.y - legendSpacing;

                legendAutoPadding.bottom = legendBBox.height;
                break;

            case 'top':
                legend.performLayout(width - legendSpacing * 2, 0);
                legendBBox = legendGroup.computeBBox();

                translationX = (width - legendBBox.width) / 2 - legendBBox.x;
                translationY = captionAutoPadding + legendSpacing - legendBBox.y;

                legendAutoPadding.top = legendBBox.height;
                break;

            case 'left':
                legend.performLayout(0, height - legendSpacing * 2);
                legendBBox = legendGroup.computeBBox();

                translationX = legendSpacing - legendBBox.x;
                translationY = captionAutoPadding + (height - legendBBox.height) / 2 - legendBBox.y;

                legendAutoPadding.left = legendBBox.width;
                break;

            default: // case 'right':
                legend.performLayout(0, height - legendSpacing * 2);
                legendBBox = legendGroup.computeBBox();

                translationX = width - legendBBox.width - legendBBox.x - legendSpacing;
                translationY = captionAutoPadding + (height - legendBBox.height) / 2 - legendBBox.y;

                legendAutoPadding.right = legendBBox.width;
                break;
        }

        // Round off for pixel grid alignment to work properly.
        legendGroup.translationX = Math.floor(translationX + legendGroup.translationX);
        legendGroup.translationY = Math.floor(translationY + legendGroup.translationY);
    }

    protected setupDomListeners(chartElement: HTMLCanvasElement) {
        chartElement.addEventListener('mousedown', this._onMouseDown);
        chartElement.addEventListener('mousemove', this._onMouseMove);
        chartElement.addEventListener('mouseup', this._onMouseUp);
        chartElement.addEventListener('mouseout', this._onMouseOut);
        chartElement.addEventListener('click', this._onClick);
    }

    protected cleanupDomListeners(chartElement: HTMLCanvasElement) {
        chartElement.removeEventListener('mousedown', this._onMouseDown);
        chartElement.removeEventListener('mousemove', this._onMouseMove);
        chartElement.removeEventListener('mouseup', this._onMouseUp);
        chartElement.removeEventListener('mouseout', this._onMouseOut);
        chartElement.removeEventListener('click', this._onClick);
    }

    // Should be available after first layout.
    protected seriesRect?: BBox;

    // x/y are local canvas coordinates in CSS pixels, not actual pixels
    private pickSeriesNode(x: number, y: number): {
        series: Series,
        node: Node
    } | undefined {
        if (!this.seriesRect || !this.seriesRect.containsPoint(x, y)) {
            return undefined;
        }

        const allSeries = this.series;
        let node: Node | undefined = undefined;
        for (let i = allSeries.length - 1; i >= 0; i--) {
            const series = allSeries[i];
            node = series.group.pickNode(x, y);
            if (node) {
                return {
                    series,
                    node
                };
            }
        }
    }

    private lastPick?: {
        datum: SeriesNodeDatum,
        node?: Shape // we may not always have an associated node, for example
                     // when line series are rendered without markers
    };

    // Provided x/y are in canvas coordinates.
    private pickClosestSeriesNodeDatum(x: number, y: number): SeriesNodeDatum | undefined {
        if (!this.seriesRect || !this.seriesRect.containsPoint(x, y)) {
            return undefined;
        }

        const allSeries = this.series;

        type Point = { x: number, y: number};

        function getDistance(p1: Point, p2: Point): number {
            return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
        }

        let minDistance = Infinity;
        let closestDatum: SeriesNodeDatum | undefined;

        for (let i = allSeries.length - 1; i >= 0; i--) {
            const series = allSeries[i];
            if (!series.visible) {
                continue;
            }
            const hitPoint = series.group.transformPoint(x, y);
            series.getNodeData().forEach(datum => {
                if (!datum.point) {
                    return;
                }
                const distance = getDistance(hitPoint, datum.point);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestDatum = datum;
                }
            });
        }

        if (closestDatum) {
            return closestDatum;
        }
    }

    private _onMouseDown = this.onMouseDown.bind(this);
    private _onMouseUp = this.onMouseUp.bind(this);
    private _onMouseMove = this.onMouseMove.bind(this);
    private _onMouseOut = this.onMouseOut.bind(this);
    private _onClick = this.onClick.bind(this);

    protected onMouseMove(event: MouseEvent) {
        const { lastPick, tooltipTracking } = this;
        const pick = this.pickSeriesNode(event.offsetX, event.offsetY);
        let nodeDatum: SeriesNodeDatum | undefined;

        if (pick && pick.node instanceof Shape) {
            const { node } = pick;
            nodeDatum = node.datum as SeriesNodeDatum;
            if (lastPick && lastPick.datum === nodeDatum) {
                lastPick.node = node;
            }
            // Marker nodes will have the `point` info in their datums.
            // Highlight if not a marker node or, if not in the tracking mode, highlight markers too.
            if ((!node.datum.point || !tooltipTracking)) {
                if (!lastPick // cursor moved from empty space to a node
                    || lastPick.node !== node) { // cursor moved from one node to another
                    this.onSeriesDatumPick(event, node.datum, node);
                } else if (pick.series.tooltipEnabled) { // cursor moved within the same node
                    this.showTooltip(event);
                }
                // A non-marker node (takes precedence over marker nodes) was highlighted.
                // Or we are not in the tracking mode.
                // Either way, we are done at this point.
                return;
            }
        }

        let hideTooltip = false;
        // In tracking mode a tooltip is shown for the closest rendered datum.
        // This makes it easier to show tooltips when markers are small and/or plentiful
        // and also gives the ability to show tooltips even when the series were configured
        // to not render markers.
        if (tooltipTracking) {
            const closestDatum = this.pickClosestSeriesNodeDatum(event.offsetX, event.offsetY);
            if (closestDatum && closestDatum.point) {
                const { x, y } = closestDatum.point;
                const { canvas } = this.scene;
                const point = closestDatum.series.group.inverseTransformPoint(x, y);
                const canvasRect = canvas.element.getBoundingClientRect() as DOMRect;
                this.onSeriesDatumPick({
                    pageX: Math.round(canvasRect.left + window.pageXOffset + point.x),
                    pageY: Math.round(canvasRect.top + window.pageYOffset + point.y)
                }, closestDatum, nodeDatum === closestDatum && pick ? pick.node as Shape : undefined);
            } else {
                hideTooltip = true;
            }
        }
        if (lastPick && (hideTooltip || !tooltipTracking)) {
            // cursor moved from a non-marker node to empty space
            this.dehighlightDatum();
            this.hideTooltip();
            this.lastPick = undefined;
        }
    }

    protected onMouseDown(event: MouseEvent) {}
    protected onMouseUp(event: MouseEvent) {}

    protected onMouseOut(event: MouseEvent) {
        this.toggleTooltip(false);
    }

    protected onClick(event: MouseEvent) {
        this.checkSeriesNodeClick();
        this.checkLegendClick(event);
    }

    private checkSeriesNodeClick() {
        const { lastPick } = this;

        if (lastPick && lastPick.node) {
            const { datum } = lastPick;
            datum.series.fireNodeClickEvent(datum);
        }
    }

    private onSeriesNodeClick(event: SourceEvent<Series>) {
        this.fireEvent({ ...event, type: 'seriesNodeClick' });
    }

    private checkLegendClick(event: MouseEvent) {
        const datum = this.legend.getDatumForPoint(event.offsetX, event.offsetY);

        if (datum) {
            const { id, itemId, enabled } = datum;
            const series = find(this.series, series => series.id === id);

            if (series) {
                series.toggleSeriesItem(itemId, !enabled);
                if (enabled) {
                    this.hideTooltip();
                }
            }
        }
    }

    private onSeriesDatumPick(meta: TooltipMeta, datum: SeriesNodeDatum, node?: Shape) {
        if (this.lastPick) {
            // this.lastPick.datum.series.dehighlightDatum();
            this.dehighlightDatum();
        }

        this.lastPick = {
            datum,
            node
        };

        this.highlightDatum(datum);

        const html = datum.series.tooltipEnabled && datum.series.getTooltipHtml(datum);

        if (html) {
            this.showTooltip(meta, html);
        }
    }

    highlightedDatum?: SeriesNodeDatum;

    highlightDatum(datum: SeriesNodeDatum): void {
        this.highlightedDatum = datum;
        this.series.forEach(s => s.onHighlightChange());
    }

    dehighlightDatum(): void {
        if (this.highlightedDatum) {
            this.highlightedDatum = undefined;
            this.series.forEach(s => s.onHighlightChange());
        }
    }

    private _tooltipClass: string = Chart.defaultTooltipClass;
    set tooltipClass(value: string) {
        if (this._tooltipClass !== value) {
            this._tooltipClass = value;
            this.toggleTooltip();
        }
    }
    get tooltipClass(): string {
        return this._tooltipClass;
    }

    /**
     * If `true`, the tooltip will be shown for the marker closest to the mouse cursor.
     * Only has effect on series with markers.
     */
    tooltipTracking = true;

    private toggleTooltip(visible?: boolean) {
        if (!visible && this.lastPick) {
            this.dehighlightDatum();
            this.lastPick = undefined;
        }
        this.updateTooltipClass(visible);
    }

    private updateTooltipClass(visible?: boolean, constrained?: boolean) {
        const classList = [Chart.defaultTooltipClass, this.tooltipClass];

        if (visible === true) {
            classList.push(`${Chart.defaultTooltipClass}-visible`);
        }
        if (constrained !== true) {
            classList.push(`${Chart.defaultTooltipClass}-arrow`);
        }

        this.tooltipElement.setAttribute('class', classList.join(' '));
    }

    /**
     * Shows tooltip at the given event's coordinates.
     * If the `html` parameter is missing, moves the existing tooltip to the new position.
     */
    private showTooltip(meta: TooltipMeta, html?: string) {
        const el = this.tooltipElement;
        const { container } = this;

        if (html !== undefined) {
            el.innerHTML = html;
        } else if (!el.innerHTML) {
            return;
        }

        if (html) {
            this.toggleTooltip(true);
        }

        let left = meta.pageX - el.clientWidth / 2;
        const top = meta.pageY - el.clientHeight - 8;

        if (container) {
            const tooltipRect = el.getBoundingClientRect() as DOMRect;
            const minLeft = 0;
            const maxLeft = window.innerWidth - tooltipRect.width;
            if (left < minLeft) {
                left = minLeft;
                this.updateTooltipClass(true, true);
            } else if (left > maxLeft) {
                left = maxLeft;
                this.updateTooltipClass(true, true);
            }
        }

        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
    }

    private hideTooltip() {
        this.toggleTooltip(false);
    }
}
