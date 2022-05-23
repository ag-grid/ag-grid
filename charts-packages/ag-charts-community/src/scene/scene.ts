import { HdpiCanvas } from "../canvas/hdpiCanvas";
import { Node, RedrawType } from "./node";
import { createId } from "../util/id";

interface DebugOptions {
    renderFrameIndex: boolean;
    renderBoundingBoxes: boolean;
    consoleLog: boolean;
}

interface SceneOptions {
    document: Document,
    mode: 'simple' | 'composite' | 'dom-composite',
}

export class Scene {

    static className = 'Scene';

    readonly id = createId(this);

    readonly canvas: HdpiCanvas;
    readonly layers: { name?: string, zIndex: number, canvas: HdpiCanvas }[] = [];

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
            mode = (window as any).agChartsSceneRenderModel || 'dom-composite',
            width,
            height,
        } = opts;

        this.opts = { document, mode };
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
    addLayer(opts?: { zIndex?: number, name?: string }): HdpiCanvas | undefined {
        const { mode } = this.opts;
        if (mode !== 'composite' && mode !== 'dom-composite') {
            return undefined;
        }

        const { zIndex = this._nextZIndex++, name } = opts || {};
        const { width, height } = this;
        const domLayer = mode === 'dom-composite';
        const newLayer = {
            name,
            zIndex,
            canvas: new HdpiCanvas({
                document: this.canvas.document,
                width,
                height,
                domLayer,
                zIndex,
            }),
        };

        if (zIndex >= this._nextZIndex) {
            this._nextZIndex = zIndex + 1;
        }

        this.layers.push(newLayer);
        this.layers.sort((a, b) => a.zIndex - b.zIndex);

        if (domLayer) {
            this.canvas.element.insertAdjacentElement('afterend', newLayer.canvas.element);
        }

        if (this.debug.consoleLog) {
            console.log({ layers: this.layers });
        }

        return newLayer.canvas;
    }

    removeLayer(canvas: HdpiCanvas) {
        const index = this.layers.findIndex((l) => l.canvas = canvas);

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
        renderFrameIndex: false,
        renderBoundingBoxes: false,
        consoleLog: false,
    };

    private _frameIndex = 0;
    get frameIndex(): number {
        return this._frameIndex;
    }

    render() {
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

        let canvasCleared = false;
        if (!root || root.dirty >= RedrawType.TRIVIAL) {
            // start with a blank canvas, clear previous drawing
            canvasCleared = true;
            canvas.clear();
        }

        if (root && canvasCleared) {
            if (this.debug.consoleLog) {
                console.log({ redrawType: RedrawType[root.dirty], canvasCleared });
            }

            if (root.visible) {
                ctx.save();
                root.render({ ctx, forceRender: true, resized: !!pendingSize });
                ctx.restore();
            }
        }

        if (mode !== 'dom-composite' && layers.length > 0 && canvasCleared) {
            ctx.save();
            ctx.resetTransform();
            layers.forEach((layer) => {
                if (layer.canvas.enabled) {
                    // Indirect reference to fix typings for tests.
                    const canvas = layer.canvas.context.canvas;
                    ctx.drawImage(canvas, 0, 0);
                }
            });
            ctx.restore();
        }

        this._frameIndex++;

        if (this.debug.renderFrameIndex) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 40, 15);
            ctx.fillStyle = 'black';
            ctx.fillText(this.frameIndex.toString(), 2, 10);
        }

        this._dirty = false;
    }
}
