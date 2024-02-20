var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { _Scene } from 'ag-charts-community';
export function createColumnRects(params) {
    var stacked = params.stacked, size = params.size, padding = params.padding, xScalePadding = params.xScalePadding, xScaleDomain = params.xScaleDomain, yScaleDomain = params.yScaleDomain;
    var xScale = new _Scene.BandScale();
    xScale.domain = xScaleDomain;
    xScale.range = [padding, size - padding];
    xScale.paddingInner = xScalePadding;
    xScale.paddingOuter = xScalePadding;
    var yScale = new _Scene.LinearScale();
    yScale.domain = yScaleDomain;
    yScale.range = [size - padding, padding];
    var createBars = function (series, xScale, yScale) {
        return series.map(function (datum, i) {
            var top = yScale.convert(datum);
            var rect = new _Scene.Rect();
            rect.x = xScale.convert(i);
            rect.y = top;
            rect.width = xScale.bandwidth;
            rect.height = yScale.convert(0) - top;
            rect.strokeWidth = 0;
            rect.crisp = true;
            return rect;
        });
    };
    if (stacked) {
        return params.data.map(function (d) { return createBars(d, xScale, yScale); });
    }
    return createBars(params.data, xScale, yScale);
}
export function createLinePaths(root, data, size, padding) {
    var xScale = new _Scene.LinearScale();
    xScale.domain = [0, 4];
    xScale.range = [padding, size - padding];
    var yScale = new _Scene.LinearScale();
    yScale.domain = [0, 10];
    yScale.range = [size - padding, padding];
    var lines = data.map(function (series) {
        var line = new _Scene.Path();
        line.strokeWidth = 3;
        line.lineCap = 'round';
        line.fill = undefined;
        series.forEach(function (datum, i) {
            line.path[i > 0 ? 'lineTo' : 'moveTo'](xScale.convert(i), yScale.convert(datum));
        });
        return line;
    });
    var linesGroup = new _Scene.Group();
    linesGroup.setClipRectInGroupCoordinateSpace(new _Scene.BBox(padding, padding, size - padding * 2, size - padding * 2));
    linesGroup.append(lines);
    root.append(linesGroup);
    return lines;
}
export function createPolarPaths(root, data, size, radius, innerRadius, markerSize) {
    if (markerSize === void 0) { markerSize = 0; }
    var angleScale = new _Scene.LinearScale();
    angleScale.domain = [0, 7];
    angleScale.range = [-Math.PI, Math.PI].map(function (angle) { return angle + Math.PI / 2; });
    var radiusScale = new _Scene.LinearScale();
    radiusScale.domain = [0, 10];
    radiusScale.range = [radius, innerRadius];
    var markers = [];
    var paths = data.map(function (series) {
        var path = new _Scene.Path();
        path.strokeWidth = 1;
        path.strokeOpacity = 0.5;
        path.lineCap = 'round';
        path.fill = undefined;
        path.fillOpacity = 0.8;
        series.forEach(function (datum, i) {
            var angle = angleScale.convert(i);
            var r = radius + innerRadius - radiusScale.convert(datum);
            var x = r * Math.cos(angle);
            var y = r * Math.sin(angle);
            path.path[i > 0 ? 'lineTo' : 'moveTo'](x, y);
            if (markerSize > 0) {
                var marker = new _Scene.Circle();
                marker.x = x;
                marker.y = y;
                marker.size = markerSize;
                markers.push(marker);
            }
        });
        path.path.closePath();
        return path;
    });
    var group = new _Scene.Group();
    var center = size / 2;
    group.translationX = center;
    group.translationY = center;
    group.append(__spreadArray(__spreadArray([], __read(paths), false), __read(markers), false));
    root.append(group);
    return { paths: paths, markers: markers };
}
export function accumulateData(data) {
    var _a = __read([Infinity, -Infinity], 2), min = _a[0], max = _a[1];
    var processedData = data.reduce(function (acc, curr, currIndex) {
        var _a;
        var previous = currIndex > 0 ? acc[currIndex - 1] : undefined;
        (_a = acc[currIndex]) !== null && _a !== void 0 ? _a : (acc[currIndex] = []);
        var current = acc[currIndex];
        curr.forEach(function (datum, datumIndex) {
            if (previous) {
                datum += previous[datumIndex];
            }
            current[datumIndex] = datum;
            if (current[datumIndex] < min) {
                min = current[datumIndex];
            }
            if (current[datumIndex] > max) {
                max = current[datumIndex];
            }
        });
        return acc;
    }, []);
    return { processedData: processedData, min: min, max: max };
}
