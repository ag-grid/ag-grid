"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectedRowsComp = void 0;
const core_1 = require("@ag-grid-community/core");
const nameValueComp_1 = require("./nameValueComp");
class SelectedRowsComp extends nameValueComp_1.NameValueComp {
    postConstruct() {
        if (!this.isValidRowModel()) {
            console.warn(`AG Grid: agSelectedRowCountComponent should only be used with the client and server side row model.`);
            return;
        }
        this.setLabel('selectedRows', 'Selected');
        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-selected-row-count');
        this.onRowSelectionChanged();
        const eventListener = this.onRowSelectionChanged.bind(this);
        this.addManagedListener(this.eventService, core_1.Events.EVENT_MODEL_UPDATED, eventListener);
        this.addManagedListener(this.eventService, core_1.Events.EVENT_SELECTION_CHANGED, eventListener);
    }
    isValidRowModel() {
        // this component is only really useful with client or server side rowmodels
        const rowModelType = this.gridApi.getModel().getType();
        return rowModelType === 'clientSide' || rowModelType === 'serverSide';
    }
    onRowSelectionChanged() {
        const selectedRowCount = this.selectionService.getSelectionCount();
        if (selectedRowCount < 0) {
            this.setValue('?');
            this.setDisplayed(true);
            return;
        }
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const thousandSeparator = localeTextFunc('thousandSeparator', ',');
        const decimalSeparator = localeTextFunc('decimalSeparator', '.');
        this.setValue(core_1._.formatNumberCommas(selectedRowCount, thousandSeparator, decimalSeparator));
        this.setDisplayed(selectedRowCount > 0);
    }
    init() {
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    destroy() {
        super.destroy();
    }
}
__decorate([
    core_1.Autowired('gridApi')
], SelectedRowsComp.prototype, "gridApi", void 0);
__decorate([
    core_1.Autowired('selectionService')
], SelectedRowsComp.prototype, "selectionService", void 0);
__decorate([
    core_1.PostConstruct
], SelectedRowsComp.prototype, "postConstruct", null);
exports.SelectedRowsComp = SelectedRowsComp;
