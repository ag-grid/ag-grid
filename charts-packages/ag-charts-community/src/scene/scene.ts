import { HdpiCanvas } from "../canvas/hdpiCanvas";
import { Node } from "./node";
import { Path2D } from "./path2D";
import { createId } from "../util/id";

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
        return this.canvas.width;
    }

    get height(): number {
        return this.canvas.height;
    }

    resize(width: number, height: number) {
        this.canvas.resize(width, height)
            .then( () => {
                // resizing a canvas clears the pixel content, so mark as dirty to ensure a re-rendering:
                this.dirty = true;
            });        
    }

    private _dirty = false;
    private animationFrameId = 0;
    set dirty(dirty: boolean) {
        if (dirty && !this._dirty) {
            this.animationFrameId = requestAnimationFrame(this.render);
        }
        this._dirty = dirty;
    }
    get dirty(): boolean {
        return this._dirty;
    }

    cancelRender() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = 0;
            this._dirty = false;
        }
    }

    _root: Node | null = null;
    set root(node: Node | null) {
        if (node === this._root) {
            return;
        }

        if (this._root) {
            this._root._setScene(undefined);
        }

        this._root = node;

        if (node) {
            // If `node` is the root node of another scene ...
            if (node.parent === null && node.scene && node.scene !== this) {
                node.scene.root = null;
            }
            node._setScene(this);
        }

        this.dirty = true;
    }
    get root(): Node | null {
        return this._root;
    }

    appendPath(path: Path2D) {
        const ctx = this.ctx;
        const commands = path.commands;
        const params = path.params;
        const n = commands.length;
        let j = 0;

        ctx.beginPath();
        for (let i = 0; i < n; i++) {
            switch (commands[i]) {
                case 'M':
                    ctx.moveTo(params[j++], params[j++]);
                    break;
                case 'L':
                    ctx.lineTo(params[j++], params[j++]);
                    break;
                case 'C':
                    ctx.bezierCurveTo(
                        params[j++], params[j++],
                        params[j++], params[j++],
                        params[j++], params[j++]
                    );
                    break;
                case 'Z':
                    ctx.closePath();
                    break;
            }
        }
    }

    private _frameIndex = 0;
    get frameIndex(): number {
        return this._frameIndex;
    }

    private _renderFrameIndex = false;
    set renderFrameIndex(value: boolean) {
        if (this._renderFrameIndex !== value) {
            this._renderFrameIndex = value;
            this.dirty = true;
        }
    }
    get renderFrameIndex(): boolean {
        return this._renderFrameIndex;
    }

    readonly render = () => {
        const { ctx, root } = this;        
        
        this.animationFrameId = 0;

        if (root && !root.visible) {
            this.dirty = false;
            return;
        }

        // start with a blank canvas, clear previous drawing
        ctx.clearRect(0, 0, this.width, this.height);

        if (root) {
            ctx.save();
            if (root.visible) {
                root.render(ctx);
            }
            ctx.restore();
        }

        this._frameIndex++;

        if (this.renderFrameIndex) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 40, 15);
            ctx.fillStyle = 'black';
            ctx.fillText(this.frameIndex.toString(), 0, 10);
        }

        this.dirty = false;
    }
}
