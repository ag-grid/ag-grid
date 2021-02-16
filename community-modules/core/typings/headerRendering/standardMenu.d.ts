import { BeanStub } from "../context/beanStub";
import { IMenuFactory } from '../interfaces/iMenuFactory';
import { Column } from '../entities/column';
import { GridPanel } from "../gridPanel/gridPanel";
export declare class StandardMenuFactory extends BeanStub implements IMenuFactory {
    private filterManager;
    private popupService;
    private focusController;
    private hidePopup;
    private tabListener;
    private gridPanel;
    registerGridComp(gridPanel: GridPanel): void;
    hideActiveMenu(): void;
    showMenuAfterMouseEvent(column: Column, mouseEvent: MouseEvent | Touch): void;
    showMenuAfterButtonClick(column: Column, eventSource: HTMLElement): void;
    showPopup(column: Column, positionCallback: (eMenu: HTMLElement) => void, eventSource: HTMLElement): void;
    private trapFocusWithin;
    isMenuEnabled(column: Column): boolean;
}
