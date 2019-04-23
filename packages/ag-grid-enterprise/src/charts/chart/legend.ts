import { Group } from "../scene/group";
import { Selection } from "../scene/selection";
import { MarkerLabel } from "./markerLabel";
import { BBox } from "../scene/bbox";

interface ItemSelectionDatum {
    marker: {
        size: number,
        fillStyle: string,
        strokeStyle: string,
        lineWidth: number
    },
    label: {
        text: string,
        font: string,
        fillStyle: string
    }
}

export interface LegendDatum {
    id: string,    // for example, series ID
    tag?: number,  // optional field, used to provide auxiliary info, for example:
                   // - yField index for stacked series
                   // - slice index for pie series
    name: string,  // name to render, for example, series name
    marker: {
        fillStyle: string,
        strokeStyle: string
    },
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
        this._data = data;
        this.processData();
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
    //         // this.performLayout();
    //         if (this.onSizeChange) {
    //             this.onSizeChange();
    //         }
    //     }
    // }
    // get markerPosition(): MarkerPosition {
    //     return this._markerPosition;
    // }

    private _size: [number, number] = [0, 0];
    set size(value: [number, number]) {
        this._size = value;
        // this.processData();
        // this.performLayout();
    }
    get size(): [number, number] {
        return this._size;
    }

    onSizeChange?: () => void;

    processData() {
        this.itemSelectionData = this.data.map(datum => {
            return {
                marker: {
                    size: 14,
                    fillStyle: datum.marker.fillStyle,
                    strokeStyle: datum.marker.strokeStyle,
                    lineWidth: 2
                },
                label: {
                    text: datum.name,
                    font: '12px Verdana',
                    fillStyle: 'black'
                }
            };
        });
    }

    private oldSize: [number, number] = [0, 0];

    performLayout() {
        const updateSelection = this.itemSelection.setData(this.itemSelectionData);
        updateSelection.exit.remove();

        const enterSelection = updateSelection.enter.append(MarkerLabel);
        const itemSelection = updateSelection.merge(enterSelection);
        this.itemSelection = itemSelection;
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
            markerLabel.markerSize = marker.size;
            markerLabel.markerFill = marker.fillStyle;
            markerLabel.markerStroke = marker.strokeStyle;
            markerLabel.markerLineWidth = marker.lineWidth;

            const label = datum.label;
            markerLabel.label = label.text;
            markerLabel.labelFont = label.font;
            markerLabel.labelFill = label.fillStyle;

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
            if (this.onSizeChange) {
                this.onSizeChange();
            }
        }
    }
}
