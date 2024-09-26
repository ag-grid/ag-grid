import type { IFilterOptionDef, ProvidedFilterModel } from '../../interfaces/iFilter';
import type { LocaleService } from '../../localeService';
import { FILTER_LOCALE_TEXT } from '../filterLocaleText';
import type { ICombinedSimpleModel, ISimpleFilterModel } from './iSimpleFilter';
import type { OptionsFactory } from './optionsFactory';

export abstract class SimpleFilterModelFormatter<TValue = any> {
    constructor(
        private readonly localeService: LocaleService,
        private optionsFactory: OptionsFactory,
        protected readonly valueFormatter?: (value: TValue | null) => string | null
    ) {}

    // used by:
    // 1) NumberFloatingFilter & TextFloatingFilter: Always, for both when editable and read only.
    // 2) DateFloatingFilter: Only when read only (as we show text rather than a date picker when read only)
    public getModelAsString(model: ISimpleFilterModel | null): string | null {
        if (!model) {
            return null;
        }
        const isCombined = (model as any).operator != null;
        const translate = this.localeService.getLocaleTextFunc();
        if (isCombined) {
            const combinedModel = model as ICombinedSimpleModel<ISimpleFilterModel>;
            const conditions = combinedModel.conditions ?? [];
            const customOptions = conditions.map((condition) => this.getModelAsString(condition));
            const joinOperatorTranslateKey = combinedModel.operator === 'AND' ? 'andCondition' : 'orCondition';
            return customOptions.join(
                ` ${translate(joinOperatorTranslateKey, FILTER_LOCALE_TEXT[joinOperatorTranslateKey])} `
            );
        } else if (model.type === 'blank' || model.type === 'notBlank') {
            return translate(model.type, model.type);
        } else {
            const condition = model as ISimpleFilterModel;
            const customOption = this.optionsFactory.getCustomOption(condition.type);

            // For custom filter options we display the Name of the filter instead
            // of displaying the `from` value, as it wouldn't be relevant
            const { displayKey, displayName, numberOfInputs } = customOption || {};
            if (displayKey && displayName && numberOfInputs === 0) {
                translate(displayKey, displayName);
                return displayName;
            }
            return this.conditionToString(condition, customOption);
        }
    }

    // creates text equivalent of FilterModel. if it's a combined model, this takes just one condition.
    protected abstract conditionToString(condition: ProvidedFilterModel, opts?: IFilterOptionDef): string;

    public updateParams(params: { optionsFactory: OptionsFactory }) {
        this.optionsFactory = params.optionsFactory;
    }

    protected formatValue(value?: TValue | null): string {
        return this.valueFormatter ? this.valueFormatter(value ?? null) ?? '' : String(value);
    }
}
