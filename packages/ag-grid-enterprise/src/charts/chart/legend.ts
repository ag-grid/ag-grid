import { Group } from "../scene/group";
import { Selection } from "../scene/selection";
import { MarkerLabel } from "./markerLabel";
import { BBox } from "../scene/bbox";

interface ItemSelectionDatum {
    marker: {
        fillStyle: string,
        strokeStyle: string
    },
    label: {
        text: string
    }
}

export interface LegendDatum extends ItemSelectionDatum {
    id: string,    // for example, series ID
    tag?: number,  // optional field, used to provide auxiliary info, for example:
                   // - yField index for stacked series
                   // - slice index for pie series
    enabled: boolean
}

export enum Orientation {
    Vertical,
    Horizontal
}

export class Legend {

    readonly group: Group = new Group();

    private itemSelection: Selection<MarkerLabel, Group, any, any> = Selection.select(this.group).selectAll<MarkerLabel>();

    private itemSelectionData: ItemSelectionDatum[] = [];

    private _data: LegendDatum[] = [];
    set data(data: LegendDatum[]) {
        this.itemSelectionData = this._data = data;
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

    // private _markerPosition: MarkerPosition = MarkerPosition.Left;
    // set markerPosition(value: MarkerPosition) {
    //     if (this._markerPosition !== value) {
    //         this._markerPosition = value;
    //         this.itemSelection.each(markerLabel => {
    //             markerLabel.markerPosition = value;
    //         });
    //         this.layoutChanged();
    //     }
    // }
    // get markerPosition(): MarkerPosition {
    //     return this._markerPosition;
    // }

    private _size: [number, number] = [0, 0];
    set size(value: [number, number]) {
        this._size = value;
        // this.layoutChanged();
    }
    get size(): [number, number] {
        return this._size;
    }

    onDataChange?: () => void;
    onLayoutChange?: () => void;

    private _labelColor: string = 'black';
    set labelColor(value: string) {
        if (this._labelColor !== value) {
            this._labelColor = value;
            this.dataChanged();
        }
    }
    get labelColor(): string {
        return this._labelColor;
    }

    private _labelFont: string = '12px Tahoma';
    set labelFont(value: string) {
        if (this._labelFont !== value) {
            this._labelFont = value;
            this.dataChanged();
        }
    }
    get labelFont(): string {
        return this._labelFont;
    }

    private _markerSize: number = 14;
    set markerSize(value: number) {
        if (this._markerSize !== value) {
            this._markerSize = value;
            this.layoutChanged();
        }
    }
    get markerSize(): number {
        return this._markerSize;
    }

    private _markerLineWidth: number = 2;
    set markerLineWidth(value: number) {
        if (this._markerLineWidth !== value) {
            this._markerLineWidth = value;
            this.layoutChanged();
        }
    }
    get markerLineWidth(): number {
        return this._markerLineWidth;
    }

    private oldSize: [number, number] = [0, 0];

    performLayout() {
        const updateSelection = this.itemSelection.setData(this.itemSelectionData);
        updateSelection.exit.remove();

        const enterSelection = updateSelection.enter.append(MarkerLabel);
        const itemSelection = this.itemSelection = updateSelection.merge(enterSelection);
        const [width, height] = this.size;
        const itemCount = itemSelection.size;
        const gap = 4;

        const bboxes: BBox[] = [];
        itemSelection.each(item => bboxes.push(item.getBBox()));

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
                    paddedItemsWidth = itemsWidth + (columnCount - 1) * gap;

                } while (paddedItemsWidth + gap * 2 > width && rowCount > 1);

                paddedItemsHeight = itemHeight * rowCount + (rowCount - 1) * gap;

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
                    paddedItemsWidth = itemsWidth + (columnCount - 1) * gap;
                    paddedItemsHeight = itemsHeight + (rowCount - 1) * gap;

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
            const marker = datum.marker;
            markerLabel.markerSize = this.markerSize;
            markerLabel.markerFill = marker.fillStyle;
            markerLabel.markerStroke = marker.strokeStyle;
            markerLabel.markerLineWidth = this.markerLineWidth;

            const label = datum.label;
            markerLabel.label = label.text;
            markerLabel.labelFont = this.labelFont;
            markerLabel.labelFill =  this.labelColor;

            markerLabel.translationX = startX + x;
            markerLabel.translationY = startY + y;

            const bbox = bboxes[i];
            if (bbox.width > columnWidth) {
                columnWidth = bbox.width;
            }
            if ((i + 1) % rowCount === 0) {
                x += columnWidth + gap;
                y = 0;
                columnWidth = 0;
            } else {
                y += bbox.height + gap;
            }
        });

        const size = this.size;
        const oldSize = this.oldSize;
        size[0] = paddedItemsWidth + gap * 2;
        size[1] = paddedItemsHeight + gap * 2;

        if (size[0] !== oldSize[0] || size[1] !== oldSize[1]) {
            oldSize[0] = size[0];
            oldSize[1] = size[1];
            this.layoutChanged();
        }
    }

    private dataChanged() {
        if (this.onDataChange) {
            this.onDataChange();
        }
    }

    private layoutChanged() {
        if (this.onLayoutChange) {
            this.onLayoutChange();
        }
    }
}
