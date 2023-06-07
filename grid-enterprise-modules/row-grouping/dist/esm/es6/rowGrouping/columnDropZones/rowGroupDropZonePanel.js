var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, DragAndDropService, Events, PostConstruct } from "@ag-grid-community/core";
import { BaseDropZonePanel } from "./baseDropZonePanel";
export class RowGroupDropZonePanel extends BaseDropZonePanel {
    constructor(horizontal) {
        super(horizontal, 'rowGroup');
    }
    passBeansUp() {
        super.setBeans({
            gridOptionsService: this.gridOptionsService,
            eventService: this.eventService,
            context: this.getContext(),
            loggerFactory: this.loggerFactory,
            dragAndDropService: this.dragAndDropService
        });
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const emptyMessage = localeTextFunc('rowGroupColumnsEmptyMessage', 'Drag here to set row groups');
        const title = localeTextFunc('groups', 'Row Groups');
        super.init({
            dragAndDropIcon: DragAndDropService.ICON_GROUP,
            icon: _.createIconNoSpan('rowGroupPanel', this.gridOptionsService, null),
            emptyMessage: emptyMessage,
            title
        });
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.refreshGui.bind(this));
    }
    getAriaLabel() {
        const translate = this.localeService.getLocaleTextFunc();
        const label = translate('ariaRowGroupDropZonePanelLabel', 'Row Groups');
        return label;
    }
    getTooltipParams() {
        const res = super.getTooltipParams();
        res.location = 'rowGroupColumnsList';
        return res;
    }
    isColumnDroppable(column) {
        // we never allow grouping of secondary columns
        if (this.gridOptionsService.is('functionsReadOnly') || !column.isPrimary()) {
            return false;
        }
        return column.isAllowRowGroup() && !column.isRowGroupActive();
    }
    updateColumns(columns) {
        if (this.gridOptionsService.is('functionsPassive')) {
            const event = {
                type: Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST,
                columns: columns
            };
            this.eventService.dispatchEvent(event);
        }
        else {
            this.columnModel.setRowGroupColumns(columns, "toolPanelUi");
        }
    }
    getIconName() {
        return this.isPotentialDndColumns() ? DragAndDropService.ICON_GROUP : DragAndDropService.ICON_NOT_ALLOWED;
    }
    getExistingColumns() {
        return this.columnModel.getRowGroupColumns();
    }
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm93R3JvdXBEcm9wWm9uZVBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3Jvd0dyb3VwaW5nL2NvbHVtbkRyb3Bab25lcy9yb3dHcm91cERyb3Bab25lUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBSVQsa0JBQWtCLEVBQ2xCLE1BQU0sRUFHTixhQUFhLEVBRWhCLE1BQU0seUJBQXlCLENBQUM7QUFDakMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFeEQsTUFBTSxPQUFPLHFCQUFzQixTQUFRLGlCQUFpQjtJQU14RCxZQUFZLFVBQW1CO1FBQzNCLEtBQUssQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUdPLFdBQVc7UUFDZixLQUFLLENBQUMsUUFBUSxDQUFDO1lBQ1gsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGtCQUFrQjtZQUMzQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVk7WUFDL0IsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDMUIsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO1lBQ2pDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxrQkFBa0I7U0FDOUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzlELE1BQU0sWUFBWSxHQUFHLGNBQWMsQ0FBQyw2QkFBNkIsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO1FBQ2xHLE1BQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFFckQsS0FBSyxDQUFDLElBQUksQ0FBQztZQUNQLGVBQWUsRUFBRSxrQkFBa0IsQ0FBQyxVQUFVO1lBQzlDLElBQUksRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUU7WUFDekUsWUFBWSxFQUFFLFlBQVk7WUFDMUIsS0FBSztTQUNSLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyw4QkFBOEIsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2xILENBQUM7SUFFUyxZQUFZO1FBQ2xCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUN6RCxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsZ0NBQWdDLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFFeEUsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVNLGdCQUFnQjtRQUNuQixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUNyQyxHQUFHLENBQUMsUUFBUSxHQUFHLHFCQUFxQixDQUFDO1FBRXJDLE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVTLGlCQUFpQixDQUFDLE1BQWM7UUFDdEMsK0NBQStDO1FBQy9DLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFO1lBQUUsT0FBTyxLQUFLLENBQUM7U0FBRTtRQUU3RixPQUFPLE1BQU0sQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQ2xFLENBQUM7SUFFUyxhQUFhLENBQUMsT0FBaUI7UUFDckMsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEVBQUU7WUFDaEQsTUFBTSxLQUFLLEdBQXdEO2dCQUMvRCxJQUFJLEVBQUUsTUFBTSxDQUFDLHFDQUFxQztnQkFDbEQsT0FBTyxFQUFFLE9BQU87YUFDbkIsQ0FBQztZQUVGLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzFDO2FBQU07WUFDSCxJQUFJLENBQUMsV0FBVyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztTQUMvRDtJQUNMLENBQUM7SUFFUyxXQUFXO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUM7SUFDOUcsQ0FBQztJQUVTLGtCQUFrQjtRQUN4QixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUNqRCxDQUFDO0NBQ0o7QUF6RTZCO0lBQXpCLFNBQVMsQ0FBQyxhQUFhLENBQUM7MERBQWtDO0FBQy9CO0lBQTNCLFNBQVMsQ0FBQyxlQUFlLENBQUM7NERBQXNDO0FBQ2hDO0lBQWhDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQztpRUFBZ0Q7QUFPaEY7SUFEQyxhQUFhO3dEQXNCYiJ9