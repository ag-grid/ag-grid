import { IFilterOptionDef } from "../../interfaces/iFilter";
import { IScalarFilterParams } from "./scalerFilter";
export declare class OptionsFactory {
    protected customFilterOptions: {
        [name: string]: IFilterOptionDef;
    };
    protected filterOptions: (IFilterOptionDef | string)[];
    protected defaultOption: string;
    init(params: IScalarFilterParams, defaultOptions: string[]): void;
    getFilterOptions(): (IFilterOptionDef | string)[];
    private mapCustomOptions;
    private selectDefaultItem;
    getDefaultOption(): string;
    getCustomOption(name: string): IFilterOptionDef;
}
