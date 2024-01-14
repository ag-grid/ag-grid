"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationService = void 0;
var fuzzyMatch_1 = require("../utils/fuzzyMatch");
var object_1 = require("../utils/object");
var function_1 = require("../utils/function");
var gridOptionsValidations_1 = require("./rules/gridOptionsValidations");
var colDefValidations_1 = require("./rules/colDefValidations");
var beanStub_1 = require("../context/beanStub");
var context_1 = require("../context/context");
var moduleRegistry_1 = require("../modules/moduleRegistry");
var ValidationService = /** @class */ (function (_super) {
    __extends(ValidationService, _super);
    function ValidationService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ValidationService.prototype.init = function () {
        this.processGridOptions(this.gridOptions);
    };
    ValidationService.prototype.processGridOptions = function (options) {
        this.processOptions(options, gridOptionsValidations_1.GRID_OPTIONS_VALIDATORS);
    };
    ValidationService.prototype.processColumnDefs = function (options) {
        this.processOptions(options, colDefValidations_1.COL_DEF_VALIDATORS);
    };
    ValidationService.prototype.processOptions = function (options, validator) {
        var _this = this;
        var validations = validator.validations, deprecations = validator.deprecations, allProperties = validator.allProperties, propertyExceptions = validator.propertyExceptions, objectName = validator.objectName, docsUrl = validator.docsUrl;
        if (allProperties && this.gridOptions.suppressPropertyNamesCheck !== true) {
            this.checkProperties(options, __spreadArray(__spreadArray([], __read(propertyExceptions !== null && propertyExceptions !== void 0 ? propertyExceptions : []), false), __read(Object.keys(deprecations)), false), allProperties, objectName, docsUrl);
        }
        var warnings = new Set();
        var optionKeys = Object.keys(options);
        optionKeys.forEach(function (key) {
            var _a;
            var deprecation = deprecations[key];
            if (deprecation) {
                if ('renamed' in deprecation) {
                    var renamed = deprecation.renamed, version = deprecation.version;
                    warnings.add("As of v".concat(version, ", ").concat(String(key), " is deprecated. Please use ").concat(String(renamed), " instead."));
                    options[renamed] = options[key];
                }
                else {
                    var message = deprecation.message, version = deprecation.version;
                    warnings.add("As of v".concat(version, ", ").concat(String(key), " is deprecated. ").concat(message !== null && message !== void 0 ? message : ''));
                }
            }
            var value = options[key];
            if (value == null || value === false) {
                // false implies feature is disabled, don't validate.
                return;
            }
            var rulesOrGetter = validations[key];
            var rules;
            if (!rulesOrGetter) {
                return;
            }
            else if (typeof rulesOrGetter === 'function') {
                var fromGetter_1 = rulesOrGetter(options, _this.gridOptions);
                if (!fromGetter_1) {
                    return;
                }
                // this is a sub validator.
                if ('objectName' in fromGetter_1) {
                    var value_1 = options[key];
                    if (Array.isArray(value_1)) {
                        value_1.forEach(function (item) {
                            _this.processOptions(item, fromGetter_1);
                        });
                        return;
                    }
                    _this.processOptions(options[key], fromGetter_1);
                    return;
                }
                rules = fromGetter_1;
            }
            else {
                rules = rulesOrGetter;
            }
            var module = rules.module, dependencies = rules.dependencies, supportedRowModels = rules.supportedRowModels;
            if (supportedRowModels) {
                var rowModel = (_a = _this.gridOptions.rowModelType) !== null && _a !== void 0 ? _a : 'clientSide';
                if (!supportedRowModels.includes(rowModel)) {
                    warnings.add("".concat(String(key), " is not supported with the '").concat(rowModel, "' row model."));
                    return;
                }
            }
            if (module) {
                var modules = Array.isArray(module) ? module : [module];
                var allRegistered_1 = true;
                modules.forEach(function (m) {
                    if (!moduleRegistry_1.ModuleRegistry.__assertRegistered(m, String(key), _this.gridOptionsService.getGridId())) {
                        allRegistered_1 = false;
                        warnings.add("".concat(String(key), " is only available when ").concat(m, " is loaded."));
                    }
                });
                if (!allRegistered_1) {
                    return;
                }
            }
            if (dependencies) {
                var warning = _this.checkForWarning(key, dependencies, options);
                if (warning) {
                    warnings.add(warning);
                    return;
                }
            }
        });
        if (warnings.size > 0) {
            warnings.forEach(function (warning) {
                (0, function_1.warnOnce)(warning);
            });
        }
    };
    ;
    ValidationService.prototype.checkForWarning = function (key, validator, options) {
        if (typeof validator === 'function') {
            return validator(options, this.gridOptions);
        }
        var optionEntries = Object.entries(validator);
        var failed = optionEntries.find(function (_a) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            var gridOptionValue = options[key];
            return !value.includes(gridOptionValue);
        });
        if (!failed) {
            return null;
        }
        var _a = __read(failed, 2), failedKey = _a[0], possibleOptions = _a[1];
        if (possibleOptions.length > 1) {
            return "'".concat(String(key), "' requires '").concat(failedKey, "' to be one of [").concat(possibleOptions.join(', '), "].");
        }
        return "'".concat(String(key), "' requires '").concat(failedKey, "' to be ").concat(possibleOptions[0], ".");
    };
    ValidationService.prototype.checkProperties = function (object, exceptions, // deprecated properties generally
    validProperties, // properties to recommend
    containerName, docsUrl) {
        // Vue adds these properties to all objects, so we ignore them when checking for invalid properties
        var VUE_FRAMEWORK_PROPS = ['__ob__', '__v_skip', '__metadata__'];
        var invalidProperties = (0, fuzzyMatch_1.fuzzyCheckStrings)(Object.getOwnPropertyNames(object), __spreadArray(__spreadArray(__spreadArray([], __read(VUE_FRAMEWORK_PROPS), false), __read(exceptions), false), __read(validProperties), false), validProperties);
        (0, object_1.iterateObject)(invalidProperties, function (key, value) {
            (0, function_1.warnOnce)("invalid ".concat(containerName, " property '").concat(key, "' did you mean any of these: ").concat(value.slice(0, 8).join(', ')));
        });
        if (Object.keys(invalidProperties).length > 0 && docsUrl) {
            var url = this.getFrameworkOverrides().getDocLink(docsUrl);
            (0, function_1.warnOnce)("to see all the valid ".concat(containerName, " properties please check: ").concat(url));
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
    return ValidationService;
}(beanStub_1.BeanStub));
exports.ValidationService = ValidationService;
