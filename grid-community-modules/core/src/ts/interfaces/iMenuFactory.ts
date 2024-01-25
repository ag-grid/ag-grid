import { Column } from "../entities/column";
import { ContainerType } from "./iAfterGuiAttachedParams";

export interface IMenuFactory {
    showMenuAfterButtonClick(column: Column, eventSource: HTMLElement, containerType: ContainerType, filtersOnly?: boolean): void;
    showMenuAfterMouseEvent(column: Column, mouseEvent: MouseEvent | Touch, containerType: ContainerType, filtersOnly?: boolean): void;
    showMenuAfterContextMenuEvent(column: Column, mouseEvent?: MouseEvent | null, touchEvent?: TouchEvent | null): void;
    isMenuEnabled(column: Column): boolean;
    hideActiveMenu(): void;
}
