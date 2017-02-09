// ag-grid-enterprise v8.0.0
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var main_1 = require("ag-grid/main");
var virtualList_1 = require("../../rendering/virtualList");
var aggFuncService_1 = require("../../aggregation/aggFuncService");
var ColumnComponent = (function (_super) {
    __extends(ColumnComponent, _super);
    function ColumnComponent(column, dragSourceDropTarget, ghost, valueColumn) {
        _super.call(this);
        this.popupShowing = false;
        this.valueColumn = valueColumn;
        this.column = column;
        this.dragSourceDropTarget = dragSourceDropTarget;
        this.ghost = ghost;
    }
    ColumnComponent.prototype.init = function () {
        this.setTemplate(ColumnComponent.TEMPLATE);
        this.displayName = this.columnController.getDisplayNameForColumn(this.column, 'columnDrop');
        this.setupComponents();
        if (!this.ghost && !this.gridOptionsWrapper.isFunctionsReadOnly()) {
            this.addDragSource();
        }
    };
    ColumnComponent.prototype.addDragSource = function () {
        var _this = this;
        var dragSource = {
            type: main_1.DragSourceType.ToolPanel,
            eElement: this.eText,
            dragItem: [this.column],
            dragItemName: this.displayName,
            dragSourceDropTarget: this.dragSourceDropTarget
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(function () { return _this.dragAndDropService.removeDragSource(dragSource); });
    };
    ColumnComponent.prototype.setupComponents = function () {
        this.setTextValue();
        this.setupRemove();
        if (this.ghost) {
            main_1.Utils.addCssClass(this.getGui(), 'ag-column-drop-cell-ghost');
        }
        if (this.valueColumn && !this.gridOptionsWrapper.isFunctionsReadOnly()) {
            this.addGuiEventListener('click', this.onShowAggFuncSelection.bind(this));
        }
    };
    ColumnComponent.prototype.setupRemove = function () {
        var _this = this;
        main_1.Utils.setVisible(this.btRemove, !this.gridOptionsWrapper.isFunctionsReadOnly());
        this.addDestroyableEventListener(this.btRemove, 'click', function (event) {
            _this.dispatchEvent(ColumnComponent.EVENT_COLUMN_REMOVE);
            event.stopPropagation();
        });
        var touchListener = new main_1.TouchListener(this.btRemove);
        this.addDestroyableEventListener(touchListener, main_1.TouchListener.EVENT_TAP, function () {
            _this.dispatchEvent(ColumnComponent.EVENT_COLUMN_REMOVE);
        });
        this.addDestroyFunc(touchListener.destroy.bind(touchListener));
    };
    ColumnComponent.prototype.setTextValue = function () {
        var displayValue;
        if (this.valueColumn) {
            var aggFunc = this.column.getAggFunc();
            // if aggFunc is a string, we can use it, but if it's a function, then we swap with 'func'
            var aggFuncString = (typeof aggFunc === 'string') ? aggFunc : 'agg';
            displayValue = aggFuncString + "(" + this.displayName + ")";
        }
        else {
            displayValue = this.displayName;
        }
        this.eText.innerHTML = displayValue;
    };
    ColumnComponent.prototype.onShowAggFuncSelection = function () {
        var _this = this;
        if (this.popupShowing) {
            return;
        }
        this.popupShowing = true;
        var virtualList = new virtualList_1.VirtualList();
        var rows = this.aggFuncService.getFuncNames();
        virtualList.setModel({
            getRow: function (index) { return rows[index]; },
            getRowCount: function () { return rows.length; }
        });
        this.context.wireBean(virtualList);
        var ePopup = main_1.Utils.loadTemplate('<div class="ag-select-agg-func-popup"></div>');
        ePopup.style.top = '0px';
        ePopup.style.left = '0px';
        ePopup.appendChild(virtualList.getGui());
        ePopup.style.height = '100px';
        ePopup.style.width = this.getGui().clientWidth + 'px';
        var popupHiddenFunc = function () {
            virtualList.destroy();
            _this.popupShowing = false;
        };
        var hidePopup = this.popupService.addAsModalPopup(ePopup, true, popupHiddenFunc);
        virtualList.setComponentCreator(this.createAggSelect.bind(this, hidePopup));
        this.popupService.positionPopupUnderComponent({
            eventSource: this.getGui(),
            ePopup: ePopup,
            keepWithinBounds: true
        });
        virtualList.refresh();
    };
    ColumnComponent.prototype.createAggSelect = function (hidePopup, value) {
        var _this = this;
        var itemSelected = function () {
            hidePopup();
            if (_this.gridOptionsWrapper.isFunctionsPassive()) {
                var event = {
                    columns: [_this.column],
                    aggFunc: value
                };
                _this.eventService.dispatchEvent(main_1.Events.EVENT_COLUMN_AGG_FUNC_CHANGE_REQUEST, event);
            }
            else {
                _this.columnController.setColumnAggFunc(_this.column, value);
            }
        };
        var comp = new AggItemComp(itemSelected, value.toString());
        return comp;
    };
    ColumnComponent.EVENT_COLUMN_REMOVE = 'columnRemove';
    ColumnComponent.TEMPLATE = "<span class=\"ag-column-drop-cell\">\n          <span class=\"ag-column-drop-cell-text\"></span>\n          <span class=\"ag-column-drop-cell-button\">&#10006;</span>\n        </span>";
    __decorate([
        main_1.Autowired('dragAndDropService'), 
        __metadata('design:type', main_1.DragAndDropService)
    ], ColumnComponent.prototype, "dragAndDropService", void 0);
    __decorate([
        main_1.Autowired('columnController'), 
        __metadata('design:type', main_1.ColumnController)
    ], ColumnComponent.prototype, "columnController", void 0);
    __decorate([
        main_1.Autowired('gridPanel'), 
        __metadata('design:type', main_1.GridPanel)
    ], ColumnComponent.prototype, "gridPanel", void 0);
    __decorate([
        main_1.Autowired('context'), 
        __metadata('design:type', main_1.Context)
    ], ColumnComponent.prototype, "context", void 0);
    __decorate([
        main_1.Autowired('popupService'), 
        __metadata('design:type', main_1.PopupService)
    ], ColumnComponent.prototype, "popupService", void 0);
    __decorate([
        main_1.Autowired('aggFuncService'), 
        __metadata('design:type', aggFuncService_1.AggFuncService)
    ], ColumnComponent.prototype, "aggFuncService", void 0);
    __decorate([
        main_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', main_1.GridOptionsWrapper)
    ], ColumnComponent.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('eventService'), 
        __metadata('design:type', main_1.EventService)
    ], ColumnComponent.prototype, "eventService", void 0);
    __decorate([
        main_1.QuerySelector('.ag-column-drop-cell-text'), 
        __metadata('design:type', HTMLElement)
    ], ColumnComponent.prototype, "eText", void 0);
    __decorate([
        main_1.QuerySelector('.ag-column-drop-cell-button'), 
        __metadata('design:type', HTMLElement)
    ], ColumnComponent.prototype, "btRemove", void 0);
    __decorate([
        main_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], ColumnComponent.prototype, "init", null);
    return ColumnComponent;
}(main_1.Component));
exports.ColumnComponent = ColumnComponent;
var AggItemComp = (function (_super) {
    __extends(AggItemComp, _super);
    function AggItemComp(itemSelected, value) {
        _super.call(this, '<div class="ag-select-agg-func-item"/>');
        this.getGui().innerText = value;
        this.value = value;
        this.addGuiEventListener('click', itemSelected);
    }
    return AggItemComp;
}(main_1.Component));
