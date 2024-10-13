import { _Scale, _Scene, _Util } from 'ag-charts-community';

import type { HighlightStyleOptions } from 'ag-grid-community';
import { _error } from 'ag-grid-community';

import type { SparklineFactoryOptions } from './agSparkline';
import { defaultTooltipCss } from './tooltip/defaultTooltipCss';
import type { SparklineTooltip, SparklineTooltipMeta } from './tooltip/sparklineTooltip';

const { extent, isNumber, isString, isStringObject, isDate, createId, Padding } = _Util;
const { LinearScale, BandScale, TimeScale } = _Scale;
const { Transformable } = _Scene;

/**
 * Constants to declare the expected nominal zIndex for nodes in a sparkline rendering.
 */
export enum ZINDICIES {
    SERIES_FILL_ZINDEX = 50,
    AXIS_LINE_ZINDEX = 500,
    SERIES_STROKE_ZINDEX = 1000,
    SERIES_LABEL_ZINDEX = 1500,
    CROSSHAIR_ZINDEX = 2000,
    SERIES_MARKERS_ZINDEX = 2500,
}

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
type Data = any[] | undefined | null;
type DataType = 'number' | 'array' | 'object' | undefined;
type AxisType = 'number' | 'category' | 'time';
type ScaleType = _Scale.LinearScale | _Scale.TimeScale | _Scale.BandScale<string>;

export class SparklineAxis {
    type?: AxisType = 'category';
    stroke: string = 'rgb(204, 214, 235)';
    strokeWidth: number = 1;
}

const tooltipDocuments: Document[] = [];

export abstract class Sparkline {
    readonly id: string = createId(this);

    processedOptions?: SparklineFactoryOptions;

    readonly scene: _Scene.Scene;
    readonly canvasElement: HTMLCanvasElement;
    readonly rootGroup: _Scene.TranslatableGroup;
    // Only one tooltip instance for all sparkline instances.
    tooltip!: SparklineTooltip;

    private mouseMoveEvent: MouseEvent;

