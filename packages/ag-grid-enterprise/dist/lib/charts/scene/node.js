// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var matrix_1 = require("./matrix");
var PointerEvents;
(function (PointerEvents) {
    PointerEvents[PointerEvents["All"] = 0] = "All";
    PointerEvents[PointerEvents["None"] = 1] = "None";
})(PointerEvents = exports.PointerEvents || (exports.PointerEvents = {}));
/**
 * Abstract scene graph node.
 * Each node can have zero or one parent and belong to zero or one scene.
 */
var Node = /** @class */ (function () {
    function Node() {
        /**
         * Unique node ID in the form `ClassName-NaturalNumber`.
         */
        this.id = this.createId();
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
        // TODO: should this be `true` by default as well?
        this._dirtyTransform = false;
        this._scalingX = 1;
        this._scalingY = 1;
        /**
         * The center of scaling.
         * The default value of `null` means the scaling center will be
         * determined automatically, as the center of the bounding box
         * of a node.
         */
        this._scalingCenterX = null;
        this._scalingCenterY = null;
        this._rotationCenterX = null;
        this._rotationCenterY = null;
        /**
         * Rotation angle in radians.
         * The value is set as is. No normalization to the [-180, 180) or [0, 360)
         * interval is performed.
         */
        this._rotation = 0;
        this._translationX = 0;
        this._translationY = 0;
        /**
         * Each time a property of the node that effects how it renders changes
         * the `dirty` property of the node should be set to `true`. The change
         * to the `dirty` property of the node will propagate up to its parents
         * and eventually to the scene, at which point an animation frame callback
         * will be scheduled to rerender the scene and its nodes and reset the `dirty`
         * flags of all nodes and the {@link Scene._dirty | Scene} back to `false`.
         * Since changes to node properties are not rendered immediately, it's possible
         * to change as many properties on as many nodes as needed and the rendering
         * will still only happen once in the next animation frame callback.
         * The animation frame callback is only scheduled if it hasn't been already.
         */
        this._dirty = true;
        this._visible = true;
        this.pointerEvents = PointerEvents.All;
    }
    // Uniquely identify nodes (to check for duplicates, for example).
    Node.prototype.createId = function () {
        var constructor = this.constructor;
        var className = constructor.className;
        if (!className) {
            throw new Error("The " + constructor + " is missing the 'className' property.");
        }
        return className + '-' + (constructor.id = (constructor.id || 0) + 1);
    };
    /**
     * This is meaningfully faster than `instanceof` and should be the preferred way
     * of checking inside loops.
     * @param node
     */
    Node.isNode = function (node) {
        return node ? node.matrix !== undefined : false;
    };
    Node.prototype._setScene = function (value) {
        this._scene = value;
        var children = this.children;
        var n = children.length;
        for (var i = 0; i < n; i++) {
            children[i]._setScene(value);
        }
    };
    Object.defineProperty(Node.prototype, "scene", {
        get: function () {
            return this._scene;
        },
        enumerable: true,
        configurable: true
    });
    Node.prototype._setParent = function (value) {
        this._parent = value;
    };
    Object.defineProperty(Node.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "children", {
        get: function () {
            return this._children;
        },
        enumerable: true,
        configurable: true
    });
    Node.prototype.countChildren = function (depth) {
        if (depth === void 0) { depth = Node.MAX_SAFE_INTEGER; }
        if (depth <= 0) {
            return 0;
        }
        var children = this.children;
        var n = children.length;
        var size = n;
        for (var i = 0; i < n; i++) {
            size += children[i].countChildren(depth - 1);
        }
        return size;
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
        // Passing a single parameter to an open-ended version of `append`
        // would be 30-35% slower than this.
        if (Node.isNode(nodes)) {
            nodes = [nodes];
        }
        // The function takes an array rather than having open-ended
        // arguments like `...nodes: Node[]` because the latter is
        // transpiled to a function where the `arguments` object
        // is copied to a temporary array inside a loop.
        // So an array is created either way. And if we already have
        // an array of nodes we want to add, we have to use the prohibitively
        // expensive spread operator to pass it to the function,
        // and, on top of that, the copy of the `arguments` is still made.
        var n = nodes.length;
        for (var i = 0; i < n; i++) {
            var node = nodes[i];
            if (node.parent) {
                throw new Error(node + " already belongs to another parent: " + node.parent + ".");
            }
            if (node.scene) {
                throw new Error(node + " already belongs a scene: " + node.scene + ".");
            }
            if (this.childSet[node.id]) {
                // Cast to `any` to avoid `Property 'name' does not exist on type 'Function'`.
                throw new Error("Duplicate " + node.constructor.name + " node: " + node);
            }
            this._children.push(node);
            this.childSet[node.id] = true;
            node._setParent(this);
            node._setScene(this.scene);
        }
        this.dirty = true;
    };
    Node.prototype.appendChild = function (node) {
        if (node.parent) {
            throw new Error(node + " already belongs to another parent: " + node.parent + ".");
        }
        if (node.scene) {
            throw new Error(node + " already belongs a scene: " + node.scene + ".");
        }
        if (this.childSet[node.id]) {
            // Cast to `any` to avoid `Property 'name' does not exist on type 'Function'`.
            throw new Error("Duplicate " + node.constructor.name + " node: " + node);
        }
        this._children.push(node);
        this.childSet[node.id] = true;
        node._setParent(this);
        node._setScene(this.scene);
        this.dirty = true;
        return node;
    };
    Node.prototype.removeChild = function (node) {
        if (node.parent === this) {
            var i = this.children.indexOf(node);
            if (i >= 0) {
                this._children.splice(i, 1);
                delete this.childSet[node.id];
                node._setParent(undefined);
                node._setScene(undefined);
                this.dirty = true;
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
                node._setParent(this);
                node._setScene(this.scene);
            }
            else {
                throw new Error(nextNode + " has " + parent + " as the parent, "
                    + "but is not in its list of children.");
            }
            this.dirty = true;
        }
        else {
            this.append(node);
        }
        return node;
    };
    /**
     * Calculates the combined inverse transformation for this node,
     * and uses it to convert the given transformed point
     * to the untransformed one.
     * @param x
     * @param y
     */
    Node.prototype.transformPoint = function (x, y) {
        var matrix = matrix_1.Matrix.flyweight(this.matrix);
        var parent = this.parent;
        while (parent) {
            matrix.preMultiplySelf(parent.matrix);
            parent = parent.parent;
        }
        return matrix.invertSelf().transformPoint(x, y);
    };
    Object.defineProperty(Node.prototype, "dirtyTransform", {
        get: function () {
            return this._dirtyTransform;
        },
        set: function (value) {
            this._dirtyTransform = value;
            // TODO: replace this with simply `this.dirty = true`,
            //       see `set dirty` method.
            if (value) {
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "scalingX", {
        get: function () {
            return this._scalingX;
        },
        set: function (value) {
            if (this._scalingX !== value) {
                this._scalingX = value;
                this.dirtyTransform = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "scalingY", {
        get: function () {
            return this._scalingY;
        },
        set: function (value) {
            if (this._scalingY !== value) {
                this._scalingY = value;
                this.dirtyTransform = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "scalingCenterX", {
        get: function () {
            return this._scalingCenterX;
        },
        set: function (value) {
            if (this._scalingCenterX !== value) {
                this._scalingCenterX = value;
                this.dirtyTransform = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "scalingCenterY", {
        get: function () {
            return this._scalingCenterY;
        },
        set: function (value) {
            if (this._scalingCenterY !== value) {
                this._scalingCenterY = value;
                this.dirtyTransform = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "rotationCenterX", {
        get: function () {
            return this._rotationCenterX;
        },
        set: function (value) {
            if (this._rotationCenterX !== value) {
                this._rotationCenterX = value;
                this.dirtyTransform = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "rotationCenterY", {
        get: function () {
            return this._rotationCenterY;
        },
        set: function (value) {
            if (this._rotationCenterY !== value) {
                this._rotationCenterY = value;
                this.dirtyTransform = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "rotation", {
        get: function () {
            return this._rotation;
        },
        set: function (value) {
            if (this._rotation !== value) {
                this._rotation = value;
                this.dirtyTransform = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "rotationDeg", {
        get: function () {
            return this.rotation / Math.PI * 180;
        },
        /**
         * For performance reasons the rotation angle's internal representation
         * is in radians. Therefore, don't expect to get the same number you set.
         * Even with integer angles about a quarter of them from 0 to 359 cannot
         * be converted to radians and back without precision loss.
         * For example:
         *
         *     node.rotationDeg = 11;
         *     console.log(node.rotationDeg); // 10.999999999999998
         *
         * @param value Rotation angle in degrees.
         */
        set: function (value) {
            this.rotation = value / 180 * Math.PI;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "translationX", {
        get: function () {
            return this._translationX;
        },
        set: function (value) {
            if (this._translationX !== value) {
                this._translationX = value;
                this.dirtyTransform = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "translationY", {
        get: function () {
            return this._translationY;
        },
        set: function (value) {
            if (this._translationY !== value) {
                this._translationY = value;
                this.dirtyTransform = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Node.prototype.isPointInNode = function (x, y) {
        return false;
    };
    /**
     * Hit testing method.
     * Recursively checks if the given point is inside this node or any of its children.
     * Returns the first matching node or `undefined`.
     * Nodes that render later (show on top) are hit tested first.
     * @param x
     * @param y
     */
    Node.prototype.pickNode = function (x, y) {
        if (!this.visible || this.pointerEvents === PointerEvents.None || !this.isPointInNode(x, y)) {
            return;
        }
        var children = this.children;
        if (children.length) {
            // Nodes added later should be hit-tested first,
            // as they are rendered on top of the previously added nodes.
            for (var i = children.length - 1; i >= 0; i--) {
                var hit = children[i].pickNode(x, y);
                if (hit) {
                    return hit;
                }
            }
        }
        else if (!this.isContainerNode) { // a leaf node, but not a container leaf
            return this;
        }
    };
    Node.prototype.getBBox = function () { return; };
    Node.prototype.getBBoxCenter = function () {
        var bbox = this.getBBox && this.getBBox();
        if (bbox) {
            return [
                bbox.x + bbox.width * 0.5,
                bbox.y + bbox.height * 0.5
            ];
        }
        return [0, 0];
    };
    Node.prototype.computeTransformMatrix = function () {
        // TODO: transforms without center of scaling and rotation correspond directly
        //       to `setAttribute('transform', 'translate(tx, ty) rotate(rDeg) scale(sx, sy)')`
        //       in SVG. Our use cases will mostly require positioning elements (rects, circles)
        //       within a group, rotating groups at right angles (e.g. for axis) and translating
        //       groups. We shouldn't even need `scale(1, -1)` (invert vertically), since this
        //       can be done using D3-like scales already by inverting the output range.
        //       So for now, just assume that centers of scaling and rotation are at the origin.
        // const [bbcx, bbcy] = this.getBBoxCenter();
        var _a = [0, 0], bbcx = _a[0], bbcy = _a[1];
        var sx = this.scalingX;
        var sy = this.scalingY;
        var scx;
        var scy;
        if (sx === 1 && sy === 1) {
            scx = 0;
            scy = 0;
        }
        else {
            scx = this.scalingCenterX === null ? bbcx : this.scalingCenterX;
            scy = this.scalingCenterY === null ? bbcy : this.scalingCenterY;
        }
        var r = this.rotation;
        var cos = Math.cos(r);
        var sin = Math.sin(r);
        var rcx;
        var rcy;
        if (r === 0) {
            rcx = 0;
            rcy = 0;
        }
        else {
            rcx = this.rotationCenterX === null ? bbcx : this.rotationCenterX;
            rcy = this.rotationCenterY === null ? bbcy : this.rotationCenterY;
        }
        var tx = this.translationX;
        var ty = this.translationY;
        // The transform matrix `M` is a result of the following transformations:
        // 1) translate the center of scaling to the origin
        // 2) scale
        // 3) translate back
        // 4) translate the center of rotation to the origin
        // 5) rotate
        // 6) translate back
        // 7) translate
        //         (7)          (6)             (5)             (4)           (3)           (2)           (1)
        //     | 1 0 tx |   | 1 0 rcx |   | cos -sin 0 |   | 1 0 -rcx |   | 1 0 scx |   | sx 0 0 |   | 1 0 -scx |
        // M = | 0 1 ty | * | 0 1 rcy | * | sin  cos 0 | * | 0 1 -rcy | * | 0 1 scy | * | 0 sy 0 | * | 0 1 -scy |
        //     | 0 0  1 |   | 0 0  1  |   |  0    0  1 |   | 0 0  1   |   | 0 0  1  |   | 0  0 0 |   | 0 0  1   |
        // Translation after steps 1-4 above:
        var tx4 = scx * (1 - sx) - rcx;
        var ty4 = scy * (1 - sy) - rcy;
        this.dirtyTransform = false;
        this.matrix.setElements([
            cos * sx, sin * sx,
            -sin * sy, cos * sy,
            cos * tx4 - sin * ty4 + rcx + tx,
            sin * tx4 + cos * ty4 + rcy + ty
        ]).inverseTo(this.inverseMatrix);
    };
    Object.defineProperty(Node.prototype, "dirty", {
        get: function () {
            return this._dirty;
        },
        set: function (value) {
            // TODO: check if we are already dirty (e.g. if (this._dirty !== value))
            //       if we are, then all parents and the scene have been
            //       notified already, and we are doing redundant work
            //       (but test if this is indeed the case)
            this._dirty = value;
            if (value) {
                if (this.parent) {
                    this.parent.dirty = true;
                }
                else if (this.scene) {
                    this.scene.dirty = true;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "visible", {
        get: function () {
            return this._visible;
        },
        set: function (value) {
            if (this._visible !== value) {
                this._visible = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Node.MAX_SAFE_INTEGER = Math.pow(2, 53) - 1; // Number.MAX_SAFE_INTEGER
    return Node;
}());
exports.Node = Node;
