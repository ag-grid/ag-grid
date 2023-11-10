import { Autowired, Bean, PostConstruct } from "../context/context";
import { Column } from "../entities/column";
import { Events } from '../events';
import { BeanStub } from "../context/beanStub";
import { getAbsoluteHeight, getAbsoluteWidth, getElementRectWithOffset } from '../utils/dom';
import { last } from '../utils/array';
import { isElementInEventPath, isStopPropagationForAgGrid } from '../utils/event';
import { KeyCode } from '../constants/keyCode';
import { FocusService } from "../focusService";
import { GridCtrl } from "../gridComp/gridCtrl";
import { IAfterGuiAttachedParams } from "../interfaces/iAfterGuiAttachedParams";
import { AgPromise } from "../utils";
import { CtrlsService } from "../ctrlsService";
import { setAriaLabel, setAriaRole } from "../utils/aria";
import { PostProcessPopupParams } from "../interfaces/iCallbackParams";
import { WithoutGridCommon } from "../interfaces/iCommon";
import { ResizeObserverService } from "../misc/resizeObserverService";
import { IRowNode } from "../interfaces/iRowNode";
import { exists } from "../utils/generic";

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
    updatePosition?: () => { x: number; y: number; };
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

enum DIRECTION { vertical, horizontal }

let instanceIdSeq = 0;

export interface AddPopupParams {
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
    afterGuiAttached?: (params: IAfterGuiAttachedParams) => void;
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

    // an aria label should be added to provided context to screen readers
    ariaLabel: string;
}

export interface AddPopupResult {
    hideFunc: () => void;
}

@Bean('popupService')
export class PopupService extends BeanStub {

    // really this should be using eGridDiv, not sure why it's not working.
    // maybe popups in the future should be parent to the body??
    @Autowired('focusService') private focusService: FocusService;
    @Autowired('ctrlsService') public ctrlsService: CtrlsService;
    @Autowired('resizeObserverService') public resizeObserverService: ResizeObserverService;

    private gridCtrl: GridCtrl;

    private popupList: AgPopup[] = [];

    private static WAIT_FOR_POPUP_CONTENT_RESIZE: number = 200;

    @PostConstruct
    private postConstruct(): void {
        this.ctrlsService.whenReady(p => {
            this.gridCtrl = p.gridCtrl;
        });
        this.addManagedListener(this.eventService, Events.EVENT_GRID_STYLES_CHANGED, this.handleThemeChange.bind(this));
    }

    public getPopupParent(): HTMLElement {
        const ePopupParent = this.gridOptionsService.get('popupParent');

        if (ePopupParent) { return ePopupParent; }

        return this.gridCtrl.getGui();
    }

    public positionPopupForMenu(params: { eventSource: HTMLElement; ePopup: HTMLElement; }): void {
        const { eventSource, ePopup } = params;

        const popupIdx = this.getPopupIndex(ePopup);

        if (popupIdx !== -1) {
            const popup = this.popupList[popupIdx];
            popup.alignedToElement = eventSource;
        }

        const sourceRect = eventSource.getBoundingClientRect();
        const parentRect = this.getParentRect();
        const y = this.keepXYWithinBounds(ePopup, sourceRect.top - parentRect.top, DIRECTION.vertical);

        const minWidth = (ePopup.clientWidth > 0) ? ePopup.clientWidth : 200;
        ePopup.style.minWidth = `${minWidth}px`;
        const widthOfParent = parentRect.right - parentRect.left;
        const maxX = widthOfParent - minWidth;

        // the x position of the popup depends on RTL or LTR. for normal cases, LTR, we put the child popup
        // to the right, unless it doesn't fit and we then put it to the left. for RTL it's the other way around,
        // we try place it first to the left, and then if not to the right.
        let x: number;
        if (this.gridOptionsService.get('enableRtl')) {
            // for RTL, try left first
            x = xLeftPosition();
            if (x < 0) {
                x = xRightPosition();
                this.setAlignedStyles(ePopup, 'left');
            }
            if (x > maxX) {
                x = 0;
                this.setAlignedStyles(ePopup, 'right');
            }
        } else {
            // for LTR, try right first
            x = xRightPosition();
            if (x > maxX) {
                x = xLeftPosition();
                this.setAlignedStyles(ePopup, 'right');
            }
            if (x < 0) {
                x = 0;
                this.setAlignedStyles(ePopup, 'left');
            }
        }

        ePopup.style.left = `${x}px`;
        ePopup.style.top = `${y}px`;

        function xRightPosition(): number {
            return sourceRect.right - parentRect.left - 2;
        }

        function xLeftPosition(): number {
            return sourceRect.left - parentRect.left - minWidth;
        }
    }

