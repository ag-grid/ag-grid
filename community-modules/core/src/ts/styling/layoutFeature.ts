import { Autowired, PostConstruct } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { BeanStub } from "../context/beanStub";

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
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_DOM_LAYOUT, this.updateLayoutClasses.bind(this));
        this.updateLayoutClasses();
    }

    private updateLayoutClasses(): void {
        const domLayout = this.gridOptionsWrapper.getDomLayout();
        const params = {
            autoHeight: domLayout === 'autoHeight',
            normal: domLayout === 'normal',
            print: domLayout === 'print'
        };
        const cssClass = params.autoHeight ? LayoutCssClasses.AUTO_HEIGHT :
                            params.print ? LayoutCssClasses.PRINT : LayoutCssClasses.NORMAL;
        this.view.updateLayoutClasses(cssClass, params);
    }

}