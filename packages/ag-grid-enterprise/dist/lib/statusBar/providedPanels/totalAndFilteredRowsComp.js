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
var TotalAndFilteredRowsComp = /** @class */ (function (_super) {
    __extends(TotalAndFilteredRowsComp, _super);
    function TotalAndFilteredRowsComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TotalAndFilteredRowsComp.prototype.postConstruct = function () {
        // this component is only really useful with client side row model
        if (this.gridApi.getModel().getType() !== 'clientSide') {
            console.warn("ag-Grid: agTotalAndFilteredRowCountComponent should only be used with the client side row model.");
            return;
        }
        this.setLabel('totalAndFilteredRows', 'Rows');
        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-total-and-filtered-row-count');
        this.setDisplayed(true);
        this.addDestroyableEventListener(this.eventService, ag_grid_community_1.Events.EVENT_MODEL_UPDATED, this.onDataChanged.bind(this));
    };
    TotalAndFilteredRowsComp.prototype.onDataChanged = function () {
        var rowCount = this.getFilteredRowCountValue();
        var totalRowCount = this.getTotalRowCount();
        if (rowCount === totalRowCount) {
            this.setValue(rowCount);
        }
        else {
            var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            this.setValue(rowCount + " " + localeTextFunc('of', 'of') + " " + totalRowCount);
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
    __decorate([
        ag_grid_community_1.Autowired('gridApi'),
        __metadata("design:type", ag_grid_community_1.GridApi)
    ], TotalAndFilteredRowsComp.prototype, "gridApi", void 0);
    __decorate([
        ag_grid_community_1.Autowired('eventService'),
        __metadata("design:type", ag_grid_community_1.EventService)
    ], TotalAndFilteredRowsComp.prototype, "eventService", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], TotalAndFilteredRowsComp.prototype, "postConstruct", null);
    return TotalAndFilteredRowsComp;
}(nameValueComp_1.NameValueComp));
exports.TotalAndFilteredRowsComp = TotalAndFilteredRowsComp;
