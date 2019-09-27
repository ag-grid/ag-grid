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
var nameValueComp_1 = require("./nameValueComp");
var FilteredRowsComp = /** @class */ (function (_super) {
    __extends(FilteredRowsComp, _super);
    function FilteredRowsComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FilteredRowsComp.prototype.postConstruct = function () {
        this.setLabel('filteredRows', 'Filtered');
        // this component is only really useful with client side row model
        if (this.gridApi.getModel().getType() !== 'clientSide') {
            console.warn("ag-Grid: agFilteredRowCountComponent should only be used with the client side row model.");
            return;
        }
        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-filtered-row-count');
        this.setDisplayed(true);
        var listener = this.onDataChanged.bind(this);
        this.eventService.addEventListener(ag_grid_community_1.Events.EVENT_MODEL_UPDATED, listener);
    };
    FilteredRowsComp.prototype.onDataChanged = function () {
        var totalRowCountValue = this.getTotalRowCountValue();
        var filteredRowCountValue = this.getFilteredRowCountValue();
        this.setValue(filteredRowCountValue);
        this.setDisplayed(totalRowCountValue !== filteredRowCountValue);
    };
    FilteredRowsComp.prototype.getTotalRowCountValue = function () {
        var totalRowCount = 0;
        this.gridApi.forEachNode(function (node) { return totalRowCount += 1; });
        return totalRowCount;
    };
    FilteredRowsComp.prototype.getFilteredRowCountValue = function () {
        var filteredRowCount = 0;
        this.gridApi.forEachNodeAfterFilter(function (node) {
            if (!node.group) {
                filteredRowCount += 1;
            }
        });
        return filteredRowCount;
    };
    FilteredRowsComp.prototype.init = function () { };
    __decorate([
        ag_grid_community_1.Autowired('eventService'),
        __metadata("design:type", ag_grid_community_1.EventService)
    ], FilteredRowsComp.prototype, "eventService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridApi'),
        __metadata("design:type", ag_grid_community_1.GridApi)
    ], FilteredRowsComp.prototype, "gridApi", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], FilteredRowsComp.prototype, "postConstruct", null);
    return FilteredRowsComp;
}(nameValueComp_1.NameValueComp));
exports.FilteredRowsComp = FilteredRowsComp;
