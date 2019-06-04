import { Offset } from "./offset";
export { Offset } from "./offset";

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
}
