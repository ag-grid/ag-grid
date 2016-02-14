import {IMenu} from "./iMenu";
import Column from "../entities/column";
import {ColumnController} from "../columnController/columnController";

export interface IMenuFactory {

    createMenu(column: Column): ICreateMenuResult;

}

export interface ICreateMenuResult {
    menuGui: HTMLElement,
    afterGuiAttached?: Function
}
