import { Node, RedrawType } from '../scene/node';
import { Group } from '../scene/group';
import { Selection } from '../scene/selection';
import { MarkerLabel } from './markerLabel';
import { BBox } from '../scene/bbox';
import { getFont } from '../scene/shape/text';
import { Marker } from './marker/marker';
import {
    AgChartLegendClickEvent,
    AgChartLegendDoubleClickEvent,
    AgChartLegendListeners,
    AgChartLegendLabelFormatterParams,
    AgChartLegendPosition,
    FontStyle,
    FontWeight,
    AgChartOrientation,
} from './agChartOptions';
import { getMarker } from './marker/util';
import { createId } from '../util/id';
import { HdpiCanvas } from '../canvas/hdpiCanvas';
import {
    BOOLEAN,
    NUMBER,
    OPT_BOOLEAN,
    OPT_FONT_STYLE,
    OPT_FONT_WEIGHT,
    OPT_FUNCTION,
    OPT_NUMBER,
    POSITION,
    COLOR_STRING,
    STRING,
    Validate,
    predicateWithMessage,
    OPTIONAL,
} from '../util/validation';
import { Layers } from './layers';
import { Series } from './series/series';
import { ChartUpdateType } from './chartUpdateType';
import { InteractionEvent, InteractionManager } from './interaction/interactionManager';
import { CursorManager } from './interaction/cursorManager';
import { HighlightManager } from './interaction/highlightManager';
import { gridLayout, Page } from './gridLayout';
import { Pagination } from './pagination/pagination';
import { TooltipManager } from './interaction/tooltipManager';
import { toTooltipHtml } from './tooltip/tooltip';
import { LegendDatum } from './legendDatum';
import { Logger } from '../util/logger';
import { LayoutService } from './layout/layoutService';

const ORIENTATIONS = ['horizontal', 'vertical'];
export const OPT_ORIENTATION = predicateWithMessage(
    (v: any, ctx) => OPTIONAL(v, ctx, (v) => ORIENTATIONS.includes(v)),
    `expecting an orientation keyword such as 'horizontal' or 'vertical'`
);

class LegendLabel {
    @Validate(OPT_NUMBER(0))
    maxLength?: number = undefined;

    @Validate(COLOR_STRING)
    color: string = 'black';

    @Validate(OPT_FONT_STYLE)
    fontStyle?: FontStyle = undefined;

    @Validate(OPT_FONT_WEIGHT)
    fontWeight?: FontWeight = undefined;

    @Validate(NUMBER(0))
    fontSize: number = 12;

    @Validate(STRING)
    fontFamily: string = 'Verdana, sans-serif';

    @Validate(OPT_FUNCTION)
    formatter?: (params: AgChartLegendLabelFormatterParams) => string = undefined;

    getFont(): string {
        return getFont(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
    }
}

class LegendMarker {
    @Validate(NUMBER(0))
    size = 15;
    /**
     * If the marker type is set, the legend will always use that marker type for all its items,
     * regardless of the type that comes from the `data`.
     */
    _shape?: string | (new () => Marker) = undefined;
    set shape(value: string | (new () => Marker) | undefined) {
        this._shape = value;
        this.parent?.onMarkerShapeChange();
    }
    get shape() {
        return this._shape;
    }

    /**
     * Padding between the marker and the label within each legend item.
     */
    @Validate(NUMBER(0))
    padding: number = 8;

    @Validate(NUMBER(0))
    strokeWidth: number = 1;

    parent?: { onMarkerShapeChange(): void };
}

class LegendItem {
    readonly marker = new LegendMarker();
    readonly label = new LegendLabel();
    /** Used to constrain the width of legend items. */
    @Validate(OPT_NUMBER(0))
    maxWidth?: number = undefined;
    /**
     * The legend uses grid layout for its items, occupying as few columns as possible when positioned to left or right,
     * and as few rows as possible when positioned to top or bottom. This config specifies the amount of horizontal
     * padding between legend items.
     */
    @Validate(NUMBER(0))
    paddingX = 16;
    /**
     * The legend uses grid layout for its items, occupying as few columns as possible when positioned to left or right,
     * and as few rows as possible when positioned to top or bottom. This config specifies the amount of vertical
     * padding between legend items.
     */
    @Validate(NUMBER(0))
    paddingY = 8;

