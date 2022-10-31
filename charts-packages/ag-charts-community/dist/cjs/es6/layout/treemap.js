"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function slice(parent, x0, y0, x1, y1) {
    const nodes = parent.children;
    const k = parent.value && (y1 - y0) / parent.value;
    nodes.forEach((node) => {
        node.x0 = x0;
        node.x1 = x1;
        node.y0 = y0;
        node.y1 = y0 += node.value * k;
    });
}
function dice(parent, x0, y0, x1, y1) {
    const nodes = parent.children;
    const k = parent.value && (x1 - x0) / parent.value;
    nodes.forEach((node) => {
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
function squarifyRatio(ratio, parent, x0, y0, x1, y1) {
    const rows = [];
    const nodes = parent.children;
    const n = nodes.length;
    let value = parent.value;
    let i0 = 0;
    let i1 = 0;
    let dx;
    let dy;
    let nodeValue;
    let sumValue;
    let minValue;
    let maxValue;
    let newRatio;
    let minRatio;
    let alpha;
    let beta;
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
        const row = {
            value: sumValue,
            dice: dx < dy,
            children: nodes.slice(i0, i1),
        };
        rows.push(row);
        if (row.dice) {
            let oldy0 = y0;
            let newy1 = y1;
            if (value) {
                y0 += (dy * sumValue) / value;
                newy1 = y0;
            }
            dice(row, x0, oldy0, x1, newy1);
        }
        else {
            let oldx0 = x0;
            let newx1 = x1;
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
exports.squarifyRatio = squarifyRatio;
const phi = (1 + Math.sqrt(5)) / 2;
const squarify = (function custom(ratio) {
    function squarify(parent, x0, y0, x1, y1) {
        squarifyRatio(ratio, parent, x0, y0, x1, y1);
    }
    squarify.ratio = (x) => custom((x = +x) > 1 ? x : 1);
    return squarify;
})(phi);
class Treemap {
    constructor() {
        this.paddingStack = [0];
        this.dx = 1;
        this.dy = 1;
        this.round = true;
        this.tile = squarify;
        this.paddingInner = (_) => 0;
        this.paddingTop = (_) => 0;
        this.paddingRight = (_) => 0;
        this.paddingBottom = (_) => 0;
        this.paddingLeft = (_) => 0;
    }
    set size(size) {
        this.dx = size[0];
        this.dy = size[1];
    }
    get size() {
        return [this.dx, this.dy];
    }
    processData(root) {
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
    }
    positionNode(node) {
        let p = this.paddingStack[node.depth];
        let x0 = node.x0 + p;
        let y0 = node.y0 + p;
        let x1 = node.x1 - p;
        let y1 = node.y1 - p;
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
    }
}
exports.Treemap = Treemap;
