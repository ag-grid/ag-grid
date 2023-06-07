var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Events, PostConstruct, _ } from '@ag-grid-community/core';
import { NameValueComp } from "./nameValueComp";
var SelectedRowsComp = /** @class */ (function (_super) {
    __extends(SelectedRowsComp, _super);
    function SelectedRowsComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SelectedRowsComp.prototype.postConstruct = function () {
        if (!this.isValidRowModel()) {
            console.warn("AG Grid: agSelectedRowCountComponent should only be used with the client and server side row model.");
            return;
        }
        this.setLabel('selectedRows', 'Selected');
        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-selected-row-count');
        this.onRowSelectionChanged();
        var eventListener = this.onRowSelectionChanged.bind(this);
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, eventListener);
        this.addManagedListener(this.eventService, Events.EVENT_SELECTION_CHANGED, eventListener);
    };
    SelectedRowsComp.prototype.isValidRowModel = function () {
        // this component is only really useful with client or server side rowmodels
        var rowModelType = this.gridApi.getModel().getType();
        return rowModelType === 'clientSide' || rowModelType === 'serverSide';
    };
    SelectedRowsComp.prototype.onRowSelectionChanged = function () {
        var selectedRowCount = this.selectionService.getSelectionCount();
        if (selectedRowCount < 0) {
            this.setValue('?');
            this.setDisplayed(true);
            return;
        }
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        var thousandSeparator = localeTextFunc('thousandSeparator', ',');
        var decimalSeparator = localeTextFunc('decimalSeparator', '.');
        this.setValue(_.formatNumberCommas(selectedRowCount, thousandSeparator, decimalSeparator));
        this.setDisplayed(selectedRowCount > 0);
    };
    SelectedRowsComp.prototype.init = function () {
    };
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    SelectedRowsComp.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    __decorate([
        Autowired('gridApi')
    ], SelectedRowsComp.prototype, "gridApi", void 0);
    __decorate([
        Autowired('selectionService')
    ], SelectedRowsComp.prototype, "selectionService", void 0);
    __decorate([
        PostConstruct
    ], SelectedRowsComp.prototype, "postConstruct", null);
    return SelectedRowsComp;
}(NameValueComp));
export { SelectedRowsComp };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0ZWRSb3dzQ29tcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zdGF0dXNCYXIvcHJvdmlkZWRQYW5lbHMvc2VsZWN0ZWRSb3dzQ29tcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBVyxhQUFhLEVBQW9CLENBQUMsRUFBcUIsTUFBTSx5QkFBeUIsQ0FBQztBQUM1SCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFaEQ7SUFBc0Msb0NBQWE7SUFBbkQ7O0lBc0RBLENBQUM7SUFoRGEsd0NBQWEsR0FBdkI7UUFFSSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFO1lBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMscUdBQXFHLENBQUMsQ0FBQztZQUNwSCxPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUUxQyxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1FBRXZELElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBRTdCLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLG1CQUFtQixFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3RGLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUM5RixDQUFDO0lBRU8sMENBQWUsR0FBdkI7UUFDSSw0RUFBNEU7UUFDNUUsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN2RCxPQUFPLFlBQVksS0FBSyxZQUFZLElBQUksWUFBWSxLQUFLLFlBQVksQ0FBQztJQUMxRSxDQUFDO0lBRU8sZ0RBQXFCLEdBQTdCO1FBQ0ksSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUNuRSxJQUFJLGdCQUFnQixHQUFHLENBQUMsRUFBRTtZQUN0QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEIsT0FBTztTQUNWO1FBQ0QsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzlELElBQU0saUJBQWlCLEdBQUcsY0FBYyxDQUFDLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ25FLElBQU0sZ0JBQWdCLEdBQUcsY0FBYyxDQUFDLGtCQUFrQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixFQUFFLGlCQUFpQixFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUMzRixJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFTSwrQkFBSSxHQUFYO0lBQ0EsQ0FBQztJQUVELDRGQUE0RjtJQUM1RixtRUFBbUU7SUFDNUQsa0NBQU8sR0FBZDtRQUNJLGlCQUFNLE9BQU8sV0FBRSxDQUFDO0lBQ3BCLENBQUM7SUFsRHFCO1FBQXJCLFNBQVMsQ0FBQyxTQUFTLENBQUM7cURBQTBCO0lBQ2hCO1FBQTlCLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQzs4REFBNkM7SUFHM0U7UUFEQyxhQUFhO3lEQWtCYjtJQStCTCx1QkFBQztDQUFBLEFBdERELENBQXNDLGFBQWEsR0FzRGxEO1NBdERZLGdCQUFnQiJ9