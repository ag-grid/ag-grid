import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
export interface IContextMenuFactory {
    onContextMenu(mouseEvent: MouseEvent | null, touchEvent: TouchEvent | null, rowNode: RowNode | null, column: AgColumn | null, value: any, anchorToElement: HTMLElement): void;
    hideActiveMenu(): void;
}
