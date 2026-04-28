import type { IToolbarComp, IToolbarService, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

export class ToolbarService extends BeanStub implements NamedBean, IToolbarService {
    beanName = 'toolbar' as const;

    public comp?: IToolbarComp;
}
