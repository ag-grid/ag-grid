// Type definitions for @ag-grid-community/core v29.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridHeaderComp } from '../headerRendering/gridHeaderComp';
import { Component } from '../widgets/component';
export declare class GridBodyComp extends Component {
    private resizeObserverService;
    private rangeService;
    private eBodyViewport;
    private eStickyTop;
    private eTop;
    private eBottom;
    headerRootComp: GridHeaderComp;
    private eBodyClipper;
    private eBody;
    private ctrl;
    constructor();
    private init;
    private setRowAnimationCssOnBodyViewport;
    getFloatingTopBottom(): HTMLElement[];
}
