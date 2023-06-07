var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Matrix } from './matrix';
import { createId } from '../util/id';
import { ChangeDetectable, SceneChangeDetection, RedrawType } from './changeDetectable';
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
    constructor() {
        super(...arguments);
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
        this._children = [];
        // Used to check for duplicate nodes.
        this.childSet = {}; // new Set<Node>()
        // These matrices may need to have package level visibility
        // for performance optimization purposes.
        this.matrix = new Matrix();
        this.inverseMatrix = new Matrix();
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
            this._children.push(node);
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
        if (node.parent === this) {
            const i = this.children.indexOf(node);
            if (i >= 0) {
                this._children.splice(i, 1);
                delete this.childSet[node.id];
                node._parent = undefined;
                node._setLayerManager();
                this.dirtyZIndex = true;
                this.markDirty(node, RedrawType.MAJOR);
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
            this.markDirty(node, RedrawType.MAJOR);
        }
        else {
            this.append(node);
        }
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
        this._dirtyTransform = true;
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
        if (!this._dirtyTransform) {
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
        this._dirtyTransform = false;
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
        let dirtyCount = this._dirty >= RedrawType.NONE || this._dirtyTransform ? 1 : 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY2VuZS9ub2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFbEMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUN0QyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQUUsVUFBVSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFNeEYsT0FBTyxFQUFFLG9CQUFvQixFQUFFLFVBQVUsRUFBRSxDQUFDO0FBSzVDLE1BQU0sQ0FBTixJQUFZLGFBR1g7QUFIRCxXQUFZLGFBQWE7SUFDckIsK0NBQUcsQ0FBQTtJQUNILGlEQUFJLENBQUE7QUFDUixDQUFDLEVBSFcsYUFBYSxLQUFiLGFBQWEsUUFHeEI7QUFnQkQsTUFBTSxxQkFBcUIsR0FBRyxDQUFDLENBQU0sRUFBRSxFQUFFO0lBQ3JDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRTtRQUNWLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztLQUMvQjtJQUNELENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztBQUN0QixDQUFDLENBQUM7QUFvQkY7OztHQUdHO0FBQ0gsTUFBTSxPQUFnQixJQUFLLFNBQVEsZ0JBQWdCO0lBQW5EOztRQUdJLHFFQUFxRTtRQUM1RCxpQkFBWSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBRWpEOztXQUVHO1FBQ00sT0FBRSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQWlCN0I7OztXQUdHO1FBQ0gsUUFBRyxHQUFXLEdBQUcsQ0FBQztRQUVsQjs7OztXQUlHO1FBQ08sb0JBQWUsR0FBWSxLQUFLLENBQUM7UUF3Qm5DLGNBQVMsR0FBVyxFQUFFLENBQUM7UUFLL0IscUNBQXFDO1FBQzdCLGFBQVEsR0FBOEIsRUFBRSxDQUFDLENB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