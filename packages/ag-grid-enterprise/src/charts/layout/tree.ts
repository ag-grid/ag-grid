interface Tick {
    labels: string[];
}

class TreeNode {
    label: string;
    x: number = 0;
    y: number = 0;
    subtreeLeft: number = NaN;
    subtreeRight: number = NaN;
    screenX: number = 0;
    screenY: number = 0;
    parent?: TreeNode;
    children = [] as TreeNode[];
    leafCount: number = 0;
    depth: number;
    prelim: number = 0;
    mod: number = 0;
    thread?: TreeNode;
    ancestor = this;
    change: number = 0;
    shift: number = 0;
    number: number; // current number in sibling group (index)

    constructor(label = '', parent?: any, number = 0) {
        this.label = label;
        // screenX and screenY are meant to be recomputed from (layout) x and y
        // when the tree is resized (without performing another layout)
        this.parent = parent;
        this.depth = parent ? parent.depth + 1 : 0;
        this.number = number;
    }

    getLeftSibling(): TreeNode | undefined {
        return this.number > 0  && this.parent ? this.parent.children[this.number - 1] : undefined;
    }

    getLeftmostSibling(): TreeNode | undefined {
        return this.number > 0 && this.parent ? this.parent.children[0] : undefined;
    }

    // traverse the left contour of a subtree, return the successor of v on this contour
    nextLeft(): TreeNode | undefined {
        return this.children ? this.children[0] : this.thread;
    }
    // traverse the right contour of a subtree, return the successor of v on this contour
    nextRight(): TreeNode | undefined {
        return this.children ? this.children[this.children.length - 1] : this.thread;
    }

    getSiblings(): TreeNode[] {
        return this.parent ? this.parent.children.filter((_, i) => i !== this.number) : [];
    }
}

export function ticksToTree(ticks: Tick[], pad = true): TreeNode {
    const root: any = new TreeNode();
    let depth = 0;

    if (pad) {
        ticks.forEach(tick => depth = Math.max(depth, tick.labels.length));
    }
    ticks.forEach(tick => {
        if (pad) {
            while (tick.labels.length < depth) {
                tick.labels.unshift('');
            }
        }
        insertTick(root, tick);
    });

    return root;
}

