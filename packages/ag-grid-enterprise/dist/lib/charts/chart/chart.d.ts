// ag-grid-enterprise v21.2.2
import { Scene } from "../scene/scene";
import { Series } from "./series/series";
import { Padding } from "../util/padding";
import { Node } from "../scene/node";
import { Rect } from "../scene/shape/rect";
import { Legend } from "./legend";
import { Caption } from "../caption";
export declare type LegendPosition = 'top' | 'right' | 'bottom' | 'left';
export declare type ChartOptions = {
    document?: Document;
};
export declare abstract class Chart {
    readonly scene: Scene;
    readonly background: Rect;
    legend: Legend;
    protected legendAutoPadding: Padding;
    protected captionAutoPadding: number;
    private tooltipElement;
    private tooltipRect?;
    tooltipOffset: number[];
    private defaultTooltipClass;
    protected constructor(options?: ChartOptions);
    destroy(): void;
    private readonly onLayoutChange;
    readonly element: HTMLElement;
    parent: HTMLElement | undefined;
    private _title;
    title: Caption | undefined;
    private _subtitle;
    subtitle: Caption | undefined;
    abstract readonly seriesRoot: Node;
    protected _series: Series<Chart>[];
    series: Series<Chart>[];
    addSeries(series: Series<Chart>, before?: Series<Chart> | null): boolean;
    removeSeries(series: Series<Chart>): boolean;
    removeAllSeries(): void;
    private _legendPosition;
    legendPosition: LegendPosition;
    private _legendPadding;
    legendPadding: number;
    private _data;
    data: any[];
    protected _padding: Padding;
    padding: Padding;
    size: [number, number];
    /**
     * The width of the chart in CSS pixels.
     */
    width: number;
    /**
     * The height of the chart in CSS pixels.
     */
    height: number;
    private layoutCallbackId;
    /**
    * Only `true` while we are waiting for the layout to start.
    * This will be `false` if the layout has already started and is ongoing.
    */
    layoutPending: boolean;
    private readonly _performLayout;
    private dataCallbackId;
    dataPending: boolean;
    onLayoutDone?: () => void;
    private readonly _processData;
    processData(): void;
    abstract performLayout(): void;
    protected positionCaptions(): void;
    private legendBBox?;
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
    tooltipClass: string;
    private toggleTooltip;
    /**
     * Shows tooltip at the given event's coordinates.
     * If the `html` parameter is missing, moves the existing tooltip to the new position.
     */
    private showTooltip;
    private hideTooltip;
}
