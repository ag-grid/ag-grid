// ag-grid-enterprise v21.2.2
import { AgEvent, Component, ToolPanelDef } from "ag-grid-community";
export interface SideBarButtonClickedEvent extends AgEvent {
    toolPanelId: string;
}
export declare class SideBarButtonsComp extends Component {
    static EVENT_SIDE_BAR_BUTTON_CLICKED: string;
    private gridOptionsWrapper;
    private static readonly TEMPLATE;
    private buttonComps;
    constructor();
    setToolPanelDefs(toolPanelDefs: ToolPanelDef[]): void;
    setActiveButton(id: string | undefined): void;
    private addButtonComp;
    clearButtons(): void;
    destroy(): void;
}
