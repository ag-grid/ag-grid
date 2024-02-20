import { Column } from "../entities/column";
import { ContainerType } from "./iAfterGuiAttachedParams";
export interface IMenuFactory {
    showMenuAfterButtonClick(column: Column | undefined, eventSource: HTMLElement, containerType: ContainerType, filtersOnly?: boolean): void;
    showMenuAfterMouseEvent(column: Column | undefined, mouseEvent: MouseEvent | Touch, containerType: ContainerType, filtersOnly?: boolean): void;
    showMenuAfterContextMenuEvent(column: Column | undefined, mouseEvent?: MouseEvent | null, touchEvent?: TouchEvent | null): void;
    isMenuEnabled(column: Column): boolean;
    hideActiveMenu(): void;
}
