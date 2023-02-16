"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = exports.PointerEvents = exports.RedrawType = exports.SceneChangeDetection = void 0;
const matrix_1 = require("./matrix");
const id_1 = require("../util/id");
const changeDetectable_1 = require("./changeDetectable");
Object.defineProperty(exports, "SceneChangeDetection", { enumerable: true, get: function () { return changeDetectable_1.SceneChangeDetection; } });
Object.defineProperty(exports, "RedrawType", { enumerable: true, get: function () { return changeDetectable_1.RedrawType; } });
var PointerEvents;
(function (PointerEvents) {
    PointerEvents[PointerEvents["All"] = 0] = "All";
    PointerEvents[PointerEvents["None"] = 1] = "None";
})(PointerEvents = exports.PointerEvents || (exports.PointerEvents = {}));
const zIndexChangedCallback = (o) => {
    if (o.parent) {
        o.parent.dirtyZIndex = true;
    }
    o.zIndexChanged();
};
/**
 * Abstract scene graph node.
 * Each node can have zero or one parent and belong to zero or one scene.
 */
class Node extends changeDetectable_1.ChangeDetectable {
    constructor() {
        super(...arguments);
        /** Unique number to allow creation order to be easily determined. */
        this.serialNumber = Node._nextSerialNumber++;
        /**
         * Unique node ID in the form `ClassName-NaturalNumber`.
         */
        this.id = id_1.createId(this);
        /**
         * Some number to identify this node, typically within a `Group` node.
         * Usually this will be some enum value used as a selector.
         */
        this.tag = NaN;
        /**
         * To simplify the type system (especially in Selections) we don't have the `Parent` node
         * (one that has children). Instead, we mimic HTML DOM, where any node can have children.
         * But we still need to distinguish regular leaf nodes from container leafs somehow.
         */
        this.isContainerNode = false;
        this._children = [];
        // Used to check for duplicate nodes.
        this.childSet = {}; // new Set<Node>()
        // These matrices may need to have package level visibility
        // for performance optimization purposes.
        this.matrix = new matrix_1.Matrix();
        this.inverseMatrix = new matrix_1.Matrix();
        this._dirtyTransform = false;
        this.scalingX = 1;
        this.scalingY = 1;
        /**
         * The center of scaling.
         * The default value of `null` means the scaling center will be
         * determined automatically, as the center of the bounding box
         * of a node.
         */
        this.scalingCenterX = null;
        this.scalingCenterY = null;
        this.rotationCenterX = null;
        this.rotationCenterY = null;
        /**
         * Rotation angle in radians.
         * The value is set as is. No normalization to the [-180, 180) or [0, 360)
         * interval is performed.
         */
        this.rotation = 0;
        this.translationX = 0;
        this.translationY = 0;
        this.visible = true;
        this.dirtyZIndex = false;
        this.zIndex = 0;
        /** Discriminators for render order within a zIndex. */
        this.zIndexSubOrder = undefined;
        this.pointerEvents = PointerEvents.All;
    }
    /**
     * This is meaningfully faster than `instanceof` and should be the preferred way
     * of checking inside loops.
     * @param node
     */
    static isNode(node) {
        return node ? node.matrix !== undefined : false;
    }
    _setLayerManager(value) {
        this._layerManager = value;
        this._debug = value === null || value === void 0 ? void 0 : value.debug;
        for (const child of this.children) {
            child._setLayerManager(value);
        }
    }
    get layerManager() {
        return this._layerManager;
    }
    get parent() {
        return this._parent;
    }
    get children() {
        return this._children;
    }
    /**
     * Appends one or more new node instances to this parent.
     * If one needs to:
     * - move a child to the end of the list of children
     * - move a child from one parent to another (including parents in other scenes)
     * one should use the {@link insertBefore} method instead.
     * @param nodes A node or nodes to append.
     */
    append(nodes) {
        // Passing a single parameter to an open-ended version of `append`
        // would be 30-35% slower than this.
        if (Node.isNode(nodes)) {
            nodes = [nodes];
        }
        for (const node of nodes) {
            if (node.parent) {
                throw new Error(`${node} already belongs to another parent: ${node.parent}.`);
            }
            if (node.layerManager) {
                throw new Error(`${node} already belongs to a scene: ${node.layerManager}.`);
            }
            if (this.childSet[node.id]) {
                // Cast to `any` to avoid `Property 'name' does not exist on type 'Function'`.
                throw new Error(`Duplicate ${node.constructor.name} node: ${node}`);
            }
            this._children.push(node);
            this.childSet[node.id] = true;
            node._parent = this;
            node._setLayerManager(this.layerManager);
        }
        this.dirtyZIndex = true;
        this.markDirty(this, changeDetectable_1.RedrawType.MAJOR);
    }
    appendChild(node) {
        this.append(node);
        return node;
    }
    removeChild(node) {
        if (node.parent === this) {
            const i = this.children.indexOf(node);
            if (i >= 0) {
                this._children.splice(i, 1);
                delete this.childSet[node.id];
                node._parent = undefined;
                node._setLayerManager();
                this.dirtyZIndex = true;
                this.markDirty(node, changeDetectable_1.RedrawType.MAJOR);
                return node;
            }
        }
        throw new Error(`The node to be removed is not a child of this node.`);
    }
    /**
     * Inserts the node `node` before the existing child node `nextNode`.
     * If `nextNode` is null, insert `node` at the end of the list of children.
     * If the `node` belongs to another parent, it is first removed.
     * Returns the `node`.
     * @param node
     * @param nextNode
     */
    insertBefore(node, nextNode) {
        const parent = node.parent;
        if (node.parent) {
            node.parent.removeChild(node);
        }
        if (nextNode && nextNode.parent === this) {
            const i = this.children.indexOf(nextNode);
            if (i >= 0) {
                this._children.splice(i, 0, node);
                this.childSet[node.id] = true;
                node._parent = this;
                node._setLayerManager(this.layerManager);
            }
            else {
                throw new Error(`${nextNode} has ${parent} as the parent, ` + `but is not in its list of children.`);
            }
            this.dirtyZIndex = true;
            this.markDirty(node, changeDetectable_1.RedrawType.MAJOR);
        }
        else {
            this.append(node);
        }
        return node;
    }
    get nextSibling() {
        const { parent } = this;
        if (parent) {
            const { children } = parent;
            const index = children.indexOf(this);
            if (index >= 0 && index <= children.length - 1) {
                return children[index + 1];
            }
        }
    }
    transformPoint(x, y) {
        const matrix = matrix_1.Matrix.flyweight(this.matrix);
        let parent = this.parent;
        while (parent) {
            matrix.preMultiplySelf(parent.matrix);
            parent = parent.parent;
        }
        return matrix.invertSelf().transformPoint(x, y);
    }
    inverseTransformPoint(x, y) {
        const matrix = matrix_1.Matrix.flyweight(this.matrix);
        let parent = this.parent;
        while (parent) {
            matrix.preMultiplySelf(parent.matrix);
            parent = parent.parent;
        }
        return matrix.transformPoint(x, y);
    }
    markDirtyTransform() {
        this._dirtyTransform = true;
        this.markDirty(this, changeDetectable_1.RedrawType.MAJOR);
    }
    containsPoint(_x, _y) {
        return false;
    }
    /**
     * Hit testing method.
     * Recursively checks if the given point is inside this node or any of its children.
     * Returns the first matching node or `undefined`.
     * Nodes that render later (show on top) are hit tested first.
     */
    pickNode(x, y) {
        var _a;
        if (!this.visible || this.pointerEvents === PointerEvents.None || !this.containsPoint(x, y)) {
            return;
        }
        const children = this.children;
        if (children.length > 1000) {
            // Try to optimise which children to interrogate; BBox calculation is an approximation
            // for more complex shapes, so discarding items based on this will save a lot of
            // processing when the point is nowhere near the child.
            for (let i = children.length - 1; i >= 0; i--) {
                const hit = ((_a = children[i].computeBBox()) === null || _a === void 0 ? void 0 : _a.containsPoint(x, y)) ? children[i].pickNode(x, y) : undefined;
                if (hit) {
                    return hit;
                }
            }
        }
        else if (children.length) {
            // Nodes added later should be hit-tested first,
            // as they are rendered on top of the previously added nodes.
            for (let i = children.length - 1; i >= 0; i--) {
                const hit = children[i].pickNode(x, y);
                if (hit) {
                    return hit;
                }
            }
        }
        else if (!this.isContainerNode) {
            // a leaf node, but not a container leaf
            return this;
        }
    }
    findNodes(predicate) {
        const result = predicate(this) ? [this] : [];
        for (const child of this.children) {
            const childResult = child.findNodes(predicate);
            if (childResult) {
                result.push(...childResult);
            }
        }
        return result;
    }
    computeBBox() {
        return;
    }
    computeTransformedBBox() {
        const bbox = this.computeBBox();
        if (!bbox) {
            return undefined;
        }
        this.computeTransformMatrix();
        const matrix = matrix_1.Matrix.flyweight(this.matrix);
        let parent = this.parent;
        while (parent) {
            parent.computeTransformMatrix();
            matrix.preMultiplySelf(parent.matrix);
            parent = parent.parent;
        }
        matrix.transformBBox(bbox, bbox);
        return bbox;
    }
    computeBBoxCenter() {
        const bbox = this.computeBBox && this.computeBBox();
        if (bbox) {
            return [bbox.x + bbox.width * 0.5, bbox.y + bbox.height * 0.5];
        }
        return [0, 0];
    }
    computeTransformMatrix() {
        if (!this._dirtyTransform) {
            return;
        }
        const { matrix, scalingX, scalingY, rotation, translationX, translationY, scalingCenterX, scalingCenterY, rotationCenterX, rotationCenterY, } = this;
        matrix_1.Matrix.updateTransformMatrix(matrix, scalingX, scalingY, rotation, translationX, translationY, {
            scalingCenterX,
            scalingCenterY,
            rotationCenterX,
            rotationCenterY,
        });
        matrix.inverseTo(this.inverseMatrix);
        this._dirtyTransform = false;
    }
    render(renderCtx) {
        const { stats } = renderCtx;
        this._dirty = changeDetectable_1.RedrawType.NONE;
        if (stats)
            stats.nodesRendered++;
    }
    clearBBox(ctx) {
        const bbox = this.computeBBox();
        if (bbox == null) {
            return;
        }
        const { x, y, width, height } = bbox;
        const topLeft = this.transformPoint(x, y);
        const bottomRight = this.transformPoint(x + width, y + height);
        ctx.clearRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
    }
    markDirty(_source, type = changeDetectable_1.RedrawType.TRIVIAL, parentType = type) {
        if (this._dirty > type) {
            return;
        }
        if (this._dirty === type && type === parentType) {
            return;
        }
        this._dirty = type;
        if (this.parent) {
            this.parent.markDirty(this, parentType);
        }
        else if (this.layerManager) {
            this.layerManager.markDirty();
        }
    }
    get dirty() {
        return this._dirty;
    }
    markClean(opts) {
        const { force = false, recursive = true } = opts || {};
        if (this._dirty === changeDetectable_1.RedrawType.NONE && !force) {
            return;
        }
        this._dirty = changeDetectable_1.RedrawType.NONE;
        if (recursive) {
            for (const child of this.children) {
                child.markClean();
            }
        }
    }
    visibilityChanged() {
        // Override point for sub-classes to react to visibility changes.
    }
    get nodeCount() {
        let count = 1;
        let dirtyCount = this._dirty >= changeDetectable_1.RedrawType.NONE || this._dirtyTransform ? 1 : 0;
        let visibleCount = this.visible ? 1 : 0;
        for (const child of this._children) {
            const { count: childCount, visibleCount: childVisibleCount, dirtyCount: childDirtyCount } = child.nodeCount;
            count += childCount;
            visibleCount += childVisibleCount;
            dirtyCount += childDirtyCount;
        }
        return { count, visibleCount, dirtyCount };
    }
    zIndexChanged() {
        // Override point for sub-classes.
    }
}
Node._nextSerialNumber = 0;
__decorate([
    changeDetectable_1.SceneChangeDetection({ type: 'transform' })
], Node.prototype, "scalingX", void 0);
__decorate([
    changeDetectable_1.SceneChangeDetection({ type: 'transform' })
], Node.prototype, "scalingY", void 0);
__decorate([
    changeDetectable_1.SceneChangeDetection({ type: 'transform' })
], Node.prototype, "scalingCenterX", void 0);
__decorate([
    changeDetectable_1.SceneChangeDetection({ type: 'transform' })
], Node.prototype, "scalingCenterY", void 0);
__decorate([
    changeDetectable_1.SceneChangeDetection({ type: 'transform' })
], Node.prototype, "rotationCenterX", void 0);
__decorate([
    changeDetectable_1.SceneChangeDetection({ type: 'transform' })
], Node.prototype, "rotationCenterY", void 0);
__decorate([
    changeDetectable_1.SceneChangeDetection({ type: 'transform' })
], Node.prototype, "rotation", void 0);
__decorate([
    changeDetectable_1.SceneChangeDetection({ type: 'transform' })
], Node.prototype, "translationX", void 0);
__decorate([
    changeDetectable_1.SceneChangeDetection({ type: 'transform' })
], Node.prototype, "translationY", void 0);
__decorate([
    changeDetectable_1.SceneChangeDetection({ redraw: changeDetectable_1.RedrawType.MAJOR, changeCb: (o) => o.visibilityChanged() })
], Node.prototype, "visible", void 0);
__decorate([
    changeDetectable_1.SceneChangeDetection({
        redraw: changeDetectable_1.RedrawType.TRIVIAL,
        changeCb: zIndexChangedCallback,
    })
], Node.prototype, "zIndex", void 0);
__decorate([
    changeDetectable_1.SceneChangeDetection({
        redraw: changeDetectable_1.RedrawType.TRIVIAL,
        changeCb: zIndexChangedCallback,
    })
], Node.prototype, "zIndexSubOrder", void 0);
exports.Node = Node;
