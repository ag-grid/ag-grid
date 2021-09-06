import { Group } from '../scene/group';
import { Scene } from '../scene/scene';
import { Observable } from '../util/observable';
import { createId } from "../util/id";
import { Padding } from '../util/padding';
import { defaultTooltipCss } from './defaultTooltipCss';
import { isNumber } from './util';
import { SparklineTooltip } from './sparklineTooltip';
import { HighlightStyle } from "@ag-grid-community/core";

export interface SeriesNodeDatum {
    readonly seriesDatum: any;
    readonly point?: Point;
}
export interface Point {
    readonly x: number;
    readonly y: number;
}

interface SeriesRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

type Container = HTMLElement | undefined | null;
type Data = number[]  | undefined | null;

export class SparklineAxis extends Observable {
    stroke: string = 'rgb(204, 214, 235)';
    strokeWidth: number = 1;
}
export abstract class Sparkline extends Observable {

    readonly id: string = createId(this);

    readonly scene: Scene;
    readonly canvasElement: HTMLCanvasElement;
    readonly rootGroup: Group;

    readonly tooltip: SparklineTooltip;
    static readonly defaultTooltipClass = 'ag-sparkline-tooltip';

    private static tooltipDocuments: Document[] = [];
    private static tooltipInstances: Map<Document, SparklineTooltip> = new Map();

