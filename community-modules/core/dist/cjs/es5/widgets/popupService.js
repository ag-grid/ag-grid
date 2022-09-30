/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context/context");
var events_1 = require("../events");
var beanStub_1 = require("../context/beanStub");
var dom_1 = require("../utils/dom");
var array_1 = require("../utils/array");
var event_1 = require("../utils/event");
var keyCode_1 = require("../constants/keyCode");
var focusService_1 = require("../focusService");
var utils_1 = require("../utils");
var aria_1 = require("../utils/aria");
var DIRECTION;
(function (DIRECTION) {
    DIRECTION[DIRECTION["vertical"] = 0] = "vertical";
    DIRECTION[DIRECTION["horizontal"] = 1] = "horizontal";
})(DIRECTION || (DIRECTION = {}));
var instanceIdSeq = 0;
var PopupService = /** @class */ (function (_super) {
    __extends(PopupService, _super);
    function PopupService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.popupList = [];
        return _this;
    }
    PopupService.prototype.postConstruct = function () {
        var _this = this;
        this.ctrlsService.whenReady(function (p) {
            _this.gridCtrl = p.gridCtrl;
            _this.addManagedListener(_this.gridCtrl, events_1.Events.EVENT_KEYBOARD_FOCUS, function () {
                _this.popupList.forEach(function (popup) { return popup.element.classList.add(focusService_1.FocusService.AG_KEYBOARD_FOCUS); });
            });
            _this.addManagedListener(_this.gridCtrl, events_1.Events.EVENT_MOUSE_FOCUS, function () {
                _this.popupList.forEach(function (popup) { return popup.element.classList.remove(focusService_1.FocusService.AG_KEYBOARD_FOCUS); });
            });
        });
    };
    PopupService.prototype.getPopupParent = function () {
        var ePopupParent = this.gridOptionsWrapper.getPopupParent();
        if (ePopupParent) {
            return ePopupParent;
        }
        return this.gridCtrl.getGui();
    };
    PopupService.prototype.positionPopupForMenu = function (params) {
        var sourceRect = params.eventSource.getBoundingClientRect();
        var parentRect = this.getParentRect();
        var y = this.keepXYWithinBounds(params.ePopup, sourceRect.top - parentRect.top, DIRECTION.vertical);
        var minWidth = (params.ePopup.clientWidth > 0) ? params.ePopup.clientWidth : 200;
        params.ePopup.style.minWidth = minWidth + "px";
        var widthOfParent = parentRect.right - parentRect.left;
        var maxX = widthOfParent - minWidth;
        // the x position of the popup depends on RTL or LTR. for normal cases, LTR, we put the child popup
        // to the right, unless it doesn't fit and we then put it to the left. for RTL it's the other way around,
        // we try place it first to the left, and then if not to the right.
        var x;
        if (this.gridOptionsWrapper.isEnableRtl()) {
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
        params.ePopup.style.left = x + "px";
        params.ePopup.style.top = y + "px";
        function xRightPosition() {
            return sourceRect.right - parentRect.left - 2;
        }
        function xLeftPosition() {
            return sourceRect.left - parentRect.left - minWidth;
        }
    };
    PopupService.prototype.positionPopupUnderMouseEvent = function (params) {
        var ePopup = params.ePopup, nudgeX = params.nudgeX, nudgeY = params.nudgeY;
        var _a = this.calculatePointerAlign(params.mouseEvent), x = _a.x, y = _a.y;
        this.positionPopup({
            ePopup: ePopup,
            x: x,
            y: y,
            nudgeX: nudgeX,
            nudgeY: nudgeY,
            keepWithinBounds: true
        });
        this.callPostProcessPopup(params.type, params.ePopup, null, params.mouseEvent, params.column, params.rowNode);
    };
    PopupService.prototype.calculatePointerAlign = function (e) {
        var parentRect = this.getParentRect();
        return {
            x: e.clientX - parentRect.left,
            y: e.clientY - parentRect.top
        };
    };
    PopupService.prototype.positionPopupUnderComponent = function (params) {
        var sourceRect = params.eventSource.getBoundingClientRect();
        var alignSide = params.alignSide || 'left';
        var parentRect = this.getParentRect();
        var x = sourceRect.left - parentRect.left;
        if (alignSide === 'right') {
            x -= (params.ePopup.offsetWidth - sourceRect.width);
        }
        this.positionPopup({
            ePopup: params.ePopup,
            nudgeX: params.nudgeX,
            nudgeY: params.nudgeY,
            x: x,
            y: sourceRect.top - parentRect.top + sourceRect.height,
            keepWithinBounds: params.keepWithinBounds
        });
        this.callPostProcessPopup(params.type, params.ePopup, params.eventSource, null, params.column, params.rowNode);
    };
    PopupService.prototype.positionPopupOverComponent = function (params) {
        var sourceRect = params.eventSource.getBoundingClientRect();
        var parentRect = this.getParentRect();
        this.positionPopup({
            ePopup: params.ePopup,
            nudgeX: params.nudgeX,
            nudgeY: params.nudgeY,
            x: sourceRect.left - parentRect.left,
            y: sourceRect.top - parentRect.top,
            keepWithinBounds: params.keepWithinBounds
        });
        this.callPostProcessPopup(params.type, params.ePopup, params.eventSource, null, params.column, params.rowNode);
    };
    PopupService.prototype.callPostProcessPopup = function (type, ePopup, eventSource, mouseEvent, column, rowNode) {
        var callback = this.gridOptionsWrapper.getPostProcessPopupFunc();
        if (callback) {
            var params = {
                column: column,
                rowNode: rowNode,
                ePopup: ePopup,
                type: type,
                eventSource: eventSource,
                mouseEvent: mouseEvent
            };
            callback(params);
        }
    };
    PopupService.prototype.positionPopup = function (params) {
        var ePopup = params.ePopup, keepWithinBounds = params.keepWithinBounds, nudgeX = params.nudgeX, nudgeY = params.nudgeY;
        var x = params.x, y = params.y;
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
        ePopup.style.left = x + "px";
        ePopup.style.top = y + "px";
    };
    PopupService.prototype.getActivePopups = function () {
        return this.popupList.map(function (popup) { return popup.element; });
    };
    PopupService.prototype.getPopupList = function () {
        return this.popupList;
    };
    PopupService.prototype.getParentRect = function () {
        // subtract the popup parent borders, because popupParent.getBoundingClientRect
        // returns the rect outside the borders, but the 0,0 coordinate for absolute
        // positioning is inside the border, leading the popup to be off by the width
        // of the border
        var eDocument = this.gridOptionsWrapper.getDocument();
        var popupParent = this.getPopupParent();
        if (popupParent === eDocument.body) {
            popupParent = eDocument.documentElement;
        }
        else if (getComputedStyle(popupParent).position === 'static') {
            popupParent = popupParent.offsetParent;
        }
        var style = getComputedStyle(popupParent);
        var bounds = popupParent.getBoundingClientRect();
        return {
            top: bounds.top + parseFloat(style.borderTopWidth) || 0,
            left: bounds.left + parseFloat(style.borderLeftWidth) || 0,
            right: bounds.right + parseFloat(style.borderRightWidth) || 0,
            bottom: bounds.bottom + parseFloat(style.borderBottomWidth) || 0,
        };
    };
    PopupService.prototype.keepXYWithinBounds = function (ePopup, position, direction) {
        var isVertical = direction === DIRECTION.vertical;
        var sizeProperty = isVertical ? 'clientHeight' : 'clientWidth';
        var anchorProperty = isVertical ? 'top' : 'left';
        var offsetProperty = isVertical ? 'offsetHeight' : 'offsetWidth';
        var scrollPositionProperty = isVertical ? 'scrollTop' : 'scrollLeft';
        var eDocument = this.gridOptionsWrapper.getDocument();
        var docElement = eDocument.documentElement;
        var popupParent = this.getPopupParent();
        var parentRect = popupParent.getBoundingClientRect();
        var documentRect = eDocument.documentElement.getBoundingClientRect();
        var isBody = popupParent === eDocument.body;
        var offsetSize = ePopup[offsetProperty];
        var getSize = isVertical ? dom_1.getAbsoluteHeight : dom_1.getAbsoluteWidth;
        var sizeOfParent = isBody ? (getSize(docElement) + docElement[scrollPositionProperty]) : popupParent[sizeProperty];
        if (isBody) {
            sizeOfParent -= Math.abs(documentRect[anchorProperty] - parentRect[anchorProperty]);
        }
        var max = sizeOfParent - offsetSize;
        return Math.min(Math.max(position, 0), Math.abs(max));
    };
    PopupService.prototype.keepPopupPositionedRelativeTo = function (params) {
        var _this = this;
        var eParent = this.getPopupParent();
        var parentRect = eParent.getBoundingClientRect();
        var sourceRect = params.element.getBoundingClientRect();
        var initialDiffTop = parentRect.top - sourceRect.top;
        var initialDiffLeft = parentRect.left - sourceRect.left;
        var lastDiffTop = initialDiffTop;
        var lastDiffLeft = initialDiffLeft;
        var topPx = params.ePopup.style.top;
        var top = parseInt(topPx.substring(0, topPx.length - 1), 10);
        var leftPx = params.ePopup.style.left;
        var left = parseInt(leftPx.substring(0, leftPx.length - 1), 10);
        return new utils_1.AgPromise(function (resolve) {
            _this.getFrameworkOverrides().setInterval(function () {
                var pRect = eParent.getBoundingClientRect();
                var sRect = params.element.getBoundingClientRect();
                var elementNotInDom = sRect.top == 0 && sRect.left == 0 && sRect.height == 0 && sRect.width == 0;
                if (elementNotInDom) {
                    params.hidePopup();
                    return;
                }
                var currentDiffTop = pRect.top - sRect.top;
                if (currentDiffTop != lastDiffTop) {
                    var newTop = _this.keepXYWithinBounds(params.ePopup, top + initialDiffTop - currentDiffTop, DIRECTION.vertical);
                    params.ePopup.style.top = newTop + "px";
                }
                lastDiffTop = currentDiffTop;
                var currentDiffLeft = pRect.left - sRect.left;
                if (currentDiffLeft != lastDiffLeft) {
                    var newLeft = _this.keepXYWithinBounds(params.ePopup, left + initialDiffLeft - currentDiffLeft, DIRECTION.horizontal);
                    params.ePopup.style.left = newLeft + "px";
                }
                lastDiffLeft = currentDiffLeft;
            }, 200).then(function (intervalId) {
                var result = function () {
                    if (intervalId != null) {
                        window.clearInterval(intervalId);
                    }
                };
                resolve(result);
            });
        });
    };
    PopupService.prototype.addPopup = function (params) {
        var _a;
        var _this = this;
        var modal = params.modal, eChild = params.eChild, closeOnEsc = params.closeOnEsc, closedCallback = params.closedCallback, click = params.click, alwaysOnTop = params.alwaysOnTop, afterGuiAttached = params.afterGuiAttached, positionCallback = params.positionCallback, anchorToElement = params.anchorToElement, ariaLabel = params.ariaLabel;
        var eDocument = this.gridOptionsWrapper.getDocument();
        var destroyPositionTracker = new utils_1.AgPromise(function (resolve) { return resolve(function () { }); });
        if (!eDocument) {
            console.warn('ag-grid: could not find the document, document is empty');
            return { hideFunc: function () { }, stopAnchoringPromise: destroyPositionTracker };
        }
        var pos = this.popupList.findIndex(function (popup) { return popup.element === eChild; });
        if (pos !== -1) {
            var popup = this.popupList[pos];
            return { hideFunc: popup.hideFunc, stopAnchoringPromise: popup.stopAnchoringPromise };
        }
        var ePopupParent = this.getPopupParent();
        if (eChild.style.top == null) {
            eChild.style.top = '0px';
        }
        if (eChild.style.left == null) {
            eChild.style.left = '0px';
        }
        // add env CSS class to child, in case user provided a popup parent, which means
        // theme class may be missing
        var eWrapper = document.createElement('div');
        var allThemes = this.environment.getTheme().allThemes;
        if (allThemes.length) {
            (_a = eWrapper.classList).add.apply(_a, __spread(allThemes));
        }
        eWrapper.classList.add('ag-popup');
        eChild.classList.add(this.gridOptionsWrapper.isEnableRtl() ? 'ag-rtl' : 'ag-ltr', 'ag-popup-child');
        if (!eChild.hasAttribute('role')) {
            aria_1.setAriaRole(eChild, 'dialog');
        }
        aria_1.setAriaLabel(eChild, ariaLabel);
        if (this.focusService.isKeyboardMode()) {
            eChild.classList.add(focusService_1.FocusService.AG_KEYBOARD_FOCUS);
        }
        eWrapper.appendChild(eChild);
        ePopupParent.appendChild(eWrapper);
        if (alwaysOnTop) {
            this.setAlwaysOnTop(eWrapper, true);
        }
        else {
            this.bringPopupToFront(eWrapper);
        }
        var popupHidden = false;
        var hidePopupOnKeyboardEvent = function (event) {
            if (!eWrapper.contains(eDocument.activeElement)) {
                return;
            }
            var key = event.key;
            if (key === keyCode_1.KeyCode.ESCAPE) {
                hidePopup({ keyboardEvent: event });
            }
        };
        var hidePopupOnMouseEvent = function (event) { return hidePopup({ mouseEvent: event }); };
        var hidePopupOnTouchEvent = function (event) { return hidePopup({ touchEvent: event }); };
        var hidePopup = function (popupParams) {
            if (popupParams === void 0) { popupParams = {}; }
            var mouseEvent = popupParams.mouseEvent, touchEvent = popupParams.touchEvent, keyboardEvent = popupParams.keyboardEvent;
            if (
            // we don't hide popup if the event was on the child, or any
            // children of this child
            _this.isEventFromCurrentPopup({ mouseEvent: mouseEvent, touchEvent: touchEvent }, eChild) ||
                // if the event to close is actually the open event, then ignore it
                _this.isEventSameChainAsOriginalEvent({ originalMouseEvent: click, mouseEvent: mouseEvent, touchEvent: touchEvent }) ||
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
            _this.eventService.removeEventListener(events_1.Events.EVENT_DRAG_STARTED, hidePopupOnMouseEvent);
            if (closedCallback) {
                closedCallback(mouseEvent || touchEvent || keyboardEvent);
            }
            _this.popupList = _this.popupList.filter(function (popup) { return popup.element !== eChild; });
            if (destroyPositionTracker) {
                destroyPositionTracker.then(function (destroyFunc) { return destroyFunc && destroyFunc(); });
            }
        };
        if (afterGuiAttached) {
            afterGuiAttached({ hidePopup: hidePopup });
        }
        // if we add these listeners now, then the current mouse
        // click will be included, which we don't want
        window.setTimeout(function () {
            if (closeOnEsc) {
                eDocument.addEventListener('keydown', hidePopupOnKeyboardEvent);
            }
            if (modal) {
                eDocument.addEventListener('mousedown', hidePopupOnMouseEvent);
                _this.eventService.addEventListener(events_1.Events.EVENT_DRAG_STARTED, hidePopupOnMouseEvent);
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
                hidePopup: hidePopup
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
    };
    PopupService.prototype.hasAnchoredPopup = function () {
        return this.popupList.some(function (popup) { return popup.isAnchored; });
    };
    PopupService.prototype.isEventFromCurrentPopup = function (params, target) {
        var mouseEvent = params.mouseEvent, touchEvent = params.touchEvent;
        var event = mouseEvent ? mouseEvent : touchEvent;
        if (!event) {
            return false;
        }
        var indexOfThisChild = this.popupList.findIndex(function (popup) { return popup.element === target; });
        if (indexOfThisChild === -1) {
            return false;
        }
        for (var i = indexOfThisChild; i < this.popupList.length; i++) {
            var popup = this.popupList[i];
            if (event_1.isElementInEventPath(popup.element, event)) {
                return true;
            }
        }
        // if the user did not write their own Custom Element to be rendered as popup
        // and this component has an additional popup element, they should have the
        // `ag-custom-component-popup` class to be detected as part of the Custom Component
        return this.isElementWithinCustomPopup(event.target);
    };
    PopupService.prototype.isElementWithinCustomPopup = function (el) {
        var eDocument = this.gridOptionsWrapper.getDocument();
        while (el && el !== eDocument.body) {
            if (el.classList.contains('ag-custom-component-popup') || el.parentElement === null) {
                return true;
            }
            el = el.parentElement;
        }
        return false;
    };
    // in some browsers, the context menu event can be fired before the click event, which means
    // the context menu event could open the popup, but then the click event closes it straight away.
    PopupService.prototype.isEventSameChainAsOriginalEvent = function (params) {
        var originalMouseEvent = params.originalMouseEvent, mouseEvent = params.mouseEvent, touchEvent = params.touchEvent;
        // we check the coordinates of the event, to see if it's the same event. there is a 1 / 1000 chance that
        // the event is a different event, however that is an edge case that is not very relevant (the user clicking
        // twice on the same location isn't a normal path).
        // event could be mouse event or touch event.
        var mouseEventOrTouch = null;
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
            var screenX_1 = mouseEvent ? mouseEvent.screenX : 0;
            var screenY_1 = mouseEvent ? mouseEvent.screenY : 0;
            var xMatch = Math.abs(originalMouseEvent.screenX - screenX_1) < 5;
            var yMatch = Math.abs(originalMouseEvent.screenY - screenY_1) < 5;
            if (xMatch && yMatch) {
                return true;
            }
        }
        return false;
    };
    PopupService.prototype.getWrapper = function (ePopup) {
        while (!ePopup.classList.contains('ag-popup') && ePopup.parentElement) {
            ePopup = ePopup.parentElement;
        }
        return ePopup.classList.contains('ag-popup') ? ePopup : null;
    };
    PopupService.prototype.setAlwaysOnTop = function (ePopup, alwaysOnTop) {
        var eWrapper = this.getWrapper(ePopup);
        if (!eWrapper) {
            return;
        }
        eWrapper.classList.toggle('ag-always-on-top', !!alwaysOnTop);
        if (alwaysOnTop) {
            this.bringPopupToFront(eWrapper);
        }
    };
    PopupService.prototype.bringPopupToFront = function (ePopup) {
        var parent = this.getPopupParent();
        var popupList = Array.prototype.slice.call(parent.querySelectorAll('.ag-popup'));
        var popupLen = popupList.length;
        var alwaysOnTopList = Array.prototype.slice.call(parent.querySelectorAll('.ag-popup.ag-always-on-top'));
        var onTopLength = alwaysOnTopList.length;
        var eWrapper = this.getWrapper(ePopup);
        if (!eWrapper || popupLen <= 1 || !parent.contains(ePopup)) {
            return;
        }
        var pos = popupList.indexOf(eWrapper);
        var innerEls = eWrapper.querySelectorAll('div');
        var innerElsScrollMap = [];
        innerEls.forEach(function (el) {
            if (el.scrollTop !== 0) {
                innerElsScrollMap.push([el, el.scrollTop]);
            }
        });
        if (onTopLength) {
            var isPopupAlwaysOnTop = eWrapper.classList.contains('ag-always-on-top');
            if (isPopupAlwaysOnTop) {
                if (pos !== popupLen - 1) {
                    array_1.last(alwaysOnTopList).insertAdjacentElement('afterend', eWrapper);
                }
            }
            else if (pos !== popupLen - onTopLength - 1) {
                alwaysOnTopList[0].insertAdjacentElement('beforebegin', eWrapper);
            }
        }
        else if (pos !== popupLen - 1) {
            array_1.last(popupList).insertAdjacentElement('afterend', eWrapper);
        }
        while (innerElsScrollMap.length) {
            var currentEl = innerElsScrollMap.pop();
            currentEl[0].scrollTop = currentEl[1];
        }
        var params = {
            type: 'popupToFront',
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            eWrapper: eWrapper
        };
        this.eventService.dispatchEvent(params);
    };
    __decorate([
        context_1.Autowired('environment')
    ], PopupService.prototype, "environment", void 0);
    __decorate([
        context_1.Autowired('focusService')
    ], PopupService.prototype, "focusService", void 0);
    __decorate([
        context_1.Autowired('ctrlsService')
    ], PopupService.prototype, "ctrlsService", void 0);
    __decorate([
        context_1.PostConstruct
    ], PopupService.prototype, "postConstruct", null);
    PopupService = __decorate([
        context_1.Bean('popupService')
    ], PopupService);
    return PopupService;
}(beanStub_1.BeanStub));
exports.PopupService = PopupService;
