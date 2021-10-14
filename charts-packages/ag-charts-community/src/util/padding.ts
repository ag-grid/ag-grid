import { Observable, reactive } from "./observable";

export class Padding extends Observable {
    @reactive('layoutChange') top: number;
    @reactive('layoutChange') right: number;
    @reactive('layoutChange') bottom: number;
    @reactive('layoutChange') left: number;

    constructor(top: number = 0, right: number = top, bottom: number = top, left: number = right) {
        super();
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }

    clear() {
        this.top = this.right = this.bottom = this.left = 0;
    }
}
