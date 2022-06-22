import { Group } from "../scene/group";
import { Selection } from "../scene/selection";
import { MarkerLabel } from "./markerLabel";
import { BBox } from "../scene/bbox";
import { FontStyle, FontWeight, getFont } from "../scene/shape/text";
import { Marker } from "./marker/marker";
import { AgChartLegendClickEvent, AgChartLegendListeners } from "./agChartOptions";
import { getMarker } from "./marker/util";
import { createId } from "../util/id";
import { RedrawType } from "../scene/node";
import { HdpiCanvas } from "../canvas/hdpiCanvas";

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

interface LegendLabelFormatterParams {
    id: string;
    itemId: any;
    value: string;
}

export class LegendLabel {
    characterLimit = undefined;
    color = 'black';
    fontStyle?: FontStyle = undefined;
    fontWeight?: FontWeight = undefined;
    fontSize = 12;
    fontFamily = 'Verdana, sans-serif';
    formatter?: (params: LegendLabelFormatterParams) => string = undefined;
    getFont(): string {
        return getFont(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
    }
}

export class LegendMarker {
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
    padding: number = 8;
    strokeWidth: number = 1;

    parent?: { onMarkerShapeChange(): void }
}

export class LegendItem {
    readonly marker = new LegendMarker();
    readonly label = new LegendLabel();
    /** Used to constrain the width of legend items. */
    maxWidth?: number = undefined;
    /**
     * The legend uses grid layout for its items, occupying as few columns as possible when positioned to left or right,
     * and as few rows as possible when positioned to top or bottom. This config specifies the amount of horizontal
     * padding between legend items.
     */
    paddingX = 16;
    /**
     * The legend uses grid layout for its items, occupying as few columns as possible when positioned to left or right,
     * and as few rows as possible when positioned to top or bottom. This config specifies the amount of vertical
     * padding between legend items.
     */
    paddingY = 8;
}

const NO_OP_LISTENER = () => {};

export class LegendListeners implements Required<AgChartLegendListeners> {
    legendItemClick: (event: AgChartLegendClickEvent) => void = NO_OP_LISTENER;
}

export class Legend {

    static className = 'Legend';

    readonly id = createId(this);

    onLayoutChange?: () => void;

    readonly group: Group = new Group({ name: 'legend', layer: true, zIndex: 300 });

    private itemSelection: Selection<MarkerLabel, Group, any, any> = Selection.select(this.group).selectAll<MarkerLabel>();

    private oldSize: [number, number] = [0, 0];

    readonly item = new LegendItem();
    readonly listeners = new LegendListeners();

    truncatedItems: Set<string> = new Set();

    private _data: LegendDatum[] = [];
    set data(value: LegendDatum[]) {
        this._data = value;

        this.group.visible = value.length > 0 && this.enabled;
    }
    get data() {
        return this._data;
    }

    private _enabled = true;
    set enabled(value: boolean) {
        this._enabled = value;

        this.group.visible = value && this.data.length > 0;
    }
    get enabled() {
        return this._enabled;
    }

    orientation: LegendOrientation = LegendOrientation.Vertical;
    private _position: LegendPosition = LegendPosition.Right;
    set position(value: LegendPosition) {
        this._position = value;

        switch (value) {
            case 'right':
            case 'left':
                this.orientation = LegendOrientation.Vertical;
                break;
            case 'bottom':
            case 'top':
                this.orientation = LegendOrientation.Horizontal;
                break;
        }
    }
    get position() {
        return this._position;
    }

    constructor() {
        this.item.marker.parent = this;
    }

    public onMarkerShapeChange() {
        this.itemSelection = this.itemSelection.setData([]);
        this.itemSelection.exit.remove();
        this.group.markDirty(this.group, RedrawType.MINOR);
    }

    /**
     * Spacing between the legend and the edge of the chart's element.
     */
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
            paddingX, paddingY, label, maxWidth,
            marker: {
                size: markerSize,
                padding: markerPadding,
                shape: markerShape
            },
            label: {
                characterLimit = Infinity,
                fontStyle,
                fontWeight,
                fontSize,
                fontFamily
            },
        } = this.item;
        const updateSelection = this.itemSelection.setData(this.data, (_, datum) => {
            const Marker = getMarker(markerShape || datum.marker.shape);
            return datum.id + '-' + datum.itemId + '-' + Marker.name;
        });
        updateSelection.exit.remove();

        const enterSelection = updateSelection.enter.append(MarkerLabel).each((node, datum) => {
            const Marker = getMarker(markerShape || datum.marker.shape);
            node.marker = new Marker();
        });
        const itemSelection = this.itemSelection = updateSelection.merge(enterSelection);
        const itemCount = itemSelection.size;

        // Update properties that affect the size of the legend items and measure them.
        const bboxes: BBox[] = [];

        const font = label.getFont();
        const ellipsis = `...`;

        const itemMaxWidthPercentage = 0.8;
        const maxItemWidth = maxWidth ?? (width * itemMaxWidthPercentage);

        itemSelection.each((markerLabel, datum) => {
            // TODO: measure only when one of these properties or data change (in a separate routine)
            let text = datum.label.text;
            markerLabel.markerSize = markerSize;
            markerLabel.spacing = markerPadding;
            markerLabel.fontStyle = fontStyle;
            markerLabel.fontWeight = fontWeight;
            markerLabel.fontSize = fontSize;
            markerLabel.fontFamily = fontFamily;

            const textChars = text.split('');
            let addEllipsis = false;

            if (text.length > characterLimit) {
                text = `${text.substring(0, characterLimit - ellipsis.length)}`;
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
                    };

                    cumCharSize += characterWidths[char];

                    if (cumCharSize > maxItemWidth) {
                        break;
                    }

                    truncatedText += char;
                }

                text = truncatedText;
                addEllipsis = true;
            }

            const id = datum.itemId || datum.id;
            if (addEllipsis) {
                text += ellipsis;
                this.truncatedItems.add(id);
            } else {
                this.truncatedItems.delete(id);
            }

            markerLabel.text = text;
            bboxes.push(markerLabel.computeBBox());
        });

        const itemHeight = bboxes.length && bboxes[0].height;
        let rowCount = 0;

        let columnWidth = 0;
        let paddedItemsWidth = 0;
        let paddedItemsHeight = 0;

        width = Math.max(1, width);
        height = Math.max(1, height);

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
                    paddedItemsWidth = itemsWidth + (columnCount - 1) * paddingX;

                } while (paddedItemsWidth > width && columnCount > 1);

                paddedItemsHeight = itemHeight * rowCount + (rowCount - 1) * paddingY;

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
                    paddedItemsWidth = itemsWidth + (columnCount - 1) * paddingX;
                    paddedItemsHeight = itemsHeight + (rowCount - 1) * paddingY;

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
                x += columnWidth + paddingX;
                y = 0;
                columnWidth = 0;
            } else {
                y += bbox.height + paddingY;
            }
        });

        // Update legend item properties that don't affect the layout.
        this.update();

        const size = this.size;
        const oldSize = this.oldSize;
        size[0] = paddedItemsWidth;
        size[1] = paddedItemsHeight;

        if (size[0] !== oldSize[0] || size[1] !== oldSize[1]) {
            oldSize[0] = size[0];
            oldSize[1] = size[1];
        }
    }

    update() {
        const { marker: { strokeWidth }, label: { color } } = this.item;
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
        const node = this.group.pickNode(x, y);

        if (node && node.parent) {
            return node.parent.datum;
        }
    }
}
