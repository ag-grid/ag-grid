function slice(parent, x0, y0, x1, y1) {
    var nodes = parent.children;
    var k = parent.value && (y1 - y0) / parent.value;
    nodes.forEach(function (node) {
        node.x0 = x0;
        node.x1 = x1;
        node.y0 = y0;
        node.y1 = y0 += node.value * k;
    });
}
function dice(parent, x0, y0, x1, y1) {
    var nodes = parent.children;
    var k = parent.value && (x1 - x0) / parent.value;
    nodes.forEach(function (node) {
        node.x0 = x0;
        node.x1 = x0 += node.value * k;
        node.y0 = y0;
        node.y1 = y1;
    });
}
function roundNode(node) {
    node.x0 = Math.round(node.x0);
    node.y0 = Math.round(node.y0);
    node.x1 = Math.round(node.x1);
    node.y1 = Math.round(node.y1);
}
export function squarifyRatio(ratio, parent, x0, y0, x1, y1) {
    var rows = [];
    var nodes = parent.children;
    var n = nodes.length;
    var value = parent.value;
    var i0 = 0;
    var i1 = 0;
    var dx;
    var dy;
    var nodeValue;
    var sumValue;
    var minValue;
    var maxValue;
    var newRatio;
    var minRatio;
    var alpha;
    var beta;
    while (i0 < n) {
        dx = x1 - x0;
        dy = y1 - y0;
        // Find the next non-empty node.
        do {
            sumValue = nodes[i1++].value;
        } while (!sumValue && i1 < n);
        minValue = maxValue = sumValue;
        alpha = Math.max(dy / dx, dx / dy) / (value * ratio);
        beta = sumValue * sumValue * alpha;
        minRatio = Math.max(maxValue / beta, beta / minValue);
        // Keep adding nodes while the aspect ratio maintains or improves.
        for (; i1 < n; ++i1) {
            nodeValue = nodes[i1].value;
            sumValue += nodeValue;
            if (nodeValue < minValue) {
                minValue = nodeValue;
            }
            if (nodeValue > maxValue) {
                maxValue = nodeValue;
            }
            beta = sumValue * sumValue * alpha;
            newRatio = Math.max(maxValue / beta, beta / minValue);
            if (newRatio > minRatio) {
                sumValue -= nodeValue;
                break;
            }
            minRatio = newRatio;
        }
        // Position and record the row orientation.
        var row = {
            value: sumValue,
            dice: dx < dy,
            children: nodes.slice(i0, i1),
        };
        rows.push(row);
        if (row.dice) {
            var oldy0 = y0;
            var newy1 = y1;
            if (value) {
                y0 += (dy * sumValue) / value;
                newy1 = y0;
            }
            dice(row, x0, oldy0, x1, newy1);
        }
        else {
            var oldx0 = x0;
            var newx1 = x1;
            if (value) {
                x0 += (dx * sumValue) / value;
                newx1 = x0;
            }
            slice(row, oldx0, y0, newx1, y1);
        }
        value -= sumValue;
        i0 = i1;
    }
    return rows;
}
var phi = (1 + Math.sqrt(5)) / 2;
var squarify = (function custom(ratio) {
    function squarify(parent, x0, y0, x1, y1) {
        squarifyRatio(ratio, parent, x0, y0, x1, y1);
    }
    squarify.ratio = function (x) { return custom((x = +x) > 1 ? x : 1); };
    return squarify;
})(phi);
var Treemap = /** @class */ (function () {
    function Treemap() {
        this.paddingStack = [0];
        this.dx = 1;
        this.dy = 1;
        this.round = true;
        this.tile = squarify;
        this.paddingInner = function (_) { return 0; };
        this.paddingTop = function (_) { return 0; };
        this.paddingRight = function (_) { return 0; };
        this.paddingBottom = function (_) { return 0; };
        this.paddingLeft = function (_) { return 0; };
    }
    Object.defineProperty(Treemap.prototype, "size", {
        get: function () {
            return [this.dx, this.dy];
        },
        set: function (size) {
            this.dx = size[0];
            this.dy = size[1];
        },
        enumerable: true,
        configurable: true
    });
    Treemap.prototype.processData = function (root) {
        root.x0 = 0;
        root.y0 = 0;
        root.x1 = this.dx;
        root.y1 = this.dy;
        root.eachBefore(this.positionNode.bind(this));
        this.paddingStack = [0];
        if (this.round) {
            root.eachBefore(roundNode);
        }
        return root;
    };
    Treemap.prototype.positionNode = function (node) {
        var p = this.paddingStack[node.depth];
        var x0 = node.x0 + p;
        var y0 = node.y0 + p;
        var x1 = node.x1 - p;
        var y1 = node.y1 - p;
        if (x1 < x0) {
            x0 = x1 = (x0 + x1) / 2;
        }
        if (y1 < y0) {
            y0 = y1 = (y0 + y1) / 2;
        }
        node.x0 = x0;
        node.y0 = y0;
        node.x1 = x1;
        node.y1 = y1;
        if (node.children) {
            p = this.paddingStack[node.depth + 1] = this.paddingInner(node) / 2;
            x0 += this.paddingLeft(node) - p;
            y0 += this.paddingTop(node) - p;
            x1 -= this.paddingRight(node) - p;
            y1 -= this.paddingBottom(node) - p;
            if (x1 < x0) {
                x0 = x1 = (x0 + x1) / 2;
            }
            if (y1 < y0) {
                y0 = y1 = (y0 + y1) / 2;
            }
            this.tile(node, x0, y0, x1, y1);
        }
    };
    return Treemap;
}());
export { Treemap };
