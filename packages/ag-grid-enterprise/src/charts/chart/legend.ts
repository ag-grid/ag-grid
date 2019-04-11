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
    id: string,   // for example, series ID
    name: string, // for example, series name
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
    }
    get data(): LegendDatum[] {
        return this._data;
    }

    update() {
        const groupSelectionData: GroupSelectionDatum[] = [];

        const updateGroups = this.groupSelection.setData(groupSelectionData);
        updateGroups.exit.remove();

        const enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(Arc).each(rect => {
            rect.tag = LegendNodeTag.Marker;
        });
        enterGroups.append(Text).each(text => {
            text.tag = LegendNodeTag.Label;
            text.textBaseline = 'middle';
            text.textAlign = 'start';
        });

        const groupSelection = updateGroups.merge(enterGroups);

        this.groupSelection = groupSelection;
    }
}

