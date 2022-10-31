"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const baseDropZonePanel_1 = require("./baseDropZonePanel");
class ValuesDropZonePanel extends baseDropZonePanel_1.BaseDropZonePanel {
    constructor(horizontal) {
        super(horizontal, 'aggregation');
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
        const emptyMessage = localeTextFunc('valueColumnsEmptyMessage', 'Drag here to aggregate');
        const title = localeTextFunc('values', 'Values');
        super.init({
            dragAndDropIcon: core_1.DragAndDropService.ICON_AGGREGATE,
            icon: core_1._.createIconNoSpan('valuePanel', this.gridOptionsWrapper, null),
            emptyMessage: emptyMessage,
            title: title
        });
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_VALUE_CHANGED, this.refreshGui.bind(this));
    }
    getAriaLabel() {
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        const label = translate('ariaValuesDropZonePanelLabel', 'Values');
        return label;
    }
    getTooltipParams() {
        const res = super.getTooltipParams();
        res.location = 'valueColumnsList';
        return res;
    }
    getIconName() {
        return this.isPotentialDndColumns() ? core_1.DragAndDropService.ICON_AGGREGATE : core_1.DragAndDropService.ICON_NOT_ALLOWED;
    }
    isColumnDroppable(column) {
        // we never allow grouping of secondary columns
        if (this.gridOptionsWrapper.isFunctionsReadOnly() || !column.isPrimary()) {
            return false;
        }
        return column.isAllowValue() && !column.isValueActive();
    }
    updateColumns(columns) {
        if (this.gridOptionsWrapper.isFunctionsPassive()) {
            const event = {
                type: core_1.Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST,
                columns: columns
            };
            this.eventService.dispatchEvent(event);
        }
        else {
            this.columnModel.setValueColumns(columns, "toolPanelUi");
        }
    }
    getExistingColumns() {
        return this.columnModel.getValueColumns();
    }
}
__decorate([
    core_1.Autowired('columnModel')
], ValuesDropZonePanel.prototype, "columnModel", void 0);
__decorate([
    core_1.Autowired('loggerFactory')
], ValuesDropZonePanel.prototype, "loggerFactory", void 0);
__decorate([
    core_1.Autowired('dragAndDropService')
], ValuesDropZonePanel.prototype, "dragAndDropService", void 0);
__decorate([
    core_1.PostConstruct
], ValuesDropZonePanel.prototype, "passBeansUp", null);
exports.ValuesDropZonePanel = ValuesDropZonePanel;
