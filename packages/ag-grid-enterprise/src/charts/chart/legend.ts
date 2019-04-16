import { Group } from "../scene/group";
import { Selection } from "../scene/selection";
import { Text } from "../scene/shape/text";
import { Arc } from "../scene/shape/arc";
import { MarkerLabel } from "./markerLabel";

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

enum LegendNodeTag {
    Marker,
    Label
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
        this.performLayout();
        this.update();
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
    get vertical(): Orientation {
        return this._orientation;
    }

    performLayout() {
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

    update() {
        const updateGroups = this.itemSelection.setData(this.itemSelectionData);
        updateGroups.exit.remove();

        const enterGroups = updateGroups.enter.append(MarkerLabel);
        enterGroups.append(Arc).each(arc => {
            arc.tag = LegendNodeTag.Marker;
            arc.radiusX = 8;
            arc.radiusY = 8;
        });
        enterGroups.append(Text).each(text => {
            text.tag = LegendNodeTag.Label;
            text.textBaseline = 'middle';
            text.textAlign = 'start';
        });

        const itemSelection = updateGroups.merge(enterGroups);

        itemSelection.attrFn('translationY', (_, datum, index) => {
            return index * 20;
        });
        itemSelection.each((markerLabel, datum) => {
            const marker = datum.marker;
            markerLabel.markerSize = marker.size;
            markerLabel.markerFill = marker.fillStyle;
            markerLabel.markerStroke = marker.strokeStyle;
            markerLabel.markerLineWidth = marker.lineWidth;

            const label = datum.label;
            markerLabel.label = label.text;
            markerLabel.labelFont = label.font;
            markerLabel.labelFill = label.fillStyle;
        });

        this.itemSelection = itemSelection;
    }
}
