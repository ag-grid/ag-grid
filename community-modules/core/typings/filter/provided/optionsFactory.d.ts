import { IFilterOptionDef } from '../../interfaces/iFilter';
import { ScalarFilterParams } from './scalarFilter';
export declare class OptionsFactory {
    protected customFilterOptions: {
        [name: string]: IFilterOptionDef;
    };
    protected filterOptions: (IFilterOptionDef | string)[];
    protected defaultOption: string;
    init(params: ScalarFilterParams, defaultOptions: string[]): void;
    private checkForDeprecatedParams;
    getFilterOptions(): (IFilterOptionDef | string)[];
    private mapCustomOptions;
    private selectDefaultItem;
    getDefaultOption(): string;
    getCustomOption(name?: string | null): IFilterOptionDef | undefined;
}
