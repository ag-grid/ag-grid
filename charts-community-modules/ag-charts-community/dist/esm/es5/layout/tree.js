/**
 * The tree layout is calculated in abstract x/y coordinates, where the root is at (0, 0)
 * and the tree grows downward from the root.
 */
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
/**
 * Converts an array of ticks, where each tick has an array of labels, to a label tree.
 * If `pad` is `true`, will ensure that every branch matches the depth of the tree by
 * creating empty labels.
 */
export function ticksToTree(ticks, pad) {
    if (pad === void 0) { pad = true; }
    var root = new TreeNode();
    var depth = 0;
    if (pad) {
        ticks.forEach(function (tick) { return (depth = Math.max(depth, tick.labels.length)); });
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
function insertTick(root, tick) {
    var pathParts = tick.labels.slice().reverse(); // path elements from root to leaf label
    var lastPartIndex = pathParts.length - 1;
    pathParts.forEach(function (pathPart, partIndex) {
        var children = root.children;
        var existingNode = children.find(function (child) { return child.label === pathPart; });
        var isNotLeaf = partIndex !== lastPartIndex;
        if (existingNode && isNotLeaf) {
            // the isNotLeaf check is to allow duplicate leafs
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
            var shift = vim.prelim + sim - (vip.prelim + sip) + distance;
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
export function treeLayout(root) {
    var layout = new TreeLayout();
    firstWalk(root, 1);
    secondWalk(root, -root.prelim, layout);
    thirdWalk(root);
    return layout;
}
var TreeLayout = /** @class */ (function () {
    function TreeLayout() {
        this.dimensions = new Dimensions();
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
    TreeLayout.prototype.resize = function (width, height, shiftX, shiftY, flipX) {
        if (shiftX === void 0) { shiftX = 0; }
        if (shiftY === void 0) { shiftY = 0; }
        if (flipX === void 0) { flipX = false; }
        var xSteps = this.leafCount - 1;
        var ySteps = this.depth;
        var dimensions = this.dimensions;
        var scalingX = 1;
        var scalingY = 1;
        if (width > 0 && xSteps) {
            var existingSpacingX = (dimensions.right - dimensions.left) / xSteps;
            var desiredSpacingX = width / xSteps;
            scalingX = desiredSpacingX / existingSpacingX;
            if (flipX) {
                scalingX = -scalingX;
            }
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
export { TreeLayout };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9sYXlvdXQvdHJlZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQTs7O0dBR0c7QUFFSDtJQW9CSSxrQkFBWSxLQUFVLEVBQUUsTUFBWSxFQUFFLE1BQVU7UUFBcEMsc0JBQUEsRUFBQSxVQUFVO1FBQWdCLHVCQUFBLEVBQUEsVUFBVTtRQWxCaEQsTUFBQyxHQUFXLENBQUMsQ0FBQztRQUNkLE1BQUMsR0FBVyxDQUFDLENBQUM7UUFDZCxnQkFBVyxHQUFXLEdBQUcsQ0FBQztRQUMxQixpQkFBWSxHQUFXLEdBQUcsQ0FBQztRQUMzQixZQUFPLEdBQVcsQ0FBQyxDQUFDO1FBQ3BCLFlBQU8sR0FBVyxDQUFDLENBQUM7UUFFcEIsYUFBUSxHQUFlLEVBQUUsQ0FBQztRQUMxQixjQUFTLEdBQVcsQ0FBQyxDQUFDO1FBRXRCLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFDbkIsUUFBRyxHQUFXLENBQUMsQ0FBQztRQUVoQixhQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFDbkIsVUFBSyxHQUFXLENBQUMsQ0FBQztRQUlkLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLHVFQUF1RTtRQUN2RSwrREFBK0Q7UUFDL0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDekIsQ0FBQztJQUVELGlDQUFjLEdBQWQ7UUFDSSxPQUFPLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFB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