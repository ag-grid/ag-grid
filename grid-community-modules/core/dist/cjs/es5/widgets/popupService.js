"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopupService = void 0;
var context_1 = require("../context/context");
var events_1 = require("../events");
var beanStub_1 = require("../context/beanStub");
var dom_1 = require("../utils/dom");
var array_1 = require("../utils/array");
var event_1 = require("../utils/event");
var keyCode_1 = require("../constants/keyCode");
var utils_1 = require("../utils");
var aria_1 = require("../utils/aria");
var generic_1 = require("../utils/generic");
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
    PopupService_1 = PopupService;
    PopupService.prototype.postConstruct = function () {
        var _this = this;
        this.ctrlsService.whenReady(function (p) {
            _this.gridCtrl = p.gridCtrl;
        });
        this.addManagedListener(this.eventService, events_1.Events.EVENT_GRID_STYLES_CHANGED, this.handleThemeChange.bind(this));
    };
    PopupService.prototype.getPopupParent = function () {
        var ePopupParent = this.gridOptionsService.get('popupParent');
        if (ePopupParent) {
            return ePopupParent;
        }
        return this.gridCtrl.getGui();
    };
    PopupService.prototype.positionPopupForMenu = function (params) {
        var eventSource = params.eventSource, ePopup = params.ePopup;
        var popupIdx = this.getPopupIndex(ePopup);
        if (popupIdx !== -1) {
            var popup = this.popupList[popupIdx];
            popup.alignedToElement = eventSource;
        }
        var sourceRect = eventSource.getBoundingClientRect();
        var parentRect = this.getParentRect();
        var y = this.keepXYWithinBounds(ePopup, sourceRect.top - parentRect.top, DIRECTION.vertical);
        var minWidth = (ePopup.clientWidth > 0) ? ePopup.clientWidth : 200;
        ePopup.style.minWidth = "".concat(minWidth, "px");
        var widthOfParent = parentRect.right - parentRect.left;
        var maxX = widthOfParent - minWidth;
        // the x position of the popup depends on RTL or LTR. for normal cases, LTR, we put the child popup
        // to the right, unless it doesn't fit and we then put it to the left. for RTL it's the other way around,
        // we try place it first to the left, and then if not to the right.
        var x;
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
        }
        else {
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
        ePopup.style.left = "".concat(x, "px");
        ePopup.style.top = "".concat(y, "px");
        function xRightPosition() {
            return sourceRect.right - parentRect.left - 2;
        }
        function xLeftPosition() {
            return sourceRect.left - parentRect.left - minWidth;
        }
    };
    PopupService.prototype.positionPopupUnderMouseEvent = function (params) {
        var _this = this;
        var ePopup = params.ePopup, nudgeX = params.nudgeX, nudgeY = params.nudgeY, skipObserver = params.skipObserver;
        this.positionPopup({
            ePopup: ePopup,
            nudgeX: nudgeX,
            nudgeY: nudgeY,
            keepWithinBounds: true,
            skipObserver: skipObserver,
            updatePosition: function () { return _this.calculatePointerAlign(params.mouseEvent); },
            postProcessCallback: function () { return _this.callPostProcessPopup(params.type, params.ePopup, null, params.mouseEvent, params.column, params.rowNode); }
        });
    };
    PopupService.prototype.calculatePointerAlign = function (e) {
        var parentRect = this.getParentRect();
        return {
            x: e.clientX - parentRect.left,
            y: e.clientY - parentRect.top
        };
    };
    PopupService.prototype.positionPopupByComponent = function (params) {
        var _this = this;
        var ePopup = params.ePopup, nudgeX = params.nudgeX, nudgeY = params.nudgeY, keepWithinBounds = params.keepWithinBounds, eventSource = params.eventSource, _a = params.alignSide, alignSide = _a === void 0 ? 'left' : _a, _b = params.position, position = _b === void 0 ? 'over' : _b, column = params.column, rowNode = params.rowNode, type = params.type;
        var sourceRect = eventSource.getBoundingClientRect();
        var parentRect = this.getParentRect();
        var popupIdx = this.getPopupIndex(ePopup);
        if (popupIdx !== -1) {
            var popup = this.popupList[popupIdx];
            popup.alignedToElement = eventSource;
        }
        var updatePosition = function () {
            var x = sourceRect.left - parentRect.left;
            if (alignSide === 'right') {
                x -= (ePopup.offsetWidth - sourceRect.width);
            }
            var y;
            if (position === 'over') {
                y = (sourceRect.top - parentRect.top);
                _this.setAlignedStyles(ePopup, 'over');
            }
            else {
                _this.setAlignedStyles(ePopup, 'under');
                var alignSide_1 = _this.shouldRenderUnderOrAbove(ePopup, sourceRect, parentRect, params.nudgeY || 0);
                if (alignSide_1 === 'under') {
                    y = (sourceRect.top - parentRect.top + sourceRect.height);
                }
                else {
                    y = (sourceRect.top - ePopup.offsetHeight - (nudgeY || 0) * 2) - parentRect.top;
                }
            }
            return { x: x, y: y };
        };
        this.positionPopup({
            ePopup: ePopup,
            nudgeX: nudgeX,
            nudgeY: nudgeY,
            keepWithinBounds: keepWithinBounds,
            updatePosition: updatePosition,
            postProcessCallback: function () { return _this.callPostProcessPopup(type, ePopup, eventSource, null, column, rowNode); }
        });
    };
    PopupService.prototype.shouldRenderUnderOrAbove = function (ePopup, targetCompRect, parentRect, nudgeY) {
        var spaceAvailableUnder = parentRect.bottom - targetCompRect.bottom;
        var spaceAvailableAbove = targetCompRect.top - parentRect.top;
        var spaceRequired = ePopup.offsetHeight + nudgeY;
        if (spaceAvailableUnder > spaceRequired) {
            return 'under';
        }
        if (spaceAvailableAbove > spaceRequired || spaceAvailableAbove > spaceAvailableUnder) {
            return 'above';
        }
        return 'under';
    };
    PopupService.prototype.setAlignedStyles = function (ePopup, positioned) {
        var popupIdx = this.getPopupIndex(ePopup);
        if (popupIdx === -1) {
            return;
        }
        var popup = this.popupList[popupIdx];
        var alignedToElement = popup.alignedToElement;
        if (!alignedToElement) {
            return;
        }
        var positions = ['right', 'left', 'over', 'above', 'under'];
        positions.forEach(function (position) {
            alignedToElement.classList.remove("ag-has-popup-positioned-".concat(position));
            ePopup.classList.remove("ag-popup-positioned-".concat(position));
        });
        if (!positioned) {
            return;
        }
        alignedToElement.classList.add("ag-has-popup-positioned-".concat(positioned));
        ePopup.classList.add("ag-popup-positioned-".concat(positioned));
    };
    PopupService.prototype.callPostProcessPopup = function (type, ePopup, eventSource, mouseEvent, column, rowNode) {
        var callback = this.gridOptionsService.getCallback('postProcessPopup');
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
        var _this = this;
        var ePopup = params.ePopup, keepWithinBounds = params.keepWithinBounds, nudgeX = params.nudgeX, nudgeY = params.nudgeY, skipObserver = params.skipObserver, updatePosition = params.updatePosition;
        var lastSize = { width: 0, height: 0 };
        var updatePopupPosition = function (fromResizeObserver) {
            if (fromResizeObserver === void 0) { fromResizeObserver = false; }
            var _a = updatePosition(), x = _a.x, y = _a.y;
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
                x = _this.keepXYWithinBounds(ePopup, x, DIRECTION.horizontal);
                y = _this.keepXYWithinBounds(ePopup, y, DIRECTION.vertical);
            }
            ePopup.style.left = "".concat(x, "px");
            ePopup.style.top = "".concat(y, "px");
            if (params.postProcessCallback) {
                params.postProcessCallback();
            }
        };
        updatePopupPosition();
        // Mouse tracking will recalculate positioning when moving, so won't need to recalculate here
        if (!skipObserver) {
            // Since rendering popup contents can be asynchronous, use a resize observer to
            // reposition the popup after initial updates to the size of the contents
            var resizeObserverDestroyFunc_1 = this.resizeObserverService.observeResize(ePopup, function () { return updatePopupPosition(true); });
            // Only need to reposition when first open, so can clean up after a bit of time
            setTimeout(function () { return resizeObserverDestroyFunc_1(); }, PopupService_1.WAIT_FOR_POPUP_CONTENT_RESIZE);
        }
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
        var eDocument = this.gridOptionsService.getDocument();
        var popupParent = this.getPopupParent();
        if (popupParent === eDocument.body) {
            popupParent = eDocument.documentElement;
        }
        else if (getComputedStyle(popupParent).position === 'static') {
            popupParent = popupParent.offsetParent;
        }
        return (0, dom_1.getElementRectWithOffset)(popupParent);
    };
    PopupService.prototype.keepXYWithinBounds = function (ePopup, position, direction) {
        var isVertical = direction === DIRECTION.vertical;
        var sizeProperty = isVertical ? 'clientHeight' : 'clientWidth';
        var anchorProperty = isVertical ? 'top' : 'left';
        var offsetProperty = isVertical ? 'offsetHeight' : 'offsetWidth';
        var scrollPositionProperty = isVertical ? 'scrollTop' : 'scrollLeft';
        var eDocument = this.gridOptionsService.getDocument();
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
    PopupService.prototype.addPopup = function (params) {
        var eDocument = this.gridOptionsService.getDocument();
        var eChild = params.eChild, ariaLabel = params.ariaLabel, alwaysOnTop = params.alwaysOnTop, positionCallback = params.positionCallback, anchorToElement = params.anchorToElement;
        if (!eDocument) {
            console.warn('AG Grid: could not find the document, document is empty');
            return { hideFunc: function () { } };
        }
        var pos = this.getPopupIndex(eChild);
        if (pos !== -1) {
            var popup = this.popupList[pos];
            return { hideFunc: popup.hideFunc };
        }
        this.initialisePopupPosition(eChild);
        var wrapperEl = this.createPopupWrapper(eChild, ariaLabel, !!alwaysOnTop);
        var removeListeners = this.addEventListenersToPopup(__assign(__assign({}, params), { wrapperEl: wrapperEl }));
        if (positionCallback) {
            positionCallback();
        }
        this.addPopupToPopupList(eChild, wrapperEl, removeListeners, anchorToElement);
        return {
            hideFunc: removeListeners
        };
    };
    PopupService.prototype.initialisePopupPosition = function (element) {
        var ePopupParent = this.getPopupParent();
        var ePopupParentRect = ePopupParent.getBoundingClientRect();
        if (!(0, generic_1.exists)(element.style.top)) {
            element.style.top = "".concat(ePopupParentRect.top * -1, "px");
        }
        if (!(0, generic_1.exists)(element.style.left)) {
            element.style.left = "".concat(ePopupParentRect.left * -1, "px");
        }
    };
    PopupService.prototype.createPopupWrapper = function (element, ariaLabel, alwaysOnTop) {
        var _a;
        var ePopupParent = this.getPopupParent();
        // add env CSS class to child, in case user provided a popup parent, which means
        // theme class may be missing
        var eWrapper = document.createElement('div');
        var allThemes = this.environment.getTheme().allThemes;
        if (allThemes.length) {
            (_a = eWrapper.classList).add.apply(_a, __spreadArray([], __read(allThemes), false));
        }
        eWrapper.classList.add('ag-popup');
        element.classList.add(this.gridOptionsService.get('enableRtl') ? 'ag-rtl' : 'ag-ltr', 'ag-popup-child');
        if (!element.hasAttribute('role')) {
            (0, aria_1.setAriaRole)(element, 'dialog');
        }
        (0, aria_1.setAriaLabel)(element, ariaLabel);
        eWrapper.appendChild(element);
        ePopupParent.appendChild(eWrapper);
        if (alwaysOnTop) {
            this.setAlwaysOnTop(element, true);
        }
        else {
            this.bringPopupToFront(element);
        }
        return eWrapper;
    };
    PopupService.prototype.handleThemeChange = function () {
        var e_1, _a, e_2, _b, _c;
        var allThemes = this.environment.getTheme().allThemes;
        try {
            for (var _d = __values(this.popupList), _e = _d.next(); !_e.done; _e = _d.next()) {
                var popup = _e.value;
                try {
                    for (var _f = (e_2 = void 0, __values(Array.from(popup.wrapper.classList))), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var className = _g.value;
                        if (className.startsWith("ag-theme-")) {
                            popup.wrapper.classList.remove(className);
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                if (allThemes.length) {
                    (_c = popup.wrapper.classList).add.apply(_c, __spreadArray([], __read(allThemes), false));
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    PopupService.prototype.addEventListenersToPopup = function (params) {
        var _this = this;
        var eDocument = this.gridOptionsService.getDocument();
        var ePopupParent = this.getPopupParent();
        var wrapperEl = params.wrapperEl, popupEl = params.eChild, pointerEvent = params.click, closedCallback = params.closedCallback, afterGuiAttached = params.afterGuiAttached, closeOnEsc = params.closeOnEsc, modal = params.modal;
        var popupHidden = false;
        var hidePopupOnKeyboardEvent = function (event) {
            if (!wrapperEl.contains(eDocument.activeElement)) {
                return;
            }
            var key = event.key;
            if (key === keyCode_1.KeyCode.ESCAPE && !(0, event_1.isStopPropagationForAgGrid)(event)) {
                removeListeners({ keyboardEvent: event });
            }
        };
        var hidePopupOnMouseEvent = function (event) { return removeListeners({ mouseEvent: event }); };
        var hidePopupOnTouchEvent = function (event) { return removeListeners({ touchEvent: event }); };
        var removeListeners = function (popupParams) {
            if (popupParams === void 0) { popupParams = {}; }
            var mouseEvent = popupParams.mouseEvent, touchEvent = popupParams.touchEvent, keyboardEvent = popupParams.keyboardEvent;
            if (
            // we don't hide popup if the event was on the child, or any
            // children of this child
            _this.isEventFromCurrentPopup({ mouseEvent: mouseEvent, touchEvent: touchEvent }, popupEl) ||
                // this method should only be called once. the client can have different
                // paths, each one wanting to close, so this method may be called multiple times.
                popupHidden) {
                return;
            }
            popupHidden = true;
            ePopupParent.removeChild(wrapperEl);
            eDocument.removeEventListener('keydown', hidePopupOnKeyboardEvent);
            eDocument.removeEventListener('mousedown', hidePopupOnMouseEvent);
            eDocument.removeEventListener('touchstart', hidePopupOnTouchEvent);
            eDocument.removeEventListener('contextmenu', hidePopupOnMouseEvent);
            _this.eventService.removeEventListener(events_1.Events.EVENT_DRAG_STARTED, hidePopupOnMouseEvent);
            if (closedCallback) {
                closedCallback(mouseEvent || touchEvent || keyboardEvent);
            }
            _this.removePopupFromPopupList(popupEl);
        };
        if (afterGuiAttached) {
            afterGuiAttached({ hidePopup: removeListeners });
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
        return removeListeners;
    };
    PopupService.prototype.addPopupToPopupList = function (element, wrapperEl, removeListeners, anchorToElement) {
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
    };
    PopupService.prototype.getPopupIndex = function (el) {
        return this.popupList.findIndex(function (p) { return p.element === el; });
    };
    PopupService.prototype.setPopupPositionRelatedToElement = function (popupEl, relativeElement) {
        var popupIndex = this.getPopupIndex(popupEl);
        if (popupIndex === -1) {
            return;
        }
        var popup = this.popupList[popupIndex];
        if (popup.stopAnchoringPromise) {
            popup.stopAnchoringPromise.then(function (destroyFunc) { return destroyFunc && destroyFunc(); });
        }
        popup.stopAnchoringPromise = undefined;
        popup.isAnchored = false;
        if (!relativeElement) {
            return;
        }
        // keeps popup positioned under created, eg if context menu, if user scrolls
        // using touchpad and the cell moves, it moves the popup to keep it with the cell.
        var destroyPositionTracker = this.keepPopupPositionedRelativeTo({
            element: relativeElement,
            ePopup: popupEl,
            hidePopup: popup.hideFunc
        });
        popup.stopAnchoringPromise = destroyPositionTracker;
        popup.isAnchored = true;
        return destroyPositionTracker;
    };
    PopupService.prototype.removePopupFromPopupList = function (element) {
        this.setAlignedStyles(element, null);
        this.setPopupPositionRelatedToElement(element, null);
        this.popupList = this.popupList.filter(function (p) { return p.element !== element; });
    };
    PopupService.prototype.keepPopupPositionedRelativeTo = function (params) {
        var _this = this;
        var eParent = this.getPopupParent();
        var parentRect = eParent.getBoundingClientRect();
        var element = params.element, ePopup = params.ePopup;
        var sourceRect = element.getBoundingClientRect();
        var initialDiffTop = parentRect.top - sourceRect.top;
        var initialDiffLeft = parentRect.left - sourceRect.left;
        var lastDiffTop = initialDiffTop;
        var lastDiffLeft = initialDiffLeft;
        var topPx = ePopup.style.top;
        var top = parseInt(topPx.substring(0, topPx.length - 1), 10);
        var leftPx = ePopup.style.left;
        var left = parseInt(leftPx.substring(0, leftPx.length - 1), 10);
        return new utils_1.AgPromise(function (resolve) {
            _this.getFrameworkOverrides().setInterval(function () {
                var pRect = eParent.getBoundingClientRect();
                var sRect = element.getBoundingClientRect();
                var elementNotInDom = sRect.top == 0 && sRect.left == 0 && sRect.height == 0 && sRect.width == 0;
                if (elementNotInDom) {
                    params.hidePopup();
                    return;
                }
                var currentDiffTop = pRect.top - sRect.top;
                if (currentDiffTop != lastDiffTop) {
                    var newTop = _this.keepXYWithinBounds(ePopup, top + initialDiffTop - currentDiffTop, DIRECTION.vertical);
                    ePopup.style.top = "".concat(newTop, "px");
                }
                lastDiffTop = currentDiffTop;
                var currentDiffLeft = pRect.left - sRect.left;
                if (currentDiffLeft != lastDiffLeft) {
                    var newLeft = _this.keepXYWithinBounds(ePopup, left + initialDiffLeft - currentDiffLeft, DIRECTION.horizontal);
                    ePopup.style.left = "".concat(newLeft, "px");
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
    PopupService.prototype.hasAnchoredPopup = function () {
        return this.popupList.some(function (popup) { return popup.isAnchored; });
    };
    PopupService.prototype.isEventFromCurrentPopup = function (params, target) {
        var mouseEvent = params.mouseEvent, touchEvent = params.touchEvent;
        var event = mouseEvent ? mouseEvent : touchEvent;
        if (!event) {
            return false;
        }
        var indexOfThisChild = this.getPopupIndex(target);
        if (indexOfThisChild === -1) {
            return false;
        }
        for (var i = indexOfThisChild; i < this.popupList.length; i++) {
            var popup = this.popupList[i];
            if ((0, event_1.isElementInEventPath)(popup.element, event)) {
                return true;
            }
        }
        // if the user did not write their own Custom Element to be rendered as popup
        // and this component has an additional popup element, they should have the
        // `ag-custom-component-popup` class to be detected as part of the Custom Component
        return this.isElementWithinCustomPopup(event.target);
    };
    PopupService.prototype.isElementWithinCustomPopup = function (el) {
        var eDocument = this.gridOptionsService.getDocument();
        while (el && el !== eDocument.body) {
            if (el.classList.contains('ag-custom-component-popup') || el.parentElement === null) {
                return true;
            }
            el = el.parentElement;
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
                    (0, array_1.last)(alwaysOnTopList).insertAdjacentElement('afterend', eWrapper);
                }
            }
            else if (pos !== popupLen - onTopLength - 1) {
                alwaysOnTopList[0].insertAdjacentElement('beforebegin', eWrapper);
            }
        }
        else if (pos !== popupLen - 1) {
            (0, array_1.last)(popupList).insertAdjacentElement('afterend', eWrapper);
        }
        while (innerElsScrollMap.length) {
            var currentEl = innerElsScrollMap.pop();
            currentEl[0].scrollTop = currentEl[1];
        }
        var params = {
            type: 'popupToFront',
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi,
            eWrapper: eWrapper
        };
        this.eventService.dispatchEvent(params);
    };
    var PopupService_1;
    PopupService.WAIT_FOR_POPUP_CONTENT_RESIZE = 200;
    __decorate([
        (0, context_1.Autowired)('focusService')
    ], PopupService.prototype, "focusService", void 0);
    __decorate([
        (0, context_1.Autowired)('ctrlsService')
    ], PopupService.prototype, "ctrlsService", void 0);
    __decorate([
        (0, context_1.Autowired)('resizeObserverService')
    ], PopupService.prototype, "resizeObserverService", void 0);
    __decorate([
        context_1.PostConstruct
    ], PopupService.prototype, "postConstruct", null);
    PopupService = PopupService_1 = __decorate([
        (0, context_1.Bean)('popupService')
    ], PopupService);
    return PopupService;
}(beanStub_1.BeanStub));
exports.PopupService = PopupService;
