export class Padding {
    top: number;
    right: number;
    bottom: number;
    left: number;

    constructor(top: number = 0, right: number = top, bottom: number = top, left: number = right) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }

    clear() {
        this.top = 0;
        this.right = 0;
        this.bottom = 0;
        this.left = 0;
    }
}
