import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
export interface SetScrollsVisibleParams {
    horizontalScrollShowing: boolean;
    verticalScrollShowing: boolean;
}
export declare class ScrollVisibleService extends BeanStub implements NamedBean {
    beanName: "scrollVisibleService";
    private ctrlsService;
    private columnAnimationService;
    wireBeans(beans: BeanCollection): void;
    private horizontalScrollShowing;
    private verticalScrollShowing;
    postConstruct(): void;
    onDisplayedColumnsChanged(): void;
    private onDisplayedColumnsWidthChanged;
    private update;
    private updateImpl;
    setScrollsVisible(params: SetScrollsVisibleParams): void;
    isHorizontalScrollShowing(): boolean;
    isVerticalScrollShowing(): boolean;
}
