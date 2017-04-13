/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
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
var Component = (function (_super) {
    __extends(Component, _super);
    function Component(template) {
        var _this = _super.call(this) || this;
        _this.childComponents = [];
        _this.annotatedEventListeners = [];
        _this.visible = true;
        if (template) {
            _this.setTemplate(template);
        }
        return _this;
    }
    Component.prototype.instantiate = function (context) {
        this.instantiateRecurse(this.getGui(), context);
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
        parentNode.replaceChild(newComponent.getGui(), childNode);
        this.childComponents.push(newComponent);
        this.swapInComponentForQuerySelectors(newComponent, childNode);
    };
    Component.prototype.swapInComponentForQuerySelectors = function (newComponent, childNode) {
        var metaData = this.__agComponentMetaData;
        if (!metaData || !metaData.querySelectors) {
            return;
        }
        var thisNoType = this;
        metaData.querySelectors.forEach(function (querySelector) {
            if (thisNoType[querySelector.attributeName] === childNode) {
                thisNoType[querySelector.attributeName] = newComponent;
            }
        });
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
    Component.prototype.attributesSet = function () {
    };
    Component.prototype.wireQuerySelectors = function () {
        var _this = this;
        var metaData = this.__agComponentMetaData;
        if (!metaData || !metaData.querySelectors) {
            return;
        }
        if (!this.eGui) {
            return;
        }
        var thisNoType = this;
        metaData.querySelectors.forEach(function (querySelector) {
            var resultOfQuery = _this.eGui.querySelector(querySelector.querySelector);
            if (resultOfQuery) {
                var backingComponent = resultOfQuery.__agComponent;
                if (backingComponent) {
                    thisNoType[querySelector.attributeName] = backingComponent;
                }
                else {
                    thisNoType[querySelector.attributeName] = resultOfQuery;
                }
            }
            else {
                // put debug msg in here if query selector fails???
            }
        });
    };
    Component.prototype.addAnnotatedEventListeners = function () {
        var _this = this;
        this.removeAnnotatedEventListeners();
        var metaData = this.__agComponentMetaData;
        if (!metaData || !metaData.listenerMethods) {
            return;
        }
        if (!this.eGui) {
            return;
        }
        if (!this.annotatedEventListeners) {
            this.annotatedEventListeners = [];
        }
        metaData.listenerMethods.forEach(function (eventListener) {
            var listener = _this[eventListener.methodName].bind(_this);
            _this.eGui.addEventListener(eventListener.eventName, listener);
            _this.annotatedEventListeners.push({ eventName: eventListener.eventName, listener: listener });
        });
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
            this.dispatchEvent(Component.EVENT_VISIBLE_CHANGED, { visible: this.visible });
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
    return Component;
}(beanStub_1.BeanStub));
Component.EVENT_VISIBLE_CHANGED = 'visibleChanged';
exports.Component = Component;
