"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeLayout = exports.treeLayout = exports.ticksToTree = void 0;
const array_1 = require("../util/array");
/**
 * The tree layout is calculated in abstract x/y coordinates, where the root is at (0, 0)
 * and the tree grows downward from the root.
 */
class TreeNode {
    constructor(label = '', parent, number = 0) {
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
    getLeftSibling() {
        return this.number > 0 && this.parent ? this.parent.children[this.number - 1] : undefined;
    }
    getLeftmostSibling() {
        return this.number > 0 && this.parent ? this.parent.children[0] : undefined;
    }
    // traverse the left contour of a subtree, return the successor of v on this contour
    nextLeft() {
        return this.children ? this.children[0] : this.thread;
    }
    // traverse the right contour of a subtree, return the successor of v on this contour
    nextRight() {
        return this.children ? this.children[this.children.length - 1] : this.thread;
    }
    getSiblings() {
        return this.parent ? this.parent.children.filter((_, i) => i !== this.number) : [];
    }
}
/**
 * Converts an array of ticks, where each tick has an array of labels, to a label tree.
 * If `pad` is `true`, will ensure that every branch matches the depth of the tree by
 * creating empty labels.
 */
function ticksToTree(ticks, pad = true) {
    const root = new TreeNode();
    let depth = 0;
    if (pad) {
        ticks.forEach((tick) => (depth = Math.max(depth, tick.labels.length)));
    }
    ticks.forEach((tick) => {
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
    const pathParts = tick.labels.slice().reverse(); // path elements from root to leaf label
    const lastPartIndex = pathParts.length - 1;
    pathParts.forEach((pathPart, partIndex) => {
        const children = root.children;
        const existingNode = array_1.find(children, (child) => child.label === pathPart);
        const isNotLeaf = partIndex !== lastPartIndex;
        if (existingNode && isNotLeaf) {
            // the isNotLeaf check is to allow duplicate leafs
            root = existingNode;
        }
        else {
            const node = new TreeNode(pathPart, root);
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
    const subtrees = wp.number - wm.number;
    const ratio = shift / subtrees;
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
    const children = v.children;
    if (children) {
        let shift = 0;
        let change = 0;
        for (let i = children.length - 1; i >= 0; i--) {
            const w = children[i];
            w.prelim += shift;
            w.mod += shift;
            change += w.change;
            shift += w.shift + change;
        }
    }
}
// Moves current subtree with v as the root if some nodes are conflicting in space.
function apportion(v, defaultAncestor, distance) {
    const w = v.getLeftSibling();
    if (w) {
        let vop = v;
        let vip = v;
        let vim = w;
        let vom = vip.getLeftmostSibling();
        let sip = vip.mod;
        let sop = vop.mod;
        let sim = vim.mod;
        let som = vom.mod;
        while (vim.nextRight() && vip.nextLeft()) {
            vim = vim.nextRight();
            vip = vip.nextLeft();
            vom = vom.nextLeft();
            vop = vop.nextRight();
            vop.ancestor = v;
            const shift = vim.prelim + sim - (vip.prelim + sip) + distance;
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
    const children = node.children;
    if (children.length) {
        let defaultAncestor = children[0];
        children.forEach((child) => {
            firstWalk(child, distance);
            defaultAncestor = apportion(child, defaultAncestor, distance);
        });
        executeShifts(node);
        const midpoint = (children[0].prelim + children[children.length - 1].prelim) / 2;
        const leftSibling = node.getLeftSibling();
        if (leftSibling) {
            node.prelim = leftSibling.prelim + distance;
            node.mod = node.prelim - midpoint;
        }
        else {
            node.prelim = midpoint;
        }
    }
    else {
        const leftSibling = node.getLeftSibling();
        node.prelim = leftSibling ? leftSibling.prelim + distance : 0;
    }
}
class Dimensions {
    constructor() {
        this.top = Infinity;
        this.right = -Infinity;
        this.bottom = -Infinity;
        this.left = Infinity;
    }
    update(node, xy) {
        const { x, y } = xy(node);
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
    }
}
function secondWalk(v, m, layout) {
    v.x = v.prelim + m;
    v.y = v.depth;
    layout.update(v);
    v.children.forEach((w) => secondWalk(w, m + v.mod, layout));
}
// After the second walk the parent nodes are positioned at the center of their immediate children.
// If we want the parent nodes to be positioned at the center of the subtree for which they are roots,
// we need a third walk to adjust the positions.
function thirdWalk(v) {
    const children = v.children;
    let leafCount = 0;
    children.forEach((w) => {
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
    const layout = new TreeLayout();
    firstWalk(root, 1);
    secondWalk(root, -root.prelim, layout);
    thirdWalk(root);
    return layout;
}
exports.treeLayout = treeLayout;
class TreeLayout {
    constructor() {
        this.dimensions = new Dimensions();
        this.leafCount = 0;
        this.nodes = [];
        // One might want to process leaf nodes separately from the rest of the tree.
        // For example, position labels corresponding to leafs vertically, rather than horizontally.
        this.leafNodes = [];
        this.nonLeafNodes = [];
        this.depth = 0;
    }
    update(node) {
        this.dimensions.update(node, (node) => ({ x: node.x, y: node.y }));
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
    }
    resize(width, height, shiftX = 0, shiftY = 0, flipX = false) {
        const xSteps = this.leafCount - 1;
        const ySteps = this.depth;
        const dimensions = this.dimensions;
        let scalingX = 1;
        let scalingY = 1;
        if (width > 0 && xSteps) {
            const existingSpacingX = (dimensions.right - dimensions.left) / xSteps;
            const desiredSpacingX = width / xSteps;
            scalingX = desiredSpacingX / existingSpacingX;
            if (flipX) {
                scalingX = -scalingX;
            }
        }
        if (height > 0 && ySteps) {
            const existingSpacingY = (dimensions.bottom - dimensions.top) / ySteps;
            const desiredSpacingY = height / ySteps;
            scalingY = desiredSpacingY / existingSpacingY;
        }
        const screenDimensions = new Dimensions();
        this.nodes.forEach((node) => {
            node.screenX = node.x * scalingX;
            node.screenY = node.y * scalingY;
            screenDimensions.update(node, (node) => ({ x: node.screenX, y: node.screenY }));
        });
        // Normalize so that root top and leftmost leaf left start at zero.
        const offsetX = -screenDimensions.left;
        const offsetY = -screenDimensions.top;
        this.nodes.forEach((node) => {
            node.screenX += offsetX + shiftX;
            node.screenY += offsetY + shiftY;
        });
    }
}
exports.TreeLayout = TreeLayout;
