import { BeanStub } from '../context/beanStub';
import type { DomLayoutType } from '../entities/gridOptions';
import { _warnOnce } from '../utils/function';

export interface LayoutView {
    updateLayoutClasses(layoutClass: string, params: UpdateLayoutClassesParams): void;
}

export enum LayoutCssClasses {
    AUTO_HEIGHT = 'ag-layout-auto-height',
    NORMAL = 'ag-layout-normal',
    PRINT = 'ag-layout-print',
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

    public postConstruct(): void {
        this.addManagedPropertyListener('domLayout', this.updateLayoutClasses.bind(this));
        this.updateLayoutClasses();
    }

    private updateLayoutClasses(): void {
        const domLayout = this.getDomLayout();
        const params = {
            autoHeight: domLayout === 'autoHeight',
            normal: domLayout === 'normal',
            print: domLayout === 'print',
        };
        const cssClass = params.autoHeight
            ? LayoutCssClasses.AUTO_HEIGHT
            : params.print
              ? LayoutCssClasses.PRINT
              : LayoutCssClasses.NORMAL;
        this.view.updateLayoutClasses(cssClass, params);
    }

    // returns either 'print', 'autoHeight' or 'normal' (normal is the default)
    private getDomLayout(): DomLayoutType {
        const domLayout: DomLayoutType = this.gos.get('domLayout') ?? 'normal';
        const validLayouts: DomLayoutType[] = ['normal', 'print', 'autoHeight'];

        if (validLayouts.indexOf(domLayout) === -1) {
            _warnOnce(`${domLayout} is not valid for DOM Layout, valid values are 'normal', 'autoHeight', 'print'.`);
            return 'normal';
        }

        return domLayout;
    }
}
