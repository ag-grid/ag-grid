import { BeanStub } from "../context/beanStub";
import { CtrlsService } from "../ctrlsService";
import { ColumnAnimationService } from "../rendering/columnAnimationService";
export interface SetScrollsVisibleParams {
    horizontalScrollShowing: boolean;
    verticalScrollShowing: boolean;
}
export declare class ScrollVisibleService extends BeanStub {
    ctrlsService: CtrlsService;
    columnAnimationService: ColumnAnimationService;
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
