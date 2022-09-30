import { Scene } from '../scene/scene';
import { Series, SeriesNodeDatum } from './series/series';
import { Padding } from '../util/padding';
import { Node } from '../scene/node';
import { Background } from './background';
import { Legend } from './legend';
import { BBox } from '../scene/bbox';
import { Caption } from '../caption';
import { Observable, SourceEvent } from '../util/observable';
import { ChartAxis } from './chartAxis';
import { PlacedLabel } from '../util/labelPlacement';
import { AgChartOptions } from './agChartOptions';
export interface ChartClickEvent extends SourceEvent<Chart> {
    event: MouseEvent;
}
export interface TooltipMeta {
    pageX: number;
    pageY: number;
    offsetX: number;
    offsetY: number;
    event: MouseEvent;
}
export interface TooltipRendererResult {
    content?: string;
    title?: string;
    color?: string;
    backgroundColor?: string;
}
export declare function toTooltipHtml(input: string | TooltipRendererResult, defaults?: TooltipRendererResult): string;
export declare class ChartTooltip extends Observable {
    chart: Chart;
    element: HTMLDivElement;
    private observer?;
    enabled: boolean;
    class: string;
    delay: number;
    /**
     * If `true`, the tooltip will be shown for the marker closest to the mouse cursor.
     * Only has effect on series with markers.
     */
    tracking: boolean;
    constructor(chart: Chart, document: Document);
    destroy(): void;
    isVisible(): boolean;
    updateClass(visible?: boolean, constrained?: boolean): void;
    private showTimeout;
    private constrained;
    /**
     * Shows tooltip at the given event's coordinates.
     * If the `html` parameter is missing, moves the existing tooltip to the new position.
     */
    show(meta: TooltipMeta, html?: string, instantly?: boolean): void;
    toggle(visible?: boolean): void;
}
/** Types of chart-update, in pipeline execution order. */
export declare enum ChartUpdateType {
    FULL = 0,
    PROCESS_DATA = 1,
    PERFORM_LAYOUT = 2,
    SERIES_UPDATE = 3,
    SCENE_RENDER = 4,
    NONE = 5
}
export declare abstract class Chart extends Observable {
    readonly id: string;
    options: AgChartOptions;
    userOptions: AgChartOptions;
    readonly scene: Scene;
    readonly background: Background;
    readonly legend: Legend;
    protected legendAutoPadding: Padding;
    static readonly defaultTooltipClass = "ag-chart-tooltip";
    private _debug;
    set debug(value: boolean);
    get debug(): boolean;
    private extraDebugStats;
    private _container;
    set container(value: HTMLElement | undefined | null);
    get container(): HTMLElement | undefined | null;
    protected _data: any;
    set data(data: any);
    get data(): any;
    set width(value: number);
    get width(): number;
    set height(value: number);
    get height(): number;
    private _lastAutoSize;
    protected _autoSize: boolean;
    set autoSize(value: boolean);
    get autoSize(): boolean;
    readonly tooltip: ChartTooltip;
    download(fileName?: string, fileFormat?: string): void;
    padding: Padding;
    _title?: Caption;
    set title(caption: Caption | undefined);
    get title(): Caption | undefined;
    _subtitle?: Caption;
    set subtitle(caption: Caption | undefined);
    get subtitle(): Caption | undefined;
    private _destroyed;
    get destroyed(): boolean;
    private static tooltipDocuments;
    protected constructor(document?: Document, overrideDevicePixelRatio?: number);
    destroy(): void;
    log(opts: any): void;
    private _pendingFactoryUpdates;
    get pendingFactoryUpdates(): number;
    requestFactoryUpdate(cb: () => Promise<void>): void;
    private _performUpdateType;
    get performUpdateType(): ChartUpdateType;
    get updatePending(): boolean;
    private _lastPerformUpdateError?;
    get lastPerformUpdateError(): Error | undefined;
    private updateContext;
    private seriesToUpdate;
    private performUpdateTrigger;
    awaitUpdateCompletion(): Promise<void>;
    update(type?: ChartUpdateType, opts?: {
        forceNodeDataRefresh?: boolean;
        seriesToUpdate?: Iterable<Series>;
    }): void;
    private performUpdate;
    readonly element: HTMLElement;
    abstract get seriesRoot(): Node;
    protected _axes: ChartAxis[];
    set axes(values: ChartAxis[]);
    get axes(): ChartAxis[];
    protected attachAxis(axis: ChartAxis): void;
    protected detachAxis(axis: ChartAxis): void;
    protected _series: Series[];
    set series(values: Series[]);
    get series(): Series[];
    addSeries(series: Series<any>, before?: Series<any>): boolean;
    protected initSeries(series: Series<any>): void;
    protected freeSeries(series: Series<any>): void;
    addSeriesAfter(series: Series<any>, after?: Series<any>): boolean;
    removeSeries(series: Series<any>): boolean;
    removeAllSeries(): void;
    protected assignSeriesToAxes(): void;
    protected assignAxesToSeries(force?: boolean): void;
    private findMatchingAxis;
    private resize;
    processData(): Promise<void>;
    placeLabels(): Map<Series<any>, PlacedLabel[]>;
    private updateLegend;
    abstract performLayout(): Promise<void>;
    protected positionCaptions(): {
        captionAutoPadding?: number;
    };
    protected legendBBox: BBox;
    protected positionLegend(captionAutoPadding: number): void;
    private _onMouseDown;
    private _onMouseMove;
    private _onMouseUp;
    private _onMouseOut;
    private _onClick;
    protected setupDomListeners(chartElement: HTMLCanvasElement): void;
    protected cleanupDomListeners(chartElement: HTMLCanvasElement): void;
    protected seriesRect?: BBox;
    getSeriesRect(): Readonly<BBox | undefined>;
    private pickSeriesNode;
    lastPick?: {
        datum: SeriesNodeDatum;
        event?: MouseEvent;
    };
    protected onMouseMove(event: MouseEvent): void;
    private disableTooltip;
    private lastTooltipMeta?;
    private handleTooltipTrigger;
    protected handleTooltip(meta: TooltipMeta): void;
    protected onMouseDown(_event: MouseEvent): void;
    protected onMouseUp(_event: MouseEvent): void;
    protected onMouseOut(_event: MouseEvent): void;
    protected onClick(event: MouseEvent): void;
    private checkSeriesNodeClick;
    private onSeriesNodeClick;
    private checkLegendClick;
    private pointerInsideLegend;
    private pointerOverLegendDatum;
    private handleLegendMouseMove;
    private onSeriesDatumPick;
    private mergeTooltipDatum;
    highlightedDatum?: SeriesNodeDatum;
    changeHighlightDatum(newPick?: {
        datum: SeriesNodeDatum;
        event?: MouseEvent;
    }, opts?: {
        updateProcessing: boolean;
    }): void;
    waitForUpdate(timeoutMs?: number): Promise<void>;
}
