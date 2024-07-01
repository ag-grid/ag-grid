import type { IFilterOptionDef } from '../../../interfaces/iFilter';
import type { LocaleService } from '../../../localeService';
import type { OptionsFactory } from '../optionsFactory';
import { SimpleFilterModelFormatter } from '../simpleFilterModelFormatter';
import type { DateFilterModel, DateFilterParams } from './iDateFilter';
export declare class DateFilterModelFormatter extends SimpleFilterModelFormatter {
    private dateFilterParams;
    constructor(dateFilterParams: DateFilterParams, localeService: LocaleService, optionsFactory: OptionsFactory);
    protected conditionToString(condition: DateFilterModel, options?: IFilterOptionDef): string;
    updateParams(params: {
        dateFilterParams: DateFilterParams;
        optionsFactory: OptionsFactory;
    }): void;
}
