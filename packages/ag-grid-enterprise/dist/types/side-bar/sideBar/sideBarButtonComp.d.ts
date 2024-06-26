import type { ToolPanelDef } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
export type SideBarButtonCompEvent = 'toggleButtonClicked';
export declare class SideBarButtonComp extends Component<SideBarButtonCompEvent> {
    private readonly eToggleButton;
    private readonly eIconWrapper;
    private readonly eLabel;
    private readonly toolPanelDef;
    constructor(toolPanelDef: ToolPanelDef);
    getToolPanelId(): string;
    postConstruct(): void;
    private createTemplate;
    private setLabel;
    private setIcon;
    private onButtonPressed;
    setSelected(selected: boolean): void;
    getButtonElement(): Element;
}
