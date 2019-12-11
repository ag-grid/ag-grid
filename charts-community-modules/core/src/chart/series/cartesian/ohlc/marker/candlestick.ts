import { OHLC } from "./ohlc";

export class Candlestick extends OHLC {
    static className = 'OHLC';

    updatePath() {
        const { path, date, open, high, low, close, width, strokeWidth } = this;
        const dx = width / 2;

        {
            const alignment = Math.floor(strokeWidth) % 2 / 2;
            const align = (x: number) => Math.floor(x) + alignment;
            const ax = Math.round(date);
            const axm = align(date - dx);
            const axp = align(date + dx);
            const aopen = align(open);
            const aclose = align(close);

            path.clear();

            path.moveTo(ax, align(high));
            path.lineTo(ax, Math.min(aopen, aclose));

            path.moveTo(ax, align(low));
            path.lineTo(ax, Math.max(aopen, aclose));

            path.moveTo(axm, aclose);
            path.lineTo(axp, aclose);
            path.lineTo(axp, aopen);
            path.lineTo(axm, aopen);
            path.closePath();
        }

        // path.clear();

        // path.moveTo(date, high);
        // path.lineTo(date, Math.min(open, close));

        // path.moveTo(date, low);
        // path.lineTo(date, Math.max(open, close));

        // path.moveTo(date - dx, close);
        // path.lineTo(date + dx, close);
        // path.lineTo(date + dx, open);
        // path.lineTo(date - dx, open);
        // path.closePath();
    }
}