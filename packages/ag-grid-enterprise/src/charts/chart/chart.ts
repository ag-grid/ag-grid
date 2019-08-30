import { Scene } from "../scene/scene";
import { Group } from "../scene/group";
import { Series, SeriesNodeDatum } from "./series/series";
import { Padding } from "../util/padding";
import { Shape } from "../scene/shape/shape";
import { Node } from "../scene/node";
import { Rect } from "../scene/shape/rect";
import { Legend, LegendDatum, Orientation } from "./legend";
import { BBox } from "../scene/bbox";
import { find } from "../util/array";
import { Caption } from "../caption";

export type LegendPosition = 'top' | 'right' | 'bottom' | 'left';

export type ChartOptions = {
    document?: Document
};

export abstract class Chart {
    readonly scene: Scene;
    readonly background: Rect = new Rect();

    legend = new Legend();

    protected legendAutoPadding = new Padding();
    protected captionAutoPadding = 0; // top padding only

    private tooltipElement: HTMLDivElement;
    private tooltipRect?: ClientRect;

    tooltipOffset = [20, 20];

    private defaultTooltipClass = 'ag-chart-tooltip';

    protected constructor(options: ChartOptions = {}) {
        const root = new Group();
        const background = this.background;
        const document = options.document || window.document;

        background.fill = 'white';
        root.appendChild(background);

        this.scene = new Scene({document});
        this.scene.root = root;
        this.legend.onLayoutChange = this.onLayoutChange;

        this.tooltipElement = document.createElement('div');
        this.tooltipClass = '';
        document.body.appendChild(this.tooltipElement);

        this.setupListeners(this.scene.canvas.element);
    }

    destroy() {
        const tooltipParent = this.tooltipElement.parentNode;
        if (tooltipParent) {
            tooltipParent.removeChild(this.tooltipElement);
        }

        this.legend.onLayoutChange = undefined;
        this.cleanupListeners(this.scene.canvas.element);
        this.scene.parent = undefined;
    }

    private readonly onLayoutChange = () => {
        this.layoutPending = true;
    }

    get element(): HTMLElement {
        return this.scene.canvas.element;
    }

    set parent(value: HTMLElement | undefined) {
        this.scene.parent = value;
    }
    get parent(): HTMLElement | undefined {
        return this.scene.parent;
    }

    private _title: Caption | undefined = undefined;
    set title(value: Caption | undefined) {
        const oldTitle = this._title;
        if (oldTitle !== value) {
            if (oldTitle) {
                oldTitle.onLayoutChange = undefined;
                this.scene.root!.removeChild(oldTitle.node);
            }
            if (value) {
                value.onLayoutChange = this.onLayoutChange;
                this.scene.root!.appendChild(value.node);
            }
            this._title = value;
            this.layoutPending = true;
        }
    }
    get title(): Caption | undefined {
        return this._title;
    }

    private _subtitle: Caption | undefined = undefined;
    set subtitle(value: Caption | undefined) {
        const oldSubtitle = this._subtitle;
        if (oldSubtitle !== value) {
            if (oldSubtitle) {
                oldSubtitle.onLayoutChange = undefined;
                this.scene.root!.removeChild(oldSubtitle.node);
            }
            if (value) {
                value.onLayoutChange = this.onLayoutChange;
                this.scene.root!.appendChild(value.node);
            }
            this._subtitle = value;
            this.layoutPending = true;
        }
    }
    get subtitle(): Caption | undefined {
        return this._subtitle;
    }

    abstract get seriesRoot(): Node;

    protected _series: Series<Chart>[] = [];
    set series(values: Series<Chart>[]) {
        this._series = values;
    }
    get series(): Series<Chart>[] {
        return this._series;
    }

    addSeries(series: Series<Chart>, before: Series<Chart> | null = null): boolean {
        const canAdd = this.series.indexOf(series) < 0;

        if (canAdd) {
            const beforeIndex = before ? this.series.indexOf(before) : -1;

            if (beforeIndex >= 0) {
                this.series.splice(beforeIndex, 0, series);
                this.seriesRoot.insertBefore(series.group, before!.group);
            } else {
                this.series.push(series);
                this.seriesRoot.append(series.group);
            }
            series.chart = this;
            this.dataPending = true;
            return true;
        }

        return false;
    }

