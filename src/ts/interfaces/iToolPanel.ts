import {IComponent} from "./iComponent";

export interface IToolPanel extends IComponent<any> {
    refresh(): void;
    showToolPanel(show: boolean): void;
    isToolPanelShowing(): boolean;
    init(): void;
}
