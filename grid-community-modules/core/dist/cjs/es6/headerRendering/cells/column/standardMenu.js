"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardMenuFactory = void 0;
const context_1 = require("../../../context/context");
const beanStub_1 = require("../../../context/beanStub");
const dom_1 = require("../../../utils/dom");
const keyCode_1 = require("../../../constants/keyCode");
const aria_1 = require("../../../utils/aria");
const eventKeys_1 = require("../../../eventKeys");
let StandardMenuFactory = class StandardMenuFactory extends beanStub_1.BeanStub {
    hideActiveMenu() {
        if (this.hidePopup) {
            this.hidePopup();
        }
    }
    showMenuAfterMouseEvent(column, mouseEvent, containerType) {
        this.showPopup(column, eMenu => {
            this.popupService.positionPopupUnderMouseEvent({
                column,
                type: containerType,
                mouseEvent,
                ePopup: eMenu
            });
        }, containerType, mouseEvent.target, this.menuService.isLegacyMenuEnabled());
    }
    showMenuAfterButtonClick(column, eventSource, containerType) {
        let multiplier = -1;
        let alignSide = 'left';
        const isLegacyMenuEnabled = this.menuService.isLegacyMenuEnabled();
        if (!isLegacyMenuEnabled && this.gridOptionsService.get('enableRtl')) {
            multiplier = 1;
            alignSide = 'right';
        }
        let nudgeX = isLegacyMenuEnabled ? undefined : (4 * multiplier);
        let nudgeY = isLegacyMenuEnabled ? undefined : 4;
        this.showPopup(column, eMenu => {
            this.popupService.positionPopupByComponent({
                type: containerType,
                eventSource,
                ePopup: eMenu,
                nudgeX,
                nudgeY,
                alignSide,
                keepWithinBounds: true,
                position: 'under',
                column,
            });
        }, containerType, eventSource, isLegacyMenuEnabled);
    }
    showPopup(column, positionCallback, containerType, eventSource, isLegacyMenuEnabled) {
        const filterWrapper = column ? this.filterManager.getOrCreateFilterWrapper(column, 'COLUMN_MENU') : undefined;
        if (!filterWrapper || !column) {
            throw new Error('AG Grid - unable to show popup filter, filter instantiation failed');
        }
        const eMenu = document.createElement('div');
        (0, aria_1.setAriaRole)(eMenu, 'presentation');
        eMenu.classList.add('ag-menu');
        if (!isLegacyMenuEnabled) {
            eMenu.classList.add('ag-filter-menu');
        }
        this.tabListener = this.addManagedListener(eMenu, 'keydown', (e) => this.trapFocusWithin(e, eMenu));
        filterWrapper.guiPromise.then(gui => eMenu.appendChild(gui));
        let hidePopup;
        const afterGuiDetached = () => { var _a; return (_a = filterWrapper.filterPromise) === null || _a === void 0 ? void 0 : _a.then(filter => { var _a; return (_a = filter === null || filter === void 0 ? void 0 : filter.afterGuiDetached) === null || _a === void 0 ? void 0 : _a.call(filter); }); };
        const anchorToElement = this.menuService.isColumnMenuAnchoringEnabled() ? (eventSource !== null && eventSource !== void 0 ? eventSource : this.ctrlsService.getGridBodyCtrl().getGui()) : undefined;
        const closedCallback = (e) => {
            column.setMenuVisible(false, 'contextMenu');
            const isKeyboardEvent = e instanceof KeyboardEvent;
            if (this.tabListener) {
                this.tabListener = this.tabListener();
            }
            if (isKeyboardEvent && eventSource && (0, dom_1.isVisible)(eventSource)) {
                const focusableEl = this.focusService.findTabbableParent(eventSource);
                if (focusableEl) {
                    focusableEl.focus();
                }
            }
            afterGuiDetached();
            this.dispatchVisibleChangedEvent(false, containerType, column);
        };
        const translate = this.localeService.getLocaleTextFunc();
        const ariaLabel = isLegacyMenuEnabled && containerType !== 'columnFilter'
            ? translate('ariaLabelColumnMenu', 'Column Menu')
            : translate('ariaLabelColumnFilter', 'Column Filter');
        const addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: eMenu,
            closeOnEsc: true,
            closedCallback,
            positionCallback: () => positionCallback(eMenu),
            anchorToElement,
            ariaLabel
        });
        if (addPopupRes) {
            this.hidePopup = hidePopup = addPopupRes.hideFunc;
        }
        filterWrapper.filterPromise.then(filter => {
            // need to make sure the filter is present before positioning, as only
            // after filter it is visible can we find out what the width of it is
            positionCallback(eMenu);
            if (filter.afterGuiAttached) {
                filter.afterGuiAttached({ container: containerType, hidePopup });
            }
        });
        column.setMenuVisible(true, 'contextMenu');
        this.dispatchVisibleChangedEvent(true, containerType, column);
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
    dispatchVisibleChangedEvent(visible, containerType, column) {
        const displayedEvent = {
            type: eventKeys_1.Events.EVENT_COLUMN_MENU_VISIBLE_CHANGED,
            visible,
            switchingTab: false,
            key: containerType,
            column: column !== null && column !== void 0 ? column : null
        };
        this.eventService.dispatchEvent(displayedEvent);
    }
    isMenuEnabled(column) {
        var _a;
        // for standard, we show menu if filter is enabled, and the menu is not suppressed by passing an empty array
        return column.isFilterAllowed() && ((_a = column.getColDef().menuTabs) !== null && _a !== void 0 ? _a : ['filterMenuTab']).includes('filterMenuTab');
    }
    showMenuAfterContextMenuEvent() {
        // not supported in standard menu
    }
};
__decorate([
    (0, context_1.Autowired)('filterManager')
], StandardMenuFactory.prototype, "filterManager", void 0);
__decorate([
    (0, context_1.Autowired)('popupService')
], StandardMenuFactory.prototype, "popupService", void 0);
__decorate([
    (0, context_1.Autowired)('focusService')
], StandardMenuFactory.prototype, "focusService", void 0);
__decorate([
    (0, context_1.Autowired)('ctrlsService')
], StandardMenuFactory.prototype, "ctrlsService", void 0);
__decorate([
    (0, context_1.Autowired)('menuService')
], StandardMenuFactory.prototype, "menuService", void 0);
StandardMenuFactory = __decorate([
    (0, context_1.Bean)('filterMenuFactory')
], StandardMenuFactory);
exports.StandardMenuFactory = StandardMenuFactory;
