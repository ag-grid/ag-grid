import { Shape } from './shape';
import { BBox } from '../bbox';
import { RedrawType, SceneChangeDetection, RenderContext } from '../node';

export class Range extends Shape {
    static className = 'Range';

    protected static defaultStyles = {
        ...Shape.defaultStyles,
        strokeWidth: 1,
    };

    constructor() {
        super();
        this.restoreOwnStyles();
    }

    @SceneChangeDetection({ redraw: RedrawType.MINOR })
    x1: number = 0;

    @SceneChangeDetection({ redraw: RedrawType.MINOR })
    y1: number = 0;

    @SceneChangeDetection({ redraw: RedrawType.MINOR })
    x2: number = 0;

    @SceneChangeDetection({ redraw: RedrawType.MINOR })
    y2: number = 0;

    @SceneChangeDetection({ redraw: RedrawType.MINOR })
    startLine: boolean = false;

    @SceneChangeDetection({ redraw: RedrawType.MINOR })
    endLine: boolean = false;

    @SceneChangeDetection({ redraw: RedrawType.MINOR })
    isRange: boolean = false;

    computeBBox(): BBox {
        return new BBox(this.x1, this.y1, this.x2 - this.x1, this.y2 - this.y1);
    }

    isPointInPath(_x: number, _y: number): boolean {
        return false;
    }

    render(renderCtx: RenderContext) {
        let { ctx, forceRender } = renderCtx;

        if (this.dirty === RedrawType.NONE && !forceRender) {
            return;
        }

        this.computeTransformMatrix();
        this.matrix.toContext(ctx);

        let { x1, y1, x2, y2 } = this;

        x1 = this.align(x1);
        y1 = this.align(y1);
        x2 = this.align(x2);
        y2 = this.align(y2);

        const { fill, opacity, isRange } = this;
        const fillActive = !!(isRange && fill);

        if (fillActive) {
            const { fillOpacity } = this;

            ctx.fillStyle = fill;
            ctx.globalAlpha = opacity * fillOpacity;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x1, y2);
            ctx.closePath();

            ctx.fill();
        }

        const { stroke, strokeWidth, startLine, endLine } = this;
        const strokeActive = !!((startLine || endLine) && stroke && strokeWidth);

        if (strokeActive) {
            const { strokeOpacity, lineDash, lineDashOffset, lineCap, lineJoin } = this;

            ctx.strokeStyle = stroke;
            ctx.globalAlpha = opacity * strokeOpacity;

            ctx.lineWidth = strokeWidth;
            if (lineDash) {
                ctx.setLineDash(lineDash);
            }
            if (lineDashOffset) {
                ctx.lineDashOffset = lineDashOffset;
            }
            if (lineCap) {
                ctx.lineCap = lineCap;
            }
            if (lineJoin) {
                ctx.lineJoin = lineJoin;
            }

            ctx.beginPath();

            if (startLine) {
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y1);
            }

            if (endLine) {
                ctx.moveTo(x2, y2);
                ctx.lineTo(x1, y2);
            }

            ctx.stroke();
        }

        this.fillShadow?.markClean();
        super.render(renderCtx);
    }
}
