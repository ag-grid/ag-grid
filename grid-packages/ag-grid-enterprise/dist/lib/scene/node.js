"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = exports.PointerEvents = exports.RedrawType = exports.SceneChangeDetection = void 0;
var matrix_1 = require("./matrix");
var id_1 = require("../util/id");
var changeDetectable_1 = require("./changeDetectable");
Object.defineProperty(exports, "SceneChangeDetection", { enumerable: true, get: function () { return changeDetectable_1.SceneChangeDetection; } });
Object.defineProperty(exports, "RedrawType", { enumerable: true, get: function () { return changeDetectable_1.RedrawType; } });
var PointerEvents;
(function (PointerEvents) {
    PointerEvents[PointerEvents["All"] = 0] = "All";
    PointerEvents[PointerEvents["None"] = 1] = "None";
})(PointerEvents = exports.PointerEvents || (exports.PointerEvents = {}));
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
    function Node(_a) {
        var _b = _a === void 0 ? {} : _a, isVirtual = _b.isVirtual;
        var _this = _super.call(this) || this;
        /** Unique number to allow creation order to be easily determined. */
        _this.serialNumber = Node._nextSerialNumber++;
        /**
         * Unique node ID in the form `ClassName-NaturalNumber`.
         */
        _this.id = id_1.createId(_this);
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
        _this._virtualChildren = [];
        _this._children = [];
        // Used to check for duplicate nodes.
        _this.childSet = {}; // new Set<Node>()
        // These matrices may need to have package level visibility
        // for performance optimization purposes.
        _this.matrix = new matrix_1.Matrix();
        _this.inverseMatrix = new matrix_1.Matrix();
        _this.dirtyTransform = false;
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
        _this.isVirtual = isVirtual !== null && isVirtual !== void 0 ? isVirtual : false;
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
        var e_1, _a, e_2, _b;
        this._layerManager = value;
        this._debug = value === null || value === void 0 ? void 0 : value.debug;
        try {
            for (var _c = __values(this._children), _d = _c.next(); !_d.done; _d = _c.next()) {
                var child = _d.value;
                child._setLayerManager(value);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        try {
            for (var _e = __values(this._virtualChildren), _f = _e.next(); !_f.done; _f = _e.next()) {
                var child = _f.value;
                child._setLayerManager(value);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_2) throw e_2.error; }
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
            var e_3, _a;
            if (this._virtualChildren.length === 0)
                return this._children;
            var result = __spreadArray([], __read(this._children));
            try {
                for (var _b = __values(this._virtualChildren), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var next = _c.value;
                    result.push.apply(result, __spreadArray([], __read(next.children)));
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
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "virtualChildren", {
        get: function () {
            return this._virtualChildren;
        },
        enumerable: false,
        configurable: true
    });
    Node.prototype.hasVirtualChildren = function () {
        return this._virtualChildren.length > 0;
    };
    /**
     * Appends one or more new node instances to this parent.
     * If one needs to:
     * - move a child to the end of the list of children
     * - move a child from one parent to another (including parents in other scenes)
     * one should use the {@link insertBefore} method instead.
     * @param nodes A node or nodes to append.
     */
    Node.prototype.append = function (nodes) {
        var e_4, _a;
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
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (nodes_1_1 && !nodes_1_1.done && (_a = nodes_1.return)) _a.call(nodes_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
        this.dirtyZIndex = true;
        this.markDirty(this, changeDetectable_1.RedrawType.MAJOR);
    };
    Node.prototype.appendChild = function (node) {
        this.append(node);
        return node;
    };
    Node.prototype.removeChild = function (node) {
        var error = function () {
            throw new Error("The node to be removed is not a child of this node.");
        };
        if (node.parent !== this) {
            error();
        }
        if (node.isVirtual) {
            var i = this._virtualChildren.indexOf(node);
            if (i < 0)
                error();
            this._virtualChildren.splice(i, 1);
        }
        else {
            var i = this._children.indexOf(node);
            if (i < 0)
                error();
            this._children.splice(i, 1);
        }
        delete this.childSet[node.id];
        node._parent = undefined;
        node._setLayerManager();
        this.dirtyZIndex = true;
        this.markDirty(node, changeDetectable_1.RedrawType.MAJOR);
        return node;
    };
    Node.prototype.calculateCumulativeMatrix = function () {
        this.computeTransformMatrix();
        var matrix = matrix_1.Matrix.flyweight(this.matrix);
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
        this.dirtyTransform = true;
        this.markDirty(this, changeDetectable_1.RedrawType.MAJOR);
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
        var e_5, _a;
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
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
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
        var matrix = matrix_1.Matrix.flyweight(this.matrix);
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
        if (!this.dirtyTransform) {
            return;
        }
        var _a = this, matrix = _a.matrix, scalingX = _a.scalingX, scalingY = _a.scalingY, rotation = _a.rotation, translationX = _a.translationX, translationY = _a.translationY, scalingCenterX = _a.scalingCenterX, scalingCenterY = _a.scalingCenterY, rotationCenterX = _a.rotationCenterX, rotationCenterY = _a.rotationCenterY;
        matrix_1.Matrix.updateTransformMatrix(matrix, scalingX, scalingY, rotation, translationX, translationY, {
            scalingCenterX: scalingCenterX,
            scalingCenterY: scalingCenterY,
            rotationCenterX: rotationCenterX,
            rotationCenterY: rotationCenterY,
        });
        matrix.inverseTo(this.inverseMatrix);
        this.dirtyTransform = false;
    };
    Node.prototype.render = function (renderCtx) {
        var stats = renderCtx.stats;
        this._dirty = changeDetectable_1.RedrawType.NONE;
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
        if (type === void 0) { type = changeDetectable_1.RedrawType.TRIVIAL; }
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
        var e_6, _a, e_7, _b;
        var _c = opts !== null && opts !== void 0 ? opts : {}, _d = _c.force, force = _d === void 0 ? false : _d, _e = _c.recursive, recursive = _e === void 0 ? true : _e;
        if (this._dirty === changeDetectable_1.RedrawType.NONE && !force) {
            return;
        }
        this._dirty = changeDetectable_1.RedrawType.NONE;
        if (recursive !== false) {
            try {
                for (var _f = __values(this._virtualChildren), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var child = _g.value;
                    child.markClean({ force: force });
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
                }
                finally { if (e_6) throw e_6.error; }
            }
        }
        if (recursive === true) {
            try {
                for (var _h = __values(this._children), _j = _h.next(); !_j.done; _j = _h.next()) {
                    var child = _j.value;
                    child.markClean({ force: force });
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (_j && !_j.done && (_b = _h.return)) _b.call(_h);
                }
                finally { if (e_7) throw e_7.error; }
            }
        }
    };
    Node.prototype.visibilityChanged = function () {
        // Override point for sub-classes to react to visibility changes.
    };
    Object.defineProperty(Node.prototype, "nodeCount", {
        get: function () {
            var e_8, _a, e_9, _b;
            var count = 1;
            var dirtyCount = this._dirty >= changeDetectable_1.RedrawType.NONE || this.dirtyTransform ? 1 : 0;
            var visibleCount = this.visible ? 1 : 0;
            var countChild = function (child) {
                var _a = child.nodeCount, childCount = _a.count, childVisibleCount = _a.visibleCount, childDirtyCount = _a.dirtyCount;
                count += childCount;
                visibleCount += childVisibleCount;
                dirtyCount += childDirtyCount;
            };
            try {
                for (var _c = __values(this._children), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var child = _d.value;
                    countChild(child);
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_8) throw e_8.error; }
            }
            try {
                for (var _e = __values(this._virtualChildren), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var child = _f.value;
                    countChild(child);
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_9) throw e_9.error; }
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
        changeDetectable_1.SceneChangeDetection({ redraw: changeDetectable_1.RedrawType.MAJOR, changeCb: function (o) { return o.visibilityChanged(); } })
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
    return Node;
}(changeDetectable_1.ChangeDetectable));
exports.Node = Node;
//# sourceMappingURL=node.js.map