import { Component } from "../../widgets/component";
import { RowNode } from "../../entities/rowNode";
import { DragItem } from "../../dragAndDrop/dragAndDropService";
import { Beans } from "../beans";
import { Column } from "../../entities/column";
export interface IRowDragItem extends DragItem {
    defaultTextValue: string;
}
export declare class RowDragComp extends Component {
    private readonly rowNode;
    private readonly column;
    private readonly cellValueFn;
    private readonly beans;
    private readonly customGui?;
    isCustomGui: boolean;
    private dragSource;
    constructor(rowNode: RowNode, column: Column, cellValueFn: () => string, beans: Beans, customGui?: HTMLElement | undefined);
    private postConstruct;
    setDragElement(dragElement: HTMLElement): void;
    private getSelectedCount;
    private checkCompatibility;
    private addDragSource;
    private removeDragSource;
}
