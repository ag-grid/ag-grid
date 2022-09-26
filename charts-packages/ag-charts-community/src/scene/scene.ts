import { HdpiCanvas } from '../canvas/hdpiCanvas';
import { Node, RedrawType, RenderContext } from './node';
import { createId } from '../util/id';
import { Group } from './group';
import { HdpiOffscreenCanvas } from '../canvas/hdpiOffscreenCanvas';
import { windowValue } from '../util/window';
import { ascendingStringNumberUndefined, compoundAscending } from '../util/compare';
import { SCHEDULER } from '../util/scheduler';

interface DebugOptions {
    stats: false | 'basic' | 'detailed';
    dirtyTree: boolean;
    renderBoundingBoxes: boolean;
    consoleLog: boolean;
}

interface SceneOptions {
    document: Document;
    mode: 'simple' | 'composite' | 'dom-composite' | 'adv-composite';
}

interface SceneLayer {
    id: number;
    name?: string;
    zIndex: number;
    zIndexSubOrder?: [string, number];
    canvas?: HdpiOffscreenCanvas | HdpiCanvas;
}

export type LazyLayer = {
    id: number;
    getOrCreate(): HdpiCanvas | HdpiOffscreenCanvas;
    get(): HdpiCanvas | HdpiOffscreenCanvas | undefined;
};

export class Scene {
    static className = 'Scene';

    readonly id = createId(this);

    readonly canvas: HdpiCanvas;
    readonly layers: SceneLayer[] = [];

    private readonly ctx: CanvasRenderingContext2D;

    private readonly opts: SceneOptions;

    constructor(
        opts: {
            width?: number;
            height?: number;
        } & Partial<SceneOptions>
    ) {
        const {
            document = window.document,
            mode = windowValue('agChartsSceneRenderModel') || 'adv-composite',
            width,
            height,
        } = opts;

        this.opts = { document, mode };
        this.debug.stats = windowValue('agChartsSceneStats') ?? false;
        this.debug.dirtyTree = windowValue('agChartsSceneDirtyTree') ?? false;
        this.canvas = new HdpiCanvas({ document, width, height });
        this.ctx = this.canvas.context;

        this._root = new Group({ name: 'root', layer: true });
        this._root._setScene(this);
    }

    set container(value: HTMLElement | undefined) {
        this.canvas.container = value;
    }
    get container(): HTMLElement | undefined {
        return this.canvas.container;
    }

    download(fileName?: string, fileFormat?: string) {
        this.canvas.download(fileName, fileFormat);
    }

    getDataURL(type?: string): string {
        return this.canvas.getDataURL(type);
    }

    get width(): number {
        return this.pendingSize ? this.pendingSize[0] : this.canvas.width;
    }

    get height(): number {
        return this.pendingSize ? this.pendingSize[1] : this.canvas.height;
    }

