/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
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
exports.AbstractFakeScrollComp = void 0;
var context_1 = require("../context/context");
var eventKeys_1 = require("../eventKeys");
var browser_1 = require("../utils/browser");
var component_1 = require("../widgets/component");
var componentAnnotations_1 = require("../widgets/componentAnnotations");
var AbstractFakeScrollComp = /** @class */ (function (_super) {
    __extends(AbstractFakeScrollComp, _super);
    function AbstractFakeScrollComp(template, direction) {
        var _this = _super.call(this, template) || this;
        _this.direction = direction;
        _this.hideTimeout = null;
        return _this;
    }
    AbstractFakeScrollComp.prototype.postConstruct = function () {
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.onScrollVisibilityChanged();
        this.addOrRemoveCssClass('ag-apple-scrollbar', browser_1.isMacOsUserAgent() || browser_1.isIOSUserAgent());
    };
    AbstractFakeScrollComp.prototype.initialiseInvisibleScrollbar = function () {
        if (this.invisibleScrollbar !== undefined) {
            return;
        }
        this.invisibleScrollbar = browser_1.isInvisibleScrollbar();
        if (this.invisibleScrollbar) {
            this.hideAndShowInvisibleScrollAsNeeded();
            this.addActiveListenerToggles();
        }
    };
    AbstractFakeScrollComp.prototype.addActiveListenerToggles = function () {
        var _this = this;
        var activateEvents = ['mouseenter', 'mousedown', 'touchstart'];
        var deactivateEvents = ['mouseleave', 'touchend'];
        var eGui = this.getGui();
        activateEvents.forEach(function (eventName) { return _this.addManagedListener(eGui, eventName, function () { return _this.addOrRemoveCssClass('ag-scrollbar-active', true); }); });
        deactivateEvents.forEach(function (eventName) { return _this.addManagedListener(eGui, eventName, function () { return _this.addOrRemoveCssClass('ag-scrollbar-active', false); }); });
    };
    AbstractFakeScrollComp.prototype.onScrollVisibilityChanged = function () {
        // initialiseInvisibleScrollbar should only be called once, but the reason
        // this can't be inside `setComp` or `PostConstruct` is the DOM might not
        // be ready, so we call it until eventually, it gets calculated.
        if (this.invisibleScrollbar === undefined) {
            this.initialiseInvisibleScrollbar();
        }
        this.setScrollVisible();
    };
    AbstractFakeScrollComp.prototype.hideAndShowInvisibleScrollAsNeeded = function () {
        var _this = this;
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_BODY_SCROLL, function (params) {
            if (params.direction === _this.direction) {
                if (_this.hideTimeout !== null) {
                    window.clearInterval(_this.hideTimeout);
                    _this.hideTimeout = null;
                }
                _this.addOrRemoveCssClass('ag-scrollbar-scrolling', true);
            }
        });
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_BODY_SCROLL_END, function () {
            _this.hideTimeout = window.setTimeout(function () {
                _this.addOrRemoveCssClass('ag-scrollbar-scrolling', false);
                _this.hideTimeout = null;
            }, 400);
        });
    };
    AbstractFakeScrollComp.prototype.getViewport = function () {
        return this.eViewport;
    };
    AbstractFakeScrollComp.prototype.getContainer = function () {
        return this.eContainer;
    };
    __decorate([
        componentAnnotations_1.RefSelector('eViewport')
    ], AbstractFakeScrollComp.prototype, "eViewport", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eContainer')
    ], AbstractFakeScrollComp.prototype, "eContainer", void 0);
    __decorate([
        context_1.Autowired('scrollVisibleService')
    ], AbstractFakeScrollComp.prototype, "scrollVisibleService", void 0);
    __decorate([
        context_1.Autowired('ctrlsService')
    ], AbstractFakeScrollComp.prototype, "ctrlsService", void 0);
    return AbstractFakeScrollComp;
}(component_1.Component));
exports.AbstractFakeScrollComp = AbstractFakeScrollComp;
