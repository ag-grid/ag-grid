"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hdpiCanvas_1 = require("../canvas/hdpiCanvas");
const node_1 = require("./node");
const id_1 = require("../util/id");
const group_1 = require("./group");
const hdpiOffscreenCanvas_1 = require("../canvas/hdpiOffscreenCanvas");
const window_1 = require("../util/window");
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
        };
        const { document = window.document, mode = window_1.windowValue('agChartsSceneRenderModel') || 'adv-composite', width, height, } = opts;
        this.opts = { document, mode };
        this.debug.stats = (_a = window_1.windowValue('agChartsSceneStats'), (_a !== null && _a !== void 0 ? _a : false));
        this.debug.dirtyTree = (_b = window_1.windowValue('agChartsSceneDirtyTree'), (_b !== null && _b !== void 0 ? _b : false));
        this.canvas = new hdpiCanvas_1.HdpiCanvas({ document, width, height });
        this.ctx = this.canvas.context;
    }
    set container(value) {
        this.canvas.container = value;
    }
    get container() {
        return this.canvas.container;
    }
    download(fileName) {
        this.canvas.download(fileName);
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
        if (width === this.width && height === this.height) {
            return false;
        }
        else if (width <= 0 || height <= 0) {
            // HdpiCanvas doesn't allow width/height <= 0.
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
        const { zIndex = this._nextZIndex++, name } = opts || {};
        const { width, height } = this;
        const domLayer = mode === 'dom-composite';
        const advLayer = mode === 'adv-composite';
        const canvas = !advLayer || !hdpiOffscreenCanvas_1.HdpiOffscreenCanvas.isSupported() ?
            new hdpiCanvas_1.HdpiCanvas({
                document: this.opts.document,
                width,
                height,
                domLayer,
                zIndex,
                name,
            }) :
            new hdpiOffscreenCanvas_1.HdpiOffscreenCanvas({
                width,
                height,
            });
        const newLayer = {
            id: this._nextLayerId++,
            name,
            zIndex,
            canvas,
        };
        if (zIndex >= this._nextZIndex) {
            this._nextZIndex = zIndex + 1;
        }
        this.layers.push(newLayer);
        this.sortLayers();
        if (domLayer) {
            const domCanvases = this.layers.map(v => v.canvas)
                .filter((v) => v instanceof hdpiCanvas_1.HdpiCanvas);
            const newLayerIndex = domCanvases.findIndex(v => v === canvas);
            const lastLayer = (_a = domCanvases[newLayerIndex - 1], (_a !== null && _a !== void 0 ? _a : this.canvas));
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
    moveLayer(canvas, newZIndex) {
        const layer = this.layers.find((l) => l.canvas === canvas);
        if (layer) {
            layer.zIndex = newZIndex;
            this.sortLayers();
            this.markDirty();
            if (this.debug.consoleLog) {
                console.log({ layers: this.layers });
            }
        }
    }
    sortLayers() {
        this.layers.sort((a, b) => {
            const zDiff = a.zIndex - b.zIndex;
            if (zDiff !== 0) {
                return zDiff;
            }
            return a.id - b.id;
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
    }
    get root() {
        return this._root;
    }
    render(opts) {
        const { debugSplitTimes = [performance.now()], extraDebugStats = {} } = opts || {};
        const { canvas, ctx, root, layers, pendingSize, opts: { mode } } = this;
        if (pendingSize) {
            this.canvas.resize(...pendingSize);
            this.layers.forEach((layer) => layer.canvas.resize(...pendingSize));
            this.pendingSize = undefined;
        }
        if (root && !root.visible) {
            this._dirty = false;
            return;
        }
        if (!this.dirty) {
            return;
        }
        const renderCtx = {
            ctx,
            forceRender: true,
            resized: !!pendingSize,
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
                console.log('before', { redrawType: node_1.RedrawType[root.dirty], canvasCleared, tree: this.buildTree(root) });
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
            layers.forEach(({ canvas: { imageSource, enabled, opacity } }) => {
                if (!enabled) {
                    return;
                }
                ctx.globalAlpha = opacity;
                ctx.drawImage(imageSource, 0, 0);
            });
            ctx.restore();
        }
        this._dirty = false;
        const end = performance.now();
        if (this.debug.stats) {
            const start = debugSplitTimes[0];
            debugSplitTimes.push(end);
            const pct = (rendered, skipped) => {
                const total = rendered + skipped;
                return `${rendered} / ${total} (${Math.round(100 * rendered / total)}%)`;
            };
            const time = (start, end) => {
                return `${Math.round((end - start) * 100) / 100}ms`;
            };
            const { layersRendered = 0, layersSkipped = 0, nodesRendered = 0, nodesSkipped = 0 } = renderCtx.stats || {};
            const splits = debugSplitTimes
                .map((t, i) => i > 0 ? time(debugSplitTimes[i - 1], t) : null)
                .filter(v => v != null)
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
            ctx.fillRect(0, 0, 120, 10 + (lineHeight * stats.length));
            ctx.fillStyle = 'black';
            let index = 0;
            for (const stat of stats) {
                ctx.fillText(stat, 2, 10 + (index++ * lineHeight));
            }
            ctx.restore();
        }
        if (root && this.debug.consoleLog) {
            console.log('after', { redrawType: node_1.RedrawType[root.dirty], canvasCleared, tree: this.buildTree(root) });
        }
    }
    buildTree(node) {
        var _a;
        const name = (_a = (node instanceof group_1.Group ? node.name : null), (_a !== null && _a !== void 0 ? _a : node.id));
        return Object.assign({ name,
            node, dirty: node_1.RedrawType[node.dirty] }, node.children.map((c) => this.buildTree(c))
            .reduce((result, childTree) => {
            let { name, node } = childTree;
            if (!node.visible || node.opacity <= 0) {
                name = `* ${name}`;
            }
            result[(name !== null && name !== void 0 ? name : '<unknown>')] = childTree;
            return result;
        }, {}));
    }
    buildDirtyTree(node) {
        var _a;
        if (node.dirty === node_1.RedrawType.NONE) {
            return { dirtyTree: {}, paths: [] };
        }
        const childrenDirtyTree = node.children.map(c => this.buildDirtyTree(c))
            .filter(c => c.paths.length > 0);
        const name = (_a = (node instanceof group_1.Group ? node.name : null), (_a !== null && _a !== void 0 ? _a : node.id));
        const paths = childrenDirtyTree.length === 0 ? [name]
            : childrenDirtyTree.map(c => c.paths)
                .reduce((r, p) => r.concat(p), [])
                .map(p => `${name}.${p}`);
        return {
            dirtyTree: Object.assign({ name,
                node, dirty: node_1.RedrawType[node.dirty] }, childrenDirtyTree.map((c) => c.dirtyTree)
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
