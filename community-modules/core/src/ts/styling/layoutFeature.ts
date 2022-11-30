import { PostConstruct } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { DomLayoutType } from "../entities/gridOptions";
import { doOnce } from "../utils/function";

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
        const domLayout = this.getDomLayout();
        const params = {
            autoHeight: domLayout === 'autoHeight',
            normal: domLayout === 'normal',
            print: domLayout === 'print'
        };
        const cssClass = params.autoHeight ? LayoutCssClasses.AUTO_HEIGHT :
                            params.print ? LayoutCssClasses.PRINT : LayoutCssClasses.NORMAL;
        this.view.updateLayoutClasses(cssClass, params);
    }

    // returns either 'print', 'autoHeight' or 'normal' (normal is the default)
    private getDomLayout(): DomLayoutType {
        const domLayout: DomLayoutType = this.gridOptionsService.get('domLayout') ?? 'normal';
        const validLayouts: DomLayoutType[] = ['normal', 'print', 'autoHeight'];

        if (validLayouts.indexOf(domLayout) === -1) {
            doOnce(
                () =>
                    console.warn(
                        `AG Grid: ${domLayout} is not valid for DOM Layout, valid values are 'normal', 'autoHeight', 'print'.`
                    ),
                'warn about dom layout values'
            );
            return 'normal';
        }

        return domLayout;
    }

}