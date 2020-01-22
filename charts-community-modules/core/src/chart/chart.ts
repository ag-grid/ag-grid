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
import { Caption } from "../caption";
import { Observable, reactive, PropertyChangeEventListener } from "../util/observable";
import { ChartAxis, ChartAxisDirection } from "./chartAxis";
import { CartesianSeries } from "./series/cartesian/cartesianSeries";
import { createId } from "../util/id";

const defaultTooltipCss = `
.ag-chart-tooltip {
    display: table;
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
    opacity: 0;
    transform: scale(0.90);
    transition: 0.3s cubic-bezier(0.19, 1, 0.22, 1);
    transition-property: opacity, transform;
}

.ag-chart-tooltip-visible {
    opacity: 1;
    transform: scale(1);
}

.ag-chart-tooltip-title {
    font-weight: bold;
    padding: 7px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    color: white;
    background-color: #888888;
}

.ag-chart-tooltip-content {
    padding: 7px;
    line-height: 1.7em;
}
`;

export abstract class Chart extends Observable {
    readonly id = createId(this);

    readonly scene: Scene;
    readonly background: Rect = new Rect();
    readonly legend = new Legend();

    protected legendAutoPadding = new Padding();
    protected captionAutoPadding = 0; // top padding only

    private tooltipElement: HTMLDivElement;
    static readonly defaultTooltipClass = 'ag-chart-tooltip';
    tooltipOffset: [number, number] = [20, 20];

    set container(value: HTMLElement | undefined) {
        this.scene.container = value;
    }
    get container(): HTMLElement | undefined {
        return this.scene.container;
    }

    private _data: any[] = [];
    set data(data: any[]) {
        this._data = data;
        this.series.forEach(series => series.data = data);
    }
    get data(): any[] {
        return this._data;
    }

    private pendingSize?: [number, number];

    set width(value: number) {
        if (this.width !== value) {
            this.pendingSize = [value, this.height];
            this.fireEvent({ type: 'layoutChange' });
        }
    }
    get width(): number {
        return this.pendingSize ? this.pendingSize[0] : this.scene.width;
    }

    set height(value: number) {
        if (this.height !== value) {
            this.pendingSize = [this.width, value];
            this.fireEvent({ type: 'layoutChange' });
        }
    }
    get height(): number {
        return this.pendingSize ? this.pendingSize[1] : this.scene.height;
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

        const scene = new Scene(document);
        this.scene = scene;
        scene.root = root;

        const { legend } = this;
        legend.addEventListener('layoutChange', this.onLayoutChange);
        legend.addPropertyListener('position', this.onLegendPositionChange);

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

        this.setupListeners(scene.canvas.element);

        const captionListener = (event => {
            const { source: chart, value: caption, oldValue: oldCaption } = event;

            if (oldCaption) {
                oldCaption.removeEventListener('change', chart.onLayoutChange);
                chart.scene.root!.removeChild(oldCaption.node);
            }
            if (caption) {
                caption.addEventListener('change', chart.onLayoutChange);
                chart.scene.root!.appendChild(caption.node);
            }
        }) as PropertyChangeEventListener<Chart, Caption | undefined>;

        this.addPropertyListener('title', captionListener);
        this.addPropertyListener('subtitle', captionListener);
        this.addEventListener('layoutChange', () => this.layoutPending = true);
    }

    destroy() {
        const tooltipParent = this.tooltipElement.parentNode;
        if (tooltipParent) {
            tooltipParent.removeChild(this.tooltipElement);
        }

        this.legend.removeEventListener('layoutChange', this.onLayoutChange);
        this.cleanupListeners(this.scene.canvas.element);
        this.scene.container = undefined;
    }

    private readonly onLayoutChange = () => {
        this.layoutPending = true;
    }

    private readonly onLegendPositionChange = () => {
        this.legendAutoPadding.clear();
        this.layoutPending = true;
    }

    get element(): HTMLElement {
        return this.scene.canvas.element;
    }

    abstract get seriesRoot(): Node;

    protected _axes: ChartAxis[] = [];
    set axes(values: ChartAxis[]) {
        const root = this.scene.root!;
        this._axes.forEach(axis => root.removeChild(axis.group));
        // make linked axes go after the regular ones (simulates stable sort by `linkedTo` property)
        this._axes = values.filter(a => !a.linkedTo).concat(values.filter(a => a.linkedTo));
        this._axes.forEach(axis => root.insertBefore(axis.group, this.seriesRoot));
        this.axesChanged = true;
    }
    get axes(): ChartAxis[] {
        return this._axes;
    }

    protected _series: Series[] = [];
    set series(values: Series[]) {
        this.removeAllSeries();
        values.forEach(series => this.addSeries(series));
    }
    get series(): Series[] {
        return this._series;
    }

    private readonly scheduleLayout = () => {
        this.layoutPending = true;
    }

    private readonly scheduleData = () => {
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
        series.addEventListener('layoutChange', this.scheduleLayout);
        series.addEventListener('dataChange', this.scheduleData);
        series.addEventListener('legendChange', this.updateLegend);
    }

