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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomTooltipFeature = void 0;
var context_1 = require("../context/context");
var beanStub_1 = require("../context/beanStub");
var generic_1 = require("../utils/generic");
var browser_1 = require("../utils/browser");
var function_1 = require("../utils/function");
var eventKeys_1 = require("../eventKeys");
var TooltipStates;
(function (TooltipStates) {
    TooltipStates[TooltipStates["NOTHING"] = 0] = "NOTHING";
    TooltipStates[TooltipStates["WAITING_TO_SHOW"] = 1] = "WAITING_TO_SHOW";
    TooltipStates[TooltipStates["SHOWING"] = 2] = "SHOWING";
})(TooltipStates || (TooltipStates = {}));
var TooltipTrigger;
(function (TooltipTrigger) {
    TooltipTrigger[TooltipTrigger["HOVER"] = 0] = "HOVER";
    TooltipTrigger[TooltipTrigger["FOCUS"] = 1] = "FOCUS";
})(TooltipTrigger || (TooltipTrigger = {}));
var CustomTooltipFeature = /** @class */ (function (_super) {
    __extends(CustomTooltipFeature, _super);
    function CustomTooltipFeature(parentComp, tooltipShowDelayOverride, tooltipHideDelayOverride) {
        var _this = _super.call(this) || this;
        _this.parentComp = parentComp;
        _this.tooltipShowDelayOverride = tooltipShowDelayOverride;
        _this.tooltipHideDelayOverride = tooltipHideDelayOverride;
        _this.SHOW_QUICK_TOOLTIP_DIFF = 1000;
        _this.FADE_OUT_TOOLTIP_TIMEOUT = 1000;
        _this.INTERACTIVE_HIDE_DELAY = 100;
        _this.interactionEnabled = false;
        _this.isInteractingWithTooltip = false;
        _this.state = TooltipStates.NOTHING;
        // when showing the tooltip, we need to make sure it's the most recent instance we request, as due to
        // async we could request two tooltips before the first instance returns, in which case we should
        // disregard the second instance.
        _this.tooltipInstanceCount = 0;
        _this.tooltipMouseTrack = false;
        return _this;
    }
    CustomTooltipFeature.prototype.postConstruct = function () {
        if (this.gridOptionsService.get('tooltipInteraction')) {
            this.interactionEnabled = true;
        }
        this.tooltipTrigger = this.getTooltipTrigger();
        this.tooltipMouseTrack = this.gridOptionsService.get('tooltipMouseTrack');
        var el = this.parentComp.getGui();
        if (this.tooltipTrigger === TooltipTrigger.HOVER) {
            this.addManagedListener(el, 'mouseenter', this.onMouseEnter.bind(this));
            this.addManagedListener(el, 'mouseleave', this.onMouseLeave.bind(this));
        }
        if (this.tooltipTrigger === TooltipTrigger.FOCUS) {
            this.addManagedListener(el, 'focusin', this.onFocusIn.bind(this));
            this.addManagedListener(el, 'focusout', this.onFocusOut.bind(this));
        }
        this.addManagedListener(el, 'mousemove', this.onMouseMove.bind(this));
        if (!this.interactionEnabled) {
            this.addManagedListener(el, 'mousedown', this.onMouseDown.bind(this));
            this.addManagedListener(el, 'keydown', this.onKeyDown.bind(this));
        }
    };
    CustomTooltipFeature.prototype.getGridOptionsTooltipDelay = function (delayOption) {
        var delay = this.gridOptionsService.get(delayOption);
        if (delay < 0) {
            (0, function_1.warnOnce)("".concat(delayOption, " should not be lower than 0"));
        }
        return Math.max(200, delay);
    };
    CustomTooltipFeature.prototype.getTooltipDelay = function (type) {
        var _a, _b;
        if (type === 'show') {
            return (_a = this.tooltipShowDelayOverride) !== null && _a !== void 0 ? _a : this.getGridOptionsTooltipDelay('tooltipShowDelay');
        }
        else {
            return (_b = this.tooltipHideDelayOverride) !== null && _b !== void 0 ? _b : this.getGridOptionsTooltipDelay('tooltipHideDelay');
        }
    };
    CustomTooltipFeature.prototype.destroy = function () {
        // if this component gets destroyed while tooltip is showing, need to make sure
        // we don't end with no mouseLeave event resulting in zombie tooltip
        this.setToDoNothing();
        _super.prototype.destroy.call(this);
    };
    CustomTooltipFeature.prototype.getTooltipTrigger = function () {
        var trigger = this.gridOptionsService.get('tooltipTrigger');
        if (!trigger || trigger === 'hover') {
            return TooltipTrigger.HOVER;
        }
        return TooltipTrigger.FOCUS;
    };
    CustomTooltipFeature.prototype.onMouseEnter = function (e) {
        var _this = this;
        // if `interactiveTooltipTimeoutId` is set, it means that this cell has a tooltip
        // and we are in the process of moving the cursor from the tooltip back to the cell
        // so we need to unlock this service here.
        if (this.interactionEnabled && this.interactiveTooltipTimeoutId) {
            this.unlockService();
            this.startHideTimeout();
        }
        if ((0, browser_1.isIOSUserAgent)()) {
            return;
        }
        if (CustomTooltipFeature.isLocked) {
            this.showTooltipTimeoutId = window.setTimeout(function () {
                _this.prepareToShowTooltip(e);
            }, this.INTERACTIVE_HIDE_DELAY);
        }
        else {
            this.prepareToShowTooltip(e);
        }
    };
    CustomTooltipFeature.prototype.onMouseMove = function (e) {
        // there is a delay from the time we mouseOver a component and the time the
        // tooltip is displayed, so we need to track mousemove to be able to correctly
        // position the tooltip when showTooltip is called.
        if (this.lastMouseEvent) {
            this.lastMouseEvent = e;
        }
        if (this.tooltipMouseTrack &&
            this.state === TooltipStates.SHOWING &&
            this.tooltipComp) {
            this.positionTooltip();
        }
    };
    CustomTooltipFeature.prototype.onMouseDown = function () {
        this.setToDoNothing();
    };
    CustomTooltipFeature.prototype.onMouseLeave = function () {
        // if interaction is enabled, we need to verify if the user is moving
        // the cursor from the cell onto the tooltip, so we lock the service 
        // for 100ms to prevent other tooltips from being created while this is happening.
        if (this.interactionEnabled) {
            this.lockService();
        }
        else {
            this.setToDoNothing();
        }
    };
    CustomTooltipFeature.prototype.onFocusIn = function () {
        this.prepareToShowTooltip();
    };
    CustomTooltipFeature.prototype.onFocusOut = function (e) {
        var _a;
        var relatedTarget = e.relatedTarget;
        var parentCompGui = this.parentComp.getGui();
        var tooltipGui = (_a = this.tooltipComp) === null || _a === void 0 ? void 0 : _a.getGui();
        if (this.isInteractingWithTooltip ||
            parentCompGui.contains(relatedTarget) ||
            (this.interactionEnabled && (tooltipGui === null || tooltipGui === void 0 ? void 0 : tooltipGui.contains(relatedTarget)))) {
            return;
        }
        this.setToDoNothing();
    };
    CustomTooltipFeature.prototype.onKeyDown = function () {
        this.setToDoNothing();
    };
    CustomTooltipFeature.prototype.prepareToShowTooltip = function (mouseEvent) {
        // every mouseenter should be following by a mouseleave, however for some unknown, it's possible for
        // mouseenter to be called twice in a row, which can happen if editing the cell. this was reported
        // in https://ag-grid.atlassian.net/browse/AG-4422. to get around this, we check the state, and if
        // state is != nothing, then we know mouseenter was already received.
        if (this.state != TooltipStates.NOTHING || CustomTooltipFeature.isLocked) {
            return false;
        }
        // if we are showing the tooltip because of focus, no delay at all
        // if another tooltip was hidden very recently, we only wait 200ms to show, not the normal waiting time
        var delay = 0;
        if (mouseEvent) {
            delay = this.isLastTooltipHiddenRecently() ? 200 : this.getTooltipDelay('show');
        }
        this.lastMouseEvent = mouseEvent || null;
        this.showTooltipTimeoutId = window.setTimeout(this.showTooltip.bind(this), delay);
        this.state = TooltipStates.WAITING_TO_SHOW;
        return true;
    };
    CustomTooltipFeature.prototype.isLastTooltipHiddenRecently = function () {
        // return true if <1000ms since last time we hid a tooltip
        var now = new Date().getTime();
        var then = CustomTooltipFeature.lastTooltipHideTime;
        return (now - then) < this.SHOW_QUICK_TOOLTIP_DIFF;
    };
    CustomTooltipFeature.prototype.setToDoNothing = function () {
        if (this.state === TooltipStates.SHOWING) {
            this.hideTooltip();
        }
        if (this.onBodyScrollEventCallback) {
            this.onBodyScrollEventCallback();
            this.onBodyScrollEventCallback = undefined;
        }
        if (this.onColumnMovedEventCallback) {
            this.onColumnMovedEventCallback();
            this.onColumnMovedEventCallback = undefined;
        }
        this.clearTimeouts();
        this.state = TooltipStates.NOTHING;
        this.lastMouseEvent = null;
    };
    CustomTooltipFeature.prototype.showTooltip = function () {
        var params = __assign({}, this.parentComp.getTooltipParams());
        if (!(0, generic_1.exists)(params.value)) {
            this.setToDoNothing();
            return;
        }
        this.state = TooltipStates.SHOWING;
        this.tooltipInstanceCount++;
        // we pass in tooltipInstanceCount so the callback knows what the count was when
        // we requested the tooltip, so if another tooltip was requested in the mean time
        // we disregard it
        var callback = this.newTooltipComponentCallback.bind(this, this.tooltipInstanceCount);
        var userDetails = this.userComponentFactory.getTooltipCompDetails(params);
        userDetails.newAgStackInstance().then(callback);
    };
    CustomTooltipFeature.prototype.hideTooltip = function (forceHide) {
        if (!forceHide && this.isInteractingWithTooltip) {
            return;
        }
        // check if comp exists - due to async, although we asked for
        // one, the instance may not be back yet
        if (this.tooltipComp) {
            this.destroyTooltipComp();
            CustomTooltipFeature.lastTooltipHideTime = new Date().getTime();
        }
        var event = {
            type: eventKeys_1.Events.EVENT_TOOLTIP_HIDE,
            parentGui: this.parentComp.getGui()
        };
        this.eventService.dispatchEvent(event);
        this.state = TooltipStates.NOTHING;
    };
    CustomTooltipFeature.prototype.newTooltipComponentCallback = function (tooltipInstanceCopy, tooltipComp) {
        var compNoLongerNeeded = this.state !== TooltipStates.SHOWING || this.tooltipInstanceCount !== tooltipInstanceCopy;
        if (compNoLongerNeeded) {
            this.getContext().destroyBean(tooltipComp);
            return;
        }
        var eGui = tooltipComp.getGui();
        this.tooltipComp = tooltipComp;
        if (!eGui.classList.contains('ag-tooltip')) {
            eGui.classList.add('ag-tooltip-custom');
        }
        if (this.tooltipTrigger === TooltipTrigger.HOVER) {
            eGui.classList.add('ag-tooltip-animate');
        }
        if (this.interactionEnabled) {
            eGui.classList.add('ag-tooltip-interactive');
        }
        var translate = this.localeService.getLocaleTextFunc();
        var addPopupRes = this.popupService.addPopup({
            eChild: eGui,
            ariaLabel: translate('ariaLabelTooltip', 'Tooltip')
        });
        if (addPopupRes) {
            this.tooltipPopupDestroyFunc = addPopupRes.hideFunc;
        }
        this.positionTooltip();
        if (this.tooltipTrigger === TooltipTrigger.FOCUS) {
            this.onBodyScrollEventCallback = this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_BODY_SCROLL, this.setToDoNothing.bind(this));
            this.onColumnMovedEventCallback = this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_MOVED, this.setToDoNothing.bind(this));
        }
        if (this.interactionEnabled) {
            if (this.tooltipTrigger === TooltipTrigger.HOVER) {
                this.tooltipMouseEnterListener = this.addManagedListener(eGui, 'mouseenter', this.onTooltipMouseEnter.bind(this)) || null;
                this.tooltipMouseLeaveListener = this.addManagedListener(eGui, 'mouseleave', this.onTooltipMouseLeave.bind(this)) || null;
            }
            else {
                this.tooltipFocusInListener = this.addManagedListener(eGui, 'focusin', this.onTooltipFocusIn.bind(this)) || null;
                this.tooltipFocusOutListener = this.addManagedListener(eGui, 'focusout', this.onTooltipFocusOut.bind(this)) || null;
            }
        }
        var event = {
            type: eventKeys_1.Events.EVENT_TOOLTIP_SHOW,
            tooltipGui: eGui,
            parentGui: this.parentComp.getGui()
        };
        this.eventService.dispatchEvent(event);
        this.startHideTimeout();
    };
    CustomTooltipFeature.prototype.onTooltipMouseEnter = function () {
        this.isInteractingWithTooltip = true;
        this.unlockService();
    };
    CustomTooltipFeature.prototype.onTooltipMouseLeave = function () {
        this.isInteractingWithTooltip = false;
        this.lockService();
    };
    CustomTooltipFeature.prototype.onTooltipFocusIn = function () {
        this.isInteractingWithTooltip = true;
    };
    CustomTooltipFeature.prototype.onTooltipFocusOut = function (e) {
        var _a;
        var parentGui = this.parentComp.getGui();
        var tooltipGui = (_a = this.tooltipComp) === null || _a === void 0 ? void 0 : _a.getGui();
        var relatedTarget = e.relatedTarget;
        // focusout is dispatched when inner elements lose focus
        // so we need to verify if focus is contained within the tooltip
        if (tooltipGui === null || tooltipGui === void 0 ? void 0 : tooltipGui.contains(relatedTarget)) {
            return;
        }
        this.isInteractingWithTooltip = false;
        // if we move the focus from the tooltip back to the original cell
        // the tooltip should remain open, but we need to restart the hide timeout counter
        if (parentGui.contains(relatedTarget)) {
            this.startHideTimeout();
        }
        // if the parent cell doesn't contain the focus, simply hide the tooltip
        else {
            this.hideTooltip();
        }
    };
    CustomTooltipFeature.prototype.positionTooltip = function () {
        var params = {
            type: 'tooltip',
            ePopup: this.tooltipComp.getGui(),
            nudgeY: 18,
            skipObserver: this.tooltipMouseTrack
        };
        if (this.lastMouseEvent) {
            this.popupService.positionPopupUnderMouseEvent(__assign(__assign({}, params), { mouseEvent: this.lastMouseEvent }));
        }
        else {
            this.popupService.positionPopupByComponent(__assign(__assign({}, params), { eventSource: this.parentComp.getGui(), position: 'under', keepWithinBounds: true, nudgeY: 5 }));
        }
    };
    CustomTooltipFeature.prototype.destroyTooltipComp = function () {
        var _this = this;
        // add class to fade out the tooltip
        this.tooltipComp.getGui().classList.add('ag-tooltip-hiding');
        // make local copies of these variables, as we use them in the async function below,
        // and we clear then to 'undefined' later, so need to take a copy before they are undefined.
        var tooltipPopupDestroyFunc = this.tooltipPopupDestroyFunc;
        var tooltipComp = this.tooltipComp;
        var delay = this.tooltipTrigger === TooltipTrigger.HOVER ? this.FADE_OUT_TOOLTIP_TIMEOUT : 0;
        window.setTimeout(function () {
            tooltipPopupDestroyFunc();
            _this.getContext().destroyBean(tooltipComp);
        }, delay);
        this.clearTooltipListeners();
        this.tooltipPopupDestroyFunc = undefined;
        this.tooltipComp = undefined;
    };
    CustomTooltipFeature.prototype.clearTooltipListeners = function () {
        [
            this.tooltipMouseEnterListener, this.tooltipMouseLeaveListener,
            this.tooltipFocusInListener, this.tooltipFocusOutListener
        ].forEach(function (listener) {
            if (listener) {
                listener();
            }
        });
        this.tooltipMouseEnterListener = this.tooltipMouseLeaveListener =
            this.tooltipFocusInListener = this.tooltipFocusOutListener = null;
    };
    CustomTooltipFeature.prototype.lockService = function () {
        var _this = this;
        CustomTooltipFeature.isLocked = true;
        this.interactiveTooltipTimeoutId = window.setTimeout(function () {
            _this.unlockService();
            _this.setToDoNothing();
        }, this.INTERACTIVE_HIDE_DELAY);
    };
    CustomTooltipFeature.prototype.unlockService = function () {
        CustomTooltipFeature.isLocked = false;
        this.clearInteractiveTimeout();
    };
    CustomTooltipFeature.prototype.startHideTimeout = function () {
        this.clearHideTimeout();
        this.hideTooltipTimeoutId = window.setTimeout(this.hideTooltip.bind(this), this.getTooltipDelay('hide'));
    };
    CustomTooltipFeature.prototype.clearShowTimeout = function () {
        if (!this.showTooltipTimeoutId) {
            return;
        }
        window.clearTimeout(this.showTooltipTimeoutId);
        this.showTooltipTimeoutId = undefined;
    };
    CustomTooltipFeature.prototype.clearHideTimeout = function () {
        if (!this.hideTooltipTimeoutId) {
            return;
        }
        window.clearTimeout(this.hideTooltipTimeoutId);
        this.hideTooltipTimeoutId = undefined;
    };
    CustomTooltipFeature.prototype.clearInteractiveTimeout = function () {
        if (!this.interactiveTooltipTimeoutId) {
            return;
        }
        window.clearTimeout(this.interactiveTooltipTimeoutId);
        this.interactiveTooltipTimeoutId = undefined;
    };
    CustomTooltipFeature.prototype.clearTimeouts = function () {
        this.clearShowTimeout();
        this.clearHideTimeout();
        this.clearInteractiveTimeout();
    };
    CustomTooltipFeature.isLocked = false;
    __decorate([
        (0, context_1.Autowired)('popupService')
    ], CustomTooltipFeature.prototype, "popupService", void 0);
    __decorate([
        (0, context_1.Autowired)('userComponentFactory')
    ], CustomTooltipFeature.prototype, "userComponentFactory", void 0);
    __decorate([
        context_1.PostConstruct
    ], CustomTooltipFeature.prototype, "postConstruct", null);
    return CustomTooltipFeature;
}(beanStub_1.BeanStub));
exports.CustomTooltipFeature = CustomTooltipFeature;
