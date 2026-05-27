import { _removeFromParent } from '../agStack/utils/dom';
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

type AriaAnnounceKey = 'paginationRow' | 'paginationPage';

class PaginationComp extends TabGuardComp implements FocusableContainer {
    private pageSizeComp: PageSizeSelectorComp | undefined;
    private rowSummaryComp: RowSummaryComp | undefined;
    private pageSummaryComp: PageSummaryComp | undefined;
    private hasVisiblePanel = false;

    private allowFocusInnerElement = false;

    private readonly lastAriaAnnounced: Record<AriaAnnounceKey, string> = {
        paginationRow: '',
        paginationPage: '',
    };

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
        this.addManagedPropertyListener('paginationPanels', () => this.rebuildComponents(idPrefix));
        this.addManagedEventListeners({ paginationChanged: () => this.onPaginationEvent() });

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
        for (const panel of panels) {
            const panelName = typeof panel === 'string' ? panel : panel.type;
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
                const suppressPageInput = typeof panel === 'object' ? panel.suppressPageInput : undefined;
                this.pageSummaryComp = this.createManagedBean(new PageSummaryComp(idPrefix, suppressPageInput));
                this.appendChild(this.pageSummaryComp);
            }
        }
        this.updateHasVisiblePanel();
    }

    private updateHasVisiblePanel(): void {
        this.hasVisiblePanel =
            this.rowSummaryComp != null ||
            this.pageSummaryComp != null ||
            this.pageSizeComp?.shouldShowPageSizeSelector() === true;
    }

    private rebuildComponents(idPrefix: string): void {
        for (const comp of [this.pageSizeComp, this.rowSummaryComp, this.pageSummaryComp]) {
            if (comp) {
                _removeFromParent(comp.getGui());
            }
        }
        this.pageSizeComp = this.destroyBean(this.pageSizeComp);
        this.rowSummaryComp = this.destroyBean(this.rowSummaryComp);
        this.pageSummaryComp = this.destroyBean(this.pageSummaryComp);
        this.buildComponents(idPrefix);
        this.onPaginationChanged();
        this.announceAriaStatus();
    }

    private onPaginationChanged(): void {
        const visible = this.hasVisiblePanel && this.gos.get('pagination') && !this.gos.get('suppressPaginationPanel');
        this.setDisplayed(visible);
    }

    private onPageSizeRelatedOptionsChange(): void {
        this.pageSizeComp?.updateVisibility();
        this.updateHasVisiblePanel();
        this.onPaginationChanged();
    }

    private onPaginationEvent(): void {
        this.rowSummaryComp?.refresh();
        this.pageSummaryComp?.refresh();
        this.announceAriaStatus();
    }

    private announceAriaStatus(): void {
        if (!this.gos.get('pagination') || this.gos.get('suppressPaginationPanel')) {
            return;
        }
        this.announceIfChanged(this.rowSummaryComp, 'paginationRow');
        this.announceIfChanged(this.pageSummaryComp, 'paginationPage');
    }

    private announceIfChanged(comp: { readonly ariaStatus: string } | undefined, key: AriaAnnounceKey): void {
        if (!comp) {
            return;
        }
        const status = comp.ariaStatus;
        if (status !== this.lastAriaAnnounced[key]) {
            this.lastAriaAnnounced[key] = status;
            this.beans.ariaAnnounce?.announceValue(status, key);
        }
    }
}

export const PaginationSelector: ComponentSelector<Component> = {
    selector: 'AG-PAGINATION',
    component: PaginationComp,
};
