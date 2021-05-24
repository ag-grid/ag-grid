import { BeanStub } from "../context/beanStub";
import { ControllersService } from "../controllersService";
export interface SetScrollsVisibleParams {
    horizontalScrollShowing: boolean;
    verticalScrollShowing: boolean;
}
export declare class ScrollVisibleService extends BeanStub {
    private columnApi;
    private gridApi;
    controllersService: ControllersService;
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
