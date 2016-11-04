import {IMenu} from "./iMenu";
import {Column} from "../entities/column";
import {ColumnController} from "../columnController/columnController";

export interface IMenuFactory {

    showMenuAfterButtonClick(column: Column, eventSource: HTMLElement): void;

    showMenuAfterMouseEvent(column: Column, mouseEvent: MouseEvent|Touch): void;

    isMenuEnabled(column: Column): boolean;
}
