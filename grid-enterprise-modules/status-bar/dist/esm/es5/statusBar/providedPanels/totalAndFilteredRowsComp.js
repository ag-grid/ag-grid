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
var TotalAndFilteredRowsComp = /** @class */ (function (_super) {
    __extends(TotalAndFilteredRowsComp, _super);
    function TotalAndFilteredRowsComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TotalAndFilteredRowsComp.prototype.postConstruct = function () {
        // this component is only really useful with client side row model
        if (this.gridApi.getModel().getType() !== 'clientSide') {
            console.warn("AG Grid: agTotalAndFilteredRowCountComponent should only be used with the client side row model.");
            return;
        }
        this.setLabel('totalAndFilteredRows', 'Rows');
        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-total-and-filtered-row-count');
        this.setDisplayed(true);
        this.addManagedListener(this.eventService, Events.EVENT_MODEL_UPDATED, this.onDataChanged.bind(this));
        this.onDataChanged();
    };
    TotalAndFilteredRowsComp.prototype.onDataChanged = function () {
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        var thousandSeparator = localeTextFunc('thousandSeparator', ',');
        var decimalSeparator = localeTextFunc('decimalSeparator', '.');
        var rowCount = _.formatNumberCommas(this.getFilteredRowCountValue(), thousandSeparator, decimalSeparator);
        var totalRowCount = _.formatNumberCommas(this.getTotalRowCount(), thousandSeparator, decimalSeparator);
        if (rowCount === totalRowCount) {
            this.setValue(rowCount);
        }
        else {
            var localeTextFunc_1 = this.localeService.getLocaleTextFunc();
            this.setValue(rowCount + " " + localeTextFunc_1('of', 'of') + " " + totalRowCount);
        }
    };
    TotalAndFilteredRowsComp.prototype.getFilteredRowCountValue = function () {
        var filteredRowCount = 0;
        this.gridApi.forEachNodeAfterFilter(function (node) {
            if (!node.group) {
                filteredRowCount++;
            }
        });
        return filteredRowCount;
    };
    TotalAndFilteredRowsComp.prototype.getTotalRowCount = function () {
        var totalRowCount = 0;
        this.gridApi.forEachNode(function (node) {
            if (!node.group) {
                totalRowCount++;
            }
        });
        return totalRowCount;
    };
    TotalAndFilteredRowsComp.prototype.init = function () { };
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    TotalAndFilteredRowsComp.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    __decorate([
        Autowired('gridApi')
    ], TotalAndFilteredRowsComp.prototype, "gridApi", void 0);
    __decorate([
        PostConstruct
    ], TotalAndFilteredRowsComp.prototype, "postConstruct", null);
    return TotalAndFilteredRowsComp;
}(NameValueComp));
export { TotalAndFilteredRowsComp };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG90YWxBbmRGaWx0ZXJlZFJvd3NDb21wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3N0YXR1c0Jhci9wcm92aWRlZFBhbmVscy90b3RhbEFuZEZpbHRlcmVkUm93c0NvbXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFDVCxNQUFNLEVBR04sYUFBYSxFQUNiLENBQUMsRUFDSixNQUFNLHlCQUF5QixDQUFDO0FBQ2pDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUVoRDtJQUE4Qyw0Q0FBYTtJQUEzRDs7SUErREEsQ0FBQztJQTFEYSxnREFBYSxHQUF2QjtRQUNJLGtFQUFrRTtRQUNsRSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLEtBQUssWUFBWSxFQUFFO1lBQ3BELE9BQU8sQ0FBQyxJQUFJLENBQUMsa0dBQWtHLENBQUMsQ0FBQztZQUNqSCxPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRTlDLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsV0FBVyxDQUFDLDhDQUE4QyxDQUFDLENBQUM7UUFFakUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV4QixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN0RyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVPLGdEQUFhLEdBQXJCO1FBQ0ksSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzlELElBQU0saUJBQWlCLEdBQUcsY0FBYyxDQUFDLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ25FLElBQU0sZ0JBQWdCLEdBQUcsY0FBYyxDQUFDLGtCQUFrQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRWpFLElBQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzVHLElBQU0sYUFBYSxHQUFHLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBRXpHLElBQUksUUFBUSxLQUFLLGFBQWEsRUFBRTtZQUM1QixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzNCO2FBQU07WUFDSCxJQUFNLGdCQUFjLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQzlELElBQUksQ0FBQyxRQUFRLENBQUksUUFBUSxTQUFJLGdCQUFjLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFJLGFBQWUsQ0FBQyxDQUFDO1NBQy9FO0lBQ0wsQ0FBQztJQUVPLDJEQUF3QixHQUFoQztRQUNJLElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUMsVUFBQyxJQUFJO1lBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUFFLGdCQUFnQixFQUFFLENBQUM7YUFBRTtRQUM1QyxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sZ0JBQWdCLENBQUM7SUFDNUIsQ0FBQztJQUVPLG1EQUFnQixHQUF4QjtRQUNJLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxVQUFBLElBQUk7WUFDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQUUsYUFBYSxFQUFFLENBQUM7YUFBRTtRQUN6QyxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sYUFBYSxDQUFDO0lBQ3pCLENBQUM7SUFFTSx1Q0FBSSxHQUFYLGNBQWUsQ0FBQztJQUVoQiw0RkFBNEY7SUFDNUYsbUVBQW1FO0lBQzVELDBDQUFPLEdBQWQ7UUFDSSxpQkFBTSxPQUFPLFdBQUUsQ0FBQztJQUNwQixDQUFDO0lBM0RxQjtRQUFyQixTQUFTLENBQUMsU0FBUyxDQUFDOzZEQUEwQjtJQUcvQztRQURDLGFBQWE7aUVBaUJiO0lBMENMLCtCQUFDO0NBQUEsQUEvREQsQ0FBOEMsYUFBYSxHQStEMUQ7U0EvRFksd0JBQXdCIn0=