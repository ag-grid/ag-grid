/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
var context_1 = require("../../context/context");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var filterService_1 = require("../../rowNodes/filterService");
var FilterStage = (function () {
    function FilterStage() {
    }
    FilterStage.prototype.execute = function (params) {
        var rowNode = params.rowNode;
        if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
            this.filterService.filter(rowNode, false);
        }
        else {
            this.filterService.filterAccordingToColumnState(rowNode);
        }
    };
    return FilterStage;
}());
__decorate([
    context_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], FilterStage.prototype, "gridOptionsWrapper", void 0);
__decorate([
    context_1.Autowired('filterService'),
    __metadata("design:type", filterService_1.FilterService)
], FilterStage.prototype, "filterService", void 0);
FilterStage = __decorate([
    context_1.Bean('filterStage')
], FilterStage);
exports.FilterStage = FilterStage;
