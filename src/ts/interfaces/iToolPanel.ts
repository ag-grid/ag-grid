import {IComponent} from "./iComponent";
import {GridPanel} from "../gridPanel/gridPanel";

export interface IToolPanel extends IComponent<any> {
    registerGridComp(gridPanel: GridPanel): void;
    refresh(): void;
    showToolPanel(show: boolean): void;
    isToolPanelShowing(): boolean;
    getPreferredWidth(): number;
}
