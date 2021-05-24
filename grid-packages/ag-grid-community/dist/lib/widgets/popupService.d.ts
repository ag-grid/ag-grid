import { RowNode } from "../entities/rowNode";
import { Column } from "../entities/column";
import { BeanStub } from "../context/beanStub";
import { GridCompController } from "../gridComp/gridCompController";
export interface PopupEventParams {
    originalMouseEvent?: MouseEvent | Touch | null;
    mouseEvent?: MouseEvent;
    touchEvent?: TouchEvent;
    keyboardEvent?: KeyboardEvent;
}
export interface AfterGuiAttachedParams {
    hidePopup: () => void;
}
export interface AddPopupParams {
    modal?: boolean;
    eChild: any;
    closeOnEsc?: boolean;
    closedCallback?: (e?: MouseEvent | TouchEvent | KeyboardEvent) => void;
    click?: MouseEvent | Touch | null;
    alwaysOnTop?: boolean;
    afterGuiAttached?: (params: AfterGuiAttachedParams) => void;
    positionCallback?: () => void;
    anchorToElement?: HTMLElement;
}
export interface AddPopupResult {
    hideFunc: () => void;
    stopAnchoringFunc?: () => void;
}
export declare class PopupService extends BeanStub {
    private environment;
    private focusController;
    private gridCompController;
    private popupList;
    registerGridCompController(gridCompController: GridCompController): void;
    getPopupParent(): HTMLElement;
    positionPopupForMenu(params: {
        eventSource: HTMLElement;
        ePopup: HTMLElement;
    }): void;
    positionPopupUnderMouseEvent(params: {
        rowNode?: RowNode;
        column?: Column;
        type: string;
        mouseEvent: MouseEvent | Touch;
        nudgeX?: number;
        nudgeY?: number;
        ePopup: HTMLElement;
    }): void;
    private calculatePointerAlign;
    positionPopupUnderComponent(params: {
        type: string;
        eventSource: HTMLElement;
        ePopup: HTMLElement;
        column?: Column;
        rowNode?: RowNode;
        minWidth?: number;
        minHeight?: number;
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
        minWidth?: number;
        nudgeX?: number;
        nudgeY?: number;
        keepWithinBounds?: boolean;
    }): void;
    private callPostProcessPopup;
    positionPopup(params: {
        ePopup: HTMLElement;
        minWidth?: number;
        minHeight?: number;
        nudgeX?: number;
        nudgeY?: number;
        x: number;
        y: number;
        keepWithinBounds?: boolean;
    }): void;
    getActivePopups(): HTMLElement[];
    private getParentRect;
    private keepYWithinBounds;
    private keepXWithinBounds;
    private keepPopupPositionedRelativeTo;
    addPopup(params: AddPopupParams): AddPopupResult | undefined;
    private isEventFromCurrentPopup;
    isElementWithinCustomPopup(el: HTMLElement): boolean;
    private isEventSameChainAsOriginalEvent;
    private getWrapper;
    setAlwaysOnTop(ePopup: HTMLElement, alwaysOnTop?: boolean): void;
    bringPopupToFront(ePopup: HTMLElement): void;
}
