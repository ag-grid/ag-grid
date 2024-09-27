import type { ApiFunction, ApiFunctionName } from '../api/iApiFunction';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { GridOptions } from '../entities/gridOptions';
import { _defineModule } from '../interfaces/iModule';
import { _warnOnce } from '../utils/function';
import { _fuzzyCheckStrings } from '../utils/fuzzyMatch';
import { _iterateObject } from '../utils/object';
import { VERSION } from '../version';
import { validateApiFunction } from './apiFunctionValidator';
import type { ErrorId, GetErrorParams } from './errorMessages/errorText';
import { getError } from './errorMessages/errorText';
import { provideValidationServiceLogger } from './logging';
import { GRID_OPTIONS_VALIDATORS } from './rules/gridOptionsValidations';
import type { DependentValues, OptionsValidation, OptionsValidator, RequiredOptions } from './validationTypes';

export class ValidationService extends BeanStub implements NamedBean {
    beanName = 'validationService' as const;

    private beans: BeanCollection;
    private gridOptions: GridOptions;

    public wireBeans(beans: BeanCollection): void {
        this.beans = beans;
        this.gridOptions = beans.gridOptions;
        provideValidationServiceLogger(this);
    }

    public postConstruct(): void {
        this.processGridOptions(this.gridOptions);
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

    private processOptions<T extends object>(options: T, validator: OptionsValidator<T>): void {
        const { validations, deprecations, allProperties, propertyExceptions, objectName, docsUrl } = validator;

        if (allProperties && this.gridOptions.suppressPropertyNamesCheck !== true) {
            this.checkProperties(
                options,
                [...(propertyExceptions ?? []), ...Object.keys(deprecations)],
                allProperties,
                objectName,
                docsUrl
            );
        }

        const warnings = new Set<string>();

        const optionKeys = Object.keys(options) as (keyof T)[];
        optionKeys.forEach((key: keyof T) => {
            const deprecation = deprecations[key];
            if (deprecation) {
                if ('renamed' in deprecation) {
                    const { renamed, version } = deprecation;
                    warnings.add(
                        `As of v${version}, ${String(key)} is deprecated. Please use ${String(renamed)} instead.`
                    );
                    options[renamed] = options[key];
                } else {
                    const { message, version } = deprecation;
                    warnings.add(`As of v${version}, ${String(key)} is deprecated. ${message ?? ''}`);
                }
            }

            const value = options[key];
            if (value == null || value === false) {
                // false implies feature is disabled, don't validate.
                return;
            }

            const rulesOrGetter = validations[key];
            let rules: OptionsValidation<T>;
            if (!rulesOrGetter) {
                return;
            } else if (typeof rulesOrGetter === 'function') {
                const fromGetter = rulesOrGetter(options, this.gridOptions);
                if (!fromGetter) {
                    return;
                }

                // this is a sub validator.
                if ('objectName' in fromGetter) {
                    const value = options[key];
                    if (Array.isArray(value)) {
                        value.forEach((item) => {
                            this.processOptions(item, fromGetter);
                        });
                        return;
                    }
                    this.processOptions(options[key] as any, fromGetter);
                    return;
                }

                rules = fromGetter;
            } else {
                rules = rulesOrGetter;
            }

            const { module, dependencies, validate, supportedRowModels } = rules;
            if (supportedRowModels) {
                const rowModel = this.gridOptions.rowModelType ?? 'clientSide';
                if (!supportedRowModels.includes(rowModel)) {
                    warnings.add(`${String(key)} is not supported with the '${rowModel}' row model.`);
                    return;
                }
            }

            if (module) {
                const modules = Array.isArray(module) ? module : [module];

                let allRegistered = true;
                modules.forEach((m) => {
                    if (!this.gos.assertModuleRegistered(m, String(key))) {
                        allRegistered = false;
                        warnings.add(`${String(key)} is only available when ${m} is loaded.`);
                    }
                });

                if (!allRegistered) {
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
                const warning = validate(options, this.gridOptions);
                if (warning) {
                    warnings.add(warning);
                    return;
                }
            }
        });
        if (warnings.size > 0) {
            warnings.forEach((warning) => {
                _warnOnce(warning);
            });
        }
    }

    private checkForRequiredDependencies<T extends object>(
        key: keyof T,
        validator: RequiredOptions<T>,
        options: T
    ): string | null {
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

    private checkProperties<T extends object>(
        object: T,
        exceptions: string[], // deprecated properties generally
        validProperties: string[], // properties to recommend
        containerName: string,
        docsUrl?: string
    ): void {
        // Vue adds these properties to all objects, so we ignore them when checking for invalid properties
        const VUE_FRAMEWORK_PROPS = ['__ob__', '__v_skip', '__metadata__'];

        const invalidProperties: { [p: string]: string[] } = _fuzzyCheckStrings(
            Object.getOwnPropertyNames(object),
            [...VUE_FRAMEWORK_PROPS, ...exceptions, ...validProperties],
            validProperties
        );

        _iterateObject(invalidProperties, (key, value) => {
            let message = `invalid ${containerName} property '${key}' did you mean any of these: ${value.slice(0, 8).join(', ')}.`;
            if (validProperties.includes('context')) {
                message += `\nIf you are trying to annotate ${containerName} with application data, use the '${containerName}.context' property instead.`;
            }
            _warnOnce(message);
        });

        if (Object.keys(invalidProperties).length > 0 && docsUrl) {
            const url = this.getFrameworkOverrides().getDocLink(docsUrl);
            _warnOnce(`to see all the valid ${containerName} properties please check: ${url}`);
        }
    }

    public getConsoleMessage<TId extends ErrorId>(id: TId, args: GetErrorParams<TId>): any[] {
        return getError(id, args);
    }
}

export const ValidationsModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/core-validations',
    beans: [ValidationService],
});
