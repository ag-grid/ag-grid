import { Group } from "../scene/group";
import { Selection } from "../scene/selection";
import { MarkerLabel } from "./markerLabel";
import { BBox } from "../scene/bbox";

export interface LegendDatum {
    id: string,    // for example, series ID
    tag?: number,  // optional field, used to provide auxiliary info, for example:
                   // - yField index for stacked series
                   // - slice index for pie series
    enabled: boolean,
    marker: {
        fillStyle: string,
        strokeStyle: string
    },
    label: {
        text: string
    }
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
    set size(value: [number, number]) {
        this._size = value;
    }
    get size(): [number, number] {
        return this._size;
    }

    private _data: LegendDatum[] = [];
    set data(data: LegendDatum[]) {
        this._data = data;
        this.group.visible = data.length > 0;
    }
    get data(): LegendDatum[] {
        return this._data;
    }

    private _orientation: Orientation = Orientation.Vertical;
    set orientation(value: Orientation) {
        if (this._orientation !== value) {
            this._orientation = value;
        }
    }
    get orientation(): Orientation {
        return this._orientation;
    }

    private _itemPadding: number = 4;
    set itemPadding(value: number) {
        if (this._itemPadding !== value) {
            this._itemPadding = value;
            if (this.onLayoutChange) {
                this.onLayoutChange();
            }
        }
    }
    get itemPadding(): number {
        return this._itemPadding;
    }

    private _markerPadding: number = MarkerLabel.defaults.padding;
    set markerPadding(value: number) {
        if (this._markerPadding !== value) {
            this._markerPadding = value;
            if (this.onLayoutChange) {
                this.onLayoutChange();
            }
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

    private _labelFont: string = MarkerLabel.defaults.labelFont;
    set labelFont(value: string) {
        if (this._labelFont !== value) {
            this._labelFont = value;
            if (this.onLayoutChange) {
                this.onLayoutChange();
            }
        }
    }
    get labelFont(): string {
        return this._labelFont;
    }

    private _markerSize: number = 14;
    set markerSize(value: number) {
        if (this._markerSize !== value) {
            this._markerSize = value;
            if (this.onLayoutChange) {
                this.onLayoutChange();
            }
        }
    }
    get markerSize(): number {
        return this._markerSize;
    }

    private _markerLineWidth: number = 2;
    set markerLineWidth(value: number) {
        if (this._markerLineWidth !== value) {
            this._markerLineWidth = value;
            this.update();
        }
    }
    get markerLineWidth(): number {
        return this._markerLineWidth;
    }

    performLayout() {
        const updateSelection = this.itemSelection.setData(this.data);
        updateSelection.exit.remove();

        const enterSelection = updateSelection.enter.append(MarkerLabel);
        const itemSelection = this.itemSelection = updateSelection.merge(enterSelection);

        const [width, height] = this.size;
        const itemCount = itemSelection.size;
        const itemPadding = this.itemPadding;

        const bboxes: BBox[] = [];
        itemSelection.each((markerLabel, datum) => {
            markerLabel.markerSize = this.markerSize;
            markerLabel.labelFont = this.labelFont;
            markerLabel.labelText = datum.label.text;

            bboxes.push(markerLabel.getBBox());
        });

        const itemHeight = bboxes.length && bboxes[0].height;
        let rowCount = 0;

        let columnWidth = 0;
        let paddedItemsWidth = 0;
        let paddedItemsHeight = 0;

        switch (this.orientation) {
            case Orientation.Horizontal:

                if (!width) {
                    return false;
                }

                rowCount = 0;

                // Split legend items into columns until the width is suitable.
                do {
                    let itemsWidth = 0;
                    let columnCount = 0;

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
                    paddedItemsWidth = itemsWidth + (columnCount - 1) * itemPadding;

                } while (paddedItemsWidth + itemPadding * 2 > width && rowCount > 1);

                paddedItemsHeight = itemHeight * rowCount + (rowCount - 1) * itemPadding;

                break;

            case Orientation.Vertical:

                if (!height) {
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
                    paddedItemsWidth = itemsWidth + (columnCount - 1) * itemPadding;
                    paddedItemsHeight = itemsHeight + (rowCount - 1) * itemPadding;

                } while (paddedItemsHeight > height && rowCount > 1);

                break;
        }

        // Top-left corner of the first legend item.
        const startX = (width - paddedItemsWidth) / 2;
        const startY = (height - paddedItemsHeight) / 2;

        let x = 0;
        let y = 0;
        columnWidth = 0;

        itemSelection.each((markerLabel, datum, i) => {
            // const marker = datum.marker;
            // markerLabel.markerSize = this.markerSize;
            // markerLabel.markerFill = marker.fillStyle;
            // markerLabel.markerStroke = marker.strokeStyle;
            // markerLabel.markerLineWidth = this.markerLineWidth;
            //
            // const label = datum.label;
            // markerLabel.label = label.text;
            // markerLabel.labelFont = this.labelFont;
            // markerLabel.labelFill =  this.labelColor;

            markerLabel.padding = this.markerPadding;

            markerLabel.translationX = startX + x;
            markerLabel.translationY = startY + y;

            const bbox = bboxes[i];
            if (bbox.width > columnWidth) {
                columnWidth = bbox.width;
            }
            if ((i + 1) % rowCount === 0) {
                x += columnWidth + itemPadding;
                y = 0;
                columnWidth = 0;
            } else {
                y += bbox.height + itemPadding;
            }
        });

        this.update();

        const size = this.size;
        const oldSize = this.oldSize;
        size[0] = paddedItemsWidth + itemPadding * 2;
        size[1] = paddedItemsHeight + itemPadding * 2;

        if (size[0] !== oldSize[0] || size[1] !== oldSize[1]) {
            oldSize[0] = size[0];
            oldSize[1] = size[1];
            if (this.onLayoutChange) {
                this.onLayoutChange();
            }
        }
    }

    update() {
        this.itemSelection.each((markerLabel, datum) => {
            const marker = datum.marker;
            markerLabel.markerFillStyle = marker.fillStyle;
            markerLabel.markerStrokeStyle = marker.strokeStyle;
            markerLabel.markerLineWidth = this.markerLineWidth;

            markerLabel.labelColor =  this.labelColor;
        });
    }
}
