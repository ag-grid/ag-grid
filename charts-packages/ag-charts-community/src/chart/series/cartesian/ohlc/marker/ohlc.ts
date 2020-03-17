import { Path } from "../../../../../scene/shape/path";

export abstract class OHLC extends Path {
    protected _date: number = 0;
    set date(value: number) {
        if (this._date !== value) {
            this._date = value;
            this.dirtyPath = true;
        }
    }
    get date(): number {
        return this._date;
    }

    protected _open: number = 0;
    set open(value: number) {
        if (this._open !== value) {
            this._open = value;
            this.dirtyPath = true;
        }
    }
    get open(): number {
        return this._open;
    }

    protected _high: number = 0;
    set high(value: number) {
        if (this._high !== value) {
            this._high = value;
            this.dirtyPath = true;
        }
    }
    get high(): number {
        return this._high;
    }

    protected _low: number = 0;
    set low(value: number) {
        if (this._low !== value) {
            this._low = value;
            this.dirtyPath = true;
        }
    }
    get low(): number {
        return this._low;
    }

    protected _close: number = 0;
    set close(value: number) {
        if (this._close !== value) {
            this._close = value;
            this.dirtyPath = true;
        }
    }
    get close(): number {
        return this._close;
    }

    protected _width: number = 5;
    set width(value: number) {
        if (this._width !== value) {
            this._width = value;
            this.dirtyPath = true;
        }
    }
    get width(): number {
        return this._width;
    }

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

        // path.moveTo(x, high);
        // path.lineTo(x, Math.min(open, close));

        // path.moveTo(x, low);
        // path.lineTo(x, Math.max(open, close));

        // path.moveTo(x - dx, close);
        // path.lineTo(x + dx, close);
        // path.lineTo(x + dx, open);
        // path.lineTo(x - dx, open);
        // path.closePath();
    }
}