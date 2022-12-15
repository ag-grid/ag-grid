import { IFilterOptionDef } from '../../interfaces/iFilter';
import { IScalarFilterParams } from './scalarFilter';
import { ISimpleFilterParams } from './simpleFilter';

/* Common logic for options, used by both filters and floating filters. */
export class OptionsFactory {
    protected customFilterOptions: { [name: string]: IFilterOptionDef; } = {};
    protected filterOptions: (IFilterOptionDef | string)[];
    protected defaultOption: string;

    public init(params: IScalarFilterParams, defaultOptions: string[]): void {
        this.filterOptions = params.filterOptions || defaultOptions;
        this.mapCustomOptions();
        this.selectDefaultItem(params);

        this.checkForDeprecatedParams();
    }

    private checkForDeprecatedParams(): void {
        if (this.filterOptions.some(opt => typeof opt != 'string' && opt.test != null)) {
            console.warn(`AG Grid: [IFilterOptionDef] since v26.2.0, test() has been replaced with predicate().`);
        }
        if (this.filterOptions.some(opt => typeof opt != 'string' && opt.hideFilterInput != null)) {
            console.warn(`AG Grid: [IFilterOptionDef] since v26.2.0, useOfHideFilterInput has been replaced with numberOfInputs.`);
        }
    }

    public getFilterOptions(): (IFilterOptionDef | string)[] {
        return this.filterOptions;
    }

    private mapCustomOptions(): void {
        if (!this.filterOptions) { return; }

        this.filterOptions.forEach(filterOption => {
            if (typeof filterOption === 'string') { return; }

            const requiredProperties = [['displayKey'], ['displayName'], ['predicate', 'test']];
            const propertyCheck = (keys: [keyof IFilterOptionDef]) => {
                if (!keys.some(key => filterOption[key] != null)) {
                    console.warn(`AG Grid: ignoring FilterOptionDef as it doesn't contain one of '${keys}'`);
                    return false;
                }

                return true;
            };

            if (!requiredProperties.every(propertyCheck)) {
                this.filterOptions = this.filterOptions.filter(v => v === filterOption) || [];
                return;
            }

            const { test } = filterOption;
            const mutatedFilterOptions = { ...filterOption };
            if (test != null && filterOption.predicate == null) {
                mutatedFilterOptions.predicate = (v: any[], cv: any) => test(v[0], cv);
                delete mutatedFilterOptions.test;
            }
            if (mutatedFilterOptions.hideFilterInput && mutatedFilterOptions.numberOfInputs == null) {
                mutatedFilterOptions.numberOfInputs = 0;
                delete mutatedFilterOptions.hideFilterInput;
            }

            this.customFilterOptions[filterOption.displayKey] = mutatedFilterOptions;
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
                console.warn(`AG Grid: invalid FilterOptionDef supplied as it doesn't contain a 'displayKey'`);
            }
        } else {
            console.warn('AG Grid: no filter options for filter');
        }
    }

    public getDefaultOption(): string {
        return this.defaultOption;
    }

    public getCustomOption(name?: string | null): IFilterOptionDef | undefined {
        return this.customFilterOptions[name!];
    }
}
