import { Group } from "../scene/group";
import { Selection } from "../scene/selection";
import { MarkerLabel } from "./markerLabel";
import { BBox } from "../scene/bbox";
import { FontStyle, FontWeight } from "../scene/shape/text";
import { Marker } from "./marker/marker";
import { reactive, Observable } from "../util/observable";
import { getMarker } from "./marker/util";
import { createId } from "../util/id";

export interface LegendDatum {
    id: string;       // component ID
    itemId: any;      // sub-component ID
    enabled: boolean; // the current state of the sub-component
    marker: {
        shape?: string | (new () => Marker);
        fill: string;
        stroke: string;
        fillOpacity: number;
        strokeOpacity: number;
    };
    label: {
        text: string;  // display name for the sub-component
    };
}

export enum LegendOrientation {
    Vertical,
    Horizontal
}

export enum LegendPosition {
    Top = 'top',
    Right = 'right',
    Bottom = 'bottom',
    Left = 'left'
}

export class Legend extends Observable {

    static className = 'Legend';

    readonly id = createId(this);

    onLayoutChange?: () => void;

    readonly group: Group = new Group();

    private itemSelection: Selection<MarkerLabel, Group, any, any> = Selection.select(this.group).selectAll<MarkerLabel>();

    private oldSize: [number, number] = [0, 0];

    @reactive('layoutChange') data: LegendDatum[] = [];
    @reactive('layoutChange') enabled = true;
    @reactive('layoutChange') orientation: LegendOrientation = LegendOrientation.Vertical;
    @reactive('layoutChange') position: LegendPosition = LegendPosition.Right;

    /**
     * Spacing between the legend and the edge of the chart's element.
     */
    @reactive('layoutChange') spacing = 20;
    /**
     * The legend uses grid layout for its items, occupying as few columns as possible when positioned to left or right,
     * and as few rows as possible when positioned to top or bottom. This config specifies the amount of horizontal
     * spacing between legend items.
     */
    @reactive('layoutChange') layoutHorizontalSpacing = 16;
    /**
     * The legend uses grid layout for its items, occupying as few columns as possible when positioned to left or right,
     * and as few rows as possible when positioned to top or bottom. This config specifies the amount of vertical
     * spacing between legend items.
     */
    @reactive('layoutChange') layoutVerticalSpacing = 8;
    /**
     * Spacing between the marker and the label within each legend item.
     */
    @reactive('layoutChange') itemSpacing = 8;

    // If the marker type is set, the legend will always use that marker type for all its items,
    // regardless of the type that comes from the `data`.
    @reactive('layoutChange') markerShape?: string | (new () => Marker);
    @reactive('layoutChange') markerSize = 15;
    @reactive('change') strokeWidth = 1;

    @reactive('change') color = 'black';
    @reactive('layoutChange') fontStyle?: FontStyle;
    @reactive('layoutChange') fontWeight?: FontWeight;
    @reactive('layoutChange') fontSize = 12;
    @reactive('layoutChange') fontFamily = 'Verdana, sans-serif';

    constructor() {
        super();

        this.addPropertyListener('data', event => {
            const { source: legend, value: data } = event;
            legend.group.visible = legend.enabled && data.length > 0;
        });

        this.addPropertyListener('enabled', event => {
            const { source: legend, value } = event;
            legend.group.visible = value && legend.data.length > 0;
        });

        this.addPropertyListener('position', event => {
            const { source: legend, value: position } = event;
            switch (position) {
                case 'right':
                case 'left':
                    legend.orientation = LegendOrientation.Vertical;
                    break;
                case 'bottom':
                case 'top':
                    legend.orientation = LegendOrientation.Horizontal;
                    break;
            }
        });

        this.addPropertyListener('markerShape', event => {
            this.itemSelection = this.itemSelection.setData([]);
            this.itemSelection.exit.remove();
        });

        this.addEventListener('change', () => this.update());
    }

