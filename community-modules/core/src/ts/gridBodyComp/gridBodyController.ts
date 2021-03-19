import { BeanStub } from "../context/beanStub";

export interface GridBodyView {

}

export class GridBodyController extends BeanStub {

    private view: GridBodyView;

    constructor(view: GridBodyView) {
        super();
        this.view = view;
    }
}
