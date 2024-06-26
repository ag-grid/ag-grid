import type { AgEvent, BeanCollection, ComponentSelector, ToolPanelDef } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import { SideBarButtonComp } from './sideBarButtonComp';
export interface SideBarButtonClickedEvent extends AgEvent<'sideBarButtonClicked'> {
    toolPanelId: string;
}
export type AgSideBarButtonsEvent = 'sideBarButtonClicked';
export declare class AgSideBarButtons extends Component<AgSideBarButtonsEvent> {
    private focusService;
    private visibleColsService;
    wireBeans(beans: BeanCollection): void;
    private buttonComps;
    constructor();
    postConstruct(): void;
    private handleKeyDown;
    setActiveButton(id: string | undefined): void;
    addButtonComp(def: ToolPanelDef): SideBarButtonComp;
    clearButtons(): void;
    destroy(): void;
}
export declare const AgSideBarButtonsSelector: ComponentSelector;
