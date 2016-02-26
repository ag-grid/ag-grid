import Column from "../entities/column";

export interface IContextMenuFactory {

    showMenu(rowIndex: number, column: Column, mouseEvent: MouseEvent): void;

}