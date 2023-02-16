"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scene = void 0;
const hdpiCanvas_1 = require("../canvas/hdpiCanvas");
const node_1 = require("./node");
const id_1 = require("../util/id");
const group_1 = require("./group");
const hdpiOffscreenCanvas_1 = require("../canvas/hdpiOffscreenCanvas");
const window_1 = require("../util/window");
const compare_1 = require("../util/compare");
function buildSceneNodeHighlight() {
    var _a;
    let config = (_a = window_1.windowValue('agChartsSceneDebug')) !== null && _a !== void 0 ? _a : [];
    if (typeof config === 'string') {
        config = [config];
    }
    const result = [];
    config.forEach((name) => {
        switch (name) {
            case 'layout':
                result.push('seriesRoot', 'legend', 'root', /.*Axis-[0-9]+-axis.*/);
                break;
            default:
                result.push(name);
        }
    });
    return result;
}
class Scene {
    constructor(opts) {
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
            sceneNodeHighlight: [],
        };
        const { document = window.document, mode = window_1.windowValue('agChartsSceneRenderModel') || 'adv-composite', width, height, overrideDevicePixelRatio = undefined, } = opts;
        this.overrideDevicePixelRatio = overrideDevicePixelRatio;
        this.opts = { document, mode };
        this.debug.consoleLog = window_1.windowValue('agChartsDebug') === true;
        this.debug.stats = (_a = window_1.windowValue('agChartsSceneStats')) !== null && _a !== void 0 ? _a : false;
        this.debug.dirtyTree = (_b = window_1.windowValue('agChartsSceneDirtyTree')) !== null && _b !== void 0 ? _b : false;
        this.debug.sceneNodeHighlight = buildSceneNodeHighlight();
        this.canvas = new hdpiCanvas_1.HdpiCanvas({ document, width, height, overrideDevicePixelRatio });
        this.ctx = this.canvas.context;
    }
    set container(value) {
        this.canvas.container = value;
    }
    get container() {
        return this.canvas.container;
    }
    download(fileName, fileFormat) {
        this.canvas.download(fileName, fileFormat);
    }
    getDataURL(type) {
        return this.canvas.getDataURL(type);
    }
    get width() {
        return this.pendingSize ? this.pendingSize[0] : this.canvas.width;
    }
    get height() {
        return this.pendingSize ? this.pendingSize[1] : this.canvas.height;
    }
    resize(width, height) {
        width = Math.round(width);
        height = Math.round(height);
        // HdpiCanvas doesn't allow width/height <= 0.
        const lessThanZero = width <= 0 || height <= 0;
        const unchanged = width === this.width && height === this.height;
        if (unchanged || lessThanZero) {
            return false;
        }
        this.pendingSize = [width, height];
        this.markDirty();
        return true;
    }
    addLayer(opts) {
        var _a;
        const { mode } = this.opts;
        const layeredModes = ['composite', 'dom-composite', 'adv-composite'];
        if (!layeredModes.includes(mode)) {
            return undefined;
        }
        const { zIndex = this._nextZIndex++, name, zIndexSubOrder, getComputedOpacity, getVisibility } = opts;
        const { width, height, overrideDevicePixelRatio } = this;
        const domLayer = mode === 'dom-composite';
        const advLayer = mode === 'adv-composite';
        const canvas = !advLayer || !hdpiOffscreenCanvas_1.HdpiOffscreenCanvas.isSupported()
            ? new hdpiCanvas_1.HdpiCanvas({
                document: this.opts.document,
                width,
                height,
                domLayer,
                zIndex,
                name,
                overrideDevicePixelRatio,
            })
            : new hdpiOffscreenCanvas_1.HdpiOffscreenCanvas({
                width,
                height,
                overrideDevicePixelRatio,
            });
        const newLayer = {
            id: this._nextLayerId++,
            name,
            zIndex,
            zIndexSubOrder,
            canvas,
            getComputedOpacity,
            getVisibility,
        };
        if (zIndex >= this._nextZIndex) {
            this._nextZIndex = zIndex + 1;
        }
        this.layers.push(newLayer);
        this.sortLayers();
        if (domLayer) {
            const domCanvases = this.layers
                .map((v) => v.canvas)
                .filter((v) => v instanceof hdpiCanvas_1.HdpiCanvas);
            const newLayerIndex = domCanvases.findIndex((v) => v === canvas);
            const lastLayer = (_a = domCanvases[newLayerIndex - 1]) !== null && _a !== void 0 ? _a : this.canvas;
            lastLayer.element.insertAdjacentElement('afterend', canvas.element);
        }
        if (this.debug.consoleLog) {
            console.log({ layers: this.layers });
        }
        return newLayer.canvas;
    }
    removeLayer(canvas) {
        const index = this.layers.findIndex((l) => l.canvas === canvas);
        if (index >= 0) {
            this.layers.splice(index, 1);
            canvas.destroy();
            this.markDirty();
            if (this.debug.consoleLog) {
                console.log({ layers: this.layers });
            }
        }
    }
    moveLayer(canvas, newZIndex, newZIndexSubOrder) {
        const layer = this.layers.find((l) => l.canvas === canvas);
        if (layer) {
            layer.zIndex = newZIndex;
            layer.zIndexSubOrder = newZIndexSubOrder;
            this.sortLayers();
            this.markDirty();
            if (this.debug.consoleLog) {
                console.log({ layers: this.layers });
            }
        }
    }
    sortLayers() {
        this.layers.sort((a, b) => {
            var _a, _b;
            return compare_1.compoundAscending([a.zIndex, ...((_a = a.zIndexSubOrder) !== null && _a !== void 0 ? _a : [undefined, undefined]), a.id], [b.zIndex, ...((_b = b.zIndexSubOrder) !== null && _b !== void 0 ? _b : [undefined, undefined]), b.id], compare_1.ascendingStringNumberUndefined);
        });
    }
    markDirty() {
        this._dirty = true;
    }
    get dirty() {
        return this._dirty;
    }
    set root(node) {
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
    }
    get root() {
        return this._root;
    }
    /** Alternative to destroy() that preserves re-usable resources. */
    strip() {
        const { layers } = this;
        for (const layer of layers) {
            layer.canvas.destroy();
            delete layer['canvas'];
        }
        layers.splice(0, layers.length);
        this.root = null;
        this._dirty = false;
        this.ctx.resetTransform();
    }
    destroy() {
        this.container = undefined;
        this.strip();
        this.canvas.destroy();
        Object.assign(this, { canvas: undefined, ctx: undefined });
    }
    render(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { debugSplitTimes = [performance.now()], extraDebugStats = {} } = opts || {};
            const { canvas, ctx, root, layers, pendingSize, opts: { mode }, } = this;
            if (pendingSize) {
                this.canvas.resize(...pendingSize);
                this.layers.forEach((layer) => layer.canvas.resize(...pendingSize));
                this.pendingSize = undefined;
            }
            if (root && !root.visible) {
                this._dirty = false;
                return;
            }
            if (root && !this.dirty) {
                if (this.debug.consoleLog) {
                    console.log('no-op', {
                        redrawType: node_1.RedrawType[root.dirty],
                        tree: this.buildTree(root),
                    });
                }
                this.debugStats(debugSplitTimes, ctx, undefined, extraDebugStats);
                return;
            }
            const renderCtx = {
                ctx,
                forceRender: true,
                resized: !!pendingSize,
                debugNodes: {},
            };
            if (this.debug.stats === 'detailed') {
                renderCtx.stats = { layersRendered: 0, layersSkipped: 0, nodesRendered: 0, nodesSkipped: 0 };
            }
            let canvasCleared = false;
            if (!root || root.dirty >= node_1.RedrawType.TRIVIAL) {
                // start with a blank canvas, clear previous drawing
                canvasCleared = true;
                canvas.clear();
            }
            if (root && this.debug.dirtyTree) {
                const { dirtyTree, paths } = this.buildDirtyTree(root);
                console.log({ dirtyTree, paths });
            }
            if (root && canvasCleared) {
                if (this.debug.consoleLog) {
                    console.log('before', {
                        redrawType: node_1.RedrawType[root.dirty],
                        canvasCleared,
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
                layers.forEach(({ canvas: { imageSource, enabled }, getComputedOpacity, getVisibility }) => {
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
            this.debugSceneNodeHighlight(ctx, this.debug.sceneNodeHighlight, renderCtx.debugNodes);
            if (root && this.debug.consoleLog) {
                console.log('after', { redrawType: node_1.RedrawType[root.dirty], canvasCleared, tree: this.buildTree(root) });
            }
        });
    }
    debugStats(debugSplitTimes, ctx, renderCtxStats, extraDebugStats = {}) {
        const end = performance.now();
        if (this.debug.stats) {
            const start = debugSplitTimes[0];
            debugSplitTimes.push(end);
            const pct = (rendered, skipped) => {
                const total = rendered + skipped;
                return `${rendered} / ${total} (${Math.round((100 * rendered) / total)}%)`;
            };
            const time = (start, end) => {
                return `${Math.round((end - start) * 100) / 100}ms`;
            };
            const { layersRendered = 0, layersSkipped = 0, nodesRendered = 0, nodesSkipped = 0 } = renderCtxStats !== null && renderCtxStats !== void 0 ? renderCtxStats : {};
            const splits = debugSplitTimes
                .map((t, i) => (i > 0 ? time(debugSplitTimes[i - 1], t) : null))
                .filter((v) => v != null)
                .join(' + ');
            const extras = Object.entries(extraDebugStats)
                .map(([k, v]) => `${k}: ${v}`)
                .join(' ; ');
            const stats = [
                `${time(start, end)} (${splits})`,
                `${extras}`,
                this.debug.stats === 'detailed' ? `Layers: ${pct(layersRendered, layersSkipped)}` : null,
                this.debug.stats === 'detailed' ? `Nodes: ${pct(nodesRendered, nodesSkipped)}` : null,
            ].filter((v) => v != null);
            const lineHeight = 15;
            ctx.save();
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 200, 10 + lineHeight * stats.length);
            ctx.fillStyle = 'black';
            let index = 0;
            for (const stat of stats) {
                ctx.fillText(stat, 2, 10 + index++ * lineHeight);
            }
            ctx.restore();
        }
    }
    debugSceneNodeHighlight(ctx, sceneNodeHighlight, debugNodes) {
        var _a;
        const regexpPredicate = (matcher) => (n) => {
            if (matcher.test(n.id)) {
                return true;
            }
            return n instanceof group_1.Group && n.name != null && matcher.test(n.name);
        };
        const stringPredicate = (match) => (n) => {
            if (match === n.id) {
                return true;
            }
            return n instanceof group_1.Group && n.name != null && match === n.name;
        };
        for (const next of sceneNodeHighlight) {
            if (typeof next === 'string' && debugNodes[next] != null)
                continue;
            const predicate = typeof next === 'string' ? stringPredicate(next) : regexpPredicate(next);
            const nodes = (_a = this.root) === null || _a === void 0 ? void 0 : _a.findNodes(predicate);
            if (!nodes || nodes.length === 0) {
                console.warn(`AG Charts - No debugging node with id [${next}] in scene graph.`);
                continue;
            }
            for (const node of nodes) {
                if (node instanceof group_1.Group && node.name) {
                    debugNodes[node.name] = node;
                }
                else {
                    debugNodes[node.id] = node;
                }
            }
        }
        ctx.save();
        for (const [name, node] of Object.entries(debugNodes)) {
            const bbox = node.computeTransformedBBox();
            if (!bbox) {
                console.warn(`AG Charts - No bbox for debugged node [${name}].`);
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
            ctx.strokeText(name, bbox.x, bbox.y, bbox.width);
            ctx.fillText(name, bbox.x, bbox.y, bbox.width);
        }
        ctx.restore();
    }
    buildTree(node) {
        var _a;
        const name = (_a = (node instanceof group_1.Group ? node.name : null)) !== null && _a !== void 0 ? _a : node.id;
        return Object.assign({ name,
            node, dirty: node_1.RedrawType[node.dirty] }, node.children
            .map((c) => this.buildTree(c))
            .reduce((result, childTree) => {
            let { name: treeNodeName, node: { visible, opacity, zIndex, zIndexSubOrder }, node: childNode, } = childTree;
            if (!visible || opacity <= 0) {
                treeNodeName = `(${treeNodeName})`;
            }
            if (childNode instanceof group_1.Group && childNode.isLayer()) {
                treeNodeName = `*${treeNodeName}*`;
            }
            const key = [
                `${treeNodeName !== null && treeNodeName !== void 0 ? treeNodeName : '<unknown>'}`,
                `z: ${zIndex}`,
                zIndexSubOrder && `zo: ${zIndexSubOrder.join(' / ')}`,
            ]
                .filter((v) => !!v)
                .join(' ');
            result[key] = childTree;
            return result;
        }, {}));
    }
    buildDirtyTree(node) {
        var _a;
        if (node.dirty === node_1.RedrawType.NONE) {
            return { dirtyTree: {}, paths: [] };
        }
        const childrenDirtyTree = node.children.map((c) => this.buildDirtyTree(c)).filter((c) => c.paths.length > 0);
        const name = (_a = (node instanceof group_1.Group ? node.name : null)) !== null && _a !== void 0 ? _a : node.id;
        const paths = childrenDirtyTree.length === 0
            ? [name]
            : childrenDirtyTree
                .map((c) => c.paths)
                .reduce((r, p) => r.concat(p), [])
                .map((p) => `${name}.${p}`);
        return {
            dirtyTree: Object.assign({ name,
                node, dirty: node_1.RedrawType[node.dirty] }, childrenDirtyTree
                .map((c) => c.dirtyTree)
                .filter((t) => t.dirty !== undefined)
                .reduce((result, childTree) => {
                result[childTree.name || '<unknown>'] = childTree;
                return result;
            }, {})),
            paths,
        };
    }
}
exports.Scene = Scene;
Scene.className = 'Scene';
