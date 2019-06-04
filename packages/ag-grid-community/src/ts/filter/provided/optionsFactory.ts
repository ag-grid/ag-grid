import { IFilterOptionDef, IFilterParams } from "../../interfaces/iFilter";
import { IScalarFilterParams } from "./scalerFilter";
import { ISimpleFilterParams } from "./simpleFilter";

/* Common logic for options, used by both filters and floating filters. */
export class OptionsFactory {

    protected customFilterOptions: {[name: string]: IFilterOptionDef} = {};

    protected filterOptions: (IFilterOptionDef | string) [];

    protected defaultOption: string;

    public init(params: IScalarFilterParams, defaultOptions: string[]): void {
        this.filterOptions = params.filterOptions ? params.filterOptions : defaultOptions;
        this.mapCustomOptions();
        this.selectDefaultItem(params);
    }

    public getFilterOptions(): (IFilterOptionDef | string) [] {
        return this.filterOptions;
    }

    private mapCustomOptions(): void {
        if (!this.filterOptions) { return; }

        this.filterOptions.forEach(filterOption => {
            if (typeof filterOption === 'string') { return; }
            if (!filterOption.displayKey) {
                console.warn("ag-Grid: ignoring FilterOptionDef as it doesn't contain a 'displayKey'");
                return;
            }
            if (!filterOption.displayName) {
                console.warn("ag-Grid: ignoring FilterOptionDef as it doesn't contain a 'displayName'");
                return;
            }
            if (!filterOption.test) {
                console.warn("ag-Grid: ignoring FilterOptionDef as it doesn't contain a 'test'");
                return;
            }

            this.customFilterOptions[filterOption.displayKey] = filterOption;
        });
    }

    private selectDefaultItem(params: ISimpleFilterParams): void {
        if (params.defaultOption) {
            this.defaultOption = params.defaultOption;
        } else if (this.filterOptions.length >= 1) {
            const firstFilterOption = this.filterOptions[0];
            if (typeof firstFilterOption === 'string') {
                this.defaultOption = firstFilterOption;
            } else if (firstFilterOption.displayKey) {
                this.defaultOption = firstFilterOption.displayKey;
            } else {
                console.warn(`ag-Grid: invalid FilterOptionDef supplied as it doesn't contain a 'displayKey'`);
            }
        } else {
            console.warn('ag-Grid: no filter options for filter');
        }
    }

    public getDefaultOption(): string {
        return this.defaultOption;
    }

    public getCustomOption(name: string): IFilterOptionDef {
        return this.customFilterOptions[name];
    }
}
