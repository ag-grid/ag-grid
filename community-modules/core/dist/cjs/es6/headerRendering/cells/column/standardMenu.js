/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
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
const context_1 = require("../../../context/context");
const beanStub_1 = require("../../../context/beanStub");
const dom_1 = require("../../../utils/dom");
const keyCode_1 = require("../../../constants/keyCode");
const aria_1 = require("../../../utils/aria");
let StandardMenuFactory = class StandardMenuFactory extends beanStub_1.BeanStub {
    hideActiveMenu() {
        if (this.hidePopup) {
            this.hidePopup();
        }
    }
    showMenuAfterMouseEvent(column, mouseEvent) {
        this.showPopup(column, eMenu => {
            this.popupService.positionPopupUnderMouseEvent({
                column,
                type: 'columnMenu',
                mouseEvent,
                ePopup: eMenu
            });
        }, mouseEvent.target);
    }
    showMenuAfterButtonClick(column, eventSource, containerType) {
        this.showPopup(column, eMenu => {
            this.popupService.positionPopupUnderComponent({
                type: containerType,
                eventSource,
                ePopup: eMenu,
                keepWithinBounds: true,
                column
            });
        }, eventSource);
    }
    showPopup(column, positionCallback, eventSource) {
        const filterWrapper = this.filterManager.getOrCreateFilterWrapper(column, 'COLUMN_MENU');
        if (!filterWrapper) {
            throw new Error('AG Grid - unable to show popup filter, filter instantiation failed');
        }
        const eMenu = document.createElement('div');
        aria_1.setAriaRole(eMenu, 'presentation');
        eMenu.classList.add('ag-menu');
        this.tabListener = this.addManagedListener(eMenu, 'keydown', (e) => this.trapFocusWithin(e, eMenu));
        filterWrapper.guiPromise.then(gui => eMenu.appendChild(gui));
        let hidePopup;
        const anchorToElement = eventSource || this.ctrlsService.getGridBodyCtrl().getGui();
        const closedCallback = (e) => {
            column.setMenuVisible(false, 'contextMenu');
            const isKeyboardEvent = e instanceof KeyboardEvent;
            if (this.tabListener) {
                this.tabListener = this.tabListener();
            }
            if (isKeyboardEvent && eventSource && dom_1.isVisible(eventSource)) {
                const focusableEl = this.focusService.findTabbableParent(eventSource);
                if (focusableEl) {
                    focusableEl.focus();
                }
            }
        };
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        const addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: eMenu,
            closeOnEsc: true,
            closedCallback,
            positionCallback: () => positionCallback(eMenu),
            anchorToElement,
            ariaLabel: translate('ariaLabelColumnMenu', 'Column Menu')
        });
        if (addPopupRes) {
            this.hidePopup = hidePopup = addPopupRes.hideFunc;
        }
        filterWrapper.filterPromise.then(filter => {
            // need to make sure the filter is present before positioning, as only
            // after filter it is visible can we find out what the width of it is
            positionCallback(eMenu);
            if (filter.afterGuiAttached) {
                filter.afterGuiAttached({ container: 'columnMenu', hidePopup });
            }
        });
        column.setMenuVisible(true, 'contextMenu');
    }
    trapFocusWithin(e, menu) {
        if (e.key !== keyCode_1.KeyCode.TAB ||
            e.defaultPrevented ||
            this.focusService.findNextFocusableElement(menu, false, e.shiftKey)) {
            return;
        }
        e.preventDefault();
        this.focusService.focusInto(menu, e.shiftKey);
    }
    isMenuEnabled(column) {
        // for standard, we show menu if filter is enabled, and the menu is not suppressed
        return column.isFilterAllowed();
    }
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
exports.StandardMenuFactory = StandardMenuFactory;