    public positionPopupUnderMouseEvent(params: PopupPositionParams & { type: string, mouseEvent: MouseEvent | Touch }): void {
        const { ePopup, nudgeX, nudgeY, skipObserver } = params;

        this.positionPopup({
            ePopup: ePopup,
            nudgeX,
            nudgeY,
            keepWithinBounds: true,
            skipObserver,
            updatePosition: () => this.calculatePointerAlign(params.mouseEvent),
            postProcessCallback: () => this.callPostProcessPopup(params.type, params.ePopup, null, params.mouseEvent, params.column, params.rowNode)
        });
    }

    private calculatePointerAlign(e: MouseEvent | Touch): { x: number, y: number; } {
        const parentRect = this.getParentRect();

        return {
            x: e.clientX - parentRect.left,
            y: e.clientY - parentRect.top
        };
    }

    public positionPopupByComponent(params: PopupPositionParams & { type: string, eventSource: HTMLElement }) {
        const { ePopup, nudgeX, nudgeY, keepWithinBounds, eventSource, alignSide = 'left', position = 'over', column, rowNode, type } = params;

        const sourceRect = eventSource.getBoundingClientRect();
        const parentRect = this.getParentRect() as DOMRect;

        const popupIdx = this.getPopupIndex(ePopup);


        if (popupIdx !== -1) {
            const popup = this.popupList[popupIdx];
            popup.alignedToElement = eventSource;
        }

        const updatePosition = () => {
            let x = sourceRect.left - parentRect.left;
            if (alignSide === 'right') {
                x -= (ePopup.offsetWidth - sourceRect.width);
            }

            let y;

            if (position === 'over') {
                y = (sourceRect.top - parentRect.top);
                this.setAlignedStyles(ePopup, 'over');
            } else {
                this.setAlignedStyles(ePopup, 'under');
                const alignSide = this.shouldRenderUnderOrAbove(ePopup, sourceRect, parentRect, params.nudgeY || 0);
                if (alignSide === 'under') {
                    y = (sourceRect.top - parentRect.top + sourceRect.height);
                } else {
                    y = (sourceRect.top - ePopup.offsetHeight - (nudgeY || 0) * 2) - parentRect.top;
                }
            }

            return { x, y };
        };

        this.positionPopup({
            ePopup,
            nudgeX,
            nudgeY,
            keepWithinBounds,
            updatePosition,
            postProcessCallback: () => this.callPostProcessPopup(type, ePopup, eventSource, null, column, rowNode)
        });
    }

    private shouldRenderUnderOrAbove(ePopup: HTMLElement, targetCompRect: DOMRect, parentRect: DOMRect, nudgeY: number): 'under' | 'above' {
        const spaceAvailableUnder = parentRect.bottom - targetCompRect.bottom;
        const spaceAvailableAbove = targetCompRect.top - parentRect.top;
        const spaceRequired = ePopup.offsetHeight + nudgeY;

        if (spaceAvailableUnder > spaceRequired) {
            return 'under';
        }

        if (spaceAvailableAbove > spaceRequired || spaceAvailableAbove > spaceAvailableUnder) {
            return 'above';
        }

        return 'under';
    }

    private setAlignedStyles(ePopup: HTMLElement, positioned: 'right' | 'left' | 'over' | 'above' | 'under' | null) {
        const popupIdx = this.getPopupIndex(ePopup);

        if (popupIdx === -1) { return; }

        const popup = this.popupList[popupIdx];

        const { alignedToElement } = popup;

        if (!alignedToElement) { return; }

        const positions = ['right', 'left', 'over', 'above', 'under'];

        positions.forEach(position => {
            alignedToElement.classList.remove(`ag-has-popup-positioned-${position}`)
            ePopup.classList.remove(`ag-popup-positioned-${position}`);
        });

        if (!positioned) { return; }

        alignedToElement.classList.add(`ag-has-popup-positioned-${positioned}`);
        ePopup.classList.add(`ag-popup-positioned-${positioned}`);
    }

