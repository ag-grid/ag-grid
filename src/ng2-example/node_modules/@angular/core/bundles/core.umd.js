/**
 * @license Angular v2.1.2
 * (c) 2010-2016 Google, Inc. https://angular.io/
 * License: MIT
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rxjs/Subject'), require('rxjs/Observable')) :
    typeof define === 'function' && define.amd ? define(['exports', 'rxjs/Subject', 'rxjs/Observable'], factory) :
    (factory((global.ng = global.ng || {}, global.ng.core = global.ng.core || {}),global.Rx,global.Rx));
}(this, function (exports,rxjs_Subject,rxjs_Observable) { 'use strict';

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var globalScope;
    if (typeof window === 'undefined') {
        if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
            // TODO: Replace any with WorkerGlobalScope from lib.webworker.d.ts #3492
            globalScope = self;
        }
        else {
            globalScope = global;
        }
    }
    else {
        globalScope = window;
    }
    function scheduleMicroTask(fn) {
        Zone.current.scheduleMicroTask('scheduleMicrotask', fn);
    }
    // Need to declare a new variable for global here since TypeScript
    // exports the original value of the symbol.
    var global$1 = globalScope;
    function getTypeNameForDebugging(type) {
        return type['name'] || typeof type;
    }
    // TODO: remove calls to assert in production environment
    // Note: Can't just export this and import in in other files
    // as `assert` is a reserved keyword in Dart
    global$1.assert = function assert(condition) {
        // TODO: to be fixed properly via #2830, noop for now
    };
    function isPresent(obj) {
        return obj != null;
    }
    function isBlank(obj) {
        return obj == null;
    }
    function stringify(token) {
        if (typeof token === 'string') {
            return token;
        }
        if (token === undefined || token === null) {
            return '' + token;
        }
        if (token.overriddenName) {
            return token.overriddenName;
        }
        if (token.name) {
            return token.name;
        }
        var res = token.toString();
        var newLineIndex = res.indexOf('\n');
        return newLineIndex === -1 ? res : res.substring(0, newLineIndex);
    }
    // JS has NaN !== NaN
    function looseIdentical(a, b) {
        return a === b || typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b);
    }
    function isJsObject(o) {
        return o !== null && (typeof o === 'function' || typeof o === 'object');
    }
    function print(obj) {
        console.log(obj);
    }
    function warn(obj) {
        console.warn(obj);
    }
    var _symbolIterator = null;
    function getSymbolIterator() {
        if (!_symbolIterator) {
            if (globalScope.Symbol && Symbol.iterator) {
                _symbolIterator = Symbol.iterator;
            }
            else {
                // es6-shim specific logic
                var keys = Object.getOwnPropertyNames(Map.prototype);
                for (var i = 0; i < keys.length; ++i) {
                    var key = keys[i];
                    if (key !== 'entries' && key !== 'size' &&
                        Map.prototype[key] === Map.prototype['entries']) {
                        _symbolIterator = key;
                    }
                }
            }
        }
        return _symbolIterator;
    }
    function isPrimitive(obj) {
        return !isJsObject(obj);
    }

    var _nextClassId = 0;
    var Reflect = global$1.Reflect;
    function extractAnnotation(annotation) {
        if (typeof annotation === 'function' && annotation.hasOwnProperty('annotation')) {
            // it is a decorator, extract annotation
            annotation = annotation.annotation;
        }
        return annotation;
    }
    function applyParams(fnOrArray, key) {
        if (fnOrArray === Object || fnOrArray === String || fnOrArray === Function ||
            fnOrArray === Number || fnOrArray === Array) {
            throw new Error("Can not use native " + stringify(fnOrArray) + " as constructor");
        }
        if (typeof fnOrArray === 'function') {
            return fnOrArray;
        }
        if (Array.isArray(fnOrArray)) {
            var annotations = fnOrArray;
            var annoLength = annotations.length - 1;
            var fn = fnOrArray[annoLength];
            if (typeof fn !== 'function') {
                throw new Error("Last position of Class method array must be Function in key " + key + " was '" + stringify(fn) + "'");
            }
            if (annoLength != fn.length) {
                throw new Error("Number of annotations (" + annoLength + ") does not match number of arguments (" + fn.length + ") in the function: " + stringify(fn));
            }
            var paramsAnnotations = [];
            for (var i = 0, ii = annotations.length - 1; i < ii; i++) {
                var paramAnnotations = [];
                paramsAnnotations.push(paramAnnotations);
                var annotation = annotations[i];
                if (Array.isArray(annotation)) {
                    for (var j = 0; j < annotation.length; j++) {
                        paramAnnotations.push(extractAnnotation(annotation[j]));
                    }
                }
                else if (typeof annotation === 'function') {
                    paramAnnotations.push(extractAnnotation(annotation));
                }
                else {
                    paramAnnotations.push(annotation);
                }
            }
            Reflect.defineMetadata('parameters', paramsAnnotations, fn);
            return fn;
        }
        throw new Error("Only Function or Array is supported in Class definition for key '" + key + "' is '" + stringify(fnOrArray) + "'");
    }
    /**
     * Provides a way for expressing ES6 classes with parameter annotations in ES5.
     *
     * ## Basic Example
     *
     * ```
     * var Greeter = ng.Class({
     *   constructor: function(name) {
     *     this.name = name;
     *   },
     *
     *   greet: function() {
     *     alert('Hello ' + this.name + '!');
     *   }
     * });
     * ```
     *
     * is equivalent to ES6:
     *
     * ```
     * class Greeter {
     *   constructor(name) {
     *     this.name = name;
     *   }
     *
     *   greet() {
     *     alert('Hello ' + this.name + '!');
     *   }
     * }
     * ```
     *
     * or equivalent to ES5:
     *
     * ```
     * var Greeter = function (name) {
     *   this.name = name;
     * }
     *
     * Greeter.prototype.greet = function () {
     *   alert('Hello ' + this.name + '!');
     * }
     * ```
     *
     * ### Example with parameter annotations
     *
     * ```
     * var MyService = ng.Class({
     *   constructor: [String, [new Optional(), Service], function(name, myService) {
     *     ...
     *   }]
     * });
     * ```
     *
     * is equivalent to ES6:
     *
     * ```
     * class MyService {
     *   constructor(name: string, @Optional() myService: Service) {
     *     ...
     *   }
     * }
     * ```
     *
     * ### Example with inheritance
     *
     * ```
     * var Shape = ng.Class({
     *   constructor: (color) {
     *     this.color = color;
     *   }
     * });
     *
     * var Square = ng.Class({
     *   extends: Shape,
     *   constructor: function(color, size) {
     *     Shape.call(this, color);
     *     this.size = size;
     *   }
     * });
     * ```
     * @stable
     */
    function Class(clsDef) {
        var constructor = applyParams(clsDef.hasOwnProperty('constructor') ? clsDef.constructor : undefined, 'constructor');
        var proto = constructor.prototype;
        if (clsDef.hasOwnProperty('extends')) {
            if (typeof clsDef.extends === 'function') {
                constructor.prototype = proto =
                    Object.create(clsDef.extends.prototype);
            }
            else {
                throw new Error("Class definition 'extends' property must be a constructor function was: " + stringify(clsDef.extends));
            }
        }
        for (var key in clsDef) {
            if (key !== 'extends' && key !== 'prototype' && clsDef.hasOwnProperty(key)) {
                proto[key] = applyParams(clsDef[key], key);
            }
        }
        if (this && this.annotations instanceof Array) {
            Reflect.defineMetadata('annotations', this.annotations, constructor);
        }
        var constructorName = constructor['name'];
        if (!constructorName || constructorName === 'constructor') {
            constructor['overriddenName'] = "class" + _nextClassId++;
        }
        return constructor;
    }
    function makeDecorator(name, props, parentClass, chainFn) {
        if (chainFn === void 0) { chainFn = null; }
        var metaCtor = makeMetadataCtor([props]);
        function DecoratorFactory(objOrType) {
            if (!(Reflect && Reflect.getMetadata)) {
                throw 'reflect-metadata shim is required when using class decorators';
            }
            if (this instanceof DecoratorFactory) {
                metaCtor.call(this, objOrType);
                return this;
            }
            var annotationInstance = new DecoratorFactory(objOrType);
            var chainAnnotation = typeof this === 'function' && Array.isArray(this.annotations) ? this.annotations : [];
            chainAnnotation.push(annotationInstance);
            var TypeDecorator = function TypeDecorator(cls) {
                var annotations = Reflect.getOwnMetadata('annotations', cls) || [];
                annotations.push(annotationInstance);
                Reflect.defineMetadata('annotations', annotations, cls);
                return cls;
            };
            TypeDecorator.annotations = chainAnnotation;
            TypeDecorator.Class = Class;
            if (chainFn)
                chainFn(TypeDecorator);
            return TypeDecorator;
        }
        if (parentClass) {
            DecoratorFactory.prototype = Object.create(parentClass.prototype);
        }
        DecoratorFactory.prototype.toString = function () { return ("@" + name); };
        DecoratorFactory.annotationCls = DecoratorFactory;
        return DecoratorFactory;
    }
    function makeMetadataCtor(props) {
        return function ctor() {
            var _this = this;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            props.forEach(function (prop, i) {
                var argVal = args[i];
                if (Array.isArray(prop)) {
                    // plain parameter
                    _this[prop[0]] = argVal === undefined ? prop[1] : argVal;
                }
                else {
                    for (var propName in prop) {
                        _this[propName] =
                            argVal && argVal.hasOwnProperty(propName) ? argVal[propName] : prop[propName];
                    }
                }
            });
        };
    }
    function makeParamDecorator(name, props, parentClass) {
        var metaCtor = makeMetadataCtor(props);
        function ParamDecoratorFactory() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            if (this instanceof ParamDecoratorFactory) {
                metaCtor.apply(this, args);
                return this;
            }
            var annotationInstance = new ((_a = ParamDecoratorFactory).bind.apply(_a, [void 0].concat(args)))();
            ParamDecorator.annotation = annotationInstance;
            return ParamDecorator;
            function ParamDecorator(cls, unusedKey, index) {
                var parameters = Reflect.getMetadata('parameters', cls) || [];
                // there might be gaps if some in between parameters do not have annotations.
                // we pad with nulls.
                while (parameters.length <= index) {
                    parameters.push(null);
                }
                parameters[index] = parameters[index] || [];
                parameters[index].push(annotationInstance);
                Reflect.defineMetadata('parameters', parameters, cls);
                return cls;
            }
            var _a;
        }
        if (parentClass) {
            ParamDecoratorFactory.prototype = Object.create(parentClass.prototype);
        }
        ParamDecoratorFactory.prototype.toString = function () { return ("@" + name); };
        ParamDecoratorFactory.annotationCls = ParamDecoratorFactory;
        return ParamDecoratorFactory;
    }
    function makePropDecorator(name, props, parentClass) {
        var metaCtor = makeMetadataCtor(props);
        function PropDecoratorFactory() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            if (this instanceof PropDecoratorFactory) {
                metaCtor.apply(this, args);
                return this;
            }
            var decoratorInstance = new ((_a = PropDecoratorFactory).bind.apply(_a, [void 0].concat(args)))();
            return function PropDecorator(target, name) {
                var meta = Reflect.getOwnMetadata('propMetadata', target.constructor) || {};
                meta[name] = meta.hasOwnProperty(name) && meta[name] || [];
                meta[name].unshift(decoratorInstance);
                Reflect.defineMetadata('propMetadata', meta, target.constructor);
            };
            var _a;
        }
        if (parentClass) {
            PropDecoratorFactory.prototype = Object.create(parentClass.prototype);
        }
        PropDecoratorFactory.prototype.toString = function () { return ("@" + name); };
        PropDecoratorFactory.annotationCls = PropDecoratorFactory;
        return PropDecoratorFactory;
    }

    /**
     * Inject decorator and metadata.
     *
     * @stable
     * @Annotation
     */
    var Inject = makeParamDecorator('Inject', [['token', undefined]]);
    /**
     * Optional decorator and metadata.
     *
     * @stable
     * @Annotation
     */
    var Optional = makeParamDecorator('Optional', []);
    /**
     * Injectable decorator and metadata.
     *
     * @stable
     * @Annotation
     */
    var Injectable = makeParamDecorator('Injectable', []);
    /**
     * Self decorator and metadata.
     *
     * @stable
     * @Annotation
     */
    var Self = makeParamDecorator('Self', []);
    /**
     * SkipSelf decorator and metadata.
     *
     * @stable
     * @Annotation
     */
    var SkipSelf = makeParamDecorator('SkipSelf', []);
    /**
     * Host decorator and metadata.
     *
     * @stable
     * @Annotation
     */
    var Host = makeParamDecorator('Host', []);

    /**
     * Creates a token that can be used in a DI Provider.
     *
     * ### Example ([live demo](http://plnkr.co/edit/Ys9ezXpj2Mnoy3Uc8KBp?p=preview))
     *
     * ```typescript
     * var t = new OpaqueToken("value");
     *
     * var injector = Injector.resolveAndCreate([
     *   {provide: t, useValue: "bindingValue"}
     * ]);
     *
     * expect(injector.get(t)).toEqual("bindingValue");
     * ```
     *
     * Using an `OpaqueToken` is preferable to using strings as tokens because of possible collisions
     * caused by multiple providers using the same string as two different tokens.
     *
     * Using an `OpaqueToken` is preferable to using an `Object` as tokens because it provides better
     * error messages.
     * @stable
     */
    // so that metadata is gathered for this class
    var OpaqueToken = (function () {
        function OpaqueToken(_desc) {
            this._desc = _desc;
        }
        OpaqueToken.prototype.toString = function () { return "Token " + this._desc; };
        OpaqueToken.decorators = [
            { type: Injectable },
        ];
        /** @nocollapse */
        OpaqueToken.ctorParameters = [
            null,
        ];
        return OpaqueToken;
    }());

    /**
     * This token can be used to create a virtual provider that will populate the
     * `entryComponents` fields of components and ng modules based on its `useValue`.
     * All components that are referenced in the `useValue` value (either directly
     * or in a nested array or map) will be added to the `entryComponents` property.
     *
     * ### Example
     * The following example shows how the router can populate the `entryComponents`
     * field of an NgModule based on the router configuration which refers
     * to components.
     *
     * ```typescript
     * // helper function inside the router
     * function provideRoutes(routes) {
     *   return [
     *     {provide: ROUTES, useValue: routes},
     *     {provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: routes, multi: true}
     *   ];
     * }
     *
     * // user code
     * let routes = [
     *   {path: '/root', component: RootComp},
     *   {path: '/teams', component: TeamsComp}
     * ];
     *
     * @NgModule({
     *   providers: [provideRoutes(routes)]
     * })
     * class ModuleWithRoutes {}
     * ```
     *
     * @experimental
     */
    var ANALYZE_FOR_ENTRY_COMPONENTS = new OpaqueToken('AnalyzeForEntryComponents');
    /**
     * Attribute decorator and metadata.
     *
     * @stable
     * @Annotation
     */
    var Attribute = makeParamDecorator('Attribute', [['attributeName', undefined]]);
    /**
     * Base class for query metadata.
     *
     * See {@link ContentChildren}, {@link ContentChild}, {@link ViewChildren}, {@link ViewChild} for
     * more information.
     *
     * @stable
     */
    var Query = (function () {
        function Query() {
        }
        return Query;
    }());
    /**
     * ContentChildren decorator and metadata.
     *
     *  @stable
     *  @Annotation
     */
    var ContentChildren = makePropDecorator('ContentChildren', [
        ['selector', undefined], {
            first: false,
            isViewQuery: false,
            descendants: false,
            read: undefined,
        }
    ], Query);
    /**
     * @whatItDoes Configures a content query.
     *
     * @howToUse
     *
     * {@example core/di/ts/contentChild/content_child_howto.ts region='HowTo'}
     *
     * @description
     *
     * You can use ContentChild to get the first element or the directive matching the selector from the
     * content DOM. If the content DOM changes, and a new child matches the selector,
     * the property will be updated.
     *
     * Content queries are set before the `ngAfterContentInit` callback is called.
     *
     * **Metadata Properties**:
     *
     * * **selector** - the directive type or the name used for querying.
     * * **read** - read a different token from the queried element.
     *
     * Let's look at an example:
     *
     * {@example core/di/ts/contentChild/content_child_example.ts region='Component'}
     *
     * **npm package**: `@angular/core`
     *
     * @stable
     * @Annotation
     */
    var ContentChild = makePropDecorator('ContentChild', [
        ['selector', undefined], {
            first: true,
            isViewQuery: false,
            descendants: true,
            read: undefined,
        }
    ], Query);
    /**
     * @whatItDoes Configures a view query.
     *
     * @howToUse
     *
     * {@example core/di/ts/viewChildren/view_children_howto.ts region='HowTo'}
     *
     * @description
     *
     * You can use ViewChildren to get the {@link QueryList} of elements or directives from the
     * view DOM. Any time a child element is added, removed, or moved, the query list will be updated,
     * and the changes observable of the query list will emit a new value.
     *
     * View queries are set before the `ngAfterViewInit` callback is called.
     *
     * **Metadata Properties**:
     *
     * * **selector** - the directive type or the name used for querying.
     * * **read** - read a different token from the queried elements.
     *
     * Let's look at an example:
     *
     * {@example core/di/ts/viewChildren/view_children_example.ts region='Component'}
     *
     * **npm package**: `@angular/core`
     *
     * @stable
     * @Annotation
     */
    var ViewChildren = makePropDecorator('ViewChildren', [
        ['selector', undefined], {
            first: false,
            isViewQuery: true,
            descendants: true,
            read: undefined,
        }
    ], Query);
    /**
     * ViewChild decorator and metadata.
     *
     * @stable
     * @Annotation
     */
    var ViewChild = makePropDecorator('ViewChild', [
        ['selector', undefined], {
            first: true,
            isViewQuery: true,
            descendants: true,
            read: undefined,
        }
    ], Query);

    /**
     * Describes within the change detector which strategy will be used the next time change
     * detection is triggered.
     * @stable
     */
    exports.ChangeDetectionStrategy;
    (function (ChangeDetectionStrategy) {
        /**
         * `OnPush` means that the change detector's mode will be set to `CheckOnce` during hydration.
         */
        ChangeDetectionStrategy[ChangeDetectionStrategy["OnPush"] = 0] = "OnPush";
        /**
         * `Default` means that the change detector's mode will be set to `CheckAlways` during hydration.
         */
        ChangeDetectionStrategy[ChangeDetectionStrategy["Default"] = 1] = "Default";
    })(exports.ChangeDetectionStrategy || (exports.ChangeDetectionStrategy = {}));
    /**
     * Describes the status of the detector.
     */
    var ChangeDetectorStatus;
    (function (ChangeDetectorStatus) {
        /**
         * `CheckedOnce` means that after calling detectChanges the mode of the change detector
         * will become `Checked`.
         */
        ChangeDetectorStatus[ChangeDetectorStatus["CheckOnce"] = 0] = "CheckOnce";
        /**
         * `Checked` means that the change detector should be skipped until its mode changes to
         * `CheckOnce`.
         */
        ChangeDetectorStatus[ChangeDetectorStatus["Checked"] = 1] = "Checked";
        /**
         * `CheckAlways` means that after calling detectChanges the mode of the change detector
         * will remain `CheckAlways`.
         */
        ChangeDetectorStatus[ChangeDetectorStatus["CheckAlways"] = 2] = "CheckAlways";
        /**
         * `Detached` means that the change detector sub tree is not a part of the main tree and
         * should be skipped.
         */
        ChangeDetectorStatus[ChangeDetectorStatus["Detached"] = 3] = "Detached";
        /**
         * `Errored` means that the change detector encountered an error checking a binding
         * or calling a directive lifecycle method and is now in an inconsistent state. Change
         * detectors in this state will no longer detect changes.
         */
        ChangeDetectorStatus[ChangeDetectorStatus["Errored"] = 4] = "Errored";
        /**
         * `Destroyed` means that the change detector is destroyed.
         */
        ChangeDetectorStatus[ChangeDetectorStatus["Destroyed"] = 5] = "Destroyed";
    })(ChangeDetectorStatus || (ChangeDetectorStatus = {}));
    function isDefaultChangeDetectionStrategy(changeDetectionStrategy) {
        return isBlank(changeDetectionStrategy) ||
            changeDetectionStrategy === exports.ChangeDetectionStrategy.Default;
    }

    /**
     * Directive decorator and metadata.
     *
     * @stable
     * @Annotation
     */
    var Directive = makeDecorator('Directive', {
        selector: undefined,
        inputs: undefined,
        outputs: undefined,
        host: undefined,
        providers: undefined,
        exportAs: undefined,
        queries: undefined
    });
    /**
     * Component decorator and metadata.
     *
     * @stable
     * @Annotation
     */
    var Component = makeDecorator('Component', {
        selector: undefined,
        inputs: undefined,
        outputs: undefined,
        host: undefined,
        exportAs: undefined,
        moduleId: undefined,
        providers: undefined,
        viewProviders: undefined,
        changeDetection: exports.ChangeDetectionStrategy.Default,
        queries: undefined,
        templateUrl: undefined,
        template: undefined,
        styleUrls: undefined,
        styles: undefined,
        animations: undefined,
        encapsulation: undefined,
        interpolation: undefined,
        entryComponents: undefined
    }, Directive);
    /**
     * Pipe decorator and metadata.
     *
     * @stable
     * @Annotation
     */
    var Pipe = makeDecorator('Pipe', {
        name: undefined,
        pure: true,
    });
    /**
     * Input decorator and metadata.
     *
     * @stable
     * @Annotation
     */
    var Input = makePropDecorator('Input', [['bindingPropertyName', undefined]]);
    /**
     * Output decorator and metadata.
     *
     * @stable
     * @Annotation
     */
    var Output = makePropDecorator('Output', [['bindingPropertyName', undefined]]);
    /**
     * HostBinding decorator and metadata.
     *
     * @stable
     * @Annotation
     */
    var HostBinding = makePropDecorator('HostBinding', [['hostPropertyName', undefined]]);
    /**
     * HostBinding decorator and metadata.
     *
     * @stable
     * @Annotation
     */
    var HostListener = makePropDecorator('HostListener', [['eventName', undefined], ['args', []]]);

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * @stable
     */
    var LifecycleHooks;
    (function (LifecycleHooks) {
        LifecycleHooks[LifecycleHooks["OnInit"] = 0] = "OnInit";
        LifecycleHooks[LifecycleHooks["OnDestroy"] = 1] = "OnDestroy";
        LifecycleHooks[LifecycleHooks["DoCheck"] = 2] = "DoCheck";
        LifecycleHooks[LifecycleHooks["OnChanges"] = 3] = "OnChanges";
        LifecycleHooks[LifecycleHooks["AfterContentInit"] = 4] = "AfterContentInit";
        LifecycleHooks[LifecycleHooks["AfterContentChecked"] = 5] = "AfterContentChecked";
        LifecycleHooks[LifecycleHooks["AfterViewInit"] = 6] = "AfterViewInit";
        LifecycleHooks[LifecycleHooks["AfterViewChecked"] = 7] = "AfterViewChecked";
    })(LifecycleHooks || (LifecycleHooks = {}));
    var LIFECYCLE_HOOKS_VALUES = [
        LifecycleHooks.OnInit, LifecycleHooks.OnDestroy, LifecycleHooks.DoCheck, LifecycleHooks.OnChanges,
        LifecycleHooks.AfterContentInit, LifecycleHooks.AfterContentChecked, LifecycleHooks.AfterViewInit,
        LifecycleHooks.AfterViewChecked
    ];
    /**
     * @whatItDoes Lifecycle hook that is called when any data-bound property of a directive changes.
     * @howToUse
     * {@example core/ts/metadata/lifecycle_hooks_spec.ts region='OnChanges'}
     *
     * @description
     * `ngOnChanges` is called right after the data-bound properties have been checked and before view
     * and content children are checked if at least one of them has changed.
     * The `changes` parameter contains the changed properties.
     *
     * See {@linkDocs guide/lifecycle-hooks#onchanges "Lifecycle Hooks Guide"}.
     *
     * @stable
     */
    var OnChanges = (function () {
        function OnChanges() {
        }
        return OnChanges;
    }());
    /**
     * @whatItDoes Lifecycle hook that is called after data-bound properties of a directive are
     * initialized.
     * @howToUse
     * {@example core/ts/metadata/lifecycle_hooks_spec.ts region='OnInit'}
     *
     * @description
     * `ngOnInit` is called right after the directive's data-bound properties have been checked for the
     * first time, and before any of its children have been checked. It is invoked only once when the
     * directive is instantiated.
     *
     * See {@linkDocs guide/lifecycle-hooks "Lifecycle Hooks Guide"}.
     *
     * @stable
     */
    var OnInit = (function () {
        function OnInit() {
        }
        return OnInit;
    }());
    /**
     * @whatItDoes Lifecycle hook that is called when Angular dirty checks a directive.
     * @howToUse
     * {@example core/ts/metadata/lifecycle_hooks_spec.ts region='DoCheck'}
     *
     * @description
     * `ngDoCheck` gets called to check the changes in the directives in addition to the default
     * algorithm. The default change detection algorithm looks for differences by comparing
     * bound-property values by reference across change detection runs.
     *
     * Note that a directive typically should not use both `DoCheck` and {@link OnChanges} to respond to
     * changes on the same input, as `ngOnChanges` will continue to be called when the default change
     * detector detects changes.
     *
     * See {@link KeyValueDiffers} and {@link IterableDiffers} for implementing custom dirty checking
     * for collections.
     *
     * See {@linkDocs guide/lifecycle-hooks#docheck "Lifecycle Hooks Guide"}.
     *
     * @stable
     */
    var DoCheck = (function () {
        function DoCheck() {
        }
        return DoCheck;
    }());
    /**
     * @whatItDoes Lifecycle hook that is called when a directive or pipe is destroyed.
     * @howToUse
     * {@example core/ts/metadata/lifecycle_hooks_spec.ts region='OnDestroy'}
     *
     * @description
     * `ngOnDestroy` callback is typically used for any custom cleanup that needs to occur when the
     * instance is destroyed.
     *
     * See {@linkDocs guide/lifecycle-hooks "Lifecycle Hooks Guide"}.
     *
     * @stable
     */
    var OnDestroy = (function () {
        function OnDestroy() {
        }
        return OnDestroy;
    }());
    /**
     *
     * @whatItDoes Lifecycle hook that is called after a directive's content has been fully
     * initialized.
     * @howToUse
     * {@example core/ts/metadata/lifecycle_hooks_spec.ts region='AfterContentInit'}
     *
     * @description
     * See {@linkDocs guide/lifecycle-hooks#aftercontent "Lifecycle Hooks Guide"}.
     *
     * @stable
     */
    var AfterContentInit = (function () {
        function AfterContentInit() {
        }
        return AfterContentInit;
    }());
    /**
     * @whatItDoes Lifecycle hook that is called after every check of a directive's content.
     * @howToUse
     * {@example core/ts/metadata/lifecycle_hooks_spec.ts region='AfterContentChecked'}
     *
     * @description
     * See {@linkDocs guide/lifecycle-hooks#aftercontent "Lifecycle Hooks Guide"}.
     *
     * @stable
     */
    var AfterContentChecked = (function () {
        function AfterContentChecked() {
        }
        return AfterContentChecked;
    }());
    /**
     * @whatItDoes Lifecycle hook that is called after a component's view has been fully
     * initialized.
     * @howToUse
     * {@example core/ts/metadata/lifecycle_hooks_spec.ts region='AfterViewInit'}
     *
     * @description
     * See {@linkDocs guide/lifecycle-hooks#afterview "Lifecycle Hooks Guide"}.
     *
     * @stable
     */
    var AfterViewInit = (function () {
        function AfterViewInit() {
        }
        return AfterViewInit;
    }());
    /**
     * @whatItDoes Lifecycle hook that is called after every check of a component's view.
     * @howToUse
     * {@example core/ts/metadata/lifecycle_hooks_spec.ts region='AfterViewChecked'}
     *
     * @description
     * See {@linkDocs guide/lifecycle-hooks#afterview "Lifecycle Hooks Guide"}.
     *
     * @stable
     */
    var AfterViewChecked = (function () {
        function AfterViewChecked() {
        }
        return AfterViewChecked;
    }());

    /**
     * Defines a schema that will allow:
     * - any non-Angular elements with a `-` in their name,
     * - any properties on elements with a `-` in their name which is the common rule for custom
     * elements.
     *
     * @stable
     */
    var CUSTOM_ELEMENTS_SCHEMA = {
        name: 'custom-elements'
    };
    /**
     * Defines a schema that will allow any property on any element.
     *
     * @experimental
     */
    var NO_ERRORS_SCHEMA = {
        name: 'no-errors-schema'
    };
    /**
     * NgModule decorator and metadata.
     *
     * @stable
     * @Annotation
     */
    var NgModule = makeDecorator('NgModule', {
        providers: undefined,
        declarations: undefined,
        imports: undefined,
        exports: undefined,
        entryComponents: undefined,
        bootstrap: undefined,
        schemas: undefined,
        id: undefined,
    });

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Defines template and style encapsulation options available for Component's {@link Component}.
     *
     * See {@link ViewMetadata#encapsulation}.
     * @stable
     */
    exports.ViewEncapsulation;
    (function (ViewEncapsulation) {
        /**
         * Emulate `Native` scoping of styles by adding an attribute containing surrogate id to the Host
         * Element and pre-processing the style rules provided via
         * {@link ViewMetadata#styles} or {@link ViewMetadata#stylesUrls}, and adding the new Host Element
         * attribute to all selectors.
         *
         * This is the default option.
         */
        ViewEncapsulation[ViewEncapsulation["Emulated"] = 0] = "Emulated";
        /**
         * Use the native encapsulation mechanism of the renderer.
         *
         * For the DOM this means using [Shadow DOM](https://w3c.github.io/webcomponents/spec/shadow/) and
         * creating a ShadowRoot for Component's Host Element.
         */
        ViewEncapsulation[ViewEncapsulation["Native"] = 1] = "Native";
        /**
         * Don't provide any template or style encapsulation.
         */
        ViewEncapsulation[ViewEncapsulation["None"] = 2] = "None";
    })(exports.ViewEncapsulation || (exports.ViewEncapsulation = {}));
    /**
     * Metadata properties available for configuring Views.
     *
     * For details on the `@Component` annotation, see {@link Component}.
     *
     * ### Example
     *
     * ```
     * @Component({
     *   selector: 'greet',
     *   template: 'Hello {{name}}!',
     * })
     * class Greet {
     *   name: string;
     *
     *   constructor() {
     *     this.name = 'World';
     *   }
     * }
     * ```
     *
     * @deprecated Use Component instead.
     *
     * {@link Component}
     */
    var ViewMetadata = (function () {
        function ViewMetadata(_a) {
            var _b = _a === void 0 ? {} : _a, templateUrl = _b.templateUrl, template = _b.template, encapsulation = _b.encapsulation, styles = _b.styles, styleUrls = _b.styleUrls, animations = _b.animations, interpolation = _b.interpolation;
            this.templateUrl = templateUrl;
            this.template = template;
            this.styleUrls = styleUrls;
            this.styles = styles;
            this.encapsulation = encapsulation;
            this.animations = animations;
            this.interpolation = interpolation;
        }
        return ViewMetadata;
    }());

    /**
     * Allows to refer to references which are not yet defined.
     *
     * For instance, `forwardRef` is used when the `token` which we need to refer to for the purposes of
     * DI is declared,
     * but not yet defined. It is also used when the `token` which we use when creating a query is not
     * yet defined.
     *
     * ### Example
     * {@example core/di/ts/forward_ref/forward_ref_spec.ts region='forward_ref'}
     * @experimental
     */
    function forwardRef(forwardRefFn) {
        forwardRefFn.__forward_ref__ = forwardRef;
        forwardRefFn.toString = function () { return stringify(this()); };
        return forwardRefFn;
    }
    /**
     * Lazily retrieves the reference value from a forwardRef.
     *
     * Acts as the identity function when given a non-forward-ref value.
     *
     * ### Example ([live demo](http://plnkr.co/edit/GU72mJrk1fiodChcmiDR?p=preview))
     *
     * {@example core/di/ts/forward_ref/forward_ref_spec.ts region='resolve_forward_ref'}
     *
     * See: {@link forwardRef}
     * @experimental
     */
    function resolveForwardRef(type) {
        if (typeof type === 'function' && type.hasOwnProperty('__forward_ref__') &&
            type.__forward_ref__ === forwardRef) {
            return type();
        }
        else {
            return type;
        }
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    function unimplemented() {
        throw new Error('unimplemented');
    }
    /**
     * @stable
     */
    var BaseError = (function (_super) {
        __extends(BaseError, _super);
        function BaseError(message) {
            // Errors don't use current this, instead they create a new instance.
            // We have to do forward all of our api to the nativeInstance.
            var nativeError = _super.call(this, message);
            this._nativeError = nativeError;
        }
        Object.defineProperty(BaseError.prototype, "message", {
            get: function () { return this._nativeError.message; },
            set: function (message) { this._nativeError.message = message; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseError.prototype, "name", {
            get: function () { return this._nativeError.name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseError.prototype, "stack", {
            get: function () { return this._nativeError.stack; },
            set: function (value) { this._nativeError.stack = value; },
            enumerable: true,
            configurable: true
        });
        BaseError.prototype.toString = function () { return this._nativeError.toString(); };
        return BaseError;
    }(Error));
    /**
     * @stable
     */
    var WrappedError = (function (_super) {
        __extends(WrappedError, _super);
        function WrappedError(message, error) {
            _super.call(this, message + " caused by: " + (error instanceof Error ? error.message : error));
            this.originalError = error;
        }
        Object.defineProperty(WrappedError.prototype, "stack", {
            get: function () {
                return (this.originalError instanceof Error ? this.originalError : this._nativeError)
                    .stack;
            },
            enumerable: true,
            configurable: true
        });
        return WrappedError;
    }(BaseError));

    var _THROW_IF_NOT_FOUND = new Object();
    var THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;
    var _NullInjector = (function () {
        function _NullInjector() {
        }
        _NullInjector.prototype.get = function (token, notFoundValue) {
            if (notFoundValue === void 0) { notFoundValue = _THROW_IF_NOT_FOUND; }
            if (notFoundValue === _THROW_IF_NOT_FOUND) {
                throw new Error("No provider for " + stringify(token) + "!");
            }
            return notFoundValue;
        };
        return _NullInjector;
    }());
    /**
     * @whatItDoes Injector interface
     * @howToUse
     * ```
     * const injector: Injector = ...;
     * injector.get(...);
     * ```
     *
     * @description
     * For more details, see the {@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
     *
     * ### Example
     *
     * {@example core/di/ts/injector_spec.ts region='Injector'}
     *
     * `Injector` returns itself when given `Injector` as a token:
     * {@example core/di/ts/injector_spec.ts region='injectInjector'}
     *
     * @stable
     */
    var Injector = (function () {
        function Injector() {
        }
        /**
         * Retrieves an instance from the injector based on the provided token.
         * If not found:
         * - Throws {@link NoProviderError} if no `notFoundValue` that is not equal to
         * Injector.THROW_IF_NOT_FOUND is given
         * - Returns the `notFoundValue` otherwise
         */
        Injector.prototype.get = function (token, notFoundValue) { return unimplemented(); };
        Injector.THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;
        Injector.NULL = new _NullInjector();
        return Injector;
    }());

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var __extends$1 = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    function findFirstClosedCycle(keys) {
        var res = [];
        for (var i = 0; i < keys.length; ++i) {
            if (res.indexOf(keys[i]) > -1) {
                res.push(keys[i]);
                return res;
            }
            res.push(keys[i]);
        }
        return res;
    }
    function constructResolvingPath(keys) {
        if (keys.length > 1) {
            var reversed = findFirstClosedCycle(keys.slice().reverse());
            var tokenStrs = reversed.map(function (k) { return stringify(k.token); });
            return ' (' + tokenStrs.join(' -> ') + ')';
        }
        return '';
    }
    /**
     * Base class for all errors arising from misconfigured providers.
     * @stable
     */
    var AbstractProviderError = (function (_super) {
        __extends$1(AbstractProviderError, _super);
        function AbstractProviderError(injector, key, constructResolvingMessage) {
            _super.call(this, 'DI Error');
            this.keys = [key];
            this.injectors = [injector];
            this.constructResolvingMessage = constructResolvingMessage;
            this.message = this.constructResolvingMessage(this.keys);
        }
        AbstractProviderError.prototype.addKey = function (injector, key) {
            this.injectors.push(injector);
            this.keys.push(key);
            this.message = this.constructResolvingMessage(this.keys);
        };
        return AbstractProviderError;
    }(BaseError));
    /**
     * Thrown when trying to retrieve a dependency by key from {@link Injector}, but the
     * {@link Injector} does not have a {@link Provider} for the given key.
     *
     * ### Example ([live demo](http://plnkr.co/edit/vq8D3FRB9aGbnWJqtEPE?p=preview))
     *
     * ```typescript
     * class A {
     *   constructor(b:B) {}
     * }
     *
     * expect(() => Injector.resolveAndCreate([A])).toThrowError();
     * ```
     * @stable
     */
    var NoProviderError = (function (_super) {
        __extends$1(NoProviderError, _super);
        function NoProviderError(injector, key) {
            _super.call(this, injector, key, function (keys) {
                var first = stringify(keys[0].token);
                return "No provider for " + first + "!" + constructResolvingPath(keys);
            });
        }
        return NoProviderError;
    }(AbstractProviderError));
    /**
     * Thrown when dependencies form a cycle.
     *
     * ### Example ([live demo](http://plnkr.co/edit/wYQdNos0Tzql3ei1EV9j?p=info))
     *
     * ```typescript
     * var injector = Injector.resolveAndCreate([
     *   {provide: "one", useFactory: (two) => "two", deps: [[new Inject("two")]]},
     *   {provide: "two", useFactory: (one) => "one", deps: [[new Inject("one")]]}
     * ]);
     *
     * expect(() => injector.get("one")).toThrowError();
     * ```
     *
     * Retrieving `A` or `B` throws a `CyclicDependencyError` as the graph above cannot be constructed.
     * @stable
     */
    var CyclicDependencyError = (function (_super) {
        __extends$1(CyclicDependencyError, _super);
        function CyclicDependencyError(injector, key) {
            _super.call(this, injector, key, function (keys) {
                return "Cannot instantiate cyclic dependency!" + constructResolvingPath(keys);
            });
        }
        return CyclicDependencyError;
    }(AbstractProviderError));
    /**
     * Thrown when a constructing type returns with an Error.
     *
     * The `InstantiationError` class contains the original error plus the dependency graph which caused
     * this object to be instantiated.
     *
     * ### Example ([live demo](http://plnkr.co/edit/7aWYdcqTQsP0eNqEdUAf?p=preview))
     *
     * ```typescript
     * class A {
     *   constructor() {
     *     throw new Error('message');
     *   }
     * }
     *
     * var injector = Injector.resolveAndCreate([A]);

     * try {
     *   injector.get(A);
     * } catch (e) {
     *   expect(e instanceof InstantiationError).toBe(true);
     *   expect(e.originalException.message).toEqual("message");
     *   expect(e.originalStack).toBeDefined();
     * }
     * ```
     * @stable
     */
    var InstantiationError = (function (_super) {
        __extends$1(InstantiationError, _super);
        function InstantiationError(injector, originalException, originalStack, key) {
            _super.call(this, 'DI Error', originalException);
            this.keys = [key];
            this.injectors = [injector];
        }
        InstantiationError.prototype.addKey = function (injector, key) {
            this.injectors.push(injector);
            this.keys.push(key);
        };
        Object.defineProperty(InstantiationError.prototype, "message", {
            get: function () {
                var first = stringify(this.keys[0].token);
                return this.originalError.message + ": Error during instantiation of " + first + "!" + constructResolvingPath(this.keys) + ".";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InstantiationError.prototype, "causeKey", {
            get: function () { return this.keys[0]; },
            enumerable: true,
            configurable: true
        });
        return InstantiationError;
    }(WrappedError));
    /**
     * Thrown when an object other then {@link Provider} (or `Type`) is passed to {@link Injector}
     * creation.
     *
     * ### Example ([live demo](http://plnkr.co/edit/YatCFbPAMCL0JSSQ4mvH?p=preview))
     *
     * ```typescript
     * expect(() => Injector.resolveAndCreate(["not a type"])).toThrowError();
     * ```
     * @stable
     */
    var InvalidProviderError = (function (_super) {
        __extends$1(InvalidProviderError, _super);
        function InvalidProviderError(provider) {
            _super.call(this, "Invalid provider - only instances of Provider and Type are allowed, got: " + provider);
        }
        return InvalidProviderError;
    }(BaseError));
    /**
     * Thrown when the class has no annotation information.
     *
     * Lack of annotation information prevents the {@link Injector} from determining which dependencies
     * need to be injected into the constructor.
     *
     * ### Example ([live demo](http://plnkr.co/edit/rHnZtlNS7vJOPQ6pcVkm?p=preview))
     *
     * ```typescript
     * class A {
     *   constructor(b) {}
     * }
     *
     * expect(() => Injector.resolveAndCreate([A])).toThrowError();
     * ```
     *
     * This error is also thrown when the class not marked with {@link Injectable} has parameter types.
     *
     * ```typescript
     * class B {}
     *
     * class A {
     *   constructor(b:B) {} // no information about the parameter types of A is available at runtime.
     * }
     *
     * expect(() => Injector.resolveAndCreate([A,B])).toThrowError();
     * ```
     * @stable
     */
    var NoAnnotationError = (function (_super) {
        __extends$1(NoAnnotationError, _super);
        function NoAnnotationError(typeOrFunc, params) {
            _super.call(this, NoAnnotationError._genMessage(typeOrFunc, params));
        }
        NoAnnotationError._genMessage = function (typeOrFunc, params) {
            var signature = [];
            for (var i = 0, ii = params.length; i < ii; i++) {
                var parameter = params[i];
                if (!parameter || parameter.length == 0) {
                    signature.push('?');
                }
                else {
                    signature.push(parameter.map(stringify).join(' '));
                }
            }
            return 'Cannot resolve all parameters for \'' + stringify(typeOrFunc) + '\'(' +
                signature.join(', ') + '). ' +
                'Make sure that all the parameters are decorated with Inject or have valid type annotations and that \'' +
                stringify(typeOrFunc) + '\' is decorated with Injectable.';
        };
        return NoAnnotationError;
    }(BaseError));
    /**
     * Thrown when getting an object by index.
     *
     * ### Example ([live demo](http://plnkr.co/edit/bRs0SX2OTQiJzqvjgl8P?p=preview))
     *
     * ```typescript
     * class A {}
     *
     * var injector = Injector.resolveAndCreate([A]);
     *
     * expect(() => injector.getAt(100)).toThrowError();
     * ```
     * @stable
     */
    var OutOfBoundsError = (function (_super) {
        __extends$1(OutOfBoundsError, _super);
        function OutOfBoundsError(index) {
            _super.call(this, "Index " + index + " is out-of-bounds.");
        }
        return OutOfBoundsError;
    }(BaseError));
    // TODO: add a working example after alpha38 is released
    /**
     * Thrown when a multi provider and a regular provider are bound to the same token.
     *
     * ### Example
     *
     * ```typescript
     * expect(() => Injector.resolveAndCreate([
     *   { provide: "Strings", useValue: "string1", multi: true},
     *   { provide: "Strings", useValue: "string2", multi: false}
     * ])).toThrowError();
     * ```
     */
    var MixingMultiProvidersWithRegularProvidersError = (function (_super) {
        __extends$1(MixingMultiProvidersWithRegularProvidersError, _super);
        function MixingMultiProvidersWithRegularProvidersError(provider1, provider2) {
            _super.call(this, 'Cannot mix multi providers and regular providers, got: ' + provider1.toString() + ' ' +
                provider2.toString());
        }
        return MixingMultiProvidersWithRegularProvidersError;
    }(BaseError));

    /**
     * A unique object used for retrieving items from the {@link ReflectiveInjector}.
     *
     * Keys have:
     * - a system-wide unique `id`.
     * - a `token`.
     *
     * `Key` is used internally by {@link ReflectiveInjector} because its system-wide unique `id` allows
     * the
     * injector to store created objects in a more efficient way.
     *
     * `Key` should not be created directly. {@link ReflectiveInjector} creates keys automatically when
     * resolving
     * providers.
     * @experimental
     */
    var ReflectiveKey = (function () {
        /**
         * Private
         */
        function ReflectiveKey(token, id) {
            this.token = token;
            this.id = id;
            if (!token) {
                throw new Error('Token must be defined!');
            }
        }
        Object.defineProperty(ReflectiveKey.prototype, "displayName", {
            /**
             * Returns a stringified token.
             */
            get: function () { return stringify(this.token); },
            enumerable: true,
            configurable: true
        });
        /**
         * Retrieves a `Key` for a token.
         */
        ReflectiveKey.get = function (token) {
            return _globalKeyRegistry.get(resolveForwardRef(token));
        };
        Object.defineProperty(ReflectiveKey, "numberOfKeys", {
            /**
             * @returns the number of keys registered in the system.
             */
            get: function () { return _globalKeyRegistry.numberOfKeys; },
            enumerable: true,
            configurable: true
        });
        return ReflectiveKey;
    }());
    /**
     * @internal
     */
    var KeyRegistry = (function () {
        function KeyRegistry() {
            this._allKeys = new Map();
        }
        KeyRegistry.prototype.get = function (token) {
            if (token instanceof ReflectiveKey)
                return token;
            if (this._allKeys.has(token)) {
                return this._allKeys.get(token);
            }
            var newKey = new ReflectiveKey(token, ReflectiveKey.numberOfKeys);
            this._allKeys.set(token, newKey);
            return newKey;
        };
        Object.defineProperty(KeyRegistry.prototype, "numberOfKeys", {
            get: function () { return this._allKeys.size; },
            enumerable: true,
            configurable: true
        });
        return KeyRegistry;
    }());
    var _globalKeyRegistry = new KeyRegistry();

    // Safari doesn't implement MapIterator.next(), which is used is Traceur's polyfill of Array.from
    // TODO(mlaval): remove the work around once we have a working polyfill of Array.from
    var _arrayFromMap = (function () {
        try {
            if ((new Map()).values().next) {
                return function createArrayFromMap(m, getValues) {
                    return getValues ? Array.from(m.values()) : Array.from(m.keys());
                };
            }
        }
        catch (e) {
        }
        return function createArrayFromMapWithForeach(m, getValues) {
            var res = new Array(m.size), i = 0;
            m.forEach(function (v, k) {
                res[i] = getValues ? v : k;
                i++;
            });
            return res;
        };
    })();
    var MapWrapper = (function () {
        function MapWrapper() {
        }
        MapWrapper.createFromStringMap = function (stringMap) {
            var result = new Map();
            for (var prop in stringMap) {
                result.set(prop, stringMap[prop]);
            }
            return result;
        };
        MapWrapper.keys = function (m) { return _arrayFromMap(m, false); };
        MapWrapper.values = function (m) { return _arrayFromMap(m, true); };
        return MapWrapper;
    }());
    /**
     * Wraps Javascript Objects
     */
    var StringMapWrapper = (function () {
        function StringMapWrapper() {
        }
        StringMapWrapper.merge = function (m1, m2) {
            var m = {};
            for (var _i = 0, _a = Object.keys(m1); _i < _a.length; _i++) {
                var k = _a[_i];
                m[k] = m1[k];
            }
            for (var _b = 0, _c = Object.keys(m2); _b < _c.length; _b++) {
                var k = _c[_b];
                m[k] = m2[k];
            }
            return m;
        };
        StringMapWrapper.equals = function (m1, m2) {
            var k1 = Object.keys(m1);
            var k2 = Object.keys(m2);
            if (k1.length != k2.length) {
                return false;
            }
            for (var i = 0; i < k1.length; i++) {
                var key = k1[i];
                if (m1[key] !== m2[key]) {
                    return false;
                }
            }
            return true;
        };
        return StringMapWrapper;
    }());
    var ListWrapper = (function () {
        function ListWrapper() {
        }
        ListWrapper.removeAll = function (list, items) {
            for (var i = 0; i < items.length; ++i) {
                var index = list.indexOf(items[i]);
                list.splice(index, 1);
            }
        };
        ListWrapper.remove = function (list, el) {
            var index = list.indexOf(el);
            if (index > -1) {
                list.splice(index, 1);
                return true;
            }
            return false;
        };
        ListWrapper.equals = function (a, b) {
            if (a.length != b.length)
                return false;
            for (var i = 0; i < a.length; ++i) {
                if (a[i] !== b[i])
                    return false;
            }
            return true;
        };
        ListWrapper.maximum = function (list, predicate) {
            if (list.length == 0) {
                return null;
            }
            var solution = null;
            var maxValue = -Infinity;
            for (var index = 0; index < list.length; index++) {
                var candidate = list[index];
                if (candidate == null) {
                    continue;
                }
                var candidateValue = predicate(candidate);
                if (candidateValue > maxValue) {
                    solution = candidate;
                    maxValue = candidateValue;
                }
            }
            return solution;
        };
        ListWrapper.flatten = function (list) {
            var target = [];
            _flattenArray(list, target);
            return target;
        };
        return ListWrapper;
    }());
    function _flattenArray(source, target) {
        if (isPresent(source)) {
            for (var i = 0; i < source.length; i++) {
                var item = source[i];
                if (Array.isArray(item)) {
                    _flattenArray(item, target);
                }
                else {
                    target.push(item);
                }
            }
        }
        return target;
    }
    function isListLikeIterable(obj) {
        if (!isJsObject(obj))
            return false;
        return Array.isArray(obj) ||
            (!(obj instanceof Map) &&
                getSymbolIterator() in obj); // JS Iterable have a Symbol.iterator prop
    }
    function areIterablesEqual(a, b, comparator) {
        var iterator1 = a[getSymbolIterator()]();
        var iterator2 = b[getSymbolIterator()]();
        while (true) {
            var item1 = iterator1.next();
            var item2 = iterator2.next();
            if (item1.done && item2.done)
                return true;
            if (item1.done || item2.done)
                return false;
            if (!comparator(item1.value, item2.value))
                return false;
        }
    }
    function iterateListLike(obj, fn) {
        if (Array.isArray(obj)) {
            for (var i = 0; i < obj.length; i++) {
                fn(obj[i]);
            }
        }
        else {
            var iterator = obj[getSymbolIterator()]();
            var item = void 0;
            while (!((item = iterator.next()).done)) {
                fn(item.value);
            }
        }
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * @whatItDoes Represents a type that a Component or other object is instances of.
     *
     * @description
     *
     * An example of a `Type` is `MyCustomComponent` class, which in JavaScript is be represented by
     * the `MyCustomComponent` constructor function.
     *
     * @stable
     */
    var Type = Function;

    var ReflectionCapabilities = (function () {
        function ReflectionCapabilities(reflect) {
            this._reflect = reflect || global$1.Reflect;
        }
        ReflectionCapabilities.prototype.isReflectionEnabled = function () { return true; };
        ReflectionCapabilities.prototype.factory = function (t) { return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            return new (t.bind.apply(t, [void 0].concat(args)))();
        }; };
        /** @internal */
        ReflectionCapabilities.prototype._zipTypesAndAnnotations = function (paramTypes, paramAnnotations) {
            var result;
            if (typeof paramTypes === 'undefined') {
                result = new Array(paramAnnotations.length);
            }
            else {
                result = new Array(paramTypes.length);
            }
            for (var i = 0; i < result.length; i++) {
                // TS outputs Object for parameters without types, while Traceur omits
                // the annotations. For now we preserve the Traceur behavior to aid
                // migration, but this can be revisited.
                if (typeof paramTypes === 'undefined') {
                    result[i] = [];
                }
                else if (paramTypes[i] != Object) {
                    result[i] = [paramTypes[i]];
                }
                else {
                    result[i] = [];
                }
                if (paramAnnotations && isPresent(paramAnnotations[i])) {
                    result[i] = result[i].concat(paramAnnotations[i]);
                }
            }
            return result;
        };
        ReflectionCapabilities.prototype.parameters = function (type) {
            // Prefer the direct API.
            if (type.parameters) {
                return type.parameters;
            }
            // API of tsickle for lowering decorators to properties on the class.
            if (type.ctorParameters) {
                var ctorParameters = type.ctorParameters;
                var paramTypes = ctorParameters.map(function (ctorParam) { return ctorParam && ctorParam.type; });
                var paramAnnotations = ctorParameters.map(function (ctorParam) {
                    return ctorParam && convertTsickleDecoratorIntoMetadata(ctorParam.decorators);
                });
                return this._zipTypesAndAnnotations(paramTypes, paramAnnotations);
            }
            // API for metadata created by invoking the decorators.
            if (isPresent(this._reflect) && isPresent(this._reflect.getMetadata)) {
                var paramAnnotations = this._reflect.getMetadata('parameters', type);
                var paramTypes = this._reflect.getMetadata('design:paramtypes', type);
                if (paramTypes || paramAnnotations) {
                    return this._zipTypesAndAnnotations(paramTypes, paramAnnotations);
                }
            }
            // The array has to be filled with `undefined` because holes would be skipped by `some`
            return new Array(type.length).fill(undefined);
        };
        ReflectionCapabilities.prototype.annotations = function (typeOrFunc) {
            // Prefer the direct API.
            if (typeOrFunc.annotations) {
                var annotations = typeOrFunc.annotations;
                if (typeof annotations === 'function' && annotations.annotations) {
                    annotations = annotations.annotations;
                }
                return annotations;
            }
            // API of tsickle for lowering decorators to properties on the class.
            if (typeOrFunc.decorators) {
                return convertTsickleDecoratorIntoMetadata(typeOrFunc.decorators);
            }
            // API for metadata created by invoking the decorators.
            if (this._reflect && this._reflect.getMetadata) {
                var annotations = this._reflect.getMetadata('annotations', typeOrFunc);
                if (annotations)
                    return annotations;
            }
            return [];
        };
        ReflectionCapabilities.prototype.propMetadata = function (typeOrFunc) {
            // Prefer the direct API.
            if (typeOrFunc.propMetadata) {
                var propMetadata = typeOrFunc.propMetadata;
                if (typeof propMetadata === 'function' && propMetadata.propMetadata) {
                    propMetadata = propMetadata.propMetadata;
                }
                return propMetadata;
            }
            // API of tsickle for lowering decorators to properties on the class.
            if (typeOrFunc.propDecorators) {
                var propDecorators_1 = typeOrFunc.propDecorators;
                var propMetadata_1 = {};
                Object.keys(propDecorators_1).forEach(function (prop) {
                    propMetadata_1[prop] = convertTsickleDecoratorIntoMetadata(propDecorators_1[prop]);
                });
                return propMetadata_1;
            }
            // API for metadata created by invoking the decorators.
            if (this._reflect && this._reflect.getMetadata) {
                var propMetadata = this._reflect.getMetadata('propMetadata', typeOrFunc);
                if (propMetadata)
                    return propMetadata;
            }
            return {};
        };
        ReflectionCapabilities.prototype.hasLifecycleHook = function (type, lcProperty) {
            return type instanceof Type && lcProperty in type.prototype;
        };
        ReflectionCapabilities.prototype.getter = function (name) { return new Function('o', 'return o.' + name + ';'); };
        ReflectionCapabilities.prototype.setter = function (name) {
            return new Function('o', 'v', 'return o.' + name + ' = v;');
        };
        ReflectionCapabilities.prototype.method = function (name) {
            var functionBody = "if (!o." + name + ") throw new Error('\"" + name + "\" is undefined');\n        return o." + name + ".apply(o, args);";
            return new Function('o', 'args', functionBody);
        };
        // There is not a concept of import uri in Js, but this is useful in developing Dart applications.
        ReflectionCapabilities.prototype.importUri = function (type) {
            // StaticSymbol
            if (typeof type === 'object' && type['filePath']) {
                return type['filePath'];
            }
            // Runtime type
            return "./" + stringify(type);
        };
        ReflectionCapabilities.prototype.resolveIdentifier = function (name, moduleUrl, runtime) { return runtime; };
        ReflectionCapabilities.prototype.resolveEnum = function (enumIdentifier, name) { return enumIdentifier[name]; };
        return ReflectionCapabilities;
    }());
    function convertTsickleDecoratorIntoMetadata(decoratorInvocations) {
        if (!decoratorInvocations) {
            return [];
        }
        return decoratorInvocations.map(function (decoratorInvocation) {
            var decoratorType = decoratorInvocation.type;
            var annotationCls = decoratorType.annotationCls;
            var annotationArgs = decoratorInvocation.args ? decoratorInvocation.args : [];
            return new (annotationCls.bind.apply(annotationCls, [void 0].concat(annotationArgs)))();
        });
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Provides read-only access to reflection data about symbols. Used internally by Angular
     * to power dependency injection and compilation.
     */
    var ReflectorReader = (function () {
        function ReflectorReader() {
        }
        return ReflectorReader;
    }());

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var __extends$2 = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    /**
     * Provides access to reflection data about symbols. Used internally by Angular
     * to power dependency injection and compilation.
     */
    var Reflector = (function (_super) {
        __extends$2(Reflector, _super);
        function Reflector(reflectionCapabilities) {
            _super.call(this);
            this.reflectionCapabilities = reflectionCapabilities;
        }
        Reflector.prototype.updateCapabilities = function (caps) { this.reflectionCapabilities = caps; };
        Reflector.prototype.factory = function (type) { return this.reflectionCapabilities.factory(type); };
        Reflector.prototype.parameters = function (typeOrFunc) {
            return this.reflectionCapabilities.parameters(typeOrFunc);
        };
        Reflector.prototype.annotations = function (typeOrFunc) {
            return this.reflectionCapabilities.annotations(typeOrFunc);
        };
        Reflector.prototype.propMetadata = function (typeOrFunc) {
            return this.reflectionCapabilities.propMetadata(typeOrFunc);
        };
        Reflector.prototype.hasLifecycleHook = function (type, lcProperty) {
            return this.reflectionCapabilities.hasLifecycleHook(type, lcProperty);
        };
        Reflector.prototype.getter = function (name) { return this.reflectionCapabilities.getter(name); };
        Reflector.prototype.setter = function (name) { return this.reflectionCapabilities.setter(name); };
        Reflector.prototype.method = function (name) { return this.reflectionCapabilities.method(name); };
        Reflector.prototype.importUri = function (type) { return this.reflectionCapabilities.importUri(type); };
        Reflector.prototype.resolveIdentifier = function (name, moduleUrl, runtime) {
            return this.reflectionCapabilities.resolveIdentifier(name, moduleUrl, runtime);
        };
        Reflector.prototype.resolveEnum = function (identifier, name) {
            return this.reflectionCapabilities.resolveEnum(identifier, name);
        };
        return Reflector;
    }(ReflectorReader));

    /**
     * The {@link Reflector} used internally in Angular to access metadata
     * about symbols.
     */
    var reflector = new Reflector(new ReflectionCapabilities());

    /**
     * `Dependency` is used by the framework to extend DI.
     * This is internal to Angular and should not be used directly.
     */
    var ReflectiveDependency = (function () {
        function ReflectiveDependency(key, optional, lowerBoundVisibility, upperBoundVisibility, properties) {
            this.key = key;
            this.optional = optional;
            this.lowerBoundVisibility = lowerBoundVisibility;
            this.upperBoundVisibility = upperBoundVisibility;
            this.properties = properties;
        }
        ReflectiveDependency.fromKey = function (key) {
            return new ReflectiveDependency(key, false, null, null, []);
        };
        return ReflectiveDependency;
    }());
    var _EMPTY_LIST = [];
    var ResolvedReflectiveProvider_ = (function () {
        function ResolvedReflectiveProvider_(key, resolvedFactories, multiProvider) {
            this.key = key;
            this.resolvedFactories = resolvedFactories;
            this.multiProvider = multiProvider;
        }
        Object.defineProperty(ResolvedReflectiveProvider_.prototype, "resolvedFactory", {
            get: function () { return this.resolvedFactories[0]; },
            enumerable: true,
            configurable: true
        });
        return ResolvedReflectiveProvider_;
    }());
    /**
     * An internal resolved representation of a factory function created by resolving {@link
     * Provider}.
     * @experimental
     */
    var ResolvedReflectiveFactory = (function () {
        function ResolvedReflectiveFactory(
            /**
             * Factory function which can return an instance of an object represented by a key.
             */
            factory,
            /**
             * Arguments (dependencies) to the `factory` function.
             */
            dependencies) {
            this.factory = factory;
            this.dependencies = dependencies;
        }
        return ResolvedReflectiveFactory;
    }());
    /**
     * Resolve a single provider.
     */
    function resolveReflectiveFactory(provider) {
        var factoryFn;
        var resolvedDeps;
        if (isPresent(provider.useClass)) {
            var useClass = resolveForwardRef(provider.useClass);
            factoryFn = reflector.factory(useClass);
            resolvedDeps = _dependenciesFor(useClass);
        }
        else if (isPresent(provider.useExisting)) {
            factoryFn = function (aliasInstance) { return aliasInstance; };
            resolvedDeps = [ReflectiveDependency.fromKey(ReflectiveKey.get(provider.useExisting))];
        }
        else if (isPresent(provider.useFactory)) {
            factoryFn = provider.useFactory;
            resolvedDeps = constructDependencies(provider.useFactory, provider.deps);
        }
        else {
            factoryFn = function () { return provider.useValue; };
            resolvedDeps = _EMPTY_LIST;
        }
        return new ResolvedReflectiveFactory(factoryFn, resolvedDeps);
    }
    /**
     * Converts the {@link Provider} into {@link ResolvedProvider}.
     *
     * {@link Injector} internally only uses {@link ResolvedProvider}, {@link Provider} contains
     * convenience provider syntax.
     */
    function resolveReflectiveProvider(provider) {
        return new ResolvedReflectiveProvider_(ReflectiveKey.get(provider.provide), [resolveReflectiveFactory(provider)], provider.multi);
    }
    /**
     * Resolve a list of Providers.
     */
    function resolveReflectiveProviders(providers) {
        var normalized = _normalizeProviders(providers, []);
        var resolved = normalized.map(resolveReflectiveProvider);
        return MapWrapper.values(mergeResolvedReflectiveProviders(resolved, new Map()));
    }
    /**
     * Merges a list of ResolvedProviders into a list where
     * each key is contained exactly once and multi providers
     * have been merged.
     */
    function mergeResolvedReflectiveProviders(providers, normalizedProvidersMap) {
        for (var i = 0; i < providers.length; i++) {
            var provider = providers[i];
            var existing = normalizedProvidersMap.get(provider.key.id);
            if (isPresent(existing)) {
                if (provider.multiProvider !== existing.multiProvider) {
                    throw new MixingMultiProvidersWithRegularProvidersError(existing, provider);
                }
                if (provider.multiProvider) {
                    for (var j = 0; j < provider.resolvedFactories.length; j++) {
                        existing.resolvedFactories.push(provider.resolvedFactories[j]);
                    }
                }
                else {
                    normalizedProvidersMap.set(provider.key.id, provider);
                }
            }
            else {
                var resolvedProvider;
                if (provider.multiProvider) {
                    resolvedProvider = new ResolvedReflectiveProvider_(provider.key, provider.resolvedFactories.slice(), provider.multiProvider);
                }
                else {
                    resolvedProvider = provider;
                }
                normalizedProvidersMap.set(provider.key.id, resolvedProvider);
            }
        }
        return normalizedProvidersMap;
    }
    function _normalizeProviders(providers, res) {
        providers.forEach(function (b) {
            if (b instanceof Type) {
                res.push({ provide: b, useClass: b });
            }
            else if (b && typeof b == 'object' && b.provide !== undefined) {
                res.push(b);
            }
            else if (b instanceof Array) {
                _normalizeProviders(b, res);
            }
            else {
                throw new InvalidProviderError(b);
            }
        });
        return res;
    }
    function constructDependencies(typeOrFunc, dependencies) {
        if (!dependencies) {
            return _dependenciesFor(typeOrFunc);
        }
        else {
            var params = dependencies.map(function (t) { return [t]; });
            return dependencies.map(function (t) { return _extractToken(typeOrFunc, t, params); });
        }
    }
    function _dependenciesFor(typeOrFunc) {
        var params = reflector.parameters(typeOrFunc);
        if (!params)
            return [];
        if (params.some(isBlank)) {
            throw new NoAnnotationError(typeOrFunc, params);
        }
        return params.map(function (p) { return _extractToken(typeOrFunc, p, params); });
    }
    function _extractToken(typeOrFunc /** TODO #9100 */, metadata /** TODO #9100 */ /*any[] | any*/, params) {
        var depProps = [];
        var token = null;
        var optional = false;
        if (!Array.isArray(metadata)) {
            if (metadata instanceof Inject) {
                return _createDependency(metadata.token, optional, null, null, depProps);
            }
            else {
                return _createDependency(metadata, optional, null, null, depProps);
            }
        }
        var lowerBoundVisibility = null;
        var upperBoundVisibility = null;
        for (var i = 0; i < metadata.length; ++i) {
            var paramMetadata = metadata[i];
            if (paramMetadata instanceof Type) {
                token = paramMetadata;
            }
            else if (paramMetadata instanceof Inject) {
                token = paramMetadata.token;
            }
            else if (paramMetadata instanceof Optional) {
                optional = true;
            }
            else if (paramMetadata instanceof Self) {
                upperBoundVisibility = paramMetadata;
            }
            else if (paramMetadata instanceof Host) {
                upperBoundVisibility = paramMetadata;
            }
            else if (paramMetadata instanceof SkipSelf) {
                lowerBoundVisibility = paramMetadata;
            }
        }
        token = resolveForwardRef(token);
        if (isPresent(token)) {
            return _createDependency(token, optional, lowerBoundVisibility, upperBoundVisibility, depProps);
        }
        else {
            throw new NoAnnotationError(typeOrFunc, params);
        }
    }
    function _createDependency(token /** TODO #9100 */, optional /** TODO #9100 */, lowerBoundVisibility /** TODO #9100 */, upperBoundVisibility /** TODO #9100 */, depProps /** TODO #9100 */) {
        return new ReflectiveDependency(ReflectiveKey.get(token), optional, lowerBoundVisibility, upperBoundVisibility, depProps);
    }

    // Threshold for the dynamic version
    var _MAX_CONSTRUCTION_COUNTER = 10;
    var UNDEFINED = new Object();
    var ReflectiveProtoInjectorInlineStrategy = (function () {
        function ReflectiveProtoInjectorInlineStrategy(protoEI, providers) {
            this.provider0 = null;
            this.provider1 = null;
            this.provider2 = null;
            this.provider3 = null;
            this.provider4 = null;
            this.provider5 = null;
            this.provider6 = null;
            this.provider7 = null;
            this.provider8 = null;
            this.provider9 = null;
            this.keyId0 = null;
            this.keyId1 = null;
            this.keyId2 = null;
            this.keyId3 = null;
            this.keyId4 = null;
            this.keyId5 = null;
            this.keyId6 = null;
            this.keyId7 = null;
            this.keyId8 = null;
            this.keyId9 = null;
            var length = providers.length;
            if (length > 0) {
                this.provider0 = providers[0];
                this.keyId0 = providers[0].key.id;
            }
            if (length > 1) {
                this.provider1 = providers[1];
                this.keyId1 = providers[1].key.id;
            }
            if (length > 2) {
                this.provider2 = providers[2];
                this.keyId2 = providers[2].key.id;
            }
            if (length > 3) {
                this.provider3 = providers[3];
                this.keyId3 = providers[3].key.id;
            }
            if (length > 4) {
                this.provider4 = providers[4];
                this.keyId4 = providers[4].key.id;
            }
            if (length > 5) {
                this.provider5 = providers[5];
                this.keyId5 = providers[5].key.id;
            }
            if (length > 6) {
                this.provider6 = providers[6];
                this.keyId6 = providers[6].key.id;
            }
            if (length > 7) {
                this.provider7 = providers[7];
                this.keyId7 = providers[7].key.id;
            }
            if (length > 8) {
                this.provider8 = providers[8];
                this.keyId8 = providers[8].key.id;
            }
            if (length > 9) {
                this.provider9 = providers[9];
                this.keyId9 = providers[9].key.id;
            }
        }
        ReflectiveProtoInjectorInlineStrategy.prototype.getProviderAtIndex = function (index) {
            if (index == 0)
                return this.provider0;
            if (index == 1)
                return this.provider1;
            if (index == 2)
                return this.provider2;
            if (index == 3)
                return this.provider3;
            if (index == 4)
                return this.provider4;
            if (index == 5)
                return this.provider5;
            if (index == 6)
                return this.provider6;
            if (index == 7)
                return this.provider7;
            if (index == 8)
                return this.provider8;
            if (index == 9)
                return this.provider9;
            throw new OutOfBoundsError(index);
        };
        ReflectiveProtoInjectorInlineStrategy.prototype.createInjectorStrategy = function (injector) {
            return new ReflectiveInjectorInlineStrategy(injector, this);
        };
        return ReflectiveProtoInjectorInlineStrategy;
    }());
    var ReflectiveProtoInjectorDynamicStrategy = (function () {
        function ReflectiveProtoInjectorDynamicStrategy(protoInj, providers) {
            this.providers = providers;
            var len = providers.length;
            this.keyIds = new Array(len);
            for (var i = 0; i < len; i++) {
                this.keyIds[i] = providers[i].key.id;
            }
        }
        ReflectiveProtoInjectorDynamicStrategy.prototype.getProviderAtIndex = function (index) {
            if (index < 0 || index >= this.providers.length) {
                throw new OutOfBoundsError(index);
            }
            return this.providers[index];
        };
        ReflectiveProtoInjectorDynamicStrategy.prototype.createInjectorStrategy = function (ei) {
            return new ReflectiveInjectorDynamicStrategy(this, ei);
        };
        return ReflectiveProtoInjectorDynamicStrategy;
    }());
    var ReflectiveProtoInjector = (function () {
        function ReflectiveProtoInjector(providers) {
            this.numberOfProviders = providers.length;
            this._strategy = providers.length > _MAX_CONSTRUCTION_COUNTER ?
                new ReflectiveProtoInjectorDynamicStrategy(this, providers) :
                new ReflectiveProtoInjectorInlineStrategy(this, providers);
        }
        ReflectiveProtoInjector.fromResolvedProviders = function (providers) {
            return new ReflectiveProtoInjector(providers);
        };
        ReflectiveProtoInjector.prototype.getProviderAtIndex = function (index) {
            return this._strategy.getProviderAtIndex(index);
        };
        return ReflectiveProtoInjector;
    }());
    var ReflectiveInjectorInlineStrategy = (function () {
        function ReflectiveInjectorInlineStrategy(injector, protoStrategy) {
            this.injector = injector;
            this.protoStrategy = protoStrategy;
            this.obj0 = UNDEFINED;
            this.obj1 = UNDEFINED;
            this.obj2 = UNDEFINED;
            this.obj3 = UNDEFINED;
            this.obj4 = UNDEFINED;
            this.obj5 = UNDEFINED;
            this.obj6 = UNDEFINED;
            this.obj7 = UNDEFINED;
            this.obj8 = UNDEFINED;
            this.obj9 = UNDEFINED;
        }
        ReflectiveInjectorInlineStrategy.prototype.resetConstructionCounter = function () { this.injector._constructionCounter = 0; };
        ReflectiveInjectorInlineStrategy.prototype.instantiateProvider = function (provider) {
            return this.injector._new(provider);
        };
        ReflectiveInjectorInlineStrategy.prototype.getObjByKeyId = function (keyId) {
            var p = this.protoStrategy;
            var inj = this.injector;
            if (p.keyId0 === keyId) {
                if (this.obj0 === UNDEFINED) {
                    this.obj0 = inj._new(p.provider0);
                }
                return this.obj0;
            }
            if (p.keyId1 === keyId) {
                if (this.obj1 === UNDEFINED) {
                    this.obj1 = inj._new(p.provider1);
                }
                return this.obj1;
            }
            if (p.keyId2 === keyId) {
                if (this.obj2 === UNDEFINED) {
                    this.obj2 = inj._new(p.provider2);
                }
                return this.obj2;
            }
            if (p.keyId3 === keyId) {
                if (this.obj3 === UNDEFINED) {
                    this.obj3 = inj._new(p.provider3);
                }
                return this.obj3;
            }
            if (p.keyId4 === keyId) {
                if (this.obj4 === UNDEFINED) {
                    this.obj4 = inj._new(p.provider4);
                }
                return this.obj4;
            }
            if (p.keyId5 === keyId) {
                if (this.obj5 === UNDEFINED) {
                    this.obj5 = inj._new(p.provider5);
                }
                return this.obj5;
            }
            if (p.keyId6 === keyId) {
                if (this.obj6 === UNDEFINED) {
                    this.obj6 = inj._new(p.provider6);
                }
                return this.obj6;
            }
            if (p.keyId7 === keyId) {
                if (this.obj7 === UNDEFINED) {
                    this.obj7 = inj._new(p.provider7);
                }
                return this.obj7;
            }
            if (p.keyId8 === keyId) {
                if (this.obj8 === UNDEFINED) {
                    this.obj8 = inj._new(p.provider8);
                }
                return this.obj8;
            }
            if (p.keyId9 === keyId) {
                if (this.obj9 === UNDEFINED) {
                    this.obj9 = inj._new(p.provider9);
                }
                return this.obj9;
            }
            return UNDEFINED;
        };
        ReflectiveInjectorInlineStrategy.prototype.getObjAtIndex = function (index) {
            if (index == 0)
                return this.obj0;
            if (index == 1)
                return this.obj1;
            if (index == 2)
                return this.obj2;
            if (index == 3)
                return this.obj3;
            if (index == 4)
                return this.obj4;
            if (index == 5)
                return this.obj5;
            if (index == 6)
                return this.obj6;
            if (index == 7)
                return this.obj7;
            if (index == 8)
                return this.obj8;
            if (index == 9)
                return this.obj9;
            throw new OutOfBoundsError(index);
        };
        ReflectiveInjectorInlineStrategy.prototype.getMaxNumberOfObjects = function () { return _MAX_CONSTRUCTION_COUNTER; };
        return ReflectiveInjectorInlineStrategy;
    }());
    var ReflectiveInjectorDynamicStrategy = (function () {
        function ReflectiveInjectorDynamicStrategy(protoStrategy, injector) {
            this.protoStrategy = protoStrategy;
            this.injector = injector;
            this.objs = new Array(protoStrategy.providers.length).fill(UNDEFINED);
        }
        ReflectiveInjectorDynamicStrategy.prototype.resetConstructionCounter = function () { this.injector._constructionCounter = 0; };
        ReflectiveInjectorDynamicStrategy.prototype.instantiateProvider = function (provider) {
            return this.injector._new(provider);
        };
        ReflectiveInjectorDynamicStrategy.prototype.getObjByKeyId = function (keyId) {
            var p = this.protoStrategy;
            for (var i = 0; i < p.keyIds.length; i++) {
                if (p.keyIds[i] === keyId) {
                    if (this.objs[i] === UNDEFINED) {
                        this.objs[i] = this.injector._new(p.providers[i]);
                    }
                    return this.objs[i];
                }
            }
            return UNDEFINED;
        };
        ReflectiveInjectorDynamicStrategy.prototype.getObjAtIndex = function (index) {
            if (index < 0 || index >= this.objs.length) {
                throw new OutOfBoundsError(index);
            }
            return this.objs[index];
        };
        ReflectiveInjectorDynamicStrategy.prototype.getMaxNumberOfObjects = function () { return this.objs.length; };
        return ReflectiveInjectorDynamicStrategy;
    }());
    /**
     * A ReflectiveDependency injection container used for instantiating objects and resolving
     * dependencies.
     *
     * An `Injector` is a replacement for a `new` operator, which can automatically resolve the
     * constructor dependencies.
     *
     * In typical use, application code asks for the dependencies in the constructor and they are
     * resolved by the `Injector`.
     *
     * ### Example ([live demo](http://plnkr.co/edit/jzjec0?p=preview))
     *
     * The following example creates an `Injector` configured to create `Engine` and `Car`.
     *
     * ```typescript
     * @Injectable()
     * class Engine {
     * }
     *
     * @Injectable()
     * class Car {
     *   constructor(public engine:Engine) {}
     * }
     *
     * var injector = ReflectiveInjector.resolveAndCreate([Car, Engine]);
     * var car = injector.get(Car);
     * expect(car instanceof Car).toBe(true);
     * expect(car.engine instanceof Engine).toBe(true);
     * ```
     *
     * Notice, we don't use the `new` operator because we explicitly want to have the `Injector`
     * resolve all of the object's dependencies automatically.
     *
     * @stable
     */
    var ReflectiveInjector = (function () {
        function ReflectiveInjector() {
        }
        /**
         * Turns an array of provider definitions into an array of resolved providers.
         *
         * A resolution is a process of flattening multiple nested arrays and converting individual
         * providers into an array of {@link ResolvedReflectiveProvider}s.
         *
         * ### Example ([live demo](http://plnkr.co/edit/AiXTHi?p=preview))
         *
         * ```typescript
         * @Injectable()
         * class Engine {
         * }
         *
         * @Injectable()
         * class Car {
         *   constructor(public engine:Engine) {}
         * }
         *
         * var providers = ReflectiveInjector.resolve([Car, [[Engine]]]);
         *
         * expect(providers.length).toEqual(2);
         *
         * expect(providers[0] instanceof ResolvedReflectiveProvider).toBe(true);
         * expect(providers[0].key.displayName).toBe("Car");
         * expect(providers[0].dependencies.length).toEqual(1);
         * expect(providers[0].factory).toBeDefined();
         *
         * expect(providers[1].key.displayName).toBe("Engine");
         * });
         * ```
         *
         * See {@link ReflectiveInjector#fromResolvedProviders} for more info.
         */
        ReflectiveInjector.resolve = function (providers) {
            return resolveReflectiveProviders(providers);
        };
        /**
         * Resolves an array of providers and creates an injector from those providers.
         *
         * The passed-in providers can be an array of `Type`, {@link Provider},
         * or a recursive array of more providers.
         *
         * ### Example ([live demo](http://plnkr.co/edit/ePOccA?p=preview))
         *
         * ```typescript
         * @Injectable()
         * class Engine {
         * }
         *
         * @Injectable()
         * class Car {
         *   constructor(public engine:Engine) {}
         * }
         *
         * var injector = ReflectiveInjector.resolveAndCreate([Car, Engine]);
         * expect(injector.get(Car) instanceof Car).toBe(true);
         * ```
         *
         * This function is slower than the corresponding `fromResolvedProviders`
         * because it needs to resolve the passed-in providers first.
         * See {@link Injector#resolve} and {@link Injector#fromResolvedProviders}.
         */
        ReflectiveInjector.resolveAndCreate = function (providers, parent) {
            if (parent === void 0) { parent = null; }
            var ResolvedReflectiveProviders = ReflectiveInjector.resolve(providers);
            return ReflectiveInjector.fromResolvedProviders(ResolvedReflectiveProviders, parent);
        };
        /**
         * Creates an injector from previously resolved providers.
         *
         * This API is the recommended way to construct injectors in performance-sensitive parts.
         *
         * ### Example ([live demo](http://plnkr.co/edit/KrSMci?p=preview))
         *
         * ```typescript
         * @Injectable()
         * class Engine {
         * }
         *
         * @Injectable()
         * class Car {
         *   constructor(public engine:Engine) {}
         * }
         *
         * var providers = ReflectiveInjector.resolve([Car, Engine]);
         * var injector = ReflectiveInjector.fromResolvedProviders(providers);
         * expect(injector.get(Car) instanceof Car).toBe(true);
         * ```
         * @experimental
         */
        ReflectiveInjector.fromResolvedProviders = function (providers, parent) {
            if (parent === void 0) { parent = null; }
            return new ReflectiveInjector_(ReflectiveProtoInjector.fromResolvedProviders(providers), parent);
        };
        Object.defineProperty(ReflectiveInjector.prototype, "parent", {
            /**
             * Parent of this injector.
             *
             * <!-- TODO: Add a link to the section of the user guide talking about hierarchical injection.
             * -->
             *
             * ### Example ([live demo](http://plnkr.co/edit/eosMGo?p=preview))
             *
             * ```typescript
             * var parent = ReflectiveInjector.resolveAndCreate([]);
             * var child = parent.resolveAndCreateChild([]);
             * expect(child.parent).toBe(parent);
             * ```
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        /**
         * Resolves an array of providers and creates a child injector from those providers.
         *
         * <!-- TODO: Add a link to the section of the user guide talking about hierarchical injection.
         * -->
         *
         * The passed-in providers can be an array of `Type`, {@link Provider},
         * or a recursive array of more providers.
         *
         * ### Example ([live demo](http://plnkr.co/edit/opB3T4?p=preview))
         *
         * ```typescript
         * class ParentProvider {}
         * class ChildProvider {}
         *
         * var parent = ReflectiveInjector.resolveAndCreate([ParentProvider]);
         * var child = parent.resolveAndCreateChild([ChildProvider]);
         *
         * expect(child.get(ParentProvider) instanceof ParentProvider).toBe(true);
         * expect(child.get(ChildProvider) instanceof ChildProvider).toBe(true);
         * expect(child.get(ParentProvider)).toBe(parent.get(ParentProvider));
         * ```
         *
         * This function is slower than the corresponding `createChildFromResolved`
         * because it needs to resolve the passed-in providers first.
         * See {@link Injector#resolve} and {@link Injector#createChildFromResolved}.
         */
        ReflectiveInjector.prototype.resolveAndCreateChild = function (providers) { return unimplemented(); };
        /**
         * Creates a child injector from previously resolved providers.
         *
         * <!-- TODO: Add a link to the section of the user guide talking about hierarchical injection.
         * -->
         *
         * This API is the recommended way to construct injectors in performance-sensitive parts.
         *
         * ### Example ([live demo](http://plnkr.co/edit/VhyfjN?p=preview))
         *
         * ```typescript
         * class ParentProvider {}
         * class ChildProvider {}
         *
         * var parentProviders = ReflectiveInjector.resolve([ParentProvider]);
         * var childProviders = ReflectiveInjector.resolve([ChildProvider]);
         *
         * var parent = ReflectiveInjector.fromResolvedProviders(parentProviders);
         * var child = parent.createChildFromResolved(childProviders);
         *
         * expect(child.get(ParentProvider) instanceof ParentProvider).toBe(true);
         * expect(child.get(ChildProvider) instanceof ChildProvider).toBe(true);
         * expect(child.get(ParentProvider)).toBe(parent.get(ParentProvider));
         * ```
         */
        ReflectiveInjector.prototype.createChildFromResolved = function (providers) {
            return unimplemented();
        };
        /**
         * Resolves a provider and instantiates an object in the context of the injector.
         *
         * The created object does not get cached by the injector.
         *
         * ### Example ([live demo](http://plnkr.co/edit/yvVXoB?p=preview))
         *
         * ```typescript
         * @Injectable()
         * class Engine {
         * }
         *
         * @Injectable()
         * class Car {
         *   constructor(public engine:Engine) {}
         * }
         *
         * var injector = ReflectiveInjector.resolveAndCreate([Engine]);
         *
         * var car = injector.resolveAndInstantiate(Car);
         * expect(car.engine).toBe(injector.get(Engine));
         * expect(car).not.toBe(injector.resolveAndInstantiate(Car));
         * ```
         */
        ReflectiveInjector.prototype.resolveAndInstantiate = function (provider) { return unimplemented(); };
        /**
         * Instantiates an object using a resolved provider in the context of the injector.
         *
         * The created object does not get cached by the injector.
         *
         * ### Example ([live demo](http://plnkr.co/edit/ptCImQ?p=preview))
         *
         * ```typescript
         * @Injectable()
         * class Engine {
         * }
         *
         * @Injectable()
         * class Car {
         *   constructor(public engine:Engine) {}
         * }
         *
         * var injector = ReflectiveInjector.resolveAndCreate([Engine]);
         * var carProvider = ReflectiveInjector.resolve([Car])[0];
         * var car = injector.instantiateResolved(carProvider);
         * expect(car.engine).toBe(injector.get(Engine));
         * expect(car).not.toBe(injector.instantiateResolved(carProvider));
         * ```
         */
        ReflectiveInjector.prototype.instantiateResolved = function (provider) { return unimplemented(); };
        return ReflectiveInjector;
    }());
    var ReflectiveInjector_ = (function () {
        /**
         * Private
         */
        function ReflectiveInjector_(_proto /* ProtoInjector */, _parent) {
            if (_parent === void 0) { _parent = null; }
            /** @internal */
            this._constructionCounter = 0;
            this._proto = _proto;
            this._parent = _parent;
            this._strategy = _proto._strategy.createInjectorStrategy(this);
        }
        ReflectiveInjector_.prototype.get = function (token, notFoundValue) {
            if (notFoundValue === void 0) { notFoundValue = THROW_IF_NOT_FOUND; }
            return this._getByKey(ReflectiveKey.get(token), null, null, notFoundValue);
        };
        ReflectiveInjector_.prototype.getAt = function (index) { return this._strategy.getObjAtIndex(index); };
        Object.defineProperty(ReflectiveInjector_.prototype, "parent", {
            get: function () { return this._parent; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReflectiveInjector_.prototype, "internalStrategy", {
            /**
             * @internal
             * Internal. Do not use.
             * We return `any` not to export the InjectorStrategy type.
             */
            get: function () { return this._strategy; },
            enumerable: true,
            configurable: true
        });
        ReflectiveInjector_.prototype.resolveAndCreateChild = function (providers) {
            var ResolvedReflectiveProviders = ReflectiveInjector.resolve(providers);
            return this.createChildFromResolved(ResolvedReflectiveProviders);
        };
        ReflectiveInjector_.prototype.createChildFromResolved = function (providers) {
            var proto = new ReflectiveProtoInjector(providers);
            var inj = new ReflectiveInjector_(proto);
            inj._parent = this;
            return inj;
        };
        ReflectiveInjector_.prototype.resolveAndInstantiate = function (provider) {
            return this.instantiateResolved(ReflectiveInjector.resolve([provider])[0]);
        };
        ReflectiveInjector_.prototype.instantiateResolved = function (provider) {
            return this._instantiateProvider(provider);
        };
        /** @internal */
        ReflectiveInjector_.prototype._new = function (provider) {
            if (this._constructionCounter++ > this._strategy.getMaxNumberOfObjects()) {
                throw new CyclicDependencyError(this, provider.key);
            }
            return this._instantiateProvider(provider);
        };
        ReflectiveInjector_.prototype._instantiateProvider = function (provider) {
            if (provider.multiProvider) {
                var res = new Array(provider.resolvedFactories.length);
                for (var i = 0; i < provider.resolvedFactories.length; ++i) {
                    res[i] = this._instantiate(provider, provider.resolvedFactories[i]);
                }
                return res;
            }
            else {
                return this._instantiate(provider, provider.resolvedFactories[0]);
            }
        };
        ReflectiveInjector_.prototype._instantiate = function (provider, ResolvedReflectiveFactory) {
            var factory = ResolvedReflectiveFactory.factory;
            var deps = ResolvedReflectiveFactory.dependencies;
            var length = deps.length;
            var d0;
            var d1;
            var d2;
            var d3;
            var d4;
            var d5;
            var d6;
            var d7;
            var d8;
            var d9;
            var d10;
            var d11;
            var d12;
            var d13;
            var d14;
            var d15;
            var d16;
            var d17;
            var d18;
            var d19;
            try {
                d0 = length > 0 ? this._getByReflectiveDependency(provider, deps[0]) : null;
                d1 = length > 1 ? this._getByReflectiveDependency(provider, deps[1]) : null;
                d2 = length > 2 ? this._getByReflectiveDependency(provider, deps[2]) : null;
                d3 = length > 3 ? this._getByReflectiveDependency(provider, deps[3]) : null;
                d4 = length > 4 ? this._getByReflectiveDependency(provider, deps[4]) : null;
                d5 = length > 5 ? this._getByReflectiveDependency(provider, deps[5]) : null;
                d6 = length > 6 ? this._getByReflectiveDependency(provider, deps[6]) : null;
                d7 = length > 7 ? this._getByReflectiveDependency(provider, deps[7]) : null;
                d8 = length > 8 ? this._getByReflectiveDependency(provider, deps[8]) : null;
                d9 = length > 9 ? this._getByReflectiveDependency(provider, deps[9]) : null;
                d10 = length > 10 ? this._getByReflectiveDependency(provider, deps[10]) : null;
                d11 = length > 11 ? this._getByReflectiveDependency(provider, deps[11]) : null;
                d12 = length > 12 ? this._getByReflectiveDependency(provider, deps[12]) : null;
                d13 = length > 13 ? this._getByReflectiveDependency(provider, deps[13]) : null;
                d14 = length > 14 ? this._getByReflectiveDependency(provider, deps[14]) : null;
                d15 = length > 15 ? this._getByReflectiveDependency(provider, deps[15]) : null;
                d16 = length > 16 ? this._getByReflectiveDependency(provider, deps[16]) : null;
                d17 = length > 17 ? this._getByReflectiveDependency(provider, deps[17]) : null;
                d18 = length > 18 ? this._getByReflectiveDependency(provider, deps[18]) : null;
                d19 = length > 19 ? this._getByReflectiveDependency(provider, deps[19]) : null;
            }
            catch (e) {
                if (e instanceof AbstractProviderError || e instanceof InstantiationError) {
                    e.addKey(this, provider.key);
                }
                throw e;
            }
            var obj;
            try {
                switch (length) {
                    case 0:
                        obj = factory();
                        break;
                    case 1:
                        obj = factory(d0);
                        break;
                    case 2:
                        obj = factory(d0, d1);
                        break;
                    case 3:
                        obj = factory(d0, d1, d2);
                        break;
                    case 4:
                        obj = factory(d0, d1, d2, d3);
                        break;
                    case 5:
                        obj = factory(d0, d1, d2, d3, d4);
                        break;
                    case 6:
                        obj = factory(d0, d1, d2, d3, d4, d5);
                        break;
                    case 7:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6);
                        break;
                    case 8:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7);
                        break;
                    case 9:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8);
                        break;
                    case 10:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9);
                        break;
                    case 11:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10);
                        break;
                    case 12:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11);
                        break;
                    case 13:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12);
                        break;
                    case 14:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13);
                        break;
                    case 15:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14);
                        break;
                    case 16:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15);
                        break;
                    case 17:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16);
                        break;
                    case 18:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17);
                        break;
                    case 19:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18);
                        break;
                    case 20:
                        obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19);
                        break;
                    default:
                        throw new Error("Cannot instantiate '" + provider.key.displayName + "' because it has more than 20 dependencies");
                }
            }
            catch (e) {
                throw new InstantiationError(this, e, e.stack, provider.key);
            }
            return obj;
        };
        ReflectiveInjector_.prototype._getByReflectiveDependency = function (provider, dep) {
            return this._getByKey(dep.key, dep.lowerBoundVisibility, dep.upperBoundVisibility, dep.optional ? null : THROW_IF_NOT_FOUND);
        };
        ReflectiveInjector_.prototype._getByKey = function (key, lowerBoundVisibility, upperBoundVisibility, notFoundValue) {
            if (key === INJECTOR_KEY) {
                return this;
            }
            if (upperBoundVisibility instanceof Self) {
                return this._getByKeySelf(key, notFoundValue);
            }
            else {
                return this._getByKeyDefault(key, notFoundValue, lowerBoundVisibility);
            }
        };
        /** @internal */
        ReflectiveInjector_.prototype._throwOrNull = function (key, notFoundValue) {
            if (notFoundValue !== THROW_IF_NOT_FOUND) {
                return notFoundValue;
            }
            else {
                throw new NoProviderError(this, key);
            }
        };
        /** @internal */
        ReflectiveInjector_.prototype._getByKeySelf = function (key, notFoundValue) {
            var obj = this._strategy.getObjByKeyId(key.id);
            return (obj !== UNDEFINED) ? obj : this._throwOrNull(key, notFoundValue);
        };
        /** @internal */
        ReflectiveInjector_.prototype._getByKeyDefault = function (key, notFoundValue, lowerBoundVisibility) {
            var inj;
            if (lowerBoundVisibility instanceof SkipSelf) {
                inj = this._parent;
            }
            else {
                inj = this;
            }
            while (inj instanceof ReflectiveInjector_) {
                var inj_ = inj;
                var obj = inj_._strategy.getObjByKeyId(key.id);
                if (obj !== UNDEFINED)
                    return obj;
                inj = inj_._parent;
            }
            if (inj !== null) {
                return inj.get(key.token, notFoundValue);
            }
            else {
                return this._throwOrNull(key, notFoundValue);
            }
        };
        Object.defineProperty(ReflectiveInjector_.prototype, "displayName", {
            get: function () {
                var providers = _mapProviders(this, function (b) { return ' "' + b.key.displayName + '" '; })
                    .join(', ');
                return "ReflectiveInjector(providers: [" + providers + "])";
            },
            enumerable: true,
            configurable: true
        });
        ReflectiveInjector_.prototype.toString = function () { return this.displayName; };
        return ReflectiveInjector_;
    }());
    var INJECTOR_KEY = ReflectiveKey.get(Injector);
    function _mapProviders(injector, fn) {
        var res = new Array(injector._proto.numberOfProviders);
        for (var i = 0; i < injector._proto.numberOfProviders; ++i) {
            res[i] = fn(injector._proto.getProviderAtIndex(i));
        }
        return res;
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * @whatItDoes Provides a hook for centralized exception handling.
     *
     * @description
     *
     * The default implementation of `ErrorHandler` prints error messages to the `console`. To
     * intercept error handling, write a custom exception handler that replaces this default as
     * appropriate for your app.
     *
     * ### Example
     *
     * ```
     * class MyErrorHandler implements ErrorHandler {
     *   handleError(error) {
     *     // do something with the exception
     *   }
     * }
     *
     * @NgModule({
     *   providers: [{provide: ErrorHandler, useClass: MyErrorHandler}]
     * })
     * class MyModule {}
     * ```
     *
     * @stable
     */
    var ErrorHandler = (function () {
        function ErrorHandler(rethrowError) {
            if (rethrowError === void 0) { rethrowError = true; }
            /**
             * @internal
             */
            this._console = console;
            this.rethrowError = rethrowError;
        }
        ErrorHandler.prototype.handleError = function (error) {
            var originalError = this._findOriginalError(error);
            var originalStack = this._findOriginalStack(error);
            var context = this._findContext(error);
            this._console.error("EXCEPTION: " + this._extractMessage(error));
            if (originalError) {
                this._console.error("ORIGINAL EXCEPTION: " + this._extractMessage(originalError));
            }
            if (originalStack) {
                this._console.error('ORIGINAL STACKTRACE:');
                this._console.error(originalStack);
            }
            if (context) {
                this._console.error('ERROR CONTEXT:');
                this._console.error(context);
            }
            // We rethrow exceptions, so operations like 'bootstrap' will result in an error
            // when an error happens. If we do not rethrow, bootstrap will always succeed.
            if (this.rethrowError)
                throw error;
        };
        /** @internal */
        ErrorHandler.prototype._extractMessage = function (error) {
            return error instanceof Error ? error.message : error.toString();
        };
        /** @internal */
        ErrorHandler.prototype._findContext = function (error) {
            if (error) {
                return error.context ? error.context :
                    this._findContext(error.originalError);
            }
            return null;
        };
        /** @internal */
        ErrorHandler.prototype._findOriginalError = function (error) {
            var e = error.originalError;
            while (e && e.originalError) {
                e = e.originalError;
            }
            return e;
        };
        /** @internal */
        ErrorHandler.prototype._findOriginalStack = function (error) {
            if (!(error instanceof Error))
                return null;
            var e = error;
            var stack = e.stack;
            while (e instanceof Error && e.originalError) {
                e = e.originalError;
                if (e instanceof Error && e.stack) {
                    stack = e.stack;
                }
            }
            return stack;
        };
        return ErrorHandler;
    }());

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    function isPromise(obj) {
        // allow any Promise/A+ compliant thenable.
        // It's up to the caller to ensure that obj.then conforms to the spec
        return !!obj && typeof obj.then === 'function';
    }

    /**
     * A function that will be executed when an application is initialized.
     * @experimental
     */
    var APP_INITIALIZER = new OpaqueToken('Application Initializer');
    /**
     * A class that reflects the state of running {@link APP_INITIALIZER}s.
     *
     * @experimental
     */
    var ApplicationInitStatus = (function () {
        function ApplicationInitStatus(appInits) {
            var _this = this;
            this._done = false;
            var asyncInitPromises = [];
            if (appInits) {
                for (var i = 0; i < appInits.length; i++) {
                    var initResult = appInits[i]();
                    if (isPromise(initResult)) {
                        asyncInitPromises.push(initResult);
                    }
                }
            }
            this._donePromise = Promise.all(asyncInitPromises).then(function () { _this._done = true; });
            if (asyncInitPromises.length === 0) {
                this._done = true;
            }
        }
        Object.defineProperty(ApplicationInitStatus.prototype, "done", {
            get: function () { return this._done; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ApplicationInitStatus.prototype, "donePromise", {
            get: function () { return this._donePromise; },
            enumerable: true,
            configurable: true
        });
        ApplicationInitStatus.decorators = [
            { type: Injectable },
        ];
        /** @nocollapse */
        ApplicationInitStatus.ctorParameters = [
            { type: Array, decorators: [{ type: Inject, args: [APP_INITIALIZER,] }, { type: Optional },] },
        ];
        return ApplicationInitStatus;
    }());

    /**
     * A DI Token representing a unique string id assigned to the application by Angular and used
     * primarily for prefixing application attributes and CSS styles when
     * {@link ViewEncapsulation#Emulated} is being used.
     *
     * If you need to avoid randomly generated value to be used as an application id, you can provide
     * a custom value via a DI provider <!-- TODO: provider --> configuring the root {@link Injector}
     * using this token.
     * @experimental
     */
    var APP_ID = new OpaqueToken('AppId');
    function _appIdRandomProviderFactory() {
        return "" + _randomChar() + _randomChar() + _randomChar();
    }
    /**
     * Providers that will generate a random APP_ID_TOKEN.
     * @experimental
     */
    var APP_ID_RANDOM_PROVIDER = {
        provide: APP_ID,
        useFactory: _appIdRandomProviderFactory,
        deps: [],
    };
    function _randomChar() {
        return String.fromCharCode(97 + Math.floor(Math.random() * 25));
    }
    /**
     * A function that will be executed when a platform is initialized.
     * @experimental
     */
    var PLATFORM_INITIALIZER = new OpaqueToken('Platform Initializer');
    /**
     * All callbacks provided via this token will be called for every component that is bootstrapped.
     * Signature of the callback:
     *
     * `(componentRef: ComponentRef) => void`.
     *
     * @experimental
     */
    var APP_BOOTSTRAP_LISTENER = new OpaqueToken('appBootstrapListener');
    /**
     * A token which indicates the root directory of the application
     * @experimental
     */
    var PACKAGE_ROOT_URL = new OpaqueToken('Application Packages Root URL');

    var Console = (function () {
        function Console() {
        }
        Console.prototype.log = function (message) { print(message); };
        // Note: for reporting errors use `DOM.logError()` as it is platform specific
        Console.prototype.warn = function (message) { warn(message); };
        Console.decorators = [
            { type: Injectable },
        ];
        /** @nocollapse */
        Console.ctorParameters = [];
        return Console;
    }());

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var __extends$4 = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    /**
     * Indicates that a component is still being loaded in a synchronous compile.
     *
     * @stable
     */
    var ComponentStillLoadingError = (function (_super) {
        __extends$4(ComponentStillLoadingError, _super);
        function ComponentStillLoadingError(compType) {
            _super.call(this, "Can't compile synchronously as " + stringify(compType) + " is still being loaded!");
            this.compType = compType;
        }
        return ComponentStillLoadingError;
    }(BaseError));
    /**
     * Combination of NgModuleFactory and ComponentFactorys.
     *
     * @experimental
     */
    var ModuleWithComponentFactories = (function () {
        function ModuleWithComponentFactories(ngModuleFactory, componentFactories) {
            this.ngModuleFactory = ngModuleFactory;
            this.componentFactories = componentFactories;
        }
        return ModuleWithComponentFactories;
    }());
    function _throwError() {
        throw new Error("Runtime compiler is not loaded");
    }
    /**
     * Low-level service for running the angular compiler during runtime
     * to create {@link ComponentFactory}s, which
     * can later be used to create and render a Component instance.
     *
     * Each `@NgModule` provides an own `Compiler` to its injector,
     * that will use the directives/pipes of the ng module for compilation
     * of components.
     * @stable
     */
    var Compiler = (function () {
        function Compiler() {
        }
        /**
         * Compiles the given NgModule and all of its components. All templates of the components listed
         * in `entryComponents`
         * have to be inlined. Otherwise throws a {@link ComponentStillLoadingError}.
         */
        Compiler.prototype.compileModuleSync = function (moduleType) { throw _throwError(); };
        /**
         * Compiles the given NgModule and all of its components
         */
        Compiler.prototype.compileModuleAsync = function (moduleType) { throw _throwError(); };
        /**
         * Same as {@link compileModuleSync} but also creates ComponentFactories for all components.
         */
        Compiler.prototype.compileModuleAndAllComponentsSync = function (moduleType) {
            throw _throwError();
        };
        /**
         * Same as {@link compileModuleAsync} but also creates ComponentFactories for all components.
         */
        Compiler.prototype.compileModuleAndAllComponentsAsync = function (moduleType) {
            throw _throwError();
        };
        /**
         * Clears all caches.
         */
        Compiler.prototype.clearCache = function () { };
        /**
         * Clears the cache for the given component/ngModule.
         */
        Compiler.prototype.clearCacheFor = function (type) { };
        return Compiler;
    }());
    /**
     * Token to provide CompilerOptions in the platform injector.
     *
     * @experimental
     */
    var COMPILER_OPTIONS = new OpaqueToken('compilerOptions');
    /**
     * A factory for creating a Compiler
     *
     * @experimental
     */
    var CompilerFactory = (function () {
        function CompilerFactory() {
        }
        return CompilerFactory;
    }());

    var DefaultIterableDifferFactory = (function () {
        function DefaultIterableDifferFactory() {
        }
        DefaultIterableDifferFactory.prototype.supports = function (obj) { return isListLikeIterable(obj); };
        DefaultIterableDifferFactory.prototype.create = function (cdRef, trackByFn) {
            return new DefaultIterableDiffer(trackByFn);
        };
        return DefaultIterableDifferFactory;
    }());
    var trackByIdentity = function (index, item) { return item; };
    /**
     * @stable
     */
    var DefaultIterableDiffer = (function () {
        function DefaultIterableDiffer(_trackByFn) {
            this._trackByFn = _trackByFn;
            this._length = null;
            this._collection = null;
            // Keeps track of the used records at any point in time (during & across `_check()` calls)
            this._linkedRecords = null;
            // Keeps track of the removed records at any point in time during `_check()` calls.
            this._unlinkedRecords = null;
            this._previousItHead = null;
            this._itHead = null;
            this._itTail = null;
            this._additionsHead = null;
            this._additionsTail = null;
            this._movesHead = null;
            this._movesTail = null;
            this._removalsHead = null;
            this._removalsTail = null;
            // Keeps track of records where custom track by is the same, but item identity has changed
            this._identityChangesHead = null;
            this._identityChangesTail = null;
            this._trackByFn = this._trackByFn || trackByIdentity;
        }
        Object.defineProperty(DefaultIterableDiffer.prototype, "collection", {
            get: function () { return this._collection; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DefaultIterableDiffer.prototype, "length", {
            get: function () { return this._length; },
            enumerable: true,
            configurable: true
        });
        DefaultIterableDiffer.prototype.forEachItem = function (fn) {
            var record;
            for (record = this._itHead; record !== null; record = record._next) {
                fn(record);
            }
        };
        DefaultIterableDiffer.prototype.forEachOperation = function (fn) {
            var nextIt = this._itHead;
            var nextRemove = this._removalsHead;
            var addRemoveOffset = 0;
            var moveOffsets = null;
            while (nextIt || nextRemove) {
                // Figure out which is the next record to process
                // Order: remove, add, move
                var record = !nextRemove ||
                    nextIt &&
                        nextIt.currentIndex < getPreviousIndex(nextRemove, addRemoveOffset, moveOffsets) ?
                    nextIt :
                    nextRemove;
                var adjPreviousIndex = getPreviousIndex(record, addRemoveOffset, moveOffsets);
                var currentIndex = record.currentIndex;
                // consume the item, and adjust the addRemoveOffset and update moveDistance if necessary
                if (record === nextRemove) {
                    addRemoveOffset--;
                    nextRemove = nextRemove._nextRemoved;
                }
                else {
                    nextIt = nextIt._next;
                    if (record.previousIndex == null) {
                        addRemoveOffset++;
                    }
                    else {
                        // INVARIANT:  currentIndex < previousIndex
                        if (!moveOffsets)
                            moveOffsets = [];
                        var localMovePreviousIndex = adjPreviousIndex - addRemoveOffset;
                        var localCurrentIndex = currentIndex - addRemoveOffset;
                        if (localMovePreviousIndex != localCurrentIndex) {
                            for (var i = 0; i < localMovePreviousIndex; i++) {
                                var offset = i < moveOffsets.length ? moveOffsets[i] : (moveOffsets[i] = 0);
                                var index = offset + i;
                                if (localCurrentIndex <= index && index < localMovePreviousIndex) {
                                    moveOffsets[i] = offset + 1;
                                }
                            }
                            var previousIndex = record.previousIndex;
                            moveOffsets[previousIndex] = localCurrentIndex - localMovePreviousIndex;
                        }
                    }
                }
                if (adjPreviousIndex !== currentIndex) {
                    fn(record, adjPreviousIndex, currentIndex);
                }
            }
        };
        DefaultIterableDiffer.prototype.forEachPreviousItem = function (fn) {
            var record;
            for (record = this._previousItHead; record !== null; record = record._nextPrevious) {
                fn(record);
            }
        };
        DefaultIterableDiffer.prototype.forEachAddedItem = function (fn) {
            var record;
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
                fn(record);
            }
        };
        DefaultIterableDiffer.prototype.forEachMovedItem = function (fn) {
            var record;
            for (record = this._movesHead; record !== null; record = record._nextMoved) {
                fn(record);
            }
        };
        DefaultIterableDiffer.prototype.forEachRemovedItem = function (fn) {
            var record;
            for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
                fn(record);
            }
        };
        DefaultIterableDiffer.prototype.forEachIdentityChange = function (fn) {
            var record;
            for (record = this._identityChangesHead; record !== null; record = record._nextIdentityChange) {
                fn(record);
            }
        };
        DefaultIterableDiffer.prototype.diff = function (collection) {
            if (isBlank(collection))
                collection = [];
            if (!isListLikeIterable(collection)) {
                throw new Error("Error trying to diff '" + collection + "'");
            }
            if (this.check(collection)) {
                return this;
            }
            else {
                return null;
            }
        };
        DefaultIterableDiffer.prototype.onDestroy = function () { };
        // todo(vicb): optim for UnmodifiableListView (frozen arrays)
        DefaultIterableDiffer.prototype.check = function (collection) {
            var _this = this;
            this._reset();
            var record = this._itHead;
            var mayBeDirty = false;
            var index;
            var item;
            var itemTrackBy;
            if (Array.isArray(collection)) {
                var list = collection;
                this._length = collection.length;
                for (var index_1 = 0; index_1 < this._length; index_1++) {
                    item = list[index_1];
                    itemTrackBy = this._trackByFn(index_1, item);
                    if (record === null || !looseIdentical(record.trackById, itemTrackBy)) {
                        record = this._mismatch(record, item, itemTrackBy, index_1);
                        mayBeDirty = true;
                    }
                    else {
                        if (mayBeDirty) {
                            // TODO(misko): can we limit this to duplicates only?
                            record = this._verifyReinsertion(record, item, itemTrackBy, index_1);
                        }
                        if (!looseIdentical(record.item, item))
                            this._addIdentityChange(record, item);
                    }
                    record = record._next;
                }
            }
            else {
                index = 0;
                iterateListLike(collection, function (item /** TODO #9100 */) {
                    itemTrackBy = _this._trackByFn(index, item);
                    if (record === null || !looseIdentical(record.trackById, itemTrackBy)) {
                        record = _this._mismatch(record, item, itemTrackBy, index);
                        mayBeDirty = true;
                    }
                    else {
                        if (mayBeDirty) {
                            // TODO(misko): can we limit this to duplicates only?
                            record = _this._verifyReinsertion(record, item, itemTrackBy, index);
                        }
                        if (!looseIdentical(record.item, item))
                            _this._addIdentityChange(record, item);
                    }
                    record = record._next;
                    index++;
                });
                this._length = index;
            }
            this._truncate(record);
            this._collection = collection;
            return this.isDirty;
        };
        Object.defineProperty(DefaultIterableDiffer.prototype, "isDirty", {
            /* CollectionChanges is considered dirty if it has any additions, moves, removals, or identity
             * changes.
             */
            get: function () {
                return this._additionsHead !== null || this._movesHead !== null ||
                    this._removalsHead !== null || this._identityChangesHead !== null;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Reset the state of the change objects to show no changes. This means set previousKey to
         * currentKey, and clear all of the queues (additions, moves, removals).
         * Set the previousIndexes of moved and added items to their currentIndexes
         * Reset the list of additions, moves and removals
         *
         * @internal
         */
        DefaultIterableDiffer.prototype._reset = function () {
            if (this.isDirty) {
                var record;
                var nextRecord;
                for (record = this._previousItHead = this._itHead; record !== null; record = record._next) {
                    record._nextPrevious = record._next;
                }
                for (record = this._additionsHead; record !== null; record = record._nextAdded) {
                    record.previousIndex = record.currentIndex;
                }
                this._additionsHead = this._additionsTail = null;
                for (record = this._movesHead; record !== null; record = nextRecord) {
                    record.previousIndex = record.currentIndex;
                    nextRecord = record._nextMoved;
                }
                this._movesHead = this._movesTail = null;
                this._removalsHead = this._removalsTail = null;
                this._identityChangesHead = this._identityChangesTail = null;
            }
        };
        /**
         * This is the core function which handles differences between collections.
         *
         * - `record` is the record which we saw at this position last time. If null then it is a new
         *   item.
         * - `item` is the current item in the collection
         * - `index` is the position of the item in the collection
         *
         * @internal
         */
        DefaultIterableDiffer.prototype._mismatch = function (record, item, itemTrackBy, index) {
            // The previous record after which we will append the current one.
            var previousRecord;
            if (record === null) {
                previousRecord = this._itTail;
            }
            else {
                previousRecord = record._prev;
                // Remove the record from the collection since we know it does not match the item.
                this._remove(record);
            }
            // Attempt to see if we have seen the item before.
            record = this._linkedRecords === null ? null : this._linkedRecords.get(itemTrackBy, index);
            if (record !== null) {
                // We have seen this before, we need to move it forward in the collection.
                // But first we need to check if identity changed, so we can update in view if necessary
                if (!looseIdentical(record.item, item))
                    this._addIdentityChange(record, item);
                this._moveAfter(record, previousRecord, index);
            }
            else {
                // Never seen it, check evicted list.
                record = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(itemTrackBy);
                if (record !== null) {
                    // It is an item which we have evicted earlier: reinsert it back into the list.
                    // But first we need to check if identity changed, so we can update in view if necessary
                    if (!looseIdentical(record.item, item))
                        this._addIdentityChange(record, item);
                    this._reinsertAfter(record, previousRecord, index);
                }
                else {
                    // It is a new item: add it.
                    record =
                        this._addAfter(new CollectionChangeRecord(item, itemTrackBy), previousRecord, index);
                }
            }
            return record;
        };
        /**
         * This check is only needed if an array contains duplicates. (Short circuit of nothing dirty)
         *
         * Use case: `[a, a]` => `[b, a, a]`
         *
         * If we did not have this check then the insertion of `b` would:
         *   1) evict first `a`
         *   2) insert `b` at `0` index.
         *   3) leave `a` at index `1` as is. <-- this is wrong!
         *   3) reinsert `a` at index 2. <-- this is wrong!
         *
         * The correct behavior is:
         *   1) evict first `a`
         *   2) insert `b` at `0` index.
         *   3) reinsert `a` at index 1.
         *   3) move `a` at from `1` to `2`.
         *
         *
         * Double check that we have not evicted a duplicate item. We need to check if the item type may
         * have already been removed:
         * The insertion of b will evict the first 'a'. If we don't reinsert it now it will be reinserted
         * at the end. Which will show up as the two 'a's switching position. This is incorrect, since a
         * better way to think of it is as insert of 'b' rather then switch 'a' with 'b' and then add 'a'
         * at the end.
         *
         * @internal
         */
        DefaultIterableDiffer.prototype._verifyReinsertion = function (record, item, itemTrackBy, index) {
            var reinsertRecord = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(itemTrackBy);
            if (reinsertRecord !== null) {
                record = this._reinsertAfter(reinsertRecord, record._prev, index);
            }
            else if (record.currentIndex != index) {
                record.currentIndex = index;
                this._addToMoves(record, index);
            }
            return record;
        };
        /**
         * Get rid of any excess {@link CollectionChangeRecord}s from the previous collection
         *
         * - `record` The first excess {@link CollectionChangeRecord}.
         *
         * @internal
         */
        DefaultIterableDiffer.prototype._truncate = function (record) {
            // Anything after that needs to be removed;
            while (record !== null) {
                var nextRecord = record._next;
                this._addToRemovals(this._unlink(record));
                record = nextRecord;
            }
            if (this._unlinkedRecords !== null) {
                this._unlinkedRecords.clear();
            }
            if (this._additionsTail !== null) {
                this._additionsTail._nextAdded = null;
            }
            if (this._movesTail !== null) {
                this._movesTail._nextMoved = null;
            }
            if (this._itTail !== null) {
                this._itTail._next = null;
            }
            if (this._removalsTail !== null) {
                this._removalsTail._nextRemoved = null;
            }
            if (this._identityChangesTail !== null) {
                this._identityChangesTail._nextIdentityChange = null;
            }
        };
        /** @internal */
        DefaultIterableDiffer.prototype._reinsertAfter = function (record, prevRecord, index) {
            if (this._unlinkedRecords !== null) {
                this._unlinkedRecords.remove(record);
            }
            var prev = record._prevRemoved;
            var next = record._nextRemoved;
            if (prev === null) {
                this._removalsHead = next;
            }
            else {
                prev._nextRemoved = next;
            }
            if (next === null) {
                this._removalsTail = prev;
            }
            else {
                next._prevRemoved = prev;
            }
            this._insertAfter(record, prevRecord, index);
            this._addToMoves(record, index);
            return record;
        };
        /** @internal */
        DefaultIterableDiffer.prototype._moveAfter = function (record, prevRecord, index) {
            this._unlink(record);
            this._insertAfter(record, prevRecord, index);
            this._addToMoves(record, index);
            return record;
        };
        /** @internal */
        DefaultIterableDiffer.prototype._addAfter = function (record, prevRecord, index) {
            this._insertAfter(record, prevRecord, index);
            if (this._additionsTail === null) {
                // todo(vicb)
                // assert(this._additionsHead === null);
                this._additionsTail = this._additionsHead = record;
            }
            else {
                // todo(vicb)
                // assert(_additionsTail._nextAdded === null);
                // assert(record._nextAdded === null);
                this._additionsTail = this._additionsTail._nextAdded = record;
            }
            return record;
        };
        /** @internal */
        DefaultIterableDiffer.prototype._insertAfter = function (record, prevRecord, index) {
            // todo(vicb)
            // assert(record != prevRecord);
            // assert(record._next === null);
            // assert(record._prev === null);
            var next = prevRecord === null ? this._itHead : prevRecord._next;
            // todo(vicb)
            // assert(next != record);
            // assert(prevRecord != record);
            record._next = next;
            record._prev = prevRecord;
            if (next === null) {
                this._itTail = record;
            }
            else {
                next._prev = record;
            }
            if (prevRecord === null) {
                this._itHead = record;
            }
            else {
                prevRecord._next = record;
            }
            if (this._linkedRecords === null) {
                this._linkedRecords = new _DuplicateMap();
            }
            this._linkedRecords.put(record);
            record.currentIndex = index;
            return record;
        };
        /** @internal */
        DefaultIterableDiffer.prototype._remove = function (record) {
            return this._addToRemovals(this._unlink(record));
        };
        /** @internal */
        DefaultIterableDiffer.prototype._unlink = function (record) {
            if (this._linkedRecords !== null) {
                this._linkedRecords.remove(record);
            }
            var prev = record._prev;
            var next = record._next;
            // todo(vicb)
            // assert((record._prev = null) === null);
            // assert((record._next = null) === null);
            if (prev === null) {
                this._itHead = next;
            }
            else {
                prev._next = next;
            }
            if (next === null) {
                this._itTail = prev;
            }
            else {
                next._prev = prev;
            }
            return record;
        };
        /** @internal */
        DefaultIterableDiffer.prototype._addToMoves = function (record, toIndex) {
            // todo(vicb)
            // assert(record._nextMoved === null);
            if (record.previousIndex === toIndex) {
                return record;
            }
            if (this._movesTail === null) {
                // todo(vicb)
                // assert(_movesHead === null);
                this._movesTail = this._movesHead = record;
            }
            else {
                // todo(vicb)
                // assert(_movesTail._nextMoved === null);
                this._movesTail = this._movesTail._nextMoved = record;
            }
            return record;
        };
        /** @internal */
        DefaultIterableDiffer.prototype._addToRemovals = function (record) {
            if (this._unlinkedRecords === null) {
                this._unlinkedRecords = new _DuplicateMap();
            }
            this._unlinkedRecords.put(record);
            record.currentIndex = null;
            record._nextRemoved = null;
            if (this._removalsTail === null) {
                // todo(vicb)
                // assert(_removalsHead === null);
                this._removalsTail = this._removalsHead = record;
                record._prevRemoved = null;
            }
            else {
                // todo(vicb)
                // assert(_removalsTail._nextRemoved === null);
                // assert(record._nextRemoved === null);
                record._prevRemoved = this._removalsTail;
                this._removalsTail = this._removalsTail._nextRemoved = record;
            }
            return record;
        };
        /** @internal */
        DefaultIterableDiffer.prototype._addIdentityChange = function (record, item) {
            record.item = item;
            if (this._identityChangesTail === null) {
                this._identityChangesTail = this._identityChangesHead = record;
            }
            else {
                this._identityChangesTail = this._identityChangesTail._nextIdentityChange = record;
            }
            return record;
        };
        DefaultIterableDiffer.prototype.toString = function () {
            var list = [];
            this.forEachItem(function (record /** TODO #9100 */) { return list.push(record); });
            var previous = [];
            this.forEachPreviousItem(function (record /** TODO #9100 */) { return previous.push(record); });
            var additions = [];
            this.forEachAddedItem(function (record /** TODO #9100 */) { return additions.push(record); });
            var moves = [];
            this.forEachMovedItem(function (record /** TODO #9100 */) { return moves.push(record); });
            var removals = [];
            this.forEachRemovedItem(function (record /** TODO #9100 */) { return removals.push(record); });
            var identityChanges = [];
            this.forEachIdentityChange(function (record /** TODO #9100 */) { return identityChanges.push(record); });
            return 'collection: ' + list.join(', ') + '\n' +
                'previous: ' + previous.join(', ') + '\n' +
                'additions: ' + additions.join(', ') + '\n' +
                'moves: ' + moves.join(', ') + '\n' +
                'removals: ' + removals.join(', ') + '\n' +
                'identityChanges: ' + identityChanges.join(', ') + '\n';
        };
        return DefaultIterableDiffer;
    }());
    /**
     * @stable
     */
    var CollectionChangeRecord = (function () {
        function CollectionChangeRecord(item, trackById) {
            this.item = item;
            this.trackById = trackById;
            this.currentIndex = null;
            this.previousIndex = null;
            /** @internal */
            this._nextPrevious = null;
            /** @internal */
            this._prev = null;
            /** @internal */
            this._next = null;
            /** @internal */
            this._prevDup = null;
            /** @internal */
            this._nextDup = null;
            /** @internal */
            this._prevRemoved = null;
            /** @internal */
            this._nextRemoved = null;
            /** @internal */
            this._nextAdded = null;
            /** @internal */
            this._nextMoved = null;
            /** @internal */
            this._nextIdentityChange = null;
        }
        CollectionChangeRecord.prototype.toString = function () {
            return this.previousIndex === this.currentIndex ? stringify(this.item) :
                stringify(this.item) + '[' +
                    stringify(this.previousIndex) + '->' + stringify(this.currentIndex) + ']';
        };
        return CollectionChangeRecord;
    }());
    // A linked list of CollectionChangeRecords with the same CollectionChangeRecord.item
    var _DuplicateItemRecordList = (function () {
        function _DuplicateItemRecordList() {
            /** @internal */
            this._head = null;
            /** @internal */
            this._tail = null;
        }
        /**
         * Append the record to the list of duplicates.
         *
         * Note: by design all records in the list of duplicates hold the same value in record.item.
         */
        _DuplicateItemRecordList.prototype.add = function (record) {
            if (this._head === null) {
                this._head = this._tail = record;
                record._nextDup = null;
                record._prevDup = null;
            }
            else {
                // todo(vicb)
                // assert(record.item ==  _head.item ||
                //       record.item is num && record.item.isNaN && _head.item is num && _head.item.isNaN);
                this._tail._nextDup = record;
                record._prevDup = this._tail;
                record._nextDup = null;
                this._tail = record;
            }
        };
        // Returns a CollectionChangeRecord having CollectionChangeRecord.trackById == trackById and
        // CollectionChangeRecord.currentIndex >= afterIndex
        _DuplicateItemRecordList.prototype.get = function (trackById, afterIndex) {
            var record;
            for (record = this._head; record !== null; record = record._nextDup) {
                if ((afterIndex === null || afterIndex < record.currentIndex) &&
                    looseIdentical(record.trackById, trackById)) {
                    return record;
                }
            }
            return null;
        };
        /**
         * Remove one {@link CollectionChangeRecord} from the list of duplicates.
         *
         * Returns whether the list of duplicates is empty.
         */
        _DuplicateItemRecordList.prototype.remove = function (record) {
            // todo(vicb)
            // assert(() {
            //  // verify that the record being removed is in the list.
            //  for (CollectionChangeRecord cursor = _head; cursor != null; cursor = cursor._nextDup) {
            //    if (identical(cursor, record)) return true;
            //  }
            //  return false;
            //});
            var prev = record._prevDup;
            var next = record._nextDup;
            if (prev === null) {
                this._head = next;
            }
            else {
                prev._nextDup = next;
            }
            if (next === null) {
                this._tail = prev;
            }
            else {
                next._prevDup = prev;
            }
            return this._head === null;
        };
        return _DuplicateItemRecordList;
    }());
    var _DuplicateMap = (function () {
        function _DuplicateMap() {
            this.map = new Map();
        }
        _DuplicateMap.prototype.put = function (record) {
            var key = record.trackById;
            var duplicates = this.map.get(key);
            if (!duplicates) {
                duplicates = new _DuplicateItemRecordList();
                this.map.set(key, duplicates);
            }
            duplicates.add(record);
        };
        /**
         * Retrieve the `value` using key. Because the CollectionChangeRecord value may be one which we
         * have already iterated over, we use the afterIndex to pretend it is not there.
         *
         * Use case: `[a, b, c, a, a]` if we are at index `3` which is the second `a` then asking if we
         * have any more `a`s needs to return the last `a` not the first or second.
         */
        _DuplicateMap.prototype.get = function (trackById, afterIndex) {
            if (afterIndex === void 0) { afterIndex = null; }
            var key = trackById;
            var recordList = this.map.get(key);
            return recordList ? recordList.get(trackById, afterIndex) : null;
        };
        /**
         * Removes a {@link CollectionChangeRecord} from the list of duplicates.
         *
         * The list of duplicates also is removed from the map if it gets empty.
         */
        _DuplicateMap.prototype.remove = function (record) {
            var key = record.trackById;
            var recordList = this.map.get(key);
            // Remove the list of duplicates when it gets empty
            if (recordList.remove(record)) {
                this.map.delete(key);
            }
            return record;
        };
        Object.defineProperty(_DuplicateMap.prototype, "isEmpty", {
            get: function () { return this.map.size === 0; },
            enumerable: true,
            configurable: true
        });
        _DuplicateMap.prototype.clear = function () { this.map.clear(); };
        _DuplicateMap.prototype.toString = function () { return '_DuplicateMap(' + stringify(this.map) + ')'; };
        return _DuplicateMap;
    }());
    function getPreviousIndex(item, addRemoveOffset, moveOffsets) {
        var previousIndex = item.previousIndex;
        if (previousIndex === null)
            return previousIndex;
        var moveOffset = 0;
        if (moveOffsets && previousIndex < moveOffsets.length) {
            moveOffset = moveOffsets[previousIndex];
        }
        return previousIndex + addRemoveOffset + moveOffset;
    }

    var DefaultKeyValueDifferFactory = (function () {
        function DefaultKeyValueDifferFactory() {
        }
        DefaultKeyValueDifferFactory.prototype.supports = function (obj) { return obj instanceof Map || isJsObject(obj); };
        DefaultKeyValueDifferFactory.prototype.create = function (cdRef) { return new DefaultKeyValueDiffer(); };
        return DefaultKeyValueDifferFactory;
    }());
    var DefaultKeyValueDiffer = (function () {
        function DefaultKeyValueDiffer() {
            this._records = new Map();
            this._mapHead = null;
            this._previousMapHead = null;
            this._changesHead = null;
            this._changesTail = null;
            this._additionsHead = null;
            this._additionsTail = null;
            this._removalsHead = null;
            this._removalsTail = null;
        }
        Object.defineProperty(DefaultKeyValueDiffer.prototype, "isDirty", {
            get: function () {
                return this._additionsHead !== null || this._changesHead !== null ||
                    this._removalsHead !== null;
            },
            enumerable: true,
            configurable: true
        });
        DefaultKeyValueDiffer.prototype.forEachItem = function (fn) {
            var record;
            for (record = this._mapHead; record !== null; record = record._next) {
                fn(record);
            }
        };
        DefaultKeyValueDiffer.prototype.forEachPreviousItem = function (fn) {
            var record;
            for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
                fn(record);
            }
        };
        DefaultKeyValueDiffer.prototype.forEachChangedItem = function (fn) {
            var record;
            for (record = this._changesHead; record !== null; record = record._nextChanged) {
                fn(record);
            }
        };
        DefaultKeyValueDiffer.prototype.forEachAddedItem = function (fn) {
            var record;
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
                fn(record);
            }
        };
        DefaultKeyValueDiffer.prototype.forEachRemovedItem = function (fn) {
            var record;
            for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
                fn(record);
            }
        };
        DefaultKeyValueDiffer.prototype.diff = function (map) {
            if (!map) {
                map = new Map();
            }
            else if (!(map instanceof Map || isJsObject(map))) {
                throw new Error("Error trying to diff '" + map + "'");
            }
            return this.check(map) ? this : null;
        };
        DefaultKeyValueDiffer.prototype.onDestroy = function () { };
        DefaultKeyValueDiffer.prototype.check = function (map) {
            var _this = this;
            this._reset();
            var records = this._records;
            var oldSeqRecord = this._mapHead;
            var lastOldSeqRecord = null;
            var lastNewSeqRecord = null;
            var seqChanged = false;
            this._forEach(map, function (value, key) {
                var newSeqRecord;
                if (oldSeqRecord && key === oldSeqRecord.key) {
                    newSeqRecord = oldSeqRecord;
                    _this._maybeAddToChanges(newSeqRecord, value);
                }
                else {
                    seqChanged = true;
                    if (oldSeqRecord !== null) {
                        _this._removeFromSeq(lastOldSeqRecord, oldSeqRecord);
                        _this._addToRemovals(oldSeqRecord);
                    }
                    if (records.has(key)) {
                        newSeqRecord = records.get(key);
                        _this._maybeAddToChanges(newSeqRecord, value);
                    }
                    else {
                        newSeqRecord = new KeyValueChangeRecord(key);
                        records.set(key, newSeqRecord);
                        newSeqRecord.currentValue = value;
                        _this._addToAdditions(newSeqRecord);
                    }
                }
                if (seqChanged) {
                    if (_this._isInRemovals(newSeqRecord)) {
                        _this._removeFromRemovals(newSeqRecord);
                    }
                    if (lastNewSeqRecord == null) {
                        _this._mapHead = newSeqRecord;
                    }
                    else {
                        lastNewSeqRecord._next = newSeqRecord;
                    }
                }
                lastOldSeqRecord = oldSeqRecord;
                lastNewSeqRecord = newSeqRecord;
                oldSeqRecord = oldSeqRecord && oldSeqRecord._next;
            });
            this._truncate(lastOldSeqRecord, oldSeqRecord);
            return this.isDirty;
        };
        /** @internal */
        DefaultKeyValueDiffer.prototype._reset = function () {
            if (this.isDirty) {
                var record = void 0;
                // Record the state of the mapping
                for (record = this._previousMapHead = this._mapHead; record !== null; record = record._next) {
                    record._nextPrevious = record._next;
                }
                for (record = this._changesHead; record !== null; record = record._nextChanged) {
                    record.previousValue = record.currentValue;
                }
                for (record = this._additionsHead; record != null; record = record._nextAdded) {
                    record.previousValue = record.currentValue;
                }
                this._changesHead = this._changesTail = null;
                this._additionsHead = this._additionsTail = null;
                this._removalsHead = this._removalsTail = null;
            }
        };
        /** @internal */
        DefaultKeyValueDiffer.prototype._truncate = function (lastRecord, record) {
            while (record !== null) {
                if (lastRecord === null) {
                    this._mapHead = null;
                }
                else {
                    lastRecord._next = null;
                }
                var nextRecord = record._next;
                this._addToRemovals(record);
                lastRecord = record;
                record = nextRecord;
            }
            for (var rec = this._removalsHead; rec !== null; rec = rec._nextRemoved) {
                rec.previousValue = rec.currentValue;
                rec.currentValue = null;
                this._records.delete(rec.key);
            }
        };
        DefaultKeyValueDiffer.prototype._maybeAddToChanges = function (record, newValue) {
            if (!looseIdentical(newValue, record.currentValue)) {
                record.previousValue = record.currentValue;
                record.currentValue = newValue;
                this._addToChanges(record);
            }
        };
        /** @internal */
        DefaultKeyValueDiffer.prototype._isInRemovals = function (record) {
            return record === this._removalsHead || record._nextRemoved !== null ||
                record._prevRemoved !== null;
        };
        /** @internal */
        DefaultKeyValueDiffer.prototype._addToRemovals = function (record) {
            if (this._removalsHead === null) {
                this._removalsHead = this._removalsTail = record;
            }
            else {
                this._removalsTail._nextRemoved = record;
                record._prevRemoved = this._removalsTail;
                this._removalsTail = record;
            }
        };
        /** @internal */
        DefaultKeyValueDiffer.prototype._removeFromSeq = function (prev, record) {
            var next = record._next;
            if (prev === null) {
                this._mapHead = next;
            }
            else {
                prev._next = next;
            }
            record._next = null;
        };
        /** @internal */
        DefaultKeyValueDiffer.prototype._removeFromRemovals = function (record) {
            var prev = record._prevRemoved;
            var next = record._nextRemoved;
            if (prev === null) {
                this._removalsHead = next;
            }
            else {
                prev._nextRemoved = next;
            }
            if (next === null) {
                this._removalsTail = prev;
            }
            else {
                next._prevRemoved = prev;
            }
            record._prevRemoved = record._nextRemoved = null;
        };
        /** @internal */
        DefaultKeyValueDiffer.prototype._addToAdditions = function (record) {
            if (this._additionsHead === null) {
                this._additionsHead = this._additionsTail = record;
            }
            else {
                this._additionsTail._nextAdded = record;
                this._additionsTail = record;
            }
        };
        /** @internal */
        DefaultKeyValueDiffer.prototype._addToChanges = function (record) {
            if (this._changesHead === null) {
                this._changesHead = this._changesTail = record;
            }
            else {
                this._changesTail._nextChanged = record;
                this._changesTail = record;
            }
        };
        DefaultKeyValueDiffer.prototype.toString = function () {
            var items = [];
            var previous = [];
            var changes = [];
            var additions = [];
            var removals = [];
            var record;
            for (record = this._mapHead; record !== null; record = record._next) {
                items.push(stringify(record));
            }
            for (record = this._previousMapHead; record !== null; record = record._nextPrevious) {
                previous.push(stringify(record));
            }
            for (record = this._changesHead; record !== null; record = record._nextChanged) {
                changes.push(stringify(record));
            }
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
                additions.push(stringify(record));
            }
            for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
                removals.push(stringify(record));
            }
            return 'map: ' + items.join(', ') + '\n' +
                'previous: ' + previous.join(', ') + '\n' +
                'additions: ' + additions.join(', ') + '\n' +
                'changes: ' + changes.join(', ') + '\n' +
                'removals: ' + removals.join(', ') + '\n';
        };
        /** @internal */
        DefaultKeyValueDiffer.prototype._forEach = function (obj, fn) {
            if (obj instanceof Map) {
                obj.forEach(fn);
            }
            else {
                Object.keys(obj).forEach(function (k) { return fn(obj[k], k); });
            }
        };
        return DefaultKeyValueDiffer;
    }());
    /**
     * @stable
     */
    var KeyValueChangeRecord = (function () {
        function KeyValueChangeRecord(key) {
            this.key = key;
            this.previousValue = null;
            this.currentValue = null;
            /** @internal */
            this._nextPrevious = null;
            /** @internal */
            this._next = null;
            /** @internal */
            this._nextAdded = null;
            /** @internal */
            this._nextRemoved = null;
            /** @internal */
            this._prevRemoved = null;
            /** @internal */
            this._nextChanged = null;
        }
        KeyValueChangeRecord.prototype.toString = function () {
            return looseIdentical(this.previousValue, this.currentValue) ?
                stringify(this.key) :
                (stringify(this.key) + '[' + stringify(this.previousValue) + '->' +
                    stringify(this.currentValue) + ']');
        };
        return KeyValueChangeRecord;
    }());

    /**
     * A repository of different iterable diffing strategies used by NgFor, NgClass, and others.
     * @stable
     */
    var IterableDiffers = (function () {
        function IterableDiffers(factories) {
            this.factories = factories;
        }
        IterableDiffers.create = function (factories, parent) {
            if (isPresent(parent)) {
                var copied = parent.factories.slice();
                factories = factories.concat(copied);
                return new IterableDiffers(factories);
            }
            else {
                return new IterableDiffers(factories);
            }
        };
        /**
         * Takes an array of {@link IterableDifferFactory} and returns a provider used to extend the
         * inherited {@link IterableDiffers} instance with the provided factories and return a new
         * {@link IterableDiffers} instance.
         *
         * The following example shows how to extend an existing list of factories,
               * which will only be applied to the injector for this component and its children.
               * This step is all that's required to make a new {@link IterableDiffer} available.
         *
         * ### Example
         *
         * ```
         * @Component({
         *   viewProviders: [
         *     IterableDiffers.extend([new ImmutableListDiffer()])
         *   ]
         * })
         * ```
         */
        IterableDiffers.extend = function (factories) {
            return {
                provide: IterableDiffers,
                useFactory: function (parent) {
                    if (!parent) {
                        // Typically would occur when calling IterableDiffers.extend inside of dependencies passed
                        // to
                        // bootstrap(), which would override default pipes instead of extending them.
                        throw new Error('Cannot extend IterableDiffers without a parent injector');
                    }
                    return IterableDiffers.create(factories, parent);
                },
                // Dependency technically isn't optional, but we can provide a better error message this way.
                deps: [[IterableDiffers, new SkipSelf(), new Optional()]]
            };
        };
        IterableDiffers.prototype.find = function (iterable) {
            var factory = this.factories.find(function (f) { return f.supports(iterable); });
            if (isPresent(factory)) {
                return factory;
            }
            else {
                throw new Error("Cannot find a differ supporting object '" + iterable + "' of type '" + getTypeNameForDebugging(iterable) + "'");
            }
        };
        return IterableDiffers;
    }());

    /**
     * A repository of different Map diffing strategies used by NgClass, NgStyle, and others.
     * @stable
     */
    var KeyValueDiffers = (function () {
        function KeyValueDiffers(factories) {
            this.factories = factories;
        }
        KeyValueDiffers.create = function (factories, parent) {
            if (isPresent(parent)) {
                var copied = parent.factories.slice();
                factories = factories.concat(copied);
                return new KeyValueDiffers(factories);
            }
            else {
                return new KeyValueDiffers(factories);
            }
        };
        /**
         * Takes an array of {@link KeyValueDifferFactory} and returns a provider used to extend the
         * inherited {@link KeyValueDiffers} instance with the provided factories and return a new
         * {@link KeyValueDiffers} instance.
         *
         * The following example shows how to extend an existing list of factories,
               * which will only be applied to the injector for this component and its children.
               * This step is all that's required to make a new {@link KeyValueDiffer} available.
         *
         * ### Example
         *
         * ```
         * @Component({
         *   viewProviders: [
         *     KeyValueDiffers.extend([new ImmutableMapDiffer()])
         *   ]
         * })
         * ```
         */
        KeyValueDiffers.extend = function (factories) {
            return {
                provide: KeyValueDiffers,
                useFactory: function (parent) {
                    if (!parent) {
                        // Typically would occur when calling KeyValueDiffers.extend inside of dependencies passed
                        // to
                        // bootstrap(), which would override default pipes instead of extending them.
                        throw new Error('Cannot extend KeyValueDiffers without a parent injector');
                    }
                    return KeyValueDiffers.create(factories, parent);
                },
                // Dependency technically isn't optional, but we can provide a better error message this way.
                deps: [[KeyValueDiffers, new SkipSelf(), new Optional()]]
            };
        };
        KeyValueDiffers.prototype.find = function (kv) {
            var factory = this.factories.find(function (f) { return f.supports(kv); });
            if (isPresent(factory)) {
                return factory;
            }
            else {
                throw new Error("Cannot find a differ supporting object '" + kv + "'");
            }
        };
        return KeyValueDiffers;
    }());

    var UNINITIALIZED = {
        toString: function () { return 'CD_INIT_VALUE'; }
    };
    function devModeEqual(a, b) {
        if (isListLikeIterable(a) && isListLikeIterable(b)) {
            return areIterablesEqual(a, b, devModeEqual);
        }
        else if (!isListLikeIterable(a) && !isPrimitive(a) && !isListLikeIterable(b) && !isPrimitive(b)) {
            return true;
        }
        else {
            return looseIdentical(a, b);
        }
    }
    /**
     * Indicates that the result of a {@link Pipe} transformation has changed even though the
     * reference
     * has not changed.
     *
     * The wrapped value will be unwrapped by change detection, and the unwrapped value will be stored.
     *
     * Example:
     *
     * ```
     * if (this._latestValue === this._latestReturnedValue) {
     *    return this._latestReturnedValue;
     *  } else {
     *    this._latestReturnedValue = this._latestValue;
     *    return WrappedValue.wrap(this._latestValue); // this will force update
     *  }
     * ```
     * @stable
     */
    var WrappedValue = (function () {
        function WrappedValue(wrapped) {
            this.wrapped = wrapped;
        }
        WrappedValue.wrap = function (value) { return new WrappedValue(value); };
        return WrappedValue;
    }());
    /**
     * Helper class for unwrapping WrappedValue s
     */
    var ValueUnwrapper = (function () {
        function ValueUnwrapper() {
            this.hasWrappedValue = false;
        }
        ValueUnwrapper.prototype.unwrap = function (value) {
            if (value instanceof WrappedValue) {
                this.hasWrappedValue = true;
                return value.wrapped;
            }
            return value;
        };
        ValueUnwrapper.prototype.reset = function () { this.hasWrappedValue = false; };
        return ValueUnwrapper;
    }());
    /**
     * Represents a basic change from a previous to a new value.
     * @stable
     */
    var SimpleChange = (function () {
        function SimpleChange(previousValue, currentValue) {
            this.previousValue = previousValue;
            this.currentValue = currentValue;
        }
        /**
         * Check whether the new value is the first value assigned.
         */
        SimpleChange.prototype.isFirstChange = function () { return this.previousValue === UNINITIALIZED; };
        return SimpleChange;
    }());

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * @stable
     */
    var ChangeDetectorRef = (function () {
        function ChangeDetectorRef() {
        }
        return ChangeDetectorRef;
    }());

    /**
     * Structural diffing for `Object`s and `Map`s.
     */
    var keyValDiff = [new DefaultKeyValueDifferFactory()];
    /**
     * Structural diffing for `Iterable` types such as `Array`s.
     */
    var iterableDiff = [new DefaultIterableDifferFactory()];
    var defaultIterableDiffers = new IterableDiffers(iterableDiff);
    var defaultKeyValueDiffers = new KeyValueDiffers(keyValDiff);

    /**
     * @experimental
     */
    // TODO (matsko): add typing for the animation function
    var RenderComponentType = (function () {
        function RenderComponentType(id, templateUrl, slotCount, encapsulation, styles, animations) {
            this.id = id;
            this.templateUrl = templateUrl;
            this.slotCount = slotCount;
            this.encapsulation = encapsulation;
            this.styles = styles;
            this.animations = animations;
        }
        return RenderComponentType;
    }());
    var RenderDebugInfo = (function () {
        function RenderDebugInfo() {
        }
        Object.defineProperty(RenderDebugInfo.prototype, "injector", {
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RenderDebugInfo.prototype, "component", {
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RenderDebugInfo.prototype, "providerTokens", {
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RenderDebugInfo.prototype, "references", {
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RenderDebugInfo.prototype, "context", {
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RenderDebugInfo.prototype, "source", {
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        return RenderDebugInfo;
    }());
    /**
     * @experimental
     */
    var Renderer = (function () {
        function Renderer() {
        }
        return Renderer;
    }());
    /**
     * Injectable service that provides a low-level interface for modifying the UI.
     *
     * Use this service to bypass Angular's templating and make custom UI changes that can't be
     * expressed declaratively. For example if you need to set a property or an attribute whose name is
     * not statically known, use {@link #setElementProperty} or {@link #setElementAttribute}
     * respectively.
     *
     * If you are implementing a custom renderer, you must implement this interface.
     *
     * The default Renderer implementation is `DomRenderer`. Also available is `WebWorkerRenderer`.
     * @experimental
     */
    var RootRenderer = (function () {
        function RootRenderer() {
        }
        return RootRenderer;
    }());

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * A SecurityContext marks a location that has dangerous security implications, e.g. a DOM property
     * like `innerHTML` that could cause Cross Site Scripting (XSS) security bugs when improperly
     * handled.
     *
     * See DomSanitizer for more details on security in Angular applications.
     *
     * @stable
     */
    exports.SecurityContext;
    (function (SecurityContext) {
        SecurityContext[SecurityContext["NONE"] = 0] = "NONE";
        SecurityContext[SecurityContext["HTML"] = 1] = "HTML";
        SecurityContext[SecurityContext["STYLE"] = 2] = "STYLE";
        SecurityContext[SecurityContext["SCRIPT"] = 3] = "SCRIPT";
        SecurityContext[SecurityContext["URL"] = 4] = "URL";
        SecurityContext[SecurityContext["RESOURCE_URL"] = 5] = "RESOURCE_URL";
    })(exports.SecurityContext || (exports.SecurityContext = {}));
    /**
     * Sanitizer is used by the views to sanitize potentially dangerous values.
     *
     * @stable
     */
    var Sanitizer = (function () {
        function Sanitizer() {
        }
        return Sanitizer;
    }());

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * A wrapper around a native element inside of a View.
     *
     * An `ElementRef` is backed by a render-specific element. In the browser, this is usually a DOM
     * element.
     *
     * @security Permitting direct access to the DOM can make your application more vulnerable to
     * XSS attacks. Carefully review any use of `ElementRef` in your code. For more detail, see the
     * [Security Guide](http://g.co/ng/security).
     *
     * @stable
     */
    // Note: We don't expose things like `Injector`, `ViewContainer`, ... here,
    // i.e. users have to ask for what they need. With that, we can build better analysis tools
    // and could do better codegen in the future.
    var ElementRef = (function () {
        function ElementRef(nativeElement) {
            this.nativeElement = nativeElement;
        }
        return ElementRef;
    }());

    var trace;
    var events;
    function detectWTF() {
        var wtf = global$1['wtf'];
        if (wtf) {
            trace = wtf['trace'];
            if (trace) {
                events = trace['events'];
                return true;
            }
        }
        return false;
    }
    function createScope(signature, flags) {
        if (flags === void 0) { flags = null; }
        return events.createScope(signature, flags);
    }
    function leave(scope, returnValue) {
        trace.leaveScope(scope, returnValue);
        return returnValue;
    }
    function startTimeRange(rangeType, action) {
        return trace.beginTimeRange(rangeType, action);
    }
    function endTimeRange(range) {
        trace.endTimeRange(range);
    }

    /**
     * True if WTF is enabled.
     */
    var wtfEnabled = detectWTF();
    function noopScope(arg0, arg1) {
        return null;
    }
    /**
     * Create trace scope.
     *
     * Scopes must be strictly nested and are analogous to stack frames, but
     * do not have to follow the stack frames. Instead it is recommended that they follow logical
     * nesting. You may want to use
     * [Event
     * Signatures](http://google.github.io/tracing-framework/instrumenting-code.html#custom-events)
     * as they are defined in WTF.
     *
     * Used to mark scope entry. The return value is used to leave the scope.
     *
     *     var myScope = wtfCreateScope('MyClass#myMethod(ascii someVal)');
     *
     *     someMethod() {
     *        var s = myScope('Foo'); // 'Foo' gets stored in tracing UI
     *        // DO SOME WORK HERE
     *        return wtfLeave(s, 123); // Return value 123
     *     }
     *
     * Note, adding try-finally block around the work to ensure that `wtfLeave` gets called can
     * negatively impact the performance of your application. For this reason we recommend that
     * you don't add them to ensure that `wtfLeave` gets called. In production `wtfLeave` is a noop and
     * so try-finally block has no value. When debugging perf issues, skipping `wtfLeave`, do to
     * exception, will produce incorrect trace, but presence of exception signifies logic error which
     * needs to be fixed before the app should be profiled. Add try-finally only when you expect that
     * an exception is expected during normal execution while profiling.
     *
     * @experimental
     */
    var wtfCreateScope = wtfEnabled ? createScope : function (signature, flags) { return noopScope; };
    /**
     * Used to mark end of Scope.
     *
     * - `scope` to end.
     * - `returnValue` (optional) to be passed to the WTF.
     *
     * Returns the `returnValue for easy chaining.
     * @experimental
     */
    var wtfLeave = wtfEnabled ? leave : function (s, r) { return r; };
    /**
     * Used to mark Async start. Async are similar to scope but they don't have to be strictly nested.
     * The return value is used in the call to [endAsync]. Async ranges only work if WTF has been
     * enabled.
     *
     *     someMethod() {
     *        var s = wtfStartTimeRange('HTTP:GET', 'some.url');
     *        var future = new Future.delay(5).then((_) {
     *          wtfEndTimeRange(s);
     *        });
     *     }
     * @experimental
     */
    var wtfStartTimeRange = wtfEnabled ? startTimeRange : function (rangeType, action) { return null; };
    /**
     * Ends a async time range operation.
     * [range] is the return value from [wtfStartTimeRange] Async ranges only work if WTF has been
     * enabled.
     * @experimental
     */
    var wtfEndTimeRange = wtfEnabled ? endTimeRange : function (r) { return null; };

    /**
     * Represents a container where one or more Views can be attached.
     *
     * The container can contain two kinds of Views. Host Views, created by instantiating a
     * {@link Component} via {@link #createComponent}, and Embedded Views, created by instantiating an
     * {@link TemplateRef Embedded Template} via {@link #createEmbeddedView}.
     *
     * The location of the View Container within the containing View is specified by the Anchor
     * `element`. Each View Container can have only one Anchor Element and each Anchor Element can only
     * have a single View Container.
     *
     * Root elements of Views attached to this container become siblings of the Anchor Element in
     * the Rendered View.
     *
     * To access a `ViewContainerRef` of an Element, you can either place a {@link Directive} injected
     * with `ViewContainerRef` on the Element, or you obtain it via a {@link ViewChild} query.
     * @stable
     */
    var ViewContainerRef = (function () {
        function ViewContainerRef() {
        }
        Object.defineProperty(ViewContainerRef.prototype, "element", {
            /**
             * Anchor element that specifies the location of this container in the containing View.
             * <!-- TODO: rename to anchorElement -->
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewContainerRef.prototype, "injector", {
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewContainerRef.prototype, "parentInjector", {
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewContainerRef.prototype, "length", {
            /**
             * Returns the number of Views currently attached to this container.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        ;
        return ViewContainerRef;
    }());
    var ViewContainerRef_ = (function () {
        function ViewContainerRef_(_element) {
            this._element = _element;
            /** @internal */
            this._createComponentInContainerScope = wtfCreateScope('ViewContainerRef#createComponent()');
            /** @internal */
            this._insertScope = wtfCreateScope('ViewContainerRef#insert()');
            /** @internal */
            this._removeScope = wtfCreateScope('ViewContainerRef#remove()');
            /** @internal */
            this._detachScope = wtfCreateScope('ViewContainerRef#detach()');
        }
        ViewContainerRef_.prototype.get = function (index) { return this._element.nestedViews[index].ref; };
        Object.defineProperty(ViewContainerRef_.prototype, "length", {
            get: function () {
                var views = this._element.nestedViews;
                return isPresent(views) ? views.length : 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewContainerRef_.prototype, "element", {
            get: function () { return this._element.elementRef; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewContainerRef_.prototype, "injector", {
            get: function () { return this._element.injector; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewContainerRef_.prototype, "parentInjector", {
            get: function () { return this._element.parentInjector; },
            enumerable: true,
            configurable: true
        });
        // TODO(rado): profile and decide whether bounds checks should be added
        // to the methods below.
        ViewContainerRef_.prototype.createEmbeddedView = function (templateRef, context, index) {
            if (context === void 0) { context = null; }
            if (index === void 0) { index = -1; }
            var viewRef = templateRef.createEmbeddedView(context);
            this.insert(viewRef, index);
            return viewRef;
        };
        ViewContainerRef_.prototype.createComponent = function (componentFactory, index, injector, projectableNodes) {
            if (index === void 0) { index = -1; }
            if (injector === void 0) { injector = null; }
            if (projectableNodes === void 0) { projectableNodes = null; }
            var s = this._createComponentInContainerScope();
            var contextInjector = injector || this._element.parentInjector;
            var componentRef = componentFactory.create(contextInjector, projectableNodes);
            this.insert(componentRef.hostView, index);
            return wtfLeave(s, componentRef);
        };
        // TODO(i): refactor insert+remove into move
        ViewContainerRef_.prototype.insert = function (viewRef, index) {
            if (index === void 0) { index = -1; }
            var s = this._insertScope();
            if (index == -1)
                index = this.length;
            var viewRef_ = viewRef;
            this._element.attachView(viewRef_.internalView, index);
            return wtfLeave(s, viewRef_);
        };
        ViewContainerRef_.prototype.move = function (viewRef, currentIndex) {
            var s = this._insertScope();
            if (currentIndex == -1)
                return;
            var viewRef_ = viewRef;
            this._element.moveView(viewRef_.internalView, currentIndex);
            return wtfLeave(s, viewRef_);
        };
        ViewContainerRef_.prototype.indexOf = function (viewRef) {
            return this._element.nestedViews.indexOf(viewRef.internalView);
        };
        // TODO(i): rename to destroy
        ViewContainerRef_.prototype.remove = function (index) {
            if (index === void 0) { index = -1; }
            var s = this._removeScope();
            if (index == -1)
                index = this.length - 1;
            var view = this._element.detachView(index);
            view.destroy();
            // view is intentionally not returned to the client.
            wtfLeave(s);
        };
        // TODO(i): refactor insert+remove into move
        ViewContainerRef_.prototype.detach = function (index) {
            if (index === void 0) { index = -1; }
            var s = this._detachScope();
            if (index == -1)
                index = this.length - 1;
            var view = this._element.detachView(index);
            return wtfLeave(s, view.ref);
        };
        ViewContainerRef_.prototype.clear = function () {
            for (var i = this.length - 1; i >= 0; i--) {
                this.remove(i);
            }
        };
        return ViewContainerRef_;
    }());

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ViewType;
    (function (ViewType) {
        // A view that contains the host element with bound component directive.
        // Contains a COMPONENT view
        ViewType[ViewType["HOST"] = 0] = "HOST";
        // The view of the component
        // Can contain 0 to n EMBEDDED views
        ViewType[ViewType["COMPONENT"] = 1] = "COMPONENT";
        // A view that is embedded into another View via a <template> element
        // inside of a COMPONENT view
        ViewType[ViewType["EMBEDDED"] = 2] = "EMBEDDED";
    })(ViewType || (ViewType = {}));

    /**
     * An AppElement is created for elements that have a ViewContainerRef,
     * a nested component or a <template> element to keep data around
     * that is needed for later instantiations.
     */
    var AppElement = (function () {
        function AppElement(index, parentIndex, parentView, nativeElement) {
            this.index = index;
            this.parentIndex = parentIndex;
            this.parentView = parentView;
            this.nativeElement = nativeElement;
            this.nestedViews = null;
            this.componentView = null;
        }
        Object.defineProperty(AppElement.prototype, "elementRef", {
            get: function () { return new ElementRef(this.nativeElement); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppElement.prototype, "vcRef", {
            get: function () { return new ViewContainerRef_(this); },
            enumerable: true,
            configurable: true
        });
        AppElement.prototype.initComponent = function (component, componentConstructorViewQueries, view) {
            this.component = component;
            this.componentConstructorViewQueries = componentConstructorViewQueries;
            this.componentView = view;
        };
        Object.defineProperty(AppElement.prototype, "parentInjector", {
            get: function () { return this.parentView.injector(this.parentIndex); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppElement.prototype, "injector", {
            get: function () { return this.parentView.injector(this.index); },
            enumerable: true,
            configurable: true
        });
        AppElement.prototype.mapNestedViews = function (nestedViewClass, callback) {
            var result = [];
            if (isPresent(this.nestedViews)) {
                this.nestedViews.forEach(function (nestedView) {
                    if (nestedView.clazz === nestedViewClass) {
                        result.push(callback(nestedView));
                    }
                });
            }
            return result;
        };
        AppElement.prototype.moveView = function (view, currentIndex) {
            var previousIndex = this.nestedViews.indexOf(view);
            if (view.type === ViewType.COMPONENT) {
                throw new Error("Component views can't be moved!");
            }
            var nestedViews = this.nestedViews;
            if (nestedViews == null) {
                nestedViews = [];
                this.nestedViews = nestedViews;
            }
            nestedViews.splice(previousIndex, 1);
            nestedViews.splice(currentIndex, 0, view);
            var refRenderNode;
            if (currentIndex > 0) {
                var prevView = nestedViews[currentIndex - 1];
                refRenderNode = prevView.lastRootNode;
            }
            else {
                refRenderNode = this.nativeElement;
            }
            if (isPresent(refRenderNode)) {
                view.renderer.attachViewAfter(refRenderNode, view.flatRootNodes);
            }
            view.markContentChildAsMoved(this);
        };
        AppElement.prototype.attachView = function (view, viewIndex) {
            if (view.type === ViewType.COMPONENT) {
                throw new Error("Component views can't be moved!");
            }
            var nestedViews = this.nestedViews;
            if (nestedViews == null) {
                nestedViews = [];
                this.nestedViews = nestedViews;
            }
            nestedViews.splice(viewIndex, 0, view);
            var refRenderNode;
            if (viewIndex > 0) {
                var prevView = nestedViews[viewIndex - 1];
                refRenderNode = prevView.lastRootNode;
            }
            else {
                refRenderNode = this.nativeElement;
            }
            if (isPresent(refRenderNode)) {
                view.renderer.attachViewAfter(refRenderNode, view.flatRootNodes);
            }
            view.addToContentChildren(this);
        };
        AppElement.prototype.detachView = function (viewIndex) {
            var view = this.nestedViews.splice(viewIndex, 1)[0];
            if (view.type === ViewType.COMPONENT) {
                throw new Error("Component views can't be moved!");
            }
            view.detach();
            view.removeFromContentChildren(this);
            return view;
        };
        return AppElement;
    }());

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var __extends$6 = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    /**
     * An error thrown if application changes model breaking the top-down data flow.
     *
     * This exception is only thrown in dev mode.
     *
     * <!-- TODO: Add a link once the dev mode option is configurable -->
     *
     * ### Example
     *
     * ```typescript
     * @Component({
     *   selector: 'parent',
     *   template: '<child [prop]="parentProp"></child>',
     * })
     * class Parent {
     *   parentProp = 'init';
     * }
     *
     * @Directive({selector: 'child', inputs: ['prop']})
     * class Child {
     *   constructor(public parent: Parent) {}
     *
     *   set prop(v) {
     *     // this updates the parent property, which is disallowed during change detection
     *     // this will result in ExpressionChangedAfterItHasBeenCheckedError
     *     this.parent.parentProp = 'updated';
     *   }
     * }
     * ```
     * @stable
     */
    var ExpressionChangedAfterItHasBeenCheckedError = (function (_super) {
        __extends$6(ExpressionChangedAfterItHasBeenCheckedError, _super);
        function ExpressionChangedAfterItHasBeenCheckedError(oldValue, currValue) {
            var msg = "Expression has changed after it was checked. Previous value: '" + oldValue + "'. Current value: '" + currValue + "'.";
            if (oldValue === UNINITIALIZED) {
                msg +=
                    " It seems like the view has been created after its parent and its children have been dirty checked." +
                        " Has it been created in a change detection hook ?";
            }
            _super.call(this, msg);
        }
        return ExpressionChangedAfterItHasBeenCheckedError;
    }(BaseError));
    /**
     * Thrown when an exception was raised during view creation, change detection or destruction.
     *
     * This error wraps the original exception to attach additional contextual information that can
     * be useful for debugging.
     * @stable
     */
    var ViewWrappedError = (function (_super) {
        __extends$6(ViewWrappedError, _super);
        function ViewWrappedError(originalError, context) {
            _super.call(this, "Error in " + context.source, originalError);
            this.context = context;
        }
        return ViewWrappedError;
    }(WrappedError));
    /**
     * Thrown when a destroyed view is used.
     *
     * This error indicates a bug in the framework.
     *
     * This is an internal Angular error.
     * @stable
     */
    var ViewDestroyedError = (function (_super) {
        __extends$6(ViewDestroyedError, _super);
        function ViewDestroyedError(details) {
            _super.call(this, "Attempt to use a destroyed view: " + details);
        }
        return ViewDestroyedError;
    }(BaseError));

    var ViewUtils = (function () {
        function ViewUtils(_renderer, _appId, sanitizer) {
            this._renderer = _renderer;
            this._appId = _appId;
            this._nextCompTypeId = 0;
            this.sanitizer = sanitizer;
        }
        /**
         * Used by the generated code
         */
        // TODO (matsko): add typing for the animation function
        ViewUtils.prototype.createRenderComponentType = function (templateUrl, slotCount, encapsulation, styles, animations) {
            return new RenderComponentType(this._appId + "-" + this._nextCompTypeId++, templateUrl, slotCount, encapsulation, styles, animations);
        };
        /** @internal */
        ViewUtils.prototype.renderComponent = function (renderComponentType) {
            return this._renderer.renderComponent(renderComponentType);
        };
        ViewUtils.decorators = [
            { type: Injectable },
        ];
        /** @nocollapse */
        ViewUtils.ctorParameters = [
            { type: RootRenderer, },
            { type: undefined, decorators: [{ type: Inject, args: [APP_ID,] },] },
            { type: Sanitizer, },
        ];
        return ViewUtils;
    }());
    function flattenNestedViewRenderNodes(nodes) {
        return _flattenNestedViewRenderNodes(nodes, []);
    }
    function _flattenNestedViewRenderNodes(nodes, renderNodes) {
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (node instanceof AppElement) {
                var appEl = node;
                renderNodes.push(appEl.nativeElement);
                if (isPresent(appEl.nestedViews)) {
                    for (var k = 0; k < appEl.nestedViews.length; k++) {
                        _flattenNestedViewRenderNodes(appEl.nestedViews[k].rootNodesOrAppElements, renderNodes);
                    }
                }
            }
            else {
                renderNodes.push(node);
            }
        }
        return renderNodes;
    }
    var EMPTY_ARR = [];
    function ensureSlotCount(projectableNodes, expectedSlotCount) {
        var res;
        if (!projectableNodes) {
            res = EMPTY_ARR;
        }
        else if (projectableNodes.length < expectedSlotCount) {
            var givenSlotCount = projectableNodes.length;
            res = new Array(expectedSlotCount);
            for (var i = 0; i < expectedSlotCount; i++) {
                res[i] = (i < givenSlotCount) ? projectableNodes[i] : EMPTY_ARR;
            }
        }
        else {
            res = projectableNodes;
        }
        return res;
    }
    var MAX_INTERPOLATION_VALUES = 9;
    function interpolate(valueCount, c0, a1, c1, a2, c2, a3, c3, a4, c4, a5, c5, a6, c6, a7, c7, a8, c8, a9, c9) {
        switch (valueCount) {
            case 1:
                return c0 + _toStringWithNull(a1) + c1;
            case 2:
                return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2;
            case 3:
                return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                    c3;
            case 4:
                return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                    c3 + _toStringWithNull(a4) + c4;
            case 5:
                return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                    c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5;
            case 6:
                return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                    c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) + c6;
            case 7:
                return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                    c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) +
                    c6 + _toStringWithNull(a7) + c7;
            case 8:
                return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                    c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) +
                    c6 + _toStringWithNull(a7) + c7 + _toStringWithNull(a8) + c8;
            case 9:
                return c0 + _toStringWithNull(a1) + c1 + _toStringWithNull(a2) + c2 + _toStringWithNull(a3) +
                    c3 + _toStringWithNull(a4) + c4 + _toStringWithNull(a5) + c5 + _toStringWithNull(a6) +
                    c6 + _toStringWithNull(a7) + c7 + _toStringWithNull(a8) + c8 + _toStringWithNull(a9) + c9;
            default:
                throw new Error("Does not support more than 9 expressions");
        }
    }
    function _toStringWithNull(v) {
        return v != null ? v.toString() : '';
    }
    function checkBinding(throwOnChange, oldValue, newValue) {
        if (throwOnChange) {
            if (!devModeEqual(oldValue, newValue)) {
                throw new ExpressionChangedAfterItHasBeenCheckedError(oldValue, newValue);
            }
            return false;
        }
        else {
            return !looseIdentical(oldValue, newValue);
        }
    }
    function castByValue(input, value) {
        return input;
    }
    var EMPTY_ARRAY = [];
    var EMPTY_MAP = {};
    function pureProxy1(fn) {
        var result;
        var v0 = UNINITIALIZED;
        return function (p0) {
            if (!looseIdentical(v0, p0)) {
                v0 = p0;
                result = fn(p0);
            }
            return result;
        };
    }
    function pureProxy2(fn) {
        var result;
        var v0 = UNINITIALIZED;
        var v1 = UNINITIALIZED;
        return function (p0, p1) {
            if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1)) {
                v0 = p0;
                v1 = p1;
                result = fn(p0, p1);
            }
            return result;
        };
    }
    function pureProxy3(fn) {
        var result;
        var v0 = UNINITIALIZED;
        var v1 = UNINITIALIZED;
        var v2 = UNINITIALIZED;
        return function (p0, p1, p2) {
            if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2)) {
                v0 = p0;
                v1 = p1;
                v2 = p2;
                result = fn(p0, p1, p2);
            }
            return result;
        };
    }
    function pureProxy4(fn) {
        var result;
        var v0, v1, v2, v3;
        v0 = v1 = v2 = v3 = UNINITIALIZED;
        return function (p0, p1, p2, p3) {
            if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) ||
                !looseIdentical(v3, p3)) {
                v0 = p0;
                v1 = p1;
                v2 = p2;
                v3 = p3;
                result = fn(p0, p1, p2, p3);
            }
            return result;
        };
    }
    function pureProxy5(fn) {
        var result;
        var v0, v1, v2, v3, v4;
        v0 = v1 = v2 = v3 = v4 = UNINITIALIZED;
        return function (p0, p1, p2, p3, p4) {
            if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) ||
                !looseIdentical(v3, p3) || !looseIdentical(v4, p4)) {
                v0 = p0;
                v1 = p1;
                v2 = p2;
                v3 = p3;
                v4 = p4;
                result = fn(p0, p1, p2, p3, p4);
            }
            return result;
        };
    }
    function pureProxy6(fn) {
        var result;
        var v0, v1, v2, v3, v4, v5;
        v0 = v1 = v2 = v3 = v4 = v5 = UNINITIALIZED;
        return function (p0, p1, p2, p3, p4, p5) {
            if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) ||
                !looseIdentical(v3, p3) || !looseIdentical(v4, p4) || !looseIdentical(v5, p5)) {
                v0 = p0;
                v1 = p1;
                v2 = p2;
                v3 = p3;
                v4 = p4;
                v5 = p5;
                result = fn(p0, p1, p2, p3, p4, p5);
            }
            return result;
        };
    }
    function pureProxy7(fn) {
        var result;
        var v0, v1, v2, v3, v4, v5, v6;
        v0 = v1 = v2 = v3 = v4 = v5 = v6 = UNINITIALIZED;
        return function (p0, p1, p2, p3, p4, p5, p6) {
            if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) ||
                !looseIdentical(v3, p3) || !looseIdentical(v4, p4) || !looseIdentical(v5, p5) ||
                !looseIdentical(v6, p6)) {
                v0 = p0;
                v1 = p1;
                v2 = p2;
                v3 = p3;
                v4 = p4;
                v5 = p5;
                v6 = p6;
                result = fn(p0, p1, p2, p3, p4, p5, p6);
            }
            return result;
        };
    }
    function pureProxy8(fn) {
        var result;
        var v0, v1, v2, v3, v4, v5, v6, v7;
        v0 = v1 = v2 = v3 = v4 = v5 = v6 = v7 = UNINITIALIZED;
        return function (p0, p1, p2, p3, p4, p5, p6, p7) {
            if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) ||
                !looseIdentical(v3, p3) || !looseIdentical(v4, p4) || !looseIdentical(v5, p5) ||
                !looseIdentical(v6, p6) || !looseIdentical(v7, p7)) {
                v0 = p0;
                v1 = p1;
                v2 = p2;
                v3 = p3;
                v4 = p4;
                v5 = p5;
                v6 = p6;
                v7 = p7;
                result = fn(p0, p1, p2, p3, p4, p5, p6, p7);
            }
            return result;
        };
    }
    function pureProxy9(fn) {
        var result;
        var v0, v1, v2, v3, v4, v5, v6, v7, v8;
        v0 = v1 = v2 = v3 = v4 = v5 = v6 = v7 = v8 = UNINITIALIZED;
        return function (p0, p1, p2, p3, p4, p5, p6, p7, p8) {
            if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) ||
                !looseIdentical(v3, p3) || !looseIdentical(v4, p4) || !looseIdentical(v5, p5) ||
                !looseIdentical(v6, p6) || !looseIdentical(v7, p7) || !looseIdentical(v8, p8)) {
                v0 = p0;
                v1 = p1;
                v2 = p2;
                v3 = p3;
                v4 = p4;
                v5 = p5;
                v6 = p6;
                v7 = p7;
                v8 = p8;
                result = fn(p0, p1, p2, p3, p4, p5, p6, p7, p8);
            }
            return result;
        };
    }
    function pureProxy10(fn) {
        var result;
        var v0, v1, v2, v3, v4, v5, v6, v7, v8, v9;
        v0 = v1 = v2 = v3 = v4 = v5 = v6 = v7 = v8 = v9 = UNINITIALIZED;
        return function (p0, p1, p2, p3, p4, p5, p6, p7, p8, p9) {
            if (!looseIdentical(v0, p0) || !looseIdentical(v1, p1) || !looseIdentical(v2, p2) ||
                !looseIdentical(v3, p3) || !looseIdentical(v4, p4) || !looseIdentical(v5, p5) ||
                !looseIdentical(v6, p6) || !looseIdentical(v7, p7) || !looseIdentical(v8, p8) ||
                !looseIdentical(v9, p9)) {
                v0 = p0;
                v1 = p1;
                v2 = p2;
                v3 = p3;
                v4 = p4;
                v5 = p5;
                v6 = p6;
                v7 = p7;
                v8 = p8;
                v9 = p9;
                result = fn(p0, p1, p2, p3, p4, p5, p6, p7, p8, p9);
            }
            return result;
        };
    }
    function setBindingDebugInfoForChanges(renderer, el, changes) {
        Object.keys(changes).forEach(function (propName) {
            setBindingDebugInfo(renderer, el, propName, changes[propName].currentValue);
        });
    }
    function setBindingDebugInfo(renderer, el, propName, value) {
        try {
            renderer.setBindingDebugInfo(el, "ng-reflect-" + camelCaseToDashCase(propName), value ? value.toString() : null);
        }
        catch (e) {
            renderer.setBindingDebugInfo(el, "ng-reflect-" + camelCaseToDashCase(propName), '[ERROR] Exception while trying to serialize the value');
        }
    }
    var CAMEL_CASE_REGEXP = /([A-Z])/g;
    function camelCaseToDashCase(input) {
        return input.replace(CAMEL_CASE_REGEXP, function () {
            var m = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                m[_i - 0] = arguments[_i];
            }
            return '-' + m[1].toLowerCase();
        });
    }
    function createRenderElement(renderer, parentElement, name, attrs, debugInfo) {
        var el = renderer.createElement(parentElement, name, debugInfo);
        for (var i = 0; i < attrs.length; i += 2) {
            renderer.setElementAttribute(el, attrs.get(i), attrs.get(i + 1));
        }
        return el;
    }
    function selectOrCreateRenderHostElement(renderer, elementName, attrs, rootSelectorOrNode, debugInfo) {
        var hostElement;
        if (isPresent(rootSelectorOrNode)) {
            hostElement = renderer.selectRootElement(rootSelectorOrNode, debugInfo);
        }
        else {
            hostElement = createRenderElement(renderer, null, elementName, attrs, debugInfo);
        }
        return hostElement;
    }
    var InlineArray0 = (function () {
        function InlineArray0() {
            this.length = 0;
        }
        InlineArray0.prototype.get = function (index) { return undefined; };
        return InlineArray0;
    }());
    var InlineArray2 = (function () {
        function InlineArray2(length, _v0, _v1) {
            this.length = length;
            this._v0 = _v0;
            this._v1 = _v1;
        }
        InlineArray2.prototype.get = function (index) {
            switch (index) {
                case 0:
                    return this._v0;
                case 1:
                    return this._v1;
                default:
                    return undefined;
            }
        };
        return InlineArray2;
    }());
    var InlineArray4 = (function () {
        function InlineArray4(length, _v0, _v1, _v2, _v3) {
            this.length = length;
            this._v0 = _v0;
            this._v1 = _v1;
            this._v2 = _v2;
            this._v3 = _v3;
        }
        InlineArray4.prototype.get = function (index) {
            switch (index) {
                case 0:
                    return this._v0;
                case 1:
                    return this._v1;
                case 2:
                    return this._v2;
                case 3:
                    return this._v3;
                default:
                    return undefined;
            }
        };
        return InlineArray4;
    }());
    var InlineArray8 = (function () {
        function InlineArray8(length, _v0, _v1, _v2, _v3, _v4, _v5, _v6, _v7) {
            this.length = length;
            this._v0 = _v0;
            this._v1 = _v1;
            this._v2 = _v2;
            this._v3 = _v3;
            this._v4 = _v4;
            this._v5 = _v5;
            this._v6 = _v6;
            this._v7 = _v7;
        }
        InlineArray8.prototype.get = function (index) {
            switch (index) {
                case 0:
                    return this._v0;
                case 1:
                    return this._v1;
                case 2:
                    return this._v2;
                case 3:
                    return this._v3;
                case 4:
                    return this._v4;
                case 5:
                    return this._v5;
                case 6:
                    return this._v6;
                case 7:
                    return this._v7;
                default:
                    return undefined;
            }
        };
        return InlineArray8;
    }());
    var InlineArray16 = (function () {
        function InlineArray16(length, _v0, _v1, _v2, _v3, _v4, _v5, _v6, _v7, _v8, _v9, _v10, _v11, _v12, _v13, _v14, _v15) {
            this.length = length;
            this._v0 = _v0;
            this._v1 = _v1;
            this._v2 = _v2;
            this._v3 = _v3;
            this._v4 = _v4;
            this._v5 = _v5;
            this._v6 = _v6;
            this._v7 = _v7;
            this._v8 = _v8;
            this._v9 = _v9;
            this._v10 = _v10;
            this._v11 = _v11;
            this._v12 = _v12;
            this._v13 = _v13;
            this._v14 = _v14;
            this._v15 = _v15;
        }
        InlineArray16.prototype.get = function (index) {
            switch (index) {
                case 0:
                    return this._v0;
                case 1:
                    return this._v1;
                case 2:
                    return this._v2;
                case 3:
                    return this._v3;
                case 4:
                    return this._v4;
                case 5:
                    return this._v5;
                case 6:
                    return this._v6;
                case 7:
                    return this._v7;
                case 8:
                    return this._v8;
                case 9:
                    return this._v9;
                case 10:
                    return this._v10;
                case 11:
                    return this._v11;
                case 12:
                    return this._v12;
                case 13:
                    return this._v13;
                case 14:
                    return this._v14;
                case 15:
                    return this._v15;
                default:
                    return undefined;
            }
        };
        return InlineArray16;
    }());
    var InlineArrayDynamic = (function () {
        // Note: We still take the length argument so this class can be created
        // in the same ways as the other classes!
        function InlineArrayDynamic(length) {
            var values = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                values[_i - 1] = arguments[_i];
            }
            this.length = length;
            this._values = values;
        }
        InlineArrayDynamic.prototype.get = function (index) { return this._values[index]; };
        return InlineArrayDynamic;
    }());
    var EMPTY_INLINE_ARRAY = new InlineArray0();


    var view_utils = Object.freeze({
        ViewUtils: ViewUtils,
        flattenNestedViewRenderNodes: flattenNestedViewRenderNodes,
        ensureSlotCount: ensureSlotCount,
        MAX_INTERPOLATION_VALUES: MAX_INTERPOLATION_VALUES,
        interpolate: interpolate,
        checkBinding: checkBinding,
        castByValue: castByValue,
        EMPTY_ARRAY: EMPTY_ARRAY,
        EMPTY_MAP: EMPTY_MAP,
        pureProxy1: pureProxy1,
        pureProxy2: pureProxy2,
        pureProxy3: pureProxy3,
        pureProxy4: pureProxy4,
        pureProxy5: pureProxy5,
        pureProxy6: pureProxy6,
        pureProxy7: pureProxy7,
        pureProxy8: pureProxy8,
        pureProxy9: pureProxy9,
        pureProxy10: pureProxy10,
        setBindingDebugInfoForChanges: setBindingDebugInfoForChanges,
        setBindingDebugInfo: setBindingDebugInfo,
        createRenderElement: createRenderElement,
        selectOrCreateRenderHostElement: selectOrCreateRenderHostElement,
        InlineArray2: InlineArray2,
        InlineArray4: InlineArray4,
        InlineArray8: InlineArray8,
        InlineArray16: InlineArray16,
        InlineArrayDynamic: InlineArrayDynamic,
        EMPTY_INLINE_ARRAY: EMPTY_INLINE_ARRAY
    });

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var __extends$5 = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    /**
     * Represents an instance of a Component created via a {@link ComponentFactory}.
     *
     * `ComponentRef` provides access to the Component Instance as well other objects related to this
     * Component Instance and allows you to destroy the Component Instance via the {@link #destroy}
     * method.
     * @stable
     */
    var ComponentRef = (function () {
        function ComponentRef() {
        }
        Object.defineProperty(ComponentRef.prototype, "location", {
            /**
             * Location of the Host Element of this Component Instance.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComponentRef.prototype, "injector", {
            /**
             * The injector on which the component instance exists.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComponentRef.prototype, "instance", {
            /**
             * The instance of the Component.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(ComponentRef.prototype, "hostView", {
            /**
             * The {@link ViewRef} of the Host View of this Component instance.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(ComponentRef.prototype, "changeDetectorRef", {
            /**
             * The {@link ChangeDetectorRef} of the Component instance.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComponentRef.prototype, "componentType", {
            /**
             * The component type.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        return ComponentRef;
    }());
    var ComponentRef_ = (function (_super) {
        __extends$5(ComponentRef_, _super);
        function ComponentRef_(_hostElement, _componentType) {
            _super.call(this);
            this._hostElement = _hostElement;
            this._componentType = _componentType;
        }
        Object.defineProperty(ComponentRef_.prototype, "location", {
            get: function () { return this._hostElement.elementRef; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComponentRef_.prototype, "injector", {
            get: function () { return this._hostElement.injector; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComponentRef_.prototype, "instance", {
            get: function () { return this._hostElement.component; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(ComponentRef_.prototype, "hostView", {
            get: function () { return this._hostElement.parentView.ref; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(ComponentRef_.prototype, "changeDetectorRef", {
            get: function () { return this._hostElement.parentView.ref; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(ComponentRef_.prototype, "componentType", {
            get: function () { return this._componentType; },
            enumerable: true,
            configurable: true
        });
        ComponentRef_.prototype.destroy = function () { this._hostElement.parentView.destroy(); };
        ComponentRef_.prototype.onDestroy = function (callback) { this.hostView.onDestroy(callback); };
        return ComponentRef_;
    }(ComponentRef));
    /**
     * @experimental
     */
    var EMPTY_CONTEXT = new Object();
    /**
     * @stable
     */
    var ComponentFactory = (function () {
        function ComponentFactory(selector, _viewFactory, _componentType) {
            this.selector = selector;
            this._viewFactory = _viewFactory;
            this._componentType = _componentType;
        }
        Object.defineProperty(ComponentFactory.prototype, "componentType", {
            get: function () { return this._componentType; },
            enumerable: true,
            configurable: true
        });
        /**
         * Creates a new component.
         */
        ComponentFactory.prototype.create = function (injector, projectableNodes, rootSelectorOrNode) {
            if (projectableNodes === void 0) { projectableNodes = null; }
            if (rootSelectorOrNode === void 0) { rootSelectorOrNode = null; }
            var vu = injector.get(ViewUtils);
            if (!projectableNodes) {
                projectableNodes = [];
            }
            // Note: Host views don't need a declarationAppElement!
            var hostView = this._viewFactory(vu, injector, null);
            var hostElement = hostView.create(EMPTY_CONTEXT, projectableNodes, rootSelectorOrNode);
            return new ComponentRef_(hostElement, this._componentType);
        };
        return ComponentFactory;
    }());

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var __extends$7 = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    /**
     * @stable
     */
    var NoComponentFactoryError = (function (_super) {
        __extends$7(NoComponentFactoryError, _super);
        function NoComponentFactoryError(component) {
            _super.call(this, "No component factory found for " + stringify(component));
            this.component = component;
        }
        return NoComponentFactoryError;
    }(BaseError));
    var _NullComponentFactoryResolver = (function () {
        function _NullComponentFactoryResolver() {
        }
        _NullComponentFactoryResolver.prototype.resolveComponentFactory = function (component) {
            throw new NoComponentFactoryError(component);
        };
        return _NullComponentFactoryResolver;
    }());
    /**
     * @stable
     */
    var ComponentFactoryResolver = (function () {
        function ComponentFactoryResolver() {
        }
        ComponentFactoryResolver.NULL = new _NullComponentFactoryResolver();
        return ComponentFactoryResolver;
    }());
    var CodegenComponentFactoryResolver = (function () {
        function CodegenComponentFactoryResolver(factories, _parent) {
            this._parent = _parent;
            this._factories = new Map();
            for (var i = 0; i < factories.length; i++) {
                var factory = factories[i];
                this._factories.set(factory.componentType, factory);
            }
        }
        CodegenComponentFactoryResolver.prototype.resolveComponentFactory = function (component) {
            var result = this._factories.get(component);
            if (!result) {
                result = this._parent.resolveComponentFactory(component);
            }
            return result;
        };
        return CodegenComponentFactoryResolver;
    }());

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var __extends$8 = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    /**
     * Use by directives and components to emit custom Events.
     *
     * ### Examples
     *
     * In the following example, `Zippy` alternatively emits `open` and `close` events when its
     * title gets clicked:
     *
     * ```
     * @Component({
     *   selector: 'zippy',
     *   template: `
     *   <div class="zippy">
     *     <div (click)="toggle()">Toggle</div>
     *     <div [hidden]="!visible">
     *       <ng-content></ng-content>
     *     </div>
     *  </div>`})
     * export class Zippy {
     *   visible: boolean = true;
     *   @Output() open: EventEmitter<any> = new EventEmitter();
     *   @Output() close: EventEmitter<any> = new EventEmitter();
     *
     *   toggle() {
     *     this.visible = !this.visible;
     *     if (this.visible) {
     *       this.open.emit(null);
     *     } else {
     *       this.close.emit(null);
     *     }
     *   }
     * }
     * ```
     *
     * The events payload can be accessed by the parameter `$event` on the components output event
     * handler:
     *
     * ```
     * <zippy (open)="onOpen($event)" (close)="onClose($event)"></zippy>
     * ```
     *
     * Uses Rx.Observable but provides an adapter to make it work as specified here:
     * https://github.com/jhusain/observable-spec
     *
     * Once a reference implementation of the spec is available, switch to it.
     * @stable
     */
    var EventEmitter = (function (_super) {
        __extends$8(EventEmitter, _super);
        /**
         * Creates an instance of [EventEmitter], which depending on [isAsync],
         * delivers events synchronously or asynchronously.
         */
        function EventEmitter(isAsync) {
            if (isAsync === void 0) { isAsync = false; }
            _super.call(this);
            this.__isAsync = isAsync;
        }
        EventEmitter.prototype.emit = function (value) { _super.prototype.next.call(this, value); };
        EventEmitter.prototype.subscribe = function (generatorOrNext, error, complete) {
            var schedulerFn;
            var errorFn = function (err) { return null; };
            var completeFn = function () { return null; };
            if (generatorOrNext && typeof generatorOrNext === 'object') {
                schedulerFn = this.__isAsync ? function (value) {
                    setTimeout(function () { return generatorOrNext.next(value); });
                } : function (value) { generatorOrNext.next(value); };
                if (generatorOrNext.error) {
                    errorFn = this.__isAsync ? function (err) { setTimeout(function () { return generatorOrNext.error(err); }); } :
                        function (err) { generatorOrNext.error(err); };
                }
                if (generatorOrNext.complete) {
                    completeFn = this.__isAsync ? function () { setTimeout(function () { return generatorOrNext.complete(); }); } :
                        function () { generatorOrNext.complete(); };
                }
            }
            else {
                schedulerFn = this.__isAsync ? function (value) { setTimeout(function () { return generatorOrNext(value); }); } :
                    function (value) { generatorOrNext(value); };
                if (error) {
                    errorFn =
                        this.__isAsync ? function (err) { setTimeout(function () { return error(err); }); } : function (err) { error(err); };
                }
                if (complete) {
                    completeFn =
                        this.__isAsync ? function () { setTimeout(function () { return complete(); }); } : function () { complete(); };
                }
            }
            return _super.prototype.subscribe.call(this, schedulerFn, errorFn, completeFn);
        };
        return EventEmitter;
    }(rxjs_Subject.Subject));

    /**
     * An injectable service for executing work inside or outside of the Angular zone.
     *
     * The most common use of this service is to optimize performance when starting a work consisting of
     * one or more asynchronous tasks that don't require UI updates or error handling to be handled by
     * Angular. Such tasks can be kicked off via {@link runOutsideAngular} and if needed, these tasks
     * can reenter the Angular zone via {@link run}.
     *
     * <!-- TODO: add/fix links to:
     *   - docs explaining zones and the use of zones in Angular and change-detection
     *   - link to runOutsideAngular/run (throughout this file!)
     *   -->
     *
     * ### Example
     * ```
     * import {Component, NgZone} from '@angular/core';
     * import {NgIf} from '@angular/common';
     *
     * @Component({
     *   selector: 'ng-zone-demo'.
     *   template: `
     *     <h2>Demo: NgZone</h2>
     *
     *     <p>Progress: {{progress}}%</p>
     *     <p *ngIf="progress >= 100">Done processing {{label}} of Angular zone!</p>
     *
     *     <button (click)="processWithinAngularZone()">Process within Angular zone</button>
     *     <button (click)="processOutsideOfAngularZone()">Process outside of Angular zone</button>
     *   `,
     * })
     * export class NgZoneDemo {
     *   progress: number = 0;
     *   label: string;
     *
     *   constructor(private _ngZone: NgZone) {}
     *
     *   // Loop inside the Angular zone
     *   // so the UI DOES refresh after each setTimeout cycle
     *   processWithinAngularZone() {
     *     this.label = 'inside';
     *     this.progress = 0;
     *     this._increaseProgress(() => console.log('Inside Done!'));
     *   }
     *
     *   // Loop outside of the Angular zone
     *   // so the UI DOES NOT refresh after each setTimeout cycle
     *   processOutsideOfAngularZone() {
     *     this.label = 'outside';
     *     this.progress = 0;
     *     this._ngZone.runOutsideAngular(() => {
     *       this._increaseProgress(() => {
     *       // reenter the Angular zone and display done
     *       this._ngZone.run(() => {console.log('Outside Done!') });
     *     }}));
     *   }
     *
     *   _increaseProgress(doneCallback: () => void) {
     *     this.progress += 1;
     *     console.log(`Current progress: ${this.progress}%`);
     *
     *     if (this.progress < 100) {
     *       window.setTimeout(() => this._increaseProgress(doneCallback)), 10)
     *     } else {
     *       doneCallback();
     *     }
     *   }
     * }
     * ```
     * @experimental
     */
    var NgZone = (function () {
        function NgZone(_a) {
            var _b = _a.enableLongStackTrace, enableLongStackTrace = _b === void 0 ? false : _b;
            this._hasPendingMicrotasks = false;
            this._hasPendingMacrotasks = false;
            this._isStable = true;
            this._nesting = 0;
            this._onUnstable = new EventEmitter(false);
            this._onMicrotaskEmpty = new EventEmitter(false);
            this._onStable = new EventEmitter(false);
            this._onErrorEvents = new EventEmitter(false);
            if (typeof Zone == 'undefined') {
                throw new Error('Angular requires Zone.js prolyfill.');
            }
            Zone.assertZonePatched();
            this.outer = this.inner = Zone.current;
            if (Zone['wtfZoneSpec']) {
                this.inner = this.inner.fork(Zone['wtfZoneSpec']);
            }
            if (enableLongStackTrace && Zone['longStackTraceZoneSpec']) {
                this.inner = this.inner.fork(Zone['longStackTraceZoneSpec']);
            }
            this.forkInnerZoneWithAngularBehavior();
        }
        NgZone.isInAngularZone = function () { return Zone.current.get('isAngularZone') === true; };
        NgZone.assertInAngularZone = function () {
            if (!NgZone.isInAngularZone()) {
                throw new Error('Expected to be in Angular Zone, but it is not!');
            }
        };
        NgZone.assertNotInAngularZone = function () {
            if (NgZone.isInAngularZone()) {
                throw new Error('Expected to not be in Angular Zone, but it is!');
            }
        };
        /**
         * Executes the `fn` function synchronously within the Angular zone and returns value returned by
         * the function.
         *
         * Running functions via `run` allows you to reenter Angular zone from a task that was executed
         * outside of the Angular zone (typically started via {@link runOutsideAngular}).
         *
         * Any future tasks or microtasks scheduled from within this function will continue executing from
         * within the Angular zone.
         *
         * If a synchronous error happens it will be rethrown and not reported via `onError`.
         */
        NgZone.prototype.run = function (fn) { return this.inner.run(fn); };
        /**
         * Same as `run`, except that synchronous errors are caught and forwarded via `onError` and not
         * rethrown.
         */
        NgZone.prototype.runGuarded = function (fn) { return this.inner.runGuarded(fn); };
        /**
         * Executes the `fn` function synchronously in Angular's parent zone and returns value returned by
         * the function.
         *
         * Running functions via `runOutsideAngular` allows you to escape Angular's zone and do work that
         * doesn't trigger Angular change-detection or is subject to Angular's error handling.
         *
         * Any future tasks or microtasks scheduled from within this function will continue executing from
         * outside of the Angular zone.
         *
         * Use {@link run} to reenter the Angular zone and do work that updates the application model.
         */
        NgZone.prototype.runOutsideAngular = function (fn) { return this.outer.run(fn); };
        Object.defineProperty(NgZone.prototype, "onUnstable", {
            /**
             * Notifies when code enters Angular Zone. This gets fired first on VM Turn.
             */
            get: function () { return this._onUnstable; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgZone.prototype, "onMicrotaskEmpty", {
            /**
             * Notifies when there is no more microtasks enqueue in the current VM Turn.
             * This is a hint for Angular to do change detection, which may enqueue more microtasks.
             * For this reason this event can fire multiple times per VM Turn.
             */
            get: function () { return this._onMicrotaskEmpty; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgZone.prototype, "onStable", {
            /**
             * Notifies when the last `onMicrotaskEmpty` has run and there are no more microtasks, which
             * implies we are about to relinquish VM turn.
             * This event gets called just once.
             */
            get: function () { return this._onStable; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgZone.prototype, "onError", {
            /**
             * Notify that an error has been delivered.
             */
            get: function () { return this._onErrorEvents; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgZone.prototype, "isStable", {
            /**
             * Whether there are no outstanding microtasks or macrotasks.
             */
            get: function () { return this._isStable; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgZone.prototype, "hasPendingMicrotasks", {
            get: function () { return this._hasPendingMicrotasks; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgZone.prototype, "hasPendingMacrotasks", {
            get: function () { return this._hasPendingMacrotasks; },
            enumerable: true,
            configurable: true
        });
        NgZone.prototype.checkStable = function () {
            var _this = this;
            if (this._nesting == 0 && !this._hasPendingMicrotasks && !this._isStable) {
                try {
                    this._nesting++;
                    this._onMicrotaskEmpty.emit(null);
                }
                finally {
                    this._nesting--;
                    if (!this._hasPendingMicrotasks) {
                        try {
                            this.runOutsideAngular(function () { return _this._onStable.emit(null); });
                        }
                        finally {
                            this._isStable = true;
                        }
                    }
                }
            }
        };
        NgZone.prototype.forkInnerZoneWithAngularBehavior = function () {
            var _this = this;
            this.inner = this.inner.fork({
                name: 'angular',
                properties: { 'isAngularZone': true },
                onInvokeTask: function (delegate, current, target, task, applyThis, applyArgs) {
                    try {
                        _this.onEnter();
                        return delegate.invokeTask(target, task, applyThis, applyArgs);
                    }
                    finally {
                        _this.onLeave();
                    }
                },
                onInvoke: function (delegate, current, target, callback, applyThis, applyArgs, source) {
                    try {
                        _this.onEnter();
                        return delegate.invoke(target, callback, applyThis, applyArgs, source);
                    }
                    finally {
                        _this.onLeave();
                    }
                },
                onHasTask: function (delegate, current, target, hasTaskState) {
                    delegate.hasTask(target, hasTaskState);
                    if (current === target) {
                        // We are only interested in hasTask events which originate from our zone
                        // (A child hasTask event is not interesting to us)
                        if (hasTaskState.change == 'microTask') {
                            _this.setHasMicrotask(hasTaskState.microTask);
                        }
                        else if (hasTaskState.change == 'macroTask') {
                            _this.setHasMacrotask(hasTaskState.macroTask);
                        }
                    }
                },
                onHandleError: function (delegate, current, target, error) {
                    delegate.handleError(target, error);
                    _this.triggerError(error);
                    return false;
                }
            });
        };
        NgZone.prototype.onEnter = function () {
            this._nesting++;
            if (this._isStable) {
                this._isStable = false;
                this._onUnstable.emit(null);
            }
        };
        NgZone.prototype.onLeave = function () {
            this._nesting--;
            this.checkStable();
        };
        NgZone.prototype.setHasMicrotask = function (hasMicrotasks) {
            this._hasPendingMicrotasks = hasMicrotasks;
            this.checkStable();
        };
        NgZone.prototype.setHasMacrotask = function (hasMacrotasks) { this._hasPendingMacrotasks = hasMacrotasks; };
        NgZone.prototype.triggerError = function (error) { this._onErrorEvents.emit(error); };
        return NgZone;
    }());

    /**
     * The Testability service provides testing hooks that can be accessed from
     * the browser and by services such as Protractor. Each bootstrapped Angular
     * application on the page will have an instance of Testability.
     * @experimental
     */
    var Testability = (function () {
        function Testability(_ngZone) {
            this._ngZone = _ngZone;
            /** @internal */
            this._pendingCount = 0;
            /** @internal */
            this._isZoneStable = true;
            /**
             * Whether any work was done since the last 'whenStable' callback. This is
             * useful to detect if this could have potentially destabilized another
             * component while it is stabilizing.
             * @internal
             */
            this._didWork = false;
            /** @internal */
            this._callbacks = [];
            this._watchAngularEvents();
        }
        /** @internal */
        Testability.prototype._watchAngularEvents = function () {
            var _this = this;
            this._ngZone.onUnstable.subscribe({
                next: function () {
                    _this._didWork = true;
                    _this._isZoneStable = false;
                }
            });
            this._ngZone.runOutsideAngular(function () {
                _this._ngZone.onStable.subscribe({
                    next: function () {
                        NgZone.assertNotInAngularZone();
                        scheduleMicroTask(function () {
                            _this._isZoneStable = true;
                            _this._runCallbacksIfReady();
                        });
                    }
                });
            });
        };
        Testability.prototype.increasePendingRequestCount = function () {
            this._pendingCount += 1;
            this._didWork = true;
            return this._pendingCount;
        };
        Testability.prototype.decreasePendingRequestCount = function () {
            this._pendingCount -= 1;
            if (this._pendingCount < 0) {
                throw new Error('pending async requests below zero');
            }
            this._runCallbacksIfReady();
            return this._pendingCount;
        };
        Testability.prototype.isStable = function () {
            return this._isZoneStable && this._pendingCount == 0 && !this._ngZone.hasPendingMacrotasks;
        };
        /** @internal */
        Testability.prototype._runCallbacksIfReady = function () {
            var _this = this;
            if (this.isStable()) {
                // Schedules the call backs in a new frame so that it is always async.
                scheduleMicroTask(function () {
                    while (_this._callbacks.length !== 0) {
                        (_this._callbacks.pop())(_this._didWork);
                    }
                    _this._didWork = false;
                });
            }
            else {
                // Not Ready
                this._didWork = true;
            }
        };
        Testability.prototype.whenStable = function (callback) {
            this._callbacks.push(callback);
            this._runCallbacksIfReady();
        };
        Testability.prototype.getPendingRequestCount = function () { return this._pendingCount; };
        /** @deprecated use findProviders */
        Testability.prototype.findBindings = function (using, provider, exactMatch) {
            // TODO(juliemr): implement.
            return [];
        };
        Testability.prototype.findProviders = function (using, provider, exactMatch) {
            // TODO(juliemr): implement.
            return [];
        };
        Testability.decorators = [
            { type: Injectable },
        ];
        /** @nocollapse */
        Testability.ctorParameters = [
            { type: NgZone, },
        ];
        return Testability;
    }());
    /**
     * A global registry of {@link Testability} instances for specific elements.
     * @experimental
     */
    var TestabilityRegistry = (function () {
        function TestabilityRegistry() {
            /** @internal */
            this._applications = new Map();
            _testabilityGetter.addToWindow(this);
        }
        TestabilityRegistry.prototype.registerApplication = function (token, testability) {
            this._applications.set(token, testability);
        };
        TestabilityRegistry.prototype.getTestability = function (elem) { return this._applications.get(elem); };
        TestabilityRegistry.prototype.getAllTestabilities = function () { return MapWrapper.values(this._applications); };
        TestabilityRegistry.prototype.getAllRootElements = function () { return MapWrapper.keys(this._applications); };
        TestabilityRegistry.prototype.findTestabilityInTree = function (elem, findInAncestors) {
            if (findInAncestors === void 0) { findInAncestors = true; }
            return _testabilityGetter.findTestabilityInTree(this, elem, findInAncestors);
        };
        TestabilityRegistry.decorators = [
            { type: Injectable },
        ];
        /** @nocollapse */
        TestabilityRegistry.ctorParameters = [];
        return TestabilityRegistry;
    }());
    var _NoopGetTestability = (function () {
        function _NoopGetTestability() {
        }
        _NoopGetTestability.prototype.addToWindow = function (registry) { };
        _NoopGetTestability.prototype.findTestabilityInTree = function (registry, elem, findInAncestors) {
            return null;
        };
        return _NoopGetTestability;
    }());
    /**
     * Set the {@link GetTestability} implementation used by the Angular testing framework.
     * @experimental
     */
    function setTestabilityGetter(getter) {
        _testabilityGetter = getter;
    }
    var _testabilityGetter = new _NoopGetTestability();

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var __extends$3 = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var _devMode = true;
    var _runModeLocked = false;
    var _platform;
    /**
     * Disable Angular's development mode, which turns off assertions and other
     * checks within the framework.
     *
     * One important assertion this disables verifies that a change detection pass
     * does not result in additional changes to any bindings (also known as
     * unidirectional data flow).
     *
     * @stable
     */
    function enableProdMode() {
        if (_runModeLocked) {
            throw new Error('Cannot enable prod mode after platform setup.');
        }
        _devMode = false;
    }
    /**
     * Returns whether Angular is in development mode. After called once,
     * the value is locked and won't change any more.
     *
     * By default, this is true, unless a user calls `enableProdMode` before calling this.
     *
     * @experimental APIs related to application bootstrap are currently under review.
     */
    function isDevMode() {
        _runModeLocked = true;
        return _devMode;
    }
    /**
     * Creates a platform.
     * Platforms have to be eagerly created via this function.
     *
     * @experimental APIs related to application bootstrap are currently under review.
     */
    function createPlatform(injector) {
        if (_platform && !_platform.destroyed) {
            throw new Error('There can be only one platform. Destroy the previous one to create a new one.');
        }
        _platform = injector.get(PlatformRef);
        var inits = injector.get(PLATFORM_INITIALIZER, null);
        if (inits)
            inits.forEach(function (init) { return init(); });
        return _platform;
    }
    /**
     * Creates a factory for a platform
     *
     * @experimental APIs related to application bootstrap are currently under review.
     */
    function createPlatformFactory(parentPlaformFactory, name, providers) {
        if (providers === void 0) { providers = []; }
        var marker = new OpaqueToken("Platform: " + name);
        return function (extraProviders) {
            if (extraProviders === void 0) { extraProviders = []; }
            if (!getPlatform()) {
                if (parentPlaformFactory) {
                    parentPlaformFactory(providers.concat(extraProviders).concat({ provide: marker, useValue: true }));
                }
                else {
                    createPlatform(ReflectiveInjector.resolveAndCreate(providers.concat(extraProviders).concat({ provide: marker, useValue: true })));
                }
            }
            return assertPlatform(marker);
        };
    }
    /**
     * Checks that there currently is a platform
     * which contains the given token as a provider.
     *
     * @experimental APIs related to application bootstrap are currently under review.
     */
    function assertPlatform(requiredToken) {
        var platform = getPlatform();
        if (!platform) {
            throw new Error('No platform exists!');
        }
        if (!platform.injector.get(requiredToken, null)) {
            throw new Error('A platform with a different configuration has been created. Please destroy it first.');
        }
        return platform;
    }
    /**
     * Destroy the existing platform.
     *
     * @experimental APIs related to application bootstrap are currently under review.
     */
    function destroyPlatform() {
        if (_platform && !_platform.destroyed) {
            _platform.destroy();
        }
    }
    /**
     * Returns the current platform.
     *
     * @experimental APIs related to application bootstrap are currently under review.
     */
    function getPlatform() {
        return _platform && !_platform.destroyed ? _platform : null;
    }
    /**
     * The Angular platform is the entry point for Angular on a web page. Each page
     * has exactly one platform, and services (such as reflection) which are common
     * to every Angular application running on the page are bound in its scope.
     *
     * A page's platform is initialized implicitly when {@link bootstrap}() is called, or
     * explicitly by calling {@link createPlatform}().
     *
     * @stable
     */
    var PlatformRef = (function () {
        function PlatformRef() {
        }
        /**
         * Creates an instance of an `@NgModule` for the given platform
         * for offline compilation.
         *
         * ## Simple Example
         *
         * ```typescript
         * my_module.ts:
         *
         * @NgModule({
         *   imports: [BrowserModule]
         * })
         * class MyModule {}
         *
         * main.ts:
         * import {MyModuleNgFactory} from './my_module.ngfactory';
         * import {platformBrowser} from '@angular/platform-browser';
         *
         * let moduleRef = platformBrowser().bootstrapModuleFactory(MyModuleNgFactory);
         * ```
         *
         * @experimental APIs related to application bootstrap are currently under review.
         */
        PlatformRef.prototype.bootstrapModuleFactory = function (moduleFactory) {
            throw unimplemented();
        };
        /**
         * Creates an instance of an `@NgModule` for a given platform using the given runtime compiler.
         *
         * ## Simple Example
         *
         * ```typescript
         * @NgModule({
         *   imports: [BrowserModule]
         * })
         * class MyModule {}
         *
         * let moduleRef = platformBrowser().bootstrapModule(MyModule);
         * ```
         * @stable
         */
        PlatformRef.prototype.bootstrapModule = function (moduleType, compilerOptions) {
            if (compilerOptions === void 0) { compilerOptions = []; }
            throw unimplemented();
        };
        Object.defineProperty(PlatformRef.prototype, "injector", {
            /**
             * Retrieve the platform {@link Injector}, which is the parent injector for
             * every Angular application on the page and provides singleton providers.
             */
            get: function () { throw unimplemented(); },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(PlatformRef.prototype, "destroyed", {
            get: function () { throw unimplemented(); },
            enumerable: true,
            configurable: true
        });
        return PlatformRef;
    }());
    function _callAndReportToErrorHandler(errorHandler, callback) {
        try {
            var result = callback();
            if (isPromise(result)) {
                return result.catch(function (e) {
                    errorHandler.handleError(e);
                    // rethrow as the exception handler might not do it
                    throw e;
                });
            }
            return result;
        }
        catch (e) {
            errorHandler.handleError(e);
            // rethrow as the exception handler might not do it
            throw e;
        }
    }
    var PlatformRef_ = (function (_super) {
        __extends$3(PlatformRef_, _super);
        function PlatformRef_(_injector) {
            _super.call(this);
            this._injector = _injector;
            this._modules = [];
            this._destroyListeners = [];
            this._destroyed = false;
        }
        PlatformRef_.prototype.onDestroy = function (callback) { this._destroyListeners.push(callback); };
        Object.defineProperty(PlatformRef_.prototype, "injector", {
            get: function () { return this._injector; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PlatformRef_.prototype, "destroyed", {
            get: function () { return this._destroyed; },
            enumerable: true,
            configurable: true
        });
        PlatformRef_.prototype.destroy = function () {
            if (this._destroyed) {
                throw new Error('The platform has already been destroyed!');
            }
            this._modules.slice().forEach(function (module) { return module.destroy(); });
            this._destroyListeners.forEach(function (listener) { return listener(); });
            this._destroyed = true;
        };
        PlatformRef_.prototype.bootstrapModuleFactory = function (moduleFactory) {
            return this._bootstrapModuleFactoryWithZone(moduleFactory, null);
        };
        PlatformRef_.prototype._bootstrapModuleFactoryWithZone = function (moduleFactory, ngZone) {
            var _this = this;
            // Note: We need to create the NgZone _before_ we instantiate the module,
            // as instantiating the module creates some providers eagerly.
            // So we create a mini parent injector that just contains the new NgZone and
            // pass that as parent to the NgModuleFactory.
            if (!ngZone)
                ngZone = new NgZone({ enableLongStackTrace: isDevMode() });
            // Attention: Don't use ApplicationRef.run here,
            // as we want to be sure that all possible constructor calls are inside `ngZone.run`!
            return ngZone.run(function () {
                var ngZoneInjector = ReflectiveInjector.resolveAndCreate([{ provide: NgZone, useValue: ngZone }], _this.injector);
                var moduleRef = moduleFactory.create(ngZoneInjector);
                var exceptionHandler = moduleRef.injector.get(ErrorHandler, null);
                if (!exceptionHandler) {
                    throw new Error('No ErrorHandler. Is platform module (BrowserModule) included?');
                }
                moduleRef.onDestroy(function () { return ListWrapper.remove(_this._modules, moduleRef); });
                ngZone.onError.subscribe({ next: function (error) { exceptionHandler.handleError(error); } });
                return _callAndReportToErrorHandler(exceptionHandler, function () {
                    var initStatus = moduleRef.injector.get(ApplicationInitStatus);
                    return initStatus.donePromise.then(function () {
                        _this._moduleDoBootstrap(moduleRef);
                        return moduleRef;
                    });
                });
            });
        };
        PlatformRef_.prototype.bootstrapModule = function (moduleType, compilerOptions) {
            if (compilerOptions === void 0) { compilerOptions = []; }
            return this._bootstrapModuleWithZone(moduleType, compilerOptions, null);
        };
        PlatformRef_.prototype._bootstrapModuleWithZone = function (moduleType, compilerOptions, ngZone, componentFactoryCallback) {
            var _this = this;
            if (compilerOptions === void 0) { compilerOptions = []; }
            var compilerFactory = this.injector.get(CompilerFactory);
            var compiler = compilerFactory.createCompiler(Array.isArray(compilerOptions) ? compilerOptions : [compilerOptions]);
            // ugly internal api hack: generate host component factories for all declared components and
            // pass the factories into the callback - this is used by UpdateAdapter to get hold of all
            // factories.
            if (componentFactoryCallback) {
                return compiler.compileModuleAndAllComponentsAsync(moduleType)
                    .then(function (_a) {
                    var ngModuleFactory = _a.ngModuleFactory, componentFactories = _a.componentFactories;
                    componentFactoryCallback(componentFactories);
                    return _this._bootstrapModuleFactoryWithZone(ngModuleFactory, ngZone);
                });
            }
            return compiler.compileModuleAsync(moduleType)
                .then(function (moduleFactory) { return _this._bootstrapModuleFactoryWithZone(moduleFactory, ngZone); });
        };
        PlatformRef_.prototype._moduleDoBootstrap = function (moduleRef) {
            var appRef = moduleRef.injector.get(ApplicationRef);
            if (moduleRef.bootstrapFactories.length > 0) {
                moduleRef.bootstrapFactories.forEach(function (compFactory) { return appRef.bootstrap(compFactory); });
            }
            else if (moduleRef.instance.ngDoBootstrap) {
                moduleRef.instance.ngDoBootstrap(appRef);
            }
            else {
                throw new Error(("The module " + stringify(moduleRef.instance.constructor) + " was bootstrapped, but it does not declare \"@NgModule.bootstrap\" components nor a \"ngDoBootstrap\" method. ") +
                    "Please define one of these.");
            }
        };
        PlatformRef_.decorators = [
            { type: Injectable },
        ];
        /** @nocollapse */
        PlatformRef_.ctorParameters = [
            { type: Injector, },
        ];
        return PlatformRef_;
    }(PlatformRef));
    /**
     * A reference to an Angular application running on a page.
     *
     * For more about Angular applications, see the documentation for {@link bootstrap}.
     *
     * @stable
     */
    var ApplicationRef = (function () {
        function ApplicationRef() {
        }
        Object.defineProperty(ApplicationRef.prototype, "componentTypes", {
            /**
             * Get a list of component types registered to this application.
             * This list is populated even before the component is created.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(ApplicationRef.prototype, "components", {
            /**
             * Get a list of components registered to this application.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        ;
        return ApplicationRef;
    }());
    var ApplicationRef_ = (function (_super) {
        __extends$3(ApplicationRef_, _super);
        function ApplicationRef_(_zone, _console, _injector, _exceptionHandler, _componentFactoryResolver, _initStatus, _testabilityRegistry, _testability) {
            var _this = this;
            _super.call(this);
            this._zone = _zone;
            this._console = _console;
            this._injector = _injector;
            this._exceptionHandler = _exceptionHandler;
            this._componentFactoryResolver = _componentFactoryResolver;
            this._initStatus = _initStatus;
            this._testabilityRegistry = _testabilityRegistry;
            this._testability = _testability;
            this._bootstrapListeners = [];
            this._rootComponents = [];
            this._rootComponentTypes = [];
            this._changeDetectorRefs = [];
            this._runningTick = false;
            this._enforceNoNewChanges = false;
            this._enforceNoNewChanges = isDevMode();
            this._zone.onMicrotaskEmpty.subscribe({ next: function () { _this._zone.run(function () { _this.tick(); }); } });
        }
        ApplicationRef_.prototype.registerChangeDetector = function (changeDetector) {
            this._changeDetectorRefs.push(changeDetector);
        };
        ApplicationRef_.prototype.unregisterChangeDetector = function (changeDetector) {
            ListWrapper.remove(this._changeDetectorRefs, changeDetector);
        };
        ApplicationRef_.prototype.bootstrap = function (componentOrFactory) {
            var _this = this;
            if (!this._initStatus.done) {
                throw new Error('Cannot bootstrap as there are still asynchronous initializers running. Bootstrap components in the `ngDoBootstrap` method of the root module.');
            }
            var componentFactory;
            if (componentOrFactory instanceof ComponentFactory) {
                componentFactory = componentOrFactory;
            }
            else {
                componentFactory = this._componentFactoryResolver.resolveComponentFactory(componentOrFactory);
            }
            this._rootComponentTypes.push(componentFactory.componentType);
            var compRef = componentFactory.create(this._injector, [], componentFactory.selector);
            compRef.onDestroy(function () { _this._unloadComponent(compRef); });
            var testability = compRef.injector.get(Testability, null);
            if (testability) {
                compRef.injector.get(TestabilityRegistry)
                    .registerApplication(compRef.location.nativeElement, testability);
            }
            this._loadComponent(compRef);
            if (isDevMode()) {
                this._console.log("Angular 2 is running in the development mode. Call enableProdMode() to enable the production mode.");
            }
            return compRef;
        };
        /** @internal */
        ApplicationRef_.prototype._loadComponent = function (componentRef) {
            this._changeDetectorRefs.push(componentRef.changeDetectorRef);
            this.tick();
            this._rootComponents.push(componentRef);
            // Get the listeners lazily to prevent DI cycles.
            var listeners = this._injector.get(APP_BOOTSTRAP_LISTENER, [])
                .concat(this._bootstrapListeners);
            listeners.forEach(function (listener) { return listener(componentRef); });
        };
        /** @internal */
        ApplicationRef_.prototype._unloadComponent = function (componentRef) {
            if (this._rootComponents.indexOf(componentRef) == -1) {
                return;
            }
            this.unregisterChangeDetector(componentRef.changeDetectorRef);
            ListWrapper.remove(this._rootComponents, componentRef);
        };
        ApplicationRef_.prototype.tick = function () {
            if (this._runningTick) {
                throw new Error('ApplicationRef.tick is called recursively');
            }
            var scope = ApplicationRef_._tickScope();
            try {
                this._runningTick = true;
                this._changeDetectorRefs.forEach(function (detector) { return detector.detectChanges(); });
                if (this._enforceNoNewChanges) {
                    this._changeDetectorRefs.forEach(function (detector) { return detector.checkNoChanges(); });
                }
            }
            finally {
                this._runningTick = false;
                wtfLeave(scope);
            }
        };
        ApplicationRef_.prototype.ngOnDestroy = function () {
            // TODO(alxhub): Dispose of the NgZone.
            this._rootComponents.slice().forEach(function (component) { return component.destroy(); });
        };
        Object.defineProperty(ApplicationRef_.prototype, "componentTypes", {
            get: function () { return this._rootComponentTypes; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ApplicationRef_.prototype, "components", {
            get: function () { return this._rootComponents; },
            enumerable: true,
            configurable: true
        });
        /** @internal */
        ApplicationRef_._tickScope = wtfCreateScope('ApplicationRef#tick()');
        ApplicationRef_.decorators = [
            { type: Injectable },
        ];
        /** @nocollapse */
        ApplicationRef_.ctorParameters = [
            { type: NgZone, },
            { type: Console, },
            { type: Injector, },
            { type: ErrorHandler, },
            { type: ComponentFactoryResolver, },
            { type: ApplicationInitStatus, },
            { type: TestabilityRegistry, decorators: [{ type: Optional },] },
            { type: Testability, decorators: [{ type: Optional },] },
        ];
        return ApplicationRef_;
    }(ApplicationRef));

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var __extends$9 = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    /**
     * Represents an instance of an NgModule created via a {@link NgModuleFactory}.
     *
     * `NgModuleRef` provides access to the NgModule Instance as well other objects related to this
     * NgModule Instance.
     *
     * @stable
     */
    var NgModuleRef = (function () {
        function NgModuleRef() {
        }
        Object.defineProperty(NgModuleRef.prototype, "injector", {
            /**
             * The injector that contains all of the providers of the NgModule.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgModuleRef.prototype, "componentFactoryResolver", {
            /**
             * The ComponentFactoryResolver to get hold of the ComponentFactories
             * declared in the `entryComponents` property of the module.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgModuleRef.prototype, "instance", {
            /**
             * The NgModule instance.
             */
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        return NgModuleRef;
    }());
    /**
     * @experimental
     */
    var NgModuleFactory = (function () {
        function NgModuleFactory(_injectorClass, _moduleType) {
            this._injectorClass = _injectorClass;
            this._moduleType = _moduleType;
        }
        Object.defineProperty(NgModuleFactory.prototype, "moduleType", {
            get: function () { return this._moduleType; },
            enumerable: true,
            configurable: true
        });
        NgModuleFactory.prototype.create = function (parentInjector) {
            if (!parentInjector) {
                parentInjector = Injector.NULL;
            }
            var instance = new this._injectorClass(parentInjector);
            instance.create();
            return instance;
        };
        return NgModuleFactory;
    }());
    var _UNDEFINED = new Object();
    var NgModuleInjector = (function (_super) {
        __extends$9(NgModuleInjector, _super);
        function NgModuleInjector(parent, factories, bootstrapFactories) {
            _super.call(this, factories, parent.get(ComponentFactoryResolver, ComponentFactoryResolver.NULL));
            this.parent = parent;
            this.bootstrapFactories = bootstrapFactories;
            this._destroyListeners = [];
            this._destroyed = false;
        }
        NgModuleInjector.prototype.create = function () { this.instance = this.createInternal(); };
        NgModuleInjector.prototype.get = function (token, notFoundValue) {
            if (notFoundValue === void 0) { notFoundValue = THROW_IF_NOT_FOUND; }
            if (token === Injector || token === ComponentFactoryResolver) {
                return this;
            }
            var result = this.getInternal(token, _UNDEFINED);
            return result === _UNDEFINED ? this.parent.get(token, notFoundValue) : result;
        };
        Object.defineProperty(NgModuleInjector.prototype, "injector", {
            get: function () { return this; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NgModuleInjector.prototype, "componentFactoryResolver", {
            get: function () { return this; },
            enumerable: true,
            configurable: true
        });
        NgModuleInjector.prototype.destroy = function () {
            if (this._destroyed) {
                throw new Error("The ng module " + stringify(this.instance.constructor) + " has already been destroyed.");
            }
            this._destroyed = true;
            this.destroyInternal();
            this._destroyListeners.forEach(function (listener) { return listener(); });
        };
        NgModuleInjector.prototype.onDestroy = function (callback) { this._destroyListeners.push(callback); };
        return NgModuleInjector;
    }(CodegenComponentFactoryResolver));

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Used to load ng module factories.
     * @stable
     */
    var NgModuleFactoryLoader = (function () {
        function NgModuleFactoryLoader() {
        }
        return NgModuleFactoryLoader;
    }());
    var moduleFactories = new Map();
    /**
     * Registers a loaded module. Should only be called from generated NgModuleFactory code.
     * @experimental
     */
    function registerModuleFactory(id, factory) {
        var existing = moduleFactories.get(id);
        if (existing) {
            throw new Error("Duplicate module registered for " + id + " - " + existing.moduleType.name + " vs " + factory.moduleType.name);
        }
        moduleFactories.set(id, factory);
    }
    /**
     * Returns the NgModuleFactory with the given id, if it exists and has been loaded.
     * Factories for modules that do not specify an `id` cannot be retrieved. Throws if the module
     * cannot be found.
     * @experimental
     */
    function getModuleFactory(id) {
        var factory = moduleFactories.get(id);
        if (!factory)
            throw new Error("No module with ID " + id + " loaded");
        return factory;
    }

    /**
     * An unmodifiable list of items that Angular keeps up to date when the state
     * of the application changes.
     *
     * The type of object that {@link Query} and {@link ViewQueryMetadata} provide.
     *
     * Implements an iterable interface, therefore it can be used in both ES6
     * javascript `for (var i of items)` loops as well as in Angular templates with
     * `*ngFor="let i of myList"`.
     *
     * Changes can be observed by subscribing to the changes `Observable`.
     *
     * NOTE: In the future this class will implement an `Observable` interface.
     *
     * ### Example ([live demo](http://plnkr.co/edit/RX8sJnQYl9FWuSCWme5z?p=preview))
     * ```typescript
     * @Component({...})
     * class Container {
     *   @ViewChildren(Item) items:QueryList<Item>;
     * }
     * ```
     * @stable
     */
    var QueryList = (function () {
        function QueryList() {
            this._dirty = true;
            this._results = [];
            this._emitter = new EventEmitter();
        }
        Object.defineProperty(QueryList.prototype, "changes", {
            get: function () { return this._emitter; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(QueryList.prototype, "length", {
            get: function () { return this._results.length; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(QueryList.prototype, "first", {
            get: function () { return this._results[0]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(QueryList.prototype, "last", {
            get: function () { return this._results[this.length - 1]; },
            enumerable: true,
            configurable: true
        });
        /**
         * See
         * [Array.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
         */
        QueryList.prototype.map = function (fn) { return this._results.map(fn); };
        /**
         * See
         * [Array.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
         */
        QueryList.prototype.filter = function (fn) {
            return this._results.filter(fn);
        };
        /**
         * See
         * [Array.reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
         */
        QueryList.prototype.reduce = function (fn, init) {
            return this._results.reduce(fn, init);
        };
        /**
         * See
         * [Array.forEach](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
         */
        QueryList.prototype.forEach = function (fn) { this._results.forEach(fn); };
        /**
         * See
         * [Array.some](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
         */
        QueryList.prototype.some = function (fn) {
            return this._results.some(fn);
        };
        QueryList.prototype.toArray = function () { return this._results.slice(); };
        QueryList.prototype[getSymbolIterator()] = function () { return this._results[getSymbolIterator()](); };
        QueryList.prototype.toString = function () { return this._results.toString(); };
        QueryList.prototype.reset = function (res) {
            this._results = ListWrapper.flatten(res);
            this._dirty = false;
        };
        QueryList.prototype.notifyOnChanges = function () { this._emitter.emit(this); };
        /** internal */
        QueryList.prototype.setDirty = function () { this._dirty = true; };
        Object.defineProperty(QueryList.prototype, "dirty", {
            /** internal */
            get: function () { return this._dirty; },
            enumerable: true,
            configurable: true
        });
        return QueryList;
    }());

    var _SEPARATOR = '#';
    var FACTORY_CLASS_SUFFIX = 'NgFactory';
    /**
     * Configuration for SystemJsNgModuleLoader.
     * token.
     *
     * @experimental
     */
    var SystemJsNgModuleLoaderConfig = (function () {
        function SystemJsNgModuleLoaderConfig() {
        }
        return SystemJsNgModuleLoaderConfig;
    }());
    var DEFAULT_CONFIG = {
        factoryPathPrefix: '',
        factoryPathSuffix: '.ngfactory',
    };
    /**
     * NgModuleFactoryLoader that uses SystemJS to load NgModuleFactory
     * @experimental
     */
    var SystemJsNgModuleLoader = (function () {
        function SystemJsNgModuleLoader(_compiler, config) {
            this._compiler = _compiler;
            this._config = config || DEFAULT_CONFIG;
        }
        SystemJsNgModuleLoader.prototype.load = function (path) {
            var offlineMode = this._compiler instanceof Compiler;
            return offlineMode ? this.loadFactory(path) : this.loadAndCompile(path);
        };
        SystemJsNgModuleLoader.prototype.loadAndCompile = function (path) {
            var _this = this;
            var _a = path.split(_SEPARATOR), module = _a[0], exportName = _a[1];
            if (exportName === undefined)
                exportName = 'default';
            return System.import(module)
                .then(function (module) { return module[exportName]; })
                .then(function (type) { return checkNotEmpty(type, module, exportName); })
                .then(function (type) { return _this._compiler.compileModuleAsync(type); });
        };
        SystemJsNgModuleLoader.prototype.loadFactory = function (path) {
            var _a = path.split(_SEPARATOR), module = _a[0], exportName = _a[1];
            var factoryClassSuffix = FACTORY_CLASS_SUFFIX;
            if (exportName === undefined) {
                exportName = 'default';
                factoryClassSuffix = '';
            }
            return System.import(this._config.factoryPathPrefix + module + this._config.factoryPathSuffix)
                .then(function (module) { return module[exportName + factoryClassSuffix]; })
                .then(function (factory) { return checkNotEmpty(factory, module, exportName); });
        };
        SystemJsNgModuleLoader.decorators = [
            { type: Injectable },
        ];
        /** @nocollapse */
        SystemJsNgModuleLoader.ctorParameters = [
            { type: Compiler, },
            { type: SystemJsNgModuleLoaderConfig, decorators: [{ type: Optional },] },
        ];
        return SystemJsNgModuleLoader;
    }());
    function checkNotEmpty(value, modulePath, exportName) {
        if (!value) {
            throw new Error("Cannot find '" + exportName + "' in '" + modulePath + "'");
        }
        return value;
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var __extends$10 = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    /**
     * Represents an Embedded Template that can be used to instantiate Embedded Views.
     *
     * You can access a `TemplateRef`, in two ways. Via a directive placed on a `<template>` element (or
     * directive prefixed with `*`) and have the `TemplateRef` for this Embedded View injected into the
     * constructor of the directive using the `TemplateRef` Token. Alternatively you can query for the
     * `TemplateRef` from a Component or a Directive via {@link Query}.
     *
     * To instantiate Embedded Views based on a Template, use
     * {@link ViewContainerRef#createEmbeddedView}, which will create the View and attach it to the
     * View Container.
     * @stable
     */
    var TemplateRef = (function () {
        function TemplateRef() {
        }
        Object.defineProperty(TemplateRef.prototype, "elementRef", {
            /**
             * The location in the View where the Embedded View logically belongs to.
             *
             * The data-binding and injection contexts of Embedded Views created from this `TemplateRef`
             * inherit from the contexts of this location.
             *
             * Typically new Embedded Views are attached to the View Container of this location, but in
             * advanced use-cases, the View can be attached to a different container while keeping the
             * data-binding and injection context from the original location.
             *
             */
            // TODO(i): rename to anchor or location
            get: function () { return null; },
            enumerable: true,
            configurable: true
        });
        return TemplateRef;
    }());
    var TemplateRef_ = (function (_super) {
        __extends$10(TemplateRef_, _super);
        function TemplateRef_(_appElement, _viewFactory) {
            _super.call(this);
            this._appElement = _appElement;
            this._viewFactory = _viewFactory;
        }
        TemplateRef_.prototype.createEmbeddedView = function (context) {
            var view = this._viewFactory(this._appElement.parentView.viewUtils, this._appElement.parentInjector, this._appElement);
            view.create(context || {}, null, null);
            return view.ref;
        };
        Object.defineProperty(TemplateRef_.prototype, "elementRef", {
            get: function () { return this._appElement.elementRef; },
            enumerable: true,
            configurable: true
        });
        return TemplateRef_;
    }(TemplateRef));

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var _queuedAnimations = [];
    /** @internal */
    function queueAnimationGlobally(player) {
        _queuedAnimations.push(player);
    }
    /** @internal */
    function triggerQueuedAnimations() {
        for (var i = 0; i < _queuedAnimations.length; i++) {
            var player = _queuedAnimations[i];
            player.play();
        }
        _queuedAnimations = [];
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var __extends$11 = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    /**
     * @stable
     */
    var ViewRef = (function () {
        function ViewRef() {
        }
        Object.defineProperty(ViewRef.prototype, "destroyed", {
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        return ViewRef;
    }());
    /**
     * Represents an Angular View.
     *
     * <!-- TODO: move the next two paragraphs to the dev guide -->
     * A View is a fundamental building block of the application UI. It is the smallest grouping of
     * Elements which are created and destroyed together.
     *
     * Properties of elements in a View can change, but the structure (number and order) of elements in
     * a View cannot. Changing the structure of Elements can only be done by inserting, moving or
     * removing nested Views via a {@link ViewContainerRef}. Each View can contain many View Containers.
     * <!-- /TODO -->
     *
     * ### Example
     *
     * Given this template...
     *
     * ```
     * Count: {{items.length}}
     * <ul>
     *   <li *ngFor="let  item of items">{{item}}</li>
     * </ul>
     * ```
     *
     * We have two {@link TemplateRef}s:
     *
     * Outer {@link TemplateRef}:
     * ```
     * Count: {{items.length}}
     * <ul>
     *   <template ngFor let-item [ngForOf]="items"></template>
     * </ul>
     * ```
     *
     * Inner {@link TemplateRef}:
     * ```
     *   <li>{{item}}</li>
     * ```
     *
     * Notice that the original template is broken down into two separate {@link TemplateRef}s.
     *
     * The outer/inner {@link TemplateRef}s are then assembled into views like so:
     *
     * ```
     * <!-- ViewRef: outer-0 -->
     * Count: 2
     * <ul>
     *   <template view-container-ref></template>
     *   <!-- ViewRef: inner-1 --><li>first</li><!-- /ViewRef: inner-1 -->
     *   <!-- ViewRef: inner-2 --><li>second</li><!-- /ViewRef: inner-2 -->
     * </ul>
     * <!-- /ViewRef: outer-0 -->
     * ```
     * @experimental
     */
    var EmbeddedViewRef = (function (_super) {
        __extends$11(EmbeddedViewRef, _super);
        function EmbeddedViewRef() {
            _super.apply(this, arguments);
        }
        Object.defineProperty(EmbeddedViewRef.prototype, "context", {
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EmbeddedViewRef.prototype, "rootNodes", {
            get: function () { return unimplemented(); },
            enumerable: true,
            configurable: true
        });
        ;
        return EmbeddedViewRef;
    }(ViewRef));
    var ViewRef_ = (function () {
        function ViewRef_(_view) {
            this._view = _view;
            this._view = _view;
            this._originalMode = this._view.cdMode;
        }
        Object.defineProperty(ViewRef_.prototype, "internalView", {
            get: function () { return this._view; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewRef_.prototype, "rootNodes", {
            get: function () { return this._view.flatRootNodes; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewRef_.prototype, "context", {
            get: function () { return this._view.context; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewRef_.prototype, "destroyed", {
            get: function () { return this._view.destroyed; },
            enumerable: true,
            configurable: true
        });
        ViewRef_.prototype.markForCheck = function () { this._view.markPathToRootAsCheckOnce(); };
        ViewRef_.prototype.detach = function () { this._view.cdMode = ChangeDetectorStatus.Detached; };
        ViewRef_.prototype.detectChanges = function () {
            this._view.detectChanges(false);
            triggerQueuedAnimations();
        };
        ViewRef_.prototype.checkNoChanges = function () { this._view.detectChanges(true); };
        ViewRef_.prototype.reattach = function () {
            this._view.cdMode = this._originalMode;
            this.markForCheck();
        };
        ViewRef_.prototype.onDestroy = function (callback) { this._view.disposables.push(callback); };
        ViewRef_.prototype.destroy = function () { this._view.destroy(); };
        return ViewRef_;
    }());

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var __extends$12 = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var EventListener = (function () {
        function EventListener(name, callback) {
            this.name = name;
            this.callback = callback;
        }
        ;
        return EventListener;
    }());
    /**
     * @experimental All debugging apis are currently experimental.
     */
    var DebugNode = (function () {
        function DebugNode(nativeNode, parent, _debugInfo) {
            this._debugInfo = _debugInfo;
            this.nativeNode = nativeNode;
            if (isPresent(parent) && parent instanceof DebugElement) {
                parent.addChild(this);
            }
            else {
                this.parent = null;
            }
            this.listeners = [];
        }
        Object.defineProperty(DebugNode.prototype, "injector", {
            get: function () { return isPresent(this._debugInfo) ? this._debugInfo.injector : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugNode.prototype, "componentInstance", {
            get: function () {
                return isPresent(this._debugInfo) ? this._debugInfo.component : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugNode.prototype, "context", {
            get: function () { return isPresent(this._debugInfo) ? this._debugInfo.context : null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugNode.prototype, "references", {
            get: function () {
                return isPresent(this._debugInfo) ? this._debugInfo.references : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugNode.prototype, "providerTokens", {
            get: function () {
                return isPresent(this._debugInfo) ? this._debugInfo.providerTokens : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugNode.prototype, "source", {
            get: function () { return isPresent(this._debugInfo) ? this._debugInfo.source : null; },
            enumerable: true,
            configurable: true
        });
        return DebugNode;
    }());
    /**
     * @experimental All debugging apis are currently experimental.
     */
    var DebugElement = (function (_super) {
        __extends$12(DebugElement, _super);
        function DebugElement(nativeNode, parent, _debugInfo) {
            _super.call(this, nativeNode, parent, _debugInfo);
            this.properties = {};
            this.attributes = {};
            this.classes = {};
            this.styles = {};
            this.childNodes = [];
            this.nativeElement = nativeNode;
        }
        DebugElement.prototype.addChild = function (child) {
            if (isPresent(child)) {
                this.childNodes.push(child);
                child.parent = this;
            }
        };
        DebugElement.prototype.removeChild = function (child) {
            var childIndex = this.childNodes.indexOf(child);
            if (childIndex !== -1) {
                child.parent = null;
                this.childNodes.splice(childIndex, 1);
            }
        };
        DebugElement.prototype.insertChildrenAfter = function (child, newChildren) {
            var siblingIndex = this.childNodes.indexOf(child);
            if (siblingIndex !== -1) {
                var previousChildren = this.childNodes.slice(0, siblingIndex + 1);
                var nextChildren = this.childNodes.slice(siblingIndex + 1);
                this.childNodes = previousChildren.concat(newChildren, nextChildren);
                for (var i = 0; i < newChildren.length; ++i) {
                    var newChild = newChildren[i];
                    if (isPresent(newChild.parent)) {
                        newChild.parent.removeChild(newChild);
                    }
                    newChild.parent = this;
                }
            }
        };
        DebugElement.prototype.query = function (predicate) {
            var results = this.queryAll(predicate);
            return results.length > 0 ? results[0] : null;
        };
        DebugElement.prototype.queryAll = function (predicate) {
            var matches = [];
            _queryElementChildren(this, predicate, matches);
            return matches;
        };
        DebugElement.prototype.queryAllNodes = function (predicate) {
            var matches = [];
            _queryNodeChildren(this, predicate, matches);
            return matches;
        };
        Object.defineProperty(DebugElement.prototype, "children", {
            get: function () {
                var children = [];
                this.childNodes.forEach(function (node) {
                    if (node instanceof DebugElement) {
                        children.push(node);
                    }
                });
                return children;
            },
            enumerable: true,
            configurable: true
        });
        DebugElement.prototype.triggerEventHandler = function (eventName, eventObj) {
            this.listeners.forEach(function (listener) {
                if (listener.name == eventName) {
                    listener.callback(eventObj);
                }
            });
        };
        return DebugElement;
    }(DebugNode));
    /**
     * @experimental
     */
    function asNativeElements(debugEls) {
        return debugEls.map(function (el) { return el.nativeElement; });
    }
    function _queryElementChildren(element, predicate, matches) {
        element.childNodes.forEach(function (node) {
            if (node instanceof DebugElement) {
                if (predicate(node)) {
                    matches.push(node);
                }
                _queryElementChildren(node, predicate, matches);
            }
        });
    }
    function _queryNodeChildren(parentNode, predicate, matches) {
        if (parentNode instanceof DebugElement) {
            parentNode.childNodes.forEach(function (node) {
                if (predicate(node)) {
                    matches.push(node);
                }
                if (node instanceof DebugElement) {
                    _queryNodeChildren(node, predicate, matches);
                }
            });
        }
    }
    // Need to keep the nodes in a global Map so that multiple angular apps are supported.
    var _nativeNodeToDebugNode = new Map();
    /**
     * @experimental
     */
    function getDebugNode(nativeNode) {
        return _nativeNodeToDebugNode.get(nativeNode);
    }
    function indexDebugNode(node) {
        _nativeNodeToDebugNode.set(node.nativeNode, node);
    }
    function removeDebugNodeFromIndex(node) {
        _nativeNodeToDebugNode.delete(node.nativeNode);
    }

    function _reflector() {
        return reflector;
    }
    var _CORE_PLATFORM_PROVIDERS = [
        PlatformRef_,
        { provide: PlatformRef, useExisting: PlatformRef_ },
        { provide: Reflector, useFactory: _reflector, deps: [] },
        { provide: ReflectorReader, useExisting: Reflector },
        TestabilityRegistry,
        Console,
    ];
    /**
     * This platform has to be included in any other platform
     *
     * @experimental
     */
    var platformCore = createPlatformFactory(null, 'core', _CORE_PLATFORM_PROVIDERS);

    /**
     * @experimental i18n support is experimental.
     */
    var LOCALE_ID = new OpaqueToken('LocaleId');
    /**
     * @experimental i18n support is experimental.
     */
    var TRANSLATIONS = new OpaqueToken('Translations');
    /**
     * @experimental i18n support is experimental.
     */
    var TRANSLATIONS_FORMAT = new OpaqueToken('TranslationsFormat');

    function _iterableDiffersFactory() {
        return defaultIterableDiffers;
    }
    function _keyValueDiffersFactory() {
        return defaultKeyValueDiffers;
    }
    /**
     * This module includes the providers of @angular/core that are needed
     * to bootstrap components via `ApplicationRef`.
     *
     * @experimental
     */
    var ApplicationModule = (function () {
        function ApplicationModule() {
        }
        ApplicationModule.decorators = [
            { type: NgModule, args: [{
                        providers: [
                            ApplicationRef_,
                            { provide: ApplicationRef, useExisting: ApplicationRef_ },
                            ApplicationInitStatus,
                            Compiler,
                            APP_ID_RANDOM_PROVIDER,
                            ViewUtils,
                            { provide: IterableDiffers, useFactory: _iterableDiffersFactory },
                            { provide: KeyValueDiffers, useFactory: _keyValueDiffersFactory },
                            { provide: LOCALE_ID, useValue: 'en-US' },
                        ]
                    },] },
        ];
        /** @nocollapse */
        ApplicationModule.ctorParameters = [];
        return ApplicationModule;
    }());

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var FILL_STYLE_FLAG = 'true'; // TODO (matsko): change to boolean
    var ANY_STATE = '*';
    var DEFAULT_STATE = '*';
    var EMPTY_STATE = 'void';

    var AnimationGroupPlayer = (function () {
        function AnimationGroupPlayer(_players) {
            var _this = this;
            this._players = _players;
            this._onDoneFns = [];
            this._onStartFns = [];
            this._finished = false;
            this._started = false;
            this.parentPlayer = null;
            var count = 0;
            var total = this._players.length;
            if (total == 0) {
                scheduleMicroTask(function () { return _this._onFinish(); });
            }
            else {
                this._players.forEach(function (player) {
                    player.parentPlayer = _this;
                    player.onDone(function () {
                        if (++count >= total) {
                            _this._onFinish();
                        }
                    });
                });
            }
        }
        AnimationGroupPlayer.prototype._onFinish = function () {
            if (!this._finished) {
                this._finished = true;
                if (!isPresent(this.parentPlayer)) {
                    this.destroy();
                }
                this._onDoneFns.forEach(function (fn) { return fn(); });
                this._onDoneFns = [];
            }
        };
        AnimationGroupPlayer.prototype.init = function () { this._players.forEach(function (player) { return player.init(); }); };
        AnimationGroupPlayer.prototype.onStart = function (fn) { this._onStartFns.push(fn); };
        AnimationGroupPlayer.prototype.onDone = function (fn) { this._onDoneFns.push(fn); };
        AnimationGroupPlayer.prototype.hasStarted = function () { return this._started; };
        AnimationGroupPlayer.prototype.play = function () {
            if (!isPresent(this.parentPlayer)) {
                this.init();
            }
            if (!this.hasStarted()) {
                this._onStartFns.forEach(function (fn) { return fn(); });
                this._onStartFns = [];
                this._started = true;
            }
            this._players.forEach(function (player) { return player.play(); });
        };
        AnimationGroupPlayer.prototype.pause = function () { this._players.forEach(function (player) { return player.pause(); }); };
        AnimationGroupPlayer.prototype.restart = function () { this._players.forEach(function (player) { return player.restart(); }); };
        AnimationGroupPlayer.prototype.finish = function () {
            this._onFinish();
            this._players.forEach(function (player) { return player.finish(); });
        };
        AnimationGroupPlayer.prototype.destroy = function () {
            this._onFinish();
            this._players.forEach(function (player) { return player.destroy(); });
        };
        AnimationGroupPlayer.prototype.reset = function () { this._players.forEach(function (player) { return player.reset(); }); };
        AnimationGroupPlayer.prototype.setPosition = function (p /** TODO #9100 */) {
            this._players.forEach(function (player) { player.setPosition(p); });
        };
        AnimationGroupPlayer.prototype.getPosition = function () {
            var min = 0;
            this._players.forEach(function (player) {
                var p = player.getPosition();
                min = Math.min(p, min);
            });
            return min;
        };
        return AnimationGroupPlayer;
    }());

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var AnimationKeyframe = (function () {
        function AnimationKeyframe(offset, styles) {
            this.offset = offset;
            this.styles = styles;
        }
        return AnimationKeyframe;
    }());

    /**
     * @experimental Animation support is experimental.
     */
    var AnimationPlayer = (function () {
        function AnimationPlayer() {
        }
        Object.defineProperty(AnimationPlayer.prototype, "parentPlayer", {
            get: function () { throw new Error('NOT IMPLEMENTED: Base Class'); },
            set: function (player) { throw new Error('NOT IMPLEMENTED: Base Class'); },
            enumerable: true,
            configurable: true
        });
        return AnimationPlayer;
    }());
    var NoOpAnimationPlayer = (function () {
        function NoOpAnimationPlayer() {
            var _this = this;
            this._onDoneFns = [];
            this._onStartFns = [];
            this._started = false;
            this.parentPlayer = null;
            scheduleMicroTask(function () { return _this._onFinish(); });
        }
        /** @internal */
        NoOpAnimationPlayer.prototype._onFinish = function () {
            this._onDoneFns.forEach(function (fn) { return fn(); });
            this._onDoneFns = [];
        };
        NoOpAnimationPlayer.prototype.onStart = function (fn) { this._onStartFns.push(fn); };
        NoOpAnimationPlayer.prototype.onDone = function (fn) { this._onDoneFns.push(fn); };
        NoOpAnimationPlayer.prototype.hasStarted = function () { return this._started; };
        NoOpAnimationPlayer.prototype.init = function () { };
        NoOpAnimationPlayer.prototype.play = function () {
            if (!this.hasStarted()) {
                this._onStartFns.forEach(function (fn) { return fn(); });
                this._onStartFns = [];
            }
            this._started = true;
        };
        NoOpAnimationPlayer.prototype.pause = function () { };
        NoOpAnimationPlayer.prototype.restart = function () { };
        NoOpAnimationPlayer.prototype.finish = function () { this._onFinish(); };
        NoOpAnimationPlayer.prototype.destroy = function () { };
        NoOpAnimationPlayer.prototype.reset = function () { };
        NoOpAnimationPlayer.prototype.setPosition = function (p /** TODO #9100 */) { };
        NoOpAnimationPlayer.prototype.getPosition = function () { return 0; };
        return NoOpAnimationPlayer;
    }());

    var AnimationSequencePlayer = (function () {
        function AnimationSequencePlayer(_players) {
            var _this = this;
            this._players = _players;
            this._currentIndex = 0;
            this._onDoneFns = [];
            this._onStartFns = [];
            this._finished = false;
            this._started = false;
            this.parentPlayer = null;
            this._players.forEach(function (player) { player.parentPlayer = _this; });
            this._onNext(false);
        }
        AnimationSequencePlayer.prototype._onNext = function (start) {
            var _this = this;
            if (this._finished)
                return;
            if (this._players.length == 0) {
                this._activePlayer = new NoOpAnimationPlayer();
                scheduleMicroTask(function () { return _this._onFinish(); });
            }
            else if (this._currentIndex >= this._players.length) {
                this._activePlayer = new NoOpAnimationPlayer();
                this._onFinish();
            }
            else {
                var player = this._players[this._currentIndex++];
                player.onDone(function () { return _this._onNext(true); });
                this._activePlayer = player;
                if (start) {
                    player.play();
                }
            }
        };
        AnimationSequencePlayer.prototype._onFinish = function () {
            if (!this._finished) {
                this._finished = true;
                if (!isPresent(this.parentPlayer)) {
                    this.destroy();
                }
                this._onDoneFns.forEach(function (fn) { return fn(); });
                this._onDoneFns = [];
            }
        };
        AnimationSequencePlayer.prototype.init = function () { this._players.forEach(function (player) { return player.init(); }); };
        AnimationSequencePlayer.prototype.onStart = function (fn) { this._onStartFns.push(fn); };
        AnimationSequencePlayer.prototype.onDone = function (fn) { this._onDoneFns.push(fn); };
        AnimationSequencePlayer.prototype.hasStarted = function () { return this._started; };
        AnimationSequencePlayer.prototype.play = function () {
            if (!isPresent(this.parentPlayer)) {
                this.init();
            }
            if (!this.hasStarted()) {
                this._onStartFns.forEach(function (fn) { return fn(); });
                this._onStartFns = [];
                this._started = true;
            }
            this._activePlayer.play();
        };
        AnimationSequencePlayer.prototype.pause = function () { this._activePlayer.pause(); };
        AnimationSequencePlayer.prototype.restart = function () {
            if (this._players.length > 0) {
                this.reset();
                this._players[0].restart();
            }
        };
        AnimationSequencePlayer.prototype.reset = function () { this._players.forEach(function (player) { return player.reset(); }); };
        AnimationSequencePlayer.prototype.finish = function () {
            this._onFinish();
            this._players.forEach(function (player) { return player.finish(); });
        };
        AnimationSequencePlayer.prototype.destroy = function () {
            this._onFinish();
            this._players.forEach(function (player) { return player.destroy(); });
        };
        AnimationSequencePlayer.prototype.setPosition = function (p /** TODO #9100 */) { this._players[0].setPosition(p); };
        AnimationSequencePlayer.prototype.getPosition = function () { return this._players[0].getPosition(); };
        return AnimationSequencePlayer;
    }());

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var __extends$13 = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    /**
     * @experimental Animation support is experimental.
     */
    var AUTO_STYLE = '*';
    /**
     * Metadata representing the entry of animations.
     * Instances of this class are provided via the animation DSL when the {@link trigger trigger
     * animation function} is called.
     *
     * @experimental Animation support is experimental.
     */
    var AnimationEntryMetadata = (function () {
        function AnimationEntryMetadata(name, definitions) {
            this.name = name;
            this.definitions = definitions;
        }
        return AnimationEntryMetadata;
    }());
    /**
     * @experimental Animation support is experimental.
     */
    var AnimationStateMetadata = (function () {
        function AnimationStateMetadata() {
        }
        return AnimationStateMetadata;
    }());
    /**
     * Metadata representing the entry of animations.
     * Instances of this class are provided via the animation DSL when the {@link state state animation
     * function} is called.
     *
     * @experimental Animation support is experimental.
     */
    var AnimationStateDeclarationMetadata = (function (_super) {
        __extends$13(AnimationStateDeclarationMetadata, _super);
        function AnimationStateDeclarationMetadata(stateNameExpr, styles) {
            _super.call(this);
            this.stateNameExpr = stateNameExpr;
            this.styles = styles;
        }
        return AnimationStateDeclarationMetadata;
    }(AnimationStateMetadata));
    /**
     * Metadata representing the entry of animations.
     * Instances of this class are provided via the animation DSL when the
     * {@link transition transition animation function} is called.
     *
     * @experimental Animation support is experimental.
     */
    var AnimationStateTransitionMetadata = (function (_super) {
        __extends$13(AnimationStateTransitionMetadata, _super);
        function AnimationStateTransitionMetadata(stateChangeExpr, steps) {
            _super.call(this);
            this.stateChangeExpr = stateChangeExpr;
            this.steps = steps;
        }
        return AnimationStateTransitionMetadata;
    }(AnimationStateMetadata));
    /**
     * @experimental Animation support is experimental.
     */
    var AnimationMetadata = (function () {
        function AnimationMetadata() {
        }
        return AnimationMetadata;
    }());
    /**
     * Metadata representing the entry of animations.
     * Instances of this class are provided via the animation DSL when the {@link keyframes keyframes
     * animation function} is called.
     *
     * @experimental Animation support is experimental.
     */
    var AnimationKeyframesSequenceMetadata = (function (_super) {
        __extends$13(AnimationKeyframesSequenceMetadata, _super);
        function AnimationKeyframesSequenceMetadata(steps) {
            _super.call(this);
            this.steps = steps;
        }
        return AnimationKeyframesSequenceMetadata;
    }(AnimationMetadata));
    /**
     * Metadata representing the entry of animations.
     * Instances of this class are provided via the animation DSL when the {@link style style animation
     * function} is called.
     *
     * @experimental Animation support is experimental.
     */
    var AnimationStyleMetadata = (function (_super) {
        __extends$13(AnimationStyleMetadata, _super);
        function AnimationStyleMetadata(styles, offset) {
            if (offset === void 0) { offset = null; }
            _super.call(this);
            this.styles = styles;
            this.offset = offset;
        }
        return AnimationStyleMetadata;
    }(AnimationMetadata));
    /**
     * Metadata representing the entry of animations.
     * Instances of this class are provided via the animation DSL when the {@link animate animate
     * animation function} is called.
     *
     * @experimental Animation support is experimental.
     */
    var AnimationAnimateMetadata = (function (_super) {
        __extends$13(AnimationAnimateMetadata, _super);
        function AnimationAnimateMetadata(timings, styles) {
            _super.call(this);
            this.timings = timings;
            this.styles = styles;
        }
        return AnimationAnimateMetadata;
    }(AnimationMetadata));
    /**
     * @experimental Animation support is experimental.
     */
    var AnimationWithStepsMetadata = (function (_super) {
        __extends$13(AnimationWithStepsMetadata, _super);
        function AnimationWithStepsMetadata() {
            _super.call(this);
        }
        Object.defineProperty(AnimationWithStepsMetadata.prototype, "steps", {
            get: function () { throw new Error('NOT IMPLEMENTED: Base Class'); },
            enumerable: true,
            configurable: true
        });
        return AnimationWithStepsMetadata;
    }(AnimationMetadata));
    /**
     * Metadata representing the entry of animations.
     * Instances of this class are provided via the animation DSL when the {@link sequence sequence
     * animation function} is called.
     *
     * @experimental Animation support is experimental.
     */
    var AnimationSequenceMetadata = (function (_super) {
        __extends$13(AnimationSequenceMetadata, _super);
        function AnimationSequenceMetadata(_steps) {
            _super.call(this);
            this._steps = _steps;
        }
        Object.defineProperty(AnimationSequenceMetadata.prototype, "steps", {
            get: function () { return this._steps; },
            enumerable: true,
            configurable: true
        });
        return AnimationSequenceMetadata;
    }(AnimationWithStepsMetadata));
    /**
     * Metadata representing the entry of animations.
     * Instances of this class are provided via the animation DSL when the {@link group group animation
     * function} is called.
     *
     * @experimental Animation support is experimental.
     */
    var AnimationGroupMetadata = (function (_super) {
        __extends$13(AnimationGroupMetadata, _super);
        function AnimationGroupMetadata(_steps) {
            _super.call(this);
            this._steps = _steps;
        }
        Object.defineProperty(AnimationGroupMetadata.prototype, "steps", {
            get: function () { return this._steps; },
            enumerable: true,
            configurable: true
        });
        return AnimationGroupMetadata;
    }(AnimationWithStepsMetadata));
    /**
     * `animate` is an animation-specific function that is designed to be used inside of Angular2's
     * animation
     * DSL language. If this information is new, please navigate to the
     * {@link Component#animations-anchor component animations metadata
     * page} to gain a better understanding of how animations in Angular2 are used.
     *
     * `animate` specifies an animation step that will apply the provided `styles` data for a given
     * amount of
     * time based on the provided `timing` expression value. Calls to `animate` are expected to be
     * used within {@link sequence an animation sequence}, {@link group group}, or {@link transition
     * transition}.
     *
     * ### Usage
     *
     * The `animate` function accepts two input parameters: `timing` and `styles`:
     *
     * - `timing` is a string based value that can be a combination of a duration with optional
     * delay and easing values. The format for the expression breaks down to `duration delay easing`
     * (therefore a value such as `1s 100ms ease-out` will be parse itself into `duration=1000,
     * delay=100, easing=ease-out`.
     * If a numeric value is provided then that will be used as the `duration` value in millisecond
     * form.
     * - `styles` is the style input data which can either be a call to {@link style style} or {@link
     * keyframes keyframes}.
     * If left empty then the styles from the destination state will be collected and used (this is
     * useful when
     * describing an animation step that will complete an animation by {@link
     * transition#the-final-animate-call animating to the final state}).
     *
     * ```typescript
     * // various functions for specifying timing data
     * animate(500, style(...))
     * animate("1s", style(...))
     * animate("100ms 0.5s", style(...))
     * animate("5s ease", style(...))
     * animate("5s 10ms cubic-bezier(.17,.67,.88,.1)", style(...))
     *
     * // either style() of keyframes() can be used
     * animate(500, style({ background: "red" }))
     * animate(500, keyframes([
     *   style({ background: "blue" })),
     *   style({ background: "red" }))
     * ])
     * ```
     *
     * ### Example ([live demo](http://plnkr.co/edit/Kez8XGWBxWue7qP7nNvF?p=preview))
     *
     * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
     *
     * @experimental Animation support is experimental.
     */
    function animate(timing, styles) {
        if (styles === void 0) { styles = null; }
        var stylesEntry = styles;
        if (!isPresent(stylesEntry)) {
            var EMPTY_STYLE = {};
            stylesEntry = new AnimationStyleMetadata([EMPTY_STYLE], 1);
        }
        return new AnimationAnimateMetadata(timing, stylesEntry);
    }
    /**
     * `group` is an animation-specific function that is designed to be used inside of Angular2's
     * animation
     * DSL language. If this information is new, please navigate to the
     * {@link Component#animations-anchor component animations metadata
     * page} to gain a better understanding of how animations in Angular2 are used.
     *
     * `group` specifies a list of animation steps that are all run in parallel. Grouped animations
     * are useful when a series of styles must be animated/closed off
     * at different statrting/ending times.
     *
     * The `group` function can either be used within a {@link sequence sequence} or a {@link transition
     * transition}
     * and it will only continue to the next instruction once all of the inner animation steps
     * have completed.
     *
     * ### Usage
     *
     * The `steps` data that is passed into the `group` animation function can either consist
     * of {@link style style} or {@link animate animate} function calls. Each call to `style()` or
     * `animate()`
     * within a group will be executed instantly (use {@link keyframes keyframes} or a
     * {@link animate#usage animate() with a delay value} to offset styles to be applied at a later
     * time).
     *
     * ```typescript
     * group([
     *   animate("1s", { background: "black" }))
     *   animate("2s", { color: "white" }))
     * ])
     * ```
     *
     * ### Example ([live demo](http://plnkr.co/edit/Kez8XGWBxWue7qP7nNvF?p=preview))
     *
     * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
     *
     * @experimental Animation support is experimental.
     */
    function group(steps) {
        return new AnimationGroupMetadata(steps);
    }
    /**
     * `sequence` is an animation-specific function that is designed to be used inside of Angular2's
     * animation
     * DSL language. If this information is new, please navigate to the
     * {@link Component#animations-anchor component animations metadata
     * page} to gain a better understanding of how animations in Angular2 are used.
     *
     * `sequence` Specifies a list of animation steps that are run one by one. (`sequence` is used
     * by default when an array is passed as animation data into {@link transition transition}.)
     *
     * The `sequence` function can either be used within a {@link group group} or a {@link transition
     * transition}
     * and it will only continue to the next instruction once each of the inner animation steps
     * have completed.
     *
     * To perform animation styling in parallel with other animation steps then
     * have a look at the {@link group group} animation function.
     *
     * ### Usage
     *
     * The `steps` data that is passed into the `sequence` animation function can either consist
     * of {@link style style} or {@link animate animate} function calls. A call to `style()` will apply
     * the
     * provided styling data immediately while a call to `animate()` will apply its styling
     * data over a given time depending on its timing data.
     *
     * ```typescript
     * sequence([
     *   style({ opacity: 0 })),
     *   animate("1s", { opacity: 1 }))
     * ])
     * ```
     *
     * ### Example ([live demo](http://plnkr.co/edit/Kez8XGWBxWue7qP7nNvF?p=preview))
     *
     * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
     *
     * @experimental Animation support is experimental.
     */
    function sequence(steps) {
        return new AnimationSequenceMetadata(steps);
    }
    /**
     * `style` is an animation-specific function that is designed to be used inside of Angular2's
     * animation
     * DSL language. If this information is new, please navigate to the
     * {@link Component#animations-anchor component animations metadata
     * page} to gain a better understanding of how animations in Angular2 are used.
     *
     * `style` declares a key/value object containing CSS properties/styles that can then
     * be used for {@link state animation states}, within an {@link sequence animation sequence}, or as
     * styling data for both {@link animate animate} and {@link keyframes keyframes}.
     *
     * ### Usage
     *
     * `style` takes in a key/value string map as data and expects one or more CSS property/value
     * pairs to be defined.
     *
     * ```typescript
     * // string values are used for css properties
     * style({ background: "red", color: "blue" })
     *
     * // numerical (pixel) values are also supported
     * style({ width: 100, height: 0 })
     * ```
     *
     * #### Auto-styles (using `*`)
     *
     * When an asterix (`*`) character is used as a value then it will be detected from the element
     * being animated
     * and applied as animation data when the animation starts.
     *
     * This feature proves useful for a state depending on layout and/or environment factors; in such
     * cases
     * the styles are calculated just before the animation starts.
     *
     * ```typescript
     * // the steps below will animate from 0 to the
     * // actual height of the element
     * style({ height: 0 }),
     * animate("1s", style({ height: "*" }))
     * ```
     *
     * ### Example ([live demo](http://plnkr.co/edit/Kez8XGWBxWue7qP7nNvF?p=preview))
     *
     * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
     *
     * @experimental Animation support is experimental.
     */
    function style(tokens) {
        var input;
        var offset = null;
        if (typeof tokens === 'string') {
            input = [tokens];
        }
        else {
            if (Array.isArray(tokens)) {
                input = tokens;
            }
            else {
                input = [tokens];
            }
            input.forEach(function (entry) {
                var entryOffset = entry['offset'];
                if (isPresent(entryOffset)) {
                    offset = offset == null ? parseFloat(entryOffset) : offset;
                }
            });
        }
        return new AnimationStyleMetadata(input, offset);
    }
    /**
     * `state` is an animation-specific function that is designed to be used inside of Angular2's
     * animation
     * DSL language. If this information is new, please navigate to the
     * {@link Component#animations-anchor component animations metadata
     * page} to gain a better understanding of how animations in Angular2 are used.
     *
     * `state` declares an animation state within the given trigger. When a state is
     * active within a component then its associated styles will persist on
     * the element that the trigger is attached to (even when the animation ends).
     *
     * To animate between states, have a look at the animation {@link transition transition}
     * DSL function. To register states to an animation trigger please have a look
     * at the {@link trigger trigger} function.
     *
     * #### The `void` state
     *
     * The `void` state value is a reserved word that angular uses to determine when the element is not
     * apart
     * of the application anymore (e.g. when an `ngIf` evaluates to false then the state of the
     * associated element
     * is void).
     *
     * #### The `*` (default) state
     *
     * The `*` state (when styled) is a fallback state that will be used if
     * the state that is being animated is not declared within the trigger.
     *
     * ### Usage
     *
     * `state` will declare an animation state with its associated styles
     * within the given trigger.
     *
     * - `stateNameExpr` can be one or more state names separated by commas.
     * - `styles` refers to the {@link style styling data} that will be persisted on the element once
     * the state
     * has been reached.
     *
     * ```typescript
     * // "void" is a reserved name for a state and is used to represent
     * // the state in which an element is detached from from the application.
     * state("void", style({ height: 0 }))
     *
     * // user-defined states
     * state("closed", style({ height: 0 }))
     * state("open, visible", style({ height: "*" }))
     * ```
     *
     * ### Example ([live demo](http://plnkr.co/edit/Kez8XGWBxWue7qP7nNvF?p=preview))
     *
     * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
     *
     * @experimental Animation support is experimental.
     */
    function state(stateNameExpr, styles) {
        return new AnimationStateDeclarationMetadata(stateNameExpr, styles);
    }
    /**
     * `keyframes` is an animation-specific function that is designed to be used inside of Angular2's
     * animation
     * DSL language. If this information is new, please navigate to the
     * {@link Component#animations-anchor component animations metadata
     * page} to gain a better understanding of how animations in Angular2 are used.
     *
     * `keyframes` specifies a collection of {@link style style} entries each optionally characterized
     * by an `offset` value.
     *
     * ### Usage
     *
     * The `keyframes` animation function is designed to be used alongside the {@link animate animate}
     * animation function. Instead of applying animations from where they are
     * currently to their destination, keyframes can describe how each style entry is applied
     * and at what point within the animation arc (much like CSS Keyframe Animations do).
     *
     * For each `style()` entry an `offset` value can be set. Doing so allows to specifiy at
     * what percentage of the animate time the styles will be applied.
     *
     * ```typescript
     * // the provided offset values describe when each backgroundColor value is applied.
     * animate("5s", keyframes([
     *   style({ backgroundColor: "red", offset: 0 }),
     *   style({ backgroundColor: "blue", offset: 0.2 }),
     *   style({ backgroundColor: "orange", offset: 0.3 }),
     *   style({ backgroundColor: "black", offset: 1 })
     * ]))
     * ```
     *
     * Alternatively, if there are no `offset` values used within the style entries then the offsets
     * will
     * be calculated automatically.
     *
     * ```typescript
     * animate("5s", keyframes([
     *   style({ backgroundColor: "red" }) // offset = 0
     *   style({ backgroundColor: "blue" }) // offset = 0.33
     *   style({ backgroundColor: "orange" }) // offset = 0.66
     *   style({ backgroundColor: "black" }) // offset = 1
     * ]))
     * ```
     *
     * ### Example ([live demo](http://plnkr.co/edit/Kez8XGWBxWue7qP7nNvF?p=preview))
     *
     * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
     *
     * @experimental Animation support is experimental.
     */
    function keyframes(steps) {
        return new AnimationKeyframesSequenceMetadata(steps);
    }
    /**
     * `transition` is an animation-specific function that is designed to be used inside of Angular2's
     * animation
     * DSL language. If this information is new, please navigate to the
     * {@link Component#animations-anchor component animations metadata
     * page} to gain a better understanding of how animations in Angular2 are used.
     *
     * `transition` declares the {@link sequence sequence of animation steps} that will be run when the
     * provided
     * `stateChangeExpr` value is satisfied. The `stateChangeExpr` consists of a `state1 => state2`
     * which consists
     * of two known states (use an asterix (`*`) to refer to a dynamic starting and/or ending state).
     *
     * Animation transitions are placed within an {@link trigger animation trigger}. For an transition
     * to animate to
     * a state value and persist its styles then one or more {@link state animation states} is expected
     * to be defined.
     *
     * ### Usage
     *
     * An animation transition is kicked off the `stateChangeExpr` predicate evaluates to true based on
     * what the
     * previous state is and what the current state has become. In other words, if a transition is
     * defined that
     * matches the old/current state criteria then the associated animation will be triggered.
     *
     * ```typescript
     * // all transition/state changes are defined within an animation trigger
     * trigger("myAnimationTrigger", [
     *   // if a state is defined then its styles will be persisted when the
     *   // animation has fully completed itself
     *   state("on", style({ background: "green" })),
     *   state("off", style({ background: "grey" })),
     *
     *   // a transition animation that will be kicked off when the state value
     *   // bound to "myAnimationTrigger" changes from "on" to "off"
     *   transition("on => off", animate(500)),
     *
     *   // it is also possible to do run the same animation for both directions
     *   transition("on <=> off", animate(500)),
     *
     *   // or to define multiple states pairs separated by commas
     *   transition("on => off, off => void", animate(500)),
     *
     *   // this is a catch-all state change for when an element is inserted into
     *   // the page and the destination state is unknown
     *   transition("void => *", [
     *     style({ opacity: 0 }),
     *     animate(500)
     *   ]),
     *
     *   // this will capture a state change between any states
     *   transition("* => *", animate("1s 0s")),
     * ])
     * ```
     *
     * The template associated with this component will make use of the `myAnimationTrigger`
     * animation trigger by binding to an element within its template code.
     *
     * ```html
     * <!-- somewhere inside of my-component-tpl.html -->
     * <div [@myAnimationTrigger]="myStatusExp">...</div>
     * ```
     *
     * #### The final `animate` call
     *
     * If the final step within the transition steps is a call to `animate()` that **only**
     * uses a timing value with **no style data** then it will be automatically used as the final
     * animation
     * arc for the element to animate itself to the final state. This involves an automatic mix of
     * adding/removing CSS styles so that the element will be in the exact state it should be for the
     * applied state to be presented correctly.
     *
     * ```
     * // start off by hiding the element, but make sure that it animates properly to whatever state
     * // is currently active for "myAnimationTrigger"
     * transition("void => *", [
     *   style({ opacity: 0 }),
     *   animate(500)
     * ])
     * ```
     *
     * ### Transition Aliases (`:enter` and `:leave`)
     *
     * Given that enter (insertion) and leave (removal) animations are so common,
     * the `transition` function accepts both `:enter` and `:leave` values which
     * are aliases for the `void => *` and `* => void` state changes.
     *
     * ```
     * transition(":enter", [
     *   style({ opacity: 0 }),
     *   animate(500, style({ opacity: 1 }))
     * ])
     * transition(":leave", [
     *   animate(500, style({ opacity: 0 }))
     * ])
     * ```
     *
     * ### Example ([live demo](http://plnkr.co/edit/Kez8XGWBxWue7qP7nNvF?p=preview))
     *
     * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
     *
     * @experimental Animation support is experimental.
     */
    function transition(stateChangeExpr, steps) {
        var animationData = Array.isArray(steps) ? new AnimationSequenceMetadata(steps) : steps;
        return new AnimationStateTransitionMetadata(stateChangeExpr, animationData);
    }
    /**
     * `trigger` is an animation-specific function that is designed to be used inside of Angular2's
     * animation
     * DSL language. If this information is new, please navigate to the
     * {@link Component#animations-anchor component animations metadata
     * page} to gain a better understanding of how animations in Angular2 are used.
     *
     * `trigger` Creates an animation trigger which will a list of {@link state state} and {@link
     * transition transition}
     * entries that will be evaluated when the expression bound to the trigger changes.
     *
     * Triggers are registered within the component annotation data under the
     * {@link Component#animations-anchor animations section}. An animation trigger can
     * be placed on an element within a template by referencing the name of the
     * trigger followed by the expression value that the trigger is bound to
     * (in the form of `[@triggerName]="expression"`.
     *
     * ### Usage
     *
     * `trigger` will create an animation trigger reference based on the provided `name` value.
     * The provided `animation` value is expected to be an array consisting of {@link state state} and
     * {@link transition transition}
     * declarations.
     *
     * ```typescript
     * @Component({
     *   selector: 'my-component',
     *   templateUrl: 'my-component-tpl.html',
     *   animations: [
     *     trigger("myAnimationTrigger", [
     *       state(...),
     *       state(...),
     *       transition(...),
     *       transition(...)
     *     ])
     *   ]
     * })
     * class MyComponent {
     *   myStatusExp = "something";
     * }
     * ```
     *
     * The template associated with this component will make use of the `myAnimationTrigger`
     * animation trigger by binding to an element within its template code.
     *
     * ```html
     * <!-- somewhere inside of my-component-tpl.html -->
     * <div [@myAnimationTrigger]="myStatusExp">...</div>
     * ```
     *
     * ### Example ([live demo](http://plnkr.co/edit/Kez8XGWBxWue7qP7nNvF?p=preview))
     *
     * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
     *
     * @experimental Animation support is experimental.
     */
    function trigger(name, animation) {
        return new AnimationEntryMetadata(name, animation);
    }

    function prepareFinalAnimationStyles(previousStyles, newStyles, nullValue) {
        if (nullValue === void 0) { nullValue = null; }
        var finalStyles = {};
        Object.keys(newStyles).forEach(function (prop) {
            var value = newStyles[prop];
            finalStyles[prop] = value == AUTO_STYLE ? nullValue : value.toString();
        });
        Object.keys(previousStyles).forEach(function (prop) {
            if (!isPresent(finalStyles[prop])) {
                finalStyles[prop] = nullValue;
            }
        });
        return finalStyles;
    }
    function balanceAnimationKeyframes(collectedStyles, finalStateStyles, keyframes) {
        var limit = keyframes.length - 1;
        var firstKeyframe = keyframes[0];
        // phase 1: copy all the styles from the first keyframe into the lookup map
        var flatenedFirstKeyframeStyles = flattenStyles(firstKeyframe.styles.styles);
        var extraFirstKeyframeStyles = {};
        var hasExtraFirstStyles = false;
        Object.keys(collectedStyles).forEach(function (prop) {
            var value = collectedStyles[prop];
            // if the style is already defined in the first keyframe then
            // we do not replace it.
            if (!flatenedFirstKeyframeStyles[prop]) {
                flatenedFirstKeyframeStyles[prop] = value;
                extraFirstKeyframeStyles[prop] = value;
                hasExtraFirstStyles = true;
            }
        });
        var keyframeCollectedStyles = StringMapWrapper.merge({}, flatenedFirstKeyframeStyles);
        // phase 2: normalize the final keyframe
        var finalKeyframe = keyframes[limit];
        finalKeyframe.styles.styles.unshift(finalStateStyles);
        var flatenedFinalKeyframeStyles = flattenStyles(finalKeyframe.styles.styles);
        var extraFinalKeyframeStyles = {};
        var hasExtraFinalStyles = false;
        Object.keys(keyframeCollectedStyles).forEach(function (prop) {
            if (!isPresent(flatenedFinalKeyframeStyles[prop])) {
                extraFinalKeyframeStyles[prop] = AUTO_STYLE;
                hasExtraFinalStyles = true;
            }
        });
        if (hasExtraFinalStyles) {
            finalKeyframe.styles.styles.push(extraFinalKeyframeStyles);
        }
        Object.keys(flatenedFinalKeyframeStyles).forEach(function (prop) {
            if (!isPresent(flatenedFirstKeyframeStyles[prop])) {
                extraFirstKeyframeStyles[prop] = AUTO_STYLE;
                hasExtraFirstStyles = true;
            }
        });
        if (hasExtraFirstStyles) {
            firstKeyframe.styles.styles.push(extraFirstKeyframeStyles);
        }
        return keyframes;
    }
    function clearStyles(styles) {
        var finalStyles = {};
        Object.keys(styles).forEach(function (key) { finalStyles[key] = null; });
        return finalStyles;
    }
    function collectAndResolveStyles(collection, styles) {
        return styles.map(function (entry) {
            var stylesObj = {};
            Object.keys(entry).forEach(function (prop) {
                var value = entry[prop];
                if (value == FILL_STYLE_FLAG) {
                    value = collection[prop];
                    if (!isPresent(value)) {
                        value = AUTO_STYLE;
                    }
                }
                collection[prop] = value;
                stylesObj[prop] = value;
            });
            return stylesObj;
        });
    }
    function renderStyles(element, renderer, styles) {
        Object.keys(styles).forEach(function (prop) { renderer.setElementStyle(element, prop, styles[prop]); });
    }
    function flattenStyles(styles) {
        var finalStyles = {};
        styles.forEach(function (entry) {
            Object.keys(entry).forEach(function (prop) { finalStyles[prop] = entry[prop]; });
        });
        return finalStyles;
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var AnimationStyles = (function () {
        function AnimationStyles(styles) {
            this.styles = styles;
        }
        return AnimationStyles;
    }());

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * An instance of this class is returned as an event parameter when an animation
     * callback is captured for an animation either during the start or done phase.
     *
     * ```typescript
     * @Component({
     *   host: {
     *     '[@myAnimationTrigger]': 'someExpression',
     *     '(@myAnimationTrigger.start)': 'captureStartEvent($event)',
     *     '(@myAnimationTrigger.done)': 'captureDoneEvent($event)',
     *   },
     *   animations: [
     *     trigger("myAnimationTrigger", [
     *        // ...
     *     ])
     *   ]
     * })
     * class MyComponent {
     *   someExpression: any = false;
     *   captureStartEvent(event: AnimationTransitionEvent) {
     *     // the toState, fromState and totalTime data is accessible from the event variable
     *   }
     *
     *   captureDoneEvent(event: AnimationTransitionEvent) {
     *     // the toState, fromState and totalTime data is accessible from the event variable
     *   }
     * }
     * ```
     *
     * @experimental Animation support is experimental.
     */
    var AnimationTransitionEvent = (function () {
        function AnimationTransitionEvent(_a) {
            var fromState = _a.fromState, toState = _a.toState, totalTime = _a.totalTime, phaseName = _a.phaseName;
            this.fromState = fromState;
            this.toState = toState;
            this.totalTime = totalTime;
            this.phaseName = phaseName;
        }
        return AnimationTransitionEvent;
    }());

    var AnimationTransition = (function () {
        function AnimationTransition(_player, _fromState, _toState, _totalTime) {
            this._player = _player;
            this._fromState = _fromState;
            this._toState = _toState;
            this._totalTime = _totalTime;
        }
        AnimationTransition.prototype._createEvent = function (phaseName) {
            return new AnimationTransitionEvent({
                fromState: this._fromState,
                toState: this._toState,
                totalTime: this._totalTime,
                phaseName: phaseName
            });
        };
        AnimationTransition.prototype.onStart = function (callback) {
            var event = this._createEvent('start');
            this._player.onStart(function () { return callback(event); });
        };
        AnimationTransition.prototype.onDone = function (callback) {
            var event = this._createEvent('done');
            this._player.onDone(function () { return callback(event); });
        };
        return AnimationTransition;
    }());

    var DebugDomRootRenderer = (function () {
        function DebugDomRootRenderer(_delegate) {
            this._delegate = _delegate;
        }
        DebugDomRootRenderer.prototype.renderComponent = function (componentProto) {
            return new DebugDomRenderer(this._delegate.renderComponent(componentProto));
        };
        return DebugDomRootRenderer;
    }());
    var DebugDomRenderer = (function () {
        function DebugDomRenderer(_delegate) {
            this._delegate = _delegate;
        }
        DebugDomRenderer.prototype.selectRootElement = function (selectorOrNode, debugInfo) {
            var nativeEl = this._delegate.selectRootElement(selectorOrNode, debugInfo);
            var debugEl = new DebugElement(nativeEl, null, debugInfo);
            indexDebugNode(debugEl);
            return nativeEl;
        };
        DebugDomRenderer.prototype.createElement = function (parentElement, name, debugInfo) {
            var nativeEl = this._delegate.createElement(parentElement, name, debugInfo);
            var debugEl = new DebugElement(nativeEl, getDebugNode(parentElement), debugInfo);
            debugEl.name = name;
            indexDebugNode(debugEl);
            return nativeEl;
        };
        DebugDomRenderer.prototype.createViewRoot = function (hostElement) { return this._delegate.createViewRoot(hostElement); };
        DebugDomRenderer.prototype.createTemplateAnchor = function (parentElement, debugInfo) {
            var comment = this._delegate.createTemplateAnchor(parentElement, debugInfo);
            var debugEl = new DebugNode(comment, getDebugNode(parentElement), debugInfo);
            indexDebugNode(debugEl);
            return comment;
        };
        DebugDomRenderer.prototype.createText = function (parentElement, value, debugInfo) {
            var text = this._delegate.createText(parentElement, value, debugInfo);
            var debugEl = new DebugNode(text, getDebugNode(parentElement), debugInfo);
            indexDebugNode(debugEl);
            return text;
        };
        DebugDomRenderer.prototype.projectNodes = function (parentElement, nodes) {
            var debugParent = getDebugNode(parentElement);
            if (isPresent(debugParent) && debugParent instanceof DebugElement) {
                var debugElement_1 = debugParent;
                nodes.forEach(function (node) { debugElement_1.addChild(getDebugNode(node)); });
            }
            this._delegate.projectNodes(parentElement, nodes);
        };
        DebugDomRenderer.prototype.attachViewAfter = function (node, viewRootNodes) {
            var debugNode = getDebugNode(node);
            if (isPresent(debugNode)) {
                var debugParent = debugNode.parent;
                if (viewRootNodes.length > 0 && isPresent(debugParent)) {
                    var debugViewRootNodes = [];
                    viewRootNodes.forEach(function (rootNode) { return debugViewRootNodes.push(getDebugNode(rootNode)); });
                    debugParent.insertChildrenAfter(debugNode, debugViewRootNodes);
                }
            }
            this._delegate.attachViewAfter(node, viewRootNodes);
        };
        DebugDomRenderer.prototype.detachView = function (viewRootNodes) {
            viewRootNodes.forEach(function (node) {
                var debugNode = getDebugNode(node);
                if (isPresent(debugNode) && isPresent(debugNode.parent)) {
                    debugNode.parent.removeChild(debugNode);
                }
            });
            this._delegate.detachView(viewRootNodes);
        };
        DebugDomRenderer.prototype.destroyView = function (hostElement, viewAllNodes) {
            viewAllNodes.forEach(function (node) { removeDebugNodeFromIndex(getDebugNode(node)); });
            this._delegate.destroyView(hostElement, viewAllNodes);
        };
        DebugDomRenderer.prototype.listen = function (renderElement, name, callback) {
            var debugEl = getDebugNode(renderElement);
            if (isPresent(debugEl)) {
                debugEl.listeners.push(new EventListener(name, callback));
            }
            return this._delegate.listen(renderElement, name, callback);
        };
        DebugDomRenderer.prototype.listenGlobal = function (target, name, callback) {
            return this._delegate.listenGlobal(target, name, callback);
        };
        DebugDomRenderer.prototype.setElementProperty = function (renderElement, propertyName, propertyValue) {
            var debugEl = getDebugNode(renderElement);
            if (isPresent(debugEl) && debugEl instanceof DebugElement) {
                debugEl.properties[propertyName] = propertyValue;
            }
            this._delegate.setElementProperty(renderElement, propertyName, propertyValue);
        };
        DebugDomRenderer.prototype.setElementAttribute = function (renderElement, attributeName, attributeValue) {
            var debugEl = getDebugNode(renderElement);
            if (isPresent(debugEl) && debugEl instanceof DebugElement) {
                debugEl.attributes[attributeName] = attributeValue;
            }
            this._delegate.setElementAttribute(renderElement, attributeName, attributeValue);
        };
        DebugDomRenderer.prototype.setBindingDebugInfo = function (renderElement, propertyName, propertyValue) {
            this._delegate.setBindingDebugInfo(renderElement, propertyName, propertyValue);
        };
        DebugDomRenderer.prototype.setElementClass = function (renderElement, className, isAdd) {
            var debugEl = getDebugNode(renderElement);
            if (isPresent(debugEl) && debugEl instanceof DebugElement) {
                debugEl.classes[className] = isAdd;
            }
            this._delegate.setElementClass(renderElement, className, isAdd);
        };
        DebugDomRenderer.prototype.setElementStyle = function (renderElement, styleName, styleValue) {
            var debugEl = getDebugNode(renderElement);
            if (isPresent(debugEl) && debugEl instanceof DebugElement) {
                debugEl.styles[styleName] = styleValue;
            }
            this._delegate.setElementStyle(renderElement, styleName, styleValue);
        };
        DebugDomRenderer.prototype.invokeElementMethod = function (renderElement, methodName, args) {
            this._delegate.invokeElementMethod(renderElement, methodName, args);
        };
        DebugDomRenderer.prototype.setText = function (renderNode, text) { this._delegate.setText(renderNode, text); };
        DebugDomRenderer.prototype.animate = function (element, startingStyles, keyframes, duration, delay, easing) {
            return this._delegate.animate(element, startingStyles, keyframes, duration, delay, easing);
        };
        return DebugDomRenderer;
    }());

    var StaticNodeDebugInfo = (function () {
        function StaticNodeDebugInfo(providerTokens, componentToken, refTokens) {
            this.providerTokens = providerTokens;
            this.componentToken = componentToken;
            this.refTokens = refTokens;
        }
        return StaticNodeDebugInfo;
    }());
    var DebugContext = (function () {
        function DebugContext(_view, _nodeIndex, _tplRow, _tplCol) {
            this._view = _view;
            this._nodeIndex = _nodeIndex;
            this._tplRow = _tplRow;
            this._tplCol = _tplCol;
        }
        Object.defineProperty(DebugContext.prototype, "_staticNodeInfo", {
            get: function () {
                return isPresent(this._nodeIndex) ? this._view.staticNodeDebugInfos[this._nodeIndex] : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugContext.prototype, "context", {
            get: function () { return this._view.context; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugContext.prototype, "component", {
            get: function () {
                var staticNodeInfo = this._staticNodeInfo;
                if (isPresent(staticNodeInfo) && isPresent(staticNodeInfo.componentToken)) {
                    return this.injector.get(staticNodeInfo.componentToken);
                }
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugContext.prototype, "componentRenderElement", {
            get: function () {
                var componentView = this._view;
                while (isPresent(componentView.declarationAppElement) &&
                    componentView.type !== ViewType.COMPONENT) {
                    componentView = componentView.declarationAppElement.parentView;
                }
                return isPresent(componentView.declarationAppElement) ?
                    componentView.declarationAppElement.nativeElement :
                    null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugContext.prototype, "injector", {
            get: function () { return this._view.injector(this._nodeIndex); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugContext.prototype, "renderNode", {
            get: function () {
                if (isPresent(this._nodeIndex) && this._view.allNodes) {
                    return this._view.allNodes[this._nodeIndex];
                }
                else {
                    return null;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugContext.prototype, "providerTokens", {
            get: function () {
                var staticNodeInfo = this._staticNodeInfo;
                return isPresent(staticNodeInfo) ? staticNodeInfo.providerTokens : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugContext.prototype, "source", {
            get: function () {
                return this._view.componentType.templateUrl + ":" + this._tplRow + ":" + this._tplCol;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugContext.prototype, "references", {
            get: function () {
                var _this = this;
                var varValues = {};
                var staticNodeInfo = this._staticNodeInfo;
                if (isPresent(staticNodeInfo)) {
                    var refs = staticNodeInfo.refTokens;
                    Object.keys(refs).forEach(function (refName) {
                        var refToken = refs[refName];
                        var varValue;
                        if (isBlank(refToken)) {
                            varValue = _this._view.allNodes ? _this._view.allNodes[_this._nodeIndex] : null;
                        }
                        else {
                            varValue = _this._view.injectorGet(refToken, _this._nodeIndex, null);
                        }
                        varValues[refName] = varValue;
                    });
                }
                return varValues;
            },
            enumerable: true,
            configurable: true
        });
        return DebugContext;
    }());

    var ViewAnimationMap = (function () {
        function ViewAnimationMap() {
            this._map = new Map();
            this._allPlayers = [];
        }
        ViewAnimationMap.prototype.find = function (element, animationName) {
            var playersByAnimation = this._map.get(element);
            if (isPresent(playersByAnimation)) {
                return playersByAnimation[animationName];
            }
        };
        ViewAnimationMap.prototype.findAllPlayersByElement = function (element) {
            var el = this._map.get(element);
            return el ? Object.keys(el).map(function (k) { return el[k]; }) : [];
        };
        ViewAnimationMap.prototype.set = function (element, animationName, player) {
            var playersByAnimation = this._map.get(element);
            if (!isPresent(playersByAnimation)) {
                playersByAnimation = {};
            }
            var existingEntry = playersByAnimation[animationName];
            if (isPresent(existingEntry)) {
                this.remove(element, animationName);
            }
            playersByAnimation[animationName] = player;
            this._allPlayers.push(player);
            this._map.set(element, playersByAnimation);
        };
        ViewAnimationMap.prototype.getAllPlayers = function () { return this._allPlayers; };
        ViewAnimationMap.prototype.remove = function (element, animationName) {
            var playersByAnimation = this._map.get(element);
            if (playersByAnimation) {
                var player = playersByAnimation[animationName];
                delete playersByAnimation[animationName];
                var index = this._allPlayers.indexOf(player);
                this._allPlayers.splice(index, 1);
                if (Object.keys(playersByAnimation).length === 0) {
                    this._map.delete(element);
                }
            }
        };
        return ViewAnimationMap;
    }());

    var AnimationViewContext = (function () {
        function AnimationViewContext() {
            this._players = new ViewAnimationMap();
        }
        AnimationViewContext.prototype.onAllActiveAnimationsDone = function (callback) {
            var activeAnimationPlayers = this._players.getAllPlayers();
            // we check for the length to avoid having GroupAnimationPlayer
            // issue an unnecessary microtask when zero players are passed in
            if (activeAnimationPlayers.length) {
                new AnimationGroupPlayer(activeAnimationPlayers).onDone(function () { return callback(); });
            }
            else {
                callback();
            }
        };
        AnimationViewContext.prototype.queueAnimation = function (element, animationName, player) {
            queueAnimationGlobally(player);
            this._players.set(element, animationName, player);
        };
        AnimationViewContext.prototype.cancelActiveAnimation = function (element, animationName, removeAllAnimations) {
            if (removeAllAnimations === void 0) { removeAllAnimations = false; }
            if (removeAllAnimations) {
                this._players.findAllPlayersByElement(element).forEach(function (player) { return player.destroy(); });
            }
            else {
                var player = this._players.find(element, animationName);
                if (player) {
                    player.destroy();
                }
            }
        };
        return AnimationViewContext;
    }());

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var __extends$15 = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var _UNDEFINED$1 = new Object();
    var ElementInjector = (function (_super) {
        __extends$15(ElementInjector, _super);
        function ElementInjector(_view, _nodeIndex) {
            _super.call(this);
            this._view = _view;
            this._nodeIndex = _nodeIndex;
        }
        ElementInjector.prototype.get = function (token, notFoundValue) {
            if (notFoundValue === void 0) { notFoundValue = THROW_IF_NOT_FOUND; }
            var result = _UNDEFINED$1;
            if (result === _UNDEFINED$1) {
                result = this._view.injectorGet(token, this._nodeIndex, _UNDEFINED$1);
            }
            if (result === _UNDEFINED$1) {
                result = this._view.parentInjector.get(token, notFoundValue);
            }
            return result;
        };
        return ElementInjector;
    }(Injector));

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var __extends$14 = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var _scope_check = wtfCreateScope("AppView#check(ascii id)");
    /**
     * Cost of making objects: http://jsperf.com/instantiate-size-of-object
     *
     */
    var AppView = (function () {
        function AppView(clazz, componentType, type, viewUtils, parentInjector, declarationAppElement, cdMode) {
            this.clazz = clazz;
            this.componentType = componentType;
            this.type = type;
            this.viewUtils = viewUtils;
            this.parentInjector = parentInjector;
            this.declarationAppElement = declarationAppElement;
            this.cdMode = cdMode;
            this.contentChildren = [];
            this.viewChildren = [];
            this.viewContainerElement = null;
            this.numberOfChecks = 0;
            this.ref = new ViewRef_(this);
            if (type === ViewType.COMPONENT || type === ViewType.HOST) {
                this.renderer = viewUtils.renderComponent(componentType);
            }
            else {
                this.renderer = declarationAppElement.parentView.renderer;
            }
        }
        Object.defineProperty(AppView.prototype, "animationContext", {
            get: function () {
                if (!this._animationContext) {
                    this._animationContext = new AnimationViewContext();
                }
                return this._animationContext;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppView.prototype, "destroyed", {
            get: function () { return this.cdMode === ChangeDetectorStatus.Destroyed; },
            enumerable: true,
            configurable: true
        });
        AppView.prototype.create = function (context, givenProjectableNodes, rootSelectorOrNode) {
            this.context = context;
            var projectableNodes;
            switch (this.type) {
                case ViewType.COMPONENT:
                    projectableNodes = ensureSlotCount(givenProjectableNodes, this.componentType.slotCount);
                    break;
                case ViewType.EMBEDDED:
                    projectableNodes = this.declarationAppElement.parentView.projectableNodes;
                    break;
                case ViewType.HOST:
                    // Note: Don't ensure the slot count for the projectableNodes as we store
                    // them only for the contained component view (which will later check the slot count...)
                    projectableNodes = givenProjectableNodes;
                    break;
            }
            this._hasExternalHostElement = isPresent(rootSelectorOrNode);
            this.projectableNodes = projectableNodes;
            return this.createInternal(rootSelectorOrNode);
        };
        /**
         * Overwritten by implementations.
         * Returns the AppElement for the host element for ViewType.HOST.
         */
        AppView.prototype.createInternal = function (rootSelectorOrNode) { return null; };
        AppView.prototype.init = function (rootNodesOrAppElements, allNodes, disposables, subscriptions) {
            this.rootNodesOrAppElements = rootNodesOrAppElements;
            this.allNodes = allNodes;
            this.disposables = disposables;
            this.subscriptions = subscriptions;
            if (this.type === ViewType.COMPONENT) {
                // Note: the render nodes have been attached to their host element
                // in the ViewFactory already.
                this.declarationAppElement.parentView.viewChildren.push(this);
                this.dirtyParentQueriesInternal();
            }
        };
        AppView.prototype.injectorGet = function (token, nodeIndex, notFoundResult) {
            return this.injectorGetInternal(token, nodeIndex, notFoundResult);
        };
        /**
         * Overwritten by implementations
         */
        AppView.prototype.injectorGetInternal = function (token, nodeIndex, notFoundResult) {
            return notFoundResult;
        };
        AppView.prototype.injector = function (nodeIndex) {
            if (isPresent(nodeIndex)) {
                return new ElementInjector(this, nodeIndex);
            }
            else {
                return this.parentInjector;
            }
        };
        AppView.prototype.destroy = function () {
            if (this._hasExternalHostElement) {
                this.renderer.detachView(this.flatRootNodes);
            }
            else if (isPresent(this.viewContainerElement)) {
                this.viewContainerElement.detachView(this.viewContainerElement.nestedViews.indexOf(this));
            }
            this._destroyRecurse();
        };
        AppView.prototype._destroyRecurse = function () {
            if (this.cdMode === ChangeDetectorStatus.Destroyed) {
                return;
            }
            var children = this.contentChildren;
            for (var i = 0; i < children.length; i++) {
                children[i]._destroyRecurse();
            }
            children = this.viewChildren;
            for (var i = 0; i < children.length; i++) {
                children[i]._destroyRecurse();
            }
            this.destroyLocal();
            this.cdMode = ChangeDetectorStatus.Destroyed;
        };
        AppView.prototype.destroyLocal = function () {
            var _this = this;
            var hostElement = this.type === ViewType.COMPONENT ? this.declarationAppElement.nativeElement : null;
            for (var i = 0; i < this.disposables.length; i++) {
                this.disposables[i]();
            }
            for (var i = 0; i < this.subscriptions.length; i++) {
                this.subscriptions[i].unsubscribe();
            }
            this.destroyInternal();
            this.dirtyParentQueriesInternal();
            if (this._animationContext) {
                this._animationContext.onAllActiveAnimationsDone(function () { return _this.renderer.destroyView(hostElement, _this.allNodes); });
            }
            else {
                this.renderer.destroyView(hostElement, this.allNodes);
            }
        };
        /**
         * Overwritten by implementations
         */
        AppView.prototype.destroyInternal = function () { };
        /**
         * Overwritten by implementations
         */
        AppView.prototype.detachInternal = function () { };
        AppView.prototype.detach = function () {
            var _this = this;
            this.detachInternal();
            if (this._animationContext) {
                this._animationContext.onAllActiveAnimationsDone(function () { return _this.renderer.detachView(_this.flatRootNodes); });
            }
            else {
                this.renderer.detachView(this.flatRootNodes);
            }
        };
        Object.defineProperty(AppView.prototype, "changeDetectorRef", {
            get: function () { return this.ref; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppView.prototype, "parent", {
            get: function () {
                return isPresent(this.declarationAppElement) ? this.declarationAppElement.parentView : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppView.prototype, "flatRootNodes", {
            get: function () { return flattenNestedViewRenderNodes(this.rootNodesOrAppElements); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AppView.prototype, "lastRootNode", {
            get: function () {
                var lastNode = this.rootNodesOrAppElements.length > 0 ?
                    this.rootNodesOrAppElements[this.rootNodesOrAppElements.length - 1] :
                    null;
                return _findLastRenderNode(lastNode);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Overwritten by implementations
         */
        AppView.prototype.dirtyParentQueriesInternal = function () { };
        AppView.prototype.detectChanges = function (throwOnChange) {
            var s = _scope_check(this.clazz);
            if (this.cdMode === ChangeDetectorStatus.Checked ||
                this.cdMode === ChangeDetectorStatus.Errored)
                return;
            if (this.cdMode === ChangeDetectorStatus.Destroyed) {
                this.throwDestroyedError('detectChanges');
            }
            this.detectChangesInternal(throwOnChange);
            if (this.cdMode === ChangeDetectorStatus.CheckOnce)
                this.cdMode = ChangeDetectorStatus.Checked;
            this.numberOfChecks++;
            wtfLeave(s);
        };
        /**
         * Overwritten by implementations
         */
        AppView.prototype.detectChangesInternal = function (throwOnChange) {
            this.detectContentChildrenChanges(throwOnChange);
            this.detectViewChildrenChanges(throwOnChange);
        };
        AppView.prototype.detectContentChildrenChanges = function (throwOnChange) {
            for (var i = 0; i < this.contentChildren.length; ++i) {
                var child = this.contentChildren[i];
                if (child.cdMode === ChangeDetectorStatus.Detached)
                    continue;
                child.detectChanges(throwOnChange);
            }
        };
        AppView.prototype.detectViewChildrenChanges = function (throwOnChange) {
            for (var i = 0; i < this.viewChildren.length; ++i) {
                var child = this.viewChildren[i];
                if (child.cdMode === ChangeDetectorStatus.Detached)
                    continue;
                child.detectChanges(throwOnChange);
            }
        };
        AppView.prototype.markContentChildAsMoved = function (renderAppElement) { this.dirtyParentQueriesInternal(); };
        AppView.prototype.addToContentChildren = function (renderAppElement) {
            renderAppElement.parentView.contentChildren.push(this);
            this.viewContainerElement = renderAppElement;
            this.dirtyParentQueriesInternal();
        };
        AppView.prototype.removeFromContentChildren = function (renderAppElement) {
            ListWrapper.remove(renderAppElement.parentView.contentChildren, this);
            this.dirtyParentQueriesInternal();
            this.viewContainerElement = null;
        };
        AppView.prototype.markAsCheckOnce = function () { this.cdMode = ChangeDetectorStatus.CheckOnce; };
        AppView.prototype.markPathToRootAsCheckOnce = function () {
            var c = this;
            while (isPresent(c) && c.cdMode !== ChangeDetectorStatus.Detached) {
                if (c.cdMode === ChangeDetectorStatus.Checked) {
                    c.cdMode = ChangeDetectorStatus.CheckOnce;
                }
                var parentEl = c.type === ViewType.COMPONENT ? c.declarationAppElement : c.viewContainerElement;
                c = isPresent(parentEl) ? parentEl.parentView : null;
            }
        };
        AppView.prototype.eventHandler = function (cb) { return cb; };
        AppView.prototype.throwDestroyedError = function (details) { throw new ViewDestroyedError(details); };
        return AppView;
    }());
    var DebugAppView = (function (_super) {
        __extends$14(DebugAppView, _super);
        function DebugAppView(clazz, componentType, type, viewUtils, parentInjector, declarationAppElement, cdMode, staticNodeDebugInfos) {
            _super.call(this, clazz, componentType, type, viewUtils, parentInjector, declarationAppElement, cdMode);
            this.staticNodeDebugInfos = staticNodeDebugInfos;
            this._currentDebugContext = null;
        }
        DebugAppView.prototype.create = function (context, givenProjectableNodes, rootSelectorOrNode) {
            this._resetDebug();
            try {
                return _super.prototype.create.call(this, context, givenProjectableNodes, rootSelectorOrNode);
            }
            catch (e) {
                this._rethrowWithContext(e);
                throw e;
            }
        };
        DebugAppView.prototype.injectorGet = function (token, nodeIndex, notFoundResult) {
            this._resetDebug();
            try {
                return _super.prototype.injectorGet.call(this, token, nodeIndex, notFoundResult);
            }
            catch (e) {
                this._rethrowWithContext(e);
                throw e;
            }
        };
        DebugAppView.prototype.detach = function () {
            this._resetDebug();
            try {
                _super.prototype.detach.call(this);
            }
            catch (e) {
                this._rethrowWithContext(e);
                throw e;
            }
        };
        DebugAppView.prototype.destroyLocal = function () {
            this._resetDebug();
            try {
                _super.prototype.destroyLocal.call(this);
            }
            catch (e) {
                this._rethrowWithContext(e);
                throw e;
            }
        };
        DebugAppView.prototype.detectChanges = function (throwOnChange) {
            this._resetDebug();
            try {
                _super.prototype.detectChanges.call(this, throwOnChange);
            }
            catch (e) {
                this._rethrowWithContext(e);
                throw e;
            }
        };
        DebugAppView.prototype._resetDebug = function () { this._currentDebugContext = null; };
        DebugAppView.prototype.debug = function (nodeIndex, rowNum, colNum) {
            return this._currentDebugContext = new DebugContext(this, nodeIndex, rowNum, colNum);
        };
        DebugAppView.prototype._rethrowWithContext = function (e) {
            if (!(e instanceof ViewWrappedError)) {
                if (!(e instanceof ExpressionChangedAfterItHasBeenCheckedError)) {
                    this.cdMode = ChangeDetectorStatus.Errored;
                }
                if (isPresent(this._currentDebugContext)) {
                    throw new ViewWrappedError(e, this._currentDebugContext);
                }
            }
        };
        DebugAppView.prototype.eventHandler = function (cb) {
            var _this = this;
            var superHandler = _super.prototype.eventHandler.call(this, cb);
            return function (event) {
                _this._resetDebug();
                try {
                    return superHandler(event);
                }
                catch (e) {
                    _this._rethrowWithContext(e);
                    throw e;
                }
            };
        };
        return DebugAppView;
    }(AppView));
    function _findLastRenderNode(node) {
        var lastNode;
        if (node instanceof AppElement) {
            var appEl = node;
            lastNode = appEl.nativeElement;
            if (isPresent(appEl.nestedViews)) {
                // Note: Views might have no root nodes at all!
                for (var i = appEl.nestedViews.length - 1; i >= 0; i--) {
                    var nestedView = appEl.nestedViews[i];
                    if (nestedView.rootNodesOrAppElements.length > 0) {
                        lastNode = _findLastRenderNode(nestedView.rootNodesOrAppElements[nestedView.rootNodesOrAppElements.length - 1]);
                    }
                }
            }
        }
        else {
            lastNode = node;
        }
        return lastNode;
    }

    var __core_private__ = {
        isDefaultChangeDetectionStrategy: isDefaultChangeDetectionStrategy,
        ChangeDetectorStatus: ChangeDetectorStatus,
        constructDependencies: constructDependencies,
        LifecycleHooks: LifecycleHooks,
        LIFECYCLE_HOOKS_VALUES: LIFECYCLE_HOOKS_VALUES,
        ReflectorReader: ReflectorReader,
        CodegenComponentFactoryResolver: CodegenComponentFactoryResolver,
        AppElement: AppElement,
        AppView: AppView,
        DebugAppView: DebugAppView,
        NgModuleInjector: NgModuleInjector,
        registerModuleFactory: registerModuleFactory,
        ViewType: ViewType,
        view_utils: view_utils,
        ViewMetadata: ViewMetadata,
        DebugContext: DebugContext,
        StaticNodeDebugInfo: StaticNodeDebugInfo,
        devModeEqual: devModeEqual,
        UNINITIALIZED: UNINITIALIZED,
        ValueUnwrapper: ValueUnwrapper,
        RenderDebugInfo: RenderDebugInfo,
        TemplateRef_: TemplateRef_,
        ReflectionCapabilities: ReflectionCapabilities,
        makeDecorator: makeDecorator,
        DebugDomRootRenderer: DebugDomRootRenderer,
        Console: Console,
        reflector: reflector,
        Reflector: Reflector,
        NoOpAnimationPlayer: NoOpAnimationPlayer,
        AnimationPlayer: AnimationPlayer,
        AnimationSequencePlayer: AnimationSequencePlayer,
        AnimationGroupPlayer: AnimationGroupPlayer,
        AnimationKeyframe: AnimationKeyframe,
        prepareFinalAnimationStyles: prepareFinalAnimationStyles,
        balanceAnimationKeyframes: balanceAnimationKeyframes,
        flattenStyles: flattenStyles,
        clearStyles: clearStyles,
        renderStyles: renderStyles,
        collectAndResolveStyles: collectAndResolveStyles,
        AnimationStyles: AnimationStyles,
        ANY_STATE: ANY_STATE,
        DEFAULT_STATE: DEFAULT_STATE,
        EMPTY_STATE: EMPTY_STATE,
        FILL_STYLE_FLAG: FILL_STYLE_FLAG,
        ComponentStillLoadingError: ComponentStillLoadingError,
        isPromise: isPromise,
        AnimationTransition: AnimationTransition
    };

    exports.createPlatform = createPlatform;
    exports.assertPlatform = assertPlatform;
    exports.destroyPlatform = destroyPlatform;
    exports.getPlatform = getPlatform;
    exports.PlatformRef = PlatformRef;
    exports.ApplicationRef = ApplicationRef;
    exports.enableProdMode = enableProdMode;
    exports.isDevMode = isDevMode;
    exports.createPlatformFactory = createPlatformFactory;
    exports.APP_ID = APP_ID;
    exports.PACKAGE_ROOT_URL = PACKAGE_ROOT_URL;
    exports.PLATFORM_INITIALIZER = PLATFORM_INITIALIZER;
    exports.APP_BOOTSTRAP_LISTENER = APP_BOOTSTRAP_LISTENER;
    exports.APP_INITIALIZER = APP_INITIALIZER;
    exports.ApplicationInitStatus = ApplicationInitStatus;
    exports.DebugElement = DebugElement;
    exports.DebugNode = DebugNode;
    exports.asNativeElements = asNativeElements;
    exports.getDebugNode = getDebugNode;
    exports.Testability = Testability;
    exports.TestabilityRegistry = TestabilityRegistry;
    exports.setTestabilityGetter = setTestabilityGetter;
    exports.TRANSLATIONS = TRANSLATIONS;
    exports.TRANSLATIONS_FORMAT = TRANSLATIONS_FORMAT;
    exports.LOCALE_ID = LOCALE_ID;
    exports.ApplicationModule = ApplicationModule;
    exports.wtfCreateScope = wtfCreateScope;
    exports.wtfLeave = wtfLeave;
    exports.wtfStartTimeRange = wtfStartTimeRange;
    exports.wtfEndTimeRange = wtfEndTimeRange;
    exports.Type = Type;
    exports.EventEmitter = EventEmitter;
    exports.ErrorHandler = ErrorHandler;
    exports.AnimationTransitionEvent = AnimationTransitionEvent;
    exports.AnimationPlayer = AnimationPlayer;
    exports.Sanitizer = Sanitizer;
    exports.ANALYZE_FOR_ENTRY_COMPONENTS = ANALYZE_FOR_ENTRY_COMPONENTS;
    exports.Attribute = Attribute;
    exports.ContentChild = ContentChild;
    exports.ContentChildren = ContentChildren;
    exports.Query = Query;
    exports.ViewChild = ViewChild;
    exports.ViewChildren = ViewChildren;
    exports.Component = Component;
    exports.Directive = Directive;
    exports.HostBinding = HostBinding;
    exports.HostListener = HostListener;
    exports.Input = Input;
    exports.Output = Output;
    exports.Pipe = Pipe;
    exports.AfterContentChecked = AfterContentChecked;
    exports.AfterContentInit = AfterContentInit;
    exports.AfterViewChecked = AfterViewChecked;
    exports.AfterViewInit = AfterViewInit;
    exports.DoCheck = DoCheck;
    exports.OnChanges = OnChanges;
    exports.OnDestroy = OnDestroy;
    exports.OnInit = OnInit;
    exports.CUSTOM_ELEMENTS_SCHEMA = CUSTOM_ELEMENTS_SCHEMA;
    exports.NO_ERRORS_SCHEMA = NO_ERRORS_SCHEMA;
    exports.NgModule = NgModule;
    exports.Class = Class;
    exports.forwardRef = forwardRef;
    exports.resolveForwardRef = resolveForwardRef;
    exports.Injector = Injector;
    exports.ReflectiveInjector = ReflectiveInjector;
    exports.ResolvedReflectiveFactory = ResolvedReflectiveFactory;
    exports.ReflectiveKey = ReflectiveKey;
    exports.OpaqueToken = OpaqueToken;
    exports.Inject = Inject;
    exports.Optional = Optional;
    exports.Injectable = Injectable;
    exports.Self = Self;
    exports.SkipSelf = SkipSelf;
    exports.Host = Host;
    exports.NgZone = NgZone;
    exports.RenderComponentType = RenderComponentType;
    exports.Renderer = Renderer;
    exports.RootRenderer = RootRenderer;
    exports.COMPILER_OPTIONS = COMPILER_OPTIONS;
    exports.Compiler = Compiler;
    exports.CompilerFactory = CompilerFactory;
    exports.ModuleWithComponentFactories = ModuleWithComponentFactories;
    exports.ComponentFactory = ComponentFactory;
    exports.ComponentRef = ComponentRef;
    exports.ComponentFactoryResolver = ComponentFactoryResolver;
    exports.ElementRef = ElementRef;
    exports.NgModuleFactory = NgModuleFactory;
    exports.NgModuleRef = NgModuleRef;
    exports.NgModuleFactoryLoader = NgModuleFactoryLoader;
    exports.getModuleFactory = getModuleFactory;
    exports.QueryList = QueryList;
    exports.SystemJsNgModuleLoader = SystemJsNgModuleLoader;
    exports.SystemJsNgModuleLoaderConfig = SystemJsNgModuleLoaderConfig;
    exports.TemplateRef = TemplateRef;
    exports.ViewContainerRef = ViewContainerRef;
    exports.EmbeddedViewRef = EmbeddedViewRef;
    exports.ViewRef = ViewRef;
    exports.ChangeDetectorRef = ChangeDetectorRef;
    exports.CollectionChangeRecord = CollectionChangeRecord;
    exports.DefaultIterableDiffer = DefaultIterableDiffer;
    exports.IterableDiffers = IterableDiffers;
    exports.KeyValueChangeRecord = KeyValueChangeRecord;
    exports.KeyValueDiffers = KeyValueDiffers;
    exports.SimpleChange = SimpleChange;
    exports.WrappedValue = WrappedValue;
    exports.platformCore = platformCore;
    exports.__core_private__ = __core_private__;
    exports.AUTO_STYLE = AUTO_STYLE;
    exports.AnimationEntryMetadata = AnimationEntryMetadata;
    exports.AnimationStateMetadata = AnimationStateMetadata;
    exports.AnimationStateDeclarationMetadata = AnimationStateDeclarationMetadata;
    exports.AnimationStateTransitionMetadata = AnimationStateTransitionMetadata;
    exports.AnimationMetadata = AnimationMetadata;
    exports.AnimationKeyframesSequenceMetadata = AnimationKeyframesSequenceMetadata;
    exports.AnimationStyleMetadata = AnimationStyleMetadata;
    exports.AnimationAnimateMetadata = AnimationAnimateMetadata;
    exports.AnimationWithStepsMetadata = AnimationWithStepsMetadata;
    exports.AnimationSequenceMetadata = AnimationSequenceMetadata;
    exports.AnimationGroupMetadata = AnimationGroupMetadata;
    exports.animate = animate;
    exports.group = group;
    exports.sequence = sequence;
    exports.style = style;
    exports.state = state;
    exports.keyframes = keyframes;
    exports.transition = transition;
    exports.trigger = trigger;

}));
