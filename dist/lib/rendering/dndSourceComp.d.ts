import { Component } from "../widgets/component";
import { RowNode } from "../entities/rowNode";
import { Beans } from "./beans";
import { Column } from "../entities/column";
export declare class DndSourceComp extends Component {
    private readonly beans;
    private readonly rowNode;
    private readonly column;
    private readonly cellValue;
    private readonly eCell;
    constructor(rowNode: RowNode, column: Column, cellValue: string, beans: Beans, eCell: HTMLElement);
    private postConstruct;
    private addDragSource;
    private onDragStart;
    private checkVisibility;
}
