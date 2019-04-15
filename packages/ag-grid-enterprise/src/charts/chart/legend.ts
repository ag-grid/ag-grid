import { Group } from "../scene/group";
import { Selection } from "../scene/selection";
import { Text } from "../scene/shape/text";
import { Arc } from "../scene/shape/arc";

interface GroupSelectionDatum {
    marker: {
        x: number,
        y: number,
        radius: number,
        fillStyle: string,
        strokeStyle: string,
        lineWidth: number
    },
    label: {
        x: number,
        y: number,
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

export class Legend {

    readonly group: Group = new Group();

    private groupSelection: Selection<Group, Group, any, any> = Selection.select(this.group).selectAll<Group>();

    private _data: LegendDatum[] = [];
    set data(data: LegendDatum[]) {
        this._data = data;
        this.update();
    }
    get data(): LegendDatum[] {
        return this._data;
    }

    update() {
        const data = this.data;
        const groupSelectionData: GroupSelectionDatum[] = data.map(datum => {
            return {
                marker: {
                    x: 0,
                    y: 10,
                    radius: 6,
                    fillStyle: datum.marker.fillStyle,
                    strokeStyle: datum.marker.strokeStyle,
                    lineWidth: 2
                },
                label: {
                    x: 14,
                    y: 10,
                    text: datum.name,
                    font: '14px Verdana',
                    fillStyle: 'black'
                }
            };
        });

        const updateGroups = this.groupSelection.setData(groupSelectionData);
        updateGroups.exit.remove();

        const enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(Arc).each(arc => {
            arc.tag = LegendNodeTag.Marker;
            arc.radiusX = 8;
            arc.radiusY = 8;
            arc.centerY = 10;
        });
        enterGroups.append(Text).each(text => {
            text.tag = LegendNodeTag.Label;
            text.textBaseline = 'middle';
            text.textAlign = 'start';
        });

        const groupSelection = updateGroups.merge(enterGroups);

        groupSelection.attrFn('translationY', (_, datum, index) => {
            return index * 20;
        });
        groupSelection.selectByClass(Arc).each((arc, datum) => {
            const marker = datum.marker;
            arc.radiusX = marker.radius;
            arc.radiusY = marker.radius;
            arc.fillStyle = marker.fillStyle;
            arc.strokeStyle = marker.strokeStyle;
            arc.lineWidth = marker.lineWidth;
        });
        groupSelection.selectByClass(Text).each((text, datum) => {
            const label = datum.label;
            text.text = label.text;
            text.font = label.font;
            text.fillStyle = label.fillStyle;
            text.x = label.x;
            text.y = label.y;
        });

        this.groupSelection = groupSelection;
    }
}

