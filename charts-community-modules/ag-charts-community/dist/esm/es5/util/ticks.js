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
export default function (start, stop, count, minCount, maxCount) {
    if (count < 2) {
        return range(start, stop, stop - start);
    }
    var step = tickStep(start, stop, count, minCount, maxCount);
    if (isNaN(step)) {
        return new NumericTicks(0);
    }
    start = Math.ceil(start / step) * step;
    stop = Math.floor(stop / step) * step;
    return range(start, stop, step);
}
var tickMultipliers = [1, 2, 5, 10];
export function tickStep(a, b, count, minCount, maxCount) {
    if (minCount === void 0) { minCount = 0; }
    if (maxCount === void 0) { maxCount = Infinity; }
    var rawStep = (b - a) / count;
    var power = Math.floor(Math.log10(rawStep));
    var step = Math.pow(10, power);
    var m = tickMultipliers
        .map(function (multiplier) {
        var s = multiplier * step;
        var c = Math.ceil((b - a) / s);
        var isWithinBounds = c >= minCount && c <= maxCount;
        var diffCount = Math.abs(c - count);
        return { multiplier: multiplier, isWithinBounds: isWithinBounds, diffCount: diffCount };
    })
        .sort(function (a, b) {
        if (a.isWithinBounds !== b.isWithinBounds) {
            return a.isWithinBounds ? -1 : 1;
        }
        return a.diffCount - b.diffCount;
    })[0].multiplier;
    if (!m || isNaN(m)) {
        return NaN;
    }
    return m * step;
}
export function singleTickDomain(a, b) {
    var power = Math.floor(Math.log10(b - a));
    var step = Math.pow(10, power);
    return tickMultipliers
        .map(function (multiplier) {
        var s = multiplier * step;
        var start = Math.floor(a / s) * s;
        var end = Math.ceil(b / s) * s;
        var error = 1 - (b - a) / (end - start);
        var domain = [start, end];
        return { error: error, domain: domain };
    })
        .sort(function (a, b) { return a.error - b.error; })[0].domain;
}
var NumericTicks = /** @class */ (function (_super) {
    __extends(NumericTicks, _super);
    function NumericTicks(fractionDigits, elements) {
        var _this = _super.call(this) || this;
        if (elements) {
            for (var i = 0, n = elements.length; i < n; i++) {
                _this[i] = elements[i];
            }
        }
        _this.fractionDigits = fractionDigits;
        return _this;
    }
    return NumericTicks;
}(Array));
export { NumericTicks };
export function range(start, stop, step) {
    var countDigits = function (expNo) {
        var _a, _b;
        var parts = expNo.split('e');
        return Math.max(((_b = (_a = parts[0].split('.')[1]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) - Number(parts[1]), 0);
    };
    var fractionalDigits = countDigits((step % 1).toExponential());
    var f = Math.pow(10, fractionalDigits);
    var n = Math.ceil((stop - start) / step);
    var values = new NumericTicks(fractionalDigits);
    for (var i = 0; i <= n; i++) {
        var value = start + step * i;
        values.push(Math.round(value * f) / f);
    }
    return values;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGlja3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdXRpbC90aWNrcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxNQUFNLENBQUMsT0FBTyxXQUNWLEtBQWEsRUFDYixJQUFZLEVBQ1osS0FBYSxFQUNiLFFBQWlCLEVBQ2pCLFFBQWlCO0lBRWpCLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRTtRQUNYLE9BQU8sS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDO0tBQzNDO0lBQ0QsSUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM5RCxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNiLE9BQU8sSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDOUI7SUFDRCxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO0lBQ3ZDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDdEMsT0FBTyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBRUQsSUFBTSxlQUFlLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUV0QyxNQUFNLFVBQVUsUUFBUSxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsS0FBYSxFQUFFLFFBQVksRUFBRSxRQUFtQjtJQUFqQyx5QkFBQSxFQUFBLFlBQVk7SUFBRSx5QkFBQSxFQUFBLG1CQUFtQjtJQUMzRixJQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsR0FB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