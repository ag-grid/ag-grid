import { Constants } from "../constants/constants";
import { BeanStub } from "../context/beanStub";
import { Autowired, PostConstruct } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";

export interface LayoutView {
    updateLayoutClasses(layoutClass: string, params: UpdateLayoutClassesParams): void;
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
        this.addManagedPropertyListener('domLayout', this.updateLayoutClasses.bind(this));
        this.updateLayoutClasses();
    }

    private updateLayoutClasses(): void {
        const domLayout = this.gridOptionsWrapper.getDomLayout();
        const params = {
            autoHeight: domLayout === Constants.DOM_LAYOUT_AUTO_HEIGHT,
            normal: domLayout === Constants.DOM_LAYOUT_NORMAL,
            print: domLayout === Constants.DOM_LAYOUT_PRINT
        };
        const cssClass = params.autoHeight ? LayoutCssClasses.AUTO_HEIGHT :
                            params.print ? LayoutCssClasses.PRINT : LayoutCssClasses.NORMAL;
        this.view.updateLayoutClasses(cssClass, params);
    }

}