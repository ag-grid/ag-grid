/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
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
import { Autowired } from "../../../context/context";
import { Column } from "../../../entities/column";
import { firstExistingValue } from "../../../utils/array";
import { isIOSUserAgent } from "../../../utils/browser";
import { removeFromParent } from "../../../utils/dom";
import { exists } from "../../../utils/generic";
import { createIconNoSpan } from "../../../utils/icon";
import { escapeString } from "../../../utils/string";
import { Component } from "../../../widgets/component";
import { RefSelector } from "../../../widgets/componentAnnotations";
import { TouchListener } from "../../../widgets/touchListener";
import { SortIndicatorComp } from "./sortIndicatorComp";
import { Events } from "../../../eventKeys";
var HeaderComp = /** @class */ (function (_super) {
    __extends(HeaderComp, _super);
    function HeaderComp() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.lastMovingChanged = 0;
        return _this;
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    HeaderComp.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    HeaderComp.prototype.refresh = function (params) {
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
    };
    HeaderComp.prototype.workOutTemplate = function () {
        var template = firstExistingValue(this.params.template, HeaderComp.TEMPLATE);
        // take account of any newlines & whitespace before/after the actual template
        template = template && template.trim ? template.trim() : template;
        return template;
    };
    HeaderComp.prototype.init = function (params) {
        this.params = params;
        this.currentTemplate = this.workOutTemplate();
        this.setTemplate(this.currentTemplate);
        this.setupTap();
        this.setupIcons(params.column);
        this.setMenu();
        this.setupSort();
        this.setupFilterIcon();
        this.setDisplayName(params);
    };
    HeaderComp.prototype.setDisplayName = function (params) {
        if (this.currentDisplayName != params.displayName) {
            this.currentDisplayName = params.displayName;
            var displayNameSanitised = escapeString(this.currentDisplayName);
            if (this.eText) {
                this.eText.innerHTML = displayNameSanitised;
            }
        }
    };
    HeaderComp.prototype.setupIcons = function (column) {
        this.addInIcon('menu', this.eMenu, column);
        this.addInIcon('filter', this.eFilter, column);
    };
    HeaderComp.prototype.addInIcon = function (iconName, eParent, column) {
        if (eParent == null) {
            return;
        }
        var eIcon = createIconNoSpan(iconName, this.gridOptionsWrapper, column);
        if (eIcon) {
            eParent.appendChild(eIcon);
        }
    };
    HeaderComp.prototype.setupTap = function () {
        var _this = this;
        var options = this.gridOptionsWrapper;
        if (options.isSuppressTouch()) {
            return;
        }
        var touchListener = new TouchListener(this.getGui(), true);
        var suppressMenuHide = options.isSuppressMenuHide();
        var tapMenuButton = suppressMenuHide && exists(this.eMenu);
        var menuTouchListener = tapMenuButton ? new TouchListener(this.eMenu, true) : touchListener;
        if (this.params.enableMenu) {
            var eventType = tapMenuButton ? 'EVENT_TAP' : 'EVENT_LONG_TAP';
            var showMenuFn = function (event) {
                options.getApi().showColumnMenuAfterMouseClick(_this.params.column, event.touchStart);
            };
            this.addManagedListener(menuTouchListener, TouchListener[eventType], showMenuFn);
        }
        if (this.params.enableSorting) {
            var tapListener = function (event) {
                var target = event.touchStart.target;
                // When suppressMenuHide is true, a tap on the menu icon will bubble up
                // to the header container, in that case we should not sort
                if (suppressMenuHide && _this.eMenu.contains(target)) {
                    return;
                }
                _this.sortController.progressSort(_this.params.column, false, "uiColumnSorted");
            };
            this.addManagedListener(touchListener, TouchListener.EVENT_TAP, tapListener);
        }
        // if tapMenuButton is true `touchListener` and `menuTouchListener` are different
        // so we need to make sure to destroy both listeners here
        this.addDestroyFunc(function () { return touchListener.destroy(); });
        if (tapMenuButton) {
            this.addDestroyFunc(function () { return menuTouchListener.destroy(); });
        }
    };
    HeaderComp.prototype.workOutShowMenu = function () {
        // we don't show the menu if on an iPad/iPhone, as the user cannot have a pointer device/
        // However if suppressMenuHide is set to true the menu will be displayed alwasys, so it's ok
        // to show it on iPad in this case (as hover isn't needed). If suppressMenuHide
        // is false (default) user will need to use longpress to display the menu.
        var menuHides = !this.gridOptionsWrapper.isSuppressMenuHide();
        var onIpadAndMenuHides = isIOSUserAgent() && menuHides;
        var showMenu = this.params.enableMenu && !onIpadAndMenuHides;
        return showMenu;
    };
    HeaderComp.prototype.setMenu = function () {
        var _this = this;
        // if no menu provided in template, do nothing
        if (!this.eMenu) {
            return;
        }
        this.currentShowMenu = this.workOutShowMenu();
        if (!this.currentShowMenu) {
            removeFromParent(this.eMenu);
            return;
        }
        var suppressMenuHide = this.gridOptionsWrapper.isSuppressMenuHide();
        this.addManagedListener(this.eMenu, 'click', function () { return _this.showMenu(_this.eMenu); });
        this.eMenu.classList.toggle('ag-header-menu-always-show', suppressMenuHide);
    };
    HeaderComp.prototype.showMenu = function (eventSource) {
        if (!eventSource) {
            eventSource = this.eMenu;
        }
        this.menuFactory.showMenuAfterButtonClick(this.params.column, eventSource, 'columnMenu');
    };
    HeaderComp.prototype.workOutSort = function () {
        return this.params.enableSorting;
    };
    HeaderComp.prototype.setupSort = function () {
        var _this = this;
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
        var sortUsingCtrl = this.gridOptionsWrapper.isMultiSortKeyCtrl();
        // keep track of last time the moving changed flag was set
        this.addManagedListener(this.params.column, Column.EVENT_MOVING_CHANGED, function () {
            _this.lastMovingChanged = new Date().getTime();
        });
        // add the event on the header, so when clicked, we do sorting
        if (this.eLabel) {
            this.addManagedListener(this.eLabel, 'click', function (event) {
                // sometimes when moving a column via dragging, this was also firing a clicked event.
                // here is issue raised by user: https://ag-grid.zendesk.com/agent/tickets/1076
                // this check stops sort if a) column is moving or b) column moved less than 200ms ago (so caters for race condition)
                var moving = _this.params.column.isMoving();
                var nowTime = new Date().getTime();
                // typically there is <2ms if moving flag was set recently, as it would be done in same VM turn
                var movedRecently = (nowTime - _this.lastMovingChanged) < 50;
                var columnMoving = moving || movedRecently;
                if (!columnMoving) {
                    var multiSort = sortUsingCtrl ? (event.ctrlKey || event.metaKey) : event.shiftKey;
                    _this.params.progressSort(multiSort);
                }
            });
        }
        var onSortingChanged = function () {
            var _a;
            _this.addOrRemoveCssClass('ag-header-cell-sorted-asc', _this.params.column.isSortAscending());
            _this.addOrRemoveCssClass('ag-header-cell-sorted-desc', _this.params.column.isSortDescending());
            _this.addOrRemoveCssClass('ag-header-cell-sorted-none', _this.params.column.isSortNone());
            if (_this.params.column.getColDef().showRowGroup) {
                var sourceColumns = _this.columnModel.getSourceColumnsForGroupColumn(_this.params.column);
                // this == is intentional, as it allows null and undefined to match, which are both unsorted states
                var sortDirectionsMatch = (_a = sourceColumns) === null || _a === void 0 ? void 0 : _a.every(function (sourceCol) { return _this.params.column.getSort() == sourceCol.getSort(); });
                var isMultiSorting = !sortDirectionsMatch;
                _this.addOrRemoveCssClass('ag-header-cell-sorted-mixed', isMultiSorting);
            }
        };
        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, onSortingChanged);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, onSortingChanged);
    };
    HeaderComp.prototype.setupFilterIcon = function () {
        if (!this.eFilter) {
            return;
        }
        this.addManagedListener(this.params.column, Column.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.onFilterChanged();
    };
    HeaderComp.prototype.onFilterChanged = function () {
        var filterPresent = this.params.column.isFilterActive();
        this.eFilter.classList.toggle('ag-hidden', !filterPresent);
    };
    HeaderComp.TEMPLATE = "<div class=\"ag-cell-label-container\" role=\"presentation\">\n            <span ref=\"eMenu\" class=\"ag-header-icon ag-header-cell-menu-button\" aria-hidden=\"true\"></span>\n            <div ref=\"eLabel\" class=\"ag-header-cell-label\" role=\"presentation\">\n                <span ref=\"eText\" class=\"ag-header-cell-text\"></span>\n                <span ref=\"eFilter\" class=\"ag-header-icon ag-header-label-icon ag-filter-icon\" aria-hidden=\"true\"></span>\n                <ag-sort-indicator ref=\"eSortIndicator\"></ag-sort-indicator>\n            </div>\n        </div>";
    __decorate([
        Autowired('sortController')
    ], HeaderComp.prototype, "sortController", void 0);
    __decorate([
        Autowired('menuFactory')
    ], HeaderComp.prototype, "menuFactory", void 0);
    __decorate([
        Autowired('columnModel')
    ], HeaderComp.prototype, "columnModel", void 0);
    __decorate([
        RefSelector('eFilter')
    ], HeaderComp.prototype, "eFilter", void 0);
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
    return HeaderComp;
}(Component));
export { HeaderComp };
