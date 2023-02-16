import { Component, ToolPanelDef } from "@ag-grid-community/core";
export declare class SideBarButtonComp extends Component {
    static EVENT_TOGGLE_BUTTON_CLICKED: string;
    private eToggleButton;
    private eIconWrapper;
    private eLabel;
    private readonly toolPanelDef;
    constructor(toolPanelDef: ToolPanelDef);
    getToolPanelId(): string;
    private postConstruct;
    private createTemplate;
    private setLabel;
    private setIcon;
    private onButtonPressed;
    setSelected(selected: boolean): void;
}
