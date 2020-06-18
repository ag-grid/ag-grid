/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
import { Autowired, Bean } from '../context/context';
import { BeanStub } from "../context/beanStub";
import { Constants } from '../constants';
import { _ } from '../utils';
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
        }, mouseEvent.target);
    };
    StandardMenuFactory.prototype.showMenuAfterButtonClick = function (column, eventSource) {
        var _this = this;
        this.showPopup(column, function (eMenu) {
            _this.popupService.positionPopupUnderComponent({
                type: 'columnMenu',
                eventSource: eventSource,
                ePopup: eMenu,
                keepWithinBounds: true,
                column: column
            });
        }, eventSource);
    };
    StandardMenuFactory.prototype.showPopup = function (column, positionCallback, eventSource) {
        var _this = this;
        var filterWrapper = this.filterManager.getOrCreateFilterWrapper(column, 'COLUMN_MENU');
        var eMenu = document.createElement('div');
        _.addCssClass(eMenu, 'ag-menu');
        this.tabListener = this.addManagedListener(eMenu, 'keydown', function (e) { return _this.trapFocusWithin(e, eMenu); });
        filterWrapper.guiPromise.then(function (gui) { return eMenu.appendChild(gui); });
        var hidePopup;
        var bodyScrollListener = function (event) {
            // if h scroll, popup is no longer over the column
            if (event.direction === 'horizontal') {
                hidePopup();
            }
        };
        this.eventService.addEventListener('bodyScroll', bodyScrollListener);
        var closedCallback = function (e) {
            _this.eventService.removeEventListener('bodyScroll', bodyScrollListener);
            column.setMenuVisible(false, 'contextMenu');
            var isKeyboardEvent = e instanceof KeyboardEvent;
            if (_this.tabListener) {
                _this.tabListener = _this.tabListener();
            }
            if (isKeyboardEvent && eventSource && _.isVisible(eventSource)) {
                var focusableEl = _this.focusController.findTabbableParent(eventSource);
                if (focusableEl) {
                    focusableEl.focus();
                }
            }
        };
        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        hidePopup = this.popupService.addAsModalPopup(eMenu, true, closedCallback);
        positionCallback(eMenu);
        filterWrapper.filterPromise.then(function (filter) {
            if (filter.afterGuiAttached) {
                var params = {
                    hidePopup: hidePopup
                };
                filter.afterGuiAttached(params);
            }
        });
        this.hidePopup = hidePopup;
        column.setMenuVisible(true, 'contextMenu');
    };
    StandardMenuFactory.prototype.trapFocusWithin = function (e, menu) {
        if (e.keyCode !== Constants.KEY_TAB) {
            return;
        }
        if (this.focusController.findNextFocusableElement(menu, false, e.shiftKey)) {
            return;
        }
        e.preventDefault();
        if (e.shiftKey) {
            this.focusController.focusLastFocusableElement(menu);
        }
        else {
            this.focusController.focusFirstFocusableElement(menu);
        }
    };
    StandardMenuFactory.prototype.isMenuEnabled = function (column) {
        // for standard, we show menu if filter is enabled, and the menu is not suppressed
        return column.isFilterAllowed();
    };
    __decorate([
        Autowired('filterManager')
    ], StandardMenuFactory.prototype, "filterManager", void 0);
    __decorate([
        Autowired('popupService')
    ], StandardMenuFactory.prototype, "popupService", void 0);
    __decorate([
        Autowired('focusController')
    ], StandardMenuFactory.prototype, "focusController", void 0);
    StandardMenuFactory = __decorate([
        Bean('menuFactory')
    ], StandardMenuFactory);
    return StandardMenuFactory;
}(BeanStub));
export { StandardMenuFactory };
