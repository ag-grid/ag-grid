/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v27.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired } from "../../../context/context";
import { Column } from "../../../entities/column";
import { Events } from "../../../events";
import { firstExistingValue } from "../../../utils/array";
import { isIOSUserAgent } from "../../../utils/browser";
import { clearElement, removeFromParent, setDisplayed } from "../../../utils/dom";
import { exists } from "../../../utils/generic";
import { createIconNoSpan } from "../../../utils/icon";
import { escapeString } from "../../../utils/string";
import { Component } from "../../../widgets/component";
import { RefSelector } from "../../../widgets/componentAnnotations";
import { TouchListener } from "../../../widgets/touchListener";
export class HeaderComp extends Component {
    constructor() {
        super(...arguments);
        this.lastMovingChanged = 0;
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    destroy() {
        super.destroy();
    }
    refresh(params) {
        this.params = params;
        // if template changed, then recreate the whole comp, the code required to manage
        // a changing template is to difficult for what it's worth.
        if (this.workOutTemplate() != this.currentTemplate) {
            return false;
        }
        if (this.workOutShowMenu() != this.currentShowMenu) {
            return false;
        }
        if (this.workOutSort() != this.currentSort) {
            return false;
        }
        this.setDisplayName(params);
        return true;
    }
    workOutTemplate() {
        let template = firstExistingValue(this.params.template, HeaderComp.TEMPLATE);
        // take account of any newlines & whitespace before/after the actual template
        template = template && template.trim ? template.trim() : template;
        return template;
    }
    init(params) {
        this.params = params;
        this.currentTemplate = this.workOutTemplate();
        this.setTemplate(this.currentTemplate);
        this.setupTap();
        this.setupIcons(params.column);
        this.setMenu();
        this.setupSort();
        this.setupFilterIcon();
        this.setDisplayName(params);
    }
    setDisplayName(params) {
        if (this.currentDisplayName != params.displayName) {
            this.currentDisplayName = params.displayName;
            const displayNameSanitised = escapeString(this.currentDisplayName);
            if (this.eText) {
                this.eText.innerHTML = displayNameSanitised;
            }
        }
    }
    setupIcons(column) {
        this.addInIcon('sortAscending', this.eSortAsc, column);
        this.addInIcon('sortDescending', this.eSortDesc, column);
        this.addInIcon('sortUnSort', this.eSortNone, column);
        this.addInIcon('menu', this.eMenu, column);
        this.addInIcon('filter', this.eFilter, column);
    }
    addInIcon(iconName, eParent, column) {
        if (eParent == null) {
            return;
        }
        const eIcon = createIconNoSpan(iconName, this.gridOptionsWrapper, column);
        if (eIcon) {
            eParent.appendChild(eIcon);
        }
    }
    setupTap() {
        const { gridOptionsWrapper: options } = this;
        if (options.isSuppressTouch()) {
            return;
        }
        const touchListener = new TouchListener(this.getGui(), true);
        const suppressMenuHide = options.isSuppressMenuHide();
        const tapMenuButton = suppressMenuHide && exists(this.eMenu);
        const menuTouchListener = tapMenuButton ? new TouchListener(this.eMenu, true) : touchListener;
        if (this.params.enableMenu) {
            const eventType = tapMenuButton ? 'EVENT_TAP' : 'EVENT_LONG_TAP';
            const showMenuFn = (event) => {
                options.getApi().showColumnMenuAfterMouseClick(this.params.column, event.touchStart);
            };
            this.addManagedListener(menuTouchListener, TouchListener[eventType], showMenuFn);
        }
        if (this.params.enableSorting) {
            const tapListener = (event) => {
                const target = event.touchStart.target;
                // When suppressMenuHide is true, a tap on the menu icon will bubble up
                // to the header container, in that case we should not sort
                if (suppressMenuHide && this.eMenu.contains(target)) {
                    return;
                }
                this.sortController.progressSort(this.params.column, false, "uiColumnSorted");
            };
            this.addManagedListener(touchListener, TouchListener.EVENT_TAP, tapListener);
        }
        // if tapMenuButton is true `touchListener` and `menuTouchListener` are different
        // so we need to make sure to destroy both listeners here
        this.addDestroyFunc(() => touchListener.destroy());
        if (tapMenuButton) {
            this.addDestroyFunc(() => menuTouchListener.destroy());
        }
    }
    workOutShowMenu() {
        // we don't show the menu if on an iPad/iPhone, as the user cannot have a pointer device/
        // However if suppressMenuHide is set to true the menu will be displayed alwasys, so it's ok
        // to show it on iPad in this case (as hover isn't needed). If suppressMenuHide
        // is false (default) user will need to use longpress to display the menu.
        const menuHides = !this.gridOptionsWrapper.isSuppressMenuHide();
        const onIpadAndMenuHides = isIOSUserAgent() && menuHides;
        const showMenu = this.params.enableMenu && !onIpadAndMenuHides;
        return showMenu;
    }
    setMenu() {
        // if no menu provided in template, do nothing
        if (!this.eMenu) {
            return;
        }
        this.currentShowMenu = this.workOutShowMenu();
        if (!this.currentShowMenu) {
            removeFromParent(this.eMenu);
            return;
        }
        const suppressMenuHide = this.gridOptionsWrapper.isSuppressMenuHide();
        this.addManagedListener(this.eMenu, 'click', () => this.showMenu(this.eMenu));
        this.eMenu.classList.toggle('ag-header-menu-always-show', suppressMenuHide);
    }
    showMenu(eventSource) {
        if (!eventSource) {
            eventSource = this.eMenu;
        }
        this.menuFactory.showMenuAfterButtonClick(this.params.column, eventSource, 'columnMenu');
    }
    removeSortIcons() {
        removeFromParent(this.eSortAsc);
        removeFromParent(this.eSortDesc);
        removeFromParent(this.eSortNone);
        removeFromParent(this.eSortOrder);
    }
    workOutSort() {
        return this.params.enableSorting;
    }
    setupSort() {
        this.currentSort = this.params.enableSorting;
        if (!this.currentSort) {
            this.removeSortIcons();
            return;
        }
        const sortUsingCtrl = this.gridOptionsWrapper.isMultiSortKeyCtrl();
        // keep track of last time the moving changed flag was set
        this.addManagedListener(this.params.column, Column.EVENT_MOVING_CHANGED, () => {
            this.lastMovingChanged = new Date().getTime();
        });
        // add the event on the header, so when clicked, we do sorting
        if (this.eLabel) {
            this.addManagedListener(this.eLabel, 'click', (event) => {
                // sometimes when moving a column via dragging, this was also firing a clicked event.
                // here is issue raised by user: https://ag-grid.zendesk.com/agent/tickets/1076
                // this check stops sort if a) column is moving or b) column moved less than 200ms ago (so caters for race condition)
                const moving = this.params.column.isMoving();
                const nowTime = new Date().getTime();
                // typically there is <2ms if moving flag was set recently, as it would be done in same VM turn
                const movedRecently = (nowTime - this.lastMovingChanged) < 50;
                const columnMoving = moving || movedRecently;
                if (!columnMoving) {
                    const multiSort = sortUsingCtrl ? (event.ctrlKey || event.metaKey) : event.shiftKey;
                    this.params.progressSort(multiSort);
                }
            });
        }
        this.addManagedListener(this.params.column, Column.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.onSortChanged();
        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, this.setMultiSortOrder.bind(this));
        this.setMultiSortOrder();
    }
    onSortChanged() {
        this.addOrRemoveCssClass('ag-header-cell-sorted-asc', this.params.column.isSortAscending());
        this.addOrRemoveCssClass('ag-header-cell-sorted-desc', this.params.column.isSortDescending());
        this.addOrRemoveCssClass('ag-header-cell-sorted-none', this.params.column.isSortNone());
        if (this.eSortAsc) {
            this.eSortAsc.classList.toggle('ag-hidden', !this.params.column.isSortAscending());
        }
        if (this.eSortDesc) {
            this.eSortDesc.classList.toggle('ag-hidden', !this.params.column.isSortDescending());
        }
        if (this.eSortNone) {
            const alwaysHideNoSort = !this.params.column.getColDef().unSortIcon && !this.gridOptionsWrapper.isUnSortIcon();
            this.eSortNone.classList.toggle('ag-hidden', alwaysHideNoSort || !this.params.column.isSortNone());
        }
    }
    // we listen here for global sort events, NOT column sort events, as we want to do this
    // when sorting has been set on all column (if we listened just for our col (where we
    // set the asc / desc icons) then it's possible other cols are yet to get their sorting state.
    setMultiSortOrder() {
        if (!this.eSortOrder) {
            return;
        }
        const col = this.params.column;
        const allColumnsWithSorting = this.sortController.getColumnsWithSortingOrdered();
        const indexThisCol = allColumnsWithSorting.indexOf(col);
        const moreThanOneColSorting = allColumnsWithSorting.length > 1;
        const showIndex = col.isSorting() && moreThanOneColSorting;
        setDisplayed(this.eSortOrder, showIndex);
        if (indexThisCol >= 0) {
            this.eSortOrder.innerHTML = (indexThisCol + 1).toString();
        }
        else {
            clearElement(this.eSortOrder);
        }
    }
    setupFilterIcon() {
        if (!this.eFilter) {
            return;
        }
        this.addManagedListener(this.params.column, Column.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.onFilterChanged();
    }
    onFilterChanged() {
        const filterPresent = this.params.column.isFilterActive();
        this.eFilter.classList.toggle('ag-hidden', !filterPresent);
    }
}
HeaderComp.TEMPLATE = `<div class="ag-cell-label-container" role="presentation">
            <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button" aria-hidden="true"></span>
            <div ref="eLabel" class="ag-header-cell-label" role="presentation">
                <span ref="eText" class="ag-header-cell-text"></span>
                <span ref="eFilter" class="ag-header-icon ag-header-label-icon ag-filter-icon" aria-hidden="true"></span>
                <span ref="eSortOrder" class="ag-header-icon ag-header-label-icon ag-sort-order" aria-hidden="true"></span>
                <span ref="eSortAsc" class="ag-header-icon ag-header-label-icon ag-sort-ascending-icon" aria-hidden="true"></span>
                <span ref="eSortDesc" class="ag-header-icon ag-header-label-icon ag-sort-descending-icon" aria-hidden="true"></span>
                <span ref="eSortNone" class="ag-header-icon ag-header-label-icon ag-sort-none-icon" aria-hidden="true"></span>
            </div>
        </div>`;
__decorate([
    Autowired('sortController')
], HeaderComp.prototype, "sortController", void 0);
__decorate([
    Autowired('menuFactory')
], HeaderComp.prototype, "menuFactory", void 0);
__decorate([
    RefSelector('eFilter')
], HeaderComp.prototype, "eFilter", void 0);
__decorate([
    RefSelector('eSortAsc')
], HeaderComp.prototype, "eSortAsc", void 0);
__decorate([
    RefSelector('eSortDesc')
], HeaderComp.prototype, "eSortDesc", void 0);
__decorate([
    RefSelector('eSortNone')
], HeaderComp.prototype, "eSortNone", void 0);
__decorate([
    RefSelector('eSortOrder')
], HeaderComp.prototype, "eSortOrder", void 0);
__decorate([
    RefSelector('eMenu')
], HeaderComp.prototype, "eMenu", void 0);
__decorate([
    RefSelector('eLabel')
], HeaderComp.prototype, "eLabel", void 0);
__decorate([
    RefSelector('eText')
], HeaderComp.prototype, "eText", void 0);
