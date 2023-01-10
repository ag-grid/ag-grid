var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
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
var zIndexChangedCallback = function (o) {
    if (o.parent) {
        o.parent.dirtyZIndex = true;
    }
    o.zIndexChanged();
};
/**
 * Abstract scene graph node.
 * Each node can have zero or one parent and belong to zero or one scene.
 */
var Node = /** @class */ (function (_super) {
    __extends(Node, _super);
    function Node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /** Unique number to allow creation order to be easily determined. */
        _this.serialNumber = Node._nextSerialNumber++;
        /**
         * Unique node ID in the form `ClassName-NaturalNumber`.
         */
        _this.id = createId(_this);
        /**
         * Some number to identify this node, typically within a `Group` node.
         * Usually this will be some enum value used as a selector.
         */
        _this.tag = NaN;
        /**
         * To simplify the type system (especially in Selections) we don't have the `Parent` node
         * (one that has children). Instead, we mimic HTML DOM, where any node can have children.
         * But we still need to distinguish regular leaf nodes from container leafs somehow.
         */
        _this.isContainerNode = false;
        _this._children = [];
        // Used to check for duplicate nodes.
        _this.childSet = {}; // new Set<Node>()
        // These matrices may need to have package level visibility
        // for performance optimization purposes.
        _this.matrix = new Matrix();
        _this.inverseMatrix = new Matrix();
        _this._dirtyTransform = false;
        _this.scalingX = 1;
        _this.scalingY = 1;
        /**
         * The center of scaling.
         * The default value of `null` means the scaling center will be
         * determined automatically, as the center of the bounding box
         * of a node.
         */
        _this.scalingCenterX = null;
        _this.scalingCenterY = null;
        _this.rotationCenterX = null;
        _this.rotationCenterY = null;
        /**
         * Rotation angle in radians.
         * The value is set as is. No normalization to the [-180, 180) or [0, 360)
         * interval is performed.
         */
        _this.rotation = 0;
        _this.translationX = 0;
        _this.translationY = 0;
        _this.visible = true;
        _this.dirtyZIndex = false;
        _this.zIndex = 0;
        /** Discriminators for render order within a zIndex. */
        _this.zIndexSubOrder = undefined;
        _this.pointerEvents = PointerEvents.All;
        return _this;
    }
    /**
     * This is meaningfully faster than `instanceof` and should be the preferred way
     * of checking inside loops.
     * @param node
     */
    Node.isNode = function (node) {
        return node ? node.matrix !== undefined : false;
    };
    Node.prototype._setScene = function (value) {
        var e_1, _a;
        this._scene = value;
        this._debug = value === null || value === void 0 ? void 0 : value.debug;
        try {
            for (var _b = __values(this.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                child._setScene(value);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    Object.defineProperty(Node.prototype, "scene", {
        get: function () {
            return this._scene;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "children", {
        get: function () {
            return this._children;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Appends one or more new node instances to this parent.
     * If one needs to:
     * - move a child to the end of the list of children
     * - move a child from one parent to another (including parents in other scenes)
     * one should use the {@link insertBefore} method instead.
     * @param nodes A node or nodes to append.
     */
    Node.prototype.append = function (nodes) {
        var e_2, _a;
        // Passing a single parameter to an open-ended version of `append`
        // would be 30-35% slower than this.
        if (Node.isNode(nodes)) {
            nodes = [nodes];
        }
        try {
            for (var nodes_1 = __values(nodes), nodes_1_1 = nodes_1.next(); !nodes_1_1.done; nodes_1_1 = nodes_1.next()) {
                var node = nodes_1_1.value;
                if (node.parent) {
                    throw new Error(node + " already belongs to another parent: " + node.parent + ".");
                }
                if (node.scene) {
                    throw new Error(node + " already belongs to a scene: " + node.scene + ".");
                }
                if (this.childSet[node.id]) {
                    // Cast to `any` to avoid `Property 'name' does not exist on type 'Function'`.
                    throw new Error("Duplicate " + node.constructor.name + " node: " + node);
                }
                this._children.push(node);
                this.childSet[node.id] = true;
                node._parent = this;
                node._setScene(this.scene);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (nodes_1_1 && !nodes_1_1.done && (_a = nodes_1.return)) _a.call(nodes_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        this.dirtyZIndex = true;
        this.markDirty(this, RedrawType.MAJOR);
    };
    Node.prototype.appendChild = function (node) {
        this.append(node);
        return node;
    };
    Node.prototype.removeChild = function (node) {
        if (node.parent === this) {
            var i = this.children.indexOf(node);
            if (i >= 0) {
                this._children.splice(i, 1);
                delete this.childSet[node.id];
                node._parent = undefined;
                node._setScene();
                this.dirtyZIndex = true;
                this.markDirty(node, RedrawType.MAJOR);
                return node;
            }
        }
        throw new Error("The node to be removed is not a child of this node.");
    };
    /**
     * Inserts the node `node` before the existing child node `nextNode`.
     * If `nextNode` is null, insert `node` at the end of the list of children.
     * If the `node` belongs to another parent, it is first removed.
     * Returns the `node`.
     * @param node
     * @param nextNode
     */
    Node.prototype.insertBefore = function (node, nextNode) {
        var parent = node.parent;
        if (node.parent) {
            node.parent.removeChild(node);
        }
        if (nextNode && nextNode.parent === this) {
            var i = this.children.indexOf(nextNode);
            if (i >= 0) {
                this._children.splice(i, 0, node);
                this.childSet[node.id] = true;
                node._parent = this;
                node._setScene(this.scene);
            }
            else {
                throw new Error(nextNode + " has " + parent + " as the parent, " + "but is not in its list of children.");
            }
            this.dirtyZIndex = true;
            this.markDirty(node, RedrawType.MAJOR);
        }
        else {
            this.append(node);
        }
        return node;
    };
    Object.defineProperty(Node.prototype, "nextSibling", {
        get: function () {
            var parent = this.parent;
            if (parent) {
                var children = parent.children;
                var index = children.indexOf(this);
                if (index >= 0 && index <= children.length - 1) {
                    return children[index + 1];
                }
            }
        },
        enumerable: false,
        configurable: true
    });
    Node.prototype.transformPoint = function (x, y) {
        var matrix = Matrix.flyweight(this.matrix);
        var parent = this.parent;
        while (parent) {
            matrix.preMultiplySelf(parent.matrix);
            parent = parent.parent;
        }
        return matrix.invertSelf().transformPoint(x, y);
    };
    Node.prototype.inverseTransformPoint = function (x, y) {
        var matrix = Matrix.flyweight(this.matrix);
        var parent = this.parent;
        while (parent) {
            matrix.preMultiplySelf(parent.matrix);
            parent = parent.parent;
        }
        return matrix.transformPoint(x, y);
    };
    Node.prototype.markDirtyTransform = function () {
        this._dirtyTransform = true;
        this.markDirty(this, RedrawType.MAJOR);
    };
    Node.prototype.containsPoint = function (_x, _y) {
        return false;
    };
    /**
     * Hit testing method.
     * Recursively checks if the given point is inside this node or any of its children.
     * Returns the first matching node or `undefined`.
     * Nodes that render later (show on top) are hit tested first.
     */
    Node.prototype.pickNode = function (x, y) {
        var _a;
        if (!this.visible || this.pointerEvents === PointerEvents.None || !this.containsPoint(x, y)) {
            return;
        }
        var children = this.children;
        if (children.length > 1000) {
            // Try to optimise which children to interrogate; BBox calculation is an approximation
            // for more complex shapes, so discarding items based on this will save a lot of
            // processing when the point is nowhere near the child.
            for (var i = children.length - 1; i >= 0; i--) {
                var hit = ((_a = children[i].computeBBox()) === null || _a === void 0 ? void 0 : _a.containsPoint(x, y)) ? children[i].pickNode(x, y) : undefined;
                if (hit) {
                    return hit;
                }
            }
        }
        else if (children.length) {
            // Nodes added later should be hit-tested first,
            // as they are rendered on top of the previously added nodes.
            for (var i = children.length - 1; i >= 0; i--) {
                var hit = children[i].pickNode(x, y);
                if (hit) {
                    return hit;
                }
            }
        }
        else if (!this.isContainerNode) {
            // a leaf node, but not a container leaf
            return this;
        }
    };
    Node.prototype.computeBBox = function () {
        return;
    };
    Node.prototype.computeTransformedBBox = function () {
        var bbox = this.computeBBox();
        if (!bbox) {
            return undefined;
        }
        this.computeTransformMatrix();
        var matrix = Matrix.flyweight(this.matrix);
        var parent = this.parent;
        while (parent) {
            parent.computeTransformMatrix();
            matrix.preMultiplySelf(parent.matrix);
            parent = parent.parent;
        }
        matrix.transformBBox(bbox, bbox);
        return bbox;
    };
    Node.prototype.computeBBoxCenter = function () {
        var bbox = this.computeBBox && this.computeBBox();
        if (bbox) {
            return [bbox.x + bbox.width * 0.5, bbox.y + bbox.height * 0.5];
        }
        return [0, 0];
    };
    Node.prototype.computeTransformMatrix = function () {
        if (!this._dirtyTransform) {
            return;
        }
        var _a = this, matrix = _a.matrix, scalingX = _a.scalingX, scalingY = _a.scalingY, rotation = _a.rotation, translationX = _a.translationX, translationY = _a.translationY, scalingCenterX = _a.scalingCenterX, scalingCenterY = _a.scalingCenterY, rotationCenterX = _a.rotationCenterX, rotationCenterY = _a.rotationCenterY;
        Matrix.updateTransformMatrix(matrix, scalingX, scalingY, rotation, translationX, translationY, {
            scalingCenterX: scalingCenterX,
            scalingCenterY: scalingCenterY,
            rotationCenterX: rotationCenterX,
            rotationCenterY: rotationCenterY,
        });
        matrix.inverseTo(this.inverseMatrix);
        this._dirtyTransform = false;
    };
    Node.prototype.render = function (renderCtx) {
        var stats = renderCtx.stats;
        this._dirty = RedrawType.NONE;
        if (stats)
            stats.nodesRendered++;
    };
    Node.prototype.clearBBox = function (ctx) {
        var bbox = this.computeBBox();
        if (bbox == null) {
            return;
        }
        var x = bbox.x, y = bbox.y, width = bbox.width, height = bbox.height;
        var topLeft = this.transformPoint(x, y);
        var bottomRight = this.transformPoint(x + width, y + height);
        ctx.clearRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
    };
    Node.prototype.markDirty = function (_source, type, parentType) {
        if (type === void 0) { type = RedrawType.TRIVIAL; }
        if (parentType === void 0) { parentType = type; }
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
        else if (this.scene) {
            this.scene.markDirty();
        }
    };
    Object.defineProperty(Node.prototype, "dirty", {
        get: function () {
            return this._dirty;
        },
        enumerable: false,
        configurable: true
    });
    Node.prototype.markClean = function (opts) {
        var e_3, _a;
        var _b = opts || {}, _c = _b.force, force = _c === void 0 ? false : _c, _d = _b.recursive, recursive = _d === void 0 ? true : _d;
        if (this._dirty === RedrawType.NONE && !force) {
            return;
        }
        this._dirty = RedrawType.NONE;
        if (recursive) {
            try {
                for (var _e = __values(this.children), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var child = _f.value;
                    child.markClean();
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
    };
    Node.prototype.visibilityChanged = function () {
        // Override point for sub-classes to react to visibility changes.
    };
    Object.defineProperty(Node.prototype, "nodeCount", {
        get: function () {
            var e_4, _a;
            var count = 1;
            var dirtyCount = this._dirty >= RedrawType.NONE || this._dirtyTransform ? 1 : 0;
            var visibleCount = this.visible ? 1 : 0;
            try {
                for (var _b = __values(this._children), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var child = _c.value;
                    var _d = child.nodeCount, childCount = _d.count, childVisibleCount = _d.visibleCount, childDirtyCount = _d.dirtyCount;
                    count += childCount;
                    visibleCount += childVisibleCount;
                    dirtyCount += childDirtyCount;
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return { count: count, visibleCount: visibleCount, dirtyCount: dirtyCount };
        },
        enumerable: false,
        configurable: true
    });
    Node.prototype.zIndexChanged = function () {
        // Override point for sub-classes.
    };
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
        SceneChangeDetection({ redraw: RedrawType.MAJOR, changeCb: function (o) { return o.visibilityChanged(); } })
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
    return Node;
}(ChangeDetectable));
export { Node };
