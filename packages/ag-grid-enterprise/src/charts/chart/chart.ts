import { Scene } from "../scene/scene";
import { Group } from "../scene/group";
import { Series, SeriesNodeDatum } from "./series/series";
import { Padding } from "../util/padding";
import { Shape } from "../scene/shape/shape";
import { Node } from "../scene/node";

export abstract class Chart<D, X, Y> {
    readonly scene: Scene = new Scene();

    tooltipElement = (() => {
        const div = document.createElement('div');
        div.style.border = '1px solid gray';
        div.style.font = '12px Verdana';
        div.style.padding = '7px';
        div.style.whiteSpace = 'no-wrap';
        div.style.background = 'rgba(244, 244, 244, 0.9)';
        div.style.boxShadow = '3px 3px 5px rgba(0, 0, 0, 0.3)';
        div.style.position = 'absolute';
        div.style.zIndex = '100';
        div.style.display = 'none';
        // div.classList.add('ag-tooltip');
        document.body.appendChild(div);
        return div;
    })();

    constructor(parent: HTMLElement = document.body) {
        this.scene.parent = parent;
        this.scene.root = new Group();
        this.setupListeners(this.scene.hdpiCanvas.canvas);
    }

    destroy() {
        const tooltipParent = this.tooltipElement.parentNode;
        if (tooltipParent) {
            tooltipParent.removeChild(this.tooltipElement);
        }
        this.cleanupListeners(this.scene.hdpiCanvas.canvas);
        this.scene.parent = null;
    }

    protected _padding: Padding = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
    };
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
            if (!this.layoutCallbackId) {
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
        this.performLayout();
    };

    abstract performLayout(): void;

    abstract get seriesRoot(): Node;

    protected _series: Series<D, X, Y>[] = [];
    set series(values: Series<D, X, Y>[]) {
        this._series = values;
    }
    get series(): Series<D, X, Y>[] {
        return this._series;
    }

    addSeries(series: Series<D, X, Y>, before: Series<D, X, Y> | null = null): boolean {
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
            this.layoutPending = true;
            return true;
        }

        return false;
    }

    removeSeries(series: Series<D, X, Y>): boolean {
        const index = this.series.indexOf(series);

        if (index >= 0) {
            this.series.splice(index, 1);
            series.chart = null;
            this.seriesRoot.removeChild(series.group);
            this.layoutPending = true;
            return true;
        }

        return false;
    }

    removeAllSeries(): void {
        this.series.forEach(series => {
            series.chart = null;
            this.seriesRoot.removeChild(series.group);
        });
        this._series = []; // using `_series` instead of `series` to prevent infinite recursion
        this.layoutPending = true;
    }

    private setupListeners(chartElement: HTMLCanvasElement) {
        chartElement.addEventListener('mousemove', this.onMouseMove);
        chartElement.addEventListener('mouseout', this.onMouseOut);
    }

    private cleanupListeners(chartElement: HTMLCanvasElement) {
        chartElement.removeEventListener('mousemove', this.onMouseMove);
        chartElement.removeEventListener('mouseout', this.onMouseMove);
    }

    private pickSeriesNode(x: number, y: number): {
        series: Series<D, X, Y>,
        node: Node
    } | undefined {
        const scene = this.scene;
        const allSeries = this.series;

        let node: Node | undefined = undefined;
        for (let i = allSeries.length - 1; i >= 0; i--) {
            const series = allSeries[i];
            node = scene.pickNode(series.group, x, y);
            if (node) {
                return {
                    series,
                    node
                };
            }
        }
    }

    private lastPick?: {
        series: Series<D, X, Y>,
        node: Shape,
        fillStyle: string | null // used to save the original fillStyle of the node,
                                 // to be restored when the highlight fillStyle is removed
    };

    private readonly onMouseMove = (event: MouseEvent) => {
        const x = event.offsetX;
        const y = event.offsetY;

        const pick = this.pickSeriesNode(x, y);
        if (pick) {
            const node = pick.node;
            if (node instanceof Shape) {
                if (!this.lastPick) {
                    this.lastPick = {
                        series: pick.series,
                        node,
                        fillStyle: node.fillStyle
                    };
                } else if (this.lastPick.node !== node) {
                    this.lastPick.node.fillStyle = this.lastPick.fillStyle;
                    this.lastPick = {
                        series: pick.series,
                        node,
                        fillStyle: node.fillStyle
                    };
                }
                node.fillStyle = 'yellow';
            }
        } else if (this.lastPick) {
            this.lastPick.node.fillStyle = this.lastPick.fillStyle;
            this.hideTooltip();
            this.lastPick = undefined;
        }

        if (this.lastPick) {
            const lastPick = this.lastPick;
            const datum = lastPick.node.datum as SeriesNodeDatum<D>;
            const html = lastPick.series.tooltip && lastPick.series.getTooltipHtml(datum);
            if (html) {
                this.showTooltip(html, event);
            }
        }
    };

    private readonly onMouseOut = (event: MouseEvent) => {
        this.tooltipElement.style.display = 'none';
    };

    tooltipOffset = [20, 20];

    showTooltip(html: string, event: MouseEvent) {
        if (!html) {
            return;
        }

        const el = this.tooltipElement;
        const offset = this.tooltipOffset;

        el.innerHTML = html;
        el.style.left = `${event.x + scrollX + offset[0]}px`;
        el.style.top = `${event.y + scrollY + offset[1]}px`;
        el.style.display = 'table';
    }

    hideTooltip() {
        this.tooltipElement.style.display = 'none';
    }
}