    protected seriesRect: SeriesRect = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };

    private _container: Container = undefined;
    set container(value: Container) {
        if (this._container !== value) {
            const { parentNode } = this.canvasElement;

            if (parentNode != null) {
                parentNode.removeChild(this.canvasElement);
            }

            if (value) {
                value.appendChild(this.canvasElement);
            }

            this._container = value;
        }
    }
    get container(): Container {
        return this._container;
    }

    private _data: Data = undefined;
    set data(value: Data) {
        if (this._data !== value) {
            this._data = value;
            this.processData();
        }
    }
    get data() {
        return this._data;
    }

    title?: string = undefined;
    padding: Padding = new Padding(3);

    readonly axis = new SparklineAxis();
    readonly highlightStyle: HighlightStyle = {
        size: 6,
        fill: 'yellow',
        stroke: 'yellow',
        strokeWidth: 0
    }

    protected constructor(document = window.document) {
        super();

        const root = new Group();
        this.rootGroup = root;

        const element = document.createElement('div');
        element.setAttribute('class', 'ag-sparkline-wrapper');

        const scene = new Scene(document);
        this.scene = scene;
        this.canvasElement = scene.canvas.element;
        scene.root = root;
        scene.container = element;
        scene.resize(this.width, this.height);

        this.seriesRect.width = this.width;
        this.seriesRect.height = this.height;

        // one tooltip instance per document
        if (Sparkline.tooltipDocuments.indexOf(document) === -1) {
            const styleElement = document.createElement('style');
            styleElement.innerHTML = defaultTooltipCss;

            document.head.insertBefore(styleElement, document.head.querySelector('style'));
            Sparkline.tooltipDocuments.push(document);

            this.tooltip = new SparklineTooltip(this);

            Sparkline.tooltipInstances.set(document, this.tooltip);
        } else {
            this.tooltip = Sparkline.tooltipInstances.get(document)!;
        }

        this.setupDomEventListeners(this.scene.canvas.element);
    }

    private _width: number = 100;
    set width(value: number) {
        if (this._width !== value) {
            this._width = value;
            this.scene.resize(value, this.height);
            this.scheduleLayout();
        }
    }
    get width(): number {
        return this._width;
    }

    private _height: number = 100;
    set height(value: number) {
        if (this._height !== value) {
            this._height = value;
            this.scene.resize(this.width, value);
            this.scheduleLayout();
        }
    }
    get height(): number {
        return this._height;
    }

    protected yData: (number | undefined)[] = [];
    protected xData: (number | undefined)[] = [];

    /**
     * Update x/y scales based on processed data.
     * Generate node data from processed data.
     * Produce data joins.
     * Update selection's nodes using node data.
     */
    protected update() { }

    // Using processed data, generate data that backs visible nodes.
    protected generateNodeData(): { nodeData: SeriesNodeDatum[], areaData: SeriesNodeDatum[] } | SeriesNodeDatum[] | undefined { return []; }

    // Returns persisted node data associated with the sparkline's data.
    protected getNodeData(): readonly SeriesNodeDatum[] { return []; }

    /**
     * Each sparkline is expected to have its own logic to efficiently update its nodes
     * on hightlight changes.
     * @param closestDatum
     */
    protected highlightDatum(closestDatum: SeriesNodeDatum) { }

    /**
     * Each sparkline is expected to have its own logic to efficiently update its nodes
     * on hightlight changes.
     */
    protected dehighlightDatum() { }

    abstract getTooltipHtml(datum: SeriesNodeDatum): string | undefined;

    /**
     * Highlight closest datum and display tooltip if enabled.
     * @param event
     */
    private onMouseMove(event: MouseEvent) {
        const closestDatum: SeriesNodeDatum | undefined = this.pickClosestSeriesNodeDatum(event.offsetX, event.offsetY);

        if (!closestDatum) {
            return;
        }

        this.highlightDatum(closestDatum);

        if (this.tooltip.enabled) {
            this.handleTooltip(closestDatum);
        }
    }

    /**
     * Dehighlight all nodes and remove tooltip.
     * @param event
     */
    private onMouseOut(event: MouseEvent) {
        this.dehighlightDatum();
        this.tooltip.toggle(false);
    }

    // Fetch required values from the data object and process them.
    private processData() {
        const { data, yData, xData } = this;

        if (!data) {
            return;
        }

        yData.length = 0;
        xData.length = 0;

        for (let i = 0, n = data.length; i < n; i++) {
            const y = data[i];
            const yDatum = this.getYDatum(y);
            yData.push(yDatum);
            xData.push(i);
        }

        this.scheduleLayout();
    }

    /**
    * Return the given value if it is a number, otherwise return `undefined`.
    * @param y
    */
    private getYDatum(y: any): number | undefined {
        const noDatum = !isNumber(y);
        return noDatum ? undefined : y;
    }

    /**
    * Return the minimum and maximum value in the given iterable using natural order.
    * If the iterable contains no comparable values, return `undefined`.
    * @param values
    */
    protected findMinAndMax(values: (number | undefined)[]): [number, number] | undefined {
        const n = values.length;
        let value;
        let i = -1;
        let min;
        let max;

        while (++i < n) {
            if ((value = values[i]) != undefined) {
                min = max = value;
                while (++i < n) {
                    if ((value = values[i]) != undefined) {
                        if (value < min) {
                            min = value;
                        }
                        if (value > max) {
                            max = value;
                        }
                    }
                }
            }

        }

        return typeof min === 'undefined' || typeof max === 'undefined' ? undefined : [min, max];
    }

    private layoutId: number = 0;

    /**
     * Only `true` while we are waiting for the layout to start.
     * This will be `false` if the layout has already started and is ongoing.
     */
    get layoutScheduled(): boolean {
        return !!this.layoutId;
    }

    /**
     * Execute update method on the next available screen repaint to make changes to the canvas.
     * If we are waiting for a layout to start and a new layout is requested,
     * cancel the previous layout using the non 0 integer (this.layoutId) returned from requestAnimationFrame.
     */
    protected scheduleLayout() {
        if (this.layoutId) {
            cancelAnimationFrame(this.layoutId);
        }
        this.layoutId = requestAnimationFrame(() => {
            const { width, height, padding, seriesRect, rootGroup } = this;

            const shrunkWidth = width - padding.left - padding.right;
            const shrunkHeight = height - padding.top - padding.bottom;

            seriesRect.width = shrunkWidth;
            seriesRect.height = shrunkHeight;
            seriesRect.x = padding.left;
            seriesRect.y = padding.top;

            rootGroup.translationX = seriesRect.x;
            rootGroup.translationY = seriesRect.y;

            this.update();

            this.layoutId = 0;
        })
    }

    /**
     * Return the closest data point to x/y canvas coordinates.
     * @param x
     * @param y
     */
    private pickClosestSeriesNodeDatum(x: number, y: number): SeriesNodeDatum | undefined {
        function getDistance(p1: Point, p2: Point): number {
            return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
        }

        let minDistance = Infinity;
        let closestDatum: SeriesNodeDatum | undefined;
        const hitPoint = this.rootGroup.transformPoint(x, y);

        this.getNodeData().forEach(datum => {
            if (!datum.point) {
                return;
            }
            const distance = getDistance(hitPoint, datum.point);
            if (distance < minDistance) {
                minDistance = distance;
                closestDatum = datum;
            }
        });

        return closestDatum;
    }

    /**
     * calculate x/y coordinates for tooltip based on coordinates of highlighted datum, position of canvas and page offset.
     * @param datum
     */
    private handleTooltip(datum: SeriesNodeDatum): void {
        const { seriesDatum } = datum;
        const { canvasElement } = this;
        const canvasRect = canvasElement.getBoundingClientRect();
        const { pageXOffset, pageYOffset } = window;
        // pickClosestSeriesNodeDatum only returns datum with point
        const point = this.rootGroup.inverseTransformPoint(datum.point!.x, datum.point!.y);

        const meta = {
            pageX: (point.x + canvasRect.left + pageXOffset),
            pageY: (point.y + canvasRect.top + pageYOffset)
        }

        const html = this.tooltip.enabled && seriesDatum.y !== undefined && this.getTooltipHtml(datum);

        if (html) {
            this.tooltip.show(meta, html);
        }
    }

    protected formatDatum(datum: any): string {
        return datum.toFixed(1);
    }

    private _onMouseMove = this.onMouseMove.bind(this);
    private _onMouseOut = this.onMouseOut.bind(this);

    private setupDomEventListeners(chartElement: HTMLCanvasElement): void {
        chartElement.addEventListener('mousemove', this._onMouseMove);
        chartElement.addEventListener('mouseout', this._onMouseOut);
    }

    private cleanupDomEventListerners(chartElement: HTMLCanvasElement): void {
        chartElement.removeEventListener('mousemove', this._onMouseMove);
        chartElement.removeEventListener('mouseout', this._onMouseOut);
    }

    /**
     * Cleanup and remove canvas element from the DOM.
     */
    destroy() {
        this.tooltip.destroy();
        // remove tooltip instance
        Sparkline.tooltipInstances.delete(document);
        // remove document from documents list
        Sparkline.tooltipDocuments = Sparkline.tooltipDocuments.filter(d => d !== document);
        this.scene.container = undefined;
        // remove canvas element from the DOM
        this.container = undefined;
        this.cleanupDomEventListerners(this.scene.canvas.element);
    }

    /**
     * @returns this.scene.canvas.element
     */
    public getCanvasElement(): HTMLCanvasElement {
        return this.canvasElement;
    }
}