    private _size: [number, number] = [0, 0];
    get size(): Readonly<[number, number]> {
        return this._size;
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
        const { markerShape, layoutHorizontalSpacing, layoutVerticalSpacing } = this;
        const updateSelection = this.itemSelection.setData(this.data, (_, datum) => {
            const MarkerShape = getMarker(markerShape || datum.marker.shape);
            return datum.id + '-' + datum.itemId + '-' + MarkerShape.name;
        });
        updateSelection.exit.remove();

        const enterSelection = updateSelection.enter.append(MarkerLabel).each((node, datum) => {
            const MarkerShape = getMarker(markerShape || datum.marker.shape);
            node.marker = new MarkerShape();
        });
        const itemSelection = this.itemSelection = updateSelection.merge(enterSelection);
        const itemCount = itemSelection.size;

        // Update properties that affect the size of the legend items and measure them.
        const bboxes: BBox[] = [];
        itemSelection.each((markerLabel, datum) => {
            // TODO: measure only when one of these properties or data change (in a separate routine)
            markerLabel.markerSize = this.markerSize;
            markerLabel.fontStyle = this.fontStyle;
            markerLabel.fontWeight = this.fontWeight;
            markerLabel.fontSize = this.fontSize;
            markerLabel.fontFamily = this.fontFamily;
            markerLabel.text = datum.label.text;
            markerLabel.spacing = this.itemSpacing;

            bboxes.push(markerLabel.computeBBox());
        });

        const itemHeight = bboxes.length && bboxes[0].height;
        let rowCount = 0;

        let columnWidth = 0;
        let paddedItemsWidth = 0;
        let paddedItemsHeight = 0;

        switch (this.orientation) {
            case LegendOrientation.Horizontal:

                if (!(isFinite(width) && width > 0)) {
                    return false;
                }

                rowCount = 0;
                let columnCount = 0;

                // Split legend items into columns until the width is suitable.
                do {
                    let itemsWidth = 0;

                    columnCount = 0;
                    columnWidth = 0;
                    rowCount++;

                    let i = 0;
                    while (i < itemCount) {
                        const bbox = bboxes[i];
                        if (bbox.width > columnWidth) {
                            columnWidth = bbox.width;
                        }
                        i++;
                        if (i % rowCount === 0) {
                            itemsWidth += columnWidth;
                            columnWidth = 0;
                            columnCount++;
                        }
                    }
                    if (i % rowCount !== 0) {
                        itemsWidth += columnWidth;
                        columnCount++;
                    }
                    paddedItemsWidth = itemsWidth + (columnCount - 1) * layoutHorizontalSpacing;

                } while (paddedItemsWidth > width && columnCount > 1);

                paddedItemsHeight = itemHeight * rowCount + (rowCount - 1) * layoutVerticalSpacing;

                break;

            case LegendOrientation.Vertical:

                if (!(isFinite(height) && height > 0)) {
                    return false;
                }

                rowCount = itemCount * 2;

                // Split legend items into columns until the height is suitable.
                do {
                    rowCount = (rowCount >> 1) + (rowCount % 2);
                    columnWidth = 0;

                    let itemsWidth = 0;
                    let itemsHeight = 0;
                    let columnCount = 0;

                    let i = 0;
                    while (i < itemCount) {
                        const bbox = bboxes[i];
                        if (!columnCount) {
                            itemsHeight += bbox.height;
                        }
                        if (bbox.width > columnWidth) {
                            columnWidth = bbox.width;
                        }
                        i++;
                        if (i % rowCount === 0) {
                            itemsWidth += columnWidth;
                            columnWidth = 0;
                            columnCount++;
                        }
                    }
                    if (i % rowCount !== 0) {
                        itemsWidth += columnWidth;
                        columnCount++;
                    }
                    paddedItemsWidth = itemsWidth + (columnCount - 1) * layoutHorizontalSpacing;
                    paddedItemsHeight = itemsHeight + (rowCount - 1) * layoutVerticalSpacing;

                } while (paddedItemsHeight > height && rowCount > 1);

                break;
        }

        // Top-left corner of the first legend item.
        const startX = (width - paddedItemsWidth) / 2;
        const startY = (height - paddedItemsHeight) / 2;

        let x = 0;
        let y = 0;
        columnWidth = 0;

        // Position legend items using the layout computed above.
        itemSelection.each((markerLabel, datum, i) => {
            // Round off for pixel grid alignment to work properly.
            markerLabel.translationX = Math.floor(startX + x);
            markerLabel.translationY = Math.floor(startY + y);

            const bbox = bboxes[i];
            if (bbox.width > columnWidth) {
                columnWidth = bbox.width;
            }
            if ((i + 1) % rowCount === 0) {
                x += columnWidth + layoutHorizontalSpacing;
                y = 0;
                columnWidth = 0;
            } else {
                y += bbox.height + layoutVerticalSpacing;
            }
        });

        // Update legend item properties that don't affect the layout.
        this.update();

        const size = this._size;
        const oldSize = this.oldSize;
        size[0] = paddedItemsWidth;
        size[1] = paddedItemsHeight;

        if (size[0] !== oldSize[0] || size[1] !== oldSize[1]) {
            oldSize[0] = size[0];
            oldSize[1] = size[1];
        }
    }

    update() {
        this.itemSelection.each((markerLabel, datum) => {
            const marker = datum.marker;
            markerLabel.markerFill = marker.fill;
            markerLabel.markerStroke = marker.stroke;
            markerLabel.markerStrokeWidth = this.strokeWidth;
            markerLabel.markerFillOpacity = marker.fillOpacity;
            markerLabel.markerStrokeOpacity = marker.strokeOpacity;
            markerLabel.opacity = datum.enabled ? 1 : 0.5;
            markerLabel.color = this.color;
        });
    }

    datumForPoint(x: number, y: number): LegendDatum | undefined {
        const node = this.group.pickNode(x, y);

        if (node && node.parent) {
            return node.parent.datum;
        }
    }
}
