import { Scene } from "../scene/scene";
import { Series } from "./series/series";
import { Padding } from "../util/padding";
import { Node } from "../scene/node";
import { Rect } from "../scene/shape/rect";
import { Legend } from "./legend";
import { Caption } from "../caption";
import { Observable } from "../util/observable";
import { ChartAxis } from "./chartAxis";
export declare abstract class Chart extends Observable {
    readonly id: string;
    readonly scene: Scene;
    readonly background: Rect;
    readonly legend: Legend;
    protected legendAutoPadding: Padding;
    protected captionAutoPadding: number;
    private tooltipElement;
    static readonly defaultTooltipClass = "ag-chart-tooltip";
    tooltipOffset: [number, number];
    private _container;
    set container(value: HTMLElement | undefined);
    get container(): HTMLElement | undefined;
    private _data;
    set data(data: any[]);
    get data(): any[];
    private pendingSize?;
    set width(value: number);
    get width(): number;
    set height(value: number);
    get height(): number;
    protected _autoSize: boolean;
    set autoSize(value: boolean);
    get autoSize(): boolean;
    download(fileName?: string): void;
    padding: Padding;
    title?: Caption;
    subtitle?: Caption;
    private static tooltipDocuments;
    protected constructor(document?: Document);
    destroy(): void;
    private readonly onLayoutChange;
    private readonly onLegendPositionChange;
    protected _element: HTMLElement;
    get element(): HTMLElement;
    abstract get seriesRoot(): Node;
    protected _axes: ChartAxis[];
    set axes(values: ChartAxis[]);
    get axes(): ChartAxis[];
    protected _series: Series[];
    set series(values: Series[]);
    get series(): Series[];
    private readonly scheduleLayout;
    private readonly scheduleData;
    addSeries(series: Series, before?: Series): boolean;
    protected initSeries(series: Series): void;
    protected freeSeries(series: Series): void;
    addSeriesAfter(series: Series, after?: Series): boolean;
    removeSeries(series: Series): boolean;
    removeAllSeries(): void;
    protected assignSeriesToAxes(): void;
    protected assignAxesToSeries(force?: boolean): void;
    private findMatchingAxis;
    protected _axesChanged: boolean;
    protected set axesChanged(value: boolean);
    protected get axesChanged(): boolean;
    protected _seriesChanged: boolean;
    protected set seriesChanged(value: boolean);
    protected get seriesChanged(): boolean;
    protected layoutCallbackId: number;
    set layoutPending(value: boolean);
    /**
     * Only `true` while we are waiting for the layout to start.
     * This will be `false` if the layout has already started and is ongoing.
     */
    get layoutPending(): boolean;
    private readonly _performLayout;
    private dataCallbackId;
    set dataPending(value: boolean);
    get dataPending(): boolean;
    processData(): void;
    readonly updateLegend: () => void;
    abstract performLayout(): void;
    protected positionCaptions(): void;
    protected positionLegend(): void;
    private setupListeners;
    private cleanupListeners;
    private pickSeriesNode;
    private lastPick?;
    private readonly onMouseMove;
    private readonly onMouseOut;
    private readonly onClick;
    private onSeriesNodePick;
    private _tooltipClass;
    set tooltipClass(value: string);
    get tooltipClass(): string;
    private toggleTooltip;
    /**
     * Shows tooltip at the given event's coordinates.
     * If the `html` parameter is missing, moves the existing tooltip to the new position.
     */
    private showTooltip;
    private hideTooltip;
}
