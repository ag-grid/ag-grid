import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
import { GridPanelComp } from "../gridPanel/gridPanelComp";

export interface IContextMenuFactory {
    showMenu(node: RowNode, column: Column, value: any, mouseEvent: MouseEvent | Touch, anchorToElement: HTMLElement): boolean;
    hideActiveMenu(): void;
    registerGridComp(gridPanel: GridPanelComp): void;
}