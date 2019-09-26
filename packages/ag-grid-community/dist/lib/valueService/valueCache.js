/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
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
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var ValueCache = /** @class */ (function () {
    function ValueCache() {
        this.cacheVersion = 0;
    }
    ValueCache.prototype.init = function () {
        this.active = this.gridOptionsWrapper.isValueCache();
        this.neverExpires = this.gridOptionsWrapper.isValueCacheNeverExpires();
    };
    ValueCache.prototype.onDataChanged = function () {
        if (this.neverExpires) {
            return;
        }
        this.expire();
    };
    ValueCache.prototype.expire = function () {
        this.cacheVersion++;
    };
    ValueCache.prototype.setValue = function (rowNode, colId, value) {
        if (this.active) {
            if (rowNode.__cacheVersion !== this.cacheVersion) {
                rowNode.__cacheVersion = this.cacheVersion;
                rowNode.__cacheData = {};
            }
            rowNode.__cacheData[colId] = value;
        }
    };
    ValueCache.prototype.getValue = function (rowNode, colId) {
        var valueInCache = this.active
            && rowNode.__cacheVersion === this.cacheVersion
            && rowNode.__cacheData[colId] !== undefined;
        if (valueInCache) {
            return rowNode.__cacheData[colId];
        }
        else {
            return undefined;
        }
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], ValueCache.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ValueCache.prototype, "init", null);
    ValueCache = __decorate([
        context_1.Bean('valueCache')
    ], ValueCache);
    return ValueCache;
}());
exports.ValueCache = ValueCache;
