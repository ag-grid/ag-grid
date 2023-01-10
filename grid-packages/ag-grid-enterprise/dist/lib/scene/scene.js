"use strict";
var __assign = (this && this.__assign) || function () {
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scene = void 0;
var hdpiCanvas_1 = require("../canvas/hdpiCanvas");
var node_1 = require("./node");
var id_1 = require("../util/id");
var group_1 = require("./group");
var hdpiOffscreenCanvas_1 = require("../canvas/hdpiOffscreenCanvas");
var window_1 = require("../util/window");
var compare_1 = require("../util/compare");
var Scene = /** @class */ (function () {
    function Scene(opts) {
        var _a, _b;
        this.id = id_1.createId(this);
        this.layers = [];
        this._nextZIndex = 0;
        this._nextLayerId = 0;
        this._dirty = false;
        this._root = null;
        this.debug = {
            dirtyTree: false,
            stats: false,
            renderBoundingBoxes: false,
            consoleLog: false,
        };
        var _c = opts.document, document = _c === void 0 ? window.document : _c, _d = opts.mode, mode = _d === void 0 ? window_1.windowValue('agChartsSceneRenderModel') || 'adv-composite' : _d, width = opts.width, height = opts.height, _e = opts.overrideDevicePixelRatio, overrideDevicePixelRatio = _e === void 0 ? undefined : _e;
        this.overrideDevicePixelRatio = overrideDevicePixelRatio;
        this.opts = { document: document, mode: mode };
        this.debug.consoleLog = window_1.windowValue('agChartsDebug') === true;
        this.debug.stats = (_a = window_1.windowValue('agChartsSceneStats')) !== null && _a !== void 0 ? _a : false;
        this.debug.dirtyTree = (_b = window_1.windowValue('agChartsSceneDirtyTree')) !== null && _b !== void 0 ? _b : false;
        this.canvas = new hdpiCanvas_1.HdpiCanvas({ document: document, width: width, height: height, overrideDevicePixelRatio: overrideDevicePixelRatio });
        this.ctx = this.canvas.context;
    }
    Object.defineProperty(Scene.prototype, "container", {
        get: function () {
            return this.canvas.container;
        },
        set: function (value) {
            this.canvas.container = value;
        },
        enumerable: false,
        configurable: true
    });
    Scene.prototype.download = function (fileName, fileFormat) {
        this.canvas.download(fileName, fileFormat);
    };
    Scene.prototype.getDataURL = function (type) {
        return this.canvas.getDataURL(type);
    };
    Object.defineProperty(Scene.prototype, "width", {
        get: function () {
            return this.pendingSize ? this.pendingSize[0] : this.canvas.width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "height", {
        get: function () {
            return this.pendingSize ? this.pendingSize[1] : this.canvas.height;
        },
        enumerable: false,
        configurable: true
    });
    Scene.prototype.resize = function (width, height) {
        width = Math.round(width);
        height = Math.round(height);
        // HdpiCanvas doesn't allow width/height <= 0.
        var lessThanZero = width <= 0 || height <= 0;
        var unchanged = width === this.width && height === this.height;
        if (unchanged || lessThanZero) {
            return false;
        }
        this.pendingSize = [width, height];
        this.markDirty();
        return true;
    };
    Scene.prototype.addLayer = function (opts) {
        var _a;
        var mode = this.opts.mode;
        var layeredModes = ['composite', 'dom-composite', 'adv-composite'];
        if (!layeredModes.includes(mode)) {
            return undefined;
        }
        var _b = opts.zIndex, zIndex = _b === void 0 ? this._nextZIndex++ : _b, name = opts.name, zIndexSubOrder = opts.zIndexSubOrder, getComputedOpacity = opts.getComputedOpacity, getVisibility = opts.getVisibility;
        var _c = this, width = _c.width, height = _c.height, overrideDevicePixelRatio = _c.overrideDevicePixelRatio;
        var domLayer = mode === 'dom-composite';
        var advLayer = mode === 'adv-composite';
        var canvas = !advLayer || !hdpiOffscreenCanvas_1.HdpiOffscreenCanvas.isSupported()
            ? new hdpiCanvas_1.HdpiCanvas({
                document: this.opts.document,
                width: width,
                height: height,
                domLayer: domLayer,
                zIndex: zIndex,
                name: name,
                overrideDevicePixelRatio: overrideDevicePixelRatio,
            })
            : new hdpiOffscreenCanvas_1.HdpiOffscreenCanvas({
                width: width,
                height: height,
                overrideDevicePixelRatio: overrideDevicePixelRatio,
            });
        var newLayer = {
            id: this._nextLayerId++,
            name: name,
            zIndex: zIndex,
            zIndexSubOrder: zIndexSubOrder,
            canvas: canvas,
            getComputedOpacity: getComputedOpacity,
            getVisibility: getVisibility,
        };
        if (zIndex >= this._nextZIndex) {
            this._nextZIndex = zIndex + 1;
        }
        this.layers.push(newLayer);
        this.sortLayers();
        if (domLayer) {
            var domCanvases = this.layers
                .map(function (v) { return v.canvas; })
                .filter(function (v) { return v instanceof hdpiCanvas_1.HdpiCanvas; });
            var newLayerIndex = domCanvases.findIndex(function (v) { return v === canvas; });
            var lastLayer = (_a = domCanvases[newLayerIndex - 1]) !== null && _a !== void 0 ? _a : this.canvas;
            lastLayer.element.insertAdjacentElement('afterend', canvas.element);
        }
        if (this.debug.consoleLog) {
            console.log({ layers: this.layers });
        }
        return newLayer.canvas;
    };
    Scene.prototype.removeLayer = function (canvas) {
        var index = this.layers.findIndex(function (l) { return l.canvas === canvas; });
        if (index >= 0) {
            this.layers.splice(index, 1);
            canvas.destroy();
            this.markDirty();
            if (this.debug.consoleLog) {
                console.log({ layers: this.layers });
            }
        }
    };
    Scene.prototype.moveLayer = function (canvas, newZIndex, newZIndexSubOrder) {
        var layer = this.layers.find(function (l) { return l.canvas === canvas; });
        if (layer) {
            layer.zIndex = newZIndex;
            layer.zIndexSubOrder = newZIndexSubOrder;
            this.sortLayers();
            this.markDirty();
            if (this.debug.consoleLog) {
                console.log({ layers: this.layers });
            }
        }
    };
    Scene.prototype.sortLayers = function () {
        this.layers.sort(function (a, b) {
            var _a, _b;
            return compare_1.compoundAscending(__spread([a.zIndex], ((_a = a.zIndexSubOrder) !== null && _a !== void 0 ? _a : [undefined, undefined]), [a.id]), __spread([b.zIndex], ((_b = b.zIndexSubOrder) !== null && _b !== void 0 ? _b : [undefined, undefined]), [b.id]), compare_1.ascendingStringNumberUndefined);
        });
    };
    Scene.prototype.markDirty = function () {
        this._dirty = true;
    };
    Object.defineProperty(Scene.prototype, "dirty", {
        get: function () {
            return this._dirty;
        },
        enumerable: false,
        configurable: true
    });
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
            this.markDirty();
        },
        enumerable: false,
        configurable: true
    });
    /** Alternative to destroy() that preserves re-usable resources. */
    Scene.prototype.strip = function () {
        var e_1, _a;
        var layers = this.layers;
        try {
            for (var layers_1 = __values(layers), layers_1_1 = layers_1.next(); !layers_1_1.done; layers_1_1 = layers_1.next()) {
                var layer = layers_1_1.value;
                layer.canvas.destroy();
                delete layer['canvas'];
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (layers_1_1 && !layers_1_1.done && (_a = layers_1.return)) _a.call(layers_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        layers.splice(0, layers.length);
        this.root = null;
        this._dirty = false;
        this.ctx.resetTransform();
    };
    Scene.prototype.destroy = function () {
        this.container = undefined;
        this.strip();
        this.canvas.destroy();
        Object.assign(this, { canvas: undefined, ctx: undefined });
    };
    Scene.prototype.render = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, debugSplitTimes, _c, extraDebugStats, _d, canvas, ctx, root, layers, pendingSize, mode, renderCtx, canvasCleared, _e, dirtyTree, paths;
            var _f;
            return __generator(this, function (_g) {
                _a = opts || {}, _b = _a.debugSplitTimes, debugSplitTimes = _b === void 0 ? [performance.now()] : _b, _c = _a.extraDebugStats, extraDebugStats = _c === void 0 ? {} : _c;
                _d = this, canvas = _d.canvas, ctx = _d.ctx, root = _d.root, layers = _d.layers, pendingSize = _d.pendingSize, mode = _d.opts.mode;
                if (pendingSize) {
                    (_f = this.canvas).resize.apply(_f, __spread(pendingSize));
                    this.layers.forEach(function (layer) {
                        var _a;
                        return (_a = layer.canvas).resize.apply(_a, __spread(pendingSize));
                    });
                    this.pendingSize = undefined;
                }
                if (root && !root.visible) {
                    this._dirty = false;
                    return [2 /*return*/];
                }
                if (root && !this.dirty) {
                    if (this.debug.consoleLog) {
                        console.log('no-op', {
                            redrawType: node_1.RedrawType[root.dirty],
                            tree: this.buildTree(root),
                        });
                    }
                    this.debugStats(debugSplitTimes, ctx, undefined, extraDebugStats);
                    return [2 /*return*/];
                }
                renderCtx = {
                    ctx: ctx,
                    forceRender: true,
                    resized: !!pendingSize,
                };
                if (this.debug.stats === 'detailed') {
                    renderCtx.stats = { layersRendered: 0, layersSkipped: 0, nodesRendered: 0, nodesSkipped: 0 };
                }
                canvasCleared = false;
                if (!root || root.dirty >= node_1.RedrawType.TRIVIAL) {
                    // start with a blank canvas, clear previous drawing
                    canvasCleared = true;
                    canvas.clear();
                }
                if (root && this.debug.dirtyTree) {
                    _e = this.buildDirtyTree(root), dirtyTree = _e.dirtyTree, paths = _e.paths;
                    console.log({ dirtyTree: dirtyTree, paths: paths });
                }
                if (root && canvasCleared) {
                    if (this.debug.consoleLog) {
                        console.log('before', {
                            redrawType: node_1.RedrawType[root.dirty],
                            canvasCleared: canvasCleared,
                            tree: this.buildTree(root),
                        });
                    }
                    if (root.visible) {
                        ctx.save();
                        root.render(renderCtx);
                        ctx.restore();
                    }
                }
                if (mode !== 'dom-composite' && layers.length > 0 && canvasCleared) {
                    ctx.save();
                    ctx.setTransform(1 / canvas.pixelRatio, 0, 0, 1 / canvas.pixelRatio, 0, 0);
                    layers.forEach(function (_a) {
                        var _b = _a.canvas, imageSource = _b.imageSource, enabled = _b.enabled, getComputedOpacity = _a.getComputedOpacity, getVisibility = _a.getVisibility;
                        if (!enabled || !getVisibility()) {
                            return;
                        }
                        ctx.globalAlpha = getComputedOpacity();
                        ctx.drawImage(imageSource, 0, 0);
                    });
                    ctx.restore();
                }
                this._dirty = false;
                this.debugStats(debugSplitTimes, ctx, renderCtx.stats, extraDebugStats);
                if (root && this.debug.consoleLog) {
                    console.log('after', { redrawType: node_1.RedrawType[root.dirty], canvasCleared: canvasCleared, tree: this.buildTree(root) });
                }
                return [2 /*return*/];
            });
        });
    };
    Scene.prototype.debugStats = function (debugSplitTimes, ctx, renderCtxStats, extraDebugStats) {
        var e_2, _a;
        if (extraDebugStats === void 0) { extraDebugStats = {}; }
        var end = performance.now();
        if (this.debug.stats) {
            var start = debugSplitTimes[0];
            debugSplitTimes.push(end);
            var pct = function (rendered, skipped) {
                var total = rendered + skipped;
                return rendered + " / " + total + " (" + Math.round((100 * rendered) / total) + "%)";
            };
            var time_1 = function (start, end) {
                return Math.round((end - start) * 100) / 100 + "ms";
            };
            var _b = renderCtxStats !== null && renderCtxStats !== void 0 ? renderCtxStats : {}, _c = _b.layersRendered, layersRendered = _c === void 0 ? 0 : _c, _d = _b.layersSkipped, layersSkipped = _d === void 0 ? 0 : _d, _e = _b.nodesRendered, nodesRendered = _e === void 0 ? 0 : _e, _f = _b.nodesSkipped, nodesSkipped = _f === void 0 ? 0 : _f;
            var splits = debugSplitTimes
                .map(function (t, i) { return (i > 0 ? time_1(debugSplitTimes[i - 1], t) : null); })
                .filter(function (v) { return v != null; })
                .join(' + ');
            var extras = Object.entries(extraDebugStats)
                .map(function (_a) {
                var _b = __read(_a, 2), k = _b[0], v = _b[1];
                return k + ": " + v;
            })
                .join(' ; ');
            var stats = [
                time_1(start, end) + " (" + splits + ")",
                "" + extras,
                this.debug.stats === 'detailed' ? "Layers: " + pct(layersRendered, layersSkipped) : null,
                this.debug.stats === 'detailed' ? "Nodes: " + pct(nodesRendered, nodesSkipped) : null,
            ].filter(function (v) { return v != null; });
            var lineHeight = 15;
            ctx.save();
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 200, 10 + lineHeight * stats.length);
            ctx.fillStyle = 'black';
            var index = 0;
            try {
                for (var stats_1 = __values(stats), stats_1_1 = stats_1.next(); !stats_1_1.done; stats_1_1 = stats_1.next()) {
                    var stat = stats_1_1.value;
                    ctx.fillText(stat, 2, 10 + index++ * lineHeight);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (stats_1_1 && !stats_1_1.done && (_a = stats_1.return)) _a.call(stats_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            ctx.restore();
        }
    };
    Scene.prototype.buildTree = function (node) {
        var _this = this;
        var _a;
        var name = (_a = (node instanceof group_1.Group ? node.name : null)) !== null && _a !== void 0 ? _a : node.id;
        return __assign({ name: name,
            node: node, dirty: node_1.RedrawType[node.dirty] }, node.children
            .map(function (c) { return _this.buildTree(c); })
            .reduce(function (result, childTree) {
            var treeNodeName = childTree.name, _a = childTree.node, visible = _a.visible, opacity = _a.opacity, zIndex = _a.zIndex, zIndexSubOrder = _a.zIndexSubOrder, childNode = childTree.node;
            if (!visible || opacity <= 0) {
                treeNodeName = "(" + treeNodeName + ")";
            }
            if (childNode instanceof group_1.Group && childNode.isLayer()) {
                treeNodeName = "*" + treeNodeName + "*";
            }
            var key = [
                "" + (treeNodeName !== null && treeNodeName !== void 0 ? treeNodeName : '<unknown>'),
                "z: " + zIndex,
                zIndexSubOrder && "zo: " + zIndexSubOrder.join(' / '),
            ]
                .filter(function (v) { return !!v; })
                .join(' ');
            result[key] = childTree;
            return result;
        }, {}));
    };
    Scene.prototype.buildDirtyTree = function (node) {
        var _this = this;
        var _a;
        if (node.dirty === node_1.RedrawType.NONE) {
            return { dirtyTree: {}, paths: [] };
        }
        var childrenDirtyTree = node.children.map(function (c) { return _this.buildDirtyTree(c); }).filter(function (c) { return c.paths.length > 0; });
        var name = (_a = (node instanceof group_1.Group ? node.name : null)) !== null && _a !== void 0 ? _a : node.id;
        var paths = childrenDirtyTree.length === 0
            ? [name]
            : childrenDirtyTree
                .map(function (c) { return c.paths; })
                .reduce(function (r, p) { return r.concat(p); }, [])
                .map(function (p) { return name + "." + p; });
        return {
            dirtyTree: __assign({ name: name,
                node: node, dirty: node_1.RedrawType[node.dirty] }, childrenDirtyTree
                .map(function (c) { return c.dirtyTree; })
                .filter(function (t) { return t.dirty !== undefined; })
                .reduce(function (result, childTree) {
                result[childTree.name || '<unknown>'] = childTree;
                return result;
            }, {})),
            paths: paths,
        };
    };
    Scene.className = 'Scene';
    return Scene;
}());
exports.Scene = Scene;
//# sourceMappingURL=scene.js.map