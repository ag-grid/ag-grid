var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, PostConstruct } from "../context/context.mjs";
import { BeanStub } from "../context/beanStub.mjs";
import { exists } from "../utils/generic.mjs";
import { isIOSUserAgent } from "../utils/browser.mjs";
import { warnOnce } from "../utils/function.mjs";
import { Events } from "../eventKeys.mjs";
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
export class CustomTooltipFeature extends BeanStub {
    constructor(parentComp, tooltipShowDelayOverride, tooltipHideDelayOverride) {
        super();
        this.parentComp = parentComp;
        this.tooltipShowDelayOverride = tooltipShowDelayOverride;
        this.tooltipHideDelayOverride = tooltipHideDelayOverride;
        this.SHOW_QUICK_TOOLTIP_DIFF = 1000;
        this.FADE_OUT_TOOLTIP_TIMEOUT = 1000;
        this.INTERACTIVE_HIDE_DELAY = 100;
        this.interactionEnabled = false;
        this.isInteractingWithTooltip = false;
        this.state = TooltipStates.NOTHING;
        // when showing the tooltip, we need to make sure it's the most recent instance we request, as due to
        // async we could request two tooltips before the first instance returns, in which case we should
        // disregard the second instance.
        this.tooltipInstanceCount = 0;
        this.tooltipMouseTrack = false;
    }
    postConstruct() {
        if (this.gridOptionsService.get('tooltipInteraction')) {
            this.interactionEnabled = true;
        }
        this.tooltipTrigger = this.getTooltipTrigger();
        this.tooltipMouseTrack = this.gridOptionsService.get('tooltipMouseTrack');
        const el = this.parentComp.getGui();
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
    }
    getGridOptionsTooltipDelay(delayOption) {
        const delay = this.gridOptionsService.get(delayOption);
        if (delay < 0) {
            warnOnce(`${delayOption} should not be lower than 0`);
        }
        return Math.max(200, delay);
    }
    getTooltipDelay(type) {
        var _a, _b;
        if (type === 'show') {
            return (_a = this.tooltipShowDelayOverride) !== null && _a !== void 0 ? _a : this.getGridOptionsTooltipDelay('tooltipShowDelay');
        }
        else {
            return (_b = this.tooltipHideDelayOverride) !== null && _b !== void 0 ? _b : this.getGridOptionsTooltipDelay('tooltipHideDelay');
        }
    }
    destroy() {
        // if this component gets destroyed while tooltip is showing, need to make sure
        // we don't end with no mouseLeave event resulting in zombie tooltip
        this.setToDoNothing();
        super.destroy();
    }
    getTooltipTrigger() {
        const trigger = this.gridOptionsService.get('tooltipTrigger');
        if (!trigger || trigger === 'hover') {
            return TooltipTrigger.HOVER;
        }
        return TooltipTrigger.FOCUS;
    }
    onMouseEnter(e) {
        // if `interactiveTooltipTimeoutId` is set, it means that this cell has a tooltip
        // and we are in the process of moving the cursor from the tooltip back to the cell
        // so we need to unlock this service here.
        if (this.interactionEnabled && this.interactiveTooltipTimeoutId) {
            this.unlockService();
            this.startHideTimeout();
        }
        if (isIOSUserAgent()) {
            return;
        }
        if (CustomTooltipFeature.isLocked) {
            this.showTooltipTimeoutId = window.setTimeout(() => {
                this.prepareToShowTooltip(e);
            }, this.INTERACTIVE_HIDE_DELAY);
        }
        else {
            this.prepareToShowTooltip(e);
        }
    }
    onMouseMove(e) {
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
    }
    onMouseDown() {
        this.setToDoNothing();
    }
    onMouseLeave() {
        // if interaction is enabled, we need to verify if the user is moving
        // the cursor from the cell onto the tooltip, so we lock the service 
        // for 100ms to prevent other tooltips from being created while this is happening.
        if (this.interactionEnabled) {
            this.lockService();
        }
        else {
            this.setToDoNothing();
        }
    }
    onFocusIn() {
        this.prepareToShowTooltip();
    }
    onFocusOut(e) {
        var _a;
        const relatedTarget = e.relatedTarget;
        const parentCompGui = this.parentComp.getGui();
        const tooltipGui = (_a = this.tooltipComp) === null || _a === void 0 ? void 0 : _a.getGui();
        if (this.isInteractingWithTooltip ||
            parentCompGui.contains(relatedTarget) ||
            (this.interactionEnabled && (tooltipGui === null || tooltipGui === void 0 ? void 0 : tooltipGui.contains(relatedTarget)))) {
            return;
        }
        this.setToDoNothing();
    }
    onKeyDown() {
        this.setToDoNothing();
    }
    prepareToShowTooltip(mouseEvent) {
        // every mouseenter should be following by a mouseleave, however for some unknown, it's possible for
        // mouseenter to be called twice in a row, which can happen if editing the cell. this was reported
        // in https://ag-grid.atlassian.net/browse/AG-4422. to get around this, we check the state, and if
        // state is != nothing, then we know mouseenter was already received.
        if (this.state != TooltipStates.NOTHING || CustomTooltipFeature.isLocked) {
            return false;
        }
        // if we are showing the tooltip because of focus, no delay at all
        // if another tooltip was hidden very recently, we only wait 200ms to show, not the normal waiting time
        let delay = 0;
        if (mouseEvent) {
            delay = this.isLastTooltipHiddenRecently() ? 200 : this.getTooltipDelay('show');
        }
        this.lastMouseEvent = mouseEvent || null;
        this.showTooltipTimeoutId = window.setTimeout(this.showTooltip.bind(this), delay);
        this.state = TooltipStates.WAITING_TO_SHOW;
        return true;
    }
    isLastTooltipHiddenRecently() {
        // return true if <1000ms since last time we hid a tooltip
        const now = new Date().getTime();
        const then = CustomTooltipFeature.lastTooltipHideTime;
        return (now - then) < this.SHOW_QUICK_TOOLTIP_DIFF;
    }
    setToDoNothing() {
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
    }
    showTooltip() {
        const params = Object.assign({}, this.parentComp.getTooltipParams());
        if (!exists(params.value)) {
            this.setToDoNothing();
            return;
        }
        this.state = TooltipStates.SHOWING;
        this.tooltipInstanceCount++;
        // we pass in tooltipInstanceCount so the callback knows what the count was when
        // we requested the tooltip, so if another tooltip was requested in the mean time
        // we disregard it
        const callback = this.newTooltipComponentCallback.bind(this, this.tooltipInstanceCount);
        const userDetails = this.userComponentFactory.getTooltipCompDetails(params);
        userDetails.newAgStackInstance().then(callback);
    }
    hideTooltip(forceHide) {
        if (!forceHide && this.isInteractingWithTooltip) {
            return;
        }
        // check if comp exists - due to async, although we asked for
        // one, the instance may not be back yet
        if (this.tooltipComp) {
            this.destroyTooltipComp();
            CustomTooltipFeature.lastTooltipHideTime = new Date().getTime();
        }
        const event = {
            type: Events.EVENT_TOOLTIP_HIDE,
            parentGui: this.parentComp.getGui()
        };
        this.eventService.dispatchEvent(event);
        this.state = TooltipStates.NOTHING;
    }
    newTooltipComponentCallback(tooltipInstanceCopy, tooltipComp) {
        const compNoLongerNeeded = this.state !== TooltipStates.SHOWING || this.tooltipInstanceCount !== tooltipInstanceCopy;
        if (compNoLongerNeeded) {
            this.getContext().destroyBean(tooltipComp);
            return;
        }
        const eGui = tooltipComp.getGui();
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
        const translate = this.localeService.getLocaleTextFunc();
        const addPopupRes = this.popupService.addPopup({
            eChild: eGui,
            ariaLabel: translate('ariaLabelTooltip', 'Tooltip')
        });
        if (addPopupRes) {
            this.tooltipPopupDestroyFunc = addPopupRes.hideFunc;
        }
        this.positionTooltip();
        if (this.tooltipTrigger === TooltipTrigger.FOCUS) {
            this.onBodyScrollEventCallback = this.addManagedListener(this.eventService, Events.EVENT_BODY_SCROLL, this.setToDoNothing.bind(this));
            this.onColumnMovedEventCallback = this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.setToDoNothing.bind(this));
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
        const event = {
            type: Events.EVENT_TOOLTIP_SHOW,
            tooltipGui: eGui,
            parentGui: this.parentComp.getGui()
        };
        this.eventService.dispatchEvent(event);
        this.startHideTimeout();
    }
    onTooltipMouseEnter() {
        this.isInteractingWithTooltip = true;
        this.unlockService();
    }
    onTooltipMouseLeave() {
        this.isInteractingWithTooltip = false;
        this.lockService();
    }
    onTooltipFocusIn() {
        this.isInteractingWithTooltip = true;
    }
    onTooltipFocusOut(e) {
        var _a;
        const parentGui = this.parentComp.getGui();
        const tooltipGui = (_a = this.tooltipComp) === null || _a === void 0 ? void 0 : _a.getGui();
        const relatedTarget = e.relatedTarget;
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
    }
    positionTooltip() {
        const params = {
            type: 'tooltip',
            ePopup: this.tooltipComp.getGui(),
            nudgeY: 18,
            skipObserver: this.tooltipMouseTrack
        };
        if (this.lastMouseEvent) {
            this.popupService.positionPopupUnderMouseEvent(Object.assign(Object.assign({}, params), { mouseEvent: this.lastMouseEvent }));
        }
        else {
            this.popupService.positionPopupByComponent(Object.assign(Object.assign({}, params), { eventSource: this.parentComp.getGui(), position: 'under', keepWithinBounds: true, nudgeY: 5 }));
        }
    }
    destroyTooltipComp() {
        // add class to fade out the tooltip
        this.tooltipComp.getGui().classList.add('ag-tooltip-hiding');
        // make local copies of these variables, as we use them in the async function below,
        // and we clear then to 'undefined' later, so need to take a copy before they are undefined.
        const tooltipPopupDestroyFunc = this.tooltipPopupDestroyFunc;
        const tooltipComp = this.tooltipComp;
        const delay = this.tooltipTrigger === TooltipTrigger.HOVER ? this.FADE_OUT_TOOLTIP_TIMEOUT : 0;
        window.setTimeout(() => {
            tooltipPopupDestroyFunc();
            this.getContext().destroyBean(tooltipComp);
        }, delay);
        this.clearTooltipListeners();
        this.tooltipPopupDestroyFunc = undefined;
        this.tooltipComp = undefined;
    }
    clearTooltipListeners() {
        [
            this.tooltipMouseEnterListener, this.tooltipMouseLeaveListener,
            this.tooltipFocusInListener, this.tooltipFocusOutListener
        ].forEach(listener => {
            if (listener) {
                listener();
            }
        });
        this.tooltipMouseEnterListener = this.tooltipMouseLeaveListener =
            this.tooltipFocusInListener = this.tooltipFocusOutListener = null;
    }
    lockService() {
        CustomTooltipFeature.isLocked = true;
        this.interactiveTooltipTimeoutId = window.setTimeout(() => {
            this.unlockService();
            this.setToDoNothing();
        }, this.INTERACTIVE_HIDE_DELAY);
    }
    unlockService() {
        CustomTooltipFeature.isLocked = false;
        this.clearInteractiveTimeout();
    }
    startHideTimeout() {
        this.clearHideTimeout();
        this.hideTooltipTimeoutId = window.setTimeout(this.hideTooltip.bind(this), this.getTooltipDelay('hide'));
    }
    clearShowTimeout() {
        if (!this.showTooltipTimeoutId) {
            return;
        }
        window.clearTimeout(this.showTooltipTimeoutId);
        this.showTooltipTimeoutId = undefined;
    }
    clearHideTimeout() {
        if (!this.hideTooltipTimeoutId) {
            return;
        }
        window.clearTimeout(this.hideTooltipTimeoutId);
        this.hideTooltipTimeoutId = undefined;
    }
    clearInteractiveTimeout() {
        if (!this.interactiveTooltipTimeoutId) {
            return;
        }
        window.clearTimeout(this.interactiveTooltipTimeoutId);
        this.interactiveTooltipTimeoutId = undefined;
    }
    clearTimeouts() {
        this.clearShowTimeout();
        this.clearHideTimeout();
        this.clearInteractiveTimeout();
    }
}
CustomTooltipFeature.isLocked = false;
__decorate([
    Autowired('popupService')
], CustomTooltipFeature.prototype, "popupService", void 0);
__decorate([
    Autowired('userComponentFactory')
], CustomTooltipFeature.prototype, "userComponentFactory", void 0);
__decorate([
    PostConstruct
], CustomTooltipFeature.prototype, "postConstruct", null);
