import { Component } from 'ag-grid-community';
export declare class StatusBar extends Component {
    private static TEMPLATE;
    private userComponentFactory;
    private statusBarService;
    private eStatusBarLeft;
    private eStatusBarCenter;
    private eStatusBarRight;
    private compDestroyFunctions;
    constructor();
    private postConstruct;
    private processStatusPanels;
    private handleStatusBarChanged;
    resetStatusBar(): void;
    private destroyComponents;
    private createAndRenderComponents;
}
