import type { AgPropertyChangedSource, IconValue } from 'ag-stack';
import { _fuzzySuggestions } from 'ag-stack';

import type { ApiFunction, ApiFunctionName } from '../api/iApiFunction';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection, DynamicBeanName, UserComponentName } from '../context/context';
import type { ColDef, ColGroupDef } from '../entities/colDef';
import type { GridOptions } from '../entities/gridOptions';
import { INITIAL_GRID_OPTION_KEYS } from '../gridOptionsInitial';
import type { RowNodeEventType } from '../interfaces/iRowNode';
import { _areModulesGridScoped } from '../modules/moduleRegistry';
import type { IconName } from '../utils/icon';
import { validateApiFunction } from './apiFunctionValidator';
import { getError } from './errorMessages/errorText';
import { _errMsg, provideValidationServiceLogger } from './logging';
import { COL_DEF_VALIDATORS } from './rules/colDefValidations';
import { DYNAMIC_BEAN_MODULES } from './rules/dynamicBeanValidations';
import { GRID_OPTIONS_VALIDATORS } from './rules/gridOptionsValidations';
import { DEPRECATED_ICONS_V33, ICON_MODULES, ICON_VALUES } from './rules/iconValidations';
import { USER_COMP_MODULES } from './rules/userCompValidations';
import type { DependentValues, OptionsValidator, RequiredOptions, ValidationWarning } from './validationTypes';
import { _createValidationWarning, _emitValidationWarning } from './validationTypes';

export class ValidationService extends BeanStub implements NamedBean {
    beanName = 'validation' as const;

    private gridOptions: GridOptions;
    /**
     * Caches per-property-name validation results keyed by objectName.
     * Each inner map records: property name → true if valid for runtime checks, false if not.
     * A property is invalid if it has an unsupported row model, or is an unrecognised name.
     * Deprecation warnings and fuzzy suggestions are emitted once when first encountered.
     */
    private readonly propertyNameCache: Map<string, Map<string, boolean>> = new Map();

    public wireBeans(beans: BeanCollection): void {
        this.gridOptions = beans.gridOptions;
        provideValidationServiceLogger(getError);
    }

    public warnOnInitialPropertyUpdate(source: AgPropertyChangedSource, key: string): void {
        if (source === 'api' && (INITIAL_GRID_OPTION_KEYS as any)[key]) {
            this.warn(22, { key });
        }
    }

    public processGridOptions(options: GridOptions): void {
        this.processOptions(options, GRID_OPTIONS_VALIDATORS());
    }

    public validateApiFunction<TFunctionName extends ApiFunctionName>(
        functionName: TFunctionName,
        apiFunction: ApiFunction<TFunctionName>
    ): ApiFunction<TFunctionName> {
        return validateApiFunction(functionName, apiFunction, this.beans);
    }

    public missingUserComponent(
        propertyName: string,
        componentName: string,
        agGridDefaults: { [key in UserComponentName]?: any },
        jsComps: { [key: string]: any }
    ): void {
        this.checkUserComponent(propertyName, componentName, agGridDefaults, jsComps);
    }

    private checkUserComponent(
        propertyName: string,
        componentName: string,
        agGridDefaults: { [key in UserComponentName]?: any },
        jsComps: { [key: string]: any }
    ): void {
        const moduleForComponent = USER_COMP_MODULES[componentName as UserComponentName];
        if (moduleForComponent) {
            this.gos.assertModuleRegistered(
                moduleForComponent,
                `AG Grid \`${propertyName}\` component: \`${componentName}\``
            );
            return;
        }
        // Resolve the valid component names here (where the maps live) and fuzzy-match them now, so
        // only the handful of suggestions travels in the error-page URL rather than the full registry.
        const validComponents = [
            // Don't include the old names / internals in potential suggestions
            ...Object.keys(agGridDefaults ?? {}).filter(
                (k) => !['agCellEditor', 'agGroupRowRenderer', 'agSortIndicator'].includes(k)
            ),
            ...Object.keys(jsComps ?? {}).filter((k) => !!jsComps[k]),
        ];
        const suggestions = _fuzzySuggestions({
            inputValue: componentName,
            allSuggestions: validComponents,
            hideIrrelevant: true,
            maxSuggestions: 4,
        }).values;
        this.warn(101, { propertyName, componentName, suggestions });
    }

    public missingDynamicBean(beanName: DynamicBeanName): string | undefined {
        const moduleName = DYNAMIC_BEAN_MODULES[beanName];
        return moduleName
            ? _errMsg(200, {
                  ...this.gos.getModuleErrorParams(),
                  moduleName,
                  reasonOrId: `\`${beanName}\``,
              })
            : undefined;
    }

    public checkRowEvents(eventType: RowNodeEventType): void {
        if (DEPRECATED_ROW_NODE_EVENTS.has(eventType)) {
            this.warn(10, { eventType });
        }
    }

    public validateIcon(iconName: IconName): void {
        this.checkIcon(iconName);
    }

    private checkIcon(iconName: IconName): void {
        if (DEPRECATED_ICONS_V33.has(iconName)) {
            this.warn(43, { iconName });
        }
        if (ICON_VALUES[iconName as IconValue]) {
            // directly referencing icon
            return;
        }
        const moduleName = ICON_MODULES[iconName];
        if (moduleName) {
            this.error(200, {
                reasonOrId: `icon \`${iconName}\``,
                moduleName,
                gridScoped: _areModulesGridScoped(),
                gridId: this.beans.context.getId(),
                rowModelType: this.gos.get('rowModelType'),
                additionalText: 'Alternatively, use the CSS icon name directly.',
            });
            return;
        }
        this.warn(134, { iconName });
    }

