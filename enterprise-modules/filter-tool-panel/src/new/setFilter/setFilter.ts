import type { AgInputTextField, AgInputTextFieldParams, BeanCollection } from '@ag-grid-community/core';
import { AgInputTextFieldSelector, Component, RefPlaceholder, _removeFromParent } from '@ag-grid-community/core';
import type { VirtualListModel } from '@ag-grid-enterprise/core';
import { VirtualList } from '@ag-grid-enterprise/core';

import type { FilterPanelTranslationService } from '../filterPanelTranslationService';
import type { SetFilterItem, SetFilterParams } from '../filterState';
import { SetFilterListItem } from './setFilterListItem';

export class SetFilter extends Component<'filterChanged'> {
    private readonly eSetFilterList: HTMLElement = RefPlaceholder;
    private readonly eMiniFilter: AgInputTextField = RefPlaceholder;

    private translationService: FilterPanelTranslationService;

    private virtualList: VirtualList;

    constructor(private params: SetFilterParams) {
        super(/* html */ `<div>Set Filter</div>`);
    }

    public wireBeans(beans: BeanCollection): void {
        this.translationService = beans.filterPanelTranslationService as FilterPanelTranslationService;
    }

    public postConstruct(): void {
        const eMiniFilterParams: AgInputTextFieldParams = {
            inputPlaceholder: this.translationService.translate('searchOoo'),
            ariaLabel: this.translationService.translate('ariaSearchFilterValues'),
            onValueChange: (value) => (value === '' ? undefined : this.updateParams('miniFilter', value)),
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
        this.refreshComp(undefined, this.params);
    }

    public refresh(params: SetFilterParams): void {
        const oldParams = params;
        this.params = params;
        if ((oldParams.isTree ?? false) !== (params.isTree ?? false)) {
            _removeFromParent(this.virtualList.getGui());
            this.destroyBean(this.virtualList);
            this.createVirtualList();
        }
        this.refreshComp(oldParams, params);
    }

    private refreshComp(oldParams: SetFilterParams | undefined, newParams: SetFilterParams): void {
        const { miniFilter } = newParams;
        this.eMiniFilter.setValue(miniFilter, true);
        this.virtualList.refresh(true);
    }

    private createVirtualList(): void {
        const {
            params: { isTree, cellHeight, areItemsEqual },
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

        const componentCreator = (item: SetFilterItem, listItemElement: HTMLElement) =>
            this.createSetListItem(item, isTree, listItemElement);
        virtualList.setComponentCreator(componentCreator);

        const componentUpdater = (item: SetFilterItem, component: SetFilterListItem) => {
            const {
                model: { selectedItemKeys },
            } = this.params;
            component.refresh(item, selectedItemKeys.has(item.key));
        };
        virtualList.setComponentUpdater(componentUpdater);

        const model: VirtualListModel = {
            getRowCount: () => this.params.displayedItems.length,
            getRow: (index) => this.params.displayedItems[index],
            areRowsEqual: areItemsEqual,
        };
        virtualList.setModel(model);
    }

    private createSetListItem(
        item: SetFilterItem,
        isTree: boolean | undefined,
        listItemElement: HTMLElement
    ): SetFilterListItem {
        // TODO
        listItemElement;
        const {
            model: { selectedItemKeys },
        } = this.params;
        const { key } = item;
        const listItem = this.createBean(new SetFilterListItem(item, selectedItemKeys.has(key), isTree));
        listItem.addManagedListeners(listItem, {
            selectedChanged: ({ selected }) => {
                if (selected) {
                    selectedItemKeys.add(key);
                } else {
                    selectedItemKeys.delete(key);
                }
                this.updateParams('model', {
                    selectedItemKeys,
                });
            },
        });
        return listItem;
    }

    private updateParams<K extends keyof SetFilterParams>(key: K, value: SetFilterParams[K]): void {
        this.dispatchLocalEvent({
            type: 'filterChanged',
            setFilterParams: {
                ...this.params,
                [key]: value,
            },
        });
    }

    public override destroy(): void {
        this.virtualList = this.destroyBean(this.virtualList)!;
        super.destroy();
    }
}
