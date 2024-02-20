var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired } from "../../../context/context.mjs";
import { Column } from "../../../entities/column.mjs";
import { removeFromParent, setDisplayed } from "../../../utils/dom.mjs";
import { exists } from "../../../utils/generic.mjs";
import { createIconNoSpan } from "../../../utils/icon.mjs";
import { escapeString } from "../../../utils/string.mjs";
import { Component } from "../../../widgets/component.mjs";
import { RefSelector } from "../../../widgets/componentAnnotations.mjs";
import { TouchListener } from "../../../widgets/touchListener.mjs";
import { SortIndicatorComp } from "./sortIndicatorComp.mjs";
import { Events } from "../../../eventKeys.mjs";
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
        if (this.shouldSuppressMenuHide() != this.currentSuppressMenuHide) {
            return false;
        }
        this.setDisplayName(params);
        return true;
    }
    workOutTemplate() {
        var _a;
        let template = (_a = this.params.template) !== null && _a !== void 0 ? _a : HeaderComp.TEMPLATE;
        // take account of any newlines & whitespace before/after the actual template
        template = template && template.trim ? template.trim() : template;
        return template;
    }
    init(params) {
        this.params = params;
        this.currentTemplate = this.workOutTemplate();
        this.setTemplate(this.currentTemplate);
        this.setupTap();
        this.setMenu();
        this.setupSort();
        this.setupFilterIcon();
        this.setupFilterButton();
        this.setDisplayName(params);
    }
    setDisplayName(params) {
        if (this.currentDisplayName != params.displayName) {
            this.currentDisplayName = params.displayName;
            const displayNameSanitised = escapeString(this.currentDisplayName, true);
            if (this.eText) {
                this.eText.textContent = displayNameSanitised;
            }
        }
    }
    addInIcon(iconName, eParent, column) {
        if (eParent == null) {
            return;
        }
        const eIcon = createIconNoSpan(iconName, this.gridOptionsService, column);
        if (eIcon) {
            eParent.appendChild(eIcon);
        }
    }
    setupTap() {
        const { gridOptionsService } = this;
        if (gridOptionsService.get('suppressTouch')) {
            return;
        }
        const touchListener = new TouchListener(this.getGui(), true);
        const suppressMenuHide = this.shouldSuppressMenuHide();
        const tapMenuButton = suppressMenuHide && exists(this.eMenu);
        const menuTouchListener = tapMenuButton ? new TouchListener(this.eMenu, true) : touchListener;
        if (this.params.enableMenu) {
            const eventType = tapMenuButton ? 'EVENT_TAP' : 'EVENT_LONG_TAP';
            const showMenuFn = (event) => this.params.showColumnMenuAfterMouseClick(event.touchStart);
            this.addManagedListener(menuTouchListener, TouchListener[eventType], showMenuFn);
        }
        if (this.params.enableSorting) {
            const tapListener = (event) => {
                var _a, _b;
                const target = event.touchStart.target;
                // When suppressMenuHide is true, a tap on the menu icon or filter button will bubble up
                // to the header container, in that case we should not sort
                if (suppressMenuHide && (((_a = this.eMenu) === null || _a === void 0 ? void 0 : _a.contains(target)) || ((_b = this.eFilterButton) === null || _b === void 0 ? void 0 : _b.contains(target)))) {
                    return;
                }
                this.sortController.progressSort(this.params.column, false, "uiColumnSorted");
            };
            this.addManagedListener(touchListener, TouchListener.EVENT_TAP, tapListener);
        }
        if (this.params.enableFilterButton) {
            const filterButtonTouchListener = new TouchListener(this.eFilterButton, true);
            this.addManagedListener(filterButtonTouchListener, 'tap', () => this.params.showFilter(this.eFilterButton));
            this.addDestroyFunc(() => filterButtonTouchListener.destroy());
        }
        // if tapMenuButton is true `touchListener` and `menuTouchListener` are different
        // so we need to make sure to destroy both listeners here
        this.addDestroyFunc(() => touchListener.destroy());
        if (tapMenuButton) {
            this.addDestroyFunc(() => menuTouchListener.destroy());
        }
    }
    workOutShowMenu() {
        return this.params.enableMenu && this.menuService.isHeaderMenuButtonEnabled();
    }
    shouldSuppressMenuHide() {
        return this.menuService.isHeaderMenuButtonAlwaysShowEnabled();
    }
    setMenu() {
        // if no menu provided in template, do nothing
        if (!this.eMenu) {
            return;
        }
        this.currentShowMenu = this.workOutShowMenu();
        if (!this.currentShowMenu) {
            removeFromParent(this.eMenu);
            this.eMenu = undefined;
            return;
        }
        const isLegacyMenu = this.menuService.isLegacyMenuEnabled();
        this.addInIcon(isLegacyMenu ? 'menu' : 'menuAlt', this.eMenu, this.params.column);
        this.eMenu.classList.toggle('ag-header-menu-icon', !isLegacyMenu);
        this.currentSuppressMenuHide = this.shouldSuppressMenuHide();
        this.addManagedListener(this.eMenu, 'click', () => this.params.showColumnMenu(this.eMenu));
        this.eMenu.classList.toggle('ag-header-menu-always-show', this.currentSuppressMenuHide);
    }
    onMenuKeyboardShortcut(isFilterShortcut) {
        var _a, _b, _c, _d;
        const { column } = this.params;
        const isLegacyMenuEnabled = this.menuService.isLegacyMenuEnabled();
        if (isFilterShortcut && !isLegacyMenuEnabled) {
            if (this.menuService.isFilterMenuInHeaderEnabled(column)) {
                this.params.showFilter((_b = (_a = this.eFilterButton) !== null && _a !== void 0 ? _a : this.eMenu) !== null && _b !== void 0 ? _b : this.getGui());
                return true;
            }
        }
        else if (this.params.enableMenu) {
            this.params.showColumnMenu((_d = (_c = this.eMenu) !== null && _c !== void 0 ? _c : this.eFilterButton) !== null && _d !== void 0 ? _d : this.getGui());
            return true;
        }
        return false;
    }
    workOutSort() {
        return this.params.enableSorting;
    }
    setupSort() {
        this.currentSort = this.params.enableSorting;
        // eSortIndicator will not be present when customers provided custom header
        // templates, in that case, we need to look for provided sort elements and
        // manually create eSortIndicator.
        if (!this.eSortIndicator) {
            this.eSortIndicator = this.context.createBean(new SortIndicatorComp(true));
            this.eSortIndicator.attachCustomElements(this.eSortOrder, this.eSortAsc, this.eSortDesc, this.eSortMixed, this.eSortNone);
        }
        this.eSortIndicator.setupSort(this.params.column);
        // we set up the indicator prior to the check for whether this column is sortable, as it allows the indicator to
        // set up the multi sort indicator which can appear irrelevant of whether this column can itself be sorted.
        // this can occur in the case of a non-sortable group display column.
        if (!this.currentSort) {
            return;
        }
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
                    const sortUsingCtrl = this.gridOptionsService.get('multiSortKey') === 'ctrl';
                    const multiSort = sortUsingCtrl ? (event.ctrlKey || event.metaKey) : event.shiftKey;
                    this.params.progressSort(multiSort);
                }
            });
        }
        const onSortingChanged = () => {
            this.addOrRemoveCssClass('ag-header-cell-sorted-asc', this.params.column.isSortAscending());
            this.addOrRemoveCssClass('ag-header-cell-sorted-desc', this.params.column.isSortDescending());
            this.addOrRemoveCssClass('ag-header-cell-sorted-none', this.params.column.isSortNone());
            if (this.params.column.getColDef().showRowGroup) {
                const sourceColumns = this.columnModel.getSourceColumnsForGroupColumn(this.params.column);
                // this == is intentional, as it allows null and undefined to match, which are both unsorted states
                const sortDirectionsMatch = sourceColumns === null || sourceColumns === void 0 ? void 0 : sourceColumns.every(sourceCol => this.params.column.getSort() == sourceCol.getSort());
                const isMultiSorting = !sortDirectionsMatch;
                this.addOrRemoveCssClass('ag-header-cell-sorted-mixed', isMultiSorting);
            }
        };
        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, onSortingChanged);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, onSortingChanged);
    }
    setupFilterIcon() {
        if (!this.eFilter) {
            return;
        }
        this.configureFilter(this.params.enableFilterIcon, this.eFilter, this.onFilterChangedIcon.bind(this));
    }
    setupFilterButton() {
        if (!this.eFilterButton) {
            return;
        }
        const configured = this.configureFilter(this.params.enableFilterButton, this.eFilterButton, this.onFilterChangedButton.bind(this));
        if (configured) {
            this.addManagedListener(this.eFilterButton, 'click', () => this.params.showFilter(this.eFilterButton));
        }
        else {
            this.eFilterButton = undefined;
        }
    }
    configureFilter(enabled, element, filterChangedCallback) {
        if (!enabled) {
            removeFromParent(element);
            return false;
        }
        const { column } = this.params;
        this.addInIcon('filter', element, column);
        this.addManagedListener(column, Column.EVENT_FILTER_CHANGED, filterChangedCallback);
        filterChangedCallback();
        return true;
    }
    onFilterChangedIcon() {
        const filterPresent = this.params.column.isFilterActive();
        setDisplayed(this.eFilter, filterPresent, { skipAriaHidden: true });
    }
    onFilterChangedButton() {
        const filterPresent = this.params.column.isFilterActive();
        this.eFilterButton.classList.toggle('ag-filter-active', filterPresent);
    }
    getAnchorElementForMenu(isFilter) {
        var _a, _b, _c, _d;
        if (isFilter) {
            return (_b = (_a = this.eFilterButton) !== null && _a !== void 0 ? _a : this.eMenu) !== null && _b !== void 0 ? _b : this.getGui();
        }
        return (_d = (_c = this.eMenu) !== null && _c !== void 0 ? _c : this.eFilterButton) !== null && _d !== void 0 ? _d : this.getGui();
    }
}
HeaderComp.TEMPLATE = `<div class="ag-cell-label-container" role="presentation">
            <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button" aria-hidden="true"></span>
            <span ref="eFilterButton" class="ag-header-icon ag-header-cell-filter-button" aria-hidden="true"></span>
            <div ref="eLabel" class="ag-header-cell-label" role="presentation">
                <span ref="eText" class="ag-header-cell-text"></span>
                <span ref="eFilter" class="ag-header-icon ag-header-label-icon ag-filter-icon" aria-hidden="true"></span>
                <ag-sort-indicator ref="eSortIndicator"></ag-sort-indicator>
            </div>
        </div>`;