    private pendingSize?: [number, number];
    resize(width: number, height: number): boolean {
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

    private _nextZIndex = 0;
    private _nextLayerId = 0;
    addLayer(opts?: { zIndex?: number; zIndexSubOrder?: [string, number]; name?: string }): LazyLayer | undefined {
        const { mode } = this.opts;
        const layeredModes = ['composite', 'dom-composite', 'adv-composite'];
        if (!layeredModes.includes(mode)) {
            return undefined;
        }

        const { zIndex = this._nextZIndex++, name, zIndexSubOrder } = opts || {};
        const { width, height } = this;
        const domLayer = mode === 'dom-composite';
        const advLayer = mode === 'adv-composite';

        const newLayer: SceneLayer = {
            id: this._nextLayerId++,
            name,
            zIndex,
            zIndexSubOrder,
        };

        const createCanvas = () => {
            if (newLayer.canvas) {
                return newLayer.canvas;
            }

            newLayer.canvas =
                !advLayer || !HdpiOffscreenCanvas.isSupported()
                    ? new HdpiCanvas({
                          document: this.opts.document,
                          width,
                          height,
                          domLayer,
                          zIndex,
                          name,
                      })
                    : new HdpiOffscreenCanvas({
                          width,
                          height,
                      });
            return newLayer.canvas;
        };

        if (zIndex >= this._nextZIndex) {
            this._nextZIndex = zIndex + 1;
        }

        this.layers.push(newLayer);
        this.sortLayers();

        if (domLayer) {
            const canvas = createCanvas();
            const domCanvases = this.layers
                .map((v) => v.canvas)
                .filter((v): v is HdpiCanvas => v instanceof HdpiCanvas);
            const newLayerIndex = domCanvases.findIndex((v) => v === canvas);
            const lastLayer = domCanvases[newLayerIndex - 1] ?? this.canvas;
            lastLayer.element.insertAdjacentElement('afterend', (canvas as HdpiCanvas).element);
        }

        if (this.debug.consoleLog) {
            console.log({ layers: this.layers });
        }

        return { id: newLayer.id, getOrCreate: createCanvas, get: () => newLayer.canvas };
    }

    removeLayer({ id }: { id: number }) {
        const index = this.layers.findIndex((l) => l.id === id);

        if (index >= 0) {
            const { canvas } = this.layers[index];
            this.layers.splice(index, 1);
            canvas?.destroy();
            this.markDirty();

            if (this.debug.consoleLog) {
                console.log({ layers: this.layers });
            }
        }
    }

    moveLayer({ id }: { id: number }, newZIndex: number, newZIndexSubOrder?: [string, number]) {
        const layer = this.layers.find((l) => l.id === id);
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

    private sortLayers() {
        this.layers.sort((a, b) => {
            return compoundAscending(
                [a.zIndex, ...(a.zIndexSubOrder ?? [undefined, undefined]), a.id],
                [b.zIndex, ...(b.zIndexSubOrder ?? [undefined, undefined]), b.id],
                ascendingStringNumberUndefined
            );
        });
    }

    private _dirty = false;
    markDirty() {
        this._dirty = true;
    }
    get dirty(): boolean {
        return this._dirty;
    }

    _root: Group;
    get root(): Group {
        return this._root;
    }

    readonly debug: DebugOptions = {
        dirtyTree: false,
        stats: false,
        renderBoundingBoxes: false,
        consoleLog: false,
    };

    destroy() {
        this.container = undefined;

        const { layers } = this;
        for (const layer of layers) {
            layer.canvas?.destroy();
            delete layer['canvas'];
        }
        layers.splice(0, layers.length);
    }

    async render(opts?: { debugSplitTimes: number[]; extraDebugStats: Record<string, number> }) {
        const { debugSplitTimes = [performance.now()], extraDebugStats = {} } = opts || {};
        const {
            canvas,
            ctx,
            root,
            layers,
            pendingSize,
            opts: { mode },
        } = this;

        if (pendingSize) {
            this.canvas.resize(...pendingSize);
            this.layers.forEach((layer) => layer.canvas?.resize(...pendingSize));

            this.pendingSize = undefined;
        }

        if (root && !root.visible) {
            this._dirty = false;
            return;
        }

        if (!this.dirty) {
            this.debugStats(debugSplitTimes, ctx, extraDebugStats);
            return;
        }

        const renderCtx: RenderContext = {
            ctx,
            forceRender: true,
            resized: !!pendingSize,
        };
        let canvasCleared = false;
        if (!root || root.dirty >= RedrawType.TRIVIAL) {
            // start with a blank canvas, clear previous drawing
            canvasCleared = true;

            if (mode === 'simple' || mode === 'dom-composite') {
                // Direct canvas rendering of all elements - clear before rendering.
                canvas.clear();
            }
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
                await this.renderSceneGraph(renderCtx);
                ctx.restore();
            }
        }

        if (mode !== 'dom-composite' && layers.length > 0 && canvasCleared) {
            canvas.clear();
            ctx.save();
            ctx.setTransform(1 / canvas.pixelRatio, 0, 0, 1 / canvas.pixelRatio, 0, 0);
            layers.forEach(({ canvas }) => {
                const { imageSource, enabled, opacity = 1 } = canvas ?? {};
                if (!imageSource || !enabled) {
                    return;
                }

                ctx.globalAlpha = opacity;
                ctx.drawImage(imageSource, 0, 0);
            });
            ctx.restore();
        }

        this._dirty = false;

        this.debugStats(debugSplitTimes, ctx, extraDebugStats);

        if (root && this.debug.consoleLog) {
            console.log('after', { redrawType: RedrawType[root.dirty], canvasCleared, tree: this.buildTree(root) });
        }
    }

    debugStats(debugSplitTimes: number[], ctx: CanvasRenderingContext2D, extraDebugStats = {}) {
        const end = performance.now();

        if (this.debug.stats) {
            const start = debugSplitTimes[0];
            debugSplitTimes.push(end);

            const time = (start: number, end: number) => {
                return `${Math.round((end - start) * 100) / 100}ms`;
            };

            const splits = debugSplitTimes
                .map((t, i) => (i > 0 ? time(debugSplitTimes[i - 1], t) : null))
                .filter((v) => v != null)
                .join(' + ');
            const extras = Object.entries(extraDebugStats)
                .map(([k, v]) => `${k}: ${v}`)
                .join(' ; ');

            const stats = [`${time(start, end)} (${splits})`, `${extras}`].filter((v): v is string => v != null);
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

    async renderSceneGraph(initRenderCtx: RenderContext) {
        const { root } = this;
        const RENDER_NODE_BATCH_SIZE = 100;

        if (!root) {
            return;
        }

        const initStack: { node: Node; idx: number; renderCtx: RenderContext; childRenderCtx?: RenderContext }[] = [
            { node: root, idx: 0, renderCtx: initRenderCtx },
        ];

        await SCHEDULER.scheduleJob({
            ctx: { stack: initStack },
            run: ({ stack }, rescheduleJob, deadline) => {
                let batchCount = 0;
                while (deadline < performance.now() && batchCount < RENDER_NODE_BATCH_SIZE && stack.length > 0) {
                    const stackEl = stack[stack.length - 1];
                    let { node, renderCtx, childRenderCtx, idx } = stackEl;

                    if (!node.visible) {
                        node.markClean();
                        stack.pop();
                        batchCount++;
                        continue;
                    }

                    if (stackEl.idx === 0) {
                        childRenderCtx = node.preChildRender?.(renderCtx) ?? renderCtx;
                    } else {
                        childRenderCtx = childRenderCtx ?? renderCtx;
                    }

                    const { forceRender, resized, ctx } = childRenderCtx;
                    if (!forceRender && !resized && node.dirty < RedrawType.TRIVIAL) {
                        node.markClean();
                        idx = node.children.length; // Skip over children.
                    }

                    if (idx < node.children.length) {
                        stack.push({ node: node.children[idx], idx: 0, renderCtx: childRenderCtx });
                        idx++;

                        // Need to save state in stack for when we come back to this node.
                        stackEl.childRenderCtx = childRenderCtx;
                        stackEl.idx = idx;
                    } else {
                        // Render marks this node (and children) as clean - no need to explicitly markClean().
                        ctx.save();
                        node.render(childRenderCtx);
                        ctx.restore();
                        node.postChildRender?.(childRenderCtx);
                        stack.pop();
                    }

                    batchCount++;
                }

                if (stack.length > 0) {
                    rescheduleJob({ ctx: { stack } });
                }
            },
        });
    }

    buildTree(node: Node): { name?: string; node?: any; dirty?: string } {
        const name = (node instanceof Group ? node.name : null) ?? node.id;

        return {
            name,
            node,
            dirty: RedrawType[node.dirty],
            ...node.children
                .map((c) => this.buildTree(c))
                .reduce((result, childTree) => {
                    let {
                        name: treeNodeName,
                        node: { visible, opacity, zIndex, zIndexSubOrder },
                    } = childTree;
                    if (!visible || opacity <= 0) {
                        treeNodeName = `* ${treeNodeName}`;
                    }
                    if (node instanceof Group && node.isLayer()) {
                        treeNodeName = `[ ${treeNodeName} ]`;
                    }
                    const key = [
                        `${treeNodeName ?? '<unknown>'}`,
                        `z: ${zIndex}`,
                        zIndexSubOrder && `zo: ${zIndexSubOrder.join(' / ')}`,
                    ]
                        .filter((v) => !!v)
                        .join(' ');
                    result[key] = childTree;
                    return result;
                }, {} as Record<string, {}>),
        };
    }

    buildDirtyTree(node: Node): {
        dirtyTree: { name?: string; node?: any; dirty?: string };
        paths: string[];
    } {
        if (node.dirty === RedrawType.NONE) {
            return { dirtyTree: {}, paths: [] };
        }

        const childrenDirtyTree = node.children.map((c) => this.buildDirtyTree(c)).filter((c) => c.paths.length > 0);
        const name = (node instanceof Group ? node.name : null) ?? node.id;
        const paths =
            childrenDirtyTree.length === 0
                ? [name]
                : childrenDirtyTree
                      .map((c) => c.paths)
                      .reduce((r, p) => r.concat(p), [])
                      .map((p) => `${name}.${p}`);

        return {
            dirtyTree: {
                name,
                node,
                dirty: RedrawType[node.dirty],
                ...childrenDirtyTree
                    .map((c) => c.dirtyTree)
                    .filter((t) => t.dirty !== undefined)
                    .reduce((result, childTree) => {
                        result[childTree.name || '<unknown>'] = childTree;
                        return result;
                    }, {} as Record<string, {}>),
            },
            paths,
        };
    }
}