    private callPostProcessPopup(
        type: string,
        ePopup: HTMLElement,
        eventSource?: HTMLElement | null,
        mouseEvent?: MouseEvent | Touch | null,
        column?: Column | null,
        rowNode?: IRowNode | null
    ): void {
        const callback = this.gridOptionsService.getCallback('postProcessPopup');
        if (callback) {
            const params: WithoutGridCommon<PostProcessPopupParams> = {
                column: column,
                rowNode: rowNode,
                ePopup: ePopup,
                type: type,
                eventSource: eventSource,
                mouseEvent: mouseEvent
            };
            callback(params);
        }
    }

    public positionPopup(params: PopupPositionParams): void {
        const { ePopup, keepWithinBounds, nudgeX, nudgeY, skipObserver, updatePosition } = params;
        const lastSize = { width: 0, height: 0 };

        const updatePopupPosition = (fromResizeObserver: boolean = false) => {
            let { x, y } = updatePosition!();

            if (
                fromResizeObserver &&
                ePopup.clientWidth === lastSize.width &&
                ePopup.clientHeight === lastSize.height
            ) {
                return;
            }

            lastSize.width = ePopup.clientWidth;
            lastSize.height = ePopup.clientHeight;

            if (nudgeX) { x += nudgeX; }
            if (nudgeY) { y += nudgeY; }

            // if popup is overflowing to the bottom, move it up
            if (keepWithinBounds) {
                x = this.keepXYWithinBounds(ePopup, x, DIRECTION.horizontal);
                y = this.keepXYWithinBounds(ePopup, y, DIRECTION.vertical);
            }

            ePopup.style.left = `${x}px`;
            ePopup.style.top = `${y}px`;

            if (params.postProcessCallback) {
                params.postProcessCallback();
            }
        };

        updatePopupPosition();

        // Mouse tracking will recalculate positioning when moving, so won't need to recalculate here
        if (!skipObserver) {
            // Since rendering popup contents can be asynchronous, use a resize observer to
            // reposition the popup after initial updates to the size of the contents
            const resizeObserverDestroyFunc = this.resizeObserverService.observeResize(ePopup, () => updatePopupPosition(true));
            // Only need to reposition when first open, so can clean up after a bit of time
            setTimeout(() => resizeObserverDestroyFunc(), PopupService.WAIT_FOR_POPUP_CONTENT_RESIZE);
        }
    }

    public getActivePopups(): HTMLElement[] {
        return this.popupList.map((popup) => popup.element);
    }

    public getPopupList(): AgPopup[] {
        return this.popupList;
    }

    private getParentRect() {
        // subtract the popup parent borders, because popupParent.getBoundingClientRect
        // returns the rect outside the borders, but the 0,0 coordinate for absolute
        // positioning is inside the border, leading the popup to be off by the width
        // of the border
        const eDocument = this.gridOptionsService.getDocument();
        let popupParent = this.getPopupParent();

        if (popupParent === eDocument.body) {
            popupParent = eDocument.documentElement;
        } else if (getComputedStyle(popupParent).position === 'static') {
            popupParent = popupParent.offsetParent as HTMLElement;
        }

        return getElementRectWithOffset(popupParent);
    }

    private keepXYWithinBounds(
        ePopup: HTMLElement,
        position: number,
        direction: DIRECTION
    ): number {
        const isVertical = direction === DIRECTION.vertical;
        const sizeProperty = isVertical ? 'clientHeight' : 'clientWidth';
        const anchorProperty = isVertical ? 'top' : 'left';
        const offsetProperty = isVertical ? 'offsetHeight' : 'offsetWidth';
        const scrollPositionProperty = isVertical ? 'scrollTop' : 'scrollLeft';

        const eDocument = this.gridOptionsService.getDocument();
        const docElement = eDocument.documentElement;
        const popupParent = this.getPopupParent();
        const parentRect = popupParent.getBoundingClientRect();
        const documentRect = eDocument.documentElement.getBoundingClientRect();
        const isBody = popupParent === eDocument.body;

        const offsetSize = ePopup[offsetProperty];
        const getSize = isVertical ? getAbsoluteHeight : getAbsoluteWidth;

        let sizeOfParent = isBody ? (getSize(docElement) + docElement[scrollPositionProperty]) : popupParent[sizeProperty];

        if (isBody) {
            sizeOfParent -= Math.abs(documentRect[anchorProperty] - parentRect[anchorProperty]);
        }

        const max = sizeOfParent - offsetSize;

        return Math.min(Math.max(position, 0), Math.abs(max));
    }

