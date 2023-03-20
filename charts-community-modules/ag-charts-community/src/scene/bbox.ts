// For small data structs like a bounding box, objects are superior to arrays
// in terms of performance (by 3-4% in Chrome 71, Safari 12 and by 20% in Firefox 64).
// They are also self descriptive and harder to abuse.
// For example, one has to do:
// `ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);`
// rather than become enticed by the much slower:
// `ctx.strokeRect(...bbox);`
// https://jsperf.com/array-vs-object-create-access

type Padding = {
    top: number;
    left: number;
    right: number;
    bottom: number;
};

export class BBox {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    clone() {
        const { x, y, width, height } = this;
        return new BBox(x, y, width, height);
    }

    equals(other: BBox) {
        return this.x === other.x && this.y === other.y && this.width === other.width && this.height === other.height;
    }

    containsPoint(x: number, y: number): boolean {
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
    }

    isInfinite() {
        return (
            Math.abs(this.x) === Infinity ||
            Math.abs(this.y) === Infinity ||
            Math.abs(this.width) === Infinity ||
            Math.abs(this.height) === Infinity
        );
    }

    shrink(amounts: Partial<Padding>): this;
    shrink(amount: number, position?: 'top' | 'left' | 'bottom' | 'right' | 'vertical' | 'horizontal'): this;
    shrink(
        amount: number | Partial<Padding>,
        position?: 'top' | 'left' | 'bottom' | 'right' | 'vertical' | 'horizontal'
    ) {
        const apply = (pos: typeof position, amt: number) => {
            switch (pos) {
                case 'top':
                    this.y += amt;
                // eslint-disable-next-line no-fallthrough
                case 'bottom':
                    this.height -= amt;
                    break;
                case 'left':
                    this.x += amt;
                // eslint-disable-next-line no-fallthrough
                case 'right':
                    this.width -= amt;
                    break;
                case 'vertical':
                    this.y += amt;
                    this.height -= amt * 2;
                    break;
                case 'horizontal':
                    this.x += amt;
                    this.width -= amt * 2;
                    break;
                default:
                    this.x += amt;
                    this.width -= amt * 2;
                    this.y += amt;
                    this.height -= amt * 2;
            }
        };

        if (typeof amount === 'number') {
            apply(position, amount);
        } else {
            Object.entries(amount).forEach(([pos, amt]) => apply(pos as typeof position, amt!));
        }

        return this;
    }

    grow(amounts: Partial<Padding>): this;
    grow(amount: number, position?: 'top' | 'left' | 'bottom' | 'right' | 'vertical' | 'horizontal'): this;
    grow(
        amount: number | Partial<Padding>,
        position?: 'top' | 'left' | 'bottom' | 'right' | 'vertical' | 'horizontal'
    ) {
        if (typeof amount === 'number') {
            this.shrink(-amount, position);
        } else {
            const paddingCopy = { ...amount };

            for (const key in paddingCopy) {
                (paddingCopy as any)[key] *= -1;
            }

            this.shrink(paddingCopy);
        }

        return this;
    }

    static merge(boxes: BBox[]) {
        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;
        boxes.forEach((box) => {
            if (box.x < left) {
                left = box.x;
            }
            if (box.y < top) {
                top = box.y;
            }
            if (box.x + box.width > right) {
                right = box.x + box.width;
            }
            if (box.y + box.height > bottom) {
                bottom = box.y + box.height;
            }
        });
        return new BBox(left, top, right - left, bottom - top);
    }
}
