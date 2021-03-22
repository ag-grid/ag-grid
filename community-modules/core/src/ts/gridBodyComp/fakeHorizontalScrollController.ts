import { BeanStub } from "../context/beanStub";

export interface FakeHorizontalScrollView {

}

export class FakeHorizontalScrollController extends BeanStub {

    private view: FakeHorizontalScrollView;

    constructor(view: FakeHorizontalScrollView) {
        super();
        this.view = view;
    }

}
