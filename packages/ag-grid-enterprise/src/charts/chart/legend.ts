import { Group } from "../scene/group";
import { Selection } from "../scene/selection";
import { MarkerLabel } from "./markerLabel";
import { BBox } from "../scene/bbox";

export interface LegendDatum {
    id: string;       // component ID
    itemId: any;      // sub-component ID
    enabled: boolean; // the current state of the sub-component
    marker: {
        fill: string,
        stroke: string
    };
    label: {
        text: string  // display name for the sub-component
    };
}

export enum Orientation {
    Vertical,
    Horizontal
}

export class Legend {

    onLayoutChange?: () => void;

    readonly group: Group = new Group();

    private itemSelection: Selection<MarkerLabel, Group, any, any> = Selection.select(this.group).selectAll<MarkerLabel>();

    private oldSize: [number, number] = [0, 0];

    private _size: [number, number] = [0, 0];
    get size(): Readonly<[number, number]> {
        return this._size;
    }

    private _data: LegendDatum[] = [];
    set data(data: LegendDatum[]) {
        this._data = data;
        this.group.visible = this.enabled && data.length > 0;
        this.requestLayout();
    }
    get data(): LegendDatum[] {
        return this._data;
    }

    private _orientation: Orientation = Orientation.Vertical;
    set orientation(value: Orientation) {
        if (this._orientation !== value) {
            this._orientation = value;
            this.requestLayout();
        }
    }
    get orientation(): Orientation {
        return this._orientation;
    }

    private _enabled: boolean = true;
    set enabled(value: boolean) {
        if (this._enabled !== value) {
            this._enabled = value;
            this.group.visible = value && this.data.length > 0;
            this.requestLayout();
        }
    }
    get enabled(): boolean {
        return this._enabled;
    }

    private _itemPaddingX: number = 16;
    set itemPaddingX(value: number) {
        value = isFinite(value) ? value : 16;
        if (this._itemPaddingX !== value) {
            this._itemPaddingX = value;
            this.requestLayout();
        }
    }
    get itemPaddingX(): number {
        return this._itemPaddingX;
    }

    private _itemPaddingY: number = 8;
    set itemPaddingY(value: number) {
        value = isFinite(value) ? value : 8;
        if (this._itemPaddingY !== value) {
            this._itemPaddingY = value;
            this.requestLayout();
        }
    }
    get itemPaddingY(): number {
        return this._itemPaddingY;
    }

    private _markerPadding: number = MarkerLabel.defaults.padding;
    set markerPadding(value: number) {
        value = isFinite(value) ? value : MarkerLabel.defaults.padding;
        if (this._markerPadding !== value) {
            this._markerPadding = value;
            this.requestLayout();
        }
    }
    get markerPadding(): number {
        return this._markerPadding;
    }

    private _labelColor: string = MarkerLabel.defaults.labelColor;
    set labelColor(value: string) {
        if (this._labelColor !== value) {
            this._labelColor = value;
            this.update();
        }
    }
    get labelColor(): string {
        return this._labelColor;
    }

    private _labelFontStyle: string | undefined = MarkerLabel.defaults.labelFontStyle;
    set labelFontStyle(value: string | undefined) {
        if (this._labelFontStyle !== value) {
            this._labelFontStyle = value;
            this.requestLayout();
        }
    }
    get labelFontStyle(): string | undefined {
        return this._labelFontStyle;
    }

    private _labelFontWeight: string | undefined = MarkerLabel.defaults.labelFontWeight;
    set labelFontWeight(value: string | undefined) {
        if (this._labelFontWeight !== value) {
            this._labelFontWeight = value;
            this.requestLayout();
        }
    }
    get labelFontWeight(): string | undefined {
        return this._labelFontWeight;
    }

    private _labelFontSize: number = MarkerLabel.defaults.labelFontSize;
    set labelFontSize(value: number) {
        if (this._labelFontSize !== value) {
            this._labelFontSize = value;
            this.requestLayout();
        }
    }
    get labelFontSize(): number {
        return this._labelFontSize;
    }

