import { AgEvent, Component, ToolPanelDef } from "@ag-grid-community/core";
import { SideBarButtonComp } from "./sideBarButtonComp";
export interface SideBarButtonClickedEvent extends AgEvent {
    toolPanelId: string;
}
export declare class SideBarButtonsComp extends Component {
    static EVENT_SIDE_BAR_BUTTON_CLICKED: string;
    private static readonly TEMPLATE;
    private buttonComps;
    private focusService;
    private columnModel;
    constructor();
    private postConstruct;
    private handleKeyDown;
    setActiveButton(id: string | undefined): void;
    addButtonComp(def: ToolPanelDef): SideBarButtonComp;
    clearButtons(): void;
}
