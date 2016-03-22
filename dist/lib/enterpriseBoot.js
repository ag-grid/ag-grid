// ag-grid-enterprise v4.0.7
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var main_1 = require("ag-grid/main");
var main_2 = require("ag-grid/main");
var main_3 = require("ag-grid/main");
var main_4 = require("ag-grid/main");
var setFilter_1 = require("./setFilter/setFilter");
var EnterpriseBoot = (function () {
    function EnterpriseBoot() {
    }
    EnterpriseBoot.prototype.init = function () {
        this.filterManager.registerFilter('set', setFilter_1.SetFilter);
    };
    __decorate([
        main_2.Autowired('filterManager'), 
        __metadata('design:type', main_3.FilterManager)
    ], EnterpriseBoot.prototype, "filterManager", void 0);
    __decorate([
        main_4.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], EnterpriseBoot.prototype, "init", null);
    EnterpriseBoot = __decorate([
        main_1.Bean('enterpriseBoot'), 
        __metadata('design:paramtypes', [])
    ], EnterpriseBoot);
    return EnterpriseBoot;
})();
exports.EnterpriseBoot = EnterpriseBoot;
