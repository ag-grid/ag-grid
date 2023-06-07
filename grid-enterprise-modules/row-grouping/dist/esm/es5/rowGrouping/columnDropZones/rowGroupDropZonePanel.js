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
import { _, Autowired, DragAndDropService, Events, PostConstruct } from "@ag-grid-community/core";
import { BaseDropZonePanel } from "./baseDropZonePanel";
var RowGroupDropZonePanel = /** @class */ (function (_super) {
    __extends(RowGroupDropZonePanel, _super);
    function RowGroupDropZonePanel(horizontal) {
        return _super.call(this, horizontal, 'rowGroup') || this;
    }
    RowGroupDropZonePanel.prototype.passBeansUp = function () {
        _super.prototype.setBeans.call(this, {
            gridOptionsService: this.gridOptionsService,
            eventService: this.eventService,
            context: this.getContext(),
            loggerFactory: this.loggerFactory,
            dragAndDropService: this.dragAndDropService
        });
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        var emptyMessage = localeTextFunc('rowGroupColumnsEmptyMessage', 'Drag here to set row groups');
        var title = localeTextFunc('groups', 'Row Groups');
        _super.prototype.init.call(this, {
            dragAndDropIcon: DragAndDropService.ICON_GROUP,
            icon: _.createIconNoSpan('rowGroupPanel', this.gridOptionsService, null),
            emptyMessage: emptyMessage,
            title: title
        });
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.refreshGui.bind(this));
    };
    RowGroupDropZonePanel.prototype.getAriaLabel = function () {
        var translate = this.localeService.getLocaleTextFunc();
        var label = translate('ariaRowGroupDropZonePanelLabel', 'Row Groups');
        return label;
    };
    RowGroupDropZonePanel.prototype.getTooltipParams = function () {
        var res = _super.prototype.getTooltipParams.call(this);
        res.location = 'rowGroupColumnsList';
        return res;
    };
    RowGroupDropZonePanel.prototype.isColumnDroppable = function (column) {
        // we never allow grouping of secondary columns
        if (this.gridOptionsService.is('functionsReadOnly') || !column.isPrimary()) {
            return false;
        }
        return column.isAllowRowGroup() && !column.isRowGroupActive();
    };
    RowGroupDropZonePanel.prototype.updateColumns = function (columns) {
        if (this.gridOptionsService.is('functionsPassive')) {
            var event_1 = {
                type: Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST,
                columns: columns
            };
            this.eventService.dispatchEvent(event_1);
        }
        else {
            this.columnModel.setRowGroupColumns(columns, "toolPanelUi");
        }
    };
    RowGroupDropZonePanel.prototype.getIconName = function () {
        return this.isPotentialDndColumns() ? DragAndDropService.ICON_GROUP : DragAndDropService.ICON_NOT_ALLOWED;
    };
    RowGroupDropZonePanel.prototype.getExistingColumns = function () {
        return this.columnModel.getRowGroupColumns();
    };
    __decorate([
        Autowired('columnModel')
    ], RowGroupDropZonePanel.prototype, "columnModel", void 0);
    __decorate([
        Autowired('loggerFactory')
    ], RowGroupDropZonePanel.prototype, "loggerFactory", void 0);
    __decorate([
        Autowired('dragAndDropService')
    ], RowGroupDropZonePanel.prototype, "dragAndDropService", void 0);
    __decorate([
        PostConstruct
    ], RowGroupDropZonePanel.prototype, "passBeansUp", null);
    return RowGroupDropZonePanel;
}(BaseDropZonePanel));
export { RowGroupDropZonePanel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm93R3JvdXBEcm9wWm9uZVBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3Jvd0dyb3VwaW5nL2NvbHVtbkRyb3Bab25lcy9yb3dHcm91cERyb3Bab25lUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBSVQsa0JBQWtCLEVBQ2xCLE1BQU0sRUFHTixhQUFhLEVBRWhCLE1BQU0seUJBQXlCLENBQUM7QUFDakMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFeEQ7SUFBMkMseUNBQWlCO0lBTXhELCtCQUFZLFVBQW1CO2VBQzNCLGtCQUFNLFVBQVUsRUFBRSxVQUFVLENBQUM7SUFDakMsQ0FBQztJQUdPLDJDQUFXLEdBQW5CO1FBQ0ksaUJBQU0sUUFBUSxZQUFDO1lBQ1gsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGtCQUFrQjtZQUMzQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVk7WUFDL0IsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDMUIsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO1lBQ2pDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxrQkFBa0I7U0FDOUMsQ0FBQyxDQUFDO1FBRUgsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzlELElBQU0sWUFBWSxHQUFHLGNBQWMsQ0FBQyw2QkFBNkIsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO1FBQ2xHLElBQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFFckQsaUJBQU0sSUFBSSxZQUFDO1lBQ1AsZUFBZSxFQUFFLGtCQUFrQixDQUFDLFVBQVU7WUFDOUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBRTtZQUN6RSxZQUFZLEVBQUUsWUFBWTtZQUMxQixLQUFLLE9BQUE7U0FDUixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsOEJBQThCLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNsSCxDQUFDO0lBRVMsNENBQVksR0FBdEI7UUFDSSxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDekQsSUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLGdDQUFnQyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBRXhFLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFTSxnREFBZ0IsR0FBdkI7UUFDSSxJQUFNLEdBQUcsR0FBRyxpQkFBTSxnQkFBZ0IsV0FBRSxDQUFDO1FBQ3JDLEdBQUcsQ0FBQyxRQUFRLEdBQUcscUJBQXFCLENBQUM7UUFFckMsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRVMsaURBQWlCLEdBQTNCLFVBQTRCLE1BQWM7UUFDdEMsK0NBQStDO1FBQy9DLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFO1lBQUUsT0FBTyxLQUFLLENBQUM7U0FBRTtRQUU3RixPQUFPLE1BQU0sQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQ2xFLENBQUM7SUFFUyw2Q0FBYSxHQUF2QixVQUF3QixPQUFpQjtRQUNyQyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUMsRUFBRTtZQUNoRCxJQUFNLE9BQUssR0FBd0Q7Z0JBQy9ELElBQUksRUFBRSxNQUFNLENBQUMscUNBQXFDO2dCQUNsRCxPQUFPLEVBQUUsT0FBTzthQUNuQixDQUFDO1lBRUYsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsT0FBSyxDQUFDLENBQUM7U0FDMUM7YUFBTTtZQUNILElBQUksQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1NBQy9EO0lBQ0wsQ0FBQztJQUVTLDJDQUFXLEdBQXJCO1FBQ0ksT0FBTyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQztJQUM5RyxDQUFDO0lBRVMsa0RBQWtCLEdBQTVCO1FBQ0ksT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGtCQUFrQixFQUFFLENBQUM7SUFDakQsQ0FBQztJQXhFeUI7UUFBekIsU0FBUyxDQUFDLGFBQWEsQ0FBQzs4REFBa0M7SUFDL0I7UUFBM0IsU0FBUyxDQUFDLGVBQWUsQ0FBQztnRUFBc0M7SUFDaEM7UUFBaEMsU0FBUyxDQUFDLG9CQUFvQixDQUFDO3FFQUFnRDtJQU9oRjtRQURDLGFBQWE7NERBc0JiO0lBMkNMLDRCQUFDO0NBQUEsQUEzRUQsQ0FBMkMsaUJBQWlCLEdBMkUzRDtTQTNFWSxxQkFBcUIifQ==