    @Validate(BOOLEAN)
    toggleSeriesVisible: boolean = true;
}

class LegendListeners implements AgChartLegendListeners {
    @Validate(OPT_FUNCTION)
    legendItemClick?: (event: AgChartLegendClickEvent) => void = undefined;
    legendItemDoubleClick?: (event: AgChartLegendDoubleClickEvent) => void = undefined;
}

export class Legend {
    static className = 'Legend';

    readonly id = createId(this);

    onLayoutChange?: () => void;

    private readonly group: Group = new Group({ name: 'legend', layer: true, zIndex: Layers.LEGEND_ZINDEX });

    private itemSelection: Selection<MarkerLabel, any> = Selection.select(this.group, MarkerLabel);

    private oldSize: [number, number] = [0, 0];
    private pages: Page[] = [];
    private maxPageSize: [number, number] = [0, 0];
    private pagination: Pagination;
    /** Item index to track on re-pagination, so current page updates appropriately. */
    private paginationTrackingIndex: number = 0;

    readonly item = new LegendItem();
    readonly listeners = new LegendListeners();

    private readonly truncatedItems: Set<string> = new Set();

    set translationX(value: number) {
        this.group.translationX = value;
    }
    get translationX(): number {
        return this.group.translationX;
    }

    set translationY(value: number) {
        this.group.translationY = value;
    }
    get translationY(): number {
        return this.group.translationY;
    }

    private _data: LegendDatum[] = [];
    set data(value: LegendDatum[]) {
        this._data = value;
        this.updateGroupVisibility();
    }
    get data() {
        return this._data;
    }

    @Validate(BOOLEAN)
    private _enabled = true;
    set enabled(value: boolean) {
        this._enabled = value;
        this.updateGroupVisibility();
    }
    get enabled() {
        return this._enabled;
    }

    @Validate(POSITION)
    position: AgChartLegendPosition = 'right';

    getOrientation(): AgChartOrientation {
        if (this.orientation !== undefined) {
            return this.orientation;
        }
        switch (this.position) {
            case 'right':
            case 'left':
                return 'vertical';
            case 'bottom':
            case 'top':
                return 'horizontal';
        }
    }

    /** Used to constrain the width of the legend. */
    @Validate(OPT_NUMBER(0))
    maxWidth?: number = undefined;

    /** Used to constrain the height of the legend. */
    @Validate(OPT_NUMBER(0))
    maxHeight?: number = undefined;

    /** Reverse the display order of legend items if `true`. */
    @Validate(OPT_BOOLEAN)
    reverseOrder?: boolean = undefined;

    @Validate(OPT_ORIENTATION)
    orientation?: AgChartOrientation;

    private destroyFns: Function[] = [];

    constructor(
        private readonly chart: {
            readonly series: Series<any>[];
            readonly element: HTMLElement;
            readonly mode: 'standalone' | 'integrated';
            update(
                type: ChartUpdateType,
                opts?: { forceNodeDataRefresh?: boolean; seriesToUpdate?: Iterable<Series> }
            ): void;
        },
        private readonly interactionManager: InteractionManager,
        private readonly cursorManager: CursorManager,
        private readonly highlightManager: HighlightManager,
        private readonly tooltipManager: TooltipManager,
        private readonly layoutService: LayoutService
    ) {
        this.item.marker.parent = this;
        this.pagination = new Pagination(
            (type: ChartUpdateType) => this.chart.update(type),
            (page) => this.updatePageNumber(page),
            this.interactionManager,
            this.cursorManager
        );
        this.pagination.attachPagination(this.group);

        this.item.marker.parent = this;

        const interactionListeners = [
            this.interactionManager.addListener('click', (e) => this.checkLegendClick(e)),
            this.interactionManager.addListener('dblclick', (e) => this.checkLegendDoubleClick(e)),
            this.interactionManager.addListener('hover', (e) => this.handleLegendMouseMove(e)),
        ];
        const layoutListeners = [
            this.layoutService.addListener('start-layout', (e) => this.positionLegend(e.shrinkRect)),
        ];

        this.destroyFns.push(
            ...interactionListeners.map((s) => () => this.interactionManager.removeListener(s)),
            ...layoutListeners.map((s) => () => this.layoutService.removeListener(s))
        );
    }

