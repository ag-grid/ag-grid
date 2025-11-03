import type { AfterGuiAttachedParams } from './iAfterGuiAttachedParams';

export type AddPopupParams<TContainerType extends string> =
    | LabelAddPopupParams<TContainerType>
    | OwnsAddPopupParams<TContainerType>;
interface BaseAddPopupParams<TContainerType extends string> {
    // if true then listens to background checking for clicks, so that when the background is clicked,
    // the child is removed again, giving a model look to popups.
    modal?: boolean;
    // the element to place in the popup
    eChild: HTMLElement;
    // if hitting ESC should close the popup
    closeOnEsc?: boolean;
    // a callback that gets called when the popup is closed
    closedCallback?: (e?: MouseEvent | TouchEvent | KeyboardEvent) => void;
    // if a clicked caused the popup (eg click a button) then the click that caused it
    click?: MouseEvent | Touch | null;
    alwaysOnTop?: boolean;
    afterGuiAttached?: (params: AfterGuiAttachedParams<TContainerType>) => void;
    // this gets called after the popup is created. the called could just call positionCallback themselves,
    // however it needs to be called first before anchorToElement is called, so must provide this callback
    // here if setting anchorToElement
    positionCallback?: () => void;
    // if the underlying anchorToElement moves, the popup will follow it. for example if context menu
    // showing, and the whole grid moves (browser is scrolled down) then we want the popup to stay above
    // the cell it appeared on. make sure though if setting, don't anchor to a temporary or moving element,
    // eg if cellComp element is passed, what happens if row moves (sorting, filtering etc)? best anchor against
    // the grid, not the cell.
    anchorToElement?: HTMLElement;
}

interface LabelAddPopupParams<TContainerType extends string> extends BaseAddPopupParams<TContainerType> {
    // an aria label should be added to provided context to screen readers
    ariaLabel: string;
    ariaOwns?: never;
}

interface OwnsAddPopupParams<TContainerType extends string> extends BaseAddPopupParams<TContainerType> {
    ariaLabel?: never;
    // an element that will be marked as owner of the popup element
    ariaOwns: HTMLElement;
}

export interface PopupEventParams {
    originalMouseEvent?: MouseEvent | Touch | null;
    mouseEvent?: MouseEvent;
    touchEvent?: TouchEvent;
    keyboardEvent?: KeyboardEvent;
    forceHide?: boolean;
}

export interface AddPopupResult {
    hideFunc: (params?: PopupEventParams) => void;
}

interface BasePopupPositionParams<TParams> {
    ePopup: HTMLElement;
    additionalParams?: TParams;
}

export interface AgPopupPositionParams<TParams> extends BasePopupPositionParams<TParams> {
    nudgeX?: number;
    nudgeY?: number;
    position?: 'over' | 'under';
    alignSide?: 'left' | 'right';
    keepWithinBounds?: boolean;
    skipObserver?: boolean;
    updatePosition?: () => { x: number; y: number };
    postProcessCallback?: () => void;
}

export interface AgComponentPopupPositionParams<TParams> extends AgPopupPositionParams<TParams> {
    type: string;
    eventSource: HTMLElement;
}

export interface AgMousePopupPositionParams<TParams> extends AgPopupPositionParams<TParams> {
    type: string;
    mouseEvent: MouseEvent | Touch;
}

export interface AgMenuPopupPositionParams<TParams> extends BasePopupPositionParams<TParams> {
    eventSource: HTMLElement;
    event?: MouseEvent | KeyboardEvent;
}
