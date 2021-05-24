import { BeanStub } from "../context/beanStub";
import { ControllersService } from "../controllersService";
export interface FakeHorizontalScrollView {
    setHeight(height: number): void;
    setViewportHeight(height: number): void;
    setContainerHeight(height: number): void;
    setRightSpacerFixedWidth(width: number): void;
    setLeftSpacerFixedWidth(width: number): void;
    setInvisibleStyles(isInvisible: boolean): void;
    includeLeftSpacerScrollerCss(cssClass: string, include: boolean): void;
    includeRightSpacerScrollerCss(cssClass: string, include: boolean): void;
}
export declare class FakeHorizontalScrollController extends BeanStub {
    private scrollVisibleService;
    private columnController;
    controllersService: ControllersService;
    private view;
    private enableRtl;
    private eViewport;
    private eContainer;
    constructor();
    setView(view: FakeHorizontalScrollView, eViewport: HTMLElement, eContainer: HTMLElement): void;
    private postConstruct;
    private onScrollVisibilityChanged;
    private setFakeHScrollSpacerWidths;
    private setScrollVisible;
    getViewport(): HTMLElement;
    getContainer(): HTMLElement;
}