    public isProvidedUserComp(compName: string): boolean {
        return !!USER_COMP_MODULES[compName as UserComponentName];
    }

    /** Should only be called via the GridOptionsService */
    public validateColDef(colDef: ColDef | ColGroupDef): void {
        this.processOptions(colDef, COL_DEF_VALIDATORS());
    }

    private processOptions<T extends object>(options: T, validator: OptionsValidator<T>): void {
        const { validations, deprecations, allProperties, allValidNames, objectName, docsUrl } = validator;
        const log = this.beans.log;

        const optionKeys = Object.keys(options) as (keyof T & string)[];
        let isValidMap = this.propertyNameCache.get(objectName);
        if (!isValidMap) {
            isValidMap = new Map();
            this.propertyNameCache.set(objectName, isValidMap);
        }

        // Check uncached property names: emit one-time warnings and record validity
        const checkPropertyNames = this.gridOptions.suppressPropertyNamesCheck !== true;
        let hasInvalidName = false;
        for (const name of optionKeys) {
            if (isValidMap.has(name)) {
                // Already validated this property name
                continue;
            }

            const deprecation = deprecations[name as keyof T];
            if (deprecation) {
                const { message, version } = deprecation;
                log.deprecated(306, { version, name, message });
            }

            const rules = validations[name as keyof T];
            const rowModel = this.gridOptions.rowModelType ?? 'clientSide';
            if (rules?.supportedRowModels && !rules.supportedRowModels.includes(rowModel)) {
                const value = options[name as keyof T];
                if (value == null || value === false) {
                    // Value is disabled (e.g. Vue wrapper passes rowData: null) — don't cache
                    // so the check runs again if a real value is provided later
                    continue;
                }
                log.warn(309, { name, rowModel, supportedRowModels: rules.supportedRowModels });
                isValidMap.set(name, false);
                continue;
            }

            if (!allValidNames.has(name)) {
                if (checkPropertyNames) {
                    const suggestions = _fuzzySuggestions({
                        inputValue: name,
                        allSuggestions: allProperties,
                    }).values.slice(0, 8);
                    log.warn(307, { objectName, name, suggestions, hasContext: allValidNames.has('context') });
                }
                hasInvalidName = true;
                isValidMap.set(name, false);
                continue;
            }

            isValidMap.set(name, true);
        }

        if (hasInvalidName && docsUrl && checkPropertyNames) {
            const url = this.beans.frameworkOverrides.getDocLink(docsUrl);
            log.warn(310, { objectName, url });
        }

        // Run value-level validation only for properties marked valid
        const warnings = new Set<string>();
        const idWarnings: ValidationWarning[] = [];

        optionKeys.forEach((key: keyof T) => {
            if (isValidMap.get(key as string) === false) {
                // Don't perform runtime validations on invalid properties
                return;
            }

            const value = options[key];
            if (value == null || value === false) {
                // false implies feature is disabled, don't validate.
                return;
            }

            const rules = validations[key];
            if (!rules) {
                return;
            }

            const { dependencies, validate, expectedType } = rules;

            if (expectedType) {
                const actualType = typeof value;
                if (actualType !== expectedType) {
                    idWarnings.push(
                        _createValidationWarning(314, { key: String(key), expectedType, actualType, value })
                    );
                    return;
                }
            }

            if (dependencies) {
                const depWarnings = this.checkForRequiredDependencies(key, dependencies, options);
                if (depWarnings.length > 0) {
                    idWarnings.push(...depWarnings);
                    return;
                }
            }
            if (validate) {
                const warning = validate(options, this.gridOptions, this.beans);
                if (warning) {
                    if (typeof warning === 'string') {
                        warnings.add(warning);
                    } else {
                        idWarnings.push(warning);
                    }
                    return;
                }
            }
        });
        if (warnings.size > 0) {
            for (const warning of warnings) {
                _emitValidationWarning(warning, log);
            }
        }
        for (let i = 0, len = idWarnings.length; i < len; ++i) {
            idWarnings[i].emit(log);
        }
    }

    private checkForRequiredDependencies<T extends object>(
        key: keyof T,
        validator: RequiredOptions<T>,
        options: T
    ): ValidationWarning[] {
        // eslint-disable-next-line no-restricted-properties
        const optionEntries = Object.entries<DependentValues<T, keyof T>>(validator);
        const failedOptions = optionEntries.filter(([key, value]) => {
            const gridOptionValue = options[key as keyof T];
            return !value.required.includes(gridOptionValue);
        });

        return failedOptions.map(([failedKey, possibleOptions]: [string, DependentValues<any, any>]) => {
            const required = possibleOptions.required.map((o: any) => {
                if (o === null) {
                    return 'null';
                } else if (o === undefined) {
                    return 'undefined';
                }
                return String(o);
            });
            return _createValidationWarning(315, {
                key: String(key),
                failedKey,
                required,
                reason: possibleOptions.reason,
            });
        });
    }
}

const DEPRECATED_ROW_NODE_EVENTS: Set<RowNodeEventType> = new Set([
    'firstChildChanged',
    'lastChildChanged',
    'childIndexChanged',
]);
