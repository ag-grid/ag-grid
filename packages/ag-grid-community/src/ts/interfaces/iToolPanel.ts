import { IComponent } from "./iComponent";
import { GridApi } from "../gridApi";

export interface IToolPanelParams {
    api: GridApi;
}

export interface IToolPanel {
    refresh(): void;
}

export interface IToolPanelComp extends IToolPanel, IComponent<IToolPanelParams> {}