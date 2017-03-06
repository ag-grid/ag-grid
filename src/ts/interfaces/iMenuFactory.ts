import {Column} from "../entities/column";

export interface IMenuFactory {

    showMenuAfterButtonClick(column: Column, eventSource: HTMLElement, defaultTab?:string): void;

    showMenuAfterMouseEvent(column: Column, mouseEvent: MouseEvent|Touch, defaultTab?:string): void;

    isMenuEnabled(column: Column): boolean;
}
