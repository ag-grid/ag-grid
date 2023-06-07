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
function transform(input, transforms) {
    var result = {};
    for (var p in input) {
        var t = transforms[p] || (function (x) { return x; });
        result[p] = t(input[p], input);
    }
    return result;
}
function is2dArray(input) {
    return input != null && input instanceof Array && input[0] instanceof Array;
}
function yNamesMapping(p, src) {
    if (p == null) {
        return {};
    }
    if (!(p instanceof Array)) {
        return p;
    }
    var yKeys = src.yKeys;
    if (yKeys == null || is2dArray(yKeys)) {
        throw new Error('AG Charts - yNames and yKeys mismatching configuration.');
    }
    var result = {};
    yKeys.forEach(function (k, i) {
        result[k] = p[i];
    });
    return result;
}
function yKeysMapping(p, src) {
    if (p == null) {
        return [[]];
    }
    if (is2dArray(p)) {
        return p;
    }
    return src.grouped ? p.map(function (v) { return [v]; }) : [p];
}
function legendItemNamesMapping(p, src) {
    if (p == null) {
        return {};
    }
    if (!(p instanceof Array)) {
        return p;
    }
    var yKeys = src.yKeys;
    if (yKeys == null || is2dArray(yKeys)) {
        throw new Error('AG Charts - legendItemNames and yKeys mismatching configuration.');
    }
    var result = {};
    yKeys.forEach(function (k, i) {
        result[k] = p[i];
    });
    return result;
}
function barSeriesTransform(options) {
    var result = __assign({}, options);
    delete result['yKey'];
    delete result['yName'];
    return transform(result, {
        yNames: yNamesMapping,
        yKeys: yKeysMapping,
        legendItemNames: legendItemNamesMapping,
    });
}
function columnSeriesTransform(options) {
    var result = __assign({}, options);
    delete result['yKey'];
    delete result['yName'];
    return transform(result, {
        yNames: yNamesMapping,
        yKeys: yKeysMapping,
        legendItemNames: legendItemNamesMapping,
    });
}
function identityTransform(input) {
    return input;
}
var SERIES_TRANSFORMS = {
    area: identityTransform,
    bar: barSeriesTransform,
    column: columnSeriesTransform,
    histogram: identityTransform,
    line: identityTransform,
    pie: identityTransform,
    scatter: identityTransform,
    treemap: identityTransform,
};
export function applySeriesTransform(options) {
    var _a;
    var type = (_a = options.type) !== null && _a !== void 0 ? _a : 'line';
    var transform = SERIES_TRANSFORMS[type];
    return (transform !== null && transform !== void 0 ? transform : identityTransform)(options);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3Jtcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9tYXBwaW5nL3RyYW5zZm9ybXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFvQkEsU0FBUyxTQUFTLENBS2hCLEtBQVEsRUFBRSxVQUFhO0lBQ3JCLElBQU0sTUFBTSxHQUFlLEVBQUUsQ0FBQztJQUU5QixLQUFLLElBQU0sQ0FBQyxJQUFJLEtBQUssRUFBRTtRQUNuQixJQUFNLENBQUMsR0FBSSxVQUFrQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFNLElBQUssT0FBQSxDQUFDLEVBQUQsQ0FBQyxDQUFDLENBQUM7UUFDbkQsTUFBYyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDM0M7SUFFRCxPQUFPLE1BQVcsQ0FBQztBQUN2QixDQUFDO0FBRUQsU0FBUyxTQUFTLENBQUksS0FBa0I7SUFDcEMsT0FBTyxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssWUFBWSxLQUFLLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxZQUFZLEtBQUssQ0FBQztBQUNoRixDQUFDO0FBRUQsU0FBUyxhQUFhLENBQ2xCLENBQWdELEVBQ2hELEdBQTZDO0lBRTdDLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRTtRQUNYLE9BQU8sRUFBRSxDQUFDO0tBQ2I7SUFFRCxJQUFJLENBQUMsQ0FBQyxDQUFDLFlBQVksS0FBSyxDQUFDLEVBQUU7UUFDdkIsT0FBTyxDQUFDLENBQUM7S0FDWjtJQUVELElBQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7SUFDeEIsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNuQyxNQUFNLElBQUksS0FBSyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7S0FDOUU7SUFFRCxJQUFNLE1BQU0sR0FBMkIsRUFBRSxDQUFDO0lBQzFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQztRQUNmLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUMsQ0FBb0MsRUFBRSxHQUF1QjtJQUMvRSxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUU7UUFDWCxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDZjtJQUVELElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ2QsT0FBTyxDQUFDLENBQUM7S0FDWjtJQUVELE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxDQUFDLEVBQUgsQ0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakQsQ0FBQztBQUVELFNBQVMsc0JBQXNCLENBQzNCLENBQWdELEVBQ2hELEdBQTZDO0lBRTdDLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRTtRQUNYLE9BQU8sRUFBRSxDQUFDO0tBQ2I7SUFFRCxJQUFJLENBQUMsQ0FBQyxDQUFDLFlBQVksS0FBSyxDQUFDLEVBQUU7UUFDdkIsT0FBTyxDQUFDLENBQUM7S0FDWjtJQUVELElBQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7SUFDeEIsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNuQyxNQUFNLElBQUksS0FBSyxDQUFDLGtFQUFrRSxDQUFDLENBQUM7S0FDdkY7SUFFRCxJQUFNLE1BQU0sR0FBMkIsRUFBRSxDQUFDO0lBQzFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQztRQUNmLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBRUQsU0FBUyxrQkFBa0IsQ0FBK0IsT0FBVTtJQUNoRSxJQUFNLE1BQU0sZ0JBQ0wsT0FBTyxDQUNiLENBQUM7SUFDRixPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN0QixPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUV2QixPQUFPLFNBQVMsQ0FBQyxNQUFNLEVBQUU7UUFDckIsTUFBTSxFQUFFLGFBQWE7UUFDckIsS0FBSyxFQUFFLFlBQVk7UUFDbkIsZUFBZSxFQUFFLHNCQUFzQjtLQUMxQyxDQUFNLENBQUM7QUFDWixDQUFDO0FBRUQsU0FBUyxxQkFBcUIsQ0FBa0MsT0FBVTtJQUN0RSxJQUFNLE1BQU0sZ0JBQ0wsT0FBTyxDQUNiLENBQUM7SUFDRixPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN0QixPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUV2QixPQUFPLFNBQVMsQ0FBQyxNQUFNLEVBQUU7UUFDckIsTUFBTSxFQUFFLGFBQWE7UUFDckIsS0FBSyxFQUFFLFlBQVk7UUFDbkIsZUFBZSxFQUFFLHNCQUFzQjtLQUMxQyxDQUFNLENBQUM7QUFDWixDQUFDO0FBb0JELFNBQVMsaUJBQWlCLENBQUksS0FBUTtJQUNsQyxPQUFPLEtBQUssQ0FBQztBQUNqQixDQUFDO0FBRUQsSUFBTSxpQkFBaUIsR0FFbkI7SUFDQSxJQUFJLEVBQUUsaUJBQWlCO0lBQ3ZCLEdBQUcsRUFBRSxrQkFBa0I7SUFDdkIsTUFBTSxFQUFFLHFCQUFxQjtJQUM3QixTQUFTLEVBQUUsaUJBQWlCO0lBQzVCLElBQUksRUFBRSxpQkFBaUI7SUFDdkIsR0FBRyxFQUFFLGlCQUFpQjtJQUN0QixPQUFPLEVBQUUsaUJBQWlCO0lBQzFCLE9BQU8sRUFBRSxpQkFBaUI7Q0FDN0IsQ0FBQztBQUVGLE1BQU0sVUFBVSxvQkFBb0IsQ0FBd0IsT0FBVTs7SUFDbEUsSUFBTSxJQUFJLEdBQUcsTUFBQSxPQUFPLENBQUMsSUFBSSxtQ0FBSSxNQUFNLENBQUM7SUFDcEMsSUFBTSxTQUFTLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFhLENBQUM7SUFDdEQsT0FBTyxDQUFDLFNBQVMsYUFBVCxTQUFTLGNBQVQsU0FBUyxHQUFJLGlCQUFpQixDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDckQsQ0FBQyJ9