function insertTick(root: TreeNode, tick: Tick) {
    const pathParts = tick.labels.slice().reverse(); // path elements from root to leaf label
    const lastPartIndex = pathParts.length - 1;

    pathParts.forEach((pathPart, partIndex) => {
        const children = root.children;
        const existingNode = children.find(child => child.label === pathPart);
        const isNotLeaf = partIndex !== lastPartIndex;
        if (existingNode && isNotLeaf) { // the isNotLeaf check is to allow duplicate leafs
            root = existingNode;
        } else {
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
function moveSubtree(wm: TreeNode, wp: TreeNode, shift: number) {
    const subtrees = wp.number - wm.number;
    const ratio = shift / subtrees;
    wp.change -= ratio;
    wp.shift += shift;
    wm.change += ratio;
    wp.prelim += shift;
    wp.mod += shift;
}

function ancestor(vim: TreeNode, v: TreeNode, defaultAncestor: TreeNode): TreeNode {
    return v.getSiblings().indexOf(vim.ancestor) >= 0 ? vim.ancestor : defaultAncestor;
}

// Spaces out the children.
function executeShifts(v: TreeNode) {
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
function apportion(v: TreeNode, defaultAncestor: TreeNode, distance: number) {
    const w = v.getLeftSibling();

    if (w) {
        let vop = v;
        let vip = v;
        let vim = w;
        let vom = vip.getLeftmostSibling()!;
        let sip = vip.mod;
        let sop = vop.mod;
        let sim = vim.mod;
        let som = vom.mod;

        while (vim.nextRight() && vip.nextLeft()) {
            vim = vim.nextRight()!;
            vip = vip.nextLeft()!;
            vom = vom.nextLeft()!;
            vop = vop.nextRight()!;
            vop.ancestor = v;
            const shift = (vim.prelim + sim) - (vip.prelim + sip) + distance;
            if (shift > 0) {
                moveSubtree(ancestor(vim, v, defaultAncestor), v , shift);
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
        } else {
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
function firstWalk(node: TreeNode, distance: number) {
    const children = node.children;

    if (children.length) {
        let defaultAncestor = children[0];
        children.forEach(child => {
            firstWalk(child, distance);
            defaultAncestor = apportion(child, defaultAncestor, distance);
        });

        executeShifts(node);

        const midpoint = (children[0].prelim + children[children.length - 1].prelim) / 2;
        const leftSibling = node.getLeftSibling();
        if (leftSibling) {
            node.prelim = leftSibling.prelim + distance;
            node.mod = node.prelim - midpoint;
        } else {
            node.prelim = midpoint;
        }
    } else {
        const leftSibling = node.getLeftSibling();
        node.prelim = leftSibling ? leftSibling.prelim + distance : 0;
    }
}

class Dimensions {
    top: number = Infinity;
    right: number = -Infinity;
    bottom: number = -Infinity;
    left: number = Infinity;

    update(node: TreeNode, xy: (node: TreeNode) => {x: number, y: number}) {
        const {x, y} = xy(node);
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

function secondWalk(v: TreeNode, m: number, layout: TreeLayout) {
    v.x = v.prelim + m;
    v.y = v.depth;
    layout.update(v);
    v.children.forEach(w => secondWalk(w, m + v.mod, layout));
}

// After the second walk the parent nodes are positioned at the center of their immediate children.
// If we want the parent nodes to be positioned at the center of the subtree for which they are roots,
// we need a third walk to adjust the positions.
function thirdWalk(v: TreeNode) {
    const children = v.children;
    let leafCount = 0;
    children.forEach(w => {
        thirdWalk(w);
        if (w.children.length) {
            leafCount += w.leafCount;
        } else {
            leafCount++;
        }
    });
    v.leafCount = leafCount;
    if (children.length) {
        v.subtreeLeft = children[0].subtreeLeft;
        v.subtreeRight = children[v.children.length - 1].subtreeRight;
        v.x = (v.subtreeLeft + v.subtreeRight) / 2;
    } else {
        v.subtreeLeft = v.x;
        v.subtreeRight = v.x;
    }
}

export function treeLayout(root: TreeNode): TreeLayout {
    const layout = new TreeLayout;

    firstWalk(root, 1);
    secondWalk(root, -root.prelim, layout);
    thirdWalk(root);

    return layout;
}

export class TreeLayout {
    dimensions = new Dimensions;
    leafCount = 0;
    nodes: TreeNode[] = [];
    // One might want to process leaf nodes separately from the rest of the tree.
    // For example, position labels corresponding to leafs vertically, rather than horizontally.
    leafNodes: TreeNode[] = [];
    nonLeafNodes: TreeNode[] = [];
    depth = 0;

    update(node: TreeNode) {
        this.dimensions.update(node, node => ({x: node.x, y: node.y}));
        if (!node.children.length) {
            this.leafCount++;
            this.leafNodes.push(node);
        } else {
            this.nonLeafNodes.push(node);
        }
        if (node.depth > this.depth) {
            this.depth = node.depth;
        }
        this.nodes.push(node);
    }

    resize(width: number, height: number, shiftX = 0, shiftY = 0) {
        const xSteps = this.leafCount - 1;
        const ySteps = this.depth;
        const dimensions = this.dimensions;

        let scalingX = 1;
        let scalingY = 1;
        if (width > 0 && xSteps) {
            const existingSpacingX = (dimensions.right - dimensions.left) / xSteps;
            const desiredSpacingX = width / xSteps;
            scalingX = desiredSpacingX / existingSpacingX;
        }
        if (height > 0 && ySteps) {
            const existingSpacingY = (dimensions.bottom - dimensions.top) / ySteps;
            const desiredSpacingY = height / ySteps;
            scalingY = desiredSpacingY / existingSpacingY;
        }

        const screenDimensions = new Dimensions();
        this.nodes.forEach(node => {
            node.screenX = node.x * scalingX;
            node.screenY = node.y * scalingY;
            screenDimensions.update(node, node => ({x: node.screenX, y: node.screenY}));
        });
        // Normalize so that root top and leftmost leaf left start at zero.
        const offsetX = -screenDimensions.left;
        const offsetY = -screenDimensions.top;
        this.nodes.forEach(node => {
            node.screenX += offsetX + shiftX;
            node.screenY += offsetY + shiftY;
        });
    }
}

function logTree(root: TreeNode, formatter?: (node: TreeNode) => string) {
    root.children.forEach(child => logTree(child, formatter));
    if (formatter) {
        console.log(formatter(root));
    } else {
        console.log(root);
    }
}
