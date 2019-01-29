export class Offset {
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        Object.freeze(this);
    }

    x: number;
    y: number;
}
