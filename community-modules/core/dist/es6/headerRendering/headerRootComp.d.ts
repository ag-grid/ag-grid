// Type definitions for @ag-grid-community/core v26.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { HeaderContainer } from './headerContainer';
import { Component } from '../widgets/component';
export declare type HeaderContainerPosition = 'left' | 'right' | 'center';
export declare class HeaderRootComp extends Component {
    private static TEMPLATE;
    private ePinnedLeftHeader;
    private ePinnedRightHeader;
    private eHeaderContainer;
    private eHeaderViewport;
    private columnModel;
    private gridApi;
    private autoWidthCalculator;
    private focusService;
    private headerNavigationService;
    private pinnedWidthService;
    private ctrlsService;
    private printLayout;
    private headerContainers;
    constructor();
    private postConstruct;
    private setupHeaderHeight;
    private registerHeaderContainer;
    protected onTabKeyDown(e: KeyboardEvent): void;
    protected handleKeyDown(e: KeyboardEvent): void;
    protected onFocusOut(e: FocusEvent): void;
    private onDomLayoutChanged;
    setHorizontalScroll(offset: number): void;
    forEachHeaderElement(callback: (renderedHeaderElement: Component) => void): void;
    refreshHeader(): void;
    private onPivotModeChanged;
    private setHeaderHeight;
    private addPreventHeaderScroll;
    getHeaderContainers(): Map<HeaderContainerPosition, HeaderContainer>;
    private onPinnedLeftWidthChanged;
    private onPinnedRightWidthChanged;
}
