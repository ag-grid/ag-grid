import { BeanStub } from '../../context/beanStub';
import type { FilterLocaleTextKey } from '../filterLocaleText';
import { translateForFilter } from '../filterLocaleText';
import type { ProvidedFilterModel } from './iProvidedFilter';
import type { FilterOptionKey, ICombinedSimpleModel, ISimpleFilterModel, ISimpleFilterParams } from './iSimpleFilter';
import type { ResolvedSimpleFilterConfig } from './resolvedFilterConfig';

export const SCALAR_FILTER_TYPE_KEYS = {
    equals: 'Equals',
    notEqual: 'NotEqual',
    greaterThan: 'GreaterThan',
    greaterThanOrEqual: 'GreaterThanOrEqual',
    lessThan: 'LessThan',
    lessThanOrEqual: 'LessThanOrEqual',
    inRange: 'InRange',
} as const;

export const TEXT_FILTER_TYPE_KEYS = {
    contains: 'Contains',
    notContains: 'NotContains',
    equals: 'TextEquals',
    notEqual: 'TextNotEqual',
    startsWith: 'StartsWith',
    endsWith: 'EndsWith',
    inRange: 'InRange',
} as const;

type FilterTypeKeys = typeof SCALAR_FILTER_TYPE_KEYS | typeof TEXT_FILTER_TYPE_KEYS;

export abstract class SimpleFilterModelFormatter<
    TFilterParams extends ISimpleFilterParams,
    TKeys extends FilterTypeKeys = FilterTypeKeys,
    TValue = any,
> extends BeanStub {
    protected abstract readonly filterTypeKeys: TKeys;

    constructor(
        protected filterConfig: ResolvedSimpleFilterConfig,
        protected filterParams: TFilterParams
    ) {
        super();
    }

    /** Read per call, so a `colDef` refresh that replaces the formatter reaches the summary. */
    protected getValueFormatter(): ((value: TValue | null) => string | null) | undefined {
        return undefined;
    }

    // used by:
    // 1) NumberFloatingFilter & TextFloatingFilter: Always, for both when editable and read only.
    // 2) DateFloatingFilter: Only when read only (as we show text rather than a date picker when read only)
    public getModelAsString(model: ISimpleFilterModel | null, source?: 'floating' | 'filterToolPanel'): string | null {
        const translate = this.getLocaleTextFunc();
        const forToolPanel = source === 'filterToolPanel';
        if (!model) {
            return forToolPanel ? translateForFilter(this, 'filterSummaryInactive') : null;
        }
        const isCombined = (model as any).operator != null;
        if (isCombined) {
            const combinedModel = model as ICombinedSimpleModel<ISimpleFilterModel>;
            const conditions = combinedModel.conditions ?? [];
            const customOptions = conditions.map((condition) => this.getModelAsString(condition, source));
            const joinOperatorTranslateKey = combinedModel.operator === 'AND' ? 'andCondition' : 'orCondition';
            return customOptions.join(` ${translateForFilter(this, joinOperatorTranslateKey)} `);
        } else if (model.type === 'blank' || model.type === 'notBlank') {
            return forToolPanel
                ? translateForFilter(this, model.type === 'blank' ? 'filterSummaryBlank' : 'filterSummaryNotBlank')
                : translate(model.type, model.type);
        } else {
            const condition = model;
            const customOption = this.filterConfig.getCustomOption(condition.type);

            // For custom filter options we display the Name of the filter instead
            // of displaying the `from` value, as it wouldn't be relevant
            const { displayKey, displayName, numberOfInputs } = customOption || {};
            if (displayKey && displayName && numberOfInputs === 0) {
                return translate(displayKey, displayName);
            }
            return this.conditionToString(
                condition,
                forToolPanel,
                condition.type === 'inRange' || numberOfInputs === 2,
                displayKey,
                displayName
            );
        }
    }

    // creates text equivalent of FilterModel. if it's a combined model, this takes just one condition.
    protected abstract conditionToString(
        condition: ProvidedFilterModel,
        forToolPanel: boolean,
        isRange: boolean,
        customDisplayKey: string | undefined,
        customDisplayName: string | undefined
    ): string;

    public updateParams(params: { filterConfig: ResolvedSimpleFilterConfig; filterParams: TFilterParams }) {
        const { filterConfig, filterParams } = params;
        this.filterConfig = filterConfig;
        this.filterParams = filterParams;
    }

    protected conditionForToolPanel(
        type: FilterOptionKey | null | undefined,
        isRange: boolean,
        getFilter: () => string,
        getFilterTo: () => string,
        customDisplayKey: string | undefined,
        customDisplayName: string | undefined
    ): string | null {
        let typeValue: string | undefined;
        const typeKey = this.getTypeKey(type);
        if (typeKey) {
            typeValue = translateForFilter(this, typeKey);
        }
        if (customDisplayKey && customDisplayName) {
            typeValue = this.getLocaleTextFunc()(customDisplayKey, customDisplayName);
        }
        if (typeValue != null) {
            // 0 inputs covered by parent
            if (isRange) {
                return `${typeValue} ${translateForFilter(this, 'filterSummaryInRangeValues', [getFilter(), getFilterTo()])}`;
            } else {
                return `${typeValue} ${getFilter()}`;
            }
        }
        return null;
    }

    protected getTypeKey(type: FilterOptionKey | null | undefined): FilterLocaleTextKey | null {
        const suffix = this.filterTypeKeys[type as keyof FilterTypeKeys];
        return suffix ? `filterSummary${suffix}` : null;
    }

    protected formatValue(value?: TValue | null): string {
        const valueFormatter = this.getValueFormatter();
        return valueFormatter ? (valueFormatter(value ?? null) ?? '') : String(value);
    }
}
