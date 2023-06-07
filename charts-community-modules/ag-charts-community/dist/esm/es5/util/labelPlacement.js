function circleRectOverlap(c, x, y, w, h) {
    // Find closest horizontal and vertical edges.
    var edgeX = c.x;
    if (c.x < x) {
        edgeX = x;
    }
    else if (c.x > x + w) {
        edgeX = x + w;
    }
    var edgeY = c.y;
    if (c.y < y) {
        edgeY = y;
    }
    else if (c.y > y + h) {
        edgeY = y + h;
    }
    // Find distance to closest edges.
    var dx = c.x - edgeX;
    var dy = c.y - edgeY;
    var d = Math.sqrt(dx * dx + dy * dy);
    return d <= c.size * 0.5;
}
function rectRectOverlap(r1, x2, y2, w2, h2) {
    var xOverlap = r1.x + r1.width > x2 && r1.x < x2 + w2;
    var yOverlap = r1.y + r1.height > y2 && r1.y < y2 + h2;
    return xOverlap && yOverlap;
}
function rectContainsRect(r1, r2x, r2y, r2w, r2h) {
    return r2x + r2w < r1.x + r1.width && r2x > r1.x && r2y > r1.y && r2y + r2h < r1.y + r1.height;
}
export function isPointLabelDatum(x) {
    return x != null && typeof x.point === 'object' && typeof x.label === 'object';
}
/**
 * @param data Points and labels for one or more series. The order of series determines label placement precedence.
 * @param bounds Bounds to fit the labels into. If a label can't be fully contained, it doesn't fit.
 * @returns Placed labels for the given series (in the given order).
 */
export function placeLabels(data, bounds, padding) {
    if (padding === void 0) { padding = 5; }
    var result = [];
    data = data.map(function (d) { return d.slice().sort(function (a, b) { return b.point.size - a.point.size; }); });
    for (var j = 0; j < data.length; j++) {
        var labels = (result[j] = []);
        var datum = data[j];
        if (!((datum === null || datum === void 0 ? void 0 : datum.length) && datum[0].label)) {
            continue;
        }
        var _loop_1 = function (i, ln) {
            var d = datum[i];
            var l = d.label;
            var r = d.point.size * 0.5;
            var x = d.point.x - l.width * 0.5;
            var y = d.point.y - r - l.height - padding;
            var width = l.width, height = l.height;
            var withinBounds = !bounds || rectContainsRect(bounds, x, y, width, height);
            if (!withinBounds) {
                return "continue";
            }
            var overlapPoints = data.some(function (datum) {
                return datum.some(function (d) { return circleRectOverlap(d.point, x, y, width, height); });
            });
            if (overlapPoints) {
                return "continue";
            }
            var overlapLabels = result.some(function (labels) { return labels.some(function (l) { return rectRectOverlap(l, x, y, width, height); }); });
            if (overlapLabels) {
                return "continue";
            }
            labels.push({
                index: i,
                text: l.text,
                x: x,
                y: y,
                width: width,
                height: height,
                datum: d,
            });
        };
        for (var i = 0, ln = datum.length; i < ln; i++) {
            _loop_1(i, ln);
        }
    }
    return result;
}
export function axisLabelsOverlap(data, padding) {
    var result = [];
    var _loop_2 = function (i) {
        var datum = data[i];
        var _a = datum.point, x = _a.x, y = _a.y, text = datum.label.text;
        var _b = datum.label, width = _b.width, height = _b.height;
        width += padding !== null && padding !== void 0 ? padding : 0;
        height += padding !== null && padding !== void 0 ? padding : 0;
        var overlapLabels = result.some(function (l) {
            var overlap = rectRectOverlap(l, x, y, width, height);
            return overlap;
        });
        if (overlapLabels) {
            return { value: true };
        }
        result.push({
            index: i,
            text: text,
            x: x,
            y: y,
            width: width,
            height: height,
            datum: datum,
        });
    };
    for (var i = 0; i < data.length; i++) {
        var state_1 = _loop_2(i);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWxQbGFjZW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdXRpbC9sYWJlbFBsYWNlbWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUF1QkEsU0FBUyxpQkFBaUIsQ0FBQyxDQUFhLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUztJQUNoRiw4Q0FBOEM7SUFDOUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoQixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ1QsS0FBSyxHQUFHLENBQUMsQ0FBQztLQUNiO1NBQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDcEIsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDakI7SUFDRCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDVCxLQUFLLEdBQUcsQ0FBQyxDQUFDO0tBQ2I7U0FBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNwQixLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNqQjtJQUNELGtDQUFrQztJQUNsQyxJQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUN2QixJQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUN2QixJQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBQzdCLENBQUM7QUFFRCxTQUFTLGVBQWUsQ0FB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