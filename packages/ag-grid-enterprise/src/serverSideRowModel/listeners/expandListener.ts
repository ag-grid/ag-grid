import type { NamedBean } from 'ag-grid-community';
import { BeanStub, _isServerSideRowModel } from 'ag-grid-community';

import type { ServerSideExpansionService } from '../services/serverSideExpansionService';

export class ExpandListener extends BeanStub implements NamedBean {
    beanName = 'ssrmExpandListener' as const;

    public postConstruct(): void {
        if (!_isServerSideRowModel(this.gos)) {
            return; // only want to be active if SSRM active, otherwise would be interfering with other row models
        }

        this.addManagedEventListeners({ rowExpansionStateChanged: this.onRowExpandStateChanged.bind(this) });
    }

    private onRowExpandStateChanged(): void {
        const beans = this.beans;
        const expansionSvx = beans.expansionSvc as ServerSideExpansionService;
        beans.rowModel.forEachNode((rowNode) => {
            expansionSvx.updateExpandedState(rowNode);
        });

        this.eventSvc.dispatchEvent({ type: 'storeUpdated' });
    }
}
