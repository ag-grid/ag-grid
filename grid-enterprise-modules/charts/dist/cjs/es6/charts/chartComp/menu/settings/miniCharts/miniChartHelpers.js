"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accumulateData = exports.createPolarPaths = exports.createLinePaths = exports.createColumnRects = void 0;
const ag_charts_community_1 = require("ag-charts-community");
function createColumnRects(params) {
    const { stacked, size, padding, xScalePadding, xScaleDomain, yScaleDomain } = params;
    const xScale = new ag_charts_community_1._Scene.BandScale();
    xScale.domain = xScaleDomain;
    xScale.range = [padding, size - padding];
    xScale.paddingInner = xScalePadding;
    xScale.paddingOuter = xScalePadding;
    const yScale = new ag_charts_community_1._Scene.LinearScale();
    yScale.domain = yScaleDomain;
    yScale.range = [size - padding, padding];
    const createBars = (series, xScale, yScale) => {
        return series.map((datum, i) => {
            const top = yScale.convert(datum);
            const rect = new ag_charts_community_1._Scene.Rect();
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
        return params.data.map((d) => createBars(d, xScale, yScale));
    }
    return createBars(params.data, xScale, yScale);
}
exports.createColumnRects = createColumnRects;
function createLinePaths(root, data, size, padding) {
    const xScale = new ag_charts_community_1._Scene.LinearScale();
    xScale.domain = [0, 4];
    xScale.range = [padding, size - padding];
    const yScale = new ag_charts_community_1._Scene.LinearScale();
    yScale.domain = [0, 10];
    yScale.range = [size - padding, padding];
    const lines = data.map((series) => {
        const line = new ag_charts_community_1._Scene.Path();
        line.strokeWidth = 3;
        line.lineCap = 'round';
        line.fill = undefined;
        series.forEach((datum, i) => {
            line.path[i > 0 ? 'lineTo' : 'moveTo'](xScale.convert(i), yScale.convert(datum));
        });
        return line;
    });
    const linesGroup = new ag_charts_community_1._Scene.Group();
    linesGroup.setClipRectInGroupCoordinateSpace(new ag_charts_community_1._Scene.BBox(padding, padding, size - padding * 2, size - padding * 2));
    linesGroup.append(lines);
    root.append(linesGroup);
    return lines;
}
exports.createLinePaths = createLinePaths;
function createPolarPaths(root, data, size, radius, innerRadius, markerSize = 0) {
    const angleScale = new ag_charts_community_1._Scene.LinearScale();
    angleScale.domain = [0, 7];
    angleScale.range = [-Math.PI, Math.PI].map((angle) => angle + Math.PI / 2);
    const radiusScale = new ag_charts_community_1._Scene.LinearScale();
    radiusScale.domain = [0, 10];
    radiusScale.range = [radius, innerRadius];
    const markers = [];
    const paths = data.map((series) => {
        const path = new ag_charts_community_1._Scene.Path();
        path.strokeWidth = 1;
        path.strokeOpacity = 0.5;
        path.lineCap = 'round';
        path.fill = undefined;
        path.fillOpacity = 0.8;
        series.forEach((datum, i) => {
            const angle = angleScale.convert(i);
            const r = radius + innerRadius - radiusScale.convert(datum);
            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);
            path.path[i > 0 ? 'lineTo' : 'moveTo'](x, y);
            if (markerSize > 0) {
                const marker = new ag_charts_community_1._Scene.Circle();
                marker.x = x;
                marker.y = y;
                marker.size = markerSize;
                markers.push(marker);
            }
        });
        path.path.closePath();
        return path;
    });
    const group = new ag_charts_community_1._Scene.Group();
    const center = size / 2;
    group.translationX = center;
    group.translationY = center;
    group.append([...paths, ...markers]);
    root.append(group);
    return { paths, markers };
}
exports.createPolarPaths = createPolarPaths;
function accumulateData(data) {
    let [min, max] = [Infinity, -Infinity];
    const processedData = data.reduce((acc, curr, currIndex) => {
        var _a;
        const previous = currIndex > 0 ? acc[currIndex - 1] : undefined;
        (_a = acc[currIndex]) !== null && _a !== void 0 ? _a : (acc[currIndex] = []);
        const current = acc[currIndex];
        curr.forEach((datum, datumIndex) => {
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
    return { processedData, min, max };
}
exports.accumulateData = accumulateData;
