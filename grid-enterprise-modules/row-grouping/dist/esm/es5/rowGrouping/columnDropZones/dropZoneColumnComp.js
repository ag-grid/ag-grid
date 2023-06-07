var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
import { DragSourceType, Component, Autowired, Events, TouchListener, DragAndDropService, PostConstruct, Column, RefSelector, Optional, VirtualList, KeyCode, _, } from "@ag-grid-community/core";
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
        var isFunctionsReadOnly = this.gridOptionsService.is('functionsReadOnly');
        this.addElementClasses(eGui);
        this.addElementClasses(this.eDragHandle, 'drag-handle');
        this.addElementClasses(this.eText, 'text');
        this.addElementClasses(this.eButton, 'button');
        this.eDragHandle.appendChild(_.createIconNoSpan('columnDrag', this.gridOptionsService));
        this.eButton.appendChild(_.createIconNoSpan('cancel', this.gridOptionsService));
        this.setupSort();
        this.displayName = this.columnModel.getDisplayNameForColumn(this.column, 'columnDrop');
        this.setupComponents();
        if (!this.ghost && !isFunctionsReadOnly) {
            this.addDragSource();
        }
        this.setupAria();
        this.addManagedListener(this.eventService, Column.EVENT_SORT_CHANGED, function () {
            _this.setupAria();
        });
        this.setupTooltip();
    };
    DropZoneColumnComp.prototype.setupAria = function () {
        var translate = this.localeService.getLocaleTextFunc();
        var _a = this.getColumnAndAggFuncName(), name = _a.name, aggFuncName = _a.aggFuncName;
        var aggSeparator = translate('ariaDropZoneColumnComponentAggFuncSeperator', ' of ');
        var sortDirection = {
            asc: translate('ariaDropZoneColumnComponentSortAscending', 'ascending'),
            desc: translate('ariaDropZoneColumnComponentSortDescending', 'descending'),
        };
        var columnSort = this.column.getSort();
        var isSortSuppressed = this.gridOptionsService.is('rowGroupPanelSuppressSort');
        var ariaInstructions = [
            [
                aggFuncName && "" + aggFuncName + aggSeparator,
                name,
                this.isGroupingZone() && !isSortSuppressed && columnSort && ", " + sortDirection[columnSort]
            ].filter(function (part) { return !!part; }).join(''),
        ];
        var isFunctionsReadOnly = this.gridOptionsService.is('functionsReadOnly');
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
        _.setAriaLabel(this.getGui(), ariaInstructions.join('. '));
    };
    DropZoneColumnComp.prototype.setupTooltip = function () {
        var _this = this;
        var refresh = function () {
            var newTooltipText = _this.column.getColDef().headerTooltip;
            _this.setTooltip(newTooltipText);
        };
        refresh();
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, refresh);
    };
    DropZoneColumnComp.prototype.setupSort = function () {
        var _this = this;
        var canSort = this.column.getColDef().sortable;
        var isGroupingZone = this.isGroupingZone();
        if (!canSort || !isGroupingZone) {
            return;
        }
        if (!this.gridOptionsService.is('rowGroupPanelSuppressSort')) {
            this.eSortIndicator.setupSort(this.column, true);
            var performSort_1 = function (event) {
                event.preventDefault();
                var sortUsingCtrl = _this.gridOptionsService.get('multiSortKey') === 'ctrl';
                var multiSort = sortUsingCtrl ? (event.ctrlKey || event.metaKey) : event.shiftKey;
                _this.sortController.progressSort(_this.column, multiSort, 'uiColumnSorted');
            };
            this.addGuiEventListener('click', performSort_1);
            this.addGuiEventListener('keydown', function (e) {
                var isEnter = e.key === KeyCode.ENTER;
                if (isEnter && _this.isGroupingZone()) {
                    performSort_1(e);
                }
            });
        }
    };
    DropZoneColumnComp.prototype.addDragSource = function () {
        var _this = this;
        var dragSource = {
            type: DragSourceType.ToolPanel,
            eElement: this.eDragHandle,
            defaultIconName: DragAndDropService.ICON_HIDE,
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
        if (this.isAggregationZone() && !this.gridOptionsService.is('functionsReadOnly')) {
            this.addGuiEventListener('click', this.onShowAggFuncSelection.bind(this));
        }
    };
    DropZoneColumnComp.prototype.setupRemove = function () {
        var _this = this;
        _.setDisplayed(this.eButton, !this.gridOptionsService.is('functionsReadOnly'));
        var agEvent = { type: DropZoneColumnComp.EVENT_COLUMN_REMOVE };
        this.addGuiEventListener('keydown', function (e) {
            var isEnter = e.key === KeyCode.ENTER;
            var isDelete = e.key === KeyCode.DELETE;
            if (isDelete) {
                e.preventDefault();
                _this.dispatchEvent(agEvent);
            }
            if (isEnter && _this.isAggregationZone() && !_this.gridOptionsService.is('functionsReadOnly')) {
                e.preventDefault();
                _this.onShowAggFuncSelection();
            }
        });
        this.addManagedListener(this.eButton, 'click', function (mouseEvent) {
            _this.dispatchEvent(agEvent);
            mouseEvent.stopPropagation();
        });
        var touchListener = new TouchListener(this.eButton);
        this.addManagedListener(touchListener, TouchListener.EVENT_TAP, function () {
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
            var localeTextFunc = this.localeService.getLocaleTextFunc();
            aggFuncName = localeTextFunc(aggFuncString, aggFuncString);
        }
        return { name: name, aggFuncName: aggFuncName };
    };
    DropZoneColumnComp.prototype.setTextValue = function () {
        var _a = this.getColumnAndAggFuncName(), name = _a.name, aggFuncName = _a.aggFuncName;
        var displayValue = this.isAggregationZone() ? aggFuncName + "(" + name + ")" : name;
        var displayValueSanitised = _.escapeString(displayValue);
        this.eText.innerHTML = displayValueSanitised;
    };
    DropZoneColumnComp.prototype.onShowAggFuncSelection = function () {
        var _this = this;
        if (this.popupShowing) {
            return;
        }
        this.popupShowing = true;
        var virtualList = new VirtualList('select-agg-func');
        var rows = this.aggFuncService.getFuncNames(this.column);
        var eGui = this.getGui();
        var virtualListGui = virtualList.getGui();
        virtualList.setModel({
            getRow: function (index) { return rows[index]; },
            getRowCount: function () { return rows.length; }
        });
        this.getContext().createBean(virtualList);
        var ePopup = _.loadTemplate(/* html*/ "<div class=\"ag-select-agg-func-popup\"></div>");
        ePopup.style.top = '0px';
        ePopup.style.left = '0px';
        ePopup.appendChild(virtualListGui);
        // ePopup.style.height = this.gridOptionsService.getAggFuncPopupHeight() + 'px';
        ePopup.style.width = eGui.clientWidth + "px";
        var popupHiddenFunc = function () {
            _this.destroyBean(virtualList);
            _this.popupShowing = false;
            eGui.focus();
        };
        var translate = this.localeService.getLocaleTextFunc();
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
            if (e.key === KeyCode.ENTER || e.key === KeyCode.SPACE) {
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
        this.popupService.positionPopupByComponent({
            type: 'aggFuncSelect',
            eventSource: eGui,
            ePopup: ePopup,
            keepWithinBounds: true,
            column: this.column,
            position: 'under'
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
            if (_this.gridOptionsService.is('functionsPassive')) {
                var event_1 = {
                    type: Events.EVENT_COLUMN_AGG_FUNC_CHANGE_REQUEST,
                    columns: [_this.column],
                    aggFunc: value
                };
                _this.eventService.dispatchEvent(event_1);
            }
            else {
                _this.columnModel.setColumnAggFunc(_this.column, value, "toolPanelDragAndDrop");
            }
        };
        var localeTextFunc = this.localeService.getLocaleTextFunc();
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
        Autowired('dragAndDropService')
    ], DropZoneColumnComp.prototype, "dragAndDropService", void 0);
    __decorate([
        Autowired('columnModel')
    ], DropZoneColumnComp.prototype, "columnModel", void 0);
    __decorate([
        Autowired('popupService')
    ], DropZoneColumnComp.prototype, "popupService", void 0);
    __decorate([
        Optional('aggFuncService')
    ], DropZoneColumnComp.prototype, "aggFuncService", void 0);
    __decorate([
        Autowired('sortController')
    ], DropZoneColumnComp.prototype, "sortController", void 0);
    __decorate([
        RefSelector('eText')
    ], DropZoneColumnComp.prototype, "eText", void 0);
    __decorate([
        RefSelector('eDragHandle')
    ], DropZoneColumnComp.prototype, "eDragHandle", void 0);
    __decorate([
        RefSelector('eButton')
    ], DropZoneColumnComp.prototype, "eButton", void 0);
    __decorate([
        RefSelector('eSortIndicator')
    ], DropZoneColumnComp.prototype, "eSortIndicator", void 0);
    __decorate([
        PostConstruct
    ], DropZoneColumnComp.prototype, "init", null);
    return DropZoneColumnComp;
}(Component));
export { DropZoneColumnComp };
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
}(Component));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJvcFpvbmVDb2x1bW5Db21wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3Jvd0dyb3VwaW5nL2NvbHVtbkRyb3Bab25lcy9kcm9wWm9uZUNvbHVtbkNvbXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUVILGNBQWMsRUFDZCxTQUFTLEVBQ1QsU0FBUyxFQUVULE1BQU0sRUFDTixhQUFhLEVBQ2Isa0JBQWtCLEVBRWxCLGFBQWEsRUFDYixNQUFNLEVBSU4sV0FBVyxFQUNYLFFBQVEsRUFFUixXQUFXLEVBQ1gsT0FBTyxFQUNQLENBQUMsR0FJSixNQUFNLHlCQUF5QixDQUFDO0FBS2pDO0lBQXdDLHNDQUFTO0lBMkI3Qyw0QkFDWSxNQUFjLEVBQ2Qsb0JBQWdDLEVBQ2hDLEtBQWMsRUFDZCxlQUEwQixFQUMxQixVQUFtQjtRQUwvQixZQU9JLGlCQUFPLFNBQ1Y7UUFQVyxZQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2QsMEJBQW9CLEdBQXBCLG9CQUFvQixDQUFZO1FBQ2hDLFdBQUssR0FBTCxLQUFLLENBQVM7UUFDZCxxQkFBZSxHQUFmLGVBQWUsQ0FBVztRQUMxQixnQkFBVSxHQUFWLFVBQVUsQ0FBUztRQVB2QixrQkFBWSxHQUFHLEtBQUssQ0FBQzs7SUFVN0IsQ0FBQztJQUdNLGlDQUFJLEdBQVg7UUFEQSxpQkE4QkM7UUE1QkcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QyxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDM0IsSUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFFNUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJ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