import type { LogService } from '../../validation/logService';
import type { IFilterOptionDef, ISimpleFilterParams } from './iSimpleFilter';

/* Common logic for options, used by both filters and floating filters. */
export class OptionsFactory {
    protected customFilterOptions: { [name: string]: IFilterOptionDef } = {};
    public filterOptions: (IFilterOptionDef | string)[];
    public defaultOption?: string;

    public init(log: LogService, params: ISimpleFilterParams, defaultOptions: string[]): void {
        this.filterOptions = params.filterOptions ?? defaultOptions;
        this.mapCustomOptions(log);
        this.defaultOption = this.getDefaultItem(log, params.defaultOption);
    }

    public refresh(log: LogService, params: ISimpleFilterParams, defaultOptions: string[]): void {
        const filterOptions = params.filterOptions ?? defaultOptions;
        if (this.filterOptions !== filterOptions) {
            this.filterOptions = filterOptions;
            this.customFilterOptions = {};
            this.mapCustomOptions(log);
        }
        this.defaultOption = this.getDefaultItem(log, params.defaultOption);
    }

    private mapCustomOptions(log: LogService): void {
        const { filterOptions } = this;
        if (!filterOptions) {
            return;
        }

        for (const filterOption of filterOptions) {
            if (typeof filterOption === 'string') {
                continue;
            }

            const requiredProperties = [['displayKey'], ['displayName'], ['predicate', 'test']];
            const propertyCheck = (keys: [keyof IFilterOptionDef]) => {
                if (!keys.some((key) => filterOption[key] != null)) {
                    log.warn(72, { keys });
                    return false;
                }

                return true;
            };

            if (!requiredProperties.every(propertyCheck)) {
                this.filterOptions = filterOptions.filter((v) => v === filterOption) || [];
                continue;
            }

            this.customFilterOptions[filterOption.displayKey] = filterOption;
        }
    }

    private getDefaultItem(log: LogService, defaultOption?: string): string | undefined {
        const { filterOptions } = this;
        if (defaultOption) {
            return defaultOption;
        } else if (filterOptions.length >= 1) {
            const firstFilterOption = filterOptions[0];

            if (typeof firstFilterOption === 'string') {
                return firstFilterOption;
            } else if (firstFilterOption.displayKey) {
                return firstFilterOption.displayKey;
            } else {
                // invalid FilterOptionDef supplied as it doesn't contain a 'displayKey
                log.warn(73);
            }
        } else {
            //no filter options for filter
            log.warn(74);
        }
        return undefined;
    }

    public getCustomOption(name?: string | null): IFilterOptionDef | undefined {
        return this.customFilterOptions[name!];
    }
}
