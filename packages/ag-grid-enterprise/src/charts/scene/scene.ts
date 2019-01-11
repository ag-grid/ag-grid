import {HdpiCanvas} from "../canvas/hdpiCanvas";
import {Node} from "./node";
import {Path} from "./path";
import {Shape} from "./shape/shape";

export class Scene {
    constructor(parent: HTMLElement, width = 800, height = 600) {
        this.hdpiCanvas = new HdpiCanvas(this._width = width, this._height = height);
        const canvas = this.hdpiCanvas.canvas;
        this.ctx = canvas.getContext('2d')!;
        parent.appendChild(canvas);
        this.setupListeners(canvas);
    }

    private readonly hdpiCanvas: HdpiCanvas;
    private readonly ctx: CanvasRenderingContext2D;

    private setupListeners(canvas: HTMLCanvasElement) {
        canvas.addEventListener('mousemove', this.onMouseMove);
    }

    private onMouseMove = (e: MouseEvent) => {
        const pixelRatio = this.hdpiCanvas.pixelRatio;
        const x = e.offsetX * pixelRatio;
        const y = e.offsetY * pixelRatio;

        const node = this.root;

        if (node) {
            const children = node.children;
            const n = children.length;
            for (let i = 0; i < n; i++) {
                const child = children[i];
                if (child instanceof Shape) {
                    if (child.isPointInPath(this.ctx, x, y)) {
                        child.fillStyle = 'yellow';
                    }
                    else {
                        child.fillStyle = 'red';
                    }

                    if (child.isPointInStroke(this.ctx, x, y)) {
                        child.strokeStyle = 'lime';
                    }
                    else {
                        child.strokeStyle = 'black';
                    }
                }
            }
        }
    };

    _width: number;
    get width(): number {
        return this._width;
    }

    _height: number;
    get height(): number {
        return this._height;
    }

    set size(value: [number, number]) {
        this.hdpiCanvas.resize(...value);
        [this._width, this._height] = value;
    }

    _dirty = false;
    set dirty(dirty: boolean) {
        if (dirty && !this._dirty) {
            requestAnimationFrame(this.render);
        }
        this._dirty = dirty;
    }
    get dirty(): boolean {
        return this._dirty;
    }

    _root?: Node;
    set root(node: Node | undefined) {
        this._root = node;
        if (node) {
            node.scene = this;
        }
        this.dirty = true;
    }
    get root(): Node | undefined {
        return this._root;
    }

    appendPath(path: Path) {
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

    render = () => {
        this.ctx.clearRect(0, 0, this.width, this.height);
        if (this.root) {
            this.root.render(this.ctx);
        }
        this.dirty = false;
    };
}
