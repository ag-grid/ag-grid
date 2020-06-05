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
import { DragSourceType, Component, Autowired, Events, TouchListener, DragAndDropService, PostConstruct, RefSelector, _, Optional, VirtualList } from "@ag-grid-community/core";
var DropZoneColumnComp = /** @class */ (function (_super) {
    __extends(DropZoneColumnComp, _super);
    function DropZoneColumnComp(column, dragSourceDropTarget, ghost, valueColumn, horizontal) {
        var _this = _super.call(this) || this;
        _this.column = column;
        _this.dragSourceDropTarget = dragSourceDropTarget;
        _this.ghost = ghost;
        _this.valueColumn = valueColumn;
        _this.horizontal = horizontal;
        _this.popupShowing = false;
        return _this;
    }
    DropZoneColumnComp.prototype.init = function () {
        this.setTemplate(DropZoneColumnComp.TEMPLATE);
        this.addElementClasses(this.getGui());
        this.addElementClasses(this.eDragHandle, 'drag-handle');
        this.addElementClasses(this.eText, 'text');
        this.addElementClasses(this.eButton, 'button');
        this.eDragHandle.appendChild(_.createIconNoSpan('columnDrag', this.gridOptionsWrapper));
        this.eButton.appendChild(_.createIconNoSpan('cancel', this.gridOptionsWrapper));
        this.displayName = this.columnController.getDisplayNameForColumn(this.column, 'columnDrop');
        this.setupComponents();
        if (!this.ghost && !this.gridOptionsWrapper.isFunctionsReadOnly()) {
            this.addDragSource();
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
            _.addCssClass(this.getGui(), 'ag-column-drop-cell-ghost');
        }
        if (this.valueColumn && !this.gridOptionsWrapper.isFunctionsReadOnly()) {
            this.addGuiEventListener('click', this.onShowAggFuncSelection.bind(this));
        }
    };
    DropZoneColumnComp.prototype.setupRemove = function () {
        var _this = this;
        _.setDisplayed(this.eButton, !this.gridOptionsWrapper.isFunctionsReadOnly());
        this.addManagedListener(this.eButton, 'click', function (mouseEvent) {
            var agEvent = { type: DropZoneColumnComp.EVENT_COLUMN_REMOVE };
            _this.dispatchEvent(agEvent);
            mouseEvent.stopPropagation();
        });
        var touchListener = new TouchListener(this.eButton);
        this.addManagedListener(touchListener, TouchListener.EVENT_TAP, function (event) {
            var agEvent = { type: DropZoneColumnComp.EVENT_COLUMN_REMOVE };
            _this.dispatchEvent(agEvent);
        });
        this.addDestroyFunc(touchListener.destroy.bind(touchListener));
    };
    DropZoneColumnComp.prototype.setTextValue = function () {
        var displayValue;
        if (this.valueColumn) {
            var aggFunc = this.column.getAggFunc();
            // if aggFunc is a string, we can use it, but if it's a function, then we swap with 'func'
            var aggFuncString = (typeof aggFunc === 'string') ? aggFunc : 'agg';
            var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            var aggFuncStringTranslated = localeTextFunc(aggFuncString, aggFuncString);
            displayValue = aggFuncStringTranslated + "(" + this.displayName + ")";
        }
        else {
            displayValue = this.displayName;
        }
        var displayValueSanitised = _.escape(displayValue);
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
        virtualList.setModel({
            getRow: function (index) { return rows[index]; },
            getRowCount: function () { return rows.length; }
        });
        this.getContext().createBean(virtualList);
        var ePopup = _.loadTemplate('<div class="ag-select-agg-func-popup"></div>');
        ePopup.style.top = '0px';
        ePopup.style.left = '0px';
        ePopup.appendChild(virtualList.getGui());
        // ePopup.style.height = this.gridOptionsWrapper.getAggFuncPopupHeight() + 'px';
        ePopup.style.width = this.getGui().clientWidth + 'px';
        var popupHiddenFunc = function () {
            _this.destroyBean(virtualList);
            _this.popupShowing = false;
        };
        var hidePopup = this.popupService.addAsModalPopup(ePopup, true, popupHiddenFunc);
        virtualList.setComponentCreator(this.createAggSelect.bind(this, hidePopup));
        this.popupService.positionPopupUnderComponent({
            type: 'aggFuncSelect',
            eventSource: this.getGui(),
            ePopup: ePopup,
            keepWithinBounds: true,
            column: this.column
        });
        virtualList.refresh();
    };
    DropZoneColumnComp.prototype.createAggSelect = function (hidePopup, value) {
        var _this = this;
        var itemSelected = function () {
            hidePopup();
            if (_this.gridOptionsWrapper.isFunctionsPassive()) {
                var event_1 = {
                    type: Events.EVENT_COLUMN_AGG_FUNC_CHANGE_REQUEST,
                    columns: [_this.column],
                    aggFunc: value,
                    api: _this.gridApi,
                    columnApi: _this.columnApi
                };
                _this.eventService.dispatchEvent(event_1);
            }
            else {
                _this.columnController.setColumnAggFunc(_this.column, value, "toolPanelDragAndDrop");
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
        _.addCssClass(el, "ag-column-drop-cell" + suffix);
        var direction = this.horizontal ? 'horizontal' : 'vertical';
        _.addCssClass(el, "ag-column-drop-" + direction + "-cell" + suffix);
    };
    DropZoneColumnComp.EVENT_COLUMN_REMOVE = 'columnRemove';
    DropZoneColumnComp.TEMPLATE = "<span>\n          <span ref=\"eDragHandle\" class=\"ag-drag-handle ag-column-drop-cell-drag-handle\"></span>\n          <span ref=\"eText\" class=\"ag-column-drop-cell-text\"></span>\n          <span ref=\"eButton\" class=\"ag-column-drop-cell-button\"></span>\n        </span>";
    __decorate([
        Autowired('dragAndDropService')
    ], DropZoneColumnComp.prototype, "dragAndDropService", void 0);
    __decorate([
        Autowired('columnController')
    ], DropZoneColumnComp.prototype, "columnController", void 0);
    __decorate([
        Autowired('popupService')
    ], DropZoneColumnComp.prototype, "popupService", void 0);
    __decorate([
        Optional('aggFuncService')
    ], DropZoneColumnComp.prototype, "aggFuncService", void 0);
    __decorate([
        Autowired('gridOptionsWrapper')
    ], DropZoneColumnComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('columnApi')
    ], DropZoneColumnComp.prototype, "columnApi", void 0);
    __decorate([
        Autowired('gridApi')
    ], DropZoneColumnComp.prototype, "gridApi", void 0);
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
        PostConstruct
    ], DropZoneColumnComp.prototype, "init", null);
    return DropZoneColumnComp;
}(Component));
export { DropZoneColumnComp };
var AggItemComp = /** @class */ (function (_super) {
    __extends(AggItemComp, _super);
    function AggItemComp(itemSelected, value) {
        var _this = _super.call(this, '<div class="ag-select-agg-func-item"/>') || this;
        _this.getGui().innerText = value;
        _this.value = value;
        _this.addGuiEventListener('click', itemSelected);
        return _this;
    }
    return AggItemComp;
}(Component));
