import { Path, ScenePathChangeDetection } from './path';
import { BBox } from '../bbox';
import { LinearGradient } from '../gradient/linearGradient';
import { Color } from '../../util/color';
import { Shape } from './shape';
import { Path2D } from '../path2D';

export enum RectSizing {
    Content,
    Border,
}

export class Rect extends Path {
    static className = 'Rect';

    readonly borderPath = new Path2D();

    @ScenePathChangeDetection()
    x: number = 0;

    @ScenePathChangeDetection()
    y: number = 0;

    @ScenePathChangeDetection()
    width: number = 10;

    @ScenePathChangeDetection()
    height: number = 10;

    @ScenePathChangeDetection()
    radius: number = 0;

    /**
     * If `true`, the rect is aligned to the pixel grid for crisp looking lines.
     * Animated rects may not look nice with this option enabled, for example
     * when a rect is translated by a sub-pixel value on each frame.
     */
    @ScenePathChangeDetection()
    crisp: boolean = false;

    @ScenePathChangeDetection({ changeCb: (r) => r.updateGradientInstance() })
    gradient: boolean = false;

    private gradientFill?: string;
    private gradientInstance?: LinearGradient;
    private borderClipPath?: Path2D;

    constructor() {
        super((ctx) => this.renderRect(ctx));
    }

    private updateGradientInstance() {
        const { fill } = this;

        if (this.gradient) {
            if (fill) {
                const gradient = new LinearGradient();
                gradient.angle = 270;
                gradient.stops = [
                    {
                        offset: 0,
                        color: Color.fromString(fill).brighter().toString(),
                    },
                    {
                        offset: 1,
                        color: Color.fromString(fill).darker().toString(),
                    },
                ];
                this.gradientInstance = gradient;
            }
        } else {
            this.gradientInstance = undefined;
        }

        this.gradientFill = fill;
    }

    private lastUpdatePathStrokeWidth: number = Shape.defaultStyles.strokeWidth;

    protected isDirtyPath() {
        if (this.lastUpdatePathStrokeWidth !== this.strokeWidth) {
            return true;
        }

        if (this.path.isDirty() || this.borderPath.isDirty() || this.clipPath?.isDirty()) {
            return true;
        }

        return false;
    }

    private effectiveStrokeWidth: number = Shape.defaultStyles.strokeWidth;

    protected updatePath() {
        const { path, borderPath, crisp } = this;
        let { x, y, width: w, height: h, strokeWidth } = this;

        path.clear({ trackChanges: true });
        borderPath.clear({ trackChanges: true });

        if (crisp) {
            // Order matters here, since we need unaligned x/y for w/h calculations.
            w = this.align(x, w);
            h = this.align(y, h);
            x = this.align(x);
            y = this.align(y);
        }

        if (strokeWidth) {
            if (strokeWidth < w && strokeWidth < h) {
                const halfStrokeWidth = strokeWidth / 2;
                x += halfStrokeWidth;
                y += halfStrokeWidth;
                w -= strokeWidth;
                h -= strokeWidth;

                // Clipping not needed in this case; fill to center of stroke.
                this.borderClipPath = undefined;
                path.rect(x, y, w, h);
            } else {
                // Skip the fill and just render the stroke.
                this.borderClipPath = this.borderClipPath ?? new Path2D();
                this.borderClipPath.clear({ trackChanges: true });
                this.borderClipPath.rect(x, y, w, h);
            }

            borderPath.rect(x, y, w, h);
        } else {
            // No borderPath needed, and thus no clipPath needed either. Fill to full extent of
            // Rect.
            this.borderClipPath = undefined;
            path.rect(x, y, w, h);
        }

        this.effectiveStrokeWidth = strokeWidth;
        this.lastUpdatePathStrokeWidth = strokeWidth;
    }

    computeBBox(): BBox {
        const { x, y, width, height } = this;
        return new BBox(x, y, width, height);
    }

    isPointInPath(x: number, y: number): boolean {
        const point = this.transformPoint(x, y);
        const bbox = this.computeBBox();

        return bbox.containsPoint(point.x, point.y);
    }

    private renderRect(ctx: CanvasRenderingContext2D) {
        const { stroke, effectiveStrokeWidth, fill, path, borderPath, borderClipPath, opacity } = this;

        const borderActive = !!stroke && !!effectiveStrokeWidth;

        if (fill) {
            const { gradientFill, fillOpacity, fillShadow } = this;
            if (fill !== gradientFill) {
                this.updateGradientInstance();
            }

            const { gradientInstance } = this;
            if (gradientInstance) {
                ctx.fillStyle = gradientInstance.createGradient(ctx, this.computeBBox());
            } else {
                ctx.fillStyle = fill;
            }
            ctx.globalAlpha = opacity * fillOpacity;

            // The canvas context scaling (depends on the device's pixel ratio)
            // has no effect on shadows, so we have to account for the pixel ratio
            // manually here.
            if (fillShadow && fillShadow.enabled) {
                const pixelRatio = this.scene?.canvas.pixelRatio ?? 1;

                ctx.shadowColor = fillShadow.color;
                ctx.shadowOffsetX = fillShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = fillShadow.yOffset * pixelRatio;
                ctx.shadowBlur = fillShadow.blur * pixelRatio;
            }
            path.draw(ctx);
            ctx.fill();
            ctx.shadowColor = 'rgba(0, 0, 0, 0)';
        }

        if (borderActive) {
            const { strokeOpacity, lineDash, lineDashOffset, lineCap, lineJoin } = this;
            if (borderClipPath) {
                // strokeWidth is larger than width or height, so use clipping to render correctly.
                // This is the simplest way to achieve the correct rendering due to nuances with ~0
                // width/height lines in Canvas operations.
                borderClipPath.draw(ctx);
                ctx.clip();
            }

            borderPath.draw(ctx);

            ctx.strokeStyle = stroke!;
            ctx.globalAlpha = opacity * strokeOpacity;

            ctx.lineWidth = effectiveStrokeWidth;
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

            ctx.stroke();
        }
    }
}
