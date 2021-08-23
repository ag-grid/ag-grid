import { Group } from '../scene/group';
import { Scene } from '../scene/scene';
import { Observable, reactive } from '../util/observable';
import { createId } from "../util/id";
import { Padding } from '../util/padding';
import { defaultTooltipCss } from './defaultTooltipCss';
import { MiniChartTooltip } from './miniChartTooltip';
import { isNumber } from './util';

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
class MiniChartAxis extends Observable {
    @reactive('update') stroke: string = 'rgb(204, 214, 235)';
    @reactive('update') strokeWidth: number = 1;
}
export abstract class MiniChart extends Observable {

    readonly id: string = createId(this);
    
    readonly scene: Scene;
    readonly canvasElement: HTMLCanvasElement;
    readonly rootGroup: Group;

    readonly tooltip: MiniChartTooltip;
    static readonly defaultTooltipClass = 'ag-sparkline-tooltip';

    private static tooltipDocuments: Document[] = [];
    private static tooltipInstances: Map<Document, MiniChartTooltip> = new Map();

    protected seriesRect: SeriesRect = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };

    private _container: HTMLElement | undefined | null = undefined;
    set container(value: HTMLElement | undefined | null) {
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
    get container(): HTMLElement | undefined | null {
        return this._container;
    }

    @reactive() data?: number[] = undefined;
    @reactive() title?: string = undefined;
    @reactive() padding: Padding = new Padding(3);

    readonly axis = new MiniChartAxis();
    readonly highlightStyle = {
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
        if (MiniChart.tooltipDocuments.indexOf(document) === -1) {
            const styleElement = document.createElement('style');
            styleElement.innerHTML = defaultTooltipCss;
        
            document.head.insertBefore(styleElement, document.head.querySelector('style'));
            MiniChart.tooltipDocuments.push(document);
        
            this.tooltip = new MiniChartTooltip(this);
            this.tooltip.addEventListener('class', () => this.tooltip.toggle());
        
            MiniChart.tooltipInstances.set(document, this.tooltip);
        } else {
            this.tooltip = MiniChart.tooltipInstances.get(document)!;
        }

        this.addPropertyListener('data', this.processData, this);
        this.addPropertyListener('padding', this.scheduleLayout, this);
        this.axis.addEventListener('update', this.scheduleLayout, this);
        this.tooltip.addEventListener('change', this.update, this);

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

    protected update() { }
    // hmm
    protected generateNodeData(): { nodeData: SeriesNodeDatum[], areaData: SeriesNodeDatum[] } | SeriesNodeDatum[] | undefined { return []; }
    protected getNodeData(): readonly SeriesNodeDatum[] { return []; }
    protected highlightDatum(closestDatum: SeriesNodeDatum) { }
    protected dehighlightDatum() { }
    abstract getTooltipHtml(datum: SeriesNodeDatum): string | undefined;

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

    private onMouseOut(event: MouseEvent) {
        this.dehighlightDatum();
        this.tooltip.toggle(false);
    }

    private processData() {
        const { data, yData, xData } = this;

        if (!data) {
            return;
        };

        yData.length = 0;
        xData.length = 0;

        for (let i = 0, n = data.length; i < n; i++) {
            const y = data[i];
            const yDatum = this.getYDatum(y);
            yData.push(yDatum);
            xData.push(i);
        }

        this.update();
    }

    private getYDatum(y: any): number | undefined {
        const noDatum = !isNumber(y);
        return noDatum ? undefined : y;
    }

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
    get layoutScheduled(): boolean {
        return !!this.layoutId;
    }

    protected scheduleLayout() {
        if (this.layoutId) {
            cancelAnimationFrame(this.layoutId);
        }
        this.layoutId = requestAnimationFrame(() => {
            const { width, height, padding } = this;
            const shrunkWidth = width - padding.left - padding.right;
            const shrunkHeight = height - padding.top - padding.bottom;

            this.seriesRect.width = shrunkWidth;
            this.seriesRect.height = shrunkHeight;
            this.seriesRect.x = padding.left;
            this.seriesRect.y = padding.top;

            this.update();

            this.layoutId = 0;
        })
    }

    private pickClosestSeriesNodeDatum(x: number, y: number): SeriesNodeDatum | undefined {
        type Point = {
            x: number,
            y: number
        }

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

    protected formatDatum(datum: any) : string {
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

    protected destroy() {
        this.tooltip.destroy();
        // remove tooltip instance
        MiniChart.tooltipInstances.delete(document);
        // remove document from documents list
        MiniChart.tooltipDocuments = MiniChart.tooltipDocuments.filter(d => d !== document);
        this.scene.container = undefined;
        this.cleanupDomEventListerners(this.scene.canvas.element);
    }

    public getCanvasElement(): HTMLCanvasElement {
        return this.canvasElement;
    }
}