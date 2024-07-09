import type { BeanCollection } from '../../context/context';
import type { DragItem } from '../../dragAndDrop/dragAndDropService';
import type { AgColumn } from '../../entities/agColumn';
import type { RowNode } from '../../entities/rowNode';
import { Component } from '../../widgets/component';
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
    private beans;
    private mouseDownListener;
    wireBeans(beans: BeanCollection): void;
    constructor(cellValueFn: () => string, rowNode: RowNode, column?: AgColumn<any> | undefined, customGui?: HTMLElement | undefined, dragStartPixels?: number | undefined, suppressVisibilityChange?: boolean | undefined);
    isCustomGui(): boolean;
    postConstruct(): void;
    setDragElement(dragElement: HTMLElement, dragStartPixels?: number): void;
    private getSelectedNodes;
    private checkCompatibility;
    private getDragItem;
    private getRowDragText;
    private addDragSource;
    destroy(): void;
    private removeDragSource;
    private removeMouseDownListener;
}
