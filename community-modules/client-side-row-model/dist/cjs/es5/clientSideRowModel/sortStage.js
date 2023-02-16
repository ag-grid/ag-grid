"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
exports.SortStage = void 0;
var core_1 = require("@ag-grid-community/core");
var SortStage = /** @class */ (function (_super) {
    __extends(SortStage, _super);
    function SortStage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SortStage.prototype.execute = function (params) {
        var _this = this;
        var sortOptions = this.sortController.getSortOptions();
        var sortActive = core_1._.exists(sortOptions) && sortOptions.length > 0;
        var deltaSort = sortActive
            && core_1._.exists(params.rowNodeTransactions)
            // in time we can remove this check, so that delta sort is always
            // on if transactions are present. it's off for now so that we can
            // selectively turn it on and test it with some select users before
            // rolling out to everyone.
            && this.gridOptionsService.is('deltaSort');
        var sortContainsGroupColumns = sortOptions.some(function (opt) { return !!_this.columnModel.getGroupDisplayColumnForGroup(opt.column.getId()); });
        this.sortService.sort(sortOptions, sortActive, deltaSort, params.rowNodeTransactions, params.changedPath, sortContainsGroupColumns);
    };
    __decorate([
        core_1.Autowired('sortService')
    ], SortStage.prototype, "sortService", void 0);
    __decorate([
        core_1.Autowired('sortController')
    ], SortStage.prototype, "sortController", void 0);
    __decorate([
        core_1.Autowired('columnModel')
    ], SortStage.prototype, "columnModel", void 0);
    SortStage = __decorate([
        core_1.Bean('sortStage')
    ], SortStage);
    return SortStage;
}(core_1.BeanStub));
exports.SortStage = SortStage;
