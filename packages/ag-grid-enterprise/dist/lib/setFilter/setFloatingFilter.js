// ag-grid-enterprise v21.2.2
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
var ag_grid_community_1 = require("ag-grid-community");
var SetFloatingFilterComp = /** @class */ (function (_super) {
    __extends(SetFloatingFilterComp, _super);
    function SetFloatingFilterComp() {
        return _super.call(this, "<div class=\"ag-input-wrapper\" role=\"presentation\"><input ref=\"eFloatingFilterText\" class=\"ag-floating-filter-input\"></div>") || this;
    }
    SetFloatingFilterComp.prototype.init = function (params) {
        this.eFloatingFilterText.disabled = true;
        this.column = params.column;
    };
    SetFloatingFilterComp.prototype.onParentModelChanged = function (parentModel) {
        if (!parentModel) {
            this.eFloatingFilterText.value = '';
            return;
        }
        // also supporting old filter model for backwards compatibility
        var values = (parentModel instanceof Array) ? parentModel : parentModel.values;
        if (!values || values.length === 0) {
            this.eFloatingFilterText.value = '';
            return;
        }
        // format all the values, if a formatter is provided
        for (var i = 0; i < values.length; i++) {
            var valueUnformatted = values[i];
            var valueFormatted = this.valueFormatterService.formatValue(this.column, null, null, valueUnformatted);
            if (valueFormatted != null) {
                values[i] = valueFormatted;
            }
        }
        var arrayToDisplay = values.length > 10 ? values.slice(0, 10).concat('...') : values;
        var valuesString = "(" + values.length + ") " + arrayToDisplay.join(",");
        this.eFloatingFilterText.value = valuesString;
    };
    __decorate([
        ag_grid_community_1.RefSelector('eFloatingFilterText'),
        __metadata("design:type", HTMLInputElement)
    ], SetFloatingFilterComp.prototype, "eFloatingFilterText", void 0);
    __decorate([
        ag_grid_community_1.Autowired('valueFormatterService'),
        __metadata("design:type", ag_grid_community_1.ValueFormatterService)
    ], SetFloatingFilterComp.prototype, "valueFormatterService", void 0);
    return SetFloatingFilterComp;
}(ag_grid_community_1.Component));
exports.SetFloatingFilterComp = SetFloatingFilterComp;
