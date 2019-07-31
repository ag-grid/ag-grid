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
var componentAnnotations_1 = require("../../../widgets/componentAnnotations");
var utils_1 = require("../../../utils");
var constants_1 = require("../../../constants");
var providedFilter_1 = require("../../provided/providedFilter");
var context_1 = require("../../../context/context");
var simpleFloatingFilter_1 = require("./simpleFloatingFilter");
var TextInputFloatingFilter = /** @class */ (function (_super) {
    __extends(TextInputFloatingFilter, _super);
    function TextInputFloatingFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TextInputFloatingFilter.prototype.postConstruct = function () {
        this.setTemplate("<div class=\"ag-input-wrapper\">\n                <input ref=\"eFloatingFilterText\" class=\"ag-floating-filter-input\">\n            </div>");
    };
    TextInputFloatingFilter.prototype.getDefaultDebounceMs = function () {
        return 500;
    };
    TextInputFloatingFilter.prototype.onParentModelChanged = function (model, event) {
        // we don't want to update the floating filter if the floating filter caused the change.
        // as if it caused the change, the ui is already in sycn. if we didn't do this, the UI
        // would behave strange as it would be updating as the user is typing
        if (this.isEventFromFloatingFilter(event)) {
            return;
        }
        this.setLastTypeFromModel(model);
        var modelString = this.getTextFromModel(model);
        this.eFloatingFilterText.value = modelString;
        var editable = this.canWeEditAfterModelFromParentFilter(model);
        this.setEditable(editable);
    };
    TextInputFloatingFilter.prototype.init = function (params) {
        _super.prototype.init.call(this, params);
        this.params = params;
        this.applyActive = providedFilter_1.ProvidedFilter.isUseApplyButton(this.params.filterParams);
        var debounceMs = providedFilter_1.ProvidedFilter.getDebounceMs(this.params.filterParams, this.getDefaultDebounceMs());
        var toDebounce = utils_1._.debounce(this.syncUpWithParentFilter.bind(this), debounceMs);
        this.addDestroyableEventListener(this.eFloatingFilterText, 'input', toDebounce);
        this.addDestroyableEventListener(this.eFloatingFilterText, 'keypress', toDebounce);
        this.addDestroyableEventListener(this.eFloatingFilterText, 'keydown', toDebounce);
        var columnDef = params.column.getDefinition();
        if (columnDef.filterParams && columnDef.filterParams.filterOptions && columnDef.filterParams.filterOptions.length === 1 && columnDef.filterParams.filterOptions[0] === 'inRange') {
            this.eFloatingFilterText.disabled = true;
        }
    };
    TextInputFloatingFilter.prototype.syncUpWithParentFilter = function (e) {
        var _this = this;
        var value = this.eFloatingFilterText.value;
        var enterKeyPressed = utils_1._.isKeyPressed(e, constants_1.Constants.KEY_ENTER);
        if (this.applyActive && !enterKeyPressed) {
            return;
        }
        this.params.parentFilterInstance(function (filterInstance) {
            if (filterInstance) {
                var simpleFilter = filterInstance;
                simpleFilter.onFloatingFilterChanged(_this.getLastType(), value);
            }
        });
    };
    TextInputFloatingFilter.prototype.setEditable = function (editable) {
        this.eFloatingFilterText.disabled = !editable;
    };
    __decorate([
        componentAnnotations_1.RefSelector('eFloatingFilterText'),
        __metadata("design:type", HTMLInputElement)
    ], TextInputFloatingFilter.prototype, "eFloatingFilterText", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], TextInputFloatingFilter.prototype, "postConstruct", null);
    return TextInputFloatingFilter;
}(simpleFloatingFilter_1.SimpleFloatingFilter));
exports.TextInputFloatingFilter = TextInputFloatingFilter;
