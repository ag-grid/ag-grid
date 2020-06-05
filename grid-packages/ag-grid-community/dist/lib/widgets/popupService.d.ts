import { GridCore } from "../gridCore";
import { RowNode } from "../entities/rowNode";
import { Column } from "../entities/column";
import { BeanStub } from "../context/beanStub";
export interface PopupEventParams {
    originalMouseEvent?: MouseEvent | Touch;
    mouseEvent?: MouseEvent;
    touchEvent?: TouchEvent;
    keyboardEvent?: KeyboardEvent;
}
export declare class PopupService extends BeanStub {
    private gridOptionsWrapper;
    private environment;
    private gridCore;
    private popupList;
    private init;
    registerGridCore(gridCore: GridCore): void;
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
        ePopup: HTMLElement | null;
        column: Column;
        rowNode: RowNode;
        minWidth?: number;
        nudgeX?: number;
        nudgeY?: number;
        keepWithinBounds?: boolean;
    }): void;
    private callPostProcessPopup;
    positionPopup(params: {
        ePopup: HTMLElement | null;
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
    addAsModalPopup(eChild: any, closeOnEsc: boolean, closedCallback?: (e?: MouseEvent | TouchEvent | KeyboardEvent) => void, click?: MouseEvent | Touch | null): (event?: any) => void;
    addPopup(modal: boolean, eChild: any, closeOnEsc: boolean, closedCallback?: (e?: MouseEvent | TouchEvent | KeyboardEvent) => void, click?: MouseEvent | Touch | null, alwaysOnTop?: boolean): (params?: PopupEventParams) => void;
    private isEventFromCurrentPopup;
    isElementWithinCustomPopup(el: HTMLElement): boolean;
    private isEventSameChainAsOriginalEvent;
    private getWrapper;
    setAlwaysOnTop(ePopup: HTMLElement, alwaysOnTop?: boolean): void;
    bringPopupToFront(ePopup: HTMLElement): void;
}
