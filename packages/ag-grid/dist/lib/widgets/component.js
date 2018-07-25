/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v18.1.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var beanStub_1 = require("../context/beanStub");
var compIdSequence = new utils_1.NumberSequence();
var Component = (function (_super) {
    __extends(Component, _super);
    function Component(template) {
        var _this = _super.call(this) || this;
        _this.childComponents = [];
        _this.annotatedEventListeners = [];
        _this.visible = true;
        // unique id for this row component. this is used for getting a reference to the HTML dom.
        // we cannot use the RowNode id as this is not unique (due to animation, old rows can be lying
        // around as we create a new rowComp instance for the same row node).
        _this.compId = compIdSequence.next();
        if (template) {
            _this.setTemplate(template);
        }
        return _this;
    }
    Component.prototype.getCompId = function () {
        return this.compId;
    };
    Component.prototype.instantiate = function (context) {
        this.instantiateRecurse(this.getGui(), context);
    };
    Component.prototype.instantiateRecurse = function (parentNode, context) {
        var _this = this;
        // we MUST take a copy of the list first, as the 'swapComponentForNode' adds comments into the DOM
        // which messes up the traversal order of the children.
        var childNodeList = utils_1.Utils.copyNodeList(parentNode.childNodes);
        childNodeList.forEach(function (childNode) {
            var childComp = context.createComponent(childNode, function (childComp) {
                var attrList = _this.getAttrLists(childNode);
                _this.copyAttributesFromNode(attrList, childComp.getGui());
                _this.createChildAttributes(attrList, childComp);
                _this.addEventListenersToComponent(attrList, childComp);
            });
            if (childComp) {
                _this.swapComponentForNode(childComp, parentNode, childNode);
            }
            else {
                if (childNode.childNodes) {
                    _this.instantiateRecurse(childNode, context);
                }
                if (childNode instanceof HTMLElement) {
                    var attrList = _this.getAttrLists(childNode);
                    _this.addEventListenersToElement(attrList, childNode);
                }
            }
        });
    };
    Component.prototype.getAttrLists = function (child) {
        var res = {
            bindings: [],
            events: [],
            normal: []
        };
        utils_1.Utils.iterateNamedNodeMap(child.attributes, function (name, value) {
            var firstCharacter = name.substr(0, 1);
            if (firstCharacter === '(') {
                var eventName = name.replace('(', '').replace(')', '');
                res.events.push({
                    name: eventName,
                    value: value
                });
            }
            else if (firstCharacter === '[') {
                var bindingName = name.replace('[', '').replace(']', '');
                res.bindings.push({
                    name: bindingName,
                    value: value
                });
            }
            else {
                res.normal.push({
                    name: name,
                    value: value
                });
            }
        });
        return res;
    };
    Component.prototype.addEventListenersToElement = function (attrLists, element) {
        var _this = this;
        this.addEventListenerCommon(attrLists, function (eventName, listener) {
            _this.addDestroyableEventListener(element, eventName, listener);
        });
    };
    Component.prototype.addEventListenersToComponent = function (attrLists, component) {
        var _this = this;
        this.addEventListenerCommon(attrLists, function (eventName, listener) {
            _this.addDestroyableEventListener(component, eventName, listener);
        });
    };
    Component.prototype.addEventListenerCommon = function (attrLists, callback) {
        var _this = this;
        var methodAliases = this.getAgComponentMetaData('methods');
        attrLists.events.forEach(function (nameValue) {
            var methodName = nameValue.value;
            var methodAlias = utils_1.Utils.find(methodAliases, 'alias', methodName);
            var methodNameToUse = utils_1.Utils.exists(methodAlias) ? methodAlias.methodName : methodName;
            var listener = _this[methodNameToUse];
            if (typeof listener !== 'function') {
                console.warn('ag-Grid: count not find callback ' + methodName);
                return;
            }
            var eventCamelCase = utils_1.Utils.hyphenToCamelCase(nameValue.name);
            callback(eventCamelCase, listener.bind(_this));
        });
    };
    Component.prototype.createChildAttributes = function (attrLists, child) {
        var _this = this;
        var childAttributes = {};
        attrLists.normal.forEach(function (nameValue) {
            var nameCamelCase = utils_1.Utils.hyphenToCamelCase(nameValue.name);
            childAttributes[nameCamelCase] = nameValue.value;
        });
        attrLists.bindings.forEach(function (nameValue) {
            var nameCamelCase = utils_1.Utils.hyphenToCamelCase(nameValue.name);
            childAttributes[nameCamelCase] = _this[nameValue.value];
        });
        child.props = childAttributes;
    };
    Component.prototype.copyAttributesFromNode = function (attrLists, childNode) {
        attrLists.normal.forEach(function (nameValue) {
            childNode.setAttribute(nameValue.name, nameValue.value);
        });
    };
    Component.prototype.swapComponentForNode = function (newComponent, parentNode, childNode) {
        var eComponent = newComponent.getGui();
        parentNode.replaceChild(eComponent, childNode);
        parentNode.insertBefore(document.createComment(childNode.nodeName), eComponent);
        this.childComponents.push(newComponent);
        this.swapInComponentForQuerySelectors(newComponent, childNode);
    };
    Component.prototype.swapInComponentForQuerySelectors = function (newComponent, childNode) {
        var thisProto = Object.getPrototypeOf(this);
        var thisNoType = this;
        while (thisProto != null) {
            var metaData = thisProto.__agComponentMetaData;
            var currentProtoName = (thisProto.constructor).name;
            if (metaData && metaData[currentProtoName] && metaData[currentProtoName].querySelectors) {
                metaData[currentProtoName].querySelectors.forEach(function (querySelector) {
                    if (thisNoType[querySelector.attributeName] === childNode) {
                        thisNoType[querySelector.attributeName] = newComponent;
                    }
                });
            }
            thisProto = Object.getPrototypeOf(thisProto);
        }
    };
    Component.prototype.setTemplate = function (template) {
        var eGui = utils_1.Utils.loadTemplate(template);
        this.setTemplateFromElement(eGui);
    };
    Component.prototype.setTemplateFromElement = function (element) {
        this.eGui = element;
        this.eGui.__agComponent = this;
        this.addAnnotatedEventListeners();
        this.wireQuerySelectors();
    };
    Component.prototype.wireQuerySelectors = function () {
        var _this = this;
        if (!this.eGui) {
            return;
        }
        var thisProto = Object.getPrototypeOf(this);
        var _loop_1 = function () {
            var metaData = thisProto.__agComponentMetaData;
            var currentProtoName = (thisProto.constructor).name;
            if (metaData && metaData[currentProtoName] && metaData[currentProtoName].querySelectors) {
                var thisNoType_1 = this_1;
                metaData[currentProtoName].querySelectors.forEach(function (querySelector) {
                    var resultOfQuery = _this.eGui.querySelector(querySelector.querySelector);
                    if (resultOfQuery) {
                        var backingComponent = resultOfQuery.__agComponent;
                        if (backingComponent) {
                            thisNoType_1[querySelector.attributeName] = backingComponent;
                        }
                        else {
                            thisNoType_1[querySelector.attributeName] = resultOfQuery;
                        }
                    }
                    else {
                        // put debug msg in here if query selector fails???
                    }
                });
            }
            thisProto = Object.getPrototypeOf(thisProto);
        };
        var this_1 = this;
        while (thisProto != null) {
            _loop_1();
        }
    };
    Component.prototype.addAnnotatedEventListeners = function () {
        var _this = this;
        this.removeAnnotatedEventListeners();
        if (!this.eGui) {
            return;
        }
        var listenerMethods = this.getAgComponentMetaData('listenerMethods');
        if (utils_1.Utils.missingOrEmpty(listenerMethods)) {
            return;
        }
        if (!this.annotatedEventListeners) {
            this.annotatedEventListeners = [];
        }
        listenerMethods.forEach(function (eventListener) {
            var listener = _this[eventListener.methodName].bind(_this);
            _this.eGui.addEventListener(eventListener.eventName, listener);
            _this.annotatedEventListeners.push({ eventName: eventListener.eventName, listener: listener });
        });
    };
    Component.prototype.getAgComponentMetaData = function (key) {
        var res = [];
        var thisProto = Object.getPrototypeOf(this);
        while (thisProto != null) {
            var metaData = thisProto.__agComponentMetaData;
            var currentProtoName = (thisProto.constructor).name;
            if (metaData && metaData[currentProtoName] && metaData[currentProtoName][key]) {
                res = res.concat(metaData[currentProtoName][key]);
            }
            thisProto = Object.getPrototypeOf(thisProto);
        }
        return res;
    };
    Component.prototype.removeAnnotatedEventListeners = function () {
        var _this = this;
        if (!this.annotatedEventListeners) {
            return;
        }
        if (!this.eGui) {
            return;
        }
        this.annotatedEventListeners.forEach(function (eventListener) {
            _this.eGui.removeEventListener(eventListener.eventName, eventListener.listener);
        });
        this.annotatedEventListeners = null;
    };
    Component.prototype.getGui = function () {
        return this.eGui;
    };
    // this method is for older code, that wants to provide the gui element,
    // it is not intended for this to be in ag-Stack
    Component.prototype.setGui = function (eGui) {
        this.eGui = eGui;
    };
    Component.prototype.queryForHtmlElement = function (cssSelector) {
        return this.eGui.querySelector(cssSelector);
    };
    Component.prototype.queryForHtmlInputElement = function (cssSelector) {
        return this.eGui.querySelector(cssSelector);
    };
    Component.prototype.appendChild = function (newChild) {
        if (utils_1.Utils.isNodeOrElement(newChild)) {
            this.eGui.appendChild(newChild);
        }
        else {
            var childComponent = newChild;
            this.eGui.appendChild(childComponent.getGui());
            this.childComponents.push(childComponent);
        }
    };
    Component.prototype.addFeature = function (context, feature) {
        context.wireBean(feature);
        if (feature.destroy) {
            this.addDestroyFunc(feature.destroy.bind(feature));
        }
    };
    Component.prototype.isVisible = function () {
        return this.visible;
    };
    Component.prototype.setVisible = function (visible) {
        if (visible !== this.visible) {
            this.visible = visible;
            utils_1.Utils.addOrRemoveCssClass(this.eGui, 'ag-hidden', !visible);
            var event_1 = {
                type: Component.EVENT_VISIBLE_CHANGED,
                visible: this.visible
            };
            this.dispatchEvent(event_1);
        }
    };
    Component.prototype.addOrRemoveCssClass = function (className, addOrRemove) {
        utils_1.Utils.addOrRemoveCssClass(this.eGui, className, addOrRemove);
    };
    Component.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.childComponents.forEach(function (childComponent) { return childComponent.destroy(); });
        this.childComponents.length = 0;
        this.removeAnnotatedEventListeners();
    };
    Component.prototype.addGuiEventListener = function (event, listener) {
        var _this = this;
        this.getGui().addEventListener(event, listener);
        this.addDestroyFunc(function () { return _this.getGui().removeEventListener(event, listener); });
    };
    Component.prototype.addCssClass = function (className) {
        utils_1.Utils.addCssClass(this.getGui(), className);
    };
    Component.prototype.removeCssClass = function (className) {
        utils_1.Utils.removeCssClass(this.getGui(), className);
    };
    Component.prototype.getAttribute = function (key) {
        var eGui = this.getGui();
        if (eGui) {
            return eGui.getAttribute(key);
        }
        else {
            return null;
        }
    };
    Component.prototype.getRefElement = function (refName) {
        return this.queryForHtmlElement('[ref="' + refName + '"]');
    };
    Component.EVENT_VISIBLE_CHANGED = 'visibleChanged';
    return Component;
}(beanStub_1.BeanStub));
exports.Component = Component;