    public destroy() {
        this.destroyFns.forEach((f) => f());
    }

    public onMarkerShapeChange() {
        this.itemSelection.clear();
        this.group.markDirty(this.group, RedrawType.MINOR);
    }

    /**
     * Spacing between the legend and the edge of the chart's element.
     */
    @Validate(NUMBER(0))
    spacing = 20;

    private characterWidths = new Map();

    private getCharacterWidths(font: string) {
        const { characterWidths } = this;

        if (characterWidths.has(font)) {
            return characterWidths.get(font);
        }

        const cw: { [key: string]: number } = {
            '...': HdpiCanvas.getTextSize('...', font).width,
        };
        characterWidths.set(font, cw);
        return cw;
    }

    readonly size: [number, number] = [0, 0];

    private _visible: boolean = true;
    set visible(value: boolean) {
        this._visible = value;
        this.updateGroupVisibility();
    }
    get visible() {
        return this._visible;
    }

    private updateGroupVisibility() {
        this.group.visible = this.enabled && this.visible && this.data.length > 0;
    }

    attachLegend(node: Node) {
        node.append(this.group);
    }

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
    private performLayout(width: number, height: number) {
        const {
            paddingX,
            paddingY,
            label,
            maxWidth,
            marker: { size: markerSize, padding: markerPadding, shape: markerShape },
            label: { maxLength = Infinity, fontStyle, fontWeight, fontSize, fontFamily },
        } = this.item;
        const data = [...this.data];
        if (this.reverseOrder) {
            data.reverse();
        }
        this.itemSelection.update(data, (node) => {
            const { datum } = node;
            const Marker = getMarker(markerShape || datum.marker.shape);
            node.marker = new Marker();
        });

        // Update properties that affect the size of the legend items and measure them.
        const bboxes: BBox[] = [];

        const font = label.getFont();

        const itemMaxWidthPercentage = 0.8;
        const maxItemWidth = maxWidth ?? width * itemMaxWidthPercentage;
        const paddedMarkerWidth = markerSize + markerPadding + paddingX;

        this.itemSelection.each((markerLabel, datum) => {
            markerLabel.markerSize = markerSize;
            markerLabel.spacing = markerPadding;
            markerLabel.fontStyle = fontStyle;
            markerLabel.fontWeight = fontWeight;
            markerLabel.fontSize = fontSize;
            markerLabel.fontFamily = fontFamily;

            const id = datum.itemId || datum.id;
            const text = (datum.label.text ?? '<unknown>').replace(/\r?\n/g, ' ');
            markerLabel.text = this.truncate(text, maxLength, maxItemWidth, paddedMarkerWidth, font, id);

            bboxes.push(markerLabel.computeBBox());
        });

        width = Math.max(1, width);
        height = Math.max(1, height);

        if (!isFinite(width)) {
            return false;
        }

        const size = this.size;
        const oldSize = this.oldSize;
        size[0] = width;
        size[1] = height;

        if (size[0] !== oldSize[0] || size[1] !== oldSize[1]) {
            oldSize[0] = size[0];
            oldSize[1] = size[1];
        }

        const { pages, maxPageHeight, maxPageWidth } = this.updatePagination(bboxes, width, height);

        this.pages = pages;
        this.maxPageSize = [maxPageWidth - paddingX, maxPageHeight - paddingY];

        const pageNumber = this.pagination.currentPage;
        const page = this.pages[pageNumber];

        if (this.pages.length < 1 || !page) {
            this.visible = false;
            return;
        }

        this.visible = true;

        // Position legend items
        this.updatePositions(pageNumber);

        // Update legend item properties that don't affect the layout.
        this.update();
    }

