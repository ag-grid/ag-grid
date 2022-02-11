// Type definitions for @ag-grid-community/core v27.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridHeaderComp } from '../headerRendering/gridHeaderComp';
import { Component } from '../widgets/component';
export declare class GridBodyComp extends Component {
    private resizeObserverService;
    private rangeService;
    private eBodyViewport;
    private eTop;
    private eBottom;
    headerRootComp: GridHeaderComp;
    private ctrl;
    constructor();
    private init;
    private setRowAnimationCssOnBodyViewport;
    getFloatingTopBottom(): HTMLElement[];
}