    removeSeries(series: Series<Chart>): boolean {
        const index = this.series.indexOf(series);

        if (index >= 0) {
            this.series.splice(index, 1);
            series.chart = undefined;
            this.seriesRoot.removeChild(series.group);
            this.dataPending = true;
            return true;
        }

        return false;
    }

    removeAllSeries(): void {
        this.series.forEach(series => {
            series.chart = undefined;
            this.seriesRoot.removeChild(series.group);
        });
        this._series = []; // using `_series` instead of `series` to prevent infinite recursion
        this.dataPending = true;
    }

    private _legendPosition: LegendPosition = 'right';
    set legendPosition(value: LegendPosition) {
        if (this._legendPosition !== value) {
            this._legendPosition = value;
            this.legendAutoPadding.clear();
            switch (value) {
                case 'right':
                case 'left':
                    this.legend.orientation = Orientation.Vertical;
                    break;
                case 'bottom':
                case 'top':
                    this.legend.orientation = Orientation.Horizontal;
                    break;
            }
            this.layoutPending = true;
        }
    }
    get legendPosition(): LegendPosition {
        return this._legendPosition;
    }

    private _legendPadding: number = 20;
    set legendPadding(value: number) {
        value = isFinite(value) ? value : 20;
        if (this._legendPadding !== value) {
            this._legendPadding = value;
            this.layoutPending = true;
        }
    }
    get legendPadding(): number {
        return this._legendPadding;
    }

    private _data: any[] = [];
    set data(data: any[]) {
        this._data = data;
        this.series.forEach(series => series.data = data);
    }
    get data(): any[] {
        return this._data;
    }

    protected _padding = new Padding(20);
    set padding(value: Padding) {
        this._padding = value;
        this.layoutPending = true;
    }
    get padding(): Padding {
        return this._padding;
    }

    set size(value: [number, number]) {
        this.scene.size = value;
        this.layoutPending = true;
    }
    get size(): [number, number] {
        return this.scene.size;
    }

    /**
     * The width of the chart in CSS pixels.
     */
    set width(value: number) {
        this.scene.width = value;
        this.layoutPending = true;
    }
    get width(): number {
        return this.scene.width;
    }

    /**
     * The height of the chart in CSS pixels.
     */
    set height(value: number) {
        this.scene.height = value;
        this.layoutPending = true;
    }
    get height(): number {
        return this.scene.height;
    }