    truncate(
        text: string,
        maxCharLength: number,
        maxItemWidth: number,
        paddedMarkerWidth: number,
        font: string,
        id: string
    ): string {
        const ellipsis = `...`;

        const textChars = text.split('');
        let addEllipsis = false;

        if (text.length > maxCharLength) {
            text = `${text.substring(0, maxCharLength)}`;
            addEllipsis = true;
        }

        const labelWidth = Math.floor(paddedMarkerWidth + HdpiCanvas.getTextSize(text, font).width);
        if (labelWidth > maxItemWidth) {
            let truncatedText = '';
            const characterWidths = this.getCharacterWidths(font);
            let cumulativeWidth = paddedMarkerWidth + characterWidths[ellipsis];

            for (const char of textChars) {
                if (!characterWidths[char]) {
                    characterWidths[char] = HdpiCanvas.getTextSize(char, font).width;
                }

                cumulativeWidth += characterWidths[char];

                if (cumulativeWidth > maxItemWidth) {
                    break;
                }

                truncatedText += char;
            }

            text = truncatedText;
            addEllipsis = true;
        }

        if (addEllipsis) {
            text += ellipsis;
            this.truncatedItems.add(id);
        } else {
            this.truncatedItems.delete(id);
        }

        return text;
    }

    updatePagination(
        bboxes: BBox[],
        width: number,
        height: number
    ): {
        maxPageHeight: number;
        maxPageWidth: number;
        pages: Page[];
    } {
        const orientation = this.getOrientation();
        const trackingIndex = Math.min(this.paginationTrackingIndex, bboxes.length);

        this.pagination.orientation = orientation;

        this.pagination.translationX = 0;
        this.pagination.translationY = 0;

        const { pages, maxPageHeight, maxPageWidth, paginationBBox, paginationVertical } = this.calculatePagination(
            bboxes,
            width,
            height
        );

        const newCurrentPage = pages.findIndex((p) => p.endIndex >= trackingIndex);
        this.pagination.currentPage = Math.min(Math.max(newCurrentPage, 0), pages.length - 1);

        const { paddingX: itemPaddingX, paddingY: itemPaddingY } = this.item;
        const paginationComponentPadding = 8;
        const legendItemsWidth = maxPageWidth - itemPaddingX;
        const legendItemsHeight = maxPageHeight - itemPaddingY;

        let paginationX = 0;
        let paginationY = -paginationBBox.y - this.item.marker.size / 2;
        if (paginationVertical) {
            paginationY += legendItemsHeight + paginationComponentPadding;
        } else {
            paginationX += -paginationBBox.x + legendItemsWidth + paginationComponentPadding;
            paginationY += (legendItemsHeight - paginationBBox.height) / 2;
        }

        this.pagination.translationX = paginationX;
        this.pagination.translationY = paginationY;
        this.pagination.update();
        this.pagination.updateMarkers();

        return {
            maxPageHeight,
            maxPageWidth,
            pages,
        };
    }

