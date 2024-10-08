import type { IFilterOptionDef } from '../../interfaces/iFilter';
import { _logWarn } from '../../validation/logging';
import type { ScalarFilterParams } from './iScalarFilter';
import type { SimpleFilterParams } from './iSimpleFilter';

/* Common logic for options, used by both filters and floating filters. */
export class OptionsFactory {
    protected customFilterOptions: { [name: string]: IFilterOptionDef } = {};
    protected filterOptions: (IFilterOptionDef | string)[];
    protected defaultOption: string;

    public init(params: ScalarFilterParams, defaultOptions: string[]): void {
        this.filterOptions = params.filterOptions || defaultOptions;
        this.mapCustomOptions();
        this.selectDefaultItem(params);
    }

    public getFilterOptions(): (IFilterOptionDef | string)[] {
        return this.filterOptions;
    }

    private mapCustomOptions(): void {
        if (!this.filterOptions) {
            return;
        }

        this.filterOptions.forEach((filterOption) => {
            if (typeof filterOption === 'string') {
                return;
            }

            const requiredProperties = [['displayKey'], ['displayName'], ['predicate', 'test']];
            const propertyCheck = (keys: [keyof IFilterOptionDef]) => {
                if (!keys.some((key) => filterOption[key] != null)) {
                    _logWarn(72, { keys });
                    return false;
                }

                return true;
            };

            if (!requiredProperties.every(propertyCheck)) {
                this.filterOptions = this.filterOptions.filter((v) => v === filterOption) || [];
                return;
            }

            this.customFilterOptions[filterOption.displayKey] = filterOption;
        });
    }

    private selectDefaultItem(params: SimpleFilterParams): void {
        if (params.defaultOption) {
            this.defaultOption = params.defaultOption;
        } else if (this.filterOptions.length >= 1) {
            const firstFilterOption = this.filterOptions[0];

            if (typeof firstFilterOption === 'string') {
                this.defaultOption = firstFilterOption;
            } else if (firstFilterOption.displayKey) {
                this.defaultOption = firstFilterOption.displayKey;
            } else {
                // invalid FilterOptionDef supplied as it doesn't contain a 'displayKey
                _logWarn(73, {});
            }
        } else {
            //no filter options for filter
            _logWarn(74, {});
        }
    }

    public getDefaultOption(): string {
        return this.defaultOption;
    }

    public getCustomOption(name?: string | null): IFilterOptionDef | undefined {
        return this.customFilterOptions[name!];
    }
}
