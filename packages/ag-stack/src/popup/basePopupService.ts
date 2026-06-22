import { Direction } from '../constants/direction';
import { KeyCode } from '../constants/keyCode';
import { AgBeanStub } from '../core/agBeanStub';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type {
    AddPopupParams,
    AddPopupResult,
    AgComponentPopupPositionParams,
    AgMenuPopupPositionParams,
    AgMousePopupPositionParams,
    AgPopupPositionParams,
    PopupEventParams,
} from '../interfaces/iPopup';
import type { IPopupService } from '../interfaces/iPopupService';
import type { IPropertiesService } from '../interfaces/iProperties';
import { _initStyledRoot } from '../theming/styledRoot';
import { _setAriaLabel, _setAriaOwns, _setAriaRole } from '../utils/aria';
import { _getActiveDomElement, _getDocument } from '../utils/document';
import {
    _createAgElement,
    _getAbsoluteHeight,
    _getAbsoluteWidth,
    _getElementRectWithOffset,
    _observeResize,
} from '../utils/dom';
import { _isElementInEventPath } from '../utils/event';
import { _exists } from '../utils/generic';
import { AgPromise, _wrapInterval } from '../utils/promise';
import { computeAlignedPosition, toRelativeRect } from './popupPositionUtils';

interface AgPopup {
    element: HTMLElement;
    hideFunc: (params?: PopupEventParams) => void;
    isAnchored: boolean;
    instanceId: number;
    alignedToElement?: HTMLElement;
    stopAnchoringPromise?: AgPromise<() => void>;
}

let instanceIdSeq = 0;

