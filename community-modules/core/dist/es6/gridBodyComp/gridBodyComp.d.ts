// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from '../widgets/component';
import { HeaderRootComp } from '../headerRendering/headerRootComp';
export declare class GridBodyComp extends Component {
    private beans;
    private gridApi;
    private $scope;
    private resizeObserverService;
    private rangeController;
    private contextMenuFactory;
    private menuFactory;
    private eBodyViewport;
    private eTop;
    private eBottom;
    headerRootComp: HeaderRootComp;
    private controller;
    constructor();
    private init;
    private setRowAnimationCssOnBodyViewport;
    private addAngularApplyCheck;
    getFloatingTopBottom(): HTMLElement[];
    addScrollEventListener(listener: () => void): void;
    removeScrollEventListener(listener: () => void): void;
}
