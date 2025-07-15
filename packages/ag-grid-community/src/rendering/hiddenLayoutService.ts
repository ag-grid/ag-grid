import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { hiddenLayoutCSS } from './hidden-layout.css-GENERATED';

export class HiddenLayoutService extends BeanStub implements NamedBean {
    beanName = 'hiddenLayoutSvc' as const;

    private showCellsOnDelay: boolean = false;

    private doesRequireHiddenLayout: (() => boolean)[] = [];

    public postConstruct(): void {
        this.beans.ctrlsSvc.whenReady(this, () => {
            let requiresHiddenLayout = false;
            for (const requirement of this.doesRequireHiddenLayout) {
                if (requirement()) {
                    requiresHiddenLayout = true;
                    break;
                }
            }

            if (requiresHiddenLayout) {
                console.log('AG Grid: Delaying rendering of cells until the first data is rendered');
                this.beans.ctrlsSvc.getGridBodyCtrl().eGridBody.classList.add('ag-delay-render');
                this.showCellsOnDelay = true;
            }
        });
    }

    public registerHiddenLayoutRequirement(requirement: () => boolean): void {
        this.doesRequireHiddenLayout.push(requirement);
    }

    public revealCells(): void {
        if (this.showCellsOnDelay) {
            // setTimeout(() => {
            console.log('AG Grid: Revealing cells after they were hidden for layout purposes');
            this.beans.ctrlsSvc.getGridBodyCtrl().eGridBody.classList.remove('ag-delay-render');
            this.showCellsOnDelay = false;
            // }, 10);
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
