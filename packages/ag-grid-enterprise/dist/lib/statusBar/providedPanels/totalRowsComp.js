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
var TotalRowsComp = /** @class */ (function (_super) {
    __extends(TotalRowsComp, _super);
    function TotalRowsComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TotalRowsComp.prototype.postConstruct = function () {
        this.setLabel('totalRows', 'Total Rows');
        // this component is only really useful with client side row model
        if (this.gridApi.getModel().getType() !== 'clientSide') {
            console.warn("ag-Grid: agTotalRowCountComponent should only be used with the client side row model.");
            return;
        }
        this.addCssClass('ag-status-panel');
        this.addCssClass('ag-status-panel-total-row-count');
        this.setDisplayed(true);
        var listener = this.onDataChanged.bind(this);
        this.eventService.addEventListener(ag_grid_community_1.Events.EVENT_MODEL_UPDATED, listener);
    };
    TotalRowsComp.prototype.onDataChanged = function () {
        this.setValue(this.getRowCountValue());
    };
    TotalRowsComp.prototype.getRowCountValue = function () {
        var totalRowCount = 0;
        this.gridApi.forEachLeafNode(function (node) { return totalRowCount += 1; });
        return "" + totalRowCount;
    };
    TotalRowsComp.prototype.init = function () {
    };
    __decorate([
        ag_grid_community_1.Autowired('eventService'),
        __metadata("design:type", ag_grid_community_1.EventService)
    ], TotalRowsComp.prototype, "eventService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridApi'),
        __metadata("design:type", ag_grid_community_1.GridApi)
    ], TotalRowsComp.prototype, "gridApi", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], TotalRowsComp.prototype, "postConstruct", null);
    return TotalRowsComp;
}(nameValueComp_1.NameValueComp));
exports.TotalRowsComp = TotalRowsComp;
