/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
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
var context_1 = require("../context/context");
var beanStub_1 = require("../context/beanStub");
var dom_1 = require("../utils/dom");
var generic_1 = require("../utils/generic");
var TooltipStates;
(function (TooltipStates) {
    TooltipStates[TooltipStates["NOTHING"] = 0] = "NOTHING";
    TooltipStates[TooltipStates["WAITING_TO_SHOW"] = 1] = "WAITING_TO_SHOW";
    TooltipStates[TooltipStates["SHOWING"] = 2] = "SHOWING";
})(TooltipStates || (TooltipStates = {}));
var TooltipFeature = /** @class */ (function (_super) {
    __extends(TooltipFeature, _super);
    function TooltipFeature(parentComp) {
        var _this = _super.call(this) || this;
        _this.DEFAULT_HIDE_TOOLTIP_TIMEOUT = 10000;
        _this.SHOW_QUICK_TOOLTIP_DIFF = 1000;
        _this.FADE_OUT_TOOLTIP_TIMEOUT = 1000;
        _this.state = TooltipStates.NOTHING;
        // when showing the tooltip, we need to make sure it's the most recent instance we request, as due to
        // async we could request two tooltips before the first instance returns, in which case we should
        // disregard the second instance.
        _this.tooltipInstanceCount = 0;
        _this.tooltipMouseTrack = false;
        _this.parentComp = parentComp;
        return _this;
    }
    TooltipFeature.prototype.postConstruct = function () {
        this.tooltipShowDelay = this.gridOptionsWrapper.getTooltipShowDelay() || 2000;
        this.tooltipMouseTrack = this.gridOptionsWrapper.isTooltipMouseTrack();
        var el = this.parentComp.getGui();
        this.addManagedListener(el, 'mouseenter', this.onMouseEnter.bind(this));
        this.addManagedListener(el, 'mouseleave', this.onMouseLeave.bind(this));
        this.addManagedListener(el, 'mousemove', this.onMouseMove.bind(this));
        this.addManagedListener(el, 'mousedown', this.onMouseDown.bind(this));
        this.addManagedListener(el, 'keydown', this.onKeyDown.bind(this));
    };
    TooltipFeature.prototype.destroy = function () {
        // if this component gets destroyed while tooltip is showing, need to make sure
        // we don't end with no mouseLeave event resulting in zombie tooltip
        this.setToDoNothing();
        _super.prototype.destroy.call(this);
    };
    TooltipFeature.prototype.onMouseEnter = function (e) {
        // every mouseenter should be following by a mouseleave, however for some unkonwn, it's possible for
        // mouseenter to be called twice in a row, which can happen if editing the cell. this was reported
        // in https://ag-grid.atlassian.net/browse/AG-4422. to get around this, we check the state, and if
        // state is !=nothing, then we know mouseenter was already received.
        if (this.state != TooltipStates.NOTHING) {
            return;
        }
        // if another tooltip was hidden very recently, we only wait 200ms to show, not the normal waiting time
        var delay = this.isLastTooltipHiddenRecently() ? 200 : this.tooltipShowDelay;
        this.showTooltipTimeoutId = window.setTimeout(this.showTooltip.bind(this), delay);
        this.lastMouseEvent = e;
        this.state = TooltipStates.WAITING_TO_SHOW;
    };
    TooltipFeature.prototype.onMouseLeave = function () {
        this.setToDoNothing();
    };
    TooltipFeature.prototype.onKeyDown = function () {
        this.setToDoNothing();
    };
    TooltipFeature.prototype.setToDoNothing = function () {
        if (this.state === TooltipStates.SHOWING) {
            this.hideTooltip();
        }
        this.clearTimeouts();
        this.state = TooltipStates.NOTHING;
    };
    TooltipFeature.prototype.onMouseMove = function (e) {
        // there is a delay from the time we mouseOver a component and the time the
        // tooltip is displayed, so we need to track mousemove to be able to correctly
        // position the tooltip when showTooltip is called.
        this.lastMouseEvent = e;
        if (this.tooltipMouseTrack &&
            this.state === TooltipStates.SHOWING &&
            this.tooltipComp) {
            this.positionTooltipUnderLastMouseEvent();
        }
    };
    TooltipFeature.prototype.onMouseDown = function () {
        this.setToDoNothing();
    };
    TooltipFeature.prototype.hideTooltip = function () {
        // check if comp exists - due to async, although we asked for
        // one, the instance may not be back yet
        if (this.tooltipComp) {
            this.destroyTooltipComp();
            TooltipFeature.lastTooltipHideTime = new Date().getTime();
        }
        this.state = TooltipStates.NOTHING;
    };
    TooltipFeature.prototype.destroyTooltipComp = function () {
        var _this = this;
        // add class to fade out the tooltip
        dom_1.addCssClass(this.tooltipComp.getGui(), 'ag-tooltip-hiding');
        // make local copies of these variables, as we use them in the async function below,
        // and we clear then to 'undefined' later, so need to take a copy before they are undefined.
        var tooltipPopupDestroyFunc = this.tooltipPopupDestroyFunc;
        var tooltipComp = this.tooltipComp;
        window.setTimeout(function () {
            tooltipPopupDestroyFunc();
            _this.getContext().destroyBean(tooltipComp);
        }, this.FADE_OUT_TOOLTIP_TIMEOUT);
        this.tooltipPopupDestroyFunc = undefined;
        this.tooltipComp = undefined;
    };
    TooltipFeature.prototype.isLastTooltipHiddenRecently = function () {
        // return true if <1000ms since last time we hid a tooltip
        var now = new Date().getTime();
        var then = TooltipFeature.lastTooltipHideTime;
        return (now - then) < this.SHOW_QUICK_TOOLTIP_DIFF;
    };
    TooltipFeature.prototype.showTooltip = function () {
        var params = __assign({ api: this.gridApi, columnApi: this.columnApi, context: this.gridOptionsWrapper.getContext() }, this.parentComp.getTooltipParams());
        if (!generic_1.exists(params.value)) {
            this.setToDoNothing();
            return;
        }
        this.state = TooltipStates.SHOWING;
        this.tooltipInstanceCount++;
        // we pass in tooltipInstanceCount so the callback knows what the count was when
        // we requested the tooltip, so if another tooltip was requested in the mean time
        // we disregard it
        var callback = this.newTooltipComponentCallback.bind(this, this.tooltipInstanceCount);
        this.userComponentFactory.newTooltipComponent(params).then(callback);
    };
    TooltipFeature.prototype.newTooltipComponentCallback = function (tooltipInstanceCopy, tooltipComp) {
        var compNoLongerNeeded = this.state !== TooltipStates.SHOWING || this.tooltipInstanceCount !== tooltipInstanceCopy;
        if (compNoLongerNeeded) {
            this.getContext().destroyBean(tooltipComp);
            return;
        }
        var eGui = tooltipComp.getGui();
        this.tooltipComp = tooltipComp;
        if (!dom_1.containsClass(eGui, 'ag-tooltip')) {
            dom_1.addCssClass(eGui, 'ag-tooltip-custom');
        }
        var addPopupRes = this.popupService.addPopup({
            eChild: eGui
        });
        if (addPopupRes) {
            this.tooltipPopupDestroyFunc = addPopupRes.hideFunc;
        }
        // this.tooltipPopupDestroyFunc = this.popupService.addPopup(false, eGui, false);
        this.positionTooltipUnderLastMouseEvent();
        this.hideTooltipTimeoutId = window.setTimeout(this.hideTooltip.bind(this), this.DEFAULT_HIDE_TOOLTIP_TIMEOUT);
    };
    TooltipFeature.prototype.positionTooltipUnderLastMouseEvent = function () {
        this.popupService.positionPopupUnderMouseEvent({
            type: 'tooltip',
            mouseEvent: this.lastMouseEvent,
            ePopup: this.tooltipComp.getGui(),
            nudgeY: 18
        });
    };
    TooltipFeature.prototype.clearTimeouts = function () {
        if (this.showTooltipTimeoutId) {
            window.clearTimeout(this.showTooltipTimeoutId);
            this.showTooltipTimeoutId = undefined;
        }
        if (this.hideTooltipTimeoutId) {
            window.clearTimeout(this.hideTooltipTimeoutId);
            this.hideTooltipTimeoutId = undefined;
        }
    };
    __decorate([
        context_1.Autowired('popupService')
    ], TooltipFeature.prototype, "popupService", void 0);
    __decorate([
        context_1.Autowired('userComponentFactory')
    ], TooltipFeature.prototype, "userComponentFactory", void 0);
    __decorate([
        context_1.Autowired('columnApi')
    ], TooltipFeature.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi')
    ], TooltipFeature.prototype, "gridApi", void 0);
    __decorate([
        context_1.PostConstruct
    ], TooltipFeature.prototype, "postConstruct", null);
    return TooltipFeature;
}(beanStub_1.BeanStub));
exports.TooltipFeature = TooltipFeature;

//# sourceMappingURL=tooltipFeature.js.map
