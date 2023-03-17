import { Node } from '../scene/node';
import { BBox } from '../scene/bbox';
import { Marker } from './marker/marker';
import { AgChartLegendClickEvent, AgChartLegendDoubleClickEvent, AgChartLegendListeners, AgChartLegendLabelFormatterParams, AgChartLegendPosition, FontStyle, FontWeight, AgChartOrientation } from './agChartOptions';
import { Series } from './series/series';
import { ChartUpdateType } from './chartUpdateType';
import { InteractionManager } from './interaction/interactionManager';
import { CursorManager } from './interaction/cursorManager';
import { HighlightManager } from './interaction/highlightManager';
import { Page } from './gridLayout';
import { TooltipManager } from './interaction/tooltipManager';
import { LegendDatum } from './legendDatum';
export declare const OPT_ORIENTATION: import("../util/validation").ValidatePredicate;
declare class LegendLabel {
    maxLength?: number;
    color: string;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize: number;
    fontFamily: string;
    formatter?: (params: AgChartLegendLabelFormatterParams) => string;
    getFont(): string;
}
declare class LegendMarker {
    size: number;
    /**
     * If the marker type is set, the legend will always use that marker type for all its items,
     * regardless of the type that comes from the `data`.
     */
    _shape?: string | (new () => Marker);
    set shape(value: string | (new () => Marker) | undefined);
    get shape(): string | (new () => Marker) | undefined;
    /**
     * Padding between the marker and the label within each legend item.
     */
    padding: number;
    strokeWidth: number;
    parent?: {
        onMarkerShapeChange(): void;
    };
}
declare class LegendItem {
    readonly marker: LegendMarker;
    readonly label: LegendLabel;
    /** Used to constrain the width of legend items. */
    maxWidth?: number;
    /**
     * The legend uses grid layout for its items, occupying as few columns as possible when positioned to left or right,
     * and as few rows as possible when positioned to top or bottom. This config specifies the amount of horizontal
     * padding between legend items.
     */
    paddingX: number;
    /**
     * The legend uses grid layout for its items, occupying as few columns as possible when positioned to left or right,
     * and as few rows as possible when positioned to top or bottom. This config specifies the amount of vertical
     * padding between legend items.
     */
    paddingY: number;
    toggleSeriesVisible: boolean;
}
declare class LegendListeners implements AgChartLegendListeners {
    legendItemClick?: (event: AgChartLegendClickEvent) => void;
    legendItemDoubleClick?: (event: AgChartLegendDoubleClickEvent) => void;
}
export declare class Legend {
    private readonly chart;
    private readonly interactionManager;
    private readonly cursorManager;
    private readonly highlightManager;
    private readonly tooltipManager;
    static className: string;
    readonly id: string;
    onLayoutChange?: () => void;
    private readonly group;
    private itemSelection;
    private oldSize;
    private pages;
    private maxPageSize;
    private pagination;
    /** Item index to track on re-pagination, so current page updates appropriately. */
    private paginationTrackingIndex;
    readonly item: LegendItem;
    readonly listeners: LegendListeners;
    private readonly truncatedItems;
    set translationX(value: number);
    get translationX(): number;
    set translationY(value: number);
    get translationY(): number;
    private _data;
    set data(value: LegendDatum[]);
    get data(): LegendDatum[];
    private _enabled;
    set enabled(value: boolean);
    get enabled(): boolean;
    position: AgChartLegendPosition;
    getOrientation(): AgChartOrientation;
    /** Used to constrain the width of the legend. */
    maxWidth?: number;
    /** Used to constrain the height of the legend. */
    maxHeight?: number;
    /** Reverse the display order of legend items if `true`. */
    reverseOrder?: boolean;
    orientation?: AgChartOrientation;
    constructor(chart: {
        readonly series: Series<any>[];
        readonly element: HTMLElement;
        update(type: ChartUpdateType, opts?: {
            forceNodeDataRefresh?: boolean;
            seriesToUpdate?: Iterable<Series>;
        }): void;
    }, interactionManager: InteractionManager, cursorManager: CursorManager, highlightManager: HighlightManager, tooltipManager: TooltipManager);
    onMarkerShapeChange(): void;
    /**
     * Spacing between the legend and the edge of the chart's element.
     */
    spacing: number;
    private characterWidths;
    private getCharacterWidths;
    readonly size: [number, number];
    private _visible;
    set visible(value: boolean);
    get visible(): boolean;
    private updateGroupVisibility;
    attachLegend(node: Node): void;
    /**
     * The method is given the desired size of the legend, which only serves as a hint.
     * The vertically oriented legend will take as much horizontal space as needed, but will
     * respect the height constraints, and the horizontal legend will take as much vertical
     * space as needed in an attempt not to exceed the given width.
     * After the layout is done, the {@link size} will contain the actual size of the legend.
     * If the actual size is not the same as the previous actual size, the legend will fire
     * the 'layoutChange' event to communicate that another layout is needed, and the above
     * process should be repeated.
     * @param width
     * @param height
     */
    performLayout(width: number, height: number): false | undefined;
    truncate(text: string, maxCharLength: number, maxItemWidth: number, paddedMarkerWidth: number, font: string, id: string): string;
    updatePagination(bboxes: BBox[], width: number, height: number): {
        maxPageHeight: number;
        maxPageWidth: number;
        pages: Page[];
    };
    calculatePagination(bboxes: BBox[], width: number, height: number): {
        maxPageWidth: number;
        maxPageHeight: number;
        pages: Page[];
        paginationBBox: BBox;
        paginationVertical: boolean;
    };
    updatePositions(pageNumber?: number): void;
    updatePageNumber(pageNumber: number): void;
    update(): void;
    getDatumForPoint(x: number, y: number): LegendDatum | undefined;
    computeBBox(): BBox;
    computePagedBBox(): BBox;
    private checkLegendClick;
    private checkLegendDoubleClick;
    private handleLegendMouseMove;
}
export {};
