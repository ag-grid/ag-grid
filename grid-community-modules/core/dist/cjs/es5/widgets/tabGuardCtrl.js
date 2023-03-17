/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabGuardCtrl = exports.TabGuardClassNames = void 0;
var beanStub_1 = require("../context/beanStub");
var context_1 = require("../context/context");
var managedFocusFeature_1 = require("./managedFocusFeature");
var TabGuardClassNames;
(function (TabGuardClassNames) {
    TabGuardClassNames["TAB_GUARD"] = "ag-tab-guard";
    TabGuardClassNames["TAB_GUARD_TOP"] = "ag-tab-guard-top";
    TabGuardClassNames["TAB_GUARD_BOTTOM"] = "ag-tab-guard-bottom";
})(TabGuardClassNames = exports.TabGuardClassNames || (exports.TabGuardClassNames = {}));
;
var TabGuardCtrl = /** @class */ (function (_super) {
    __extends(TabGuardCtrl, _super);
    function TabGuardCtrl(params) {
        var _this = _super.call(this) || this;
        _this.skipTabGuardFocus = false;
        var comp = params.comp, eTopGuard = params.eTopGuard, eBottomGuard = params.eBottomGuard, focusInnerElement = params.focusInnerElement, onFocusIn = params.onFocusIn, onFocusOut = params.onFocusOut, shouldStopEventPropagation = params.shouldStopEventPropagation, onTabKeyDown = params.onTabKeyDown, handleKeyDown = params.handleKeyDown, eFocusableElement = params.eFocusableElement;
        _this.comp = comp;
        _this.eTopGuard = eTopGuard;
        _this.eBottomGuard = eBottomGuard;
        _this.providedFocusInnerElement = focusInnerElement;
        _this.eFocusableElement = eFocusableElement;
        _this.providedFocusIn = onFocusIn;
        _this.providedFocusOut = onFocusOut;
        _this.providedShouldStopEventPropagation = shouldStopEventPropagation;
        _this.providedOnTabKeyDown = onTabKeyDown;
        _this.providedHandleKeyDown = handleKeyDown;
        return _this;
    }
    TabGuardCtrl.prototype.postConstruct = function () {
        var _this = this;
        this.createManagedBean(new managedFocusFeature_1.ManagedFocusFeature(this.eFocusableElement, {
            shouldStopEventPropagation: function () { return _this.shouldStopEventPropagation(); },
            onTabKeyDown: function (e) { return _this.onTabKeyDown(e); },
            handleKeyDown: function (e) { return _this.handleKeyDown(e); },
            onFocusIn: function (e) { return _this.onFocusIn(e); },
            onFocusOut: function (e) { return _this.onFocusOut(e); }
        }));
        this.activateTabGuards();
        [this.eTopGuard, this.eBottomGuard].forEach(function (guard) { return _this.addManagedListener(guard, 'focus', _this.onFocus.bind(_this)); });
    };
    TabGuardCtrl.prototype.handleKeyDown = function (e) {
        if (this.providedHandleKeyDown) {
            this.providedHandleKeyDown(e);
        }
    };
    TabGuardCtrl.prototype.tabGuardsAreActive = function () {
        return !!this.eTopGuard && this.eTopGuard.hasAttribute('tabIndex');
    };
    TabGuardCtrl.prototype.shouldStopEventPropagation = function () {
        if (this.providedShouldStopEventPropagation) {
            return this.providedShouldStopEventPropagation();
        }
        return false;
    };
    TabGuardCtrl.prototype.activateTabGuards = function () {
        this.comp.setTabIndex(this.getGridTabIndex());
    };
    TabGuardCtrl.prototype.deactivateTabGuards = function () {
        this.comp.setTabIndex();
    };
    TabGuardCtrl.prototype.onFocus = function (e) {
        if (this.skipTabGuardFocus) {
            this.skipTabGuardFocus = false;
            return;
        }
        var fromBottom = e.target === this.eBottomGuard;
        if (this.providedFocusInnerElement) {
            this.providedFocusInnerElement(fromBottom);
        }
        else {
            this.focusInnerElement(fromBottom);
        }
    };
    TabGuardCtrl.prototype.onFocusIn = function (e) {
        if (this.providedFocusIn && this.providedFocusIn(e)) {
            return;
        }
        this.deactivateTabGuards();
    };
    TabGuardCtrl.prototype.onFocusOut = function (e) {
        if (this.providedFocusOut && this.providedFocusOut(e)) {
            return;
        }
        if (!this.eFocusableElement.contains(e.relatedTarget)) {
            this.activateTabGuards();
        }
    };
    TabGuardCtrl.prototype.onTabKeyDown = function (e) {
        var _this = this;
        if (this.providedOnTabKeyDown) {
            this.providedOnTabKeyDown(e);
            return;
        }
        if (e.defaultPrevented) {
            return;
        }
        var tabGuardsAreActive = this.tabGuardsAreActive();
        if (tabGuardsAreActive) {
            this.deactivateTabGuards();
        }
        var nextRoot = this.getNextFocusableElement(e.shiftKey);
        if (tabGuardsAreActive) {
            // ensure the tab guards are only re-instated once the event has finished processing, to avoid the browser
            // tabbing to the tab guard from inside the component
            setTimeout(function () { return _this.activateTabGuards(); }, 0);
        }
        if (!nextRoot) {
            return;
        }
        nextRoot.focus();
        e.preventDefault();
    };
    TabGuardCtrl.prototype.getGridTabIndex = function () {
        return (this.gridOptionsService.getNum('tabIndex') || 0).toString();
    };
    TabGuardCtrl.prototype.focusInnerElement = function (fromBottom) {
        if (fromBottom === void 0) { fromBottom = false; }
        var focusable = this.focusService.findFocusableElements(this.eFocusableElement);
        if (this.tabGuardsAreActive()) {
            // remove tab guards from this component from list of focusable elements
            focusable.splice(0, 1);
            focusable.splice(focusable.length - 1, 1);
        }
        if (!focusable.length) {
            return;
        }
        focusable[fromBottom ? focusable.length - 1 : 0].focus();
    };
    TabGuardCtrl.prototype.getNextFocusableElement = function (backwards) {
        return this.focusService.findNextFocusableElement(this.eFocusableElement, false, backwards);
    };
    TabGuardCtrl.prototype.forceFocusOutOfContainer = function (up) {
        if (up === void 0) { up = false; }
        var tabGuardToFocus = up ? this.eTopGuard : this.eBottomGuard;
        this.activateTabGuards();
        this.skipTabGuardFocus = true;
        tabGuardToFocus.focus();
    };
    __decorate([
        context_1.Autowired('focusService')
    ], TabGuardCtrl.prototype, "focusService", void 0);
    __decorate([
        context_1.PostConstruct
    ], TabGuardCtrl.prototype, "postConstruct", null);
    return TabGuardCtrl;
}(beanStub_1.BeanStub));
exports.TabGuardCtrl = TabGuardCtrl;
