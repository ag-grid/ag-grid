/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.2.5
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('../utils');
var eventService_1 = require("../eventService");
var Component = (function () {
    function Component(template) {
        this.destroyFunctions = [];
        this.childComponents = [];
        if (template) {
            this.eGui = utils_1.Utils.loadTemplate(template);
        }
    }
    Component.prototype.setTemplate = function (template) {
        this.eGui = utils_1.Utils.loadTemplate(template);
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
    Component.prototype.setVisible = function (visible) {
        utils_1.Utils.addOrRemoveCssClass(this.eGui, 'ag-hidden', !visible);
    };
    Component.prototype.destroy = function () {
        this.childComponents.forEach(function (childComponent) { return childComponent.destroy(); });
        this.destroyFunctions.forEach(function (func) { return func(); });
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
        else {
            eElement.addEventListener(event, listener);
        }
        this.destroyFunctions.push(function () {
            if (eElement instanceof HTMLElement) {
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
    return Component;
})();
exports.Component = Component;
