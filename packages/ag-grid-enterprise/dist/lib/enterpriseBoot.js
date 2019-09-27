// ag-grid-enterprise v21.2.2
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
var ag_grid_community_1 = require("ag-grid-community");
var setFilter_1 = require("./setFilter/setFilter");
var richSelectCellEditor_1 = require("./rendering/richSelect/richSelectCellEditor");
var licenseManager_1 = require("./licenseManager");
var detailCellRenderer_1 = require("./rendering/detail/detailCellRenderer");
var totalRowsComp_1 = require("./statusBar/providedPanels/totalRowsComp");
var totalAndFilteredRowsComp_1 = require("./statusBar/providedPanels/totalAndFilteredRowsComp");
var columnToolPanel_1 = require("./sideBar/providedPanels/columns/columnToolPanel");
var aggregationComp_1 = require("./statusBar/providedPanels/aggregationComp");
var selectedRowsComp_1 = require("./statusBar/providedPanels/selectedRowsComp");
var filteredRowsComp_1 = require("./statusBar/providedPanels/filteredRowsComp");
var filtersToolPanel_1 = require("./sideBar/providedPanels/filters/filtersToolPanel");
var setFloatingFilter_1 = require("./setFilter/setFloatingFilter");
var EnterpriseBoot = /** @class */ (function () {
    function EnterpriseBoot() {
    }
    EnterpriseBoot.prototype.init = function () {
        this.userComponentRegistry.registerDefaultComponent('agRichSelect', richSelectCellEditor_1.RichSelectCellEditor);
        this.userComponentRegistry.registerDefaultComponent('agRichSelectCellEditor', richSelectCellEditor_1.RichSelectCellEditor);
        this.userComponentRegistry.registerDefaultComponent('agSetColumnFilter', setFilter_1.SetFilter);
        this.userComponentRegistry.registerDefaultComponent('agSetColumnFloatingFilter', setFloatingFilter_1.SetFloatingFilterComp);
        this.userComponentRegistry.registerDefaultComponent('agDetailCellRenderer', detailCellRenderer_1.DetailCellRenderer);
        this.userComponentRegistry.registerDefaultComponent('agAggregationComponent', aggregationComp_1.AggregationComp);
        this.userComponentRegistry.registerDefaultComponent('agColumnsToolPanel', columnToolPanel_1.ColumnToolPanel);
        this.userComponentRegistry.registerDefaultComponent('agFiltersToolPanel', filtersToolPanel_1.FiltersToolPanel);
        this.userComponentRegistry.registerDefaultComponent('agSelectedRowCountComponent', selectedRowsComp_1.SelectedRowsComp);
        this.userComponentRegistry.registerDefaultComponent('agTotalRowCountComponent', totalRowsComp_1.TotalRowsComp);
        this.userComponentRegistry.registerDefaultComponent('agFilteredRowCountComponent', filteredRowsComp_1.FilteredRowsComp);
        this.userComponentRegistry.registerDefaultComponent('agTotalAndFilteredRowCountComponent', totalAndFilteredRowsComp_1.TotalAndFilteredRowsComp);
    };
    __decorate([
        ag_grid_community_1.Autowired('filterManager'),
        __metadata("design:type", ag_grid_community_1.FilterManager)
    ], EnterpriseBoot.prototype, "filterManager", void 0);
    __decorate([
        ag_grid_community_1.Autowired('licenseManager'),
        __metadata("design:type", licenseManager_1.LicenseManager)
    ], EnterpriseBoot.prototype, "licenseManager", void 0);
    __decorate([
        ag_grid_community_1.Autowired('userComponentRegistry'),
        __metadata("design:type", ag_grid_community_1.UserComponentRegistry)
    ], EnterpriseBoot.prototype, "userComponentRegistry", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], EnterpriseBoot.prototype, "init", null);
    EnterpriseBoot = __decorate([
        ag_grid_community_1.Bean('enterpriseBoot')
    ], EnterpriseBoot);
    return EnterpriseBoot;
}());
exports.EnterpriseBoot = EnterpriseBoot;
