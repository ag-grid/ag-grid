import type { HeaderStyle } from '../../../entities/colDef';
import type { IFloatingFilterComp } from '../../../filter/floating/floatingFilter';
import type { UserCompDetails } from '../../../interfaces/iUserCompDetails';
import { _addStylesToElement, _setDisplayed } from '../../../utils/dom';
import type { AgPromise } from '../../../utils/promise';
import { RefPlaceholder } from '../../../widgets/component';
import { AbstractHeaderCellComp } from '../abstractCell/abstractHeaderCellComp';
import type { HeaderFilterCellCtrl } from './headerFilterCellCtrl';
import type { IHeaderFilterCellComp } from './iHeaderFilterCellComp';

export class HeaderFilterCellComp extends AbstractHeaderCellComp<HeaderFilterCellCtrl> {
    private readonly eFloatingFilterBody: HTMLElement = RefPlaceholder;
    private readonly eButtonWrapper: HTMLElement = RefPlaceholder;
    private readonly eButtonShowMainFilter: HTMLElement = RefPlaceholder;

    private floatingFilterComp: IFloatingFilterComp | undefined;
    private compPromise: AgPromise<IFloatingFilterComp> | null;

    constructor(ctrl: HeaderFilterCellCtrl) {
        super(
            /* html */ `<div class="ag-header-cell ag-floating-filter" role="gridcell">
            <div data-ref="eFloatingFilterBody" role="presentation"></div>
            <div class="ag-floating-filter-button ag-hidden" data-ref="eButtonWrapper" role="presentation">
                <button type="button" class="ag-button ag-floating-filter-button-button" data-ref="eButtonShowMainFilter" tabindex="-1"></button>
            </div>
        </div>`,
            ctrl
        );
    }

    public postConstruct(): void {
        const eGui = this.getGui();

        const compProxy: IHeaderFilterCellComp = {
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
            setUserStyles: (styles: HeaderStyle) => _addStylesToElement(eGui, styles),
            addOrRemoveBodyCssClass: (cssClassName, on) => this.eFloatingFilterBody.classList.toggle(cssClassName, on),
            setButtonWrapperDisplayed: (displayed) => _setDisplayed(this.eButtonWrapper, displayed),
            setCompDetails: (compDetails) => this.setCompDetails(compDetails),
            getFloatingFilterComp: () => this.compPromise,
            setWidth: (width) => (eGui.style.width = width),
            setMenuIcon: (eIcon) => this.eButtonShowMainFilter.appendChild(eIcon),
        };

        this.ctrl.setComp(compProxy, eGui, this.eButtonShowMainFilter, this.eFloatingFilterBody, undefined);
    }

    private setCompDetails(compDetails?: UserCompDetails | null): void {
        if (!compDetails) {
            this.destroyFloatingFilterComp();
            this.compPromise = null;
            return;
        }
        // because we are providing defaultFloatingFilterType, we know it will never be undefined;
        this.compPromise = compDetails.newAgStackInstance();
        this.compPromise.then((comp) => this.afterCompCreated(comp));
    }

    public override destroy(): void {
        this.destroyFloatingFilterComp();
        super.destroy();
    }

    private destroyFloatingFilterComp(): void {
        if (this.floatingFilterComp) {
            this.eFloatingFilterBody.removeChild(this.floatingFilterComp.getGui());
            this.floatingFilterComp = this.destroyBean(this.floatingFilterComp);
        }
    }

    private afterCompCreated(comp: IFloatingFilterComp | null): void {
        if (!comp) {
            return;
        }

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
