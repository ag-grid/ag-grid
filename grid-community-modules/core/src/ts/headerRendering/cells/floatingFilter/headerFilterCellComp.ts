import { UserCompDetails } from "../../../components/framework/userComponentFactory";
import { PostConstruct } from '../../../context/context';
import { IFloatingFilterComp } from '../../../filter/floating/floatingFilter';
import { AgPromise } from '../../../utils';
import { setDisplayed } from "../../../utils/dom";
import { RefSelector } from '../../../widgets/componentAnnotations';
import { AbstractHeaderCellComp } from '../abstractCell/abstractHeaderCellComp';
import { HeaderFilterCellCtrl, IHeaderFilterCellComp } from './headerFilterCellCtrl';

export class HeaderFilterCellComp extends AbstractHeaderCellComp<HeaderFilterCellCtrl> {

    private static TEMPLATE = /* html */
        `<div class="ag-header-cell ag-floating-filter" role="gridcell" tabindex="-1">
            <div ref="eFloatingFilterBody" role="presentation"></div>
            <div class="ag-floating-filter-button ag-hidden" ref="eButtonWrapper" role="presentation">
                <button type="button" aria-label="Open Filter Menu" class="ag-floating-filter-button-button" ref="eButtonShowMainFilter" tabindex="-1"></button>
            </div>
        </div>`;

    @RefSelector('eFloatingFilterBody') private readonly eFloatingFilterBody: HTMLElement;
    @RefSelector('eButtonWrapper') private readonly eButtonWrapper: HTMLElement;
    @RefSelector('eButtonShowMainFilter') private readonly eButtonShowMainFilter: HTMLElement;

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

    private setCompDetails(compDetails: UserCompDetails): void {
        // because we are providing defaultFloatingFilterType, we know it will never be undefined;
        this.compPromise = compDetails.newAgStackInstance();
        this.compPromise.then(comp => this.afterCompCreated(comp));
    }

    private afterCompCreated(comp: IFloatingFilterComp | null): void {
        if (!comp) { return; }

        this.addDestroyFunc(() => this.context.destroyBean(comp));
        if (!this.isAlive()) { return; }

        this.eFloatingFilterBody.appendChild(comp.getGui());

        if (comp.afterGuiAttached) {
            comp.afterGuiAttached();
        }
    }
}
