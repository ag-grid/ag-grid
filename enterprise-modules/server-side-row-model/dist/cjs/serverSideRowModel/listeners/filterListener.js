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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var FilterListener = /** @class */ (function (_super) {
    __extends(FilterListener, _super);
    function FilterListener() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FilterListener.prototype.postConstruct = function () {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsWrapper.isRowModelServerSide()) {
            return;
        }
        this.addManagedListener(this.eventService, core_1.Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
    };
    FilterListener.prototype.onFilterChanged = function () {
        var newModel = this.filterManager.getFilterModel();
        this.serverSideRowModel.refreshStoreAfterFilter(newModel);
    };
    __decorate([
        core_1.Autowired('rowModel')
    ], FilterListener.prototype, "serverSideRowModel", void 0);
    __decorate([
        core_1.Autowired('filterManager')
    ], FilterListener.prototype, "filterManager", void 0);
    __decorate([
        core_1.Autowired('gridOptionsWrapper')
    ], FilterListener.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        core_1.PostConstruct
    ], FilterListener.prototype, "postConstruct", null);
    FilterListener = __decorate([
        core_1.Bean('ssrmFilterListener')
    ], FilterListener);
    return FilterListener;
}(core_1.BeanStub));
exports.FilterListener = FilterListener;
//# sourceMappingURL=filterListener.js.map