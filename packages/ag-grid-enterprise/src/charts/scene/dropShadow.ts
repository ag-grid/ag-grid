import { Offset } from "./offset";
export { Offset } from "./offset";

export interface DropShadowOptions {
    color?: string,
    offset?: [number, number],
    blur?: number
}

export class DropShadow {
    color: string;
    offset: Offset;
    blur: number;

    constructor(color: string, offset: Offset, blur: number) {
        this.color = color;
        this.offset = offset;
        this.blur = blur;
        Object.freeze(this);
    }

    static create(options: DropShadowOptions = {}): DropShadow {
        return new DropShadow(
            options.color || 'black',
            options.offset ? new Offset(options.offset[0], options.offset[1]) : new Offset(0, 0),
            options.blur || 0
        );
    }
}
