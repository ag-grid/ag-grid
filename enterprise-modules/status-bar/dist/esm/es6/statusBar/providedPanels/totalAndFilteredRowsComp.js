var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Events, PostConstruct, _ } from '@ag-grid-community/core';
import { NameValueComp } from "./nameValueComp";
export class TotalAndFilteredRowsComp extends NameValueComp {
    postConstruct() {
        // this component is only really useful with client side row model
        if (this.gridApi.getModel().getType() !== 'clientSide') {
            console.warn(`AG Grid: agTotalAndFilteredRowCountComponent should only be used with the client side row model.`);
            return;
        }
        this.setLabel('totalAndFilteredRows', 'Rows');
        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-total-and-filtered-row-count');
        this.setDisplayed(true);
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.onDataChanged.bind(this));
        this.onDataChanged();
    }
    onDataChanged() {
        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        const thousandSeparator = localeTextFunc('thousandSeparator', ',');
        const decimalSeparator = localeTextFunc('decimalSeparator', '.');
        const rowCount = _.formatNumberCommas(this.getFilteredRowCountValue(), thousandSeparator, decimalSeparator);
        const totalRowCount = _.formatNumberCommas(this.getTotalRowCount(), thousandSeparator, decimalSeparator);
        if (rowCount === totalRowCount) {
            this.setValue(rowCount);
        }
        else {
            const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            this.setValue(`${rowCount} ${localeTextFunc('of', 'of')} ${totalRowCount}`);
        }
    }
    getFilteredRowCountValue() {
        let filteredRowCount = 0;
        this.gridApi.forEachNodeAfterFilter((node) => {
            if (!node.group) {
                filteredRowCount++;
            }
        });
        return filteredRowCount;
    }
    getTotalRowCount() {
        let totalRowCount = 0;
        this.gridApi.forEachNode(node => {
            if (!node.group) {
                totalRowCount++;
            }
        });
        return totalRowCount;
    }
    init() { }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    destroy() {
        super.destroy();
    }
}
__decorate([
    Autowired('gridApi')
], TotalAndFilteredRowsComp.prototype, "gridApi", void 0);
__decorate([
    PostConstruct
], TotalAndFilteredRowsComp.prototype, "postConstruct", null);
