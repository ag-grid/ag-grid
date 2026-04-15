import type { PaginationPanel } from '../entities/gridOptions';
import type { FocusableContainer } from '../interfaces/iFocusableContainer';
import { _addFocusableContainerListener, _focusGridInnerElement } from '../utils/gridFocus';
import type { Component, ComponentSelector } from '../widgets/component';
import { TabGuardComp } from '../widgets/tabGuardComp';
import { PageSizeSelectorComp } from './pageSizeSelectorComp';
import { PageSummaryComp } from './pageSummaryComp';
import paginationCompCSS from './paginationComp.css';
import { RowSummaryComp } from './rowSummaryComp';

const DEFAULT_PANELS: readonly PaginationPanel[] = ['pageSize', 'rowSummary', 'pageSummary'];

class PaginationComp extends TabGuardComp implements FocusableContainer {
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
        const idPrefix = `ag-${this.getCompId()}`;

        this.setTemplate({
            tag: 'div',
            cls: 'ag-paging-panel ag-unselectable',
            attrs: { id: idPrefix },
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

        this.buildComponents(idPrefix);

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

    private buildComponents(idPrefix: string): void {
        const panels = this.gos.get('paginationPanels') ?? DEFAULT_PANELS;
        const seen = new Set<string>();
        for (const panelName of panels) {
            if (seen.has(panelName)) {
                continue;
            }
            seen.add(panelName);
            if (panelName === 'pageSize') {
                this.pageSizeComp = this.createManagedBean(new PageSizeSelectorComp());
                this.pageSizeComp.updateVisibility();
                this.appendChild(this.pageSizeComp);
            } else if (panelName === 'rowSummary') {
                this.rowSummaryComp = this.createManagedBean(new RowSummaryComp(idPrefix));
                this.appendChild(this.rowSummaryComp);
            } else if (panelName === 'pageSummary') {
                this.pageSummaryComp = this.createManagedBean(new PageSummaryComp(idPrefix));
                this.appendChild(this.pageSummaryComp);
            }
        }
    }

    private onPaginationChanged(): void {
        const isPaging = this.gos.get('pagination');
        const paginationPanelEnabled = isPaging && !this.gos.get('suppressPaginationPanel');
        this.setDisplayed(paginationPanelEnabled);
    }

    private onPageSizeRelatedOptionsChange(): void {
        this.pageSizeComp?.updateVisibility();
        this.onPaginationChanged();
    }

    private announceAriaStatus(): void {
        const { ariaAnnounce, gos } = this.beans;
        if (gos.get('suppressPaginationPanel')) {
            return;
        }
        const { rowSummaryComp, pageSummaryComp } = this;
        if (rowSummaryComp) {
            const ariaRowStatus = rowSummaryComp.getAriaStatus();
            if (ariaRowStatus !== this.ariaRowStatus) {
                this.ariaRowStatus = ariaRowStatus;
                ariaAnnounce?.announceValue(ariaRowStatus, 'paginationRow');
            }
        }
        if (pageSummaryComp) {
            const ariaPageStatus = pageSummaryComp.getAriaStatus();
            if (ariaPageStatus !== this.ariaPageStatus) {
                this.ariaPageStatus = ariaPageStatus;
                ariaAnnounce?.announceValue(ariaPageStatus, 'paginationPage');
            }
        }
    }
}

export const PaginationSelector: ComponentSelector<Component> = {
    selector: 'AG-PAGINATION',
    component: PaginationComp,
};
