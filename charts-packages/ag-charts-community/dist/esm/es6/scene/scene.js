var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { HdpiCanvas } from '../canvas/hdpiCanvas';
import { RedrawType } from './node';
import { createId } from '../util/id';
import { Group } from './group';
import { HdpiOffscreenCanvas } from '../canvas/hdpiOffscreenCanvas';
import { windowValue } from '../util/window';
import { ascendingStringNumberUndefined, compoundAscending } from '../util/compare';
export class Scene {
    constructor(opts) {
        var _a, _b;
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
        };
        const { document = window.document, mode = windowValue('agChartsSceneRenderModel') || 'adv-composite', width, height, overrideDevicePixelRatio = undefined, } = opts;
        this.overrideDevicePixelRatio = overrideDevicePixelRatio;
        this.opts = { document, mode };
        this.debug.stats = (_a = windowValue('agChartsSceneStats'), (_a !== null && _a !== void 0 ? _a : false));
        this.debug.dirtyTree = (_b = windowValue('agChartsSceneDirtyTree'), (_b !== null && _b !== void 0 ? _b : false));
        this.canvas = new HdpiCanvas({ document, width, height, overrideDevicePixelRatio });
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
        const { zIndex = this._nextZIndex++, name, zIndexSubOrder } = opts || {};
        const { width, height, overrideDevicePixelRatio } = this;
        const domLayer = mode === 'dom-composite';
        const advLayer = mode === 'adv-composite';
        const canvas = !advLayer || !HdpiOffscreenCanvas.isSupported()
            ? new HdpiCanvas({
                document: this.opts.document,
                width,
                height,
                domLayer,
                zIndex,
                name,
                overrideDevicePixelRatio,
            })
            : new HdpiOffscreenCanvas({
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
        };
        if (zIndex >= this._nextZIndex) {
            this._nextZIndex = zIndex + 1;
        }
        this.layers.push(newLayer);
        this.sortLayers();
        if (domLayer) {
            const domCanvases = this.layers
                .map((v) => v.canvas)
                .filter((v) => v instanceof HdpiCanvas);
            const newLayerIndex = domCanvases.findIndex((v) => v === canvas);
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
            return compoundAscending([a.zIndex, ...(_a = a.zIndexSubOrder, (_a !== null && _a !== void 0 ? _a : [undefined, undefined])), a.id], [b.zIndex, ...(_b = b.zIndexSubOrder, (_b !== null && _b !== void 0 ? _b : [undefined, undefined])), b.id], ascendingStringNumberUndefined);
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
    destroy() {
        this.container = undefined;
        const { layers } = this;
        for (const layer of layers) {
            layer.canvas.destroy();
            delete layer['canvas'];
        }
        layers.splice(0, layers.length);
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
                        redrawType: RedrawType[root.dirty],
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
            };
            if (this.debug.stats === 'detailed') {
                renderCtx.stats = { layersRendered: 0, layersSkipped: 0, nodesRendered: 0, nodesSkipped: 0 };
            }
            let canvasCleared = false;
            if (!root || root.dirty >= RedrawType.TRIVIAL) {
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
                        redrawType: RedrawType[root.dirty],
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
            this.debugStats(debugSplitTimes, ctx, renderCtx.stats, extraDebugStats);
            if (root && this.debug.consoleLog) {
                console.log('after', { redrawType: RedrawType[root.dirty], canvasCleared, tree: this.buildTree(root) });
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
            const { layersRendered = 0, layersSkipped = 0, nodesRendered = 0, nodesSkipped = 0 } = (renderCtxStats !== null && renderCtxStats !== void 0 ? renderCtxStats : {});
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
    buildTree(node) {
        var _a;
        const name = (_a = (node instanceof Group ? node.name : null), (_a !== null && _a !== void 0 ? _a : node.id));
        return Object.assign({ name,
            node, dirty: RedrawType[node.dirty] }, node.children
            .map((c) => this.buildTree(c))
            .reduce((result, childTree) => {
            let { name: treeNodeName, node: { visible, opacity, zIndex, zIndexSubOrder }, } = childTree;
            if (!visible || opacity <= 0) {
                treeNodeName = `( ${treeNodeName} )`;
            }
            if (node instanceof Group && node.isLayer()) {
                treeNodeName = `[ ${treeNodeName} ]`;
            }
            const key = [
                `${(treeNodeName !== null && treeNodeName !== void 0 ? treeNodeName : '<unknown>')}`,
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
        if (node.dirty === RedrawType.NONE) {
            return { dirtyTree: {}, paths: [] };
        }
        const childrenDirtyTree = node.children.map((c) => this.buildDirtyTree(c)).filter((c) => c.paths.length > 0);
        const name = (_a = (node instanceof Group ? node.name : null), (_a !== null && _a !== void 0 ? _a : node.id));
        const paths = childrenDirtyTree.length === 0
            ? [name]
            : childrenDirtyTree
                .map((c) => c.paths)
                .reduce((r, p) => r.concat(p), [])
                .map((p) => `${name}.${p}`);
        return {
            dirtyTree: Object.assign({ name,
                node, dirty: RedrawType[node.dirty] }, childrenDirtyTree
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
Scene.className = 'Scene';
