// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridPanel } from "../gridPanel/gridPanel";
import { Component } from "../widgets/component";
export declare class HeaderRootComp extends Component {
    private static TEMPLATE;
    private ePinnedLeftHeader;
    private ePinnedRightHeader;
    private eHeaderContainer;
    private eHeaderViewport;
    private gridOptionsWrapper;
    private columnController;
    private eventService;
    private gridApi;
    private autoWidthCalculator;
    private childContainers;
    private gridPanel;
    private printLayout;
    constructor();
    registerGridComp(gridPanel: GridPanel): void;
    private postConstruct;
    private onDomLayoutChanged;
    setHorizontalScroll(offset: number): void;
    forEachHeaderElement(callback: (renderedHeaderElement: Component) => void): void;
    destroy(): void;
    refreshHeader(): void;
    private onPivotModeChanged;
    setHeight(height: number): void;
    private addPreventHeaderScroll;
    setHeaderContainerWidth(width: number): void;
    setLeftVisible(visible: boolean): void;
    setRightVisible(visible: boolean): void;
    getHeaderRowCount(): number;
}
