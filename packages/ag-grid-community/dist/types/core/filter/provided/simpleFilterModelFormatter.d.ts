import type { IFilterOptionDef, ProvidedFilterModel } from '../../interfaces/iFilter';
import type { LocaleService } from '../../localeService';
import type { ISimpleFilterModel } from './iSimpleFilter';
import type { OptionsFactory } from './optionsFactory';
export declare abstract class SimpleFilterModelFormatter<TValue = any> {
    private readonly localeService;
    private optionsFactory;
    protected readonly valueFormatter?: ((value: TValue | null) => string | null) | undefined;
    constructor(localeService: LocaleService, optionsFactory: OptionsFactory, valueFormatter?: ((value: TValue | null) => string | null) | undefined);
    getModelAsString(model: ISimpleFilterModel | null): string | null;
    protected abstract conditionToString(condition: ProvidedFilterModel, opts?: IFilterOptionDef): string;
    updateParams(params: {
        optionsFactory: OptionsFactory;
    }): void;
    protected formatValue(value?: TValue | null): string;
}
