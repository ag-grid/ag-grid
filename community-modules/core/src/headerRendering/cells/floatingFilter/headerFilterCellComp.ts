import { UserCompDetails } from "../../../components/framework/userComponentFactory";
import { PostConstruct, PreDestroy } from '../../../context/context';
import { IFloatingFilterComp } from '../../../filter/floating/floatingFilter';
import { AgPromise } from '../../../utils';
import { setDisplayed } from "../../../utils/dom";
import { RefSelector } from '../../../widgets/componentAnnotations';
import { AbstractHeaderCellComp } from '../abstractCell/abstractHeaderCellComp';
import { HeaderFilterCellCtrl, IHeaderFilterCellComp } from './headerFilterCellCtrl';

export class HeaderFilterCellComp extends AbstractHeaderCellComp<HeaderFilterCellCtrl> {

    private static TEMPLATE = /* html */
        `<div class="ag-header-cell ag-floating-filter" role="gridcell">
            <div ref="eFloatingFilterBody" role="presentation"></div>
            <div class="ag-floating-filter-button ag-hidden" ref="eButtonWrapper" role="presentation">
                <button type="button" class="ag-button ag-floating-filter-button-button" ref="eButtonShowMainFilter" tabindex="-1"></button>
            </div>
        </div>`;

    @RefSelector('eFloatingFilterBody') private readonly eFloatingFilterBody: HTMLElement;
    @RefSelector('eButtonWrapper') private readonly eButtonWrapper: HTMLElement;
    @RefSelector('eButtonShowMainFilter') private readonly eButtonShowMainFilter: HTMLElement;

    private floatingFilterComp: IFloatingFilterComp | undefined;
    private compPromise: AgPromise<IFloatingFilterComp> | null;

    constructor(ctrl: HeaderFilterCellCtrl) {
        super(HeaderFilterCellComp.TEMPLATE, ctrl);
    }

    @PostConstruct
    private postConstruct(): void {
        const eGui = this.getGui();

        const compProxy: IHeaderFilterCellComp = {
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
            addOrRemoveBodyCssClass: (cssClassName, on) => this.eFloatingFilterBody.classList.toggle(cssClassName, on),
            setButtonWrapperDisplayed: (displayed) => setDisplayed(this.eButtonWrapper, displayed),
            setCompDetails: compDetails => this.setCompDetails(compDetails),
            getFloatingFilterComp: () => this.compPromise,
            setWidth: width => eGui.style.width = width,
            setMenuIcon: eIcon => this.eButtonShowMainFilter.appendChild(eIcon)
        };

        this.ctrl.setComp(compProxy, eGui, this.eButtonShowMainFilter, this.eFloatingFilterBody);
    }

    private setCompDetails(compDetails?: UserCompDetails | null): void {
        if (!compDetails) {
            this.destroyFloatingFilterComp();
            this.compPromise = null;
            return;
        }
        // because we are providing defaultFloatingFilterType, we know it will never be undefined;
        this.compPromise = compDetails.newAgStackInstance();
        this.compPromise.then(comp => this.afterCompCreated(comp));
    }

    @PreDestroy
    private destroyFloatingFilterComp(): void {
        if (this.floatingFilterComp) {
            this.eFloatingFilterBody.removeChild(this.floatingFilterComp.getGui());
            this.floatingFilterComp = this.destroyBean(this.floatingFilterComp);
        }
    }

    private afterCompCreated(comp: IFloatingFilterComp | null): void {
        if (!comp) { return; }

        if (!this.isAlive()) {
            this.destroyBean(comp);
            return;
        }

        this.destroyFloatingFilterComp();

        this.floatingFilterComp = comp;
        this.eFloatingFilterBody.appendChild(comp.getGui());

        if (comp.afterGuiAttached) {
            comp.afterGuiAttached();
        }
    }
}
