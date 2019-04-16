import {IFilterOptionDef} from "../../interfaces/iFilter";
import {IComparableFilterParams} from "./abstractFilter";

export class OptionsFactory {

    protected customFilterOptions: {[name: string]: IFilterOptionDef} = {};

    protected defaultOption: string;

    public init(params: IComparableFilterParams, providedFilterDefault: string): void {

        this.defaultOption = params.defaultOption;

        // strip out incorrectly defined FilterOptionDefs
        if (params.filterOptions) {
            params.filterOptions.forEach(filterOption => {
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

        if (params.filterOptions && !this.defaultOption) {
            const firstFilterOption = params.filterOptions[0];
            if (typeof firstFilterOption === 'string') {
                this.defaultOption = firstFilterOption;
            } else if (firstFilterOption.displayKey) {
                this.defaultOption = firstFilterOption.displayKey;
            } else {
                console.warn("ag-Grid: invalid FilterOptionDef supplied as it doesn't contain a 'displayKey'");
            }
        }

        if (!this.defaultOption) {
            this.defaultOption = providedFilterDefault;
        }
    }

    public getDefaultOption(): string {
        return this.defaultOption;
    }

    public getCustomOption(name: string): IFilterOptionDef {
        return this.customFilterOptions[name];
    }
}
