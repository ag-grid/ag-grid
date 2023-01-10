/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean } from '../../../context/context';
import { BeanStub } from "../../../context/beanStub";
import { isVisible } from '../../../utils/dom';
import { KeyCode } from '../../../constants/keyCode';
import { setAriaRole } from '../../../utils/aria';
let StandardMenuFactory = class StandardMenuFactory extends BeanStub {
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
            this.popupService.positionPopupByComponent({
                type: containerType,
                eventSource,
                ePopup: eMenu,
                keepWithinBounds: true,
                position: 'under',
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
        setAriaRole(eMenu, 'presentation');
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
            if (isKeyboardEvent && eventSource && isVisible(eventSource)) {
                const focusableEl = this.focusService.findTabbableParent(eventSource);
                if (focusableEl) {
                    focusableEl.focus();
                }
            }
        };
        const translate = this.localeService.getLocaleTextFunc();
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
        if (e.key !== KeyCode.TAB ||
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
    Autowired('filterManager')
], StandardMenuFactory.prototype, "filterManager", void 0);
__decorate([
    Autowired('popupService')
], StandardMenuFactory.prototype, "popupService", void 0);
__decorate([
    Autowired('focusService')
], StandardMenuFactory.prototype, "focusService", void 0);
__decorate([
    Autowired('ctrlsService')
], StandardMenuFactory.prototype, "ctrlsService", void 0);
StandardMenuFactory = __decorate([
    Bean('menuFactory')
], StandardMenuFactory);
export { StandardMenuFactory };
