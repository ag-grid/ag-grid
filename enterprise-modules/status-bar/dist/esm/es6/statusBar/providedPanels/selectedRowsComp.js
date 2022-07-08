var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Events, PostConstruct, _ } from '@ag-grid-community/core';
import { NameValueComp } from "./nameValueComp";
export class SelectedRowsComp extends NameValueComp {
    postConstruct() {
        if (!this.isValidRowModel()) {
            console.warn(`AG Grid: agSelectedRowCountComponent should only be used with the client and server side row model.`);
            return;
        }
        this.setLabel('selectedRows', 'Selected');
        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-selected-row-count');
        const selectedRowCount = this.gridApi.getSelectedRows().length;
        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        const thousandSeparator = localeTextFunc('thousandSeparator', ',');
        const decimalSeparator = localeTextFunc('decimalSeparator', '.');
        this.setValue(_.formatNumberCommas(selectedRowCount, thousandSeparator, decimalSeparator));
        this.setDisplayed(selectedRowCount > 0);
        const eventListener = this.onRowSelectionChanged.bind(this);
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, eventListener);
        this.addManagedListener(this.eventService, Events.EVENT_SELECTION_CHANGED, eventListener);
    }
    isValidRowModel() {
        // this component is only really useful with client or server side rowmodels
        const rowModelType = this.gridApi.getModel().getType();
        return rowModelType === 'clientSide' || rowModelType === 'serverSide';
    }
    onRowSelectionChanged() {
        const selectedRowCount = this.gridApi.getSelectedRows().length;
        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        const thousandSeparator = localeTextFunc('thousandSeparator', ',');
        const decimalSeparator = localeTextFunc('decimalSeparator', '.');
        this.setValue(_.formatNumberCommas(selectedRowCount, thousandSeparator, decimalSeparator));
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
    Autowired('gridApi')
], SelectedRowsComp.prototype, "gridApi", void 0);
__decorate([
    PostConstruct
], SelectedRowsComp.prototype, "postConstruct", null);
