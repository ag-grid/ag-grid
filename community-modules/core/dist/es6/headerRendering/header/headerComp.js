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
import { Component } from "../../widgets/component";
import { Column } from "../../entities/column";
import { Autowired } from "../../context/context";
import { TouchListener } from "../../widgets/touchListener";
import { RefSelector } from "../../widgets/componentAnnotations";
import { Events } from "../../events";
import { _ } from "../../utils";
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
    HeaderComp.prototype.init = function (params) {
        var template = _.firstExistingValue(params.template, HeaderComp.TEMPLATE);
        // take account of any newlines & whitespace before/after the actual template
        template = template && template.trim ? template.trim() : template;
        this.setTemplate(template);
        this.params = params;
        this.setupTap();
        this.setupIcons(params.column);
        this.setupMenu();
        this.setupSort();
        this.setupFilterIcon();
        this.setupText(params.displayName);
    };
    HeaderComp.prototype.setupText = function (displayName) {
        var displayNameSanitised = _.escape(displayName);
        if (this.eText) {
            this.eText.innerHTML = displayNameSanitised;
        }
    };
    HeaderComp.prototype.setupIcons = function (column) {
        this.addInIcon('sortAscending', this.eSortAsc, column);
        this.addInIcon('sortDescending', this.eSortDesc, column);
        this.addInIcon('sortUnSort', this.eSortNone, column);
        this.addInIcon('menu', this.eMenu, column);
        this.addInIcon('filter', this.eFilter, column);
    };
    HeaderComp.prototype.addInIcon = function (iconName, eParent, column) {
        if (eParent == null) {
            return;
        }
        var eIcon = _.createIconNoSpan(iconName, this.gridOptionsWrapper, column);
        eParent.appendChild(eIcon);
    };
    HeaderComp.prototype.setupTap = function () {
        var _this = this;
        var options = this.gridOptionsWrapper;
        if (options.isSuppressTouch()) {
            return;
        }
        var touchListener = new TouchListener(this.getGui(), true);
        var suppressMenuHide = options.isSuppressMenuHide();
        var tapMenuButton = suppressMenuHide && _.exists(this.eMenu);
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
    HeaderComp.prototype.setupMenu = function () {
        var _this = this;
        // if no menu provided in template, do nothing
        if (!this.eMenu) {
            return;
        }
        // we don't show the menu if on an iPad/iPhone, as the user cannot have a pointer device
        // Note: If suppressMenuHide is set to true the menu will be displayed, and if suppressMenuHide
        // is false (default) user will need to use longpress to display the menu.
        var suppressMenuHide = this.gridOptionsWrapper.isSuppressMenuHide();
        var hideShowMenu = !this.params.enableMenu || (_.isIOSUserAgent() && !suppressMenuHide);
        if (hideShowMenu) {
            _.removeFromParent(this.eMenu);
            return;
        }
        this.addManagedListener(this.eMenu, 'click', function () { return _this.showMenu(_this.eMenu); });
        if (!suppressMenuHide) {
            this.eMenu.style.opacity = '0';
        }
        var style = this.eMenu.style;
        style.transition = 'opacity 0.2s, border 0.2s';
        style['-webkit-transition'] = 'opacity 0.2s, border 0.2s';
    };
    HeaderComp.prototype.setActiveParent = function (activeParent) {
        if (!this.gridOptionsWrapper.isSuppressMenuHide()) {
            this.eMenu.style.opacity = activeParent ? '1' : '0';
        }
    };
    HeaderComp.prototype.showMenu = function (eventSource) {
        if (!eventSource) {
            eventSource = this.eMenu;
        }
        this.menuFactory.showMenuAfterButtonClick(this.params.column, eventSource);
    };
    HeaderComp.prototype.removeSortIcons = function () {
        _.removeFromParent(this.eSortAsc);
        _.removeFromParent(this.eSortDesc);
        _.removeFromParent(this.eSortNone);
        _.removeFromParent(this.eSortOrder);
    };
    HeaderComp.prototype.setupSort = function () {
        var _this = this;
        var enableSorting = this.params.enableSorting;
        if (!enableSorting) {
            this.removeSortIcons();
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
        this.addManagedListener(this.params.column, Column.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.onSortChanged();
        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, this.setMultiSortOrder.bind(this));
        this.setMultiSortOrder();
    };
    HeaderComp.prototype.onSortChanged = function () {
        _.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-sorted-asc', this.params.column.isSortAscending());
        _.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-sorted-desc', this.params.column.isSortDescending());
        _.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-sorted-none', this.params.column.isSortNone());
        if (this.eSortAsc) {
            _.addOrRemoveCssClass(this.eSortAsc, 'ag-hidden', !this.params.column.isSortAscending());
        }
        if (this.eSortDesc) {
            _.addOrRemoveCssClass(this.eSortDesc, 'ag-hidden', !this.params.column.isSortDescending());
        }
        if (this.eSortNone) {
            var alwaysHideNoSort = !this.params.column.getColDef().unSortIcon && !this.gridOptionsWrapper.isUnSortIcon();
            _.addOrRemoveCssClass(this.eSortNone, 'ag-hidden', alwaysHideNoSort || !this.params.column.isSortNone());
        }
    };
    // we listen here for global sort events, NOT column sort events, as we want to do this
    // when sorting has been set on all column (if we listened just for our col (where we
    // set the asc / desc icons) then it's possible other cols are yet to get their sorting state.
    HeaderComp.prototype.setMultiSortOrder = function () {
        if (!this.eSortOrder) {
            return;
        }
        var col = this.params.column;
        var allColumnsWithSorting = this.sortController.getColumnsWithSortingOrdered();
        var indexThisCol = allColumnsWithSorting.indexOf(col);
        var moreThanOneColSorting = allColumnsWithSorting.length > 1;
        var showIndex = col.isSorting() && moreThanOneColSorting;
        _.setDisplayed(this.eSortOrder, showIndex);
        if (indexThisCol >= 0) {
            this.eSortOrder.innerHTML = (indexThisCol + 1).toString();
        }
        else {
            _.clearElement(this.eSortOrder);
        }
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
        _.addOrRemoveCssClass(this.eFilter, 'ag-hidden', !filterPresent);
    };
    HeaderComp.TEMPLATE = "<div class=\"ag-cell-label-container\">\n            <span ref=\"eMenu\" class=\"ag-header-icon ag-header-cell-menu-button\" aria-hidden=\"true\"></span>\n            <div ref=\"eLabel\" class=\"ag-header-cell-label\" role=\"presentation\" unselectable=\"on\">\n                <span ref=\"eText\" class=\"ag-header-cell-text\" role=\"columnheader\" unselectable=\"on\"></span>\n                <span ref=\"eFilter\" class=\"ag-header-icon ag-header-label-icon ag-filter-icon\" aria-hidden=\"true\"></span>\n                <span ref=\"eSortOrder\" class=\"ag-header-icon ag-header-label-icon ag-sort-order\" aria-hidden=\"true\"></span>\n                <span ref=\"eSortAsc\" class=\"ag-header-icon ag-header-label-icon ag-sort-ascending-icon\" aria-hidden=\"true\"></span>\n                <span ref=\"eSortDesc\" class=\"ag-header-icon ag-header-label-icon ag-sort-descending-icon\" aria-hidden=\"true\"></span>\n                <span ref=\"eSortNone\" class=\"ag-header-icon ag-header-label-icon ag-sort-none-icon\" aria-hidden=\"true\"></span>\n            </div>\n        </div>";
    __decorate([
        Autowired('gridOptionsWrapper')
    ], HeaderComp.prototype, "gridOptionsWrapper", void 0);
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
    return HeaderComp;
}(Component));
export { HeaderComp };
