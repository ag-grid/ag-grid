import { HdpiCanvas } from "../canvas/hdpiCanvas";
import { Node, RedrawType } from "./node";
import { createId } from "../util/id";

interface DebugOptions {
    renderFrameIndex: boolean;
    renderBoundingBoxes: boolean;
}

export class Scene {

    static className = 'Scene';

    readonly id = createId(this);

    readonly canvas: HdpiCanvas;
    private readonly ctx: CanvasRenderingContext2D;

    // As a rule of thumb, constructors with no parameters are preferred.
    // A few exceptions are:
    // - we absolutely need to know something at construction time (document)
    // - knowing something at construction time meaningfully improves performance (width, height)
    constructor(document = window.document, width?: number, height?: number) {
        this.canvas = new HdpiCanvas(document, width, height);
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
    };

    private _frameIndex = 0;
    get frameIndex(): number {
        return this._frameIndex;
    }

    render() {
        const { ctx, root, pendingSize } = this;

        if (pendingSize) {
            this.canvas.resize(...pendingSize);
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
            ctx.clearRect(0, 0, this.width, this.height);
        }

        if (root) {
            console.log({ redrawType: RedrawType[root.dirty], canvasCleared });

            ctx.save();
            if (root.visible) {
                root.render(ctx, canvasCleared);
            }
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
