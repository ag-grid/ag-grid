/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
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
exports.StandardMenuFactory = void 0;
var context_1 = require("../../../context/context");
var beanStub_1 = require("../../../context/beanStub");
var dom_1 = require("../../../utils/dom");
var keyCode_1 = require("../../../constants/keyCode");
var aria_1 = require("../../../utils/aria");
var StandardMenuFactory = /** @class */ (function (_super) {
    __extends(StandardMenuFactory, _super);
    function StandardMenuFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StandardMenuFactory.prototype.hideActiveMenu = function () {
        if (this.hidePopup) {
            this.hidePopup();
        }
    };
    StandardMenuFactory.prototype.showMenuAfterMouseEvent = function (column, mouseEvent) {
        var _this = this;
        this.showPopup(column, function (eMenu) {
            _this.popupService.positionPopupUnderMouseEvent({
                column: column,
                type: 'columnMenu',
                mouseEvent: mouseEvent,
                ePopup: eMenu
            });
        }, 'columnMenu', mouseEvent.target);
    };
    StandardMenuFactory.prototype.showMenuAfterButtonClick = function (column, eventSource, containerType) {
        var _this = this;
        this.showPopup(column, function (eMenu) {
            _this.popupService.positionPopupByComponent({
                type: containerType,
                eventSource: eventSource,
                ePopup: eMenu,
                keepWithinBounds: true,
                position: 'under',
                column: column,
            });
        }, containerType, eventSource);
    };
    StandardMenuFactory.prototype.showPopup = function (column, positionCallback, containerType, eventSource) {
        var _this = this;
        var filterWrapper = this.filterManager.getOrCreateFilterWrapper(column, 'COLUMN_MENU');
        if (!filterWrapper) {
            throw new Error('AG Grid - unable to show popup filter, filter instantiation failed');
        }
        var eMenu = document.createElement('div');
        aria_1.setAriaRole(eMenu, 'presentation');
        eMenu.classList.add('ag-menu');
        this.tabListener = this.addManagedListener(eMenu, 'keydown', function (e) { return _this.trapFocusWithin(e, eMenu); });
        filterWrapper.guiPromise.then(function (gui) { return eMenu.appendChild(gui); });
        var hidePopup;
        var afterGuiDetached = function () { var _a; return (_a = filterWrapper.filterPromise) === null || _a === void 0 ? void 0 : _a.then(function (filter) { var _a; return (_a = filter === null || filter === void 0 ? void 0 : filter.afterGuiDetached) === null || _a === void 0 ? void 0 : _a.call(filter); }); };
        var anchorToElement = eventSource || this.ctrlsService.getGridBodyCtrl().getGui();
        var closedCallback = function (e) {
            column.setMenuVisible(false, 'contextMenu');
            var isKeyboardEvent = e instanceof KeyboardEvent;
            if (_this.tabListener) {
                _this.tabListener = _this.tabListener();
            }
            if (isKeyboardEvent && eventSource && dom_1.isVisible(eventSource)) {
                var focusableEl = _this.focusService.findTabbableParent(eventSource);
                if (focusableEl) {
                    focusableEl.focus();
                }
            }
            afterGuiDetached();
        };
        var translate = this.localeService.getLocaleTextFunc();
        var addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: eMenu,
            closeOnEsc: true,
            closedCallback: closedCallback,
            positionCallback: function () { return positionCallback(eMenu); },
            anchorToElement: anchorToElement,
            ariaLabel: translate('ariaLabelColumnMenu', 'Column Menu')
        });
        if (addPopupRes) {
            this.hidePopup = hidePopup = addPopupRes.hideFunc;
        }
        filterWrapper.filterPromise.then(function (filter) {
            // need to make sure the filter is present before positioning, as only
            // after filter it is visible can we find out what the width of it is
            positionCallback(eMenu);
            if (filter.afterGuiAttached) {
                filter.afterGuiAttached({ container: containerType, hidePopup: hidePopup });
            }
        });
        column.setMenuVisible(true, 'contextMenu');
    };
    StandardMenuFactory.prototype.trapFocusWithin = function (e, menu) {
        if (e.key !== keyCode_1.KeyCode.TAB ||
            e.defaultPrevented ||
            this.focusService.findNextFocusableElement(menu, false, e.shiftKey)) {
            return;
        }
        e.preventDefault();
        this.focusService.focusInto(menu, e.shiftKey);
    };
    StandardMenuFactory.prototype.isMenuEnabled = function (column) {
        // for standard, we show menu if filter is enabled, and the menu is not suppressed by passing an empty array
        return column.isFilterAllowed() && column.getMenuTabs(['filterMenuTab']).includes('filterMenuTab');
    };
    __decorate([
        context_1.Autowired('filterManager')
    ], StandardMenuFactory.prototype, "filterManager", void 0);
    __decorate([
        context_1.Autowired('popupService')
    ], StandardMenuFactory.prototype, "popupService", void 0);
    __decorate([
        context_1.Autowired('focusService')
    ], StandardMenuFactory.prototype, "focusService", void 0);
    __decorate([
        context_1.Autowired('ctrlsService')
    ], StandardMenuFactory.prototype, "ctrlsService", void 0);
    StandardMenuFactory = __decorate([
        context_1.Bean('menuFactory')
    ], StandardMenuFactory);
    return StandardMenuFactory;
}(beanStub_1.BeanStub));
exports.StandardMenuFactory = StandardMenuFactory;
