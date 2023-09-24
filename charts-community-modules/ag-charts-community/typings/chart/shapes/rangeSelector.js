"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RangeSelector = void 0;
var group_1 = require("../../scene/group");
var rangeHandle_1 = require("./rangeHandle");
var rangeMask_1 = require("./rangeMask");
var node_1 = require("../../scene/node");
var RangeSelector = /** @class */ (function (_super) {
    __extends(RangeSelector, _super);
    function RangeSelector() {
        var _this = _super.call(this, { name: 'rangeSelectorGroup' }) || this;
        _this.minHandle = new rangeHandle_1.RangeHandle();
        _this.maxHandle = new rangeHandle_1.RangeHandle();
        _this.mask = (function () {
            var _a = RangeSelector.defaults, x = _a.x, y = _a.y, width = _a.width, height = _a.height, min = _a.min, max = _a.max;
            var mask = new rangeMask_1.RangeMask();
            mask.x = x;
            mask.y = y;
            mask.width = width;
            mask.height = height;
            mask.min = min;
            mask.max = max;
            var _b = _this, minHandle = _b.minHandle, maxHandle = _b.maxHandle;
            minHandle.centerX = x;
            maxHandle.centerX = x + width;
            minHandle.centerY = maxHandle.centerY = y + height / 2;
            _this.append([mask, minHandle, maxHandle]);
            mask.onRangeChange = function () {
                var _a;
                _this.updateHandles();
                (_a = _this.onRangeChange) === null || _a === void 0 ? void 0 : _a.call(_this);
            };
            return mask;
        })();
        _this._x = RangeSelector.defaults.x;
        _this._y = RangeSelector.defaults.y;
        _this._width = RangeSelector.defaults.width;
        _this._height = RangeSelector.defaults.height;
        _this._min = RangeSelector.defaults.min;
        _this._max = RangeSelector.defaults.max;
        _this.isContainerNode = true;
        return _this;
    }
    Object.defineProperty(RangeSelector.prototype, "x", {
        get: function () {
            return this.mask.x;
        },
        set: function (value) {
            this.mask.x = value;
            this.updateHandles();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RangeSelector.prototype, "y", {
        get: function () {
            return this.mask.y;
        },
        set: function (value) {
            this.mask.y = value;
            this.updateHandles();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RangeSelector.prototype, "width", {
        get: function () {
            return this.mask.width;
        },
        set: function (value) {
            this.mask.width = value;
            this.updateHandles();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RangeSelector.prototype, "height", {
        get: function () {
            return this.mask.height;
        },
        set: function (value) {
            this.mask.height = value;
            this.updateHandles();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RangeSelector.prototype, "min", {
        get: function () {
            return this.mask.min;
        },
        set: function (value) {
            this.mask.min = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RangeSelector.prototype, "max", {
        get: function () {
            return this.mask.max;
        },
        set: function (value) {
            this.mask.max = value;
        },
        enumerable: false,
        configurable: true
    });
    RangeSelector.prototype.updateHandles = function () {
        var _a = this, minHandle = _a.minHandle, maxHandle = _a.maxHandle, x = _a.x, y = _a.y, width = _a.width, height = _a.height, mask = _a.mask;
        minHandle.centerX = x + width * mask.min;
        maxHandle.centerX = x + width * mask.max;
        minHandle.centerY = maxHandle.centerY = y + height / 2;
    };
    RangeSelector.prototype.computeBBox = function () {
        return this.mask.computeBBox();
    };
    RangeSelector.prototype.computeVisibleRangeBBox = function () {
        return this.mask.computeVisibleRangeBBox();
    };
    RangeSelector.prototype.render = function (renderCtx) {
        var ctx = renderCtx.ctx, forceRender = renderCtx.forceRender, stats = renderCtx.stats;
        if (this.dirty === node_1.RedrawType.NONE && !forceRender) {
            if (stats)
                stats.nodesSkipped++;
            return;
        }
        this.computeTransformMatrix();
        this.matrix.toContext(ctx);
        var _a = this, mask = _a.mask, minHandle = _a.minHandle, maxHandle = _a.maxHandle;
        [mask, minHandle, maxHandle].forEach(function (child) {
            if (child.visible && (forceRender || child.dirty > node_1.RedrawType.NONE)) {
                ctx.save();
                child.render(__assign(__assign({}, renderCtx), { ctx: ctx, forceRender: forceRender }));
                ctx.restore();
            }
        });
        this.markClean({ force: true });
        if (stats)
            stats.nodesRendered++;
    };
    RangeSelector.className = 'Range';
    RangeSelector.defaults = {
        x: 0,
        y: 0,
        width: 200,
        height: 30,
        min: 0,
        max: 1,
    };
    return RangeSelector;
}(group_1.Group));
exports.RangeSelector = RangeSelector;
//# sourceMappingURL=rangeSelector.js.map