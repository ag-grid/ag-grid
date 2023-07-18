var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Matrix } from './matrix.mjs';
import { createId } from '../util/id.mjs';
import { ChangeDetectable, SceneChangeDetection, RedrawType } from './changeDetectable.mjs';
export { SceneChangeDetection, RedrawType };
export var PointerEvents;
(function (PointerEvents) {
    PointerEvents[PointerEvents["All"] = 0] = "All";
    PointerEvents[PointerEvents["None"] = 1] = "None";
})(PointerEvents || (PointerEvents = {}));
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
export class Node extends ChangeDetectable {
    constructor({ isVirtual } = {}) {
        super();
        /** Unique number to allow creation order to be easily determined. */
        this.serialNumber = Node._nextSerialNumber++;
        /**
         * Unique node ID in the form `ClassName-NaturalNumber`.
         */
        this.id = createId(this);
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
        this._virtualChildren = [];
        this._children = [];
        // Used to check for duplicate nodes.
        this.childSet = {}; // new Set<Node>()
        // These matrices may need to have package level visibility
        // for performance optimization purposes.
        this.matrix = new Matrix();
        this.inverseMatrix = new Matrix();
        this.dirtyTransform = false;
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
        this.isVirtual = isVirtual !== null && isVirtual !== void 0 ? isVirtual : false;
    }
    /**
     * Some arbitrary data bound to the node.
     */
    get datum() {
        var _a;
        if (this._datum !== undefined) {
            return this._datum;
        }
        return (_a = this._parent) === null || _a === void 0 ? void 0 : _a.datum;
    }
    set datum(datum) {
        this._datum = datum;
    }
    _setLayerManager(value) {
        this._layerManager = value;
        this._debug = value === null || value === void 0 ? void 0 : value.debug;
        for (const child of this._children) {
            child._setLayerManager(value);
        }
        for (const child of this._virtualChildren) {
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
        if (this._virtualChildren.length === 0)
            return this._children;
        const result = [...this._children];
        for (const next of this._virtualChildren) {
            result.push(...next.children);
        }
        return result;
    }
    get virtualChildren() {
        return this._virtualChildren;
    }
    hasVirtualChildren() {
        return this._virtualChildren.length > 0;
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
        if (!Array.isArray(nodes)) {
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
            if (node.isVirtual) {
                this._virtualChildren.push(node);
            }
            else {
                this._children.push(node);
            }
            this.childSet[node.id] = true;
            node._parent = this;
            node._setLayerManager(this.layerManager);
        }
        this.dirtyZIndex = true;
        this.markDirty(this, RedrawType.MAJOR);
    }
    appendChild(node) {
        this.append(node);
        return node;
    }
    removeChild(node) {
        const error = () => {
            throw new Error(`The node to be removed is not a child of this node.`);
        };
        if (node.parent !== this) {
            error();
        }
        if (node.isVirtual) {
            const i = this._virtualChildren.indexOf(node);
            if (i < 0)
                error();
            this._virtualChildren.splice(i, 1);
        }
        else {
            const i = this._children.indexOf(node);
            if (i < 0)
                error();
            this._children.splice(i, 1);
        }
        delete this.childSet[node.id];
        node._parent = undefined;
        node._setLayerManager();
        this.dirtyZIndex = true;
        this.markDirty(node, RedrawType.MAJOR);
        return node;
    }
    calculateCumulativeMatrix() {
        this.computeTransformMatrix();
        const matrix = Matrix.flyweight(this.matrix);
        let parent = this.parent;
        while (parent) {
            parent.computeTransformMatrix();
            matrix.preMultiplySelf(parent.matrix);
            parent = parent.parent;
        }
        return matrix;
    }
    transformPoint(x, y) {
        const matrix = this.calculateCumulativeMatrix();
        return matrix.invertSelf().transformPoint(x, y);
    }
    inverseTransformPoint(x, y) {
        const matrix = this.calculateCumulativeMatrix();
        return matrix.transformPoint(x, y);
    }
    transformBBox(bbox) {
        const matrix = this.calculateCumulativeMatrix();
        return matrix.invertSelf().transformBBox(bbox);
    }
    inverseTransformBBox(bbox) {
        const matrix = this.calculateCumulativeMatrix();
        return matrix.transformBBox(bbox);
    }
    markDirtyTransform() {
        this.dirtyTransform = true;
        this.markDirty(this, RedrawType.MAJOR);
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
                const child = children[i];
                const containsPoint = (_a = child.computeTransformedBBox()) === null || _a === void 0 ? void 0 : _a.containsPoint(x, y);
                const hit = containsPoint ? child.pickNode(x, y) : undefined;
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
        const matrix = Matrix.flyweight(this.matrix);
        let parent = this.parent;
        while (parent) {
            parent.computeTransformMatrix();
            matrix.preMultiplySelf(parent.matrix);
            parent = parent.parent;
        }
        matrix.transformBBox(bbox, bbox);
        return bbox;
    }
    computeTransformMatrix() {
        if (!this.dirtyTransform) {
            return;
        }
        const { matrix, scalingX, scalingY, rotation, translationX, translationY, scalingCenterX, scalingCenterY, rotationCenterX, rotationCenterY, } = this;
        Matrix.updateTransformMatrix(matrix, scalingX, scalingY, rotation, translationX, translationY, {
            scalingCenterX,
            scalingCenterY,
            rotationCenterX,
            rotationCenterY,
        });
        matrix.inverseTo(this.inverseMatrix);
        this.dirtyTransform = false;
    }
    render(renderCtx) {
        const { stats } = renderCtx;
        this._dirty = RedrawType.NONE;
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
    markDirty(_source, type = RedrawType.TRIVIAL, parentType = type) {
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
        const { force = false, recursive = true } = opts !== null && opts !== void 0 ? opts : {};
        if (this._dirty === RedrawType.NONE && !force) {
            return;
        }
        this._dirty = RedrawType.NONE;
        if (recursive !== false) {
            for (const child of this._virtualChildren) {
                child.markClean({ force });
            }
        }
        if (recursive === true) {
            for (const child of this._children) {
                child.markClean({ force });
            }
        }
    }
    visibilityChanged() {
        // Override point for sub-classes to react to visibility changes.
    }
    get nodeCount() {
        let count = 1;
        let dirtyCount = this._dirty >= RedrawType.NONE || this.dirtyTransform ? 1 : 0;
        let visibleCount = this.visible ? 1 : 0;
        const countChild = (child) => {
            const { count: childCount, visibleCount: childVisibleCount, dirtyCount: childDirtyCount } = child.nodeCount;
            count += childCount;
            visibleCount += childVisibleCount;
            dirtyCount += childDirtyCount;
        };
        for (const child of this._children) {
            countChild(child);
        }
        for (const child of this._virtualChildren) {
            countChild(child);
        }
        return { count, visibleCount, dirtyCount };
    }
    zIndexChanged() {
        // Override point for sub-classes.
    }
}
Node._nextSerialNumber = 0;
__decorate([
    SceneChangeDetection({ type: 'transform' })
], Node.prototype, "scalingX", void 0);
__decorate([
    SceneChangeDetection({ type: 'transform' })
], Node.prototype, "scalingY", void 0);
__decorate([
    SceneChangeDetection({ type: 'transform' })
], Node.prototype, "scalingCenterX", void 0);
__decorate([
    SceneChangeDetection({ type: 'transform' })
], Node.prototype, "scalingCenterY", void 0);
__decorate([
    SceneChangeDetection({ type: 'transform' })
], Node.prototype, "rotationCenterX", void 0);
__decorate([
    SceneChangeDetection({ type: 'transform' })
], Node.prototype, "rotationCenterY", void 0);
__decorate([
    SceneChangeDetection({ type: 'transform' })
], Node.prototype, "rotation", void 0);
__decorate([
    SceneChangeDetection({ type: 'transform' })
], Node.prototype, "translationX", void 0);
__decorate([
    SceneChangeDetection({ type: 'transform' })
], Node.prototype, "translationY", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR, changeCb: (o) => o.visibilityChanged() })
], Node.prototype, "visible", void 0);
__decorate([
    SceneChangeDetection({
        redraw: RedrawType.TRIVIAL,
        changeCb: zIndexChangedCallback,
    })
], Node.prototype, "zIndex", void 0);
__decorate([
    SceneChangeDetection({
        redraw: RedrawType.TRIVIAL,
        changeCb: zIndexChangedCallback,
    })
], Node.prototype, "zIndexSubOrder", void 0);
