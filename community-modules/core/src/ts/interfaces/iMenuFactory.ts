import { Column } from "../entities/column";
import { GridPanelComp } from "../gridPanel/gridPanelComp";

export interface IMenuFactory {
    showMenuAfterButtonClick(column: Column | null, eventSource: HTMLElement, defaultTab?: string, restrictToTabs?: string[]): void;
    showMenuAfterMouseEvent(column: Column, mouseEvent: MouseEvent | Touch, defaultTab?: string, restrictToTabs?: string[]): void;
    isMenuEnabled(column: Column): boolean;
    hideActiveMenu(): void;
    registerGridComp(gridPanel: GridPanelComp): void;
}
