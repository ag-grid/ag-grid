"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PivotModePanel = void 0;
const core_1 = require("@ag-grid-community/core");
class PivotModePanel extends core_1.Component {
    createTemplate() {
        return /* html */ `<div class="ag-pivot-mode-panel">
                <ag-toggle-button ref="cbPivotMode" class="ag-pivot-mode-select"></ag-toggle-button>
            </div>`;
    }
    init() {
        this.setTemplate(this.createTemplate());
        this.cbPivotMode.setValue(this.columnModel.isPivotMode());
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        this.cbPivotMode.setLabel(localeTextFunc('pivotMode', 'Pivot Mode'));
        this.addManagedListener(this.cbPivotMode, core_1.AgCheckbox.EVENT_CHANGED, this.onBtPivotMode.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_NEW_COLUMNS_LOADED, this.onPivotModeChanged.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onPivotModeChanged.bind(this));
    }
    onBtPivotMode() {
        const newValue = !!this.cbPivotMode.getValue();
        if (newValue !== this.columnModel.isPivotMode()) {
            this.columnModel.setPivotMode(newValue, "toolPanelUi");
            const api = this.gridOptionsService.api;
            if (api) {
                api.refreshHeader();
            }
        }
    }
    onPivotModeChanged() {
        const pivotModeActive = this.columnModel.isPivotMode();
        this.cbPivotMode.setValue(pivotModeActive);
    }
}
__decorate([
    core_1.Autowired('columnModel')
], PivotModePanel.prototype, "columnModel", void 0);
__decorate([
    core_1.RefSelector('cbPivotMode')
], PivotModePanel.prototype, "cbPivotMode", void 0);
__decorate([
    core_1.PreConstruct
], PivotModePanel.prototype, "init", null);
exports.PivotModePanel = PivotModePanel;
