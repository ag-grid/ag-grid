/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PopupService_1;
import { Autowired, Bean, PostConstruct } from "../context/context";
import { Events } from '../events';
import { BeanStub } from "../context/beanStub";
import { getAbsoluteHeight, getAbsoluteWidth } from '../utils/dom';
import { last } from '../utils/array';
import { isElementInEventPath } from '../utils/event';
import { KeyCode } from '../constants/keyCode';
import { FocusService } from "../focusService";
import { AgPromise } from "../utils";
import { setAriaLabel, setAriaRole } from "../utils/aria";
var DIRECTION;
(function (DIRECTION) {
    DIRECTION[DIRECTION["vertical"] = 0] = "vertical";
    DIRECTION[DIRECTION["horizontal"] = 1] = "horizontal";
})(DIRECTION || (DIRECTION = {}));
let instanceIdSeq = 0;
let PopupService = PopupService_1 = class PopupService extends BeanStub {
    constructor() {
        super(...arguments);
        this.popupList = [];
    }
    postConstruct() {
        this.ctrlsService.whenReady(p => {
            this.gridCtrl = p.gridCtrl;
            this.addManagedListener(this.gridCtrl, Events.EVENT_KEYBOARD_FOCUS, () => {
                this.popupList.forEach(popup => popup.element.classList.add(FocusService.AG_KEYBOARD_FOCUS));
            });
            this.addManagedListener(this.gridCtrl, Events.EVENT_MOUSE_FOCUS, () => {
                this.popupList.forEach(popup => popup.element.classList.remove(FocusService.AG_KEYBOARD_FOCUS));
            });
        });
    }
    getPopupParent() {
        const ePopupParent = this.gridOptionsService.get('popupParent');
        if (ePopupParent) {
            return ePopupParent;
        }
        return this.gridCtrl.getGui();
    }
    positionPopupForMenu(params) {
        const sourceRect = params.eventSource.getBoundingClientRect();
        const parentRect = this.getParentRect();
        const y = this.keepXYWithinBounds(params.ePopup, sourceRect.top - parentRect.top, DIRECTION.vertical);
        const minWidth = (params.ePopup.clientWidth > 0) ? params.ePopup.clientWidth : 200;
        params.ePopup.style.minWidth = `${minWidth}px`;
        const widthOfParent = parentRect.right - parentRect.left;
        const maxX = widthOfParent - minWidth;
        // the x position of the popup depends on RTL or LTR. for normal cases, LTR, we put the child popup
        // to the right, unless it doesn't fit and we then put it to the left. for RTL it's the other way around,
        // we try place it first to the left, and then if not to the right.
        let x;
        if (this.gridOptionsService.is('enableRtl')) {
            // for RTL, try left first
            x = xLeftPosition();
            if (x < 0) {
                x = xRightPosition();
            }
            if (x > maxX) {
                x = 0;
            }
        }
        else {
            // for LTR, try right first
            x = xRightPosition();
            if (x > maxX) {
                x = xLeftPosition();
            }
            if (x < 0) {
                x = 0;
            }
        }
        params.ePopup.style.left = `${x}px`;
        params.ePopup.style.top = `${y}px`;
        function xRightPosition() {
            return sourceRect.right - parentRect.left - 2;
        }
        function xLeftPosition() {
            return sourceRect.left - parentRect.left - minWidth;
        }
    }
    positionPopupUnderMouseEvent(params) {
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
    calculatePointerAlign(e) {
        const parentRect = this.getParentRect();
        return {
            x: e.clientX - parentRect.left,
            y: e.clientY - parentRect.top
        };
    }
    positionPopupByComponent(params) {
        const sourceRect = params.eventSource.getBoundingClientRect();
        const alignSide = params.alignSide || 'left';
        const position = params.position || 'over';
        const parentRect = this.getParentRect();
        const updatePosition = () => {
            let x = sourceRect.left - parentRect.left;
            if (alignSide === 'right') {
                x -= (params.ePopup.offsetWidth - sourceRect.width);
            }
            const y = position === 'over'
                ? (sourceRect.top - parentRect.top)
                : (sourceRect.top - parentRect.top + sourceRect.height);
            return { x, y };
        };
        this.positionPopup({
            ePopup: params.ePopup,
            nudgeX: params.nudgeX,
            nudgeY: params.nudgeY,
            keepWithinBounds: params.keepWithinBounds,
            updatePosition,
            postProcessCallback: () => this.callPostProcessPopup(params.type, params.ePopup, params.eventSource, null, params.column, params.rowNode)
        });
    }
    callPostProcessPopup(type, ePopup, eventSource, mouseEvent, column, rowNode) {
        const callback = this.gridOptionsService.getCallback('postProcessPopup');
        if (callback) {
            const params = {
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
    positionPopup(params) {
        const { ePopup, keepWithinBounds, nudgeX, nudgeY, skipObserver, updatePosition } = params;
        const lastSize = { width: 0, height: 0 };
        const updatePopupPosition = (fromResizeObserver = false) => {
            let { x, y } = updatePosition();
            if (fromResizeObserver &&
                ePopup.clientWidth === lastSize.width &&
                ePopup.clientHeight === lastSize.height) {
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
            setTimeout(() => resizeObserverDestroyFunc(), PopupService_1.WAIT_FOR_POPUP_CONTENT_RESIZE);
        }
    }
    getActivePopups() {
        return this.popupList.map((popup) => popup.element);
    }
    getPopupList() {
        return this.popupList;
    }
    getParentRect() {
        // subtract the popup parent borders, because popupParent.getBoundingClientRect
        // returns the rect outside the borders, but the 0,0 coordinate for absolute
        // positioning is inside the border, leading the popup to be off by the width
        // of the border
        const eDocument = this.gridOptionsService.getDocument();
        let popupParent = this.getPopupParent();
        if (popupParent === eDocument.body) {
            popupParent = eDocument.documentElement;
        }
        else if (getComputedStyle(popupParent).position === 'static') {
            popupParent = popupParent.offsetParent;
        }
        const style = getComputedStyle(popupParent);
        const bounds = popupParent.getBoundingClientRect();
        return {
            top: bounds.top + parseFloat(style.borderTopWidth) || 0,
            left: bounds.left + parseFloat(style.borderLeftWidth) || 0,
            right: bounds.right + parseFloat(style.borderRightWidth) || 0,
            bottom: bounds.bottom + parseFloat(style.borderBottomWidth) || 0,
        };
    }
    keepXYWithinBounds(ePopup, position, direction) {
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
    keepPopupPositionedRelativeTo(params) {
        const eParent = this.getPopupParent();
        const parentRect = eParent.getBoundingClientRect();
        const sourceRect = params.element.getBoundingClientRect();
        const initialDiffTop = parentRect.top - sourceRect.top;
        const initialDiffLeft = parentRect.left - sourceRect.left;
        let lastDiffTop = initialDiffTop;
        let lastDiffLeft = initialDiffLeft;
        const topPx = params.ePopup.style.top;
        const top = parseInt(topPx.substring(0, topPx.length - 1), 10);
        const leftPx = params.ePopup.style.left;
        const left = parseInt(leftPx.substring(0, leftPx.length - 1), 10);
        return new AgPromise(resolve => {
            this.getFrameworkOverrides().setInterval(() => {
                const pRect = eParent.getBoundingClientRect();
                const sRect = params.element.getBoundingClientRect();
                const elementNotInDom = sRect.top == 0 && sRect.left == 0 && sRect.height == 0 && sRect.width == 0;
                if (elementNotInDom) {
                    params.hidePopup();
                    return;
                }
                const currentDiffTop = pRect.top - sRect.top;
                if (currentDiffTop != lastDiffTop) {
                    const newTop = this.keepXYWithinBounds(params.ePopup, top + initialDiffTop - currentDiffTop, DIRECTION.vertical);
                    params.ePopup.style.top = `${newTop}px`;
                }
                lastDiffTop = currentDiffTop;
                const currentDiffLeft = pRect.left - sRect.left;
                if (currentDiffLeft != lastDiffLeft) {
                    const newLeft = this.keepXYWithinBounds(params.ePopup, left + initialDiffLeft - currentDiffLeft, DIRECTION.horizontal);
                    params.ePopup.style.left = `${newLeft}px`;
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
    addPopup(params) {
        const { modal, eChild, closeOnEsc, closedCallback, click, alwaysOnTop, afterGuiAttached, positionCallback, anchorToElement, ariaLabel } = params;
        const eDocument = this.gridOptionsService.getDocument();
        let destroyPositionTracker = new AgPromise(resolve => resolve(() => { }));
        if (!eDocument) {
            console.warn('AG Grid: could not find the document, document is empty');
            return { hideFunc: () => { }, stopAnchoringPromise: destroyPositionTracker };
        }
        const pos = this.popupList.findIndex(popup => popup.element === eChild);
        if (pos !== -1) {
            const popup = this.popupList[pos];
            return { hideFunc: popup.hideFunc, stopAnchoringPromise: popup.stopAnchoringPromise };
        }
        const ePopupParent = this.getPopupParent();
        if (eChild.style.top == null) {
            eChild.style.top = '0px';
        }
        if (eChild.style.left == null) {
            eChild.style.left = '0px';
        }
        // add env CSS class to child, in case user provided a popup parent, which means
        // theme class may be missing
        const eWrapper = document.createElement('div');
        const { allThemes } = this.environment.getTheme();
        if (allThemes.length) {
            eWrapper.classList.add(...allThemes);
        }
        eWrapper.classList.add('ag-popup');
        eChild.classList.add(this.gridOptionsService.is('enableRtl') ? 'ag-rtl' : 'ag-ltr', 'ag-popup-child');
        if (!eChild.hasAttribute('role')) {
            setAriaRole(eChild, 'dialog');
        }
        setAriaLabel(eChild, ariaLabel);
        if (this.focusService.isKeyboardMode()) {
            eChild.classList.add(FocusService.AG_KEYBOARD_FOCUS);
        }
        eWrapper.appendChild(eChild);
        ePopupParent.appendChild(eWrapper);
        if (alwaysOnTop) {
            this.setAlwaysOnTop(eWrapper, true);
        }
        else {
            this.bringPopupToFront(eWrapper);
        }
        let popupHidden = false;
        const hidePopupOnKeyboardEvent = (event) => {
            if (!eWrapper.contains(eDocument.activeElement)) {
                return;
            }
            const key = event.key;
            if (key === KeyCode.ESCAPE) {
                hidePopup({ keyboardEvent: event });
            }
        };
        const hidePopupOnMouseEvent = (event) => hidePopup({ mouseEvent: event });
        const hidePopupOnTouchEvent = (event) => hidePopup({ touchEvent: event });
        const hidePopup = (popupParams = {}) => {
            const { mouseEvent, touchEvent, keyboardEvent } = popupParams;
            if (
            // we don't hide popup if the event was on the child, or any
            // children of this child
            this.isEventFromCurrentPopup({ mouseEvent, touchEvent }, eChild) ||
                // if the event to close is actually the open event, then ignore it
                this.isEventSameChainAsOriginalEvent({ originalMouseEvent: click, mouseEvent, touchEvent }) ||
                // this method should only be called once. the client can have different
                // paths, each one wanting to close, so this method may be called multiple times.
                popupHidden) {
                return;
            }
            popupHidden = true;
            ePopupParent.removeChild(eWrapper);
            eDocument.removeEventListener('keydown', hidePopupOnKeyboardEvent);
            eDocument.removeEventListener('mousedown', hidePopupOnMouseEvent);
            eDocument.removeEventListener('touchstart', hidePopupOnTouchEvent);
            eDocument.removeEventListener('contextmenu', hidePopupOnMouseEvent);
            this.eventService.removeEventListener(Events.EVENT_DRAG_STARTED, hidePopupOnMouseEvent);
            if (closedCallback) {
                closedCallback(mouseEvent || touchEvent || keyboardEvent);
            }
            this.popupList = this.popupList.filter(popup => popup.element !== eChild);
            if (destroyPositionTracker) {
                destroyPositionTracker.then(destroyFunc => destroyFunc && destroyFunc());
            }
        };
        if (afterGuiAttached) {
            afterGuiAttached({ hidePopup });
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
        if (positionCallback) {
            positionCallback();
        }
        if (anchorToElement) {
            // keeps popup positioned under created, eg if context menu, if user scrolls
            // using touchpad and the cell moves, it moves the popup to keep it with the cell.
            destroyPositionTracker = this.keepPopupPositionedRelativeTo({
                element: anchorToElement,
                ePopup: eChild,
                hidePopup
            });
        }
        this.popupList.push({
            element: eChild,
            wrapper: eWrapper,
            hideFunc: hidePopup,
            stopAnchoringPromise: destroyPositionTracker,
            instanceId: instanceIdSeq++,
            isAnchored: !!anchorToElement
        });
        return {
            hideFunc: hidePopup,
            stopAnchoringPromise: destroyPositionTracker
        };
    }
    hasAnchoredPopup() {
        return this.popupList.some(popup => popup.isAnchored);
    }
    isEventFromCurrentPopup(params, target) {
        const { mouseEvent, touchEvent } = params;
        const event = mouseEvent ? mouseEvent : touchEvent;
        if (!event) {
            return false;
        }
        const indexOfThisChild = this.popupList.findIndex(popup => popup.element === target);
        if (indexOfThisChild === -1) {
            return false;
        }
        for (let i = indexOfThisChild; i < this.popupList.length; i++) {
            const popup = this.popupList[i];
            if (isElementInEventPath(popup.element, event)) {
                return true;
            }
        }
        // if the user did not write their own Custom Element to be rendered as popup
        // and this component has an additional popup element, they should have the
        // `ag-custom-component-popup` class to be detected as part of the Custom Component
        return this.isElementWithinCustomPopup(event.target);
    }
    isElementWithinCustomPopup(el) {
        const eDocument = this.gridOptionsService.getDocument();
        while (el && el !== eDocument.body) {
            if (el.classList.contains('ag-custom-component-popup') || el.parentElement === null) {
                return true;
            }
            el = el.parentElement;
        }
        return false;
    }
    // in some browsers, the context menu event can be fired before the click event, which means
    // the context menu event could open the popup, but then the click event closes it straight away.
    isEventSameChainAsOriginalEvent(params) {
        const { originalMouseEvent, mouseEvent, touchEvent } = params;
        // we check the coordinates of the event, to see if it's the same event. there is a 1 / 1000 chance that
        // the event is a different event, however that is an edge case that is not very relevant (the user clicking
        // twice on the same location isn't a normal path).
        // event could be mouse event or touch event.
        let mouseEventOrTouch = null;
        if (mouseEvent) {
            // mouse event can be used direction, it has coordinates
            mouseEventOrTouch = mouseEvent;
        }
        else if (touchEvent) {
            // touch event doesn't have coordinates, need it's touch object
            mouseEventOrTouch = touchEvent.touches[0];
        }
        if (mouseEventOrTouch && originalMouseEvent) {
            // for x, allow 4px margin, to cover iPads, where touch (which opens menu) is followed
            // by browser click (when you finger up, touch is interrupted as click in browser)
            const screenX = mouseEvent ? mouseEvent.screenX : 0;
            const screenY = mouseEvent ? mouseEvent.screenY : 0;
            const xMatch = Math.abs(originalMouseEvent.screenX - screenX) < 5;
            const yMatch = Math.abs(originalMouseEvent.screenY - screenY) < 5;
            if (xMatch && yMatch) {
                return true;
            }
        }
        return false;
    }
    getWrapper(ePopup) {
        while (!ePopup.classList.contains('ag-popup') && ePopup.parentElement) {
            ePopup = ePopup.parentElement;
        }
        return ePopup.classList.contains('ag-popup') ? ePopup : null;
    }
    setAlwaysOnTop(ePopup, alwaysOnTop) {
        const eWrapper = this.getWrapper(ePopup);
        if (!eWrapper) {
            return;
        }
        eWrapper.classList.toggle('ag-always-on-top', !!alwaysOnTop);
        if (alwaysOnTop) {
            this.bringPopupToFront(eWrapper);
        }
    }
    bringPopupToFront(ePopup) {
        const parent = this.getPopupParent();
        const popupList = Array.prototype.slice.call(parent.querySelectorAll('.ag-popup'));
        const popupLen = popupList.length;
        const alwaysOnTopList = Array.prototype.slice.call(parent.querySelectorAll('.ag-popup.ag-always-on-top'));
        const onTopLength = alwaysOnTopList.length;
        const eWrapper = this.getWrapper(ePopup);
        if (!eWrapper || popupLen <= 1 || !parent.contains(ePopup)) {
            return;
        }
        const pos = popupList.indexOf(eWrapper);
        const innerEls = eWrapper.querySelectorAll('div');
        const innerElsScrollMap = [];
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
            }
            else if (pos !== popupLen - onTopLength - 1) {
                alwaysOnTopList[0].insertAdjacentElement('beforebegin', eWrapper);
            }
        }
        else if (pos !== popupLen - 1) {
            last(popupList).insertAdjacentElement('afterend', eWrapper);
        }
        while (innerElsScrollMap.length) {
            const currentEl = innerElsScrollMap.pop();
            currentEl[0].scrollTop = currentEl[1];
        }
        const params = {
            type: 'popupToFront',
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi,
            eWrapper
        };
        this.eventService.dispatchEvent(params);
    }
};
PopupService.WAIT_FOR_POPUP_CONTENT_RESIZE = 200;
__decorate([
    Autowired('focusService')
], PopupService.prototype, "focusService", void 0);
__decorate([
    Autowired('ctrlsService')
], PopupService.prototype, "ctrlsService", void 0);
__decorate([
    Autowired('resizeObserverService')
], PopupService.prototype, "resizeObserverService", void 0);
__decorate([
    PostConstruct
], PopupService.prototype, "postConstruct", null);
PopupService = PopupService_1 = __decorate([
    Bean('popupService')
], PopupService);
export { PopupService };
