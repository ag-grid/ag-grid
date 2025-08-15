import { _debounce } from '../agStack/utils/function';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { hiddenLayoutCSS } from './hidden-layout.css-GENERATED';

export class HiddenLayoutService extends BeanStub implements NamedBean {
    beanName = 'hiddenLayoutSvc' as const;

    private showCellsOnDelay: boolean = false;

    // private doesRequireHiddenLayout = new Map<string, () => boolean>();
    // private readonly activeRequirements = new Set<string>();
    private firstDataRendered = false;

    public postConstruct(): void {
        // TODO: Make this conditional on a grid option!!!

        this.beans.ctrlsSvc.whenReady(this, () => {
            //     let requiresHiddenLayout = false;
            //     for (const [key, requirement] of this.doesRequireHiddenLayout) {
            //         if (requirement()) {
            //             requiresHiddenLayout = true;
            //             this.activeRequirements.add(key);
            //         }
            //     }

            //     if (requiresHiddenLayout) {
            //         console.log(
            //             'AG Grid: Delaying rendering of cells due to',
            //             [...this.activeRequirements.keys()].join(', ')
            //         );
            //         this.beans.ctrlsSvc.getGridBodyCtrl().eGridBody.classList.add('ag-delay-render');
            //         this.showCellsOnDelay = true;
            //     }
            this.beans.ctrlsSvc.getGridBodyCtrl().eGridBody.classList.add('ag-delay-render');
            this.showCellsOnDelay = true;
        });

        const showCells = () => {
            if (this.showCellsOnDelay) {
                console.warn('AG Grid: DEBUNCED1 Revealing cells after they were hidden for layout purposes');
                this.beans.ctrlsSvc.getGridBodyCtrl().eGridBody.classList.remove('ag-delay-render');
                this.showCellsOnDelay = false;
            }
        };
        const debouncedShowCells = _debounce(this, showCells, 10);

        this.addManagedEventListeners({
            firstDataRendered: () => {
                console.warn('AG Grid: Revealing cells after first data rendered');
                debouncedShowCells();
                this.firstDataRendered = true;
            },
            scrollVisibilityChanged: () => {
                console.warn('AG Grid: Revealing cells after scroll visibility changed');
                if (this.firstDataRendered) {
                    debouncedShowCells();
                }
            },
            bodyScroll: () => {
                console.warn('AG Grid: Revealing cells after body scroll');
                if (this.firstDataRendered) {
                    debouncedShowCells();
                }
            },
        });
    }

    public registerHiddenLayoutRequirement(key: string, requirement: () => boolean): void {
        // this.doesRequireHiddenLayout.set(key, requirement);
    }

    public revealCells(key: string): void {
        // if (this.showCellsOnDelay) {
        //     this.activeRequirements.delete(key);
        //     this.doesRequireHiddenLayout.delete(key);
        //     if (this.activeRequirements.size > 0) {
        //         return; // still have requirements, so don't reveal cells
        //     }
        //     setTimeout(() => {
        //         // console.warn('AG Grid: Revealing cells after they were hidden for layout purposes');
        //         // this.beans.ctrlsSvc.getGridBodyCtrl().eGridBody.classList.remove('ag-delay-render');
        //         // this.showCellsOnDelay = false;
        //     }, 0);
        // }
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
