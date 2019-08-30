import { HdpiCanvas } from "../canvas/hdpiCanvas";
import { Node } from "./node";
import { Path2D } from "./path2D";

export type SceneOptions = {
    width?: number,
    height?: number,
    document?: Document
};

export class Scene {

    private static id = 1;
    readonly id: string = this.createId();
    private createId(): string {
        return (this.constructor as any).name + '-' + (Scene.id++);
    }

    readonly canvas: HdpiCanvas;
    private readonly ctx: CanvasRenderingContext2D;

    constructor(options: SceneOptions = {}) {
        this.canvas = new HdpiCanvas({
            width: options.width || 300,
            height: options.height || 150,
            document: options.document || window.document
        });
        this.ctx = this.canvas.context;
    }

    set parent(value: HTMLElement | undefined) {
        this.canvas.parent = value;
    }
    get parent(): HTMLElement | undefined {
        return this.canvas.parent;
    }

    download(fileName?: string) {
        this.canvas.download(fileName);
    }

    set width(value: number) {
        this.size = [value, this.height];
    }
    get width(): number {
        return this.canvas.width;
    }

    set height(value: number) {
        this.size = [this.width, value];
    }
    get height(): number {
        return this.canvas.height;
    }

    set size(value: [number, number]) {
        const [width, height] = value;
        if (this.width !== width || this.height !== height) {
            this.canvas.resize(width, height);
            this.dirty = true;
        }
    }
    get size(): [number, number] {
        return [this.width, this.height];
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
        const ctx = this.ctx;

        // start with a blank canvas, clear previous drawing
        ctx.clearRect(0, 0, this.width, this.height);

        if (this.root) {
            ctx.save();
            if (this.root.visible) {
                this.root.render(ctx);
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
