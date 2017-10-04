/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v13.3.0
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
        _this.hydrated = false;
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
    Component.prototype.setTemplateNoHydrate = function (template) {
        this.template = template;
    };
    Component.prototype.afterGuiAttached = function (params) {
        if (!this.eHtmlElement && params.eComponent) {
            this.setHtmlElement(params.eComponent);
        }
    };
    Component.prototype.getCompId = function () {
        return this.compId;
    };
    Component.prototype.instantiate = function (context) {
        var element = this.getHtmlElement();
        this.instantiateRecurse(element, context);
    };
    Component.prototype.instantiateRecurse = function (parentNode, context) {
        var childCount = parentNode.childNodes ? parentNode.childNodes.length : 0;
        for (var i = 0; i < childCount; i++) {
            var childNode = parentNode.childNodes[i];
            var newComponent = context.createComponent(childNode);
            if (newComponent) {
                this.swapComponentForNode(newComponent, parentNode, childNode);
            }
            else {
                if (childNode.childNodes) {
                    this.instantiateRecurse(childNode, context);
                }
            }
        }
    };
    Component.prototype.swapComponentForNode = function (newComponent, parentNode, childNode) {
        var element = newComponent.getHtmlElement();
        parentNode.replaceChild(element, childNode);
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
        this.template = template;
        var eGui = utils_1.Utils.loadTemplate(template);
        this.setHtmlElement(eGui);
    };
    Component.prototype.setHtmlElement = function (element) {
        this.eHtmlElement = element;
        this.eHtmlElement.__agComponent = this;
        this.hydrate();
    };
    Component.prototype.hydrate = function () {
        this.addAnnotatedEventListeners();
        this.wireQuerySelectors();
        this.hydrated = true;
    };
    Component.prototype.attributesSet = function () {
    };
    Component.prototype.wireQuerySelectors = function () {
        var element = this.getHtmlElement();
        if (!element) {
            return;
        }
        var thisProto = Object.getPrototypeOf(this);
        var _loop_1 = function () {
            var metaData = thisProto.__agComponentMetaData;
            var currentProtoName = (thisProto.constructor).name;
            if (metaData && metaData[currentProtoName] && metaData[currentProtoName].querySelectors) {
                var thisNoType_1 = this_1;
                metaData[currentProtoName].querySelectors.forEach(function (querySelector) {
                    var resultOfQuery = element.querySelector(querySelector.querySelector);
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
        var element = this.getHtmlElement();
        if (!element) {
            return;
        }
        var thisProto = Object.getPrototypeOf(this);
        while (thisProto != null) {
            var metaData = thisProto.__agComponentMetaData;
            var currentProtoName = (thisProto.constructor).name;
            if (metaData && metaData[currentProtoName] && metaData[currentProtoName].listenerMethods) {
                if (!this.annotatedEventListeners) {
                    this.annotatedEventListeners = [];
                }
                metaData[currentProtoName].listenerMethods.forEach(function (eventListener) {
                    var listener = _this[eventListener.methodName].bind(_this);
                    element.addEventListener(eventListener.eventName, listener);
                    _this.annotatedEventListeners.push({ eventName: eventListener.eventName, listener: listener });
                });
            }
            thisProto = Object.getPrototypeOf(thisProto);
        }
    };
    Component.prototype.removeAnnotatedEventListeners = function () {
        if (!this.annotatedEventListeners) {
            return;
        }
        var element = this.getHtmlElement();
        if (!element) {
            return;
        }
        this.annotatedEventListeners.forEach(function (eventListener) {
            element.removeEventListener(eventListener.eventName, eventListener.listener);
        });
        this.annotatedEventListeners = null;
    };
    Component.prototype.getGui = function () {
        if (this.eHtmlElement) {
            return this.eHtmlElement;
        }
        else {
            return this.template;
        }
    };
    Component.prototype.getHtmlElement = function () {
        if (this.eHtmlElement) {
            return this.eHtmlElement;
        }
        else {
            console.warn('getHtmlElement() called on component before gui was attached');
            return null;
        }
    };
    // used by Cell Comp (and old header code), design is a bit poor, overlap with afterGuiAttached???
    Component.prototype.setHtmlElementNoHydrate = function (eHtmlElement) {
        this.eHtmlElement = eHtmlElement;
    };
    Component.prototype.queryForHtmlElement = function (cssSelector) {
        var element = this.getHtmlElement();
        return element.querySelector(cssSelector);
    };
    Component.prototype.queryForHtmlInputElement = function (cssSelector) {
        var element = this.getHtmlElement();
        return element.querySelector(cssSelector);
    };
    Component.prototype.appendChild = function (newChild) {
        var element = this.getHtmlElement();
        if (utils_1.Utils.isNodeOrElement(newChild)) {
            element.appendChild(newChild);
        }
        else {
            var childComponent = newChild;
            element.appendChild(utils_1.Utils.ensureElement(childComponent.getGui()));
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
        var element = this.getHtmlElement();
        if (visible !== this.visible) {
            this.visible = visible;
            utils_1.Utils.addOrRemoveCssClass(element, 'ag-hidden', !visible);
            var event_1 = {
                type: Component.EVENT_VISIBLE_CHANGED,
                visible: this.visible
            };
            this.dispatchEvent(event_1);
        }
    };
    Component.prototype.addOrRemoveCssClass = function (className, addOrRemove) {
        var element = this.getHtmlElement();
        utils_1.Utils.addOrRemoveCssClass(element, className, addOrRemove);
    };
    Component.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.childComponents.forEach(function (childComponent) { return childComponent.destroy(); });
        this.childComponents.length = 0;
        if (this.hydrated) {
            this.removeAnnotatedEventListeners();
        }
    };
    Component.prototype.addGuiEventListener = function (event, listener) {
        var element = this.getHtmlElement();
        element.addEventListener(event, listener);
        this.addDestroyFunc(function () { return element.removeEventListener(event, listener); });
    };
    Component.prototype.addCssClass = function (className) {
        var element = this.getHtmlElement();
        utils_1.Utils.addCssClass(element, className);
    };
    Component.prototype.removeCssClass = function (className) {
        var element = this.getHtmlElement();
        utils_1.Utils.removeCssClass(element, className);
    };
    Component.prototype.getAttribute = function (key) {
        var element = this.getHtmlElement();
        if (element) {
            return element.getAttribute(key);
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
