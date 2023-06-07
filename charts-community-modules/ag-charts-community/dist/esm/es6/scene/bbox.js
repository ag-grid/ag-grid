// For small data structs like a bounding box, objects are superior to arrays
// in terms of performance (by 3-4% in Chrome 71, Safari 12 and by 20% in Firefox 64).
// They are also self descriptive and harder to abuse.
// For example, one has to do:
// `ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);`
// rather than become enticed by the much slower:
// `ctx.strokeRect(...bbox);`
// https://jsperf.com/array-vs-object-create-access
export class BBox {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    clone() {
        const { x, y, width, height } = this;
        return new BBox(x, y, width, height);
    }
    equals(other) {
        return this.x === other.x && this.y === other.y && this.width === other.width && this.height === other.height;
    }
    containsPoint(x, y) {
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
    }
    collidesBBox(other) {
        return (this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y);
    }
    isInfinite() {
        return (Math.abs(this.x) === Infinity ||
            Math.abs(this.y) === Infinity ||
            Math.abs(this.width) === Infinity ||
            Math.abs(this.height) === Infinity);
    }
    shrink(amount, position) {
        const apply = (pos, amt) => {
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
        }
        else {
            Object.entries(amount).forEach(([pos, amt]) => apply(pos, amt));
        }
        return this;
    }
    grow(amount, position) {
        if (typeof amount === 'number') {
            this.shrink(-amount, position);
        }
        else {
            const paddingCopy = Object.assign({}, amount);
            for (const key in paddingCopy) {
                paddingCopy[key] *= -1;
            }
            this.shrink(paddingCopy);
        }
        return this;
    }
    static merge(boxes) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmJveC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY2VuZS9iYm94LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDZFQUE2RTtBQUM3RSxzRkFBc0Y7QUFDdEYsc0RBQXNEO0FBQ3RELDhCQUE4QjtBQUM5Qiw2REFBNkQ7QUFDN0QsaURBQWlEO0FBQ2pELDZCQUE2QjtBQUM3QixtREFBbUQ7QUFXbkQsTUFBTSxPQUFPLElBQUk7SUFNYixZQUFZLENBQVMsRUFBRSxDQUFTLEVBQUUsS0FBYSxFQUFFLE1BQWM7UUFDM0QsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxLQUFLO1FBQ0QsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztRQUNyQyxPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBVztRQUNkLE9BQU8sSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ2xILENBQUM7SUFFRCxhQUFhLENBQUMsQ0FBUyxFQUFFLENBQVM7UUFDOUIsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxJ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