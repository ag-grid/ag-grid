import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { IAfterGuiAttachedParams } from '../interfaces/iAfterGuiAttachedParams';
import type { IRowNode } from '../interfaces/iRowNode';
import { AgPromise } from '../utils/promise';
export interface PopupPositionParams {
    ePopup: HTMLElement;
    column?: AgColumn | null;
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
    forceHide?: boolean;
}
export interface AgPopup {
    element: HTMLElement;
    wrapper: HTMLElement;
    hideFunc: (params?: PopupEventParams) => void;
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
    hideFunc: (params?: PopupEventParams) => void;
}
export declare class PopupService extends BeanStub implements NamedBean {
    beanName: "popupService";
    private ctrlsService;
    private resizeObserverService;
    private environment;
    wireBeans(beans: BeanCollection): void;
    private gridCtrl;
    private popupList;
    postConstruct(): void;
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
    getParentRect(): {
        top: number;
        left: number;
        right: number;
        bottom: number;
    };
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
    /** @return true if moved */
    bringPopupToFront(ePopup: HTMLElement): boolean;
}
