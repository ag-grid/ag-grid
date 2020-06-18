/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
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
var context_1 = require("../../context/context");
var column_1 = require("../../entities/column");
var dragAndDropService_1 = require("../../dragAndDrop/dragAndDropService");
var constants_1 = require("../../constants");
var cssClassApplier_1 = require("../cssClassApplier");
var events_1 = require("../../events");
var hoverFeature_1 = require("../hoverFeature");
var setLeftFeature_1 = require("../../rendering/features/setLeftFeature");
var selectAllFeature_1 = require("./selectAllFeature");
var componentAnnotations_1 = require("../../widgets/componentAnnotations");
var touchListener_1 = require("../../widgets/touchListener");
var tooltipFeature_1 = require("../../widgets/tooltipFeature");
var abstractHeaderWrapper_1 = require("./abstractHeaderWrapper");
var utils_1 = require("../../utils");
var HeaderWrapperComp = /** @class */ (function (_super) {
    __extends(HeaderWrapperComp, _super);
    function HeaderWrapperComp(column, dragSourceDropTarget, pinned) {
        var _this = _super.call(this, HeaderWrapperComp.TEMPLATE) || this;
        _this.column = column;
        _this.dragSourceDropTarget = dragSourceDropTarget;
        _this.pinned = pinned;
        return _this;
    }
    HeaderWrapperComp.prototype.postConstruct = function () {
        _super.prototype.postConstruct.call(this);
        var colDef = this.getComponentHolder();
        var displayName = this.columnController.getDisplayNameForColumn(this.column, 'header', true);
        var enableSorting = colDef.sortable;
        var enableMenu = this.menuEnabled = this.menuFactory.isMenuEnabled(this.column) && !colDef.suppressMenu;
        this.appendHeaderComp(displayName, enableSorting, enableMenu);
        this.setupWidth();
        this.setupMovingCss();
        this.setupTooltip();
        this.setupResize();
        this.setupMenuClass();
        this.setupSortableClass(enableSorting);
        this.addColumnHoverListener();
        this.addDisplayMenuListeners();
        this.cbSelectAll.setInputAriaLabel('Toggle Selection of All Rows');
        this.createManagedBean(new hoverFeature_1.HoverFeature([this.column], this.getGui()));
        this.addManagedListener(this.column, column_1.Column.EVENT_FILTER_ACTIVE_CHANGED, this.onFilterChanged.bind(this));
        this.onFilterChanged();
        this.createManagedBean(new selectAllFeature_1.SelectAllFeature(this.cbSelectAll, this.column));
        var setLeftFeature = new setLeftFeature_1.SetLeftFeature(this.column, this.getGui(), this.beans);
        this.createManagedBean(setLeftFeature);
        this.addAttributes();
        cssClassApplier_1.CssClassApplier.addHeaderClassesFromColDef(colDef, this.getGui(), this.gridOptionsWrapper, this.column, null);
    };
    HeaderWrapperComp.prototype.addDisplayMenuListeners = function () {
        var mouseListener = this.onMouseOverOut.bind(this);
        this.addGuiEventListener('mouseenter', mouseListener);
        this.addGuiEventListener('mouseleave', mouseListener);
    };
    HeaderWrapperComp.prototype.onMouseOverOut = function (e) {
        if (this.headerComp && this.headerComp.setActiveParent) {
            this.headerComp.setActiveParent(e.type === 'mouseenter');
        }
    };
    HeaderWrapperComp.prototype.onFocusIn = function (e) {
        if (!this.getGui().contains(e.relatedTarget)) {
            var headerRow = this.getParentComponent();
            this.focusController.setFocusedHeader(headerRow.getRowIndex(), this.getColumn());
        }
        if (this.headerComp && this.headerComp.setActiveParent) {
            this.headerComp.setActiveParent(true);
        }
    };
    HeaderWrapperComp.prototype.onFocusOut = function (e) {
        if (!this.headerComp ||
            !this.headerComp.setActiveParent ||
            this.getGui().contains(e.relatedTarget)) {
            return;
        }
        this.headerComp.setActiveParent(false);
    };
    HeaderWrapperComp.prototype.handleKeyDown = function (e) {
        var headerComp = this.headerComp;
        if (!headerComp) {
            return;
        }
        if (e.keyCode === constants_1.Constants.KEY_SPACE) {
            var checkbox = this.cbSelectAll;
            if (checkbox.isDisplayed() && !checkbox.getGui().contains(document.activeElement)) {
                checkbox.setValue(!checkbox.getValue());
            }
        }
        if (e.keyCode === constants_1.Constants.KEY_ENTER) {
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
        }
    };
    HeaderWrapperComp.prototype.getComponentHolder = function () {
        return this.column.getColDef();
    };
    HeaderWrapperComp.prototype.addColumnHoverListener = function () {
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_HOVER_CHANGED, this.onColumnHover.bind(this));
        this.onColumnHover();
    };
    HeaderWrapperComp.prototype.onColumnHover = function () {
        var isHovered = this.columnHoverService.isHovered(this.column);
        utils_1._.addOrRemoveCssClass(this.getGui(), 'ag-column-hover', isHovered);
    };
    HeaderWrapperComp.prototype.setupSortableClass = function (enableSorting) {
        if (!enableSorting) {
            return;
        }
        var element = this.getGui();
        utils_1._.addCssClass(element, 'ag-header-cell-sortable');
        this.sortable = true;
    };
    HeaderWrapperComp.prototype.onFilterChanged = function () {
        var filterPresent = this.column.isFilterActive();
        utils_1._.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-filtered', filterPresent);
    };
    HeaderWrapperComp.prototype.appendHeaderComp = function (displayName, enableSorting, enableMenu) {
        var _this = this;
        var params = {
            column: this.column,
            displayName: displayName,
            enableSorting: enableSorting,
            enableMenu: enableMenu,
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
            context: this.gridOptionsWrapper.getContext()
        };
        var callback = this.afterHeaderCompCreated.bind(this, displayName);
        this.userComponentFactory.newHeaderComponent(params).then(callback);
    };
    HeaderWrapperComp.prototype.afterHeaderCompCreated = function (displayName, headerComp) {
        var _this = this;
        this.getGui().appendChild(headerComp.getGui());
        this.addDestroyFunc(function () {
            _this.getContext().destroyBean(headerComp);
        });
        this.setupMove(headerComp.getGui(), displayName);
        this.headerComp = headerComp;
    };
    HeaderWrapperComp.prototype.onColumnMovingChanged = function () {
        // this function adds or removes the moving css, based on if the col is moving.
        // this is what makes the header go dark when it is been moved (gives impression to
        // user that the column was picked up).
        if (this.column.isMoving()) {
            utils_1._.addCssClass(this.getGui(), 'ag-header-cell-moving');
        }
        else {
            utils_1._.removeCssClass(this.getGui(), 'ag-header-cell-moving');
        }
    };
    HeaderWrapperComp.prototype.setupMove = function (eHeaderCellLabel, displayName) {
        var _this = this;
        var colDef = this.column.getColDef();
        var suppressMove = this.gridOptionsWrapper.isSuppressMovableColumns()
            || this.getComponentHolder().suppressMovable
            || colDef.lockPosition;
        if (suppressMove &&
            !colDef.enableRowGroup &&
            !colDef.enablePivot) {
            return;
        }
        if (eHeaderCellLabel) {
            var dragSource_1 = {
                type: dragAndDropService_1.DragSourceType.HeaderCell,
                eElement: eHeaderCellLabel,
                defaultIconName: dragAndDropService_1.DragAndDropService.ICON_HIDE,
                getDragItem: function () { return _this.createDragItem(); },
                dragItemName: displayName,
                dragSourceDropTarget: this.dragSourceDropTarget,
                onDragStarted: function () { return !suppressMove && _this.column.setMoving(true, "uiColumnMoved"); },
                onDragStopped: function () { return !suppressMove && _this.column.setMoving(false, "uiColumnMoved"); }
            };
            this.dragAndDropService.addDragSource(dragSource_1, true);
            this.addDestroyFunc(function () { return _this.dragAndDropService.removeDragSource(dragSource_1); });
        }
    };
    HeaderWrapperComp.prototype.createDragItem = function () {
        var visibleState = {};
        visibleState[this.column.getId()] = this.column.isVisible();
        return {
            columns: [this.column],
            visibleState: visibleState
        };
    };
    HeaderWrapperComp.prototype.setupResize = function () {
        var _this = this;
        var colDef = this.getComponentHolder();
        // if no eResize in template, do nothing
        if (!this.eResize) {
            return;
        }
        if (!this.column.isResizable()) {
            utils_1._.removeFromParent(this.eResize);
            return;
        }
        var finishedWithResizeFunc = this.horizontalResizeService.addResizeBar({
            eResizeBar: this.eResize,
            onResizeStart: this.onResizeStart.bind(this),
            onResizing: this.onResizing.bind(this, false),
            onResizeEnd: this.onResizing.bind(this, true)
        });
        this.addDestroyFunc(finishedWithResizeFunc);
        var weWantAutoSize = !this.gridOptionsWrapper.isSuppressAutoSize() && !colDef.suppressAutoSize;
        var skipHeaderOnAutoSize = this.gridOptionsWrapper.isSkipHeaderOnAutoSize();
        if (weWantAutoSize) {
            this.addManagedListener(this.eResize, 'dblclick', function () {
                _this.columnController.autoSizeColumn(_this.column, skipHeaderOnAutoSize, "uiColumnResized");
            });
            var touchListener = new touchListener_1.TouchListener(this.eResize);
            this.addManagedListener(touchListener, touchListener_1.TouchListener.EVENT_DOUBLE_TAP, function () {
                _this.columnController.autoSizeColumn(_this.column, skipHeaderOnAutoSize, "uiColumnResized");
            });
            this.addDestroyFunc(touchListener.destroy.bind(touchListener));
        }
    };
    HeaderWrapperComp.prototype.onResizing = function (finished, resizeAmount) {
        var resizeAmountNormalised = this.normaliseResizeAmount(resizeAmount);
        var columnWidths = [{ key: this.column, newWidth: this.resizeStartWidth + resizeAmountNormalised }];
        this.columnController.setColumnWidths(columnWidths, this.resizeWithShiftKey, finished, "uiColumnDragged");
        if (finished) {
            utils_1._.removeCssClass(this.getGui(), 'ag-column-resizing');
        }
    };
    HeaderWrapperComp.prototype.onResizeStart = function (shiftKey) {
        this.resizeStartWidth = this.column.getActualWidth();
        this.resizeWithShiftKey = shiftKey;
        utils_1._.addCssClass(this.getGui(), 'ag-column-resizing');
    };
    HeaderWrapperComp.prototype.getTooltipText = function () {
        var colDef = this.getComponentHolder();
        return colDef.headerTooltip;
    };
    HeaderWrapperComp.prototype.setupTooltip = function () {
        var tooltipText = this.getTooltipText();
        // add tooltip if exists
        if (tooltipText == null) {
            return;
        }
        if (this.gridOptionsWrapper.isEnableBrowserTooltips()) {
            this.getGui().setAttribute('title', tooltipText);
        }
        else {
            this.createManagedBean(new tooltipFeature_1.TooltipFeature(this, 'header'));
        }
    };
    HeaderWrapperComp.prototype.setupMovingCss = function () {
        this.addManagedListener(this.column, column_1.Column.EVENT_MOVING_CHANGED, this.onColumnMovingChanged.bind(this));
        this.onColumnMovingChanged();
    };
    HeaderWrapperComp.prototype.addAttributes = function () {
        this.getGui().setAttribute("col-id", this.column.getColId());
    };
    HeaderWrapperComp.prototype.setupWidth = function () {
        this.addManagedListener(this.column, column_1.Column.EVENT_WIDTH_CHANGED, this.onColumnWidthChanged.bind(this));
        this.onColumnWidthChanged();
    };
    HeaderWrapperComp.prototype.setupMenuClass = function () {
        this.addManagedListener(this.column, column_1.Column.EVENT_MENU_VISIBLE_CHANGED, this.onMenuVisible.bind(this));
        this.onColumnWidthChanged();
    };
    HeaderWrapperComp.prototype.onMenuVisible = function () {
        this.addOrRemoveCssClass('ag-column-menu-visible', this.column.isMenuVisible());
    };
    HeaderWrapperComp.prototype.onColumnWidthChanged = function () {
        this.getGui().style.width = this.column.getActualWidth() + 'px';
    };
    // optionally inverts the drag, depending on pinned and RTL
    // note - this method is duplicated in RenderedHeaderGroupCell - should refactor out?
    HeaderWrapperComp.prototype.normaliseResizeAmount = function (dragChange) {
        var result = dragChange;
        if (this.gridOptionsWrapper.isEnableRtl()) {
            // for RTL, dragging left makes the col bigger, except when pinning left
            if (this.pinned !== constants_1.Constants.PINNED_LEFT) {
                result *= -1;
            }
        }
        else {
            // for LTR (ie normal), dragging left makes the col smaller, except when pinning right
            if (this.pinned === constants_1.Constants.PINNED_RIGHT) {
                result *= -1;
            }
        }
        return result;
    };
    HeaderWrapperComp.TEMPLATE = "<div class=\"ag-header-cell\" role=\"presentation\" unselectable=\"on\" tabindex=\"-1\">\n            <div ref=\"eResize\" class=\"ag-header-cell-resize\" role=\"presentation\"></div>\n            <ag-checkbox ref=\"cbSelectAll\" class=\"ag-header-select-all\" role=\"presentation\"></ag-checkbox>\n        </div>";
    __decorate([
        context_1.Autowired('gridOptionsWrapper')
    ], HeaderWrapperComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('dragAndDropService')
    ], HeaderWrapperComp.prototype, "dragAndDropService", void 0);
    __decorate([
        context_1.Autowired('columnController')
    ], HeaderWrapperComp.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('horizontalResizeService')
    ], HeaderWrapperComp.prototype, "horizontalResizeService", void 0);
    __decorate([
        context_1.Autowired('menuFactory')
    ], HeaderWrapperComp.prototype, "menuFactory", void 0);
    __decorate([
        context_1.Autowired('gridApi')
    ], HeaderWrapperComp.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired('columnApi')
    ], HeaderWrapperComp.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('sortController')
    ], HeaderWrapperComp.prototype, "sortController", void 0);
    __decorate([
        context_1.Autowired('userComponentFactory')
    ], HeaderWrapperComp.prototype, "userComponentFactory", void 0);
    __decorate([
        context_1.Autowired('columnHoverService')
    ], HeaderWrapperComp.prototype, "columnHoverService", void 0);
    __decorate([
        context_1.Autowired('beans')
    ], HeaderWrapperComp.prototype, "beans", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eResize')
    ], HeaderWrapperComp.prototype, "eResize", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('cbSelectAll')
    ], HeaderWrapperComp.prototype, "cbSelectAll", void 0);
    return HeaderWrapperComp;
}(abstractHeaderWrapper_1.AbstractHeaderWrapper));
exports.HeaderWrapperComp = HeaderWrapperComp;

//# sourceMappingURL=headerWrapperComp.js.map
