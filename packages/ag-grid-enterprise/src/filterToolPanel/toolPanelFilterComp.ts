import type { AgColumn, ElementParams, FilterOpenedEvent, IFilterComp, IconName } from 'ag-grid-community';
import {
    Component,
    FilterComp,
    KeyCode,
    RefPlaceholder,
    _clearElement,
    _createElement,
    _createIconNoSpan,
    _setAriaExpanded,
    _setDisplayed,
} from 'ag-grid-community';

export type ToolPanelFilterCompEvent = 'filterChanged';

const ToolPanelFilterElement: ElementParams = {
    tag: 'div',
    cls: 'ag-filter-toolpanel-instance',
    children: [
        {
            tag: 'div',
            ref: 'eFilterToolPanelHeader',
            cls: 'ag-filter-toolpanel-header ag-filter-toolpanel-instance-header',
            role: 'button',
            attrs: { 'aria-expanded': 'false' },
            children: [
                { tag: 'div', ref: 'eExpand', cls: 'ag-filter-toolpanel-expand' },
                { tag: 'span', ref: 'eFilterName', cls: 'ag-header-cell-text' },
                {
                    tag: 'span',
                    ref: 'eFilterIcon',
                    cls: 'ag-header-icon ag-filter-icon ag-filter-toolpanel-instance-header-icon',
                    attrs: { 'aria-hidden': 'true' },
                },
            ],
        },
        { tag: 'div', ref: 'agFilterToolPanelBody', cls: 'ag-filter-toolpanel-instance-body ag-filter' },
    ],
};
export class ToolPanelFilterComp extends Component<ToolPanelFilterCompEvent> {
    private readonly eFilterToolPanelHeader: HTMLElement = RefPlaceholder;
    private readonly eFilterName: HTMLElement = RefPlaceholder;
    private readonly agFilterToolPanelBody: HTMLElement = RefPlaceholder;
    private readonly eFilterIcon: Element = RefPlaceholder;
    private readonly eExpand: Element = RefPlaceholder;

    private eExpandChecked: Element;
    private eExpandUnchecked: Element;
    private column: AgColumn;
    private expanded: boolean = false;
    private underlyingFilter: IFilterComp | null;
    private filterComp?: FilterComp;

    constructor(
        private hideHeader: boolean,
        private readonly expandedCallback: () => void
    ) {
        super(ToolPanelFilterElement);
    }

    public postConstruct() {
        const { beans, eExpand } = this;
        const eExpandChecked = _createIconNoSpan('accordionOpen', beans)!;
        this.eExpandChecked = eExpandChecked;
        const eExpandUnchecked = _createIconNoSpan('accordionClosed', beans)!;
        this.eExpandUnchecked = eExpandUnchecked;
        eExpand.appendChild(eExpandChecked);
        eExpand.appendChild(eExpandUnchecked);
    }

    public setColumn(column: AgColumn): void {
        this.column = column;
        const { beans, eFilterToolPanelHeader, eFilterIcon, eExpandChecked, hideHeader } = this;
        // eslint-disable-next-line no-restricted-properties -- Could swap to textContent, but could be a breaking change
        this.eFilterName.innerText = beans.colNames.getDisplayNameForColumn(column, 'filterToolPanel', false) || '';
        this.addManagedListeners(eFilterToolPanelHeader, {
            click: this.toggleExpanded.bind(this),
            keydown: this.onKeyDown.bind(this),
        });
        this.addManagedEventListeners({ filterOpened: this.onFilterOpened.bind(this) });
        this.addInIcon('filterActive', eFilterIcon, column);

        _setDisplayed(eFilterIcon, this.isFilterActive(), { skipAriaHidden: true });
        _setDisplayed(eExpandChecked, false);

        if (hideHeader) {
            _setDisplayed(eFilterToolPanelHeader, false);
            eFilterToolPanelHeader.removeAttribute('tabindex');
        } else {
            eFilterToolPanelHeader.setAttribute('tabindex', '0');
        }

        this.addManagedListeners(column, { filterChanged: this.onFilterChanged.bind(this) });
    }

