import { AgEvent, Component, ToolPanelDef } from "@ag-grid-community/core";
export interface SideBarButtonClickedEvent extends AgEvent {
    toolPanelId: string;
}
export declare class SideBarButtonsComp extends Component {
    static EVENT_SIDE_BAR_BUTTON_CLICKED: string;
    private static readonly TEMPLATE;
    private buttonComps;
    private focusController;
    private headerPositionUtils;
    constructor();
    private postConstruct;
    private handleKeyDown;
    setToolPanelDefs(toolPanelDefs: ToolPanelDef[]): void;
    setActiveButton(id: string | undefined): void;
    private addButtonComp;
    clearButtons(): void;
}