    public addPopup(params: AddPopupParams): AddPopupResult { 
        const eDocument = this.gridOptionsService.getDocument();
        const { eChild, ariaLabel, alwaysOnTop, positionCallback, anchorToElement } = params;

        if (!eDocument) {
            console.warn('AG Grid: could not find the document, document is empty');
            return { hideFunc: () => { } };
        }

        const pos = this.getPopupIndex(eChild);

        if (pos !== -1) {
            const popup = this.popupList[pos];
            return { hideFunc: popup.hideFunc };
        }

        this.initialisePopupPosition(eChild);

        const wrapperEl = this.createPopupWrapper(eChild, ariaLabel, !!alwaysOnTop);
        const removeListeners = this.addEventListenersToPopup({ ...params, wrapperEl });

        if (positionCallback) {
            positionCallback();
        }

        this.addPopupToPopupList(eChild, wrapperEl, removeListeners, anchorToElement);

        return {
            hideFunc: removeListeners
        };
    }

    private initialisePopupPosition(element: HTMLElement): void {
        const ePopupParent = this.getPopupParent();
        const ePopupParentRect = ePopupParent.getBoundingClientRect();

        if (!exists(element.style.top)) {
            element.style.top = `${ePopupParentRect.top * -1}px`;
        }
        if (!exists(element.style.left)) {
            element.style.left = `${ePopupParentRect.left * -1}px`;
        }
    }

    private createPopupWrapper(element: HTMLElement, ariaLabel: string, alwaysOnTop: boolean): HTMLElement {
        const ePopupParent = this.getPopupParent();

        // add env CSS class to child, in case user provided a popup parent, which means
        // theme class may be missing
        const eWrapper = document.createElement('div');
        const { allThemes } = this.environment.getTheme();

        if (allThemes.length) {
            eWrapper.classList.add(...allThemes);
        }

        eWrapper.classList.add('ag-popup');
        element.classList.add(
            this.gridOptionsService.get('enableRtl') ? 'ag-rtl' : 'ag-ltr',
            'ag-popup-child'
        );

        if (!element.hasAttribute('role')) {
            setAriaRole(element, 'dialog');
        }

        setAriaLabel(element, ariaLabel);

        eWrapper.appendChild(element);
        ePopupParent.appendChild(eWrapper);

        if (alwaysOnTop) {
            this.setAlwaysOnTop(element, true);
        } else {
            this.bringPopupToFront(element);
        }

        return eWrapper;
    }

    private handleThemeChange() {
        const { allThemes } = this.environment.getTheme();

        for (const popup of this.popupList) {
            for (const className of Array.from(popup.wrapper.classList)) {
                if (className.startsWith("ag-theme-")) {
                    popup.wrapper.classList.remove(className)
                }
            }
            if (allThemes.length) {
                popup.wrapper.classList.add(...allThemes);
            }
        }

    }

    private addEventListenersToPopup(params: AddPopupParams & { wrapperEl: HTMLElement }): () => void {
        const eDocument = this.gridOptionsService.getDocument();
        const ePopupParent = this.getPopupParent();

        const { wrapperEl, eChild: popupEl, click: pointerEvent, closedCallback, afterGuiAttached, closeOnEsc, modal } = params;

        let popupHidden = false;

        const hidePopupOnKeyboardEvent = (event: KeyboardEvent) => {
            if (!wrapperEl.contains(eDocument.activeElement)) {
                return;
            }

            const key = event.key;

            if (key === KeyCode.ESCAPE && !isStopPropagationForAgGrid(event)) {
                removeListeners({ keyboardEvent: event });
            }
        };

        const hidePopupOnMouseEvent = (event: MouseEvent) => removeListeners({ mouseEvent: event });
        const hidePopupOnTouchEvent = (event: TouchEvent) => removeListeners({ touchEvent: event });

        const removeListeners = (popupParams: PopupEventParams = {}) => {
            const { mouseEvent, touchEvent, keyboardEvent } = popupParams;
            if (
                // we don't hide popup if the event was on the child, or any
                // children of this child
                this.isEventFromCurrentPopup({ mouseEvent, touchEvent }, popupEl) ||
                // this method should only be called once. the client can have different
                // paths, each one wanting to close, so this method may be called multiple times.
                popupHidden
            ) {
                return;
            }

            popupHidden = true;

            ePopupParent.removeChild(wrapperEl);

            eDocument.removeEventListener('keydown', hidePopupOnKeyboardEvent);
            eDocument.removeEventListener('mousedown', hidePopupOnMouseEvent);
            eDocument.removeEventListener('touchstart', hidePopupOnTouchEvent);
            eDocument.removeEventListener('contextmenu', hidePopupOnMouseEvent);

            this.eventService.removeEventListener(Events.EVENT_DRAG_STARTED, hidePopupOnMouseEvent);

            if (closedCallback) {
                closedCallback(mouseEvent || touchEvent || keyboardEvent);
            }

            this.removePopupFromPopupList(popupEl);
        };

        if (afterGuiAttached) {
            afterGuiAttached({ hidePopup: removeListeners });
        }

        // if we add these listeners now, then the current mouse
        // click will be included, which we don't want
        window.setTimeout(() => {
            if (closeOnEsc) {
                eDocument.addEventListener('keydown', hidePopupOnKeyboardEvent);
            }

            if (modal) {
                eDocument.addEventListener('mousedown', hidePopupOnMouseEvent);
                this.eventService.addEventListener(Events.EVENT_DRAG_STARTED, hidePopupOnMouseEvent);
                eDocument.addEventListener('touchstart', hidePopupOnTouchEvent);
                eDocument.addEventListener('contextmenu', hidePopupOnMouseEvent);
            }
        }, 0);

        return removeListeners;
    }

