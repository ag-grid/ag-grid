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
