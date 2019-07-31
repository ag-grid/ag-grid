// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "./component";
declare type GroupItem = Component | HTMLElement;
interface GroupParams {
    title: string;
    enabled: boolean;
    suppressEnabledCheckbox: boolean;
    suppressOpenCloseIcons: boolean;
    items?: GroupItem[];
}
export declare class AgGroupComponent extends Component {
    private static TEMPLATE;
    private items;
    private title;
    private enabled;
    private expanded;
    private suppressEnabledCheckbox;
    private suppressOpenCloseIcons;
    private gridOptionsWrapper;
    private groupTitle;
    private eGroupOpenedIcon;
    private eGroupClosedIcon;
    private eToolbar;
    private cbGroupEnabled;
    private lbGroupTitle;
    private groupContainer;
    constructor(params?: GroupParams);
    private postConstruct;
    private setupExpandContract;
    private setOpenClosedIcons;
    isExpanded(): boolean;
    toggleGroupExpand(expanded?: boolean): this;
    addItems(items: GroupItem[]): void;
    addItem(item: GroupItem): void;
    setTitle(title: string): this;
    setEnabled(enabled: boolean, skipToggle?: boolean): this;
    isEnabled(): boolean;
    onEnableChange(callbackFn: (enabled: boolean) => void): this;
    hideEnabledCheckbox(hide: boolean): this;
    hideOpenCloseIcons(hide: boolean): this;
}
export {};
