import { HdpiCanvas } from "../canvas/hdpiCanvas";
import { Node, RedrawType, RenderContext } from "./node";
import { createId } from "../util/id";
import { Group } from "./group";
import { HdpiOffscreenCanvas } from "../canvas/hdpiOffscreenCanvas";
import { WINDOW } from '../util/window';

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
    canvas: HdpiOffscreenCanvas | HdpiCanvas;
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
            width?: number,
            height?: number,
        } & Partial<SceneOptions>
    ) {
        const {
            document = window.document,
            mode = WINDOW?.agChartsSceneRenderModel || 'adv-composite',
            width,
            height,
        } = opts;

        this.opts = { document, mode };
        this.debug.stats = WINDOW?.agChartsSceneStats ?? false;
        this.debug.dirtyTree = WINDOW?.agChartsSceneDirtyTree ?? false;
        this.canvas = new HdpiCanvas({ document, width, height });
        this.ctx = this.canvas.context;
    }

    set container(value: HTMLElement | undefined) {
        this.canvas.container = value;
    }
    get container(): HTMLElement | undefined {
        return this.canvas.container;
    }

    download(fileName?: string) {
        this.canvas.download(fileName);
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

        if (width === this.width && height === this.height) {
            return false;
        } else if (width <= 0 || height <= 0) {
            // HdpiCanvas doesn't allow width/height <= 0.
            return false;
        }

        this.pendingSize = [width, height];
        this.markDirty();
        
        return true;
    }

    private _nextZIndex = 0;
    private _nextLayerId = 0;
    addLayer(opts?: { zIndex?: number, name?: string }): HdpiCanvas | HdpiOffscreenCanvas | undefined {
        const { mode } = this.opts;
        const layeredModes = ['composite', 'dom-composite', 'adv-composite'];
        if (!layeredModes.includes(mode)) {
            return undefined;
        }

        const { zIndex = this._nextZIndex++, name } = opts || {};
        const { width, height } = this;
        const domLayer = mode === 'dom-composite';
        const advLayer = mode === 'adv-composite';
        const canvas = !advLayer || !HdpiOffscreenCanvas.isSupported() ? 
            new HdpiCanvas({
                document: this.opts.document,
                width,
                height,
                domLayer,
                zIndex,
                name,
            }) :
            new HdpiOffscreenCanvas({
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
        this.layers.sort((a, b) => { 
            const zDiff = a.zIndex - b.zIndex;
            if (zDiff !== 0) {
                return zDiff;
            }
            return a.id - b.id;
        });

        if (domLayer) {
            const domCanvases= this.layers.map(v => v.canvas)
                .filter((v): v is HdpiCanvas => v instanceof HdpiCanvas);
            const newLayerIndex = domCanvases.findIndex(v => v === canvas);
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

    render(opts?: { debugSplitTimes: number[], extraDebugStats: Record<string, number> }) {
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
            const {dirtyTree, paths} = this.buildDirtyTree(root);
            console.log({dirtyTree, paths});
        }

        if (root && canvasCleared) {
            if (this.debug.consoleLog) {
                console.log({ redrawType: RedrawType[root.dirty], canvasCleared, tree: this.buildTree(root) });
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
            layers.forEach(({ canvas: { imageSource, enabled, opacity }}) => {
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

            const pct = (rendered: number, skipped: number) => {
                const total = rendered + skipped;
                return `${rendered} / ${total} (${Math.round(100*rendered/total)}%)`;
            }
            const time = (start: number, end: number) => {
                return `${Math.round((end - start)*100) / 100}ms`;
            }
            const { layersRendered = 0, layersSkipped = 0, nodesRendered = 0, nodesSkipped = 0 } =
                renderCtx.stats || {};

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
            ].filter((v): v is string => v != null);
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

    }

    buildTree(node: Node): { name?: string, node?: any, dirty?: string } {
        const name = (node instanceof Group ? node.name : null) ?? node.id;

        return {
            name,
            node,
            dirty: RedrawType[node.dirty],
            ...node.children.map((c) => this.buildTree(c))
                .reduce((result, childTree) => {
                    let { name, node } = childTree;
                    if (!node.visible || node.opacity <= 0) {
                        name = `* ${name}`;
                    }
                    result[name ?? '<unknown>'] = childTree;
                    return result;
                }, {} as Record<string, {}>),
        };
    }

    buildDirtyTree(node: Node): {
        dirtyTree: { name?: string, node?: any, dirty?: string },
        paths: string[],
    } {
        if (node.dirty === RedrawType.NONE) {
            return { dirtyTree: {}, paths: [] };
        }

        const childrenDirtyTree = node.children.map(c => this.buildDirtyTree(c))
            .filter(c => c.paths.length > 0);
        const name = (node instanceof Group ? node.name : null) ?? node.id;
        const paths = childrenDirtyTree.length === 0 ? [ name ]
            : childrenDirtyTree.map(c => c.paths)
                .reduce((r, p) => r.concat(p), [])
                .map(p => `${name}.${p}`);

        return {
            dirtyTree: {
                name,
                node,
                dirty: RedrawType[node.dirty],
                ...childrenDirtyTree.map((c) => c.dirtyTree)
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
