import {HdpiCanvas} from "../canvas/hdpiCanvas";
import {Node} from "./node";
import {Path2D} from "./path2D";
import {Shape} from "./shape/shape";

export class Scene {
    constructor(width = 800, height = 600) {
        this.hdpiCanvas = new HdpiCanvas(this._width = width, this._height = height);
        this.ctx = this.hdpiCanvas.context;
        this.setupListeners(this.hdpiCanvas.canvas); // debug
    }

    set parent(value: HTMLElement | null) {
        this.hdpiCanvas.parent = value;
    }
    get parent(): HTMLElement | null {
        return this.hdpiCanvas.parent;
    }

    private static id = 1;
    private createId(): string {
        return (this.constructor as any).name + '-' + (Scene.id++);
    };
    readonly id: string = this.createId();

    readonly hdpiCanvas: HdpiCanvas;
    private readonly ctx: CanvasRenderingContext2D;

    private setupListeners(canvas: HTMLCanvasElement) {
        canvas.addEventListener('mousemove', this.onMouseMove);
    }

    private lastPick?: { // debug
        node: Shape,
        fillStyle: string | null
    };
    private onMouseMove = (e: MouseEvent) => { // debug
        const x = e.offsetX;
        const y = e.offsetY;

        if (this.root) {
            const node = this.pickNode(this.root, x, y);
            if (node) {
                if (node instanceof Shape) {
                    if (!this.lastPick) {
                        this.lastPick = { node, fillStyle: node.fillStyle };
                    } else if (this.lastPick.node !== node) {
                        this.lastPick.node.fillStyle = this.lastPick.fillStyle;
                        this.lastPick = { node, fillStyle: node.fillStyle };
                    }
                    node.fillStyle = 'yellow';
                }
            } else if (this.lastPick) {
                this.lastPick.node.fillStyle = this.lastPick.fillStyle;
                this.lastPick = undefined;
            }
        }
    };

    pickNode(node: Node, x: number, y: number): Node | undefined {
        if (!node.visible || !node.isPointInNode(x, y)) {
            return;
        }

        const children = node.children;

        if (children.length) {
            // Nodes added later should be hit-tested first,
            // as they are rendered on top of the previously added nodes.
            for (let i = children.length - 1; i >= 0; i--) {
                const hit = this.pickNode(children[i], x, y);
                if (hit) {
                    return hit;
                }
            }
        } else if (node instanceof Shape) {
            return node;
        }
    }

    private _width: number;
    set width(value: number) {
        this.size = [value, this._height];
    }
    get width(): number {
        return this._width;
    }

    private _height: number;
    set height(value: number) {
        this.size = [this._width, value];
    }
    get height(): number {
        return this._height;
    }

    set size(value: [number, number]) {
        if (this._width !== value[0] || this._height !== value[1]) {
            this.hdpiCanvas.resize(value[0], value[1]);
            [this._width, this._height] = value;
            this.dirty = true;
        }
    }

    private _dirty = false;
    set dirty(dirty: boolean) {
        if (dirty && !this._dirty) {
            requestAnimationFrame(this.render);
        }
        this._dirty = dirty;
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
            this._root._setScene(null);
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


    render = () => {
        const ctx = this.ctx;

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
    };
}
