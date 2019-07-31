/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("../../../widgets/component");
var componentAnnotations_1 = require("../../../widgets/componentAnnotations");
// optional floating filter for user provided filters - instead of providing a floating filter,
// they can provide a getModelAsString() method on the filter instead. this class just displays
// the string returned from getModelAsString()
var ReadOnlyFloatingFilter = /** @class */ (function (_super) {
    __extends(ReadOnlyFloatingFilter, _super);
    function ReadOnlyFloatingFilter() {
        return _super.call(this, "<div class=\"ag-input-wrapper\"><input ref=\"eFloatingFilterText\" class=\"ag-floating-filter-input\"></div>") || this;
    }
    ReadOnlyFloatingFilter.prototype.init = function (params) {
        this.params = params;
        this.eFloatingFilterText.disabled = true;
    };
    ReadOnlyFloatingFilter.prototype.onParentModelChanged = function (parentModel) {
        var _this = this;
        if (!parentModel) {
            this.eFloatingFilterText.value = '';
            return;
        }
        this.params.parentFilterInstance(function (filterInstance) {
            // getModelAsString should be present, as we check this
            // in floatingFilterWrapper
            if (filterInstance.getModelAsString) {
                var modelAsString = filterInstance.getModelAsString(parentModel);
                _this.eFloatingFilterText.value = modelAsString;
            }
        });
    };
    __decorate([
        componentAnnotations_1.RefSelector('eFloatingFilterText'),
        __metadata("design:type", HTMLInputElement)
    ], ReadOnlyFloatingFilter.prototype, "eFloatingFilterText", void 0);
    return ReadOnlyFloatingFilter;
}(component_1.Component));
exports.ReadOnlyFloatingFilter = ReadOnlyFloatingFilter;
