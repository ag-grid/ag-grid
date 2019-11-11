import Scale from "./scale/scale";
import { normalizeAngle360 } from "./util/angle";

export class CanvasAxis<D> {
    constructor(scale: Scale<D, number>) {
        this.scale = scale;
    }

    scale: Scale<D, number>;

    translation: [number, number] = [0, 0];
    rotation: number = 0; // radians

    lineWidth: number = 1;
    tickWidth: number = 1;
    tickSize: number = 6;
    tickPadding: number = 5;
    lineColor: string = 'black';
    tickColor: string = 'black';
    labelFont: string = '14px Verdana';
    labelColor: string = 'black';
    flippedLabels: boolean = false;
    mirroredLabels: boolean = false;

    // To translate or rotate the axis the ctx can be transformed prior to render
    render(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.translation[0], this.translation[1]);
        ctx.rotate(this.rotation);

        const scale = this.scale;

        // Render ticks and labels.
        {
            const ticks = scale.ticks!(10);
            const bandwidth = (scale.bandwidth || 0) / 2;
            const tickCount = ticks.length;
            const pxShift = Math.floor(this.tickWidth) % 2 / 2;
            const sideFlag = this.mirroredLabels ? 1 : -1;
            ctx.lineWidth = this.tickWidth;
            ctx.strokeStyle = this.tickColor;
            ctx.fillStyle = this.labelColor;
            ctx.textAlign = sideFlag === -1 ? 'end' : 'start';
            ctx.textBaseline = 'middle';
            ctx.font = this.labelFont;
            ctx.beginPath();
            for (let i = 0; i < tickCount; i++) {
                const tick = ticks[i] as any;
                const r = scale.convert(tick) - this.tickWidth / 2 + bandwidth;
                ctx.moveTo(sideFlag * this.tickSize, r + pxShift);
                ctx.lineTo(0, r + pxShift);
                if (this.flippedLabels) {
                    const rotation = normalizeAngle360(this.rotation);
                    const flipFlag = (rotation >= 0 && rotation <= Math.PI) ? -1 : 1;

                    ctx.save();
                    ctx.translate(sideFlag * (this.tickSize + this.tickPadding), r);
                    ctx.rotate(flipFlag * Math.PI / 2);
                    
                    const labelWidth = ctx.measureText(tick.toString()).width;
                    ctx.fillText(tick.toString(), -sideFlag * labelWidth / 2, -sideFlag * flipFlag * this.tickPadding);
                    ctx.restore();
                } else {
                    ctx.fillText(tick.toString(), sideFlag * (this.tickSize + this.tickPadding), r);
                }
            }
            ctx.stroke();
        }

        // Render axis line.
        {
            const pxShift = Math.floor(this.lineWidth) % 2 / 2;
            ctx.lineWidth = this.lineWidth;
            ctx.strokeStyle = this.lineColor;
            ctx.beginPath();
            ctx.moveTo(pxShift, scale.range[0]);
            ctx.lineTo(pxShift, scale.range[scale.range.length - 1]);
            ctx.stroke();
        }

        ctx.restore();
    }
}
