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
var column_1 = require("../entities/column");
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
/**
 * For Master Detail, it is required to keep components between expanding & collapsing parents.
 * For example a user expands row A (and shows a detail grid for this row), then when row A
 * is closed, we want to keep the detail grid, so next time row A is expanded the detail grid
 * is showed with it's context intact, eg if user sorted in the detail grid, that sort should
 * still be applied after the detail grid is shown for the second time.
 */
var DetailRowCompCache = /** @class */ (function () {
    function DetailRowCompCache() {
        this.cacheItems = [];
    }
    DetailRowCompCache.prototype.postConstruct = function () {
        this.active = this.gridOptionsWrapper.isKeepDetailRows();
        this.maxCacheSize = this.gridOptionsWrapper.getKeepDetailRowsCount();
    };
    DetailRowCompCache.prototype.addOrDestroy = function (rowNode, pinned, comp) {
        // only accept detail rows
        var doNotUseCache = !this.active || !rowNode.detail;
        if (doNotUseCache) {
            this.destroyFullWidthRow(comp);
            return;
        }
        var item = this.getCacheItem(rowNode, true);
        // put the comp in the right location of the item.
        // we also destroy any previous comp - this should never happen
        // as the logic outside of this class shouldn't be adding same item to the
        // cache twice, however we cater for it in case in future releases code
        // outside of this class is changed and this could happen.
        switch (pinned) {
            case column_1.Column.PINNED_LEFT:
                this.destroyFullWidthRow(item.left);
                item.left = comp;
                break;
            case column_1.Column.PINNED_RIGHT:
                this.destroyFullWidthRow(item.right);
                item.right = comp;
                break;
            default:
                this.destroyFullWidthRow(item.center);
                item.center = comp;
                break;
        }
        this.cacheItems.sort(function (a, b) {
            return b.lastAccessedTime - a.lastAccessedTime;
        });
        this.purgeCache(this.maxCacheSize);
    };
    DetailRowCompCache.prototype.getCacheItem = function (rowNode, autoCreate) {
        if (autoCreate === void 0) { autoCreate = false; }
        var res;
        for (var i = 0; i < this.cacheItems.length; i++) {
            var item = this.cacheItems[i];
            if (item.rowNode === rowNode) {
                res = item;
                break;
            }
        }
        if (!res && autoCreate) {
            res = {
                rowNode: rowNode
            };
            this.cacheItems.push(res);
        }
        if (res) {
            this.stampCacheItem(res);
        }
        return res;
    };
    DetailRowCompCache.prototype.stampCacheItem = function (item) {
        item.lastAccessedTime = new Date().getTime();
    };
    DetailRowCompCache.prototype.destroyFullWidthRow = function (comp) {
        if (comp && comp.destroy) {
            comp.destroy();
        }
    };
    DetailRowCompCache.prototype.purgeCache = function (startIndex) {
        // delete all rows past the index of interest
        for (var i = startIndex; i < this.cacheItems.length; i++) {
            var item = this.cacheItems[i];
            this.destroyFullWidthRow(item.center);
            this.destroyFullWidthRow(item.left);
            this.destroyFullWidthRow(item.right);
        }
        // change the length of the array so it no longer contains the deleted items
        if (this.cacheItems.length > startIndex) {
            this.cacheItems.length = startIndex;
        }
    };
    DetailRowCompCache.prototype.get = function (rowNode, pinned) {
        if (!rowNode.detail) {
            return undefined;
        }
        var item = this.getCacheItem(rowNode);
        var res;
        if (item) {
            switch (pinned) {
                case column_1.Column.PINNED_LEFT:
                    if (item.left) {
                        res = item.left;
                        item.left = undefined;
                    }
                    break;
                case column_1.Column.PINNED_RIGHT:
                    if (item.right) {
                        res = item.right;
                        item.right = undefined;
                    }
                    break;
                default:
                    if (item.center) {
                        res = item.center;
                        item.center = undefined;
                    }
                    break;
            }
        }
        return res;
    };
    DetailRowCompCache.prototype.destroy = function () {
        this.purgeCache(0);
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], DetailRowCompCache.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], DetailRowCompCache.prototype, "postConstruct", null);
    __decorate([
        context_1.PreDestroy,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], DetailRowCompCache.prototype, "destroy", null);
    DetailRowCompCache = __decorate([
        context_1.Bean('detailRowCompCache')
    ], DetailRowCompCache);
    return DetailRowCompCache;
}());
exports.DetailRowCompCache = DetailRowCompCache;
