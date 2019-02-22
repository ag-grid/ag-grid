// ag-grid-enterprise v20.1.0
import { Component, GridPanel } from "ag-grid-community";
export declare class SideBarButtonsComp extends Component {
    private panels;
    defaultPanelKey: string | null;
    private gridOptionsWrapper;
    private eventService;
    private gridPanel;
    private static readonly TEMPLATE;
    constructor();
    registerPanelComp(key: string, panelComponent: Component): void;
    registerGridComp(gridPanel: GridPanel): void;
    postConstruct(): void;
    private createButtonsHtml;
    private addButtonEvents;
    private onButtonPressed;
    private processKeyAfterKeyPressed;
    setPanelVisibility(key: string, show: boolean): void;
    clear(): void;
}
