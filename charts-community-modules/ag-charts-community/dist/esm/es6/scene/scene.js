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
import { Logger } from '../util/logger';
function buildSceneNodeHighlight() {
    var _a;
    let config = (_a = windowValue('agChartsSceneDebug')) !== null && _a !== void 0 ? _a : [];
    if (typeof config === 'string') {
        config = [config];
    }
    const result = [];
    config.forEach((name) => {
        if (name === 'layout') {
            result.push('seriesRoot', 'legend', 'root', /.*Axis-\d+-axis.*/);
        }
        else {
            result.push(name);
        }
    });
    return result;
}
export class Scene {
    constructor(opts) {
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
        const { document = window.document, mode = (_a = windowValue('agChartsSceneRenderModel')) !== null && _a !== void 0 ? _a : 'adv-composite', width, height, overrideDevicePixelRatio = undefined, } = opts;
        this.overrideDevicePixelRatio = overrideDevicePixelRatio;
        this.opts = { document, mode };
        this.debug.consoleLog = windowValue('agChartsDebug') === true;
        this.debug.stats = (_b = windowValue('agChartsSceneStats')) !== null && _b !== void 0 ? _b : false;
        this.debug.dirtyTree = (_c = windowValue('agChartsSceneDirtyTree')) !== null && _c !== void 0 ? _c : false;
        this.debug.sceneNodeHighlight = buildSceneNodeHighlight();
        this.canvas = new HdpiCanvas({ document, width, height, overrideDevicePixelRatio });
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
        const nan = isNaN(width) || isNaN(height);
        const unchanged = width === this.width && height === this.height;
        if (unchanged || nan || lessThanZero) {
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
                .filter((v) => v instanceof HdpiCanvas);
            const newLayerIndex = domCanvases.findIndex((v) => v === canvas);
            const lastLayer = (_a = domCanvases[newLayerIndex - 1]) !== null && _a !== void 0 ? _a : this.canvas;
            lastLayer.element.insertAdjacentElement('afterend', canvas.element);
        }
        if (this.debug.consoleLog) {
            Logger.debug({ layers: this.layers });
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
                Logger.debug({ layers: this.layers });
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
                Logger.debug({ layers: this.layers });
            }
        }
    }
    sortLayers() {
        this.layers.sort((a, b) => {
            var _a, _b;
            return compoundAscending([a.zIndex, ...((_a = a.zIndexSubOrder) !== null && _a !== void 0 ? _a : [undefined, undefined]), a.id], [b.zIndex, ...((_b = b.zIndexSubOrder) !== null && _b !== void 0 ? _b : [undefined, undefined]), b.id], ascendingStringNumberUndefined);
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
        this.canvas.context.resetTransform();
    }
    destroy() {
        this.container = undefined;
        this.strip();
        this.canvas.destroy();
        Object.assign(this, { canvas: undefined, ctx: undefined });
    }
    render(opts) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { debugSplitTimes = [performance.now()], extraDebugStats = {} } = opts !== null && opts !== void 0 ? opts : {};
            const { canvas, canvas: { context: ctx }, root, layers, pendingSize, opts: { mode }, } = this;
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
                    Logger.debug('no-op', {
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
                debugNodes: {},
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
                Logger.debug({ dirtyTree, paths });
            }
            if (root && canvasCleared) {
                if (this.debug.consoleLog) {
                    Logger.debug('before', {
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
                this.sortLayers();
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
            // Check for save/restore depth of zero!
            (_a = ctx.verifyDepthZero) === null || _a === void 0 ? void 0 : _a.call(ctx);
            this._dirty = false;
            this.debugStats(debugSplitTimes, ctx, renderCtx.stats, extraDebugStats);
            this.debugSceneNodeHighlight(ctx, this.debug.sceneNodeHighlight, renderCtx.debugNodes);
            if (root && this.debug.consoleLog) {
                Logger.debug('after', { redrawType: RedrawType[root.dirty], canvasCleared, tree: this.buildTree(root) });
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
            const statsSize = stats.map((t) => [t, HdpiCanvas.getTextSize(t, ctx.font)]);
            const width = Math.max(...statsSize.map(([, { width }]) => width));
            const height = statsSize.reduce((total, [, { height }]) => total + height, 0);
            ctx.save();
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = 'black';
            let y = 0;
            for (const [stat, size] of statsSize) {
                y += size.height;
                ctx.fillText(stat, 2, y);
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
            return n instanceof Group && n.name != null && matcher.test(n.name);
        };
        const stringPredicate = (match) => (n) => {
            if (match === n.id) {
                return true;
            }
            return n instanceof Group && n.name != null && match === n.name;
        };
        for (const next of sceneNodeHighlight) {
            if (typeof next === 'string' && debugNodes[next] != null)
                continue;
            const predicate = typeof next === 'string' ? stringPredicate(next) : regexpPredicate(next);
            const nodes = (_a = this.root) === null || _a === void 0 ? void 0 : _a.findNodes(predicate);
            if (!nodes || nodes.length === 0) {
                Logger.debug(`no debugging node with id [${next}] in scene graph.`);
                continue;
            }
            for (const node of nodes) {
                if (node instanceof Group && node.name) {
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
                Logger.debug(`no bbox for debugged node [${name}].`);
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
        const name = (_a = (node instanceof Group ? node.name : null)) !== null && _a !== void 0 ? _a : node.id;
        return Object.assign({ name,
            node, dirty: RedrawType[node.dirty] }, node.children
            .map((c) => this.buildTree(c))
            .reduce((result, childTree) => {
            let { name: treeNodeName } = childTree;
            const { node: { visible, opacity, zIndex, zIndexSubOrder }, node: childNode, } = childTree;
            if (!visible || opacity <= 0) {
                treeNodeName = `(${treeNodeName})`;
            }
            if (childNode instanceof Group && childNode.isLayer()) {
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
        if (node.dirty === RedrawType.NONE) {
            return { dirtyTree: {}, paths: [] };
        }
        const childrenDirtyTree = node.children.map((c) => this.buildDirtyTree(c)).filter((c) => c.paths.length > 0);
        const name = (_a = (node instanceof Group ? node.name : null)) !== null && _a !== void 0 ? _a : node.id;
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
                var _a;
                result[(_a = childTree.name) !== null && _a !== void 0 ? _a : '<unknown>'] = childTree;
                return result;
            }, {})),
            paths,
        };
    }
}
Scene.className = 'Scene';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NlbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NlbmUvc2NlbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBUSxNQUFNLHNCQUFzQixDQUFDO0FBQ3hELE9BQU8sRUFBUSxVQUFVLEVBQWlCLE1BQU0sUUFBUSxDQUFDO0FBQ3pELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDdEMsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUNoQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNwRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDN0MsT0FBTyxFQUFFLDhCQUE4QixFQUFFLGlCQUFpQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFcEYsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBaUJ4QyxTQUFTLHVCQUF1Qjs7SUFDNUIsSUFBSSxNQUFNLEdBQUcsTUFBQyxXQUFXLENBQUMsb0JBQW9CLENBQXVCLG1DQUFJLEVBQUUsQ0FBQztJQUU1RSxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRTtRQUM1QixNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNyQjtJQUVELE1BQU0sTUFBTSxHQUF3QixFQUFFLENBQUM7SUFDdkMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQVksRUFBRSxFQUFFO1FBQzVCLElBQUksSUFBSSxLQUFLLFFBQVEsRUFBRTtZQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLG1CQUFtQixDQUFDLENBQUM7U0FDcEU7YUFBTTtZQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDckI7SUFDTCxDQUFDLENBQUMsQ0FBQztJ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