const WAIT_FOR_POPUP_CONTENT_RESIZE: number = 200;
interface Position {
    initialDiff: number;
    lastDiff: number;
    initial: number;
    last: number;
    direction: Direction;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export abstract class BasePopupService<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
    TPopupPositionParams,
>
    extends AgBeanStub<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService>
    implements IPopupService<TPopupPositionParams>
{
    beanName = 'popupSvc' as const;

    protected popupList: AgPopup[] = [];

    public getPopupParent(): HTMLElement {
        const ePopupParent = this.gos.get('popupParent');

        if (ePopupParent) {
            return ePopupParent;
        }

        return this.getDefaultPopupParent();
    }

    protected abstract getDefaultPopupParent(): HTMLElement;

    public positionPopupUnderMouseEvent(params: AgMousePopupPositionParams<TPopupPositionParams>): void {
        const { ePopup, nudgeX, nudgeY, skipObserver } = params;

        this.positionPopup({
            ePopup: ePopup,
            nudgeX,
            nudgeY,
            keepWithinBounds: true,
            skipObserver,
            updatePosition: () => this.calculatePointerAlign(params.mouseEvent),
            postProcessCallback: () =>
                this.callPostProcessPopup(params.additionalParams, params.type, params.ePopup, null, params.mouseEvent),
        });
    }

    private calculatePointerAlign(e: MouseEvent | Touch): { x: number; y: number } {
        const parentRect = this.getParentRect();

        return {
            x: e.clientX - parentRect.left,
            y: e.clientY - parentRect.top,
        };
    }

    public positionPopupByComponent(params: AgComponentPopupPositionParams<TPopupPositionParams>) {
        const {
            ePopup,
            nudgeX,
            nudgeY,
            keepWithinBounds,
            eventSource,
            alignSide = 'left',
            position = 'over',
            type,
        } = params;

        const sourceRect = eventSource.getBoundingClientRect();
        const parentRect = this.getParentRect() as DOMRect;

        this.setAlignedTo(eventSource, ePopup);

        const updatePosition = () => {
            const relativeRect = toRelativeRect(sourceRect, parentRect);
            const targetSize = { width: ePopup.offsetWidth, height: ePopup.offsetHeight };
            const right = alignSide === 'right';

            if (position === 'over') {
                this.setAlignedStyles(ePopup, 'over');
                return computeAlignedPosition(relativeRect, targetSize, right ? 'tr-tr' : 'tl-tl');
            }

            this.setAlignedStyles(ePopup, 'under');
            const side = this.shouldRenderUnderOrAbove(ePopup, sourceRect, parentRect, params.nudgeY || 0);

            if (side === 'under') {
                return computeAlignedPosition(relativeRect, targetSize, right ? 'tr-br' : 'tl-bl');
            }

            // above: compensate for nudgeY which positionPopup will add positively
            const pos = computeAlignedPosition(relativeRect, targetSize, right ? 'br-tr' : 'bl-tl');
            pos.y -= (nudgeY || 0) * 2;
            return pos;
        };

        this.positionPopup({
            ePopup,
            nudgeX,
            nudgeY,
            keepWithinBounds,
            updatePosition,
            postProcessCallback: () =>
                this.callPostProcessPopup(params.additionalParams, type, ePopup, eventSource, null),
        });
    }

    public positionPopupForMenu(params: AgMenuPopupPositionParams<TPopupPositionParams>): void {
        const { eventSource, ePopup, event } = params;

        const sourceRect = eventSource.getBoundingClientRect();
        const parentRect = this.getParentRect();

        this.setAlignedTo(eventSource, ePopup);

        let minWidthSet = false;

        const updatePosition = () => {
            const relativeRect = toRelativeRect(sourceRect, parentRect);
            const y = this.keepXYWithinBounds(ePopup, relativeRect.top, Direction.Vertical);

            const minWidth = ePopup.clientWidth > 0 ? ePopup.clientWidth : 200;
            if (!minWidthSet) {
                ePopup.style.minWidth = `${minWidth}px`;
                minWidthSet = true;
            }
            const widthOfParent = parentRect.right - parentRect.left;
            const maxX = widthOfParent - minWidth;
            const targetSize = { width: minWidth, height: ePopup.offsetHeight };

            // the x position depends on RTL/LTR. For LTR, try right first then fall back to left.
            // For RTL, try left first then fall back to right.
            const rightX = computeAlignedPosition(relativeRect, targetSize, 'tl-tr').x - 2;
            const leftX = computeAlignedPosition(relativeRect, targetSize, 'tr-tl').x;

            let x: number;
            if (this.gos.get('enableRtl')) {
                x = leftX;
                if (x < 0) {
                    x = rightX;
                    this.setAlignedStyles(ePopup, 'left');
                }
                if (x > maxX) {
                    x = 0;
                    this.setAlignedStyles(ePopup, 'right');
                }
            } else {
                x = rightX;
                if (x > maxX) {
                    x = leftX;
                    this.setAlignedStyles(ePopup, 'right');
                }
                if (x < 0) {
                    x = 0;
                    this.setAlignedStyles(ePopup, 'left');
                }
            }
            return { x, y };
        };

        this.positionPopup({
            ePopup,
            keepWithinBounds: true,
            updatePosition,
            postProcessCallback: () =>
                this.callPostProcessPopup(
                    params.additionalParams,
                    'subMenu',
                    ePopup,
                    eventSource,
                    event instanceof KeyboardEvent ? undefined : event
                ),
        });
    }

    private shouldRenderUnderOrAbove(
        ePopup: HTMLElement,
        targetCompRect: DOMRect,
        parentRect: DOMRect,
        nudgeY: number
    ): 'under' | 'above' {
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

    protected setAlignedStyles(ePopup: HTMLElement, positioned: 'right' | 'left' | 'over' | 'above' | 'under' | null) {
        const popupIdx = this.getPopupIndex(ePopup);

        if (popupIdx === -1) {
            return;
        }

        const popup = this.popupList[popupIdx];

        const { alignedToElement } = popup;

        if (!alignedToElement) {
            return;
        }

        const positions = ['right', 'left', 'over', 'above', 'under'];

        for (const position of positions) {
            alignedToElement.classList.remove(`ag-has-popup-positioned-${position}`);
            ePopup.classList.remove(`ag-popup-positioned-${position}`);
        }

        if (!positioned) {
            return;
        }

        alignedToElement.classList.add(`ag-has-popup-positioned-${positioned}`);
        ePopup.classList.add(`ag-popup-positioned-${positioned}`);
    }

    protected setAlignedTo(eventSource: HTMLElement, ePopup: HTMLElement): void {
        const popupIdx = this.getPopupIndex(ePopup);

        if (popupIdx !== -1) {
            const popup = this.popupList[popupIdx];
            popup.alignedToElement = eventSource;
        }
    }

    public abstract callPostProcessPopup(
        params: TPopupPositionParams | undefined,
        type: string,
        ePopup: HTMLElement,
        eventSource?: HTMLElement | null,
        mouseEvent?: MouseEvent | Touch | null
    ): void;

    public positionPopup(params: AgPopupPositionParams<TPopupPositionParams>): void {
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

            if (nudgeX) {
                x += nudgeX;
            }
            if (nudgeY) {
                y += nudgeY;
            }

            // if popup is overflowing to the bottom, move it up
            if (keepWithinBounds) {
                x = this.keepXYWithinBounds(ePopup, x, Direction.Horizontal);
                y = this.keepXYWithinBounds(ePopup, y, Direction.Vertical);
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
            const resizeObserverDestroyFunc = _observeResize(this.beans, ePopup, () => updatePopupPosition(true));
            // Only need to reposition when first open, so can clean up after a bit of time
            setTimeout(() => resizeObserverDestroyFunc(), WAIT_FOR_POPUP_CONTENT_RESIZE);
        }
    }

    public getParentRect(): {
        top: number;
        left: number;
        right: number;
        bottom: number;
    } {
        // subtract the popup parent borders, because popupParent.getBoundingClientRect
        // returns the rect outside the borders, but the 0,0 coordinate for absolute
        // positioning is inside the border, leading the popup to be off by the width
        // of the border
        const eDocument = _getDocument(this.beans);
        let popupParent = this.getPopupParent();

        if (popupParent === eDocument.body) {
            popupParent = eDocument.documentElement;
        } else if (getComputedStyle(popupParent).position === 'static') {
            popupParent = popupParent.offsetParent as HTMLElement;
        }

        return _getElementRectWithOffset(popupParent);
    }

    protected keepXYWithinBounds(ePopup: HTMLElement, position: number, direction: Direction): number {
        const isVertical = direction === Direction.Vertical;
        const sizeProperty = isVertical ? 'clientHeight' : 'clientWidth';
        const anchorProperty = isVertical ? 'top' : 'left';
        const offsetProperty = isVertical ? 'height' : 'width';
        const scrollPositionProperty = isVertical ? 'scrollTop' : 'scrollLeft';

        const eDocument = _getDocument(this.beans);
        const docElement = eDocument.documentElement;
        const popupParent = this.getPopupParent();
        const popupRect = ePopup.getBoundingClientRect();
        const parentRect = popupParent.getBoundingClientRect();
        const documentRect = eDocument.documentElement.getBoundingClientRect();
        const isBody = popupParent === eDocument.body;

        const offsetSize = Math.ceil(popupRect[offsetProperty]);
        const getSize = isVertical ? _getAbsoluteHeight : _getAbsoluteWidth;

        let sizeOfParent = isBody
            ? getSize(docElement) + docElement[scrollPositionProperty]
            : popupParent[sizeProperty];

        if (isBody) {
            sizeOfParent -= Math.abs(documentRect[anchorProperty] - parentRect[anchorProperty]);
        }

        const max = sizeOfParent - offsetSize;

        return Math.min(Math.max(position, 0), Math.max(max, 0));
    }

    public addPopup<TContainerType extends string>(params: AddPopupParams<TContainerType>): AddPopupResult {
        const { eChild, ariaLabel, ariaOwns, alwaysOnTop, positionCallback, anchorToElement } = params;

        const pos = this.getPopupIndex(eChild);

        if (pos !== -1) {
            const popup = this.popupList[pos];
            return { hideFunc: popup.hideFunc };
        }

        this.initialisePopupPosition(eChild);

        eChild.classList.add('ag-popup-child');

        if (!eChild.hasAttribute('role')) {
            _setAriaRole(eChild, 'dialog');
        }

        if (ariaLabel) {
            _setAriaLabel(eChild, ariaLabel);
        } else if (ariaOwns) {
            eChild.id ||= `popup-component-${instanceIdSeq}`;
            _setAriaOwns(ariaOwns, eChild.id);
        }

        const wrapperEl = _createAgElement({ tag: 'div', cls: 'ag-popup' });
        wrapperEl.appendChild(eChild);
        const disconnect = _initStyledRoot(this.beans.environment, this.getPopupParent(), wrapperEl);

        if (alwaysOnTop) {
            this.setAlwaysOnTop(eChild, true);
        } else {
            this.bringPopupToFront(eChild);
        }

        const removeListeners = this.addEventListenersToPopup({ ...params, wrapperEl, disconnect });

        if (positionCallback) {
            positionCallback();
        }

        this.addPopupToPopupList(eChild, removeListeners, anchorToElement);

        return {
            hideFunc: removeListeners,
        };
    }

    private initialisePopupPosition(element: HTMLElement): void {
        const ePopupParent = this.getPopupParent();
        const ePopupParentRect = ePopupParent.getBoundingClientRect();

        if (!_exists(element.style.top)) {
            element.style.top = `${ePopupParentRect.top * -1}px`;
        }
        if (!_exists(element.style.left)) {
            element.style.left = `${ePopupParentRect.left * -1}px`;
        }
    }

    protected abstract isStopPropagation(event: Event): boolean;

    private addEventListenersToPopup(
        params: AddPopupParams<string> & { wrapperEl: HTMLElement; disconnect: () => void }
    ): (popupParams?: PopupEventParams) => void {
        const beans = this.beans;
        const eDocument = _getDocument(beans);

        const { wrapperEl, eChild: popupEl, closedCallback, afterGuiAttached, closeOnEsc, modal, ariaOwns } = params;

        let popupHidden = false;

        const hidePopupOnKeyboardEvent = (event: KeyboardEvent) => {
            if (!wrapperEl.contains(_getActiveDomElement(beans))) {
                return;
            }

            const key = event.key;

            if (key === KeyCode.ESCAPE && !this.isStopPropagation(event)) {
                removeListeners({ keyboardEvent: event });
            }
        };

        const hidePopupOnMouseEvent = (event: MouseEvent) => removeListeners({ mouseEvent: event });
        const hidePopupOnTouchEvent = (event: TouchEvent) => removeListeners({ touchEvent: event });

        const removeListeners = (popupParams: PopupEventParams = {}) => {
            const { mouseEvent, touchEvent, keyboardEvent, forceHide } = popupParams;
            if (
                !forceHide &&
                // we don't hide popup if the event was on the child, or any
                // children of this child
                (this.isEventFromCurrentPopup({ mouseEvent, touchEvent }, popupEl) ||
                    // this method should only be called once. the client can have different
                    // paths, each one wanting to close, so this method may be called multiple times.
                    popupHidden)
            ) {
                return;
            }

            popupHidden = true;

            params.disconnect();

            eDocument.removeEventListener('keydown', hidePopupOnKeyboardEvent);
            eDocument.removeEventListener('mousedown', hidePopupOnMouseEvent);
            eDocument.removeEventListener('touchstart', hidePopupOnTouchEvent);
            eDocument.removeEventListener('contextmenu', hidePopupOnMouseEvent);

            this.eventSvc.removeListener('dragStarted', hidePopupOnMouseEvent as any);

            if (closedCallback) {
                closedCallback(mouseEvent || touchEvent || keyboardEvent);
            }

            this.removePopupFromPopupList(popupEl, ariaOwns);
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
                this.eventSvc.addListener('dragStarted', hidePopupOnMouseEvent as any);
                eDocument.addEventListener('touchstart', hidePopupOnTouchEvent);
                eDocument.addEventListener('contextmenu', hidePopupOnMouseEvent);
            }
        }, 0);

        return removeListeners;
    }

