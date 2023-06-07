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
import { Group } from '../../scene/group';
import { RangeHandle } from './rangeHandle';
import { RangeMask } from './rangeMask';
import { RedrawType } from '../../scene/node';
var RangeSelector = /** @class */ (function (_super) {
    __extends(RangeSelector, _super);
    function RangeSelector() {
        var _this = _super.call(this, { name: 'rangeSelectorGroup' }) || this;
        _this.minHandle = new RangeHandle();
        _this.maxHandle = new RangeHandle();
        _this.mask = (function () {
            var _a = RangeSelector.defaults, x = _a.x, y = _a.y, width = _a.width, height = _a.height, min = _a.min, max = _a.max;
            var mask = new RangeMask();
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
        if (this.dirty === RedrawType.NONE && !forceRender) {
            if (stats)
                stats.nodesSkipped++;
            return;
        }
        this.computeTransformMatrix();
        this.matrix.toContext(ctx);
        var _a = this, mask = _a.mask, minHandle = _a.minHandle, maxHandle = _a.maxHandle;
        [mask, minHandle, maxHandle].forEach(function (child) {
            if (child.visible && (forceRender || child.dirty > RedrawType.NONE)) {
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
}(Group));
export { RangeSelector };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZ2VTZWxlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9zaGFwZXMvcmFuZ2VTZWxlY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUMxQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzVDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFFeEMsT0FBTyxFQUFFLFVBQVUsRUFBaUIsTUFBTSxrQkFBa0IsQ0FBQztBQUU3RDtJQUFtQyxpQ0FBSztJQTRGcEM7UUFBQSxZQUNJLGtCQUFNLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFFLENBQUMsU0FHeEM7UUFwRlEsZUFBUyxHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7UUFDOUIsZUFBUyxHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7UUFDOUIsVUFBSSxHQUFHLENBQUM7WUFDUCxJQUFBLEtBQW9DLGFBQWEsQ0FBQyxRQUFRLEVBQXhELENBQUMsT0FBQSxFQUFFLENBQUMsT0FBQSxFQUFFLEtBQUssV0FBQSxFQUFFLE1BQU0sWUFBQSxFQUFFLEdBQUcsU0FBQSxFQUFFLEdBQUcsU0FBMkIsQ0FBQztZQUNqRSxJQUFNLElBQUksR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBRTdCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDWCxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUNyQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUNmLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBRVQsSUFBQSxL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