    calculatePagination(bboxes: BBox[], width: number, height: number) {
        const { paddingX: itemPaddingX, paddingY: itemPaddingY } = this.item;

        const orientation = this.getOrientation();
        const paginationVertical = ['left', 'right'].includes(this.position);

        let paginationBBox: BBox = this.pagination.computeBBox();
        let lastPassPaginationBBox: BBox = new BBox(0, 0, 0, 0);
        let pages: Page[] = [];
        let maxPageWidth = 0;
        let maxPageHeight = 0;
        let count = 0;

        const stableOutput = (lastPassPaginationBBox: BBox) => {
            const { width, height } = lastPassPaginationBBox;
            return width === paginationBBox.width && height === paginationBBox.height;
        };

        const forceResult = this.maxWidth !== undefined || this.maxHeight !== undefined;

        do {
            if (count++ > 10) {
                Logger.warn('unable to find stable legend layout.');
                break;
            }

            paginationBBox = lastPassPaginationBBox;
            const maxWidth = width - (paginationVertical ? 0 : paginationBBox.width);
            const maxHeight = height - (paginationVertical ? paginationBBox.height : 0);

            const layout = gridLayout({
                orientation,
                bboxes,
                maxHeight,
                maxWidth,
                itemPaddingY,
                itemPaddingX,
                forceResult,
            });

            pages = layout?.pages ?? [];
            maxPageWidth = layout?.maxPageWidth ?? 0;
            maxPageHeight = layout?.maxPageHeight ?? 0;

            const totalPages = pages.length;
            this.pagination.visible = totalPages > 1;
            this.pagination.totalPages = totalPages;

            this.pagination.update();
            lastPassPaginationBBox = this.pagination.computeBBox();

            if (!this.pagination.visible) {
                break;
            }
        } while (!stableOutput(lastPassPaginationBBox));

        return { maxPageWidth, maxPageHeight, pages, paginationBBox, paginationVertical };
    }

    updatePositions(pageNumber: number = 0) {
        const {
            item: { paddingY },
            itemSelection,
            pages,
        } = this;

        if (pages.length < 1 || !pages[pageNumber]) {
            return;
        }

        const { columns, startIndex: visibleStart, endIndex: visibleEnd } = pages[pageNumber];

        // Position legend items using the layout computed above.
        let x = 0;
        let y = 0;

        const columnCount = columns.length;
        const rowCount = columns[0].indices.length;
        const horizontal = this.getOrientation() === 'horizontal';

        const itemHeight = columns[0].bboxes[0].height + paddingY;

        const rowSumColumnWidths: number[] = [];

        itemSelection.each((markerLabel, _, i) => {
            if (i < visibleStart || i > visibleEnd) {
                markerLabel.visible = false;
                return;
            }

            const pageIndex = i - visibleStart;
            let columnIndex = 0;
            let rowIndex = 0;
            if (horizontal) {
                columnIndex = pageIndex % columnCount;
                rowIndex = Math.floor(pageIndex / columnCount);
            } else {
                columnIndex = Math.floor(pageIndex / rowCount);
                rowIndex = pageIndex % rowCount;
            }

            markerLabel.visible = true;
            const column = columns[columnIndex];

            if (!column) {
                return;
            }

            y = itemHeight * rowIndex;
            x = rowSumColumnWidths[rowIndex] ?? 0;

            rowSumColumnWidths[rowIndex] = (rowSumColumnWidths[rowIndex] ?? 0) + column.columnWidth;

            // Round off for pixel grid alignment to work properly.
            markerLabel.translationX = Math.floor(x);
            markerLabel.translationY = Math.floor(y);
        });
    }

    updatePageNumber(pageNumber: number) {
        const { pages } = this;

        // Track an item on the page in re-pagination cases (e.g. resize).
        const { startIndex, endIndex } = pages[pageNumber];
        if (startIndex === 0) {
            // Stay on first page on pagination update.
            this.paginationTrackingIndex = 0;
        } else if (pageNumber === pages.length - 1) {
            // Stay on last page on pagination update.
            this.paginationTrackingIndex = endIndex;
        } else {
            // Track the middle item on the page).
            this.paginationTrackingIndex = Math.floor((startIndex + endIndex) / 2);
        }

        this.pagination.update();
        this.pagination.updateMarkers();

        this.updatePositions(pageNumber);
        this.chart.update(ChartUpdateType.SCENE_RENDER);
    }

