// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TreeNode = /** @class */ (function () {
    function TreeNode(label, parent, number) {
        if (label === void 0) { label = ''; }
        if (number === void 0) { number = 0; }
        this.x = 0;
        this.y = 0;
        this.subtreeLeft = NaN;
        this.subtreeRight = NaN;
        this.screenX = 0;
        this.screenY = 0;
        this.children = [];
        this.leafCount = 0;
        this.prelim = 0;
        this.mod = 0;
        this.ancestor = this;
        this.change = 0;
        this.shift = 0;
        this.label = label;
        // screenX and screenY are meant to be recomputed from (layout) x and y
        // when the tree is resized (without performing another layout)
        this.parent = parent;
        this.depth = parent ? parent.depth + 1 : 0;
        this.number = number;
    }
    TreeNode.prototype.getLeftSibling = function () {
        return this.number > 0 && this.parent ? this.parent.children[this.number - 1] : undefined;
    };
    TreeNode.prototype.getLeftmostSibling = function () {
        return this.number > 0 && this.parent ? this.parent.children[0] : undefined;
    };
    // traverse the left contour of a subtree, return the successor of v on this contour
    TreeNode.prototype.nextLeft = function () {
        return this.children ? this.children[0] : this.thread;
    };
    // traverse the right contour of a subtree, return the successor of v on this contour
    TreeNode.prototype.nextRight = function () {
        return this.children ? this.children[this.children.length - 1] : this.thread;
    };
    TreeNode.prototype.getSiblings = function () {
        var _this = this;
        return this.parent ? this.parent.children.filter(function (_, i) { return i !== _this.number; }) : [];
    };
    return TreeNode;
}());
function ticksToTree(ticks, pad) {
    if (pad === void 0) { pad = true; }
    var root = new TreeNode();
    var depth = 0;
    if (pad) {
        ticks.forEach(function (tick) { return depth = Math.max(depth, tick.labels.length); });
    }
    ticks.forEach(function (tick) {
        if (pad) {
            while (tick.labels.length < depth) {
                tick.labels.unshift('');
            }
        }
        insertTick(root, tick);
    });
    return root;
}
exports.ticksToTree = ticksToTree;
function insertTick(root, tick) {
    var pathParts = tick.labels.slice().reverse(); // path elements from root to leaf label
    var lastPartIndex = pathParts.length - 1;
    pathParts.forEach(function (pathPart, partIndex) {
        var children = root.children;
        var existingNode = children.find(function (child) { return child.label === pathPart; });
        var isNotLeaf = partIndex !== lastPartIndex;
        if (existingNode && isNotLeaf) { // the isNotLeaf check is to allow duplicate leafs
            root = existingNode;
        }
        else {
            var node = new TreeNode(pathPart, root);
            node.number = children.length;
            children.push(node);
            if (isNotLeaf) {
                root = node;
            }
        }
    });
}
// Shift the subtree.
function moveSubtree(wm, wp, shift) {
    var subtrees = wp.number - wm.number;
    var ratio = shift / subtrees;
    wp.change -= ratio;
    wp.shift += shift;
    wm.change += ratio;
    wp.prelim += shift;
    wp.mod += shift;
}
function ancestor(vim, v, defaultAncestor) {
    return v.getSiblings().indexOf(vim.ancestor) >= 0 ? vim.ancestor : defaultAncestor;
}
// Spaces out the children.
function executeShifts(v) {
    var children = v.children;
    if (children) {
        var shift = 0;
        var change = 0;
        for (var i = children.length - 1; i >= 0; i--) {
            var w = children[i];
            w.prelim += shift;
            w.mod += shift;
            change += w.change;
            shift += w.shift + change;
        }
    }
}
// Moves current subtree with v as the root if some nodes are conflicting in space.
function apportion(v, defaultAncestor, distance) {
    var w = v.getLeftSibling();
    if (w) {
        var vop = v;
        var vip = v;
        var vim = w;
        var vom = vip.getLeftmostSibling();
        var sip = vip.mod;
        var sop = vop.mod;
        var sim = vim.mod;
        var som = vom.mod;
        while (vim.nextRight() && vip.nextLeft()) {
            vim = vim.nextRight();
            vip = vip.nextLeft();
            vom = vom.nextLeft();
            vop = vop.nextRight();
            vop.ancestor = v;
            var shift = (vim.prelim + sim) - (vip.prelim + sip) + distance;
            if (shift > 0) {
                moveSubtree(ancestor(vim, v, defaultAncestor), v, shift);
                sip += shift;
                sop += shift;
            }
            sim += vim.mod;
            sip += vip.mod;
            som += vom.mod;
            sop += vop.mod;
        }
        if (vim.nextRight() && !vop.nextRight()) {
            vop.thread = vim.nextRight();
            vop.mod += sim - sop;
        }
        else {
            if (vip.nextLeft() && !vom.nextLeft()) {
                vom.thread = vip.nextLeft();
                vom.mod += sip - som;
            }
            defaultAncestor = v;
        }
    }
    return defaultAncestor;
}
// Compute the preliminary x-coordinate of node and its children (recursively).
function firstWalk(node, distance) {
    var children = node.children;
    if (children.length) {
        var defaultAncestor_1 = children[0];
        children.forEach(function (child) {
            firstWalk(child, distance);
            defaultAncestor_1 = apportion(child, defaultAncestor_1, distance);
        });
        executeShifts(node);
        var midpoint = (children[0].prelim + children[children.length - 1].prelim) / 2;
        var leftSibling = node.getLeftSibling();
        if (leftSibling) {
            node.prelim = leftSibling.prelim + distance;
            node.mod = node.prelim - midpoint;
        }
        else {
            node.prelim = midpoint;
        }
    }
    else {
        var leftSibling = node.getLeftSibling();
        node.prelim = leftSibling ? leftSibling.prelim + distance : 0;
    }
}
var Dimensions = /** @class */ (function () {
    function Dimensions() {
        this.top = Infinity;
        this.right = -Infinity;
        this.bottom = -Infinity;
        this.left = Infinity;
    }
    Dimensions.prototype.update = function (node, xy) {
        var _a = xy(node), x = _a.x, y = _a.y;
        if (x > this.right) {
            this.right = x;
        }
        if (x < this.left) {
            this.left = x;
        }
        if (y > this.bottom) {
            this.bottom = y;
        }
        if (y < this.top) {
            this.top = y;
        }
    };
    return Dimensions;
}());
function secondWalk(v, m, layout) {
    v.x = v.prelim + m;
    v.y = v.depth;
    layout.update(v);
    v.children.forEach(function (w) { return secondWalk(w, m + v.mod, layout); });
}
// After the second walk the parent nodes are positioned at the center of their immediate children.
// If we want the parent nodes to be positioned at the center of the subtree for which they are roots,
// we need a third walk to adjust the positions.
function thirdWalk(v) {
    var children = v.children;
    var leafCount = 0;
    children.forEach(function (w) {
        thirdWalk(w);
        if (w.children.length) {
            leafCount += w.leafCount;
        }
        else {
            leafCount++;
        }
    });
    v.leafCount = leafCount;
    if (children.length) {
        v.subtreeLeft = children[0].subtreeLeft;
        v.subtreeRight = children[v.children.length - 1].subtreeRight;
        v.x = (v.subtreeLeft + v.subtreeRight) / 2;
    }
    else {
        v.subtreeLeft = v.x;
        v.subtreeRight = v.x;
    }
}
function treeLayout(root) {
    var layout = new TreeLayout;
    firstWalk(root, 1);
    secondWalk(root, -root.prelim, layout);
    thirdWalk(root);
    return layout;
}
exports.treeLayout = treeLayout;
var TreeLayout = /** @class */ (function () {
    function TreeLayout() {
        this.dimensions = new Dimensions;
        this.leafCount = 0;
        this.nodes = [];
        // One might want to process leaf nodes separately from the rest of the tree.
        // For example, position labels corresponding to leafs vertically, rather than horizontally.
        this.leafNodes = [];
        this.nonLeafNodes = [];
        this.depth = 0;
    }
    TreeLayout.prototype.update = function (node) {
        this.dimensions.update(node, function (node) { return ({ x: node.x, y: node.y }); });
        if (!node.children.length) {
            this.leafCount++;
            this.leafNodes.push(node);
        }
        else {
            this.nonLeafNodes.push(node);
        }
        if (node.depth > this.depth) {
            this.depth = node.depth;
        }
        this.nodes.push(node);
    };
    TreeLayout.prototype.resize = function (width, height, shiftX, shiftY) {
        if (shiftX === void 0) { shiftX = 0; }
        if (shiftY === void 0) { shiftY = 0; }
        var xSteps = this.leafCount - 1;
        var ySteps = this.depth;
        var dimensions = this.dimensions;
        var scalingX = 1;
        var scalingY = 1;
        if (width > 0 && xSteps) {
            var existingSpacingX = (dimensions.right - dimensions.left) / xSteps;
            var desiredSpacingX = width / xSteps;
            scalingX = desiredSpacingX / existingSpacingX;
        }
        if (height > 0 && ySteps) {
            var existingSpacingY = (dimensions.bottom - dimensions.top) / ySteps;
            var desiredSpacingY = height / ySteps;
            scalingY = desiredSpacingY / existingSpacingY;
        }
        var screenDimensions = new Dimensions();
        this.nodes.forEach(function (node) {
            node.screenX = node.x * scalingX;
            node.screenY = node.y * scalingY;
            screenDimensions.update(node, function (node) { return ({ x: node.screenX, y: node.screenY }); });
        });
        // Normalize so that root top and leftmost leaf left start at zero.
        var offsetX = -screenDimensions.left;
        var offsetY = -screenDimensions.top;
        this.nodes.forEach(function (node) {
            node.screenX += offsetX + shiftX;
            node.screenY += offsetY + shiftY;
        });
    };
    return TreeLayout;
}());
exports.TreeLayout = TreeLayout;
function logTree(root, formatter) {
    root.children.forEach(function (child) { return logTree(child, formatter); });
    if (formatter) {
        console.log(formatter(root));
    }
    else {
        console.log(root);
    }
}
