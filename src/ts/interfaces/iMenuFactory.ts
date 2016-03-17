import {IMenu} from "./iMenu";
import {Column} from "../entities/column";
import {ColumnController} from "../columnController/columnController";

export interface IMenuFactory {

    showMenu(column: Column, eventSource: HTMLElement): void;

    isMenuEnabled(column: Column): boolean;
}
