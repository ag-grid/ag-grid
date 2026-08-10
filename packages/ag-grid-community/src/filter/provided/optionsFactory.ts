import { _areEqual } from 'ag-stack';

import type { LogService } from '../../validation/logService';
import type { IFilterOptionDef, ISimpleFilterParams } from './iSimpleFilter';
import type { FilterOptionSet } from './simpleFilterUtils';
import { _getMissingFilterOptionKeys, _isValidFilterOptionDef } from './simpleFilterUtils';

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
    protected readonly customFilterOptions: Map<string, IFilterOptionDef> = new Map();
    /** The options as configured, kept so a refresh can tell whether the configuration itself changed. */
    private configuredOptions: (IFilterOptionDef | string)[];
    /** The options the dropdown offers: the configured ones a malformed entry has been dropped from. */
    public filterOptions: (IFilterOptionDef | string)[];
    /** Where each offered key sits in `filterOptions`, so a def replaces the built-in of the same key. */
    private readonly optionPositions: Map<string, number> = new Map();
    /** Configured but dropped: a key here has already been reported as #72, so it is not reported again. */
    private readonly rejectedOptionKeys: Set<string> = new Set();
    /** The built-in keys this filter evaluates; a configured key outside it is reported. */
    private supportedOptions: ReadonlySet<string>;
    public defaultOption?: string;

    public init(log: LogService, params: ISimpleFilterParams, options: FilterOptionSet): void {
        this.supportedOptions = options.supported;
        this.configuredOptions = params.filterOptions ?? options.defaults;
        this.buildOptions(log);
        this.defaultOption = this.getDefaultItem(log, params.defaultOption);
    }

    /** Returns whether the offered options changed, so a caller can skip rebuilding what shows them. */
    public refresh(log: LogService, params: ISimpleFilterParams, options: FilterOptionSet): boolean {
        this.supportedOptions = options.supported;
        const filterOptions = params.filterOptions ?? options.defaults;
        let offeredOptionsChanged = false;
        // Keyed on the array's identity, so a re-declared list is rebuilt and its `predicate` is the live one.
        if (this.configuredOptions !== filterOptions) {
            const previousOptions = this.filterOptions;
            this.configuredOptions = filterOptions;
            this.customFilterOptions.clear();
            this.buildOptions(log);
            offeredOptionsChanged = !areOfferedOptionsEqual(previousOptions, this.filterOptions);
        }
        this.defaultOption = this.getDefaultItem(log, params.defaultOption);
        return offeredOptionsChanged;
    }

    private buildOptions(log: LogService): void {
        const { configuredOptions, customFilterOptions, optionPositions, rejectedOptionKeys } = this;
        const validOptions: (IFilterOptionDef | string)[] = [];
        optionPositions.clear();
        rejectedOptionKeys.clear();
        for (let i = 0, len = configuredOptions.length; i < len; ++i) {
            const filterOption = configuredOptions[i];
            let key: string;
            if (typeof filterOption === 'string') {
                key = filterOption;
            } else if (filterOption == null) {
                continue; // `typeof null` is `'object'`, so a hole would read as an option with no properties
            } else if (_isValidFilterOptionDef(filterOption)) {
                key = filterOption.displayKey;
                customFilterOptions.set(key, filterOption);
            } else {
                log.warn(72, { keys: _getMissingFilterOptionKeys(filterOption) });
                if (filterOption.displayKey != null) {
                    rejectedOptionKeys.add(filterOption.displayKey);
                }
                continue;
            }
            // One entry per key: a `FilterOptionDef` replaces the built-in of the same `displayKey`, not joins it.
            const position = optionPositions.get(key);
            if (position == null) {
                optionPositions.set(key, validOptions.length);
                validOptions.push(filterOption);
            } else if (typeof filterOption !== 'string') {
                validOptions[position] = filterOption; // keeps the place the key was first listed in
            }
        }
        this.filterOptions = validOptions;
        this.warnUnsupportedOptions(log, validOptions);
    }

    private warnUnsupportedOptions(log: LogService, filterOptions: (IFilterOptionDef | string)[]): void {
        const { supportedOptions, rejectedOptionKeys } = this;
        for (let i = 0, len = filterOptions.length; i < len; ++i) {
            const option = filterOptions[i];
            if (typeof option === 'string' && !supportedOptions.has(option) && !rejectedOptionKeys.has(option)) {
                log.warn(327, { key: option });
            }
        }
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
            if (!this.rejectedOptionKeys.has(defaultOption)) {
                log.warn(328, { key: defaultOption });
            }
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
