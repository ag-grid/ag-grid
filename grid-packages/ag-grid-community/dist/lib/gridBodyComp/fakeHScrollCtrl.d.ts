import { BeanStub } from "../context/beanStub";
import { CtrlsService } from "../ctrlsService";
export interface IFakeHScrollComp {
    setHeight(height: number): void;
    setBottom(bottom: number): void;
    setViewportHeight(height: number): void;
    setContainerHeight(height: number): void;
    setRightSpacerFixedWidth(width: number): void;
    setLeftSpacerFixedWidth(width: number): void;
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
    includeLeftSpacerScrollerCss(cssClass: string, include: boolean): void;
    includeRightSpacerScrollerCss(cssClass: string, include: boolean): void;
}
export declare class FakeHScrollCtrl extends BeanStub {
    private scrollVisibleService;
    private columnModel;
    ctrlsService: CtrlsService;
    private pinnedRowModel;
    private view;
    private enableRtl;
    private invisibleScrollbar;
    private eViewport;
    private eContainer;
    private eGui;
    setComp(view: IFakeHScrollComp, eGui: HTMLElement, eViewport: HTMLElement, eContainer: HTMLElement): void;
    addActiveListenerToggles(): void;
    private initialiseInvisibleScrollbar;
    private onPinnedRowDataChanged;
    private refreshCompBottom;
    private onScrollVisibilityChanged;
    private hideAndShowInvisibleScrollAsNeeded;
    private setFakeHScrollSpacerWidths;
    private setScrollVisible;
    getViewport(): HTMLElement;
    getContainer(): HTMLElement;
}
