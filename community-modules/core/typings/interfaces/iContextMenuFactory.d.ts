import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
export interface IContextMenuFactory {
    onContextMenu(mouseEvent: MouseEvent | null, touchEvent: TouchEvent | null, rowNode: RowNode | null, column: Column | null, value: any, anchorToElement: HTMLElement): void;
    hideActiveMenu(): void;
}
