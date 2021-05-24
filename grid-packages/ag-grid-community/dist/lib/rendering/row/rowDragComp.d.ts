import { Component } from "../../widgets/component";
import { RowNode } from "../../entities/rowNode";
import { DragItem } from "../../dragAndDrop/dragAndDropService";
import { Column } from "../../entities/column";
export interface IRowDragItem extends DragItem {
    defaultTextValue: string;
}
export declare class RowDragComp extends Component {
    private readonly cellValueFn;
    private readonly rowNode;
    private readonly column?;
    private readonly customGui?;
    private readonly dragStartPixels?;
    isCustomGui: boolean;
    private dragSource;
    constructor(cellValueFn: () => string, rowNode: RowNode, column?: Column | undefined, customGui?: HTMLElement | undefined, dragStartPixels?: number | undefined);
    private beans;
    private postConstruct;
    setDragElement(dragElement: HTMLElement, dragStartPixels?: number): void;
    private getSelectedCount;
    private checkCompatibility;
    private addDragSource;
    private removeDragSource;
}