    protected seriesRect: SeriesRect = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    };

    private _context: { data: any } | undefined = undefined;
    set context(value: { data: any } | undefined) {
        if (this._context !== value) {
            this._context = value;
        }
    }
    get context(): { data: any } | undefined {
        return this._context;
    }

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
            if (this.mouseMoveEvent && this.highlightedDatum) {
                this.updateHitPoint(this.mouseMoveEvent);
            }
        }
    }
    get data() {
        return this._data;
    }

    padding: _Util.Padding = new Padding(3);

    xKey: string = 'x';
    yKey: string = 'y';

    protected dataType: DataType = undefined;
    protected xData: any[] = [];
    protected yData: (number | undefined)[] = [];

    // Minimum y value in provided data.
    protected min: number | undefined = undefined;
    // Maximum y value in provided data.
    protected max: number | undefined = undefined;

    protected xScale!: any;
    protected yScale: _Scale.LinearScale = new LinearScale();

    readonly axis = new SparklineAxis();
    readonly highlightStyle: HighlightStyleOptions = {
        size: 6,
        fill: 'yellow',
        stroke: 'silver',
        strokeWidth: 1,
    };

    protected constructor() {
        const root = new _Scene.TranslatableGroup();
        this.rootGroup = root;

        const element = document.createElement('div');
        element.setAttribute('class', 'ag-sparkline-wrapper');

        // initialise scene
        const scene = new _Scene.Scene({});
        this.scene = scene;
        this.canvasElement = scene.canvas.element;

        // set scene properties
        scene.setRoot(root);
        scene.setContainer(element);

        this.resizeAndSetDimensions(this.width, this.height);

        // one style element for tooltip styles per document
        if (!tooltipDocuments.includes(document)) {
            this.initialiseTooltipStyles();
        }

        this.setupDomEventListeners(this.canvasElement);
    }

    private resizeAndSetDimensions(width: number, height: number): void {
        this.scene.resize(width, height);
        this.seriesRect.width = width;
        this.seriesRect.height = height;
    }

    private initialiseTooltipStyles(): void {
        const styleElement = document.createElement('style');
        styleElement.innerHTML = defaultTooltipCss;
        document.head.insertBefore(styleElement, document.head.querySelector('style'));
        tooltipDocuments.push(document);
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

    /**
     * Generate node data from processed data.
     * Produce data joins.
     * Update selection's nodes using node data.
     */
    protected update() {}

    // Update y scale based on processed data.
    protected updateYScale(): void {
        this.updateYScaleRange();
        this.updateYScaleDomain();
    }

    // Update y scale domain based on processed data.
    protected updateYScaleDomain() {}

    // Update y scale range based on height and padding (seriesRect).
    protected updateYScaleRange(): void {
        const { yScale, seriesRect } = this;
        yScale.range = [seriesRect.height, 0];
    }

    // Update x scale based on processed data.
    protected updateXScale(): void {
        const { type } = this.axis;

        this.xScale = this.getXScale(type);

        this.updateXScaleRange();
        this.updateXScaleDomain();
    }

    // Update x scale range based on width and padding (seriesRect).
    protected updateXScaleRange(): void {
        this.xScale.range = [0, this.seriesRect.width];
    }

    // Update x scale domain based on processed data and type of scale.
    protected updateXScaleDomain(): void {
        const { xData, xScale } = this;

        let xMinMax;
        if (xScale instanceof LinearScale || xScale instanceof TimeScale) {
            xMinMax = extent(xData);
        }

        this.xScale.domain = xMinMax ? xMinMax.slice() : xData;
    }

    /**
     * Return xScale instance based on the provided type or return a `BandScale` by default.
     * The default type is `category`.
     * @param type
     */
    protected getXScale(type: AxisType = 'category'): ScaleType {
        switch (type) {
            case 'number':
                return new LinearScale();
            case 'time':
                return new TimeScale();
            case 'category':
            default:
                return new BandScale();
        }
    }

    // Update axis line.
    protected updateAxisLine(): void {}

    // Update X and Y scales and the axis line.
    protected updateAxes(): void {
        this.updateYScale();
        this.updateXScale();
        this.updateAxisLine();
    }

    // Update horizontal and vertical crosshair lines.
    protected updateCrosshairs(): void {
        this.updateXCrosshairLine();
        this.updateYCrosshairLine();
    }

    // Using processed data, generate data that backs visible nodes.
    protected generateNodeData():
        | { nodeData: SeriesNodeDatum[]; fillData: SeriesNodeDatum[]; strokeData: SeriesNodeDatum[] }
        | SeriesNodeDatum[]
        | undefined {
        return [];
    }

    // Returns persisted node data associated with the sparkline's data.
    protected getNodeData(): readonly SeriesNodeDatum[] {
        return [];
    }

    // Update the selection's nodes.
    protected updateNodes(): void {}

    // Update the vertical crosshair line.
    protected updateXCrosshairLine(): void {}

    // Update the horizontal crosshair line.
    protected updateYCrosshairLine(): void {}

    // Efficiently update sparkline nodes on hightlight changes.
    protected highlightedDatum?: SeriesNodeDatum;
    protected highlightDatum(closestDatum: SeriesNodeDatum): void {
        this.updateNodes();
    }

    protected dehighlightDatum(): void {
        this.highlightedDatum = undefined;
        this.updateNodes();
        this.updateCrosshairs();
    }

    abstract getTooltipHtml(datum: SeriesNodeDatum): string | undefined;

    /**
     * Highlight closest datum and display tooltip if enabled.
     * Only update if necessary, i.e. only update if the highlighted datum is different from previously highlighted datum,
     * or if there is no previously highlighted datum.
     * @param event
     */
    private onMouseMove(event: MouseEvent) {
        this.mouseMoveEvent = event;
        this.updateHitPoint(event);
    }

    private renderScene() {
        this.scene.render().catch((e) => _error(105, { e }));
    }

    private updateHitPoint(event: MouseEvent) {
        const closestDatum: SeriesNodeDatum | undefined = this.pickClosestSeriesNodeDatum(event.offsetX, event.offsetY);

        if (!closestDatum) {
            return;
        }

        const oldHighlightedDatum = this.highlightedDatum;
        this.highlightedDatum = closestDatum;

        if (
            (this.highlightedDatum && !oldHighlightedDatum) ||
            (this.highlightedDatum && oldHighlightedDatum && this.highlightedDatum !== oldHighlightedDatum)
        ) {
            this.highlightDatum(closestDatum);
            this.updateCrosshairs();
            this.renderScene();
        }

        const tooltipEnabled = this.processedOptions?.tooltip?.enabled ?? true;
        if (tooltipEnabled) {
            this.handleTooltip(event, closestDatum);
        }
    }

    /**
     * Dehighlight all nodes and remove tooltip.
     * @param event
     */
    private onMouseOut(event: MouseEvent) {
        this.dehighlightDatum();
        this.tooltip.toggle(false);
        this.renderScene();
    }

    protected smallestInterval?: { x: number; y: number } = undefined;
    // Fetch required values from the data object and process them.
    private processData() {
        const { data, yData, xData } = this;

        if (!data || this.invalidData(this.data)) {
            return;
        }

        yData.length = 0;
        xData.length = 0;

        const n = data.length;

        const dataType = this.getDataType(data);
        this.dataType = dataType;

        const { type: xValueType } = this.axis;
        const xType = xValueType !== 'number' && xValueType !== 'time' ? 'category' : xValueType;

        const isContinuousX = xType === 'number' || xType === 'time';

        const setSmallestXInterval = (curr: number, prev: number) => {
            if (this.smallestInterval == undefined) {
                this.smallestInterval = { x: Infinity, y: Infinity };
            }
            const { x } = this.smallestInterval;

            const interval = Math.abs(curr - prev);
            if (interval > 0 && interval < x) {
                this.smallestInterval.x = interval;
            }
        };

        let prevX;

        if (dataType === 'number') {
            for (let i = 0; i < n; i++) {
                const xDatum = i;
                const yDatum = data[i];

                const x = this.getDatum(xDatum, xType);
                const y = this.getDatum(yDatum, 'number');

                if (isContinuousX) {
                    setSmallestXInterval(x, prevX);
                }

                xData.push(x);
                yData.push(y);

                prevX = x;
            }
        } else if (dataType === 'array') {
            for (let i = 0; i < n; i++) {
                const datum = data[i];
                if (Array.isArray(datum)) {
                    const xDatum = datum[0];
                    const yDatum = datum[1];

                    const x = this.getDatum(xDatum, xType);
                    const y = this.getDatum(yDatum, 'number');

                    if (x == undefined) {
                        continue;
                    }

                    if (isContinuousX) {
                        setSmallestXInterval(x, prevX);
                    }

                    xData.push(x);
                    yData.push(y);

                    prevX = x;
                }
            }
        } else if (dataType === 'object') {
            const { yKey, xKey } = this;

            for (let i = 0; i < n; i++) {
                const datum = data[i];

                if (typeof datum === 'object' && !Array.isArray(datum)) {
                    const xDatum = datum[xKey];
                    const yDatum = datum[yKey];

                    const x = this.getDatum(xDatum, xType);
                    const y = this.getDatum(yDatum, 'number');

                    if (x == undefined) {
                        continue;
                    }

                    if (isContinuousX) {
                        setSmallestXInterval(x, prevX);
                    }

                    xData.push(x);
                    yData.push(y);

                    prevX = x;
                }
            }
        }

        this.updateAxes();
        this.immediateLayout();
    }

    /**
     * Return the type of data provided to the sparkline based on the first truthy value in the data array.
     * If the value is not a number, array or object, return `undefined`.
     * @param data
     */
    private getDataType(data: any): DataType {
        for (const datum of data) {
            if (datum != undefined) {
                if (isNumber(datum)) {
                    return 'number';
                } else if (Array.isArray(datum)) {
                    return 'array';
                } else if (typeof datum === 'object') {
                    return 'object';
                }
            }
        }
    }

    /**
     * Return the given value depending on the type of axis.
     * Return `undefined` if the value is invalid for the given axis type.
     * @param value
     */
    private getDatum(value: any, type: AxisType): any {
        if ((type === 'number' && isNumber(value)) || (type === 'time' && (isNumber(value) || isDate(value)))) {
            return value;
        } else if (type === 'category') {
            if (isString(value) || isDate(value) || isNumber(value)) {
                return { toString: () => String(value) };
            } else if (isStringObject(value)) {
                return value;
            }
        }
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
            this.immediateLayout();

            this.layoutId = 0;
        });
    }

    private immediateLayout() {
        this.setSparklineDimensions();

        if (this.invalidData(this.data)) {
            return;
        }

        // update axes ranges
        this.updateXScaleRange();
        this.updateYScaleRange();

        // update axis line
        this.updateAxisLine();

        // produce data joins and update selection's nodes
        this.update();

        this.renderScene();
    }

    private setSparklineDimensions() {
        const { width, height, padding, seriesRect, rootGroup } = this;
        const shrunkWidth = width - padding.left - padding.right;
        const shrunkHeight = height - padding.top - padding.bottom;

        seriesRect.width = shrunkWidth;
        seriesRect.height = shrunkHeight;
        seriesRect.x = padding.left;
        seriesRect.y = padding.top;

        rootGroup.translationX = seriesRect.x;
        rootGroup.translationY = seriesRect.y;
    }

    /**
     * Return the closest data point to x/y canvas coordinates.
     * @param x
     * @param y
     */
    private pickClosestSeriesNodeDatum(x: number, y: number): SeriesNodeDatum | undefined {
        let minDistance = Infinity;
        let closestDatum: SeriesNodeDatum | undefined;
        const hitPoint = Transformable.fromCanvasPoint(this.rootGroup, x, y);
        const nodeData = this.getNodeData();

        for (let i = 0; i < nodeData.length; i++) {
            const datum = nodeData[i];

            if (!datum.point) {
                return;
            }
            const distance = this.getDistance(hitPoint, datum.point);
            if (distance <= minDistance) {
                minDistance = distance;
                closestDatum = datum;
            }
        }

        return closestDatum;
    }

    /**
     * Return the relevant distance between two points.
     * The distance will be calculated based on the x value of the points for all sparklines except bar sparkline, where the distance is based on the y values.
     * @param x
     * @param y
     */
    protected getDistance(p1: Point, p2: Point): number {
        return Math.abs(p1.x - p2.x);
    }

    /**
     * calculate x/y coordinates for tooltip based on coordinates of highlighted datum, position of canvas and page offset.
     * @param datum
     */
    private handleTooltip(event: MouseEvent, datum: SeriesNodeDatum): void {
        const { seriesDatum } = datum;
        const { canvasElement } = this;
        const { clientX, clientY } = event;

        const tooltipOptions = this.processedOptions?.tooltip;
        const meta: SparklineTooltipMeta = {
            pageX: clientX,
            pageY: clientY,
            position: {
                xOffset: tooltipOptions?.xOffset,
                yOffset: tooltipOptions?.yOffset,
            },
            container: tooltipOptions?.container,
        };

        // confine tooltip to sparkline width if tooltip container not provided.
        if (meta.container == undefined) {
            meta.container = canvasElement;
        }

        const yValue = seriesDatum.y;
        const xValue = seriesDatum.x;

        // check if tooltip is enabled for this specific data point
        let enabled = tooltipOptions?.enabled ?? true;

        const tooltipRenderer = tooltipOptions?.renderer;
        if (tooltipRenderer) {
            const tooltipRendererResult = tooltipRenderer({
                context: this.context,
                datum: seriesDatum,
                yValue,
                xValue,
            });
            enabled =
                typeof tooltipRendererResult !== 'string' && tooltipRendererResult.enabled !== undefined
                    ? tooltipRendererResult.enabled
                    : enabled;
        }

        const html = enabled && seriesDatum.y !== undefined && this.getTooltipHtml(datum);

        if (html) {
            this.tooltip.show(meta, html);
        }
    }

    protected formatNumericDatum(datum: number): string {
        return String(Math.round(datum * 10) / 10);
    }

    private defaultDateFormatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    } as any);

    // locale.format('%m/%d/%y, %H:%M:%S');

    protected formatDatum(datum: any): string {
        const type = this.axis.type || 'category';

        if (type === 'number' && typeof datum === 'number') {
            return this.formatNumericDatum(datum);
        } else if (type === 'time' && (datum instanceof Date || isNumber(datum))) {
            return this.defaultDateFormatter.format(datum);
        } else {
            return String(datum);
        }
    }

    private _onMouseMove = this.onMouseMove.bind(this);
    private _onMouseOut = this.onMouseOut.bind(this);

    private setupDomEventListeners(chartElement: HTMLCanvasElement): void {
        chartElement.addEventListener('mousemove', this._onMouseMove);
        chartElement.addEventListener('mouseout', this._onMouseOut);
    }

    private cleanupDomEventListeners(chartElement: HTMLCanvasElement): void {
        chartElement.removeEventListener('mousemove', this._onMouseMove);
        chartElement.removeEventListener('mouseout', this._onMouseOut);
    }

    private invalidData(data: any) {
        return !data || !Array.isArray(data);
    }

    /**
     * Cleanup and remove canvas element from the DOM.
     */
    public destroy(): void {
        this.cleanupDomEventListeners(this.canvasElement);
        this.scene.destroy();
        // remove canvas element from the DOM
        this.container = undefined;
    }
}