    private layoutCallbackId: number = 0;
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
        if (this.onLayoutDone) {
            this.onLayoutDone();
        }
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
            this.dataCallbackId = window.setTimeout(this._processData, 0); // run on next tick
        }
    }
    get dataPending(): boolean {
        return !!this.dataCallbackId;
    }

    onLayoutDone?: () => void;

    private readonly _processData = () => {
        this.dataCallbackId = 0;
        this.processData();
    }

    processData(): void {
        this.layoutPending = false;

        const legendData: LegendDatum[] = [];
        this.series.forEach(series => {
            if (series.visible) {
                series.processData();
            }
            if (series.showInLegend) {
                series.listSeriesItems(legendData);
            }
        });
        this.legend.data = legendData;

        this.layoutPending = true;
    }

    abstract performLayout(): void;

    protected positionCaptions() {
        const title = this.title;
        const subtitle = this.subtitle;

        let titleVisible = false;
        let subtitleVisible = false;

        const spacing = 5;
        let paddingTop = 0;

        if (title && title.enabled) {
            paddingTop += 10;
            const bbox = title.node.getBBox();
            title.node.x = this.width / 2;
            title.node.y = paddingTop;
            titleVisible = true;
            paddingTop += bbox ? bbox.height : 0;

            if (subtitle && subtitle.enabled) {
                const bbox = subtitle.node.getBBox();
                subtitle.node.x = this.width / 2;
                subtitle.node.y = paddingTop;
                subtitleVisible = true;
                paddingTop += spacing + (bbox ? bbox.height : 0);
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

    private legendBBox?: BBox;

    protected positionLegend() {
        if (!this.legend.enabled || !this.legend.data.length) {
            return;
        }

        const captionAutoPadding = this.captionAutoPadding;
        const width = this.width;
        const height = this.height - captionAutoPadding;
        const legend = this.legend;
        const legendGroup = legend.group;
        const legendPadding = this.legendPadding;
        const legendAutoPadding = this.legendAutoPadding;

        legendGroup.translationX = 0;
        legendGroup.translationY = 0;

        let legendBBox: BBox;
        switch (this.legendPosition) {
            case 'bottom':
                legend.performLayout(width - legendPadding * 2, 0);
                legendBBox = legendGroup.getBBox();

                legendGroup.translationX = (width - legendBBox.width) / 2 - legendBBox.x;
                legendGroup.translationY = captionAutoPadding + height - legendBBox.height - legendBBox.y - legendPadding;

                if (legendAutoPadding.bottom !== legendBBox.height) {
                    legendAutoPadding.bottom = legendBBox.height;
                    this.layoutPending = true;
                }
                break;

            case 'top':
                legend.performLayout(width - legendPadding * 2, 0);
                legendBBox = legendGroup.getBBox();

                legendGroup.translationX = (width - legendBBox.width) / 2 - legendBBox.x;
                legendGroup.translationY = captionAutoPadding + legendPadding - legendBBox.y;

                if (legendAutoPadding.top !== legendBBox.height) {
                    legendAutoPadding.top = legendBBox.height;
                    this.layoutPending = true;
                }
                break;

            case 'left':
                legend.performLayout(0, height - legendPadding * 2);
                legendBBox = legendGroup.getBBox();

                legendGroup.translationX = legendPadding - legendBBox.x;
                legendGroup.translationY = captionAutoPadding + (height - legendBBox.height) / 2 - legendBBox.y;

                if (legendAutoPadding.left !== legendBBox.width) {
                    legendAutoPadding.left = legendBBox.width;
                    this.layoutPending = true;
                }
                break;

            default: // case 'right':
                legend.performLayout(0, height - legendPadding * 2);
                legendBBox = legendGroup.getBBox();

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

        this.legendBBox = legendBBox;
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
        series: Series<Chart>,
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
        series: Series<Chart>,
        node: Shape
    };

    private readonly onMouseMove = (event: MouseEvent) => {
        const x = event.offsetX;
        const y = event.offsetY;

        const pick = this.pickSeriesNode(x, y);
        if (pick) {
            const node = pick.node;
            if (node instanceof Shape) {
                if (!this.lastPick) { // cursor moved from empty space to a node
                    this.onSeriesNodePick(event, pick.series, node);
                } else {
                    if (this.lastPick.node !== node) { // cursor moved from one node to another
                        this.onSeriesNodePick(event, pick.series, node);
                    } else { // cursor moved within the same node
                        if (pick.series.tooltipEnabled) {
                            this.showTooltip(event);
                        }
                    }
                }
            }
        } else if (this.lastPick) { // cursor moved from a node to empty space
            this.lastPick.series.dehighlightNode();
            this.hideTooltip();
            this.lastPick = undefined;
        }
    }

    private readonly onMouseOut = (event: MouseEvent) => {
        this.toggleTooltip(false);
    }

    private readonly onClick = (event: MouseEvent) => {
        const x = event.offsetX;
        const y = event.offsetY;

        const datum = this.legend.datumForPoint(x, y);
        if (datum) {
            const {id, itemId, enabled} = datum;
            const series = find(this.series, series => series.id === id);

            if (series) {
                series.toggleSeriesItem(itemId, !enabled);
            }
        }
    }

    private onSeriesNodePick(event: MouseEvent, series: Series<Chart>, node: Shape) {
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
        const tooltipRect = this.tooltipRect = el.getBoundingClientRect();

        let left = event.pageX + offset[0];
        const top = event.pageY + offset[1];

        if (tooltipRect && parent && parent.parentElement) {
            if (left - pageXOffset + tooltipRect.width > parent.parentElement.offsetWidth) {
                left -= tooltipRect.width + offset[0];
            }
        }
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
    }

    private hideTooltip() {
        this.toggleTooltip(false);
    }
}
