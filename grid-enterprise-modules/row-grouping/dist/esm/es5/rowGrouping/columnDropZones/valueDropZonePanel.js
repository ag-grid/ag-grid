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
var ValuesDropZonePanel = /** @class */ (function (_super) {
    __extends(ValuesDropZonePanel, _super);
    function ValuesDropZonePanel(horizontal) {
        return _super.call(this, horizontal, 'aggregation') || this;
    }
    ValuesDropZonePanel.prototype.passBeansUp = function () {
        _super.prototype.setBeans.call(this, {
            gridOptionsService: this.gridOptionsService,
            eventService: this.eventService,
            context: this.getContext(),
            loggerFactory: this.loggerFactory,
            dragAndDropService: this.dragAndDropService
        });
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        var emptyMessage = localeTextFunc('valueColumnsEmptyMessage', 'Drag here to aggregate');
        var title = localeTextFunc('values', 'Values');
        _super.prototype.init.call(this, {
            dragAndDropIcon: DragAndDropService.ICON_AGGREGATE,
            icon: _.createIconNoSpan('valuePanel', this.gridOptionsService, null),
            emptyMessage: emptyMessage,
            title: title
        });
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.refreshGui.bind(this));
    };
    ValuesDropZonePanel.prototype.getAriaLabel = function () {
        var translate = this.localeService.getLocaleTextFunc();
        var label = translate('ariaValuesDropZonePanelLabel', 'Values');
        return label;
    };
    ValuesDropZonePanel.prototype.getTooltipParams = function () {
        var res = _super.prototype.getTooltipParams.call(this);
        res.location = 'valueColumnsList';
        return res;
    };
    ValuesDropZonePanel.prototype.getIconName = function () {
        return this.isPotentialDndColumns() ? DragAndDropService.ICON_AGGREGATE : DragAndDropService.ICON_NOT_ALLOWED;
    };
    ValuesDropZonePanel.prototype.isColumnDroppable = function (column) {
        // we never allow grouping of secondary columns
        if (this.gridOptionsService.is('functionsReadOnly') || !column.isPrimary()) {
            return false;
        }
        return column.isAllowValue() && !column.isValueActive();
    };
    ValuesDropZonePanel.prototype.updateColumns = function (columns) {
        if (this.gridOptionsService.is('functionsPassive')) {
            var event_1 = {
                type: Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST,
                columns: columns
            };
            this.eventService.dispatchEvent(event_1);
        }
        else {
            this.columnModel.setValueColumns(columns, "toolPanelUi");
        }
    };
    ValuesDropZonePanel.prototype.getExistingColumns = function () {
        return this.columnModel.getValueColumns();
    };
    __decorate([
        Autowired('columnModel')
    ], ValuesDropZonePanel.prototype, "columnModel", void 0);
    __decorate([
        Autowired('loggerFactory')
    ], ValuesDropZonePanel.prototype, "loggerFactory", void 0);
    __decorate([
        Autowired('dragAndDropService')
    ], ValuesDropZonePanel.prototype, "dragAndDropService", void 0);
    __decorate([
        PostConstruct
    ], ValuesDropZonePanel.prototype, "passBeansUp", null);
    return ValuesDropZonePanel;
}(BaseDropZonePanel));
export { ValuesDropZonePanel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsdWVEcm9wWm9uZVBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3Jvd0dyb3VwaW5nL2NvbHVtbkRyb3Bab25lcy92YWx1ZURyb3Bab25lUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBSVQsa0JBQWtCLEVBQ2xCLE1BQU0sRUFHTixhQUFhLEVBRWhCLE1BQU0seUJBQXlCLENBQUM7QUFDakMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFeEQ7SUFBeUMsdUNBQWlCO0lBT3RELDZCQUFZLFVBQW1CO2VBQzNCLGtCQUFNLFVBQVUsRUFBRSxhQUFhLENBQUM7SUFDcEMsQ0FBQztJQUdPLHlDQUFXLEdBQW5CO1FBQ0ksaUJBQU0sUUFBUSxZQUFDO1lBQ1gsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGtCQUFrQjtZQUMzQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVk7WUFDL0IsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDMUIsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO1lBQ2pDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxrQkFBa0I7U0FDOUMsQ0FBQyxDQUFDO1FBRUgsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzlELElBQU0sWUFBWSxHQUFHLGNBQWMsQ0FBQywwQkFBMEIsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO1FBQzFGLElBQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFakQsaUJBQU0sSUFBSSxZQUFDO1lBQ1AsZUFBZSxFQUFFLGtCQUFrQixDQUFDLGNBQWM7WUFDbEQsSUFBSSxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBRTtZQUN0RSxZQUFZLEVBQUUsWUFBWTtZQUMxQixLQUFLLEVBQUUsS0FBSztTQUNmLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQywwQkFBMEIsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzlHLENBQUM7SUFFUywwQ0FBWSxHQUF0QjtRQUNJLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUN6RCxJQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsOEJBQThCLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFbEUsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVNLDhDQUFnQixHQUF2QjtRQUNJLElBQU0sR0FBRyxHQUFHLGlCQUFNLGdCQUFnQixXQUFFLENBQUM7UUFDckMsR0FBRyxDQUFDLFFBQVEsR0FBRyxrQkFBa0IsQ0FBQztRQUNsQyxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFUyx5Q0FBVyxHQUFyQjtRQUNJLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUM7SUFDbEgsQ0FBQztJQUVTLCtDQUFpQixHQUEzQixVQUE0QixNQUFjO1FBQ3RDLCtDQUErQztRQUMvQyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBRTtZQUFFLE9BQU8sS0FBSyxDQUFDO1NBQUU7UUFFN0YsT0FBTyxNQUFNLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDNUQsQ0FBQztJQUVTLDJDQUFhLEdBQXZCLFVBQXdCLE9BQWlCO1FBQ3JDLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO1lBQ2hELElBQU0sT0FBSyxHQUFxRDtnQkFDNUQsSUFBSSxFQUFFLE1BQU0sQ0FBQyxpQ0FBaUM7Z0JBQzlDLE9BQU8sRUFBRSxPQUFPO2FBQ25CLENBQUM7WUFDRixJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxPQUFLLENBQUMsQ0FBQztTQUMxQzthQUFNO1lBQ0gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1NBQzVEO0lBQ0wsQ0FBQztJQUVTLGdEQUFrQixHQUE1QjtRQUNJLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUM5QyxDQUFDO0lBdkV5QjtRQUF6QixTQUFTLENBQUMsYUFBYSxDQUFDOzREQUFrQztJQUUvQjtRQUEzQixTQUFTLENBQUMsZUFBZSxDQUFDOzhEQUFzQztJQUNoQztRQUFoQyxTQUFTLENBQUMsb0JBQW9CLENBQUM7bUVBQWdEO0lBT2hGO1FBREMsYUFBYTswREFzQmI7SUF5Q0wsMEJBQUM7Q0FBQSxBQTFFRCxDQUF5QyxpQkFBaUIsR0EwRXpEO1NBMUVZLG1CQUFtQiJ9