    update() {
        const {
            marker: { strokeWidth },
            label: { color },
        } = this.item;
        this.itemSelection.each((markerLabel, datum) => {
            const marker = datum.marker;
            markerLabel.markerFill = marker.fill;
            markerLabel.markerStroke = marker.stroke;
            markerLabel.markerStrokeWidth = strokeWidth;
            markerLabel.markerFillOpacity = marker.fillOpacity;
            markerLabel.markerStrokeOpacity = marker.strokeOpacity;
            markerLabel.opacity = datum.enabled ? 1 : 0.5;
            markerLabel.color = color;
        });
    }

    getDatumForPoint(x: number, y: number): LegendDatum | undefined {
        const visibleChildBBoxes: BBox[] = [];
        const closestLeftTop = { dist: Infinity, datum: undefined as any };
        for (const child of this.group.children) {
            if (!child.visible) continue;
            if (!(child instanceof MarkerLabel)) continue;

            const childBBox = child.computeBBox();
            childBBox.grow(this.item.paddingX / 2, 'horizontal');
            childBBox.grow(this.item.paddingY / 2, 'vertical');
            if (childBBox.containsPoint(x, y)) {
                return child.datum;
            }

            const distX = x - childBBox.x - this.item.paddingX / 2;
            const distY = y - childBBox.y - this.item.paddingY / 2;
            const dist = distX ** 2 + distY ** 2;
            const toTheLeftTop = distX >= 0 && distY >= 0;
            if (toTheLeftTop && dist < closestLeftTop.dist) {
                closestLeftTop.dist = dist;
                closestLeftTop.datum = child.datum;
            }

            visibleChildBBoxes.push(childBBox);
        }

        const pageBBox = BBox.merge(visibleChildBBoxes);
        if (!pageBBox.containsPoint(x, y)) {
            // We're not in-between legend items.
            return undefined;
        }

        // Fallback to returning closest match to the left/up.
        return closestLeftTop.datum;
    }

    computeBBox(): BBox {
        return this.group.computeBBox();
    }

    computePagedBBox(): BBox {
        const actualBBox = this.group.computeBBox();
        if (this.pages.length <= 1) {
            return actualBBox;
        }

        const [maxPageWidth, maxPageHeight] = this.maxPageSize;
        actualBBox.height = Math.max(maxPageHeight, actualBBox.height);
        actualBBox.width = Math.max(maxPageWidth, actualBBox.width);

        return actualBBox;
    }

    private checkLegendClick(event: InteractionEvent<'click'>) {
        const {
            listeners: { legendItemClick },
            chart,
            highlightManager,
            item: { toggleSeriesVisible },
        } = this;
        const datum = this.getDatumForPoint(event.offsetX, event.offsetY);
        if (!datum) {
            return;
        }

        const { id, itemId, enabled } = datum;
        const series = chart.series.find((s) => s.id === id);
        if (!series) {
            return;
        }
        event.consume();

        let newEnabled = enabled;
        if (toggleSeriesVisible) {
            newEnabled = !enabled;

            chart.series.forEach((s) => {
                if (s.id === series.id) {
                    s.toggleSeriesItem(itemId, newEnabled);
                } else {
                    s.toggleOtherSeriesItems(series, datum, newEnabled);
                }
            });
        }

        if (!newEnabled) {
            highlightManager.updateHighlight(this.id);
        } else {
            highlightManager.updateHighlight(this.id, {
                series,
                itemId,
                datum: undefined,
            });
        }

        this.chart.update(ChartUpdateType.PROCESS_DATA, { forceNodeDataRefresh: true });

        legendItemClick?.({ type: 'click', enabled: newEnabled, itemId, seriesId: series.id });
    }

