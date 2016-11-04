/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, EventEmitter, Inject } from '@angular/core';
import * as angular from './angular_js';
import { NG1_COMPILE, NG1_CONTROLLER, NG1_HTTP_BACKEND, NG1_SCOPE, NG1_TEMPLATE_CACHE } from './constants';
import { controllerKey } from './util';
var CAMEL_CASE = /([A-Z])/g;
var INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
var NOT_SUPPORTED = 'NOT_SUPPORTED';
export var UpgradeNg1ComponentAdapterBuilder = (function () {
    function UpgradeNg1ComponentAdapterBuilder(name) {
        this.name = name;
        this.inputs = [];
        this.inputsRename = [];
        this.outputs = [];
        this.outputsRename = [];
        this.propertyOutputs = [];
        this.checkProperties = [];
        this.propertyMap = {};
        this.linkFn = null;
        this.directive = null;
        this.$controller = null;
        var selector = name.replace(CAMEL_CASE, function (all /** TODO #9100 */, next) { return '-' + next.toLowerCase(); });
        var self = this;
        this.type =
            Directive({ selector: selector, inputs: this.inputsRename, outputs: this.outputsRename })
                .Class({
                constructor: [
                    new Inject(NG1_SCOPE), ElementRef,
                    function (scope, elementRef) {
                        return new UpgradeNg1ComponentAdapter(self.linkFn, scope, self.directive, elementRef, self.$controller, self.inputs, self.outputs, self.propertyOutputs, self.checkProperties, self.propertyMap);
                    }
                ],
                ngOnInit: function () { },
                ngOnChanges: function () { },
                ngDoCheck: function () { }
            });
    }
    UpgradeNg1ComponentAdapterBuilder.prototype.extractDirective = function (injector) {
        var directives = injector.get(this.name + 'Directive');
        if (directives.length > 1) {
            throw new Error('Only support single directive definition for: ' + this.name);
        }
        var directive = directives[0];
        if (directive.replace)
            this.notSupported('replace');
        if (directive.terminal)
            this.notSupported('terminal');
        var link = directive.link;
        if (typeof link == 'object') {
            if (link.post)
                this.notSupported('link.post');
        }
        return directive;
    };
    UpgradeNg1ComponentAdapterBuilder.prototype.notSupported = function (feature) {
        throw new Error("Upgraded directive '" + this.name + "' does not support '" + feature + "'.");
    };
    UpgradeNg1ComponentAdapterBuilder.prototype.extractBindings = function () {
        var btcIsObject = typeof this.directive.bindToController === 'object';
        if (btcIsObject && Object.keys(this.directive.scope).length) {
            throw new Error("Binding definitions on scope and controller at the same time are not supported.");
        }
        var context = (btcIsObject) ? this.directive.bindToController : this.directive.scope;
        if (typeof context == 'object') {
            for (var name in context) {
                if (context.hasOwnProperty(name)) {
                    var localName = context[name];
                    var type = localName.charAt(0);
                    var typeOptions = localName.charAt(1);
                    localName = typeOptions === '?' ? localName.substr(2) : localName.substr(1);
                    localName = localName || name;
                    var outputName = 'output_' + name;
                    var outputNameRename = outputName + ': ' + name;
                    var outputNameRenameChange = outputName + ': ' + name + 'Change';
                    var inputName = 'input_' + name;
                    var inputNameRename = inputName + ': ' + name;
                    switch (type) {
                        case '=':
                            this.propertyOutputs.push(outputName);
                            this.checkProperties.push(localName);
                            this.outputs.push(outputName);
                            this.outputsRename.push(outputNameRenameChange);
                            this.propertyMap[outputName] = localName;
                            this.inputs.push(inputName);
                            this.inputsRename.push(inputNameRename);
                            this.propertyMap[inputName] = localName;
                            break;
                        case '@':
                        // handle the '<' binding of angular 1.5 components
                        case '<':
                            this.inputs.push(inputName);
                            this.inputsRename.push(inputNameRename);
                            this.propertyMap[inputName] = localName;
                            break;
                        case '&':
                            this.outputs.push(outputName);
                            this.outputsRename.push(outputNameRename);
                            this.propertyMap[outputName] = localName;
                            break;
                        default:
                            var json = JSON.stringify(context);
                            throw new Error("Unexpected mapping '" + type + "' in '" + json + "' in '" + this.name + "' directive.");
                    }
                }
            }
        }
    };
    UpgradeNg1ComponentAdapterBuilder.prototype.compileTemplate = function (compile, templateCache, httpBackend) {
        var _this = this;
        if (this.directive.template !== undefined) {
            this.linkFn = compileHtml(typeof this.directive.template === 'function' ? this.directive.template() :
                this.directive.template);
        }
        else if (this.directive.templateUrl) {
            var url = typeof this.directive.templateUrl === 'function' ? this.directive.templateUrl() :
                this.directive.templateUrl;
            var html = templateCache.get(url);
            if (html !== undefined) {
                this.linkFn = compileHtml(html);
            }
            else {
                return new Promise(function (resolve, err) {
                    httpBackend('GET', url, null, function (status /** TODO #9100 */, response /** TODO #9100 */) {
                        if (status == 200) {
                            resolve(_this.linkFn = compileHtml(templateCache.put(url, response)));
                        }
                        else {
                            err("GET " + url + " returned " + status + ": " + response);
                        }
                    });
                });
            }
        }
        else {
            throw new Error("Directive '" + this.name + "' is not a component, it is missing template.");
        }
        return null;
        function compileHtml(html /** TODO #9100 */) {
            var div = document.createElement('div');
            div.innerHTML = html;
            return compile(div.childNodes);
        }
    };
    /**
     * Upgrade ng1 components into Angular 2.
     */
    UpgradeNg1ComponentAdapterBuilder.resolve = function (exportedComponents, injector) {
        var promises = [];
        var compile = injector.get(NG1_COMPILE);
        var templateCache = injector.get(NG1_TEMPLATE_CACHE);
        var httpBackend = injector.get(NG1_HTTP_BACKEND);
        var $controller = injector.get(NG1_CONTROLLER);
        for (var name in exportedComponents) {
            if (exportedComponents.hasOwnProperty(name)) {
                var exportedComponent = exportedComponents[name];
                exportedComponent.directive = exportedComponent.extractDirective(injector);
                exportedComponent.$controller = $controller;
                exportedComponent.extractBindings();
                var promise = exportedComponent.compileTemplate(compile, templateCache, httpBackend);
                if (promise)
                    promises.push(promise);
            }
        }
        return Promise.all(promises);
    };
    return UpgradeNg1ComponentAdapterBuilder;
}());
var UpgradeNg1ComponentAdapter = (function () {
    function UpgradeNg1ComponentAdapter(linkFn, scope, directive, elementRef, $controller, inputs, outputs, propOuts, checkProperties, propertyMap) {
        this.linkFn = linkFn;
        this.directive = directive;
        this.$controller = $controller;
        this.inputs = inputs;
        this.outputs = outputs;
        this.propOuts = propOuts;
        this.checkProperties = checkProperties;
        this.propertyMap = propertyMap;
        this.destinationObj = null;
        this.checkLastValues = [];
        this.$element = null;
        this.element = elementRef.nativeElement;
        this.componentScope = scope.$new(!!directive.scope);
        this.$element = angular.element(this.element);
        var controllerType = directive.controller;
        if (directive.bindToController && controllerType) {
            this.destinationObj = this.buildController(controllerType);
        }
        else {
            this.destinationObj = this.componentScope;
        }
        for (var i = 0; i < inputs.length; i++) {
            this[inputs[i]] = null;
        }
        for (var j = 0; j < outputs.length; j++) {
            var emitter = this[outputs[j]] = new EventEmitter();
            this.setComponentProperty(outputs[j], (function (emitter /** TODO #9100 */) { return function (value /** TODO #9100 */) {
                return emitter.emit(value);
            }; })(emitter));
        }
        for (var k = 0; k < propOuts.length; k++) {
            this[propOuts[k]] = new EventEmitter();
            this.checkLastValues.push(INITIAL_VALUE);
        }
    }
    UpgradeNg1ComponentAdapter.prototype.ngOnInit = function () {
        var _this = this;
        if (!this.directive.bindToController && this.directive.controller) {
            this.buildController(this.directive.controller);
        }
        var link = this.directive.link;
        if (typeof link == 'object')
            link = link.pre;
        if (link) {
            var attrs = NOT_SUPPORTED;
            var transcludeFn = NOT_SUPPORTED;
            var linkController = this.resolveRequired(this.$element, this.directive.require);
            this.directive.link(this.componentScope, this.$element, attrs, linkController, transcludeFn);
        }
        var childNodes = [];
        var childNode;
        while (childNode = this.element.firstChild) {
            this.element.removeChild(childNode);
            childNodes.push(childNode);
        }
        this.linkFn(this.componentScope, function (clonedElement, scope) {
            for (var i = 0, ii = clonedElement.length; i < ii; i++) {
                _this.element.appendChild(clonedElement[i]);
            }
        }, {
            parentBoundTranscludeFn: function (scope /** TODO #9100 */, cloneAttach /** TODO #9100 */) { cloneAttach(childNodes); }
        });
        if (this.destinationObj.$onInit) {
            this.destinationObj.$onInit();
        }
    };
    UpgradeNg1ComponentAdapter.prototype.ngOnChanges = function (changes) {
        for (var name in changes) {
            if (changes.hasOwnProperty(name)) {
                var change = changes[name];
                this.setComponentProperty(name, change.currentValue);
            }
        }
    };
    UpgradeNg1ComponentAdapter.prototype.ngDoCheck = function () {
        var count = 0;
        var destinationObj = this.destinationObj;
        var lastValues = this.checkLastValues;
        var checkProperties = this.checkProperties;
        for (var i = 0; i < checkProperties.length; i++) {
            var value = destinationObj[checkProperties[i]];
            var last = lastValues[i];
            if (value !== last) {
                if (typeof value == 'number' && isNaN(value) && typeof last == 'number' && isNaN(last)) {
                }
                else {
                    var eventEmitter = this[this.propOuts[i]];
                    eventEmitter.emit(lastValues[i] = value);
                }
            }
        }
        return count;
    };
    UpgradeNg1ComponentAdapter.prototype.setComponentProperty = function (name, value) {
        this.destinationObj[this.propertyMap[name]] = value;
    };
    UpgradeNg1ComponentAdapter.prototype.buildController = function (controllerType /** TODO #9100 */) {
        var locals = { $scope: this.componentScope, $element: this.$element };
        var controller = this.$controller(controllerType, locals, null, this.directive.controllerAs);
        this.$element.data(controllerKey(this.directive.name), controller);
        return controller;
    };
    UpgradeNg1ComponentAdapter.prototype.resolveRequired = function ($element, require) {
        if (!require) {
            return undefined;
        }
        else if (typeof require == 'string') {
            var name = require;
            var isOptional = false;
            var startParent = false;
            var searchParents = false;
            var ch;
            if (name.charAt(0) == '?') {
                isOptional = true;
                name = name.substr(1);
            }
            if (name.charAt(0) == '^') {
                searchParents = true;
                name = name.substr(1);
            }
            if (name.charAt(0) == '^') {
                startParent = true;
                name = name.substr(1);
            }
            var key = controllerKey(name);
            if (startParent)
                $element = $element.parent();
            var dep = searchParents ? $element.inheritedData(key) : $element.data(key);
            if (!dep && !isOptional) {
                throw new Error("Can not locate '" + require + "' in '" + this.directive.name + "'.");
            }
            return dep;
        }
        else if (require instanceof Array) {
            var deps = [];
            for (var i = 0; i < require.length; i++) {
                deps.push(this.resolveRequired($element, require[i]));
            }
            return deps;
        }
        throw new Error("Directive '" + this.directive.name + "' require syntax unrecognized: " + this.directive.require);
    };
    return UpgradeNg1ComponentAdapter;
}());
//# sourceMappingURL=upgrade_ng1_adapter.js.map