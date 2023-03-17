import { Component } from "../../widgets/component";
import { RowNode } from "../../entities/rowNode";
import { DragItem } from "../../dragAndDrop/dragAndDropService";
import { Column } from "../../entities/column";
export interface IRowDragItem extends DragItem {
    /** The default text that would be applied to this Drag Element */
    defaultTextValue: string;
}
export declare class RowDragComp extends Component {
    private readonly cellValueFn;
    private readonly rowNode;
    private readonly column?;
    private readonly customGui?;
    private readonly dragStartPixels?;
    private readonly suppressVisibilityChange?;
    private dragSource;
    private readonly beans;
    constructor(cellValueFn: () => string, rowNode: RowNode, column?: Column | undefined, customGui?: HTMLElement | undefined, dragStartPixels?: number | undefined, suppressVisibilityChange?: boolean | undefined);
    isCustomGui(): boolean;
    private postConstruct;
    setDragElement(dragElement: HTMLElement, dragStartPixels?: number): void;
    private getSelectedNodes;
    private checkCompatibility;
    private getDragItem;
    private getRowDragText;
    private addDragSource;
    private removeDragSource;
}