    private _labelFontFamily: string = MarkerLabel.defaults.labelFontFamily;
    set labelFontFamily(value: string) {
        if (this._labelFontFamily !== value) {
            this._labelFontFamily = value;
            this.requestLayout();
        }
    }
    get labelFontFamily(): string {
        return this._labelFontFamily;
    }

    private _markerSize: number = 14;
    set markerSize(value: number) {
        value = isFinite(value) ? value : 14;
        if (this._markerSize !== value) {
            this._markerSize = value;
            this.requestLayout();
        }
    }
    get markerSize(): number {
        return this._markerSize;
    }

    private _markerStrokeWidth: number = 1;
    set markerStrokeWidth(value: number) {
        value = isFinite(value) ? value : 1;
        if (this._markerStrokeWidth !== value) {
            this._markerStrokeWidth = value;
            this.update();
        }
    }
    get markerStrokeWidth(): number {
        return this._markerStrokeWidth;
    }

    private requestLayout() {
        if (this.onLayoutChange) {
            this.onLayoutChange();
        }
    }

    /**
     * The method is given the desired size of the legend, which only serves as a hint.
     * The vertically oriented legend will take as much horizontal space as needed, but will
     * respect the height constraints, and the horizontal legend will take as much vertical
     * space as needed in an attempt not to exceed the given width.
     * After the layout is done, the {@link size} will contain the actual size of the legend.
     * If the actual size is not the same as the previous actual size, the legend will notify
     * the parent component via the {@link onLayoutChange} callback that another layout is needed,
     * and the above process should be repeated.
     * @param width
     * @param height
     */
    performLayout(width: number, height: number) {
        const updateSelection = this.itemSelection.setData(this.data);
        updateSelection.exit.remove();

        const enterSelection = updateSelection.enter.append(MarkerLabel);
        const itemSelection = this.itemSelection = updateSelection.merge(enterSelection);

        const itemCount = itemSelection.size;
        const itemPaddingX = this.itemPaddingX;
        const itemPaddingY = this.itemPaddingY;

        // Update properties that affect the size of the legend items and measure them.
        const bboxes: BBox[] = [];
        itemSelection.each((markerLabel, datum) => {
            // TODO: measure only when one of these properties or data change (in a separate routine)
            markerLabel.markerSize = this.markerSize;
            markerLabel.labelFontStyle = this.labelFontStyle;
            markerLabel.labelFontWeight = this.labelFontWeight;
            markerLabel.labelFontSize = this.labelFontSize;
            markerLabel.labelFontFamily = this.labelFontFamily;
            markerLabel.labelText = datum.label.text;
            markerLabel.padding = this.markerPadding;

            bboxes.push(markerLabel.getBBox());
        });

        const itemHeight = bboxes.length && bboxes[0].height;
        let rowCount = 0;

        let columnWidth = 0;
        let paddedItemsWidth = 0;
        let paddedItemsHeight = 0;

        switch (this.orientation) {
            case Orientation.Horizontal:

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
                    paddedItemsWidth = itemsWidth + (columnCount - 1) * itemPaddingX;

                } while (paddedItemsWidth > width && columnCount > 1);

                paddedItemsHeight = itemHeight * rowCount + (rowCount - 1) * itemPaddingY;

                break;

            case Orientation.Vertical:

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
                    paddedItemsWidth = itemsWidth + (columnCount - 1) * itemPaddingX;
                    paddedItemsHeight = itemsHeight + (rowCount - 1) * itemPaddingY;

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
                x += columnWidth + itemPaddingX;
                y = 0;
                columnWidth = 0;
            } else {
                y += bbox.height + itemPaddingY;
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
            this.requestLayout();
        }
    }

    update() {
        this.itemSelection.each((markerLabel, datum) => {
            const marker = datum.marker;
            markerLabel.markerFill = marker.fill;
            markerLabel.markerStroke = marker.stroke;
            markerLabel.markerStrokeWidth = this.markerStrokeWidth;
            markerLabel.opacity = datum.enabled ? 1 : 0.5;

            markerLabel.labelColor =  this.labelColor;
        });
    }

    datumForPoint(x: number, y: number): LegendDatum | undefined {
        const node = this.group.pickNode(x, y);

        if (node && node.parent) {
            return node.parent.datum;
        }
    }
}
