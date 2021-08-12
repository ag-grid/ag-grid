// Type definitions for @ag-grid-community/core v26.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
import { CtrlsService } from "../ctrlsService";
export interface SetScrollsVisibleParams {
    horizontalScrollShowing: boolean;
    verticalScrollShowing: boolean;
}
export declare class ScrollVisibleService extends BeanStub {
    private columnApi;
    private gridApi;
    ctrlsService: CtrlsService;
    private horizontalScrollShowing;
    private verticalScrollShowing;
    private postConstruct;
    onDisplayedColumnsChanged(): void;
    private onDisplayedColumnsWidthChanged;
    private update;
    private updateImpl;
    setScrollsVisible(params: SetScrollsVisibleParams): void;
    isHorizontalScrollShowing(): boolean;
    isVerticalScrollShowing(): boolean;
}
