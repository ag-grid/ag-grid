import { Shape } from './shape';
import { BBox } from '../bbox';
import { RedrawType, SceneChangeDetection, RenderContext } from '../node';

export class Line extends Shape {
    static className = 'Line';

    protected static defaultStyles = Object.assign({}, Shape.defaultStyles, {
        fill: undefined,
        strokeWidth: 1,
    });

    constructor() {
        super();
        this.restoreOwnStyles();
    }

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    x1: number = 0;

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    y1: number = 0;

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    x2: number = 0;

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    y2: number = 0;

    computeBBox(): BBox {
        return new BBox(this.x1, this.y1, this.x2 - this.x1, this.y2 - this.y1);
    }

    isPointInPath(_x: number, _y: number): boolean {
        return false;
    }

    render(renderCtx: RenderContext) {
        let { ctx, forceRender, stats } = renderCtx;

        if (this.dirty === RedrawType.NONE && !forceRender) {
            if (stats) stats.nodesSkipped += this.nodeCount.count;
            return;
        }

        this.computeTransformMatrix();
        this.matrix.toContext(ctx);

        let x1 = this.x1;
        let y1 = this.y1;
        let x2 = this.x2;
        let y2 = this.y2;

        // Align to the pixel grid if the line is strictly vertical
        // or horizontal (but not both, i.e. a dot).
        if (x1 === x2) {
            const x = Math.round(x1) + (Math.floor(this.strokeWidth) % 2) / 2;
            x1 = x;
            x2 = x;
        } else if (y1 === y2) {
            const y = Math.round(y1) + (Math.floor(this.strokeWidth) % 2) / 2;
            y1 = y;
            y2 = y;
        }

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        this.fillStroke(ctx);

        this.fillShadow?.markClean();
        super.render(renderCtx);
    }
}
