import { Node } from '../scene/node';
import { Group } from '../scene/group';
import { Selection } from '../scene/selection';
import { MarkerLabel } from './markerLabel';
import { BBox } from '../scene/bbox';
import { getFont } from '../scene/shape/text';
import { Marker } from './marker/marker';
import {
    AgChartLegendClickEvent,
    AgChartLegendListeners,
    AgChartLegendLabelFormatterParams,
    AgChartLegendPosition,
    FontStyle,
    FontWeight,
} from './agChartOptions';
import { getMarker } from './marker/util';
import { createId } from '../util/id';
import { RedrawType } from '../scene/node';
import { HdpiCanvas } from '../canvas/hdpiCanvas';
import {
    BOOLEAN,
    FUNCTION,
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
} from '../util/validation';
import { Layers } from './layers';
import { InteractionEvent, InteractionManager } from './interaction/interactionManager';
import { CursorManager } from './interaction/cursorManager';
import { Series, SeriesNodeDatum } from './series/series';
import { ChartUpdateType } from './chart';
import { gridLayout, Page } from './gridLayout';
import { Pagination } from './pagination/pagination';
import { Orientation } from './gridLayout';

export interface LegendDatum {
    id: string; // component ID
    itemId: any; // sub-component ID
    seriesId: string;
    enabled: boolean; // the current state of the sub-component
    marker: {
        shape?: string | (new () => Marker);
        fill: string;
        stroke: string;
        fillOpacity: number;
        strokeOpacity: number;
    };
    label: {
        text: string; // display name for the sub-component
    };
}

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
}

const NO_OP_LISTENER = () => {
    // Default listener that does nothing.
};

class LegendListeners implements Required<AgChartLegendListeners> {
    @Validate(FUNCTION)
    legendItemClick: (event: AgChartLegendClickEvent) => void = NO_OP_LISTENER;
}

export class Legend {
    static className = 'Legend';

    readonly id = createId(this);

    onLayoutChange?: () => void;

    private readonly group: Group = new Group({ name: 'legend', layer: true, zIndex: Layers.LEGEND_ZINDEX });

    private itemSelection: Selection<MarkerLabel, Group, any, any> = Selection.select(
        this.group
    ).selectAll<MarkerLabel>();

    private oldSize: [number, number] = [0, 0];
    private pages: Page[] = [];
    private pagination: Pagination;

