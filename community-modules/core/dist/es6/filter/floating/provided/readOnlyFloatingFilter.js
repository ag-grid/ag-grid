/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
import { Component } from "../../../widgets/component";
import { RefSelector } from "../../../widgets/componentAnnotations";
// optional floating filter for user provided filters - instead of providing a floating filter,
// they can provide a getModelAsString() method on the filter instead. this class just displays
// the string returned from getModelAsString()
var ReadOnlyFloatingFilter = /** @class */ (function (_super) {
    __extends(ReadOnlyFloatingFilter, _super);
    function ReadOnlyFloatingFilter() {
        return _super.call(this, "<div class=\"ag-floating-filter-input\" role=\"presentation\"><ag-input-text-field ref=\"eFloatingFilterText\"></ag-input-text-field></div>") || this;
    }
    ReadOnlyFloatingFilter.prototype.init = function (params) {
        this.params = params;
        this.eFloatingFilterText.setDisabled(true);
    };
    ReadOnlyFloatingFilter.prototype.onParentModelChanged = function (parentModel) {
        var _this = this;
        if (!parentModel) {
            this.eFloatingFilterText.setValue('');
            return;
        }
        this.params.parentFilterInstance(function (filterInstance) {
            // getModelAsString should be present, as we check this
            // in floatingFilterWrapper
            if (filterInstance.getModelAsString) {
                var modelAsString = filterInstance.getModelAsString(parentModel);
                _this.eFloatingFilterText.setValue(modelAsString);
            }
        });
    };
    __decorate([
        RefSelector('eFloatingFilterText')
    ], ReadOnlyFloatingFilter.prototype, "eFloatingFilterText", void 0);
    return ReadOnlyFloatingFilter;
}(Component));
export { ReadOnlyFloatingFilter };
