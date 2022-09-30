/**
          * @ag-grid-enterprise/sparklines - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v28.2.0
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@ag-grid-community/core');
var core$1 = require('@ag-grid-enterprise/core');

// For small data structs like a bounding box, objects are superior to arrays
// in terms of performance (by 3-4% in Chrome 71, Safari 12 and by 20% in Firefox 64).
// They are also self descriptive and harder to abuse.
// For example, one has to do:
// `ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);`
// rather than become enticed by the much slower:
// `ctx.strokeRect(...bbox);`
// https://jsperf.com/array-vs-object-create-access
var BBox = /** @class */ (function () {
    function BBox(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    BBox.prototype.isValid = function () {
        return isFinite(this.x) && isFinite(this.y) && isFinite(this.width) && isFinite(this.height);
    };
    BBox.prototype.dilate = function (value) {
        this.x -= value;
        this.y -= value;
        this.width += value * 2;
        this.height += value * 2;
    };
    BBox.prototype.containsPoint = function (x, y) {
        return x >= this.x && x <= (this.x + this.width)
            && y >= this.y && y <= (this.y + this.height);
    };
    BBox.prototype.render = function (ctx, params) {
        if (params === void 0) { params = BBox.noParams; }
        ctx.save();
        if (params.resetTransform) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        ctx.strokeStyle = params.strokeStyle || 'cyan';
        ctx.lineWidth = params.lineWidth || 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        if (params.label) {
            ctx.fillStyle = params.fillStyle || 'black';
            ctx.textBaseline = 'bottom';
            ctx.fillText(params.label, this.x, this.y);
        }
        ctx.restore();
    };
    BBox.noParams = {};
    return BBox;
}());

var __read$6 = (undefined && undefined.__read) || function (o, n) {
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
/**
 * As of Jan 8, 2019, Firefox still doesn't implement
 * `getTransform(): DOMMatrix;`
 * `setTransform(transform?: DOMMatrix2DInit)`
 * in the `CanvasRenderingContext2D`.
 * Bug: https://bugzilla.mozilla.org/show_bug.cgi?id=928150
 * IE11 and Edge 44 also don't have the support.
 * Thus this class, to keep track of the current transform and
 * combine transformations.
 * Standards:
 * https://html.spec.whatwg.org/dev/canvas.html
 * https://www.w3.org/TR/geometry-1/
 */
var Matrix = /** @class */ (function () {
    function Matrix(elements) {
        if (elements === void 0) { elements = [1, 0, 0, 1, 0, 0]; }
        this.elements = elements;
    }
    Matrix.prototype.setElements = function (elements) {
        var e = this.elements;
        // `this.elements = elements.slice()` is 4-5 times slower
        // (in Chrome 71 and FF 64) than manually copying elements,
        // since slicing allocates new memory.
        // The performance of passing parameters individually
        // vs as an array is about the same in both browsers, so we
        // go with a single (array of elements) parameter, because
        // `setElements(elements)` and `setElements([a, b, c, d, e, f])`
        // calls give us roughly the same performance, versus
        // `setElements(...elements)` and `setElements(a, b, c, d, e, f)`,
        // where the spread operator causes a 20-30x performance drop
        // (30x when compiled to ES5's `.apply(this, elements)`
        //  20x when used natively).
        e[0] = elements[0];
        e[1] = elements[1];
        e[2] = elements[2];
        e[3] = elements[3];
        e[4] = elements[4];
        e[5] = elements[5];
        return this;
    };
    Matrix.prototype.setIdentityElements = function () {
        var e = this.elements;
        e[0] = 1;
        e[1] = 0;
        e[2] = 0;
        e[3] = 1;
        e[4] = 0;
        e[5] = 0;
        return this;
    };
    Object.defineProperty(Matrix.prototype, "identity", {
        get: function () {
            var e = this.elements;
            return e[0] === 1 && e[1] === 0 && e[2] === 0 &&
                e[3] === 1 && e[4] === 0 && e[5] === 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "a", {
        get: function () {
            return this.elements[0];
        },
        set: function (value) {
            this.elements[0] = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "b", {
        get: function () {
            return this.elements[1];
        },
        set: function (value) {
            this.elements[1] = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "c", {
        get: function () {
            return this.elements[2];
        },
        set: function (value) {
            this.elements[2] = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "d", {
        get: function () {
            return this.elements[3];
        },
        set: function (value) {
            this.elements[3] = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "e", {
        get: function () {
            return this.elements[4];
        },
        set: function (value) {
            this.elements[4] = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Matrix.prototype, "f", {
        get: function () {
            return this.elements[5];
        },
        set: function (value) {
            this.elements[5] = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Performs the AxB matrix multiplication and saves the result
     * to `C`, if given, or to `A` otherwise.
     */
    Matrix.prototype.AxB = function (A, B, C) {
        var _a = __read$6(A, 6), m11 = _a[0], m12 = _a[1], m21 = _a[2], m22 = _a[3], m31 = _a[4], m32 = _a[5];
        var _b = __read$6(B, 6), o11 = _b[0], o12 = _b[1], o21 = _b[2], o22 = _b[3], o31 = _b[4], o32 = _b[5];
        C = C || A;
        C[0] = m11 * o11 + m21 * o12;
        C[1] = m12 * o11 + m22 * o12;
        C[2] = m11 * o21 + m21 * o22;
        C[3] = m12 * o21 + m22 * o22;
        C[4] = m11 * o31 + m21 * o32 + m31;
        C[5] = m12 * o31 + m22 * o32 + m32;
    };
    /**
     * The `other` matrix gets post-multiplied to the current matrix.
     * Returns the current matrix.
     * @param other
     */
    Matrix.prototype.multiplySelf = function (other) {
        this.AxB(this.elements, other.elements);
        return this;
    };
    /**
     * The `other` matrix gets post-multiplied to the current matrix.
     * Returns a new matrix.
     * @param other
     */
    Matrix.prototype.multiply = function (other) {
        var elements = new Array(6);
        this.AxB(this.elements, other.elements, elements);
        return new Matrix(elements);
    };
    Matrix.prototype.preMultiplySelf = function (other) {
        this.AxB(other.elements, this.elements, this.elements);
        return this;
    };
    /**
     * Returns the inverse of this matrix as a new matrix.
     */
    Matrix.prototype.inverse = function () {
        var _a = __read$6(this.elements, 6), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4], f = _a[5];
        var rD = 1 / (a * d - b * c); // reciprocal of determinant
        a *= rD;
        b *= rD;
        c *= rD;
        d *= rD;
        return new Matrix([d, -b, -c, a, c * f - d * e, b * e - a * f]);
    };
    /**
     * Save the inverse of this matrix to the given matrix.
     */
    Matrix.prototype.inverseTo = function (other) {
        var _a = __read$6(this.elements, 6), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4], f = _a[5];
        var rD = 1 / (a * d - b * c); // reciprocal of determinant
        a *= rD;
        b *= rD;
        c *= rD;
        d *= rD;
        other.setElements([d, -b, -c, a, c * f - d * e, b * e - a * f]);
        return this;
    };
    Matrix.prototype.invertSelf = function () {
        var elements = this.elements;
        var _a = __read$6(elements, 6), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4], f = _a[5];
        var rD = 1 / (a * d - b * c); // reciprocal of determinant
        a *= rD;
        b *= rD;
        c *= rD;
        d *= rD;
        elements[0] = d;
        elements[1] = -b;
        elements[2] = -c;
        elements[3] = a;
        elements[4] = c * f - d * e;
        elements[5] = b * e - a * f;
        return this;
    };
    Matrix.prototype.clone = function () {
        return new Matrix(this.elements.slice());
    };
    Matrix.prototype.transformPoint = function (x, y) {
        var e = this.elements;
        return {
            x: x * e[0] + y * e[2] + e[4],
            y: x * e[1] + y * e[3] + e[5]
        };
    };
    Matrix.prototype.transformBBox = function (bbox, radius, target) {
        if (radius === void 0) { radius = 0; }
        var elements = this.elements;
        var xx = elements[0];
        var xy = elements[1];
        var yx = elements[2];
        var yy = elements[3];
        var h_w = bbox.width * 0.5;
        var h_h = bbox.height * 0.5;
        var cx = bbox.x + h_w;
        var cy = bbox.y + h_h;
        var w, h;
        if (radius) {
            h_w -= radius;
            h_h -= radius;
            var sx = Math.sqrt(xx * xx + yx * yx);
            var sy = Math.sqrt(xy * xy + yy * yy);
            w = Math.abs(h_w * xx) + Math.abs(h_h * yx) + Math.abs(sx * radius);
            h = Math.abs(h_w * xy) + Math.abs(h_h * yy) + Math.abs(sy * radius);
        }
        else {
            w = Math.abs(h_w * xx) + Math.abs(h_h * yx);
            h = Math.abs(h_w * xy) + Math.abs(h_h * yy);
        }
        if (!target) {
            target = new BBox(0, 0, 0, 0);
        }
        target.x = cx * xx + cy * yx + elements[4] - w;
        target.y = cx * xy + cy * yy + elements[5] - h;
        target.width = w + w;
        target.height = h + h;
        return target;
    };
    Matrix.prototype.toContext = function (ctx) {
        // It's fair to say that matrix multiplications are not cheap.
        // However, updating path definitions on every frame isn't either, so
        // it may be cheaper to just translate paths. It's also fair to
        // say, that most paths will have to be re-rendered anyway, say
        // rectangle paths in a bar chart, where an animation would happen when
        // the data set changes and existing bars are morphed into new ones.
        // Or a pie chart, where old sectors are also morphed into new ones.
        // Same for the line chart. The only plausible case where translating
        // existing paths would be enough, is the scatter chart, where marker
        // icons, typically circles, stay the same size. But if circle radii
        // are bound to some data points, even circle paths would have to be
        // updated. And thus it makes sense to optimize for fewer matrix
        // transforms, where transform matrices of paths are mostly identity
        // matrices and `x`/`y`, `centerX`/`centerY` and similar properties
        // are used to define a path at specific coordinates. And only groups
        // are used to collectively apply a transform to a set of nodes.
        // If the matrix is mostly identity (95% of the time),
        // the `if (this.isIdentity)` check can make this call 3-4 times
        // faster on average: https://jsperf.com/matrix-check-first-vs-always-set
        if (this.identity) {
            return;
        }
        var e = this.elements;
        ctx.transform(e[0], e[1], e[2], e[3], e[4], e[5]);
    };
    Matrix.flyweight = function (elements) {
        if (elements) {
            if (elements instanceof Matrix) {
                Matrix.matrix.setElements(elements.elements);
            }
            else {
                Matrix.matrix.setElements(elements);
            }
        }
        else {
            Matrix.matrix.setIdentityElements();
        }
        return Matrix.matrix;
    };
    Matrix.matrix = new Matrix();
    return Matrix;
}());

function createId(instance) {
    var constructor = instance.constructor;
    var className = constructor.className;
    if (!className) {
        throw new Error("The " + constructor + " is missing the 'className' property.");
    }
    return className + '-' + (constructor.id = (constructor.id || 0) + 1);
}

var __read$5 = (undefined && undefined.__read) || function (o, n) {
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
var PointerEvents;
(function (PointerEvents) {
    PointerEvents[PointerEvents["All"] = 0] = "All";
    PointerEvents[PointerEvents["None"] = 1] = "None";
})(PointerEvents || (PointerEvents = {}));
/**
 * Abstract scene graph node.
 * Each node can have zero or one parent and belong to zero or one scene.
 */
var Node = /** @class */ (function () {
    function Node() {
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
            throw new Error(node + " already belongs to a scene: " + node.scene + ".");
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
                node._setParent();
                node._setScene();
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
        enumerable: true,
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
    Object.defineProperty(Node.prototype, "dirtyTransform", {
        get: function () {
            return this._dirtyTransform;
        },
        set: function (value) {
            this._dirtyTransform = value;
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
    Node.prototype.containsPoint = function (x, y) {
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
        if (!this.visible || this.pointerEvents === PointerEvents.None || !this.containsPoint(x, y)) {
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
    Node.prototype.computeBBox = function () { return; };
    Node.prototype.computeBBoxCenter = function () {
        var bbox = this.computeBBox && this.computeBBox();
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
        // const [bbcx, bbcy] = this.computeBBoxCenter();
        var _a = __read$5([0, 0], 2), bbcx = _a[0], bbcy = _a[1];
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

var __extends$o = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Group = /** @class */ (function (_super) {
    __extends$o(Group, _super);
    function Group() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isContainerNode = true;
        _this._opacity = 1;
        return _this;
    }
    Object.defineProperty(Group.prototype, "opacity", {
        get: function () {
            return this._opacity;
        },
        set: function (value) {
            value = Math.min(1, Math.max(0, value));
            if (this._opacity !== value) {
                this._opacity = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    // We consider a group to be boundless, thus any point belongs to it.
    Group.prototype.containsPoint = function (x, y) {
        return true;
    };
    Group.prototype.computeBBox = function () {
        var left = Infinity;
        var right = -Infinity;
        var top = Infinity;
        var bottom = -Infinity;
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.children.forEach(function (child) {
            if (!child.visible) {
                return;
            }
            var bbox = child.computeBBox();
            if (!bbox) {
                return;
            }
            if (!(child instanceof Group)) {
                if (child.dirtyTransform) {
                    child.computeTransformMatrix();
                }
                var matrix = Matrix.flyweight(child.matrix);
                var parent_1 = child.parent;
                while (parent_1) {
                    matrix.preMultiplySelf(parent_1.matrix);
                    parent_1 = parent_1.parent;
                }
                matrix.transformBBox(bbox, 0, bbox);
            }
            var x = bbox.x;
            var y = bbox.y;
            if (x < left) {
                left = x;
            }
            if (y < top) {
                top = y;
            }
            if (x + bbox.width > right) {
                right = x + bbox.width;
            }
            if (y + bbox.height > bottom) {
                bottom = y + bbox.height;
            }
        });
        return new BBox(left, top, right - left, bottom - top);
    };
    Group.prototype.render = function (ctx) {
        // A group can have `scaling`, `rotation`, `translation` properties
        // that are applied to the canvas context before children are rendered,
        // so all children can be transformed at once.
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        var children = this.children;
        var n = children.length;
        ctx.globalAlpha *= this.opacity;
        for (var i = 0; i < n; i++) {
            var child = children[i];
            if (child.visible) {
                ctx.save();
                child.render(ctx);
                ctx.restore();
            }
        }
        // debug
        // this.computeBBox().render(ctx, {
        //     label: this.id,
        //     resetTransform: true,
        //     fillStyle: 'rgba(0, 0, 0, 0.5)'
        // });
    };
    Group.className = 'Group';
    return Group;
}(Node));

/**
 * Creates a new object with a `parent` as its prototype
 * and copies properties from the `child` into it.
 * @param parent
 * @param child
 */
function chainObjects(parent, child) {
    var obj = Object.create(parent);
    for (var prop in child) {
        if (child.hasOwnProperty(prop)) {
            obj[prop] = child[prop];
        }
    }
    return obj;
}

var __extends$n = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Shape = /** @class */ (function (_super) {
    __extends$n(Shape, _super);
    function Shape() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.lastInstanceId = 0;
        _this._fillOpacity = 1;
        _this._strokeOpacity = 1;
        _this._fill = Shape.defaultStyles.fill;
        /**
         * Note that `strokeStyle = null` means invisible stroke,
         * while `lineWidth = 0` means no stroke, and sometimes this can mean different things.
         * For example, a rect shape with an invisible stroke may not align to the pixel grid
         * properly because the stroke affects the rules of alignment, and arc shapes forming
         * a pie chart will have a gap between them if they have an invisible stroke, whereas
         * there would be not gap if there was no stroke at all.
         * The preferred way of making the stroke invisible is setting the `lineWidth` to zero,
         * unless specific looks that is achieved by having an invisible stroke is desired.
         */
        _this._stroke = Shape.defaultStyles.stroke;
        _this._strokeWidth = Shape.defaultStyles.strokeWidth;
        _this._lineDash = Shape.defaultStyles.lineDash;
        _this._lineDashOffset = Shape.defaultStyles.lineDashOffset;
        _this._lineCap = Shape.defaultStyles.lineCap;
        _this._lineJoin = Shape.defaultStyles.lineJoin;
        _this._opacity = Shape.defaultStyles.opacity;
        _this.onShadowChange = function () {
            _this.dirty = true;
        };
        _this._fillShadow = Shape.defaultStyles.fillShadow;
        _this._strokeShadow = Shape.defaultStyles.strokeShadow;
        return _this;
    }
    /**
     * Creates a light-weight instance of the given shape (that serves as a template).
     * The created instance only stores the properites set on the instance itself
     * and the rest of the properties come via the prototype chain from the template.
     * This can greatly reduce memory usage in cases where one has many simular shapes,
     * for example, circles of different size, position and color. The exact memory usage
     * reduction will depend on the size of the template and the number of own properties
     * set on its lightweight instances, but will typically be around an order of magnitude
     * or more.
     *
     * Note: template shapes are not supposed to be part of the scene graph (they should not
     * have a parent).
     *
     * @param template
     */
    Shape.createInstance = function (template) {
        var shape = Object.create(template);
        shape._setParent(undefined);
        shape.id = template.id + '-Instance-' + String(++template.lastInstanceId);
        return shape;
    };
    /**
     * Restores the default styles introduced by this subclass.
     */
    Shape.prototype.restoreOwnStyles = function () {
        var styles = this.constructor.defaultStyles;
        var keys = Object.getOwnPropertyNames(styles);
        // getOwnPropertyNames is about 2.5 times faster than
        // for..in with the hasOwnProperty check and in this
        // case, where most properties are inherited, can be
        // more then an order of magnitude faster.
        for (var i = 0, n = keys.length; i < n; i++) {
            var key = keys[i];
            this[key] = styles[key];
        }
    };
    Shape.prototype.restoreAllStyles = function () {
        var styles = this.constructor.defaultStyles;
        for (var property in styles) {
            this[property] = styles[property];
        }
    };
    /**
     * Restores the base class default styles that have been overridden by this subclass.
     */
    Shape.prototype.restoreOverriddenStyles = function () {
        var styles = this.constructor.defaultStyles;
        var protoStyles = Object.getPrototypeOf(styles);
        for (var property in styles) {
            if (styles.hasOwnProperty(property) && protoStyles.hasOwnProperty(property)) {
                this[property] = styles[property];
            }
        }
    };
    Object.defineProperty(Shape.prototype, "fillOpacity", {
        get: function () {
            return this._fillOpacity;
        },
        set: function (value) {
            if (this._fillOpacity !== value) {
                this._fillOpacity = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "strokeOpacity", {
        get: function () {
            return this._strokeOpacity;
        },
        set: function (value) {
            if (this._strokeOpacity !== value) {
                this._strokeOpacity = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "fill", {
        get: function () {
            return this._fill;
        },
        set: function (value) {
            if (this._fill !== value) {
                this._fill = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "stroke", {
        get: function () {
            return this._stroke;
        },
        set: function (value) {
            if (this._stroke !== value) {
                this._stroke = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "strokeWidth", {
        get: function () {
            return this._strokeWidth;
        },
        set: function (value) {
            if (this._strokeWidth !== value) {
                this._strokeWidth = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "alignment", {
        // An offset value to align to the pixel grid.
        get: function () {
            return Math.floor(this.strokeWidth) % 2 / 2;
        },
        enumerable: true,
        configurable: true
    });
    // Returns the aligned `start` or `length` value.
    // For example: `start` could be `y` and `length` could be `height` of a rectangle.
    Shape.prototype.align = function (alignment, start, length) {
        if (length != undefined) {
            return Math.floor(length) + Math.floor(start % 1 + length % 1);
        }
        return Math.floor(start) + alignment;
    };
    Object.defineProperty(Shape.prototype, "lineDash", {
        get: function () {
            return this._lineDash;
        },
        set: function (value) {
            var oldValue = this._lineDash;
            if (oldValue !== value) {
                if (oldValue && value && oldValue.length === value.length) {
                    var identical = true;
                    var n = value.length;
                    for (var i = 0; i < n; i++) {
                        if (oldValue[i] !== value[i]) {
                            identical = false;
                            break;
                        }
                    }
                    if (identical) {
                        return;
                    }
                }
                this._lineDash = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "lineDashOffset", {
        get: function () {
            return this._lineDashOffset;
        },
        set: function (value) {
            if (this._lineDashOffset !== value) {
                this._lineDashOffset = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "lineCap", {
        get: function () {
            return this._lineCap;
        },
        set: function (value) {
            if (this._lineCap !== value) {
                this._lineCap = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "lineJoin", {
        get: function () {
            return this._lineJoin;
        },
        set: function (value) {
            if (this._lineJoin !== value) {
                this._lineJoin = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "opacity", {
        get: function () {
            return this._opacity;
        },
        set: function (value) {
            value = Math.min(1, Math.max(0, value));
            if (this._opacity !== value) {
                this._opacity = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "fillShadow", {
        get: function () {
            return this._fillShadow;
        },
        set: function (value) {
            var oldValue = this._fillShadow;
            if (oldValue !== value) {
                if (oldValue) {
                    oldValue.removeEventListener('change', this.onShadowChange);
                }
                if (value) {
                    value.addEventListener('change', this.onShadowChange);
                }
                this._fillShadow = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "strokeShadow", {
        get: function () {
            return this._strokeShadow;
        },
        set: function (value) {
            var oldValue = this._strokeShadow;
            if (oldValue !== value) {
                if (oldValue) {
                    oldValue.removeEventListener('change', this.onShadowChange);
                }
                if (value) {
                    value.addEventListener('change', this.onShadowChange);
                }
                this._strokeShadow = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Shape.prototype.fillStroke = function (ctx) {
        if (!this.scene) {
            return;
        }
        var pixelRatio = this.scene.canvas.pixelRatio || 1;
        var globalAlpha = ctx.globalAlpha;
        if (this.fill) {
            ctx.fillStyle = this.fill;
            ctx.globalAlpha = globalAlpha * this.opacity * this.fillOpacity;
            // The canvas context scaling (depends on the device's pixel ratio)
            // has no effect on shadows, so we have to account for the pixel ratio
            // manually here.
            var fillShadow = this.fillShadow;
            if (fillShadow && fillShadow.enabled) {
                ctx.shadowColor = fillShadow.color;
                ctx.shadowOffsetX = fillShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = fillShadow.yOffset * pixelRatio;
                ctx.shadowBlur = fillShadow.blur * pixelRatio;
            }
            ctx.fill();
        }
        ctx.shadowColor = 'rgba(0, 0, 0, 0)';
        if (this.stroke && this.strokeWidth) {
            ctx.strokeStyle = this.stroke;
            ctx.globalAlpha = globalAlpha * this.opacity * this.strokeOpacity;
            ctx.lineWidth = this.strokeWidth;
            if (this.lineDash) {
                ctx.setLineDash(this.lineDash);
            }
            if (this.lineDashOffset) {
                ctx.lineDashOffset = this.lineDashOffset;
            }
            if (this.lineCap) {
                ctx.lineCap = this.lineCap;
            }
            if (this.lineJoin) {
                ctx.lineJoin = this.lineJoin;
            }
            var strokeShadow = this.strokeShadow;
            if (strokeShadow && strokeShadow.enabled) {
                ctx.shadowColor = strokeShadow.color;
                ctx.shadowOffsetX = strokeShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = strokeShadow.yOffset * pixelRatio;
                ctx.shadowBlur = strokeShadow.blur * pixelRatio;
            }
            ctx.stroke();
        }
    };
    Shape.prototype.containsPoint = function (x, y) {
        return this.isPointInPath(x, y);
    };
    /**
     * Defaults for style properties. Note that properties that affect the position
     * and shape of the node are not considered style properties, for example:
     * `x`, `y`, `width`, `height`, `radius`, `rotation`, etc.
     * Can be used to reset to the original styling after some custom styling
     * has been applied (using the `restoreOwnStyles` and `restoreAllStyles` methods).
     * These static defaults are meant to be inherited by subclasses.
     */
    Shape.defaultStyles = chainObjects({}, {
        fill: 'black',
        stroke: undefined,
        strokeWidth: 0,
        lineDash: undefined,
        lineDashOffset: 0,
        lineCap: undefined,
        lineJoin: undefined,
        opacity: 1,
        fillShadow: undefined,
        strokeShadow: undefined
    });
    return Shape;
}(Node));

// @ts-ignore Suppress tsc error: Property 'sign' does not exist on type 'Math'
var sign = Math.sign ? Math.sign : function (x) {
    x = +x;
    if (x === 0 || isNaN(x)) {
        return x;
    }
    return x > 0 ? 1 : -1;
};
/**
 * Finds the roots of a parametric linear equation in `t`,
 * where `t` lies in the interval of `[0,1]`.
 */
function linearRoot(a, b) {
    var t = -b / a;
    return (a !== 0 && t >= 0 && t <= 1) ? [t] : [];
}
/**
 * Finds the roots of a parametric quadratic equation in `t`,
 * where `t` lies in the interval of `[0,1]`.
 */
function quadraticRoots(a, b, c) {
    if (a === 0) {
        return linearRoot(b, c);
    }
    var D = b * b - 4 * a * c; // The polynomial's discriminant.
    var roots = [];
    if (D === 0) { // A single real root.
        var t = -b / (2 * a);
        if (t >= 0 && t <= 1) {
            roots.push(t);
        }
    }
    else if (D > 0) { // A pair of distinct real roots.
        var rD = Math.sqrt(D);
        var t1 = (-b - rD) / (2 * a);
        var t2 = (-b + rD) / (2 * a);
        if (t1 >= 0 && t1 <= 1) {
            roots.push(t1);
        }
        if (t2 >= 0 && t2 <= 1) {
            roots.push(t2);
        }
    }
    // else -> Complex roots.
    return roots;
}
/**
 * Finds the roots of a parametric cubic equation in `t`,
 * where `t` lies in the interval of `[0,1]`.
 * Returns an array of parametric intersection locations along the cubic,
 * excluding out-of-bounds intersections (before or after the end point
 * or in the imaginary plane).
 * An adaptation of http://www.particleincell.com/blog/2013/cubic-line-intersection/
 */
function cubicRoots(a, b, c, d) {
    if (a === 0) {
        return quadraticRoots(b, c, d);
    }
    var A = b / a;
    var B = c / a;
    var C = d / a;
    var Q = (3 * B - A * A) / 9;
    var R = (9 * A * B - 27 * C - 2 * A * A * A) / 54;
    var D = Q * Q * Q + R * R; // The polynomial's discriminant.
    var third = 1 / 3;
    var roots = [];
    if (D >= 0) { // Complex or duplicate roots.
        var rD = Math.sqrt(D);
        var S = sign(R + rD) * Math.pow(Math.abs(R + rD), third);
        var T = sign(R - rD) * Math.pow(Math.abs(R - rD), third);
        var Im = Math.abs(Math.sqrt(3) * (S - T) / 2); // Complex part of the root pair.
        var t = -third * A + (S + T); // A real root.
        if (t >= 0 && t <= 1) {
            roots.push(t);
        }
        if (Im === 0) {
            var t_1 = -third * A - (S + T) / 2; // The real part of a complex root.
            if (t_1 >= 0 && t_1 <= 1) {
                roots.push(t_1);
            }
        }
    }
    else { // Distinct real roots.
        var theta = Math.acos(R / Math.sqrt(-Q * Q * Q));
        var thirdA = third * A;
        var twoSqrtQ = 2 * Math.sqrt(-Q);
        var t1 = twoSqrtQ * Math.cos(third * theta) - thirdA;
        var t2 = twoSqrtQ * Math.cos(third * (theta + 2 * Math.PI)) - thirdA;
        var t3 = twoSqrtQ * Math.cos(third * (theta + 4 * Math.PI)) - thirdA;
        if (t1 >= 0 && t1 <= 1) {
            roots.push(t1);
        }
        if (t2 >= 0 && t2 <= 1) {
            roots.push(t2);
        }
        if (t3 >= 0 && t3 <= 1) {
            roots.push(t3);
        }
    }
    return roots;
}

/**
 * Returns the intersection point for the given pair of line segments, or null,
 * if the segments are parallel or don't intersect.
 * Based on http://paulbourke.net/geometry/pointlineplane/
 */
function segmentIntersection(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
    var d = (ax2 - ax1) * (by2 - by1) - (ay2 - ay1) * (bx2 - bx1);
    if (d === 0) { // The lines are parallel.
        return null;
    }
    var ua = ((bx2 - bx1) * (ay1 - by1) - (ax1 - bx1) * (by2 - by1)) / d;
    var ub = ((ax2 - ax1) * (ay1 - by1) - (ay2 - ay1) * (ax1 - bx1)) / d;
    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
        return {
            x: ax1 + ua * (ax2 - ax1),
            y: ay1 + ua * (ay2 - ay1)
        };
    }
    return null; // The intersection point is outside either or both segments.
}
/**
 * Returns intersection points of the given cubic curve and the line segment.
 * Takes in x/y components of cubic control points and line segment start/end points
 * as parameters.
 */
function cubicSegmentIntersections(px1, py1, px2, py2, px3, py3, px4, py4, x1, y1, x2, y2) {
    var intersections = [];
    // Find line equation coefficients.
    var A = y1 - y2;
    var B = x2 - x1;
    var C = x1 * (y2 - y1) - y1 * (x2 - x1);
    // Find cubic Bezier curve equation coefficients from control points.
    var bx = bezierCoefficients(px1, px2, px3, px4);
    var by = bezierCoefficients(py1, py2, py3, py4);
    var a = A * bx[0] + B * by[0]; // t^3
    var b = A * bx[1] + B * by[1]; // t^2
    var c = A * bx[2] + B * by[2]; // t
    var d = A * bx[3] + B * by[3] + C; // 1
    var roots = cubicRoots(a, b, c, d);
    // Verify that the roots are within bounds of the linear segment.
    for (var i = 0; i < roots.length; i++) {
        var t = roots[i];
        var tt = t * t;
        var ttt = t * tt;
        // Find the cartesian plane coordinates for the parametric root `t`.
        var x = bx[0] * ttt + bx[1] * tt + bx[2] * t + bx[3];
        var y = by[0] * ttt + by[1] * tt + by[2] * t + by[3];
        // The parametric cubic roots we found are intersection points
        // with an infinite line, and so the x/y coordinates above are as well.
        // Make sure the x/y is also within the bounds of the given segment.
        var s = void 0;
        if (x1 !== x2) {
            s = (x - x1) / (x2 - x1);
        }
        else { // the line is vertical
            s = (y - y1) / (y2 - y1);
        }
        if (s >= 0 && s <= 1) {
            intersections.push({ x: x, y: y });
        }
    }
    return intersections;
}
/**
 * Returns the given coordinates vector multiplied by the coefficient matrix
 * of the parametric cubic Bézier equation.
 */
function bezierCoefficients(P1, P2, P3, P4) {
    return [
        -P1 + 3 * P2 - 3 * P3 + P4,
        3 * P1 - 6 * P2 + 3 * P3,
        -3 * P1 + 3 * P2,
        P1 //                 | 1  0  0  0| |P4|
    ];
}

var Path2D = /** @class */ (function () {
    function Path2D() {
        // The methods of this class will likely be called many times per animation frame,
        // and any allocation can trigger a GC cycle during animation, so we attempt
        // to minimize the number of allocations.
        this.commands = [];
        this.params = [];
        this._closedPath = false;
    }
    Path2D.prototype.moveTo = function (x, y) {
        if (this.xy) {
            this.xy[0] = x;
            this.xy[1] = y;
        }
        else {
            this.xy = [x, y];
        }
        this.commands.push('M');
        this.params.push(x, y);
    };
    Path2D.prototype.lineTo = function (x, y) {
        if (this.xy) {
            this.commands.push('L');
            this.params.push(x, y);
            this.xy[0] = x;
            this.xy[1] = y;
        }
        else {
            this.moveTo(x, y);
        }
    };
    Path2D.prototype.rect = function (x, y, width, height) {
        this.moveTo(x, y);
        this.lineTo(x + width, y);
        this.lineTo(x + width, y + height);
        this.lineTo(x, y + height);
        this.closePath();
    };
    /**
     * Adds an arc segment to the path definition.
     * https://www.w3.org/TR/SVG11/paths.html#PathDataEllipticalArcCommands
     * @param rx The major-axis radius.
     * @param ry The minor-axis radius.
     * @param rotation The x-axis rotation, expressed in radians.
     * @param fA The large arc flag. `1` to use angle > π.
     * @param fS The sweep flag. `1` for the arc that goes to `x`/`y` clockwise.
     * @param x2 The x coordinate to arc to.
     * @param y2 The y coordinate to arc to.
     */
    Path2D.prototype.arcTo = function (rx, ry, rotation, fA, fS, x2, y2) {
        // Convert from endpoint to center parametrization:
        // https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
        var xy = this.xy;
        if (!xy) {
            return;
        }
        if (rx < 0) {
            rx = -rx;
        }
        if (ry < 0) {
            ry = -ry;
        }
        var x1 = xy[0];
        var y1 = xy[1];
        var hdx = (x1 - x2) / 2;
        var hdy = (y1 - y2) / 2;
        var sinPhi = Math.sin(rotation);
        var cosPhi = Math.cos(rotation);
        var xp = cosPhi * hdx + sinPhi * hdy;
        var yp = -sinPhi * hdx + cosPhi * hdy;
        var ratX = xp / rx;
        var ratY = yp / ry;
        var lambda = ratX * ratX + ratY * ratY;
        var cx = (x1 + x2) / 2;
        var cy = (y1 + y2) / 2;
        var cpx = 0;
        var cpy = 0;
        if (lambda >= 1) {
            lambda = Math.sqrt(lambda);
            rx *= lambda;
            ry *= lambda;
            // me gives lambda == cpx == cpy == 0;
        }
        else {
            lambda = Math.sqrt(1 / lambda - 1);
            if (fA === fS) {
                lambda = -lambda;
            }
            cpx = lambda * rx * ratY;
            cpy = -lambda * ry * ratX;
            cx += cosPhi * cpx - sinPhi * cpy;
            cy += sinPhi * cpx + cosPhi * cpy;
        }
        var theta1 = Math.atan2((yp - cpy) / ry, (xp - cpx) / rx);
        var deltaTheta = Math.atan2((-yp - cpy) / ry, (-xp - cpx) / rx) - theta1;
        // if (fS) {
        //     if (deltaTheta <= 0) {
        //         deltaTheta += Math.PI * 2;
        //     }
        // }
        // else {
        //     if (deltaTheta >= 0) {
        //         deltaTheta -= Math.PI * 2;
        //     }
        // }
        this.cubicArc(cx, cy, rx, ry, rotation, theta1, theta1 + deltaTheta, 1 - fS);
    };
    /**
     * Approximates an elliptical arc with up to four cubic Bézier curves.
     * @param commands The string array to write SVG command letters to.
     * @param params The number array to write SVG command parameters (cubic control points) to.
     * @param cx The x-axis coordinate for the ellipse's center.
     * @param cy The y-axis coordinate for the ellipse's center.
     * @param rx The ellipse's major-axis radius.
     * @param ry The ellipse's minor-axis radius.
     * @param phi The rotation for this ellipse, expressed in radians.
     * @param theta1 The starting angle, measured clockwise from the positive x-axis and expressed in radians.
     * @param theta2 The ending angle, measured clockwise from the positive x-axis and expressed in radians.
     * @param anticlockwise The arc control points are always placed clockwise from `theta1` to `theta2`,
     * even when `theta1 > theta2`, unless this flag is set to `1`.
     */
    Path2D.cubicArc = function (commands, params, cx, cy, rx, ry, phi, theta1, theta2, anticlockwise) {
        if (anticlockwise) {
            var temp = theta1;
            theta1 = theta2;
            theta2 = temp;
        }
        var start = params.length;
        // See https://pomax.github.io/bezierinfo/#circles_cubic
        // Arc of unit circle (start angle = 0, end angle <= π/2) in cubic Bézier coordinates:
        // S = [1, 0]
        // C1 = [1, f]
        // C2 = [cos(θ) + f * sin(θ), sin(θ) - f * cos(θ)]
        // E = [cos(θ), sin(θ)]
        // f = 4/3 * tan(θ/4)
        var f90 = 0.5522847498307935; // f for θ = π/2 is 4/3 * (Math.sqrt(2) - 1)
        var sinTheta1 = Math.sin(theta1);
        var cosTheta1 = Math.cos(theta1);
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);
        var rightAngle = Math.PI / 2;
        // Since we know how to draw an arc of a unit circle with a cubic Bézier,
        // to draw an elliptical arc with arbitrary rotation and radii we:
        // 1) rotate the Bézier coordinates that represent a circular arc by θ
        // 2) scale the circular arc separately along the x/y axes, making it elliptical
        // 3) rotate elliptical arc by φ
        // |cos(φ) -sin(φ)| |sx  0| |cos(θ) -sin(θ)| -> |xx xy|
        // |sin(φ)  cos(φ)| | 0 sy| |sin(θ)  cos(θ)| -> |yx yy|
        var xx = cosPhi * cosTheta1 * rx - sinPhi * sinTheta1 * ry;
        var yx = sinPhi * cosTheta1 * rx + cosPhi * sinTheta1 * ry;
        var xy = -cosPhi * sinTheta1 * rx - sinPhi * cosTheta1 * ry;
        var yy = -sinPhi * sinTheta1 * rx + cosPhi * cosTheta1 * ry;
        // TODO: what if delta between θ1 and θ2 is greater than 2π?
        // Always draw clockwise from θ1 to θ2.
        theta2 -= theta1;
        if (theta2 < 0) {
            theta2 += Math.PI * 2;
        }
        // Multiplying each point [x, y] by:
        // |xx xy cx| |x|
        // |yx yy cy| |y|
        // | 0  0  1| |1|
        // TODO: This move command may be redundant, if we are already at this point.
        // The coordinates of the point calculated here may differ ever so slightly
        // because of precision error.
        commands.push('M');
        params.push(xx + cx, yx + cy);
        while (theta2 >= rightAngle) {
            theta2 -= rightAngle;
            commands.push('C');
            // Temp workaround for https://bugs.chromium.org/p/chromium/issues/detail?id=993330
            // Revert this commit when fixed ^^.
            var lastX = xy + cx;
            params.push(xx + xy * f90 + cx, yx + yy * f90 + cy, xx * f90 + xy + cx, yx * f90 + yy + cy, Math.abs(lastX) < 1e-8 ? 0 : lastX, yy + cy);
            // Prepend π/2 rotation matrix.
            // |xx xy| | 0 1| -> | xy -xx|
            // |yx yy| |-1 0| -> | yy -yx|
            // [xx, yx, xy, yy] = [xy, yy, -xx, -yx];
            // Compared to swapping with a temp variable, destructuring is:
            // - 10% faster in Chrome 70
            // - 99% slower in Firefox 63
            // Temp variable solution is 45% faster in FF than Chrome.
            // https://jsperf.com/multi-swap
            // https://bugzilla.mozilla.org/show_bug.cgi?id=1165569
            var temp = xx;
            xx = xy;
            xy = -temp;
            temp = yx;
            yx = yy;
            yy = -temp;
        }
        if (theta2) {
            var f = 4 / 3 * Math.tan(theta2 / 4);
            var sinPhi2 = Math.sin(theta2);
            var cosPhi2 = Math.cos(theta2);
            var C2x = cosPhi2 + f * sinPhi2;
            var C2y = sinPhi2 - f * cosPhi2;
            commands.push('C');
            // Temp workaround for https://bugs.chromium.org/p/chromium/issues/detail?id=993330
            // Revert this commit when fixed ^^.
            var lastX = xx * cosPhi2 + xy * sinPhi2 + cx;
            params.push(xx + xy * f + cx, yx + yy * f + cy, xx * C2x + xy * C2y + cx, yx * C2x + yy * C2y + cy, Math.abs(lastX) < 1e-8 ? 0 : lastX, yx * cosPhi2 + yy * sinPhi2 + cy);
        }
        if (anticlockwise) {
            for (var i = start, j = params.length - 2; i < j; i += 2, j -= 2) {
                var temp = params[i];
                params[i] = params[j];
                params[j] = temp;
                temp = params[i + 1];
                params[i + 1] = params[j + 1];
                params[j + 1] = temp;
            }
        }
    };
    Path2D.prototype.cubicArc = function (cx, cy, rx, ry, phi, theta1, theta2, anticlockwise) {
        var commands = this.commands;
        var params = this.params;
        var start = commands.length;
        Path2D.cubicArc(commands, params, cx, cy, rx, ry, phi, theta1, theta2, anticlockwise);
        var x = params[params.length - 2];
        var y = params[params.length - 1];
        if (this.xy) {
            commands[start] = 'L';
            this.xy[0] = x;
            this.xy[1] = y;
        }
        else {
            this.xy = [x, y];
        }
    };
    /**
     * Returns the `[x, y]` coordinates of the curve at `t`.
     * @param points `(n + 1) * 2` control point coordinates for a Bézier curve of n-th order.
     * @param t
     */
    Path2D.prototype.deCasteljau = function (points, t) {
        var n = points.length;
        if (n < 2 || n % 2 === 1) {
            throw new Error('Fewer than two points or not an even count.');
        }
        else if (n === 2 || t === 0) {
            return points.slice(0, 2);
        }
        else if (t === 1) {
            return points.slice(-2);
        }
        else {
            var newPoints = [];
            var last = n - 2;
            for (var i = 0; i < last; i += 2) {
                newPoints.push((1 - t) * points[i] + t * points[i + 2], // x
                (1 - t) * points[i + 1] + t * points[i + 3] // y
                );
            }
            return this.deCasteljau(newPoints, t);
        }
    };
    /**
     * Approximates the given curve using `n` line segments.
     * @param points `(n + 1) * 2` control point coordinates for a Bézier curve of n-th order.
     * @param n
     */
    Path2D.prototype.approximateCurve = function (points, n) {
        var xy = this.deCasteljau(points, 0);
        this.moveTo(xy[0], xy[1]);
        var step = 1 / n;
        for (var t = step; t <= 1; t += step) {
            var xy_1 = this.deCasteljau(points, t);
            this.lineTo(xy_1[0], xy_1[1]);
        }
    };
    /**
     * Adds a quadratic curve segment to the path definition.
     * Note: the given quadratic segment is converted and stored as a cubic one.
     * @param cx x-component of the curve's control point
     * @param cy y-component of the curve's control point
     * @param x x-component of the end point
     * @param y y-component of the end point
     */
    Path2D.prototype.quadraticCurveTo = function (cx, cy, x, y) {
        if (!this.xy) {
            this.moveTo(cx, cy);
        }
        // See https://pomax.github.io/bezierinfo/#reordering
        this.cubicCurveTo((this.xy[0] + 2 * cx) / 3, (this.xy[1] + 2 * cy) / 3, // 1/3 start + 2/3 control
        (2 * cx + x) / 3, (2 * cy + y) / 3, // 2/3 control + 1/3 end
        x, y);
    };
    Path2D.prototype.cubicCurveTo = function (cx1, cy1, cx2, cy2, x, y) {
        if (!this.xy) {
            this.moveTo(cx1, cy1);
        }
        this.commands.push('C');
        this.params.push(cx1, cy1, cx2, cy2, x, y);
        this.xy[0] = x;
        this.xy[1] = y;
    };
    Object.defineProperty(Path2D.prototype, "closedPath", {
        get: function () {
            return this._closedPath;
        },
        enumerable: true,
        configurable: true
    });
    Path2D.prototype.closePath = function () {
        if (this.xy) {
            this.xy = undefined;
            this.commands.push('Z');
            this._closedPath = true;
        }
    };
    Path2D.prototype.clear = function () {
        this.commands.length = 0;
        this.params.length = 0;
        this.xy = undefined;
        this._closedPath = false;
    };
    Path2D.prototype.isPointInPath = function (x, y) {
        var commands = this.commands;
        var params = this.params;
        var cn = commands.length;
        // Hit testing using ray casting method, where the ray's origin is some point
        // outside the path. In this case, an offscreen point that is remote enough, so that
        // even if the path itself is large and is partially offscreen, the ray's origin
        // will likely be outside the path anyway. To test if the given point is inside the
        // path or not, we cast a ray from the origin to the given point and check the number
        // of intersections of this segment with the path. If the number of intersections is
        // even, then the ray both entered and exited the path an equal number of times,
        // therefore the point is outside the path, and inside the path, if the number of
        // intersections is odd. Since the path is compound, we check if the ray segment
        // intersects with each of the path's segments, which can be either a line segment
        // (one or no intersection points) or a Bézier curve segment (up to 3 intersection
        // points).
        var ox = -10000;
        var oy = -10000;
        // the starting point of the  current path
        var sx = NaN;
        var sy = NaN;
        // the previous point of the current path
        var px = 0;
        var py = 0;
        var intersectionCount = 0;
        for (var ci = 0, pi = 0; ci < cn; ci++) {
            switch (commands[ci]) {
                case 'M':
                    if (!isNaN(sx)) {
                        if (segmentIntersection(sx, sy, px, py, ox, oy, x, y)) {
                            intersectionCount++;
                        }
                    }
                    sx = px = params[pi++];
                    sy = py = params[pi++];
                    break;
                case 'L':
                    if (segmentIntersection(px, py, px = params[pi++], py = params[pi++], ox, oy, x, y)) {
                        intersectionCount++;
                    }
                    break;
                case 'C':
                    intersectionCount += cubicSegmentIntersections(px, py, params[pi++], params[pi++], params[pi++], params[pi++], px = params[pi++], py = params[pi++], ox, oy, x, y).length;
                    break;
                case 'Z':
                    if (!isNaN(sx)) {
                        if (segmentIntersection(sx, sy, px, py, ox, oy, x, y)) {
                            intersectionCount++;
                        }
                    }
                    break;
            }
        }
        return intersectionCount % 2 === 1;
    };
    Path2D.fromString = function (value) {
        var path = new Path2D();
        path.setFromString(value);
        return path;
    };
    /**
     * Split the SVG path at command letters,
     * then extract the command letter and parameters from each substring.
     * @param value
     */
    Path2D.parseSvgPath = function (value) {
        return value.trim().split(Path2D.splitCommandsRe).map(function (part) {
            var strParams = part.match(Path2D.matchParamsRe);
            return {
                command: part.substr(0, 1),
                params: strParams ? strParams.map(parseFloat) : []
            };
        });
    };
    Path2D.prettifySvgPath = function (value) {
        return Path2D.parseSvgPath(value).map(function (d) { return d.command + d.params.join(','); }).join('\n');
    };
    /**
     * See https://www.w3.org/TR/SVG11/paths.html
     * @param value
     */
    Path2D.prototype.setFromString = function (value) {
        var _this = this;
        this.clear();
        var parts = Path2D.parseSvgPath(value);
        // Current point.
        var x;
        var y;
        // Last control point. Used to calculate the reflection point
        // for `S`, `s`, `T`, `t` commands.
        var cpx;
        var cpy;
        var lastCommand;
        function checkQuadraticCP() {
            if (!lastCommand.match(Path2D.quadraticCommandRe)) {
                cpx = x;
                cpy = y;
            }
        }
        function checkCubicCP() {
            if (!lastCommand.match(Path2D.cubicCommandRe)) {
                cpx = x;
                cpy = y;
            }
        }
        // But that will make compiler complain about x/y, cpx/cpy
        // being used without being set first.
        parts.forEach(function (part) {
            var p = part.params;
            var n = p.length;
            var i = 0;
            switch (part.command) {
                case 'M':
                    _this.moveTo(x = p[i++], y = p[i++]);
                    while (i < n) {
                        _this.lineTo(x = p[i++], y = p[i++]);
                    }
                    break;
                case 'm':
                    _this.moveTo(x += p[i++], y += p[i++]);
                    while (i < n) {
                        _this.lineTo(x += p[i++], y += p[i++]);
                    }
                    break;
                case 'L':
                    while (i < n) {
                        _this.lineTo(x = p[i++], y = p[i++]);
                    }
                    break;
                case 'l':
                    while (i < n) {
                        _this.lineTo(x += p[i++], y += p[i++]);
                    }
                    break;
                case 'C':
                    while (i < n) {
                        _this.cubicCurveTo(p[i++], p[i++], cpx = p[i++], cpy = p[i++], x = p[i++], y = p[i++]);
                    }
                    break;
                case 'c':
                    while (i < n) {
                        _this.cubicCurveTo(x + p[i++], y + p[i++], cpx = x + p[i++], cpy = y + p[i++], x += p[i++], y += p[i++]);
                    }
                    break;
                case 'S':
                    checkCubicCP();
                    while (i < n) {
                        _this.cubicCurveTo(x + x - cpx, y + y - cpy, cpx = p[i++], cpy = p[i++], x = p[i++], y = p[i++]);
                    }
                    break;
                case 's':
                    checkCubicCP();
                    while (i < n) {
                        _this.cubicCurveTo(x + x - cpx, y + y - cpy, cpx = x + p[i++], cpy = y + p[i++], x += p[i++], y += p[i++]);
                    }
                    break;
                case 'Q':
                    while (i < n) {
                        _this.quadraticCurveTo(cpx = p[i++], cpy = p[i++], x = p[i++], y = p[i++]);
                    }
                    break;
                case 'q':
                    while (i < n) {
                        _this.quadraticCurveTo(cpx = x + p[i++], cpy = y + p[i++], x += p[i++], y += p[i++]);
                    }
                    break;
                case 'T':
                    checkQuadraticCP();
                    while (i < n) {
                        _this.quadraticCurveTo(cpx = x + x - cpx, cpy = y + y - cpy, x = p[i++], y = p[i++]);
                    }
                    break;
                case 't':
                    checkQuadraticCP();
                    while (i < n) {
                        _this.quadraticCurveTo(cpx = x + x - cpx, cpy = y + y - cpy, x += p[i++], y += p[i++]);
                    }
                    break;
                case 'A':
                    while (i < n) {
                        _this.arcTo(p[i++], p[i++], p[i++] * Math.PI / 180, p[i++], p[i++], x = p[i++], y = p[i++]);
                    }
                    break;
                case 'a':
                    while (i < n) {
                        _this.arcTo(p[i++], p[i++], p[i++] * Math.PI / 180, p[i++], p[i++], x += p[i++], y += p[i++]);
                    }
                    break;
                case 'Z':
                case 'z':
                    _this.closePath();
                    break;
                case 'H':
                    while (i < n) {
                        _this.lineTo(x = p[i++], y);
                    }
                    break;
                case 'h':
                    while (i < n) {
                        _this.lineTo(x += p[i++], y);
                    }
                    break;
                case 'V':
                    while (i < n) {
                        _this.lineTo(x, y = p[i++]);
                    }
                    break;
                case 'v':
                    while (i < n) {
                        _this.lineTo(x, y += p[i++]);
                    }
                    break;
            }
            lastCommand = part.command;
        });
    };
    Path2D.prototype.toString = function () {
        var c = this.commands;
        var p = this.params;
        var cn = c.length;
        var out = [];
        for (var ci = 0, pi = 0; ci < cn; ci++) {
            switch (c[ci]) {
                case 'M':
                    out.push('M' + p[pi++] + ',' + p[pi++]);
                    break;
                case 'L':
                    out.push('L' + p[pi++] + ',' + p[pi++]);
                    break;
                case 'C':
                    out.push('C' + p[pi++] + ',' + p[pi++] + ' ' +
                        p[pi++] + ',' + p[pi++] + ' ' +
                        p[pi++] + ',' + p[pi++]);
                    break;
                case 'Z':
                    out.push('Z');
                    break;
            }
        }
        return out.join('');
    };
    Path2D.prototype.toPrettyString = function () {
        return Path2D.prettifySvgPath(this.toString());
    };
    Path2D.prototype.toSvg = function () {
        return Path2D.xmlDeclaration + "\n<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 50 50\" version=\"1.1\" xmlns=\"" + Path2D.xmlns + "\">\n    <path d=\"" + this.toString() + "\" style=\"fill:none;stroke:#000;stroke-width:0.5;\"/>\n</svg>";
    };
    Path2D.prototype.toDebugSvg = function () {
        var d = Path2D.prettifySvgPath(this.toString());
        return Path2D.xmlDeclaration + "\n<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 100 100\" version=\"1.1\" xmlns=\"" + Path2D.xmlns + "\">\n    <path d=\"" + d + "\" style=\"fill:none;stroke:#000;stroke-width:0.5;\"/>\n</svg>";
    };
    /**
     * Returns an array of sub-paths of this Path,
     * where each sub-path is represented exclusively by cubic segments.
     */
    Path2D.prototype.toCubicPaths = function () {
        // Each sub-path is an array of `(n * 3 + 1) * 2` numbers,
        // where `n` is the number of segments.
        var paths = [];
        var params = this.params;
        // current path
        var path;
        // the starting point of the  current path
        var sx;
        var sy;
        // the previous point of the current path
        var px;
        var py;
        var i = 0; // current parameter
        this.commands.forEach(function (command) {
            switch (command) {
                case 'M':
                    path = [
                        sx = px = params[i++],
                        sy = py = params[i++]
                    ];
                    paths.push(path);
                    break;
                case 'L':
                    var x = params[i++];
                    var y = params[i++];
                    // Place control points along the line `a + (b - a) * t`
                    // at t = 1/3 and 2/3:
                    path.push((px + px + x) / 3, (py + py + y) / 3, (px + x + x) / 3, (py + y + y) / 3, px = x, py = y);
                    break;
                case 'C':
                    path.push(params[i++], params[i++], params[i++], params[i++], px = params[i++], py = params[i++]);
                    break;
                case 'Z':
                    path.push((px + px + sx) / 3, (py + py + sy) / 3, (px + sx + sx) / 3, (py + sy + sy) / 3, px = sx, py = sy);
                    break;
            }
        });
        return paths;
    };
    Path2D.cubicPathToString = function (path) {
        var n = path.length;
        if (!(n % 2 === 0 && (n / 2 - 1) / 2 >= 1)) {
            throw new Error('Invalid path.');
        }
        return 'M' + path.slice(0, 2).join(',') + 'C' + path.slice(2).join(',');
    };
    Path2D.splitCommandsRe = /(?=[AaCcHhLlMmQqSsTtVvZz])/g;
    Path2D.matchParamsRe = /-?[0-9]*\.?\d+/g;
    Path2D.quadraticCommandRe = /[QqTt]/;
    Path2D.cubicCommandRe = /[CcSs]/;
    Path2D.xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';
    Path2D.xmlns = 'http://www.w3.org/2000/svg';
    return Path2D;
}());

var __extends$m = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Path = /** @class */ (function (_super) {
    __extends$m(Path, _super);
    function Path() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * Declare a path to retain for later rendering and hit testing
         * using custom Path2D class. Think of it as a TypeScript version
         * of the native Path2D (with some differences) that works in all browsers.
         */
        _this.path = new Path2D();
        /**
        * The path only has to be updated when certain attributes change.
        * For example, if transform attributes (such as `translationX`)
        * are changed, we don't have to update the path. The `dirtyPath` flag
        * is how we keep track if the path has to be updated or not.
        */
        _this._dirtyPath = true;
        /**
         * Path definition in SVG path syntax:
         * https://www.w3.org/TR/SVG11/paths.html#DAttribute
         */
        _this._svgPath = '';
        return _this;
    }
    Object.defineProperty(Path.prototype, "dirtyPath", {
        get: function () {
            return this._dirtyPath;
        },
        set: function (value) {
            if (this._dirtyPath !== value) {
                this._dirtyPath = value;
                if (value) {
                    this.dirty = true;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Path.prototype, "svgPath", {
        get: function () {
            return this._svgPath;
        },
        set: function (value) {
            if (this._svgPath !== value) {
                this._svgPath = value;
                this.path.setFromString(value);
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Path.prototype.isPointInPath = function (x, y) {
        var point = this.transformPoint(x, y);
        return this.path.closedPath && this.path.isPointInPath(point.x, point.y);
    };
    Path.prototype.isPointInStroke = function (x, y) {
        return false;
    };
    Path.prototype.updatePath = function () { };
    Path.prototype.render = function (ctx) {
        var scene = this.scene;
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        // if (scene.debug.renderBoundingBoxes) {
        //     const bbox = this.computeBBox();
        //     if (bbox) {
        //         this.matrix.transformBBox(bbox).render(ctx);
        //     }
        // }
        this.matrix.toContext(ctx);
        if (this.dirtyPath) {
            this.updatePath();
            this.dirtyPath = false;
        }
        scene.appendPath(this.path);
        this.fillStroke(ctx);
        this.dirty = false;
    };
    Path.className = 'Path';
    return Path;
}(Shape));

var __extends$l = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Line = /** @class */ (function (_super) {
    __extends$l(Line, _super);
    function Line() {
        var _this = _super.call(this) || this;
        _this._x1 = 0;
        _this._y1 = 0;
        _this._x2 = 0;
        _this._y2 = 0;
        _this.restoreOwnStyles();
        return _this;
    }
    Object.defineProperty(Line.prototype, "x1", {
        get: function () {
            // TODO: Investigate getter performance further in the context
            //       of the scene graph.
            //       In isolated benchmarks using a getter has the same
            //       performance as a direct property access in Firefox 64.
            //       But in Chrome 71 the getter is 60% slower than direct access.
            //       Direct read is 4.5+ times slower in Chrome than it is in Firefox.
            //       Property access and direct read have the same performance
            //       in Safari 12, which is 2+ times faster than Firefox at this.
            // https://jsperf.com/es5-getters-setters-versus-getter-setter-methods/18
            // This is a know Chrome issue. They say it's not a regression, since
            // the behavior is observed since M60, but jsperf.com history shows the
            // 10x slowdown happened between Chrome 48 and Chrome 57.
            // https://bugs.chromium.org/p/chromium/issues/detail?id=908743
            return this._x1;
        },
        set: function (value) {
            if (this._x1 !== value) {
                this._x1 = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Line.prototype, "y1", {
        get: function () {
            return this._y1;
        },
        set: function (value) {
            if (this._y1 !== value) {
                this._y1 = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Line.prototype, "x2", {
        get: function () {
            return this._x2;
        },
        set: function (value) {
            if (this._x2 !== value) {
                this._x2 = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Line.prototype, "y2", {
        get: function () {
            return this._y2;
        },
        set: function (value) {
            if (this._y2 !== value) {
                this._y2 = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Line.prototype.computeBBox = function () {
        return new BBox(this.x1, this.y1, this.x2 - this.x1, this.y2 - this.y1);
    };
    Line.prototype.isPointInPath = function (x, y) {
        return false;
    };
    Line.prototype.isPointInStroke = function (x, y) {
        return false;
    };
    Line.prototype.render = function (ctx) {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        var x1 = this.x1;
        var y1 = this.y1;
        var x2 = this.x2;
        var y2 = this.y2;
        // Align to the pixel grid if the line is strictly vertical
        // or horizontal (but not both, i.e. a dot).
        if (x1 === x2) {
            var x = Math.round(x1) + Math.floor(this.strokeWidth) % 2 / 2;
            x1 = x;
            x2 = x;
        }
        else if (y1 === y2) {
            var y = Math.round(y1) + Math.floor(this.strokeWidth) % 2 / 2;
            y1 = y;
            y2 = y;
        }
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        this.fillStroke(ctx);
        this.dirty = false;
    };
    Line.className = 'Line';
    Line.defaultStyles = chainObjects(Shape.defaultStyles, {
        fill: undefined,
        strokeWidth: 1
    });
    return Line;
}(Shape));

var __read$4 = (undefined && undefined.__read) || function (o, n) {
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
/**
 * Maps a discrete domain to a continuous numeric range.
 * See https://github.com/d3/d3-scale#band-scales for more info.
 */
var BandScale = /** @class */ (function () {
    function BandScale() {
        this.type = 'band';
        /**
         * Maps datum to its index in the {@link domain} array.
         * Used to check for duplicate datums (not allowed).
         */
        this.index = new Map();
        /**
         * The output range values for datum at each index.
         */
        this.ordinalRange = [];
        /**
         * Contains unique datums only. Since `{}` is used in place of `Map`
         * for IE11 compatibility, the datums are converted `toString` before
         * the uniqueness check.
         */
        this._domain = [];
        this._range = [0, 1];
        this._bandwidth = 1;
        /**
         * The ratio of the range that is reserved for space between bands.
         */
        this._paddingInner = 0;
        /**
         * The ratio of the range that is reserved for space before the first
         * and after the last band.
         */
        this._paddingOuter = 0;
        this._round = false;
        /**
         * How the leftover range is distributed.
         * `0.5` - equal distribution of space before the first and after the last band,
         * with bands effectively centered within the range.
         */
        this._align = 0.5;
    }
    Object.defineProperty(BandScale.prototype, "domain", {
        get: function () {
            return this._domain;
        },
        set: function (values) {
            var domain = this._domain;
            domain.length = 0;
            this.index = new Map();
            var index = this.index;
            // In case one wants to have duplicate domain values, for example, two 'Italy' categories,
            // one should use objects rather than strings for domain values like so:
            // { toString: () => 'Italy' }
            // { toString: () => 'Italy' }
            values.forEach(function (value) {
                if (index.get(value) === undefined) {
                    index.set(value, domain.push(value) - 1);
                }
            });
            this.rescale();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BandScale.prototype, "range", {
        get: function () {
            return this._range;
        },
        set: function (values) {
            this._range[0] = values[0];
            this._range[1] = values[1];
            this.rescale();
        },
        enumerable: true,
        configurable: true
    });
    BandScale.prototype.ticks = function () {
        return this._domain;
    };
    BandScale.prototype.convert = function (d) {
        var i = this.index.get(d);
        if (i === undefined) {
            return NaN;
        }
        var r = this.ordinalRange[i];
        if (r === undefined) {
            return NaN;
        }
        return r;
    };
    Object.defineProperty(BandScale.prototype, "bandwidth", {
        get: function () {
            return this._bandwidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BandScale.prototype, "padding", {
        get: function () {
            return this._paddingInner;
        },
        set: function (value) {
            value = Math.max(0, Math.min(1, value));
            this._paddingInner = value;
            this._paddingOuter = value;
            this.rescale();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BandScale.prototype, "paddingInner", {
        get: function () {
            return this._paddingInner;
        },
        set: function (value) {
            this._paddingInner = Math.max(0, Math.min(1, value)); // [0, 1]
            this.rescale();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BandScale.prototype, "paddingOuter", {
        get: function () {
            return this._paddingOuter;
        },
        set: function (value) {
            this._paddingOuter = Math.max(0, Math.min(1, value)); // [0, 1]
            this.rescale();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BandScale.prototype, "round", {
        get: function () {
            return this._round;
        },
        set: function (value) {
            this._round = value;
            this.rescale();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BandScale.prototype, "align", {
        get: function () {
            return this._align;
        },
        set: function (value) {
            this._align = Math.max(0, Math.min(1, value)); // [0, 1]
            this.rescale();
        },
        enumerable: true,
        configurable: true
    });
    BandScale.prototype.rescale = function () {
        var _a;
        var n = this._domain.length;
        if (!n) {
            return;
        }
        var _b = __read$4(this._range, 2), a = _b[0], b = _b[1];
        var reversed = b < a;
        if (reversed) {
            _a = __read$4([b, a], 2), a = _a[0], b = _a[1];
        }
        var step = (b - a) / Math.max(1, n - this._paddingInner + this._paddingOuter * 2);
        if (this._round) {
            step = Math.floor(step);
        }
        a += (b - a - step * (n - this._paddingInner)) * this._align;
        this._bandwidth = step * (1 - this._paddingInner);
        if (this._round) {
            a = Math.round(a);
            this._bandwidth = Math.round(this._bandwidth);
        }
        var values = [];
        for (var i = 0; i < n; i++) {
            values.push(a + step * i);
        }
        this.ordinalRange = reversed ? values.reverse() : values;
    };
    return BandScale;
}());

var EnterNode = /** @class */ (function () {
    function EnterNode(parent, datum) {
        this.next = null;
        this.scene = parent.scene;
        this.parent = parent;
        this.datum = datum;
    }
    EnterNode.prototype.appendChild = function (node) {
        // This doesn't work without the `strict: true` in the `tsconfig.json`,
        // so we must have two `if` checks below, instead of this single one.
        // if (this.next && !Node.isNode(this.next)) {
        //     throw new Error(`${this.next} is not a Node.`);
        // }
        if (this.next === null) {
            return this.parent.insertBefore(node, null);
        }
        if (!Node.isNode(this.next)) {
            throw new Error(this.next + " is not a Node.");
        }
        return this.parent.insertBefore(node, this.next);
    };
    EnterNode.prototype.insertBefore = function (node, nextNode) {
        return this.parent.insertBefore(node, nextNode);
    };
    return EnterNode;
}());
/**
 * G - type of the selected node(s).
 * GDatum - type of the datum of the selected node(s).
 * P - type of the parent node(s).
 * PDatum - type of the datum of the parent node(s).
 */
var Selection = /** @class */ (function () {
    function Selection(groups, parents) {
        this.groups = groups;
        this.parents = parents;
    }
    Selection.select = function (node) {
        return new Selection([[typeof node === 'function' ? node() : node]], [undefined]);
    };
    Selection.selectAll = function (nodes) {
        return new Selection([nodes == null ? [] : nodes], [undefined]);
    };
    /**
     * Creates new nodes, appends them to the nodes of this selection and returns them
     * as a new selection. The created nodes inherit the datums and the parents of the nodes
     * they replace.
     * @param Class The constructor function to use to create the new nodes.
     */
    Selection.prototype.append = function (Class) {
        return this.select(function (node) {
            return node.appendChild(new Class());
        });
    };
    /**
     * Same as the {@link append}, but accepts a custom creator function with the
     * {@link NodeSelector} signature rather than a constructor function.
     * @param creator
     */
    Selection.prototype.appendFn = function (creator) {
        return this.select(function (node, data, index, group) {
            return node.appendChild(creator(node, data, index, group));
        });
    };
    /**
     * Runs the given selector that returns a single node for every node in each group.
     * The original nodes are then replaced by the nodes returned by the selector
     * and returned as a new selection.
     * The selected nodes inherit the datums and the parents of the original nodes.
     */
    Selection.prototype.select = function (selector) {
        var groups = this.groups;
        var numGroups = groups.length;
        var subgroups = [];
        for (var j = 0; j < numGroups; j++) {
            var group = groups[j];
            var groupSize = group.length;
            var subgroup = subgroups[j] = new Array(groupSize);
            for (var i = 0; i < groupSize; i++) {
                var node = group[i];
                if (node) {
                    var subnode = selector(node, node.datum, i, group);
                    if (subnode) {
                        subnode.datum = node.datum;
                    }
                    subgroup[i] = subnode;
                }
                // else this can be a group of the `enter` selection,
                // for example, with no nodes at the i-th position,
                // only nodes at the end of the group
            }
        }
        return new Selection(subgroups, this.parents);
    };
    /**
     * Same as {@link select}, but uses the given {@param Class} (constructor) as a selector.
     * @param Class The constructor function to use to find matching nodes.
     */
    Selection.prototype.selectByClass = function (Class) {
        return this.select(function (node) {
            if (Node.isNode(node)) {
                var children = node.children;
                var n = children.length;
                for (var i = 0; i < n; i++) {
                    var child = children[i];
                    if (child instanceof Class) {
                        return child;
                    }
                }
            }
        });
    };
    Selection.prototype.selectByTag = function (tag) {
        return this.select(function (node) {
            if (Node.isNode(node)) {
                var children = node.children;
                var n = children.length;
                for (var i = 0; i < n; i++) {
                    var child = children[i];
                    if (child.tag === tag) {
                        return child;
                    }
                }
            }
        });
    };
    Selection.prototype.selectAllByClass = function (Class) {
        return this.selectAll(function (node) {
            var nodes = [];
            if (Node.isNode(node)) {
                var children = node.children;
                var n = children.length;
                for (var i = 0; i < n; i++) {
                    var child = children[i];
                    if (child instanceof Class) {
                        nodes.push(child);
                    }
                }
            }
            return nodes;
        });
    };
    Selection.prototype.selectAllByTag = function (tag) {
        return this.selectAll(function (node) {
            var nodes = [];
            if (Node.isNode(node)) {
                var children = node.children;
                var n = children.length;
                for (var i = 0; i < n; i++) {
                    var child = children[i];
                    if (child.tag === tag) {
                        nodes.push(child);
                    }
                }
            }
            return nodes;
        });
    };
    Selection.prototype.selectNone = function () {
        return [];
    };
    /**
     * Runs the given selector that returns a group of nodes for every node in each group.
     * The original nodes are then replaced by the groups of nodes returned by the selector
     * and returned as a new selection. The original nodes become the parent nodes for each
     * group in the new selection. The selected nodes do not inherit the datums of the original nodes.
     * If called without any parameters, creates a new selection with an empty group for each
     * node in this selection.
     */
    Selection.prototype.selectAll = function (selectorAll) {
        if (!selectorAll) {
            selectorAll = this.selectNone;
        }
        // Each subgroup is populated with the selector (run on each group node) results.
        var subgroups = [];
        // In the new selection that we return, subgroups become groups,
        // and group nodes become parents.
        var parents = [];
        var groups = this.groups;
        var groupCount = groups.length;
        for (var j = 0; j < groupCount; j++) {
            var group = groups[j];
            var groupLength = group.length;
            for (var i = 0; i < groupLength; i++) {
                var node = group[i];
                if (node) {
                    subgroups.push(selectorAll(node, node.datum, i, group));
                    parents.push(node);
                }
            }
        }
        return new Selection(subgroups, parents);
    };
    /**
     * Runs the given callback for every node in this selection and returns this selection.
     * @param cb
     */
    Selection.prototype.each = function (cb) {
        var groups = this.groups;
        var numGroups = groups.length;
        for (var j = 0; j < numGroups; j++) {
            var group = groups[j];
            var groupSize = group.length;
            for (var i = 0; i < groupSize; i++) {
                var node = group[i];
                if (node) {
                    cb(node, node.datum, i, group);
                }
            }
        }
        return this;
    };
    Selection.prototype.remove = function () {
        return this.each(function (node) {
            if (Node.isNode(node)) {
                var parent_1 = node.parent;
                if (parent_1) {
                    parent_1.removeChild(node);
                }
            }
        });
    };
    Selection.prototype.merge = function (other) {
        var groups0 = this.groups;
        var groups1 = other.groups;
        var m0 = groups0.length;
        var m1 = groups1.length;
        var m = Math.min(m0, m1);
        var merges = new Array(m0);
        var j = 0;
        for (; j < m; j++) {
            var group0 = groups0[j];
            var group1 = groups1[j];
            var n = group0.length;
            var merge = merges[j] = new Array(n);
            for (var i = 0; i < n; i++) {
                var node = group0[i] || group1[i];
                merge[i] = node || undefined;
            }
        }
        for (; j < m0; j++) {
            merges[j] = groups0[j];
        }
        return new Selection(merges, this.parents);
    };
    /**
     * Return the first non-null element in this selection.
     * If the selection is empty, returns null.
     */
    Selection.prototype.node = function () {
        var groups = this.groups;
        var numGroups = groups.length;
        for (var j = 0; j < numGroups; j++) {
            var group = groups[j];
            var groupSize = group.length;
            for (var i = 0; i < groupSize; i++) {
                var node = group[i];
                if (node) {
                    return node;
                }
            }
        }
        return null;
    };
    Selection.prototype.attr = function (name, value) {
        this.each(function (node) {
            node[name] = value;
        });
        return this;
    };
    Selection.prototype.attrFn = function (name, value) {
        this.each(function (node, datum, index, group) {
            node[name] = value(node, datum, index, group);
        });
        return this;
    };
    /**
     * Invokes the given function once, passing in this selection.
     * Returns this selection. Facilitates method chaining.
     * @param cb
     */
    Selection.prototype.call = function (cb) {
        cb(this);
        return this;
    };
    Object.defineProperty(Selection.prototype, "size", {
        /**
         * Returns the total number of nodes in this selection.
         */
        get: function () {
            var size = 0;
            this.each(function () { return size++; });
            return size;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Selection.prototype, "data", {
        /**
         * Returns the array of data for the selected elements.
         */
        get: function () {
            var data = [];
            this.each(function (_, datum) { return data.push(datum); });
            return data;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Selection.prototype, "enter", {
        get: function () {
            return new Selection(this.enterGroups ? this.enterGroups : [[]], this.parents);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Selection.prototype, "exit", {
        get: function () {
            return new Selection(this.exitGroups ? this.exitGroups : [[]], this.parents);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Binds the given value to each selected node and returns this selection
     * with its {@link GDatum} type changed to the type of the given value.
     * This method doesn't compute a join and doesn't affect indexes or the enter and exit selections.
     * This method can also be used to clear bound data.
     * @param value
     */
    Selection.prototype.setDatum = function (value) {
        return this.each(function (node) {
            node.datum = value;
        });
    };
    Object.defineProperty(Selection.prototype, "datum", {
        /**
         * Returns the bound datum for the first non-null element in the selection.
         * This is generally useful only if you know the selection contains exactly one element.
         */
        get: function () {
            var node = this.node();
            return node ? node.datum : null;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Binds the specified array of values with the selected nodes, returning a new selection
     * that represents the _update_ selection: the nodes successfully bound to the values.
     * Also defines the {@link enter} and {@link exit} selections on the returned selection,
     * which can be used to add or remove the nodes to correspond to the new data.
     * The `values` is an array of values of a particular type, or a function that returns
     * an array of values for each group.
     * When values are assigned to the nodes, they are stored in the {@link Node.datum} property.
     * @param values
     * @param key
     */
    Selection.prototype.setData = function (values, key) {
        if (typeof values !== 'function') {
            var data_1 = values;
            values = function () { return data_1; };
        }
        var groups = this.groups;
        var parents = this.parents;
        var numGroups = groups.length;
        var updateGroups = new Array(numGroups);
        var enterGroups = new Array(numGroups);
        var exitGroups = new Array(numGroups);
        for (var j = 0; j < numGroups; j++) {
            var group = groups[j];
            var parent_2 = parents[j];
            if (!parent_2) {
                throw new Error("Group #" + j + " has no parent: " + group);
            }
            var groupSize = group.length;
            var data = values(parent_2, parent_2.datum, j, parents);
            var dataSize = data.length;
            var enterGroup = enterGroups[j] = new Array(dataSize);
            var updateGroup = updateGroups[j] = new Array(dataSize);
            var exitGroup = exitGroups[j] = new Array(groupSize);
            if (key) {
                this.bindKey(parent_2, group, enterGroup, updateGroup, exitGroup, data, key);
            }
            else {
                this.bindIndex(parent_2, group, enterGroup, updateGroup, exitGroup, data);
            }
            // Now connect the enter nodes to their following update node, such that
            // appendChild can insert the materialized enter node before this node,
            // rather than at the end of the parent node.
            for (var i0 = 0, i1 = 0; i0 < dataSize; i0++) {
                var previous = enterGroup[i0];
                if (previous) {
                    if (i0 >= i1) {
                        i1 = i0 + 1;
                    }
                    var next = void 0;
                    while (!(next = updateGroup[i1]) && i1 < dataSize) {
                        i1++;
                    }
                    previous.next = next || null;
                }
            }
        }
        var result = new Selection(updateGroups, parents);
        result.enterGroups = enterGroups;
        result.exitGroups = exitGroups;
        return result;
    };
    Selection.prototype.bindIndex = function (parent, group, enter, update, exit, data) {
        var groupSize = group.length;
        var dataSize = data.length;
        var i = 0;
        for (; i < dataSize; i++) {
            var node = group[i];
            if (node) {
                node.datum = data[i];
                update[i] = node;
            }
            else { // more datums than group nodes
                enter[i] = new EnterNode(parent, data[i]);
            }
        }
        // more group nodes than datums
        for (; i < groupSize; i++) {
            var node = group[i];
            if (node) {
                exit[i] = node;
            }
        }
    };
    Selection.prototype.bindKey = function (parent, group, enter, update, exit, data, key) {
        var groupSize = group.length;
        var dataSize = data.length;
        var keyValues = new Array(groupSize);
        var nodeByKeyValue = {};
        // Compute the key for each node.
        // If multiple nodes have the same key, the duplicates are added to exit.
        for (var i = 0; i < groupSize; i++) {
            var node = group[i];
            if (node) {
                var keyValue = keyValues[i] = Selection.keyPrefix + key(node, node.datum, i, group);
                if (keyValue in nodeByKeyValue) {
                    exit[i] = node;
                }
                else {
                    nodeByKeyValue[keyValue] = node;
                }
            }
        }
        // Compute the key for each datum.
        // If there is a node associated with this key, join and add it to update.
        // If there is not (or the key is a duplicate), add it to enter.
        for (var i = 0; i < dataSize; i++) {
            var keyValue = Selection.keyPrefix + key(parent, data[i], i, data);
            var node = nodeByKeyValue[keyValue];
            if (node) {
                update[i] = node;
                node.datum = data[i];
                nodeByKeyValue[keyValue] = undefined;
            }
            else {
                enter[i] = new EnterNode(parent, data[i]);
            }
        }
        // Add any remaining nodes that were not bound to data to exit.
        for (var i = 0; i < groupSize; i++) {
            var node = group[i];
            if (node && (nodeByKeyValue[keyValues[i]] === node)) {
                exit[i] = node;
            }
        }
    };
    Selection.keyPrefix = '$'; // Protect against keys like '__proto__'.
    return Selection;
}());

/**
 * Wraps the native Canvas element and overrides its CanvasRenderingContext2D to
 * provide resolution independent rendering based on `window.devicePixelRatio`.
 */
var HdpiCanvas = /** @class */ (function () {
    // The width/height attributes of the Canvas element default to
    // 300/150 according to w3.org.
    function HdpiCanvas(document, width, height) {
        if (document === void 0) { document = window.document; }
        if (width === void 0) { width = 600; }
        if (height === void 0) { height = 300; }
        this._container = undefined;
        // `NaN` is deliberate here, so that overrides are always applied
        // and the `resetTransform` inside the `resize` method works in IE11.
        this._pixelRatio = NaN;
        this._width = 100;
        this._height = 100;
        this.document = document;
        this.element = document.createElement('canvas');
        this.context = this.element.getContext('2d');
        this.element.style.userSelect = 'none';
        this.element.style.display = 'block';
        this.setPixelRatio();
        this.resize(width, height);
    }
    Object.defineProperty(HdpiCanvas.prototype, "container", {
        get: function () {
            return this._container;
        },
        set: function (value) {
            if (this._container !== value) {
                this.remove();
                if (value) {
                    value.appendChild(this.element);
                }
                this._container = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    HdpiCanvas.prototype.remove = function () {
        var parentNode = this.element.parentNode;
        if (parentNode != null) {
            parentNode.removeChild(this.element);
        }
    };
    HdpiCanvas.prototype.destroy = function () {
        this.element.remove();
        this._canvas = undefined;
        Object.freeze(this);
    };
    HdpiCanvas.prototype.clear = function () {
        this.context.save();
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.element.width, this.element.height);
        this.context.restore();
    };
    HdpiCanvas.prototype.toImage = function () {
        var img = this.document.createElement('img');
        img.src = this.getDataURL();
        return img;
    };
    HdpiCanvas.prototype.getDataURL = function (type) {
        return this.element.toDataURL(type);
    };
    /**
     * @param fileName The name of the file upon save. The `.png` extension is going to be added automatically.
     */
    HdpiCanvas.prototype.download = function (fileName) {
        fileName = ((fileName || '').trim() || 'image') + '.png';
        // Chart images saved as JPEG are a few times larger at 50% quality than PNG images,
        // so we don't support saving to JPEG.
        var type = 'image/png';
        var dataUrl = this.getDataURL(type);
        var document = this.document;
        var a = document.createElement('a');
        a.href = dataUrl;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a); // required for the `click` to work in Firefox
        a.click();
        document.body.removeChild(a);
    };
    Object.defineProperty(HdpiCanvas.prototype, "pixelRatio", {
        get: function () {
            return this._pixelRatio;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Changes the pixel ratio of the Canvas element to the given value,
     * or uses the window.devicePixelRatio (default), then resizes the Canvas
     * element accordingly (default).
     */
    HdpiCanvas.prototype.setPixelRatio = function (ratio) {
        var pixelRatio = ratio || window.devicePixelRatio;
        if (pixelRatio === this.pixelRatio) {
            return;
        }
        HdpiCanvas.overrideScale(this.context, pixelRatio);
        this._pixelRatio = pixelRatio;
        this.resize(this.width, this.height);
    };
    Object.defineProperty(HdpiCanvas.prototype, "pixelated", {
        get: function () {
            return this.element.style.imageRendering === 'pixelated';
        },
        set: function (value) {
            this.element.style.imageRendering = value ? 'pixelated' : 'auto';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HdpiCanvas.prototype, "width", {
        get: function () {
            return this._width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HdpiCanvas.prototype, "height", {
        get: function () {
            return this._height;
        },
        enumerable: true,
        configurable: true
    });
    HdpiCanvas.prototype.resize = function (width, height) {
        if (!(width > 0 && height > 0)) {
            return;
        }
        var _a = this, element = _a.element, context = _a.context, pixelRatio = _a.pixelRatio;
        element.width = Math.round(width * pixelRatio);
        element.height = Math.round(height * pixelRatio);
        element.style.width = width + 'px';
        element.style.height = height + 'px';
        context.resetTransform();
        this._width = width;
        this._height = height;
    };
    Object.defineProperty(HdpiCanvas, "textMeasuringContext", {
        get: function () {
            if (this._textMeasuringContext) {
                return this._textMeasuringContext;
            }
            var canvas = document.createElement('canvas');
            this._textMeasuringContext = canvas.getContext('2d');
            return this._textMeasuringContext;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HdpiCanvas, "svgText", {
        get: function () {
            if (this._svgText) {
                return this._svgText;
            }
            var xmlns = 'http://www.w3.org/2000/svg';
            var svg = document.createElementNS(xmlns, 'svg');
            svg.setAttribute('width', '100');
            svg.setAttribute('height', '100');
            // Add a descriptive class name in case someone sees this SVG element
            // in devtools and wonders about its purpose:
            if (svg.classList) {
                svg.classList.add('text-measuring-svg');
            }
            else {
                svg.setAttribute('class', 'text-measuring-svg');
            }
            svg.style.position = 'absolute';
            svg.style.top = '-1000px';
            svg.style.visibility = 'hidden';
            var svgText = document.createElementNS(xmlns, 'text');
            svgText.setAttribute('x', '0');
            svgText.setAttribute('y', '30');
            svgText.setAttribute('text', 'black');
            svg.appendChild(svgText);
            document.body.appendChild(svg);
            this._svgText = svgText;
            return svgText;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HdpiCanvas, "has", {
        get: function () {
            if (this._has) {
                return this._has;
            }
            var isChrome = navigator.userAgent.indexOf('Chrome') > -1;
            var isFirefox = navigator.userAgent.indexOf('Firefox') > -1;
            var isSafari = !isChrome && navigator.userAgent.indexOf('Safari') > -1;
            this._has = Object.freeze({
                textMetrics: this.textMeasuringContext.measureText('test').actualBoundingBoxDescent !== undefined
                    // Firefox implemented advanced TextMetrics object in v74:
                    // https://bugzilla.mozilla.org/show_bug.cgi?id=1102584
                    // but it's buggy, so we'll keed using the SVG for text measurement in Firefox for now.
                    && !isFirefox && !isSafari,
                getTransform: this.textMeasuringContext.getTransform !== undefined
            });
            return this._has;
        },
        enumerable: true,
        configurable: true
    });
    HdpiCanvas.measureText = function (text, font, textBaseline, textAlign) {
        var ctx = this.textMeasuringContext;
        ctx.font = font;
        ctx.textBaseline = textBaseline;
        ctx.textAlign = textAlign;
        return ctx.measureText(text);
    };
    /**
     * Returns the width and height of the measured text.
     * @param text The single-line text to measure.
     * @param font The font shorthand string.
     */
    HdpiCanvas.getTextSize = function (text, font) {
        if (this.has.textMetrics) {
            var ctx = this.textMeasuringContext;
            ctx.font = font;
            var metrics = ctx.measureText(text);
            return {
                width: metrics.width,
                height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
            };
        }
        else {
            return this.measureSvgText(text, font);
        }
    };
    HdpiCanvas.measureSvgText = function (text, font) {
        var cache = this.textSizeCache;
        var fontCache = cache[font];
        // Note: consider not caching the size of numeric strings.
        // For example: if (isNaN(+text)) { // skip
        if (fontCache) {
            var size_1 = fontCache[text];
            if (size_1) {
                return size_1;
            }
        }
        else {
            cache[font] = {};
        }
        var svgText = this.svgText;
        svgText.style.font = font;
        svgText.textContent = text;
        // `getBBox` returns an instance of `SVGRect` with the same `width` and `height`
        // measurements as `DOMRect` instance returned by the `getBoundingClientRect`.
        // But the `SVGRect` instance has half the properties of the `DOMRect`,
        // so we use the `getBBox` method.
        var bbox = svgText.getBBox();
        var size = {
            width: bbox.width,
            height: bbox.height
        };
        cache[font][text] = size;
        return size;
    };
    HdpiCanvas.overrideScale = function (ctx, scale) {
        var depth = 0;
        var overrides = {
            save: function () {
                this.$save();
                depth++;
            },
            restore: function () {
                if (depth > 0) {
                    this.$restore();
                    depth--;
                }
            },
            setTransform: function (a, b, c, d, e, f) {
                this.$setTransform(a * scale, b * scale, c * scale, d * scale, e * scale, f * scale);
            },
            resetTransform: function () {
                // As of Jan 8, 2019, `resetTransform` is still an "experimental technology",
                // and doesn't work in IE11 and Edge 44.
                this.$setTransform(scale, 0, 0, scale, 0, 0);
                this.save();
                depth = 0;
                // The scale above will be impossible to restore,
                // because we override the `ctx.restore` above and
                // check `depth` there.
            }
        };
        for (var name_1 in overrides) {
            if (overrides.hasOwnProperty(name_1)) {
                // Save native methods under prefixed names,
                // if this hasn't been done by the previous overrides already.
                if (!ctx['$' + name_1]) {
                    ctx['$' + name_1] = ctx[name_1];
                }
                // Replace native methods with overrides,
                // or previous overrides with the new ones.
                ctx[name_1] = overrides[name_1];
            }
        }
    };
    HdpiCanvas.textSizeCache = {};
    return HdpiCanvas;
}());

var __read$3 = (undefined && undefined.__read) || function (o, n) {
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
var __spread = (undefined && undefined.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read$3(arguments[i]));
    return ar;
};
var Scene = /** @class */ (function () {
    // As a rule of thumb, constructors with no parameters are preferred.
    // A few exceptions are:
    // - we absolutely need to know something at construction time (document)
    // - knowing something at construction time meaningfully improves performance (width, height)
    function Scene(document, width, height) {
        var _this = this;
        if (document === void 0) { document = window.document; }
        this.id = createId(this);
        this._dirty = false;
        this.animationFrameId = 0;
        this._root = null;
        this.debug = {
            renderFrameIndex: false,
            renderBoundingBoxes: false
        };
        this._frameIndex = 0;
        this.render = function () {
            var _a;
            var _b = _this, canvas = _b.canvas, ctx = _b.ctx, root = _b.root, pendingSize = _b.pendingSize;
            _this.animationFrameId = 0;
            if (pendingSize) {
                (_a = _this.canvas).resize.apply(_a, __spread(pendingSize));
                _this.pendingSize = undefined;
            }
            if (root && !root.visible) {
                _this.dirty = false;
                return;
            }
            // start with a blank canvas, clear previous drawing
            canvas.clear();
            if (root) {
                ctx.save();
                if (root.visible) {
                    root.render(ctx);
                }
                ctx.restore();
            }
            _this._frameIndex++;
            if (_this.debug.renderFrameIndex) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, 40, 15);
                ctx.fillStyle = 'black';
                ctx.fillText(_this.frameIndex.toString(), 2, 10);
            }
            _this.dirty = false;
        };
        this.canvas = new HdpiCanvas(document, width, height);
        this.ctx = this.canvas.context;
    }
    Object.defineProperty(Scene.prototype, "container", {
        get: function () {
            return this.canvas.container;
        },
        set: function (value) {
            this.canvas.container = value;
        },
        enumerable: true,
        configurable: true
    });
    Scene.prototype.download = function (fileName) {
        this.canvas.download(fileName);
    };
    Scene.prototype.getDataURL = function (type) {
        return this.canvas.getDataURL(type);
    };
    Object.defineProperty(Scene.prototype, "width", {
        get: function () {
            return this.pendingSize ? this.pendingSize[0] : this.canvas.width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "height", {
        get: function () {
            return this.pendingSize ? this.pendingSize[1] : this.canvas.height;
        },
        enumerable: true,
        configurable: true
    });
    Scene.prototype.resize = function (width, height) {
        width = Math.round(width);
        height = Math.round(height);
        if (width === this.width && height === this.height) {
            return;
        }
        this.pendingSize = [width, height];
        this.dirty = true;
    };
    Object.defineProperty(Scene.prototype, "dirty", {
        get: function () {
            return this._dirty;
        },
        set: function (dirty) {
            if (dirty && !this._dirty) {
                this.animationFrameId = requestAnimationFrame(this.render);
            }
            this._dirty = dirty;
        },
        enumerable: true,
        configurable: true
    });
    Scene.prototype.cancelRender = function () {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = 0;
            this._dirty = false;
        }
    };
    Object.defineProperty(Scene.prototype, "root", {
        get: function () {
            return this._root;
        },
        set: function (node) {
            if (node === this._root) {
                return;
            }
            if (this._root) {
                this._root._setScene();
            }
            this._root = node;
            if (node) {
                // If `node` is the root node of another scene ...
                if (node.parent === null && node.scene && node.scene !== this) {
                    node.scene.root = null;
                }
                node._setScene(this);
            }
            this.dirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Scene.prototype.appendPath = function (path) {
        var ctx = this.ctx;
        var commands = path.commands;
        var params = path.params;
        var n = commands.length;
        var j = 0;
        ctx.beginPath();
        for (var i = 0; i < n; i++) {
            switch (commands[i]) {
                case 'M':
                    ctx.moveTo(params[j++], params[j++]);
                    break;
                case 'L':
                    ctx.lineTo(params[j++], params[j++]);
                    break;
                case 'C':
                    ctx.bezierCurveTo(params[j++], params[j++], params[j++], params[j++], params[j++], params[j++]);
                    break;
                case 'Z':
                    ctx.closePath();
                    break;
            }
        }
    };
    Object.defineProperty(Scene.prototype, "frameIndex", {
        get: function () {
            return this._frameIndex;
        },
        enumerable: true,
        configurable: true
    });
    Scene.className = 'Scene';
    return Scene;
}());

var __assign$1 = (undefined && undefined.__assign) || function () {
    __assign$1 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$1.apply(this, arguments);
};
var Observable = /** @class */ (function () {
    function Observable() {
        // Note that these maps can't be specified generically, so they are kept untyped.
        // Some methods in this class only need generics in their signatures, the generics inside the methods
        // are just for clarity. The generics in signatures allow for static type checking of user provided
        // listeners and for type inference, so that the users wouldn't have to specify the type of parameters
        // of their inline lambdas.
        this.allPropertyListeners = new Map(); // property name => property change listener => scopes
        this.allEventListeners = new Map(); // event type => event listener => scopes
    }
    Observable.prototype.addPropertyListener = function (name, listener, scope) {
        if (scope === void 0) { scope = this; }
        var allPropertyListeners = this.allPropertyListeners;
        var propertyListeners = allPropertyListeners.get(name);
        if (!propertyListeners) {
            propertyListeners = new Map();
            allPropertyListeners.set(name, propertyListeners);
        }
        if (!propertyListeners.has(listener)) {
            var scopes_1 = new Set();
            propertyListeners.set(listener, scopes_1);
        }
        var scopes = propertyListeners.get(listener);
        if (scopes) {
            scopes.add(scope);
        }
    };
    Observable.prototype.removePropertyListener = function (name, listener, scope) {
        if (scope === void 0) { scope = this; }
        var allPropertyListeners = this.allPropertyListeners;
        var propertyListeners = allPropertyListeners.get(name);
        if (propertyListeners) {
            if (listener) {
                var scopes = propertyListeners.get(listener);
                if (scopes) {
                    scopes.delete(scope);
                    if (!scopes.size) {
                        propertyListeners.delete(listener);
                    }
                }
            }
            else {
                propertyListeners.clear();
            }
        }
    };
    Observable.prototype.notifyPropertyListeners = function (name, oldValue, value) {
        var _this = this;
        var allPropertyListeners = this.allPropertyListeners;
        var propertyListeners = allPropertyListeners.get(name);
        if (propertyListeners) {
            propertyListeners.forEach(function (scopes, listener) {
                scopes.forEach(function (scope) { return listener.call(scope, { type: name, source: _this, value: value, oldValue: oldValue }); });
            });
        }
    };
    Observable.prototype.addEventListener = function (type, listener, scope) {
        if (scope === void 0) { scope = this; }
        var allEventListeners = this.allEventListeners;
        var eventListeners = allEventListeners.get(type);
        if (!eventListeners) {
            eventListeners = new Map();
            allEventListeners.set(type, eventListeners);
        }
        if (!eventListeners.has(listener)) {
            var scopes_2 = new Set();
            eventListeners.set(listener, scopes_2);
        }
        var scopes = eventListeners.get(listener);
        if (scopes) {
            scopes.add(scope);
        }
    };
    Observable.prototype.removeEventListener = function (type, listener, scope) {
        if (scope === void 0) { scope = this; }
        var allEventListeners = this.allEventListeners;
        var eventListeners = allEventListeners.get(type);
        if (eventListeners) {
            if (listener) {
                var scopes = eventListeners.get(listener);
                if (scopes) {
                    scopes.delete(scope);
                    if (!scopes.size) {
                        eventListeners.delete(listener);
                    }
                }
            }
            else {
                eventListeners.clear();
            }
        }
    };
    Observable.prototype.notifyEventListeners = function (types) {
        var _this = this;
        var allEventListeners = this.allEventListeners;
        types.forEach(function (type) {
            var listeners = allEventListeners.get(type);
            if (listeners) {
                listeners.forEach(function (scopes, listener) {
                    scopes.forEach(function (scope) { return listener.call(scope, { type: type, source: _this }); });
                });
            }
        });
    };
    // 'source' is added automatically and is always the object this method belongs to.
    Observable.prototype.fireEvent = function (event) {
        var _this = this;
        var listeners = this.allEventListeners.get(event.type);
        if (listeners) {
            listeners.forEach(function (scopes, listener) {
                scopes.forEach(function (scope) { return listener.call(scope, __assign$1(__assign$1({}, event), { source: _this })); });
            });
        }
    };
    Observable.privateKeyPrefix = '_';
    return Observable;
}());
function reactive() {
    var events = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        events[_i] = arguments[_i];
    }
    var debug = events.indexOf('debugger') >= 0;
    return function (target, key) {
        // `target` is either a constructor (static member) or prototype (instance member)
        var privateKey = Observable.privateKeyPrefix + key;
        var privateKeyEvents = privateKey + 'Events';
        if (!target[key]) {
            if (events) {
                target[privateKeyEvents] = events;
            }
            Object.defineProperty(target, key, {
                set: function (value) {
                    var oldValue = this[privateKey];
                    // This is a way to stop inside the setter by adding the special
                    // 'debugger' event to a reactive property, for example:
                    //  @reactive('layoutChange', 'debugger') title?: Caption;
                    if (debug) { // DO NOT REMOVE
                        debugger;
                    }
                    if (value !== oldValue || (typeof value === 'object' && value !== null)) {
                        this[privateKey] = value;
                        this.notifyPropertyListeners(key, oldValue, value);
                        var events_1 = this[privateKeyEvents];
                        if (events_1) {
                            this.notifyEventListeners(events_1);
                        }
                    }
                },
                get: function () {
                    return this[privateKey];
                },
                enumerable: true,
                configurable: true
            });
        }
    };
}

var Padding = /** @class */ (function () {
    function Padding(top, right, bottom, left) {
        if (top === void 0) { top = 0; }
        if (right === void 0) { right = top; }
        if (bottom === void 0) { bottom = top; }
        if (left === void 0) { left = right; }
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }
    Padding.prototype.clear = function () {
        this.top = this.right = this.bottom = this.left = 0;
    };
    return Padding;
}());

var defaultTooltipCss = "\n.ag-sparkline-tooltip-wrapper {\n    position: absolute;\n    user-select: none;\n    pointer-events: none;\n}\n\n.ag-sparkline-tooltip {\n    position: relative;\n    font: 12px arial,sans-serif;\n    border-radius: 2px;\n    box-shadow: 0 1px 3px rgb(0 0 0 / 20%), 0 1px 1px rgb(0 0 0 / 14%);\n    line-height: 1.7em;\n    overflow: hidden;\n    white-space: nowrap;\n    z-index: 99999;\n    background-color: rgb(255, 255, 255);\n    color: rgba(0,0,0, 0.67);\n}\n\n.ag-sparkline-tooltip-content {\n    padding: 0 7px;\n}\n\n.ag-sparkline-tooltip-title {\n    padding-left: 7px;\n}\n\n.ag-sparkline-tooltip-wrapper-hidden {\n    top: -10000px !important;\n}\n\n.ag-sparkline-wrapper {\n    box-sizing: border-box;\n    overflow: hidden;\n}\n";

// Simplified version of https://github.com/plotly/fast-isnumeric
// that doesn't treat number strings with leading/trailing whitespace as numbers.
function isNumber(value) {
    if (typeof value !== 'number') {
        return false;
    }
    return Number.isFinite(value);
}
function isNumberObject(value) {
    return !!value && value.hasOwnProperty('valueOf') && isNumber(value.valueOf());
}
function isNumeric(value) {
    return isNumber(value) || isNumberObject(value);
}
function isDate(value) {
    return value instanceof Date && !isNaN(+value);
}
function isString(value) {
    return typeof value === 'string';
}
function isStringObject(value) {
    return !!value && value.hasOwnProperty('toString') && isString(value.toString());
}
function isContinuous(value) {
    return isNumeric(value) || isDate(value);
}

var constant$1 = (function (x) { return function () { return x; }; });

function interpolateNumber (a, b) {
    a = +a;
    b = +b;
    return function (t) { return a * (1 - t) + b * t; };
}

function date (a, b) {
    var date = new Date;
    var msA = +a;
    var msB = +b;
    return function (t) {
        date.setTime(msA * (1 - t) + msB * t);
        return date;
    };
}

function array (a, b) {
    var nb = b ? b.length : 0;
    var na = a ? Math.min(nb, a.length) : 0;
    var x = new Array(na);
    var c = new Array(nb);
    var i;
    for (i = 0; i < na; ++i) {
        x[i] = interpolateValue(a[i], b[i]);
    }
    for (; i < nb; ++i) {
        c[i] = b[i];
    }
    return function (t) {
        for (i = 0; i < na; ++i) {
            c[i] = x[i](t);
        }
        return c;
    };
}

function object (a, b) {
    var i = {};
    var c = {};
    var k;
    if (a === null || typeof a !== 'object') {
        a = {};
    }
    if (b === null || typeof b !== 'object') {
        b = {};
    }
    for (k in b) {
        if (k in a) {
            i[k] = interpolateValue(a[k], b[k]);
        }
        else {
            c[k] = b[k];
        }
    }
    return function (t) {
        for (k in i) {
            c[k] = i[k](t);
        }
        return c;
    };
}

var __read$2 = (undefined && undefined.__read) || function (o, n) {
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
var Color = /** @class */ (function () {
    /**
     * Every color component should be in the [0, 1] range.
     * Some easing functions (such as elastic easing) can overshoot the target value by some amount.
     * So, when animating colors, if the source or target color components are already near
     * or at the edge of the allowed [0, 1] range, it is possible for the intermediate color
     * component value to end up outside of that range mid-animation. For this reason the constructor
     * performs range checking/constraining.
     * @param r Red component.
     * @param g Green component.
     * @param b Blue component.
     * @param a Alpha (opacity) component.
     */
    function Color(r, g, b, a) {
        if (a === void 0) { a = 1; }
        // NaN is treated as 0.
        this.r = Math.min(1, Math.max(0, r || 0));
        this.g = Math.min(1, Math.max(0, g || 0));
        this.b = Math.min(1, Math.max(0, b || 0));
        this.a = Math.min(1, Math.max(0, a || 0));
    }
    /**
     * The given string can be in one of the following formats:
     * - #rgb
     * - #rrggbb
     * - rgb(r, g, b)
     * - rgba(r, g, b, a)
     * - CSS color name such as 'white', 'orange', 'cyan', etc.
     * @param str
     */
    Color.fromString = function (str) {
        // hexadecimal notation
        if (str.indexOf('#') >= 0) { // there can be some leading whitespace
            return Color.fromHexString(str);
        }
        // color name
        var hex = Color.nameToHex[str];
        if (hex) {
            return Color.fromHexString(hex);
        }
        // rgb(a) notation
        if (str.indexOf('rgb') >= 0) {
            return Color.fromRgbaString(str);
        }
        throw new Error("Invalid color string: '" + str + "'");
    };
    // See https://drafts.csswg.org/css-color/#hex-notation
    Color.parseHex = function (input) {
        input = input.replace(/ /g, '').slice(1);
        var parts;
        switch (input.length) {
            case 6:
            case 8:
                parts = [];
                for (var i = 0; i < input.length; i += 2) {
                    parts.push(parseInt("" + input[i] + input[i + 1], 16));
                }
                break;
            case 3:
            case 4:
                parts = input.split('').map(function (p) { return parseInt(p, 16); }).map(function (p) { return p + p * 16; });
                break;
        }
        if (parts.length >= 3) {
            if (parts.every(function (p) { return p >= 0; })) {
                if (parts.length === 3) {
                    parts.push(255);
                }
                return parts;
            }
        }
    };
    Color.fromHexString = function (str) {
        var values = Color.parseHex(str);
        if (values) {
            var _a = __read$2(values, 4), r = _a[0], g = _a[1], b = _a[2], a = _a[3];
            return new Color(r / 255, g / 255, b / 255, a / 255);
        }
        throw new Error("Malformed hexadecimal color string: '" + str + "'");
    };
    Color.stringToRgba = function (str) {
        // Find positions of opening and closing parentheses.
        var _a = __read$2([NaN, NaN], 2), po = _a[0], pc = _a[1];
        for (var i = 0; i < str.length; i++) {
            var c = str[i];
            if (!po && c === '(') {
                po = i;
            }
            else if (c === ')') {
                pc = i;
                break;
            }
        }
        var contents = po && pc && str.substring(po + 1, pc);
        if (!contents) {
            return;
        }
        var parts = contents.split(',');
        var rgba = [];
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            var value = parseFloat(part);
            if (isNaN(value)) {
                return;
            }
            if (part.indexOf('%') >= 0) { // percentage r, g, or b value
                value = Math.max(0, Math.min(100, value));
                value /= 100;
            }
            else {
                if (i === 3) { // alpha component
                    value = Math.max(0, Math.min(1, value));
                }
                else { // absolute r, g, or b value
                    value = Math.max(0, Math.min(255, value));
                    value /= 255;
                }
            }
            rgba.push(value);
        }
        return rgba;
    };
    Color.fromRgbaString = function (str) {
        var rgba = Color.stringToRgba(str);
        if (rgba) {
            if (rgba.length === 3) {
                return new Color(rgba[0], rgba[1], rgba[2]);
            }
            else if (rgba.length === 4) {
                return new Color(rgba[0], rgba[1], rgba[2], rgba[3]);
            }
        }
        throw new Error("Malformed rgb/rgba color string: '" + str + "'");
    };
    Color.fromArray = function (arr) {
        if (arr.length === 4) {
            return new Color(arr[0], arr[1], arr[2], arr[3]);
        }
        if (arr.length === 3) {
            return new Color(arr[0], arr[1], arr[2]);
        }
        throw new Error('The given array should contain 3 or 4 color components (numbers).');
    };
    Color.fromHSB = function (h, s, b, alpha) {
        if (alpha === void 0) { alpha = 1; }
        var rgb = Color.HSBtoRGB(h, s, b);
        return new Color(rgb[0], rgb[1], rgb[2], alpha);
    };
    Color.padHex = function (str) {
        // Can't use `padStart(2, '0')` here because of IE.
        return str.length === 1 ? '0' + str : str;
    };
    Color.prototype.toHexString = function () {
        var hex = '#'
            + Color.padHex(Math.round(this.r * 255).toString(16))
            + Color.padHex(Math.round(this.g * 255).toString(16))
            + Color.padHex(Math.round(this.b * 255).toString(16));
        if (this.a < 1) {
            hex += Color.padHex(Math.round(this.a * 255).toString(16));
        }
        return hex;
    };
    Color.prototype.toRgbaString = function (fractionDigits) {
        if (fractionDigits === void 0) { fractionDigits = 3; }
        var components = [
            Math.round(this.r * 255),
            Math.round(this.g * 255),
            Math.round(this.b * 255)
        ];
        var k = Math.pow(10, fractionDigits);
        if (this.a !== 1) {
            components.push(Math.round(this.a * k) / k);
            return "rgba(" + components.join(', ') + ")";
        }
        return "rgb(" + components.join(', ') + ")";
    };
    Color.prototype.toString = function () {
        if (this.a === 1) {
            return this.toHexString();
        }
        return this.toRgbaString();
    };
    Color.prototype.toHSB = function () {
        return Color.RGBtoHSB(this.r, this.g, this.b);
    };
    /**
     * Converts the given RGB triple to an array of HSB (HSV) components.
     * The hue component will be `NaN` for achromatic colors.
     */
    Color.RGBtoHSB = function (r, g, b) {
        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);
        var S = max !== 0 ? (max - min) / max : 0;
        var H = NaN;
        // min == max, means all components are the same
        // and the color is a shade of gray with no hue (H is NaN)
        if (min !== max) {
            var delta = max - min;
            var rc = (max - r) / delta;
            var gc = (max - g) / delta;
            var bc = (max - b) / delta;
            if (r === max) {
                H = bc - gc;
            }
            else if (g === max) {
                H = 2.0 + rc - bc;
            }
            else {
                H = 4.0 + gc - rc;
            }
            H /= 6.0;
            if (H < 0) {
                H = H + 1.0;
            }
        }
        return [H * 360, S, max];
    };
    /**
     * Converts the given HSB (HSV) triple to an array of RGB components.
     */
    Color.HSBtoRGB = function (H, S, B) {
        if (isNaN(H)) {
            H = 0;
        }
        H = (((H % 360) + 360) % 360) / 360; // normalize hue to [0, 360] interval, then scale to [0, 1]
        var r = 0;
        var g = 0;
        var b = 0;
        if (S === 0) {
            r = g = b = B;
        }
        else {
            var h = (H - Math.floor(H)) * 6;
            var f = h - Math.floor(h);
            var p = B * (1 - S);
            var q = B * (1 - S * f);
            var t = B * (1 - (S * (1 - f)));
            switch (h >> 0) { // discard the floating point part of the number
                case 0:
                    r = B;
                    g = t;
                    b = p;
                    break;
                case 1:
                    r = q;
                    g = B;
                    b = p;
                    break;
                case 2:
                    r = p;
                    g = B;
                    b = t;
                    break;
                case 3:
                    r = p;
                    g = q;
                    b = B;
                    break;
                case 4:
                    r = t;
                    g = p;
                    b = B;
                    break;
                case 5:
                    r = B;
                    g = p;
                    b = q;
                    break;
            }
        }
        return [r, g, b];
    };
    Color.prototype.derive = function (hueShift, saturationFactor, brightnessFactor, opacityFactor) {
        var hsb = Color.RGBtoHSB(this.r, this.g, this.b);
        var b = hsb[2];
        if (b == 0 && brightnessFactor > 1.0) {
            b = 0.05;
        }
        var h = (((hsb[0] + hueShift) % 360) + 360) % 360;
        var s = Math.max(Math.min(hsb[1] * saturationFactor, 1.0), 0.0);
        b = Math.max(Math.min(b * brightnessFactor, 1.0), 0.0);
        var a = Math.max(Math.min(this.a * opacityFactor, 1.0), 0.0);
        var rgba = Color.HSBtoRGB(h, s, b);
        rgba.push(a);
        return Color.fromArray(rgba);
    };
    Color.prototype.brighter = function () {
        return this.derive(0, 1.0, 1.0 / 0.7, 1.0);
    };
    Color.prototype.darker = function () {
        return this.derive(0, 1.0, 0.7, 1.0);
    };
    /**
     * CSS Color Module Level 4:
     * https://drafts.csswg.org/css-color/#named-colors
     */
    Color.nameToHex = Object.freeze({
        aliceblue: '#F0F8FF',
        antiquewhite: '#FAEBD7',
        aqua: '#00FFFF',
        aquamarine: '#7FFFD4',
        azure: '#F0FFFF',
        beige: '#F5F5DC',
        bisque: '#FFE4C4',
        black: '#000000',
        blanchedalmond: '#FFEBCD',
        blue: '#0000FF',
        blueviolet: '#8A2BE2',
        brown: '#A52A2A',
        burlywood: '#DEB887',
        cadetblue: '#5F9EA0',
        chartreuse: '#7FFF00',
        chocolate: '#D2691E',
        coral: '#FF7F50',
        cornflowerblue: '#6495ED',
        cornsilk: '#FFF8DC',
        crimson: '#DC143C',
        cyan: '#00FFFF',
        darkblue: '#00008B',
        darkcyan: '#008B8B',
        darkgoldenrod: '#B8860B',
        darkgray: '#A9A9A9',
        darkgreen: '#006400',
        darkgrey: '#A9A9A9',
        darkkhaki: '#BDB76B',
        darkmagenta: '#8B008B',
        darkolivegreen: '#556B2F',
        darkorange: '#FF8C00',
        darkorchid: '#9932CC',
        darkred: '#8B0000',
        darksalmon: '#E9967A',
        darkseagreen: '#8FBC8F',
        darkslateblue: '#483D8B',
        darkslategray: '#2F4F4F',
        darkslategrey: '#2F4F4F',
        darkturquoise: '#00CED1',
        darkviolet: '#9400D3',
        deeppink: '#FF1493',
        deepskyblue: '#00BFFF',
        dimgray: '#696969',
        dimgrey: '#696969',
        dodgerblue: '#1E90FF',
        firebrick: '#B22222',
        floralwhite: '#FFFAF0',
        forestgreen: '#228B22',
        fuchsia: '#FF00FF',
        gainsboro: '#DCDCDC',
        ghostwhite: '#F8F8FF',
        gold: '#FFD700',
        goldenrod: '#DAA520',
        gray: '#808080',
        green: '#008000',
        greenyellow: '#ADFF2F',
        grey: '#808080',
        honeydew: '#F0FFF0',
        hotpink: '#FF69B4',
        indianred: '#CD5C5C',
        indigo: '#4B0082',
        ivory: '#FFFFF0',
        khaki: '#F0E68C',
        lavender: '#E6E6FA',
        lavenderblush: '#FFF0F5',
        lawngreen: '#7CFC00',
        lemonchiffon: '#FFFACD',
        lightblue: '#ADD8E6',
        lightcoral: '#F08080',
        lightcyan: '#E0FFFF',
        lightgoldenrodyellow: '#FAFAD2',
        lightgray: '#D3D3D3',
        lightgreen: '#90EE90',
        lightgrey: '#D3D3D3',
        lightpink: '#FFB6C1',
        lightsalmon: '#FFA07A',
        lightseagreen: '#20B2AA',
        lightskyblue: '#87CEFA',
        lightslategray: '#778899',
        lightslategrey: '#778899',
        lightsteelblue: '#B0C4DE',
        lightyellow: '#FFFFE0',
        lime: '#00FF00',
        limegreen: '#32CD32',
        linen: '#FAF0E6',
        magenta: '#FF00FF',
        maroon: '#800000',
        mediumaquamarine: '#66CDAA',
        mediumblue: '#0000CD',
        mediumorchid: '#BA55D3',
        mediumpurple: '#9370DB',
        mediumseagreen: '#3CB371',
        mediumslateblue: '#7B68EE',
        mediumspringgreen: '#00FA9A',
        mediumturquoise: '#48D1CC',
        mediumvioletred: '#C71585',
        midnightblue: '#191970',
        mintcream: '#F5FFFA',
        mistyrose: '#FFE4E1',
        moccasin: '#FFE4B5',
        navajowhite: '#FFDEAD',
        navy: '#000080',
        oldlace: '#FDF5E6',
        olive: '#808000',
        olivedrab: '#6B8E23',
        orange: '#FFA500',
        orangered: '#FF4500',
        orchid: '#DA70D6',
        palegoldenrod: '#EEE8AA',
        palegreen: '#98FB98',
        paleturquoise: '#AFEEEE',
        palevioletred: '#DB7093',
        papayawhip: '#FFEFD5',
        peachpuff: '#FFDAB9',
        peru: '#CD853F',
        pink: '#FFC0CB',
        plum: '#DDA0DD',
        powderblue: '#B0E0E6',
        purple: '#800080',
        rebeccapurple: '#663399',
        red: '#FF0000',
        rosybrown: '#BC8F8F',
        royalblue: '#4169E1',
        saddlebrown: '#8B4513',
        salmon: '#FA8072',
        sandybrown: '#F4A460',
        seagreen: '#2E8B57',
        seashell: '#FFF5EE',
        sienna: '#A0522D',
        silver: '#C0C0C0',
        skyblue: '#87CEEB',
        slateblue: '#6A5ACD',
        slategray: '#708090',
        slategrey: '#708090',
        snow: '#FFFAFA',
        springgreen: '#00FF7F',
        steelblue: '#4682B4',
        tan: '#D2B48C',
        teal: '#008080',
        thistle: '#D8BFD8',
        tomato: '#FF6347',
        turquoise: '#40E0D0',
        violet: '#EE82EE',
        wheat: '#F5DEB3',
        white: '#FFFFFF',
        whitesmoke: '#F5F5F5',
        yellow: '#FFFF00',
        yellowgreen: '#9ACD32'
    });
    return Color;
}());

function color (a, b) {
    if (typeof a === 'string') {
        try {
            a = Color.fromString(a);
        }
        catch (e) {
            a = Color.fromArray([0, 0, 0]);
        }
    }
    if (typeof b === 'string') {
        try {
            b = Color.fromString(b);
        }
        catch (e) {
            b = Color.fromArray([0, 0, 0]);
        }
    }
    var red = interpolateNumber(a.r, b.r);
    var green = interpolateNumber(a.g, b.g);
    var blue = interpolateNumber(a.b, b.b);
    var alpha = interpolateNumber(a.a, b.a);
    return function (t) {
        return Color.fromArray([red(t), green(t), blue(t), alpha(t)]).toRgbaString();
    };
}

function interpolateValue (a, b) {
    var t = typeof b;
    var c;
    if (b == null || t === 'boolean') {
        return constant$1(b);
    }
    if (t === 'number') {
        return interpolateNumber(a, b);
    }
    if (t === 'string') {
        try {
            c = Color.fromString(b);
            b = c;
            return color(a, b);
        }
        catch (e) {
            // return string(a, b);
        }
    }
    if (b instanceof Color) {
        return color(a, b);
    }
    if (b instanceof Date) {
        return date(a, b);
    }
    if (Array.isArray(b)) {
        return array(a, b);
    }
    if (typeof b.valueOf !== 'function' && typeof b.toString !== 'function' || isNaN(b)) {
        return object(a, b);
    }
    return interpolateNumber(a, b);
}

var __read$1 = (undefined && undefined.__read) || function (o, n) {
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
var constant = function (x) { return function () { return x; }; };
var identity$2 = function (x) { return x; };
function clamper(domain) {
    var _a;
    var a = domain[0];
    var b = domain[domain.length - 1];
    if (a > b) {
        _a = __read$1([b, a], 2), a = _a[0], b = _a[1];
    }
    return function (x) { return Math.max(a, Math.min(b, x)); };
}
var ContinuousScale = /** @class */ (function () {
    function ContinuousScale() {
        /**
         * The output value of the scale for `undefined` or `NaN` input values.
         */
        this.unknown = undefined;
        this._clamp = identity$2;
        this._domain = [0, 1];
        this._range = [0, 1];
        this.transform = identity$2; // transforms domain value
        this.untransform = identity$2; // untransforms domain value
        this._interpolate = interpolateValue;
        this.rescale();
    }
    Object.defineProperty(ContinuousScale.prototype, "clamp", {
        get: function () {
            return this._clamp !== identity$2;
        },
        set: function (value) {
            this._clamp = value ? clamper(this.domain) : identity$2;
        },
        enumerable: true,
        configurable: true
    });
    ContinuousScale.prototype.setDomain = function (values) {
        this._domain = Array.prototype.map.call(values, function (v) { return +v; });
        if (this._clamp !== identity$2) {
            this._clamp = clamper(this.domain);
        }
        this.rescale();
    };
    ContinuousScale.prototype.getDomain = function () {
        return this._domain.slice();
    };
    Object.defineProperty(ContinuousScale.prototype, "domain", {
        get: function () {
            return this.getDomain();
        },
        set: function (values) {
            this.setDomain(values);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContinuousScale.prototype, "range", {
        get: function () {
            return this._range.slice();
        },
        set: function (values) {
            this._range = Array.prototype.slice.call(values);
            this.rescale();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContinuousScale.prototype, "interpolate", {
        get: function () {
            return this._interpolate;
        },
        set: function (value) {
            this._interpolate = value;
            this.rescale();
        },
        enumerable: true,
        configurable: true
    });
    ContinuousScale.prototype.rescale = function () {
        this.piecewise = this.bimap;
        this.output = undefined;
        this.input = undefined;
    };
    /**
     * Returns a function that converts `x` in `[a, b]` to `t` in `[0, 1]`. Non-clamping.
     * @param a
     * @param b
     */
    ContinuousScale.prototype.normalize = function (a, b) {
        return (b -= (a = +a))
            ? function (x) { return (x - a) / b; }
            : constant(isNaN(b) ? NaN : 0.5);
    };
    ContinuousScale.prototype.bimap = function (domain, range, interpolate) {
        var x0 = domain[0];
        var x1 = domain[1];
        var y0 = range[0];
        var y1 = range[1];
        var xt;
        var ty;
        if (x1 < x0) {
            xt = this.normalize(x1, x0);
            ty = interpolate(y1, y0);
        }
        else {
            xt = this.normalize(x0, x1);
            ty = interpolate(y0, y1);
        }
        return function (x) { return ty(xt(x)); }; // domain value x --> t in [0, 1] --> range value y
    };
    ContinuousScale.prototype.convert = function (x) {
        x = +x;
        if (isNaN(x)) {
            return this.unknown;
        }
        else {
            if (!this.output) {
                this.output = this.piecewise(this.domain.map(this.transform), this.range, this.interpolate);
            }
            return this.output(this.transform(this._clamp(x)));
        }
    };
    ContinuousScale.prototype.invert = function (y) {
        if (!this.input) {
            this.input = this.piecewise(this.range, this.domain.map(this.transform), interpolateNumber);
        }
        return this._clamp(this.untransform(this.input(y)));
    };
    return ContinuousScale;
}());

var __extends$k = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
function ticks (a, b, count) {
    var step = tickStep(a, b, count);
    a = Math.ceil(a / step) * step;
    b = Math.floor(b / step) * step + step / 2;
    // Add half a step here so that the array returned by `range` includes the last tick.
    return range(a, b, step);
}
var e10 = Math.sqrt(50);
var e5 = Math.sqrt(10);
var e2 = Math.sqrt(2);
function tickStep(a, b, count) {
    var rawStep = Math.abs(b - a) / Math.max(0, count);
    var step = Math.pow(10, Math.floor(Math.log(rawStep) / Math.LN10)); // = Math.log10(rawStep)
    var error = rawStep / step;
    if (error >= e10) {
        step *= 10;
    }
    else if (error >= e5) {
        step *= 5;
    }
    else if (error >= e2) {
        step *= 2;
    }
    return b < a ? -step : step;
}
function tickIncrement(a, b, count) {
    var rawStep = (b - a) / Math.max(0, count);
    var power = Math.floor(Math.log(rawStep) / Math.LN10);
    var error = rawStep / Math.pow(10, power);
    return power >= 0
        ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
        : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
}
var NumericTicks = /** @class */ (function (_super) {
    __extends$k(NumericTicks, _super);
    function NumericTicks(fractionDigits, elements) {
        var _this = _super.call(this) || this;
        if (elements) {
            for (var i = 0, n = elements.length; i < n; i++) {
                _this[i] = elements[i];
            }
        }
        _this.fractionDigits = fractionDigits;
        return _this;
    }
    return NumericTicks;
}(Array));
function range(a, b, step) {
    if (step === void 0) { step = 1; }
    var absStep = Math.abs(step);
    var fractionDigits = (absStep > 0 && absStep < 1)
        ? Math.abs(Math.floor(Math.log(absStep) / Math.LN10))
        : 0;
    var f = Math.pow(10, fractionDigits);
    var n = Math.max(0, Math.ceil((b - a) / step)) || 0;
    var values = new NumericTicks(fractionDigits);
    for (var i = 0; i < n; i++) {
        var value = a + step * i;
        values[i] = Math.round(value * f) / f;
    }
    return values;
}

function formatDefault(x, p) {
    var xs = x.toPrecision(p);
    out: for (var n = xs.length, i = 1, i0 = -1, i1 = 0; i < n; ++i) {
        switch (xs[i]) {
            case '.':
                i0 = i1 = i;
                break;
            case '0':
                if (i0 === 0) {
                    i0 = i;
                }
                i1 = i;
                break;
            case 'e': break out;
            default:
                if (i0 > 0) {
                    i0 = 0;
                }
                break;
        }
    }
    return i0 > 0 ? xs.slice(0, i0) + xs.slice(i1 + 1) : xs;
}
var formatTypes = {
    '': formatDefault,
    // Multiply by 100, and then decimal notation with a percent sign.
    '%': function (x, p) { return (x * 100).toFixed(p); },
    // Binary notation, rounded to integer.
    'b': function (x) { return Math.round(x).toString(2); },
    // Converts the integer to the corresponding unicode character before printing.
    'c': function (x) { return String(x); },
    // Decimal notation, rounded to integer.
    'd': formatDecimal,
    // Exponent notation.
    'e': function (x, p) { return x.toExponential(p); },
    // Fixed point notation.
    'f': function (x, p) { return x.toFixed(p); },
    // Either decimal or exponent notation, rounded to significant digits.
    'g': function (x, p) { return x.toPrecision(p); },
    // Octal notation, rounded to integer.
    'o': function (x) { return Math.round(x).toString(8); },
    // Multiply by 100, round to significant digits, and then decimal notation with a percent sign.
    'p': function (x, p) { return formatRounded(x * 100, p); },
    // Decimal notation, rounded to significant digits.
    'r': formatRounded,
    // Decimal notation with a SI prefix, rounded to significant digits.
    's': formatPrefixAuto,
    // Hexadecimal notation, using upper-case letters, rounded to integer.
    'X': function (x) { return Math.round(x).toString(16).toUpperCase(); },
    // Hexadecimal notation, using lower-case letters, rounded to integer.
    'x': function (x) { return Math.round(x).toString(16); }
};
var prefixes = ['y', 'z', 'a', 'f', 'p', 'n', '\xB5', 'm', '', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
/**
 * [[fill]align][sign][#][0][width][grouping_option][.precision][type]
 */
var FormatSpecifier = /** @class */ (function () {
    function FormatSpecifier(specifier) {
        if (specifier instanceof FormatSpecifier) {
            this.fill = specifier.fill;
            this.align = specifier.align;
            this.sign = specifier.sign;
            this.symbol = specifier.symbol;
            this.zero = specifier.zero;
            this.width = specifier.width;
            this.comma = specifier.comma;
            this.precision = specifier.precision;
            this.trim = specifier.trim;
            this.type = specifier.type;
            this.string = specifier.string;
        }
        else {
            this.fill = specifier.fill === undefined ? ' ' : String(specifier.fill);
            this.align = specifier.align === undefined ? '>' : String(specifier.align);
            this.sign = specifier.sign === undefined ? '-' : String(specifier.sign);
            this.symbol = specifier.symbol === undefined ? '' : String(specifier.symbol);
            this.zero = !!specifier.zero;
            this.width = specifier.width === undefined ? undefined : +specifier.width;
            this.comma = !!specifier.comma;
            this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
            this.trim = !!specifier.trim;
            this.type = specifier.type === undefined ? '' : String(specifier.type);
            this.string = specifier.string;
        }
    }
    return FormatSpecifier;
}());
// [[fill]align][sign][symbol][0][width][,][.precision][~][type]
var formatRegEx = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
var interpolateRegEx = /(#\{(.*?)\})/g;
function makeFormatSpecifier(specifier) {
    if (specifier instanceof FormatSpecifier) {
        return new FormatSpecifier(specifier);
    }
    var found = false;
    var string = specifier.replace(interpolateRegEx, function () {
        if (!found) {
            specifier = arguments[2];
            found = true;
        }
        return '#{}';
    });
    var match = formatRegEx.exec(specifier);
    if (!match) {
        throw new Error("Invalid format: " + specifier);
    }
    return new FormatSpecifier({
        fill: match[1],
        align: match[2],
        sign: match[3],
        symbol: match[4],
        zero: match[5],
        width: match[6],
        comma: match[7],
        precision: match[8] && match[8].slice(1),
        trim: match[9],
        type: match[10],
        string: found ? string : undefined
    });
}
function tickFormat(start, stop, count, specifier) {
    var step = tickStep(start, stop, count);
    var formatSpecifier = makeFormatSpecifier(specifier == undefined ? ',f' : specifier);
    var precision;
    switch (formatSpecifier.type) {
        case 's': {
            var value = Math.max(Math.abs(start), Math.abs(stop));
            if (formatSpecifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) {
                formatSpecifier.precision = precision;
            }
            return formatPrefix(formatSpecifier, value);
        }
        case '':
        case 'e':
        case 'g':
        case 'p':
        case 'r': {
            if (formatSpecifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) {
                formatSpecifier.precision = precision - +(formatSpecifier.type === 'e');
            }
            break;
        }
        case 'f':
        case '%': {
            if (formatSpecifier.precision == null && !isNaN(precision = precisionFixed(step))) {
                formatSpecifier.precision = precision - +(formatSpecifier.type === '%') * 2;
            }
            break;
        }
    }
    return format(formatSpecifier);
}
var prefixExponent;
function formatPrefixAuto(x, p) {
    if (p === void 0) { p = 0; }
    var d = formatDecimalParts(x, p);
    if (!d) {
        return String(x);
    }
    var coefficient = d[0];
    var exponent = d[1];
    prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3;
    var i = exponent - prefixExponent + 1;
    var n = coefficient.length;
    if (i === n) {
        return coefficient;
    }
    else {
        if (i > n) {
            return coefficient + new Array(i - n + 1).join('0');
        }
        if (i > 0) {
            return coefficient.slice(0, i) + '.' + coefficient.slice(i);
        }
        else {
            var parts = formatDecimalParts(x, Math.max(0, p + i - 1));
            return '0.' + new Array(1 - i).join('0') + parts[0]; // less than 1y!
        }
    }
}
function formatDecimal(x) {
    return Math.abs(x = Math.round(x)) >= 1e21
        ? x.toLocaleString('en').replace(/,/g, '')
        : x.toString(10);
}
function formatGroup(grouping, thousands) {
    return function (value, width) {
        var t = [];
        var i = value.length;
        var j = 0;
        var g = grouping[0];
        var length = 0;
        while (i > 0 && g > 0) {
            if (length + g + 1 > width) {
                g = Math.max(1, width - length);
            }
            t.push(value.substring(i -= g, i + g));
            if ((length += g + 1) > width) {
                break;
            }
            g = grouping[j = (j + 1) % grouping.length];
        }
        return t.reverse().join(thousands);
    };
}
function formatNumerals(numerals) {
    return function (value) { return value.replace(/[0-9]/g, function (i) { return numerals[+i]; }); };
}
// Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
function formatTrim(s) {
    out: for (var n = s.length, i = 1, i0 = -1, i1 = 0; i < n; ++i) {
        switch (s[i]) {
            case '.':
                i0 = i1 = i;
                break;
            case '0':
                if (i0 === 0) {
                    i0 = i;
                }
                i1 = i;
                break;
            default:
                if (!+s[i]) {
                    break out;
                }
                if (i0 > 0) {
                    i0 = 0;
                }
                break;
        }
    }
    return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
}
function formatRounded(x, p) {
    var d = formatDecimalParts(x, p);
    if (!d) {
        return String(x);
    }
    var coefficient = d[0];
    var exponent = d[1];
    if (exponent < 0) {
        return '0.' + new Array(-exponent).join('0') + coefficient;
    }
    else {
        if (coefficient.length > exponent + 1) {
            return coefficient.slice(0, exponent + 1) + '.' + coefficient.slice(exponent + 1);
        }
        else {
            return coefficient + new Array(exponent - coefficient.length + 2).join('0');
        }
    }
}
// Computes the decimal coefficient and exponent of the specified number x with
// significant digits p, where x is positive and p is in [1, 21] or undefined.
// For example, formatDecimalParts(1.23) returns ['123', 0].
function formatDecimalParts(x, p) {
    var sx = p ? x.toExponential(p - 1) : x.toExponential();
    var i = sx.indexOf('e');
    if (i < 0) { // NaN, ±Infinity
        return undefined;
    }
    var coefficient = sx.slice(0, i);
    // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
    // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
    return [
        coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
        +sx.slice(i + 1)
    ];
}
function identity$1(x) {
    return x;
}
var formatDefaultLocale;
var format;
var formatPrefix;
defaultLocale({
    thousands: ',',
    grouping: [3],
    currency: ['$', '']
});
function defaultLocale(definition) {
    formatDefaultLocale = formatLocale$1(definition);
    format = formatDefaultLocale.format;
    formatPrefix = formatDefaultLocale.formatPrefix;
}
function exponent(x) {
    var parts = formatDecimalParts(Math.abs(x));
    if (parts) {
        return parts[1];
    }
    return NaN;
}
function precisionFixed(step) {
    return Math.max(0, -exponent(Math.abs(step)));
}
function precisionPrefix(step, value) {
    var x = Math.floor(exponent(value) / 3);
    x = Math.min(8, x);
    x = Math.max(-8, x);
    return Math.max(0, x * 3 - exponent(Math.abs(step)));
}
function precisionRound(step, max) {
    step = Math.abs(step);
    max = Math.abs(max) - step;
    return Math.max(0, exponent(max) - exponent(step)) + 1;
}
function formatLocale$1(locale) {
    var group = locale.grouping === undefined || locale.thousands === undefined
        ? identity$1
        : formatGroup(Array.prototype.map.call(locale.grouping, Number), String(locale.thousands));
    var currencyPrefix = locale.currency === undefined ? '' : String(locale.currency[0]);
    var currencySuffix = locale.currency === undefined ? '' : String(locale.currency[1]);
    var decimal = locale.decimal === undefined ? '.' : String(locale.decimal);
    var numerals = locale.numerals === undefined
        ? identity$1
        : formatNumerals(Array.prototype.map.call(locale.numerals, String));
    var percent = locale.percent === undefined ? '%' : String(locale.percent);
    var minus = locale.minus === undefined ? '\u2212' : String(locale.minus);
    var nan = locale.nan === undefined ? 'NaN' : String(locale.nan);
    function newFormat(specifier) {
        var formatSpecifier = makeFormatSpecifier(specifier);
        var fill = formatSpecifier.fill;
        var align = formatSpecifier.align;
        var sign = formatSpecifier.sign;
        var symbol = formatSpecifier.symbol;
        var zero = formatSpecifier.zero;
        var width = formatSpecifier.width;
        var comma = formatSpecifier.comma;
        var precision = formatSpecifier.precision;
        var trim = formatSpecifier.trim;
        var type = formatSpecifier.type;
        // The 'n' type is an alias for ',g'.
        if (type === 'n') {
            comma = true;
            type = 'g';
        }
        else if (!formatTypes[type]) { // The '' type, and any invalid type, is an alias for '.12~g'.
            if (precision === undefined) {
                precision = 12;
            }
            trim = true;
            type = 'g';
        }
        // If zero fill is specified, padding goes after sign and before digits.
        if (zero || (fill === '0' && align === '=')) {
            zero = true;
            fill = '0';
            align = '=';
        }
        // Compute the prefix and suffix.
        // For SI-prefix, the suffix is lazily computed.
        var prefix = symbol === '$' ? currencyPrefix : symbol === '#' && /[boxX]/.test(type) ? '0' + type.toLowerCase() : '';
        var suffix = symbol === '$' ? currencySuffix : /[%p]/.test(type) ? percent : '';
        // What format function should we use?
        // Is this an integer type?
        // Can this type generate exponential notation?
        var formatType = formatTypes[type];
        var maybeSuffix = /[defgprs%]/.test(type);
        // Set the default precision if not specified,
        // or clamp the specified precision to the supported range.
        // For significant precision, it must be in [1, 21].
        // For fixed precision, it must be in [0, 20].
        if (precision === undefined) {
            precision = 6;
        }
        else if (/[gprs]/.test(type)) {
            precision = Math.max(1, Math.min(21, precision));
        }
        else {
            precision = Math.max(0, Math.min(20, precision));
        }
        function format(x) {
            var valuePrefix = prefix;
            var valueSuffix = suffix;
            var value;
            if (type === 'c') {
                valueSuffix = formatType(+x) + valueSuffix;
                value = '';
            }
            else {
                var nx = +x;
                // Determine the sign. -0 is not less than 0, but 1 / -0 is!
                var valueNegative = x < 0 || 1 / nx < 0;
                // Perform the initial formatting.
                value = isNaN(nx) ? nan : formatType(Math.abs(nx), precision);
                // Trim insignificant zeros.
                if (trim) {
                    value = formatTrim(value);
                }
                // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
                if (valueNegative && +value === 0 && sign !== '+') {
                    valueNegative = false;
                }
                // Compute the prefix and suffix.
                var signPrefix = valueNegative
                    ? (sign === '(' ? sign : minus)
                    : (sign === '-' || sign === '(' ? '' : sign);
                var signSuffix = valueNegative && sign === '(' ? ')' : '';
                valuePrefix = signPrefix + valuePrefix;
                valueSuffix = (type === 's' ? prefixes[8 + prefixExponent / 3] : '') + valueSuffix + signSuffix;
                // Break the formatted value into the integer “value” part that can be
                // grouped, and fractional or exponential “suffix” part that is not.
                if (maybeSuffix) {
                    for (var i = 0, n = value.length; i < n; i++) {
                        var c = value.charCodeAt(i);
                        if (48 > c || c > 57) {
                            valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                            value = value.slice(0, i);
                            break;
                        }
                    }
                }
            }
            // If the fill character is not '0', grouping is applied before padding.
            if (comma && !zero) {
                value = group(value, Infinity);
            }
            // Compute the padding.
            var length = valuePrefix.length + value.length + valueSuffix.length;
            var padding = length < width ? new Array(width - length + 1).join(fill) : '';
            // If the fill character is '0', grouping is applied after padding.
            if (comma && zero) {
                value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity);
                padding = '';
            }
            // Reconstruct the final output based on the desired alignment.
            switch (align) {
                case '<':
                    value = valuePrefix + value + valueSuffix + padding;
                    break;
                case '=':
                    value = valuePrefix + padding + value + valueSuffix;
                    break;
                case '^':
                    value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);
                    break;
                default:
                    value = padding + valuePrefix + value + valueSuffix;
                    break;
            }
            var string = formatSpecifier.string;
            if (string) {
                return string.replace(interpolateRegEx, function () { return numerals(value); });
            }
            return numerals(value);
        }
        return format;
    }
    function formatPrefix(specifier, value) {
        var formatSpecifier = makeFormatSpecifier(specifier);
        formatSpecifier.type = 'f';
        var f = newFormat(formatSpecifier);
        var e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3;
        var k = Math.pow(10, -e);
        var prefix = prefixes[8 + e / 3];
        return function (value) {
            return f(k * +value) + prefix;
        };
    }
    return {
        format: newFormat,
        formatPrefix: formatPrefix
    };
}

var __extends$j = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * Maps continuous domain to a continuous range.
 */
var LinearScale = /** @class */ (function (_super) {
    __extends$j(LinearScale, _super);
    function LinearScale() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'linear';
        return _this;
    }
    LinearScale.prototype.ticks = function (count) {
        if (count === void 0) { count = 10; }
        var d = this._domain;
        return ticks(d[0], d[d.length - 1], count);
    };
    /**
     * Extends the domain so that it starts and ends on nice round values.
     * @param count Tick count.
     */
    LinearScale.prototype.nice = function (count) {
        if (count === void 0) { count = 10; }
        var d = this.domain;
        var i0 = 0;
        var i1 = d.length - 1;
        var start = d[i0];
        var stop = d[i1];
        var step;
        if (stop < start) {
            step = start;
            start = stop;
            stop = step;
            step = i0;
            i0 = i1;
            i1 = step;
        }
        step = tickIncrement(start, stop, count);
        if (step > 0) {
            start = Math.floor(start / step) * step;
            stop = Math.ceil(stop / step) * step;
            step = tickIncrement(start, stop, count);
        }
        else if (step < 0) {
            start = Math.ceil(start * step) / step;
            stop = Math.floor(stop * step) / step;
            step = tickIncrement(start, stop, count);
        }
        if (step > 0) {
            d[i0] = Math.floor(start / step) * step;
            d[i1] = Math.ceil(stop / step) * step;
            this.domain = d;
        }
        else if (step < 0) {
            d[i0] = Math.ceil(start * step) / step;
            d[i1] = Math.floor(stop * step) / step;
            this.domain = d;
        }
    };
    LinearScale.prototype.tickFormat = function (count, specifier) {
        var d = this.domain;
        return tickFormat(d[0], d[d.length - 1], count == undefined ? 10 : count, specifier);
    };
    return LinearScale;
}(ContinuousScale));

var __extends$i = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var t0 = new Date;
var t1 = new Date;
/**
 * The interval methods don't mutate Date parameters.
 */
var TimeInterval = /** @class */ (function () {
    function TimeInterval(floor, offset) {
        this._floor = floor;
        this._offset = offset;
    }
    /**
     * Returns a new date representing the latest interval boundary date before or equal to date.
     * For example, `day.floor(date)` typically returns 12:00 AM local time on the given date.
     * @param date
     */
    TimeInterval.prototype.floor = function (date) {
        date = new Date(+date);
        this._floor(date);
        return date;
    };
    /**
     * Returns a new date representing the earliest interval boundary date after or equal to date.
     * @param date
     */
    TimeInterval.prototype.ceil = function (date) {
        date = new Date(+date - 1);
        this._floor(date);
        this._offset(date, 1);
        this._floor(date);
        return date;
    };
    /**
     * Returns a new date representing the closest interval boundary date to date.
     * @param date
     */
    TimeInterval.prototype.round = function (date) {
        var d0 = this.floor(date);
        var d1 = this.ceil(date);
        var ms = +date;
        return ms - d0.getTime() < d1.getTime() - ms ? d0 : d1;
    };
    /**
     * Returns a new date equal to date plus step intervals.
     * @param date
     * @param step
     */
    TimeInterval.prototype.offset = function (date, step) {
        if (step === void 0) { step = 1; }
        date = new Date(+date);
        this._offset(date, Math.floor(step));
        return date;
    };
    /**
     * Returns an array of dates representing every interval boundary after or equal to start (inclusive) and before stop (exclusive).
     * @param start
     * @param stop
     * @param step
     */
    TimeInterval.prototype.range = function (start, stop, step) {
        if (step === void 0) { step = 1; }
        var range = [];
        start = this.ceil(start);
        step = Math.floor(step);
        if (start > stop || step <= 0) {
            return range;
        }
        var previous;
        do {
            previous = new Date(+start);
            range.push(previous);
            this._offset(start, step);
            this._floor(start);
        } while (previous < start && start < stop);
        return range;
    };
    // Returns an interval that is a subset of this interval.
    // For example, to create an interval that return 1st, 11th, 21st and 31st of each month:
    // day.filter(date => (date.getDate() - 1) % 10 === 0)
    TimeInterval.prototype.filter = function (test) {
        var _this = this;
        var floor = function (date) {
            if (date instanceof Date) {
                _this._floor(date);
                while (!test(date)) {
                    date.setTime(date.getTime() - 1);
                    _this._floor(date);
                }
            }
            return date;
        };
        var offset = function (date, step) {
            if (date instanceof Date) {
                if (step < 0) {
                    while (++step <= 0) {
                        do {
                            _this._offset(date, -1);
                        } while (!test(date));
                    }
                }
                else {
                    while (--step >= 0) {
                        do {
                            _this._offset(date, 1);
                        } while (!test(date));
                    }
                }
            }
            return date;
        };
        return new TimeInterval(floor, offset);
    };
    return TimeInterval;
}());
var CountableTimeInterval = /** @class */ (function (_super) {
    __extends$i(CountableTimeInterval, _super);
    function CountableTimeInterval(floor, offset, count, field) {
        var _this = _super.call(this, floor, offset) || this;
        _this._count = count;
        _this._field = field;
        return _this;
    }
    /**
     * Returns the number of interval boundaries after start (exclusive) and before or equal to end (inclusive).
     * @param start
     * @param end
     */
    CountableTimeInterval.prototype.count = function (start, end) {
        t0.setTime(+start);
        t1.setTime(+end);
        this._floor(t0);
        this._floor(t1);
        return Math.floor(this._count(t0, t1));
    };
    /**
     * Returns a filtered view of this interval representing every step'th date.
     * The meaning of step is dependent on this interval’s parent interval as defined by the `field` function.
     * @param step
     */
    CountableTimeInterval.prototype.every = function (step) {
        var _this = this;
        var result;
        step = Math.floor(step);
        if (isFinite(step) && step > 0) {
            if (step > 1) {
                var field_1 = this._field;
                if (field_1) {
                    result = this.filter(function (d) { return field_1(d) % step === 0; });
                }
                else {
                    result = this.filter(function (d) { return _this.count(0, d) % step === 0; });
                }
            }
            else {
                result = this;
            }
        }
        return result;
    };
    return CountableTimeInterval;
}(TimeInterval));

function floor$8(date) {
    return date;
}
function offset$8(date, milliseconds) {
    date.setTime(date.getTime() + milliseconds);
}
function count$8(start, end) {
    return end.getTime() - start.getTime();
}
var millisecond = new CountableTimeInterval(floor$8, offset$8, count$8);

// Common time unit sizes in milliseconds.
var durationSecond = 1000;
var durationMinute = durationSecond * 60;
var durationHour = durationMinute * 60;
var durationDay = durationHour * 24;
var durationWeek = durationDay * 7;
var durationMonth = durationDay * 30;
var durationYear = durationDay * 365;

function floor$7(date) {
    date.setTime(date.getTime() - date.getMilliseconds());
}
function offset$7(date, seconds) {
    date.setTime(date.getTime() + seconds * durationSecond);
}
function count$7(start, end) {
    return (end.getTime() - start.getTime()) / durationSecond;
}
var second = new CountableTimeInterval(floor$7, offset$7, count$7);

function floor$6(date) {
    date.setTime(date.getTime() - date.getMilliseconds() - date.getSeconds() * durationSecond);
}
function offset$6(date, minutes) {
    date.setTime(date.getTime() + minutes * durationMinute);
}
function count$6(start, end) {
    return (end.getTime() - start.getTime()) / durationMinute;
}
function field$6(date) {
    return date.getMinutes();
}
var minute = new CountableTimeInterval(floor$6, offset$6, count$6, field$6);

function floor$5(date) {
    date.setTime(date.getTime() - date.getMilliseconds() - date.getSeconds() * durationSecond - date.getMinutes() * durationMinute);
}
function offset$5(date, hours) {
    date.setTime(date.getTime() + hours * durationHour);
}
function count$5(start, end) {
    return (end.getTime() - start.getTime()) / durationHour;
}
function field$5(date) {
    return date.getHours();
}
var hour = new CountableTimeInterval(floor$5, offset$5, count$5, field$5);

function floor$4(date) {
    date.setHours(0, 0, 0, 0);
}
function offset$4(date, days) {
    date.setDate(date.getDate() + days);
}
function count$4(start, end) {
    var tzMinuteDelta = end.getTimezoneOffset() - start.getTimezoneOffset();
    return (end.getTime() - start.getTime() - tzMinuteDelta * durationMinute) / durationDay;
}
function field$4(date) {
    return date.getDate() - 1;
}
var day = new CountableTimeInterval(floor$4, offset$4, count$4, field$4);

// Set date to n-th day of the week.
function weekday$1(n) {
    // Sets the `date` to the start of the `n`-th day of the current week.
    // n == 0 is Sunday.
    function floor(date) {
        //                  1..31            1..7
        date.setDate(date.getDate() - (date.getDay() + 7 - n) % 7);
        date.setHours(0, 0, 0, 0); // h, m, s, ms
    }
    // Offset the date by the given number of weeks.
    function offset(date, weeks) {
        date.setDate(date.getDate() + weeks * 7);
    }
    // Count the number of weeks between the start and end dates.
    function count(start, end) {
        var msDelta = end.getTime() - start.getTime();
        var tzMinuteDelta = end.getTimezoneOffset() - start.getTimezoneOffset();
        return (msDelta - tzMinuteDelta * durationMinute) / durationWeek;
    }
    return new CountableTimeInterval(floor, offset, count);
}
var sunday = weekday$1(0);
var monday = weekday$1(1);
weekday$1(2);
weekday$1(3);
var thursday = weekday$1(4);
weekday$1(5);
weekday$1(6);

function floor$3(date) {
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
}
function offset$3(date, months) {
    date.setMonth(date.getMonth() + months);
}
function count$3(start, end) {
    return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
}
function field$3(date) {
    return date.getMonth();
}
var month = new CountableTimeInterval(floor$3, offset$3, count$3, field$3);

function floor$2(date) {
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
}
function offset$2(date, years) {
    date.setFullYear(date.getFullYear() + years);
}
function count$2(start, end) {
    return end.getFullYear() - start.getFullYear();
}
function field$2(date) {
    return date.getFullYear();
}
var year = new CountableTimeInterval(floor$2, offset$2, count$2, field$2);

function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

function complexBisectRight(list, x, map, lo, hi) {
    if (lo === void 0) { lo = 0; }
    if (hi === void 0) { hi = list.length; }
    var comparator = ascendingComparator(map);
    while (lo < hi) {
        var mid = (lo + hi) >>> 1;
        if (comparator(list[mid], x) < 0) {
            lo = mid + 1;
        }
        else {
            hi = mid;
        }
    }
    return lo;
}
function ascendingComparator(map) {
    return function (item, x) {
        return ascending(map(item), x);
    };
}

function floor$1(date) {
    date.setUTCHours(0, 0, 0, 0);
}
function offset$1(date, days) {
    date.setUTCDate(date.getUTCDate() + days);
}
function count$1(start, end) {
    return (end.getTime() - start.getTime()) / durationDay;
}
function field$1(date) {
    return date.getUTCDate() - 1;
}
var utcDay = new CountableTimeInterval(floor$1, offset$1, count$1, field$1);

function floor(date) {
    date.setUTCMonth(0, 1);
    date.setUTCHours(0, 0, 0, 0);
}
function offset(date, years) {
    date.setUTCFullYear(date.getUTCFullYear() + years);
}
function count(start, end) {
    return end.getUTCFullYear() - start.getUTCFullYear();
}
function field(date) {
    return date.getUTCFullYear();
}
var utcYear = new CountableTimeInterval(floor, offset, count, field);

// Set date to n-th day of the week.
function weekday(n) {
    // Sets the `date` to the start of the `n`-th day of the current week.
    // n == 0 is Sunday.
    function floor(date) {
        date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - n) % 7);
        date.setHours(0, 0, 0, 0); // h, m, s, ms
    }
    // Offset the date by the given number of weeks.
    function offset(date, weeks) {
        date.setUTCDate(date.getUTCDate() + weeks * 7);
    }
    // Count the number of weeks between the start and end dates.
    function count(start, end) {
        return (end.getTime() - start.getTime()) / durationWeek;
    }
    return new CountableTimeInterval(floor, offset, count);
}
var utcSunday = weekday(0);
var utcMonday = weekday(1);
weekday(2);
weekday(3);
var utcThursday = weekday(4);
weekday(5);
weekday(6);

function localDate(d) {
    // For JS Dates the [0, 100) interval is a time warp, a fast forward to the 20th century.
    // For example, -1 is -0001 BC, 0 is already 1900 AD.
    if (d.y >= 0 && d.y < 100) {
        var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
        date.setFullYear(d.y);
        return date;
    }
    return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
}
function utcDate(d) {
    if (d.y >= 0 && d.y < 100) {
        var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
        date.setUTCFullYear(d.y);
        return date;
    }
    return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
}
/**
 * Creates a lookup map for array of names to go from a name to index.
 * @param names
 */
function formatLookup(names) {
    var map = {};
    for (var i = 0, n = names.length; i < n; i++) {
        map[names[i].toLowerCase()] = i;
    }
    return map;
}
function newYear(y) {
    return {
        y: y,
        m: 0,
        d: 1,
        H: 0,
        M: 0,
        S: 0,
        L: 0
    };
}
var percentCharCode = 37;
var numberRe = /^\s*\d+/; // ignores next directive
var percentRe = /^%/;
var requoteRe = /[\\^$*+?|[\]().{}]/g;
/**
 * Prepends any character in the `requoteRe` set with a backslash.
 * @param s
 */
var requote = function (s) { return s.replace(requoteRe, '\\$&'); }; // $& - matched substring
/**
 * Returns a RegExp that matches any string that starts with any of the given names (case insensitive).
 * @param names
 */
var formatRe = function (names) { return new RegExp('^(?:' + names.map(requote).join('|') + ')', 'i'); };
// A map of padding modifiers to padding strings. Default is `0`.
var pads = {
    '-': '',
    '_': ' ',
    '0': '0'
};
function pad(value, fill, width) {
    var sign = value < 0 ? '-' : '';
    var string = String(sign ? -value : value);
    var length = string.length;
    return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
}
/**
 * Create a new time-locale-based object which exposes time-formatting
 * methods for the specified locale definition.
 *
 * @param timeLocale A time locale definition.
 */
function formatLocale(timeLocale) {
    var lDateTime = timeLocale.dateTime;
    var lDate = timeLocale.date;
    var lTime = timeLocale.time;
    var lPeriods = timeLocale.periods;
    var lWeekdays = timeLocale.days;
    var lShortWeekdays = timeLocale.shortDays;
    var lMonths = timeLocale.months;
    var lShortMonths = timeLocale.shortMonths;
    var periodRe = formatRe(lPeriods);
    var periodLookup = formatLookup(lPeriods);
    var weekdayRe = formatRe(lWeekdays);
    var weekdayLookup = formatLookup(lWeekdays);
    var shortWeekdayRe = formatRe(lShortWeekdays);
    var shortWeekdayLookup = formatLookup(lShortWeekdays);
    var monthRe = formatRe(lMonths);
    var monthLookup = formatLookup(lMonths);
    var shortMonthRe = formatRe(lShortMonths);
    var shortMonthLookup = formatLookup(lShortMonths);
    var formats = {
        'a': formatShortWeekday,
        'A': formatWeekday,
        'b': formatShortMonth,
        'B': formatMonth,
        'c': undefined,
        'd': formatDayOfMonth,
        'e': formatDayOfMonth,
        'f': formatMicroseconds,
        'H': formatHour24,
        'I': formatHour12,
        'j': formatDayOfYear,
        'L': formatMilliseconds,
        'm': formatMonthNumber,
        'M': formatMinutes,
        'p': formatPeriod,
        'Q': formatUnixTimestamp,
        's': formatUnixTimestampSeconds,
        'S': formatSeconds,
        'u': formatWeekdayNumberMonday,
        'U': formatWeekNumberSunday,
        'V': formatWeekNumberISO,
        'w': formatWeekdayNumberSunday,
        'W': formatWeekNumberMonday,
        'x': undefined,
        'X': undefined,
        'y': formatYear,
        'Y': formatFullYear,
        'Z': formatZone,
        '%': formatLiteralPercent
    };
    var utcFormats = {
        'a': formatUTCShortWeekday,
        'A': formatUTCWeekday,
        'b': formatUTCShortMonth,
        'B': formatUTCMonth,
        'c': undefined,
        'd': formatUTCDayOfMonth,
        'e': formatUTCDayOfMonth,
        'f': formatUTCMicroseconds,
        'H': formatUTCHour24,
        'I': formatUTCHour12,
        'j': formatUTCDayOfYear,
        'L': formatUTCMilliseconds,
        'm': formatUTCMonthNumber,
        'M': formatUTCMinutes,
        'p': formatUTCPeriod,
        'Q': formatUnixTimestamp,
        's': formatUnixTimestampSeconds,
        'S': formatUTCSeconds,
        'u': formatUTCWeekdayNumberMonday,
        'U': formatUTCWeekNumberSunday,
        'V': formatUTCWeekNumberISO,
        'w': formatUTCWeekdayNumberSunday,
        'W': formatUTCWeekNumberMonday,
        'x': undefined,
        'X': undefined,
        'y': formatUTCYear,
        'Y': formatUTCFullYear,
        'Z': formatUTCZone,
        '%': formatLiteralPercent
    };
    var parses = {
        'a': parseShortWeekday,
        'A': parseWeekday,
        'b': parseShortMonth,
        'B': parseMonth,
        'c': parseLocaleDateTime,
        'd': parseDayOfMonth,
        'e': parseDayOfMonth,
        'f': parseMicroseconds,
        'H': parseHour24,
        'I': parseHour24,
        'j': parseDayOfYear,
        'L': parseMilliseconds,
        'm': parseMonthNumber,
        'M': parseMinutes,
        'p': parsePeriod,
        'Q': parseUnixTimestamp,
        's': parseUnixTimestampSeconds,
        'S': parseSeconds,
        'u': parseWeekdayNumberMonday,
        'U': parseWeekNumberSunday,
        'V': parseWeekNumberISO,
        'w': parseWeekdayNumberSunday,
        'W': parseWeekNumberMonday,
        'x': parseLocaleDate,
        'X': parseLocaleTime,
        'y': parseYear,
        'Y': parseFullYear,
        'Z': parseZone,
        '%': parseLiteralPercent
    };
    // Recursive definitions.
    formats.x = newFormat(lDate, formats);
    formats.X = newFormat(lTime, formats);
    formats.c = newFormat(lDateTime, formats);
    utcFormats.x = newFormat(lDate, utcFormats);
    utcFormats.X = newFormat(lTime, utcFormats);
    utcFormats.c = newFormat(lDateTime, utcFormats);
    function newParse(specifier, newDate) {
        return function (str) {
            var d = newYear(1900);
            var i = parseSpecifier(d, specifier, str += '', 0);
            if (i != str.length) {
                return undefined;
            }
            // If a UNIX timestamp is specified, return it.
            if ('Q' in d) {
                return new Date(d.Q);
            }
            // The am-pm flag is 0 for AM, and 1 for PM.
            if ('p' in d) {
                d.H = d.H % 12 + d.p * 12;
            }
            // Convert day-of-week and week-of-year to day-of-year.
            if ('V' in d) {
                if (d.V < 1 || d.V > 53) {
                    return undefined;
                }
                if (!('w' in d)) {
                    d.w = 1;
                }
                if ('Z' in d) {
                    var week = utcDate(newYear(d.y));
                    var day$1 = week.getUTCDay();
                    week = day$1 > 4 || day$1 === 0 ? utcMonday.ceil(week) : utcMonday.floor(week);
                    week = utcDay.offset(week, (d.V - 1) * 7);
                    d.y = week.getUTCFullYear();
                    d.m = week.getUTCMonth();
                    d.d = week.getUTCDate() + (d.w + 6) % 7;
                }
                else {
                    var week = newDate(newYear(d.y));
                    var day$1 = week.getDay();
                    week = day$1 > 4 || day$1 === 0 ? monday.ceil(week) : monday.floor(week);
                    week = day.offset(week, (d.V - 1) * 7);
                    d.y = week.getFullYear();
                    d.m = week.getMonth();
                    d.d = week.getDate() + (d.w + 6) % 7;
                }
            }
            else if ('W' in d || 'U' in d) {
                if (!('w' in d)) {
                    d.w = 'u' in d
                        ? d.u % 7
                        : 'W' in d ? 1 : 0;
                }
                var day$1 = 'Z' in d ? utcDate(newYear(d.y)).getUTCDay() : newDate(newYear(d.y)).getDay();
                d.m = 0;
                d.d = 'W' in d ? (d.w + 6) % 7 + d.W * 7 - (day$1 + 5) % 7 : d.w + d.U * 7 - (day$1 + 6) % 7;
            }
            // If a time zone is specified, all fields are interpreted as UTC and then
            // offset according to the specified time zone.
            if ('Z' in d) {
                d.H += d.Z / 100 | 0;
                d.M += d.Z % 100;
                return utcDate(d);
            }
            // Otherwise, all fields are in local time.
            return newDate(d);
        };
    }
    /**
     * Creates a new function that formats the given Date or timestamp according to specifier.
     * @param specifier
     * @param formats
     */
    function newFormat(specifier, formats) {
        return function (date) {
            var string = [];
            var n = specifier.length;
            var i = -1;
            var j = 0;
            if (!(date instanceof Date)) {
                date = new Date(+date);
            }
            while (++i < n) {
                if (specifier.charCodeAt(i) === percentCharCode) {
                    string.push(specifier.slice(j, i)); // copy the chunks of specifier with no directives as is
                    var c = specifier.charAt(++i);
                    var pad_1 = pads[c];
                    if (pad_1 != undefined) { // if format directive has a padding modifier in front of it
                        c = specifier.charAt(++i); // fetch the directive itself
                    }
                    else {
                        pad_1 = c === 'e' ? ' ' : '0'; // use the default padding modifier
                    }
                    var format = formats[c];
                    if (format) { // if the directive has a corresponding formatting function
                        c = format(date, pad_1); // replace the directive with the formatted date
                    }
                    string.push(c);
                    j = i + 1;
                }
            }
            string.push(specifier.slice(j, i));
            return string.join('');
        };
    }
    // Simultaneously walks over the specifier and the parsed string, populating the `d` map with parsed values.
    // The returned number is expected to equal the length of the parsed `string`, if parsing succeeded.
    function parseSpecifier(d, specifier, string, j) {
        // i - `specifier` string index
        // j - parsed `string` index
        var i = 0;
        var n = specifier.length;
        var m = string.length;
        while (i < n) {
            if (j >= m) {
                return -1;
            }
            var code = specifier.charCodeAt(i++);
            if (code === percentCharCode) {
                var char = specifier.charAt(i++);
                var parse = parses[(char in pads ? specifier.charAt(i++) : char)];
                if (!parse || ((j = parse(d, string, j)) < 0)) {
                    return -1;
                }
            }
            else if (code != string.charCodeAt(j++)) {
                return -1;
            }
        }
        return j;
    }
    // ----------------------------- formats ----------------------------------
    function formatMicroseconds(date, fill) {
        return formatMilliseconds(date, fill) + '000';
    }
    function formatMilliseconds(date, fill) {
        return pad(date.getMilliseconds(), fill, 3);
    }
    function formatSeconds(date, fill) {
        return pad(date.getSeconds(), fill, 2);
    }
    function formatMinutes(date, fill) {
        return pad(date.getMinutes(), fill, 2);
    }
    function formatHour12(date, fill) {
        return pad(date.getHours() % 12 || 12, fill, 2);
    }
    function formatHour24(date, fill) {
        return pad(date.getHours(), fill, 2);
    }
    function formatPeriod(date) {
        return lPeriods[date.getHours() >= 12 ? 1 : 0];
    }
    function formatShortWeekday(date) {
        return lShortWeekdays[date.getDay()];
    }
    function formatWeekday(date) {
        return lWeekdays[date.getDay()];
    }
    function formatWeekdayNumberMonday(date) {
        var dayOfWeek = date.getDay();
        return dayOfWeek === 0 ? 7 : dayOfWeek;
    }
    function formatWeekNumberSunday(date, fill) {
        return pad(sunday.count(year.floor(date), date), fill, 2);
    }
    function formatWeekNumberISO(date, fill) {
        var day = date.getDay();
        date = (day >= 4 || day === 0) ? thursday.floor(date) : thursday.ceil(date);
        var yearStart = year.floor(date);
        return pad(thursday.count(yearStart, date) + (yearStart.getDay() === 4 ? 1 : 0), fill, 2);
    }
    function formatWeekdayNumberSunday(date) {
        return date.getDay();
    }
    function formatWeekNumberMonday(date, fill) {
        return pad(monday.count(year.floor(date), date), fill, 2);
    }
    function formatDayOfMonth(date, fill) {
        return pad(date.getDate(), fill, 2);
    }
    function formatDayOfYear(date, fill) {
        return pad(1 + day.count(year.floor(date), date), fill, 3);
    }
    function formatShortMonth(date) {
        return lShortMonths[date.getMonth()];
    }
    function formatMonth(date) {
        return lMonths[date.getMonth()];
    }
    function formatMonthNumber(date, fill) {
        return pad(date.getMonth() + 1, fill, 2);
    }
    function formatYear(date, fill) {
        return pad(date.getFullYear() % 100, fill, 2);
    }
    function formatFullYear(date, fill) {
        return pad(date.getFullYear() % 10000, fill, 4);
    }
    function formatZone(date) {
        var z = date.getTimezoneOffset();
        return (z > 0 ? '-' : (z *= -1, '+')) + pad(Math.floor(z / 60), '0', 2) + pad(z % 60, '0', 2);
    }
    // -------------------------- UTC formats -----------------------------------
    function formatUTCMicroseconds(date, fill) {
        return formatUTCMilliseconds(date, fill) + '000';
    }
    function formatUTCMilliseconds(date, fill) {
        return pad(date.getUTCMilliseconds(), fill, 3);
    }
    function formatUTCSeconds(date, fill) {
        return pad(date.getUTCSeconds(), fill, 2);
    }
    function formatUTCMinutes(date, fill) {
        return pad(date.getUTCMinutes(), fill, 2);
    }
    function formatUTCHour12(date, fill) {
        return pad(date.getUTCHours() % 12 || 12, fill, 2);
    }
    function formatUTCHour24(date, fill) {
        return pad(date.getUTCHours(), fill, 2);
    }
    function formatUTCPeriod(date) {
        return lPeriods[date.getUTCHours() >= 12 ? 1 : 0];
    }
    function formatUTCDayOfMonth(date, fill) {
        return pad(date.getUTCDate(), fill, 2);
    }
    function formatUTCDayOfYear(date, fill) {
        return pad(1 + utcDay.count(utcYear.floor(date), date), fill, 3);
    }
    function formatUTCMonthNumber(date, fill) {
        return pad(date.getUTCMonth() + 1, fill, 2);
    }
    function formatUTCShortMonth(date) {
        return lShortMonths[date.getUTCMonth()];
    }
    function formatUTCMonth(date) {
        return lMonths[date.getUTCMonth()];
    }
    function formatUTCShortWeekday(date) {
        return lShortWeekdays[date.getUTCDay()];
    }
    function formatUTCWeekday(date) {
        return lWeekdays[date.getUTCDay()];
    }
    function formatUTCWeekdayNumberMonday(date) {
        var dayOfWeek = date.getUTCDay();
        return dayOfWeek === 0 ? 7 : dayOfWeek;
    }
    function formatUTCWeekNumberSunday(date, fill) {
        return pad(utcSunday.count(utcYear.floor(date), date), fill, 2);
    }
    function formatUTCWeekNumberISO(date, fill) {
        var day = date.getUTCDay();
        date = (day >= 4 || day === 0) ? utcThursday.floor(date) : utcThursday.ceil(date);
        var yearStart = utcYear.floor(date);
        return pad(utcThursday.count(yearStart, date) + (yearStart.getUTCDay() === 4 ? 1 : 0), fill, 4);
    }
    function formatUTCWeekdayNumberSunday(date) {
        return date.getUTCDay();
    }
    function formatUTCWeekNumberMonday(date, fill) {
        return pad(utcMonday.count(utcYear.floor(date), date), fill, 2);
    }
    function formatUTCYear(date, fill) {
        return pad(date.getUTCFullYear() % 100, fill, 2);
    }
    function formatUTCFullYear(date, fill) {
        return pad(date.getUTCFullYear() % 10000, fill, 4);
    }
    function formatUTCZone() {
        return '+0000';
    }
    function formatLiteralPercent(date) {
        return '%';
    }
    function formatUnixTimestamp(date) {
        return date.getTime();
    }
    function formatUnixTimestampSeconds(date) {
        return Math.floor(date.getTime() / 1000);
    }
    // ------------------------------- parsers ------------------------------------
    function parseMicroseconds(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 6));
        return n ? (d.L = Math.floor(parseFloat(n[0]) / 1000), i + n[0].length) : -1;
    }
    function parseMilliseconds(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 3));
        return n ? (d.L = +n[0], i + n[0].length) : -1;
    }
    function parseSeconds(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.S = +n[0], i + n[0].length) : -1;
    }
    function parseMinutes(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.M = +n[0], i + n[0].length) : -1;
    }
    function parseHour24(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.H = +n[0], i + n[0].length) : -1;
    }
    function parsePeriod(d, string, i) {
        var n = periodRe.exec(string.slice(i));
        return n ? (d.p = periodLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }
    function parseDayOfMonth(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.d = +n[0], i + n[0].length) : -1;
    }
    function parseDayOfYear(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 3));
        return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
    }
    function parseShortWeekday(d, string, i) {
        var n = shortWeekdayRe.exec(string.slice(i));
        return n ? (d.w = shortWeekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }
    function parseWeekday(d, string, i) {
        var n = weekdayRe.exec(string.slice(i));
        return n ? (d.w = weekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }
    function parseWeekdayNumberMonday(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 1));
        return n ? (d.u = +n[0], i + n[0].length) : -1;
    }
    function parseWeekNumberSunday(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.U = +n[0], i + n[0].length) : -1;
    }
    function parseWeekNumberISO(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.V = +n[0], i + n[0].length) : -1;
    }
    function parseWeekNumberMonday(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.W = +n[0], i + n[0].length) : -1;
    }
    function parseWeekdayNumberSunday(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 1));
        return n ? (d.w = +n[0], i + n[0].length) : -1;
    }
    function parseShortMonth(d, string, i) {
        var n = shortMonthRe.exec(string.slice(i));
        return n ? (d.m = shortMonthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }
    function parseMonth(d, string, i) {
        var n = monthRe.exec(string.slice(i));
        return n ? (d.m = monthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }
    function parseMonthNumber(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.m = parseFloat(n[0]) - 1, i + n[0].length) : -1;
    }
    function parseLocaleDateTime(d, string, i) {
        return parseSpecifier(d, lDateTime, string, i);
    }
    function parseLocaleDate(d, string, i) {
        return parseSpecifier(d, lDate, string, i);
    }
    function parseLocaleTime(d, string, i) {
        return parseSpecifier(d, lTime, string, i);
    }
    function parseUnixTimestamp(d, string, i) {
        var n = numberRe.exec(string.slice(i));
        return n ? (d.Q = +n[0], i + n[0].length) : -1;
    }
    function parseUnixTimestampSeconds(d, string, i) {
        var n = numberRe.exec(string.slice(i));
        return n ? (d.Q = (+n[0]) * 1000, i + n[0].length) : -1;
    }
    function parseYear(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
    }
    function parseFullYear(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 4));
        return n ? (d.y = +n[0], i + n[0].length) : -1;
    }
    function parseZone(d, string, i) {
        var n = /^(Z)|^([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
        return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || '00')), i + n[0].length) : -1;
    }
    function parseLiteralPercent(d, string, i) {
        var n = percentRe.exec(string.slice(i, i + 1));
        return n ? i + n[0].length : -1;
    }
    return {
        format: function (specifier) {
            var f = newFormat(specifier, formats);
            f.toString = function () { return specifier; };
            return f;
        },
        parse: function (specifier) {
            var p = newParse(specifier, localDate);
            p.toString = function () { return specifier; };
            return p;
        },
        utcFormat: function (specifier) {
            var f = newFormat(specifier, utcFormats);
            f.toString = function () { return specifier; };
            return f;
        },
        utcParse: function (specifier) {
            var p = newParse(specifier, utcDate);
            p.toString = function () { return specifier; };
            return p;
        }
    };
}

var locale;
setDefaultLocale({
    dateTime: '%x, %X',
    date: '%-m/%-d/%Y',
    time: '%-I:%M:%S %p',
    periods: ['AM', 'PM'],
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
});
function setDefaultLocale(definition) {
    return locale = formatLocale(definition);
}

var __extends$h = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __read = (undefined && undefined.__read) || function (o, n) {
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
var TimeScale = /** @class */ (function (_super) {
    __extends$h(TimeScale, _super);
    function TimeScale() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'time';
        _this.year = year;
        _this.month = month;
        _this.week = sunday;
        _this.day = day;
        _this.hour = hour;
        _this.minute = minute;
        _this.second = second;
        _this.millisecond = millisecond;
        _this.format = locale.format;
        /**
         * Array of default tick intervals in the following format:
         *
         *     [
         *         interval (unit of time),
         *         number of units (step),
         *         the length of that number of units in milliseconds
         *     ]
         */
        _this.tickIntervals = [
            [_this.second, 1, durationSecond],
            [_this.second, 5, 5 * durationSecond],
            [_this.second, 15, 15 * durationSecond],
            [_this.second, 30, 30 * durationSecond],
            [_this.minute, 1, durationMinute],
            [_this.minute, 5, 5 * durationMinute],
            [_this.minute, 15, 15 * durationMinute],
            [_this.minute, 30, 30 * durationMinute],
            [_this.hour, 1, durationHour],
            [_this.hour, 3, 3 * durationHour],
            [_this.hour, 6, 6 * durationHour],
            [_this.hour, 12, 12 * durationHour],
            [_this.day, 1, durationDay],
            [_this.day, 2, 2 * durationDay],
            [_this.week, 1, durationWeek],
            [_this.month, 1, durationMonth],
            [_this.month, 3, 3 * durationMonth],
            [_this.year, 1, durationYear]
        ];
        _this.formatMillisecond = _this.format('.%L');
        _this.formatSecond = _this.format(':%S');
        _this.formatMinute = _this.format('%I:%M');
        _this.formatHour = _this.format('%I %p');
        _this.formatDay = _this.format('%a %d');
        _this.formatWeek = _this.format('%b %d');
        _this.formatMonth = _this.format('%B');
        _this.formatYear = _this.format('%Y');
        _this._domain = [new Date(2000, 0, 1), new Date(2000, 0, 2)];
        return _this;
    }
    TimeScale.prototype.defaultTickFormat = function (date) {
        return (this.second.floor(date) < date
            ? this.formatMillisecond
            : this.minute.floor(date) < date
                ? this.formatSecond
                : this.hour.floor(date) < date
                    ? this.formatMinute
                    : this.day.floor(date) < date
                        ? this.formatHour
                        : this.month.floor(date) < date
                            ? (this.week.floor(date) < date ? this.formatDay : this.formatWeek)
                            : this.year.floor(date) < date
                                ? this.formatMonth
                                : this.formatYear)(date);
    };
    /**
     *
     * @param interval If the `interval` is a number, it's interpreted as the desired tick count
     * and the method tries to pick an appropriate interval automatically, based on the extent of the domain.
     * If the `interval` is `undefined`, it defaults to `10`.
     * If the `interval` is a time interval, simply use it.
     * @param start The start time (timestamp).
     * @param stop The end time (timestamp).
     * @param step Number of intervals between ticks.
     */
    TimeScale.prototype.tickInterval = function (interval, start, stop, step) {
        var _a;
        if (typeof interval === 'number') {
            var tickCount = interval;
            var tickIntervals = this.tickIntervals;
            var target = Math.abs(stop - start) / tickCount;
            var i = complexBisectRight(tickIntervals, target, function (interval) { return interval[2]; });
            if (i === tickIntervals.length) {
                step = tickStep(start / durationYear, stop / durationYear, tickCount);
                interval = this.year;
            }
            else if (i) {
                _a = __read(tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i], 2), interval = _a[0], step = _a[1];
            }
            else {
                step = Math.max(tickStep(start, stop, interval), 1);
                interval = this.millisecond;
            }
        }
        return step == undefined ? interval : interval.every(step);
    };
    Object.defineProperty(TimeScale.prototype, "domain", {
        get: function () {
            return _super.prototype.getDomain.call(this).map(function (t) { return new Date(t); });
        },
        set: function (values) {
            _super.prototype.setDomain.call(this, Array.prototype.map.call(values, function (t) { return t instanceof Date ? +t : +new Date(+t); }));
        },
        enumerable: true,
        configurable: true
    });
    TimeScale.prototype.invert = function (y) {
        return new Date(_super.prototype.invert.call(this, y));
    };
    /**
     * Returns uniformly-spaced dates that represent the scale's domain.
     * @param interval The desired tick count or a time interval object.
     */
    TimeScale.prototype.ticks = function (interval) {
        if (interval === void 0) { interval = 10; }
        var d = _super.prototype.getDomain.call(this);
        var t0 = d[0];
        var t1 = d[d.length - 1];
        var reverse = t1 < t0;
        if (reverse) {
            var _ = t0;
            t0 = t1;
            t1 = _;
        }
        var t = this.tickInterval(interval, t0, t1);
        var i = t ? t.range(t0, t1 + 1) : []; // inclusive stop
        return reverse ? i.reverse() : i;
    };
    /**
     * Returns a time format function suitable for displaying tick values.
     * @param count Ignored. Used only to satisfy the {@link Scale} interface.
     * @param specifier If the specifier string is provided, this method is equivalent to
     * the {@link TimeLocaleObject.format} method.
     * If no specifier is provided, this method returns the default time format function.
     */
    TimeScale.prototype.tickFormat = function (_count, specifier) {
        return specifier == undefined ? this.defaultTickFormat.bind(this) : this.format(specifier);
    };
    /**
     * Extends the domain so that it starts and ends on nice round values.
     * This method typically modifies the scale’s domain, and may only extend the bounds to the nearest round value.
     * @param interval
     */
    TimeScale.prototype.nice = function (interval) {
        if (interval === void 0) { interval = 10; }
        var d = _super.prototype.getDomain.call(this);
        var i = this.tickInterval(interval, d[0], d[d.length - 1]);
        if (i) {
            this.domain = this._nice(d, i);
        }
    };
    TimeScale.prototype._nice = function (domain, interval) {
        var _a, _b;
        domain = domain.slice();
        var i0 = 0;
        var i1 = domain.length - 1;
        var x0 = domain[i0];
        var x1 = domain[i1];
        if (x1 < x0) {
            _a = __read([i1, i0], 2), i0 = _a[0], i1 = _a[1];
            _b = __read([x1, x0], 2), x0 = _b[0], x1 = _b[1];
        }
        domain[i0] = interval.floor(x0);
        domain[i1] = interval.ceil(x1);
        return domain;
    };
    return TimeScale;
}(ContinuousScale));

(undefined && undefined.__values) || function(o) {
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
function identity(value) {
    return value;
}
function extent(values, predicate, map) {
    var transform = map || identity;
    var n = values.length;
    var i = -1;
    var value;
    var min;
    var max;
    while (++i < n) { // Find the first value.
        value = values[i];
        if (predicate(value)) {
            min = max = value;
            while (++i < n) { // Compare the remaining values.
                value = values[i];
                if (predicate(value)) {
                    if (min > value) {
                        min = value;
                    }
                    if (max < value) {
                        max = value;
                    }
                }
            }
        }
    }
    return min === undefined || max === undefined ? undefined : [transform(min), transform(max)];
}

var __extends$g = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (undefined && undefined.__values) || function(o) {
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
var SparklineAxis = /** @class */ (function (_super) {
    __extends$g(SparklineAxis, _super);
    function SparklineAxis() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'category';
        _this.stroke = 'rgb(204, 214, 235)';
        _this.strokeWidth = 1;
        return _this;
    }
    return SparklineAxis;
}(Observable));
var Sparkline = /** @class */ (function (_super) {
    __extends$g(Sparkline, _super);
    function Sparkline() {
        var _this = _super.call(this) || this;
        _this.id = createId(_this);
        _this.seriesRect = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };
        _this._context = undefined;
        _this._container = undefined;
        _this._data = undefined;
        _this.padding = new Padding(3);
        _this.xKey = 'x';
        _this.yKey = 'y';
        _this.dataType = undefined;
        _this.xData = [];
        _this.yData = [];
        // Minimum y value in provided data.
        _this.min = undefined;
        // Maximum y value in provided data.
        _this.max = undefined;
        _this.yScale = new LinearScale();
        _this.axis = new SparklineAxis();
        _this.highlightStyle = {
            size: 6,
            fill: 'yellow',
            stroke: 'silver',
            strokeWidth: 1,
        };
        _this._width = 100;
        _this._height = 100;
        _this.smallestInterval = undefined;
        _this.layoutId = 0;
        _this.defaultDateFormatter = locale.format('%m/%d/%y, %H:%M:%S');
        _this._onMouseMove = _this.onMouseMove.bind(_this);
        _this._onMouseOut = _this.onMouseOut.bind(_this);
        var root = new Group();
        _this.rootGroup = root;
        var element = document.createElement('div');
        element.setAttribute('class', 'ag-sparkline-wrapper');
        var scene = new Scene(document);
        _this.scene = scene;
        _this.canvasElement = scene.canvas.element;
        scene.root = root;
        scene.container = element;
        scene.resize(_this.width, _this.height);
        _this.seriesRect.width = _this.width;
        _this.seriesRect.height = _this.height;
        // one style element for tooltip styles per document
        if (Sparkline.tooltipDocuments.indexOf(document) === -1) {
            var styleElement = document.createElement('style');
            styleElement.innerHTML = defaultTooltipCss;
            document.head.insertBefore(styleElement, document.head.querySelector('style'));
            Sparkline.tooltipDocuments.push(document);
        }
        _this.setupDomEventListeners(_this.scene.canvas.element);
        return _this;
    }
    Object.defineProperty(Sparkline.prototype, "context", {
        get: function () {
            return this._context;
        },
        set: function (value) {
            if (this._context !== value) {
                this._context = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sparkline.prototype, "container", {
        get: function () {
            return this._container;
        },
        set: function (value) {
            if (this._container !== value) {
                var parentNode = this.canvasElement.parentNode;
                if (parentNode != null) {
                    parentNode.removeChild(this.canvasElement);
                }
                if (value) {
                    value.appendChild(this.canvasElement);
                }
                this._container = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sparkline.prototype, "data", {
        get: function () {
            return this._data;
        },
        set: function (value) {
            if (this._data !== value) {
                this._data = value;
                this.processData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sparkline.prototype, "width", {
        get: function () {
            return this._width;
        },
        set: function (value) {
            if (this._width !== value) {
                this._width = value;
                this.scene.resize(value, this.height);
                this.scheduleLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sparkline.prototype, "height", {
        get: function () {
            return this._height;
        },
        set: function (value) {
            if (this._height !== value) {
                this._height = value;
                this.scene.resize(this.width, value);
                this.scheduleLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Generate node data from processed data.
     * Produce data joins.
     * Update selection's nodes using node data.
     */
    Sparkline.prototype.update = function () { };
    // Update y scale based on processed data.
    Sparkline.prototype.updateYScale = function () {
        this.updateYScaleRange();
        this.updateYScaleDomain();
    };
    // Update y scale domain based on processed data.
    Sparkline.prototype.updateYScaleDomain = function () { };
    // Update y scale range based on height and padding (seriesRect).
    Sparkline.prototype.updateYScaleRange = function () {
        var _a = this, yScale = _a.yScale, seriesRect = _a.seriesRect;
        yScale.range = [seriesRect.height, 0];
    };
    // Update x scale based on processed data.
    Sparkline.prototype.updateXScale = function () {
        var type = this.axis.type;
        this.xScale = this.getXScale(type);
        this.updateXScaleRange();
        this.updateXScaleDomain();
    };
    // Update x scale range based on width and padding (seriesRect).
    Sparkline.prototype.updateXScaleRange = function () {
        this.xScale.range = [0, this.seriesRect.width];
    };
    // Update x scale domain based on processed data and type of scale.
    Sparkline.prototype.updateXScaleDomain = function () {
        var _a = this, xData = _a.xData, xScale = _a.xScale;
        var xMinMax;
        if (xScale instanceof LinearScale) {
            xMinMax = extent(xData, isNumber);
        }
        else if (xScale instanceof TimeScale) {
            xMinMax = extent(xData, isContinuous);
        }
        this.xScale.domain = xMinMax ? xMinMax.slice() : xData;
    };
    /**
     * Return xScale instance based on the provided type or return a `BandScale` by default.
     * The default type is `category`.
     * @param type
     */
    Sparkline.prototype.getXScale = function (type) {
        if (type === void 0) { type = 'category'; }
        switch (type) {
            case 'number':
                return new LinearScale();
            case 'time':
                return new TimeScale();
            case 'category':
            default:
                return new BandScale();
        }
    };
    // Update axis line.
    Sparkline.prototype.updateAxisLine = function () { };
    // Update X and Y scales and the axis line.
    Sparkline.prototype.updateAxes = function () {
        this.updateYScale();
        this.updateXScale();
        this.updateAxisLine();
    };
    // Update horizontal and vertical crosshair lines.
    Sparkline.prototype.updateCrosshairs = function () {
        this.updateXCrosshairLine();
        this.updateYCrosshairLine();
    };
    // Using processed data, generate data that backs visible nodes.
    Sparkline.prototype.generateNodeData = function () {
        return [];
    };
    // Returns persisted node data associated with the sparkline's data.
    Sparkline.prototype.getNodeData = function () {
        return [];
    };
    // Update the selection's nodes.
    Sparkline.prototype.updateNodes = function () { };
    // Update the vertical crosshair line.
    Sparkline.prototype.updateXCrosshairLine = function () { };
    // Update the horizontal crosshair line.
    Sparkline.prototype.updateYCrosshairLine = function () { };
    Sparkline.prototype.highlightDatum = function (closestDatum) {
        this.updateNodes();
    };
    Sparkline.prototype.dehighlightDatum = function () {
        this.highlightedDatum = undefined;
        this.updateNodes();
        this.updateCrosshairs();
    };
    /**
     * Highlight closest datum and display tooltip if enabled.
     * Only update if necessary, i.e. only update if the highlighted datum is different from previously highlighted datum,
     * or if there is no previously highlighted datum.
     * @param event
     */
    Sparkline.prototype.onMouseMove = function (event) {
        var closestDatum = this.pickClosestSeriesNodeDatum(event.offsetX, event.offsetY);
        if (!closestDatum) {
            return;
        }
        var oldHighlightedDatum = this.highlightedDatum;
        this.highlightedDatum = closestDatum;
        if ((this.highlightedDatum && !oldHighlightedDatum) ||
            (this.highlightedDatum && oldHighlightedDatum && this.highlightedDatum !== oldHighlightedDatum)) {
            this.highlightDatum(closestDatum);
            this.updateCrosshairs();
        }
        if (this.tooltip.enabled) {
            this.handleTooltip(event, closestDatum);
        }
    };
    /**
     * Dehighlight all nodes and remove tooltip.
     * @param event
     */
    Sparkline.prototype.onMouseOut = function (event) {
        this.dehighlightDatum();
        this.tooltip.toggle(false);
    };
    // Fetch required values from the data object and process them.
    Sparkline.prototype.processData = function () {
        var _this = this;
        var _a = this, data = _a.data, yData = _a.yData, xData = _a.xData;
        if (!data || this.invalidData(this.data)) {
            return;
        }
        yData.length = 0;
        xData.length = 0;
        var n = data.length;
        var dataType = this.getDataType(data);
        this.dataType = dataType;
        var xValueType = this.axis.type;
        var xType = xValueType !== 'number' && xValueType !== 'time' ? 'category' : xValueType;
        var isContinuousX = xType === 'number' || xType === 'time';
        var setSmallestXInterval = function (curr, prev) {
            if (_this.smallestInterval == undefined) {
                _this.smallestInterval = { x: Infinity, y: Infinity };
            }
            var x = _this.smallestInterval.x;
            var interval = Math.abs(curr - prev);
            if (interval > 0 && interval < x) {
                _this.smallestInterval.x = interval;
            }
        };
        var prevX;
        if (dataType === 'number') {
            for (var i = 0; i < n; i++) {
                var xDatum = i;
                var yDatum = data[i];
                var x = this.getDatum(xDatum, xType);
                var y = this.getDatum(yDatum, 'number');
                if (isContinuousX) {
                    setSmallestXInterval(x, prevX);
                }
                xData.push(x);
                yData.push(y);
                prevX = x;
            }
        }
        else if (dataType === 'array') {
            for (var i = 0; i < n; i++) {
                var datum = data[i];
                if (Array.isArray(datum)) {
                    var xDatum = datum[0];
                    var yDatum = datum[1];
                    var x = this.getDatum(xDatum, xType);
                    var y = this.getDatum(yDatum, 'number');
                    if (x == undefined) {
                        continue;
                    }
                    if (isContinuousX) {
                        setSmallestXInterval(x, prevX);
                    }
                    xData.push(x);
                    yData.push(y);
                    prevX = x;
                }
            }
        }
        else if (dataType === 'object') {
            var _b = this, yKey = _b.yKey, xKey = _b.xKey;
            for (var i = 0; i < n; i++) {
                var datum = data[i];
                if (typeof datum === 'object' && !Array.isArray(datum)) {
                    var xDatum = datum[xKey];
                    var yDatum = datum[yKey];
                    var x = this.getDatum(xDatum, xType);
                    var y = this.getDatum(yDatum, 'number');
                    if (x == undefined) {
                        continue;
                    }
                    if (isContinuousX) {
                        setSmallestXInterval(x, prevX);
                    }
                    xData.push(x);
                    yData.push(y);
                    prevX = x;
                }
            }
        }
        // update axes
        this.updateAxes();
        // produce data joins and update selection's nodes
        this.update();
    };
    /**
     * Return the type of data provided to the sparkline based on the first truthy value in the data array.
     * If the value is not a number, array or object, return `undefined`.
     * @param data
     */
    Sparkline.prototype.getDataType = function (data) {
        var e_1, _a;
        try {
            for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
                var datum = data_1_1.value;
                if (datum != undefined) {
                    if (isNumber(datum)) {
                        return 'number';
                    }
                    else if (Array.isArray(datum)) {
                        return 'array';
                    }
                    else if (typeof datum === 'object') {
                        return 'object';
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    /**
     * Return the given value depending on the type of axis.
     * Return `undefined` if the value is invalid for the given axis type.
     * @param value
     */
    Sparkline.prototype.getDatum = function (value, type) {
        if ((type === 'number' && isNumber(value)) || (type === 'time' && (isNumber(value) || isDate(value)))) {
            return value;
        }
        else if (type === 'category') {
            if (isString(value) || isDate(value) || isNumber(value)) {
                return { toString: function () { return String(value); } };
            }
            else if (isStringObject(value)) {
                return value;
            }
        }
    };
    Object.defineProperty(Sparkline.prototype, "layoutScheduled", {
        /**
         * Only `true` while we are waiting for the layout to start.
         * This will be `false` if the layout has already started and is ongoing.
         */
        get: function () {
            return !!this.layoutId;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Execute update method on the next available screen repaint to make changes to the canvas.
     * If we are waiting for a layout to start and a new layout is requested,
     * cancel the previous layout using the non 0 integer (this.layoutId) returned from requestAnimationFrame.
     */
    Sparkline.prototype.scheduleLayout = function () {
        var _this = this;
        if (this.layoutId) {
            cancelAnimationFrame(this.layoutId);
        }
        this.layoutId = requestAnimationFrame(function () {
            _this.setSparklineDimensions();
            if (_this.invalidData(_this.data)) {
                return;
            }
            // update axes ranges
            _this.updateXScaleRange();
            _this.updateYScaleRange();
            // update axis line
            _this.updateAxisLine();
            // produce data joins and update selection's nodes
            _this.update();
            _this.layoutId = 0;
        });
    };
    Sparkline.prototype.setSparklineDimensions = function () {
        var _a = this, width = _a.width, height = _a.height, padding = _a.padding, seriesRect = _a.seriesRect, rootGroup = _a.rootGroup;
        var shrunkWidth = width - padding.left - padding.right;
        var shrunkHeight = height - padding.top - padding.bottom;
        seriesRect.width = shrunkWidth;
        seriesRect.height = shrunkHeight;
        seriesRect.x = padding.left;
        seriesRect.y = padding.top;
        rootGroup.translationX = seriesRect.x;
        rootGroup.translationY = seriesRect.y;
    };
    /**
     * Return the closest data point to x/y canvas coordinates.
     * @param x
     * @param y
     */
    Sparkline.prototype.pickClosestSeriesNodeDatum = function (x, y) {
        var minDistance = Infinity;
        var closestDatum;
        var hitPoint = this.rootGroup.transformPoint(x, y);
        var nodeData = this.getNodeData();
        for (var i = 0; i < nodeData.length; i++) {
            var datum = nodeData[i];
            if (!datum.point) {
                return;
            }
            var distance = this.getDistance(hitPoint, datum.point);
            if (distance <= minDistance) {
                minDistance = distance;
                closestDatum = datum;
            }
        }
        return closestDatum;
    };
    /**
     * Return the relevant distance between two points.
     * The distance will be calculated based on the x value of the points for all sparklines except bar sparkline, where the distance is based on the y values.
     * @param x
     * @param y
     */
    Sparkline.prototype.getDistance = function (p1, p2) {
        return Math.abs(p1.x - p2.x);
    };
    /**
     * calculate x/y coordinates for tooltip based on coordinates of highlighted datum, position of canvas and page offset.
     * @param datum
     */
    Sparkline.prototype.handleTooltip = function (event, datum) {
        var seriesDatum = datum.seriesDatum;
        var canvasElement = this.canvasElement;
        var clientX = event.clientX, clientY = event.clientY;
        // confine tooltip to sparkline width if tooltip container not provided.
        if (this.tooltip.container == undefined) {
            this.tooltip.container = canvasElement;
        }
        var meta = {
            pageX: clientX,
            pageY: clientY,
        };
        var yValue = seriesDatum.y;
        var xValue = seriesDatum.x;
        // check if tooltip is enabled for this specific data point
        var enabled = this.tooltip.enabled;
        if (this.tooltip.renderer) {
            var tooltipRendererResult = this.tooltip.renderer({
                context: this.context,
                datum: seriesDatum,
                yValue: yValue,
                xValue: xValue,
            });
            enabled =
                typeof tooltipRendererResult !== 'string' && tooltipRendererResult.enabled !== undefined
                    ? tooltipRendererResult.enabled
                    : enabled;
        }
        var html = enabled && seriesDatum.y !== undefined && this.getTooltipHtml(datum);
        if (html) {
            this.tooltip.show(meta, html);
        }
    };
    Sparkline.prototype.formatNumericDatum = function (datum) {
        return String(Math.round(datum * 10) / 10);
    };
    Sparkline.prototype.formatDatum = function (datum) {
        var type = this.axis.type || 'category';
        if (type === 'number' && typeof datum === 'number') {
            return this.formatNumericDatum(datum);
        }
        else if (type === 'time' && (datum instanceof Date || isNumber(datum))) {
            return this.defaultDateFormatter(datum);
        }
        else {
            return String(datum);
        }
    };
    Sparkline.prototype.setupDomEventListeners = function (chartElement) {
        chartElement.addEventListener('mousemove', this._onMouseMove);
        chartElement.addEventListener('mouseout', this._onMouseOut);
    };
    Sparkline.prototype.cleanupDomEventListeners = function (chartElement) {
        chartElement.removeEventListener('mousemove', this._onMouseMove);
        chartElement.removeEventListener('mouseout', this._onMouseOut);
    };
    Sparkline.prototype.invalidData = function (data) {
        return !data || !Array.isArray(data) || data.length === 0;
    };
    /**
     * Cleanup and remove canvas element from the DOM.
     */
    Sparkline.prototype.destroy = function () {
        this.scene.container = undefined;
        // remove canvas element from the DOM
        this.container = undefined;
        this.cleanupDomEventListeners(this.scene.canvas.element);
    };
    Sparkline.tooltipDocuments = [];
    return Sparkline;
}(Observable));

var __extends$f = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
function toTooltipHtml(input, defaults) {
    if (typeof input === 'string') {
        return input;
    }
    defaults = defaults || {};
    var _a = input.content, content = _a === void 0 ? defaults.content || '' : _a, _b = input.title, title = _b === void 0 ? defaults.title || undefined : _b, _c = input.color, color = _c === void 0 ? defaults.color : _c, _d = input.backgroundColor, backgroundColor = _d === void 0 ? defaults.backgroundColor : _d, _e = input.opacity, opacity = _e === void 0 ? defaults.opacity || 1 : _e;
    var titleHtml;
    var contentHtml;
    if (color) {
        titleHtml = title
            ? "<span class=\"" + SparklineTooltip.class + "-title\"; style=\"color: " + color + "\">" + title + "</span>"
            : '';
        contentHtml = "<span class=\"" + SparklineTooltip.class + "-content\" style=\"color: " + color + "\">" + content + "</span>";
    }
    else {
        titleHtml = title ? "<span class=\"" + SparklineTooltip.class + "-title\">" + title + "</span>" : '';
        contentHtml = "<span class=\"" + SparklineTooltip.class + "-content\">" + content + "</span>";
    }
    if (backgroundColor) {
        var bgColor = Color.fromString(backgroundColor.toLowerCase());
        var r = bgColor.r, g = bgColor.g, b = bgColor.b; bgColor.a;
        // TODO: combine a and opacity for alpha?
        var alpha = opacity;
        var bgColorWithAlpha = Color.fromArray([r, g, b, alpha]);
        var bgColorRgbaString = bgColorWithAlpha.toRgbaString();
        return "<div class=\"" + SparklineTooltip.class + "\" style=\"background-color: " + bgColorRgbaString + "\">\n                    " + titleHtml + "\n                    " + contentHtml + "\n                </div>";
    }
    else {
        return "<div class=\"" + SparklineTooltip.class + "\">\n                    " + titleHtml + "\n                    " + contentHtml + "\n                </div>";
    }
}
var SparklineTooltip = /** @class */ (function (_super) {
    __extends$f(SparklineTooltip, _super);
    function SparklineTooltip() {
        var _this = _super.call(this) || this;
        _this.element = document.createElement('div');
        _this.enabled = true;
        _this.container = undefined;
        _this.xOffset = 10;
        _this.yOffset = 0;
        _this.renderer = undefined;
        var tooltipRoot = document.body;
        tooltipRoot.appendChild(_this.element);
        return _this;
    }
    SparklineTooltip.prototype.isVisible = function () {
        var element = this.element;
        if (element.classList) {
            return !element.classList.contains(SparklineTooltip.class + "-wrapper-hidden");
        }
        // IE11
        var classes = element.getAttribute('class');
        if (classes) {
            return classes.split(' ').indexOf(SparklineTooltip.class + "-wrapper-hidden") < 0;
        }
        return false;
    };
    SparklineTooltip.prototype.updateClass = function (visible) {
        var classList = [SparklineTooltip.class + "-wrapper"];
        if (visible !== true) {
            classList.push(SparklineTooltip.class + "-wrapper-hidden");
        }
        this.element.setAttribute('class', classList.join(' '));
    };
    SparklineTooltip.prototype.show = function (meta, html) {
        this.toggle(false);
        var element = this.element;
        if (html !== undefined) {
            element.innerHTML = html;
        }
        else if (!element.innerHTML) {
            return;
        }
        var left = meta.pageX + this.xOffset;
        var top = meta.pageY + this.yOffset;
        var tooltipRect = element.getBoundingClientRect();
        var maxLeft = window.innerWidth - tooltipRect.width;
        if (this.container) {
            var containerRect = this.container.getBoundingClientRect();
            maxLeft = containerRect.left + (containerRect.width - tooltipRect.width);
        }
        if (left > maxLeft) {
            left = meta.pageX - element.clientWidth - this.xOffset;
        }
        element.style.left = Math.round(left) + "px";
        element.style.top = Math.round(top) + "px";
        this.toggle(true);
    };
    SparklineTooltip.prototype.toggle = function (visible) {
        this.updateClass(visible);
    };
    SparklineTooltip.prototype.destroy = function () {
        var parentNode = this.element.parentNode;
        if (parentNode) {
            parentNode.removeChild(this.element);
        }
    };
    SparklineTooltip.class = 'ag-sparkline-tooltip';
    return SparklineTooltip;
}(Observable));

var __extends$e = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Marker = /** @class */ (function (_super) {
    __extends$e(Marker, _super);
    function Marker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._x = 0;
        _this._y = 0;
        _this._size = 3;
        return _this;
    }
    Object.defineProperty(Marker.prototype, "x", {
        get: function () {
            return this._x;
        },
        set: function (value) {
            if (this._x !== value) {
                this._x = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marker.prototype, "y", {
        get: function () {
            return this._y;
        },
        set: function (value) {
            if (this._y !== value) {
                this._y = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marker.prototype, "size", {
        get: function () {
            return this._size;
        },
        set: function (value) {
            if (this._size !== value) {
                this._size = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    return Marker;
}(Shape));

var __extends$d = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Circle = /** @class */ (function (_super) {
    __extends$d(Circle, _super);
    function Circle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Circle.prototype.isPointInPath = function (x, y) {
        return false;
    };
    Circle.prototype.isPointInStroke = function (x, y) {
        return false;
    };
    Circle.prototype.render = function (ctx) {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        var _a = this, x = _a.x, y = _a.y, size = _a.size;
        var radius = size / 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.fillStroke(ctx);
        this.dirty = false;
    };
    Circle.className = 'Circle';
    return Circle;
}(Marker));

var __extends$c = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Diamond = /** @class */ (function (_super) {
    __extends$c(Diamond, _super);
    function Diamond() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Diamond.prototype.isPointInStroke = function (x, y) {
        return false;
    };
    Diamond.prototype.isPointInPath = function (x, y) {
        return false;
    };
    Diamond.prototype.render = function (ctx) {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        var _a = this, x = _a.x, y = _a.y, size = _a.size;
        var hs = size / 2;
        ctx.beginPath();
        ctx.moveTo(x, (y -= hs));
        ctx.lineTo((x += hs), (y += hs));
        ctx.lineTo((x -= hs), (y += hs));
        ctx.lineTo((x -= hs), (y -= hs));
        ctx.lineTo((x + hs), (y - hs));
        ctx.closePath();
        this.fillStroke(ctx);
        this.dirty = false;
    };
    Diamond.className = 'Diamond';
    return Diamond;
}(Marker));

var __extends$b = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Square = /** @class */ (function (_super) {
    __extends$b(Square, _super);
    function Square() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Square.prototype.isPointInStroke = function (x, y) {
        return false;
    };
    Square.prototype.isPointInPath = function (x, y) {
        return false;
    };
    Square.prototype.render = function (ctx) {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        var _a = this, x = _a.x, y = _a.y, size = _a.size;
        var hs = size / 2;
        ctx.beginPath();
        ctx.moveTo((x -= hs), (y -= hs));
        ctx.lineTo((x += size), y);
        ctx.lineTo(x, (y += size));
        ctx.lineTo((x -= size), y);
        ctx.lineTo(x, (y -= size));
        ctx.closePath();
        this.fillStroke(ctx);
        this.dirty = false;
    };
    Square.className = 'Square';
    return Square;
}(Marker));

function getMarker(shape) {
    switch (shape) {
        case 'circle':
            return Circle;
        case 'square':
            return Square;
        case 'diamond':
            return Diamond;
        default:
            return Circle;
    }
}

function getLineDash(lineCap, lineDash) {
    if (lineDash === void 0) { lineDash = 'solid'; }
    var buttOrNull = {
        solid: [],
        dash: [4, 3],
        dot: [1, 3],
        dashDot: [4, 3, 1, 3],
        dashDotDot: [4, 3, 1, 3, 1, 3],
        shortDot: [1, 1],
        shortDash: [3, 1],
        shortDashDot: [3, 1, 1, 1],
        shortDashDotDot: [3, 1, 1, 1, 1, 1],
        longDash: [8, 3],
        longDashDot: [8, 3, 1, 3],
        longDashDotDot: [8, 3, 1, 3, 1, 3]
    };
    var roundOrSquare = {
        solid: [],
        dash: [3, 3],
        dot: [0, 3],
        dashDot: [3, 3, 0, 3],
        dashDotDot: [3, 3, 0, 3, 0, 3],
        shortDot: [0, 2],
        shortDash: [2, 2],
        shortDashDot: [2, 2, 0, 2],
        shortDashDotDot: [2, 2, 0, 2, 0, 2],
        longDash: [7, 3],
        longDashDot: [7, 3, 0, 3],
        longDashDotDot: [7, 3, 0, 3, 0, 3]
    };
    if (lineCap === 'round' || lineCap === 'square') {
        if (roundOrSquare[lineDash] == undefined) {
            console.warn("'" + lineDash + "' is not a valid 'lineDash' option.");
            return roundOrSquare.solid;
        }
        return roundOrSquare[lineDash];
    }
    if (buttOrNull[lineDash] == undefined) {
        console.warn("'" + lineDash + "' is not a valid 'lineDash' option.");
        return buttOrNull.solid;
    }
    return buttOrNull[lineDash];
}

var __extends$a = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var SparklineMarker$1 = /** @class */ (function () {
    function SparklineMarker() {
        this.enabled = true;
        this.shape = 'circle';
        this.size = 0;
        this.fill = 'rgb(124, 181, 236)';
        this.stroke = 'rgb(124, 181, 236)';
        this.strokeWidth = 1;
        this.formatter = undefined;
    }
    return SparklineMarker;
}());
var SparklineLine$1 = /** @class */ (function () {
    function SparklineLine() {
        this.stroke = 'rgb(124, 181, 236)';
        this.strokeWidth = 1;
    }
    return SparklineLine;
}());
var SparklineCrosshairs$1 = /** @class */ (function () {
    function SparklineCrosshairs() {
        this.xLine = {
            enabled: true,
            stroke: 'rgba(0,0,0, 0.54)',
            strokeWidth: 1,
            lineDash: 'solid',
            lineCap: undefined,
        };
        this.yLine = {
            enabled: false,
            stroke: 'rgba(0,0,0, 0.54)',
            strokeWidth: 1,
            lineDash: 'solid',
            lineCap: undefined,
        };
    }
    return SparklineCrosshairs;
}());
var AreaSparkline = /** @class */ (function (_super) {
    __extends$a(AreaSparkline, _super);
    function AreaSparkline() {
        var _this = _super.call(this) || this;
        _this.fill = 'rgba(124, 181, 236, 0.25)';
        _this.strokePath = new Path();
        _this.fillPath = new Path();
        _this.xCrosshairLine = new Line();
        _this.yCrosshairLine = new Line();
        _this.areaSparklineGroup = new Group();
        _this.fillPathData = [];
        _this.strokePathData = [];
        _this.xAxisLine = new Line();
        _this.markers = new Group();
        _this.markerSelection = Selection.select(_this.markers).selectAll();
        _this.markerSelectionData = [];
        _this.marker = new SparklineMarker$1();
        _this.line = new SparklineLine$1();
        _this.crosshairs = new SparklineCrosshairs$1();
        _this.rootGroup.append(_this.areaSparklineGroup);
        _this.areaSparklineGroup.append([
            _this.fillPath,
            _this.xAxisLine,
            _this.strokePath,
            _this.xCrosshairLine,
            _this.yCrosshairLine,
            _this.markers,
        ]);
        return _this;
    }
    AreaSparkline.prototype.getNodeData = function () {
        return this.markerSelectionData;
    };
    /**
     * If marker shape is changed, this method should be called to remove the previous marker nodes selection.
     */
    AreaSparkline.prototype.onMarkerShapeChange = function () {
        this.markerSelection = this.markerSelection.setData([]);
        this.markerSelection.exit.remove();
        this.scheduleLayout();
    };
    AreaSparkline.prototype.update = function () {
        var data = this.generateNodeData();
        if (!data) {
            return;
        }
        var nodeData = data.nodeData, fillData = data.fillData, strokeData = data.strokeData;
        this.markerSelectionData = nodeData;
        this.fillPathData = fillData;
        this.strokePathData = strokeData;
        this.updateSelection(nodeData);
        this.updateNodes();
        this.updateStroke(strokeData);
        this.updateFill(fillData);
    };
    AreaSparkline.prototype.updateYScaleDomain = function () {
        var _a = this, yData = _a.yData, yScale = _a.yScale;
        var yMinMax = extent(yData, isNumber);
        var yMin = 0;
        var yMax = 1;
        if (yMinMax !== undefined) {
            yMin = this.min = yMinMax[0];
            yMax = this.max = yMinMax[1];
        }
        // if yMin is positive, set yMin to 0
        yMin = yMin < 0 ? yMin : 0;
        // if yMax is negative, set yMax to 0
        yMax = yMax < 0 ? 0 : yMax;
        yScale.domain = [yMin, yMax];
    };
    AreaSparkline.prototype.generateNodeData = function () {
        var _a = this, data = _a.data, yData = _a.yData, xData = _a.xData, xScale = _a.xScale, yScale = _a.yScale;
        if (!data) {
            return;
        }
        var offsetX = xScale instanceof BandScale ? xScale.bandwidth / 2 : 0;
        var n = yData.length;
        var nodeData = [];
        var fillData = [];
        var strokeData = [];
        var firstValidX;
        var lastValidX;
        var previousX;
        var nextX;
        var yZero = yScale.convert(0);
        for (var i = 0; i < n; i++) {
            var yDatum = yData[i];
            var xDatum = xData[i];
            var x = xScale.convert(xDatum) + offsetX;
            var y = yScale.convert(yDatum);
            // if this iteration is not the last, set nextX using the next value in the data array
            if (i + 1 < n) {
                nextX = xScale.convert(xData[i + 1]) + offsetX;
            }
            // set stroke data regardless of missing/ undefined values. Undefined values will be handled in the updateStroke() method
            strokeData.push({
                seriesDatum: { x: xDatum, y: yDatum },
                point: { x: x, y: y },
            });
            if (yDatum === undefined && previousX !== undefined) {
                // if yDatum is undefined and there is a valid previous data point, add a phantom point at yZero
                // if a next data point exists, add a phantom point at yZero at the next X
                fillData.push({ seriesDatum: undefined, point: { x: previousX, y: yZero } });
                if (nextX !== undefined) {
                    fillData.push({ seriesDatum: undefined, point: { x: nextX, y: yZero } });
                }
            }
            else if (yDatum !== undefined) {
                fillData.push({
                    seriesDatum: { x: xDatum, y: yDatum },
                    point: { x: x, y: y },
                });
                // set node data only if yDatum is not undefined. These values are used in the updateSelection() method to update markers
                nodeData.push({
                    seriesDatum: { x: xDatum, y: yDatum },
                    point: { x: x, y: y },
                });
                firstValidX = firstValidX !== undefined ? firstValidX : x;
                lastValidX = x;
            }
            previousX = x;
        }
        // phantom points for creating closed area
        fillData.push({ seriesDatum: undefined, point: { x: lastValidX, y: yZero } }, { seriesDatum: undefined, point: { x: firstValidX, y: yZero } });
        return { nodeData: nodeData, fillData: fillData, strokeData: strokeData };
    };
    AreaSparkline.prototype.updateAxisLine = function () {
        var _a = this, xScale = _a.xScale, yScale = _a.yScale, axis = _a.axis, xAxisLine = _a.xAxisLine;
        xAxisLine.x1 = xScale.range[0];
        xAxisLine.x2 = xScale.range[1];
        xAxisLine.y1 = xAxisLine.y2 = 0;
        xAxisLine.stroke = axis.stroke;
        xAxisLine.strokeWidth = axis.strokeWidth;
        var yZero = yScale.convert(0);
        xAxisLine.translationY = yZero;
    };
    AreaSparkline.prototype.updateSelection = function (selectionData) {
        var marker = this.marker;
        var shape = getMarker(marker.shape);
        var updateMarkerSelection = this.markerSelection.setData(selectionData);
        var enterMarkerSelection = updateMarkerSelection.enter.append(shape);
        updateMarkerSelection.exit.remove();
        this.markerSelection = updateMarkerSelection.merge(enterMarkerSelection);
    };
    AreaSparkline.prototype.updateNodes = function () {
        var _this = this;
        var _a = this, highlightedDatum = _a.highlightedDatum, highlightStyle = _a.highlightStyle, marker = _a.marker;
        var highlightSize = highlightStyle.size, highlightFill = highlightStyle.fill, highlightStroke = highlightStyle.stroke, highlightStrokeWidth = highlightStyle.strokeWidth;
        var markerFormatter = marker.formatter;
        this.markerSelection.each(function (node, datum, index) {
            var point = datum.point, seriesDatum = datum.seriesDatum;
            if (!point) {
                return;
            }
            var highlighted = datum === highlightedDatum;
            var markerFill = highlighted && highlightFill !== undefined ? highlightFill : marker.fill;
            var markerStroke = highlighted && highlightStroke !== undefined ? highlightStroke : marker.stroke;
            var markerStrokeWidth = highlighted && highlightStrokeWidth !== undefined ? highlightStrokeWidth : marker.strokeWidth;
            var markerSize = highlighted && highlightSize !== undefined ? highlightSize : marker.size;
            var markerFormat;
            if (markerFormatter) {
                var first = index === 0;
                var last = index === _this.markerSelectionData.length - 1;
                var min = seriesDatum.y === _this.min;
                var max = seriesDatum.y === _this.max;
                markerFormat = markerFormatter({
                    datum: datum,
                    xValue: seriesDatum.x,
                    yValue: seriesDatum.y,
                    min: min,
                    max: max,
                    first: first,
                    last: last,
                    fill: markerFill,
                    stroke: markerStroke,
                    strokeWidth: markerStrokeWidth,
                    size: markerSize,
                    highlighted: highlighted,
                });
            }
            node.size = markerFormat && markerFormat.size != undefined ? markerFormat.size : markerSize;
            node.fill = markerFormat && markerFormat.fill != undefined ? markerFormat.fill : markerFill;
            node.stroke = markerFormat && markerFormat.stroke != undefined ? markerFormat.stroke : markerStroke;
            node.strokeWidth =
                markerFormat && markerFormat.strokeWidth != undefined ? markerFormat.strokeWidth : markerStrokeWidth;
            node.translationX = point.x;
            node.translationY = point.y;
            node.visible =
                markerFormat && markerFormat.enabled != undefined
                    ? markerFormat.enabled
                    : marker.enabled && node.size > 0;
        });
    };
    AreaSparkline.prototype.updateStroke = function (strokeData) {
        var _a = this, strokePath = _a.strokePath, yData = _a.yData, line = _a.line;
        if (yData.length < 2) {
            return;
        }
        var path = strokePath.path;
        var n = strokeData.length;
        var moveTo = true;
        path.clear();
        for (var i = 0; i < n; i++) {
            var _b = strokeData[i], point = _b.point, seriesDatum = _b.seriesDatum;
            var x = point.x;
            var y = point.y;
            if (seriesDatum.y == undefined) {
                moveTo = true;
            }
            else {
                if (moveTo) {
                    path.moveTo(x, y);
                    moveTo = false;
                }
                else {
                    path.lineTo(x, y);
                }
            }
        }
        strokePath.lineJoin = strokePath.lineCap = 'round';
        strokePath.fill = undefined;
        strokePath.stroke = line.stroke;
        strokePath.strokeWidth = line.strokeWidth;
    };
    AreaSparkline.prototype.updateFill = function (areaData) {
        var _a = this, fillPath = _a.fillPath, yData = _a.yData, fill = _a.fill;
        var path = fillPath.path;
        var n = areaData.length;
        path.clear();
        if (yData.length < 2) {
            return;
        }
        for (var i = 0; i < n; i++) {
            var point = areaData[i].point;
            var x = point.x;
            var y = point.y;
            if (i > 0) {
                path.lineTo(x, y);
            }
            else {
                path.moveTo(x, y);
            }
        }
        path.closePath();
        fillPath.lineJoin = 'round';
        fillPath.stroke = undefined;
        fillPath.fill = fill;
    };
    AreaSparkline.prototype.updateXCrosshairLine = function () {
        var _a = this, yScale = _a.yScale, xCrosshairLine = _a.xCrosshairLine, highlightedDatum = _a.highlightedDatum, xLine = _a.crosshairs.xLine;
        if (!xLine.enabled || highlightedDatum == undefined) {
            xCrosshairLine.strokeWidth = 0;
            return;
        }
        xCrosshairLine.y1 = yScale.range[0];
        xCrosshairLine.y2 = yScale.range[1];
        xCrosshairLine.x1 = xCrosshairLine.x2 = 0;
        xCrosshairLine.stroke = xLine.stroke;
        xCrosshairLine.strokeWidth = xLine.strokeWidth || 1;
        xCrosshairLine.lineCap = xLine.lineCap === 'round' || xLine.lineCap === 'square' ? xLine.lineCap : undefined;
        var lineDash = xLine.lineDash;
        xCrosshairLine.lineDash = Array.isArray(lineDash)
            ? lineDash
            : getLineDash(xCrosshairLine.lineCap, xLine.lineDash);
        xCrosshairLine.translationX = highlightedDatum.point.x;
    };
    AreaSparkline.prototype.updateYCrosshairLine = function () {
        var _a = this, xScale = _a.xScale, yCrosshairLine = _a.yCrosshairLine, highlightedDatum = _a.highlightedDatum, yLine = _a.crosshairs.yLine;
        if (!yLine.enabled || highlightedDatum == undefined) {
            yCrosshairLine.strokeWidth = 0;
            return;
        }
        yCrosshairLine.x1 = xScale.range[0];
        yCrosshairLine.x2 = xScale.range[1];
        yCrosshairLine.y1 = yCrosshairLine.y2 = 0;
        yCrosshairLine.stroke = yLine.stroke;
        yCrosshairLine.strokeWidth = yLine.strokeWidth || 1;
        yCrosshairLine.lineCap = yLine.lineCap === 'round' || yLine.lineCap === 'square' ? yLine.lineCap : undefined;
        var lineDash = yLine.lineDash;
        yCrosshairLine.lineDash = Array.isArray(lineDash)
            ? lineDash
            : getLineDash(yCrosshairLine.lineCap, yLine.lineDash);
        yCrosshairLine.translationY = highlightedDatum.point.y;
    };
    AreaSparkline.prototype.getTooltipHtml = function (datum) {
        var dataType = this.dataType;
        var seriesDatum = datum.seriesDatum;
        var yValue = seriesDatum.y;
        var xValue = seriesDatum.x;
        var content = this.formatNumericDatum(yValue);
        var title = dataType === 'array' || dataType === 'object' ? this.formatDatum(xValue) : undefined;
        var defaults = {
            content: content,
            title: title,
        };
        if (this.tooltip.renderer) {
            return toTooltipHtml(this.tooltip.renderer({
                context: this.context,
                datum: seriesDatum,
                yValue: yValue,
                xValue: xValue,
            }), defaults);
        }
        return toTooltipHtml(defaults);
    };
    AreaSparkline.className = 'AreaSparkline';
    return AreaSparkline;
}(Sparkline));

var __extends$9 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var SparklineMarker = /** @class */ (function () {
    function SparklineMarker() {
        this.enabled = true;
        this.shape = 'circle';
        this.size = 0;
        this.fill = 'rgb(124, 181, 236)';
        this.stroke = 'rgb(124, 181, 236)';
        this.strokeWidth = 1;
        this.formatter = undefined;
    }
    return SparklineMarker;
}());
var SparklineLine = /** @class */ (function () {
    function SparklineLine() {
        this.stroke = 'rgb(124, 181, 236)';
        this.strokeWidth = 1;
    }
    return SparklineLine;
}());
var SparklineCrosshairs = /** @class */ (function () {
    function SparklineCrosshairs() {
        this.xLine = {
            enabled: true,
            stroke: 'rgba(0,0,0, 0.54)',
            strokeWidth: 1,
            lineDash: 'solid',
            lineCap: undefined,
        };
        this.yLine = {
            enabled: false,
            stroke: 'rgba(0,0,0, 0.54)',
            strokeWidth: 1,
            lineDash: 'solid',
            lineCap: undefined,
        };
    }
    return SparklineCrosshairs;
}());
var LineSparkline = /** @class */ (function (_super) {
    __extends$9(LineSparkline, _super);
    function LineSparkline() {
        var _this = _super.call(this) || this;
        _this.linePath = new Path();
        _this.xCrosshairLine = new Line();
        _this.yCrosshairLine = new Line();
        _this.lineSparklineGroup = new Group();
        _this.markers = new Group();
        _this.markerSelection = Selection.select(_this.markers).selectAll();
        _this.markerSelectionData = [];
        _this.marker = new SparklineMarker();
        _this.line = new SparklineLine();
        _this.crosshairs = new SparklineCrosshairs();
        _this.rootGroup.append(_this.lineSparklineGroup);
        _this.lineSparklineGroup.append([_this.linePath, _this.xCrosshairLine, _this.yCrosshairLine, _this.markers]);
        return _this;
    }
    LineSparkline.prototype.getNodeData = function () {
        return this.markerSelectionData;
    };
    /**
     * If marker shape is changed, this method should be called to remove the previous marker nodes selection.
     */
    LineSparkline.prototype.onMarkerShapeChange = function () {
        this.markerSelection = this.markerSelection.setData([]);
        this.markerSelection.exit.remove();
        this.scheduleLayout();
    };
    LineSparkline.prototype.update = function () {
        var nodeData = this.generateNodeData();
        if (!nodeData) {
            return;
        }
        this.markerSelectionData = nodeData;
        this.updateSelection(nodeData);
        this.updateNodes();
        this.updateLine();
    };
    LineSparkline.prototype.updateYScaleDomain = function () {
        var _a = this, yData = _a.yData, yScale = _a.yScale;
        var yMinMax = extent(yData, isNumber);
        var yMin = 0;
        var yMax = 1;
        if (yMinMax !== undefined) {
            yMin = this.min = yMinMax[0];
            yMax = this.max = yMinMax[1];
        }
        if (yMin === yMax) {
            // if all values in the data are the same, yMin and yMax will be equal, need to adjust the domain with some padding
            var padding = Math.abs(yMin * 0.01);
            yMin -= padding;
            yMax += padding;
        }
        yScale.domain = [yMin, yMax];
    };
    LineSparkline.prototype.generateNodeData = function () {
        var _a = this, data = _a.data, yData = _a.yData, xData = _a.xData, xScale = _a.xScale, yScale = _a.yScale;
        if (!data) {
            return;
        }
        var offsetX = xScale instanceof BandScale ? xScale.bandwidth / 2 : 0;
        var nodeData = [];
        for (var i = 0; i < yData.length; i++) {
            var yDatum = yData[i];
            var xDatum = xData[i];
            if (yDatum == undefined) {
                continue;
            }
            var x = xScale.convert(xDatum) + offsetX;
            var y = yScale.convert(yDatum);
            nodeData.push({
                seriesDatum: { x: xDatum, y: yDatum },
                point: { x: x, y: y },
            });
        }
        return nodeData;
    };
    LineSparkline.prototype.updateSelection = function (selectionData) {
        var marker = this.marker;
        var shape = getMarker(marker.shape);
        var updateMarkerSelection = this.markerSelection.setData(selectionData);
        var enterMarkerSelection = updateMarkerSelection.enter.append(shape);
        updateMarkerSelection.exit.remove();
        this.markerSelection = updateMarkerSelection.merge(enterMarkerSelection);
    };
    LineSparkline.prototype.updateNodes = function () {
        var _this = this;
        var _a = this, highlightedDatum = _a.highlightedDatum, highlightStyle = _a.highlightStyle, marker = _a.marker;
        var highlightSize = highlightStyle.size, highlightFill = highlightStyle.fill, highlightStroke = highlightStyle.stroke, highlightStrokeWidth = highlightStyle.strokeWidth;
        var markerFormatter = marker.formatter;
        this.markerSelection.each(function (node, datum, index) {
            var highlighted = datum === highlightedDatum;
            var markerFill = highlighted && highlightFill !== undefined ? highlightFill : marker.fill;
            var markerStroke = highlighted && highlightStroke !== undefined ? highlightStroke : marker.stroke;
            var markerStrokeWidth = highlighted && highlightStrokeWidth !== undefined ? highlightStrokeWidth : marker.strokeWidth;
            var markerSize = highlighted && highlightSize !== undefined ? highlightSize : marker.size;
            var markerFormat;
            var seriesDatum = datum.seriesDatum, point = datum.point;
            if (markerFormatter) {
                var first = index === 0;
                var last = index === _this.markerSelectionData.length - 1;
                var min = seriesDatum.y === _this.min;
                var max = seriesDatum.y === _this.max;
                markerFormat = markerFormatter({
                    datum: datum,
                    xValue: seriesDatum.x,
                    yValue: seriesDatum.y,
                    min: min,
                    max: max,
                    first: first,
                    last: last,
                    fill: markerFill,
                    stroke: markerStroke,
                    strokeWidth: markerStrokeWidth,
                    size: markerSize,
                    highlighted: highlighted,
                });
            }
            node.size = markerFormat && markerFormat.size != undefined ? markerFormat.size : markerSize;
            node.fill = markerFormat && markerFormat.fill != undefined ? markerFormat.fill : markerFill;
            node.stroke = markerFormat && markerFormat.stroke != undefined ? markerFormat.stroke : markerStroke;
            node.strokeWidth =
                markerFormat && markerFormat.strokeWidth != undefined ? markerFormat.strokeWidth : markerStrokeWidth;
            node.translationX = point.x;
            node.translationY = point.y;
            node.visible =
                markerFormat && markerFormat.enabled != undefined
                    ? markerFormat.enabled
                    : marker.enabled && node.size > 0;
        });
    };
    LineSparkline.prototype.updateLine = function () {
        var _a = this, linePath = _a.linePath, yData = _a.yData, xData = _a.xData, xScale = _a.xScale, yScale = _a.yScale, line = _a.line;
        if (yData.length < 2) {
            return;
        }
        var path = linePath.path;
        var n = yData.length;
        var offsetX = xScale instanceof BandScale ? xScale.bandwidth / 2 : 0;
        var moveTo = true;
        path.clear();
        for (var i = 0; i < n; i++) {
            var xDatum = xData[i];
            var yDatum = yData[i];
            var x = xScale.convert(xDatum) + offsetX;
            var y = yScale.convert(yDatum);
            if (yDatum == undefined) {
                moveTo = true;
            }
            else {
                if (moveTo) {
                    path.moveTo(x, y);
                    moveTo = false;
                }
                else {
                    path.lineTo(x, y);
                }
            }
        }
        linePath.fill = undefined;
        linePath.stroke = line.stroke;
        linePath.strokeWidth = line.strokeWidth;
    };
    LineSparkline.prototype.updateXCrosshairLine = function () {
        var _a = this, yScale = _a.yScale, xCrosshairLine = _a.xCrosshairLine, highlightedDatum = _a.highlightedDatum, xLine = _a.crosshairs.xLine;
        if (!xLine.enabled || highlightedDatum == undefined) {
            xCrosshairLine.strokeWidth = 0;
            return;
        }
        xCrosshairLine.y1 = yScale.range[0];
        xCrosshairLine.y2 = yScale.range[1];
        xCrosshairLine.x1 = xCrosshairLine.x2 = 0;
        xCrosshairLine.stroke = xLine.stroke;
        xCrosshairLine.strokeWidth = xLine.strokeWidth || 1;
        xCrosshairLine.lineCap = xLine.lineCap === 'round' || xLine.lineCap === 'square' ? xLine.lineCap : undefined;
        var lineDash = xLine.lineDash;
        xCrosshairLine.lineDash = Array.isArray(lineDash)
            ? lineDash
            : getLineDash(xCrosshairLine.lineCap, xLine.lineDash);
        xCrosshairLine.translationX = highlightedDatum.point.x;
    };
    LineSparkline.prototype.updateYCrosshairLine = function () {
        var _a = this, xScale = _a.xScale, yCrosshairLine = _a.yCrosshairLine, highlightedDatum = _a.highlightedDatum, yLine = _a.crosshairs.yLine;
        if (!yLine.enabled || highlightedDatum == undefined) {
            yCrosshairLine.strokeWidth = 0;
            return;
        }
        yCrosshairLine.x1 = xScale.range[0];
        yCrosshairLine.x2 = xScale.range[1];
        yCrosshairLine.y1 = yCrosshairLine.y2 = 0;
        yCrosshairLine.stroke = yLine.stroke;
        yCrosshairLine.strokeWidth = yLine.strokeWidth || 1;
        yCrosshairLine.lineCap = yLine.lineCap === 'round' || yLine.lineCap === 'square' ? yLine.lineCap : undefined;
        var lineDash = yLine.lineDash;
        yCrosshairLine.lineDash = Array.isArray(lineDash)
            ? lineDash
            : getLineDash(yCrosshairLine.lineCap, yLine.lineDash);
        yCrosshairLine.translationY = highlightedDatum.point.y;
    };
    LineSparkline.prototype.getTooltipHtml = function (datum) {
        var dataType = this.dataType;
        var seriesDatum = datum.seriesDatum;
        var yValue = seriesDatum.y;
        var xValue = seriesDatum.x;
        var content = this.formatNumericDatum(yValue);
        var title = dataType === 'array' || dataType === 'object' ? this.formatDatum(xValue) : undefined;
        var defaults = {
            content: content,
            title: title,
        };
        if (this.tooltip.renderer) {
            return toTooltipHtml(this.tooltip.renderer({
                context: this.context,
                datum: seriesDatum,
                yValue: yValue,
                xValue: xValue,
            }), defaults);
        }
        return toTooltipHtml(defaults);
    };
    LineSparkline.className = 'LineSparkline';
    return LineSparkline;
}(Sparkline));

var __extends$8 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Rectangle = /** @class */ (function (_super) {
    __extends$8(Rectangle, _super);
    function Rectangle() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._x = 0;
        _this._y = 0;
        _this._width = 0;
        _this._height = 0;
        /**
         * If `true`, the rect is aligned to the pixel grid for crisp looking lines.
         */
        _this._crisp = false;
        return _this;
    }
    Object.defineProperty(Rectangle.prototype, "x", {
        get: function () {
            return this._x;
        },
        set: function (value) {
            if (this._x !== value) {
                this._x = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rectangle.prototype, "y", {
        get: function () {
            return this._y;
        },
        set: function (value) {
            if (this._y !== value) {
                this._y = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rectangle.prototype, "width", {
        get: function () {
            return this._width;
        },
        set: function (value) {
            if (this._width !== value) {
                this._width = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rectangle.prototype, "height", {
        get: function () {
            return this._height;
        },
        set: function (value) {
            if (this._height !== value) {
                this._height = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rectangle.prototype, "crisp", {
        get: function () {
            return this._crisp;
        },
        set: function (value) {
            if (this._crisp !== value) {
                this._crisp = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Rectangle.prototype.isPointInStroke = function (x, y) {
        return false;
    };
    Rectangle.prototype.isPointInPath = function (x, y) {
        return false;
    };
    Rectangle.prototype.render = function (ctx) {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        var _a = this, x = _a.x, y = _a.y, width = _a.width, height = _a.height, crisp = _a.crisp;
        ctx.beginPath();
        if (crisp) {
            // ensure stroke aligns to the pixel grid
            var _b = this, a = _b.alignment, al = _b.align;
            ctx.rect(al(a, x), al(a, y), al(a, x, width), al(a, y, height));
        }
        else {
            ctx.rect(x, y, width, height);
        }
        this.fillStroke(ctx);
        this.dirty = false;
    };
    Rectangle.className = 'Column';
    return Rectangle;
}(Shape));

var __extends$7 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/** @class */ ((function (_super) {
    __extends$7(Text, _super);
    function Text() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._x = 0;
        _this._y = 0;
        _this.lineBreakRegex = /\r?\n/g;
        _this.lines = [];
        _this._text = '';
        _this._dirtyFont = true;
        _this._fontSize = 10;
        _this._fontFamily = 'sans-serif';
        _this._textAlign = Text.defaultStyles.textAlign;
        _this._textBaseline = Text.defaultStyles.textBaseline;
        _this._lineHeight = 14;
        return _this;
    }
    Object.defineProperty(Text.prototype, "x", {
        get: function () {
            return this._x;
        },
        set: function (value) {
            if (this._x !== value) {
                this._x = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "y", {
        get: function () {
            return this._y;
        },
        set: function (value) {
            if (this._y !== value) {
                this._y = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Text.prototype.splitText = function () {
        this.lines = this._text.split(this.lineBreakRegex);
    };
    Object.defineProperty(Text.prototype, "text", {
        get: function () {
            return this._text;
        },
        set: function (value) {
            var str = String(value); // `value` can be an object here
            if (this._text !== str) {
                this._text = str;
                this.splitText();
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "font", {
        get: function () {
            if (this.dirtyFont) {
                this.dirtyFont = false;
                this._font = getFont$1(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
            }
            return this._font;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "dirtyFont", {
        get: function () {
            return this._dirtyFont;
        },
        set: function (value) {
            if (this._dirtyFont !== value) {
                this._dirtyFont = value;
                if (value) {
                    this.dirty = true;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "fontStyle", {
        get: function () {
            return this._fontStyle;
        },
        set: function (value) {
            if (this._fontStyle !== value) {
                this._fontStyle = value;
                this.dirtyFont = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "fontWeight", {
        get: function () {
            return this._fontWeight;
        },
        set: function (value) {
            if (this._fontWeight !== value) {
                this._fontWeight = value;
                this.dirtyFont = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "fontSize", {
        get: function () {
            return this._fontSize;
        },
        set: function (value) {
            if (!isFinite(value)) {
                value = 10;
            }
            if (this._fontSize !== value) {
                this._fontSize = value;
                this.dirtyFont = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "fontFamily", {
        get: function () {
            return this._fontFamily;
        },
        set: function (value) {
            if (this._fontFamily !== value) {
                this._fontFamily = value;
                this.dirtyFont = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "textAlign", {
        get: function () {
            return this._textAlign;
        },
        set: function (value) {
            if (this._textAlign !== value) {
                this._textAlign = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "textBaseline", {
        get: function () {
            return this._textBaseline;
        },
        set: function (value) {
            if (this._textBaseline !== value) {
                this._textBaseline = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "lineHeight", {
        get: function () {
            return this._lineHeight;
        },
        set: function (value) {
            // Multi-line text is complicated because:
            // - Canvas does not support it natively, so we have to implement it manually
            // - need to know the height of each line -> need to parse the font shorthand ->
            //   generally impossible to do because font size may not be in pixels
            // - so, need to measure the text instead, each line individually -> expensive
            // - or make the user provide the line height manually for multi-line text
            // - computeBBox should use the lineHeight for multi-line text but ignore it otherwise
            // - textBaseline kind of loses its meaning for multi-line text
            if (this._lineHeight !== value) {
                this._lineHeight = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Text.prototype.computeBBox = function () {
        return HdpiCanvas.has.textMetrics
            ? this.getPreciseBBox()
            : this.getApproximateBBox();
    };
    Text.prototype.getPreciseBBox = function () {
        var metrics = HdpiCanvas.measureText(this.text, this.font, this.textBaseline, this.textAlign);
        return new BBox(this.x - metrics.actualBoundingBoxLeft, this.y - metrics.actualBoundingBoxAscent, metrics.width, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
    };
    Text.prototype.getApproximateBBox = function () {
        var size = HdpiCanvas.getTextSize(this.text, this.font);
        var _a = this, x = _a.x, y = _a.y;
        switch (this.textAlign) {
            case 'end':
            case 'right':
                x -= size.width;
                break;
            case 'center':
                x -= size.width / 2;
        }
        switch (this.textBaseline) {
            case 'alphabetic':
                y -= size.height * 0.7;
                break;
            case 'middle':
                y -= size.height * 0.45;
                break;
            case 'ideographic':
                y -= size.height;
                break;
            case 'hanging':
                y -= size.height * 0.2;
                break;
            case 'bottom':
                y -= size.height;
                break;
        }
        return new BBox(x, y, size.width, size.height);
    };
    Text.prototype.isPointInPath = function (x, y) {
        var point = this.transformPoint(x, y);
        var bbox = this.computeBBox();
        return bbox ? bbox.containsPoint(point.x, point.y) : false;
    };
    Text.prototype.isPointInStroke = function (x, y) {
        return false;
    };
    Text.prototype.render = function (ctx) {
        if (!this.lines.length || !this.scene) {
            return;
        }
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        // this.matrix.transformBBox(this.computeBBox!()).render(ctx); // debug
        this.matrix.toContext(ctx);
        var _a = this, fill = _a.fill, stroke = _a.stroke, strokeWidth = _a.strokeWidth;
        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;
        var pixelRatio = this.scene.canvas.pixelRatio || 1;
        var globalAlpha = ctx.globalAlpha;
        if (fill) {
            ctx.fillStyle = fill;
            ctx.globalAlpha = globalAlpha * this.opacity * this.fillOpacity;
            var _b = this, fillShadow = _b.fillShadow, text = _b.text, x = _b.x, y = _b.y;
            if (fillShadow && fillShadow.enabled) {
                ctx.shadowColor = fillShadow.color;
                ctx.shadowOffsetX = fillShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = fillShadow.yOffset * pixelRatio;
                ctx.shadowBlur = fillShadow.blur * pixelRatio;
            }
            ctx.fillText(text, x, y);
        }
        if (stroke && strokeWidth) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = strokeWidth;
            ctx.globalAlpha = globalAlpha * this.opacity * this.strokeOpacity;
            var _c = this, lineDash = _c.lineDash, lineDashOffset = _c.lineDashOffset, lineCap = _c.lineCap, lineJoin = _c.lineJoin, strokeShadow = _c.strokeShadow, text = _c.text, x = _c.x, y = _c.y;
            if (lineDash) {
                ctx.setLineDash(lineDash);
            }
            if (lineDashOffset) {
                ctx.lineDashOffset = lineDashOffset;
            }
            if (lineCap) {
                ctx.lineCap = lineCap;
            }
            if (lineJoin) {
                ctx.lineJoin = lineJoin;
            }
            if (strokeShadow && strokeShadow.enabled) {
                ctx.shadowColor = strokeShadow.color;
                ctx.shadowOffsetX = strokeShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = strokeShadow.yOffset * pixelRatio;
                ctx.shadowBlur = strokeShadow.blur * pixelRatio;
            }
            ctx.strokeText(text, x, y);
        }
        this.dirty = false;
    };
    Text.className = 'Text';
    Text.defaultStyles = chainObjects(Shape.defaultStyles, {
        textAlign: 'start',
        fontStyle: undefined,
        fontWeight: undefined,
        fontSize: 10,
        fontFamily: 'sans-serif',
        textBaseline: 'alphabetic'
    });
    return Text;
})(Shape));
function getFont$1(fontSize, fontFamily, fontStyle, fontWeight) {
    return [
        fontStyle || '',
        fontWeight || '',
        fontSize + 'px',
        fontFamily
    ].join(' ').trim();
}

var __extends$6 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Label = /** @class */ (function (_super) {
    __extends$6(Label, _super);
    function Label() {
        var _this = _super.call(this) || this;
        _this.enabled = true;
        _this.fontSize = 8;
        _this.fontFamily = 'Verdana, sans-serif';
        _this.color = 'rgba(70, 70, 70, 1)';
        return _this;
    }
    Label.prototype.getFont = function () {
        return getFont$1(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
    };
    __decorate$2([
        reactive('change', 'dataChange')
    ], Label.prototype, "enabled", void 0);
    __decorate$2([
        reactive('change')
    ], Label.prototype, "fontSize", void 0);
    __decorate$2([
        reactive('change')
    ], Label.prototype, "fontFamily", void 0);
    __decorate$2([
        reactive('change')
    ], Label.prototype, "fontStyle", void 0);
    __decorate$2([
        reactive('change')
    ], Label.prototype, "fontWeight", void 0);
    __decorate$2([
        reactive('change')
    ], Label.prototype, "color", void 0);
    return Label;
}(Observable));

var __extends$5 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Text = /** @class */ (function (_super) {
    __extends$5(Text, _super);
    function Text() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._x = 0;
        _this._y = 0;
        _this.lineBreakRegex = /\r?\n/g;
        _this.lines = [];
        _this._text = '';
        _this._dirtyFont = true;
        _this._fontSize = 10;
        _this._fontFamily = 'sans-serif';
        _this._textAlign = Text.defaultStyles.textAlign;
        _this._textBaseline = Text.defaultStyles.textBaseline;
        _this._lineHeight = 14;
        return _this;
    }
    Object.defineProperty(Text.prototype, "x", {
        get: function () {
            return this._x;
        },
        set: function (value) {
            if (this._x !== value) {
                this._x = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "y", {
        get: function () {
            return this._y;
        },
        set: function (value) {
            if (this._y !== value) {
                this._y = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Text.prototype.splitText = function () {
        this.lines = this._text.split(this.lineBreakRegex);
    };
    Object.defineProperty(Text.prototype, "text", {
        get: function () {
            return this._text;
        },
        set: function (value) {
            var str = String(value); // `value` can be an object here
            if (this._text !== str) {
                this._text = str;
                this.splitText();
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "font", {
        get: function () {
            if (this.dirtyFont) {
                this.dirtyFont = false;
                this._font = getFont(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
            }
            return this._font;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "dirtyFont", {
        get: function () {
            return this._dirtyFont;
        },
        set: function (value) {
            if (this._dirtyFont !== value) {
                this._dirtyFont = value;
                if (value) {
                    this.dirty = true;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "fontStyle", {
        get: function () {
            return this._fontStyle;
        },
        set: function (value) {
            if (this._fontStyle !== value) {
                this._fontStyle = value;
                this.dirtyFont = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "fontWeight", {
        get: function () {
            return this._fontWeight;
        },
        set: function (value) {
            if (this._fontWeight !== value) {
                this._fontWeight = value;
                this.dirtyFont = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "fontSize", {
        get: function () {
            return this._fontSize;
        },
        set: function (value) {
            if (!isFinite(value)) {
                value = 10;
            }
            if (this._fontSize !== value) {
                this._fontSize = value;
                this.dirtyFont = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "fontFamily", {
        get: function () {
            return this._fontFamily;
        },
        set: function (value) {
            if (this._fontFamily !== value) {
                this._fontFamily = value;
                this.dirtyFont = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "textAlign", {
        get: function () {
            return this._textAlign;
        },
        set: function (value) {
            if (this._textAlign !== value) {
                this._textAlign = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "textBaseline", {
        get: function () {
            return this._textBaseline;
        },
        set: function (value) {
            if (this._textBaseline !== value) {
                this._textBaseline = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "lineHeight", {
        get: function () {
            return this._lineHeight;
        },
        set: function (value) {
            // Multi-line text is complicated because:
            // - Canvas does not support it natively, so we have to implement it manually
            // - need to know the height of each line -> need to parse the font shorthand ->
            //   generally impossible to do because font size may not be in pixels
            // - so, need to measure the text instead, each line individually -> expensive
            // - or make the user provide the line height manually for multi-line text
            // - computeBBox should use the lineHeight for multi-line text but ignore it otherwise
            // - textBaseline kind of loses its meaning for multi-line text
            if (this._lineHeight !== value) {
                this._lineHeight = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Text.prototype.computeBBox = function () {
        return HdpiCanvas.has.textMetrics ? this.getPreciseBBox() : this.getApproximateBBox();
    };
    Text.prototype.getPreciseBBox = function () {
        var metrics = HdpiCanvas.measureText(this.text, this.font, this.textBaseline, this.textAlign);
        return new BBox(this.x - metrics.actualBoundingBoxLeft, this.y - metrics.actualBoundingBoxAscent, metrics.width, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
    };
    Text.prototype.getApproximateBBox = function () {
        var size = HdpiCanvas.getTextSize(this.text, this.font);
        var _a = this, x = _a.x, y = _a.y;
        switch (this.textAlign) {
            case 'end':
            case 'right':
                x -= size.width;
                break;
            case 'center':
                x -= size.width / 2;
        }
        switch (this.textBaseline) {
            case 'alphabetic':
                y -= size.height * 0.7;
                break;
            case 'middle':
                y -= size.height * 0.45;
                break;
            case 'ideographic':
                y -= size.height;
                break;
            case 'hanging':
                y -= size.height * 0.2;
                break;
            case 'bottom':
                y -= size.height;
                break;
        }
        return new BBox(x, y, size.width, size.height);
    };
    Text.prototype.isPointInPath = function (x, y) {
        var point = this.transformPoint(x, y);
        var bbox = this.computeBBox();
        return bbox ? bbox.containsPoint(point.x, point.y) : false;
    };
    Text.prototype.isPointInStroke = function (x, y) {
        return false;
    };
    Text.prototype.render = function (ctx) {
        if (!this.lines.length || !this.scene) {
            return;
        }
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        // this.matrix.transformBBox(this.computeBBox!()).render(ctx); // debug
        this.matrix.toContext(ctx);
        var _a = this, fill = _a.fill, stroke = _a.stroke, strokeWidth = _a.strokeWidth;
        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;
        var pixelRatio = this.scene.canvas.pixelRatio || 1;
        var globalAlpha = ctx.globalAlpha;
        if (fill) {
            ctx.fillStyle = fill;
            ctx.globalAlpha = globalAlpha * this.opacity * this.fillOpacity;
            var _b = this, fillShadow = _b.fillShadow, text = _b.text, x = _b.x, y = _b.y;
            if (fillShadow && fillShadow.enabled) {
                ctx.shadowColor = fillShadow.color;
                ctx.shadowOffsetX = fillShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = fillShadow.yOffset * pixelRatio;
                ctx.shadowBlur = fillShadow.blur * pixelRatio;
            }
            ctx.fillText(text, x, y);
        }
        if (stroke && strokeWidth) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = strokeWidth;
            ctx.globalAlpha = globalAlpha * this.opacity * this.strokeOpacity;
            var _c = this, lineDash = _c.lineDash, lineDashOffset = _c.lineDashOffset, lineCap = _c.lineCap, lineJoin = _c.lineJoin, strokeShadow = _c.strokeShadow, text = _c.text, x = _c.x, y = _c.y;
            if (lineDash) {
                ctx.setLineDash(lineDash);
            }
            if (lineDashOffset) {
                ctx.lineDashOffset = lineDashOffset;
            }
            if (lineCap) {
                ctx.lineCap = lineCap;
            }
            if (lineJoin) {
                ctx.lineJoin = lineJoin;
            }
            if (strokeShadow && strokeShadow.enabled) {
                ctx.shadowColor = strokeShadow.color;
                ctx.shadowOffsetX = strokeShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = strokeShadow.yOffset * pixelRatio;
                ctx.shadowBlur = strokeShadow.blur * pixelRatio;
            }
            ctx.strokeText(text, x, y);
        }
        this.dirty = false;
    };
    Text.className = 'Text';
    Text.defaultStyles = chainObjects(Shape.defaultStyles, {
        textAlign: 'start',
        fontStyle: undefined,
        fontWeight: undefined,
        fontSize: 10,
        fontFamily: 'sans-serif',
        textBaseline: 'alphabetic',
    });
    return Text;
}(Shape));
function getFont(fontSize, fontFamily, fontStyle, fontWeight) {
    return [fontStyle || '', fontWeight || '', fontSize + 'px', fontFamily].join(' ').trim();
}

var __extends$4 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var BarColumnNodeTag;
(function (BarColumnNodeTag) {
    BarColumnNodeTag[BarColumnNodeTag["Rect"] = 0] = "Rect";
    BarColumnNodeTag[BarColumnNodeTag["Label"] = 1] = "Label";
})(BarColumnNodeTag || (BarColumnNodeTag = {}));
var BarColumnLabelPlacement;
(function (BarColumnLabelPlacement) {
    BarColumnLabelPlacement["InsideBase"] = "insideBase";
    BarColumnLabelPlacement["InsideEnd"] = "insideEnd";
    BarColumnLabelPlacement["Center"] = "center";
    BarColumnLabelPlacement["OutsideEnd"] = "outsideEnd";
})(BarColumnLabelPlacement || (BarColumnLabelPlacement = {}));
var BarColumnLabel = /** @class */ (function (_super) {
    __extends$4(BarColumnLabel, _super);
    function BarColumnLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.formatter = undefined;
        _this.placement = BarColumnLabelPlacement.InsideEnd;
        return _this;
    }
    return BarColumnLabel;
}(Label));
var BarColumnSparkline = /** @class */ (function (_super) {
    __extends$4(BarColumnSparkline, _super);
    function BarColumnSparkline() {
        var _this = _super.call(this) || this;
        _this.fill = 'rgb(124, 181, 236)';
        _this.stroke = 'silver';
        _this.strokeWidth = 0;
        _this.paddingInner = 0.1;
        _this.paddingOuter = 0.2;
        _this.valueAxisDomain = undefined;
        _this.formatter = undefined;
        _this.axisLine = new Line();
        _this.bandWidth = 0;
        _this.sparklineGroup = new Group();
        _this.rectGroup = new Group();
        _this.labelGroup = new Group();
        _this.rectSelection = Selection.select(_this.rectGroup).selectAll();
        _this.labelSelection = Selection.select(_this.labelGroup).selectAll();
        _this.nodeSelectionData = [];
        _this.label = new BarColumnLabel();
        _this.rootGroup.append(_this.sparklineGroup);
        _this.sparklineGroup.append([_this.rectGroup, _this.axisLine, _this.labelGroup]);
        _this.axisLine.lineCap = 'round';
        _this.label.enabled = false;
        return _this;
    }
    BarColumnSparkline.prototype.getNodeData = function () {
        return this.nodeSelectionData;
    };
    BarColumnSparkline.prototype.update = function () {
        this.updateSelections();
        this.updateNodes();
    };
    BarColumnSparkline.prototype.updateSelections = function () {
        var nodeData = this.generateNodeData();
        if (!nodeData) {
            return;
        }
        this.nodeSelectionData = nodeData;
        this.updateRectSelection(nodeData);
        this.updateLabelSelection(nodeData);
    };
    BarColumnSparkline.prototype.updateNodes = function () {
        this.updateRectNodes();
        this.updateLabelNodes();
    };
    BarColumnSparkline.prototype.calculateStep = function (range) {
        var _a, _b;
        var _c = this, xScale = _c.xScale, paddingInner = _c.paddingInner, paddingOuter = _c.paddingOuter, smallestInterval = _c.smallestInterval;
        // calculate step
        var domainLength = xScale.domain[1] - xScale.domain[0];
        var intervals = (domainLength / (_b = (_a = smallestInterval) === null || _a === void 0 ? void 0 : _a.x, (_b !== null && _b !== void 0 ? _b : 1))) + 1;
        // The number of intervals/bands is used to determine the width of individual bands by dividing the available range.
        // Allow a maximum of 50 bands to ensure the step (width of individual bands + padding) does not fall below a certain number of pixels.
        // If the number of intervals exceeds 50, calculate the step for 50 bands within the given range.
        // This means there could be some overlap of the bands in the sparkline.
        var maxBands = 50;
        var bands = Math.min(intervals, maxBands);
        var gaps = bands - 1; // number of gaps (padding between bands)
        var step = range / Math.max(1, (2 * paddingOuter) + (gaps * paddingInner) + bands); // step width is a combination of band width and gap width
        return step;
    };
    BarColumnSparkline.prototype.updateYScaleDomain = function () {
        var _a = this, yScale = _a.yScale, yData = _a.yData, valueAxisDomain = _a.valueAxisDomain;
        var yMinMax = extent(yData, isNumber);
        var yMin = 0;
        var yMax = 1;
        if (yMinMax !== undefined) {
            yMin = this.min = yMinMax[0];
            yMax = this.max = yMinMax[1];
        }
        // if yMin is positive, set yMin to 0
        yMin = yMin < 0 ? yMin : 0;
        // if yMax is negative, set yMax to 0
        yMax = yMax < 0 ? 0 : yMax;
        if (valueAxisDomain) {
            if (valueAxisDomain[1] < yMax) {
                valueAxisDomain[1] = yMax;
            }
            if (valueAxisDomain[0] > yMin) {
                valueAxisDomain[0] = yMin;
            }
        }
        yScale.domain = valueAxisDomain ? valueAxisDomain : [yMin, yMax];
    };
    BarColumnSparkline.prototype.updateRectSelection = function (selectionData) {
        var updateRectSelection = this.rectSelection.setData(selectionData);
        var enterRectSelection = updateRectSelection.enter.append(Rectangle);
        updateRectSelection.exit.remove();
        this.rectSelection = updateRectSelection.merge(enterRectSelection);
    };
    BarColumnSparkline.prototype.updateRectNodes = function () {
        var _this = this;
        var _a = this, highlightedDatum = _a.highlightedDatum, nodeFormatter = _a.formatter, fill = _a.fill, stroke = _a.stroke, strokeWidth = _a.strokeWidth;
        var _b = this.highlightStyle, highlightFill = _b.fill, highlightStroke = _b.stroke, highlightStrokeWidth = _b.strokeWidth;
        this.rectSelection.each(function (node, datum, index) {
            var highlighted = datum === highlightedDatum;
            var nodeFill = highlighted && highlightFill !== undefined ? highlightFill : fill;
            var nodeStroke = highlighted && highlightStroke !== undefined ? highlightStroke : stroke;
            var nodeStrokeWidth = highlighted && highlightStrokeWidth !== undefined ? highlightStrokeWidth : strokeWidth;
            var nodeFormat;
            var x = datum.x, y = datum.y, width = datum.width, height = datum.height, seriesDatum = datum.seriesDatum;
            if (nodeFormatter) {
                var first = index === 0;
                var last = index === _this.nodeSelectionData.length - 1;
                var min = seriesDatum.y === _this.min;
                var max = seriesDatum.y === _this.max;
                nodeFormat = nodeFormatter({
                    datum: datum,
                    xValue: seriesDatum.x,
                    yValue: seriesDatum.y,
                    width: width,
                    height: height,
                    min: min,
                    max: max,
                    first: first,
                    last: last,
                    fill: nodeFill,
                    stroke: nodeStroke,
                    strokeWidth: nodeStrokeWidth,
                    highlighted: highlighted,
                });
            }
            node.fill = (nodeFormat && nodeFormat.fill) || nodeFill;
            node.stroke = (nodeFormat && nodeFormat.stroke) || nodeStroke;
            node.strokeWidth = (nodeFormat && nodeFormat.strokeWidth) || nodeStrokeWidth;
            node.x = node.y = 0;
            node.width = width;
            node.height = height;
            node.visible = node.height > 0;
            node.translationX = x;
            node.translationY = y;
            // shifts bars upwards?
            // node.crisp = true;
        });
    };
    BarColumnSparkline.prototype.updateLabelSelection = function (selectionData) {
        var updateLabels = this.labelSelection.setData(selectionData);
        var enterLabels = updateLabels.enter.append(Text).each(function (text) {
            (text.tag = BarColumnNodeTag.Label), (text.pointerEvents = PointerEvents.None);
        });
        updateLabels.exit.remove();
        this.labelSelection = updateLabels.merge(enterLabels);
    };
    BarColumnSparkline.prototype.updateLabelNodes = function () {
        var _a = this.label, labelEnabled = _a.enabled, fontStyle = _a.fontStyle, fontWeight = _a.fontWeight, fontSize = _a.fontSize, fontFamily = _a.fontFamily, color = _a.color;
        this.labelSelection.each(function (text, datum) {
            var label = datum.label;
            if (label && labelEnabled) {
                text.fontStyle = fontStyle;
                text.fontWeight = fontWeight;
                text.fontSize = fontSize;
                text.fontFamily = fontFamily;
                text.textAlign = label.textAlign;
                text.textBaseline = label.textBaseline;
                text.text = label.text;
                text.x = label.x;
                text.y = label.y;
                text.fill = color;
                text.visible = true;
            }
            else {
                text.visible = false;
            }
        });
    };
    BarColumnSparkline.prototype.getTooltipHtml = function (datum) {
        var dataType = this.dataType;
        var seriesDatum = datum.seriesDatum;
        var yValue = seriesDatum.y;
        var xValue = seriesDatum.x;
        var content = this.formatNumericDatum(yValue);
        var title = dataType === 'array' || dataType === 'object' ? this.formatDatum(xValue) : undefined;
        var defaults = {
            content: content,
            title: title,
        };
        if (this.tooltip.renderer) {
            return toTooltipHtml(this.tooltip.renderer({
                context: this.context,
                datum: seriesDatum,
                yValue: yValue,
                xValue: xValue,
            }), defaults);
        }
        return toTooltipHtml(defaults);
    };
    BarColumnSparkline.prototype.formatLabelValue = function (value) {
        return value % 1 !== 0 ? value.toFixed(1) : value.toFixed(0);
    };
    return BarColumnSparkline;
}(Sparkline));

var __extends$3 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var BarSparkline = /** @class */ (function (_super) {
    __extends$3(BarSparkline, _super);
    function BarSparkline() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BarSparkline.prototype.updateYScaleRange = function () {
        var _a = this, seriesRect = _a.seriesRect, yScale = _a.yScale;
        yScale.range = [0, seriesRect.width];
    };
    BarSparkline.prototype.updateXScaleRange = function () {
        var _a = this, xScale = _a.xScale, seriesRect = _a.seriesRect, paddingOuter = _a.paddingOuter, paddingInner = _a.paddingInner;
        if (xScale instanceof BandScale) {
            xScale.range = [0, seriesRect.height];
            xScale.paddingInner = paddingInner;
            xScale.paddingOuter = paddingOuter;
        }
        else {
            // last node will be clipped if the scale is not a band scale
            // subtract last band width from the range so that the last band is not clipped
            var step = this.calculateStep(seriesRect.height);
            // PaddingOuter and paddingInner are fractions of the step with values between 0 and 1
            var padding = step * paddingOuter; // left and right outer padding
            this.bandWidth = step * (1 - paddingInner);
            xScale.range = [padding, seriesRect.height - padding - this.bandWidth];
        }
    };
    BarSparkline.prototype.updateAxisLine = function () {
        var _a = this, yScale = _a.yScale, axis = _a.axis, axisLine = _a.axisLine, seriesRect = _a.seriesRect;
        var strokeWidth = axis.strokeWidth;
        axisLine.x1 = 0;
        axisLine.x2 = 0;
        axisLine.y1 = 0;
        axisLine.y2 = seriesRect.height;
        axisLine.stroke = axis.stroke;
        axisLine.strokeWidth = strokeWidth + (strokeWidth % 2 === 1 ? 1 : 0);
        var yZero = yScale.convert(0);
        axisLine.translationX = yZero;
    };
    BarSparkline.prototype.generateNodeData = function () {
        var _a = this, data = _a.data, yData = _a.yData, xData = _a.xData, xScale = _a.xScale, yScale = _a.yScale, fill = _a.fill, stroke = _a.stroke, strokeWidth = _a.strokeWidth, label = _a.label;
        if (!data) {
            return;
        }
        var labelFontStyle = label.fontStyle, labelFontWeight = label.fontWeight, labelFontSize = label.fontSize, labelFontFamily = label.fontFamily, labelColor = label.color, labelFormatter = label.formatter, labelPlacement = label.placement;
        var nodeData = [];
        var yZero = yScale.convert(0);
        for (var i = 0, n = yData.length; i < n; i++) {
            var yDatum = yData[i];
            var xDatum = xData[i];
            var invalidDatum = yDatum === undefined;
            if (invalidDatum) {
                yDatum = 0;
            }
            var y = xScale.convert(xDatum);
            var x = Math.min(yScale.convert(yDatum), yZero);
            var bottom = Math.max(yScale.convert(yDatum), yZero);
            // if the scale is a band scale, the width of the rects will be the bandwidth, otherwise the width of the rects will be the range / number of items in the data
            var height = xScale instanceof BandScale
                ? xScale.bandwidth
                : this.bandWidth;
            var width = bottom - x;
            var midPoint = {
                x: yZero,
                y: y,
            };
            var labelText = void 0;
            if (labelFormatter) {
                labelText = labelFormatter({ value: yDatum });
            }
            else {
                labelText = yDatum !== undefined && isNumber(yDatum) ? this.formatLabelValue(yDatum) : '';
            }
            var labelY = y + height / 2;
            var labelX = void 0;
            var labelTextBaseline = 'middle';
            var labelTextAlign = void 0;
            var isPositiveY = yDatum !== undefined && yDatum >= 0;
            var labelPadding = 4;
            if (labelPlacement === BarColumnLabelPlacement.Center) {
                labelX = x + width / 2;
                labelTextAlign = 'center';
            }
            else if (labelPlacement === BarColumnLabelPlacement.OutsideEnd) {
                labelX = x + (isPositiveY ? width + labelPadding : -labelPadding);
                labelTextAlign = isPositiveY ? 'start' : 'end';
            }
            else if (labelPlacement === BarColumnLabelPlacement.InsideEnd) {
                labelX = x + (isPositiveY ? width - labelPadding : labelPadding);
                labelTextAlign = isPositiveY ? 'end' : 'start';
                var textSize = HdpiCanvas.getTextSize(labelText, labelFontFamily);
                var textWidth = textSize.width || 20;
                var positiveBoundary = yZero + textWidth;
                var negativeBoundary = yZero - textWidth;
                var exceedsBoundaries = (isPositiveY && labelX < positiveBoundary) || (!isPositiveY && labelX > negativeBoundary);
                if (exceedsBoundaries) {
                    // if labelX exceeds the boundary, labels should be positioned at `insideBase`.
                    labelX = yZero + labelPadding * (isPositiveY ? 1 : -1);
                    labelTextAlign = isPositiveY ? 'start' : 'end';
                }
            }
            else {
                // if labelPlacement === BarColumnLabelPlacement.InsideBase
                labelX = yZero + labelPadding * (isPositiveY ? 1 : -1);
                labelTextAlign = isPositiveY ? 'start' : 'end';
            }
            nodeData.push({
                x: x,
                y: y,
                width: width,
                height: height,
                fill: fill,
                stroke: stroke,
                strokeWidth: strokeWidth,
                seriesDatum: { x: xDatum, y: invalidDatum ? undefined : yDatum },
                point: midPoint,
                label: {
                    x: labelX,
                    y: labelY,
                    text: labelText,
                    fontStyle: labelFontStyle,
                    fontWeight: labelFontWeight,
                    fontSize: labelFontSize,
                    fontFamily: labelFontFamily,
                    textAlign: labelTextAlign,
                    textBaseline: labelTextBaseline,
                    fill: labelColor,
                },
            });
        }
        return nodeData;
    };
    BarSparkline.prototype.getDistance = function (p1, p2) {
        return Math.abs(p1.y - p2.y);
    };
    BarSparkline.className = 'BarSparkline';
    return BarSparkline;
}(BarColumnSparkline));

var __extends$2 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ColumnSparkline = /** @class */ (function (_super) {
    __extends$2(ColumnSparkline, _super);
    function ColumnSparkline() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ColumnSparkline.prototype.updateYScaleRange = function () {
        var _a = this, seriesRect = _a.seriesRect, yScale = _a.yScale;
        yScale.range = [seriesRect.height, 0];
    };
    ColumnSparkline.prototype.updateXScaleRange = function () {
        var _a = this, xScale = _a.xScale, seriesRect = _a.seriesRect, paddingOuter = _a.paddingOuter, paddingInner = _a.paddingInner;
        if (xScale instanceof BandScale) {
            xScale.range = [0, seriesRect.width];
            xScale.paddingInner = paddingInner;
            xScale.paddingOuter = paddingOuter;
        }
        else {
            // last node will be clipped if the scale is not a band scale
            // subtract last band width from the range so that the last band is not clipped
            var step = this.calculateStep(seriesRect.width);
            // PaddingOuter and paddingInner are fractions of the step with values between 0 and 1
            var padding = step * paddingOuter; // left and right outer padding
            this.bandWidth = step * (1 - paddingInner);
            xScale.range = [padding, seriesRect.width - padding - this.bandWidth];
        }
    };
    ColumnSparkline.prototype.updateAxisLine = function () {
        var _a = this, yScale = _a.yScale, axis = _a.axis, axisLine = _a.axisLine, seriesRect = _a.seriesRect;
        var strokeWidth = axis.strokeWidth;
        axisLine.x1 = 0;
        axisLine.x2 = seriesRect.width;
        axisLine.y1 = 0;
        axisLine.y2 = 0;
        axisLine.stroke = axis.stroke;
        axisLine.strokeWidth = strokeWidth + (strokeWidth % 2 === 1 ? 1 : 0);
        var yZero = yScale.convert(0);
        axisLine.translationY = yZero;
    };
    ColumnSparkline.prototype.generateNodeData = function () {
        var _a = this, data = _a.data, yData = _a.yData, xData = _a.xData, xScale = _a.xScale, yScale = _a.yScale, fill = _a.fill, stroke = _a.stroke, strokeWidth = _a.strokeWidth, label = _a.label;
        if (!data) {
            return;
        }
        var labelFontStyle = label.fontStyle, labelFontWeight = label.fontWeight, labelFontSize = label.fontSize, labelFontFamily = label.fontFamily, labelColor = label.color, labelFormatter = label.formatter, labelPlacement = label.placement;
        var nodeData = [];
        var yZero = yScale.convert(0);
        for (var i = 0, n = yData.length; i < n; i++) {
            var yDatum = yData[i];
            var xDatum = xData[i];
            var invalidDatum = yDatum === undefined;
            if (invalidDatum) {
                yDatum = 0;
            }
            var y = Math.min(yScale.convert(yDatum), yZero);
            var x = xScale.convert(xDatum);
            var bottom = Math.max(yScale.convert(yDatum), yZero);
            // if the scale is a band scale, the width of the rects will be the bandwidth, otherwise the width of the rects will be the range / number of items in the data
            var width = xScale instanceof BandScale
                ? xScale.bandwidth
                : this.bandWidth;
            var height = bottom - y;
            var midPoint = {
                x: x + width / 2,
                y: yZero,
            };
            var labelText = void 0;
            if (labelFormatter) {
                labelText = labelFormatter({ value: yDatum });
            }
            else {
                labelText = yDatum !== undefined && isNumber(yDatum) ? this.formatLabelValue(yDatum) : '';
            }
            var labelX = x + width / 2;
            var labelY = void 0;
            var labelTextAlign = 'center';
            var labelTextBaseline = void 0;
            var isPositiveY = yDatum !== undefined && yDatum >= 0;
            var labelPadding = 2;
            if (labelPlacement === BarColumnLabelPlacement.Center) {
                labelY = y + height / 2;
                labelTextBaseline = 'middle';
            }
            else if (labelPlacement === BarColumnLabelPlacement.OutsideEnd) {
                labelY = y + (isPositiveY ? -labelPadding : height + labelPadding);
                labelTextBaseline = isPositiveY ? 'bottom' : 'top';
            }
            else if (labelPlacement === BarColumnLabelPlacement.InsideEnd) {
                labelY = y + (isPositiveY ? labelPadding : height - labelPadding);
                labelTextBaseline = isPositiveY ? 'top' : 'bottom';
                var textSize = HdpiCanvas.getTextSize(labelText, labelFontFamily);
                var textHeight = textSize.height || 10;
                var positiveBoundary = yZero - textHeight;
                var negativeBoundary = yZero + textHeight;
                var exceedsBoundaries = (isPositiveY && labelY > positiveBoundary) || (!isPositiveY && labelY < negativeBoundary);
                if (exceedsBoundaries) {
                    // if labelY exceeds the y boundary, labels should be positioned at the insideBase
                    labelY = yZero + labelPadding * (isPositiveY ? -1 : 1);
                    labelTextBaseline = isPositiveY ? 'bottom' : 'top';
                }
            }
            else {
                // if labelPlacement === BarColumnLabelPlacement.InsideBase
                labelY = yZero + labelPadding * (isPositiveY ? -1 : 1);
                labelTextBaseline = isPositiveY ? 'bottom' : 'top';
            }
            nodeData.push({
                x: x,
                y: y,
                width: width,
                height: height,
                fill: fill,
                stroke: stroke,
                strokeWidth: strokeWidth,
                seriesDatum: { x: xDatum, y: invalidDatum ? undefined : yDatum },
                point: midPoint,
                label: {
                    x: labelX,
                    y: labelY,
                    text: labelText,
                    fontStyle: labelFontStyle,
                    fontWeight: labelFontWeight,
                    fontSize: labelFontSize,
                    fontFamily: labelFontFamily,
                    textAlign: labelTextAlign,
                    textBaseline: labelTextBaseline,
                    fill: labelColor,
                },
            });
        }
        return nodeData;
    };
    ColumnSparkline.className = 'ColumnSparkline';
    return ColumnSparkline;
}(BarColumnSparkline));

var AgSparkline = /** @class */ (function () {
    function AgSparkline() {
    }
    AgSparkline.create = function (options, tooltip) {
        // avoid mutating user provided options
        options = Object.create(options);
        var sparkline = getSparklineInstance(options.type);
        if (tooltip) {
            sparkline.tooltip = tooltip;
        }
        initSparkline(sparkline, options);
        initSparklineByType(sparkline, options);
        if (options.data) {
            sparkline.data = options.data;
        }
        return sparkline;
    };
    return AgSparkline;
}());
function getSparklineInstance(type) {
    if (type === void 0) { type = 'line'; }
    switch (type) {
        case 'column':
            return new ColumnSparkline();
        case 'bar':
            return new BarSparkline();
        case 'area':
            return new AreaSparkline();
        case 'line':
        default:
            return new LineSparkline();
    }
}
function initSparklineByType(sparkline, options) {
    switch (options.type) {
        case 'bar':
            initBarColumnSparkline(sparkline, options);
            break;
        case 'column':
            initBarColumnSparkline(sparkline, options);
            break;
        case 'area':
            initAreaSparkline(sparkline, options);
            break;
        case 'line':
        default:
            initLineSparkline(sparkline, options);
            break;
    }
}
function initSparkline(sparkline, options) {
    setValueIfPropertyExists(sparkline, 'context', options.context, options);
    setValueIfPropertyExists(sparkline, 'width', options.width, options);
    setValueIfPropertyExists(sparkline, 'height', options.height, options);
    setValueIfPropertyExists(sparkline, 'container', options.container, options);
    setValueIfPropertyExists(sparkline, 'xKey', options.xKey, options);
    setValueIfPropertyExists(sparkline, 'yKey', options.yKey, options);
    if (options.padding) {
        initPaddingOptions(sparkline.padding, options.padding);
    }
    if (options.axis) {
        initAxisOptions(sparkline.axis, options.axis);
    }
    if (options.highlightStyle) {
        initHighlightStyleOptions(sparkline.highlightStyle, options.highlightStyle);
    }
    if (options.tooltip && sparkline.tooltip) {
        initTooltipOptions(sparkline.tooltip, options.tooltip);
    }
}
function initLineSparkline(sparkline, options) {
    if (options.marker) {
        initMarkerOptions(sparkline.marker, options.marker);
    }
    if (options.line) {
        initLineOptions(sparkline.line, options.line);
    }
    if (options.crosshairs) {
        initCrosshairsOptions(sparkline.crosshairs, options.crosshairs);
    }
}
function initAreaSparkline(sparkline, options) {
    setValueIfPropertyExists(sparkline, 'fill', options.fill, options);
    if (options.marker) {
        initMarkerOptions(sparkline.marker, options.marker);
    }
    if (options.line) {
        initLineOptions(sparkline.line, options.line);
    }
    if (options.crosshairs) {
        initCrosshairsOptions(sparkline.crosshairs, options.crosshairs);
    }
}
function initBarColumnSparkline(sparkline, options) {
    setValueIfPropertyExists(sparkline, 'valueAxisDomain', options.valueAxisDomain, options);
    setValueIfPropertyExists(sparkline, 'fill', options.fill, options);
    setValueIfPropertyExists(sparkline, 'stroke', options.stroke, options);
    setValueIfPropertyExists(sparkline, 'strokeWidth', options.strokeWidth, options);
    setValueIfPropertyExists(sparkline, 'paddingInner', options.paddingInner, options);
    setValueIfPropertyExists(sparkline, 'paddingOuter', options.paddingOuter, options);
    setValueIfPropertyExists(sparkline, 'formatter', options.formatter, options);
    if (options.label) {
        initLabelOptions(sparkline.label, options.label);
    }
}
function initPaddingOptions(target, options) {
    setValueIfPropertyExists(target, 'top', options.top, options);
    setValueIfPropertyExists(target, 'right', options.right, options);
    setValueIfPropertyExists(target, 'bottom', options.bottom, options);
    setValueIfPropertyExists(target, 'left', options.left, options);
}
function initMarkerOptions(target, options) {
    setValueIfPropertyExists(target, 'enabled', options.enabled, options);
    setValueIfPropertyExists(target, 'size', options.size, options);
    setValueIfPropertyExists(target, 'shape', options.shape, options);
    setValueIfPropertyExists(target, 'fill', options.fill, options);
    setValueIfPropertyExists(target, 'stroke', options.stroke, options);
    setValueIfPropertyExists(target, 'strokeWidth', options.strokeWidth, options);
    setValueIfPropertyExists(target, 'formatter', options.formatter, options);
}
function initLabelOptions(target, options) {
    setValueIfPropertyExists(target, 'enabled', options.enabled, options);
    setValueIfPropertyExists(target, 'fontStyle', options.fontStyle, options);
    setValueIfPropertyExists(target, 'fontWeight', options.fontWeight, options);
    setValueIfPropertyExists(target, 'fontSize', options.fontSize, options);
    setValueIfPropertyExists(target, 'fontFamily', options.fontFamily, options);
    setValueIfPropertyExists(target, 'textAlign', options.textAlign, options);
    setValueIfPropertyExists(target, 'textBaseline', options.textBaseline, options);
    setValueIfPropertyExists(target, 'color', options.color, options);
    setValueIfPropertyExists(target, 'formatter', options.formatter, options);
    setValueIfPropertyExists(target, 'placement', options.placement, options);
}
function initLineOptions(target, options) {
    setValueIfPropertyExists(target, 'stroke', options.stroke, options);
    setValueIfPropertyExists(target, 'strokeWidth', options.strokeWidth, options);
}
function initAxisOptions(target, options) {
    setValueIfPropertyExists(target, 'type', options.type, options);
    setValueIfPropertyExists(target, 'stroke', options.stroke, options);
    setValueIfPropertyExists(target, 'strokeWidth', options.strokeWidth, options);
}
function initHighlightStyleOptions(target, options) {
    setValueIfPropertyExists(target, 'fill', options.fill, options);
    setValueIfPropertyExists(target, 'size', options.size, options);
    setValueIfPropertyExists(target, 'stroke', options.stroke, options);
    setValueIfPropertyExists(target, 'strokeWidth', options.strokeWidth, options);
}
function initTooltipOptions(target, options) {
    setValueIfPropertyExists(target, 'enabled', options.enabled, options);
    setValueIfPropertyExists(target, 'container', options.container, options);
    setValueIfPropertyExists(target, 'xOffset', options.xOffset, options);
    setValueIfPropertyExists(target, 'yOffset', options.yOffset, options);
    setValueIfPropertyExists(target, 'renderer', options.renderer, options);
}
function initCrosshairsOptions(target, options) {
    if (target.xLine && options.xLine) {
        initCrosshairLineOptions(target.xLine, options.xLine);
    }
    if (target.yLine && options.yLine) {
        initCrosshairLineOptions(target.yLine, options.yLine);
    }
}
function initCrosshairLineOptions(target, options) {
    setValueIfPropertyExists(target, 'enabled', options.enabled, options);
    setValueIfPropertyExists(target, 'stroke', options.stroke, options);
    setValueIfPropertyExists(target, 'strokeWidth', options.strokeWidth, options);
    setValueIfPropertyExists(target, 'lineDash', options.lineDash, options);
    setValueIfPropertyExists(target, 'lineCap', options.lineCap, options);
}
var doOnceFlags = {};
/**
 * If the key was passed before, then doesn't execute the func
 * @param {Function} func
 * @param {string} key
 */
function doOnce(func, key) {
    if (doOnceFlags[key]) {
        return;
    }
    func();
    doOnceFlags[key] = true;
}
var offsetValidator = function (property, value, defaultOffset) {
    if (isNumber(value)) {
        return true;
    }
    var message = "AG Charts: " + property + " must be a number, the value you provided is not a valid number. Using the default of " + defaultOffset + "px.";
    doOnce(function () { return console.warn(message); }, property + " not a number");
    return false;
};
var validators = {
    xOffset: offsetValidator,
    yOffset: offsetValidator
};
function setValueIfPropertyExists(target, property, value, options) {
    if (property in options) {
        if (property in target) {
            var validator = validators[property];
            var isValid = validator ? validator(property, value, target[property]) : true;
            if (isValid && target[property] !== value) {
                // only set property if the value is different to new value
                target[property] = value;
            }
        }
        else {
            console.warn("Property " + property + " does not exist on the target object.");
        }
    }
}

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SparklineCellRenderer = /** @class */ (function (_super) {
    __extends$1(SparklineCellRenderer, _super);
    function SparklineCellRenderer() {
        return _super.call(this, SparklineCellRenderer.TEMPLATE) || this;
    }
    SparklineCellRenderer.prototype.init = function (params) {
        var _this = this;
        var firstTimeIn = true;
        var updateSparkline = function () {
            var _a = _this.getGui(), clientWidth = _a.clientWidth, clientHeight = _a.clientHeight;
            if (clientWidth === 0 || clientHeight === 0) {
                return;
            }
            if (firstTimeIn) {
                var options = __assign({ data: params.value, width: clientWidth, height: clientHeight, context: {
                        data: params.data,
                    } }, params.sparklineOptions);
                // create new instance of sparkline
                _this.sparkline = AgSparkline.create(options, _this.sparklineTooltipSingleton.getSparklineTooltip());
                // append sparkline canvas to cell renderer element
                _this.eSparkline.appendChild(_this.sparkline.canvasElement);
                firstTimeIn = false;
            }
            else {
                _this.sparkline.width = clientWidth;
                _this.sparkline.height = clientHeight;
            }
        };
        var unsubscribeFromResize = this.resizeObserverService.observeResize(this.getGui(), updateSparkline);
        this.addDestroyFunc(function () { return unsubscribeFromResize(); });
    };
    SparklineCellRenderer.prototype.refresh = function (params) {
        if (this.sparkline) {
            this.sparkline.data = params.value;
            return true;
        }
        return false;
    };
    SparklineCellRenderer.prototype.destroy = function () {
        if (this.sparkline) {
            this.sparkline.destroy();
        }
        _super.prototype.destroy.call(this);
    };
    SparklineCellRenderer.TEMPLATE /* html */ = "<div class=\"ag-sparkline-wrapper\">\n            <span ref=\"eSparkline\"></span>\n        </div>";
    __decorate$1([
        core.RefSelector('eSparkline')
    ], SparklineCellRenderer.prototype, "eSparkline", void 0);
    __decorate$1([
        core.Autowired('resizeObserverService')
    ], SparklineCellRenderer.prototype, "resizeObserverService", void 0);
    __decorate$1([
        core.Autowired('sparklineTooltipSingleton')
    ], SparklineCellRenderer.prototype, "sparklineTooltipSingleton", void 0);
    return SparklineCellRenderer;
}(core.Component));

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * This 'bean' creates a single sparkline tooltip that is bound to the grid lifecycle.
 */
var SparklineTooltipSingleton = /** @class */ (function (_super) {
    __extends(SparklineTooltipSingleton, _super);
    function SparklineTooltipSingleton() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SparklineTooltipSingleton.prototype.postConstruct = function () {
        this.tooltip = new SparklineTooltip();
    };
    SparklineTooltipSingleton.prototype.getSparklineTooltip = function () {
        return this.tooltip;
    };
    SparklineTooltipSingleton.prototype.destroyTooltip = function () {
        if (this.tooltip) {
            this.tooltip.destroy();
        }
    };
    __decorate([
        core.PostConstruct
    ], SparklineTooltipSingleton.prototype, "postConstruct", null);
    __decorate([
        core.PreDestroy
    ], SparklineTooltipSingleton.prototype, "destroyTooltip", null);
    SparklineTooltipSingleton = __decorate([
        core.Bean('sparklineTooltipSingleton')
    ], SparklineTooltipSingleton);
    return SparklineTooltipSingleton;
}(core.BeanStub));

var SparklinesModule = {
    moduleName: core.ModuleNames.SparklinesModule,
    beans: [SparklineTooltipSingleton],
    userComponents: [{ componentName: 'agSparklineCellRenderer', componentClass: SparklineCellRenderer }],
    dependantModules: [core$1.EnterpriseCoreModule],
};

exports.SparklinesModule = SparklinesModule;