    private addPopupToPopupList(element: HTMLElement, wrapperEl: HTMLElement, removeListeners: () => void, anchorToElement?: HTMLElement): void {
        this.popupList.push({
            element: element,
            wrapper: wrapperEl,
            hideFunc: removeListeners,
            instanceId: instanceIdSeq++,
            isAnchored: !!anchorToElement
        });

        if (anchorToElement) {
            this.setPopupPositionRelatedToElement(element, anchorToElement);
        }
    }

    private getPopupIndex(el: HTMLElement): number {
        return this.popupList.findIndex(p => p.element === el);
    }

    public setPopupPositionRelatedToElement(popupEl: HTMLElement, relativeElement?: HTMLElement | null): AgPromise<() => void> | undefined {
        const popupIndex = this.getPopupIndex(popupEl);

        if (popupIndex === -1) { return; }

        const popup = this.popupList[popupIndex];

        if (popup.stopAnchoringPromise) {
            popup.stopAnchoringPromise.then(destroyFunc => destroyFunc && destroyFunc());
        }

        popup.stopAnchoringPromise = undefined;
        popup.isAnchored = false;

        if (!relativeElement) { return; }

        // keeps popup positioned under created, eg if context menu, if user scrolls
        // using touchpad and the cell moves, it moves the popup to keep it with the cell.
        const destroyPositionTracker = this.keepPopupPositionedRelativeTo({
            element: relativeElement,
            ePopup: popupEl,
            hidePopup: popup.hideFunc
        });

        popup.stopAnchoringPromise = destroyPositionTracker;
        popup.isAnchored = true;

        return destroyPositionTracker;
    }

    private removePopupFromPopupList(element: HTMLElement): void {
        this.setAlignedStyles(element, null);
        this.setPopupPositionRelatedToElement(element, null);

        this.popupList = this.popupList.filter(p => p.element !== element);
    }

    private keepPopupPositionedRelativeTo(params: {
        ePopup: HTMLElement,
        element: HTMLElement,
        hidePopup: () => void;
    }): AgPromise<() => void> {
        const eParent = this.getPopupParent();
        const parentRect = eParent.getBoundingClientRect();

        const { element, ePopup } = params;

        const sourceRect = element.getBoundingClientRect();
        const initialDiffTop = parentRect.top - sourceRect.top;
        const initialDiffLeft = parentRect.left - sourceRect.left;

        let lastDiffTop = initialDiffTop;
        let lastDiffLeft = initialDiffLeft;

        const topPx = ePopup.style.top;
        const top = parseInt(topPx!.substring(0, topPx!.length - 1), 10);

        const leftPx = ePopup.style.left;
        const left = parseInt(leftPx!.substring(0, leftPx!.length - 1), 10);

        return new AgPromise<() => void>(resolve => {
            this.getFrameworkOverrides().setInterval(() => {
                const pRect = eParent.getBoundingClientRect();
                const sRect = element.getBoundingClientRect();

                const elementNotInDom = sRect.top == 0 && sRect.left == 0 && sRect.height == 0 && sRect.width == 0;
                if (elementNotInDom) {
                    params.hidePopup();
                    return;
                }

                const currentDiffTop = pRect.top - sRect.top;
                if (currentDiffTop != lastDiffTop) {
                    const newTop = this.keepXYWithinBounds(ePopup, top + initialDiffTop - currentDiffTop, DIRECTION.vertical);
                    ePopup.style.top = `${newTop}px`;
                }
                lastDiffTop = currentDiffTop;

                const currentDiffLeft = pRect.left - sRect.left;
                if (currentDiffLeft != lastDiffLeft) {
                    const newLeft = this.keepXYWithinBounds(ePopup, left + initialDiffLeft - currentDiffLeft, DIRECTION.horizontal);
                    ePopup.style.left = `${newLeft}px`;
                }
                lastDiffLeft = currentDiffLeft;

            }, 200).then(intervalId => {
                const result = () => {
                    if (intervalId != null) {
                        window.clearInterval(intervalId);
                    }
                };
                resolve(result);
            });
        });
    }

