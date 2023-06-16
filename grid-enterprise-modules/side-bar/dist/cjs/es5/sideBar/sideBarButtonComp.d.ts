import { Component, ToolPanelDef } from "@ag-grid-community/core";
export declare class SideBarButtonComp extends Component {
    static EVENT_TOGGLE_BUTTON_CLICKED: string;
    private readonly eToggleButton;
    private readonly eIconWrapper;
    private readonly eLabel;
    private readonly toolPanelDef;
    constructor(toolPanelDef: ToolPanelDef);
    getToolPanelId(): string;
    private postConstruct;
    private createTemplate;
    private setLabel;
    private setIcon;
    private onButtonPressed;
    setSelected(selected: boolean): void;
    getButtonElement(): Element;
}
