import type { IconValue } from '../agStack/interfaces/iIcon';
import type { AgPropertyChangedSource } from '../agStack/interfaces/iProperties';
import { _fuzzySuggestions } from '../agStack/utils/fuzzyMatch';
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
import { _warnOnce } from '../utils/log';
import { validateApiFunction } from './apiFunctionValidator';
import { getError } from './errorMessages/errorText';
import { _errMsg, _error, _warn, provideValidationServiceLogger } from './logging';
import { COL_DEF_VALIDATORS } from './rules/colDefValidations';
import { DYNAMIC_BEAN_MODULES } from './rules/dynamicBeanValidations';
import { GRID_OPTIONS_VALIDATORS } from './rules/gridOptionsValidations';
import { DEPRECATED_ICONS_V33, ICON_MODULES, ICON_VALUES } from './rules/iconValidations';
import { USER_COMP_MODULES } from './rules/userCompValidations';
import type { DependentValues, OptionsValidator, RequiredOptions } from './validationTypes';

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
            _warn(22, { key });
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
        const moduleForComponent = USER_COMP_MODULES[componentName as UserComponentName];
        if (moduleForComponent) {
            this.gos.assertModuleRegistered(
                moduleForComponent,
                `AG Grid '${propertyName}' component: ${componentName}`
            );
        } else {
            _warn(101, {
                propertyName,
                componentName,
                agGridDefaults,
                jsComps,
            });
        }
    }

    public missingDynamicBean(beanName: DynamicBeanName): string | undefined {
        const moduleName = DYNAMIC_BEAN_MODULES[beanName];
        return moduleName
            ? _errMsg(200, {
                  ...this.gos.getModuleErrorParams(),
                  moduleName,
                  reasonOrId: beanName,
              })
            : undefined;
    }

    public checkRowEvents(eventType: RowNodeEventType): void {
        if (DEPRECATED_ROW_NODE_EVENTS.has(eventType)) {
            _warn(10, { eventType });
        }
    }

    public validateIcon(iconName: IconName): void {
        if (DEPRECATED_ICONS_V33.has(iconName)) {
            _warn(43, { iconName });
        }
        if (ICON_VALUES[iconName as IconValue]) {
            // directly referencing icon
            return;
        }
        const moduleName = ICON_MODULES[iconName];
        if (moduleName) {
            _error(200, {
                reasonOrId: `icon '${iconName}'`,
                moduleName,
                gridScoped: _areModulesGridScoped(),
                gridId: this.beans.context.getId(),
                rowModelType: this.gos.get('rowModelType'),
                additionalText: 'Alternatively, use the CSS icon name directly.',
            });
            return;
        }
        _warn(134, { iconName });
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
                _warnOnce(`As of v${version}, ${name} is deprecated. ${message ?? ''}`);
            }

            const rules = validations[name as keyof T];
            const rowModel = this.gridOptions.rowModelType ?? 'clientSide';
            if (rules?.supportedRowModels && !rules.supportedRowModels.includes(rowModel)) {
                _warnOnce(
                    `${name} is not supported with the '${rowModel}' row model. It is only valid with: ${rules.supportedRowModels.join(', ')}.`
                );
                isValidMap.set(name, false);
                continue;
            }

            if (!allValidNames.has(name)) {
                if (checkPropertyNames) {
                    const suggestions = _fuzzySuggestions({
                        inputValue: name,
                        allSuggestions: allProperties,
                    }).values;
                    let message = `invalid ${objectName} property '${name}' did you mean any of these: ${suggestions.slice(0, 8).join(', ')}.`;
                    if (allValidNames.has('context')) {
                        message += `\nIf you are trying to annotate ${objectName} with application data, use the '${objectName}.context' property instead.`;
                    }
                    _warnOnce(message);
                }
                hasInvalidName = true;
                isValidMap.set(name, false);
                continue;
            }

            isValidMap.set(name, true);
        }

        if (hasInvalidName && docsUrl && checkPropertyNames) {
            const url = this.beans.frameworkOverrides.getDocLink(docsUrl);
            _warnOnce(`to see all the valid ${objectName} properties please check: ${url}`);
        }

        // Run value-level validation only for properties marked valid
        const warnings = new Set<string>();

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
                    warnings.add(
                        `${String(key)} should be of type '${expectedType}' but received '${actualType}' (${value}).`
                    );
                    return;
                }
            }

            if (dependencies) {
                const warning = this.checkForRequiredDependencies(key, dependencies, options);
                if (warning) {
                    warnings.add(warning);
                    return;
                }
            }
            if (validate) {
                const warning = validate(options, this.gridOptions, this.beans);
                if (warning) {
                    warnings.add(warning);
                    return;
                }
            }
        });
        if (warnings.size > 0) {
            for (const warning of warnings) {
                _warnOnce(warning);
            }
        }
    }

    private checkForRequiredDependencies<T extends object>(
        key: keyof T,
        validator: RequiredOptions<T>,
        options: T
    ): string | null {
        // eslint-disable-next-line no-restricted-properties
        const optionEntries = Object.entries<DependentValues<T, keyof T>>(validator);
        const failedOptions = optionEntries.filter(([key, value]) => {
            const gridOptionValue = options[key as keyof T];
            return !value.required.includes(gridOptionValue);
        });

        if (failedOptions.length === 0) {
            return null;
        }

        return failedOptions
            .map(
                ([failedKey, possibleOptions]: [string, DependentValues<any, any>]) =>
                    `'${String(key)}' requires '${failedKey}' to be one of [${possibleOptions.required
                        .map((o: any) => {
                            if (o === null) {
                                return 'null';
                            } else if (o === undefined) {
                                return 'undefined';
                            }
                            return o;
                        })
                        .join(', ')}]. ${possibleOptions.reason ?? ''}`
            )
            .join('\n           '); // make multiple messages easier to read
    }
}

const DEPRECATED_ROW_NODE_EVENTS: Set<RowNodeEventType> = new Set([
    'firstChildChanged',
    'lastChildChanged',
    'childIndexChanged',
]);
