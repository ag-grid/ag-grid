/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v26.2.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var keyCode_1 = require("../../../constants/keyCode");
var context_1 = require("../../../context/context");
var dragAndDropService_1 = require("../../../dragAndDrop/dragAndDropService");
var column_1 = require("../../../entities/column");
var eventKeys_1 = require("../../../eventKeys");
var setLeftFeature_1 = require("../../../rendering/features/setLeftFeature");
var aria_1 = require("../../../utils/aria");
var managedFocusFeature_1 = require("../../../widgets/managedFocusFeature");
var tooltipFeature_1 = require("../../../widgets/tooltipFeature");
var abstractHeaderCellCtrl_1 = require("../abstractCell/abstractHeaderCellCtrl");
var cssClassApplier_1 = require("../cssClassApplier");
var hoverFeature_1 = require("../hoverFeature");
var resizeFeature_1 = require("./resizeFeature");
var selectAllFeature_1 = require("./selectAllFeature");
var HeaderCellCtrl = /** @class */ (function (_super) {
    __extends(HeaderCellCtrl, _super);
    function HeaderCellCtrl(column, parentRowCtrl) {
        var _this = _super.call(this, column, parentRowCtrl) || this;
        _this.refreshFunctions = [];
        _this.userHeaderClasses = new Set();
        _this.column = column;
        return _this;
    }
    HeaderCellCtrl.prototype.setComp = function (comp, eGui, eResize) {
        var _this = this;
        _super.prototype.setGui.call(this, eGui);
        this.comp = comp;
        this.colDefVersion = this.columnModel.getColDefVersion();
        this.updateState();
        this.setupWidth();
        this.setupMovingCss();
        this.setupMenuClass();
        this.setupSortableClass();
        this.addColumnHoverListener();
        this.setupFilterCss();
        this.setupColId();
        this.setupClassesFromColDef();
        this.setupTooltip();
        this.addActiveHeaderMouseListeners();
        this.setupSelectAll();
        this.setupUserComp();
        this.createManagedBean(new resizeFeature_1.ResizeFeature(this.getPinned(), this.column, eResize, comp, this));
        this.createManagedBean(new hoverFeature_1.HoverFeature([this.column], eGui));
        this.createManagedBean(new setLeftFeature_1.SetLeftFeature(this.column, eGui, this.beans));
        this.createManagedBean(new managedFocusFeature_1.ManagedFocusFeature(eGui, {
            shouldStopEventPropagation: function (e) { return _this.shouldStopEventPropagation(e); },
            onTabKeyDown: function () { return null; },
            handleKeyDown: this.handleKeyDown.bind(this),
            onFocusIn: this.onFocusIn.bind(this),
            onFocusOut: this.onFocusOut.bind(this)
        }));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_VALUE_CHANGED, this.onColumnValueChanged.bind(this));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onColumnRowGroupChanged.bind(this));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_PIVOT_CHANGED, this.onColumnPivotChanged.bind(this));
    };
    HeaderCellCtrl.prototype.setupUserComp = function () {
        var compDetails = this.lookupUserCompDetails();
        this.setCompDetails(compDetails);
    };
    HeaderCellCtrl.prototype.setCompDetails = function (compDetails) {
        this.userCompDetails = compDetails;
        this.comp.setUserCompDetails(compDetails);
    };
    HeaderCellCtrl.prototype.lookupUserCompDetails = function () {
        var params = this.createParams();
        var colDef = this.column.getColDef();
        return this.userComponentFactory.getHeaderCompDetails(colDef, params);
    };
    HeaderCellCtrl.prototype.createParams = function () {
        var _this = this;
        var colDef = this.column.getColDef();
        var params = {
            column: this.column,
            displayName: this.displayName,
            enableSorting: colDef.sortable,
            enableMenu: this.menuEnabled,
            showColumnMenu: function (source) {
                _this.gridApi.showColumnMenuAfterButtonClick(_this.column, source);
            },
            progressSort: function (multiSort) {
                _this.sortController.progressSort(_this.column, !!multiSort, "uiColumnSorted");
            },
            setSort: function (sort, multiSort) {
                _this.sortController.setSortForColumn(_this.column, sort, !!multiSort, "uiColumnSorted");
            },
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsWrapper.getContext(),
            eGridHeader: this.getGui()
        };
        return params;
    };
    HeaderCellCtrl.prototype.setupSelectAll = function () {
        this.selectAllFeature = this.createManagedBean(new selectAllFeature_1.SelectAllFeature(this.column));
        this.selectAllFeature.setComp(this.comp);
    };
    HeaderCellCtrl.prototype.getSelectAllGui = function () {
        return this.selectAllFeature.getCheckboxGui();
    };
    HeaderCellCtrl.prototype.handleKeyDown = function (e) {
        if (e.keyCode === keyCode_1.KeyCode.SPACE) {
            this.selectAllFeature.onSpaceKeyPressed(e);
        }
        if (e.keyCode === keyCode_1.KeyCode.ENTER) {
            this.onEnterKeyPressed(e);
        }
    };
    HeaderCellCtrl.prototype.onEnterKeyPressed = function (e) {
        /// THIS IS BAD - we are assuming the header is not a user provided comp
        var headerComp = this.comp.getUserCompInstance();
        if (!headerComp) {
            return;
        }
        if (e.ctrlKey || e.metaKey) {
            if (this.menuEnabled && headerComp.showMenu) {
                e.preventDefault();
                headerComp.showMenu();
            }
        }
        else if (this.sortable) {
            var multiSort = e.shiftKey;
            this.sortController.progressSort(this.column, multiSort, "uiColumnSorted");
        }
    };
    HeaderCellCtrl.prototype.isMenuEnabled = function () {
        return this.menuEnabled;
    };
    HeaderCellCtrl.prototype.onFocusIn = function (e) {
        if (!this.getGui().contains(e.relatedTarget)) {
            var rowIndex = this.getRowIndex();
            this.focusService.setFocusedHeader(rowIndex, this.column);
        }
        this.setActiveHeader(true);
    };
    HeaderCellCtrl.prototype.onFocusOut = function (e) {
        if (this.getGui().contains(e.relatedTarget)) {
            return;
        }
        this.setActiveHeader(false);
    };
    HeaderCellCtrl.prototype.setupTooltip = function () {
        var _this = this;
        var tooltipCtrl = {
            getColumn: function () { return _this.column; },
            getColDef: function () { return _this.column.getColDef(); },
            getGui: function () { return _this.eGui; },
            getLocation: function () { return 'header'; },
            getTooltipValue: function () {
                var res = _this.column.getColDef().headerTooltip;
                return res;
            },
        };
        var tooltipFeature = this.createManagedBean(new tooltipFeature_1.TooltipFeature(tooltipCtrl, this.beans));
        tooltipFeature.setComp(this.comp);
        this.refreshFunctions.push(function () { return tooltipFeature.refreshToolTip(); });
    };
    HeaderCellCtrl.prototype.setupClassesFromColDef = function () {
        var _this = this;
        var refreshHeaderClasses = function () {
            var colDef = _this.column.getColDef();
            var goa = _this.gridOptionsWrapper;
            var classes = cssClassApplier_1.CssClassApplier.getHeaderClassesFromColDef(colDef, goa, _this.column, null);
            var oldClasses = _this.userHeaderClasses;
            _this.userHeaderClasses = new Set(classes);
            classes.forEach(function (c) {
                if (oldClasses.has(c)) {
                    // class already added, no need to apply it, but remove from old set
                    oldClasses.delete(c);
                }
                else {
                    // class new since last time, so apply it
                    _this.comp.addOrRemoveCssClass(c, true);
                }
            });
            // now old set only has classes that were applied last time, but not this time, so remove them
            oldClasses.forEach(function (c) { return _this.comp.addOrRemoveCssClass(c, false); });
        };
        this.refreshFunctions.push(refreshHeaderClasses);
        refreshHeaderClasses();
    };
    HeaderCellCtrl.prototype.getGui = function () {
        return this.eGui;
    };
    HeaderCellCtrl.prototype.setDragSource = function (eSource) {
        var _this = this;
        this.dragSourceElement = eSource;
        this.removeDragSource();
        if (!eSource) {
            return;
        }
        if (!this.draggable) {
            return;
        }
        this.moveDragSource = {
            type: dragAndDropService_1.DragSourceType.HeaderCell,
            eElement: eSource,
            defaultIconName: dragAndDropService_1.DragAndDropService.ICON_HIDE,
            getDragItem: function () { return _this.createDragItem(); },
            dragItemName: this.displayName,
            onDragStarted: function () { return _this.column.setMoving(true, "uiColumnMoved"); },
            onDragStopped: function () { return _this.column.setMoving(false, "uiColumnMoved"); }
        };
        this.dragAndDropService.addDragSource(this.moveDragSource, true);
    };
    HeaderCellCtrl.prototype.createDragItem = function () {
        var visibleState = {};
        visibleState[this.column.getId()] = this.column.isVisible();
        return {
            columns: [this.column],
            visibleState: visibleState
        };
    };
    HeaderCellCtrl.prototype.removeDragSource = function () {
        if (this.moveDragSource) {
            this.dragAndDropService.removeDragSource(this.moveDragSource);
            this.moveDragSource = undefined;
        }
    };
    HeaderCellCtrl.prototype.onNewColumnsLoaded = function () {
        var colDefVersionNow = this.columnModel.getColDefVersion();
        if (colDefVersionNow != this.colDefVersion) {
            this.colDefVersion = colDefVersionNow;
            this.refresh();
        }
    };
    HeaderCellCtrl.prototype.updateState = function () {
        var colDef = this.column.getColDef();
        this.menuEnabled = this.menuFactory.isMenuEnabled(this.column) && !colDef.suppressMenu;
        this.sortable = colDef.sortable;
        this.displayName = this.calculateDisplayName();
        this.draggable = this.workOutDraggable();
    };
    HeaderCellCtrl.prototype.addRefreshFunction = function (func) {
        this.refreshFunctions.push(func);
    };
    HeaderCellCtrl.prototype.refresh = function () {
        this.updateState();
        this.refreshHeaderComp();
        this.refreshFunctions.forEach(function (f) { return f(); });
    };
    HeaderCellCtrl.prototype.refreshHeaderComp = function () {
        var newCompDetails = this.lookupUserCompDetails();
        var compInstance = this.comp.getUserCompInstance();
        // only try refresh if old comp exists adn it is the correct type
        var attemptRefresh = compInstance != null && this.userCompDetails.componentClass == newCompDetails.componentClass;
        var headerCompRefreshed = attemptRefresh ? this.attemptHeaderCompRefresh(newCompDetails.params) : false;
        if (headerCompRefreshed) {
            // we do this as a refresh happens after colDefs change, and it's possible the column has had it's
            // draggable property toggled. no need to call this if not refreshing, as setDragSource is done
            // as part of appendHeaderComp
            this.setDragSource(this.dragSourceElement);
        }
        else {
            this.setCompDetails(newCompDetails);
        }
    };
    HeaderCellCtrl.prototype.attemptHeaderCompRefresh = function (params) {
        var headerComp = this.comp.getUserCompInstance();
        if (!headerComp) {
            return false;
        }
        // if no refresh method, then we want to replace the headerComp
        if (!headerComp.refresh) {
            return false;
        }
        var res = headerComp.refresh(params);
        return res;
    };
    HeaderCellCtrl.prototype.calculateDisplayName = function () {
        return this.columnModel.getDisplayNameForColumn(this.column, 'header', true);
    };
    HeaderCellCtrl.prototype.checkDisplayName = function () {
        // display name can change if aggFunc different, eg sum(Gold) is now max(Gold)
        if (this.displayName !== this.calculateDisplayName()) {
            this.refresh();
        }
    };
    HeaderCellCtrl.prototype.workOutDraggable = function () {
        var colDef = this.column.getColDef();
        var isSuppressMovableColumns = this.gridOptionsWrapper.isSuppressMovableColumns();
        var colCanMove = !isSuppressMovableColumns && !colDef.suppressMovable && !colDef.lockPosition;
        // we should still be allowed drag the column, even if it can't be moved, if the column
        // can be dragged to a rowGroup or pivot drop zone
        return !!colCanMove || !!colDef.enableRowGroup || !!colDef.enablePivot;
    };
    HeaderCellCtrl.prototype.onColumnRowGroupChanged = function () {
        this.checkDisplayName();
    };
    HeaderCellCtrl.prototype.onColumnPivotChanged = function () {
        this.checkDisplayName();
    };
    HeaderCellCtrl.prototype.onColumnValueChanged = function () {
        this.checkDisplayName();
    };
    HeaderCellCtrl.prototype.setupWidth = function () {
        var _this = this;
        var listener = function () {
            _this.comp.setWidth(_this.column.getActualWidth() + 'px');
        };
        this.addManagedListener(this.column, column_1.Column.EVENT_WIDTH_CHANGED, listener);
        listener();
    };
    HeaderCellCtrl.prototype.setupMovingCss = function () {
        var _this = this;
        var listener = function () {
            // this is what makes the header go dark when it is been moved (gives impression to
            // user that the column was picked up).
            _this.comp.addOrRemoveCssClass('ag-header-cell-moving', _this.column.isMoving());
        };
        this.addManagedListener(this.column, column_1.Column.EVENT_MOVING_CHANGED, listener);
        listener();
    };
    HeaderCellCtrl.prototype.setupMenuClass = function () {
        var _this = this;
        var listener = function () {
            _this.comp.addOrRemoveCssClass('ag-column-menu-visible', _this.column.isMenuVisible());
        };
        this.addManagedListener(this.column, column_1.Column.EVENT_MENU_VISIBLE_CHANGED, listener);
        listener();
    };
    HeaderCellCtrl.prototype.setupSortableClass = function () {
        var _this = this;
        var updateSortableCssClass = function () {
            _this.comp.addOrRemoveCssClass('ag-header-cell-sortable', !!_this.sortable);
        };
        var updateAriaSort = function () {
            if (_this.sortable) {
                _this.comp.setAriaSort(aria_1.getAriaSortState(_this.column));
            }
            else {
                _this.comp.setAriaSort(undefined);
            }
        };
        updateSortableCssClass();
        updateAriaSort();
        this.addRefreshFunction(updateSortableCssClass);
        this.addRefreshFunction(updateAriaSort);
        this.addManagedListener(this.column, column_1.Column.EVENT_SORT_CHANGED, updateAriaSort);
    };
    HeaderCellCtrl.prototype.addColumnHoverListener = function () {
        var _this = this;
        var listener = function () {
            if (!_this.gridOptionsWrapper.isColumnHoverHighlight()) {
                return;
            }
            var isHovered = _this.columnHoverService.isHovered(_this.column);
            _this.comp.addOrRemoveCssClass('ag-column-hover', isHovered);
        };
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_HOVER_CHANGED, listener);
        listener();
    };
    HeaderCellCtrl.prototype.setupFilterCss = function () {
        var _this = this;
        var listener = function () {
            _this.comp.addOrRemoveCssClass('ag-header-cell-filtered', _this.column.isFilterActive());
        };
        this.addManagedListener(this.column, column_1.Column.EVENT_FILTER_ACTIVE_CHANGED, listener);
        listener();
    };
    HeaderCellCtrl.prototype.setupColId = function () {
        this.comp.setColId(this.column.getColId());
    };
    HeaderCellCtrl.prototype.addActiveHeaderMouseListeners = function () {
        var _this = this;
        var listener = function (e) { return _this.setActiveHeader(e.type === 'mouseenter'); };
        this.addManagedListener(this.getGui(), 'mouseenter', listener);
        this.addManagedListener(this.getGui(), 'mouseleave', listener);
    };
    HeaderCellCtrl.prototype.setActiveHeader = function (active) {
        this.comp.addOrRemoveCssClass('ag-header-active', active);
    };
    __decorate([
        context_1.Autowired('columnModel')
    ], HeaderCellCtrl.prototype, "columnModel", void 0);
    __decorate([
        context_1.Autowired('columnHoverService')
    ], HeaderCellCtrl.prototype, "columnHoverService", void 0);
    __decorate([
        context_1.Autowired('beans')
    ], HeaderCellCtrl.prototype, "beans", void 0);
    __decorate([
        context_1.Autowired('sortController')
    ], HeaderCellCtrl.prototype, "sortController", void 0);
    __decorate([
        context_1.Autowired('menuFactory')
    ], HeaderCellCtrl.prototype, "menuFactory", void 0);
    __decorate([
        context_1.Autowired('dragAndDropService')
    ], HeaderCellCtrl.prototype, "dragAndDropService", void 0);
    __decorate([
        context_1.Autowired('gridApi')
    ], HeaderCellCtrl.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired('columnApi')
    ], HeaderCellCtrl.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('userComponentFactory')
    ], HeaderCellCtrl.prototype, "userComponentFactory", void 0);
    __decorate([
        context_1.PreDestroy
    ], HeaderCellCtrl.prototype, "removeDragSource", null);
    return HeaderCellCtrl;
}(abstractHeaderCellCtrl_1.AbstractHeaderCellCtrl));
exports.HeaderCellCtrl = HeaderCellCtrl;

//# sourceMappingURL=headerCellCtrl.js.map
