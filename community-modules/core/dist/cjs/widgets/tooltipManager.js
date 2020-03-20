/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
 * @link http://www.ag-grid.com/
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
var context_1 = require("../context/context");
var utils_1 = require("../utils");
var TooltipManager = /** @class */ (function () {
    function TooltipManager() {
        this.DEFAULT_HIDE_TOOLTIP_TIMEOUT = 10000;
        this.MOUSEOUT_HIDE_TOOLTIP_TIMEOUT = 1000;
        this.HIDE_SHOW_ONLY = true;
        this.showTimeoutId = 0;
        this.hideTimeoutId = 0;
        // map of compId to [tooltip component, close function]
        this.registeredComponents = {};
    }
    TooltipManager.prototype.init = function () {
        var customDelay = this.gridOptionsWrapper.getTooltipShowDelay();
        this.MOUSEOVER_SHOW_TOOLTIP_TIMEOUT = customDelay || 2000;
    };
    TooltipManager.prototype.registerTooltip = function (targetCmp) {
        var _this = this;
        var el = targetCmp.getGui();
        var id = targetCmp.getCompId();
        this.registeredComponents[id] = {
            tooltipComp: undefined,
            destroyFunc: undefined,
            eventDestroyFuncs: [
                targetCmp.addDestroyableEventListener(el, 'mouseover', function (e) { return _this.processMouseOver(e, targetCmp); }),
                targetCmp.addDestroyableEventListener(el, 'mousemove', function (e) { return _this.processMouseMove(e); }),
                targetCmp.addDestroyableEventListener(el, 'mousedown', this.hideTooltip.bind(this)),
                targetCmp.addDestroyableEventListener(el, 'mouseout', this.processMouseOut.bind(this))
            ]
        };
        targetCmp.addDestroyFunc(function () { return _this.unregisterTooltip(targetCmp); });
    };
    TooltipManager.prototype.unregisterTooltip = function (targetCmp) {
        var id = targetCmp.getCompId();
        var registeredComponent = this.registeredComponents[id];
        // hide the tooltip if it's being displayed while unregistering the component
        if (this.activeComponent === targetCmp) {
            this.hideTooltip();
        }
        if (targetCmp.isAlive() && registeredComponent && registeredComponent.eventDestroyFuncs.length) {
            registeredComponent.eventDestroyFuncs.forEach(function (func) { return func(); });
        }
        delete this.registeredComponents[id];
    };
    TooltipManager.prototype.processMouseOver = function (e, targetCmp) {
        var delay = this.MOUSEOVER_SHOW_TOOLTIP_TIMEOUT;
        if (this.activeComponent) {
            // lastHoveredComponent will be the activeComponent when we are hovering
            // a component with many child elements like the grid header
            if (this.lastHoveredComponent === this.activeComponent) {
                return;
            }
            delay = 200;
        }
        else if (this.showTimeoutId && this.lastHoveredComponent === targetCmp) {
            return;
        }
        this.clearTimers(this.HIDE_SHOW_ONLY);
        // lastHoveredComponent will be the targetCmp when a click hid the tooltip
        // and the lastHoveredComponent has many child elements
        if (this.lastHoveredComponent === targetCmp) {
            return;
        }
        this.lastHoveredComponent = targetCmp;
        this.lastMouseEvent = e;
        this.showTimeoutId = window.setTimeout(this.showTooltip.bind(this), delay, e);
    };
    TooltipManager.prototype.processMouseOut = function (e) {
        var activeComponent = this.activeComponent;
        var relatedTarget = e.relatedTarget;
        if (!activeComponent) {
            if (this.lastHoveredComponent) {
                var containsElement = this.lastHoveredComponent.getGui().contains(relatedTarget);
                if (this.showTimeoutId && containsElement) {
                    // if we are hovering within a component with multiple child elements before
                    // the tooltip has been displayed, we should cancel this event
                    return;
                }
                else if (!containsElement) {
                    // when a click hides the tooltip we need to reset the lastHoveredComponent
                    // otherwise the tooltip won't appear until another registered component is hovered.
                    this.lastHoveredComponent = undefined;
                }
            }
            this.clearTimers();
            return;
        }
        // the mouseout was called from within the activeComponent so we do nothing
        if (activeComponent.getGui().contains(relatedTarget)) {
            return;
        }
        var registeredComponent = this.registeredComponents[activeComponent.getCompId()];
        utils_1._.addCssClass(registeredComponent.tooltipComp.getGui(), 'ag-tooltip-hiding');
        this.lastHoveredComponent = undefined;
        this.clearTimers();
        this.hideTimeoutId = window.setTimeout(this.hideTooltip.bind(this), this.MOUSEOUT_HIDE_TOOLTIP_TIMEOUT);
    };
    TooltipManager.prototype.processMouseMove = function (e) {
        // there is a delay from the time we mouseOver a component and the time the
        // tooltip is displayed, so we need to track mousemove to be able to correctly
        // position the tooltip when showTooltip is called.
        this.lastMouseEvent = e;
    };
    TooltipManager.prototype.showTooltip = function (e) {
        var targetCmp = this.lastHoveredComponent;
        var cellComp = targetCmp;
        var registeredComponent = this.registeredComponents[targetCmp.getCompId()];
        this.hideTooltip();
        var params = {
            api: this.gridApi,
            columnApi: this.columnApi,
            colDef: targetCmp.getComponentHolder(),
            column: cellComp.getColumn && cellComp.getColumn(),
            context: this.gridOptionsWrapper.getContext(),
            rowIndex: cellComp.getCellPosition && cellComp.getCellPosition().rowIndex,
            value: targetCmp.getTooltipText()
        };
        this.createTooltipComponent(params, registeredComponent, e);
    };
    TooltipManager.prototype.createTooltipComponent = function (params, cmp, e) {
        var _this = this;
        var mouseEvent = this.lastMouseEvent;
        if (!mouseEvent) {
            return;
        }
        this.userComponentFactory.newTooltipComponent(params).then(function (tooltipComp) {
            // if the component was unregistered while creating
            // the tooltip (async) we should return undefined here.
            if (!cmp) {
                return;
            }
            cmp.tooltipComp = tooltipComp;
            var eGui = tooltipComp.getGui();
            if (!utils_1._.containsClass(eGui, 'ag-tooltip')) {
                utils_1._.addCssClass(eGui, 'ag-tooltip-custom');
            }
            var closeFnc = _this.popupService.addPopup(false, eGui, false);
            cmp.destroyFunc = function () {
                closeFnc();
                if (tooltipComp.destroy) {
                    tooltipComp.destroy();
                }
            };
            _this.popupService.positionPopupUnderMouseEvent({
                type: 'tooltip',
                mouseEvent: mouseEvent,
                ePopup: eGui,
                nudgeY: 18
            });
            _this.activeComponent = _this.lastHoveredComponent;
            _this.hideTimeoutId = window.setTimeout(_this.hideTooltip.bind(_this), _this.DEFAULT_HIDE_TOOLTIP_TIMEOUT);
        });
    };
    TooltipManager.prototype.hideTooltip = function () {
        var activeComponent = this.activeComponent;
        this.clearTimers();
        if (!activeComponent) {
            return;
        }
        var id = activeComponent.getCompId();
        var registeredComponent = this.registeredComponents[id];
        this.activeComponent = undefined;
        if (!registeredComponent) {
            return;
        }
        if (registeredComponent.destroyFunc) {
            registeredComponent.destroyFunc();
        }
        this.clearRegisteredComponent(registeredComponent);
    };
    TooltipManager.prototype.clearRegisteredComponent = function (registeredComponent) {
        delete registeredComponent.destroyFunc;
        delete registeredComponent.tooltipComp;
    };
    TooltipManager.prototype.clearTimers = function (showOnly) {
        if (showOnly === void 0) { showOnly = false; }
        if (this.hideTimeoutId && !showOnly) {
            window.clearTimeout(this.hideTimeoutId);
            this.hideTimeoutId = 0;
        }
        if (this.showTimeoutId) {
            window.clearTimeout(this.showTimeoutId);
            this.showTimeoutId = 0;
        }
    };
    __decorate([
        context_1.Autowired('popupService')
    ], TooltipManager.prototype, "popupService", void 0);
    __decorate([
        context_1.Autowired('userComponentFactory')
    ], TooltipManager.prototype, "userComponentFactory", void 0);
    __decorate([
        context_1.Autowired('columnApi')
    ], TooltipManager.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi')
    ], TooltipManager.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper')
    ], TooltipManager.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.PostConstruct
    ], TooltipManager.prototype, "init", null);
    TooltipManager = __decorate([
        context_1.Bean('tooltipManager')
    ], TooltipManager);
    return TooltipManager;
}());
exports.TooltipManager = TooltipManager;

//# sourceMappingURL=tooltipManager.js.map
