"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationService = void 0;
const fuzzyMatch_1 = require("../utils/fuzzyMatch");
const object_1 = require("../utils/object");
const function_1 = require("../utils/function");
const gridOptionsValidations_1 = require("./rules/gridOptionsValidations");
const colDefValidations_1 = require("./rules/colDefValidations");
const beanStub_1 = require("../context/beanStub");
const context_1 = require("../context/context");
const moduleRegistry_1 = require("../modules/moduleRegistry");
let ValidationService = class ValidationService extends beanStub_1.BeanStub {
    init() {
        this.processGridOptions(this.gridOptions);
    }
    processGridOptions(options) {
        this.processOptions(options, gridOptionsValidations_1.GRID_OPTIONS_VALIDATORS);
    }
    processColumnDefs(options) {
        this.processOptions(options, colDefValidations_1.COL_DEF_VALIDATORS);
    }
    processOptions(options, validator) {
        const { validations, deprecations, allProperties, propertyExceptions, objectName, docsUrl } = validator;
        if (allProperties && this.gridOptions.suppressPropertyNamesCheck !== true) {
            this.checkProperties(options, [...propertyExceptions !== null && propertyExceptions !== void 0 ? propertyExceptions : [], ...Object.keys(deprecations)], allProperties, objectName, docsUrl);
        }
        const warnings = new Set();
        const optionKeys = Object.keys(options);
        optionKeys.forEach((key) => {
            var _a;
            const deprecation = deprecations[key];
            if (deprecation) {
                if ('renamed' in deprecation) {
                    const { renamed, version } = deprecation;
                    warnings.add(`As of v${version}, ${String(key)} is deprecated. Please use ${String(renamed)} instead.`);
                    options[renamed] = options[key];
                }
                else {
                    const { message, version } = deprecation;
                    warnings.add(`As of v${version}, ${String(key)} is deprecated. ${message !== null && message !== void 0 ? message : ''}`);
                }
            }
            const value = options[key];
            if (value == null || value === false) {
                // false implies feature is disabled, don't validate.
                return;
            }
            const rulesOrGetter = validations[key];
            let rules;
            if (!rulesOrGetter) {
                return;
            }
            else if (typeof rulesOrGetter === 'function') {
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
                    this.processOptions(options[key], fromGetter);
                    return;
                }
                rules = fromGetter;
            }
            else {
                rules = rulesOrGetter;
            }
            const { module, dependencies, supportedRowModels } = rules;
            if (supportedRowModels) {
                const rowModel = (_a = this.gridOptions.rowModelType) !== null && _a !== void 0 ? _a : 'clientSide';
                if (!supportedRowModels.includes(rowModel)) {
                    warnings.add(`${String(key)} is not supported with the '${rowModel}' row model.`);
                    return;
                }
            }
            if (module) {
                const modules = Array.isArray(module) ? module : [module];
                let allRegistered = true;
                modules.forEach(m => {
                    if (!moduleRegistry_1.ModuleRegistry.__assertRegistered(m, String(key), this.gridOptionsService.getGridId())) {
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
                (0, function_1.warnOnce)(warning);
            });
        }
    }
    ;
    checkForWarning(key, validator, options) {
        if (typeof validator === 'function') {
            return validator(options, this.gridOptions);
        }
        const optionEntries = Object.entries(validator);
        const failed = optionEntries.find(([key, value]) => {
            const gridOptionValue = options[key];
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
    checkProperties(object, exceptions, // deprecated properties generally
    validProperties, // properties to recommend
    containerName, docsUrl) {
        // Vue adds these properties to all objects, so we ignore them when checking for invalid properties
        const VUE_FRAMEWORK_PROPS = ['__ob__', '__v_skip', '__metadata__'];
        const invalidProperties = (0, fuzzyMatch_1.fuzzyCheckStrings)(Object.getOwnPropertyNames(object), [...VUE_FRAMEWORK_PROPS, ...exceptions, ...validProperties], validProperties);
        (0, object_1.iterateObject)(invalidProperties, (key, value) => {
            (0, function_1.warnOnce)(`invalid ${containerName} property '${key}' did you mean any of these: ${value.slice(0, 8).join(', ')}`);
        });
        if (Object.keys(invalidProperties).length > 0 && docsUrl) {
            const url = this.getFrameworkOverrides().getDocLink(docsUrl);
            (0, function_1.warnOnce)(`to see all the valid ${containerName} properties please check: ${url}`);
        }
    }
};
__decorate([
    (0, context_1.Autowired)('gridOptions')
], ValidationService.prototype, "gridOptions", void 0);
__decorate([
    context_1.PostConstruct
], ValidationService.prototype, "init", null);
ValidationService = __decorate([
    (0, context_1.Bean)('validationService')
], ValidationService);
exports.ValidationService = ValidationService;
