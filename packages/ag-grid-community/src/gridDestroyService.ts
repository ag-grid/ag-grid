import { _throwErrors } from 'ag-stack';

import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';

export class GridDestroyService extends BeanStub implements NamedBean {
    beanName = 'gridDestroySvc' as const;

    public destroyCalled = false;

    public override destroy(): void {
        // prevent infinite loop
        if (this.destroyCalled) {
            return;
        }

        const { stateSvc, ctrlsSvc, context } = this.beans;

        const errors = this.eventSvc.dispatchEventCollectingErrors({
            type: 'gridPreDestroyed',
            state: stateSvc?.getState() ?? {},
        });

        // Set after pre-destroy so user can still use the api in pre-destroy event and it is not marked as destroyed yet.
        this.destroyCalled = true;

        // destroy the UI first (as they use the services)
        ctrlsSvc.get('gridCtrl')?.destroyGridUi();

        // destroy the services
        context.destroy(errors);
        super.destroy();

        _throwErrors(errors);
    }
}