    public hasAnchoredPopup(): boolean {
        return this.popupList.some(popup => popup.isAnchored);
    }

    private isEventFromCurrentPopup(params: PopupEventParams, target: HTMLElement): boolean {
        const { mouseEvent, touchEvent } = params;

        const event = mouseEvent ? mouseEvent : touchEvent;

        if (!event) { return false; }

        const indexOfThisChild = this.getPopupIndex(target);

        if (indexOfThisChild === -1) { return false; }

        for (let i = indexOfThisChild; i < this.popupList.length; i++) {
            const popup = this.popupList[i];

            if (isElementInEventPath(popup.element, event)) { return true; }
        }

        // if the user did not write their own Custom Element to be rendered as popup
        // and this component has an additional popup element, they should have the
        // `ag-custom-component-popup` class to be detected as part of the Custom Component
        return this.isElementWithinCustomPopup(event.target as HTMLElement);
    }

    public isElementWithinCustomPopup(el: HTMLElement): boolean {
        const eDocument = this.gridOptionsService.getDocument();
        while (el && el !== eDocument.body) {
            if (el.classList.contains('ag-custom-component-popup') || el.parentElement === null) {
                return true;
            }
            el = el.parentElement;
        }

        return false;
    }

    private getWrapper(ePopup: HTMLElement): HTMLElement | null {
        while (!ePopup.classList.contains('ag-popup') && ePopup.parentElement) {
            ePopup = ePopup.parentElement;
        }

        return ePopup.classList.contains('ag-popup') ? ePopup : null;
    }

    public setAlwaysOnTop(ePopup: HTMLElement, alwaysOnTop?: boolean): void {
        const eWrapper = this.getWrapper(ePopup);

        if (!eWrapper) {
            return;
        }

        eWrapper.classList.toggle('ag-always-on-top', !!alwaysOnTop);

        if (alwaysOnTop) {
            this.bringPopupToFront(eWrapper);
        }
    }

    public bringPopupToFront(ePopup: HTMLElement) {
        const parent = this.getPopupParent();
        const popupList: HTMLElement[] = Array.prototype.slice.call(parent.querySelectorAll('.ag-popup'));
        const popupLen = popupList.length;
        const alwaysOnTopList: HTMLElement[] = Array.prototype.slice.call(parent.querySelectorAll('.ag-popup.ag-always-on-top'));
        const onTopLength = alwaysOnTopList.length;
        const eWrapper = this.getWrapper(ePopup);

        if (!eWrapper || popupLen <= 1 || !parent.contains(ePopup)) {
            return;
        }

        const pos = popupList.indexOf(eWrapper);

        const innerEls = eWrapper.querySelectorAll('div');
        const innerElsScrollMap: [HTMLElement, number][] = [];

        innerEls.forEach(el => {
            if (el.scrollTop !== 0) {
                innerElsScrollMap.push([el, el.scrollTop]);
            }
        });

        if (onTopLength) {
            const isPopupAlwaysOnTop = eWrapper.classList.contains('ag-always-on-top');

            if (isPopupAlwaysOnTop) {
                if (pos !== popupLen - 1) {
                    last(alwaysOnTopList).insertAdjacentElement('afterend', eWrapper);
                }
            } else if (pos !== popupLen - onTopLength - 1) {
                alwaysOnTopList[0].insertAdjacentElement('beforebegin', eWrapper);
            }
        } else if (pos !== popupLen - 1) {
            last(popupList).insertAdjacentElement('afterend', eWrapper);
        }

        while (innerElsScrollMap.length) {
            const currentEl = innerElsScrollMap.pop();
            currentEl![0].scrollTop = currentEl![1];
        }

        const params = {
            type: 'popupToFront',
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi,
            eWrapper
        };

        this.eventService.dispatchEvent(params);
    }
}
