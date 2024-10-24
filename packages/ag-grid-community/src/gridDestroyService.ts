import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';

export class GridDestroyService extends BeanStub implements NamedBean {
    beanName = 'gridDestroyService' as const;

    private destroyCalled = false;

    public override destroy(): void {
        // prevent infinite loop
        if (this.destroyCalled) {
            return;
        }

        this.eventService.dispatchEvent({
            type: 'gridPreDestroyed',
            state: this.beans.stateService?.getState() ?? {},
        });

        // Set after pre-destroy so user can still use the api in pre-destroy event and it is not marked as destroyed yet.
        this.destroyCalled = true;

        // destroy the UI first (as they use the services)
        this.beans.ctrlsService.get('gridCtrl')?.destroyGridUi();

        // destroy the services
        this.beans.context.destroy();
        super.destroy();
    }

    public isDestroyCalled(): boolean {
        return this.destroyCalled;
    }
}
