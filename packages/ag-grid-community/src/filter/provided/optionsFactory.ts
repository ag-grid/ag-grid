import type { LogService } from '../../validation/logService';
import type { IFilterOptionDef, ISimpleFilterParams } from './iSimpleFilter';
import { _classifyFilterOptions } from './simpleFilterUtils';

/* Common logic for options, used by both filters and floating filters. */
export class OptionsFactory {
    private customFilterOptions: Map<string, IFilterOptionDef>;
    /** As configured, so a refresh compares what it was given rather than what it kept. */
    private configuredOptions: (IFilterOptionDef | string)[];
    /** What the dropdown offers: the configured list minus its malformed entries, or the built-ins if none survive. */
    public filterOptions: (IFilterOptionDef | string)[];
    private offeredOptions: Map<string, IFilterOptionDef | string>;
    public defaultOption?: string;

    public init(log: LogService, params: ISimpleFilterParams, defaultOptions: string[]): void {
        this.configuredOptions = params.filterOptions ?? defaultOptions;
        this.buildOptions(log, defaultOptions);
        this.defaultOption = this.getDefaultItem(log, params.defaultOption);
    }

    public refresh(log: LogService, params: ISimpleFilterParams, defaultOptions: string[]): void {
        const filterOptions = params.filterOptions ?? defaultOptions;
        if (this.configuredOptions !== filterOptions) {
            this.configuredOptions = filterOptions;
            this.buildOptions(log, defaultOptions);
        }
        this.defaultOption = this.getDefaultItem(log, params.defaultOption);
    }

    /** Rebuilt wholesale, so a `predicate` the previous list carried cannot survive into this one. */
    private buildOptions(log: LogService, defaultOptions: string[]): void {
        this.collectUsableOptions(log, this.configuredOptions);
        // A column with nothing to offer cannot open its filter at all, so a list that keeps none falls back.
        if (!this.filterOptions.length) {
            log.warn(74);
            this.collectUsableOptions(log, defaultOptions);
        }
    }

    private collectUsableOptions(log: LogService, configuredOptions: (IFilterOptionDef | string)[]): void {
        const { offered, customOptions } = _classifyFilterOptions(configuredOptions, (keys) => log.warn(72, { keys }));
        this.offeredOptions = offered;
        this.filterOptions = [...offered.values()];
        this.customFilterOptions = customOptions;
    }

    private getDefaultItem(log: LogService, defaultOption?: string): string | undefined {
        const firstFilterOption = this.filterOptions[0];
        if (firstFilterOption == null) {
            return undefined;
        }
        // Only an option the dropdown lists can be selected into it.
        if (defaultOption != null) {
            if (this.hasOption(defaultOption)) {
                return defaultOption;
            }
            log.warn(326, { defaultOption });
        }
        return typeof firstFilterOption === 'string' ? firstFilterOption : firstFilterOption.displayKey;
    }

    public hasOption(key?: string | null): boolean {
        return key != null && this.offeredOptions.has(key);
    }

    public getCustomOption(name?: string | null): IFilterOptionDef | undefined {
        return name == null ? undefined : this.customFilterOptions.get(name);
    }
}