    private addPopupToPopupList(
        element: HTMLElement,
        removeListeners: (popupParams?: PopupEventParams) => void,
        anchorToElement?: HTMLElement
    ): void {
        this.popupList.push({
            element: element,
            hideFunc: removeListeners,
            instanceId: instanceIdSeq,
            isAnchored: !!anchorToElement,
        });

        if (anchorToElement) {
            this.setPopupPositionRelatedToElement(element, anchorToElement);
        }

        instanceIdSeq = instanceIdSeq + 1;
    }

    private getPopupIndex(el: HTMLElement): number {
        return this.popupList.findIndex((p) => p.element === el);
    }

    public setPopupPositionRelatedToElement(
        popupEl: HTMLElement,
        relativeElement?: HTMLElement | null
    ): AgPromise<() => void> | undefined {
        const popupIndex = this.getPopupIndex(popupEl);

        if (popupIndex === -1) {
            return;
        }

        const popup = this.popupList[popupIndex];

        if (popup.stopAnchoringPromise) {
            popup.stopAnchoringPromise.then((destroyFunc) => destroyFunc?.());
        }

        popup.stopAnchoringPromise = undefined;
        popup.isAnchored = false;

        if (!relativeElement) {
            return;
        }

        // keeps popup positioned under created, eg if context menu, if user scrolls
        // using touchpad and the cell moves, it moves the popup to keep it with the cell.
        const destroyPositionTracker = this.keepPopupPositionedRelativeTo({
            element: relativeElement,
            ePopup: popupEl,
            hidePopup: popup.hideFunc,
        });

        popup.stopAnchoringPromise = destroyPositionTracker;
        popup.isAnchored = true;

        return destroyPositionTracker;
    }