    private onKeyDown(e: KeyboardEvent): void {
        const { key } = e;
        const { ENTER, SPACE, LEFT, RIGHT } = KeyCode;

        if (key !== ENTER && key !== SPACE && key !== LEFT && key !== RIGHT) {
            return;
        }

        e.preventDefault();

        if (key === ENTER || key === SPACE) {
            this.toggleExpanded();
        } else if (key === KeyCode.LEFT) {
            this.collapse();
        } else {
            this.expand();
        }
    }

    public getColumn(): AgColumn {
        return this.column;
    }

    public getColumnFilterName(): string | null {
        return this.beans.colNames.getDisplayNameForColumn(this.column, 'filterToolPanel', false);
    }

    public addCssClassToTitleBar(cssClass: string) {
        this.eFilterToolPanelHeader.classList.add(cssClass);
    }

    private addInIcon(iconName: IconName, eParent: Element, column: AgColumn): void {
        if (eParent == null) {
            return;
        }

        const eIcon = _createIconNoSpan(iconName, this.beans, column)!;
        eParent.appendChild(eIcon);
    }

    public isFilterActive(): boolean {
        return !!this.beans.colFilter?.isFilterActive(this.column);
    }

    private onFilterChanged(): void {
        _setDisplayed(this.eFilterIcon, this.isFilterActive(), { skipAriaHidden: true });
        this.dispatchLocalEvent({ type: 'filterChanged' });
    }

    public toggleExpanded(): void {
        this.expanded ? this.collapse() : this.expand();
    }

    public expand(): void {
        if (this.expanded) {
            return;
        }

        this.expanded = true;
        _setAriaExpanded(this.eFilterToolPanelHeader, true);

        _setDisplayed(this.eExpandChecked, true);
        _setDisplayed(this.eExpandUnchecked, false);

        this.addFilterElement();

        this.expandedCallback();
    }

    private addFilterElement(suppressFocus?: boolean): void {
        const filterPanelWrapper = _createElement({ tag: 'div', cls: 'ag-filter-toolpanel-instance-filter' });
        const comp = this.createManagedBean(new FilterComp(this.column, 'TOOLBAR'));
        this.filterComp = comp;

        if (!comp.hasFilter()) {
            return;
        }

        comp.getFilter()?.then((filter) => {
            this.underlyingFilter = filter;

            if (!filter) {
                return;
            }
            filterPanelWrapper.appendChild(comp.getGui());

            this.agFilterToolPanelBody.appendChild(filterPanelWrapper);

            comp.afterGuiAttached({ container: 'toolPanel', suppressFocus });
        });
    }

    public collapse(): void {
        if (!this.expanded) {
            return;
        }

        this.expanded = false;
        _setAriaExpanded(this.eFilterToolPanelHeader, false);
        this.removeFilterElement();

        _setDisplayed(this.eExpandChecked, false);
        _setDisplayed(this.eExpandUnchecked, true);

        const filterComp = this.filterComp;
        filterComp?.afterGuiDetached();
        this.destroyBean(filterComp);

        this.expandedCallback();
    }

    private removeFilterElement(): void {
        _clearElement(this.agFilterToolPanelBody);
    }

    public isExpanded(): boolean {
        return this.expanded;
    }

    public onPanelHidden(): void {
        if (!this.expanded) {
            return;
        }

        const filter = this.underlyingFilter as any;

        if (!filter) {
            return;
        }

        filter.afterGuiDetached?.();
    }

    private onFilterOpened(event: FilterOpenedEvent): void {
        if (event.source !== 'COLUMN_MENU') {
            return;
        }
        if (event.column !== this.column) {
            return;
        }
        if (!this.expanded) {
            return;
        }

        this.collapse();
    }
}
