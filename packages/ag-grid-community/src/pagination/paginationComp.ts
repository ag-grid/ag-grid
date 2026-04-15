import type { IAriaAnnouncementService } from '../agStack/interfaces/iAriaAnnouncementService';
import type { BeanCollection } from '../context/context';
import type { PaginationPanel } from '../entities/gridOptions';
import type { FocusableContainer } from '../interfaces/iFocusableContainer';
import { _addFocusableContainerListener, _focusGridInnerElement } from '../utils/gridFocus';
import type { Component, ComponentSelector } from '../widgets/component';
import { TabGuardComp } from '../widgets/tabGuardComp';
import { PageSizeSelectorComp } from './pageSizeSelector/pageSizeSelectorComp';
import { PageSummaryComp } from './pageSummaryComp';
import paginationCompCSS from './paginationComp.css';
import { RowSummaryComp } from './rowSummaryComp';

const VALID_PANEL_NAMES = new Set<PaginationPanel>(['pageSize', 'rowSummary', 'pageSummary']);
const DEFAULT_PANELS: readonly PaginationPanel[] = ['pageSize', 'rowSummary', 'pageSummary'];

class PaginationComp extends TabGuardComp implements FocusableContainer {
    private ariaAnnounce: IAriaAnnouncementService;

    public wireBeans(beans: BeanCollection): void {
        this.ariaAnnounce = beans.ariaAnnounce;
    }

    private pageSizeComp: PageSizeSelectorComp | undefined;
    private rowSummaryComp: RowSummaryComp | undefined;
    private pageSummaryComp: PageSummaryComp | undefined;

    private allowFocusInnerElement = false;

    private ariaRowStatus: string = '';
    private ariaPageStatus: string = '';

    constructor() {
        super();
        this.registerCSS(paginationCompCSS);
    }

    public postConstruct(): void {
        this.setTemplate({
            tag: 'div',
            cls: 'ag-paging-panel ag-unselectable',
            attrs: { id: `ag-${this.getCompId()}` },
        });

        this.initialiseTabGuard({
            onTabKeyDown: () => {},
            focusInnerElement: (fromBottom) => {
                if (this.allowFocusInnerElement) {
                    return this.tabGuardFeature.getTabGuardCtrl().focusInnerElement(fromBottom);
                } else {
                    return _focusGridInnerElement(this.beans, fromBottom);
                }
            },
            forceFocusOutWhenTabGuardsAreEmpty: true,
        });

        this.buildComponents();

        this.addManagedPropertyListeners(['pagination', 'suppressPaginationPanel'], () => this.onPaginationChanged());
        this.addManagedPropertyListeners(
            ['paginationPageSizeSelector', 'paginationAutoPageSize', 'suppressPaginationPanel'],
            () => this.onPageSizeRelatedOptionsChange()
        );
        this.addManagedEventListeners({ paginationChanged: () => this.announceAriaStatus() });

        _addFocusableContainerListener(this.beans, this, this.getGui());

        this.onPaginationChanged();
        this.announceAriaStatus();
    }

    public setAllowFocus(allowFocus: boolean): void {
        this.allowFocusInnerElement = allowFocus;
    }

    public getFocusableContainerName(): 'pagination' {
        return 'pagination';
    }

    private getEffectivePanels(): PaginationPanel[] {
        const configured = this.gos.get('paginationPanels');
        const panels = configured ?? DEFAULT_PANELS;
        // Silently deduplicate and drop unrecognised names (warnings already emitted by gridOptionsValidations.ts)
        const seen = new Set<string>();
        return panels.filter((name): name is PaginationPanel => {
            if (!VALID_PANEL_NAMES.has(name) || seen.has(name)) {
                return false;
            }
            seen.add(name);
            return true;
        });
    }

    private shouldShowPageSizeComp(): boolean {
        return !this.gos.get('paginationAutoPageSize');
    }

    private hasVisibleComponents(): boolean {
        if (this.rowSummaryComp || this.pageSummaryComp) {
            return true;
        }
        return !!this.pageSizeComp && this.shouldShowPageSizeComp();
    }

    private buildComponents(): void {
        for (const panelName of this.getEffectivePanels()) {
            if (panelName === 'pageSize') {
                // paginationPageSizeSelector is @initial — if false at init, never create the component
                if (this.gos.get('paginationPageSizeSelector') === false) {
                    continue;
                }
                this.pageSizeComp = this.createManagedBean(new PageSizeSelectorComp());
                const show = this.shouldShowPageSizeComp();
                this.pageSizeComp.toggleSelectDisplay(show);
                this.pageSizeComp.setDisplayed(show);
                this.appendChild(this.pageSizeComp);
            } else if (panelName === 'rowSummary') {
                this.rowSummaryComp = this.createManagedBean(new RowSummaryComp());
                this.appendChild(this.rowSummaryComp);
            } else if (panelName === 'pageSummary') {
                this.pageSummaryComp = this.createManagedBean(new PageSummaryComp());
                this.appendChild(this.pageSummaryComp);
            }
        }
    }

    private onPaginationChanged(): void {
        const isPaging = this.gos.get('pagination');
        const paginationPanelEnabled =
            isPaging && !this.gos.get('suppressPaginationPanel') && this.hasVisibleComponents();
        this.setDisplayed(paginationPanelEnabled);
    }

    private onPageSizeRelatedOptionsChange(): void {
        if (this.pageSizeComp) {
            const show = this.shouldShowPageSizeComp();
            this.pageSizeComp.toggleSelectDisplay(show);
            this.pageSizeComp.setDisplayed(show);
        }
        this.onPaginationChanged();
    }

    private announceAriaStatus(): void {
        if (this.gos.get('suppressPaginationPanel')) {
            return;
        }
        if (this.rowSummaryComp) {
            const ariaRowStatus = this.rowSummaryComp.getAriaStatus();
            if (ariaRowStatus !== this.ariaRowStatus) {
                this.ariaRowStatus = ariaRowStatus;
                this.ariaAnnounce?.announceValue(ariaRowStatus, 'paginationRow');
            }
        }
        if (this.pageSummaryComp) {
            const ariaPageStatus = this.pageSummaryComp.getAriaStatus();
            if (ariaPageStatus !== this.ariaPageStatus) {
                this.ariaPageStatus = ariaPageStatus;
                this.ariaAnnounce?.announceValue(ariaPageStatus, 'paginationPage');
            }
        }
    }
}

export const PaginationSelector: ComponentSelector<Component> = {
    selector: 'AG-PAGINATION',
    component: PaginationComp,
};
