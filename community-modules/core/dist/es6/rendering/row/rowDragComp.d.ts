// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
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
    constructor(cellValueFn: () => string, rowNode: RowNode, column?: Column, customGui?: HTMLElement, dragStartPixels?: number);
    private beans;
    private postConstruct;
    setDragElement(dragElement: HTMLElement, dragStartPixels?: number): void;
    private getSelectedCount;
    private checkCompatibility;
    private addDragSource;
    private removeDragSource;
}
