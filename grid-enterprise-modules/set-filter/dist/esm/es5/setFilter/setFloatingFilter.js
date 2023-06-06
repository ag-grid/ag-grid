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
import { Autowired, Component, RefSelector, } from '@ag-grid-community/core';
import { SetFilter } from './setFilter';
import { SetFilterModelFormatter } from './setFilterModelFormatter';
import { SetValueModel } from './setValueModel';
var SetFloatingFilterComp = /** @class */ (function (_super) {
    __extends(SetFloatingFilterComp, _super);
    function SetFloatingFilterComp() {
        var _this = _super.call(this, /* html */ "\n            <div class=\"ag-floating-filter-input ag-set-floating-filter-input\" role=\"presentation\">\n                <ag-input-text-field ref=\"eFloatingFilterText\"></ag-input-text-field>\n            </div>") || this;
        _this.availableValuesListenerAdded = false;
        _this.filterModelFormatter = new SetFilterModelFormatter();
        return _this;
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    SetFloatingFilterComp.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    SetFloatingFilterComp.prototype.init = function (params) {
        var displayName = this.columnModel.getDisplayNameForColumn(params.column, 'header', true);
        var translate = this.localeService.getLocaleTextFunc();
        this.eFloatingFilterText
            .setDisabled(true)
            .setInputAriaLabel(displayName + " " + translate('ariaFilterInput', 'Filter Input'))
            .addGuiEventListener('click', function () { return params.showParentFilter(); });
        this.params = params;
    };
    SetFloatingFilterComp.prototype.onParentModelChanged = function (parentModel) {
        this.updateFloatingFilterText(parentModel);
    };
    SetFloatingFilterComp.prototype.parentSetFilterInstance = function (cb) {
        this.params.parentFilterInstance(function (filter) {
            if (!(filter instanceof SetFilter)) {
                throw new Error('AG Grid - SetFloatingFilter expects SetFilter as its parent');
            }
            cb(filter);
        });
    };
    SetFloatingFilterComp.prototype.addAvailableValuesListener = function () {
        var _this = this;
        this.parentSetFilterInstance(function (setFilter) {
            var setValueModel = setFilter.getValueModel();
            if (!setValueModel) {
                return;
            }
            // unlike other filters, what we show in the floating filter can be different, even
            // if another filter changes. this is due to how set filter restricts its values based
            // on selections in other filters, e.g. if you filter Language to English, then the set filter
            // on Country will only show English speaking countries. Thus the list of items to show
            // in the floating filter can change.
            _this.addManagedListener(setValueModel, SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED, function () { return _this.updateFloatingFilterText(); });
        });
        this.availableValuesListenerAdded = true;
    };
    SetFloatingFilterComp.prototype.updateFloatingFilterText = function (parentModel) {
        var _this = this;
        if (!this.availableValuesListenerAdded) {
            this.addAvailableValuesListener();
        }
        this.parentSetFilterInstance(function (setFilter) {
            _this.eFloatingFilterText.setValue(_this.filterModelFormatter.getModelAsString(parentModel, setFilter));
        });
    };
    __decorate([
        RefSelector('eFloatingFilterText')
    ], SetFloatingFilterComp.prototype, "eFloatingFilterText", void 0);
    __decorate([
        Autowired('columnModel')
    ], SetFloatingFilterComp.prototype, "columnModel", void 0);
    return SetFloatingFilterComp;
}(Component));
export { SetFloatingFilterComp };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0RmxvYXRpbmdGaWx0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2V0RmlsdGVyL3NldEZsb2F0aW5nRmlsdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxTQUFTLEVBQ1QsU0FBUyxFQUVULFdBQVcsR0FLZCxNQUFNLHlCQUF5QixDQUFDO0FBRWpDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDeEMsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDcEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRWhEO0lBQXVELHlDQUFTO0lBUTVEO1FBQUEsWUFDSSxrQkFBTSxVQUFVLENBQUEsd05BR0wsQ0FDVixTQUNKO1FBVE8sa0NBQTRCLEdBQUcsS0FBSyxDQUFDO1FBQzVCLDBCQUFvQixHQUFHLElBQUksdUJBQXVCLEVBQUUsQ0FBQzs7SUFRdEUsQ0FBQztJQUVELDRGQUE0RjtJQUM1RixtRUFBbUU7SUFDNUQsdUNBQU8sR0FBZDtRQUNJLGlCQUFNLE9BQU8sV0FBRSxDQUFDO0lBQ3BCLENBQUM7SUFFTSxvQ0FBSSxHQUFYLFVBQVksTUFBNkI7UUFDckMsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1RixJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFFekQsSUFBSSxDQUFDLG1CQUFtQjthQUNuQixXQUFXLENBQUMsSUFBSSxDQUFDO2FBQ2pCLGlCQUFpQixDQUFJLFdBQVcsU0FBSSxTQUFTLENBQUMsaUJBQWlCLEVBQUUsY0FBYyxDQUFHLENBQUM7YUFDbkYsbUJBQW1CLENBQUMsT0FBTyxFQUFFLGNBQU0sT0FBQSxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsRUFBekIsQ0FBeUIsQ0FBQyxDQUFDO1FBRW5FLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFFTSxvREFBb0IsR0FBM0IsVUFBNEIsV0FBMkI7UUFDbkQsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFTyx1REFBdUIsR0FBL0IsVUFBZ0MsRUFBb0M7UUFDaEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxVQUFDLE1BQU07WUFDcEMsSUFBSSxDQUFDLENBQUMsTUFBTSxZQUFZLFNBQVMsQ0FBQyxFQUFFO2dCQUNoQyxNQUFNLElBQUksS0FBSyxDQUFDLDZEQUE2RCxDQUFDLENBQUM7YUFDbEY7WUFFRCxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDZixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTywwREFBMEIsR0FBbEM7UUFBQSxpQkFnQkM7UUFmRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsVUFBQyxTQUFTO1lBQ25DLElBQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUVoRCxJQUFJLENBQUMsYUFBYSxFQUFFO2dCQUFFLE9BQU87YUFBRTtZQUUvQixtRkFBbUY7WUFDbkYsc0ZBQXNGO1lBQ3RGLDhGQUE4RjtZQUM5Rix1RkFBdUY7WUFDdkYscUNBQXFDO1lBQ3JDLEtBQUksQ0FBQyxrQkFBa0IsQ0FDbkIsYUFBYSxFQUFFLGFBQWEsQ0FBQyw4QkFBOEIsRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLHdCQUF3QixFQUFFLEVBQS9CLENBQStCLENBQUMsQ0FBQztRQUM1RyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw0QkFBNEIsR0FBRyxJQUFJLENBQUM7SUFDN0MsQ0FBQztJQUVPLHdEQUF3QixHQUFoQyxVQUFpQyxXQUFtQztRQUFwRSxpQkFRQztRQVBHLElBQUksQ0FBQyxJQUFJLENBQUMsNEJBQTRCLEVBQUU7WUFDcEMsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7U0FDckM7UUFFRCxJQUFJLENBQUMsdUJBQXVCLENBQUMsVUFBQyxTQUFTO1lBQ25DLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsS0FBSSxDQUFDLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQzFHLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQXpFbUM7UUFBbkMsV0FBVyxDQUFDLHFCQUFxQixDQUFDO3NFQUF3RDtJQUNqRTtRQUF6QixTQUFTLENBQUMsYUFBYSxDQUFDOzhEQUEyQztJQXlFeEUsNEJBQUM7Q0FBQSxBQTNFRCxDQUF1RCxTQUFTLEdBMkUvRDtTQTNFWSxxQkFBcUIifQ==