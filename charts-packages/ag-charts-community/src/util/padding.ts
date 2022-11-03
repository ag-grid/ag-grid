import { NUMBER, Validate } from './validation';

export class Padding {
    @Validate(NUMBER(0))
    top: number;

    @Validate(NUMBER(0))
    right: number;

    @Validate(NUMBER(0))
    bottom: number;

    @Validate(NUMBER(0))
    left: number;

    constructor(top: number = 0, right: number = top, bottom: number = top, left: number = right) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }

    clear() {
        this.top = this.right = this.bottom = this.left = 0;
    }
}
