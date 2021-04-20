import { Constants } from "../constants/constants";
import { Autowired, PostConstruct } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { BeanStub } from "../context/beanStub";

export interface LayoutView {
    updateLayoutClasses(params: UpdateLayoutClassesParams): void;
}

export enum LayoutCssClasses {
    AUTO_HEIGHT = 'ag-layout-auto-height',
    NORMAL = 'ag-layout-normal',
    PRINT = 'ag-layout-print'
}

export interface UpdateLayoutClassesParams {
    autoHeight: boolean;
    normal: boolean;
    print: boolean;
}

export class LayoutFeature extends BeanStub {

    @Autowired('gridOptionsWrapper') protected readonly gridOptionsWrapper: GridOptionsWrapper;

    private view: LayoutView;

    constructor(view: LayoutView) {
        super();
        this.view = view;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_DOM_LAYOUT, this.updateLayoutClasses.bind(this));
        this.updateLayoutClasses();
    }

    private updateLayoutClasses(): void {
        const domLayout = this.gridOptionsWrapper.getDomLayout();

        this.view.updateLayoutClasses({
            autoHeight: domLayout === Constants.DOM_LAYOUT_AUTO_HEIGHT,
            normal: domLayout === Constants.DOM_LAYOUT_NORMAL,
            print: domLayout === Constants.DOM_LAYOUT_PRINT
        })
    }

}