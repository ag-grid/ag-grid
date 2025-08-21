import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { hiddenLayoutCSS } from './hidden-layout.css-GENERATED';

const HideClass = 'ag-delay-render';

export class HiddenLayoutService extends BeanStub implements NamedBean {
    beanName = 'hiddenLayoutSvc' as const;

    private showCellsOnDelay: boolean = false;

    public hideColumns() {
        this.beans.ctrlsSvc.whenReady(this, (p) => {
            this.showCellsOnDelay = true;
            p.gridBodyCtrl.eGridBody.classList.add(HideClass);
        });
    }
    public revealColumns() {
        if (!this.showCellsOnDelay) {
            return;
        }

        if (this.showCellsOnDelay) {
            this.beans.ctrlsSvc.getGridBodyCtrl().eGridBody.classList.remove(HideClass);
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
