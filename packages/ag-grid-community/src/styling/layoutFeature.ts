import { BeanStub } from '../context/beanStub';
import type { DomLayoutType } from '../entities/gridOptions';

export interface LayoutView {
    updateLayoutClasses(layoutClass: string, params: UpdateLayoutClassesParams): void;
}

export const LayoutCssClasses = {
    AUTO_HEIGHT: 'ag-layout-auto-height',
    NORMAL: 'ag-layout-normal',
    PRINT: 'ag-layout-print',
} as const;

export interface UpdateLayoutClassesParams {
    autoHeight: boolean;
    normal: boolean;
    print: boolean;
}

/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getLayoutCssClass(domLayout: DomLayoutType | undefined): string {
    return domLayout === 'autoHeight'
        ? LayoutCssClasses.AUTO_HEIGHT
        : domLayout === 'print'
          ? LayoutCssClasses.PRINT
          : LayoutCssClasses.NORMAL;
}

export class LayoutFeature extends BeanStub {
    constructor(private readonly view: LayoutView) {
        super();
    }

    public postConstruct(): void {
        this.addManagedPropertyListener('domLayout', this.updateLayoutClasses.bind(this));
        this.updateLayoutClasses();
    }

    private updateLayoutClasses(): void {
        const domLayout = this.gos.get('domLayout');
        const params = {
            autoHeight: domLayout === 'autoHeight',
            normal: domLayout === 'normal',
            print: domLayout === 'print',
        };
        this.view.updateLayoutClasses(_getLayoutCssClass(domLayout), params);
    }
}
