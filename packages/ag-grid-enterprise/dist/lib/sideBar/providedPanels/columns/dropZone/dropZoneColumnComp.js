// ag-grid-enterprise v21.2.2
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var aggFuncService_1 = require("../../../../aggregation/aggFuncService");
var virtualList_1 = require("../../../../rendering/virtualList");
var DropZoneColumnComp = /** @class */ (function (_super) {
    __extends(DropZoneColumnComp, _super);
    function DropZoneColumnComp(column, dragSourceDropTarget, ghost, valueColumn) {
        var _this = _super.call(this) || this;
        _this.popupShowing = false;
        _this.valueColumn = valueColumn;
        _this.column = column;
        _this.dragSourceDropTarget = dragSourceDropTarget;
        _this.ghost = ghost;
        return _this;
    }
    DropZoneColumnComp.prototype.init = function () {
        this.setTemplate(DropZoneColumnComp.TEMPLATE);
        this.eDragHandle.appendChild(ag_grid_community_1._.createIconNoSpan('columnDrag', this.gridOptionsWrapper));
        this.btRemove.appendChild(ag_grid_community_1._.createIconNoSpan('cancel', this.gridOptionsWrapper));
        this.displayName = this.columnController.getDisplayNameForColumn(this.column, 'columnDrop');
        this.setupComponents();
        if (!this.ghost && !this.gridOptionsWrapper.isFunctionsReadOnly()) {
            this.addDragSource();
        }
    };
    DropZoneColumnComp.prototype.addDragSource = function () {
        var _this = this;
        var dragSource = {
            type: ag_grid_community_1.DragSourceType.ToolPanel,
            eElement: this.eDragHandle,
            dragItemCallback: function () { return _this.createDragItem(); },
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
            ag_grid_community_1._.addCssClass(this.getGui(), 'ag-column-drop-cell-ghost');
        }
        if (this.valueColumn && !this.gridOptionsWrapper.isFunctionsReadOnly()) {
            this.addGuiEventListener('click', this.onShowAggFuncSelection.bind(this));
        }
    };
    DropZoneColumnComp.prototype.setupRemove = function () {
        var _this = this;
        ag_grid_community_1._.setDisplayed(this.btRemove, !this.gridOptionsWrapper.isFunctionsReadOnly());
        this.addDestroyableEventListener(this.btRemove, 'click', function (mouseEvent) {
            var agEvent = { type: DropZoneColumnComp.EVENT_COLUMN_REMOVE };
            _this.dispatchEvent(agEvent);
            mouseEvent.stopPropagation();
        });
        var touchListener = new ag_grid_community_1.TouchListener(this.btRemove);
        this.addDestroyableEventListener(touchListener, ag_grid_community_1.TouchListener.EVENT_TAP, function (event) {
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
        var displayValueSanitised = ag_grid_community_1._.escape(displayValue);
        this.eText.innerHTML = displayValueSanitised;
    };
    DropZoneColumnComp.prototype.onShowAggFuncSelection = function () {
        var _this = this;
        if (this.popupShowing) {
            return;
        }
        this.popupShowing = true;
        var virtualList = new virtualList_1.VirtualList();
        var rows = this.aggFuncService.getFuncNames(this.column);
        virtualList.setModel({
            getRow: function (index) { return rows[index]; },
            getRowCount: function () { return rows.length; }
        });
        this.getContext().wireBean(virtualList);
        var ePopup = ag_grid_community_1._.loadTemplate('<div class="ag-select-agg-func-popup"></div>');
        ePopup.style.top = '0px';
        ePopup.style.left = '0px';
        ePopup.appendChild(virtualList.getGui());
        // ePopup.style.height = this.gridOptionsWrapper.getAggFuncPopupHeight() + 'px';
        ePopup.style.width = this.getGui().clientWidth + 'px';
        var popupHiddenFunc = function () {
            virtualList.destroy();
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
                    type: ag_grid_community_1.Events.EVENT_COLUMN_AGG_FUNC_CHANGE_REQUEST,
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
    DropZoneColumnComp.EVENT_COLUMN_REMOVE = 'columnRemove';
    DropZoneColumnComp.TEMPLATE = "<span class=\"ag-column-drop-cell\">\n          <span ref=\"eDragHandle\" class=\"ag-column-drag\"></span>\n          <span ref=\"eText\" class=\"ag-column-drop-cell-text\"></span>\n          <span ref=\"btRemove\" class=\"ag-column-drop-cell-button\"></span>\n        </span>";
    __decorate([
        ag_grid_community_1.Autowired('dragAndDropService'),
        __metadata("design:type", ag_grid_community_1.DragAndDropService)
    ], DropZoneColumnComp.prototype, "dragAndDropService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('columnController'),
        __metadata("design:type", ag_grid_community_1.ColumnController)
    ], DropZoneColumnComp.prototype, "columnController", void 0);
    __decorate([
        ag_grid_community_1.Autowired('popupService'),
        __metadata("design:type", ag_grid_community_1.PopupService)
    ], DropZoneColumnComp.prototype, "popupService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('aggFuncService'),
        __metadata("design:type", aggFuncService_1.AggFuncService)
    ], DropZoneColumnComp.prototype, "aggFuncService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], DropZoneColumnComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.Autowired('eventService'),
        __metadata("design:type", ag_grid_community_1.EventService)
    ], DropZoneColumnComp.prototype, "eventService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('columnApi'),
        __metadata("design:type", ag_grid_community_1.ColumnApi)
    ], DropZoneColumnComp.prototype, "columnApi", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridApi'),
        __metadata("design:type", ag_grid_community_1.GridApi)
    ], DropZoneColumnComp.prototype, "gridApi", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('eText'),
        __metadata("design:type", HTMLElement)
    ], DropZoneColumnComp.prototype, "eText", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('eDragHandle'),
        __metadata("design:type", HTMLElement)
    ], DropZoneColumnComp.prototype, "eDragHandle", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('btRemove'),
        __metadata("design:type", HTMLElement)
    ], DropZoneColumnComp.prototype, "btRemove", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], DropZoneColumnComp.prototype, "init", null);
    return DropZoneColumnComp;
}(ag_grid_community_1.Component));
exports.DropZoneColumnComp = DropZoneColumnComp;
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
}(ag_grid_community_1.Component));
