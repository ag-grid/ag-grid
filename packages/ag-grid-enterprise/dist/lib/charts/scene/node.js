// ag-grid-enterprise v20.0.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Abstract scene graph node.
 * Each node can have zero or more children, zero or one parent
 * and belong to zero or one scene.
 */
var Node = /** @class */ (function () {
    function Node() {
        this.id = this.createId();
        this._children = [];
        // Used to check for duplicate nodes.
        this.childSet = {}; // new Set<Node>()
        /**
         * Determines the order of rendering of this node within the parent node.
         * By default the child nodes are rendered in the order in which they were added.
         */
        this.zIndex = 0;
        /**
         * Each time a property of the node that effects how it renders changes
         * the `dirty` property of the node should be set to `true`. The
         * change to the `dirty` property of the node will propagate up to its
         * parents and eventually to the scene, at which point an animation frame
         * callback will be scheduled to rerender the scene and its nodes and reset
         * the `dirty` flags of all nodes and the scene back to `false`.
         * Since we don't render changes to node properties immediately, we can
         * set as many as we like and the rendering will still only happen once
         * on the next animation frame callback.
         * The animation frame callback is only scheduled, if it hasn't been already.
         */
        this._dirty = false;
    }
    Node.prototype.createId = function () {
        return this.constructor.name + '-' + (Node.id++);
    };
    ;
    Object.defineProperty(Node.prototype, "scene", {
        get: function () {
            return this._scene;
        },
        set: function (value) {
            this._scene = value;
            this.children.forEach(function (child) { return child.scene = value; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        set: function (value) {
            this._parent = value;
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
    Node.prototype.add = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args.forEach(function (node) {
            if (!_this.childSet[node.id]) {
                _this._children.push(node);
                _this.childSet[node.id] = true;
                node.parent = _this;
                node.scene = _this.scene;
            }
            else {
                // Cast to `any` to avoid `Property 'name' does not exist on type 'Function'`.
                throw new Error("Duplicate " + node.constructor.name + " node: " + node);
            }
        });
    };
    Object.defineProperty(Node.prototype, "dirty", {
        get: function () {
            return this._dirty;
        },
        set: function (dirty) {
            this._dirty = dirty;
            if (dirty) {
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
    Node.createSvgMatrix = function () {
        return Node.svg.createSVGMatrix();
    };
    Node.createSvgMatrixFrom = function (a, b, c, d, e, f) {
        var m = Node.svg.createSVGMatrix();
        m.a = a;
        m.b = b;
        m.c = c;
        m.d = d;
        m.e = e;
        m.f = f;
        return m;
    };
    Node.createDomMatrix = function (a, b, c, d, e, f) {
        var m = new DOMMatrix();
        m.a = a;
        m.b = b;
        m.c = c;
        m.d = d;
        m.e = e;
        m.f = f;
        return m;
    };
    // Uniquely identify nodes (to check for duplicates, for example).
    Node.id = 1;
    /*

    As of end of 2018:

    DOMMatrix !== SVGMatrix but
    DOMMatrix.constructor === SVGMatrix.constructor

    This works in Chrome and Safari:

    const p1 = new Path2D();
    const p2 = new Path2D();
    const m = new DOMMatrix();
    p1.addPath(p2, m);

    Firefox - TypeError: Argument 2 of Path2D.addPath does not implement interface SVGMatrix.
    See: https://bugzilla.mozilla.org/show_bug.cgi?id=1514538

    Edge - doesn't have DOMMatrix.
    IE11 - game over.

     */
    Node.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    return Node;
}());
exports.Node = Node;
