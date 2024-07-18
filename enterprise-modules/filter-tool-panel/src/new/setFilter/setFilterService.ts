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
        const selectedValues = new Set(model?.values ?? []);
        const { values, disabled } = filterConfig;
        let items: SetFilterItem[];
        if (model == null) {
            items = [];
        } else {
            items = values.map(({ value, text }) => ({
                text,
                value,
                disabled,
                selected: selectedValues.has(value),
            }));
        }
        items.unshift({
            value: SELECT_ALL,
            text: this.translationService.translate('selectAll'),
        });

        return {
            items,
            areItemsEqual: (item1, item2) => item1.value === item2.value,
        };
        // TODO
    }

    public updateParams(
        oldSetFilterParams: SetFilterParams | undefined,
        newSetFilterParams: SetFilterParams,
        setFilterConfig: any
    ): SetFilterParams {
        return {
            items: [],
            areItemsEqual: (item1, item2) => item1 === item2,
        };
        // TODO
    }

    public getModel(params: SetFilterParams): SetFilterModel | null {
        const { items } = params;
        if (items.length === 0) {
            return null;
        }
        return {
            filterType: 'set',
            values: items.map(({ value }) => value),
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
        const values: { value: string | null; text: string }[] = [];
        const keyCreator = column.getColDef().keyCreator ?? ((value: any) => _toStringOrNull(value));
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
                    value: key,
                    text,
                });
            });
        if (hasBlanks) {
            values.unshift({
                value: null,
                text: this.translationService.translate('blanks'),
            });
        }
        // TODO
        return {
            values,
            applyOnChange: true,
        };
    }
}
