import type { IToolbarComp, IToolbarItem, IToolbarService, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

export class ToolbarService extends BeanStub implements NamedBean, IToolbarService {
    beanName = 'toolbar' as const;

    private comp?: IToolbarComp;

    public setToolbar(toolbar: IToolbarComp): void {
        this.comp = toolbar;
    }

    public clearToolbar(toolbar: IToolbarComp): void {
        // Identity check guards against a newer toolbar instance being clobbered if the previous one's
        // destroy runs after the new one's setToolbar.
        if (this.comp === toolbar) {
            this.comp = undefined;
        }
    }

    public getToolbarItemInstance<T = IToolbarItem>(key: string): T | undefined {
        return this.comp?.getToolbarItemInstance<T>(key);
    }
}
