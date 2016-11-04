/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var core_1 = require('@angular/core');
var SUPPORTED_SCHEMA_VERSION = 1;
/**
 * A token representing the a reference to a static type.
 *
 * This token is unique for a filePath and name and can be used as a hash table key.
 */
var StaticSymbol = (function () {
    function StaticSymbol(filePath, name, members) {
        this.filePath = filePath;
        this.name = name;
        this.members = members;
    }
    return StaticSymbol;
}());
exports.StaticSymbol = StaticSymbol;
/**
 * A static reflector implements enough of the Reflector API that is necessary to compile
 * templates statically.
 */
var StaticReflector = (function () {
    function StaticReflector(host) {
        this.host = host;
        this.annotationCache = new Map();
        this.propertyCache = new Map();
        this.parameterCache = new Map();
        this.metadataCache = new Map();
        this.conversionMap = new Map();
        this.initializeConversionMap();
    }
    StaticReflector.prototype.importUri = function (typeOrFunc) {
        var staticSymbol = this.host.findDeclaration(typeOrFunc.filePath, typeOrFunc.name, '');
        return staticSymbol ? staticSymbol.filePath : null;
    };
    StaticReflector.prototype.resolveIdentifier = function (name, moduleUrl, runtime) {
        var result = this.host.findDeclaration(moduleUrl, name, '');
        return result;
    };
    StaticReflector.prototype.resolveEnum = function (enumIdentifier, name) {
        var staticSymbol = enumIdentifier;
        return this.host.getStaticSymbol(staticSymbol.filePath, staticSymbol.name, [name]);
    };
    StaticReflector.prototype.annotations = function (type) {
        var annotations = this.annotationCache.get(type);
        if (!annotations) {
            var classMetadata = this.getTypeMetadata(type);
            if (classMetadata['decorators']) {
                annotations = this.simplify(type, classMetadata['decorators']);
            }
            else {
                annotations = [];
            }
            this.annotationCache.set(type, annotations.filter(function (ann) { return !!ann; }));
        }
        return annotations;
    };
    StaticReflector.prototype.propMetadata = function (type) {
        var _this = this;
        var propMetadata = this.propertyCache.get(type);
        if (!propMetadata) {
            var classMetadata = this.getTypeMetadata(type);
            var members = classMetadata ? classMetadata['members'] : {};
            propMetadata = mapStringMap(members, function (propData, propName) {
                var prop = propData
                    .find(function (a) { return a['__symbolic'] == 'property' || a['__symbolic'] == 'method'; });
                if (prop && prop['decorators']) {
                    return _this.simplify(type, prop['decorators']);
                }
                else {
                    return [];
                }
            });
            this.propertyCache.set(type, propMetadata);
        }
        return propMetadata;
    };
    StaticReflector.prototype.parameters = function (type) {
        if (!(type instanceof StaticSymbol)) {
            throw new Error("parameters received " + JSON.stringify(type) + " which is not a StaticSymbol");
        }
        try {
            var parameters_1 = this.parameterCache.get(type);
            if (!parameters_1) {
                var classMetadata = this.getTypeMetadata(type);
                var members = classMetadata ? classMetadata['members'] : null;
                var ctorData = members ? members['__ctor__'] : null;
                if (ctorData) {
                    var ctor = ctorData.find(function (a) { return a['__symbolic'] == 'constructor'; });
                    var parameterTypes = this.simplify(type, ctor['parameters'] || []);
                    var parameterDecorators_1 = this.simplify(type, ctor['parameterDecorators'] || []);
                    parameters_1 = [];
                    parameterTypes.forEach(function (paramType, index) {
                        var nestedResult = [];
                        if (paramType) {
                            nestedResult.push(paramType);
                        }
                        var decorators = parameterDecorators_1 ? parameterDecorators_1[index] : null;
                        if (decorators) {
                            nestedResult.push.apply(nestedResult, decorators);
                        }
                        parameters_1.push(nestedResult);
                    });
                }
                if (!parameters_1) {
                    parameters_1 = [];
                }
                this.parameterCache.set(type, parameters_1);
            }
            return parameters_1;
        }
        catch (e) {
            console.log("Failed on type " + JSON.stringify(type) + " with error " + e);
            throw e;
        }
    };
    StaticReflector.prototype.hasLifecycleHook = function (type, lcInterface, lcProperty) {
        if (!(type instanceof StaticSymbol)) {
            throw new Error("hasLifecycleHook received " + JSON.stringify(type) + " which is not a StaticSymbol");
        }
        var classMetadata = this.getTypeMetadata(type);
        var members = classMetadata ? classMetadata['members'] : null;
        var member = members ? members[lcProperty] : null;
        return member ? member.some(function (a) { return a['__symbolic'] == 'method'; }) : false;
    };
    StaticReflector.prototype.registerDecoratorOrConstructor = function (type, ctor) {
        this.conversionMap.set(type, function (context, args) { return new (ctor.bind.apply(ctor, [void 0].concat(args)))(); });
    };
    StaticReflector.prototype.registerFunction = function (type, fn) {
        this.conversionMap.set(type, function (context, args) { return fn.apply(undefined, args); });
    };
    StaticReflector.prototype.initializeConversionMap = function () {
        var _a = this.host.angularImportLocations(), coreDecorators = _a.coreDecorators, diDecorators = _a.diDecorators, diMetadata = _a.diMetadata, diOpaqueToken = _a.diOpaqueToken, animationMetadata = _a.animationMetadata, provider = _a.provider;
        this.opaqueToken = this.host.findDeclaration(diOpaqueToken, 'OpaqueToken');
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diDecorators, 'Host'), core_1.Host);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diDecorators, 'Injectable'), core_1.Injectable);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diDecorators, 'Self'), core_1.Self);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diDecorators, 'SkipSelf'), core_1.SkipSelf);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diDecorators, 'Inject'), core_1.Inject);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diDecorators, 'Optional'), core_1.Optional);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Attribute'), core_1.Attribute);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'ContentChild'), core_1.ContentChild);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'ContentChildren'), core_1.ContentChildren);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'ViewChild'), core_1.ViewChild);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'ViewChildren'), core_1.ViewChildren);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Input'), core_1.Input);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Output'), core_1.Output);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Pipe'), core_1.Pipe);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'HostBinding'), core_1.HostBinding);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'HostListener'), core_1.HostListener);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Directive'), core_1.Directive);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'Component'), core_1.Component);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(coreDecorators, 'NgModule'), core_1.NgModule);
        // Note: Some metadata classes can be used directly with Provider.deps.
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diMetadata, 'Host'), core_1.Host);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diMetadata, 'Self'), core_1.Self);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diMetadata, 'SkipSelf'), core_1.SkipSelf);
        this.registerDecoratorOrConstructor(this.host.findDeclaration(diMetadata, 'Optional'), core_1.Optional);
        this.registerFunction(this.host.findDeclaration(animationMetadata, 'trigger'), core_1.trigger);
        this.registerFunction(this.host.findDeclaration(animationMetadata, 'state'), core_1.state);
        this.registerFunction(this.host.findDeclaration(animationMetadata, 'transition'), core_1.transition);
        this.registerFunction(this.host.findDeclaration(animationMetadata, 'style'), core_1.style);
        this.registerFunction(this.host.findDeclaration(animationMetadata, 'animate'), core_1.animate);
        this.registerFunction(this.host.findDeclaration(animationMetadata, 'keyframes'), core_1.keyframes);
        this.registerFunction(this.host.findDeclaration(animationMetadata, 'sequence'), core_1.sequence);
        this.registerFunction(this.host.findDeclaration(animationMetadata, 'group'), core_1.group);
    };
    /** @internal */
    StaticReflector.prototype.simplify = function (context, value) {
        var _this = this;
        var scope = BindingScope.empty;
        var calling = new Map();
        function simplifyInContext(context, value, depth) {
            function resolveReference(context, expression) {
                var staticSymbol;
                if (expression['module']) {
                    staticSymbol = _this.host.findDeclaration(expression['module'], expression['name'], context.filePath);
                }
                else {
                    staticSymbol = _this.host.getStaticSymbol(context.filePath, expression['name']);
                }
                return staticSymbol;
            }
            function resolveReferenceValue(staticSymbol) {
                var result = staticSymbol;
                var moduleMetadata = _this.getModuleMetadata(staticSymbol.filePath);
                var declarationValue = moduleMetadata ? moduleMetadata['metadata'][staticSymbol.name] : null;
                return declarationValue;
            }
            function isOpaqueToken(context, value) {
                if (value && value.__symbolic === 'new' && value.expression) {
                    var target = value.expression;
                    if (target.__symbolic == 'reference') {
                        return sameSymbol(resolveReference(context, target), _this.opaqueToken);
                    }
                }
                return false;
            }
            function simplifyCall(expression) {
                var callContext = undefined;
                if (expression['__symbolic'] == 'call') {
                    var target = expression['expression'];
                    var functionSymbol = void 0;
                    var targetFunction = void 0;
                    if (target) {
                        switch (target.__symbolic) {
                            case 'reference':
                                // Find the function to call.
                                callContext = { name: target.name };
                                functionSymbol = resolveReference(context, target);
                                targetFunction = resolveReferenceValue(functionSymbol);
                                break;
                            case 'select':
                                // Find the static method to call
                                if (target.expression.__symbolic == 'reference') {
                                    functionSymbol = resolveReference(context, target.expression);
                                    var classData = resolveReferenceValue(functionSymbol);
                                    if (classData && classData.statics) {
                                        targetFunction = classData.statics[target.member];
                                    }
                                }
                                break;
                        }
                    }
                    if (targetFunction && targetFunction['__symbolic'] == 'function') {
                        if (calling.get(functionSymbol)) {
                            throw new Error('Recursion not supported');
                        }
                        calling.set(functionSymbol, true);
                        try {
                            var value_1 = targetFunction['value'];
                            if (value_1 && (depth != 0 || value_1.__symbolic != 'error')) {
                                // Determine the arguments
                                var args = (expression['arguments'] || []).map(function (arg) { return simplify(arg); });
                                var parameters = targetFunction['parameters'];
                                var defaults = targetFunction.defaults;
                                if (defaults && defaults.length > args.length) {
                                    args.push.apply(args, defaults.slice(args.length).map(function (value) { return simplify(value); }));
                                }
                                var functionScope = BindingScope.build();
                                for (var i = 0; i < parameters.length; i++) {
                                    functionScope.define(parameters[i], args[i]);
                                }
                                var oldScope = scope;
                                var result_1;
                                try {
                                    scope = functionScope.done();
                                    result_1 = simplifyInContext(functionSymbol, value_1, depth + 1);
                                }
                                finally {
                                    scope = oldScope;
                                }
                                return result_1;
                            }
                        }
                        finally {
                            calling.delete(functionSymbol);
                        }
                    }
                }
                if (depth === 0) {
                    // If depth is 0 we are evaluating the top level expression that is describing element
                    // decorator. In this case, it is a decorator we don't understand, such as a custom
                    // non-angular decorator, and we should just ignore it.
                    return { __symbolic: 'ignore' };
                }
                return simplify({ __symbolic: 'error', message: 'Function call not supported', context: callContext });
            }
            function simplify(expression) {
                if (isPrimitive(expression)) {
                    return expression;
                }
                if (expression instanceof Array) {
                    var result_2 = [];
                    for (var _i = 0, _a = expression; _i < _a.length; _i++) {
                        var item = _a[_i];
                        // Check for a spread expression
                        if (item && item.__symbolic === 'spread') {
                            var spreadArray = simplify(item.expression);
                            if (Array.isArray(spreadArray)) {
                                for (var _b = 0, spreadArray_1 = spreadArray; _b < spreadArray_1.length; _b++) {
                                    var spreadItem = spreadArray_1[_b];
                                    result_2.push(spreadItem);
                                }
                                continue;
                            }
                        }
                        var value_2 = simplify(item);
                        if (shouldIgnore(value_2)) {
                            continue;
                        }
                        result_2.push(value_2);
                    }
                    return result_2;
                }
                if (expression) {
                    if (expression['__symbolic']) {
                        var staticSymbol = void 0;
                        switch (expression['__symbolic']) {
                            case 'binop':
                                var left = simplify(expression['left']);
                                if (shouldIgnore(left))
                                    return left;
                                var right = simplify(expression['right']);
                                if (shouldIgnore(right))
                                    return right;
                                switch (expression['operator']) {
                                    case '&&':
                                        return left && right;
                                    case '||':
                                        return left || right;
                                    case '|':
                                        return left | right;
                                    case '^':
                                        return left ^ right;
                                    case '&':
                                        return left & right;
                                    case '==':
                                        return left == right;
                                    case '!=':
                                        return left != right;
                                    case '===':
                                        return left === right;
                                    case '!==':
                                        return left !== right;
                                    case '<':
                                        return left < right;
                                    case '>':
                                        return left > right;
                                    case '<=':
                                        return left <= right;
                                    case '>=':
                                        return left >= right;
                                    case '<<':
                                        return left << right;
                                    case '>>':
                                        return left >> right;
                                    case '+':
                                        return left + right;
                                    case '-':
                                        return left - right;
                                    case '*':
                                        return left * right;
                                    case '/':
                                        return left / right;
                                    case '%':
                                        return left % right;
                                }
                                return null;
                            case 'if':
                                var condition = simplify(expression['condition']);
                                return condition ? simplify(expression['thenExpression']) :
                                    simplify(expression['elseExpression']);
                            case 'pre':
                                var operand = simplify(expression['operand']);
                                if (shouldIgnore(operand))
                                    return operand;
                                switch (expression['operator']) {
                                    case '+':
                                        return operand;
                                    case '-':
                                        return -operand;
                                    case '!':
                                        return !operand;
                                    case '~':
                                        return ~operand;
                                }
                                return null;
                            case 'index':
                                var indexTarget = simplify(expression['expression']);
                                var index = simplify(expression['index']);
                                if (indexTarget && isPrimitive(index))
                                    return indexTarget[index];
                                return null;
                            case 'select':
                                var selectTarget = simplify(expression['expression']);
                                if (selectTarget instanceof StaticSymbol) {
                                    // Access to a static instance variable
                                    var declarationValue_1 = resolveReferenceValue(selectTarget);
                                    if (declarationValue_1 && declarationValue_1.statics) {
                                        selectTarget = declarationValue_1.statics;
                                    }
                                    else {
                                        var member_1 = expression['member'];
                                        var members = selectTarget.members ?
                                            selectTarget.members.concat(member_1) :
                                            [member_1];
                                        return _this.host.getStaticSymbol(selectTarget.filePath, selectTarget.name, members);
                                    }
                                }
                                var member = simplify(expression['member']);
                                if (selectTarget && isPrimitive(member))
                                    return simplify(selectTarget[member]);
                                return null;
                            case 'reference':
                                if (!expression.module) {
                                    var name_1 = expression['name'];
                                    var localValue = scope.resolve(name_1);
                                    if (localValue != BindingScope.missing) {
                                        return localValue;
                                    }
                                }
                                staticSymbol = resolveReference(context, expression);
                                var result_3 = staticSymbol;
                                var declarationValue = resolveReferenceValue(result_3);
                                if (declarationValue) {
                                    if (isOpaqueToken(staticSymbol, declarationValue)) {
                                        // If the referenced symbol is initalized by a new OpaqueToken we can keep the
                                        // reference to the symbol.
                                        return staticSymbol;
                                    }
                                    result_3 = simplifyInContext(staticSymbol, declarationValue, depth + 1);
                                }
                                return result_3;
                            case 'class':
                                return context;
                            case 'function':
                                return context;
                            case 'new':
                            case 'call':
                                // Determine if the function is a built-in conversion
                                var target = expression['expression'];
                                if (target['module']) {
                                    staticSymbol = _this.host.findDeclaration(target['module'], target['name'], context.filePath);
                                }
                                else {
                                    staticSymbol = _this.host.getStaticSymbol(context.filePath, target['name']);
                                }
                                var converter = _this.conversionMap.get(staticSymbol);
                                if (converter) {
                                    var args = expression['arguments'];
                                    if (!args) {
                                        args = [];
                                    }
                                    return converter(context, args.map(function (arg) { return simplifyInContext(context, arg, depth + 1); }));
                                }
                                // Determine if the function is one we can simplify.
                                return simplifyCall(expression);
                            case 'error':
                                var message = produceErrorMessage(expression);
                                if (expression['line']) {
                                    message =
                                        message + " (position " + (expression['line'] + 1) + ":" + (expression['character'] + 1) + " in the original .ts file)";
                                }
                                throw new Error(message);
                        }
                        return null;
                    }
                    return mapStringMap(expression, function (value, name) { return simplify(value); });
                }
                return null;
            }
            try {
                return simplify(value);
            }
            catch (e) {
                throw new Error(e.message + ", resolving symbol " + context.name + " in " + context.filePath);
            }
        }
        var result = simplifyInContext(context, value, 0);
        if (shouldIgnore(result)) {
            return undefined;
        }
        return result;
    };
    /**
     * @param module an absolute path to a module file.
     */
    StaticReflector.prototype.getModuleMetadata = function (module) {
        var moduleMetadata = this.metadataCache.get(module);
        if (!moduleMetadata) {
            moduleMetadata = this.host.getMetadataFor(module);
            if (Array.isArray(moduleMetadata)) {
                moduleMetadata = moduleMetadata
                    .find(function (element) { return element.version === SUPPORTED_SCHEMA_VERSION; }) ||
                    moduleMetadata[0];
            }
            if (!moduleMetadata) {
                moduleMetadata =
                    { __symbolic: 'module', version: SUPPORTED_SCHEMA_VERSION, module: module, metadata: {} };
            }
            if (moduleMetadata['version'] != SUPPORTED_SCHEMA_VERSION) {
                throw new Error("Metadata version mismatch for module " + module + ", found version " + moduleMetadata['version'] + ", expected " + SUPPORTED_SCHEMA_VERSION);
            }
            this.metadataCache.set(module, moduleMetadata);
        }
        return moduleMetadata;
    };
    StaticReflector.prototype.getTypeMetadata = function (type) {
        var moduleMetadata = this.getModuleMetadata(type.filePath);
        var result = moduleMetadata['metadata'][type.name];
        if (!result) {
            result = { __symbolic: 'class' };
        }
        return result;
    };
    return StaticReflector;
}());
exports.StaticReflector = StaticReflector;
function expandedMessage(error) {
    switch (error.message) {
        case 'Reference to non-exported class':
            if (error.context && error.context.className) {
                return "Reference to a non-exported class " + error.context.className + ". Consider exporting the class";
            }
            break;
        case 'Variable not initialized':
            return 'Only initialized variables and constants can be referenced because the value of this variable is needed by the template compiler';
        case 'Destructuring not supported':
            return 'Referencing an exported destructured variable or constant is not supported by the template compiler. Consider simplifying this to avoid destructuring';
        case 'Could not resolve type':
            if (error.context && error.context.typeName) {
                return "Could not resolve type " + error.context.typeName;
            }
            break;
        case 'Function call not supported':
            var prefix = error.context && error.context.name ? "Calling function '" + error.context.name + "', f" : 'F';
            return prefix +
                'unction calls are not supported. Consider replacing the function or lambda with a reference to an exported function';
        case 'Reference to a local symbol':
            if (error.context && error.context.name) {
                return "Reference to a local (non-exported) symbol '" + error.context.name + "'. Consider exporting the symbol";
            }
    }
    return error.message;
}
function produceErrorMessage(error) {
    return "Error encountered resolving symbol values statically. " + expandedMessage(error);
}
function mapStringMap(input, transform) {
    if (!input)
        return {};
    var result = {};
    Object.keys(input).forEach(function (key) {
        var value = transform(input[key], key);
        if (!shouldIgnore(value)) {
            result[key] = value;
        }
    });
    return result;
}
function isPrimitive(o) {
    return o === null || (typeof o !== 'function' && typeof o !== 'object');
}
var BindingScope = (function () {
    function BindingScope() {
    }
    BindingScope.build = function () {
        var current = new Map();
        var parent = undefined;
        return {
            define: function (name, value) {
                current.set(name, value);
                return this;
            },
            done: function () {
                return current.size > 0 ? new PopulatedScope(current) : BindingScope.empty;
            }
        };
    };
    BindingScope.missing = {};
    BindingScope.empty = { resolve: function (name) { return BindingScope.missing; } };
    return BindingScope;
}());
var PopulatedScope = (function (_super) {
    __extends(PopulatedScope, _super);
    function PopulatedScope(bindings) {
        _super.call(this);
        this.bindings = bindings;
    }
    PopulatedScope.prototype.resolve = function (name) {
        return this.bindings.has(name) ? this.bindings.get(name) : BindingScope.missing;
    };
    return PopulatedScope;
}(BindingScope));
function sameSymbol(a, b) {
    return a === b || (a.name == b.name && a.filePath == b.filePath);
}
function shouldIgnore(value) {
    return value && value.__symbolic == 'ignore';
}
//# sourceMappingURL=static_reflector.js.map