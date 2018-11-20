// ag-grid-enterprise v19.1.3
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
var rowGroupDropZonePanel_1 = require("./sideBar/providedPanels/columns/panels/rowGroupDropZonePanel");
var RowGroupCompFactory = /** @class */ (function () {
    function RowGroupCompFactory() {
    }
    RowGroupCompFactory.prototype.create = function () {
        var rowGroupComp = new rowGroupDropZonePanel_1.RowGroupDropZonePanel(true);
        this.context.wireBean(rowGroupComp);
        return rowGroupComp;
    };
    __decorate([
        ag_grid_community_1.Autowired('context'),
        __metadata("design:type", ag_grid_community_1.Context)
    ], RowGroupCompFactory.prototype, "context", void 0);
    RowGroupCompFactory = __decorate([
        ag_grid_community_1.Bean('rowGroupCompFactory')
    ], RowGroupCompFactory);
    return RowGroupCompFactory;
}());
exports.RowGroupCompFactory = RowGroupCompFactory;
