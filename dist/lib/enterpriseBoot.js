// ag-grid-enterprise v13.2.0
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
var main_1 = require("ag-grid/main");
var setFilter_1 = require("./setFilter/setFilter");
var richSelectCellEditor_1 = require("./rendering/richSelect/richSelectCellEditor");
var licenseManager_1 = require("./licenseManager");
var EnterpriseBoot = (function () {
    function EnterpriseBoot() {
    }
    EnterpriseBoot_1 = EnterpriseBoot;
    EnterpriseBoot.prototype.init = function () {
        this.filterManager.registerFilter('set', setFilter_1.SetFilter);
        this.cellEditorFactory.addCellEditor(EnterpriseBoot_1.RICH_SELECT, richSelectCellEditor_1.RichSelectCellEditor);
        this.licenseManager.validateLicense();
    };
    EnterpriseBoot.RICH_SELECT = 'richSelect';
    __decorate([
        main_1.Autowired('filterManager'),
        __metadata("design:type", main_1.FilterManager)
    ], EnterpriseBoot.prototype, "filterManager", void 0);
    __decorate([
        main_1.Autowired('cellEditorFactory'),
        __metadata("design:type", main_1.CellEditorFactory)
    ], EnterpriseBoot.prototype, "cellEditorFactory", void 0);
    __decorate([
        main_1.Autowired('licenseManager'),
        __metadata("design:type", licenseManager_1.LicenseManager)
    ], EnterpriseBoot.prototype, "licenseManager", void 0);
    __decorate([
        main_1.PreConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], EnterpriseBoot.prototype, "init", null);
    EnterpriseBoot = EnterpriseBoot_1 = __decorate([
        main_1.Bean('enterpriseBoot')
    ], EnterpriseBoot);
    return EnterpriseBoot;
    var EnterpriseBoot_1;
}());
exports.EnterpriseBoot = EnterpriseBoot;
