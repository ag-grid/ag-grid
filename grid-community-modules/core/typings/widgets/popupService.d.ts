import { Column } from "../entities/column";
import { BeanStub } from "../context/beanStub";
import { IAfterGuiAttachedParams } from "../interfaces/iAfterGuiAttachedParams";
import { AgPromise } from "../utils";
import { CtrlsService } from "../ctrlsService";
import { ResizeObserverService } from "../misc/resizeObserverService";
import { IRowNode } from "../interfaces/iRowNode";
export interface PopupPositionParams {
    ePopup: HTMLElement;
    column?: Column | null;
    rowNode?: IRowNode | null;
    nudgeX?: number;
    nudgeY?: number;
    position?: 'over' | 'under';
    alignSide?: 'left' | 'right';
    keepWithinBounds?: boolean;
    skipObserver?: boolean;
    updatePosition?: () => {
        x: number;
        y: number;
    };
    postProcessCallback?: () => void;
}
export interface PopupEventParams {
    originalMouseEvent?: MouseEvent | Touch | null;
    mouseEvent?: MouseEvent;
    touchEvent?: TouchEvent;
    keyboardEvent?: KeyboardEvent;
}
export interface AgPopup {
    element: HTMLElement;
    wrapper: HTMLElement;
    hideFunc: () => void;
    isAnchored: boolean;
    instanceId: number;
    alignedToElement?: HTMLElement;
    stopAnchoringPromise?: AgPromise<() => void>;
}
export interface AddPopupParams {
    modal?: boolean;
    eChild: HTMLElement;
    closeOnEsc?: boolean;
    closedCallback?: (e?: MouseEvent | TouchEvent | KeyboardEvent) => void;
    click?: MouseEvent | Touch | null;
    alwaysOnTop?: boolean;
    afterGuiAttached?: (params: IAfterGuiAttachedParams) => void;
    positionCallback?: () => void;
    anchorToElement?: HTMLElement;
    ariaLabel: string;
}
export interface AddPopupResult {
    hideFunc: () => void;
}
export declare class PopupService extends BeanStub {
    private focusService;
    ctrlsService: CtrlsService;
    resizeObserverService: ResizeObserverService;
    private gridCtrl;
    private popupList;
    private static WAIT_FOR_POPUP_CONTENT_RESIZE;
    private postConstruct;
    getPopupParent(): HTMLElement;
    positionPopupForMenu(params: {
        eventSource: HTMLElement;
        ePopup: HTMLElement;
    }): void;
    positionPopupUnderMouseEvent(params: PopupPositionParams & {
        type: string;
        mouseEvent: MouseEvent | Touch;
    }): void;
    private calculatePointerAlign;
    positionPopupByComponent(params: PopupPositionParams & {
        type: string;
        eventSource: HTMLElement;
    }): void;
    private shouldRenderUnderOrAbove;
    private setAlignedStyles;
    private callPostProcessPopup;
    positionPopup(params: PopupPositionParams): void;
    getActivePopups(): HTMLElement[];
    getPopupList(): AgPopup[];
    private getParentRect;
    private keepXYWithinBounds;
    addPopup(params: AddPopupParams): AddPopupResult;
    private initialisePopupPosition;
    private createPopupWrapper;
    private handleThemeChange;
    private addEventListenersToPopup;
    private addPopupToPopupList;
    private getPopupIndex;
    setPopupPositionRelatedToElement(popupEl: HTMLElement, relativeElement?: HTMLElement | null): AgPromise<() => void> | undefined;
    private removePopupFromPopupList;
    private keepPopupPositionedRelativeTo;
    hasAnchoredPopup(): boolean;
    private isEventFromCurrentPopup;
    isElementWithinCustomPopup(el: HTMLElement): boolean;
    private getWrapper;
    setAlwaysOnTop(ePopup: HTMLElement, alwaysOnTop?: boolean): void;
    bringPopupToFront(ePopup: HTMLElement): void;
}