    private removePopupFromPopupList(element: HTMLElement, ariaOwns?: HTMLElement): void {
        this.setAlignedStyles(element, null);
        this.setPopupPositionRelatedToElement(element, null);

        if (ariaOwns) {
            _setAriaOwns(ariaOwns, null);
        }

        this.popupList = this.popupList.filter((p) => p.element !== element);
    }

    private keepPopupPositionedRelativeTo(params: {
        ePopup: HTMLElement;
        element: HTMLElement;
        hidePopup: (params?: PopupEventParams) => void;
    }): AgPromise<() => void> {
        const eParent = this.getPopupParent();
        const parentRect = eParent.getBoundingClientRect();

        const { element, ePopup } = params;

        const sourceRect = element.getBoundingClientRect();

        const extractFromPixelValue = (pxSize: string) => Number.parseInt(pxSize.substring(0, pxSize.length - 1), 10);
        const createPosition = (prop: 'top' | 'left', direction: Direction) => {
            const initialDiff = parentRect[prop] - sourceRect[prop];
            const initial = extractFromPixelValue(ePopup.style[prop]);
            return {
                initialDiff,
                lastDiff: initialDiff,
                initial,
                last: initial,
                direction,
            };
        };
        const topPosition = createPosition('top', Direction.Vertical);
        const leftPosition = createPosition('left', Direction.Horizontal);

        const fwOverrides = this.beans.frameworkOverrides;
        return new AgPromise<() => void>((resolve) => {
            fwOverrides.wrapIncoming(() => {
                _wrapInterval(() => {
                    const pRect = eParent.getBoundingClientRect();
                    const sRect = element.getBoundingClientRect();

                    const elementNotInDom = sRect.top == 0 && sRect.left == 0 && sRect.height == 0 && sRect.width == 0;
                    if (elementNotInDom) {
                        params.hidePopup();
                        return;
                    }

                    const calculateNewPosition = (position: Position, prop: 'top' | 'left') => {
                        const current = extractFromPixelValue(ePopup.style[prop]);
                        if (position.last !== current) {
                            // some other process has moved the popup
                            position.initial = current;
                            position.last = current;
                        }

                        const currentDiff = pRect[prop] - sRect[prop];
                        if (currentDiff != position.lastDiff) {
                            const newValue = this.keepXYWithinBounds(
                                ePopup,
                                position.initial + position.initialDiff - currentDiff,
                                position.direction
                            );
                            ePopup.style[prop] = `${newValue}px`;
                            position.last = newValue;
                        }
                        position.lastDiff = currentDiff;
                    };
                    calculateNewPosition(topPosition, 'top');
                    calculateNewPosition(leftPosition, 'left');
                }, 200).then((intervalId) => {
                    const result = () => {
                        if (intervalId != null) {
                            window.clearInterval(intervalId);
                        }
                    };
                    resolve(result);
                });
            }, 'popupPositioning');
        });
    }

