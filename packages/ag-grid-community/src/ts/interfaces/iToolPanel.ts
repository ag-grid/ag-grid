import {IComponent} from "./iComponent";

export interface IToolPanelParams {
}

export interface IToolPanel {
    refresh(): void
}

export interface IToolPanelComp extends IToolPanel, IComponent<IToolPanelParams>{}