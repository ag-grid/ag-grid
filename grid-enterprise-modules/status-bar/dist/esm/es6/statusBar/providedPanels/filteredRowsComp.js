var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Events, PostConstruct, _ } from '@ag-grid-community/core';
import { NameValueComp } from "./nameValueComp";
export class FilteredRowsComp extends NameValueComp {
    postConstruct() {
        this.setLabel('filteredRows', 'Filtered');
        // this component is only really useful with client side row model
        if (this.gridApi.getModel().getType() !== 'clientSide') {
            console.warn(`AG Grid: agFilteredRowCountComponent should only be used with the client side row model.`);
            return;
        }
        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-filtered-row-count');
        this.setDisplayed(true);
        const listener = this.onDataChanged.bind(this);
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, listener);
        listener();
    }
    onDataChanged() {
        const totalRowCountValue = this.getTotalRowCountValue();
        const filteredRowCountValue = this.getFilteredRowCountValue();
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const thousandSeparator = localeTextFunc('thousandSeparator', ',');
        const decimalSeparator = localeTextFunc('decimalSeparator', '.');
        this.setValue(_.formatNumberCommas(filteredRowCountValue, thousandSeparator, decimalSeparator));
        this.setDisplayed(totalRowCountValue !== filteredRowCountValue);
    }
    getTotalRowCountValue() {
        let totalRowCount = 0;
        this.gridApi.forEachNode((node) => totalRowCount += 1);
        return totalRowCount;
    }
    getFilteredRowCountValue() {
        let filteredRowCount = 0;
        this.gridApi.forEachNodeAfterFilter((node) => {
            if (!node.group) {
                filteredRowCount += 1;
            }
        });
        return filteredRowCount;
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
], FilteredRowsComp.prototype, "gridApi", void 0);
__decorate([
    PostConstruct
], FilteredRowsComp.prototype, "postConstruct", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyZWRSb3dzQ29tcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zdGF0dXNCYXIvcHJvdmlkZWRQYW5lbHMvZmlsdGVyZWRSb3dzQ29tcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUNULE1BQU0sRUFFTixhQUFhLEVBRWIsQ0FBQyxFQUNKLE1BQU0seUJBQXlCLENBQUM7QUFDakMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRWhELE1BQU0sT0FBTyxnQkFBaUIsU0FBUSxhQUFhO0lBS3JDLGFBQWE7UUFDbkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFMUMsa0VBQWtFO1FBQ2xFLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxZQUFZLEVBQUU7WUFDcEQsT0FBTyxDQUFDLElBQUksQ0FBQywwRkFBMEYsQ0FBQyxDQUFDO1lBQ3pHLE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsV0FBVyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7UUFFdkQsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV4QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsbUJBQW1CLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDakYsUUFBUSxFQUFFLENBQUM7SUFDZixDQUFDO0lBRU8sYUFBYTtRQUNqQixNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQ3hELE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFDOUQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzlELE1BQU0saUJBQWlCLEdBQUcsY0FBYyxDQUFDLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ25FLE1BQU0sZ0JBQWdCLEdBQUcsY0FBYyxDQUFDLGtCQUFrQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRWpFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLHFCQUFxQixFQUFFLGlCQUFpQixFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUNoRyxJQUFJLENBQUMsWUFBWSxDQUFDLGtCQUFrQixLQUFLLHFCQUFxQixDQUFDLENBQUM7SUFDcEUsQ0FBQztJQUVPLHFCQUFxQjtRQUN6QixJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7UUFDdEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLGFBQWEsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN2RCxPQUFPLGFBQWEsQ0FBQztJQUN6QixDQUFDO0lBRU8sd0JBQXdCO1FBQzVCLElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO1FBRXpCLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUN6QyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDYixnQkFBZ0IsSUFBSSxDQUFDLENBQUM7YUFDekI7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sZ0JBQWdCLENBQUM7SUFDNUIsQ0FBQztJQUVNLElBQUksS0FBSSxDQUFDO0lBRWhCLDRGQUE0RjtJQUM1RixtRUFBbUU7SUFDNUQsT0FBTztRQUNWLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNwQixDQUFDO0NBRUo7QUExRHlCO0lBQXJCLFNBQVMsQ0FBQyxTQUFTLENBQUM7aURBQTBCO0FBRy9DO0lBREMsYUFBYTtxREFrQmIifQ==