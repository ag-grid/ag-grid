/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.6
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('../utils');
var eventService_1 = require("../eventService");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var Component = (function () {
    function Component(template) {
        this.destroyFunctions = [];
        this.childComponents = [];
        this.annotatedEventListeners = [];
        this.visible = true;
        if (template) {
            this.setTemplate(template);
        }
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
        this.eGui = utils_1.Utils.loadTemplate(template);
        this.eGui.__agComponent = this;
        this.addAnnotatedEventListeners();
        this.wireQuerySelectors();
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
    Component.prototype.addEventListener = function (eventType, listener) {
        if (!this.localEventService) {
            this.localEventService = new eventService_1.EventService();
        }
        this.localEventService.addEventListener(eventType, listener);
    };
    Component.prototype.removeEventListener = function (eventType, listener) {
        if (this.localEventService) {
            this.localEventService.removeEventListener(eventType, listener);
        }
    };
    Component.prototype.dispatchEventAsync = function (eventType, event) {
        var _this = this;
        setTimeout(function () { return _this.dispatchEvent(eventType, event); }, 0);
    };
    Component.prototype.dispatchEvent = function (eventType, event) {
        if (this.localEventService) {
            this.localEventService.dispatchEvent(eventType, event);
        }
    };
    Component.prototype.getGui = function () {
        return this.eGui;
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
        this.childComponents.forEach(function (childComponent) { return childComponent.destroy(); });
        this.destroyFunctions.forEach(function (func) { return func(); });
        this.removeAnnotatedEventListeners();
    };
    Component.prototype.addGuiEventListener = function (event, listener) {
        var _this = this;
        this.getGui().addEventListener(event, listener);
        this.destroyFunctions.push(function () { return _this.getGui().removeEventListener(event, listener); });
    };
    Component.prototype.addDestroyableEventListener = function (eElement, event, listener) {
        if (eElement instanceof HTMLElement) {
            eElement.addEventListener(event, listener);
        }
        else if (eElement instanceof gridOptionsWrapper_1.GridOptionsWrapper) {
            eElement.addEventListener(event, listener);
        }
        else {
            eElement.addEventListener(event, listener);
        }
        this.destroyFunctions.push(function () {
            if (eElement instanceof HTMLElement) {
                eElement.removeEventListener(event, listener);
            }
            else if (eElement instanceof gridOptionsWrapper_1.GridOptionsWrapper) {
                eElement.removeEventListener(event, listener);
            }
            else {
                eElement.removeEventListener(event, listener);
            }
        });
    };
    Component.prototype.addDestroyFunc = function (func) {
        this.destroyFunctions.push(func);
    };
    Component.prototype.addCssClass = function (className) {
        utils_1.Utils.addCssClass(this.getGui(), className);
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
    Component.EVENT_VISIBLE_CHANGED = 'visibleChanged';
    return Component;
})();
exports.Component = Component;