    private isEventFromCurrentPopup(params: PopupEventParams, target: HTMLElement): boolean {
        const { mouseEvent, touchEvent } = params;

        const event = mouseEvent ? mouseEvent : touchEvent;

        if (!event) {
            return false;
        }

        const indexOfThisChild = this.getPopupIndex(target);

        if (indexOfThisChild === -1) {
            return false;
        }

        for (let i = indexOfThisChild; i < this.popupList.length; i++) {
            const popup = this.popupList[i];

            if (_isElementInEventPath(popup.element, event)) {
                return true;
            }
        }

        // if the user did not write their own Custom Element to be rendered as popup
        // and this component has an additional popup element, they should have the
        // `ag-custom-component-popup` class to be detected as part of the Custom Component
        return this.isElementWithinCustomPopup(event.target as HTMLElement);
    }

    public isElementWithinCustomPopup(el: HTMLElement): boolean {
        const eDocument = _getDocument(this.beans);
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

    private getPopupRoot(ePopup: HTMLElement): HTMLElement {
        const parent = this.getPopupParent();
        let popupRoot = ePopup;

        // popups sit inside styled-root wrappers; move that root so its disconnect cleanup still owns the popup.
        while (popupRoot.parentElement && popupRoot.parentElement !== parent) {
            popupRoot = popupRoot.parentElement;
        }

        return popupRoot;
    }

    private setAlwaysOnTop(ePopup: HTMLElement, alwaysOnTop?: boolean): void {
        const eWrapper = this.getWrapper(ePopup);

        if (!eWrapper) {
            return;
        }

        eWrapper.classList.toggle('ag-always-on-top', !!alwaysOnTop);

        if (alwaysOnTop) {
            this.bringPopupToFront(eWrapper);
        }
    }

    /** @returns true if moved */
    public bringPopupToFront(ePopup: HTMLElement): void {
        const parent = this.getPopupParent();
        const popupList: HTMLElement[] = Array.prototype.slice.call(parent.querySelectorAll('.ag-popup'));
        const popupLen = popupList.length;

        const eWrapper = this.getWrapper(ePopup);

        if (!eWrapper || popupLen <= 1 || !parent.contains(ePopup)) {
            return;
        }

        const standardPopupList: HTMLElement[] = [];
        const alwaysOnTopList: HTMLElement[] = [];

        for (const popup of popupList) {
            if (popup === eWrapper) {
                continue;
            }

            if (popup.classList.contains('ag-always-on-top')) {
                alwaysOnTopList.push(popup);
            } else {
                standardPopupList.push(popup);
            }
        }

        const innerElsScrollMap: [HTMLElement, number][] = [];

        const onTopLength = alwaysOnTopList.length;
        const isPopupAlwaysOnTop = eWrapper.classList.contains('ag-always-on-top');
        const shouldBeLast = isPopupAlwaysOnTop || !onTopLength;

        const targetList: HTMLElement[] = shouldBeLast
            ? [...standardPopupList, ...alwaysOnTopList, eWrapper]
            : [...standardPopupList, eWrapper, ...alwaysOnTopList];

        for (let i = 0; i <= popupLen; i++) {
            const currentPopup = targetList[i];

            if (popupList[i] === targetList[i] || currentPopup === eWrapper) {
                continue;
            }

            const innerEls = currentPopup.querySelectorAll('div');
            for (const el of innerEls) {
                if (el.scrollTop !== 0) {
                    innerElsScrollMap.push([el, el.scrollTop]);
                }
            }

            if (i === 0) {
                parent.prepend(this.getPopupRoot(currentPopup));
            } else {
                this.getPopupRoot(targetList[i - 1]).after(this.getPopupRoot(currentPopup));
            }
        }

        while (innerElsScrollMap.length) {
            const currentEl = innerElsScrollMap.pop();
            currentEl![0].scrollTop = currentEl![1];
        }
    }
}
