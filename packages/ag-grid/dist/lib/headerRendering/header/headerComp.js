/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v18.1.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("../../widgets/component");
var column_1 = require("../../entities/column");
var utils_1 = require("../../utils");
var context_1 = require("../../context/context");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var sortController_1 = require("../../sortController");
var touchListener_1 = require("../../widgets/touchListener");
var eventService_1 = require("../../eventService");
var componentAnnotations_1 = require("../../widgets/componentAnnotations");
var events_1 = require("../../events");
var HeaderComp = (function (_super) {
    __extends(HeaderComp, _super);
    function HeaderComp() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.lastMovingChanged = 0;
        return _this;
    }
    HeaderComp.prototype.init = function (params) {
        var template = utils_1.Utils.firstExistingValue(params.template, HeaderComp.TEMPLATE);
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
        if (this.eText) {
            this.eText.innerHTML = displayName;
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
        if (eParent == null)
            return;
        var eIcon = utils_1.Utils.createIconNoSpan(iconName, this.gridOptionsWrapper, column);
        eParent.appendChild(eIcon);
    };
    HeaderComp.prototype.setupTap = function () {
        var _this = this;
        if (this.gridOptionsWrapper.isSuppressTouch()) {
            return;
        }
        var touchListener = new touchListener_1.TouchListener(this.getGui());
        if (this.params.enableMenu) {
            var longTapListener = function (event) {
                _this.gridOptionsWrapper.getApi().showColumnMenuAfterMouseClick(_this.params.column, event.touchStart);
            };
            this.addDestroyableEventListener(touchListener, touchListener_1.TouchListener.EVENT_LONG_TAP, longTapListener);
        }
        if (this.params.enableSorting) {
            var tapListener = function () {
                _this.sortController.progressSort(_this.params.column, false, "uiColumnSorted");
            };
            this.addDestroyableEventListener(touchListener, touchListener_1.TouchListener.EVENT_TAP, tapListener);
        }
        this.addDestroyFunc(function () { return touchListener.destroy(); });
    };
    HeaderComp.prototype.setupMenu = function () {
        var _this = this;
        // if no menu provided in template, do nothing
        if (!this.eMenu) {
            return;
        }
        // we don't show the menu if on an ipad, as the user cannot have a mouse on the ipad, so
        // makes no sense. instead the user must long-tap if on an ipad.
        var dontShowMenu = !this.params.enableMenu || utils_1.Utils.isUserAgentIPad();
        if (dontShowMenu) {
            utils_1.Utils.removeFromParent(this.eMenu);
            return;
        }
        this.eMenu.addEventListener('click', function () { return _this.showMenu(_this.eMenu); });
        if (!this.gridOptionsWrapper.isSuppressMenuHide()) {
            this.eMenu.style.opacity = '0';
            this.addGuiEventListener('mouseover', function () {
                _this.eMenu.style.opacity = '1';
            });
            this.addGuiEventListener('mouseout', function () {
                _this.eMenu.style.opacity = '0';
            });
        }
        var style = this.eMenu.style;
        style['transition'] = 'opacity 0.2s, border 0.2s';
        style['-webkit-transition'] = 'opacity 0.2s, border 0.2s';
    };
    HeaderComp.prototype.showMenu = function (eventSource) {
        this.menuFactory.showMenuAfterButtonClick(this.params.column, eventSource);
    };
    HeaderComp.prototype.removeSortIcons = function () {
        utils_1.Utils.removeFromParent(this.eSortAsc);
        utils_1.Utils.removeFromParent(this.eSortDesc);
        utils_1.Utils.removeFromParent(this.eSortNone);
        utils_1.Utils.removeFromParent(this.eSortOrder);
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
        this.addDestroyableEventListener(this.params.column, column_1.Column.EVENT_MOVING_CHANGED, function () {
            _this.lastMovingChanged = new Date().getTime();
        });
        // add the event on the header, so when clicked, we do sorting
        if (this.eLabel) {
            this.addDestroyableEventListener(this.eLabel, 'click', function (event) {
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
                else {
                    console.log("kipping sort cos of moving " + _this.lastMovingChanged);
                }
            });
        }
        this.addDestroyableEventListener(this.params.column, column_1.Column.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.onSortChanged();
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_SORT_CHANGED, this.setMultiSortOrder.bind(this));
        this.setMultiSortOrder();
    };
    HeaderComp.prototype.onSortChanged = function () {
        utils_1.Utils.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-sorted-asc', this.params.column.isSortAscending());
        utils_1.Utils.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-sorted-desc', this.params.column.isSortDescending());
        utils_1.Utils.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-sorted-none', this.params.column.isSortNone());
        if (this.eSortAsc) {
            utils_1.Utils.addOrRemoveCssClass(this.eSortAsc, 'ag-hidden', !this.params.column.isSortAscending());
        }
        if (this.eSortDesc) {
            utils_1.Utils.addOrRemoveCssClass(this.eSortDesc, 'ag-hidden', !this.params.column.isSortDescending());
        }
        if (this.eSortNone) {
            var alwaysHideNoSort = !this.params.column.getColDef().unSortIcon && !this.gridOptionsWrapper.isUnSortIcon();
            utils_1.Utils.addOrRemoveCssClass(this.eSortNone, 'ag-hidden', alwaysHideNoSort || !this.params.column.isSortNone());
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
        utils_1.Utils.setVisible(this.eSortOrder, showIndex);
        if (indexThisCol >= 0) {
            this.eSortOrder.innerHTML = (indexThisCol + 1).toString();
        }
        else {
            this.eSortOrder.innerHTML = '';
        }
    };
    HeaderComp.prototype.setupFilterIcon = function () {
        if (!this.eFilter) {
            return;
        }
        this.addDestroyableEventListener(this.params.column, column_1.Column.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.onFilterChanged();
    };
    HeaderComp.prototype.onFilterChanged = function () {
        var filterPresent = this.params.column.isFilterActive();
        utils_1.Utils.addOrRemoveCssClass(this.eFilter, 'ag-hidden', !filterPresent);
    };
    HeaderComp.TEMPLATE = '<div class="ag-cell-label-container" role="presentation">' +
        '  <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button" aria-hidden="true"></span>' +
        '  <div ref="eLabel" class="ag-header-cell-label" role="presentation">' +
        '    <span ref="eText" class="ag-header-cell-text" role="columnheader"></span>' +
        '    <span ref="eFilter" class="ag-header-icon ag-filter-icon" aria-hidden="true"></span>' +
        '    <span ref="eSortOrder" class="ag-header-icon ag-sort-order" aria-hidden="true"></span>' +
        '    <span ref="eSortAsc" class="ag-header-icon ag-sort-ascending-icon" aria-hidden="true"></span>' +
        '    <span ref="eSortDesc" class="ag-header-icon ag-sort-descending-icon" aria-hidden="true"></span>' +
        '    <span ref="eSortNone" class="ag-header-icon ag-sort-none-icon" aria-hidden="true"></span>' +
        '  </div>' +
        '</div>';
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], HeaderComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('sortController'),
        __metadata("design:type", sortController_1.SortController)
    ], HeaderComp.prototype, "sortController", void 0);
    __decorate([
        context_1.Autowired('menuFactory'),
        __metadata("design:type", Object)
    ], HeaderComp.prototype, "menuFactory", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], HeaderComp.prototype, "eventService", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eFilter'),
        __metadata("design:type", HTMLElement)
    ], HeaderComp.prototype, "eFilter", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eSortAsc'),
        __metadata("design:type", HTMLElement)
    ], HeaderComp.prototype, "eSortAsc", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eSortDesc'),
        __metadata("design:type", HTMLElement)
    ], HeaderComp.prototype, "eSortDesc", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eSortNone'),
        __metadata("design:type", HTMLElement)
    ], HeaderComp.prototype, "eSortNone", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eSortOrder'),
        __metadata("design:type", HTMLElement)
    ], HeaderComp.prototype, "eSortOrder", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eMenu'),
        __metadata("design:type", HTMLElement)
    ], HeaderComp.prototype, "eMenu", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eLabel'),
        __metadata("design:type", HTMLElement)
    ], HeaderComp.prototype, "eLabel", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eText'),
        __metadata("design:type", HTMLElement)
    ], HeaderComp.prototype, "eText", void 0);
    return HeaderComp;
}(component_1.Component));
exports.HeaderComp = HeaderComp;