    readonly item = new LegendItem();
    readonly listeners = new LegendListeners();

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
    private _position: AgChartLegendPosition = 'right';
    set position(value: AgChartLegendPosition) {
        this._position = value;

        switch (value) {
            case 'right':
            case 'left':
                this.orientation = Orientation.Vertical;
                break;
            case 'bottom':
            case 'top':
                this.orientation = Orientation.Horizontal;
                break;
        }
    }
    get position() {
        return this._position;
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

    private _orientation: Orientation = Orientation.Vertical;
    set orientation(value: Orientation) {
        this._orientation = value;
        this.pagination.orientation = value;
    }
    get orientation() {
        return this._orientation;
    }

    constructor(
        private readonly chart: {
            readonly series: Series<any>[];
            readonly highlightedDatum?: SeriesNodeDatum;
            togglePointer(visible: boolean): void;
            changeHighlightDatum(opts?: { datum: SeriesNodeDatum }): void;
            update(
                type: ChartUpdateType,
                opts?: { forceNodeDataRefresh?: boolean; seriesToUpdate?: Iterable<Series> }
            ): void;
        },
        private readonly interactionManager: InteractionManager,
        private readonly cursorManager: CursorManager
    ) {
        this.item.marker.parent = this;
        this.pagination = new Pagination(
            (page) => this.updatePageNumber(page),
            this.interactionManager,
            this.cursorManager
        );
        this.pagination.attachPagination(this.group);

        this.item.marker.parent = this;

        this.interactionManager.addListener('click', (e) => this.checkLegendClick(e));
        this.interactionManager.addListener('hover', (e) => this.handleLegendMouseMove(e));
    }

    public onMarkerShapeChange() {
        this.itemSelection = this.itemSelection.setData([]);
        this.itemSelection.exit.remove();
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
    performLayout(width: number, height: number) {
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
        const updateSelection = this.itemSelection.setData(data, (_, datum) => {
            const Marker = getMarker(markerShape || datum.marker.shape);
            return datum.id + '-' + datum.itemId + '-' + Marker.name;
        });
        updateSelection.exit.remove();

        const enterSelection = updateSelection.enter.append(MarkerLabel).each((node, datum) => {
            const Marker = getMarker(markerShape || datum.marker.shape);
            node.marker = new Marker();
        });
        const itemSelection = (this.itemSelection = updateSelection.merge(enterSelection));

        // Update properties that affect the size of the legend items and measure them.
        const bboxes: BBox[] = [];

        const font = label.getFont();
        const ellipsis = `...`;

        const itemMaxWidthPercentage = 0.8;
        const maxItemWidth = maxWidth ?? width * itemMaxWidthPercentage;

        itemSelection.each((markerLabel, datum) => {
            let text = datum.label.text ?? '<unknown>';
            markerLabel.markerSize = markerSize;
            markerLabel.spacing = markerPadding;
            markerLabel.fontStyle = fontStyle;
            markerLabel.fontWeight = fontWeight;
            markerLabel.fontSize = fontSize;
            markerLabel.fontFamily = fontFamily;

            const textChars = text.split('');
            let addEllipsis = false;

            if (text.length > maxLength) {
                text = `${text.substring(0, maxLength)}`;
                addEllipsis = true;
            }

            const labelWidth = markerSize + markerPadding + HdpiCanvas.getTextSize(text, font).width;
            if (labelWidth > maxItemWidth) {
                let truncatedText = '';
                const characterWidths = this.getCharacterWidths(font);
                let cumCharSize = characterWidths[ellipsis];

                for (const char of textChars) {
                    if (!characterWidths[char]) {
                        characterWidths[char] = HdpiCanvas.getTextSize(char, font).width;
                    }

                    cumCharSize += characterWidths[char];

                    if (cumCharSize > maxItemWidth) {
                        break;
                    }

                    truncatedText += char;
                }

                text = truncatedText;
                addEllipsis = true;
            }

            if (addEllipsis) {
                text += ellipsis;
            }

            markerLabel.text = text;
            bboxes.push(markerLabel.computeBBox());
        });

        width = Math.max(1, width);
        height = Math.max(1, height);

        if (!isFinite(width)) {
            return false;
        }

        const paginationBBox = this.pagination.computeBBox();
        const verticalOrientation = this.orientation === Orientation.Vertical;

        width = width - (verticalOrientation ? 0 : paginationBBox.width);
        height = height - (verticalOrientation ? paginationBBox.height : 0);

        const size = this.size;
        const oldSize = this.oldSize;
        size[0] = width;
        size[1] = height;

        if (size[0] !== oldSize[0] || size[1] !== oldSize[1]) {
            oldSize[0] = size[0];
            oldSize[1] = size[1];
        }

        const {
            pages = [],
            maxPageWidth = 0,
            maxPageHeight = 0,
        } = gridLayout({
            orientation: this.orientation,
            bboxes,
            maxHeight: height,
            maxWidth: width,
            itemPaddingY: paddingY,
            itemPaddingX: paddingX,
        }) || {};

        this.pages = pages;
        const totalPages = pages.length;
        this.pagination.visible = totalPages > 1;
        this.pagination.totalPages = totalPages;

        const pageNumber = this.pagination.getCurrentPage();
        const page = this.pages[pageNumber];

        if (totalPages < 1 || !page) {
            this.visible = false;
            return;
        }

        this.visible = true;

        // Position legend items
        // Top-left corner of the first legend item.
        const startX = width / 2;
        const startY = height / 2;
        this.updatePositions(startX, startY, pageNumber);

        this.pagination.translationX = verticalOrientation ? startX : startX + maxPageWidth;
        this.pagination.translationY = verticalOrientation
            ? startY + maxPageHeight
            : startY + maxPageHeight / 2 - paginationBBox.height;

        // Update legend item properties that don't affect the layout.
        this.update();
    }

    updatePositions(startX: number, startY: number, pageNumber: number = 0) {
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
        const horizontal = this.orientation === Orientation.Horizontal;

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
            let column = columns[columnIndex];

            if (!column) {
                return;
            }

            y = itemHeight * rowIndex;
            x = rowSumColumnWidths[rowIndex] ?? 0;

            rowSumColumnWidths[rowIndex] = (rowSumColumnWidths[rowIndex] ?? 0) + column.columnWidth;

            // Round off for pixel grid alignment to work properly.
            markerLabel.translationX = Math.floor(startX + x);
            markerLabel.translationY = Math.floor(startY + y);
        });
    }

