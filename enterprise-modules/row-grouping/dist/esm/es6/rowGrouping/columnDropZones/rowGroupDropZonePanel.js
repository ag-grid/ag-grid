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
            gridOptionsWrapper: this.gridOptionsWrapper,
            eventService: this.eventService,
            context: this.getContext(),
            loggerFactory: this.loggerFactory,
            dragAndDropService: this.dragAndDropService
        });
        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        const emptyMessage = localeTextFunc('rowGroupColumnsEmptyMessage', 'Drag here to set row groups');
        const title = localeTextFunc('groups', 'Row Groups');
        super.init({
            dragAndDropIcon: DragAndDropService.ICON_GROUP,
            icon: _.createIconNoSpan('rowGroupPanel', this.gridOptionsWrapper, null),
            emptyMessage: emptyMessage,
            title
        });
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.refreshGui.bind(this));
    }
    getAriaLabel() {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
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
        if (this.gridOptionsWrapper.isFunctionsReadOnly() || !column.isPrimary()) {
            return false;
        }
        return column.isAllowRowGroup() && !column.isRowGroupActive();
    }
    updateColumns(columns) {
        if (this.gridOptionsWrapper.isFunctionsPassive()) {
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
