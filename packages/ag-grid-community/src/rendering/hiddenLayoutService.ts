import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { hiddenLayoutCSS } from './hidden-layout.css-GENERATED';

export class HiddenLayoutService extends BeanStub implements NamedBean {
    beanName = 'hiddenLayoutSvc' as const;

    private showCellsOnDelay: boolean = false;

    public postConstruct(): void {
        this.addManagedEventListeners({
            revealHiddenContent: () => {
                if (this.showCellsOnDelay) {
                    console.warn('AG Grid: Revealing cells after they were hidden for layout purposes');
                    this.beans.ctrlsSvc.getGridBodyCtrl().eGridBody.classList.remove('ag-delay-render');
                    this.showCellsOnDelay = false;
                }
            },
        });
    }

    public hideCells() {
        this.showCellsOnDelay = true;
        this.beans.ctrlsSvc.getGridBodyCtrl().eGridBody.classList.add('ag-delay-render');
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
