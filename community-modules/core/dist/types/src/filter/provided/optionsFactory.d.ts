import type { IFilterOptionDef } from '../../interfaces/iFilter';
import type { ScalarFilterParams } from './iScalarFilter';
export declare class OptionsFactory {
    protected customFilterOptions: {
        [name: string]: IFilterOptionDef;
    };
    protected filterOptions: (IFilterOptionDef | string)[];
    protected defaultOption: string;
    init(params: ScalarFilterParams, defaultOptions: string[]): void;
    getFilterOptions(): (IFilterOptionDef | string)[];
    private mapCustomOptions;
    private selectDefaultItem;
    getDefaultOption(): string;
    getCustomOption(name?: string | null): IFilterOptionDef | undefined;
}
