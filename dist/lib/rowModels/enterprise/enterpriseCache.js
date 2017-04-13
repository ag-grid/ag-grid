// ag-grid-enterprise v9.0.3
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ag_grid_1 = require("ag-grid");
var EnterpriseCache = (function (_super) {
    __extends(EnterpriseCache, _super);
    function EnterpriseCache(params) {
        var _this = _super.call(this, params) || this;
        _this.params = params;
        return _this;
    }
    EnterpriseCache.prototype.dispatchModelUpdated = function () {
        if (this.isActive()) {
            this.eventService.dispatchEvent(ag_grid_1.Events.EVENT_MODEL_UPDATED);
        }
    };
    return EnterpriseCache;
}(ag_grid_1.RowNodeCache));
__decorate([
    ag_grid_1.Autowired('eventService'),
    __metadata("design:type", ag_grid_1.EventService)
], EnterpriseCache.prototype, "eventService", void 0);
exports.EnterpriseCache = EnterpriseCache;
var EnterpriseBlock = (function (_super) {
    __extends(EnterpriseBlock, _super);
    function EnterpriseBlock(pageNumber, params) {
        return _super.call(this, pageNumber, params) || this;
    }
    EnterpriseBlock.prototype.init = function () {
        _super.prototype.init.call(this, {
            context: this.context
        });
    };
    EnterpriseBlock.prototype.setTopOnRowNode = function (rowNode, rowIndex) {
    };
    EnterpriseBlock.prototype.loadFromDatasource = function () {
    };
    return EnterpriseBlock;
}(ag_grid_1.RowNodeBlock));
__decorate([
    ag_grid_1.Autowired('context'),
    __metadata("design:type", ag_grid_1.Context)
], EnterpriseBlock.prototype, "context", void 0);
__decorate([
    ag_grid_1.PostConstruct,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EnterpriseBlock.prototype, "init", null);
exports.EnterpriseBlock = EnterpriseBlock;
