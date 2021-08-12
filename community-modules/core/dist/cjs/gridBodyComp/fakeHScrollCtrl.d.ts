// Type definitions for @ag-grid-community/core v26.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
import { CtrlsService } from "../ctrlsService";
export interface IFakeHScrollComp {
    setHeight(height: number): void;
    setViewportHeight(height: number): void;
    setContainerHeight(height: number): void;
    setRightSpacerFixedWidth(width: number): void;
    setLeftSpacerFixedWidth(width: number): void;
    setInvisibleStyles(isInvisible: boolean): void;
    includeLeftSpacerScrollerCss(cssClass: string, include: boolean): void;
    includeRightSpacerScrollerCss(cssClass: string, include: boolean): void;
}
export declare class FakeHScrollCtrl extends BeanStub {
    private scrollVisibleService;
    private columnModel;
    ctrlsService: CtrlsService;
    private view;
    private enableRtl;
    private eViewport;
    private eContainer;
    constructor();
    setComp(view: IFakeHScrollComp, eViewport: HTMLElement, eContainer: HTMLElement): void;
    private postConstruct;
    private onScrollVisibilityChanged;
    private setFakeHScrollSpacerWidths;
    private setScrollVisible;
    getViewport(): HTMLElement;
    getContainer(): HTMLElement;
}
