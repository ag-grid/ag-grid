import type { ElementParams, FilterOpenedEvent, FilterPanelFilterState } from 'ag-grid-community';
import {
    Component,
    RefPlaceholder,
    _clearElement,
    _createIcon,
    _removeFromParent,
    _setAriaControls,
    _setAriaExpanded,
    _setAriaLabel,
} from 'ag-grid-community';

import { FilterDetailComp } from './filterDetailComp';
import { translateForFilterPanel } from './filterPanelUtils';
import { FilterSummaryComp } from './filterSummaryComp';

const FilterCardElement: ElementParams = {
    tag: 'div',
    cls: 'ag-filter-card',
    children: [
        {
            tag: 'div',
            cls: 'ag-filter-card-header',
            role: 'presentation',
            children: [
                {
                    tag: 'div',
                    cls: 'ag-filter-card-heading',
                    role: 'heading',
                    attrs: {
                        'aria-level': '2',
                    },
                    children: [
                        {
                            tag: 'button',
                            ref: 'eExpand',
                            cls: 'ag-button ag-filter-card-expand',
                            children: [
                                { tag: 'span', ref: 'eTitle', cls: 'ag-filter-card-title' },
                                { tag: 'span', ref: 'eExpandIcon', cls: 'ag-filter-card-expand-icon' },
                            ],
                        },
                    ],
                },
                {
                    tag: 'button',
                    ref: 'eDelete',
                    cls: 'ag-button ag-filter-card-delete',
                    children: [{ tag: 'span', ref: 'eDeleteIcon', cls: 'ag-filter-card-delete-icon' }],
                },
            ],
        },
    ],
};

export class FilterCardComp extends Component {
    private readonly eTitle: HTMLElement = RefPlaceholder;
    private readonly eExpand: HTMLElement = RefPlaceholder;
    private readonly eDelete: HTMLElement = RefPlaceholder;
    private readonly eExpandIcon: HTMLElement = RefPlaceholder;
    private readonly eDeleteIcon: HTMLElement = RefPlaceholder;

    private state?: FilterPanelFilterState;
    private summaryComp?: FilterSummaryComp;
    private detailComp?: FilterDetailComp;

    constructor(private readonly id: string) {
        super(FilterCardElement);
    }

    public postConstruct(): void {
        const { beans, eDelete, eExpand, eDeleteIcon, id } = this;
        const filterPanelService = beans.filterPanelSvc!;
        _setAriaLabel(eDelete, translateForFilterPanel(this, 'ariaLabelDeleteFilterCard'));
        eDeleteIcon.appendChild(_createIcon('close', beans, null));
        this.activateTabIndex([eExpand, eDelete]);
        this.addManagedElementListeners(eExpand, {
            click: () => filterPanelService.expand(id, !this.state?.expanded),
        });
        this.addManagedElementListeners(eDelete, {
            click: () => filterPanelService.remove(id),
        });
        this.addManagedEventListeners({ filterOpened: this.onFilterOpened.bind(this) });
    }

    public refresh(newState: FilterPanelFilterState): void {
        const { eExpand, state: oldState, beans } = this;
        this.state = newState;
        const { name, expanded } = newState;

        this.eTitle.textContent = name;

        if (!oldState || expanded !== oldState.expanded) {
            this.toggleExpand(newState);
        }

        const removeComp = (comp?: Component<any>) => {
            if (!comp) {
                return;
            }
            _removeFromParent(comp.getGui());
            return this.destroyBean(comp);
        };
        const createOrRefreshComp = <C extends FilterDetailComp | FilterSummaryComp>(
            comp: C | undefined,
            FilterComp: { new (): C },
            postCreateFunc?: (comp: C) => void
        ) => {
            if (!comp) {
                comp = this.createBean(new FilterComp());
                postCreateFunc?.(comp);
                this.appendChild(comp.getGui());
            }
            comp.refresh(newState as any);
            return comp;
        };
        if (newState.expanded) {
            this.summaryComp = removeComp(this.summaryComp);
            const detailComp = createOrRefreshComp(this.detailComp, FilterDetailComp, (comp) =>
                comp.addManagedListeners(comp, {
                    filterTypeChanged: ({ filterDef }) => beans.filterPanelSvc!.updateType(this.id, filterDef),
                })
            );
            this.detailComp = detailComp;
            const detailId = `ag-${this.getCompId()}-filter`;
            detailComp.getGui().id = detailId;
            _setAriaControls(eExpand, detailId);
        } else {
            this.detailComp = removeComp(this.detailComp);
            this.summaryComp = createOrRefreshComp(this.summaryComp, FilterSummaryComp);
            _setAriaControls(eExpand, null);
        }
    }

    private toggleExpand(state: FilterPanelFilterState): void {
        const expanded = !!state.expanded;
        const { eExpandIcon, eExpand, beans } = this;
        _clearElement(eExpandIcon);
        eExpandIcon.appendChild(_createIcon(expanded ? 'filterCardCollapse' : 'filterCardExpand', beans, null));
        const ariaLabel = expanded ? null : `${state.name} ${state.summary}`;
        _setAriaLabel(eExpand, ariaLabel);
        _setAriaExpanded(eExpand, expanded);
    }

    private onFilterOpened(event: FilterOpenedEvent): void {
        const { state, beans, id } = this;
        if (event.source === 'COLUMN_MENU' && event.column === state?.column && state?.expanded) {
            beans.filterPanelSvc!.expand(id, false);
        }
    }

    public override destroy(): void {
        this.detailComp = this.destroyBean(this.detailComp);
        this.summaryComp = this.destroyBean(this.summaryComp);
        this.state = undefined;
        super.destroy();
    }
}
