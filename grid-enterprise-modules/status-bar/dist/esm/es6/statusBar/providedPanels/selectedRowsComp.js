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
        this.onRowSelectionChanged();
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
        const selectedRowCount = this.selectionService.getSelectionCount();
        if (selectedRowCount < 0) {
            this.setValue('?');
            this.setDisplayed(true);
            return;
        }
        const localeTextFunc = this.localeService.getLocaleTextFunc();
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
    Autowired('selectionService')
], SelectedRowsComp.prototype, "selectionService", void 0);
__decorate([
    PostConstruct
], SelectedRowsComp.prototype, "postConstruct", null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0ZWRSb3dzQ29tcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zdGF0dXNCYXIvcHJvdmlkZWRQYW5lbHMvc2VsZWN0ZWRSb3dzQ29tcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBVyxhQUFhLEVBQW9CLENBQUMsRUFBcUIsTUFBTSx5QkFBeUIsQ0FBQztBQUM1SCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFaEQsTUFBTSxPQUFPLGdCQUFpQixTQUFRLGFBQWE7SUFNckMsYUFBYTtRQUVuQixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFO1lBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMscUdBQXFHLENBQUMsQ0FBQztZQUNwSCxPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUUxQyxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1FBRXZELElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBRTdCLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLG1CQUFtQixFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3RGLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUM5RixDQUFDO0lBRU8sZUFBZTtRQUNuQiw0RUFBNEU7UUFDNUUsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN2RCxPQUFPLFlBQVksS0FBSyxZQUFZLElBQUksWUFBWSxLQUFLLFlBQVksQ0FBQztJQUMxRSxDQUFDO0lBRU8scUJBQXFCO1FBQ3pCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDbkUsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLEVBQUU7WUFDdEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNuQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hCLE9BQU87U0FDVjtRQUNELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUM5RCxNQUFNLGlCQUFpQixHQUFHLGNBQWMsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNuRSxNQUFNLGdCQUFnQixHQUFHLGNBQWMsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsRUFBRSxpQkFBaUIsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7UUFDM0YsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRU0sSUFBSTtJQUNYLENBQUM7SUFFRCw0RkFBNEY7SUFDNUYsbUVBQW1FO0lBQzVELE9BQU87UUFDVixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDcEIsQ0FBQztDQUVKO0FBcER5QjtJQUFyQixTQUFTLENBQUMsU0FBUyxDQUFDO2lEQUEwQjtBQUNoQjtJQUE5QixTQUFTLENBQUMsa0JBQWtCLENBQUM7MERBQTZDO0FBRzNFO0lBREMsYUFBYTtxREFrQmIifQ==