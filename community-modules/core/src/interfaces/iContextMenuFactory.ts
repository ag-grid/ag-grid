import type { InternalColumn } from '../entities/column';
import type { RowNode } from '../entities/rowNode';

export interface IContextMenuFactory {
    onContextMenu(
        mouseEvent: MouseEvent | null,
        touchEvent: TouchEvent | null,
        rowNode: RowNode | null,
        column: InternalColumn | null,
        value: any,
        anchorToElement: HTMLElement
    ): void;
    hideActiveMenu(): void;
}
