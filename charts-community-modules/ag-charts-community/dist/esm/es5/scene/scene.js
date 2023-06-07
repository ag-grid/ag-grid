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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
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
import { HdpiCanvas } from '../canvas/hdpiCanvas';
import { RedrawType } from './node';
import { createId } from '../util/id';
import { Group } from './group';
import { HdpiOffscreenCanvas } from '../canvas/hdpiOffscreenCanvas';
import { windowValue } from '../util/window';
import { ascendingStringNumberUndefined, compoundAscending } from '../util/compare';
import { Logger } from '../util/logger';
function buildSceneNodeHighlight() {
    var _a;
    var config = (_a = windowValue('agChartsSceneDebug')) !== null && _a !== void 0 ? _a : [];
    if (typeof config === 'string') {
        config = [config];
    }
    var result = [];
    config.forEach(function (name) {
        if (name === 'layout') {
            result.push('seriesRoot', 'legend', 'root', /.*Axis-\d+-axis.*/);
        }
        else {
            result.push(name);
        }
    });
    return result;
}
var Scene = /** @class */ (function () {
    function Scene(opts) {
        var _a, _b, _c;
        this.id = createId(this);
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
            sceneNodeHighlight: [],
        };
        var _d = opts.document, document = _d === void 0 ? window.document : _d, _e = opts.mode, mode = _e === void 0 ? (_a = windowValue('agChartsSceneRenderModel')) !== null && _a !== void 0 ? _a : 'adv-composite' : _e, width = opts.width, height = opts.height, _f = opts.overrideDevicePixelRatio, overrideDevicePixelRatio = _f === void 0 ? undefined : _f;
        this.overrideDevicePixelRatio = overrideDevicePixelRatio;
        this.opts = { document: document, mode: mode };
        this.debug.consoleLog = windowValue('agChartsDebug') === true;
        this.debug.stats = (_b = windowValue('agChartsSceneStats')) !== null && _b !== void 0 ? _b : false;
        this.debug.dirtyTree = (_c = windowValue('agChartsSceneDirtyTree')) !== null && _c !== void 0 ? _c : false;
        this.debug.sceneNodeHighlight = buildSceneNodeHighlight();
        this.canvas = new HdpiCanvas({ document: document, width: width, height: height, overrideDevicePixelRatio: overrideDevicePixelRatio });
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
        var nan = isNaN(width) || isNaN(height);
        var unchanged = width === this.width && height === this.height;
        if (unchanged || nan || lessThanZero) {
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
        var canvas = !advLayer || !HdpiOffscreenCanvas.isSupported()
            ? new HdpiCanvas({
                document: this.opts.document,
                width: width,
                height: height,
                domLayer: domLayer,
                zIndex: zIndex,
                name: name,
                overrideDevicePixelRatio: overrideDevicePixelRatio,
            })
            : new HdpiOffscreenCanvas({
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
                .filter(function (v) { return v instanceof HdpiCanvas; });
            var newLayerIndex = domCanvases.findIndex(function (v) { return v === canvas; });
            var lastLayer = (_a = domCanvases[newLayerIndex - 1]) !== null && _a !== void 0 ? _a : this.canvas;
            lastLayer.element.insertAdjacentElement('afterend', canvas.element);
        }
        if (this.debug.consoleLog) {
            Logger.debug({ layers: this.layers });
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
                Logger.debug({ layers: this.layers });
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
                Logger.debug({ layers: this.layers });
            }
        }
    };
    Scene.prototype.sortLayers = function () {
        this.layers.sort(function (a, b) {
            var _a, _b;
            return compoundAscending(__spreadArray(__spreadArray([a.zIndex], __read(((_a = a.zIndexSubOrder) !== null && _a !== void 0 ? _a : [undefined, undefined]))), [a.id]), __spreadArray(__spreadArray([b.zIndex], __read(((_b = b.zIndexSubOrder) !== null && _b !== void 0 ? _b : [undefined, undefined]))), [b.id]), ascendingStringNumberUndefined);
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
                this._root._setLayerManager();
            }
            this._root = node;
            if (node) {
                // If `node` is the root node of another scene ...
                if (node.parent === null && node.layerManager && node.layerManager !== this) {
                    node.layerManager.root = null;
                }
                node._setLayerManager(this);
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
        this.canvas.context.resetTransform();
    };
    Scene.prototype.destroy = function () {
        this.container = undefined;
        this.strip();
        this.canvas.destroy();
        Object.assign(this, { canvas: undefined, ctx: undefined });
    };
    Scene.prototype.render = function (opts) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, _c, debugSplitTimes, _d, extraDebugStats, _e, canvas, ctx, root, layers, pendingSize, mode, renderCtx, canvasCleared, _f, dirtyTree, paths;
            var _g;
            return __generator(this, function (_h) {
                _b = opts !== null && opts !== void 0 ? opts : {}, _c = _b.debugSplitTimes, debugSplitTimes = _c === void 0 ? [performance.now()] : _c, _d = _b.extraDebugStats, extraDebugStats = _d === void 0 ? {} : _d;
                _e = this, canvas = _e.canvas, ctx = _e.canvas.context, root = _e.root, layers = _e.layers, pendingSize = _e.pendingSize, mode = _e.opts.mode;
                if (pendingSize) {
                    (_g = this.canvas).resize.apply(_g, __spreadArray([], __read(pendingSize)));
                    this.layers.forEach(function (layer) {
                        var _a;
                        return (_a = layer.canvas).resize.apply(_a, __spreadArray([], __read(pendingSize)));
                    });
                    this.pendingSize = undefined;
                }
                if (root && !root.visible) {
                    this._dirty = false;
                    return [2 /*return*/];
                }
                if (root && !this.dirty) {
                    if (this.debug.consoleLog) {
                        Logger.debug('no-op', {
                            redrawType: RedrawType[root.dirty],
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
                    debugNodes: {},
                };
                if (this.debug.stats === 'detailed') {
                    renderCtx.stats = { layersRendered: 0, layersSkipped: 0, nodesRendered: 0, nodesSkipped: 0 };
                }
                canvasCleared = false;
                if (!root || root.dirty >= RedrawType.TRIVIAL) {
                    // start with a blank canvas, clear previous drawing
                    canvasCleared = true;
                    canvas.clear();
                }
                if (root && this.debug.dirtyTree) {
                    _f = this.buildDirtyTree(root), dirtyTree = _f.dirtyTree, paths = _f.paths;
                    Logger.debug({ dirtyTree: dirtyTree, paths: paths });
                }
                if (root && canvasCleared) {
                    if (this.debug.consoleLog) {
                        Logger.debug('before', {
                            redrawType: RedrawType[root.dirty],
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
                    this.sortLayers();
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
                // Check for save/restore depth of zero!
                (_a = ctx.verifyDepthZero) === null || _a === void 0 ? void 0 : _a.call(ctx);
                this._dirty = false;
                this.debugStats(debugSplitTimes, ctx, renderCtx.stats, extraDebugStats);
                this.debugSceneNodeHighlight(ctx, this.debug.sceneNodeHighlight, renderCtx.debugNodes);
                if (root && this.debug.consoleLog) {
                    Logger.debug('after', { redrawType: RedrawType[root.dirty], canvasCleared: canvasCleared, tree: this.buildTree(root) });
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
            var statsSize = stats.map(function (t) { return [t, HdpiCanvas.getTextSize(t, ctx.font)]; });
            var width = Math.max.apply(Math, __spreadArray([], __read(statsSize.map(function (_a) {
                var _b = __read(_a, 2), width = _b[1].width;
                return width;
            }))));
            var height = statsSize.reduce(function (total, _a) {
                var _b = __read(_a, 2), height = _b[1].height;
                return total + height;
            }, 0);
            ctx.save();
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = 'black';
            var y = 0;
            try {
                for (var statsSize_1 = __values(statsSize), statsSize_1_1 = statsSize_1.next(); !statsSize_1_1.done; statsSize_1_1 = statsSize_1.next()) {
                    var _g = __read(statsSize_1_1.value, 2), stat = _g[0], size = _g[1];
                    y += size.height;
                    ctx.fillText(stat, 2, y);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (statsSize_1_1 && !statsSize_1_1.done && (_a = statsSize_1.return)) _a.call(statsSize_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            ctx.restore();
        }
    };
    Scene.prototype.debugSceneNodeHighlight = function (ctx, sceneNodeHighlight, debugNodes) {
        var e_3, _a, e_4, _b, e_5, _c;
        var _d;
        var regexpPredicate = function (matcher) { return function (n) {
            if (matcher.test(n.id)) {
                return true;
            }
            return n instanceof Group && n.name != null && matcher.test(n.name);
        }; };
        var stringPredicate = function (match) { return function (n) {
            if (match === n.id) {
                return true;
            }
            return n instanceof Group && n.name != null && match === n.name;
        }; };
        try {
            for (var sceneNodeHighlight_1 = __values(sceneNodeHighlight), sceneNodeHighlight_1_1 = sceneNodeHighlight_1.next(); !sceneNodeHighlight_1_1.done; sceneNodeHighlight_1_1 = sceneNodeHighlight_1.next()) {
                var next = sceneNodeHighlight_1_1.value;
                if (typeof next === 'string' && debugNodes[next] != null)
                    continue;
                var predicate = typeof next === 'string' ? stringPredicate(next) : regexpPredicate(next);
                var nodes = (_d = this.root) === null || _d === void 0 ? void 0 : _d.findNodes(predicate);
                if (!nodes || nodes.length === 0) {
                    Logger.debug("no debugging node with id [" + next + "] in scene graph.");
                    continue;
                }
                try {
                    for (var nodes_1 = (e_4 = void 0, __values(nodes)), nodes_1_1 = nodes_1.next(); !nodes_1_1.done; nodes_1_1 = nodes_1.next()) {
                        var node = nodes_1_1.value;
                        if (node instanceof Group && node.name) {
                            debugNodes[node.name] = node;
                        }
                        else {
                            debugNodes[node.id] = node;
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (nodes_1_1 && !nodes_1_1.done && (_b = nodes_1.return)) _b.call(nodes_1);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (sceneNodeHighlight_1_1 && !sceneNodeHighlight_1_1.done && (_a = sceneNodeHighlight_1.return)) _a.call(sceneNodeHighlight_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        ctx.save();
        try {
            for (var _e = __values(Object.entries(debugNodes)), _f = _e.next(); !_f.done; _f = _e.next()) {
                var _g = __read(_f.value, 2), name_1 = _g[0], node = _g[1];
                var bbox = node.computeTransformedBBox();
                if (!bbox) {
                    Logger.debug("no bbox for debugged node [" + name_1 + "].");
                    continue;
                }
                ctx.globalAlpha = 0.8;
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 1;
                ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
                ctx.fillStyle = 'red';
                ctx.strokeStyle = 'white';
                ctx.font = '16px sans-serif';
                ctx.textBaseline = 'top';
                ctx.textAlign = 'left';
                ctx.lineWidth = 2;
                ctx.strokeText(name_1, bbox.x, bbox.y, bbox.width);
                ctx.fillText(name_1, bbox.x, bbox.y, bbox.width);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_c = _e.return)) _c.call(_e);
            }
            finally { if (e_5) throw e_5.error; }
        }
        ctx.restore();
    };
    Scene.prototype.buildTree = function (node) {
        var _this = this;
        var _a;
        var name = (_a = (node instanceof Group ? node.name : null)) !== null && _a !== void 0 ? _a : node.id;
        return __assign({ name: name, node: node, dirty: RedrawType[node.dirty] }, node.children
            .map(function (c) { return _this.buildTree(c); })
            .reduce(function (result, childTree) {
            var treeNodeName = childTree.name;
            var _a = childTree.node, visible = _a.visible, opacity = _a.opacity, zIndex = _a.zIndex, zIndexSubOrder = _a.zIndexSubOrder, childNode = childTree.node;
            if (!visible || opacity <= 0) {
                treeNodeName = "(" + treeNodeName + ")";
            }
            if (childNode instanceof Group && childNode.isLayer()) {
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
        if (node.dirty === RedrawType.NONE) {
            return { dirtyTree: {}, paths: [] };
        }
        var childrenDirtyTree = node.children.map(function (c) { return _this.buildDirtyTree(c); }).filter(function (c) { return c.paths.length > 0; });
        var name = (_a = (node instanceof Group ? node.name : null)) !== null && _a !== void 0 ? _a : node.id;
        var paths = childrenDirtyTree.length === 0
            ? [name]
            : childrenDirtyTree
                .map(function (c) { return c.paths; })
                .reduce(function (r, p) { return r.concat(p); }, [])
                .map(function (p) { return name + "." + p; });
        return {
            dirtyTree: __assign({ name: name, node: node, dirty: RedrawType[node.dirty] }, childrenDirtyTree
                .map(function (c) { return c.dirtyTree; })
                .filter(function (t) { return t.dirty !== undefined; })
                .reduce(function (result, childTree) {
                var _a;
                result[(_a = childTree.name) !== null && _a !== void 0 ? _a : '<unknown>'] = childTree;
                return result;
            }, {})),
            paths: paths,
        };
    };
    Scene.className = 'Scene';
    return Scene;
}());
export { Scene };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NlbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NlbmUvc2NlbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQVEsTUFBTSxzQkFBc0IsQ0FBQztBQUN4RCxPQUFPLEVBQVEsVUFBVSxFQUFpQixNQUFNLFFBQVEsQ0FBQztBQUN6RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDaEMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDcEUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzdDLE9BQU8sRUFBRSw4QkFBOEIsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRXBGLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQWlCeEMsU0FBUyx1QkFBdUI7O0lBQzVCLElBQUksTUFBTSxHQUFHLE1BQUMsV0FBVyxDQUFDLG9CQUFvQixDQUF1QixtQ0FBSSxFQUFFLENBQUM7SUFFNUUsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUU7UUFDNUIsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDckI7SUFFRCxJQUFNLE1BQU0sR0FBd0IsRUFBRSxDQUFDO0lBQ3ZDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFZO1FBQ3hCLElBQUksSUFBSSxLQUFLLFFBQVEsRUFBRTtZQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLG1CQUFtQixDQUFDLENBQUM7U0FDcEU7YUFBTTtZQUNILE1B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