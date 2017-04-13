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
var sortService_1 = require("../../rowNodes/sortService");
var SortStage = (function () {
    function SortStage() {
    }
    SortStage.prototype.execute = function (params) {
        // if the sorting is already done by the server, then we should not do it here
        if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
            this.sortService.sort(params.rowNode, null);
        }
        else {
            this.sortService.sortAccordingToColumnsState(params.rowNode);
        }
    };
    return SortStage;
}());
__decorate([
    context_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], SortStage.prototype, "gridOptionsWrapper", void 0);
__decorate([
    context_1.Autowired('sortService'),
    __metadata("design:type", sortService_1.SortService)
], SortStage.prototype, "sortService", void 0);
SortStage = __decorate([
    context_1.Bean('sortStage')
], SortStage);
exports.SortStage = SortStage;
