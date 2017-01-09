// ag-grid-enterprise v7.1.0
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
var abstractColumnDropPanel_1 = require("./abstractColumnDropPanel");
var svgFactory = main_1.SvgFactory.getInstance();
var ValuesColumnPanel = (function (_super) {
    __extends(ValuesColumnPanel, _super);
    function ValuesColumnPanel(horizontal) {
        _super.call(this, horizontal, true, 'values');
    }
    ValuesColumnPanel.prototype.passBeansUp = function () {
        _super.prototype.setBeans.call(this, {
            gridOptionsWrapper: this.gridOptionsWrapper,
            eventService: this.eventService,
            context: this.context,
            loggerFactory: this.loggerFactory,
            dragAndDropService: this.dragAndDropService
        });
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var emptyMessage = localeTextFunc('pivotColumnsEmptyMessage', 'Drag here to aggregate');
        var title = localeTextFunc('values', 'Values');
        _super.prototype.init.call(this, {
            dragAndDropIcon: main_1.DragAndDropService.ICON_AGGREGATE,
            icon: main_1.Utils.createIconNoSpan('valuePanel', this.gridOptionsWrapper, null, svgFactory.createAggregationIcon),
            emptyMessage: emptyMessage,
            title: title
        });
        this.addDestroyableEventListener(this.eventService, main_1.Events.EVENT_COLUMN_VALUE_CHANGED, this.refreshGui.bind(this));
    };
    ValuesColumnPanel.prototype.getIconName = function () {
        return this.isPotentialDndColumns() ? main_1.DragAndDropService.ICON_AGGREGATE : main_1.DragAndDropService.ICON_NOT_ALLOWED;
    };
    ValuesColumnPanel.prototype.isColumnDroppable = function (column) {
        if (this.gridOptionsWrapper.isFunctionsReadOnly()) {
            return false;
        }
        // we never allow grouping of secondary columns
        if (!column.isPrimary()) {
            return false;
        }
        var columnValue = column.isAllowValue();
        var columnNotValue = !column.isValueActive();
        return columnValue && columnNotValue;
    };
    ValuesColumnPanel.prototype.updateColumns = function (columns) {
        if (this.gridOptionsWrapper.isFunctionsPassive()) {
            this.eventService.dispatchEvent(main_1.Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST, { columns: columns });
        }
        else {
            this.columnController.setValueColumns(columns);
        }
    };
    ValuesColumnPanel.prototype.getExistingColumns = function () {
        return this.columnController.getValueColumns();
    };
    __decorate([
        main_1.Autowired('columnController'), 
        __metadata('design:type', main_1.ColumnController)
    ], ValuesColumnPanel.prototype, "columnController", void 0);
    __decorate([
        main_1.Autowired('eventService'), 
        __metadata('design:type', (typeof (_a = typeof main_1.EventService !== 'undefined' && main_1.EventService) === 'function' && _a) || Object)
    ], ValuesColumnPanel.prototype, "eventService", void 0);
    __decorate([
        main_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', (typeof (_b = typeof main_1.GridOptionsWrapper !== 'undefined' && main_1.GridOptionsWrapper) === 'function' && _b) || Object)
    ], ValuesColumnPanel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('context'), 
        __metadata('design:type', (typeof (_c = typeof main_1.Context !== 'undefined' && main_1.Context) === 'function' && _c) || Object)
    ], ValuesColumnPanel.prototype, "context", void 0);
    __decorate([
        main_1.Autowired('loggerFactory'), 
        __metadata('design:type', (typeof (_d = typeof main_1.LoggerFactory !== 'undefined' && main_1.LoggerFactory) === 'function' && _d) || Object)
    ], ValuesColumnPanel.prototype, "loggerFactory", void 0);
    __decorate([
        main_1.Autowired('dragAndDropService'), 
        __metadata('design:type', (typeof (_e = typeof main_1.DragAndDropService !== 'undefined' && main_1.DragAndDropService) === 'function' && _e) || Object)
    ], ValuesColumnPanel.prototype, "dragAndDropService", void 0);
    __decorate([
        main_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], ValuesColumnPanel.prototype, "passBeansUp", null);
    return ValuesColumnPanel;
    var _a, _b, _c, _d, _e;
}(abstractColumnDropPanel_1.AbstractColumnDropPanel));
exports.ValuesColumnPanel = ValuesColumnPanel;
