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

export type LegendPosition = 'top' | 'right' | 'bottom' | 'left';

export abstract class Chart extends Observable {
    readonly scene: Scene;
    readonly background: Rect = new Rect();

    protected legendAutoPadding = new Padding();
    protected captionAutoPadding = 0; // top padding only

    private tooltipElement: HTMLDivElement;
    private defaultTooltipClass = 'ag-chart-tooltip';

    legend = new Legend();
    tooltipOffset = [20, 20];

    @reactive([], 'scene.parent') parent?: HTMLElement;
    @reactive(['layoutChange']) title?: Caption;
    @reactive(['layoutChange']) subtitle?: Caption;
    @reactive(['layoutChange']) padding = new Padding(20);
    @reactive(['layoutChange'], 'scene.size') size: [number, number];
    @reactive(['layoutChange'], 'scene.height') height: number; // in CSS pixels
    @reactive(['layoutChange'], 'scene.width') width: number;   // in CSS pixels

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
        this.scene.parent = undefined;
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
        this._axes = values;
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
        series.addEventListener('layoutChange', this.scheduleLayout);
        series.addEventListener('dataChange', this.scheduleData);
        series.addEventListener('legendChange', this.updateLegend);
    }

    protected freeSeries(series: Series) {
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

    /**
     * Finds all the series that use any given axis.
     */
    protected onSeriesChange() {
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

    // Has to run before onSeriesChange
    protected onAxesChange(force: boolean = false) {
        const directionToKeysMap: { [key in ChartAxisDirection]?: string[] } = {};
        const directionToAxesMap: { [key in ChartAxisDirection]?: ChartAxis[] } = {};
        const { axes } = this;

        this.series.forEach(series => {
            const directions = series.directions;
            directions.forEach(direction => {
                directionToKeysMap[direction] = series.getKeys(direction);
            });

            axes.forEach(axis => {
                const direction = axis.direction;
                const directionAxes = directionToAxesMap[direction] || (directionToAxesMap[direction] = []);
                directionAxes.push(axis);
            });

            directions.forEach(direction => {
                const axisName = direction + 'Axis';
                if (!(series as any)[axisName] || force) {
                    const directionAxes = directionToAxesMap[direction];
                    if (directionAxes) {
                        const axis = this.findMatchingAxis(directionAxes, directionToKeysMap[direction]);
                        if (axis) {
                            (series as any)[axisName] = axis;
                        }
                    }
                }
            });
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

    private _data: any[] = [];
    set data(data: any[]) {
        this._data = data;
        this.series.forEach(series => series.data = data);
    }
    get data(): any[] {
        return this._data;
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
        this.fireEvent({ type: 'layoutDone' });
    }

    private dataCallbackId: number = 0;
    set dataPending(value: boolean) {
        if (this.dataCallbackId) {
            clearTimeout(this.dataCallbackId);
            this.dataCallbackId = 0;
        }
        if (value) {
            // We don't want to render before the data is processed and then again after,
            // so we cancel the auto-scheduled render, if any.
            this.scene.cancelRender();
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
            this.onAxesChange();
        }

        if (this.seriesChanged) {
            this.onSeriesChange();
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

        if (this.captionAutoPadding !== paddingTop) {
            this.captionAutoPadding = paddingTop;
            this.layoutPending = true;
        }
    }

    protected positionLegend() {
        if (!this.legend.enabled || !this.legend.data.length) {
            return;
        }

        const captionAutoPadding = this.captionAutoPadding;
        const width = this.width;
        const height = this.height - captionAutoPadding;
        const legend = this.legend;
        const legendGroup = legend.group;
        const legendPadding = this.legend.padding;
        const legendAutoPadding = this.legendAutoPadding;

        legendGroup.translationX = 0;
        legendGroup.translationY = 0;

        let legendBBox: BBox;
        switch (this.legend.position) {
            case 'bottom':
                legend.performLayout(width - legendPadding * 2, 0);
                legendBBox = legendGroup.computeBBox();

                legendGroup.translationX = (width - legendBBox.width) / 2 - legendBBox.x;
                legendGroup.translationY = captionAutoPadding + height - legendBBox.height - legendBBox.y - legendPadding;

                if (legendAutoPadding.bottom !== legendBBox.height) {
                    legendAutoPadding.bottom = legendBBox.height;
                    this.layoutPending = true;
                }
                break;

            case 'top':
                legend.performLayout(width - legendPadding * 2, 0);
                legendBBox = legendGroup.computeBBox();

                legendGroup.translationX = (width - legendBBox.width) / 2 - legendBBox.x;
                legendGroup.translationY = captionAutoPadding + legendPadding - legendBBox.y;

                if (legendAutoPadding.top !== legendBBox.height) {
                    legendAutoPadding.top = legendBBox.height;
                    this.layoutPending = true;
                }
                break;

            case 'left':
                legend.performLayout(0, height - legendPadding * 2);
                legendBBox = legendGroup.computeBBox();

                legendGroup.translationX = legendPadding - legendBBox.x;
                legendGroup.translationY = captionAutoPadding + (height - legendBBox.height) / 2 - legendBBox.y;

                if (legendAutoPadding.left !== legendBBox.width) {
                    legendAutoPadding.left = legendBBox.width;
                    this.layoutPending = true;
                }
                break;

            default: // case 'right':
                legend.performLayout(0, height - legendPadding * 2);
                legendBBox = legendGroup.computeBBox();

                legendGroup.translationX = width - legendBBox.width - legendBBox.x - legendPadding;
                legendGroup.translationY = captionAutoPadding + (height - legendBBox.height) / 2 - legendBBox.y;

                if (legendAutoPadding.right !== legendBBox.width) {
                    legendAutoPadding.right = legendBBox.width;
                    this.layoutPending = true;
                }
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

    private _tooltipClass: string = this.defaultTooltipClass;
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
        const classList = [this.defaultTooltipClass, this._tooltipClass];
        if (visible) {
            classList.push('visible');
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
