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
var core_1 = require("@ag-grid-community/core");
var DropZoneColumnComp = /** @class */ (function (_super) {
    __extends(DropZoneColumnComp, _super);
    function DropZoneColumnComp(column, dragSourceDropTarget, ghost, dropZonePurpose, horizontal) {
        var _this = _super.call(this) || this;
        _this.column = column;
        _this.dragSourceDropTarget = dragSourceDropTarget;
        _this.ghost = ghost;
        _this.dropZonePurpose = dropZonePurpose;
        _this.horizontal = horizontal;
        _this.popupShowing = false;
        return _this;
    }
    DropZoneColumnComp.prototype.init = function () {
        var _this = this;
        this.setTemplate(DropZoneColumnComp.TEMPLATE);
        var eGui = this.getGui();
        var isFunctionsReadOnly = this.gridOptionsWrapper.isFunctionsReadOnly();
        this.addElementClasses(eGui);
        this.addElementClasses(this.eDragHandle, 'drag-handle');
        this.addElementClasses(this.eText, 'text');
        this.addElementClasses(this.eButton, 'button');
        this.eDragHandle.appendChild(core_1._.createIconNoSpan('columnDrag', this.gridOptionsWrapper));
        this.eButton.appendChild(core_1._.createIconNoSpan('cancel', this.gridOptionsWrapper));
        this.setupSort();
        this.displayName = this.columnModel.getDisplayNameForColumn(this.column, 'columnDrop');
        this.setupComponents();
        if (!this.ghost && !isFunctionsReadOnly) {
            this.addDragSource();
        }
        this.setupAria();
        this.addManagedListener(this.column, core_1.Column.EVENT_SORT_CHANGED, function () {
            _this.setupAria();
        });
        this.setupTooltip();
    };
    DropZoneColumnComp.prototype.setupAria = function () {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        var _a = this.getColumnAndAggFuncName(), name = _a.name, aggFuncName = _a.aggFuncName;
        var aggSeparator = translate('ariaDropZoneColumnComponentAggFuncSeperator', ' of ');
        var sortDirection = {
            asc: translate('ariaDropZoneColumnComponentSortAscending', 'ascending'),
            desc: translate('ariaDropZoneColumnComponentSortDescending', 'descending'),
        };
        var columnSort = this.column.getSort();
        var isSortSuppressed = this.gridOptionsWrapper.isRowGroupPanelSuppressSort();
        var ariaInstructions = [
            [
                aggFuncName && "" + aggFuncName + aggSeparator,
                name,
                this.isGroupingZone() && !isSortSuppressed && columnSort && ", " + sortDirection[columnSort]
            ].filter(function (part) { return !!part; }).join(''),
        ];
        var isFunctionsReadOnly = this.gridOptionsWrapper.isFunctionsReadOnly();
        if (this.isAggregationZone() && !isFunctionsReadOnly) {
            var aggregationMenuAria = translate('ariaDropZoneColumnValueItemDescription', 'Press ENTER to change the aggregation type');
            ariaInstructions.push(aggregationMenuAria);
        }
        if (this.isGroupingZone() && this.column.getColDef().sortable && !isSortSuppressed) {
            var sortProgressAria = translate('ariaDropZoneColumnGroupItemDescription', 'Press ENTER to sort');
            ariaInstructions.push(sortProgressAria);
        }
        var deleteAria = translate('ariaDropZoneColumnComponentDescription', 'Press DELETE to remove');
        ariaInstructions.push(deleteAria);
        core_1._.setAriaLabel(this.getGui(), ariaInstructions.join('. '));
    };
    DropZoneColumnComp.prototype.setupTooltip = function () {
        var _this = this;
        var refresh = function () {
            var newTooltipText = _this.column.getColDef().headerTooltip;
            _this.setTooltip(newTooltipText);
        };
        refresh();
        this.addManagedListener(this.eventService, core_1.Events.EVENT_NEW_COLUMNS_LOADED, refresh);
    };
    DropZoneColumnComp.prototype.setupSort = function () {
        var _this = this;
        var canSort = this.column.getColDef().sortable;
        var isGroupingZone = this.isGroupingZone();
        if (!canSort || !isGroupingZone) {
            return;
        }
        if (!this.gridOptionsWrapper.isRowGroupPanelSuppressSort()) {
            this.eSortIndicator.setupSort(this.column, true);
            var performSort_1 = function (event) {
                event.preventDefault();
                var sortUsingCtrl = _this.gridOptionsWrapper.isMultiSortKeyCtrl();
                var multiSort = sortUsingCtrl ? (event.ctrlKey || event.metaKey) : event.shiftKey;
                _this.sortController.progressSort(_this.column, multiSort, 'uiColumnSorted');
            };
            this.addGuiEventListener('click', performSort_1);
            this.addGuiEventListener('keydown', function (e) {
                var isEnter = e.key === core_1.KeyCode.ENTER;
                if (isEnter && _this.isGroupingZone()) {
                    performSort_1(e);
                }
            });
        }
    };
    DropZoneColumnComp.prototype.addDragSource = function () {
        var _this = this;
        var dragSource = {
            type: core_1.DragSourceType.ToolPanel,
            eElement: this.eDragHandle,
            defaultIconName: core_1.DragAndDropService.ICON_HIDE,
            getDragItem: function () { return _this.createDragItem(); },
            dragItemName: this.displayName,
            dragSourceDropTarget: this.dragSourceDropTarget
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(function () { return _this.dragAndDropService.removeDragSource(dragSource); });
    };
    DropZoneColumnComp.prototype.createDragItem = function () {
        var visibleState = {};
        visibleState[this.column.getId()] = this.column.isVisible();
        return {
            columns: [this.column],
            visibleState: visibleState
        };
    };
    DropZoneColumnComp.prototype.setupComponents = function () {
        this.setTextValue();
        this.setupRemove();
        if (this.ghost) {
            this.addCssClass('ag-column-drop-cell-ghost');
        }
        if (this.isAggregationZone() && !this.gridOptionsWrapper.isFunctionsReadOnly()) {
            this.addGuiEventListener('click', this.onShowAggFuncSelection.bind(this));
        }
    };
    DropZoneColumnComp.prototype.setupRemove = function () {
        var _this = this;
        core_1._.setDisplayed(this.eButton, !this.gridOptionsWrapper.isFunctionsReadOnly());
        var agEvent = { type: DropZoneColumnComp.EVENT_COLUMN_REMOVE };
        this.addGuiEventListener('keydown', function (e) {
            var isEnter = e.key === core_1.KeyCode.ENTER;
            var isDelete = e.key === core_1.KeyCode.DELETE;
            if (isDelete) {
                e.preventDefault();
                _this.dispatchEvent(agEvent);
            }
            if (isEnter && _this.isAggregationZone() && !_this.gridOptionsWrapper.isFunctionsReadOnly()) {
                e.preventDefault();
                _this.onShowAggFuncSelection();
            }
        });
        this.addManagedListener(this.eButton, 'click', function (mouseEvent) {
            _this.dispatchEvent(agEvent);
            mouseEvent.stopPropagation();
        });
        var touchListener = new core_1.TouchListener(this.eButton);
        this.addManagedListener(touchListener, core_1.TouchListener.EVENT_TAP, function () {
            _this.dispatchEvent(agEvent);
        });
        this.addDestroyFunc(touchListener.destroy.bind(touchListener));
    };
    DropZoneColumnComp.prototype.getColumnAndAggFuncName = function () {
        var name = this.displayName;
        var aggFuncName = '';
        if (this.isAggregationZone()) {
            var aggFunc = this.column.getAggFunc();
            // if aggFunc is a string, we can use it, but if it's a function, then we swap with 'func'
            var aggFuncString = typeof aggFunc === 'string' ? aggFunc : 'agg';
            var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            aggFuncName = localeTextFunc(aggFuncString, aggFuncString);
        }
        return { name: name, aggFuncName: aggFuncName };
    };
    DropZoneColumnComp.prototype.setTextValue = function () {
        var _a = this.getColumnAndAggFuncName(), name = _a.name, aggFuncName = _a.aggFuncName;
        var displayValue = this.isAggregationZone() ? aggFuncName + "(" + name + ")" : name;
        var displayValueSanitised = core_1._.escapeString(displayValue);
        this.eText.innerHTML = displayValueSanitised;
    };
    DropZoneColumnComp.prototype.onShowAggFuncSelection = function () {
        var _this = this;
        if (this.popupShowing) {
            return;
        }
        this.popupShowing = true;
        var virtualList = new core_1.VirtualList('select-agg-func');
        var rows = this.aggFuncService.getFuncNames(this.column);
        var eGui = this.getGui();
        var virtualListGui = virtualList.getGui();
        virtualList.setModel({
            getRow: function (index) { return rows[index]; },
            getRowCount: function () { return rows.length; }
        });
        this.getContext().createBean(virtualList);
        var ePopup = core_1._.loadTemplate(/* html*/ "<div class=\"ag-select-agg-func-popup\"></div>");
        ePopup.style.top = '0px';
        ePopup.style.left = '0px';
        ePopup.appendChild(virtualListGui);
        // ePopup.style.height = this.gridOptionsWrapper.getAggFuncPopupHeight() + 'px';
        ePopup.style.width = eGui.clientWidth + "px";
        var popupHiddenFunc = function () {
            _this.destroyBean(virtualList);
            _this.popupShowing = false;
            eGui.focus();
        };
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        var addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: ePopup,
            closeOnEsc: true,
            closedCallback: popupHiddenFunc,
            ariaLabel: translate('ariaLabelAggregationFunction', 'Aggregation Function')
        });
        if (addPopupRes) {
            virtualList.setComponentCreator(this.createAggSelect.bind(this, addPopupRes.hideFunc));
        }
        virtualList.addGuiEventListener('keydown', function (e) {
            if (e.key === core_1.KeyCode.ENTER || e.key === core_1.KeyCode.SPACE) {
                var row = virtualList.getLastFocusedRow();
                if (row == null) {
                    return;
                }
                var comp = virtualList.getComponentAt(row);
                if (comp) {
                    comp.selectItem();
                }
            }
        });
        this.popupService.positionPopupUnderComponent({
            type: 'aggFuncSelect',
            eventSource: eGui,
            ePopup: ePopup,
            keepWithinBounds: true,
            column: this.column
        });
        virtualList.refresh();
        var rowToFocus = rows.findIndex(function (r) { return r === _this.column.getAggFunc(); });
        if (rowToFocus === -1) {
            rowToFocus = 0;
        }
        virtualList.focusRow(rowToFocus);
    };
    DropZoneColumnComp.prototype.createAggSelect = function (hidePopup, value) {
        var _this = this;
        var itemSelected = function () {
            hidePopup();
            if (_this.gridOptionsWrapper.isFunctionsPassive()) {
                var event_1 = {
                    type: core_1.Events.EVENT_COLUMN_AGG_FUNC_CHANGE_REQUEST,
                    columns: [_this.column],
                    aggFunc: value
                };
                _this.eventService.dispatchEvent(event_1);
            }
            else {
                _this.columnModel.setColumnAggFunc(_this.column, value, "toolPanelDragAndDrop");
            }
        };
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var aggFuncString = value.toString();
        var aggFuncStringTranslated = localeTextFunc(aggFuncString, aggFuncString);
        var comp = new AggItemComp(itemSelected, aggFuncStringTranslated);
        return comp;
    };
    DropZoneColumnComp.prototype.addElementClasses = function (el, suffix) {
        suffix = suffix ? "-" + suffix : '';
        var direction = this.horizontal ? 'horizontal' : 'vertical';
        el.classList.add("ag-column-drop-cell" + suffix, "ag-column-drop-" + direction + "-cell" + suffix);
    };
    DropZoneColumnComp.prototype.isAggregationZone = function () {
        return this.dropZonePurpose === 'aggregation';
    };
    DropZoneColumnComp.prototype.isGroupingZone = function () {
        return this.dropZonePurpose === 'rowGroup';
    };
    DropZoneColumnComp.EVENT_COLUMN_REMOVE = 'columnRemove';
    DropZoneColumnComp.TEMPLATE = "<span role=\"option\" tabindex=\"0\">\n          <span ref=\"eDragHandle\" class=\"ag-drag-handle ag-column-drop-cell-drag-handle\" role=\"presentation\"></span>\n          <span ref=\"eText\" class=\"ag-column-drop-cell-text\" aria-hidden=\"true\"></span>\n          <ag-sort-indicator ref=\"eSortIndicator\"></ag-sort-indicator>\n          <span ref=\"eButton\" class=\"ag-column-drop-cell-button\" role=\"presentation\"></span>\n        </span>";
    __decorate([
        core_1.Autowired('dragAndDropService')
    ], DropZoneColumnComp.prototype, "dragAndDropService", void 0);
    __decorate([
        core_1.Autowired('columnModel')
    ], DropZoneColumnComp.prototype, "columnModel", void 0);
    __decorate([
        core_1.Autowired('popupService')
    ], DropZoneColumnComp.prototype, "popupService", void 0);
    __decorate([
        core_1.Optional('aggFuncService')
    ], DropZoneColumnComp.prototype, "aggFuncService", void 0);
    __decorate([
        core_1.Autowired('sortController')
    ], DropZoneColumnComp.prototype, "sortController", void 0);
    __decorate([
        core_1.RefSelector('eText')
    ], DropZoneColumnComp.prototype, "eText", void 0);
    __decorate([
        core_1.RefSelector('eDragHandle')
    ], DropZoneColumnComp.prototype, "eDragHandle", void 0);
    __decorate([
        core_1.RefSelector('eButton')
    ], DropZoneColumnComp.prototype, "eButton", void 0);
    __decorate([
        core_1.RefSelector('eSortIndicator')
    ], DropZoneColumnComp.prototype, "eSortIndicator", void 0);
    __decorate([
        core_1.PostConstruct
    ], DropZoneColumnComp.prototype, "init", null);
    return DropZoneColumnComp;
}(core_1.Component));
exports.DropZoneColumnComp = DropZoneColumnComp;
var AggItemComp = /** @class */ (function (_super) {
    __extends(AggItemComp, _super);
    function AggItemComp(itemSelected, value) {
        var _this = _super.call(this, /* html */ "<div class=\"ag-select-agg-func-item\"/>") || this;
        _this.selectItem = itemSelected;
        _this.getGui().innerText = value;
        _this.addGuiEventListener('click', _this.selectItem);
        return _this;
    }
    return AggItemComp;
}(core_1.Component));
