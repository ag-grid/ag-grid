import type { AgInputTextFieldParams, BeanCollection } from '@ag-grid-community/core';
import { AgInputTextFieldSelector, Component, RefPlaceholder, _removeFromParent } from '@ag-grid-community/core';
import type { VirtualListModel } from '@ag-grid-enterprise/core';
import { VirtualList } from '@ag-grid-enterprise/core';

import type { FilterPanelTranslationService } from '../filterPanelTranslationService';
import type { SetFilterItem, SetFilterParams } from '../filterState';
import { SetFilterListItem } from './setFilterListItem';

export class SetFilter<TValue = string> extends Component<'filterChanged'> {
    private readonly eSetFilterList: HTMLElement = RefPlaceholder;

    private translationService: FilterPanelTranslationService;

    private virtualList: VirtualList;

    constructor(private params: SetFilterParams<TValue>) {
        super(/* html */ `<div>Set Filter</div>`);
    }

    public wireBeans(beans: BeanCollection): void {
        this.translationService = beans.filterPanelTranslationService as FilterPanelTranslationService;
    }

    public postConstruct(): void {
        const eMiniFilterParams: AgInputTextFieldParams = {
            inputPlaceholder: this.translationService.translate('searchOoo'),
            ariaLabel: this.translationService.translate('ariaSearchFilterValues'),
            onValueChange: (value) => {
                // TODO
                value;
            },
        };
        this.setTemplate(
            /* html */ `<div class="ag-set-filter">
                <div data-ref="eFilterLoading" class="ag-filter-loading ag-hidden">${this.translationService.translate('loadingOoo')}</div>
                <ag-input-text-field class="ag-mini-filter" data-ref="eMiniFilter"></ag-input-text-field>
                <div data-ref="eFilterNoMatches" class="ag-filter-no-matches ag-hidden">${this.translationService.translate('noMatches')}</div>
                <div data-ref="eSetFilterList" class="ag-set-filter-list" role="presentation"></div>
            </div>`,
            [AgInputTextFieldSelector],
            {
                eMiniFilter: eMiniFilterParams,
            }
        );
        this.createVirtualList();
        this.refreshComp();
    }

    public refresh(params: SetFilterParams<TValue>): void {
        const oldParams = params;
        this.params = params;
        if ((oldParams.isTree ?? false) !== (params.isTree ?? false)) {
            _removeFromParent(this.virtualList.getGui());
            this.destroyBean(this.virtualList);
            this.createVirtualList();
        }
        // TODO
        this.refreshComp();
    }

    private refreshComp(): void {
        this.virtualList.refresh(true);
    }

    private createVirtualList(): void {
        const {
            params: { isTree, cellHeight, items, areItemsEqual },
            eSetFilterList,
            translationService,
        } = this;
        const filterListName = translationService.translate('ariaFilterList');
        const virtualList = this.createBean(
            new VirtualList({
                cssIdentifier: 'filter',
                ariaRole: isTree ? 'tree' : 'listbox',
                listName: filterListName,
            })
        );
        this.virtualList = virtualList;

        eSetFilterList.classList.toggle('ag-set-filter-tree-list', isTree);
        eSetFilterList.appendChild(virtualList.getGui());

        if (cellHeight != null) {
            virtualList.setRowHeight(cellHeight);
        }

        const componentCreator = (item: SetFilterItem<TValue>, listItemElement: HTMLElement) =>
            this.createSetListItem(item, isTree, listItemElement);
        virtualList.setComponentCreator(componentCreator);

        const componentUpdater = (item: SetFilterItem<TValue>, component: SetFilterListItem<TValue>) =>
            component.refresh(item);
        virtualList.setComponentUpdater(componentUpdater);

        const model: VirtualListModel = {
            getRowCount: () => items.length,
            getRow: (index) => items[index],
            areRowsEqual: areItemsEqual,
        };
        virtualList.setModel(model);
    }

    private createSetListItem(
        item: SetFilterItem<TValue>,
        isTree: boolean | undefined,
        listItemElement: HTMLElement
    ): SetFilterListItem<TValue> {
        // TODO
        listItemElement;
        return this.createBean(new SetFilterListItem(item, isTree));
    }

    public override destroy(): void {
        this.virtualList = this.destroyBean(this.virtualList)!;
        super.destroy();
    }
}
