/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var context_1 = require("../../context/context");
var constants_1 = require("../../constants/constants");
var beanStub_1 = require("../../context/beanStub");
/**
 * For Master Detail, it is required to keep components between expanding & collapsing parents.
 * For example a user expands row A (and shows a detail grid for this row), then when row A
 * is closed, we want to keep the detail grid, so next time row A is expanded the detail grid
 * is showed with it's context intact, eg if user sorted in the detail grid, that sort should
 * still be applied after the detail grid is shown for the second time.
 */
var DetailRowCompCache = /** @class */ (function (_super) {
    __extends(DetailRowCompCache, _super);
    function DetailRowCompCache() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.cacheItems = [];
        return _this;
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
            case constants_1.Constants.PINNED_LEFT:
                this.destroyFullWidthRow(item.left);
                item.left = comp;
                break;
            case constants_1.Constants.PINNED_RIGHT:
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
        var res = null;
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
        this.getContext().destroyBean(comp);
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
            return;
        }
        var item = this.getCacheItem(rowNode);
        var res;
        if (item) {
            switch (pinned) {
                case constants_1.Constants.PINNED_LEFT:
                    if (item.left) {
                        res = item.left;
                        item.left = undefined;
                    }
                    break;
                case constants_1.Constants.PINNED_RIGHT:
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
        _super.prototype.destroy.call(this);
        this.purgeCache(0);
    };
    __decorate([
        context_1.PostConstruct
    ], DetailRowCompCache.prototype, "postConstruct", null);
    __decorate([
        context_1.PreDestroy
    ], DetailRowCompCache.prototype, "destroy", null);
    DetailRowCompCache = __decorate([
        context_1.Bean('detailRowCompCache')
    ], DetailRowCompCache);
    return DetailRowCompCache;
}(beanStub_1.BeanStub));
exports.DetailRowCompCache = DetailRowCompCache;

//# sourceMappingURL=detailRowCompCache.js.map
