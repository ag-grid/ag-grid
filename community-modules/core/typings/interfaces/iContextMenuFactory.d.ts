import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
import { GridPanel } from "../gridPanel/gridPanel";
export interface IContextMenuFactory {
    showMenu(node: RowNode, column: Column, value: any, mouseEvent: MouseEvent | Touch, anchorToElement: HTMLElement): boolean;
    hideActiveMenu(): void;
    registerGridComp(gridPanel: GridPanel): void;
}
