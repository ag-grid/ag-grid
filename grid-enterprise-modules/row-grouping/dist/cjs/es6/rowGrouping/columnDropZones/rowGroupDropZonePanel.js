"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowGroupDropZonePanel = void 0;
const core_1 = require("@ag-grid-community/core");
const baseDropZonePanel_1 = require("./baseDropZonePanel");
class RowGroupDropZonePanel extends baseDropZonePanel_1.BaseDropZonePanel {
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
            dragAndDropIcon: core_1.DragAndDropService.ICON_GROUP,
            icon: core_1._.createIconNoSpan('rowGroupPanel', this.gridOptionsService, null),
            emptyMessage: emptyMessage,
            title
        });
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.refreshGui.bind(this));
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
                type: core_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST,
                columns: columns
            };
            this.eventService.dispatchEvent(event);
        }
        else {
            this.columnModel.setRowGroupColumns(columns, "toolPanelUi");
        }
    }
    getIconName() {
        return this.isPotentialDndColumns() ? core_1.DragAndDropService.ICON_GROUP : core_1.DragAndDropService.ICON_NOT_ALLOWED;
    }
    getExistingColumns() {
        return this.columnModel.getRowGroupColumns();
    }
}
__decorate([
    core_1.Autowired('columnModel')
], RowGroupDropZonePanel.prototype, "columnModel", void 0);
__decorate([
    core_1.Autowired('loggerFactory')
], RowGroupDropZonePanel.prototype, "loggerFactory", void 0);
__decorate([
    core_1.Autowired('dragAndDropService')
], RowGroupDropZonePanel.prototype, "dragAndDropService", void 0);
__decorate([
    core_1.PostConstruct
], RowGroupDropZonePanel.prototype, "passBeansUp", null);
exports.RowGroupDropZonePanel = RowGroupDropZonePanel;
