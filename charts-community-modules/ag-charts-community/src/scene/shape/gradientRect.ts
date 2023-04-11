import { Rect } from './rect';
import { RedrawType, SceneChangeDetection } from '../node';
import { LinearGradient } from '../gradient/linearGradient';
import { ActionOnSet } from '../../util/proxy';

export class GradientRect extends Rect {
    static className = 'GradientRect';

    @ActionOnSet<GradientRect>({
        newValue(fill: string) {
            this.updateGradientInstance(fill);
        },
    })
    @SceneChangeDetection({ redraw: RedrawType.MINOR })
    linearGradient: string | undefined = 'linear-gradient(0deg, white, black)';

    protected updateGradientInstance(fill: string) {
        let angle = 0;
        let colors = ['white', 'black'];
        const match = fill?.match(/^linear-gradient\((.*?)deg,\s*(.*?)\s*\)$/i);

        if (match) {
            angle = parseFloat(match[1]);
            colors = [];
            const colorsPart = match[2];
            const colorRegex = /(#[0-9a-f]+)|(rgba?\(.+?\)|([a-z]+))/gi;
            let c: RegExpExecArray | null;
            while ((c = colorRegex.exec(colorsPart))) {
                colors.push(c[0]);
            }
        }

        this.gradientInstance = new LinearGradient();
        this.gradientInstance.angle = angle;
        this.gradientInstance.stops = colors.map((color, index) => {
            const offset = index / (colors.length - 1);
            return { offset, color };
        });
    }

    protected renderFill(ctx: CanvasRenderingContext2D) {
        const { fill, path, opacity, microPixelEffectOpacity } = this;

        const { gradientInstance, fillOpacity, fillShadow } = this;
        if (gradientInstance) {
            ctx.fillStyle = gradientInstance.createGradient(ctx, this.computeBBox());
        } else {
            ctx.fillStyle = fill ?? 'black';
        }
        ctx.globalAlpha = opacity * fillOpacity * microPixelEffectOpacity;

        // The canvas context scaling (depends on the device's pixel ratio)
        // has no effect on shadows, so we have to account for the pixel ratio
        // manually here.
        if (fillShadow && fillShadow.enabled) {
            const pixelRatio = this.layerManager?.canvas.pixelRatio ?? 1;

            ctx.shadowColor = fillShadow.color;
            ctx.shadowOffsetX = fillShadow.xOffset * pixelRatio;
            ctx.shadowOffsetY = fillShadow.yOffset * pixelRatio;
            ctx.shadowBlur = fillShadow.blur * pixelRatio;
        }
        path.draw(ctx);
        ctx.fill();
        ctx.shadowColor = 'rgba(0, 0, 0, 0)';
    }
}
