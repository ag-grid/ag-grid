import type { AgColumn, BeanCollection, IRowModel, SetFilterModel, ValueService } from '@ag-grid-community/core';
import { BeanStub, _makeNull, _toStringOrNull } from '@ag-grid-community/core';

import type { FilterPanelTranslationService } from '../filterPanelTranslationService';
import type { SetFilterItem, SetFilterParams } from '../filterState';
import type { FilterTypeService } from '../iFilterTypeService';
import type { SetFilterConfig } from './setFilterConfig';

const SELECT_ALL = '__AG_SELECT_ALL__';

export class SetFilterService
    extends BeanStub
    implements FilterTypeService<SetFilterParams, SetFilterModel, SetFilterConfig>
{
    private translationService: FilterPanelTranslationService;
    private rowModel: IRowModel;
    private valueService: ValueService;

    public wireBeans(beans: BeanCollection): void {
        this.translationService = beans.filterPanelTranslationService as FilterPanelTranslationService;
        this.rowModel = beans.rowModel;
        this.valueService = beans.valueService;
    }

    public getParams(filterConfig: SetFilterConfig, model?: SetFilterModel | null): SetFilterParams {
        const { values, disabled, selectAllItem } = filterConfig;
        const allItems: SetFilterItem[] = values.map(({ key, text }) => ({
            text,
            key,
            disabled,
        }));
        const selectedItemKeys = new Set(model == null ? allItems.map(({ key }) => key) : model.values);
        const isSelectAll = allItems.length === selectedItemKeys.size;
        if (isSelectAll) {
            selectedItemKeys.add(SELECT_ALL);
        }
        const displayedItems = [selectAllItem, ...allItems];

        return {
            model: {
                selectedItemKeys,
            },
            isSelectAll,
            allItems,
            displayedItems,
            areItemsEqual: (item1, item2) => item1.key === item2.key,
        };
    }

    public updateParams(
        oldParams: SetFilterParams | undefined,
        newParams: SetFilterParams,
        filterConfig: SetFilterConfig
    ): SetFilterParams {
        const { miniFilter, allItems, model, displayedItems } = newParams;
        const { selectedItemKeys } = model;
        const { miniFilter: oldMiniFilter, model: oldModel, isSelectAll: wasSelectAll } = oldParams ?? {};
        const { selectAllItem } = filterConfig;
        if (miniFilter !== oldMiniFilter) {
            const lowerCaseMiniFilter = miniFilter?.toLocaleLowerCase();
            const newDisplayedItems = [selectAllItem];
            let allDisplayedItemsSelected = true;
            for (const item of allItems) {
                if (lowerCaseMiniFilter == null || item.text.toLocaleLowerCase().includes(lowerCaseMiniFilter)) {
                    newDisplayedItems.push(item);
                    if (!selectedItemKeys.has(item.key)) {
                        allDisplayedItemsSelected = false;
                    }
                }
            }
            const hasSelectAll = selectedItemKeys.has(SELECT_ALL);
            let newModel = model;
            if (allDisplayedItemsSelected !== hasSelectAll) {
                if (allDisplayedItemsSelected) {
                    selectedItemKeys.add(SELECT_ALL);
                } else {
                    selectedItemKeys.delete(SELECT_ALL);
                }
                newModel = {
                    ...model,
                    selectedItemKeys,
                };
            }
            return {
                ...newParams,
                displayedItems: newDisplayedItems,
                model: newModel,
                isSelectAll: allDisplayedItemsSelected,
            };
        }
        if (model !== oldModel) {
            let isSelectAll: boolean;
            const hasSelectAll = selectedItemKeys.has(SELECT_ALL);
            if (hasSelectAll !== wasSelectAll) {
                isSelectAll = hasSelectAll;
                const operation = hasSelectAll ? 'add' : 'delete';
                for (const item of displayedItems) {
                    selectedItemKeys[operation](item.key);
                }
            } else {
                const allDisplayedItemsSelected = displayedItems.every(
                    ({ key }) => key === SELECT_ALL || selectedItemKeys.has(key)
                );
                isSelectAll = allDisplayedItemsSelected;
                const operation = allDisplayedItemsSelected ? 'add' : 'delete';
                selectedItemKeys[operation](SELECT_ALL);
            }
            return {
                ...newParams,
                model: {
                    ...model,
                    selectedItemKeys,
                },
                isSelectAll,
            };
        }
        return newParams;
    }

    public hasModelChanged(oldParams: SetFilterParams, newParams: SetFilterParams): boolean {
        return oldParams.model !== newParams.model;
    }

    public getModel(params: SetFilterParams): SetFilterModel | null {
        const {
            model: { selectedItemKeys },
            allItems,
            displayedItems,
        } = params;
        // include select all
        const allItemsLength = allItems.length + 1;
        if (
            (allItemsLength === displayedItems.length && selectedItemKeys.has(SELECT_ALL)) ||
            selectedItemKeys.size == allItemsLength
        ) {
            return null;
        }
        const values: (string | null)[] = [];
        selectedItemKeys.forEach((key) => {
            if (key !== SELECT_ALL) {
                values.push(key);
            }
        });
        return {
            filterType: 'set',
            values,
        };
    }

    public getSummary(model: SetFilterModel | null): string {
        if (model === null) {
            return this.translationService.translate('filterSummaryInactive');
        }
        let list = model.values.join(', ');
        if (list.length > 100) {
            list = list.slice(0, 100) + '...';
        }
        // TODO
        return `${'in'} (${list})`;
    }

    public getFilterConfig(column: AgColumn): SetFilterConfig {
        const valueMap: Map<string | null, any> = new Map();
        const values: { key: string | null; text: string }[] = [];
        const colDef = column.getColDef();
        const { readOnly: disabled } = colDef.filterParams ?? {};
        const keyCreator = colDef.keyCreator ?? ((value: any) => _toStringOrNull(value));
        this.rowModel.forEachNode((node) => {
            const value = _makeNull(this.valueService.getValue(column, node));
            const key = keyCreator(value);
            valueMap.set(key, value);
        });
        let hasBlanks = false;
        Array.from(valueMap.keys())
            .sort()
            .forEach((key) => {
                if (key == null) {
                    hasBlanks = true;
                    return;
                }
                const value = valueMap.get(key);
                const text = this.valueService.formatValue(column, null, value) ?? key;
                values.push({
                    key,
                    text,
                });
            });
        if (hasBlanks) {
            values.unshift({
                key: null,
                text: this.translationService.translate('blanks'),
            });
        }
        const selectAllItem: SetFilterItem = {
            key: SELECT_ALL,
            text: this.translationService.translate('selectAll'),
        };
        // TODO
        return {
            values,
            disabled,
            selectAllItem,
            applyOnChange: true,
        };
    }
}
