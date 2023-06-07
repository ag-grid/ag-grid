var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
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
    Object.defineProperty(Node.prototype, "datum", {
        /**
         * Some arbitrary data bound to the node.
         */
        get: function () {
            var _a;
            if (this._datum !== undefined) {
                return this._datum;
            }
            return (_a = this._parent) === null || _a === void 0 ? void 0 : _a.datum;
        },
        set: function (datum) {
            this._datum = datum;
        },
        enumerable: false,
        configurable: true
    });
    Node.prototype._setLayerManager = function (value) {
        var e_1, _a;
        this._layerManager = value;
        this._debug = value === null || value === void 0 ? void 0 : value.debug;
        try {
            for (var _b = __values(this.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                child._setLayerManager(value);
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
    Object.defineProperty(Node.prototype, "layerManager", {
        get: function () {
            return this._layerManager;
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
        if (!Array.isArray(nodes)) {
            nodes = [nodes];
        }
        try {
            for (var nodes_1 = __values(nodes), nodes_1_1 = nodes_1.next(); !nodes_1_1.done; nodes_1_1 = nodes_1.next()) {
                var node = nodes_1_1.value;
                if (node.parent) {
                    throw new Error(node + " already belongs to another parent: " + node.parent + ".");
                }
                if (node.layerManager) {
                    throw new Error(node + " already belongs to a scene: " + node.layerManager + ".");
                }
                if (this.childSet[node.id]) {
                    // Cast to `any` to avoid `Property 'name' does not exist on type 'Function'`.
                    throw new Error("Duplicate " + node.constructor.name + " node: " + node);
                }
                this._children.push(node);
                this.childSet[node.id] = true;
                node._parent = this;
                node._setLayerManager(this.layerManager);
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
                node._setLayerManager();
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
                node._setLayerManager(this.layerManager);
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
    Node.prototype.calculateCumulativeMatrix = function () {
        this.computeTransformMatrix();
        var matrix = Matrix.flyweight(this.matrix);
        var parent = this.parent;
        while (parent) {
            parent.computeTransformMatrix();
            matrix.preMultiplySelf(parent.matrix);
            parent = parent.parent;
        }
        return matrix;
    };
    Node.prototype.transformPoint = function (x, y) {
        var matrix = this.calculateCumulativeMatrix();
        return matrix.invertSelf().transformPoint(x, y);
    };
    Node.prototype.inverseTransformPoint = function (x, y) {
        var matrix = this.calculateCumulativeMatrix();
        return matrix.transformPoint(x, y);
    };
    Node.prototype.transformBBox = function (bbox) {
        var matrix = this.calculateCumulativeMatrix();
        return matrix.invertSelf().transformBBox(bbox);
    };
    Node.prototype.inverseTransformBBox = function (bbox) {
        var matrix = this.calculateCumulativeMatrix();
        return matrix.transformBBox(bbox);
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
                var child = children[i];
                var containsPoint = (_a = child.computeTransformedBBox()) === null || _a === void 0 ? void 0 : _a.containsPoint(x, y);
                var hit = containsPoint ? child.pickNode(x, y) : undefined;
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
    Node.prototype.findNodes = function (predicate) {
        var e_3, _a;
        var result = predicate(this) ? [this] : [];
        try {
            for (var _b = __values(this.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                var childResult = child.findNodes(predicate);
                if (childResult) {
                    result.push.apply(result, __spreadArray([], __read(childResult)));
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return result;
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
        else if (this.layerManager) {
            this.layerManager.markDirty();
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
        var e_4, _a;
        var _b = opts !== null && opts !== void 0 ? opts : {}, _c = _b.force, force = _c === void 0 ? false : _c, _d = _b.recursive, recursive = _d === void 0 ? true : _d;
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
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
                }
                finally { if (e_4) throw e_4.error; }
            }
        }
    };
    Node.prototype.visibilityChanged = function () {
        // Override point for sub-classes to react to visibility changes.
    };
    Object.defineProperty(Node.prototype, "nodeCount", {
        get: function () {
            var e_5, _a;
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
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY2VuZS9ub2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVsQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxvQkFBb0IsRUFBRSxVQUFVLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQU14RixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsVUFBVSxFQUFFLENBQUM7QUFLNUMsTUFBTSxDQUFOLElBQVksYUFHWDtBQUhELFdBQVksYUFBYTtJQUNyQiwrQ0FBRyxDQUFBO0lBQ0gsaURBQUksQ0FBQTtBQUNSLENBQUMsRUFIVyxhQUFhLEtBQWIsYUFBYSxRQUd4QjtBQWdCRCxJQUFNLHFCQUFxQixHQUFHLFVBQUMsQ0FBTTtJQUNqQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUU7UUFDVixDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7S0FDL0I7SUFDRCxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDdEIsQ0FBQyxDQUFDO0FBb0JGOzs7R0FHRztBQUNIO0lBQW1DLHdCQUFnQjtJQUFuRDtRQUFBLHFFQTRjQztRQXpjRyxxRUFBcUU7UUFDNUQsa0JBQVksR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUVqRDs7V0FFRztRQUNNLFFBQUUsR0FBRyxRQUFRLENBQUMsS0FBSSxDQUFDLENBQUM7UUFpQjdCOzs7V0FHRztRQUNILFNBQUcsR0FBVyxHQUFHLENBQUM7UUFFbEI7Ozs7V0FJRztRQUNPLHFCQUFlLEdBQVksS0FBSyxDQUFDO1FBd0JuQyxlQUFTLEdBQVcsRUFBRSxDQUFDO1FBSy9CLHFD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