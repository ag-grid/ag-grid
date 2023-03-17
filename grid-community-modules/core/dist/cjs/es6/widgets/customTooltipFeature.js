/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomTooltipFeature = void 0;
const context_1 = require("../context/context");
const beanStub_1 = require("../context/beanStub");
const generic_1 = require("../utils/generic");
const browser_1 = require("../utils/browser");
const string_1 = require("../utils/string");
const function_1 = require("../utils/function");
var TooltipStates;
(function (TooltipStates) {
    TooltipStates[TooltipStates["NOTHING"] = 0] = "NOTHING";
    TooltipStates[TooltipStates["WAITING_TO_SHOW"] = 1] = "WAITING_TO_SHOW";
    TooltipStates[TooltipStates["SHOWING"] = 2] = "SHOWING";
})(TooltipStates || (TooltipStates = {}));
class CustomTooltipFeature extends beanStub_1.BeanStub {
    constructor(parentComp) {
        super();
        this.DEFAULT_SHOW_TOOLTIP_DELAY = 2000;
        this.DEFAULT_HIDE_TOOLTIP_DELAY = 10000;
        this.SHOW_QUICK_TOOLTIP_DIFF = 1000;
        this.FADE_OUT_TOOLTIP_TIMEOUT = 1000;
        this.state = TooltipStates.NOTHING;
        // when showing the tooltip, we need to make sure it's the most recent instance we request, as due to
        // async we could request two tooltips before the first instance returns, in which case we should
        // disregard the second instance.
        this.tooltipInstanceCount = 0;
        this.tooltipMouseTrack = false;
        this.parentComp = parentComp;
    }
    postConstruct() {
        this.tooltipShowDelay = this.getTooltipDelay('show') || this.DEFAULT_SHOW_TOOLTIP_DELAY;
        this.tooltipHideDelay = this.getTooltipDelay('hide') || this.DEFAULT_HIDE_TOOLTIP_DELAY;
        this.tooltipMouseTrack = this.gridOptionsService.is('tooltipMouseTrack');
        const el = this.parentComp.getGui();
        this.addManagedListener(el, 'mouseenter', this.onMouseEnter.bind(this));
        this.addManagedListener(el, 'mouseleave', this.onMouseLeave.bind(this));
        this.addManagedListener(el, 'mousemove', this.onMouseMove.bind(this));
        this.addManagedListener(el, 'mousedown', this.onMouseDown.bind(this));
        this.addManagedListener(el, 'keydown', this.onKeyDown.bind(this));
    }
    destroy() {
        // if this component gets destroyed while tooltip is showing, need to make sure
        // we don't end with no mouseLeave event resulting in zombie tooltip
        this.setToDoNothing();
        super.destroy();
    }
    onMouseEnter(e) {
        if (browser_1.isIOSUserAgent()) {
            return;
        }
        // every mouseenter should be following by a mouseleave, however for some unkonwn, it's possible for
        // mouseenter to be called twice in a row, which can happen if editing the cell. this was reported
        // in https://ag-grid.atlassian.net/browse/AG-4422. to get around this, we check the state, and if
        // state is !=nothing, then we know mouseenter was already received.
        if (this.state != TooltipStates.NOTHING) {
            return;
        }
        // if another tooltip was hidden very recently, we only wait 200ms to show, not the normal waiting time
        const delay = this.isLastTooltipHiddenRecently() ? 200 : this.tooltipShowDelay;
        this.showTooltipTimeoutId = window.setTimeout(this.showTooltip.bind(this), delay);
        this.lastMouseEvent = e;
        this.state = TooltipStates.WAITING_TO_SHOW;
    }
    onMouseLeave() {
        this.setToDoNothing();
    }
    onKeyDown() {
        this.setToDoNothing();
    }
    setToDoNothing() {
        if (this.state === TooltipStates.SHOWING) {
            this.hideTooltip();
        }
        this.clearTimeouts();
        this.state = TooltipStates.NOTHING;
    }
    onMouseMove(e) {
        // there is a delay from the time we mouseOver a component and the time the
        // tooltip is displayed, so we need to track mousemove to be able to correctly
        // position the tooltip when showTooltip is called.
        this.lastMouseEvent = e;
        if (this.tooltipMouseTrack &&
            this.state === TooltipStates.SHOWING &&
            this.tooltipComp) {
            this.positionTooltipUnderLastMouseEvent();
        }
    }
    onMouseDown() {
        this.setToDoNothing();
    }
    getTooltipDelay(type) {
        const tooltipShowDelay = this.gridOptionsService.getNum('tooltipShowDelay');
        const tooltipHideDelay = this.gridOptionsService.getNum('tooltipHideDelay');
        const delay = type === 'show' ? tooltipShowDelay : tooltipHideDelay;
        const capitalisedType = string_1.capitalise(type);
        if (generic_1.exists(delay)) {
            if (delay < 0) {
                function_1.doOnce(() => console.warn(`AG Grid: tooltip${capitalisedType}Delay should not be lower than 0`), `tooltip${capitalisedType}DelayWarn`);
            }
            return Math.max(200, delay);
        }
        return null;
    }
    hideTooltip() {
        // check if comp exists - due to async, although we asked for
        // one, the instance may not be back yet
        if (this.tooltipComp) {
            this.destroyTooltipComp();
            CustomTooltipFeature.lastTooltipHideTime = new Date().getTime();
        }
        this.state = TooltipStates.NOTHING;
    }
    destroyTooltipComp() {
        // add class to fade out the tooltip
        this.tooltipComp.getGui().classList.add('ag-tooltip-hiding');
        // make local copies of these variables, as we use them in the async function below,
        // and we clear then to 'undefined' later, so need to take a copy before they are undefined.
        const tooltipPopupDestroyFunc = this.tooltipPopupDestroyFunc;
        const tooltipComp = this.tooltipComp;
        window.setTimeout(() => {
            tooltipPopupDestroyFunc();
            this.getContext().destroyBean(tooltipComp);
        }, this.FADE_OUT_TOOLTIP_TIMEOUT);
        this.tooltipPopupDestroyFunc = undefined;
        this.tooltipComp = undefined;
    }
    isLastTooltipHiddenRecently() {
        // return true if <1000ms since last time we hid a tooltip
        const now = new Date().getTime();
        const then = CustomTooltipFeature.lastTooltipHideTime;
        return (now - then) < this.SHOW_QUICK_TOOLTIP_DIFF;
    }
    showTooltip() {
        const params = Object.assign({}, this.parentComp.getTooltipParams());
        if (!generic_1.exists(params.value)) {
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
        const translate = this.localeService.getLocaleTextFunc();
        const addPopupRes = this.popupService.addPopup({
            eChild: eGui,
            ariaLabel: translate('ariaLabelTooltip', 'Tooltip')
        });
        if (addPopupRes) {
            this.tooltipPopupDestroyFunc = addPopupRes.hideFunc;
        }
        // this.tooltipPopupDestroyFunc = this.popupService.addPopup(false, eGui, false);
        this.positionTooltipUnderLastMouseEvent();
        this.hideTooltipTimeoutId = window.setTimeout(this.hideTooltip.bind(this), this.tooltipHideDelay);
    }
    positionTooltipUnderLastMouseEvent() {
        this.popupService.positionPopupUnderMouseEvent({
            type: 'tooltip',
            mouseEvent: this.lastMouseEvent,
            ePopup: this.tooltipComp.getGui(),
            nudgeY: 18,
            skipObserver: this.tooltipMouseTrack
        });
    }
    clearTimeouts() {
        if (this.showTooltipTimeoutId) {
            window.clearTimeout(this.showTooltipTimeoutId);
            this.showTooltipTimeoutId = undefined;
        }
        if (this.hideTooltipTimeoutId) {
            window.clearTimeout(this.hideTooltipTimeoutId);
            this.hideTooltipTimeoutId = undefined;
        }
    }
}
__decorate([
    context_1.Autowired('popupService')
], CustomTooltipFeature.prototype, "popupService", void 0);
__decorate([
    context_1.Autowired('userComponentFactory')
], CustomTooltipFeature.prototype, "userComponentFactory", void 0);
__decorate([
    context_1.Autowired('columnApi')
], CustomTooltipFeature.prototype, "columnApi", void 0);
__decorate([
    context_1.Autowired('gridApi')
], CustomTooltipFeature.prototype, "gridApi", void 0);
__decorate([
    context_1.PostConstruct
], CustomTooltipFeature.prototype, "postConstruct", null);
exports.CustomTooltipFeature = CustomTooltipFeature;
