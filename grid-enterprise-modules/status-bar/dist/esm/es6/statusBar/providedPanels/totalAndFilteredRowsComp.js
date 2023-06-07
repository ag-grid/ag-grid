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
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const thousandSeparator = localeTextFunc('thousandSeparator', ',');
        const decimalSeparator = localeTextFunc('decimalSeparator', '.');
        const rowCount = _.formatNumberCommas(this.getFilteredRowCountValue(), thousandSeparator, decimalSeparator);
        const totalRowCount = _.formatNumberCommas(this.getTotalRowCount(), thousandSeparator, decimalSeparator);
        if (rowCount === totalRowCount) {
            this.setValue(rowCount);
        }
        else {
            const localeTextFunc = this.localeService.getLocaleTextFunc();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG90YWxBbmRGaWx0ZXJlZFJvd3NDb21wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3N0YXR1c0Jhci9wcm92aWRlZFBhbmVscy90b3RhbEFuZEZpbHRlcmVkUm93c0NvbXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFDVCxNQUFNLEVBR04sYUFBYSxFQUNiLENBQUMsRUFDSixNQUFNLHlCQUF5QixDQUFDO0FBQ2pDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUVoRCxNQUFNLE9BQU8sd0JBQXlCLFNBQVEsYUFBYTtJQUs3QyxhQUFhO1FBQ25CLGtFQUFrRTtRQUNsRSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLEtBQUssWUFBWSxFQUFFO1lBQ3BELE9BQU8sQ0FBQyxJQUFJLENBQUMsa0dBQWtHLENBQUMsQ0FBQztZQUNqSCxPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRTlDLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsV0FBVyxDQUFDLDhDQUE4QyxDQUFDLENBQUM7UUFFakUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV4QixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN0RyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVPLGFBQWE7UUFDakIsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzlELE1BQU0saUJBQWlCLEdBQUcsY0FBYyxDQUFDLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ25FLE1BQU0sZ0JBQWdCLEdBQUcsY0FBYyxDQUFDLGtCQUFrQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRWpFLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzVHLE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBRXpHLElBQUksUUFBUSxLQUFLLGFBQWEsRUFBRTtZQUM1QixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzNCO2FBQU07WUFDSCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDOUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFFBQVEsSUFBSSxjQUFjLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLGFBQWEsRUFBRSxDQUFDLENBQUM7U0FDL0U7SUFDTCxDQUFDO0lBRU8sd0JBQXdCO1FBQzVCLElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUN6QyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFBRSxnQkFBZ0IsRUFBRSxDQUFDO2FBQUU7UUFDNUMsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLGdCQUFnQixDQUFDO0lBQzVCLENBQUM7SUFFTyxnQkFBZ0I7UUFDcEIsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzVCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUFFLGFBQWEsRUFBRSxDQUFDO2FBQUU7UUFDekMsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLGFBQWEsQ0FBQztJQUN6QixDQUFDO0lBRU0sSUFBSSxLQUFJLENBQUM7SUFFaEIsNEZBQTRGO0lBQzVGLG1FQUFtRTtJQUM1RCxPQUFPO1FBQ1YsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3BCLENBQUM7Q0FFSjtBQTdEeUI7SUFBckIsU0FBUyxDQUFDLFNBQVMsQ0FBQzt5REFBMEI7QUFHL0M7SUFEQyxhQUFhOzZEQWlCYiJ9