    private checkLegendDoubleClick(event: InteractionEvent<'dblclick'>) {
        const {
            listeners: { legendItemDoubleClick },
            chart,
            item: { toggleSeriesVisible },
        } = this;

        // Integrated charts do not handle double click behaviour correctly due to multiple instances of the
        // chart being created. See https://ag-grid.atlassian.net/browse/RTI-1381
        if (chart.mode === 'integrated') {
            return;
        }

        const datum = this.getDatumForPoint(event.offsetX, event.offsetY);
        if (!datum) {
            return;
        }

        const { id, itemId, seriesId } = datum;
        const series = chart.series.find((s) => s.id === id);
        if (!series) {
            return;
        }
        event.consume();

        if (toggleSeriesVisible) {
            const legendData: Array<LegendDatum> = chart.series.reduce(
                (ls, s) => [...ls, ...s.getLegendData()],
                [] as Array<LegendDatum>
            );

            const visibleItemsCount = legendData.filter((d) => d.enabled).length;
            const clickedItem = legendData.find((d) => d.itemId === itemId && d.seriesId === seriesId);

            const seriesItemCounts = legendData.reduce((acc, d) => {
                acc[d.seriesId] ??= 0;
                acc[d.seriesId]++;
                return acc;
            }, {} as any);
            const seriesItemEnabledCounts = legendData.reduce((acc, d) => {
                if (!d.enabled) return acc;
                acc[d.seriesId] ??= 0;
                acc[d.seriesId]++;
                return acc;
            }, {} as any);

            const eachSeriesHasSingleItem = Object.values(seriesItemCounts).filter((c: any) => c > 1).length === 0;
            const singleEnabledInEachSeries =
                Object.values(seriesItemEnabledCounts).filter((count: any) => count > 1).length === 0;

            const singleSelectedWasNotClicked = visibleItemsCount === 1 && (clickedItem?.enabled ?? false);
            const singleEnabledInEachSeriesWasNotClicked = singleEnabledInEachSeries && (clickedItem?.enabled ?? false);

            chart.series.forEach((s) => {
                const legendData = s.getLegendData();

                legendData.forEach((d) => {
                    const wasClicked = d.itemId === itemId && d.seriesId === seriesId;
                    const newEnabled =
                        wasClicked ||
                        (eachSeriesHasSingleItem && singleSelectedWasNotClicked) ||
                        (!eachSeriesHasSingleItem && singleEnabledInEachSeriesWasNotClicked);
                    s.toggleSeriesItem(d.itemId, newEnabled);
                });

                if (s.id !== series.id) {
                    s.toggleOtherSeriesItems(series, datum, undefined, singleEnabledInEachSeriesWasNotClicked);
                }
            });
        }

        this.chart.update(ChartUpdateType.PROCESS_DATA, { forceNodeDataRefresh: true });

        legendItemDoubleClick?.({ type: 'dblclick', enabled: true, itemId, seriesId: series.id });
    }

    private handleLegendMouseMove(event: InteractionEvent<'hover'>) {
        const {
            enabled,
            item: { toggleSeriesVisible },
            listeners,
        } = this;
        if (!enabled) {
            return;
        }

        const legendBBox = this.computeBBox();
        const { pageX, pageY, offsetX, offsetY } = event;
        const pointerInsideLegend = this.group.visible && legendBBox.containsPoint(offsetX, offsetY);

        if (!pointerInsideLegend) {
            this.cursorManager.updateCursor(this.id);
            this.highlightManager.updateHighlight(this.id);
            this.tooltipManager.updateTooltip(this.id);
            return;
        }

        // Prevent other handlers from consuming this event if it's generated inside the legend
        // boundaries.
        event.consume();

        const datum = this.getDatumForPoint(offsetX, offsetY);
        const pointerOverLegendDatum = pointerInsideLegend && datum !== undefined;
        if (!pointerOverLegendDatum) {
            this.cursorManager.updateCursor(this.id);
            this.highlightManager.updateHighlight(this.id);
            return;
        }

        const series = datum ? this.chart.series.find((series) => series.id === datum?.id) : undefined;
        if (datum && this.truncatedItems.has(datum.itemId || datum.id)) {
            this.tooltipManager.updateTooltip(
                this.id,
                { pageX, pageY, offsetX, offsetY, event },
                toTooltipHtml({ content: datum.label.text })
            );
        } else {
            this.tooltipManager.updateTooltip(this.id);
        }

        if (toggleSeriesVisible || listeners.legendItemClick != null) {
            this.cursorManager.updateCursor(this.id, 'pointer');
        }

        if (datum?.enabled && series) {
            this.highlightManager.updateHighlight(this.id, {
                series,
                itemId: datum?.itemId,
                datum: undefined,
            });
        } else {
            this.highlightManager.updateHighlight(this.id);
        }
    }

