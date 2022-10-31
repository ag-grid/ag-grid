import { RowNode } from "../entities/rowNode";
import { Column } from "../entities/column";
import { BeanStub } from "../context/beanStub";
import { IAfterGuiAttachedParams } from "../interfaces/iAfterGuiAttachedParams";
import { AgPromise } from "../utils";
import { CtrlsService } from "../ctrlsService";
import { ResizeObserverService } from "../misc/resizeObserverService";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
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
    stopAnchoringPromise: AgPromise<Function>;
    instanceId: number;
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
    stopAnchoringPromise: AgPromise<Function>;
}
export declare class PopupService extends BeanStub {
    private environment;
    private focusService;
    ctrlsService: CtrlsService;
    resizeObserverService: ResizeObserverService;
    protected readonly gridOptionsWrapper: GridOptionsWrapper;
    private gridCtrl;
    private popupList;
    private static WAIT_FOR_POPUP_CONTENT_RESIZE;
    private postConstruct;
    getPopupParent(): HTMLElement;
    positionPopupForMenu(params: {
        eventSource: HTMLElement;
        ePopup: HTMLElement;
    }): void;
    positionPopupUnderMouseEvent(params: {
        rowNode?: RowNode | null;
        column?: Column | null;
        type: string;
        mouseEvent: MouseEvent | Touch;
        nudgeX?: number;
        nudgeY?: number;
        ePopup: HTMLElement;
        skipObserver?: boolean;
    }): void;
    private calculatePointerAlign;
    positionPopupUnderComponent(params: {
        type: string;
        eventSource: HTMLElement;
        ePopup: HTMLElement;
        column?: Column;
        rowNode?: RowNode;
        nudgeX?: number;
        nudgeY?: number;
        alignSide?: 'left' | 'right';
        keepWithinBounds?: boolean;
    }): void;
    positionPopupOverComponent(params: {
        type: string;
        eventSource: HTMLElement;
        ePopup: HTMLElement;
        column: Column;
        rowNode: RowNode;
        nudgeX?: number;
        nudgeY?: number;
        keepWithinBounds?: boolean;
    }): void;
    private callPostProcessPopup;
    positionPopup(params: {
        ePopup: HTMLElement;
        nudgeX?: number;
        nudgeY?: number;
        x: number;
        y: number;
        keepWithinBounds?: boolean;
        skipObserver?: boolean;
    }): void;
    getActivePopups(): HTMLElement[];
    getPopupList(): AgPopup[];
    private getParentRect;
    private keepXYWithinBounds;
    private keepPopupPositionedRelativeTo;
    addPopup(params: AddPopupParams): AddPopupResult;
    hasAnchoredPopup(): boolean;
    private isEventFromCurrentPopup;
    isElementWithinCustomPopup(el: HTMLElement): boolean;
    private isEventSameChainAsOriginalEvent;
    private getWrapper;
    setAlwaysOnTop(ePopup: HTMLElement, alwaysOnTop?: boolean): void;
    bringPopupToFront(ePopup: HTMLElement): void;
}
