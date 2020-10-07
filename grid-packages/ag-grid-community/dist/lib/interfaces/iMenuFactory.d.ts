import { Column } from "../entities/column";
import { GridPanel } from "../gridPanel/gridPanel";
export interface IMenuFactory {
    showMenuAfterButtonClick(column: Column, eventSource: HTMLElement, defaultTab?: string, restrictToTabs?: string[]): void;
    showMenuAfterMouseEvent(column: Column, mouseEvent: MouseEvent | Touch, defaultTab?: string, restrictToTabs?: string[]): void;
    isMenuEnabled(column: Column): boolean;
    hideActiveMenu(): void;
    registerGridComp(gridPanel: GridPanel): void;
}
