import { Column } from "../entities/column";
import { ContainerType } from "./iAfterGuiAttachedParams";
export interface IMenuFactory {
    showMenuAfterButtonClick(column: Column | null, eventSource: HTMLElement, containerType: ContainerType, defaultTab?: string, restrictToTabs?: string[]): void;
    showMenuAfterMouseEvent(column: Column, mouseEvent: MouseEvent | Touch, defaultTab?: string, restrictToTabs?: string[]): void;
    isMenuEnabled(column: Column): boolean;
    hideActiveMenu(): void;
}
