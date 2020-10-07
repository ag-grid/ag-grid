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
import { Autowired, DragAndDropService, PostConstruct, Events, _ } from "@ag-grid-community/core";
import { BaseDropZonePanel } from "./baseDropZonePanel";
var ValuesDropZonePanel = /** @class */ (function (_super) {
    __extends(ValuesDropZonePanel, _super);
    function ValuesDropZonePanel(horizontal) {
        return _super.call(this, horizontal, true) || this;
    }
    ValuesDropZonePanel.prototype.passBeansUp = function () {
        _super.prototype.setBeans.call(this, {
            gridOptionsWrapper: this.gridOptionsWrapper,
            eventService: this.eventService,
            context: this.getContext(),
            loggerFactory: this.loggerFactory,
            dragAndDropService: this.dragAndDropService
        });
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var emptyMessage = localeTextFunc('valueColumnsEmptyMessage', 'Drag here to aggregate');
        var title = localeTextFunc('values', 'Values');
        _super.prototype.init.call(this, {
            dragAndDropIcon: DragAndDropService.ICON_AGGREGATE,
            icon: _.createIconNoSpan('valuePanel', this.gridOptionsWrapper, null),
            emptyMessage: emptyMessage,
            title: title
        });
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.refreshGui.bind(this));
    };
    ValuesDropZonePanel.prototype.getIconName = function () {
        return this.isPotentialDndColumns() ? DragAndDropService.ICON_AGGREGATE : DragAndDropService.ICON_NOT_ALLOWED;
    };
    ValuesDropZonePanel.prototype.isColumnDroppable = function (column) {
        // we never allow grouping of secondary columns
        if (this.gridOptionsWrapper.isFunctionsReadOnly() || !column.isPrimary()) {
            return false;
        }
        return column.isAllowValue() && !column.isValueActive();
    };
    ValuesDropZonePanel.prototype.updateColumns = function (columns) {
        if (this.gridOptionsWrapper.isFunctionsPassive()) {
            var event_1 = {
                type: Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST,
                columns: columns,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event_1);
        }
        else {
            this.columnController.setValueColumns(columns, "toolPanelUi");
        }
    };
    ValuesDropZonePanel.prototype.getExistingColumns = function () {
        return this.columnController.getValueColumns();
    };
    __decorate([
        Autowired('columnController')
    ], ValuesDropZonePanel.prototype, "columnController", void 0);
    __decorate([
        Autowired('gridOptionsWrapper')
    ], ValuesDropZonePanel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('loggerFactory')
    ], ValuesDropZonePanel.prototype, "loggerFactory", void 0);
    __decorate([
        Autowired('dragAndDropService')
    ], ValuesDropZonePanel.prototype, "dragAndDropService", void 0);
    __decorate([
        Autowired('columnApi')
    ], ValuesDropZonePanel.prototype, "columnApi", void 0);
    __decorate([
        Autowired('gridApi')
    ], ValuesDropZonePanel.prototype, "gridApi", void 0);
    __decorate([
        PostConstruct
    ], ValuesDropZonePanel.prototype, "passBeansUp", null);
    return ValuesDropZonePanel;
}(BaseDropZonePanel));
export { ValuesDropZonePanel };
