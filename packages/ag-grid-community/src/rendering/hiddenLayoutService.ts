import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { hiddenLayoutCSS } from './hidden-layout.css-GENERATED';

export class HiddenLayoutService extends BeanStub implements NamedBean {
    beanName = 'hiddenLayoutSvc' as const;

    private showCellsOnDelay: boolean = false;

    public hideColumns() {
        console.info('AG Grid: Request Hiding columns');

        // TODO do we need to wait for ctrlsSvc to be ready?
        this.beans.ctrlsSvc.whenReady(this, (p) => {
            this.showCellsOnDelay = true;
            console.warn('AG Grid: Hiding columns');

            p.gridBodyCtrl.eGridBody.classList.add('ag-delay-render');
        });
    }
    public revealColumns() {
        if (!this.showCellsOnDelay) {
            return;
        }

        if (this.showCellsOnDelay) {
            console.warn('AG Grid: Revealing cells after they were hidden for layout purposes');
            this.beans.ctrlsSvc.getGridBodyCtrl().eGridBody.classList.remove('ag-delay-render');
            this.showCellsOnDelay = false;
        }
    }
}

/**
 * @feature Columns -> Column Sizing
 * @gridOption autoSizeStrategy, colDef.flex, initialState
 */
export const HiddenLayoutModule: _ModuleWithoutApi = {
    moduleName: 'HiddenLayout',
    version: VERSION,
    beans: [HiddenLayoutService],
    css: [hiddenLayoutCSS],
};