    protected freeSeries(series: Series) {
        series.chart = undefined;
        series.removeEventListener('layoutChange', this.scheduleLayout);
        series.removeEventListener('dataChange', this.scheduleData);
        series.removeEventListener('legendChange', this.updateLegend);
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
        if (this.pendingSize) {
            this.scene.resize(...this.pendingSize);
            this.pendingSize = undefined;
        }

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

    readonly updateLegend = () => {
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

        this.captionAutoPadding = paddingTop;
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

        legendGroup.translationX = 0;
        legendGroup.translationY = 0;

        let legendBBox: BBox;
        switch (legend.position) {
            case 'bottom':
                legend.performLayout(width - legendSpacing * 2, 0);
                legendBBox = legendGroup.computeBBox();

                legendGroup.translationX = (width - legendBBox.width) / 2 - legendBBox.x;
                legendGroup.translationY = captionAutoPadding + height - legendBBox.height - legendBBox.y - legendSpacing;

                legendAutoPadding.bottom = legendBBox.height;
                break;

            case 'top':
                legend.performLayout(width - legendSpacing * 2, 0);
                legendBBox = legendGroup.computeBBox();

                legendGroup.translationX = (width - legendBBox.width) / 2 - legendBBox.x;
                legendGroup.translationY = captionAutoPadding + legendSpacing - legendBBox.y;

                legendAutoPadding.top = legendBBox.height;
                break;

            case 'left':
                legend.performLayout(0, height - legendSpacing * 2);
                legendBBox = legendGroup.computeBBox();

                legendGroup.translationX = legendSpacing - legendBBox.x;
                legendGroup.translationY = captionAutoPadding + (height - legendBBox.height) / 2 - legendBBox.y;

                legendAutoPadding.left = legendBBox.width;
                break;

            default: // case 'right':
                legend.performLayout(0, height - legendSpacing * 2);
                legendBBox = legendGroup.computeBBox();

                legendGroup.translationX = width - legendBBox.width - legendBBox.x - legendSpacing;
                legendGroup.translationY = captionAutoPadding + (height - legendBBox.height) / 2 - legendBBox.y;

                legendAutoPadding.right = legendBBox.width;
                break;
        }

        // Round off for pixel grid alignment to work properly.
        legendGroup.translationX = Math.floor(legendGroup.translationX);
        legendGroup.translationY = Math.floor(legendGroup.translationY);
    }

    private setupListeners(chartElement: HTMLCanvasElement) {
        chartElement.addEventListener('mousemove', this.onMouseMove);
        chartElement.addEventListener('mouseout', this.onMouseOut);
        chartElement.addEventListener('click', this.onClick);
    }

    private cleanupListeners(chartElement: HTMLCanvasElement) {
        chartElement.removeEventListener('mousemove', this.onMouseMove);
        chartElement.removeEventListener('mouseout', this.onMouseMove);
        chartElement.removeEventListener('click', this.onClick);
    }

    private pickSeriesNode(x: number, y: number): {
        series: Series,
        node: Node
    } | undefined {
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
        series: Series,
        node: Shape
    };

    private readonly onMouseMove = (event: MouseEvent) => {
        const { offsetX: x, offsetY: y } = event;
        const pick = this.pickSeriesNode(x, y);

        if (pick) {
            const { node } = pick;

            if (node instanceof Shape) {
                if (!this.lastPick || // cursor moved from empty space to a node
                    this.lastPick.node !== node) { // cursor moved from one node to another
                    this.onSeriesNodePick(event, pick.series, node);
                } else if (pick.series.tooltipEnabled) { // cursor moved within the same node
                    this.showTooltip(event);
                }
            }
        } else if (this.lastPick) { // cursor moved from a node to empty space
            this.lastPick.series.dehighlightNode();
            this.hideTooltip();
            this.lastPick = undefined;
        }
    }

    private readonly onMouseOut = (_: MouseEvent) => {
        this.toggleTooltip(false);
    }

    private readonly onClick = (event: MouseEvent) => {
        const { offsetX: x, offsetY: y } = event;
        const datum = this.legend.datumForPoint(x, y);

        if (datum) {
            const { id, itemId, enabled } = datum;
            const series = find(this.series, series => series.id === id);

            if (series) {
                series.toggleSeriesItem(itemId, !enabled);
            }
        }
    }

    private onSeriesNodePick(event: MouseEvent, series: Series, node: Shape) {
        if (this.lastPick) {
            this.lastPick.series.dehighlightNode();
        }

        this.lastPick = {
            series,
            node
        };

        series.highlightNode(node);

        const html = series.tooltipEnabled && series.getTooltipHtml(node.datum as SeriesNodeDatum);

        if (html) {
            this.showTooltip(event, html);
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

    private toggleTooltip(visible?: boolean) {
        const classList = [Chart.defaultTooltipClass, this.tooltipClass];
        if (visible) {
            classList.push(`${Chart.defaultTooltipClass}-visible`);
        } else if (this.lastPick) {
            this.lastPick.series.dehighlightNode();
            this.lastPick = undefined;
        }
        this.tooltipElement.setAttribute('class', classList.join(' '));
    }

    /**
     * Shows tooltip at the given event's coordinates.
     * If the `html` parameter is missing, moves the existing tooltip to the new position.
     */
    private showTooltip(event: MouseEvent, html?: string) {
        const el = this.tooltipElement;
        const offset = this.tooltipOffset;
        const parent = el.parentElement;

        if (html !== undefined) {
            el.innerHTML = html;
        } else if (!el.innerHTML) {
            return;
        }

        if (html) {
            this.toggleTooltip(true);
        }

        const tooltipRect = el.getBoundingClientRect();
        const top = event.pageY + offset[1];
        let left = event.pageX + offset[0];

        if (tooltipRect &&
            parent &&
            parent.parentElement &&
            (left - pageXOffset + tooltipRect.width > parent.parentElement.offsetWidth)) {
            left -= tooltipRect.width + offset[0];
        }

        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
    }

    private hideTooltip() {
        this.toggleTooltip(false);
    }
}
