// Type definitions for ag-grid-community v19.1.4
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
    private context;
    private eventService;
    private scrollVisibleService;
    private gridApi;
    private autoWidthCalculator;
    private pinnedLeftContainer;
    private pinnedRightContainer;
    private centerContainer;
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
    setLeftVisible(visible: boolean): void;
    setRightVisible(visible: boolean): void;
}
//# sourceMappingURL=headerRootComp.d.ts.map