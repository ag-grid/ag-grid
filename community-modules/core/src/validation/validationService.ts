import { GridOptions } from "../entities/gridOptions";
import { fuzzyCheckStrings } from "../utils/fuzzyMatch";
import { iterateObject } from "../utils/object";
import { warnOnce } from "../utils/function";
import { DependencyValidator, OptionsValidation, OptionsValidator } from "./validationTypes";
import { GRID_OPTIONS_VALIDATORS, GRID_OPTION_DEFAULTS } from "./rules/gridOptionsValidations";
import { COL_DEF_VALIDATORS } from "./rules/colDefValidations";
import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { ColDef, ColGroupDef } from "../entities/colDef";
import { ModuleRegistry } from "../modules/moduleRegistry";

@Bean('validationService')
export class ValidationService extends BeanStub {
    @Autowired('gridOptions') private readonly gridOptions: GridOptions;

    @PostConstruct
    public init(): void {
        this.processGridOptions(this.gridOptions);
    }

    public processGridOptions(options: GridOptions): void {
        this.processOptions(options, GRID_OPTIONS_VALIDATORS);
    }

    public processColumnDefs(options: ColDef | ColGroupDef): void {
        this.processOptions(options, COL_DEF_VALIDATORS);
    }

    private processOptions<T extends {}>(options: T, validator: OptionsValidator<T>): void {
        const { validations, deprecations, allProperties, propertyExceptions, objectName, docsUrl } = validator;
        
        if (allProperties && this.gridOptions.suppressPropertyNamesCheck !== true) {
            this.checkProperties(
                options,
                [...propertyExceptions ?? [], ...Object.keys(deprecations)],
                allProperties,
                objectName,
                docsUrl,
            );
        }

        const warnings: Set<string> = new Set();

        const optionKeys = Object.keys(options) as (keyof T)[];
        optionKeys.forEach((key: keyof T) => {
            const deprecation = deprecations[key] as any;
            if (deprecation) {
                if ('renamed' in deprecation) {
                    const { renamed, version } = deprecation;
                    warnings.add(`As of v${version}, ${String(key)} is deprecated. Please use ${String(renamed)} instead.`);
                    (options as any)[renamed] = options[key];
                } else {
                    const { message, version } = deprecation;
                    warnings.add(`As of v${version}, ${String(key)} is deprecated. ${message ?? ''}`);
                }
            }

            const value = options[key];
            if (value == null || (value as any) === false) {
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
                        value.forEach(item => {
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
            
            const { module, dependencies, supportedRowModels } = rules;
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
                modules.forEach(m => {
                    if (!ModuleRegistry.__assertRegistered(m, String(key), this.context.getGridId())) {
                        allRegistered = false;
                        warnings.add(`${String(key)} is only available when ${m} is loaded.`);
                    }
                });

                if (!allRegistered) {
                    return;
                }
            }

            if (dependencies) {                
                const warning = this.checkForWarning(key, dependencies, options);
                if (warning) {
                    warnings.add(warning);
                    return;
                }
            }
        });
        if (warnings.size > 0) {
            warnings.forEach(warning => {
                warnOnce(warning);
            });
        }
    };

    private checkForWarning<T extends {}>(key: keyof T, validator: DependencyValidator<T>, options: T): string | null {
        if (typeof validator === 'function') {
            return validator(options, this.gridOptions);    
        }

        const optionEntries = Object.entries(validator) as [string, any][];
        const failed = optionEntries.find(([key, value]) => {
            const gridOptionValue = options[key as keyof T];
            return !value.includes(gridOptionValue);
        });
    
        if (!failed) {
            return null;
        }

        const [failedKey, possibleOptions] = failed;
        if (possibleOptions.length > 1) {
            return `'${String(key)}' requires '${failedKey}' to be one of [${possibleOptions.join(', ')}].`;
        }

        return `'${String(key)}' requires '${failedKey}' to be ${possibleOptions[0]}.`;
    }

    private checkProperties<T extends {}>(
        object: T,
        exceptions: string[], // deprecated properties generally
        validProperties: string[], // properties to recommend
        containerName: string,
        docsUrl?: string
    ): void {
        // Vue adds these properties to all objects, so we ignore them when checking for invalid properties
        const VUE_FRAMEWORK_PROPS = ['__ob__', '__v_skip', '__metadata__'];

        const invalidProperties: { [p: string]: string[]; } = fuzzyCheckStrings(
            Object.getOwnPropertyNames(object),
            [...VUE_FRAMEWORK_PROPS, ...exceptions, ...validProperties],
            validProperties
        );

        iterateObject<any>(invalidProperties, (key, value) => {
            warnOnce(`invalid ${containerName} property '${key}' did you mean any of these: ${value.slice(0, 8).join(', ')}`);
        });

        if (Object.keys(invalidProperties).length > 0 && docsUrl) {
            const url = this.getFrameworkOverrides().getDocLink(docsUrl);            
            warnOnce(`to see all the valid ${containerName} properties please check: ${url}`);
        }
    }
}
