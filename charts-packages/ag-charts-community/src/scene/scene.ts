import { HdpiCanvas } from '../canvas/hdpiCanvas';
import { Node, RedrawType, RenderContext } from './node';
import { createId } from '../util/id';
import { Group } from './group';
import { HdpiOffscreenCanvas } from '../canvas/hdpiOffscreenCanvas';
import { windowValue } from '../util/window';
import { ascendingStringNumberUndefined, compoundAscending } from '../util/compare';

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
    canvas: HdpiOffscreenCanvas | HdpiCanvas;
    getComputedOpacity: () => number;
}

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
            overrideDevicePixelRatio?: number;
        } & Partial<SceneOptions>
    ) {
        const {
            document = window.document,
            mode = windowValue('agChartsSceneRenderModel') || 'adv-composite',
            width,
            height,
            overrideDevicePixelRatio = undefined,
        } = opts;

        this.overrideDevicePixelRatio = overrideDevicePixelRatio;

        this.opts = { document, mode };
        this.debug.stats = windowValue('agChartsSceneStats') ?? false;
        this.debug.dirtyTree = windowValue('agChartsSceneDirtyTree') ?? false;
        this.canvas = new HdpiCanvas({ document, width, height, overrideDevicePixelRatio });
        this.ctx = this.canvas.context;
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

    overrideDevicePixelRatio?: number;

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
    addLayer(opts: {
        zIndex?: number;
        zIndexSubOrder?: [string, number];
        name?: string;
        getComputedOpacity: () => number;
    }): HdpiCanvas | HdpiOffscreenCanvas | undefined {
        const { mode } = this.opts;
        const layeredModes = ['composite', 'dom-composite', 'adv-composite'];
        if (!layeredModes.includes(mode)) {
            return undefined;
        }

        const { zIndex = this._nextZIndex++, name, zIndexSubOrder, getComputedOpacity } = opts;
        const { width, height, overrideDevicePixelRatio } = this;
        const domLayer = mode === 'dom-composite';
        const advLayer = mode === 'adv-composite';
        const canvas =
            !advLayer || !HdpiOffscreenCanvas.isSupported()
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
        const newLayer: SceneLayer = {
            id: this._nextLayerId++,
            name,
            zIndex,
            zIndexSubOrder,
            canvas,
            getComputedOpacity,
        };

        if (zIndex >= this._nextZIndex) {
            this._nextZIndex = zIndex + 1;
        }

        this.layers.push(newLayer);
        this.sortLayers();

        if (domLayer) {
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

        return newLayer.canvas;
    }

    removeLayer(canvas: HdpiCanvas | HdpiOffscreenCanvas) {
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

    moveLayer(canvas: HdpiCanvas | HdpiOffscreenCanvas, newZIndex: number, newZIndexSubOrder?: [string, number]) {
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

    _root: Node | null = null;
    set root(node: Node | null) {
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
    get root(): Node | null {
        return this._root;
    }

    readonly debug: DebugOptions = {
        dirtyTree: false,
        stats: false,
        renderBoundingBoxes: false,
        consoleLog: false,
    };

    /** Alternative to destroy() that preserves re-usable resources. */
    strip() {
        const { layers } = this;
        for (const layer of layers) {
            layer.canvas.destroy();
            delete (layer as any)['canvas'];
        }
        layers.splice(0, layers.length);

        this.root = null;
        this._dirty = false;
        this.ctx.resetTransform();
    }

    destroy() {
        this.container = undefined;

        this.strip();
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

        const renderCtx: RenderContext = {
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
            layers.forEach(({ canvas: { imageSource, enabled }, getComputedOpacity }) => {
                if (!enabled) {
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
            console.log('after', { redrawType: RedrawType[root.dirty], canvasCleared, tree: this.buildTree(root) });
        }
    }

    debugStats(
        debugSplitTimes: number[],
        ctx: CanvasRenderingContext2D,
        renderCtxStats: RenderContext['stats'],
        extraDebugStats = {}
    ) {
        const end = performance.now();

        if (this.debug.stats) {
            const start = debugSplitTimes[0];
            debugSplitTimes.push(end);

            const pct = (rendered: number, skipped: number) => {
                const total = rendered + skipped;
                return `${rendered} / ${total} (${Math.round((100 * rendered) / total)}%)`;
            };
            const time = (start: number, end: number) => {
                return `${Math.round((end - start) * 100) / 100}ms`;
            };
            const { layersRendered = 0, layersSkipped = 0, nodesRendered = 0, nodesSkipped = 0 } = renderCtxStats ?? {};

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
            ].filter((v): v is string => v != null);
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
                        node: childNode,
                    } = childTree;
                    if (!visible || opacity <= 0) {
                        treeNodeName = `(${treeNodeName})`;
                    }
                    if (childNode instanceof Group && childNode.isLayer()) {
                        treeNodeName = `*${treeNodeName}*`;
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
