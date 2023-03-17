"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PivotDropZonePanel = void 0;
const core_1 = require("@ag-grid-community/core");
const baseDropZonePanel_1 = require("./baseDropZonePanel");
class PivotDropZonePanel extends baseDropZonePanel_1.BaseDropZonePanel {
    constructor(horizontal) {
        super(horizontal, 'pivot');
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
        const emptyMessage = localeTextFunc('pivotColumnsEmptyMessage', 'Drag here to set column labels');
        const title = localeTextFunc('pivots', 'Column Labels');
        super.init({
            dragAndDropIcon: core_1.DragAndDropService.ICON_GROUP,
            icon: core_1._.createIconNoSpan('pivotPanel', this.gridOptionsService, null),
            emptyMessage: emptyMessage,
            title: title
        });
        this.addManagedListener(this.eventService, core_1.Events.EVENT_NEW_COLUMNS_LOADED, this.refresh.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_PIVOT_CHANGED, this.refresh.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.checkVisibility.bind(this));
        this.refresh();
    }
    getAriaLabel() {
        const translate = this.localeService.getLocaleTextFunc();
        const label = translate('ariaPivotDropZonePanelLabel', 'Column Labels');
        return label;
    }
    getTooltipParams() {
        const res = super.getTooltipParams();
        res.location = 'pivotColumnsList';
        return res;
    }
    refresh() {
        this.checkVisibility();
        this.refreshGui();
    }
    checkVisibility() {
        const pivotMode = this.columnModel.isPivotMode();
        if (this.isHorizontal()) {
            // what we do for horizontal (ie the pivot panel at the top) depends
            // on the user property as well as pivotMode.
            switch (this.gridOptionsService.get('pivotPanelShow')) {
                case 'always':
                    this.setDisplayed(pivotMode);
                    break;
                case 'onlyWhenPivoting':
                    const pivotActive = this.columnModel.isPivotActive();
                    this.setDisplayed(pivotMode && pivotActive);
                    break;
                default:
                    // never show it
                    this.setDisplayed(false);
                    break;
            }
        }
        else {
            // in toolPanel, the pivot panel is always shown when pivot mode is on
            this.setDisplayed(pivotMode);
        }
    }
    isColumnDroppable(column) {
        // we never allow grouping of secondary columns
        if (this.gridOptionsService.is('functionsReadOnly') || !column.isPrimary()) {
            return false;
        }
        return column.isAllowPivot() && !column.isPivotActive();
    }
    updateColumns(columns) {
        if (this.gridOptionsService.is('functionsPassive')) {
            const event = {
                type: core_1.Events.EVENT_COLUMN_PIVOT_CHANGE_REQUEST,
                columns: columns
            };
            this.eventService.dispatchEvent(event);
        }
        else {
            this.columnModel.setPivotColumns(columns, "toolPanelUi");
        }
    }
    getIconName() {
        return this.isPotentialDndColumns() ? core_1.DragAndDropService.ICON_PIVOT : core_1.DragAndDropService.ICON_NOT_ALLOWED;
    }
    getExistingColumns() {
        return this.columnModel.getPivotColumns();
    }
}
__decorate([
    core_1.Autowired('columnModel')
], PivotDropZonePanel.prototype, "columnModel", void 0);
__decorate([
    core_1.Autowired('loggerFactory')
], PivotDropZonePanel.prototype, "loggerFactory", void 0);
__decorate([
    core_1.Autowired('dragAndDropService')
], PivotDropZonePanel.prototype, "dragAndDropService", void 0);
__decorate([
    core_1.PostConstruct
], PivotDropZonePanel.prototype, "passBeansUp", null);
exports.PivotDropZonePanel = PivotDropZonePanel;