    private positionLegend(shrinkRect: BBox) {
        const newShrinkRect = shrinkRect.clone();

        if (!this.enabled || !this.data.length) {
            return { shrinkRect: newShrinkRect };
        }

        const [legendWidth, legendHeight] = this.calculateLegendDimensions(shrinkRect);

        let translationX = 0;
        let translationY = 0;

        this.translationX = 0;
        this.translationY = 0;
        this.performLayout(legendWidth, legendHeight);
        const legendBBox = this.computePagedBBox();

        const calculateTranslationPerpendicularDimension = () => {
            switch (this.position) {
                case 'top':
                    return 0;
                case 'bottom':
                    return shrinkRect.height - legendBBox.height;
                case 'left':
                    return 0;
                case 'right':
                default:
                    return shrinkRect.width - legendBBox.width;
            }
        };
        if (this.visible) {
            switch (this.position) {
                case 'top':
                case 'bottom':
                    translationX = (shrinkRect.width - legendBBox.width) / 2;
                    translationY = calculateTranslationPerpendicularDimension();
                    newShrinkRect.shrink(legendBBox.height, this.position);
                    break;

                case 'left':
                case 'right':
                default:
                    translationX = calculateTranslationPerpendicularDimension();
                    translationY = (shrinkRect.height - legendBBox.height) / 2;
                    newShrinkRect.shrink(legendBBox.width, this.position);
            }

            // Round off for pixel grid alignment to work properly.
            this.translationX = Math.floor(-legendBBox.x + shrinkRect.x + translationX);
            this.translationY = Math.floor(-legendBBox.y + shrinkRect.y + translationY);
        }

        if (this.visible && this.enabled && this.data.length) {
            const legendPadding = this.spacing;
            newShrinkRect.shrink(legendPadding, this.position);
        }

        return { shrinkRect: newShrinkRect };
    }

    private calculateLegendDimensions(shrinkRect: BBox): [number, number] {
        const { width, height } = shrinkRect;

        const aspectRatio = width / height;
        const maxCoefficient = 0.5;
        const minHeightCoefficient = 0.2;
        const minWidthCoefficient = 0.25;

        let legendWidth = 0;
        let legendHeight = 0;

        switch (this.position) {
            case 'top':
            case 'bottom':
                // A horizontal legend should take maximum between 20 to 50 percent of the chart height if height is larger than width
                // and maximum 20 percent of the chart height if height is smaller than width.
                const heightCoefficient =
                    aspectRatio < 1
                        ? Math.min(maxCoefficient, minHeightCoefficient * (1 / aspectRatio))
                        : minHeightCoefficient;
                legendWidth = this.maxWidth ? Math.min(this.maxWidth, width) : width;
                legendHeight = this.maxHeight
                    ? Math.min(this.maxHeight, height)
                    : Math.round(height * heightCoefficient);
                break;

            case 'left':
            case 'right':
            default:
                // A vertical legend should take maximum between 25 to 50 percent of the chart width if width is larger than height
                // and maximum 25 percent of the chart width if width is smaller than height.
                const widthCoefficient =
                    aspectRatio > 1 ? Math.min(maxCoefficient, minWidthCoefficient * aspectRatio) : minWidthCoefficient;
                legendWidth = this.maxWidth ? Math.min(this.maxWidth, width) : Math.round(width * widthCoefficient);
                legendHeight = this.maxHeight ? Math.min(this.maxHeight, height) : height;
        }

        return [legendWidth, legendHeight];
    }
}