    updatePageNumber(pageNumber: number) {
        const startX = this.size[0] / 2;
        const startY = this.size[1] / 2;
        this.updatePositions(startX, startY, pageNumber);
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
        for (const child of this.group.children) {
            if (!(child instanceof MarkerLabel)) continue;

            if (child.visible && child.computeBBox().containsPoint(x, y)) {
                return child.datum;
            }
        }

        return undefined;
    }

    computeBBox(): BBox {
        return this.group.computeBBox();
    }

    private checkLegendClick(event: InteractionEvent<'click'>) {
        const {
            listeners: { legendItemClick },
            chart,
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

        const newEnabled = !enabled;
        series.toggleSeriesItem(itemId, newEnabled);
        if (!newEnabled) {
            chart.togglePointer(false);
        }

        if (!newEnabled && chart.highlightedDatum?.series === series) {
            chart.changeHighlightDatum();
        }

        if (newEnabled) {
            chart.changeHighlightDatum({
                datum: {
                    series,
                    itemId,
                    datum: undefined,
                },
            });
        }

        this.chart.update(ChartUpdateType.PROCESS_DATA, { forceNodeDataRefresh: true });

        legendItemClick({ enabled: newEnabled, itemId, seriesId: series.id });
    }

    private handleLegendMouseMove(event: InteractionEvent<'hover'>) {
        const { enabled } = this;
        if (!enabled) {
            return;
        }

        const maybeDeHighlight = () => {
            // Remove highlight IF the current highlight was from legend interactions. The only way
            // a highlight is from the legend is if it isn't for a specific datum right now, so if
            // the highlight points to a specific datum, don't remove it.
            if (this.chart.highlightedDatum?.datum != null) {
                return;
            }
            this.chart.changeHighlightDatum();
        };

        const legendBBox = this.computeBBox();
        const { offsetX, offsetY } = event;
        const pointerInsideLegend = legendBBox.containsPoint(offsetX, offsetY);

        if (!pointerInsideLegend) {
            this.cursorManager.updateCursor(this.id);
            maybeDeHighlight();
            return;
        }

        // Prevent other handlers from consuming this event if it's generated inside the legend
        // boundaries.
        event.consume();

        const datum = this.getDatumForPoint(offsetX, offsetY);
        const pointerOverLegendDatum = pointerInsideLegend && datum !== undefined;
        if (!pointerOverLegendDatum) {
            this.cursorManager.updateCursor(this.id);
            maybeDeHighlight();
            return;
        }

        this.cursorManager.updateCursor(this.id, 'pointer');

        const series = datum ? this.chart.series.find((series) => series.id === datum?.id) : undefined;
        if (datum?.enabled && series) {
            this.chart.changeHighlightDatum({
                datum: {
                    series,
                    itemId: datum?.itemId,
                    datum: undefined,
                },
            });
        } else {
            maybeDeHighlight();
        }
    }
}
