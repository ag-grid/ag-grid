import { _areEqual } from 'ag-stack';

import type { LogService } from '../../validation/logService';
import type { IFilterOptionDef, ISimpleFilterModelType, ISimpleFilterParams } from './iSimpleFilter';
import { _classifyFilterOptions } from './simpleFilterUtils';

/** Compared by what the dropdown shows, not by identity: a `colDef` array written inline is new every render. */
function areOfferedOptionsEqual(a: (IFilterOptionDef | string)[], b: (IFilterOptionDef | string)[]): boolean {
    return _areEqual(
        a,
        b,
        (optionA, optionB) =>
            optionA === optionB ||
            (typeof optionA !== 'string' &&
                typeof optionB !== 'string' &&
                optionA.displayKey === optionB.displayKey &&
                optionA.displayName === optionB.displayName &&
                optionA.numberOfInputs === optionB.numberOfInputs)
    );
}

/* Common logic for options, used by both filters and floating filters. */
export class OptionsFactory {
    protected customFilterOptions: Map<string, IFilterOptionDef>;
    /** The options as configured, kept so a refresh can tell whether the configuration itself changed. */
    private configuredOptions: (IFilterOptionDef | string)[];
    /** The options the dropdown offers: the configured ones a malformed entry has been dropped from. */
    public filterOptions: (IFilterOptionDef | string)[];
    private optionPositions: Map<string, number>;
    public defaultOption?: string;

    public init(log: LogService, params: ISimpleFilterParams, defaultOptions: ISimpleFilterModelType[]): void {
        this.configuredOptions = params.filterOptions ?? defaultOptions;
        this.buildOptions(log);
        this.defaultOption = this.getDefaultItem(log, params.defaultOption);
    }

    /** Returns whether the offered options changed, so a caller can skip rebuilding what shows them. */
    public refresh(log: LogService, params: ISimpleFilterParams, defaultOptions: ISimpleFilterModelType[]): boolean {
        const filterOptions = params.filterOptions ?? defaultOptions;
        let offeredOptionsChanged = false;
        // Keyed on the array's identity, so a re-declared list is rebuilt and its `predicate` is the live one.
        if (this.configuredOptions !== filterOptions) {
            const previousOptions = this.filterOptions;
            this.configuredOptions = filterOptions;
            this.buildOptions(log);
            offeredOptionsChanged = !areOfferedOptionsEqual(previousOptions, this.filterOptions);
        }
        this.defaultOption = this.getDefaultItem(log, params.defaultOption);
        return offeredOptionsChanged;
    }

    /** Rebuilt wholesale, so a predicate the previous list carried cannot survive into this one. */
    private buildOptions(log: LogService): void {
        const { options, positions, customOptions } = _classifyFilterOptions(this.configuredOptions, (keys) =>
            log.warn(72, { keys })
        );
        this.filterOptions = options;
        this.optionPositions = positions;
        this.customFilterOptions = customOptions;
    }

    private getDefaultItem(log: LogService, defaultOption?: string): string | undefined {
        const firstFilterOption = this.filterOptions[0];
        if (firstFilterOption == null) {
            log.warn(74);
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
        return key != null && this.optionPositions.has(key);
    }

    public getCustomOption(name?: string | null): IFilterOptionDef | undefined {
        return name == null ? undefined : this.customFilterOptions.get(name);
    }
}
