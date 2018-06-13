import {GridPanel} from "../gridPanel/gridPanel";
import {IComponent} from "./iComponent";

export interface IStatusBar extends IComponent<any> {
    registerGridPanel(gridPanel: GridPanel): void;
}
