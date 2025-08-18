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

    private readonly showCells = () => {
        if (this.showCellsOnDelay) {
            console.warn('AG Grid: DEBUNCED1 Revealing cells after they were hidden for layout purposes');
            this.beans.ctrlsSvc.getGridBodyCtrl().eGridBody.classList.remove('ag-delay-render');
            this.showCellsOnDelay = false;
        }
    };
    private readonly debouncedShowCells = _debounce(
        this,
        () => {
            //
        },
        100
    );

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

        this.addManagedEventListeners({
            firstDataRendered: () => {
                console.warn('AG Grid: Revealing cells after first data rendered');
                this.debouncedShowCells();
                setTimeout(() => {
                    this.showCells();
                }, 16); // Ensure the DOM is updated before revealing cells
                this.firstDataRendered = true;
            },
            gridReady: () => {
                console.warn('AG Grid: Revealing cells after grid ready');
                this.debouncedShowCells();
                setTimeout(() => {
                    if (!this.firstDataRendered) {
                        this.showCells();
                    }
                }, 16); // Ensure the DOM is updated before revealing cells
            },
            // scrollVisibilityChanged: () => {
            //     if (this.firstDataRendered) {
            //         console.warn('AG Grid: Revealing cells after scroll visibility changed');
            //         this.debouncedShowCells();
            //     }
            // },
            // bodyScroll: () => {
            //     if (this.firstDataRendered) {
            //         console.warn('AG Grid: Revealing cells after body scroll');
            //         this.debouncedShowCells();
            //     }
            // },
        });
    }

    public registerHiddenLayoutRequirement(key: string, requirement: () => boolean): void {
        // this.doesRequireHiddenLayout.set(key, requirement);
    }

    public hideCells() {
        // this.beans.ctrlsSvc.getGridBodyCtrl().eGridBody.classList.add('ag-delay-render');
        // this.showCellsOnDelay = true;
        this.debouncedShowCells();
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