__decorate([
    Autowired('sortController')
], HeaderComp.prototype, "sortController", void 0);
__decorate([
    Autowired('menuService')
], HeaderComp.prototype, "menuService", void 0);
__decorate([
    Autowired('columnModel')
], HeaderComp.prototype, "columnModel", void 0);
__decorate([
    RefSelector('eFilter')
], HeaderComp.prototype, "eFilter", void 0);
__decorate([
    RefSelector('eFilterButton')
], HeaderComp.prototype, "eFilterButton", void 0);
__decorate([
    RefSelector('eSortIndicator')
], HeaderComp.prototype, "eSortIndicator", void 0);
__decorate([
    RefSelector('eMenu')
], HeaderComp.prototype, "eMenu", void 0);
__decorate([
    RefSelector('eLabel')
], HeaderComp.prototype, "eLabel", void 0);
__decorate([
    RefSelector('eText')
], HeaderComp.prototype, "eText", void 0);
__decorate([
    RefSelector('eSortOrder')
], HeaderComp.prototype, "eSortOrder", void 0);
__decorate([
    RefSelector('eSortAsc')
], HeaderComp.prototype, "eSortAsc", void 0);
__decorate([
    RefSelector('eSortDesc')
], HeaderComp.prototype, "eSortDesc", void 0);
__decorate([
    RefSelector('eSortMixed')
], HeaderComp.prototype, "eSortMixed", void 0);
__decorate([
    RefSelector('eSortNone')
], HeaderComp.prototype, "eSortNone", void 0);
