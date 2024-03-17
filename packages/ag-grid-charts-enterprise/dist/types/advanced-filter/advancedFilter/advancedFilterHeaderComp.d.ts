import { Component } from "ag-grid-community";
export declare class AdvancedFilterHeaderComp extends Component {
    private enabled;
    private columnModel;
    private focusService;
    private headerNavigationService;
    private eAdvancedFilter;
    private height;
    constructor(enabled: boolean);
    private postConstruct;
    getFocusableElement(): HTMLElement;
    setEnabled(enabled: boolean): void;
    refresh(): void;
    getHeight(): number;
    setInputDisabled(disabled: boolean): void;
    private setupAdvancedFilter;
    private setAriaColumnCount;
    private setAriaRowIndex;
    private onGridColumnsChanged;
    private onKeyDown;
    private navigateUpDown;
    private navigateLeftRight;
    private hasFocus;
}
